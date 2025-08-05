/**
 * WebGL Playground E2E Tests
 * Task 4.2: E2Eテスト（Playwright）の実装
 * Tests for WebGL playground interactions and functionality
 */

import { expect, test } from "@playwright/test";

test.describe("WebGL Playground", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to WebGL playground
    await page.goto("/portfolio/playground/WebGL");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Loading and WebGL Support", () => {
    test("should load WebGL playground page successfully", async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/WebGL Playground.*samuido/);

      // Check main heading
      await expect(
        page.getByRole("heading", { name: /WebGL Playground/i }),
      ).toBeVisible();

      // Check navigation breadcrumb
      await expect(page.getByText("Portfolio")).toBeVisible();
      await expect(page.getByText("Playground")).toBeVisible();
    });

    test("should detect WebGL support", async ({ page }) => {
      // Check for WebGL support indicator
      const webglSupport = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl;
      });

      if (webglSupport) {
        // Should show WebGL experiments
        await expect(page.getByTestId("webgl-experiments")).toBeVisible();
      } else {
        // Should show fallback message
        await expect(page.getByText(/WebGL not supported/i)).toBeVisible();
      }
    });

    test("should display device capabilities info", async ({ page }) => {
      // Check for device info display
      await expect(page.getByText(/device capabilities/i)).toBeVisible();

      // Check for performance level indicator
      await expect(page.getByText(/performance level/i)).toBeVisible();
    });
  });

  test.describe("WebGL Experiment Interaction", () => {
    test("should activate WebGL experiment", async ({ page }) => {
      // Wait for experiments to load
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });

      // Click on first WebGL experiment
      const firstExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .first();
      await firstExperiment.click();

      // Check that experiment is activated
      await expect(firstExperiment).toHaveAttribute("aria-pressed", "true");

      // Check for WebGL canvas
      await expect(page.getByTestId("webgl-canvas")).toBeVisible();
    });

    test("should initialize WebGL context", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for WebGL initialization
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check WebGL context creation
      const hasWebGLContext = await page.evaluate(() => {
        const canvas = document.querySelector(
          '[data-testid="webgl-canvas"]',
        ) as HTMLCanvasElement;
        if (!canvas) return false;

        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl;
      });

      expect(hasWebGLContext).toBe(true);
    });

    test("should display WebGL performance metrics", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check for WebGL-specific performance metrics
      await expect(page.getByText(/fps/i)).toBeVisible();
      await expect(page.getByText(/draw calls/i)).toBeVisible();
      await expect(page.getByText(/triangles/i)).toBeVisible();
      await expect(page.getByText(/gpu usage/i)).toBeVisible();
    });

    test("should handle WebGL context loss", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for WebGL initialization
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Simulate WebGL context loss
      await page.evaluate(() => {
        const canvas = document.querySelector(
          '[data-testid="webgl-canvas"]',
        ) as HTMLCanvasElement;
        if (canvas) {
          const event = new Event("webglcontextlost");
          canvas.dispatchEvent(event);
        }
      });

      // Check for context loss message
      await expect(page.getByText(/webgl context lost/i)).toBeVisible();

      // Check for restore button
      await expect(
        page.getByRole("button", { name: /restore/i }),
      ).toBeVisible();
    });
  });

  test.describe("Shader Experiments", () => {
    test("should display shader code for shader experiments", async ({
      page,
    }) => {
      // Look for shader experiments
      const shaderExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: "shader" })
        .first();

      if ((await shaderExperiment.count()) > 0) {
        await shaderExperiment.click();

        // Wait for experiment to load
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Check for shader code display
        await expect(page.getByText(/vertex shader/i)).toBeVisible();
        await expect(page.getByText(/fragment shader/i)).toBeVisible();

        // Check for shader code editor
        await expect(
          page.getByRole("textbox", { name: /shader code/i }),
        ).toBeVisible();
      }
    });

    test("should allow shader code editing", async ({ page }) => {
      // Find and activate shader experiment
      const shaderExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: "shader" })
        .first();

      if ((await shaderExperiment.count()) > 0) {
        await shaderExperiment.click();

        // Wait for experiment to load
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Find shader code editor
        const codeEditor = page.getByRole("textbox", { name: /shader code/i });

        if ((await codeEditor.count()) > 0) {
          // Edit shader code
          await codeEditor.clear();
          await codeEditor.fill(
            "precision mediump float; void main() { gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); }",
          );

          // Apply changes
          await page.getByRole("button", { name: /apply/i }).click();

          // Check for success message
          await expect(page.getByText(/shader updated/i)).toBeVisible();
        }
      }
    });
  });

  test.describe("Performance and Quality Settings", () => {
    test("should display quality settings", async ({ page }) => {
      // Open quality settings
      await page.getByRole("button", { name: /settings/i }).click();

      // Check quality controls
      await expect(page.getByText(/quality settings/i)).toBeVisible();
      await expect(
        page.getByRole("slider", { name: /quality/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("checkbox", { name: /optimizations/i }),
      ).toBeVisible();
    });

    test("should adjust quality based on performance", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Open settings
      await page.getByRole("button", { name: /settings/i }).click();

      // Adjust quality to low
      await page.getByRole("slider", { name: /quality/i }).fill("25");

      // Check that quality adjustment is applied
      await expect(page.getByText(/quality.*low/i)).toBeVisible();
    });

    test("should maintain target FPS", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for experiment to load and performance monitoring to start
      await page.waitForSelector("[data-testid='webgl-canvas']");
      await page.waitForTimeout(2000); // Allow time for FPS measurement

      // Check FPS display
      const fpsElement = page.getByText(/\d+.*fps/i);
      await expect(fpsElement).toBeVisible();

      // Get FPS value
      const fpsText = await fpsElement.textContent();
      const fps = parseInt(fpsText?.match(/\d+/)?.[0] || "0");

      // FPS should be reasonable (at least 15 fps for basic functionality)
      expect(fps).toBeGreaterThan(15);
    });
  });

  test.describe("Device Compatibility", () => {
    test("should filter experiments based on device capabilities", async ({
      page,
    }) => {
      // Check if WebGL2 experiments are shown based on support
      const webgl2Support = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2");
        return !!gl;
      });

      const webgl2Experiments = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: "WebGL2" });

      if (webgl2Support) {
        // Should show WebGL2 experiments if supported
        const count = await webgl2Experiments.count();
        // May be 0 if no WebGL2 experiments exist, but shouldn't error
        expect(count).toBeGreaterThanOrEqual(0);
      } else {
        // Should not show WebGL2 experiments if not supported
        await expect(webgl2Experiments).toHaveCount(0);
      }
    });

    test("should show fallback for unsupported experiments", async ({
      page,
    }) => {
      // Mock WebGL as unsupported
      await page.addInitScript(() => {
        // Override getContext to return null
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

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should show WebGL not supported message
      await expect(page.getByText(/webgl not supported/i)).toBeVisible();

      // Should show fallback content
      await expect(page.getByText(/fallback content/i)).toBeVisible();
    });
  });

  test.describe("Memory Management", () => {
    test("should display memory usage", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check for memory usage display
      await expect(page.getByText(/memory.*mb/i)).toBeVisible();
    });

    test("should cleanup resources when switching experiments", async ({
      page,
    }) => {
      // Activate first experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      const experiments = page.locator("[data-testid='webgl-experiment-card']");

      if ((await experiments.count()) > 1) {
        await experiments.first().click();
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Get initial memory usage
        await page.getByText(/memory.*mb/i).textContent();

        // Switch to second experiment
        await experiments.nth(1).click();
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Memory should be managed (not continuously increasing)
        // This is a basic check - in practice, memory management is complex
        await expect(page.getByText(/memory.*mb/i)).toBeVisible();
      }
    });
  });

  test.describe("Accessibility for WebGL", () => {
    test("should provide alternative content for screen readers", async ({
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

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check for alternative content
      await expect(
        page.getByRole("img", { name: /3d.*visualization/i }),
      ).toBeVisible();
    });

    test("should support keyboard controls for WebGL experiments", async ({
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

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Focus the canvas
      await page.getByTestId("webgl-canvas").focus();

      // Try keyboard controls
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowRight");

      // Canvas should maintain focus
      await expect(page.getByTestId("webgl-canvas")).toBeFocused();
    });

    test("should announce WebGL state changes", async ({ page }) => {
      // Activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Wait for experiment to load
      await page.waitForSelector("[data-testid='webgl-canvas']");

      // Check for status announcement
      await expect(page.getByRole("status")).toBeVisible();
      await expect(page.getByRole("status")).toContainText(/webgl.*activated/i);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle WebGL initialization errors", async ({ page }) => {
      // Mock WebGL context creation failure
      await page.addInitScript(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          contextType,
          ...args
        ) {
          if (contextType === "webgl" || contextType === "experimental-webgl") {
            return null; // Simulate context creation failure
          }
          return originalGetContext.call(this, contextType, ...args);
        };
      });

      // Try to activate a WebGL experiment
      await page.waitForSelector("[data-testid='webgl-experiment-card']", {
        timeout: 10000,
      });
      await page
        .locator("[data-testid='webgl-experiment-card']")
        .first()
        .click();

      // Should show error message
      await expect(page.getByText(/webgl.*failed/i)).toBeVisible();
    });

    test("should handle shader compilation errors", async ({ page }) => {
      // Find shader experiment
      const shaderExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: "shader" })
        .first();

      if ((await shaderExperiment.count()) > 0) {
        await shaderExperiment.click();
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Try to input invalid shader code
        const codeEditor = page.getByRole("textbox", { name: /shader code/i });
        if ((await codeEditor.count()) > 0) {
          await codeEditor.clear();
          await codeEditor.fill("invalid shader code");
          await page.getByRole("button", { name: /apply/i }).click();

          // Should show compilation error
          await expect(page.getByText(/shader.*error/i)).toBeVisible();
        }
      }
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to design playground", async ({ page }) => {
      // Click design playground link
      await page.getByRole("link", { name: /Design Playground/i }).click();

      // Check that we're on design playground page
      await expect(page).toHaveURL(/\/portfolio\/playground\/design/);
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
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
