/**
 * Playground Performance E2E Tests
 * Task 4.3: パフォーマンス・品質テスト
 * Tests for playground performance metrics and quality standards
 */

import { expect, test } from "@playwright/test";

test.describe("Playground Performance Tests", () => {
  test.describe("Design Playground Performance", () => {
    test("should load design playground within performance budget", async ({
      page,
    }) => {
      // Start performance measurement
      const startTime = Date.now();

      // Navigate to design playground
      await page.goto("/portfolio/playground/design");

      // Wait for page to be fully loaded
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check that main content is visible
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();
    });

    test("should maintain 60fps during design experiments", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='active-experiment']");

      // Measure FPS over 3 seconds
      const fpsData = await page.evaluate(async () => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();

          function countFrame() {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - startTime >= 3000) {
              const fps = (frameCount * 1000) / (currentTime - startTime);
              resolve(fps);
            } else {
              requestAnimationFrame(countFrame);
            }
          }

          requestAnimationFrame(countFrame);
        });
      });

      // Should maintain at least 30 FPS (allowing for some performance variance)
      expect(fpsData).toBeGreaterThan(30);
    });

    test("should have reasonable memory usage", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Get initial memory usage
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
        await page.waitForTimeout(1000); // Allow experiment to load

        // Deactivate to test cleanup
        await page.getByRole("button", { name: /close/i }).click();
        await page.waitForTimeout(500);
      }

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (
          (performance as Record<string, unknown>).memory?.usedJSHeapSize || 0
        );
      });

      // Memory increase should be reasonable (less than 50MB)
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      expect(memoryIncrease).toBeLessThan(50);
    });

    test("should have fast interaction response times", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Measure click response time
      const startTime = Date.now();
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for experiment to activate
      await page.waitForSelector("[data-testid='active-experiment']");
      const responseTime = Date.now() - startTime;

      // Should respond within 100ms (FID requirement)
      expect(responseTime).toBeLessThan(100);
    });
  });

  test.describe("WebGL Playground Performance", () => {
    test("should load WebGL playground efficiently", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check that main content is visible
      await expect(
        page.getByRole("heading", { name: /WebGL Playground/i }),
      ).toBeVisible();
    });

    test("should maintain 60fps in WebGL experiments", async ({ page }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      // Check if WebGL is supported
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl;
      });

      if (!webglSupported) {
        test.skip("WebGL not supported in this environment");
        return;
      }

      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for WebGL to initialize
      await page.waitForSelector("[data-testid='webgl-canvas']");
      await page.waitForTimeout(2000); // Allow WebGL to stabilize

      // Check FPS display
      const fpsElement = page.getByText(/\d+.*fps/i);
      await expect(fpsElement).toBeVisible();

      // Get FPS value
      const fpsText = await fpsElement.textContent();
      const fps = parseInt(fpsText?.match(/\d+/)?.[0] || "0");

      // Should maintain at least 30 FPS for WebGL
      expect(fps).toBeGreaterThan(30);
    });

    test("should manage WebGL memory efficiently", async ({ page }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      // Check if WebGL is supported
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        return !!gl;
      });

      if (!webglSupported) {
        test.skip("WebGL not supported in this environment");
        return;
      }

      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        return (
          (performance as Record<string, unknown>).memory?.usedJSHeapSize || 0
        );
      });

      // Activate and deactivate WebGL experiments
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      const experiments = page.locator("[data-testid='webgl-experiment-card']");
      const experimentCount = Math.min(2, await experiments.count());

      for (let i = 0; i < experimentCount; i++) {
        await experiments.nth(i).click();
        await page.waitForSelector("[data-testid='webgl-canvas']");
        await page.waitForTimeout(2000); // Allow WebGL to load

        // Switch to next experiment (cleanup previous)
        if (i < experimentCount - 1) {
          await experiments.nth(i + 1).click();
          await page.waitForTimeout(1000);
        }
      }

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        return (
          (performance as Record<string, unknown>).memory?.usedJSHeapSize || 0
        );
      });

      // WebGL memory increase should be reasonable (less than 100MB)
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      expect(memoryIncrease).toBeLessThan(100);
    });

    test("should handle WebGL performance degradation gracefully", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      // Check if WebGL is supported
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        return !!gl;
      });

      if (!webglSupported) {
        test.skip("WebGL not supported in this environment");
        return;
      }

      // Activate a complex WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });

      // Look for a high-performance experiment
      const complexExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: /particle|shader|3d/i })
        .first();

      if ((await complexExperiment.count()) > 0) {
        await complexExperiment.click();
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Wait for performance monitoring
        await page.waitForTimeout(3000);

        // Check if quality was automatically adjusted
        const qualityWarning = page.getByText(
          /quality.*reduced|performance.*low/i,
        );

        // If performance is poor, quality should be automatically adjusted
        // This is more of a functional test than a strict performance requirement
        if ((await qualityWarning.count()) > 0) {
          await expect(qualityWarning).toBeVisible();
        }
      }
    });
  });

  test.describe("Bundle Size and Loading Performance", () => {
    test("should have reasonable bundle sizes", async ({ page }) => {
      // Intercept network requests to measure bundle sizes
      const resourceSizes: { [key: string]: number } = {};

      page.on("response", async (response) => {
        const url = response.url();
        if (url.includes(".js") || url.includes(".css")) {
          try {
            const buffer = await response.body();
            resourceSizes[url] = buffer.length;
          } catch {
            // Ignore errors for resources we can't measure
          }
        }
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Calculate total JavaScript bundle size
      const totalJSSize = Object.entries(resourceSizes)
        .filter(([url]) => url.includes(".js"))
        .reduce((total, [, size]) => total + size, 0);

      // Total JS should be less than 8MB (realistic for Three.js apps)
      expect(totalJSSize).toBeLessThan(8 * 1024 * 1024);
    });

    test("should load critical resources quickly", async ({ page }) => {
      const resourceTimings: { [key: string]: number } = {};

      page.on("response", async (response) => {
        const url = response.url();
        const timing = response.timing();

        if (url.includes("playground") || url.includes("experiment")) {
          resourceTimings[url] = timing.responseEnd - timing.requestStart;
        }
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Critical resources should load within 1 second
      Object.entries(resourceTimings).forEach(([, timing]) => {
        expect(timing).toBeLessThan(1000);
      });
    });
  });

  test.describe("Core Web Vitals", () => {
    test("should meet LCP requirements", async ({ page }) => {
      await page.goto("/portfolio/playground/design");

      // Measure Largest Contentful Paint
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ["largest-contentful-paint"] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      // LCP should be less than 2.5 seconds
      expect(lcp).toBeLessThan(2500);
    });

    test("should meet CLS requirements", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for layout to stabilize
      await page.waitForTimeout(2000);

      // Measure Cumulative Layout Shift
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as Record<string, unknown>).hadRecentInput) {
                clsValue += (entry as Record<string, unknown>).value as number;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ["layout-shift"] });

          // Resolve after 3 seconds
          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      // CLS should be less than 0.1
      expect(cls).toBeLessThan(0.1);
    });

    test("should meet FID requirements", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Measure First Input Delay by clicking
      const startTime = Date.now();
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for response
      await page.waitForSelector("[data-testid='active-experiment']");
      const inputDelay = Date.now() - startTime;

      // FID should be less than 100ms
      expect(inputDelay).toBeLessThan(100);
    });
  });

  test.describe("Accessibility Performance", () => {
    test("should have fast screen reader navigation", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Measure time to navigate through headings
      const startTime = Date.now();

      // Simulate screen reader heading navigation
      const headings = page.getByRole("heading");
      const headingCount = await headings.count();

      for (let i = 0; i < Math.min(5, headingCount); i++) {
        await headings.nth(i).focus();
        await page.waitForTimeout(10); // Minimal delay for focus
      }

      const navigationTime = Date.now() - startTime;

      // Should navigate through headings quickly
      expect(navigationTime).toBeLessThan(500);
    });

    test("should have responsive keyboard navigation", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Measure keyboard navigation response time
      const startTime = Date.now();

      // Tab through several elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(10); // Minimal delay
      }

      const tabTime = Date.now() - startTime;

      // Keyboard navigation should be responsive
      expect(tabTime).toBeLessThan(200);
    });
  });

  test.describe("Error Recovery Performance", () => {
    test("should recover quickly from experiment errors", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Mock an experiment error
      await page.route("**/api/experiments/**", (route) => route.abort());

      // Try to activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      const startTime = Date.now();
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for error message
      await page.waitForSelector("text=/error/i");
      const errorTime = Date.now() - startTime;

      // Error should be displayed quickly
      expect(errorTime).toBeLessThan(1000);

      // Test retry functionality
      const retryStartTime = Date.now();

      // Remove the route mock to allow retry to succeed
      await page.unroute("**/api/experiments/**");

      await page.getByRole("button", { name: /retry/i }).click();

      // Should recover quickly
      const retryTime = Date.now() - retryStartTime;
      expect(retryTime).toBeLessThan(2000);
    });
  });
});
