"use client";

import { useActionState, useState } from "react";

import {
  saveCompanionSetup,
  type CompanionSetupState,
} from "@/app/companion-setup/actions";

const maxChars = 200;

export function CompanionSetupForm() {
  const [state, formAction, pending] = useActionState<
    CompanionSetupState | undefined,
    FormData
  >(saveCompanionSetup, undefined);
  const [wentThrough, setWentThrough] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-bold text-stone-800"
            htmlFor="went_through"
          >
            What did you go through?
          </label>
          <span className="text-xs font-bold text-stone-500">
            {wentThrough.length}/{maxChars}
          </span>
        </div>
        <textarea
          className="min-h-32 resize-none rounded-lg border border-orange-100 bg-white/85 px-4 py-3 text-base leading-7 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          id="went_through"
          maxLength={maxChars}
          name="went_through"
          onChange={(event) => setWentThrough(event.target.value)}
          required
          value={wentThrough}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-bold text-stone-800"
          htmlFor="how_long_ago"
        >
          How long ago?
        </label>
        <select
          className="h-12 rounded-lg border border-orange-100 bg-white/85 px-4 text-base font-medium text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          defaultValue=""
          id="how_long_ago"
          name="how_long_ago"
          required
        >
          <option disabled value="">
            Select a time range
          </option>
          <option value="less than 6 months">less than 6 months</option>
          <option value="6-12 months">6-12 months</option>
          <option value="1-2 years">1-2 years</option>
          <option value="more than 2 years">more than 2 years</option>
        </select>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-bold text-stone-800">
          Companion style
        </legend>
        <div className="grid gap-3">
          {["calm listener", "practical thinker", "warm encourager"].map(
            (style) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-orange-100 bg-white/85 p-4 transition has-[:checked]:border-orange-300 has-[:checked]:bg-orange-50"
                key={style}
              >
                <input
                  className="mt-1 h-4 w-4 accent-orange-600"
                  name="support_style"
                  required
                  type="radio"
                  value={style}
                />
                <span className="text-sm font-bold capitalize text-stone-950">
                  {style}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      {state?.error ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </p>
      ) : null}

      <button
        className="h-12 rounded-full bg-orange-400 px-5 text-base font-bold text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-stone-300"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : "Save setup"}
      </button>
    </form>
  );
}
