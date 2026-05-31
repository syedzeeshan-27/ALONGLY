"use client";

import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import {
  parseStoredUserContextCard,
  USER_CONTEXT_KEY,
} from "@/lib/user-continuity";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type CompanionTags = {
  experience_tag: string;
  intensity_tag: string;
  style_tag: string;
};

type MatchRequestRow =
  Database["public"]["Tables"]["match_requests"]["Row"];

type ChatClientProps = {
  userEmail: string | null;
  userId: string;
};

const tagPattern = /\[TAGS\](\{[\s\S]*?\})\[\/TAGS\]/;

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

function parseTaggedResponse(content: string) {
  const match = content.match(tagPattern);

  if (!match) {
    return { visibleContent: content.trim(), tags: null };
  }

  const visibleContent = content.replace(match[0], "").trim();

  try {
    const parsed = JSON.parse(match[1]) as Partial<CompanionTags>;

    if (
      typeof parsed.experience_tag === "string" &&
      typeof parsed.intensity_tag === "string" &&
      typeof parsed.style_tag === "string"
    ) {
      return {
        visibleContent,
        tags: {
          experience_tag: parsed.experience_tag,
          intensity_tag: parsed.intensity_tag,
          style_tag: parsed.style_tag,
        },
      };
    }
  } catch {
    return { visibleContent, tags: null };
  }

  return { visibleContent, tags: null };
}

function resizeComposer(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "0px";
  element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
  element.style.overflowY = element.scrollHeight > 144 ? "auto" : "hidden";
}

export function ChatClient({ userEmail, userId }: ChatClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "I'm here with you. What's been weighing on you lately?",
    ),
  ]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(
    null,
  );
  const matchRequested = useRef(false);
  const navigatedToRoom = useRef(false);

  async function createMatchRequest(
    tags: CompanionTags,
    briefing: string | null,
  ) {
    const requestId = crypto.randomUUID();
    const storedContextCard = parseStoredUserContextCard(
      window.localStorage.getItem(USER_CONTEXT_KEY),
    );
    const { error: insertError } = await supabase.from("match_requests").insert({
      id: requestId,
      user_id: userId,
      user_email: userEmail,
      experience_tag: tags.experience_tag,
      intensity_tag: tags.intensity_tag,
      style_tag: tags.style_tag,
      companion_briefing: briefing,
      user_context_card: storedContextCard
        ? JSON.stringify(storedContextCard)
        : null,
    });

    if (insertError) {
      throw insertError;
    }

    return requestId;
  }

  useEffect(() => {
    if (!isFindingMatch || !matchingRequestId) {
      return;
    }

    const requestId = matchingRequestId;
    let isActive = true;

    function navigateToMatchedRoom(roomId: string) {
      if (!isActive || navigatedToRoom.current) {
        return;
      }

      navigatedToRoom.current = true;
      router.replace(`/room/${roomId}`);
    }

    function handleMatchRequest(row: Partial<MatchRequestRow>) {
      if (row.status === "matched") {
        navigateToMatchedRoom(row.id ?? requestId);
      }
    }

    async function checkMatchRequest() {
      const { data, error: loadError } = await supabase
        .from("match_requests")
        .select("id,status,companion_id")
        .eq("id", requestId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        return;
      }

      if (data) {
        handleMatchRequest(data);
      }
    }

    void checkMatchRequest();

    const pollId = window.setInterval(() => {
      void checkMatchRequest();
    }, 3000);

    const channel = supabase
      .channel(`match-request-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          handleMatchRequest(payload.new as Partial<MatchRequestRow>);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          void checkMatchRequest();
        }
      });

    return () => {
      isActive = false;
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [isFindingMatch, matchingRequestId, router, supabase, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    resizeComposer(composerRef.current);
  }, [draft]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending || isFindingMatch) {
      return;
    }

    const userMessage = createMessage("user", content);
    const nextMessages = [...messages, userMessage];

    setDraft("");
    setError(null);
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        briefing?: string | null;
        error?: string;
      } | null;

      if (!response.ok || !data?.message) {
        throw new Error(data?.error ?? "The chat could not respond right now.");
      }

      const { visibleContent, tags } = parseTaggedResponse(data.message);
      const assistantMessage = createMessage("assistant", visibleContent);

      setMessages((current) => [...current, assistantMessage]);

      if (tags && !matchRequested.current) {
        matchRequested.current = true;

        try {
          const requestId = await createMatchRequest(
            tags,
            data.briefing ?? null,
          );
          setMatchingRequestId(requestId);
          setIsFindingMatch(true);
        } catch (requestError) {
          matchRequested.current = false;
          throw requestError;
        }
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (isFindingMatch) {
    return (
      <section className="grid h-full place-items-center px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-7 rounded-3xl border border-orange-100 bg-white/75 p-8 shadow-sm">
          <div className="relative grid h-28 w-28 place-items-center">
            <span className="absolute h-28 w-28 animate-[breathe_5s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-teal-300/70 to-orange-200/70" />
            <span className="absolute h-20 w-20 animate-[breathe_5s_ease-in-out_infinite] rounded-full bg-white/60" />
            <span className="relative h-3 w-3 rounded-full bg-orange-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-stone-950">
              Finding your person...
            </h2>
            <p className="text-base leading-7 text-stone-600">
              Breathe with us while we look for someone who&apos;s been there.
            </p>
            {error ? (
              <p
                aria-live="polite"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#fbf7f1]">
      <div className="mobile-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <div
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            key={message.id}
          >
            <p
              className={`max-w-[86%] whitespace-pre-wrap rounded-[22px] px-5 py-4 text-[1.02rem] leading-7 shadow-sm ${
                message.role === "user"
                  ? "bg-teal-600 text-white"
                  : "border border-orange-200 bg-white/85 text-stone-900"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}

        {isSending ? (
          <div className="flex justify-start">
            <p className="rounded-[22px] border border-orange-100 bg-white/85 px-5 py-4 text-base text-stone-500 shadow-sm">
              Thinking...
            </p>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="mx-4 mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <form
        className="shrink-0 border-t border-orange-100 bg-[#fbf7f1]/95 px-4 py-3 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <div className="flex items-end gap-3">
          <label className="sr-only" htmlFor="chat-message">
            Message
          </label>
          <textarea
            className="chat-composer-input mobile-scroll min-h-12 flex-1 resize-none rounded-[26px] border border-stone-200 bg-white px-5 py-3 text-base leading-6 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            disabled={isSending}
            id="chat-message"
            name="message"
            onChange={(event) => {
              setDraft(event.target.value);
              resizeComposer(event.currentTarget);
            }}
            placeholder="Type your message..."
            ref={composerRef}
            rows={1}
            spellCheck={false}
            value={draft}
          />
          <button
            aria-label="Send message"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-400 text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={isSending || !draft.trim()}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" size={21} strokeWidth={2.3} />
          </button>
        </div>
      </form>
    </section>
  );
}
