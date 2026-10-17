// Scripted stand-in for the AI intake when no ANTHROPIC_API_KEY is set, so the
// whole flow (intake -> tags -> briefing -> match) works with zero paid keys.

export type IntakeMessage = {
  role: "user" | "assistant";
  content: string;
};

export const INTAKE_USER_TURNS = 5;

const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  grief: ["died", "passed", "loss", "lost", "funeral", "grief", "grieving", "miss her", "miss him"],
  burnout: ["burnout", "burned out", "burnt out", "exhausted", "work", "job", "boss", "deadline", "tired"],
  anxiety: ["anxious", "anxiety", "panic", "worried", "worry", "nervous", "scared", "overthinking"],
  loneliness: ["lonely", "alone", "no one", "nobody", "isolated", "friends", "left out"],
};

const CRISIS_KEYWORDS = ["can't go on", "end it", "hurt myself", "kill myself", "suicide", "no way out"];

const DEMO_REPLIES = [
  "Thank you for telling me that. It sounds like a lot to carry. How long has it felt this way?",
  "That makes sense. When it gets heavy, what does a typical day look like for you right now?",
  "I hear you. Is there anyone around you who knows what you're going through?",
  "It takes something to put that into words. What would help most right now: being listened to, or talking it through?",
];

function userText(conversation: IntakeMessage[]) {
  return conversation
    .filter((message) => message.role === "user")
    .map((message) => message.content.toLowerCase())
    .join(" ");
}

function detectExperience(text: string) {
  let best = "loneliness";
  let bestScore = 0;

  for (const [tag, words] of Object.entries(EXPERIENCE_KEYWORDS)) {
    const score = words.filter((word) => text.includes(word)).length;

    if (score > bestScore) {
      best = tag;
      bestScore = score;
    }
  }

  return best;
}

function demoTags(conversation: IntakeMessage[]) {
  const text = userText(conversation);
  const userMessages = conversation.filter((message) => message.role === "user");
  const averageLength =
    userMessages.reduce((total, message) => total + message.content.length, 0) /
    Math.max(userMessages.length, 1);

  return {
    experience_tag: detectExperience(text),
    intensity_tag: CRISIS_KEYWORDS.some((word) => text.includes(word))
      ? "crisis"
      : "venting",
    style_tag: averageLength > 80 ? "opens up fast" : "needs warmth first",
  };
}

export function demoIntakeReply(conversation: IntakeMessage[]) {
  const userTurns = conversation.filter((message) => message.role === "user").length;

  if (userTurns < INTAKE_USER_TURNS) {
    return DEMO_REPLIES[(userTurns - 1) % DEMO_REPLIES.length];
  }

  const tags = demoTags(conversation);

  return `Thank you for trusting me with all of this. You don't have to figure it out alone.
[TAGS]${JSON.stringify(tags)}[/TAGS]
Would you like to talk to someone who has been through something similar?`;
}

export function demoBriefing(conversation: IntakeMessage[]) {
  const tags = demoTags(conversation);
  const firstShare = conversation.find((message) => message.role === "user")?.content.trim() ?? "";
  const quote = firstShare.length > 140 ? `${firstShare.slice(0, 137)}...` : firstShare;

  return [
    `They're dealing with ${tags.experience_tag} right now and opened with: "${quote}"`,
    tags.style_tag === "opens up fast"
      ? "They share openly and mostly need someone to really listen."
      : "They take a little time to open up, so start gently and let them set the pace.",
    tags.intensity_tag === "crisis"
      ? "Some of what they said sounded urgent, so check in on their safety early and share local crisis lines if needed."
      : "They're venting rather than in crisis, so warmth and patience matter more than advice.",
  ].join(" ");
}
