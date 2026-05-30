export const USER_CONTEXT_KEY = "alongly:user-context-card";

export type UserContextCard = {
  background: string;
  ongoingStory: string;
  whatHelps: string;
  avoid: string;
  updatedAt: number | null;
};

export const EMPTY_USER_CONTEXT_CARD: UserContextCard = {
  background: "",
  ongoingStory: "",
  whatHelps: "",
  avoid: "",
  updatedAt: null,
};

export function hasUserContextCardContent(card: UserContextCard) {
  return Boolean(
    card.background.trim() ||
      card.ongoingStory.trim() ||
      card.whatHelps.trim() ||
      card.avoid.trim(),
  );
}

export function parseUserContextCard(raw: string | null): UserContextCard {
  if (!raw) {
    return EMPTY_USER_CONTEXT_CARD;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserContextCard>;

    return {
      background:
        typeof parsed.background === "string" ? parsed.background : "",
      ongoingStory:
        typeof parsed.ongoingStory === "string" ? parsed.ongoingStory : "",
      whatHelps:
        typeof parsed.whatHelps === "string" ? parsed.whatHelps : "",
      avoid: typeof parsed.avoid === "string" ? parsed.avoid : "",
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : null,
    };
  } catch {
    return EMPTY_USER_CONTEXT_CARD;
  }
}

export function parseStoredUserContextCard(
  raw: string | null,
): UserContextCard | null {
  const card = parseUserContextCard(raw);
  return hasUserContextCardContent(card) ? card : null;
}
