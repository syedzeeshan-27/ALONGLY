import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Clock,
  HandHeart,
  Heart,
  MessageCircleHeart,
  NotebookText,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { getProfileRole, roleRedirectPath } from "@/lib/auth";
import { FaqAccordion } from "@/app/components/faq-accordion";
import { createClient } from "@/lib/supabase/server";
import {
  RevealOnScroll,
} from "@/app/components/landing-animations";
import { BrandWordmark } from "@/app/components/brand-logo";

const howItWorksSteps = [
  {
    Icon: MessageCircleHeart,
    step: "01",
    detail: "2 minutes",
    title: "Answer 5 questions",
    body: "Share the shape of the day without filling out a long intake.",
  },
  {
    Icon: Sparkles,
    step: "02",
    detail: "~3 min",
    title: "Get matched in ~3 min",
    body: "Alongly turns your answers into context and finds a real companion.",
  },
  {
    Icon: HandHeart,
    step: "03",
    detail: "No recap",
    title: "Start without re-explaining",
    body: "Your companion sees the brief first, so the chat begins with care.",
  },
];

const trustPoints = [
  { Icon: Shield, text: "Private by default" },
  { Icon: Users, text: "Real companions" },
  { Icon: Clock, text: "No waitlists" },
  { Icon: Zap, text: "Free to start" },
];

const whyAlonglyCards = [
  {
    Icon: MessageCircleHeart,
    title: "Real experience, not training.",
    body: "Your companion isn't certified. They've just been there.",
  },
  {
    Icon: NotebookText,
    title: "No pressure to perform your pain.",
    body: "You don't have to explain why it feels big. It just does.",
  },
  {
    Icon: HandHeart,
    title: "A bridge, not a destination.",
    body: "Not therapy, not a hotline. Just a real person for the moment you're in.",
  },
];



const faqs = [
  {
    question: "What is Alongly?",
    answer:
      "Alongly is a peer support app for heavy days. It helps you share what is going on, then connects you with a real companion for an honest, unhurried conversation.",
  },
  {
    question: "Do I need to log in to Jitsi for the voice call?",
    answer:
      "Yes. Alongly's voice calls run through a private Jitsi meeting room, and both the user and the companion need to be signed in to Jitsi before the call will connect. Text chat works without it — Jitsi sign-in only matters when one of you wants to switch to voice. If a call won't start, the most common reason is that one side hasn't completed the Jitsi login yet.",
  },
  {
    question: "How long does a typical conversation last?",
    answer:
      "There's no timer. Most first conversations settle into roughly 30 to 60 minutes, but some are shorter and some run longer. You and your companion decide together when it feels like a natural place to pause.",
  },
  {
    question: "What happens after the AI briefing is ready?",
    answer:
      "You and your companion enter the same private room. Your companion sees a short brief first, so the conversation can start with context instead of a full recap.",
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

const landingXPadding = "px-5 sm:px-8 lg:px-10";
const landingSectionGap = "mt-16 sm:mt-20 lg:mt-24";
const landingSectionShell = `relative z-10 mx-auto flex w-full max-w-6xl scroll-mt-16 flex-col ${landingXPadding}`;

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
      <header
        className={`hero-animate-1 relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between py-5 ${landingXPadding}`}
      >
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
            href="#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#65766f] transition hover:bg-[#eef7f4] hover:text-[#233832] sm:inline-flex"
            href="#comparison"
          >
            Why Alongly
          </Link>
          <Link
            className="rounded-md border border-[#d7e8e2] bg-white/80 px-4 py-2 text-sm font-semibold text-[#263a34] transition hover:border-[#9fc9bf] hover:bg-[#f0f8f5]"
            href="/login"
          >
            Log in
          </Link>
        </nav>
      </header>

      <section
        className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col pt-14 sm:pt-20 lg:pt-16 ${landingXPadding}`}
      >
        <div className="hero-animate-2 relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-md border border-[#cfe7df] bg-[#eef8f5] px-3 py-1.5 text-xs font-semibold text-[#4e8b82]">
            <Sparkles aria-hidden="true" size={14} strokeWidth={2.2} />
            Human support for heavy days
          </p>

          <h1 className="mt-9 max-w-5xl text-4xl font-bold tracking-tight text-[#213832] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.15]">
            You don&apos;t need advice. <br className="hidden md:block" />
            You need someone who&apos;s been there.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#64756f] sm:text-lg md:text-xl">
            Alongly connects you with real people who&apos;ve lived through exactly what you&apos;re facing and came out the other side.
          </p>

          <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#7b8b84]">
            {trustPoints.map(({ Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2">
                <Icon aria-hidden="true" size={14} strokeWidth={2} className="text-[#7aa99f]" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>



      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className={`${landingSectionShell} ${landingSectionGap} gap-12`}
      >
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#cfe7df] bg-[#eef8f5] px-3 py-1.5 text-sm font-semibold text-[#5d9b91]">
            <Zap aria-hidden="true" size={15} strokeWidth={2.3} />
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl"
          >
            Three steps to someone who gets it.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#65766f]">
            A simple path from a hard moment to a real conversation.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <ol className="grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map(({ Icon, step, detail, title, body }) => (
              <li
                className="group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-lg border border-[#dce8e2] bg-white p-6 shadow-[0_18px_55px_rgba(80,116,107,0.08)] transition hover:-translate-y-1 hover:border-[#a9d0c6] hover:shadow-[0_26px_70px_rgba(80,116,107,0.14)]"
                key={step}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#eef8f5] text-[#5d9b91] ring-1 ring-[#cbe6df] transition group-hover:bg-[#5d9b91] group-hover:text-white">
                    <Icon aria-hidden="true" size={21} strokeWidth={2.3} />
                  </span>
                  <span className="rounded-md border border-[#f1d5c6] bg-[#fff6f1] px-3 py-1.5 text-xs font-bold text-[#b36c52]">
                    {detail}
                  </span>
                </div>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b9a94]">
                  Step {step}
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-7 text-[#243a34]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#65766f]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <p className="text-sm font-medium text-[#65766f]">
              Talk to someone who gets it.
            </p>
            <Link
              href="/signup?role=user"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#78afa4] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#659f94]"
            >
              Find a companion
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      <section
        id="comparison"
        aria-labelledby="comparison-heading"
        className={`relative z-10 scroll-mt-16 border-y border-[#dbe9e3] bg-[#eef7f3] ${landingSectionGap}`}
      >
        <div
          className={`mx-auto flex w-full max-w-6xl flex-col gap-10 py-16 sm:py-20 lg:py-24 ${landingXPadding}`}
        >
          <RevealOnScroll className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-md border border-[#cfe7df] bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#5d9b91]">
              <Shield aria-hidden="true" size={15} strokeWidth={2.3} />
              Why Alongly
            </p>
            <h2
              id="comparison-heading"
              className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[#243a34] sm:text-4xl"
            >
              Different care for different moments.
            </h2>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="grid gap-4 md:grid-cols-3">
              {whyAlonglyCards.map(({ Icon, title, body }) => (
                <article
                  key={title}
                  className="flex h-full flex-col rounded-lg border border-[#d5e6df] bg-white/85 p-6 shadow-[0_18px_55px_rgba(80,116,107,0.08)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#c7e0d7] bg-[#f5fbf8] text-[#639d92]">
                    <Icon aria-hidden="true" size={19} strokeWidth={2.2} />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold leading-7 text-[#243a34]">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#5f716a]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="mx-auto max-w-2xl text-center">
            <p className="text-sm leading-6 text-[#6f827a]">
              Alongly is peer support, not a replacement for licensed therapy,
              diagnosis, medication, or emergency care.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className={`${landingSectionShell} ${landingSectionGap} gap-9`}
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

      <RevealOnScroll
        className={`relative z-10 mx-auto w-full max-w-6xl ${landingSectionGap} ${landingXPadding}`}
      >
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

      <footer
        className={`relative z-10 mx-auto w-full max-w-6xl border-t border-[#dce8e2] py-12 sm:py-14 ${landingSectionGap} ${landingXPadding}`}
      >
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link className="flex w-fit items-center" href="/">
              <BrandWordmark className="h-9 w-auto" sizes="140px" />
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
