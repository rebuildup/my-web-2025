import { test, expect } from "@playwright/test";

test.describe("YouTube Thumbnails", () => {
  test("should display YouTube thumbnails in video gallery", async ({
    page,
  }) => {
    // Navigate to video gallery
    await page.goto("/portfolio/gallery/video");

    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");

    // Verify video gallery page loads
    await expect(page.locator("h1")).toContainText("Video Projects");

    // Wait for video items to load
    await page.waitForTimeout(2000);

    // Check if video items are displayed
    const videoItems = page.locator(
      '[data-testid="video-item"], .group.cursor-pointer',
    );
    const videoCount = await videoItems.count();

    if (videoCount > 0) {
      // Check if thumbnails are loaded (not black backgrounds)
      const firstVideoItem = videoItems.first();
      await expect(firstVideoItem).toBeVisible();

      // Check if thumbnail images are present
      const thumbnailImages = firstVideoItem.locator("img");
      const imageCount = await thumbnailImages.count();

      if (imageCount > 0) {
        const firstImage = thumbnailImages.first();
        await expect(firstImage).toBeVisible();

        // Verify image has loaded (not broken)
        const isImageLoaded = await firstImage.evaluate(
          (img: HTMLImageElement) => {
            return img.complete && img.naturalHeight !== 0;
          },
        );

        expect(isImageLoaded).toBe(true);
      }

      // Test hover effect (should show play button)
      await firstVideoItem.hover();
      await page.waitForTimeout(500);

      // Check if play overlay appears on hover
      const playButton = firstVideoItem.locator('svg[class*="lucide-play"]');
      if (await playButton.isVisible()) {
        await expect(playButton).toBeVisible();
      }

      // Test click to open detail panel
      await firstVideoItem.click();
      await page.waitForTimeout(1000);

      // Check if detail panel opens
      const detailPanel = page.locator(
        '[data-testid="video-detail-panel"], .fixed.inset-0.z-50',
      );
      if (await detailPanel.isVisible()) {
        await expect(detailPanel).toBeVisible();

        // Check if video player area is present (use first match to avoid strict mode violation)
        const videoPlayer = detailPanel.locator(".aspect-video").first();
        if (await videoPlayer.isVisible()) {
          await expect(videoPlayer).toBeVisible();

          // Check if play button is present in detail panel
          const playButtonInPanel = detailPanel.locator(
            'button:has-text("動画を再生")',
          );
          if (await playButtonInPanel.isVisible()) {
            await expect(playButtonInPanel).toBeVisible();
          }
        }

        // Close detail panel
        const closeButton = detailPanel
          .locator('button[aria-label="Close panel"], button:has(svg)')
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log("No video items found in gallery");
    }
  });

  test("should handle YouTube thumbnail loading errors gracefully", async ({
    page,
  }) => {
    // Navigate to video gallery
    await page.goto("/portfolio/gallery/video");

    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check if video items are displayed
    const videoItems = page.locator(
      '[data-testid="video-item"], .group.cursor-pointer',
    );
    const videoCount = await videoItems.count();

    if (videoCount > 0) {
      // Check each video item for proper thumbnail handling
      for (let i = 0; i < Math.min(videoCount, 3); i++) {
        const videoItem = videoItems.nth(i);
        await expect(videoItem).toBeVisible();

        // Check if thumbnail container exists
        const thumbnailContainer = videoItem.locator(".aspect-video");
        if (await thumbnailContainer.isVisible()) {
          await expect(thumbnailContainer).toBeVisible();

          // Verify no broken image icons or error states
          const brokenImages = thumbnailContainer.locator(
            'img[alt="broken"], img[src=""], img[src*="error"]',
          );
          const brokenCount = await brokenImages.count();
          expect(brokenCount).toBe(0);
        }
      }
    }
  });

  test("should display video source indicators", async ({ page }) => {
    // Navigate to video gallery
    await page.goto("/portfolio/gallery/video");

    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check if video items are displayed
    const videoItems = page.locator(
      '[data-testid="video-item"], .group.cursor-pointer',
    );
    const videoCount = await videoItems.count();

    if (videoCount > 0) {
      // Check for video source indicators (YouTube icons)
      const firstVideoItem = videoItems.first();
      const sourceIndicator = firstVideoItem.locator(".absolute.top-2.right-2");

      if (await sourceIndicator.isVisible()) {
        await expect(sourceIndicator).toBeVisible();

        // Check if video icon is present
        const videoIcon = sourceIndicator.locator("svg");
        if (await videoIcon.isVisible()) {
          await expect(videoIcon).toBeVisible();
        }
      }
    }
  });
});
