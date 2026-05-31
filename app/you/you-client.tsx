"use client";

import Link from "next/link";
import {
  Heart,
  HeartHandshake,
  History,
  LogOut,
  MessageCircle,
} from "lucide-react";

import { signOut } from "@/app/auth/actions";
import { useLocalStorage } from "@/lib/use-local-storage";

const MOOD_KEY = "alongly:moods";

type MoodEntry = {
  index: number;
  at: number;
};

const EMPTY_MOODS: MoodEntry[] = [];

const moodColors = [
  "bg-indigo-300",
  "bg-sky-300",
  "bg-stone-300",
  "bg-amber-300",
  "bg-rose-300",
];

const moodEmoji = ["sad", "off", "okay", "good", "great"];

export type SavedCompanion = {
  companionId: string;
  lastRoomId: string | null;
  savedAt: string;
  wentThrough: string | null;
  howLongAgo: string | null;
  supportStyle: string | null;
};

function parseMoods(raw: string | null): MoodEntry[] {
  if (!raw) return EMPTY_MOODS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_MOODS;
    return parsed.filter(
      (entry): entry is MoodEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as MoodEntry).index === "number" &&
        typeof (entry as MoodEntry).at === "number",
    );
  } catch {
    return EMPTY_MOODS;
  }
}

export function YouClient({
  savedCompanions,
  sessionCount,
}: {
  savedCompanions: SavedCompanion[];
  sessionCount: number;
}) {
  const [moods] = useLocalStorage(MOOD_KEY, parseMoods, EMPTY_MOODS);
  const recent = moods.slice(-7);
  const placeholders = Math.max(0, 7 - recent.length);

  return (
    <>
      <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/85 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-teal-600 shadow-sm">
              <HeartHandshake aria-hidden="true" size={22} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                Continuity
              </p>
              <h2 className="mt-1 text-xl font-bold text-stone-950">
                Keep your support from resetting
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Save the parts of your story you are tired of repeating, then keep track of each session in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-teal-100/80 bg-white/80 px-4 py-4">
          <div>
            <p className="text-2xl font-bold leading-none text-stone-950">
              {sessionCount}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {sessionCount === 1 ? "session attended" : "sessions attended"}
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-full bg-teal-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
            href="/sessions"
          >
            <History aria-hidden="true" size={17} strokeWidth={2.2} />
            View sessions
          </Link>
        </div>
      </div>

      <SavedCompanionsCard savedCompanions={savedCompanions} />

      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-stone-950">How you&apos;ve been</h3>
        <p className="text-sm text-stone-500">
          Your last 7 check-ins. No scores, no streaks.
        </p>
        <div className="mt-2 flex items-center gap-3">
          {recent.map((entry, i) => (
            <div className="flex flex-col items-center gap-2" key={`${entry.at}-${i}`}>
              <span
                aria-label={`mood ${moodEmoji[entry.index]}`}
                className={`h-7 w-7 rounded-full ${moodColors[entry.index] ?? "bg-stone-200"} shadow-sm`}
              />
            </div>
          ))}
          {Array.from({ length: placeholders }).map((_, i) => (
            <span
              aria-hidden="true"
              className="h-7 w-7 rounded-full border-2 border-dashed border-stone-200"
              key={`empty-${i}`}
            />
          ))}
        </div>
        {recent.length === 0 ? (
          <p className="text-xs text-stone-400">
            Tap a mood on Home and it&apos;ll show up here.
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <form action={signOut}>
          <button
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white/70 px-5 py-4 text-base font-semibold text-stone-700 transition hover:bg-white hover:text-stone-950"
            type="submit"
          >
            <LogOut aria-hidden="true" size={18} strokeWidth={2.2} />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

function SavedCompanionsCard({
  savedCompanions,
}: {
  savedCompanions: SavedCompanion[];
}) {
  return (
    <section className="rounded-3xl border border-teal-100 bg-white/85 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600">
          <Heart aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Saved companions
          </p>
          <h3 className="mt-1 text-xl font-bold text-stone-950">
            People you can return to
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            For the demo: this proves continuity is real, not just a one-off match.
          </p>
        </div>
      </div>

      {savedCompanions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-4">
          <p className="text-sm font-semibold text-stone-700">
            No saved companion yet.
          </p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Save someone from a matched room and they will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {savedCompanions.map((companion) => (
            <article
              className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4"
              key={companion.companionId}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-stone-950">
                    Saved companion
                  </p>
                  <p className="mt-1 text-xs font-medium text-stone-500">
                    Saved {new Date(companion.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700 shadow-sm">
                  Saved
                </span>
              </div>

              {companion.wentThrough || companion.supportStyle ? (
                <div className="mt-3 grid gap-2 text-sm leading-6 text-stone-600">
                  {companion.wentThrough ? (
                    <p>
                      <span className="font-semibold text-stone-800">
                        Lived experience:
                      </span>{" "}
                      {companion.wentThrough}
                    </p>
                  ) : null}
                  {companion.howLongAgo ? (
                    <p>
                      <span className="font-semibold text-stone-800">
                        Timeline:
                      </span>{" "}
                      {companion.howLongAgo}
                    </p>
                  ) : null}
                  {companion.supportStyle ? (
                    <p>
                      <span className="font-semibold text-stone-800">
                        Support style:
                      </span>{" "}
                      {companion.supportStyle}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {companion.lastRoomId ? (
                <Link
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-teal-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
                  href={`/room/${companion.lastRoomId}`}
                >
                  <MessageCircle
                    aria-hidden="true"
                    size={15}
                    strokeWidth={2.2}
                  />
                  Open last room
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
