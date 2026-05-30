import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { BrandWordmark } from "@/app/components/brand-logo";

export const metadata: Metadata = {
  title: "Changelog · Alongly",
  description:
    "Alongly is being built in public. Here's what we've shipped so far.",
};

const CONTACT_EMAIL = "alongly26@gmail.com";

type ChangelogEntry = {
  date: string;
  tag: string;
  items: string[];
};

const entries: ChangelogEntry[] = [
  {
    date: "30 May 2026",
    tag: "Latest",
    items: [
      "Companion dashboard with live alert notifications.",
      "All three companion styles (Asha, Noor, Rey) now route to one room.",
      "Removed pilot/demo language from the landing page.",
      "Cleaned up landing page copy across the hero and Why Alongly section.",
    ],
  },
  {
    date: "23 May 2026",
    tag: "MVP",
    items: [
      "Initial MVP launched: user intake → AI matching → live chat room.",
      "Voice call support via Jitsi.",
      "Supabase realtime messaging.",
      "Companion dashboard, first version.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="landing-surface relative min-h-dvh text-[#22352f]">
      {/* Header */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center">
          <BrandWordmark
            className="h-10 w-auto transition group-hover:opacity-85"
            priority
            sizes="150px"
          />
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#65766f] transition hover:bg-[#eef7f4] hover:text-[#233832] sm:inline-flex"
            href="/"
          >
            Home
          </Link>
          <Link
            className="rounded-md border border-[#d7e8e2] bg-white/80 px-4 py-2 text-sm font-semibold text-[#263a34] transition hover:border-[#9fc9bf] hover:bg-[#f0f8f5]"
            href="/login"
          >
            Log in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cfe7df] bg-[#eef8f5] px-3 py-1.5 text-xs font-semibold text-[#4e8b82]">
            <Sparkles aria-hidden="true" size={13} strokeWidth={2.2} />
            Changelog
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#213832] sm:text-4xl">
            What we&apos;ve shipped
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-[#64756f]">
            Alongly is being built in public. Here&apos;s what&apos;s changed.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8 lg:px-10">
        <ol className="flex flex-col">
          {entries.map((entry) => (
            <li
              key={entry.date}
              className="relative grid gap-4 border-l border-[#dce8e2] pb-14 pl-8 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-8 sm:pl-10"
            >
              {/* Timeline dot */}
              <span
                aria-hidden="true"
                className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border-2 border-[#78afa4] bg-[#eef8f5]"
              />

              {/* Date + tag */}
              <div className="flex flex-col gap-2 sm:text-right">
                <span className="text-sm font-semibold text-[#243a34]">
                  {entry.date}
                </span>
                <span className="w-fit rounded-full border border-[#cfe7df] bg-[#eef8f5] px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#5d9b91] sm:self-end">
                  {entry.tag}
                </span>
              </div>

              {/* Items */}
              <ul className="flex flex-col gap-3">
                {entry.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-[#65766f]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9fc9bf]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* Footer note */}
        <div className="mt-4 rounded-2xl border border-[#dce8e2] bg-white/60 px-6 py-5">
          <p className="text-sm text-[#65766f]">
            Have an idea or spotted something off?{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[#5d9b91] underline underline-offset-2 transition hover:text-[#4e8b82]"
            >
              {CONTACT_EMAIL}
            </a>
            {" "}— we read every email.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl border-t border-[#dce8e2] px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex w-fit items-center" href="/">
            <BrandWordmark className="h-9 w-auto" sizes="140px" />
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#7b8b84]">
            <Link className="transition hover:text-[#243a34]" href="/">Home</Link>
            <Link className="transition hover:text-[#243a34]" href="/#how-it-works">How it works</Link>
            <Link className="transition hover:text-[#243a34]" href="/privacy">Privacy</Link>
            <a className="transition hover:text-[#243a34]" href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
