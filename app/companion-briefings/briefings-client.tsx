"use client";

import { MessageCircle, NotebookText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CompanionHandoffCard } from "@/app/components/companion-handoff-card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MatchRequestRow =
  Database["public"]["Tables"]["match_requests"]["Row"];

type BriefingCard = {
  id: string;
  user_email: string | null;
  experience_tag: string;
  intensity_tag: string;
  style_tag: string;
  companion_briefing: string | null;
  user_context_card: string | null;
};

type BriefingsClientProps = {
  companionId: string;
  initialIsOnline: boolean;
};

function tagValue(value: string | null | undefined) {
  return value?.trim() || "unspecified";
}

function toBriefingCard(
  row: Partial<MatchRequestRow>,
  companionId: string,
): BriefingCard | null {
  if (
    !row.id ||
    row.status !== "matched" ||
    row.companion_id !== companionId
  ) {
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

function upsertCard(current: BriefingCard[], next: BriefingCard) {
  const exists = current.some((card) => card.id === next.id);

  if (exists) {
    return current.map((card) => (card.id === next.id ? next : card));
  }

  return [...current, next];
}

export function BriefingsClient({
  companionId,
  initialIsOnline,
}: BriefingsClientProps) {
  const supabase = useMemo(() => createClient(), []);
  const [cards, setCards] = useState<BriefingCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isOnline = initialIsOnline;

  useEffect(() => {
    let isActive = true;

    async function loadCards() {
      const { data, error: loadError } = await supabase
        .from("match_requests")
        .select(
          "id,user_email,experience_tag,intensity_tag,style_tag,status,companion_id,companion_briefing,user_context_card",
        )
        .eq("companion_id", companionId)
        .eq("status", "matched")
        .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        return;
      }

      setCards(
        (data ?? [])
          .map((row) => toBriefingCard(row, companionId))
          .filter((row): row is BriefingCard => Boolean(row)),
      );
    }

    void loadCards();

    const channel = supabase
      .channel("active-briefings")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_requests",
        },
        (payload) => {
          const row = payload.new as Partial<MatchRequestRow>;
          const card = toBriefingCard(row, companionId);

          if (card) {
            setCards((current) => upsertCard(current, card));
            return;
          }

          if (row.id) {
            setCards((current) =>
              current.filter((existing) => existing.id !== row.id),
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
          const row = payload.old as Partial<MatchRequestRow>;
          if (row.id) {
            setCards((current) =>
              current.filter((existing) => existing.id !== row.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      isActive = false;
      void supabase.removeChannel(channel);
    };
  }, [companionId, supabase]);

  return (
    <section className="mobile-scroll h-full overflow-y-auto px-5 py-5">
      {error ? (
        <p
          aria-live="polite"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {cards.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500">
            <NotebookText aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-stone-950">
              {isOnline
                ? "No active conversation yet"
                : "You're offline"}
            </h3>
            <p className="text-sm leading-6 text-stone-500">
              {isOnline
                ? "When you accept someone from the Dashboard, their briefing will stay here so you can come back to it any time during your conversation."
                : "Go online from the Dashboard to start receiving people. Active briefings will live here."}
            </p>
          </div>
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div className="grid gap-4">
          {cards.map((card) => (
            <article
              className="grid gap-4 rounded-2xl border border-orange-100 bg-white/85 p-5 shadow-sm"
              key={card.id}
            >
              <CompanionHandoffCard
                companionBriefing={card.companion_briefing}
                userEmail={card.user_email}
                userContextCard={card.user_context_card}
              />

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-600">
                  {card.experience_tag}
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-600">
                  {card.intensity_tag}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-700">
                  {card.style_tag}
                </span>
              </div>

              <Link
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-teal-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
                href={`/room/${card.id}`}
              >
                <MessageCircle aria-hidden="true" size={18} strokeWidth={2.2} />
                Open chat
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
