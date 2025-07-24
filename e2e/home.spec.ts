import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    await page.goto("/");

    // Check if the main heading is visible
    await expect(page.getByText("samuido's website")).toBeVisible();

    // Check if the description is visible
    await expect(
      page.getByText("ようこそ！ このサイトはsamuidoの個人サイトです."),
    ).toBeVisible();

    // Check if navigation cards are present using more specific selectors
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("About"),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Portfolio"),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Workshop"),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("Tools"),
    ).toBeVisible();

    // Check if global function cards are present
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Search"),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Contact"),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]').getByText("Privacy"),
    ).toBeVisible();
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
    await expect(page.locator("h1")).toHaveText("samuido's website");

    // Check for ARIA labels
    await expect(
      page.locator('nav[aria-label="Main navigation"]'),
    ).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Global functions"]'),
    ).toBeVisible();

    // Check for screen reader only headings
    await expect(page.locator("h3.sr-only")).toHaveCount(2);
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.getByText("samuido's website")).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]').getByText("About"),
    ).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText("samuido's website")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText("samuido's website")).toBeVisible();
  });
});
