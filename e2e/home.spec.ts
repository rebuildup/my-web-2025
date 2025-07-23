import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    await page.goto("/");

    // Check if the main heading is visible using role selector
    await expect(page.getByRole("heading", { name: "samuido" })).toBeVisible();

    // Check if the subtitle is visible
    await expect(
      page.getByText("クリエイティブポートフォリオ & ツール")
    ).toBeVisible();

    // Check if navigation cards are present using more specific selectors
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("About")
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Portfolio")
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Workshop")
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Tools")
    ).toBeVisible();

    // Check if global function cards are present
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Search")
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Contact")
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Privacy")
    ).toBeVisible();

    // Check if latest content section is present
    await expect(page.getByText("最新コンテンツ")).toBeVisible();
  });

  test("should have proper navigation links", async ({ page }) => {
    await page.goto("/");

    // Check if navigation links have proper href attributes
    await expect(page.locator('a[href="/about"]')).toBeVisible();
    await expect(page.locator('a[href="/portfolio"]')).toBeVisible();
    await expect(page.locator('a[href="/workshop"]')).toBeVisible();
    await expect(page.locator('a[href="/tools"]')).toBeVisible();
    await expect(page.locator('a[href="/search"]')).toBeVisible();
    await expect(page.locator('a[href="/contact"]')).toBeVisible();
    await expect(page.locator('a[href="/privacy-policy"]')).toBeVisible();
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    await page.goto("/");

    // Check for proper heading hierarchy
    await expect(page.locator("h1")).toHaveText("samuido");
    await expect(page.locator("h2")).toHaveText(
      "クリエイティブポートフォリオ & ツール"
    );

    // Check for ARIA labels
    await expect(
      page.locator('nav[aria-label="Main navigation"]')
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]')
    ).toBeVisible();

    // Check for proper section labeling
    await expect(
      page.locator('section[aria-labelledby="latest-content"]')
    ).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "samuido" })).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("About")
    ).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole("heading", { name: "samuido" })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole("heading", { name: "samuido" })).toBeVisible();
  });
});
