import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders and links to both signup roles", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const userSignup = page.locator('a[href="/signup?role=user"]');
    const companionSignup = page.locator('a[href="/signup?role=companion"]');

    await expect(userSignup.first()).toBeVisible();
    await expect(companionSignup.first()).toBeVisible();

    await userSignup.first().click();
    await expect(page).toHaveURL(/\/signup\?role=user$/);
    await expect(page.getByRole("radio", { name: /talk to someone/i })).toBeChecked();

    await page.goto("/");
    await companionSignup.first().click();
    await expect(page).toHaveURL(/\/signup\?role=companion$/);
    await expect(page.getByRole("radio", { name: /be a companion/i })).toBeChecked();
  });
});
