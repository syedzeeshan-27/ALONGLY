"use client";

import Link from "next/link";
import { HeartHandshake, History, LogOut, NotebookPen, Save } from "lucide-react";
import { useState } from "react";

import { signOut } from "@/app/auth/actions";
import {
  EMPTY_USER_CONTEXT_CARD,
  parseUserContextCard,
  USER_CONTEXT_KEY,
  type UserContextCard,
} from "@/lib/user-continuity";
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

function hasContextChanges(left: UserContextCard, right: UserContextCard) {
  return (
    left.background !== right.background ||
    left.ongoingStory !== right.ongoingStory ||
    left.whatHelps !== right.whatHelps ||
    left.avoid !== right.avoid
  );
}

function formatSavedAt(value: number | null) {
  if (!value) {
    return "Saved on this device once you tap save.";
  }

  return `Last saved ${new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}.`;
}

function Field({
  hint,
  label,
  name,
  onChange,
  placeholder,
  rows = 4,
  value,
}: {
  hint: string;
  label: string;
  name: keyof UserContextCard;
  onChange: (name: keyof UserContextCard, value: string) => void;
  placeholder: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-stone-900">{label}</span>
      <span className="text-xs leading-5 text-stone-500">{hint}</span>
      <textarea
        className="min-h-24 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function YouClient({ sessionCount }: { sessionCount: number }) {
  const [moods] = useLocalStorage(MOOD_KEY, parseMoods, EMPTY_MOODS);
  const [storedContext, setStoredContext] = useLocalStorage(
    USER_CONTEXT_KEY,
    parseUserContextCard,
    EMPTY_USER_CONTEXT_CARD,
  );
  const recent = moods.slice(-7);
  const placeholders = Math.max(0, 7 - recent.length);
  const contextVersion = JSON.stringify(storedContext);

  return (
    <section className="mobile-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
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

      <ContextCardEditor
        key={contextVersion}
        onSave={setStoredContext}
        storedContext={storedContext}
      />

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
    </section>
  );
}

function ContextCardEditor({
  onSave,
  storedContext,
}: {
  onSave: (raw: string | null) => void;
  storedContext: UserContextCard;
}) {
  const [draftContext, setDraftContext] = useState(storedContext);
  const hasUnsavedChanges = hasContextChanges(draftContext, storedContext);
  const saveMessage = hasUnsavedChanges
    ? "Unsaved changes."
    : formatSavedAt(storedContext.updatedAt);

  function updateField(name: keyof UserContextCard, value: string) {
    setDraftContext((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function saveContext() {
    const next = {
      ...draftContext,
      updatedAt: Date.now(),
    };

    onSave(JSON.stringify(next));
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white/85 p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        saveContext();
      }}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-500">
          <NotebookPen aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Context card
          </p>
          <h3 className="mt-1 text-xl font-bold text-stone-950">
            What new support people should know
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            This is your quick handoff. It stays short, practical, and easy to reuse.
          </p>
        </div>
      </div>

      <Field
        hint="Stable background that usually matters no matter who you talk to."
        label="Background to reuse"
        name="background"
        onChange={updateField}
        placeholder="A short version of what you have been dealing with overall."
        value={draftContext.background}
      />

      <Field
        hint="This is the pinned ongoing story: the one situation that feels most true right now and should be read first."
        label="Pinned ongoing story"
        name="ongoingStory"
        onChange={updateField}
        placeholder="What is the current chapter you do not want to explain from scratch again?"
        value={draftContext.ongoingStory}
      />

      <Field
        hint="Helpful styles, words, or kinds of support."
        label="What helps"
        name="whatHelps"
        onChange={updateField}
        placeholder="Gentle listening, direct advice, reminders to slow down, practical steps..."
        rows={3}
        value={draftContext.whatHelps}
      />

      <Field
        hint="Things that usually land badly."
        label="What to avoid"
        name="avoid"
        onChange={updateField}
        placeholder="Do not minimize it, do not rush to solutions, do not tell me to just stay positive..."
        rows={3}
        value={draftContext.avoid}
      />

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
        <p className="text-xs leading-5 text-stone-500">{saveMessage}</p>
        <button
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!hasUnsavedChanges}
          type="submit"
        >
          <Save aria-hidden="true" size={16} strokeWidth={2.2} />
          {hasUnsavedChanges ? "Save card" : "Saved"}
        </button>
      </div>
    </form>
  );
}
