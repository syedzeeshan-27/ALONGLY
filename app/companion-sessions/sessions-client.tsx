"use client";

import { Check, HelpCircle, Sprout } from "lucide-react";
import { useCallback } from "react";

import { useLocalStorage } from "@/lib/use-local-storage";

export type SessionRow = {
  id: string;
  experience_tag: string;
  created_at: string;
};

type Rating = "well" | "tough" | "unsure";
type RatingMap = Record<string, Rating>;

const RATING_KEY = "alongly:companion-ratings";
const EMPTY_RATINGS: RatingMap = {};

const ratingOptions: { value: Rating; label: string; icon: typeof Check; tone: string; activeTone: string }[] = [
  {
    value: "well",
    label: "Went well",
    icon: Sprout,
    tone: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    activeTone: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    value: "tough",
    label: "Was tough",
    icon: HelpCircle,
    tone: "border-orange-200 text-orange-700 hover:bg-orange-50",
    activeTone: "border-orange-500 bg-orange-50 text-orange-700",
  },
  {
    value: "unsure",
    label: "Not sure",
    icon: Check,
    tone: "border-stone-200 text-stone-600 hover:bg-stone-50",
    activeTone: "border-stone-500 bg-stone-100 text-stone-800",
  },
];

function parseRatings(raw: string | null): RatingMap {
  if (!raw) return EMPTY_RATINGS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as RatingMap;
    }
    return EMPTY_RATINGS;
  } catch {
    return EMPTY_RATINGS;
  }
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function SessionsClient({ sessions }: { sessions: SessionRow[] }) {
  const [ratings, setRaw] = useLocalStorage(RATING_KEY, parseRatings, EMPTY_RATINGS);

  const setRating = useCallback(
    (sessionId: string, rating: Rating) => {
      const next: RatingMap = { ...ratings };
      if (next[sessionId] === rating) {
        delete next[sessionId];
      } else {
        next[sessionId] = rating;
      }
      setRaw(JSON.stringify(next));
    },
    [ratings, setRaw],
  );

  if (sessions.length === 0) {
    return (
      <section className="mobile-scroll flex h-full flex-col gap-4 overflow-y-auto px-5 py-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-stone-950">My sessions</h2>
          <p className="text-sm text-stone-500">
            Every conversation you finish will show up here.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-orange-100 bg-white/75 p-6 text-center">
          <p className="text-base font-semibold text-stone-800">
            No sessions yet.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Go online from the dashboard to be matched with someone.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mobile-scroll flex h-full flex-col gap-5 overflow-y-auto px-5 py-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-stone-950">My sessions</h2>
        <p className="text-sm text-stone-500">
          {sessions.length === 1
            ? "1 conversation completed."
            : `${sessions.length} conversations completed.`}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sessions.map((session) => {
          const currentRating = ratings[session.id];
          return (
            <li
              className="rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm"
              key={session.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {formatDate(session.created_at)}
                  </p>
                  <p className="mt-1 truncate text-base font-bold text-stone-950">
                    {session.experience_tag}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  How did it go?
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ratingOptions.map((option) => {
                    const isActive = currentRating === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        aria-pressed={isActive}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-white px-2 py-3 text-xs font-semibold transition ${
                          isActive ? option.activeTone : option.tone
                        }`}
                        key={option.value}
                        onClick={() => setRating(session.id, option.value)}
                        type="button"
                      >
                        <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
