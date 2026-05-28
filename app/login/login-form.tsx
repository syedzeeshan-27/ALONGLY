"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type AuthFormState } from "@/app/auth/actions";

type LoginFormProps = {
  nextPath?: string;
  notice?: string;
};

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(login, undefined);
  const feedback = state?.error ?? state?.message ?? notice;
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
          autoComplete="current-password"
          className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          id="password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>

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
        {pending ? "Signing in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-stone-500">
        New here?{" "}
        <Link className="font-semibold text-orange-600 underline-offset-4 hover:underline" href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}
