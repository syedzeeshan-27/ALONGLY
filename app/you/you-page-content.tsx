"use client";

import { useEffect, useRef } from "react";

import { UserContextCard } from "./user-context-card";
import { YouClient, type SavedCompanion } from "./you-client";

export function YouPageContent({
  savedCompanions,
  sessionCount,
}: {
  savedCompanions: SavedCompanion[];
  sessionCount: number;
}) {
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <section
      className="mobile-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6"
      ref={scrollContainerRef}
    >
      <UserContextCard />
      <YouClient
        savedCompanions={savedCompanions}
        sessionCount={sessionCount}
      />
    </section>
  );
}
