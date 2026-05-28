"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"] as const;
const PHASE_MS = 4000;
const TOTAL_MS = 32000;

export function BreatheClient() {
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(TOTAL_MS);

  useEffect(() => {
    const start = Date.now();
    const phaseTimer = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, PHASE_MS);
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, TOTAL_MS - elapsed);
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(phaseTimer);
        window.clearInterval(tick);
      }
    }, 200);

    return () => {
      window.clearInterval(phaseTimer);
      window.clearInterval(tick);
    };
  }, []);

  function close() {
    router.push("/");
  }

  const phase = PHASES[phaseIndex];
  const seconds = Math.ceil(remaining / 1000);
  const isInhaling = phaseIndex === 0;
  const isExhaling = phaseIndex === 2;
  const scale = isInhaling ? 1 : isExhaling ? 0.6 : phaseIndex === 1 ? 1 : 0.6;
  const done = seconds === 0;

  return (
    <main className="min-h-dvh bg-stone-200 text-stone-950 sm:grid sm:place-items-center sm:px-4 sm:py-5">
      <section className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white shadow-2xl shadow-stone-950/10 sm:rounded-[26px] sm:border sm:border-white/10">
        <div className="safe-top flex items-center justify-between px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            Breathe
          </p>
          <button
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6">
          <div className="relative grid place-items-center">
            <div
              aria-hidden="true"
              className="absolute h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
              style={{
                transform: `scale(${scale + 0.1})`,
                transition: `transform ${PHASE_MS}ms ease-in-out`,
              }}
            />
            <div
              aria-hidden="true"
              className="relative h-56 w-56 rounded-full shadow-2xl shadow-teal-500/30"
              style={{
                background: `
                  radial-gradient(circle at 28% 28%, rgba(186, 230, 253, 0.95) 0%, rgba(186, 230, 253, 0) 38%),
                  radial-gradient(circle at 70% 30%, rgba(255, 251, 235, 0.7) 0%, rgba(255, 251, 235, 0) 30%),
                  radial-gradient(circle at 75% 75%, rgba(132, 204, 22, 0.85) 0%, rgba(132, 204, 22, 0) 45%),
                  radial-gradient(circle at 25% 80%, rgba(20, 184, 166, 0.85) 0%, rgba(20, 184, 166, 0) 45%),
                  linear-gradient(135deg, #60a5fa 0%, #14b8a6 55%, #84cc16 100%)
                `,
                transform: `scale(${scale})`,
                transition: `transform ${PHASE_MS}ms ease-in-out`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute h-56 w-56 rounded-full mix-blend-overlay opacity-40"
              style={{
                background: `
                  radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.6) 0%, transparent 25%),
                  radial-gradient(circle at 65% 60%, rgba(0, 0, 0, 0.25) 0%, transparent 30%)
                `,
                transform: `scale(${scale})`,
                transition: `transform ${PHASE_MS}ms ease-in-out`,
              }}
            />
            <span
              aria-live="polite"
              className="absolute text-xl font-bold tracking-wide text-white drop-shadow"
            >
              {done ? "Nice." : phase}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-white/70">
              {done ? "All done." : `${seconds}s left`}
            </p>
            {done ? (
              <button
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
                onClick={close}
                type="button"
              >
                Back to home
              </button>
            ) : (
              <p className="max-w-xs text-center text-xs text-white/50">
                In · hold · out · hold. Four seconds each.
              </p>
            )}
          </div>
        </div>

        <div className="safe-bottom" />
      </section>
    </main>
  );
}
