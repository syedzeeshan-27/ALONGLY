"use client";

import Link from "next/link";
import { ArrowRight, Wind } from "lucide-react";
import { useCallback } from "react";

import { useLocalStorage } from "@/lib/use-local-storage";

type Mood = {
  emoji: string;
  label: string;
  tone: string;
};

const moods: Mood[] = [
  { emoji: "😞", label: "low", tone: "bg-indigo-100 hover:bg-indigo-200" },
  { emoji: "😕", label: "off", tone: "bg-sky-100 hover:bg-sky-200" },
  { emoji: "😐", label: "okay", tone: "bg-stone-100 hover:bg-stone-200" },
  { emoji: "🙂", label: "good", tone: "bg-amber-100 hover:bg-amber-200" },
  { emoji: "😊", label: "great", tone: "bg-rose-100 hover:bg-rose-200" },
];

const MOOD_KEY = "alongly:moods";

type MoodEntry = {
  index: number;
  at: number;
};

const EMPTY_MOODS: MoodEntry[] = [];

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

export function HomeClient() {
  const [entries, setRaw] = useLocalStorage(MOOD_KEY, parseMoods, EMPTY_MOODS);

  const today = new Date().toDateString();
  const last = entries.at(-1);
  const tapped =
    last && new Date(last.at).toDateString() === today ? last.index : null;

  const handleMood = useCallback(
    (index: number) => {
      const now = Date.now();
      const todayString = new Date(now).toDateString();
      const list = [...entries];
      const lastEntry = list.at(-1);
      const nextEntry: MoodEntry = { index, at: now };

      if (lastEntry && new Date(lastEntry.at).toDateString() === todayString) {
        list[list.length - 1] = nextEntry;
      } else {
        list.push(nextEntry);
      }
      if (list.length > 30) list.splice(0, list.length - 30);
      setRaw(JSON.stringify(list));
    },
    [entries, setRaw],
  );

  return (
    <section className="mobile-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
            Today
          </p>
          <h2 className="text-[1.7rem] font-bold leading-tight text-stone-950">
            Hey, how are you feeling today?
          </h2>
        </div>

        <div className="flex items-center justify-between gap-2">
          {moods.map((mood, index) => {
            const isActive = tapped === index;
            return (
              <button
                aria-label={`Feeling ${mood.label}`}
                aria-pressed={isActive}
                className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl transition active:scale-95 ${mood.tone} ${
                  isActive
                    ? "scale-110 ring-2 ring-orange-400 ring-offset-2 ring-offset-[#fbf7f1]"
                    : ""
                }`}
                key={mood.label}
                onClick={() => handleMood(index)}
                type="button"
              >
                <span aria-hidden="true">{mood.emoji}</span>
              </button>
            );
          })}
        </div>

        {tapped !== null ? (
          <p className="text-sm text-stone-500" aria-live="polite">
            Thanks for letting me know.
          </p>
        ) : (
          <p className="text-sm text-stone-400">Tap one. No words needed.</p>
        )}
      </div>

      <Link
        className="group flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 px-6 py-6 text-white shadow-lg shadow-orange-200/70 transition hover:from-orange-500 hover:to-orange-600 active:scale-[0.99]"
        href="/chat"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-100">
            Want to talk?
          </span>
          <span className="text-xl font-bold leading-tight">
            Talk to someone
          </span>
          <span className="text-sm text-orange-50/90">
            We&apos;ll find someone who gets it.
          </span>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30">
          <ArrowRight aria-hidden="true" size={22} strokeWidth={2.4} />
        </span>
      </Link>

      <Link
        className="flex items-center gap-4 rounded-3xl border border-teal-100 bg-teal-50/70 px-5 py-5 text-left transition hover:bg-teal-50 active:scale-[0.99]"
        href="/breathe"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-teal-600 shadow-sm">
          <Wind aria-hidden="true" size={22} strokeWidth={2.2} />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold text-stone-950">Breathe</span>
          <span className="text-sm text-stone-500">
            30 seconds of box breathing
          </span>
        </span>
      </Link>

    </section>
  );
}
