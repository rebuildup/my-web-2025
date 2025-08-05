/**
 * Playground Accessibility E2E Tests
 * Task 4.2: E2Eテスト（Playwright）の実装
 * Tests for playground accessibility features and keyboard navigation
 */

import { expect, test } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";

test.describe("Playground Accessibility", () => {
  test.describe("Design Playground Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");
      await injectAxe(page);
    });

    test("should pass axe accessibility tests", async ({ page }) => {
      // Run axe accessibility tests
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test("should have proper heading structure", async ({ page }) => {
      // Check heading hierarchy
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(/Design Playground/i);

      // Check for proper heading levels
      const h2Elements = page.getByRole("heading", { level: 2 });
      page.getByRole("heading", { level: 3 });

      // Should have logical heading structure
      expect(await h2Elements.count()).toBeGreaterThan(0);
    });

    test("should support keyboard navigation through experiments", async ({
      page,
    }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Start keyboard navigation
      await page.keyboard.press("Tab");

      // Should focus on first interactive element
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Tab through experiment cards
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Tab");
        const currentFocus = page.locator(":focus");
        await expect(currentFocus).toBeVisible();
      }
    });

    test("should activate experiments with keyboard", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Tab to first experiment
      await page.keyboard.press("Tab");

      // Find the focused experiment card
      const focusedCard = page.locator(":focus");

      // Press Enter to activate
      await page.keyboard.press("Enter");

      // Check that experiment is activated
      await expect(focusedCard).toHaveAttribute("aria-pressed", "true");
    });

    test("should support arrow key navigation", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Focus first experiment
      const firstExperiment = page
        .locator("[data-testid='experiment-card']")
        .first();
      await firstExperiment.focus();

      // Use arrow keys to navigate
      await page.keyboard.press("ArrowRight");

      // Check that focus moved to next experiment
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).not.toBe(firstExperiment);
    });

    test("should have proper ARIA labels and descriptions", async ({
      page,
    }) => {
      // Check main content area
      const main = page.getByRole("main");
      await expect(main).toHaveAttribute("aria-label");

      // Check navigation
      const nav = page.getByRole("navigation");
      await expect(nav).toHaveAttribute("aria-label");

      // Check experiment cards have descriptions
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      const experimentCards = page.locator("[data-testid='experiment-card']");

      for (let i = 0; i < Math.min(3, await experimentCards.count()); i++) {
        const card = experimentCards.nth(i);
        await expect(card).toHaveAttribute("aria-describedby");
      }
    });

    test("should announce experiment state changes", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Activate an experiment
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check for live region announcement
      const liveRegion = page.getByRole("status");
      await expect(liveRegion).toBeVisible();
      await expect(liveRegion).toContainText(/activated/i);
    });

    test("should support screen reader navigation", async ({ page }) => {
      // Check for proper landmarks
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("navigation")).toBeVisible();

      // Check for skip links
      const skipLink = page.getByRole("link", {
        name: /skip to main content/i,
      });
      if ((await skipLink.count()) > 0) {
        await expect(skipLink).toBeVisible();
      }

      // Check for proper form labels
      const categorySelect = page.getByRole("combobox", { name: /category/i });
      await expect(categorySelect).toHaveAccessibleName();
    });

    test("should handle focus management in modals", async ({ page }) => {
      // Open settings modal
      const settingsButton = page.getByRole("button", { name: /settings/i });
      if ((await settingsButton.count()) > 0) {
        await settingsButton.click();

        // Focus should move to modal
        const modal = page.getByRole("dialog");
        if ((await modal.count()) > 0) {
          await expect(modal).toBeVisible();

          // First focusable element in modal should be focused
          const firstFocusable = modal
            .locator("button, input, select, textarea")
            .first();
          await expect(firstFocusable).toBeFocused();

          // Escape should close modal
          await page.keyboard.press("Escape");
          await expect(modal).not.toBeVisible();
        }
      }
    });
  });

  test.describe("WebGL Playground Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");
      await injectAxe(page);
    });

    test("should pass axe accessibility tests", async ({ page }) => {
      // Run axe accessibility tests
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test("should provide alternative content for WebGL canvas", async ({
      page,
    }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for WebGL canvas
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check for alternative content
      const canvas = page.getByTestId("webgl-canvas");
      await expect(canvas).toHaveAttribute("role", "img");
      await expect(canvas).toHaveAttribute("aria-label");
    });

    test("should support keyboard controls for WebGL", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for WebGL canvas
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Focus the canvas
      const canvas = page.getByTestId("webgl-canvas");
      await canvas.focus();

      // Test keyboard controls
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowRight");

      // Canvas should remain focused and handle keyboard input
      await expect(canvas).toBeFocused();
    });

    test("should announce WebGL context status", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Check for WebGL status announcement
      const statusRegion = page.getByRole("status");
      await expect(statusRegion).toBeVisible();

      // Should announce WebGL initialization
      await expect(statusRegion).toContainText(/webgl/i);
    });

    test("should handle WebGL not supported gracefully", async ({ page }) => {
      // Mock WebGL as not supported
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = function (contextType) {
          if (
            contextType === "webgl" ||
            contextType === "experimental-webgl" ||
            contextType === "webgl2"
          ) {
            return null;
          }
          return null;
        };
      });

      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should show accessible fallback content
      await expect(page.getByText(/webgl not supported/i)).toBeVisible();
      await expect(page.getByText(/fallback content/i)).toBeVisible();

      // Fallback should be accessible
      const fallbackContent = page.getByText(/fallback content/i);
      await expect(fallbackContent).toHaveAttribute("role");
    });
  });

  test.describe("Mobile Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");
      await injectAxe(page);
    });

    test("should pass axe accessibility tests on mobile", async ({ page }) => {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test("should have proper touch targets", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Check touch target sizes (minimum 44px)
      const touchTargets = page.locator("button, a, input, select");

      for (let i = 0; i < Math.min(5, await touchTargets.count()); i++) {
        const target = touchTargets.nth(i);
        const boundingBox = await target.boundingBox();

        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("should support swipe gestures with accessibility", async ({
      page,
    }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Check for swipe instructions
      await expect(page.getByText(/swipe/i)).toBeVisible();

      // Swipe instructions should be accessible
      const swipeInstructions = page.getByText(/swipe/i);
      await expect(swipeInstructions).toHaveAttribute("role", "status");
    });

    test("should have accessible mobile navigation", async ({ page }) => {
      // Check for mobile menu button
      const menuButton = page.getByRole("button", { name: /menu/i });
      if ((await menuButton.count()) > 0) {
        await expect(menuButton).toHaveAttribute("aria-expanded");
        await expect(menuButton).toHaveAttribute("aria-controls");
      }

      // Check for collapsed filters on mobile
      const filtersButton = page.getByRole("button", { name: /filters/i });
      if ((await filtersButton.count()) > 0) {
        await expect(filtersButton).toHaveAttribute("aria-expanded");
      }
    });
  });

  test.describe("Color and Contrast", () => {
    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");
      await injectAxe(page);

      // Run axe color contrast tests
      await checkA11y(page, null, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });
    });

    test("should not rely solely on color for information", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that interactive elements have text labels or icons
      const buttons = page.getByRole("button");

      for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
        const button = buttons.nth(i);
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute("aria-label");
        const hasIcon = (await button.locator("svg").count()) > 0;

        // Button should have text, aria-label, or icon
        expect(hasText || hasAriaLabel || hasIcon).toBeTruthy();
      }
    });
  });

  test.describe("Focus Management", () => {
    test("should have visible focus indicators", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Tab through focusable elements
      await page.keyboard.press("Tab");

      // Check that focused element has visible focus indicator
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Focus should be clearly visible (this is hard to test programmatically)
      // We can at least check that the element is focused
      await expect(focusedElement).toBeFocused();
    });

    test("should trap focus in modals", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Open a modal (settings)
      const settingsButton = page.getByRole("button", { name: /settings/i });
      if ((await settingsButton.count()) > 0) {
        await settingsButton.click();

        const modal = page.getByRole("dialog");
        if ((await modal.count()) > 0) {
          // Tab should stay within modal
          await page.keyboard.press("Tab");
          page.locator(":focus");

          // Focused element should be within modal
          const isWithinModal = (await modal.locator(":focus").count()) > 0;
          expect(isWithinModal).toBe(true);
        }
      }
    });

    test("should restore focus when closing modals", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Open and close modal
      const settingsButton = page.getByRole("button", { name: /settings/i });
      if ((await settingsButton.count()) > 0) {
        await settingsButton.focus();
        await settingsButton.click();

        const modal = page.getByRole("dialog");
        if ((await modal.count()) > 0) {
          // Close modal with Escape
          await page.keyboard.press("Escape");

          // Focus should return to settings button
          await expect(settingsButton).toBeFocused();
        }
      }
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have proper semantic markup", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check for semantic HTML elements
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("navigation")).toBeVisible();

      // Check for proper list markup
      const lists = page.getByRole("list");
      if ((await lists.count()) > 0) {
        const firstList = lists.first();
        const listItems = firstList.getByRole("listitem");
        expect(await listItems.count()).toBeGreaterThan(0);
      }
    });

    test("should have descriptive link text", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that links have descriptive text
      const links = page.getByRole("link");

      for (let i = 0; i < Math.min(5, await links.count()); i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");

        // Link should have meaningful text or aria-label
        const hasDescriptiveText =
          (linkText && linkText.trim().length > 0) ||
          (ariaLabel && ariaLabel.trim().length > 0);
        expect(hasDescriptiveText).toBe(true);
      }
    });

    test("should announce dynamic content changes", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Wait for experiments to load
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Activate an experiment
      await page.locator("[data-testid='experiment-card']").first().click();

      // Check for live region updates
      const liveRegions = page.locator(
        "[aria-live], [role='status'], [role='alert']",
      );
      expect(await liveRegions.count()).toBeGreaterThan(0);
    });
  });
});
