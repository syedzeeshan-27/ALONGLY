import Link from "next/link";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

import { BrandWordmark } from "@/app/components/brand-logo";

export const metadata: Metadata = {
  title: "Terms of Use · Alongly",
  description:
    "The terms that apply when you use Alongly — plain language, honestly written.",
};

const CONTACT_EMAIL = "alongly26@gmail.com";

const sections = [
  {
    id: "what-alongly-is",
    title: "What Alongly is",
    paragraphs: [
      "Alongly is a peer support platform. It connects people who are going through something difficult with real people who have been through something similar and came out the other side. It is not a clinical service, a therapy platform, or a replacement for professional mental health care.",
      "Using Alongly means you understand and accept that distinction. Companions are not licensed therapists, counsellors, or medical professionals. Conversations on Alongly are human and supportive — not clinical.",
    ],
  },
  {
    id: "who-can-use-alongly",
    title: "Who can use Alongly",
    paragraphs: [
      "You must be at least 18 years old to create an account. By signing up, you confirm that you meet this requirement.",
      "Alongly is currently available to users in an early version. Access may be limited by region, capacity, or eligibility, and we may change this at any time.",
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    paragraphs: [
      "You are responsible for keeping your account credentials secure. Do not share your password or session with anyone else.",
      "You may only have one account. Creating duplicate accounts to circumvent limits or bans is not allowed.",
      "You must provide accurate information when you sign up. We may suspend accounts where we have reason to believe the information is false or misleading.",
    ],
  },
  {
    id: "companions",
    title: "If you are a companion",
    paragraphs: [
      "By signing up as a companion, you confirm that what you share about your lived experience is honest and accurate. Misrepresenting your background to gain access to users is a serious violation of these terms.",
      "You agree to engage with users with care, respect, and honesty. Companions are not here to give advice, diagnose, or direct users toward specific decisions — you are here to listen and be present.",
      "You may end a conversation at any time if you are not comfortable continuing. We will never penalise you for setting a boundary.",
      "You must not use your companion role to market, sell, or promote any product or service to users.",
    ],
  },
  {
    id: "what-you-can-and-cant-do",
    title: "What you can and cannot do",
    paragraphs: [
      "You can use Alongly to find support, connect with a companion, and have honest conversations about what you are going through.",
      "You cannot use Alongly to harass, threaten, or harm others. You cannot impersonate someone else, share another person's private information, or use the platform for any illegal purpose.",
      "You cannot use Alongly to recruit users to other platforms, promote services, solicit payments outside the platform, or engage in any commercial activity.",
      "You cannot attempt to access parts of the service you are not authorised for — for example, a user trying to access the companion dashboard, or vice versa.",
    ],
  },
  {
    id: "content-you-share",
    title: "Content you share",
    paragraphs: [
      "You own what you share. By using Alongly, you give us a limited licence to store and display your messages to the other participant in your matched conversation — nothing more.",
      "We do not use your conversation content for advertising, model training, or any purpose beyond running the service.",
      "Do not share information that could identify or expose another person without their consent. Do not share content that is violent, threatening, discriminatory, or illegal.",
    ],
  },
  {
    id: "crisis-and-safety",
    title: "Crisis and safety",
    paragraphs: [
      "Alongly is not an emergency service. If you or someone else is in immediate danger, stop and call your local emergency services now — in India, dial 112.",
      "If we become aware of a situation where there is a clear and serious risk to life, we reserve the right to act in accordance with applicable law, including contacting emergency services.",
    ],
  },
  {
    id: "availability",
    title: "Availability and changes",
    paragraphs: [
      "Alongly is in an early version. We may change, pause, or discontinue features or access at any time, with or without notice. We will try to give you reasonable notice of significant changes.",
      "We do not guarantee that the service will be available at any particular time or without interruption. We are not liable for any loss or inconvenience caused by downtime.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    paragraphs: [
      "Alongly is provided as-is. To the fullest extent permitted by law, we make no warranties about the service — express or implied.",
      "We are not liable for the content of conversations between users and companions. Companions are independent participants, not employees or agents of Alongly.",
      "We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.",
      "Nothing in these terms limits liability for death, personal injury caused by our negligence, or fraud.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    paragraphs: [
      "You can delete your account at any time by contacting us at the email below.",
      "We may suspend or terminate your account if we believe you have violated these terms, without prior notice. We will try to explain why where we are able to.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    paragraphs: [
      "These terms are governed by and interpreted in accordance with applicable law. If any provision of these terms is found to be unenforceable, the rest remain in effect.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. If we make material changes, we will notify you by email or through a notice in the product before they take effect.",
      "Continued use of Alongly after the effective date means you accept the updated terms.",
      "These terms were last updated on 28 May 2026.",
    ],
  },
];

export default function TermsPage() {
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
            <FileText aria-hidden="true" size={13} strokeWidth={2.2} />
            Terms of Use
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#213832] sm:text-4xl">
            The rules. Plain language, honestly written.
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-[#64756f]">
            These terms explain what Alongly is, what you can expect from it, and what we expect from you. They are written to be read, not buried.
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
                <div className="mb-6 flex items-baseline gap-3 border-b border-[#e8f0ec] pb-3">
                  <span className="tabular-nums text-sm text-[#b8c8c2]">{i + 1}.</span>
                  <h2
                    id={`heading-${section.id}`}
                    className="text-lg font-semibold text-[#243a34]"
                  >
                    {section.title}
                  </h2>
                </div>

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
                Questions about these terms?{" "}
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
