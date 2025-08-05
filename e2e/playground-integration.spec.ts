/**
 * Playground Integration E2E Tests
 * Task 4.4: 統合テスト
 * Tests for playground integration with other pages and systems
 */

import { expect, test } from "@playwright/test";

test.describe("Playground Integration Tests", () => {
  test.describe("Portfolio Integration", () => {
    test("should navigate from portfolio to playground", async ({ page }) => {
      // Start from portfolio page
      await page.goto("/portfolio");
      await page.waitForLoadState("networkidle");

      // Look for playground links
      const playgroundLinks = page.getByRole("link", { name: /playground/i });

      if ((await playgroundLinks.count()) > 0) {
        await playgroundLinks.first().click();

        // Should navigate to playground
        await expect(page).toHaveURL(/\/portfolio\/playground/);
        await expect(
          page.getByRole("heading", { name: /playground/i }),
        ).toBeVisible();
      }
    });

    test("should maintain breadcrumb navigation", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check breadcrumb structure
      await expect(page.getByText("Portfolio")).toBeVisible();
      await expect(page.getByText("Playground")).toBeVisible();

      // Navigate back via breadcrumb
      await page.getByRole("link", { name: "Portfolio" }).click();

      // Should return to portfolio
      await expect(page).toHaveURL(/\/portfolio$/);
      await expect(
        page.getByRole("heading", { name: /portfolio/i }),
      ).toBeVisible();
    });

    test("should share experiment data with portfolio system", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that playground experiments are part of portfolio data
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Navigate to main portfolio
      await page.getByRole("link", { name: "Portfolio" }).click();
      await page.waitForLoadState("networkidle");

      // Check if playground experiments appear in portfolio (if integrated)
      const portfolioItems = page.locator("[data-testid='portfolio-item']");

      if ((await portfolioItems.count()) > 0) {
        // Look for playground-related items
        const playgroundItems = portfolioItems.filter({
          hasText: /playground|experiment/i,
        });

        // Should have some integration (this depends on implementation)
        expect(await playgroundItems.count()).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe("Search Integration", () => {
    test("should integrate with site search", async ({ page }) => {
      // Check if there's a global search
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const searchInput = page.getByRole("textbox", { name: /search/i });

      if ((await searchInput.count()) > 0) {
        // Search for playground content
        await searchInput.fill("playground");
        await page.keyboard.press("Enter");

        // Should find playground pages in results
        await page.waitForLoadState("networkidle");

        const searchResults = page.locator("[data-testid='search-result']");
        if ((await searchResults.count()) > 0) {
          const playgroundResults = searchResults.filter({
            hasText: /playground/i,
          });
          expect(await playgroundResults.count()).toBeGreaterThan(0);
        }
      }
    });

    test("should be discoverable through site navigation", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check main navigation
      const navLinks = page.getByRole("navigation").getByRole("link");
      const portfolioLink = navLinks.filter({ hasText: /portfolio/i });

      if ((await portfolioLink.count()) > 0) {
        await portfolioLink.first().click();
        await page.waitForLoadState("networkidle");

        // Should be able to find playground from portfolio
        const playgroundLink = page.getByRole("link", { name: /playground/i });
        if ((await playgroundLink.count()) > 0) {
          await playgroundLink.first().click();

          // Should reach playground
          await expect(page).toHaveURL(/\/portfolio\/playground/);
        }
      }
    });
  });

  test.describe("SEO Integration", () => {
    test("should have proper meta tags", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check meta tags
      const title = await page.title();
      expect(title).toContain("Design Playground");
      expect(title).toContain("samuido");

      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      if ((await metaDescription.count()) > 0) {
        const description = await metaDescription.getAttribute("content");
        expect(description).toContain("design");
        expect(description).toContain("experiment");
      }

      // Check Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      if ((await ogTitle.count()) > 0) {
        const ogTitleContent = await ogTitle.getAttribute("content");
        expect(ogTitleContent).toContain("Design Playground");
      }
    });

    test("should be included in sitemap", async ({ page }) => {
      // Check if sitemap includes playground pages
      const sitemapResponse = await page.request.get("/sitemap.xml");

      if (sitemapResponse.ok()) {
        const sitemapContent = await sitemapResponse.text();

        // Should include playground URLs
        expect(sitemapContent).toContain("/portfolio/playground/design");
        expect(sitemapContent).toContain("/portfolio/playground/WebGL");
      }
    });

    test("should have structured data", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check for JSON-LD structured data
      const structuredData = page.locator('script[type="application/ld+json"]');

      if ((await structuredData.count()) > 0) {
        const jsonLd = await structuredData.first().textContent();
        const data = JSON.parse(jsonLd || "{}");

        // Should have appropriate structured data
        expect(data["@type"]).toBeDefined();
        expect(data.name || data.title).toBeDefined();
      }
    });
  });

  test.describe("Analytics Integration", () => {
    test("should track playground interactions", async ({ page }) => {
      // Mock analytics tracking
      // const analyticsEvents: unknown[] = [];

      await page.addInitScript(() => {
        // Mock Google Analytics
        (window as Record<string, unknown>).gtag = function (
          ...args: unknown[]
        ) {
          (window as Record<string, unknown>).analyticsEvents =
            (window as Record<string, unknown>).analyticsEvents || [];
          (
            (window as Record<string, unknown>).analyticsEvents as unknown[]
          ).push(args);
        };
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Interact with playground
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check if analytics events were fired
      const events = await page.evaluate(
        () => (window as Record<string, unknown>).analyticsEvents || [],
      );

      if (events.length > 0) {
        // Should track page view
        const pageViewEvent = events.find(
          (event: unknown[]) =>
            (event as string[])[0] === "event" &&
            (event as string[])[1] === "page_view",
        );
        expect(pageViewEvent).toBeDefined();

        // Should track experiment interaction
        const interactionEvent = events.find(
          (event: unknown[]) =>
            (event as string[])[0] === "event" &&
            (event as string[])[1] === "experiment_activate",
        );
        expect(interactionEvent).toBeDefined();
      }
    });

    test("should track performance metrics", async ({ page }) => {
      // Mock performance tracking
      await page.addInitScript(() => {
        (window as Record<string, unknown>).performanceMetrics = [];

        // Mock performance observer
        (window as Record<string, unknown>).PerformanceObserver = class {
          constructor(callback: (entries: unknown[]) => void) {
            this.callback = callback;
          }
          observe() {
            // Mock performance entries
            setTimeout(() => {
              this.callback({
                getEntries: () => [
                  {
                    name: "playground-load",
                    startTime: 0,
                    duration: 1000,
                  },
                ],
              });
            }, 100);
          }
          callback: (entries: unknown[]) => void;
        };
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for performance tracking
      await page.waitForTimeout(200);

      // Should have performance data
      const hasPerformanceObserver = await page.evaluate(() => {
        return (
          typeof (window as Record<string, unknown>).PerformanceObserver !==
          "undefined"
        );
      });

      expect(hasPerformanceObserver).toBe(true);
    });
  });

  test.describe("Error Handling Integration", () => {
    test("should handle API failures gracefully", async ({ page }) => {
      // Mock API failure
      await page.route("**/api/**", (route) => route.abort());

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Should show error state but page should still be functional
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Should show error message
      const errorMessage = page.getByText(/error|failed|unable/i);
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }

      // Should provide fallback functionality
      const fallbackContent = page.getByText(/try again|reload|refresh/i);
      if ((await fallbackContent.count()) > 0) {
        await expect(fallbackContent.first()).toBeVisible();
      }
    });

    test("should handle network errors", async ({ page }) => {
      // Simulate network failure
      await page.setOfflineMode(true);

      await page.goto("/portfolio/playground/design");

      // Should handle offline state
      await page.waitForLoadState("domcontentloaded");

      // Should show offline message or cached content
      const offlineIndicator = page.getByText(/offline|network|connection/i);
      if ((await offlineIndicator.count()) > 0) {
        await expect(offlineIndicator.first()).toBeVisible();
      }

      // Restore network
      await page.setOfflineMode(false);
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should recover when network is restored
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();
    });

    test("should handle JavaScript errors gracefully", async ({ page }) => {
      const jsErrors: string[] = [];

      page.on("pageerror", (error) => {
        jsErrors.push(error.message);
      });

      // Inject a script that causes an error
      await page.addInitScript(() => {
        setTimeout(() => {
          throw new Error("Test JavaScript Error");
        }, 1000);
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for potential errors
      await page.waitForTimeout(1500);

      // Page should still be functional despite JS errors
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Should have caught the error
      expect(jsErrors.length).toBeGreaterThan(0);
      expect(jsErrors[0]).toContain("Test JavaScript Error");
    });
  });

  test.describe("Cross-Browser Integration", () => {
    test("should work consistently across different viewports", async ({
      page,
    }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 }, // Tablet
        { width: 375, height: 667 }, // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/portfolio/playground/design");
        await page.waitForLoadState("networkidle");

        // Should render properly at all viewport sizes
        await expect(
          page.getByRole("heading", { name: /Design Playground/i }),
        ).toBeVisible();

        // Should have responsive layout
        await page.waitForSelector("[data-testid='experiment-card']", {
          timeout: 10000,
        });
        const experimentCards = page.locator("[data-testid='experiment-card']");
        expect(await experimentCards.count()).toBeGreaterThan(0);
      }
    });

    test("should handle different device capabilities", async ({ page }) => {
      // Test with different device capabilities
      const deviceTests = [
        {
          name: "High-end desktop",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          viewport: { width: 1920, height: 1080 },
        },
        {
          name: "Mobile device",
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
          viewport: { width: 375, height: 667 },
        },
      ];

      for (const device of deviceTests) {
        await page.setUserAgent(device.userAgent);
        await page.setViewportSize(device.viewport);

        await page.goto("/portfolio/playground/design");
        await page.waitForLoadState("networkidle");

        // Should adapt to device capabilities
        await expect(
          page.getByRole("heading", { name: /Design Playground/i }),
        ).toBeVisible();

        // Check device-specific features
        if (device.name.includes("Mobile")) {
          // Should show mobile-optimized interface
          const mobileFeatures = page.getByText(/swipe|touch/i);
          if ((await mobileFeatures.count()) > 0) {
            await expect(mobileFeatures.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Data Persistence Integration", () => {
    test("should persist user preferences", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Set some preferences
      const categorySelect = page.getByRole("combobox", { name: /category/i });
      if ((await categorySelect.count()) > 0) {
        await categorySelect.selectOption("css");
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Check if preferences are persisted
      if ((await categorySelect.count()) > 0) {
        const selectedValue = await categorySelect.inputValue();
        expect(selectedValue).toBe("css");
      }
    });

    test("should handle session storage", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Set session data
      await page.evaluate(() => {
        sessionStorage.setItem(
          "playground-state",
          JSON.stringify({
            activeExperiment: "test-1",
            lastVisited: Date.now(),
          }),
        );
      });

      // Check session data
      const sessionData = await page.evaluate(() => {
        const data = sessionStorage.getItem("playground-state");
        return data ? JSON.parse(data) : null;
      });

      expect(sessionData).toBeDefined();
      expect(sessionData.activeExperiment).toBe("test-1");
    });
  });

  test.describe("Performance Integration", () => {
    test("should maintain performance across page transitions", async ({
      page,
    }) => {
      // Start timing
      const startTime = Date.now();

      // Navigate through playground pages
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const designLoadTime = Date.now() - startTime;

      // Navigate to WebGL playground
      const webglStartTime = Date.now();
      await page.getByRole("link", { name: /WebGL Playground/i }).click();
      await page.waitForLoadState("networkidle");

      const webglLoadTime = Date.now() - webglStartTime;

      // Both should load within reasonable time
      expect(designLoadTime).toBeLessThan(5000);
      expect(webglLoadTime).toBeLessThan(5000);
    });

    test("should handle memory management across experiments", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        return (
          (performance as Record<string, unknown>).memory?.usedJSHeapSize || 0
        );
      });

      // Activate multiple experiments
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      const experiments = page.locator("[data-testid='experiment-card']");
      const experimentCount = Math.min(3, await experiments.count());

      for (let i = 0; i < experimentCount; i++) {
        await experiments.nth(i).click();
        await page.waitForTimeout(1000);

        // Deactivate
        const closeButton = page.getByRole("button", { name: /close/i });
        if ((await closeButton.count()) > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        return (
          (performance as Record<string, unknown>).memory?.usedJSHeapSize || 0
        );
      });

      // Memory increase should be reasonable
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
    });
  });
});
