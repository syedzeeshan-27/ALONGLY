"use client";

import { BellRing, CheckCircle2, Lightbulb, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { CompanionHandoffCard } from "@/app/components/companion-handoff-card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MatchRequestRow = Database["public"]["Tables"]["match_requests"]["Row"];

type WaitingRequest = {
  id: string;
  user_email: string | null;
  experience_tag: string;
  intensity_tag: string;
  style_tag: string;
  companion_briefing: string | null;
  user_context_card: string | null;
};

type DashboardClientProps = {
  companionId: string;
  initialIsOnline: boolean;
};

type AlertPermission = NotificationPermission | "unsupported";

function tagValue(value: string | null | undefined) {
  return value?.trim() || "unspecified";
}

function toWaitingRequest(row: Partial<MatchRequestRow>): WaitingRequest | null {
  if (!row.id || row.status !== "waiting") {
    return null;
  }

  return {
    id: row.id,
    user_email: row.user_email?.trim() || null,
    experience_tag: tagValue(row.experience_tag),
    intensity_tag: tagValue(row.intensity_tag),
    style_tag: tagValue(row.style_tag),
    companion_briefing: row.companion_briefing?.trim() || null,
    user_context_card: row.user_context_card?.trim() || null,
  };
}

function upsertRequest(current: WaitingRequest[], nextRequest: WaitingRequest) {
  const exists = current.some((request) => request.id === nextRequest.id);

  if (exists) {
    return current.map((request) =>
      request.id === nextRequest.id ? nextRequest : request,
    );
  }

  return [...current, nextRequest];
}

function getAlertCopy(permission: AlertPermission) {
  if (permission === "granted") {
    return "Desktop alerts are on. Keep this dashboard open in Chrome while you're online.";
  }

  if (permission === "denied") {
    return "Chrome is blocking alerts for this site. Open the lock icon in the address bar, allow notifications, then refresh.";
  }

  if (permission === "unsupported") {
    return "This browser does not support desktop notifications for the dashboard flow.";
  }

  return "Turn on browser alerts, then keep this dashboard open while you're online. On Vercel, HTTPS is enough for this MVP.";
}

export function CompanionDashboardClient({
  companionId,
  initialIsOnline,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const audioContextRef = useRef<AudioContext | null>(null);
  const seenRequestIdsRef = useRef<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [requests, setRequests] = useState<WaitingRequest[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState("CLOSED");
  const [alertPermission, setAlertPermission] = useState<AlertPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    return window.Notification.permission;
  });
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;

      if (audioContext) {
        void audioContext.close();
      }
    };
  }, []);

  async function playAlertChime() {
    if (typeof window === "undefined") {
      return;
    }

    const audioContext =
      audioContextRef.current ??
      (() => {
        const audioWindow = window as Window & {
          webkitAudioContext?: typeof AudioContext;
        };
        const AudioCtor =
          window.AudioContext ?? audioWindow.webkitAudioContext ?? null;

        if (!AudioCtor) {
          return null;
        }

        const nextContext = new AudioCtor();
        audioContextRef.current = nextContext;
        return nextContext;
      })();

    if (!audioContext) {
      return;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startAt = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(659.25, startAt + 0.18);

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.28);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.3);
  }

  const notifyAboutWaitingRequest = useEffectEvent(
    (request: WaitingRequest) => {
      void playAlertChime();

      if (
        typeof window === "undefined" ||
        alertPermission !== "granted" ||
        !("Notification" in window)
      ) {
        return;
      }

      try {
        const notification = new window.Notification(
          "Someone is waiting in Alongly",
          {
            body: `${request.experience_tag} - ${request.style_tag}`,
            icon: "/brand/alongly-icon-192.png",
            tag: `waiting-request-${request.id}`,
          },
        );

        notification.onclick = () => {
          notification.close();
          window.focus();
        };
      } catch {
        setAlertFeedback(
          "Chrome could not show the desktop alert, but the dashboard is still listening for new requests.",
        );
      }
    },
  );

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let isActive = true;

    async function loadWaitingRequests() {
      const { data, error: loadError } = await supabase
        .from("match_requests")
        .select(
          "id,user_email,experience_tag,intensity_tag,style_tag,status,companion_briefing,user_context_card",
        )
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (!isActive) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        return;
      }

      const nextRequests = (data ?? [])
        .map((row) => toWaitingRequest(row))
        .filter((row): row is WaitingRequest => Boolean(row));

      seenRequestIdsRef.current = new Set(
        nextRequests.map((request) => request.id),
      );
      setRequests(nextRequests);
    }

    void loadWaitingRequests();

    const channel = supabase
      .channel("waiting-match-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_requests",
          filter: "status=eq.waiting",
        },
        (payload) => {
          const nextRequest = toWaitingRequest(
            payload.new as Partial<MatchRequestRow>,
          );

          if (!nextRequest) {
            return;
          }

          const isNewRequest = !seenRequestIdsRef.current.has(nextRequest.id);
          seenRequestIdsRef.current.add(nextRequest.id);
          setRequests((current) => upsertRequest(current, nextRequest));

          if (isNewRequest) {
            notifyAboutWaitingRequest(nextRequest);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
        },
        (payload) => {
          const updatedRow = payload.new as Partial<MatchRequestRow>;
          const nextRequest = toWaitingRequest(updatedRow);

          if (nextRequest) {
            seenRequestIdsRef.current.add(nextRequest.id);
            setRequests((current) => upsertRequest(current, nextRequest));
            return;
          }

          if (updatedRow.id) {
            seenRequestIdsRef.current.delete(updatedRow.id);
            setRequests((current) =>
              current.filter((request) => request.id !== updatedRow.id),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "match_requests",
        },
        (payload) => {
          const deletedRow = payload.old as Partial<MatchRequestRow>;

          if (deletedRow.id) {
            seenRequestIdsRef.current.delete(deletedRow.id);
            setRequests((current) =>
              current.filter((request) => request.id !== deletedRow.id),
            );
          }
        },
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => {
      isActive = false;
      void supabase.removeChannel(channel);
    };
  }, [isOnline, supabase]);

  async function enableAlerts() {
    setAlertFeedback(null);

    if (typeof window === "undefined" || !("Notification" in window)) {
      setAlertPermission("unsupported");
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setAlertPermission(permission);

      if (permission === "granted") {
        await playAlertChime();
        setAlertFeedback(
          "Alerts are ready. Keep this dashboard open in Chrome while you're online.",
        );
        return;
      }

      if (permission === "denied") {
        setAlertFeedback(
          "Chrome blocked alerts. Open the lock icon in the address bar, allow notifications, then refresh this page.",
        );
        return;
      }

      setAlertFeedback(
        "Notification permission was dismissed, so desktop alerts are still off.",
      );
    } catch {
      setAlertFeedback(
        "We couldn't turn on alerts from this browser session. Try again from Chrome after reloading the dashboard.",
      );
    }
  }

  async function toggleOnline(nextValue: boolean) {
    const previousValue = isOnline;

    setIsOnline(nextValue);
    setError(null);
    setIsSavingStatus(true);

    if (!nextValue) {
      seenRequestIdsRef.current = new Set();
      setRequests([]);
      setRealtimeStatus("CLOSED");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_online: nextValue })
      .eq("id", companionId);

    setIsSavingStatus(false);

    if (updateError) {
      setIsOnline(previousValue);
      setError(updateError.message);

      if (previousValue) {
        setRealtimeStatus("CONNECTING");
      }
    }
  }

  async function acceptRequest(requestId: string) {
    setError(null);
    setAcceptingId(requestId);

    const { count, error: updateError } = await supabase
      .from("match_requests")
      .update(
        { companion_id: companionId, status: "matched" },
        { count: "exact" },
      )
      .eq("id", requestId)
      .eq("status", "waiting");

    if (updateError) {
      setAcceptingId(null);
      setError(updateError.message);
      return;
    }

    if (count === 0) {
      setAcceptingId(null);
      seenRequestIdsRef.current.delete(requestId);
      setRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );
      setError("That request was already matched.");
      return;
    }

    router.push(`/room/${requestId}`);
  }

  const alertCopy = getAlertCopy(alertPermission);

  return (
    <section className="mobile-scroll h-full overflow-y-auto px-5 py-5">
      <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-orange-100 bg-white/75 p-4 shadow-sm">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-stone-950">Availability</h2>
          <p className="mt-1 truncate text-sm font-medium text-stone-500">
            {isOnline ? "Online" : "Offline"}
            {isOnline ? ` - ${realtimeStatus.toLowerCase()}` : ""}
          </p>
        </div>

        <button
          aria-pressed={isOnline}
          className={`relative h-9 w-16 shrink-0 rounded-full border transition ${
            isOnline
              ? "border-teal-500 bg-teal-500"
              : "border-stone-200 bg-stone-200"
          } disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={isSavingStatus}
          onClick={() => void toggleOnline(!isOnline)}
          type="button"
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${
              isOnline ? "left-8" : "left-1"
            }`}
          />
          <span className="sr-only">
            {isOnline ? "Go offline" : "Go online"}
          </span>
        </button>
      </div>

      <article className="mb-5 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
              Live alerts
            </p>
            <h3 className="mt-1 text-lg font-bold text-stone-950">
              Get notified when someone is waiting.
            </h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              {alertCopy}
            </p>
          </div>

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-teal-600 shadow-sm">
            <BellRing aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {alertPermission === "granted" ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              onClick={() => void playAlertChime()}
              type="button"
            >
              <Volume2 aria-hidden="true" size={16} strokeWidth={2.2} />
              Test sound
            </button>
          ) : (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
              onClick={() => void enableAlerts()}
              type="button"
            >
              <BellRing aria-hidden="true" size={16} strokeWidth={2.2} />
              Enable alerts
            </button>
          )}

          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-500">
            Works best with this Chrome tab open on Vercel HTTPS
          </span>
        </div>

        {alertFeedback ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {alertFeedback}
          </p>
        ) : null}
      </article>

      {error ? (
        <p
          aria-live="polite"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-3">
        {!isOnline ? (
          <div className="rounded-lg border border-orange-100 bg-white/75 p-5 text-sm font-medium text-stone-500 shadow-sm">
            Go online to see waiting requests.
          </div>
        ) : null}

        {isOnline && requests.length === 0 ? <WhileYouWaitTip /> : null}

        {isOnline
          ? requests.map((request) => (
              <article
                className="grid gap-4 rounded-lg border border-orange-100 bg-white/80 p-4 shadow-sm"
                key={request.id}
              >
                <CompanionHandoffCard
                  companionBriefing={request.companion_briefing}
                  userEmail={request.user_email}
                  userContextCard={request.user_context_card}
                />

                <dl className="grid gap-3">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                      Experience
                    </dt>
                    <dd className="mt-1 text-lg font-bold text-stone-950">
                      {request.experience_tag}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-600">
                      {request.intensity_tag}
                    </span>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-700">
                      {request.style_tag}
                    </span>
                  </div>
                </dl>

                <button
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-orange-400 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-stone-300"
                  disabled={Boolean(acceptingId)}
                  onClick={() => void acceptRequest(request.id)}
                  type="button"
                >
                  <CheckCircle2 aria-hidden="true" size={19} strokeWidth={2.2} />
                  {acceptingId === request.id ? "Accepting..." : "Accept"}
                </button>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}

const tips = [
  {
    title: "Reflect, don't fix.",
    body: "Try mirroring what they said back in your own words before offering anything. \"Sounds like that left you feeling alone\" goes further than advice.",
  },
  {
    title: "Silence is a tool.",
    body: "When they pause, count to three before filling the gap. People often say the truest thing right after the pause.",
  },
  {
    title: "Name the feeling.",
    body: "Gentle labels help: \"that sounds exhausting,\" \"that sounds scary.\" It tells them they've been heard.",
  },
  {
    title: "Their story isn't yours.",
    body: "Even if you went through something similar, hold back the comparison until they ask. This moment is theirs.",
  },
  {
    title: "Ask, don't assume.",
    body: "\"What would feel like support right now?\" - sometimes they want to vent, not solve.",
  },
];

function WhileYouWaitTip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pick a random tip on client mount; can't run during SSR
    setIndex(Math.floor(Math.random() * tips.length));
  }, []);

  const tip = tips[index];

  function nextTip() {
    setIndex((current) => (current + 1) % tips.length);
  }

  return (
    <article className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-teal-600 shadow-sm">
          <Lightbulb aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            While you wait
          </p>
          <h3 className="text-base font-bold text-stone-950">{tip.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-stone-600">{tip.body}</p>
      <button
        className="mt-4 inline-flex h-9 items-center rounded-full border border-teal-200 bg-white px-4 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
        onClick={nextTip}
        type="button"
      >
        Another tip
      </button>
    </article>
  );
}
