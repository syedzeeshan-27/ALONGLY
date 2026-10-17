import { expect, request, test, type Page } from "@playwright/test";

import { resolveSupabaseEnv } from "./env";

// The whole product in one test: a user goes through the intake and waits, a
// companion signs up, goes online, accepts that user's request, both talk in
// the matched room, the user saves the companion and ends the conversation.
// Runs with no Anthropic key, so the intake is the scripted demo companion.

const PASSWORD = "e2e-password-123";
const INTAKE_MESSAGES = [
  "I've been feeling really alone since I moved cities.",
  "Most evenings I just sit with my phone and talk to nobody.",
  "I don't think it's a crisis, I just miss having someone to talk to.",
  "I usually open up quickly once someone actually listens.",
  "Honestly I'd just like to feel less invisible this week.",
];

function uniqueEmail(role: "user" | "companion") {
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `e2e-${role}-${stamp}@example.com`;
}

async function signUp(page: Page, role: "user" | "companion", email: string) {
  await page.goto(`/signup?role=${role}`);
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
}

async function sendRoomMessage(page: Page, text: string) {
  const composer = page.locator("#room-message");
  await composer.fill(text);
  await composer.press("Enter");
}

test.describe("user and companion match flow", () => {
  test.beforeAll(async () => {
    // The database only allows one waiting request per user, and old waiting
    // requests from aborted runs would clutter the companion's queue.
    const supabase = resolveSupabaseEnv();

    if (!supabase?.serviceRoleKey) {
      console.warn(
        "[e2e] No service role key available; leaving any waiting match_requests in place.",
      );
      return;
    }

    const api = await request.newContext({
      baseURL: supabase.url,
      extraHTTPHeaders: {
        apikey: supabase.serviceRoleKey,
        Authorization: `Bearer ${supabase.serviceRoleKey}`,
        Prefer: "return=minimal",
      },
    });

    const response = await api.delete("/rest/v1/match_requests?status=eq.waiting");
    expect(
      response.ok(),
      `clearing waiting match_requests failed: ${response.status()} ${await response.text()}`,
    ).toBe(true);
    await api.dispose();
  });

  test("intake, accept, talk, save and end", async ({ browser }) => {
    test.setTimeout(240_000);

    const userEmail = uniqueEmail("user");
    const companionEmail = uniqueEmail("companion");
    const runTag = userEmail.split("@")[0];

    const userContext = await browser.newContext();
    const companionContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const companionPage = await companionContext.newPage();

    try {
      // --- User: sign up and go through the five-message intake --------------
      await signUp(userPage, "user", userEmail);
      await expect(userPage).toHaveURL(/\/home$/, { timeout: 60_000 });

      await userPage.goto("/chat");
      const composer = userPage.locator("#chat-message");
      await expect(composer).toBeVisible({ timeout: 60_000 });

      const assistantBubbles = userPage
        .locator("div.justify-start > p")
        .filter({ hasNotText: "Thinking..." });
      await expect(assistantBubbles).toHaveCount(1);

      for (const [index, message] of INTAKE_MESSAGES.entries()) {
        await composer.fill(message);
        await composer.press("Enter");

        if (index < INTAKE_MESSAGES.length - 1) {
          // Greeting + one reply per message sent so far.
          await expect(assistantBubbles).toHaveCount(index + 2, { timeout: 30_000 });
        }
      }

      await expect(
        userPage.getByRole("heading", { name: /finding your person/i }),
      ).toBeVisible({ timeout: 30_000 });

      // --- Companion: sign up, fill in the setup form, go online ------------
      await signUp(companionPage, "companion", companionEmail);
      await expect(companionPage).toHaveURL(/\/companion-setup$/, { timeout: 60_000 });

      await companionPage
        .locator("#went_through")
        .fill("Moved to a new city alone and rebuilt a life there.");
      await companionPage.locator("#how_long_ago").selectOption("1-2 years");
      await companionPage.getByRole("radio", { name: "calm listener" }).check();
      await companionPage.getByRole("button", { name: "Save setup" }).click();
      await expect(companionPage).toHaveURL(/\/companion-dashboard$/, { timeout: 60_000 });

      const onlineToggle = companionPage.locator("button[aria-pressed]");
      await expect(onlineToggle).toBeVisible();
      if ((await onlineToggle.getAttribute("aria-pressed")) !== "true") {
        await onlineToggle.click();
      }
      await expect(onlineToggle).toHaveAttribute("aria-pressed", "true");

      // --- Companion: accept this user's request -----------------------------
      const requestCard = companionPage.locator("article", { hasText: userEmail });
      await expect(requestCard).toBeVisible({ timeout: 30_000 });
      await requestCard.getByRole("button", { name: "Accept" }).click();

      const roomUrl = /\/room\/([0-9a-f-]{36})$/;
      await expect(companionPage).toHaveURL(roomUrl, { timeout: 60_000 });
      const roomId = companionPage.url().match(roomUrl)?.[1];
      expect(roomId).toBeTruthy();

      await expect(userPage).toHaveURL(new RegExp(`/room/${roomId}$`), {
        timeout: 60_000,
      });

      // --- Both: exchange messages ------------------------------------------
      const companionMessage = `Hi, I'm here with you (${runTag})`;
      const userMessage = `Thank you for picking this up (${runTag})`;

      await expect(companionPage.locator("#room-message")).toBeVisible({ timeout: 30_000 });
      await expect(userPage.locator("#room-message")).toBeVisible({ timeout: 30_000 });

      await sendRoomMessage(companionPage, companionMessage);
      await expect(companionPage.getByText(companionMessage)).toBeVisible();
      await expect(userPage.getByText(companionMessage)).toBeVisible({ timeout: 30_000 });

      await sendRoomMessage(userPage, userMessage);
      await expect(userPage.getByText(userMessage)).toBeVisible();
      await expect(companionPage.getByText(userMessage)).toBeVisible({ timeout: 30_000 });

      // --- User: save the companion, then end the conversation ---------------
      await userPage.getByRole("button", { name: "Save companion" }).click();
      await expect(userPage.getByRole("button", { name: "Companion saved" })).toBeVisible();

      await userPage.getByRole("button", { name: "End conversation" }).click();
      await expect(userPage).toHaveURL(/\/sessions$/, { timeout: 60_000 });
      await expect(companionPage).toHaveURL(/\/companion-sessions$/, { timeout: 60_000 });
    } finally {
      await userContext.close();
      await companionContext.close();
    }
  });
});
