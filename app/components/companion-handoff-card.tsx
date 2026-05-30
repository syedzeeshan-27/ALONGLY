import { parseStoredUserContextCard } from "@/lib/user-continuity";

type CompanionHandoffCardProps = {
  companionBriefing: string | null;
  userEmail: string | null;
  userContextCard: string | null;
};

function Section({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">
        {value}
      </p>
    </div>
  );
}

export function CompanionHandoffCard({
  companionBriefing,
  userEmail,
  userContextCard,
}: CompanionHandoffCardProps) {
  const parsedContextCard = parseStoredUserContextCard(userContextCard);
  const hasBriefing = Boolean(companionBriefing?.trim());
  const hasUserEmail = Boolean(userEmail?.trim());

  if (!hasBriefing && !parsedContextCard && !hasUserEmail) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          AI briefing
        </p>
        {hasBriefing ? (
          <p className="mt-2 whitespace-pre-wrap text-sm italic leading-7 text-stone-500">
            {companionBriefing?.trim()}
          </p>
        ) : (
          <p className="mt-2 text-sm italic leading-7 text-stone-400">
            Briefing not available for this person.
          </p>
        )}
      </div>

      {hasUserEmail ? (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <Section label="User email" value={userEmail!.trim()} />
        </div>
      ) : null}

      {parsedContextCard ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            User context card
          </p>
          <div className="mt-3 grid gap-3">
            {parsedContextCard.background.trim() ? (
              <Section
                label="Background"
                value={parsedContextCard.background.trim()}
              />
            ) : null}
            {parsedContextCard.ongoingStory.trim() ? (
              <Section
                label="Pinned ongoing story"
                value={parsedContextCard.ongoingStory.trim()}
              />
            ) : null}
            {parsedContextCard.whatHelps.trim() ? (
              <Section
                label="What helps"
                value={parsedContextCard.whatHelps.trim()}
              />
            ) : null}
            {parsedContextCard.avoid.trim() ? (
              <Section
                label="What to avoid"
                value={parsedContextCard.avoid.trim()}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
