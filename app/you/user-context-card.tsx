"use client";

import { NotebookPen, Save } from "lucide-react";
import { useState } from "react";

import {
  EMPTY_USER_CONTEXT_CARD,
  parseUserContextCard,
  USER_CONTEXT_KEY,
  type UserContextCard,
} from "@/lib/user-continuity";
import { useLocalStorage } from "@/lib/use-local-storage";

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

function SupportNoteField({
  label,
  name,
  onChange,
  placeholder,
  rows = 2,
  value,
}: {
  label: string;
  name: keyof UserContextCard;
  onChange: (name: keyof UserContextCard, value: string) => void;
  placeholder: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-stone-950">{label}</span>
      <textarea
        className="min-h-14 resize-none rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function UserContextCard() {
  const [storedContext, setStoredContext] = useLocalStorage(
    USER_CONTEXT_KEY,
    parseUserContextCard,
    EMPTY_USER_CONTEXT_CARD,
  );
  const contextVersion = JSON.stringify(storedContext);

  return (
    <ContextCardEditor
      key={contextVersion}
      onSave={setStoredContext}
      storedContext={storedContext}
    />
  );
}

function ContextCardEditor({
  onSave,
  storedContext,
}: {
  onSave: (raw: string | null) => void;
  storedContext: UserContextCard;
}) {
  const [draftContext, setDraftContext] = useState<UserContextCard>(() => ({
    ...storedContext,
    background: "",
    ongoingStory: [storedContext.ongoingStory, storedContext.background]
      .map((value) => value.trim())
      .filter(Boolean)
      .join("\n\n"),
  }));
  const hasUnsavedChanges = hasContextChanges(draftContext, storedContext);
  const saveMessage = hasUnsavedChanges
    ? "Unsaved note."
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
      background: "",
      updatedAt: Date.now(),
    };

    onSave(JSON.stringify(next));
  }

  return (
    <form
      className="overflow-hidden rounded-3xl border border-orange-100 bg-white/95 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        saveContext();
      }}
    >
      <div className="bg-gradient-to-br from-orange-50/90 via-white to-teal-50/80 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-orange-500 shadow-sm">
            <NotebookPen aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
                User context card
              </p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold text-teal-700 shadow-sm">
                Optional
              </span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-stone-950">
              What should support people know?
            </h3>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Keep a short note for yourself so new support does not start from zero.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <SupportNoteField
          label="Short note"
          name="ongoingStory"
          onChange={updateField}
          placeholder="e.g. I'm anxious after a breakup and need calm, non-judgy support."
          rows={3}
          value={draftContext.ongoingStory}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <SupportNoteField
            label="Helps"
            name="whatHelps"
            onChange={updateField}
            placeholder="Gentle questions, practical steps..."
            value={draftContext.whatHelps}
          />

          <SupportNoteField
            label="Avoid"
            name="avoid"
            onChange={updateField}
            placeholder="Don't rush me or minimize it..."
            value={draftContext.avoid}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
          <p className="text-xs leading-5 text-stone-500">{saveMessage}</p>
          <button
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!hasUnsavedChanges}
            type="submit"
          >
            <Save aria-hidden="true" size={16} strokeWidth={2.2} />
            {hasUnsavedChanges ? "Save note" : "Saved"}
          </button>
        </div>
      </div>
    </form>
  );
}
