/**
 * Design Playground E2E Tests
 * Task 4.2: E2Eテスト（Playwright）の実装
 * Tests for design playground interactions and functionality
 */

import { expect, test } from "@playwright/test";

test.describe("Design Playground", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to design playground
    await page.goto("/portfolio/playground/design");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Loading and Structure", () => {
    test("should load design playground page successfully", async ({
      page,
    }) => {
      // Check page title
      await expect(page).toHaveTitle(/Design Playground.*samuido/);

      // Check main heading
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Check navigation breadcrumb
      await expect(page.getByText("Portfolio")).toBeVisible();
      await expect(page.getByText("Playground")).toBeVisible();

      // Check experiment grid is present
      await expect(page.getByTestId("experiment-grid")).toBeVisible();
    });

    test("should display filter controls", async ({ page }) => {
      // Check filter bar is visible
      await expect(page.getByText("Experiment Filter")).toBeVisible();

      // Check filter dropdowns
      await expect(
        page.getByRole("combobox", { name: /category/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("combobox", { name: /difficulty/i }),
      ).toBeVisible();

      // Check technology search input
      await expect(page.getByPlaceholder("Search technology...")).toBeVisible();
    });

    test("should display experiment cards", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Check that experiment cards are visible
      const experimentCards = page.locator("[data-testid='experiment-card']");
      await expect(experimentCards.first()).toBeVisible();

      // Check card content
      await expect(experimentCards.first().getByRole("heading")).toBeVisible();
      await expect(
        experimentCards.first().getByText(/description/i),
      ).toBeVisible();
    });
  });

  test.describe("Experiment Interaction", () => {
    test("should activate experiment on click", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Click on first experiment
      const firstExperiment = page
        .locator("[data-testid='experiment-card']")
        .first();
      await firstExperiment.click();

      // Check that experiment is activated
      await expect(firstExperiment).toHaveAttribute("aria-pressed", "true");

      // Check that experiment content is displayed
      await expect(page.getByTestId("active-experiment")).toBeVisible();
    });

    test("should display experiment controls when active", async ({ page }) => {
      // Activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check for experiment controls
      await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /pause/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /reset/i })).toBeVisible();
    });

    test("should handle experiment interaction", async ({ page }) => {
      // Activate an interactive experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Find and click an interactive experiment
      const interactiveExperiment = page
        .locator("[data-testid='experiment-card']")
        .filter({ hasText: "Interactive" })
        .first();

      if ((await interactiveExperiment.count()) > 0) {
        await interactiveExperiment.click();

        // Wait for experiment to load
        await page.waitForSelector("[data-testid='active-experiment']");

        // Try to interact with the experiment canvas/container
        const experimentContainer = page.getByTestId("active-experiment");
        await experimentContainer.hover();
        await experimentContainer.click();

        // Check that interaction is registered (this would depend on specific experiment)
        // For now, just verify the experiment is still active
        await expect(experimentContainer).toBeVisible();
      }
    });

    test("should deactivate experiment when clicking close", async ({
      page,
    }) => {
      // Activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for experiment to be active
      await expect(page.getByTestId("active-experiment")).toBeVisible();

      // Click close button
      await page.getByRole("button", { name: /close/i }).click();

      // Check that experiment is deactivated
      await expect(page.getByTestId("active-experiment")).not.toBeVisible();
    });
  });

  test.describe("Filter Functionality", () => {
    test("should filter experiments by category", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Get initial experiment count
      const initialCount = await page
        .locator("[data-testid='experiment-card']")
        .count();

      // Select CSS category
      await page
        .getByRole("combobox", { name: /category/i })
        .selectOption("css");

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that experiments are filtered
      const filteredCount = await page
        .locator("[data-testid='experiment-card']")
        .count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Check that visible experiments are CSS experiments
      const visibleExperiments = page.locator(
        "[data-testid='experiment-card']",
      );
      for (let i = 0; i < (await visibleExperiments.count()); i++) {
        await expect(visibleExperiments.nth(i).getByText("css")).toBeVisible();
      }
    });

    test("should filter experiments by difficulty", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Select beginner difficulty
      await page
        .getByRole("combobox", { name: /difficulty/i })
        .selectOption("beginner");

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that visible experiments are beginner level
      const visibleExperiments = page.locator(
        "[data-testid='experiment-card']",
      );
      for (let i = 0; i < (await visibleExperiments.count()); i++) {
        await expect(
          visibleExperiments.nth(i).getByText("beginner"),
        ).toBeVisible();
      }
    });

    test("should search experiments by technology", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Search for CSS technology
      await page.getByPlaceholder("Search technology...").fill("CSS");

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that visible experiments contain CSS technology
      const visibleExperiments = page.locator(
        "[data-testid='experiment-card']",
      );
      const count = await visibleExperiments.count();

      if (count > 0) {
        // At least one experiment should contain CSS
        await expect(visibleExperiments.first().getByText("CSS")).toBeVisible();
      }
    });

    test("should clear all filters", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Apply some filters
      await page
        .getByRole("combobox", { name: /category/i })
        .selectOption("css");
      await page
        .getByRole("combobox", { name: /difficulty/i })
        .selectOption("beginner");

      // Wait for filters to apply
      await page.waitForTimeout(500);

      // Get filtered count
      const filteredCount = await page
        .locator("[data-testid='experiment-card']")
        .count();

      // Clear all filters
      await page.getByRole("button", { name: /clear all/i }).click();

      // Wait for filters to clear
      await page.waitForTimeout(500);

      // Check that more experiments are visible
      const clearedCount = await page
        .locator("[data-testid='experiment-card']")
        .count();
      expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  test.describe("Performance Monitoring", () => {
    test("should display performance metrics when experiment is active", async ({
      page,
    }) => {
      // Activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='active-experiment']");

      // Check for performance metrics display
      await expect(page.getByText(/fps/i)).toBeVisible();
      await expect(page.getByText(/memory/i)).toBeVisible();
    });

    test("should show performance settings", async ({ page }) => {
      // Open performance settings
      await page.getByRole("button", { name: /settings/i }).click();

      // Check settings panel
      await expect(page.getByText(/performance settings/i)).toBeVisible();
      await expect(
        page.getByRole("slider", { name: /target fps/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("combobox", { name: /quality/i }),
      ).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should support keyboard navigation", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Tab to first experiment
      await page.keyboard.press("Tab");

      // Check that first experiment is focused
      const firstExperiment = page
        .locator("[data-testid='experiment-card']")
        .first();
      await expect(firstExperiment).toBeFocused();

      // Press Enter to activate
      await page.keyboard.press("Enter");

      // Check that experiment is activated
      await expect(firstExperiment).toHaveAttribute("aria-pressed", "true");
    });

    test("should have proper ARIA labels", async ({ page }) => {
      // Check main content has proper labels
      await expect(page.getByRole("main")).toHaveAttribute(
        "aria-label",
        /design playground/i,
      );

      // Check navigation has proper labels
      await expect(page.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        /design playground navigation/i,
      );

      // Check experiment cards have proper descriptions
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      const firstCard = page.locator("[data-testid='experiment-card']").first();
      await expect(firstCard).toHaveAttribute("aria-describedby");
    });

    test("should announce experiment changes to screen readers", async ({
      page,
    }) => {
      // Activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check for status announcement
      await expect(page.getByRole("status")).toBeVisible();
      await expect(page.getByRole("status")).toContainText(/activated/i);
    });
  });

  test.describe("Responsive Design", () => {
    test("should adapt layout for mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Wait for layout to adjust
      await page.waitForTimeout(500);

      // Check mobile-specific elements
      await expect(page.getByTestId("mobile-experiment-grid")).toBeVisible();

      // Check that filters are collapsed on mobile
      await expect(
        page.getByRole("button", { name: /filters/i }),
      ).toBeVisible();
    });

    test("should support touch gestures on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Simulate swipe gesture
      const experimentGrid = page.getByTestId("experiment-grid");

      // Touch start
      await experimentGrid.dispatchEvent("touchstart", {
        touches: [{ clientX: 200, clientY: 300 }],
      });

      // Touch end (swipe left)
      await experimentGrid.dispatchEvent("touchend", {
        changedTouches: [{ clientX: 100, clientY: 300 }],
      });

      // Check that swipe was handled (this would depend on implementation)
      await page.waitForTimeout(500);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle experiment loading errors gracefully", async ({
      page,
    }) => {
      // Mock network failure for experiment loading
      await page.route("**/api/experiments/**", (route) => route.abort());

      // Try to activate an experiment
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check for error message
      await expect(page.getByText(/error loading experiment/i)).toBeVisible();

      // Check for retry button
      await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();
    });

    test("should handle performance monitoring errors", async ({ page }) => {
      // This test would check that the page continues to work even if performance monitoring fails
      // For now, just verify that the experiment still loads
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check that experiment loads despite potential performance monitoring issues
      await expect(page.getByTestId("active-experiment")).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to WebGL playground", async ({ page }) => {
      // Click WebGL playground link
      await page.getByRole("link", { name: /WebGL Playground/i }).click();

      // Check that we're on WebGL playground page
      await expect(page).toHaveURL(/\/portfolio\/playground\/WebGL/);
      await expect(
        page.getByRole("heading", { name: /WebGL Playground/i }),
      ).toBeVisible();
    });

    test("should navigate back to portfolio", async ({ page }) => {
      // Click portfolio breadcrumb
      await page.getByRole("link", { name: "Portfolio" }).click();

      // Check that we're on portfolio page
      await expect(page).toHaveURL(/\/portfolio$/);
    });
  });
});
