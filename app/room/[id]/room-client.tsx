"use client";

import { Heart, Phone, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MatchRequestRow = Database["public"]["Tables"]["match_requests"]["Row"];
type JitsiMeetExternalAPIOptions = {
  roomName: string;
  parentNode: HTMLElement;
  width?: string;
  height?: string;
  userInfo?: {
    displayName?: string;
  };
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
};
type JitsiMeetExternalAPIInstance = {
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: JitsiMeetExternalAPIOptions,
    ) => JitsiMeetExternalAPIInstance;
  }
}

type RoomClientProps = {
  companionId: string | null;
  completedRedirectPath: string;
  roomId: string;
  currentUserId: string;
  initialIsSavedCompanion: boolean;
  initialMessages: MessageRow[];
  initialVoiceRoomUrl: string | null;
  initialMessagesError?: string | null;
  isCompanion: boolean;
};

const VOICE_ROOM_STARTED = "VOICE_ROOM_STARTED";
const JITSI_DOMAIN = "meet.jit.si";
const JITSI_EXTERNAL_API_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

let jitsiApiScriptPromise: Promise<void> | null = null;

function loadJitsiApiScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }

  if (!jitsiApiScriptPromise) {
    jitsiApiScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${JITSI_EXTERNAL_API_SRC}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Unable to load the Jitsi call embed.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = JITSI_EXTERNAL_API_SRC;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Unable to load the Jitsi call embed."));
      document.head.appendChild(script);
    });
  }

  return jitsiApiScriptPromise;
}

function createVoiceRoomUrl(roomId: string) {
  const roomNonce =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `https://${JITSI_DOMAIN}/alongly-${roomId}-${roomNonce}`;
}

function getJitsiRoomName(voiceRoomUrl: string) {
  try {
    const url = new URL(voiceRoomUrl);
    return url.pathname.replace(/^\/+/, "").split("/")[0] || null;
  } catch {
    return null;
  }
}

function sortMessages(messages: MessageRow[]) {
  return [...messages].sort((a, b) => {
    const left = a.created_at ? Date.parse(a.created_at) : 0;
    const right = b.created_at ? Date.parse(b.created_at) : 0;
    return left - right;
  });
}

function appendMessage(current: MessageRow[], nextMessage: MessageRow) {
  if (current.some((message) => message.id === nextMessage.id)) {
    return current;
  }

  return sortMessages([...current, nextMessage]);
}

function removeMessage(current: MessageRow[], messageId: string) {
  return current.filter((message) => message.id !== messageId);
}

function resizeComposer(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "0px";
  element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
  element.style.overflowY = element.scrollHeight > 144 ? "auto" : "hidden";
}

export function RoomClient({
  companionId,
  completedRedirectPath,
  roomId,
  currentUserId,
  initialIsSavedCompanion,
  initialMessages,
  initialVoiceRoomUrl,
  initialMessagesError = null,
  isCompanion,
}: RoomClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const jitsiParentRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<JitsiMeetExternalAPIInstance | null>(null);
  const isRefreshingMessages = useRef(false);
  const [messages, setMessages] = useState(() => sortMessages(initialMessages));
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(initialMessagesError);
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isSavingCompanion, setIsSavingCompanion] = useState(false);
  const [isSavedCompanion, setIsSavedCompanion] = useState(
    initialIsSavedCompanion,
  );
  const [voiceRoomUrl, setVoiceRoomUrl] = useState<string | null>(
    initialVoiceRoomUrl,
  );
  const voiceRoomUrlRef = useRef<string | null>(initialVoiceRoomUrl);
  const [isStartingVoiceRoom, setIsStartingVoiceRoom] = useState(false);
  const [voiceEmbedError, setVoiceEmbedError] = useState<string | null>(null);

  useEffect(() => {
    voiceRoomUrlRef.current = voiceRoomUrl;
  }, [voiceRoomUrl]);

  useEffect(() => {
    const parentNode = jitsiParentRef.current;
    const roomName = voiceRoomUrl ? getJitsiRoomName(voiceRoomUrl) : null;

    if (!parentNode || !roomName) {
      return;
    }

    let isCancelled = false;
    setVoiceEmbedError(null);

    void loadJitsiApiScript()
      .then(() => {
        if (isCancelled || !window.JitsiMeetExternalAPI) {
          return;
        }

        jitsiApiRef.current?.dispose();
        parentNode.replaceChildren();

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: isCompanion ? "Alongly companion" : "Alongly user",
          },
          configOverwrite: {
            prejoinConfig: {
              enabled: false,
            },
            startWithAudioMuted: false,
            startWithVideoMuted: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
          },
        });
      })
      .catch((loadError: Error) => {
        if (!isCancelled) {
          setVoiceEmbedError(loadError.message);
        }
      });

    return () => {
      isCancelled = true;
      jitsiApiRef.current?.dispose();
      jitsiApiRef.current = null;
      parentNode.replaceChildren();
    };
  }, [isCompanion, voiceRoomUrl]);

  const refreshMessages = useCallback(async () => {
    if (isRefreshingMessages.current) {
      return;
    }

    isRefreshingMessages.current = true;

    const { data, error: loadError } = await supabase
      .from("messages")
      .select("id,room_id,sender_id,content,created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    isRefreshingMessages.current = false;

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setMessages(sortMessages(data ?? []));
  }, [roomId, supabase]);

  useEffect(() => {
    const pollId = window.setInterval(() => {
      void refreshMessages();
    }, 2500);

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((current) =>
            appendMessage(current, payload.new as MessageRow),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRequest = payload.new as Partial<MatchRequestRow>;

          if (updatedRequest.status === "completed") {
            router.push(completedRedirectPath);
          }

          if (typeof updatedRequest.voice_room_url !== "undefined") {
            setVoiceRoomUrl(updatedRequest.voice_room_url ?? null);
          }
        },
      )
      .subscribe((status) => {
        if (
          status === "SUBSCRIBED" ||
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          void refreshMessages();
        }
      });

    return () => {
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [completedRedirectPath, refreshMessages, roomId, router, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    resizeComposer(composerRef.current);
  }, [draft]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending || isEnding) {
      return;
    }

    setDraft("");
    setError(null);
    setIsSending(true);

    const optimisticMessage: MessageRow = {
      id: crypto.randomUUID(),
      room_id: roomId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => appendMessage(current, optimisticMessage));

    const { error: insertError } = await supabase
      .from("messages")
      .insert({
        id: optimisticMessage.id,
        room_id: roomId,
        sender_id: currentUserId,
        content,
      });

    setIsSending(false);

    if (insertError) {
      setMessages((current) => removeMessage(current, optimisticMessage.id));
      setError(insertError.message);
      setDraft(content);
      return;
    }

    void refreshMessages();
  }

  async function startVoiceRoom() {
    if (isStartingVoiceRoom || isEnding) {
      return;
    }

    setError(null);
    setIsStartingVoiceRoom(true);

    let nextUrl = voiceRoomUrlRef.current;

    if (!nextUrl) {
      nextUrl = createVoiceRoomUrl(roomId);

      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ voice_room_url: nextUrl })
        .eq("id", roomId);

      if (updateError) {
        setIsStartingVoiceRoom(false);
        setError(updateError.message);
        return;
      }

      setVoiceRoomUrl(nextUrl);
      voiceRoomUrlRef.current = nextUrl;
    }

    const announcement: MessageRow = {
      id: crypto.randomUUID(),
      room_id: roomId,
      sender_id: currentUserId,
      content: VOICE_ROOM_STARTED,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => appendMessage(current, announcement));

    const { error: insertError } = await supabase.from("messages").insert({
      id: announcement.id,
      room_id: roomId,
      sender_id: currentUserId,
      content: VOICE_ROOM_STARTED,
    });

    setIsStartingVoiceRoom(false);

    if (insertError) {
      setMessages((current) => removeMessage(current, announcement.id));
      setError(insertError.message);
      return;
    }

    void refreshMessages();
  }

  async function saveCompanion() {
    if (!companionId || isSavingCompanion || isSavedCompanion) {
      return;
    }

    setError(null);
    setIsSavingCompanion(true);

    const { error: saveError } = await supabase
      .from("saved_companions")
      .upsert(
        {
          user_id: currentUserId,
          companion_id: companionId,
          last_room_id: roomId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,companion_id" },
      );

    setIsSavingCompanion(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setIsSavedCompanion(true);
  }

  async function endConversation() {
    setError(null);
    setIsEnding(true);

    const { error: updateError } = await supabase
      .from("match_requests")
      .update({ status: "completed" })
      .eq("id", roomId);

    if (updateError) {
      setIsEnding(false);
      setError(updateError.message);
      return;
    }

    router.push(completedRedirectPath);
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#fbf7f1]">
      <div className="shrink-0 border-b border-orange-100 bg-[#fbf7f1]/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
              Matched room
            </p>
            <p className="truncate text-sm font-medium text-stone-500">
              Stay with the conversation
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="Start voice room"
              className="grid h-10 w-10 place-items-center rounded-full border border-emerald-200 bg-white/75 text-emerald-600 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isStartingVoiceRoom || isEnding}
              onClick={() => void startVoiceRoom()}
              type="button"
            >
              <Phone aria-hidden="true" size={18} strokeWidth={2.3} />
            </button>
            <button
              className="h-10 rounded-full border border-rose-200 bg-white/75 px-4 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isEnding}
              onClick={() => void endConversation()}
              type="button"
            >
              {isEnding ? "Ending..." : "End conversation"}
            </button>
          </div>
        </div>
      </div>

      {!isCompanion && companionId ? (
        <div className="shrink-0 border-b border-orange-100 bg-white/55 px-5 py-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-stone-950">
                Keep this companion for next time
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-stone-500">
                Saves them to your profile for the walkthrough continuity flow.
              </p>
            </div>
            <button
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-teal-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={isSavingCompanion || isSavedCompanion}
              onClick={() => void saveCompanion()}
              type="button"
            >
              <Heart
                aria-hidden="true"
                className={isSavedCompanion ? "fill-white" : undefined}
                size={16}
                strokeWidth={2.3}
              />
              {isSavedCompanion
                ? "Saved"
                : isSavingCompanion
                  ? "Saving..."
                  : "Save"}
            </button>
          </div>
        </div>
      ) : null}

      {voiceRoomUrl ? (
        <div className="shrink-0 border-b border-emerald-100 bg-white px-4 py-4">
          <div className="overflow-hidden rounded-lg border border-emerald-200 bg-stone-950 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-stone-900 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Voice call</p>
                <p className="truncate text-xs font-medium text-emerald-100/75">
                  Connected privately in this room
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
                No Jitsi login
              </span>
            </div>
            <div
              className="h-[300px] w-full bg-stone-950 sm:h-[360px]"
              ref={jitsiParentRef}
            />
          </div>
          {voiceEmbedError ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {voiceEmbedError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mobile-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="grid min-h-full place-items-center text-center">
            <p className="rounded-lg border border-orange-100 bg-white/75 px-5 py-4 text-sm font-medium text-stone-500 shadow-sm">
              No messages yet.
            </p>
          </div>
        ) : null}

        {messages.map((message) => {
          if (message.content === VOICE_ROOM_STARTED) {
            return (
              <div className="flex justify-center" key={message.id}>
                <div className="flex w-full max-w-[86%] flex-col items-center gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-center shadow-sm">
                  <p className="text-sm font-medium text-emerald-900">
                    Voice room is ready — join when you&apos;re ready 🎙️
                  </p>
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!voiceRoomUrl}
                    onClick={() => {
                      jitsiParentRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    type="button"
                  >
                    <Phone aria-hidden="true" size={16} strokeWidth={2.4} />
                    Show call
                  </button>
                </div>
              </div>
            );
          }

          const isMine = message.sender_id === currentUserId;

          return (
            <div
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <p
                className={`max-w-[86%] whitespace-pre-wrap rounded-[22px] px-5 py-4 text-[1.02rem] leading-7 shadow-sm ${
                  isMine
                    ? "bg-teal-600 text-white"
                    : "border border-orange-200 bg-white/85 text-stone-900"
                }`}
              >
                {message.content}
              </p>
            </div>
          );
        })}
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
        onSubmit={sendMessage}
      >
        <div className="flex items-end gap-3">
          <label className="sr-only" htmlFor="room-message">
            Message
          </label>
          <textarea
            className="chat-composer-input mobile-scroll min-h-12 flex-1 resize-none rounded-[26px] border border-stone-200 bg-white px-5 py-3 text-base leading-6 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            disabled={isSending || isEnding}
            id="room-message"
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
            disabled={isSending || isEnding || !draft.trim()}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" size={21} strokeWidth={2.3} />
          </button>
        </div>
      </form>
    </section>
  );
}
