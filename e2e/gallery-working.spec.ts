import { expect, test } from "@playwright/test";

test.describe("Gallery Working Tests", () => {
  const validGalleries = ["all", "develop", "video", "video&design"];

  test.describe("Basic Gallery Loading", () => {
    for (const gallery of validGalleries) {
      test(`should load ${gallery} gallery successfully`, async ({ page }) => {
        await page.goto(`/portfolio/gallery/${gallery}`);

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // Check basic page structure
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator("body")).toBeVisible();

        // Check that we're on the right page
        expect(page.url()).toContain(`/portfolio/gallery/${gallery}`);
      });
    }
  });

  test.describe("Gallery Navigation", () => {
    test("should have working navigation links", async ({ page }) => {
      await page.goto("/portfolio/gallery/all");
      await page.waitForLoadState("networkidle");

      // Look for navigation links (if they exist)
      const navLinks = page.locator('a[href*="/portfolio/gallery/"]');
      const linkCount = await navLinks.count();

      if (linkCount > 0) {
        console.log(`Found ${linkCount} gallery navigation links`);

        // Test first few links
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute("href");

          if (href && validGalleries.some((g) => href.includes(g))) {
            await link.click();
            await page.waitForLoadState("networkidle");
            await expect(page.locator("h1")).toBeVisible();
            await page.goBack();
            await page.waitForLoadState("networkidle");
          }
        }
      }
    });
  });

  test.describe("Gallery Content", () => {
    test("should display gallery content appropriately", async ({ page }) => {
      for (const gallery of validGalleries) {
        await page.goto(`/portfolio/gallery/${gallery}`);
        await page.waitForLoadState("networkidle");

        // Check for common content elements
        const hasItems =
          (await page
            .locator(
              '[data-testid*="portfolio"], .portfolio-item, .gallery-item',
            )
            .count()) > 0;
        const hasContent = await page.locator("main").textContent();

        // At minimum, should have some content
        expect(hasContent).toBeTruthy();
        expect(hasContent.length).toBeGreaterThan(10);

        console.log(
          `${gallery} gallery: ${hasItems ? "has items" : "no items found"}`,
        );
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/portfolio/gallery/all");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("body")).toBeVisible();
    });

    test("should work on tablet devices", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto("/portfolio/gallery/video");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
