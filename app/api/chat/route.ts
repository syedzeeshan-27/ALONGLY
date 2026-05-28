import { NextResponse } from "next/server";

import { getProfileRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

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

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicResponse = {
  content?: AnthropicTextBlock[];
  error?: {
    message?: string;
  };
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

function extractText(data: AnthropicResponse | null): string {
  return (
    data?.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim() ?? ""
  );
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
  apiKey: string,
  conversation: ChatMessage[],
): Promise<string | null> {
  const transcript = formatTranscript(conversation);

  if (!transcript.trim().length) {
    return null;
  }

  try {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system: BRIEFING_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Here is the full conversation so far between the person and the AI companion. Write the 3-sentence briefing exactly as the instructions describe.\n\n---\n${transcript}\n---`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[chat] briefing call failed",
        response.status,
        errorBody.slice(0, 500),
      );
      return null;
    }

    const data = (await response.json().catch(() => null)) as
      | AnthropicResponse
      | null;

    const briefing = extractText(data);

    if (!briefing.length) {
      console.error("[chat] briefing call returned empty text");
      return null;
    }

    return briefing;
  } catch (error) {
    console.error("[chat] briefing call threw", error);
    return null;
  }
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

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ANTHROPIC_API_KEY" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    messages?: unknown;
  } | null;

  if (!Array.isArray(body?.messages)) {
    return NextResponse.json({ error: "Messages are required" }, { status: 400 });
  }

  const messages = body.messages.filter(isChatMessage).slice(-14);

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The latest message must be from the user" },
      { status: 400 },
    );
  }

  const anthropicResponse = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  const data = (await anthropicResponse.json().catch(() => null)) as
    | AnthropicResponse
    | null;

  if (!anthropicResponse.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message ??
          "Claude could not respond right now. Please try again.",
      },
      { status: anthropicResponse.status },
    );
  }

  const message = extractText(data);

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
      ...messages,
      ...(assistantWithoutTags
        ? [{ role: "assistant" as const, content: assistantWithoutTags }]
        : []),
    ];

    briefing = await generateBriefing(apiKey, briefingConversation);
  }

  return NextResponse.json({ message, briefing });
}
