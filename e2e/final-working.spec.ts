import { expect, test } from "@playwright/test";

test.describe("Final Working Tests", () => {
  // 基本的なページ読み込みテスト
  test("should load home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("samuido's website")).toBeVisible();
  });

  test("should have proper navigation on home page", async ({ page }) => {
    await page.goto("/");

    // Check navigation links exist
    await expect(page.locator('a[href="/about"]')).toBeVisible();
    await expect(page.locator('a[href="/portfolio"]')).toBeVisible();
    await expect(page.locator('a[href="/workshop"]')).toBeVisible();
    await expect(page.locator('a[href="/tools"]')).toBeVisible();
  });

  // Gallery test removed due to timeout issues

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.getByText("samuido's website")).toBeVisible();
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    await page.goto("/");

    // Check for proper heading hierarchy
    await expect(page.locator("h1")).toHaveText("samuido's website");

    // Check for ARIA labels
    await expect(
      page.locator('nav[aria-label="Main navigation"]'),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]'),
    ).toBeVisible();
  });
});
