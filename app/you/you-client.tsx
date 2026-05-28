"use client";

import { LogOut } from "lucide-react";

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

const moodEmoji = ["😞", "😕", "😐", "🙂", "😊"];

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

export function YouClient() {
  const [moods] = useLocalStorage(MOOD_KEY, parseMoods, EMPTY_MOODS);

  const recent = moods.slice(-7);
  const placeholders = Math.max(0, 7 - recent.length);

  return (
    <section className="mobile-scroll flex h-full flex-col gap-7 overflow-y-auto px-5 py-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-stone-950">
          How you&apos;ve been
        </h2>
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
        <p className="text-center text-xs text-stone-400">
          You don&apos;t have to be okay to be here.
        </p>
      </div>
    </section>
  );
}
