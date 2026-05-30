"use client";

import Link from "next/link";
import { ArrowLeft, AudioLines, History, MessageSquareText } from "lucide-react";

export type UserSessionRow = {
  id: string;
  companion_briefing: string | null;
  created_at: string;
  experience_tag: string;
  intensity_tag: string;
  style_tag: string;
  voice_room_url: string | null;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function tagText(value: string) {
  return value.trim().length ? value.replaceAll("_", " ") : "unspecified";
}

function buildSummary(session: UserSessionRow) {
  const deliveryLine = session.voice_room_url
    ? "You also moved into voice for at least part of this session."
    : "This session stayed in text.";

  if (session.companion_briefing?.trim()) {
    return `${session.companion_briefing.trim()} ${deliveryLine}`;
  }

  return `You came in carrying ${tagText(session.experience_tag)}. The conversation was tagged ${tagText(session.intensity_tag)} and paced for someone who ${tagText(session.style_tag)}. ${deliveryLine}`;
}

export function UserSessionsClient({
  sessions,
}: {
  sessions: UserSessionRow[];
}) {
  if (sessions.length === 0) {
    return (
      <section className="mobile-scroll flex h-full flex-col gap-5 overflow-y-auto px-5 py-6">
        <div className="flex items-start gap-3 rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-stone-100 text-stone-500">
            <History aria-hidden="true" size={22} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-stone-950">No sessions yet</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Once you finish a conversation, it will show up here with a quick recap instead of disappearing.
            </p>
          </div>
        </div>

        <Link
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          href="/you"
        >
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.2} />
          Back to You
        </Link>
      </section>
    );
  }

  return (
    <section className="mobile-scroll flex h-full flex-col gap-5 overflow-y-auto px-5 py-6">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/90 to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Session trail
        </p>
        <h2 className="mt-1 text-2xl font-bold text-stone-950">
          {sessions.length === 1
            ? "1 completed session"
            : `${sessions.length} completed sessions`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Each card keeps a compact breadcrumb from that conversation so your progress does not keep resetting.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {sessions.map((session, index) => (
          <li
            className="rounded-3xl border border-orange-100 bg-white/85 p-5 shadow-sm"
            key={session.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  {index === 0 ? "Most recent session" : "Past session"}
                </p>
                <p className="mt-1 text-base font-bold text-stone-950">
                  {formatDate(session.created_at)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  session.voice_room_url
                    ? "bg-teal-50 text-teal-700"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {session.voice_room_url ? (
                  <AudioLines aria-hidden="true" size={14} strokeWidth={2.2} />
                ) : (
                  <MessageSquareText
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2.2}
                  />
                )}
                {session.voice_room_url ? "Voice used" : "Text only"}
              </span>
            </div>

            <p className="mt-4 text-[0.98rem] leading-7 text-stone-700">
              {buildSummary(session)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-600">
                {tagText(session.experience_tag)}
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-600">
                {tagText(session.intensity_tag)}
              </span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-700">
                {tagText(session.style_tag)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <Link
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50"
        href="/you"
      >
        <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.2} />
        Back to You
      </Link>
    </section>
  );
}
