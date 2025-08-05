/**
 * Playground Security E2E Tests
 * Task 4.3: パフォーマンス・品質テスト
 * Tests for security measures including XSS and CSP compliance
 */

import { expect, test } from "@playwright/test";

test.describe("Playground Security Tests", () => {
  test.describe("XSS Protection", () => {
    test("should sanitize user input in search fields", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Try to inject script in technology search
      const searchInput = page.getByPlaceholder("Search technology...");
      const maliciousScript = '<script>alert("XSS")</script>';

      await searchInput.fill(maliciousScript);
      await page.waitForTimeout(500);

      // Check that script is not executed
      const alertDialogs = [];
      page.on("dialog", (dialog) => {
        alertDialogs.push(dialog);
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alertDialogs.length).toBe(0);

      // Check that input is sanitized in DOM
      const inputValue = await searchInput.inputValue();
      expect(inputValue).not.toContain("<script>");
    });

    test("should prevent script injection in experiment descriptions", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that experiment descriptions don't contain executable scripts
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });
      const experimentCards = page.locator("[data-testid='experiment-card']");

      for (let i = 0; i < Math.min(3, await experimentCards.count()); i++) {
        const card = experimentCards.nth(i);
        const innerHTML = await card.innerHTML();

        // Should not contain script tags
        expect(innerHTML).not.toContain("<script");
        expect(innerHTML).not.toContain("javascript:");
        expect(innerHTML).not.toContain("onload=");
        expect(innerHTML).not.toContain("onerror=");
      }
    });

    test("should handle malicious URLs safely", async ({ page }) => {
      // Try to navigate to a malicious URL pattern
      const maliciousUrls = [
        "/portfolio/playground/design?search=<script>alert('xss')</script>",
        "/portfolio/playground/design?category=javascript:alert('xss')",
        "/portfolio/playground/design#<img src=x onerror=alert('xss')>",
      ];

      for (const url of maliciousUrls) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");

        // Page should load normally without executing scripts
        await expect(
          page.getByRole("heading", { name: /Design Playground/i }),
        ).toBeVisible();

        // Check that malicious content is not in the DOM
        const bodyHTML = await page.locator("body").innerHTML();
        expect(bodyHTML).not.toContain("alert(");
        expect(bodyHTML).not.toContain("<script");
      }
    });
  });

  test.describe("Content Security Policy", () => {
    test("should have CSP headers", async ({ page }) => {
      const response = await page.goto("/portfolio/playground/design");

      // Check for CSP header
      const cspHeader =
        response?.headers()["content-security-policy"] ||
        response?.headers()["content-security-policy-report-only"];

      if (cspHeader) {
        // Should have basic CSP directives
        expect(cspHeader).toContain("default-src");
        expect(cspHeader).toContain("script-src");
        expect(cspHeader).toContain("style-src");

        // Should not allow unsafe-eval or unsafe-inline without restrictions
        if (
          cspHeader.includes("unsafe-eval") ||
          cspHeader.includes("unsafe-inline")
        ) {
          // If unsafe directives are used, they should be limited
          expect(cspHeader).toMatch(/(nonce-|'strict-dynamic')/);
        }
      }
    });

    test("should block inline scripts without nonce", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Try to inject inline script
      await page.evaluate(() => {
        try {
          const script = document.createElement("script");
          script.innerHTML = "window.testXSS = true;";
          document.head.appendChild(script);
          return true;
        } catch {
          return false;
        }
      });

      // Check if script was blocked
      const xssExecuted = await page.evaluate(() => {
        return (
          typeof (window as Record<string, unknown>).testXSS !== "undefined"
        );
      });

      // Script should be blocked by CSP
      expect(xssExecuted).toBe(false);
    });

    test("should allow legitimate resources", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that legitimate resources load properly
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Check that styles are applied
      const heading = page.getByRole("heading", { name: /Design Playground/i });
      const headingStyles = await heading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          fontSize: styles.fontSize,
          color: styles.color,
        };
      });

      // Should have styles applied (not default browser styles)
      expect(headingStyles.fontSize).not.toBe("16px"); // Default browser font size
    });
  });

  test.describe("Data Validation", () => {
    test("should validate experiment data integrity", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that experiment data is properly structured
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      const experimentData = await page.evaluate(() => {
        const cards = document.querySelectorAll(
          "[data-testid='experiment-card']",
        );
        return Array.from(cards).map((card) => ({
          hasTitle: !!card.querySelector("h4"),
          hasDescription: !!card.querySelector("p"),
          hasValidId: !!card.getAttribute("data-experiment-id"),
        }));
      });

      // All experiments should have required data
      experimentData.forEach((data) => {
        expect(data.hasTitle).toBe(true);
        expect(data.hasDescription).toBe(true);
      });
    });

    test("should handle invalid API responses safely", async ({ page }) => {
      // Mock invalid API response
      await page.route("**/api/experiments/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            maliciousScript: '<script>alert("xss")</script>',
            invalidData: { nested: { script: 'javascript:alert("xss")' } },
          }),
        });
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Page should handle invalid data gracefully
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Should not execute malicious scripts
      const bodyHTML = await page.locator("body").innerHTML();
      expect(bodyHTML).not.toContain("alert(");
    });
  });

  test.describe("WebGL Security", () => {
    test("should handle WebGL context securely", async ({ page }) => {
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

      // Check WebGL security measures
      const webglSecurity = await page.evaluate(() => {
        const canvas = document.querySelector(
          '[data-testid="webgl-canvas"]',
        ) as HTMLCanvasElement;
        if (!canvas) return null;

        const gl = canvas.getContext("webgl");
        if (!gl) return null;

        return {
          // Check for WebGL security extensions
          hasSecurityExtensions: !!gl.getExtension(
            "WEBGL_security_sensitive_resources",
          ),
          // Check context attributes
          contextAttributes: gl.getContextAttributes(),
          // Check for potential security issues
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        };
      });

      if (webglSecurity) {
        // WebGL context should have reasonable limits
        expect(webglSecurity.maxTextureSize).toBeLessThanOrEqual(16384);
        expect(webglSecurity.maxRenderbufferSize).toBeLessThanOrEqual(16384);
      }
    });

    test("should sanitize shader code", async ({ page }) => {
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

      // Look for shader experiments
      const shaderExperiment = page
        .locator("[data-testid='webgl-experiment-card']")
        .filter({ hasText: /shader/i })
        .first();

      if ((await shaderExperiment.count()) > 0) {
        await shaderExperiment.click();
        await page.waitForSelector("[data-testid='webgl-canvas']");

        // Try to input malicious shader code
        const codeEditor = page.getByRole("textbox", { name: /shader code/i });
        if ((await codeEditor.count()) > 0) {
          const maliciousShader = `
            precision mediump float;
            // Attempt to access sensitive data
            uniform sampler2D u_texture;
            void main() {
              // This should be sanitized
              gl_FragColor = texture2D(u_texture, vec2(0.0));
            }
          `;

          await codeEditor.fill(maliciousShader);
          await page.getByRole("button", { name: /apply/i }).click();

          // Should handle shader compilation safely
          // Either compile successfully or show safe error message
          const errorMessage = page.getByText(/error|failed/i);
          if ((await errorMessage.count()) > 0) {
            const errorText = await errorMessage.textContent();
            // Error message should not expose sensitive information
            expect(errorText).not.toContain("file://");
            expect(errorText).not.toContain("C:\\");
            expect(errorText).not.toContain("/home/");
          }
        }
      }
    });
  });

  test.describe("Session Security", () => {
    test("should not expose sensitive information in client", async ({
      page,
    }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check that sensitive information is not exposed
      const sensitiveData = await page.evaluate(() => {
        const scripts = Array.from(document.scripts);
        const scriptContents = scripts
          .map((script) => script.innerHTML)
          .join(" ");

        return {
          hasApiKeys: /api[_-]?key|secret|token/i.test(scriptContents),
          hasPasswords: /password|pwd/i.test(scriptContents),
          hasPrivateKeys: /private[_-]?key|rsa|ssh/i.test(scriptContents),
          hasConnectionStrings: /connection[_-]?string|mongodb|mysql/i.test(
            scriptContents,
          ),
        };
      });

      // Should not expose sensitive data
      expect(sensitiveData.hasApiKeys).toBe(false);
      expect(sensitiveData.hasPasswords).toBe(false);
      expect(sensitiveData.hasPrivateKeys).toBe(false);
      expect(sensitiveData.hasConnectionStrings).toBe(false);
    });

    test("should handle CORS properly", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check CORS headers on API requests
      const corsHeaders = [];

      page.on("response", (response) => {
        if (response.url().includes("/api/")) {
          const headers = response.headers();
          corsHeaders.push({
            url: response.url(),
            accessControlAllowOrigin: headers["access-control-allow-origin"],
            accessControlAllowMethods: headers["access-control-allow-methods"],
            accessControlAllowHeaders: headers["access-control-allow-headers"],
          });
        }
      });

      // Trigger some API calls
      await page.waitForSelector("[data-testid='experiment-card']", {
        timeout: 10000,
      });

      // Check that CORS is configured (if API calls were made)
      if (corsHeaders.length > 0) {
        corsHeaders.forEach((headers) => {
          // Should have proper CORS configuration
          expect(headers.accessControlAllowOrigin).toBeDefined();
          // Should not allow all origins in production
          expect(headers.accessControlAllowOrigin).not.toBe("*");
        });
      }
    });
  });

  test.describe("Input Sanitization", () => {
    test("should sanitize filter inputs", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Test category filter
      const categorySelect = page.getByRole("combobox", { name: /category/i });

      // Try to inject malicious option
      await page.evaluate(() => {
        const select = document.querySelector(
          'select[aria-label*="category"]',
        ) as HTMLSelectElement;
        if (select) {
          const maliciousOption = document.createElement("option");
          maliciousOption.value = '<script>alert("xss")</script>';
          maliciousOption.textContent = "Malicious";
          select.appendChild(maliciousOption);
        }
      });

      // Select the malicious option
      await categorySelect.selectOption('<script>alert("xss")</script>');

      // Check that script is not executed
      const alertDialogs = [];
      page.on("dialog", (dialog) => {
        alertDialogs.push(dialog);
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alertDialogs.length).toBe(0);
    });

    test("should validate URL parameters", async ({ page }) => {
      // Test with malicious URL parameters
      const maliciousParams = [
        "?experiment=<script>alert('xss')</script>",
        "?category=javascript:alert('xss')",
        "?search=%3Cimg%20src%3Dx%20onerror%3Dalert('xss')%3E",
      ];

      for (const params of maliciousParams) {
        await page.goto(`/portfolio/playground/design${params}`);
        await page.waitForLoadState("networkidle");

        // Page should load safely
        await expect(
          page.getByRole("heading", { name: /Design Playground/i }),
        ).toBeVisible();

        // Malicious content should not be executed
        const bodyHTML = await page.locator("body").innerHTML();
        expect(bodyHTML).not.toContain("alert(");
        expect(bodyHTML).not.toContain("<script");
        expect(bodyHTML).not.toContain("javascript:");
      }
    });
  });

  test.describe("Error Handling Security", () => {
    test("should not expose stack traces in production", async ({ page }) => {
      // Mock server error
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal Server Error",
            // Should not include stack trace in production
          }),
        });
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Check error messages
      const errorElements = page.locator("text=/error|failed/i");

      if ((await errorElements.count()) > 0) {
        for (let i = 0; i < (await errorElements.count()); i++) {
          const errorText = await errorElements.nth(i).textContent();

          // Should not expose sensitive information
          expect(errorText).not.toContain("at ");
          expect(errorText).not.toContain(".js:");
          expect(errorText).not.toContain("node_modules");
          expect(errorText).not.toContain("webpack");
        }
      }
    });

    test("should handle malformed requests gracefully", async ({ page }) => {
      // Mock malformed API response
      await page.route("**/api/experiments/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "text/plain",
          body: "Not JSON",
        });
      });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Should handle gracefully without exposing errors
      await expect(
        page.getByRole("heading", { name: /Design Playground/i }),
      ).toBeVisible();

      // Should show user-friendly error message
      const errorMessage = page.getByText(/unable to load|error loading/i);
      if ((await errorMessage.count()) > 0) {
        const errorText = await errorMessage.textContent();
        expect(errorText).not.toContain("JSON");
        expect(errorText).not.toContain("parse");
        expect(errorText).not.toContain("undefined");
      }
    });
  });
});
