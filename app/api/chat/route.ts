import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { getProfileRole } from "@/lib/auth";
import { demoBriefing, demoIntakeReply } from "@/lib/intake-demo";
import { createClient } from "@/lib/supabase/server";

// Override with ANTHROPIC_MODEL (e.g. a cheaper model) if you like.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5-5";

// Models that accept the server-side refusal fallback ("default" routing).
const FALLBACK_MODELS = ["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"];

const SYSTEM_PROMPT = `You are a warm non-clinical companion. Make the user feel heard in 4-5 exchanges. Naturally identify three things:
1. experience_tag: what they're going through (loneliness/anxiety/grief/burnout)
2. intensity_tag: venting or crisis
3. style_tag: opens up fast or needs warmth first.
After 5 user messages, respond normally then add a JSON block at the end of your response exactly like this:
[TAGS]{"experience_tag":"...","intensity_tag":"...","style_tag":"..."}[/TAGS]
Then ask: Would you like to talk to someone who has been through something similar?`;

const BRIEFING_SYSTEM_PROMPT = `Based on this conversation, write a companion briefing in exactly 3 sentences. Sentence 1: what this person is going through right now. Sentence 2: how they communicate and what they need emotionally. Sentence 3: one specific thing a companion should know before talking to them.
Write it warmly, like you're briefing a friend, not writing a medical note.
No bullet points. No labels. Just 3 sentences.`;

const TAG_PATTERN = /\[TAGS\](\{[\s\S]*?\})\[\/TAGS\]/;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeMessage = value as Partial<ChatMessage>;
  return (
    (maybeMessage.role === "user" || maybeMessage.role === "assistant") &&
    typeof maybeMessage.content === "string" &&
    maybeMessage.content.trim().length > 0
  );
}

async function askClaude(
  client: Anthropic,
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  const useFallbacks = FALLBACK_MODELS.includes(ANTHROPIC_MODEL);
  const response = await client.beta.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 16000,
    system,
    messages,
    // A short, warm chat reply does not need deep thinking.
    output_config: { effort: "low" },
    ...(useFallbacks
      ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
      : {}),
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude could not respond to that. Please try rephrasing.");
  }

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function formatTranscript(conversation: ChatMessage[]): string {
  return conversation
    .map((entry) => {
      const speaker = entry.role === "user" ? "Person" : "Companion (AI)";
      return `${speaker}: ${entry.content}`;
    })
    .join("\n\n");
}

async function generateBriefing(
  client: Anthropic | null,
  conversation: ChatMessage[],
): Promise<string | null> {
  const transcript = formatTranscript(conversation);

  if (!transcript.trim().length) {
    return null;
  }

  if (!client) {
    return demoBriefing(conversation);
  }

  try {
    const briefing = await askClaude(client, BRIEFING_SYSTEM_PROMPT, [
      {
        role: "user",
        content: `Here is the full conversation so far between the person and the AI companion. Write the 3-sentence briefing exactly as the instructions describe.\n\n---\n${transcript}\n---`,
      },
    ]);

    return briefing.length ? briefing : null;
  } catch (error) {
    console.error("[chat] briefing call failed", error);
    return null;
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Anthropic.AuthenticationError) {
    return "The ANTHROPIC_API_KEY on the server is invalid.";
  }

  if (error instanceof Anthropic.RateLimitError) {
    return "Too many requests right now. Please wait a moment and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Claude could not respond right now. Please try again.";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await getProfileRole(supabase, user.id);

  if (role && role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // No key means demo mode: a scripted companion so the app still works end to end.
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const client = apiKey ? new Anthropic({ apiKey }) : null;

  const body = (await request.json().catch(() => null)) as {
    messages?: unknown;
  } | null;

  if (!Array.isArray(body?.messages)) {
    return NextResponse.json({ error: "Messages are required" }, { status: 400 });
  }

  // The chat UI opens with an assistant greeting, but the API needs the
  // conversation to start with a user turn, so drop any leading assistant text.
  const allMessages = body.messages.filter(isChatMessage);
  const firstUserIndex = allMessages.findIndex((entry) => entry.role === "user");
  const conversation = firstUserIndex === -1 ? [] : allMessages.slice(firstUserIndex);
  let messages = conversation.slice(-14);

  while (messages.length && messages[0].role !== "user") {
    messages = messages.slice(1);
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The latest message must be from the user" },
      { status: 400 },
    );
  }

  let message: string;

  try {
    message = client
      ? await askClaude(client, SYSTEM_PROMPT, messages)
      : demoIntakeReply(conversation);
  } catch (error) {
    console.error("[chat] intake call failed", error);
    const status = error instanceof Anthropic.APIError ? error.status ?? 502 : 502;
    return NextResponse.json({ error: errorMessage(error) }, { status });
  }

  if (!message) {
    return NextResponse.json(
      { error: "Claude returned an empty response" },
      { status: 502 },
    );
  }

  let briefing: string | null = null;
  const tagMatch = message.match(TAG_PATTERN);

  if (tagMatch) {
    const assistantWithoutTags = message.replace(tagMatch[0], "").trim();
    const briefingConversation: ChatMessage[] = [
      ...conversation,
      ...(assistantWithoutTags
        ? [{ role: "assistant" as const, content: assistantWithoutTags }]
        : []),
    ];

    briefing = await generateBriefing(client, briefingConversation);
  }

  return NextResponse.json({ message, briefing });
}
