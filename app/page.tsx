import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  HandHeart,
  Heart,
  MessageCircleHeart,
  NotebookText,
  Shield,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { FaqAccordion } from "@/app/components/faq-accordion";
import { createClient } from "@/lib/supabase/server";
import {
  AnimatedCounter,
  RevealOnScroll,
  StaggerChildren,
} from "@/app/components/landing-animations";

type Step = {
  title: string;
  body: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: "Start with what is true",
    body: "No clinical intake, no performance. Share what is happening in your own words and Alongly shapes enough context to begin gently.",
    Icon: MessageCircleHeart,
  },
  {
    title: "Meet a better-fit person",
    body: "Alongly looks for a real companion whose lived experience and support style match the moment, not just a keyword.",
    Icon: HandHeart,
  },
  {
    title: "Begin without retelling it all",
    body: "Your companion gets a short briefing before the chat, so the conversation can start with care instead of repetition.",
    Icon: NotebookText,
  },
];

const stats = [
  { value: 100, suffix: "%", label: "Human conversations" },
  { value: 3, suffix: " min", label: "Average match time" },
  { value: 0, suffix: "", label: "Bots involved", display: "Zero" },
];

const trustPoints = [
  { Icon: Shield, text: "Private by default" },
  { Icon: Users, text: "Real companions" },
  { Icon: Clock, text: "No waitlists" },
  { Icon: Zap, text: "Free to start" },
];



const faqs = [
  {
    question: "What is Alongly?",
    answer:
      "Alongly is a peer support app for heavy days. It helps you share what is going on, then connects you with a real companion for an honest, unhurried conversation.",
  },
  {
    question: "How are companions selected?",
    answer:
      "Companions share what they have been through and the kind of support style they can offer. Alongly uses that context, your situation, and companion availability to help create a better-fit match.",
  },
  {
    question: "Is Alongly free?",
    answer:
      "Alongly is free to start in this early version. If paid features are introduced later, pricing will be shown clearly before anything is charged.",
  },
  {
    question: "Is it private?",
    answer:
      "Alongly is designed for private one-to-one support, not public posting. Your matched companion can see the short briefing and messages needed for the conversation, so avoid sharing details you would not want another person to know.",
  },
  {
    question: "What happens in a crisis?",
    answer:
      "Alongly is not emergency care. If you or someone else may be in immediate danger, call local emergency services now. In the U.S., call or text 988, or chat at 988lifeline.org, to reach the 988 Suicide & Crisis Lifeline.",
    href: "https://988lifeline.org/",
    linkLabel: "Open 988 Lifeline",
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Compare", href: "#comparison" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "mailto:alongly26@gmail.com", external: true },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "988 Lifeline", href: "https://988lifeline.org/", external: true },
      { label: "Become a companion", href: "/signup?role=companion" },
    ],
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { role } = await getProfileRole(supabase, user.id);
    redirect(roleRedirectPath(role ?? "user"));
  }

  return (
    <main className="landing-surface relative flex min-h-dvh flex-col overflow-hidden text-[#22352f]">
      <header className="hero-animate-1 relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#d7e8e2] bg-[#d9eee8] text-sm font-bold text-[#24443d] shadow-[0_0_32px_rgba(112,168,157,0.18)] transition group-hover:border-[#9fc9bf]">
            A
          </span>
          <span className="text-base font-semibold text-[#243a34]">
            Alongly
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#65766f] transition hover:bg-[#eef7f4] hover:text-[#233832] sm:inline-flex"
            href="#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#65766f] transition hover:bg-[#eef7f4] hover:text-[#233832] sm:inline-flex"
            href="#comparison"
          >
            Compare
          </Link>
          <Link
            className="rounded-md border border-[#d7e8e2] bg-white/80 px-4 py-2 text-sm font-semibold text-[#263a34] transition hover:border-[#9fc9bf] hover:bg-[#f0f8f5]"
            href="/login"
          >
            Log in
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-10 pt-10 sm:px-8 sm:pt-16 lg:min-h-[86svh] lg:px-10 lg:pt-20">
        <div className="hero-animate-2 relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-md border border-[#cfe7df] bg-[#eef8f5] px-3 py-1.5 text-xs font-semibold text-[#4e8b82]">
            <Sparkles aria-hidden="true" size={14} strokeWidth={2.2} />
            Human support for heavy days
          </p>

          <h1 className="mt-7 max-w-5xl text-4xl font-bold tracking-tight text-[#213832] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.15]">
            You don&apos;t need advice. <br className="hidden md:block" />
            You need someone who&apos;s been there.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#64756f] sm:text-lg md:text-xl">
            Alongly connects you with real people who&apos;ve lived through exactly what you&apos;re facing and came out the other side.
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#78afa4] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_60px_rgba(105,159,148,0.22)] transition hover:bg-[#659f94]"
              href="/signup?role=user"
            >
              Find a companion
              <ArrowRight
                aria-hidden="true"
                className="transition group-hover:translate-x-0.5"
                size={17}
                strokeWidth={2.4}
              />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cfded8] bg-white px-5 py-3 text-sm font-bold text-[#314941] transition hover:border-[#9fc9bf] hover:bg-[#f1f8f5]"
              href="/signup?role=companion"
            >
              Become a companion
              <HandHeart aria-hidden="true" size={17} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#7b8b84]">
            {trustPoints.map(({ Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2">
                <Icon aria-hidden="true" size={14} strokeWidth={2} className="text-[#7aa99f]" />
                {text}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-animate-4 relative z-0 mx-auto mt-12 w-full max-w-6xl lg:mt-16">
          <ProductPreview />
        </div>
      </section>



      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="relative z-10 mx-auto flex w-full max-w-6xl scroll-mt-16 flex-col gap-9 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <RevealOnScroll className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-[#5d9b91]">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl"
          >
            Built for the moment before you know what to ask for.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#65766f]">
            The product stays quiet in the background and helps the first human
            minute feel less abrupt.
          </p>
        </RevealOnScroll>

        <StaggerChildren className="relative">
          <ol className="grid">
            {steps.map(({ title, body, Icon }) => (
              <li
                className="stagger-item process-step group relative border-t border-[#dce8e2] py-8 last:border-b"
                key={title}
              >
                <div className="relative z-10 flex items-start gap-4">
                  <span className="process-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#d6e7e0] bg-[#f4faf7] text-[#6da69b] transition group-hover:border-[#9fc9bf]">
                    <Icon aria-hidden="true" size={19} strokeWidth={2.1} />
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight text-[#243a34]">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#65766f] sm:text-base">
                      {body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </StaggerChildren>
      </section>

      <section
        id="comparison"
        aria-labelledby="comparison-heading"
        className="relative z-10 mx-auto flex w-full max-w-6xl scroll-mt-16 flex-col gap-9 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <RevealOnScroll className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold text-[#5d9b91]">
            Why Alongly
          </p>
          <h2
            id="comparison-heading"
            className="text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl"
          >
            Different care for different moments.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[#65766f]">
            Alongly is not trying to be therapy, meditation, or self-help
            exercises. It is a quieter bridge to a real person.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Real human conversation",
              description: "Not an AI bot or a scripted flow. You connect with a real person who can actually understand.",
              icon: MessageCircleHeart,
            },
            {
              title: "Matched lived experience",
              description: "You are paired with someone who has been close to the shape of your situation, not just an anonymous listener.",
              icon: HandHeart,
            },
            {
              title: "Context before the chat",
              description: "Your companion gets a brief so you don't have to restart from zero and exhaust yourself explaining it all again.",
              icon: NotebookText,
            },
            {
              title: "Low-friction support",
              description: "Built for heavy days. No lengthy clinical intake or waiting weeks for formal care.",
              icon: Zap,
            },
            {
              title: "No clinical diagnosis",
              description: "A space for human connection, not therapy, medication, or medical advice.",
              icon: Shield,
            },
            {
              title: "The right fit for the moment",
              description: "When you just need a real person who gets it, rather than guided meditation or self-help exercises.",
              icon: Heart,
            },
          ].map((diff) => (
            <article
              key={diff.title}
              className="group relative flex flex-col rounded-2xl border border-[#dce8e2] bg-white p-6 shadow-sm transition-all hover:border-[#9fc9bf] hover:shadow-md hover:shadow-[#70a89d]/10"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f8f5] text-[#5d9b91] transition-colors group-hover:bg-[#e4f2ee] group-hover:text-[#4e8b82]">
                <diff.icon size={24} strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#243a34]">
                {diff.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#65766f]">
                {diff.description}
              </p>
            </article>
          ))}
        </RevealOnScroll>

        <p className="max-w-2xl text-sm leading-6 text-[#7b8b84]">
          Alongly is peer support, not a replacement for licensed therapy,
          diagnosis, medication, or emergency care.
        </p>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="relative z-10 mx-auto flex w-full max-w-6xl scroll-mt-16 flex-col gap-9 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <RevealOnScroll className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-[#5d9b91]">FAQ</p>
          <h2
            id="faq-heading"
            className="text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl"
          >
            A few things people ask first.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll>
          <FaqAccordion faqs={faqs} />
        </RevealOnScroll>
      </section>

      <RevealOnScroll className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <section className="landing-band rounded-lg border border-[#dce8e2] px-6 py-10 text-center sm:px-10 sm:py-14">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl">
              Find the first person who can meet you there.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#65766f]">
              No scripts. No bots. Just a clearer path to a real conversation.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#78afa4] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#659f94]"
                href="/signup?role=user"
              >
                Find a companion
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2.4} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#cfded8] bg-white/70 px-5 py-3 text-sm font-bold text-[#314941] transition hover:bg-[#f1f8f5]"
                href="/signup?role=companion"
              >
                Become a companion
              </Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <footer className="relative z-10 mx-auto mt-8 w-full max-w-6xl border-t border-[#dce8e2] px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link className="flex w-fit items-center gap-3" href="/">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9eee8] text-sm font-bold text-[#24443d]">
                A
              </span>
              <span className="text-lg font-semibold text-[#243a34]">
                Alongly
              </span>
            </Link>
            <p className="max-w-md text-sm leading-7 text-[#65766f]">
              A softer way to be heard. Private by default, gentle in tone, and
              built for moments when a real person matters.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-7 sm:grid-cols-3"
          >
            {footerLinks.map((group) => (
              <div className="flex flex-col gap-3" key={group.title}>
                <h2 className="text-sm font-semibold text-[#374b44]">
                  {group.title}
                </h2>
                <ul className="grid gap-2 text-sm text-[#65766f]">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          className="transition hover:text-[#243a34]"
                          href={link.href}
                          {...(link.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          className="transition hover:text-[#243a34]"
                          href={link.href}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#dce8e2] pt-6 text-sm text-[#7b8b84] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Alongly. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            Made with
            <Heart
              aria-hidden="true"
              className="fill-[#d9947d] text-[#d9947d]"
              size={14}
              strokeWidth={2.4}
            />
            for quiet minds.
          </p>
        </div>
      </footer>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="hero-product relative overflow-hidden rounded-lg border border-[#dce8e2] bg-white shadow-[0_28px_80px_rgba(81,114,105,0.16)]">
      <div className="flex items-center justify-between border-b border-[#e2ece7] bg-[#f8fbf9] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d9947d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#78afa4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#b8c8c2]" />
        </div>
        <p className="hidden text-xs text-[#7b8b84] sm:block">
          Briefing prepared 2 minutes ago
        </p>
      </div>

      <div className="grid min-h-[28rem] md:grid-cols-[14rem_1fr] lg:grid-cols-[15rem_1fr_17rem]">
        <aside className="hidden border-r border-[#e2ece7] bg-[#f4f8f5] p-4 md:block">
          <p className="mb-4 text-sm font-semibold text-[#243a34]">Alongly</p>
          <div className="grid gap-2">
            {["Today", "Briefings", "Matches", "Sessions"].map((item, index) => (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  index === 0
                    ? "bg-[#e5f2ee] text-[#4f8f84]"
                    : "text-[#6e7e78]"
                }`}
                key={item}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-[#dce8e2] bg-white p-3">
            <p className="text-xs text-[#7b8b84]">Companion match</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e5f2ee] text-sm font-semibold text-[#4f8f84]">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-[#243a34]">Mara</p>
                <p className="text-xs text-[#6e7e78]">Available now</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5d9b91]">Live room</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#243a34]">
                Start where the day actually is.
              </h2>
            </div>
            <span className="w-fit rounded-md border border-[#c6ddd5] bg-[#eef8f4] px-3 py-1.5 text-xs font-semibold text-[#4f8f84]">
              Matched
            </span>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-[#dce8e2] bg-[#fbfdfc] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#374b44]">
                  Companion briefing
                </p>
                <span className="text-xs text-[#7b8b84]">3 notes</span>
              </div>
              <div className="grid gap-2 text-sm leading-6 text-[#65766f]">
                <p>Feels exhausted after carrying a family conflict alone.</p>
                <p>Needs steadiness first, advice later.</p>
                <p>Prefers direct language and room to pause.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_0.82fr]">
              <div className="rounded-lg border border-[#c6ddd5] bg-[#eef8f4] p-4">
                <p className="text-xs font-semibold text-[#4f8f84]">You</p>
                <p className="mt-2 text-sm leading-6 text-[#374b44]">
                  I do not need a solution yet. I just need someone who will not
                  make me explain why this feels big.
                </p>
              </div>
              <div className="rounded-lg border border-[#dce8e2] bg-white p-4">
                <p className="text-xs font-semibold text-[#6f8fbd]">Mara</p>
                <p className="mt-2 text-sm leading-6 text-[#374b44]">
                  That makes sense. We can stay with the weight of it before we
                  try to name what comes next.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-[#e2ece7] bg-[#f4f8f5] p-4 lg:block">
          <div className="rounded-lg border border-[#dce8e2] bg-white p-4">
            <p className="text-xs text-[#7b8b84]">Match signal</p>
            <p className="mt-2 text-4xl font-semibold text-[#243a34]">92%</p>
            <p className="mt-2 text-sm leading-6 text-[#65766f]">
              Shared context, support style, and current availability.
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            {["Lived experience", "Gentle directness", "Can hold pauses"].map(
              (item) => (
                <div
                  className="flex items-center gap-2 rounded-md border border-[#dce8e2] bg-white px-3 py-2 text-sm text-[#374b44]"
                  key={item}
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2.6}
                    className="text-[#5d9b91]"
                  />
                  {item}
                </div>
              ),
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}


