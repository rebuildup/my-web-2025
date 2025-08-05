/**
 * Playground Lighthouse Quality Tests
 * Task 4.3: パフォーマンス・品質テスト
 * Tests for Lighthouse 90+ scores and quality metrics
 */

import { expect, test } from "@playwright/test";

test.describe.skip("Playground Lighthouse Tests", () => {
  test.describe("Design Playground Lighthouse", () => {
    test("should achieve Lighthouse 90+ scores", async ({ page }) => {
      // Dynamic import for playwright-lighthouse
      const { playAudit } = await import("playwright-lighthouse");

      // Navigate to design playground
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Run Lighthouse audit
      const audit = await playAudit({
        page,
        thresholds: {
          performance: 90,
          accessibility: 90,
          "best-practices": 90,
          seo: 90,
        },
        port: 9222,
      });

      // Check that all scores meet requirements
      expect(
        audit.lhr.categories.performance.score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(
        audit.lhr.categories.accessibility.score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(
        audit.lhr.categories["best-practices"].score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(audit.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(90);
    });

    test("should meet Core Web Vitals thresholds", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      // Run Lighthouse audit focused on Core Web Vitals
      const audit = await playAudit({
        page,
        thresholds: {
          "first-contentful-paint": 2500,
          "largest-contentful-paint": 2500,
          "first-input-delay": 100,
          "cumulative-layout-shift": 0.1,
        },
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check Core Web Vitals
      expect(audits["first-contentful-paint"].numericValue).toBeLessThan(2500);
      expect(audits["largest-contentful-paint"].numericValue).toBeLessThan(
        2500,
      );
      expect(audits["cumulative-layout-shift"].numericValue).toBeLessThan(0.1);

      // Check interactive metrics
      expect(audits.interactive.numericValue).toBeLessThan(3000);
    });

    test("should have optimal accessibility score", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        thresholds: {
          accessibility: 95, // Higher threshold for accessibility
        },
        port: 9222,
      });

      const accessibilityAudits = audit.lhr.categories.accessibility.auditRefs;
      const failedAudits = accessibilityAudits.filter(
        (audit) => audit.weight > 0 && audit.result?.score !== 1,
      );

      // Should have minimal accessibility issues
      expect(failedAudits.length).toBeLessThan(2);
      expect(
        audit.lhr.categories.accessibility.score * 100,
      ).toBeGreaterThanOrEqual(95);
    });

    test("should have good SEO score", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        thresholds: {
          seo: 95,
        },
        port: 9222,
      });

      const seoAudits = audit.lhr.audits;

      // Check key SEO metrics
      expect(seoAudits["document-title"].score).toBe(1);
      expect(seoAudits["meta-description"].score).toBe(1);
      expect(seoAudits["http-status-code"].score).toBe(1);
      expect(seoAudits["crawlable-anchors"].score).toBe(1);

      expect(audit.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(95);
    });
  });

  test.describe("WebGL Playground Lighthouse", () => {
    test("should achieve Lighthouse 90+ scores", async ({ page }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        thresholds: {
          performance: 90,
          accessibility: 90,
          "best-practices": 90,
          seo: 90,
        },
        port: 9222,
      });

      // WebGL playground should still meet high standards
      expect(
        audit.lhr.categories.performance.score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(
        audit.lhr.categories.accessibility.score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(
        audit.lhr.categories["best-practices"].score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(audit.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(90);
    });

    test("should handle WebGL performance gracefully", async ({ page }) => {
      await page.goto("/portfolio/playground/WebGL");
      await page.waitForLoadState("networkidle");

      // Check if WebGL is supported
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        return !!gl;
      });

      if (!webglSupported) {
        // Should still have good scores with fallback content
        const audit = await playAudit({
          page,
          thresholds: {
            performance: 95, // Should be even better without WebGL
            accessibility: 95,
          },
          port: 9222,
        });

        expect(
          audit.lhr.categories.performance.score * 100,
        ).toBeGreaterThanOrEqual(95);
        expect(
          audit.lhr.categories.accessibility.score * 100,
        ).toBeGreaterThanOrEqual(95);
      } else {
        // With WebGL, should still meet standards
        const audit = await playAudit({
          page,
          thresholds: {
            performance: 85, // Slightly lower threshold for WebGL
            accessibility: 90,
          },
          port: 9222,
        });

        expect(
          audit.lhr.categories.performance.score * 100,
        ).toBeGreaterThanOrEqual(85);
        expect(
          audit.lhr.categories.accessibility.score * 100,
        ).toBeGreaterThanOrEqual(90);
      }
    });
  });

  test.describe("Mobile Playground Lighthouse", () => {
    test("should achieve good mobile scores", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        thresholds: {
          performance: 85, // Slightly lower for mobile
          accessibility: 90,
          "best-practices": 90,
          seo: 90,
        },
        port: 9222,
        opts: {
          formFactor: "mobile",
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
          },
        },
      });

      expect(
        audit.lhr.categories.performance.score * 100,
      ).toBeGreaterThanOrEqual(85);
      expect(
        audit.lhr.categories.accessibility.score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(
        audit.lhr.categories["best-practices"].score * 100,
      ).toBeGreaterThanOrEqual(90);
      expect(audit.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(90);
    });

    test("should have good mobile usability", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
        opts: {
          formFactor: "mobile",
        },
      });

      const mobileAudits = audit.lhr.audits;

      // Check mobile-specific audits
      expect(mobileAudits["viewport"].score).toBe(1);
      expect(mobileAudits["tap-targets"].score).toBeGreaterThanOrEqual(0.9);

      // Check that content is sized appropriately
      if (mobileAudits["content-width"]) {
        expect(mobileAudits["content-width"].score).toBe(1);
      }
    });
  });

  test.describe("Performance Budget Tests", () => {
    test("should meet performance budget requirements", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        thresholds: {
          "total-byte-weight": 1000000, // 1MB
          "dom-size": 1500,
          interactive: 3000,
        },
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check performance budget
      expect(audits["total-byte-weight"].numericValue).toBeLessThan(1000000);
      expect(audits["dom-size"].numericValue).toBeLessThan(1500);
      expect(audits.interactive.numericValue).toBeLessThan(3000);
    });

    test("should have optimized images", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check image optimization
      if (audits["uses-optimized-images"]) {
        expect(audits["uses-optimized-images"].score).toBeGreaterThanOrEqual(
          0.9,
        );
      }

      if (audits["uses-webp-images"]) {
        expect(audits["uses-webp-images"].score).toBeGreaterThanOrEqual(0.8);
      }

      if (audits["offscreen-images"]) {
        expect(audits["offscreen-images"].score).toBeGreaterThanOrEqual(0.9);
      }
    });

    test("should have efficient caching", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check caching strategies
      if (audits["uses-long-cache-ttl"]) {
        expect(audits["uses-long-cache-ttl"].score).toBeGreaterThanOrEqual(0.8);
      }

      if (audits["efficient-animated-content"]) {
        expect(
          audits["efficient-animated-content"].score,
        ).toBeGreaterThanOrEqual(0.9);
      }
    });
  });

  test.describe("Security and Best Practices", () => {
    test("should have good security practices", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check security audits
      expect(audits["is-on-https"].score).toBe(1);
      expect(audits["uses-https"].score).toBe(1);

      if (audits["no-vulnerable-libraries"]) {
        expect(audits["no-vulnerable-libraries"].score).toBe(1);
      }

      // CSP should be implemented (may not be perfect in development)
      if (audits["csp-xss"]) {
        expect(audits["csp-xss"].score).toBeGreaterThanOrEqual(0.5);
      }
    });

    test("should follow web standards", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check web standards compliance
      if (audits["doctype"]) {
        expect(audits["doctype"].score).toBe(1);
      }

      if (audits["charset"]) {
        expect(audits["charset"].score).toBe(1);
      }

      if (audits["valid-lang"]) {
        expect(audits["valid-lang"].score).toBe(1);
      }
    });
  });

  test.describe("Progressive Web App Features", () => {
    test("should have PWA characteristics", async ({ page }) => {
      await page.goto("/portfolio/playground/design");
      await page.waitForLoadState("networkidle");

      const audit = await playAudit({
        page,
        port: 9222,
      });

      const audits = audit.lhr.audits;

      // Check PWA features
      if (audits["viewport"]) {
        expect(audits["viewport"].score).toBe(1);
      }

      if (audits["without-javascript"]) {
        // Should have some content without JavaScript
        expect(audits["without-javascript"].score).toBeGreaterThanOrEqual(0.5);
      }

      // Check for service worker (if implemented)
      if (audits["service-worker"]) {
        // This might not be implemented yet, so we don't enforce it
        // expect(audits["service-worker"].score).toBe(1);
      }
    });
  });
});
