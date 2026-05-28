"use client";

import { LogOut, Users } from "lucide-react";
import { useActionState, useState } from "react";

import { signOut } from "@/app/auth/actions";
import {
  updateSupportStyle,
  type StyleUpdateState,
} from "@/app/companion-setup/actions";

const styles = ["calm listener", "practical thinker", "warm encourager"] as const;

type ProfileClientProps = {
  howLongAgo: string;
  sessionCount: number;
  supportStyle: string;
  wentThrough: string;
};

export function ProfileClient({
  howLongAgo,
  sessionCount,
  supportStyle,
  wentThrough,
}: ProfileClientProps) {
  const [state, formAction, pending] = useActionState<
    StyleUpdateState | undefined,
    FormData
  >(updateSupportStyle, undefined);
  const [selectedStyle, setSelectedStyle] = useState(supportStyle);
  const hasChange = selectedStyle !== supportStyle;
  const justSaved = state?.ok && !hasChange;

  return (
    <section className="mobile-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-teal-600 shadow-sm">
          <Users aria-hidden="true" size={24} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-3xl font-bold leading-none text-stone-950">
            {sessionCount}
          </p>
          <p className="text-sm font-medium text-stone-500">
            {sessionCount === 1 ? "person you've sat with" : "people you've sat with"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Your story
        </p>
        <p className="text-base leading-7 text-stone-800">{wentThrough}</p>
        <p className="text-xs text-stone-400">
          {howLongAgo === "less than 6 months"
            ? "Less than 6 months ago"
            : howLongAgo === "6-12 months"
              ? "6–12 months ago"
              : howLongAgo === "1-2 years"
                ? "1–2 years ago"
                : "More than 2 years ago"}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Your style
        </p>
        <div className="flex flex-col gap-2">
          {styles.map((style) => {
            const isActive = selectedStyle === style;
            return (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3.5 transition ${
                  isActive
                    ? "border-orange-400 bg-orange-50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
                key={style}
              >
                <input
                  checked={isActive}
                  className="h-4 w-4 accent-orange-500"
                  name="support_style"
                  onChange={() => setSelectedStyle(style)}
                  type="radio"
                  value={style}
                />
                <span className="text-sm font-bold capitalize text-stone-900">
                  {style}
                </span>
              </label>
            );
          })}
        </div>

        {state?.error ? (
          <p
            aria-live="polite"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        ) : null}

        {justSaved ? (
          <p
            aria-live="polite"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            Saved.
          </p>
        ) : null}

        <button
          className="mt-1 h-11 rounded-full bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={pending || !hasChange}
          type="submit"
        >
          {pending ? "Saving..." : hasChange ? "Save style" : "Style saved"}
        </button>
      </form>

      <form action={signOut} className="mt-auto pt-2">
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white/70 px-5 py-4 text-base font-semibold text-stone-700 transition hover:bg-white hover:text-stone-950"
          type="submit"
        >
          <LogOut aria-hidden="true" size={18} strokeWidth={2.2} />
          Sign out
        </button>
      </form>
    </section>
  );
}
