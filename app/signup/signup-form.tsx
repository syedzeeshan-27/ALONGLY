"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup, type AuthFormState } from "@/app/auth/actions";
import type { ProfileRole } from "@/lib/supabase/types";

export function SignupForm({
  initialRole = "user",
  nextPath,
}: {
  initialRole?: ProfileRole;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(signup, undefined);
  const feedback = state?.error ?? state?.message;
  const feedbackTone = state?.error
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input name="next" type="hidden" value={nextPath ?? ""} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-stone-700" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-semibold text-stone-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          autoComplete="new-password"
          className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          id="password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-stone-700">
          I&apos;m here to...
        </legend>
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50">
            <input
              className="mt-1 h-4 w-4 accent-orange-500"
              defaultChecked={initialRole === "user"}
              name="role"
              type="radio"
              value="user"
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold text-stone-950">Talk to someone</span>
              <span className="text-sm text-stone-500">
                Find a companion who&apos;s been there.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
            <input
              className="mt-1 h-4 w-4 accent-teal-600"
              defaultChecked={initialRole === "companion"}
              name="role"
              type="radio"
              value="companion"
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold text-stone-950">Be a companion</span>
              <span className="text-sm text-stone-500">
                Be there for someone who needs it.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {feedback ? (
        <p
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm ${feedbackTone}`}
        >
          {feedback}
        </p>
      ) : null}

      <button
        className="h-12 rounded-2xl bg-orange-500 px-5 text-base font-semibold text-white shadow-md shadow-orange-200/60 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link className="font-semibold text-orange-600 underline-offset-4 hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
