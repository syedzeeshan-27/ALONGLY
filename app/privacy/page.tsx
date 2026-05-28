import Link from "next/link";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · Alongly",
  description:
    "How Alongly handles your information — privately, carefully, and with care for the moments you share.",
};

const CONTACT_EMAIL = "alongly26@gmail.com";

const sections = [
  {
    id: "what-we-collect",
    title: "What we collect",
    paragraphs: [
      "When you create an account, we store your email address and the role you chose — user or companion. We use Supabase for authentication, which issues a secure session token on your device. We do not store passwords in plain text.",
      "Before you are matched, you have a short conversation with an AI assistant. What you share is used to generate three match signals — an experience tag, an intensity signal, and a communication style tag — and a brief companion briefing, a few sentences your companion reads before meeting you. This intake conversation is processed through Anthropic's Claude API. The raw transcript is sent to generate the briefing, then discarded. We do not store your full intake conversation after the briefing is written.",
      "Companions share a short description of what they went through, roughly how long ago it happened, and a support style. This is stored in your companion profile and used only for matching.",
      "Once you are matched with a companion, messages you exchange are stored so both participants can read the conversation. Only the matched user and companion can access a room's messages — this is enforced at the database level with row-level security.",
      "Like most services, we collect basic technical signals — authentication events, error logs, and request metadata. These help us keep the service running. We do not use them for advertising.",
    ],
  },
  {
    id: "what-we-dont-collect",
    title: "What we do not collect",
    paragraphs: [
      "Alongly is not a medical service. We do not collect diagnoses, treatment histories, or medication records. Nothing you share here is a clinical record.",
      "We do not sell your data, build advertising profiles, or share your information with third-party marketers.",
      "Nothing you share on Alongly is posted publicly. Conversations are private by design.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use what we collect",
    paragraphs: [
      "Your experience tag, intensity signal, and style tag are used to find a companion whose lived experience and support style fit your moment. This is the core purpose of the service.",
      "The three-sentence briefing generated from your intake conversation is shared with your matched companion before the chat begins. It exists so you do not have to re-explain yourself from scratch. Your companion cannot see your raw intake messages — only the briefing.",
      "We use your account information to authenticate you, enforce role permissions, and keep the service secure.",
      "In aggregate and anonymised form, we may look at patterns in how the service is used to improve matching quality and the intake experience. We do not use individual conversation content for this.",
    ],
  },
  {
    id: "third-parties",
    title: "Third parties we rely on",
    paragraphs: [
      "We use Supabase for authentication, database storage, and real-time message delivery. Supabase processes data on our behalf and is bound by our data processing terms. Your messages and profile data live in a Supabase-hosted PostgreSQL database.",
      "The intake conversation and briefing are processed by Anthropic's Claude API. Anthropic does not store your conversation data after the API call completes, per their API usage policy. We send only what is necessary for the AI response and briefing generation.",
      "We do not use Google Analytics, Meta Pixel, or any advertising or tracking SDKs. We do not share your data with data brokers.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep things",
    paragraphs: [
      "Your email address and role are kept for as long as your account exists. If you delete your account, your profile is removed.",
      "Your companion profile is kept until you delete it or your account.",
      "Messages in matched rooms are kept until you request deletion. We do not automatically expire them.",
      "The raw transcript of your intake conversation with the AI is not stored after the briefing is generated. Only the briefing and the match tags are persisted.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    paragraphs: [
      `You can request a copy of the data we hold about you, or ask us to delete your account and associated data, by emailing ${CONTACT_EMAIL}. We will respond within 30 days.`,
      "If any information we hold about you is inaccurate, contact us and we will correct it.",
      "You can ask for your data in a portable format. We will provide what we have in a readable form.",
      "Where we process data on the basis of your consent, you can withdraw it at any time. Withdrawing consent does not affect the lawfulness of any processing already done.",
    ],
  },
  {
    id: "crisis",
    title: "A note on crisis situations",
    paragraphs: [
      "Alongly is not emergency care. If you or someone else may be in immediate danger, call local emergency services. In the United States, call or text 988, or chat at 988lifeline.org, to reach the Suicide & Crisis Lifeline. Alongly companions are not trained crisis responders and the service is not a substitute for emergency or clinical care.",
      "Alongly is a peer support product, not a clinical service. Companions are not licensed professionals and are not subject to mandatory reporting obligations in the way therapists are. In exceptional circumstances where there is a clear and serious risk to life, we reserve the right to act in accordance with applicable law.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "If we make material changes to this privacy policy, we will notify you by email or by a notice in the product before the changes take effect. Continued use of Alongly after that point means you accept the updated policy.",
      "This policy was last updated on 28 May 2026.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="landing-surface relative min-h-dvh text-[#22352f]">
      {/* Header */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#d7e8e2] bg-[#d9eee8] text-sm font-bold text-[#24443d] shadow-[0_0_32px_rgba(112,168,157,0.18)] transition group-hover:border-[#9fc9bf]">
            A
          </span>
          <span className="text-base font-semibold text-[#243a34]">Alongly</span>
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
            <Shield aria-hidden="true" size={13} strokeWidth={2.2} />
            Privacy Policy
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#213832] sm:text-4xl">
            What we know about you, and what we do with it.
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-[#64756f]">
            Alongly is built on conversations that happen in quiet, difficult moments. We handle what you share with care. This page explains exactly what we collect, why, and what we don&apos;t do with it.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#7b8b84]">
            <span>Last updated: 28 May 2026</span>
            <span aria-hidden="true">·</span>
            <a
              className="transition hover:text-[#243a34]"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* Body: TOC + Sections side by side on large screens */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-16">

          {/* Sticky TOC */}
          <aside className="mb-10 lg:mb-0">
            <nav
              aria-label="Table of contents"
              className="lg:sticky lg:top-10"
            >
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-widest text-[#a4b0aa]">
                Contents
              </p>
              <ol className="flex flex-col gap-1">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm text-[#65766f] transition hover:bg-[#eef8f5] hover:text-[#243a34]"
                    >
                      <span className="w-5 shrink-0 text-right tabular-nums text-xs text-[#c5d0cb]">
                        {i + 1}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Sections */}
          <div className="flex flex-col gap-14">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-10"
                aria-labelledby={`heading-${section.id}`}
              >
                {/* Section heading with number */}
                <div className="mb-6 flex items-baseline gap-3 border-b border-[#e8f0ec] pb-3">
                  <span className="tabular-nums text-sm text-[#b8c8c2]">{i + 1}.</span>
                  <h2
                    id={`heading-${section.id}`}
                    className="text-lg font-semibold text-[#243a34]"
                  >
                    {section.title}
                  </h2>
                </div>

                {/* Prose — no sub-headings, no bold */}
                <div className="flex flex-col gap-4">
                  {section.paragraphs.map((para, j) => (
                    <p
                      key={j}
                      className="text-[0.9375rem] leading-[1.8] text-[#65766f]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact card */}
            <div className="rounded-2xl border border-[#dce8e2] bg-white/60 px-6 py-5">
              <p className="text-sm text-[#65766f]">
                Questions about this policy?{" "}
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
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl border-t border-[#dce8e2] px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex w-fit items-center gap-3" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9eee8] text-sm font-bold text-[#24443d]">
              A
            </span>
            <span className="text-base font-semibold text-[#243a34]">Alongly</span>
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#7b8b84]">
            <Link className="transition hover:text-[#243a34]" href="/">Home</Link>
            <Link className="transition hover:text-[#243a34]" href="/#how-it-works">How it works</Link>
            <Link className="transition hover:text-[#243a34]" href="/terms">Terms</Link>
            <a className="transition hover:text-[#243a34]" href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
