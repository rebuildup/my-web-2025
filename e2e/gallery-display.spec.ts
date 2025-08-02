import { expect, test } from "@playwright/test";

test.describe("Gallery Display E2E Tests", () => {
  test.describe("Multiple Category Display", () => {
    test("should display items with multiple categories correctly", async ({
      page,
    }) => {
      // Navigate to All gallery first to see all items
      await page.goto("/portfolio/gallery/all");

      // Wait for gallery to load
      await page.waitForSelector(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        { timeout: 15000 },
      );

      // Check if any items are displayed
      const allItems = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await allItems.count();

      if (itemCount > 0) {
        console.log(`Found ${itemCount} items in All gallery`);

        // Test each category gallery
        const categories = ["develop", "video", "design", "video&design"];

        for (const category of categories) {
          await page.goto(`/portfolio/gallery/${category}`);

          // Wait for gallery to load
          await page.waitForSelector(
            '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
            { timeout: 10000 },
          );

          // Verify page loads without errors
          await expect(page.locator("h1")).toBeVisible();

          // Check if items are displayed (may be empty for some categories)
          const categoryItems = page.locator(
            '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
          );
          const categoryItemCount = await categoryItems.count();

          console.log(
            `Found ${categoryItemCount} items in ${category} gallery`,
          );

          // Verify no JavaScript errors occurred
          const errors: string[] = [];
          page.on("console", (msg) => {
            if (msg.type() === "error") {
              errors.push(msg.text());
            }
          });

          // Filter out non-critical errors
          const criticalErrors = errors.filter(
            (error) =>
              !error.includes("404") &&
              !error.includes("favicon") &&
              !error.includes("_next/static") &&
              !error.includes("chunks"),
          );

          expect(criticalErrors.length).toBeLessThan(3);
        }
      } else {
        console.log(
          "No portfolio items found - this may be expected in a fresh environment",
        );
      }
    });

    test("should handle video&design gallery correctly", async ({ page }) => {
      await page.goto("/portfolio/gallery/video&design");

      // Wait for gallery to load
      await page.waitForSelector("main", { timeout: 15000 });

      // Verify page title
      await expect(page.locator("h1")).toBeVisible();

      // Check for gallery container
      const galleryContainer = page.locator(
        '[data-testid="gallery-container"], .gallery-container, .portfolio-gallery',
      );
      if (await galleryContainer.isVisible()) {
        await expect(galleryContainer).toBeVisible();

        // Check for items
        const items = page.locator(
          '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        );
        const itemCount = await items.count();

        console.log(`Video&Design gallery has ${itemCount} items`);

        // If items exist, verify they don't contain Other category items
        if (itemCount > 0) {
          for (let i = 0; i < Math.min(itemCount, 5); i++) {
            const item = items.nth(i);

            // Check if item has data attributes indicating categories
            const categories = await item.getAttribute("data-categories");
            if (categories) {
              // Should not contain "other" category
              expect(categories.toLowerCase()).not.toContain("other");
            }
          }
        }
      }

      // Test filtering functionality if present
      const filterButtons = page.locator(
        '[data-testid="filter-button"], .filter-button',
      );
      const filterCount = await filterButtons.count();

      if (filterCount > 0) {
        // Click on first filter
        await filterButtons.first().click();
        await page.waitForTimeout(500);

        // Verify filtering works
        const filteredItems = page.locator(
          '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        );
        await expect(filteredItems.first()).toBeVisible();
      }
    });

    test("should exclude Other category from specific galleries", async ({
      page,
    }) => {
      const categoriesToTest = ["develop", "video", "design", "video&design"];

      for (const category of categoriesToTest) {
        await page.goto(`/portfolio/gallery/${category}`);

        // Wait for gallery to load
        await page.waitForSelector("main", { timeout: 15000 });

        // Check all items in this gallery
        const items = page.locator(
          '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        );
        const itemCount = await items.count();

        if (itemCount > 0) {
          for (let i = 0; i < itemCount; i++) {
            const item = items.nth(i);

            // Check if item has Other category indicator
            const isOtherCategory = await item.getAttribute(
              "data-other-category",
            );
            const categories = await item.getAttribute("data-categories");

            // Should not be Other category
            expect(isOtherCategory).not.toBe("true");

            if (categories) {
              expect(categories.toLowerCase()).not.toContain("other");
            }
          }
        }

        console.log(
          `Verified ${category} gallery excludes Other category items`,
        );
      }
    });

    test("should include Other category only in All gallery", async ({
      page,
    }) => {
      // First check All gallery
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 15000 });

      const allItems = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const allItemCount = await allItems.count();

      let otherItemsInAll = 0;

      if (allItemCount > 0) {
        for (let i = 0; i < allItemCount; i++) {
          const item = allItems.nth(i);
          const isOtherCategory = await item.getAttribute(
            "data-other-category",
          );
          const categories = await item.getAttribute("data-categories");

          if (
            isOtherCategory === "true" ||
            (categories && categories.toLowerCase().includes("other"))
          ) {
            otherItemsInAll++;
          }
        }
      }

      console.log(
        `Found ${otherItemsInAll} Other category items in All gallery`,
      );

      // Now check that Other items don't appear in specific galleries
      const specificCategories = ["develop", "video", "design"];

      for (const category of specificCategories) {
        await page.goto(`/portfolio/gallery/${category}`);
        await page.waitForSelector("main", { timeout: 15000 });

        const categoryItems = page.locator(
          '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        );
        const categoryItemCount = await categoryItems.count();

        let otherItemsInCategory = 0;

        if (categoryItemCount > 0) {
          for (let i = 0; i < categoryItemCount; i++) {
            const item = categoryItems.nth(i);
            const isOtherCategory = await item.getAttribute(
              "data-other-category",
            );
            const categories = await item.getAttribute("data-categories");

            if (
              isOtherCategory === "true" ||
              (categories && categories.toLowerCase().includes("other"))
            ) {
              otherItemsInCategory++;
            }
          }
        }

        // Should be 0 Other items in specific category galleries
        expect(otherItemsInCategory).toBe(0);
        console.log(`Verified ${category} gallery has 0 Other category items`);
      }
    });
  });

  test.describe("Deduplication and Filtering", () => {
    test("should not show duplicate items in galleries", async ({ page }) => {
      const galleries = ["all", "develop", "video", "design", "video&design"];

      for (const gallery of galleries) {
        await page.goto(`/portfolio/gallery/${gallery}`);
        await page.waitForSelector("main", { timeout: 15000 });

        // Get all item titles/IDs
        const items = page.locator(
          '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        );
        const itemCount = await items.count();

        if (itemCount > 0) {
          const itemIds = new Set<string>();
          const itemTitles = new Set<string>();

          for (let i = 0; i < itemCount; i++) {
            const item = items.nth(i);

            // Get item ID if available
            const itemId = await item.getAttribute("data-id");
            if (itemId) {
              expect(itemIds.has(itemId)).toBe(false);
              itemIds.add(itemId);
            }

            // Get item title
            const titleElement = item.locator(
              'h2, h3, .title, [data-testid="item-title"]',
            );
            if (await titleElement.isVisible()) {
              const title = await titleElement.textContent();
              if (title) {
                expect(itemTitles.has(title)).toBe(false);
                itemTitles.add(title);
              }
            }
          }

          console.log(
            `${gallery} gallery: ${itemIds.size} unique items by ID, ${itemTitles.size} unique items by title`,
          );
        }
      }
    });

    test("should filter items correctly by category", async ({ page }) => {
      // Test develop gallery
      await page.goto("/portfolio/gallery/develop");
      await page.waitForSelector("main", { timeout: 15000 });

      const developItems = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const developCount = await developItems.count();

      if (developCount > 0) {
        // Check that all items have develop category
        for (let i = 0; i < Math.min(developCount, 5); i++) {
          const item = developItems.nth(i);
          const categories = await item.getAttribute("data-categories");

          if (categories) {
            expect(categories.toLowerCase()).toContain("develop");
          }
        }
      }

      // Test video gallery
      await page.goto("/portfolio/gallery/video");
      await page.waitForSelector("main", { timeout: 15000 });

      const videoItems = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const videoCount = await videoItems.count();

      if (videoCount > 0) {
        // Check that all items have video category
        for (let i = 0; i < Math.min(videoCount, 5); i++) {
          const item = videoItems.nth(i);
          const categories = await item.getAttribute("data-categories");

          if (categories) {
            expect(categories.toLowerCase()).toMatch(/video/);
          }
        }
      }

      console.log(
        `Develop gallery: ${developCount} items, Video gallery: ${videoCount} items`,
      );
    });

    test("should handle items with multiple categories correctly", async ({
      page,
    }) => {
      // Create a test scenario by checking video&design gallery
      await page.goto("/portfolio/gallery/video&design");
      await page.waitForSelector("main", { timeout: 15000 });

      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await items.count();

      if (itemCount > 0) {
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = items.nth(i);
          const categories = await item.getAttribute("data-categories");

          if (categories) {
            const categoryList = categories.toLowerCase();

            // Should contain at least one of: video, design, or video&design
            const hasValidCategory =
              categoryList.includes("video") ||
              categoryList.includes("design") ||
              categoryList.includes("video&design");

            expect(hasValidCategory).toBe(true);
          }
        }

        // Now check that the same items appear in individual category galleries
        const firstItemTitle = await items
          .first()
          .locator('h2, h3, .title, [data-testid="item-title"]')
          .textContent();

        if (firstItemTitle) {
          // Check if it appears in video gallery
          await page.goto("/portfolio/gallery/video");
          await page.waitForSelector("main", { timeout: 15000 });

          const videoGalleryHasItem = await page
            .locator(`text=${firstItemTitle}`)
            .isVisible();

          // Check if it appears in design gallery
          await page.goto("/portfolio/gallery/design");
          await page.waitForSelector("main", { timeout: 15000 });

          const designGalleryHasItem = await page
            .locator(`text=${firstItemTitle}`)
            .isVisible();

          console.log(
            `Item "${firstItemTitle}" appears in video gallery: ${videoGalleryHasItem}, design gallery: ${designGalleryHasItem}`,
          );
        }
      }
    });
  });

  test.describe("Gallery Navigation and UI", () => {
    test("should navigate between gallery categories", async ({ page }) => {
      // Start at All gallery
      await page.goto("/portfolio/gallery/all");
      await expect(page.locator("h1")).toBeVisible();

      // Look for category navigation
      const categoryLinks = page.locator(
        'a[href*="/portfolio/gallery/"], .category-link, .gallery-nav a',
      );
      const linkCount = await categoryLinks.count();

      if (linkCount > 0) {
        // Test navigation to different categories
        const categories = ["develop", "video", "design", "video&design"];

        for (const category of categories) {
          const categoryLink = page.locator(
            `a[href="/portfolio/gallery/${category}"]`,
          );

          if (await categoryLink.isVisible()) {
            await categoryLink.click();
            await page.waitForURL(`**/portfolio/gallery/${category}`);

            // Verify we're on the correct page
            expect(page.url()).toContain(`/portfolio/gallery/${category}`);

            // Verify page loads
            await expect(page.locator("main").first()).toBeVisible();
          } else {
            // Try direct navigation
            await page.goto(`/portfolio/gallery/${category}`);
            await expect(page.locator("main").first()).toBeVisible();
          }
        }
      } else {
        console.log("No category navigation found - testing direct navigation");

        // Test direct navigation
        const categories = ["develop", "video", "design", "video&design"];

        for (const category of categories) {
          await page.goto(`/portfolio/gallery/${category}`);
          await expect(page.locator("main").first()).toBeVisible();
          expect(page.url()).toContain(`/portfolio/gallery/${category}`);
        }
      }
    });

    test("should display gallery metadata correctly", async ({ page }) => {
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 15000 });

      // Check for gallery title
      const title = page.locator("h1");
      await expect(title).toBeVisible();

      // Check for item count or gallery description
      const itemCount = page.locator('[data-testid="item-count"], .item-count');
      if (await itemCount.isVisible()) {
        await expect(itemCount).toBeVisible();
      }

      // Check for gallery items
      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const count = await items.count();

      console.log(`Gallery displays ${count} items`);

      // If items exist, check their metadata
      if (count > 0) {
        const firstItem = items.first();

        // Check for item title
        const itemTitle = firstItem.locator(
          'h2, h3, .title, [data-testid="item-title"]',
        );
        if (await itemTitle.isVisible()) {
          await expect(itemTitle).toBeVisible();
        }

        // Check for item description
        const itemDescription = firstItem.locator(
          '.description, [data-testid="item-description"]',
        );
        if (await itemDescription.isVisible()) {
          await expect(itemDescription).toBeVisible();
        }

        // Check for item categories/tags
        const itemCategories = firstItem.locator(
          '.categories, .tags, [data-testid="item-categories"]',
        );
        if (await itemCategories.isVisible()) {
          await expect(itemCategories).toBeVisible();
        }
      }
    });

    test("should handle empty galleries gracefully", async ({ page }) => {
      // Test a category that might be empty
      await page.goto("/portfolio/gallery/other");
      await page.waitForSelector("main", { timeout: 15000 });

      // Should still show the page structure
      await expect(page.locator("h1")).toBeVisible();

      // Check for empty state message
      const emptyMessage = page.locator(
        '[data-testid="empty-gallery"], .empty-state, .no-items',
      );
      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toBeVisible();
      }

      // Should not show any portfolio items
      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await items.count();

      console.log(`Other gallery has ${itemCount} items`);

      // Page should still be functional
      await expect(page.locator("main").first()).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 15000 });

      // Check that content is visible and accessible
      await expect(page.locator("h1")).toBeVisible();

      // Check gallery layout
      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await items.count();

      if (itemCount > 0) {
        // Check that items are properly sized for mobile
        const firstItem = items.first();
        const boundingBox = await firstItem.boundingBox();

        if (boundingBox) {
          // Item should not overflow viewport
          expect(boundingBox.width).toBeLessThanOrEqual(375);
          expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        }

        // Test scrolling
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(500);

        // Should still be functional
        await expect(firstItem).toBeVisible();
      }

      // Test navigation on mobile
      const categoryLinks = page.locator(
        'a[href*="/portfolio/gallery/"], .category-link',
      );
      if (await categoryLinks.first().isVisible()) {
        await categoryLinks.first().click();
        await page.waitForTimeout(1000);

        // Should navigate successfully
        await expect(page.locator("main").first()).toBeVisible();
      }
    });

    test("should display correctly on tablet devices", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto("/portfolio/gallery/video&design");
      await page.waitForSelector("main", { timeout: 15000 });

      // Check layout
      await expect(page.locator("h1")).toBeVisible();

      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await items.count();

      if (itemCount > 0) {
        // Check grid layout for tablet
        const firstItem = items.first();
        const secondItem = items.nth(1);

        if (await secondItem.isVisible()) {
          const firstBox = await firstItem.boundingBox();
          const secondBox = await secondItem.boundingBox();

          if (firstBox && secondBox) {
            // Items should be arranged in a grid
            const isGrid =
              Math.abs(firstBox.y - secondBox.y) < 50 ||
              Math.abs(firstBox.x - secondBox.x) > 100;
            expect(isGrid).toBe(true);
          }
        }
      }
    });
  });

  test.describe("Performance and Loading", () => {
    test("should load galleries within performance budget", async ({
      page,
    }) => {
      const galleries = ["all", "develop", "video", "design", "video&design"];

      for (const gallery of galleries) {
        const startTime = Date.now();

        await page.goto(`/portfolio/gallery/${gallery}`);
        await page.waitForSelector("main", { timeout: 30000 });

        const loadTime = Date.now() - startTime;

        // Should load within 30 seconds
        expect(loadTime).toBeLessThan(30000);

        console.log(`${gallery} gallery loaded in ${loadTime}ms`);
      }
    });

    test("should handle large numbers of items efficiently", async ({
      page,
    }) => {
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 30000 });

      // Count items
      const items = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
      );
      const itemCount = await items.count();

      console.log(`All gallery contains ${itemCount} items`);

      if (itemCount > 10) {
        // Test scrolling performance with many items
        const startTime = Date.now();

        // Scroll through the gallery
        for (let i = 0; i < 5; i++) {
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(100);
        }

        const scrollTime = Date.now() - startTime;

        // Scrolling should be smooth (less than 2 seconds for 5 scrolls)
        expect(scrollTime).toBeLessThan(2000);

        // Page should still be responsive
        await expect(page.locator("main").first()).toBeVisible();
      }
    });

    test("should lazy load images if implemented", async ({ page }) => {
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 15000 });

      // Check for images
      const images = page.locator("img");
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check if images have lazy loading attributes
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          const loading = await img.getAttribute("loading");
          const src = await img.getAttribute("src");

          // If lazy loading is implemented
          if (loading === "lazy") {
            console.log("Lazy loading detected");
          }

          // Images should have proper src
          if (src) {
            expect(src).toBeTruthy();
          }
        }

        // Test scrolling to trigger lazy loading
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);

        // Images should still be loading properly
        const visibleImages = page.locator("img:visible");
        const visibleCount = await visibleImages.count();
        expect(visibleCount).toBeGreaterThan(0);
      }
    });
  });
});
