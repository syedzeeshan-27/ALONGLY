import { expect, test } from "@playwright/test";

// This project runs against a second `next dev` with the Supabase variables
// blanked out (see playwright.config.ts), so it checks the "fresh clone, no
// .env.local yet" experience.
test.describe("without Supabase configured", () => {
  test("the landing page still renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('a[href="/signup?role=user"]').first()).toBeVisible();
  });

  test("app routes redirect to /login with the setup notice", async ({ page }) => {
    await page.goto("/chat");

    await expect(page).toHaveURL(/\/login$/);
    // "isn't connected to a database" (showcase notice) or the older
    // "Supabase isn't connected yet" setup message: either is the right page.
    await expect(page.getByText(/isn't connected/).first()).toBeVisible();
  });
});
