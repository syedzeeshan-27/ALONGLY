"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MatchRequestRow = Database["public"]["Tables"]["match_requests"]["Row"];

export function MatchWaiting({
  requestId,
  userId,
}: {
  requestId: string;
  userId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState<string | null>(null);
  const navigated = useRef(false);

  useEffect(() => {
    let isActive = true;

    function goToRoom(roomId: string) {
      if (!isActive || navigated.current) return;
      navigated.current = true;
      router.replace(`/room/${roomId}`);
    }

    function handleRow(row: Partial<MatchRequestRow>) {
      if (row.status === "matched") {
        goToRoom(row.id ?? requestId);
      }
    }

    async function check() {
      const { data, error: loadError } = await supabase
        .from("match_requests")
        .select("id,status")
        .eq("id", requestId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!isActive) return;
      if (loadError) {
        setError(loadError.message);
        return;
      }
      if (data) handleRow(data);
    }

    void check();
    const pollId = window.setInterval(() => void check(), 3000);

    const channel = supabase
      .channel(`talk-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => handleRow(payload.new as Partial<MatchRequestRow>),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          void check();
        }
      });

    return () => {
      isActive = false;
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [requestId, userId, router, supabase]);

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
            Breathe with us while we connect you to a live companion.
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
