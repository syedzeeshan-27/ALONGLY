"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";

type Profile = {
  name: string;
  initials: string;
  vibe: string;
  focus: string;
  style: string;
  accent: string;
};

const ADVANCE_MS = 4200;
const EXIT_MS = 470;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SWIPE_THRESHOLD = 78;

// The card face itself — identical content/design to the original markup.
// `elevated` only brightens the surface + deepens the shadow for the active card.
function CompanionCard({
  profile,
  elevated,
}: {
  profile: Profile;
  elevated: boolean;
}) {
  return (
    <article
      className={`flex h-full min-h-[29rem] flex-col rounded-[1.75rem] border p-5 transition-[box-shadow,border-color,background-color] duration-700 ease-out ${
        elevated
          ? "border-[#c2e1d7] bg-white shadow-[0_34px_90px_rgba(80,116,107,0.2)]"
          : "border-[#d7e8e2] bg-[#fcfffd] shadow-[0_18px_55px_rgba(80,116,107,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-base font-bold text-[#2f4740] ${profile.accent}`}
        >
          {profile.initials}
        </div>
        <span className="rounded-full border border-[#d4e6df] bg-[#f4fbf8] px-3 py-1 text-xs font-semibold text-[#5d9b91]">
          Demo profile
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl font-semibold text-[#243a34]">{profile.name}</h3>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#7d8f88]">
          {profile.vibe}
        </p>
        <p className="mt-4 text-sm leading-7 text-[#5f716a]">{profile.focus}</p>
        <p className="mt-3 text-sm leading-7 text-[#5f716a]">{profile.style}</p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3eeea] bg-[#f7fbf9] px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8f88]">
                Availability
              </p>
              <p className="mt-1 text-sm font-medium text-[#314941]">
                Routes to the founding live queue
              </p>
            </div>
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#78afa4]" />
          </div>

          <Link
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#edf7f4] px-4 py-2.5 text-sm font-semibold text-[#2f5b51] transition hover:bg-[#deefe9]"
            href="/signup?role=user"
          >
            Talk to this style
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CompanionShowcase({
  profiles,
}: {
  profiles: readonly Profile[];
}) {
  const n = profiles.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [drag, setDrag] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const startYRef = useRef(0);
  const exitTimer = useRef<number | null>(null);

  const desktopActive = hovered ?? active;

  // Advance to the next card. On mobile this plays the front card's swipe-up
  // exit first, then promotes the next card once it has cleared.
  const advance = useCallback(() => {
    if (exitTimer.current !== null) return;
    setExiting(true);
    exitTimer.current = window.setTimeout(() => {
      setActive((a) => (a + 1) % n);
      setDrag(0);
      setExiting(false);
      exitTimer.current = null;
    }, EXIT_MS);
  }, [n]);

  useEffect(() => {
    return () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    };
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setReduce(motion.matches);
      setIsDesktop(wide.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  // Auto-rotate the active highlight on desktop only. On mobile the deck stays
  // still so the card can be read and tapped — it advances only on swipe.
  useEffect(() => {
    if (reduce || !isDesktop || hovered !== null || dragging) return;
    const id = window.setInterval(advance, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduce, isDesktop, hovered, dragging]);

  const jumpTo = (i: number) => {
    if (exitTimer.current !== null || i === active) return;
    setExiting(false);
    setDrag(0);
    setActive(i);
  };

  // ── Mobile touch (swipe up to advance) ──
  const onTouchStart = (e: React.TouchEvent) => {
    if (exitTimer.current !== null) return;
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startYRef.current;
    // Follow the finger upward; resist downward pulls.
    setDrag(Math.max(-220, Math.min(24, dy)));
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (drag < -SWIPE_THRESHOLD) advance();
    else setDrag(0);
  };

  return (
    <>
      {/* ── Desktop: live-selection row ── */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {profiles.map((profile, i) => {
          const isActive = desktopActive === i;
          const style: CSSProperties = reduce
            ? {}
            : {
                transform: `scale(${isActive ? 1.035 : 0.955})`,
                opacity: isActive ? 1 : 0.68,
                filter: isActive ? "none" : "saturate(0.92)",
                zIndex: isActive ? 2 : 1,
              };
          return (
            <div
              key={profile.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="transform-gpu transition-[transform,opacity,filter] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={style}
            >
              <CompanionCard profile={profile} elevated={isActive && !reduce} />
            </div>
          );
        })}
      </div>

      {/* ── Mobile: swipe-up story deck ── */}
      <div className="lg:hidden">
        <div
          className="relative h-[31rem] [perspective:1200px]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {profiles.map((profile, i) => {
            const pos = (i - active + n) % n;
            const isFront = pos === 0;
            const isBack = pos === n - 1;

            let style: CSSProperties;
            if (isFront && exiting) {
              // Swipe up + slight tilt + fade out.
              style = {
                transform: "translateY(-128%) rotate(-5deg) scale(0.95)",
                opacity: 0,
                zIndex: 40,
                transition: `transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${EXIT_MS}ms ease`,
              };
            } else if (isFront) {
              const d = dragging ? drag : 0;
              style = {
                transform: `translateY(${d}px) rotate(${d * 0.02}deg)`,
                opacity: 1,
                zIndex: 40,
                transition: dragging
                  ? "none"
                  : `transform 540ms ${EASE}, opacity 540ms ease`,
              };
            } else {
              // Cards stacked behind, peeking as a thin lip above the front card
              // so it clearly reads as a deck. Only the immediate next card shows.
              const depth = pos;
              style = {
                transform: `translateY(${-depth * 14}px) scale(${1 - depth * 0.05})`,
                opacity: depth >= 2 ? 0 : reduce ? 1 : 0.6,
                zIndex: 40 - depth,
                // Back-most card snaps (no transition) so the exited card can
                // reappear at the bottom of the stack without sliding through.
                transition: isBack
                  ? "none"
                  : `transform 540ms ${EASE}, opacity 540ms ease`,
              };
            }

            return (
              <div
                key={profile.name}
                className="absolute inset-0 transform-gpu will-change-transform"
                style={style}
              >
                <CompanionCard profile={profile} elevated={isFront} />
              </div>
            );
          })}
        </div>

        {/* Swipe affordance */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-[#7d958c]">
          <ChevronUp
            aria-hidden="true"
            size={15}
            strokeWidth={2.4}
            className="companion-swipe-hint"
          />
          Swipe up for the next style
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {profiles.map((profile, i) => {
            const isActive = i === active;
            return (
              <button
                key={profile.name}
                type="button"
                aria-label={`Show ${profile.name}`}
                aria-current={isActive}
                onClick={() => jumpTo(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  isActive
                    ? "w-6 bg-[#78afa4]"
                    : "w-2 bg-[#cadfd8] hover:bg-[#a9cdc3]"
                }`}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
