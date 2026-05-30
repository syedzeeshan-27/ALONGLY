import {
  BellRing,
  HandHeart,
  HeartHandshake,
  History,
  MessageCircleHeart,
  NotebookText,
  type LucideIcon,
} from "lucide-react";

type WhyAlonglyCard = {
  Icon: LucideIcon;
  title: string;
  body: string;
  badge?: string;
};

const whyAlonglyCards: WhyAlonglyCard[] = [
  {
    Icon: MessageCircleHeart,
    title: "Someone who's actually been there.",
    body: "Not a trained professional. Someone who lived through what you're facing and came out the other side.",
  },
  {
    Icon: NotebookText,
    title: "Say as little or as much as you need.",
    body: "You don't have to explain why it hurts. They already understand that part.",
  },
  {
    Icon: HandHeart,
    title: "A bridge, not a destination.",
    body: "Not therapy, not a hotline. Just a real person for the moment you're in.",
  },
  {
    Icon: HeartHandshake,
    title: "Pick up where you left off.",
    body: "Save the parts of your story you're tired of repeating. Support starts closer to the truth, every time.",
  },
  {
    Icon: NotebookText,
    title: "Hold onto what matters right now.",
    body: "Life keeps changing. Pin the chapter you're in so you never have to reintroduce yourself.",
  },
  {
    Icon: History,
    title: "Every conversation leaves something behind.",
    body: "Completed sessions become a quiet record - recaps, tags, and a reminder you kept showing up.",
  },
  {
    Icon: BellRing,
    title: "Reach them when courage shows up.",
    body: "See when someone is actually available, so the moment you're ready doesn't go to waste.",
  },
];

// Two copies of the cards make the track loop seamlessly: the animation
// translates the row by exactly one copy's width, so the duplicate slides
// into the spot the original just left without any visible gap or jump.
const marqueeCards = [...whyAlonglyCards, ...whyAlonglyCards];

export function WhyAlonglyMarquee() {
  return (
    <div className="why-marquee group" role="region" aria-label="Why Alongly">
      <div className="why-marquee-track">
        {marqueeCards.map(({ Icon, title, body, badge }, index) => (
          <article
            key={index}
            aria-hidden={index >= whyAlonglyCards.length}
            className="why-card why-marquee-card flex flex-col rounded-lg border border-[#d5e6df] bg-white/85 p-6 shadow-[0_18px_55px_rgba(80,116,107,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="why-card-icon grid h-10 w-10 place-items-center rounded-lg border border-[#c7e0d7] bg-[#f5fbf8] text-[#639d92]">
                <Icon aria-hidden="true" size={19} strokeWidth={2.2} />
              </span>
              {badge ? (
                <span className="rounded-full border border-[#f1d9cc] bg-[#fff7f2] px-3 py-1 text-xs font-semibold text-[#a56b52]">
                  {badge}
                </span>
              ) : null}
            </div>
            <h3 className="mt-6 text-xl font-semibold leading-7 text-[#243a34]">
              {title}
            </h3>
            <p className="mt-3 text-base leading-7 text-[#5f716a]">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
