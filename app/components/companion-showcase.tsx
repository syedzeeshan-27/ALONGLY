"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Profile = {
  name: string;
  initials: string;
  vibe: string;
  focus: string;
  style: string;
  accent: string;
};

const ADVANCE_MS = 4200;
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
      className={`companion-ring flex h-full min-h-[29rem] flex-col rounded-[1.75rem] p-5 transition-shadow duration-700 ease-out ${
        elevated
          ? "companion-ring-active shadow-[0_20px_55px_rgba(80,116,107,0.1)]"
          : "shadow-[0_18px_55px_rgba(80,116,107,0.08)]"
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
  const [reduce, setReduce] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const startXRef = useRef(0);

  const desktopActive = hovered ?? active;

  const advance = useCallback(() => setActive((a) => (a + 1) % n), [n]);
  const goPrev = useCallback(() => setActive((a) => (a - 1 + n) % n), [n]);
  const jumpTo = (i: number) => setActive(i);

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

  // Auto-rotate the active highlight on desktop only. On mobile the card stays
  // still so it can be read and tapped — it changes only on button tap / swipe.
  useEffect(() => {
    if (reduce || !isDesktop || hovered !== null) return;
    const id = window.setInterval(advance, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduce, isDesktop, hovered]);

  // ── Mobile swipe: left → next, right → previous ──
  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startXRef.current;
    if (dx <= -SWIPE_THRESHOLD) advance();
    else if (dx >= SWIPE_THRESHOLD) goPrev();
  };

  const mobileProfile = profiles[active];

  return (
    <>
      {/* ── Desktop: live-selection row ── */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {profiles.map((profile, i) => {
          const isActive = desktopActive === i;
          const style: CSSProperties = reduce
            ? {}
            : {
                transform: `scale(${isActive ? 1.035 : 0.97})`,
                opacity: isActive ? 1 : 0.92,
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

      {/* ── Mobile: one card at a time, navigated by buttons / swipe ── */}
      <div className="lg:hidden">
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* key swaps the card on change with a soft fade — no moving deck. */}
          <div key={mobileProfile.name} className="companion-card-fade">
            <CompanionCard profile={mobileProfile} elevated />
          </div>
        </div>

        {/* Prev / dots / next controls */}
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            aria-label="Previous companion"
            onClick={goPrev}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#d7e8e2] bg-white text-[#4e8b82] shadow-[0_10px_30px_rgba(80,116,107,0.1)] transition hover:border-[#9fc9bf] hover:bg-[#f0f8f5] active:scale-95"
          >
            <ChevronLeft aria-hidden="true" size={20} strokeWidth={2.3} />
          </button>

          <div className="flex items-center gap-2">
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

          <button
            type="button"
            aria-label="Next companion"
            onClick={advance}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#d7e8e2] bg-white text-[#4e8b82] shadow-[0_10px_30px_rgba(80,116,107,0.1)] transition hover:border-[#9fc9bf] hover:bg-[#f0f8f5] active:scale-95"
          >
            <ChevronRight aria-hidden="true" size={20} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </>
  );
}
