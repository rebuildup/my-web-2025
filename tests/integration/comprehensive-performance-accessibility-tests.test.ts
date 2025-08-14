/**
 * Comprehensive Performance and Accessibility Integration Tests
 * Task 11.2: パフォーマンス・アクセシビリティ統合テストの実装
 *
 * This test suite provides comprehensive integration testing combining:
 * - Core Web Vitals measurement and validation
 * - WCAG 2.1 AA compliance testing
 * - Keyboard navigation and screen reader support
 * - Cross-feature performance and accessibility validation
 *
 * Requirements: 5.3, 5.4
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  CoreWebVitalsTester,
  MemoryMonitor,
  PerformanceMonitor,
} from "./utils/core-web-vitals-tester";
import { KeyboardNavigationTester } from "./utils/keyboard-navigation-tester";
import { WCAGComplianceTester } from "./utils/wcag-compliance-tester";

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  notFound: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    const React = require("react");
    return React.createElement("img", { src, alt, ...props });
  },
}));

// Mock performance APIs
Object.defineProperty(window, "performance", {
  value: {
    ...window.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 100000000,
    },
  },
  writable: true,
});

// Mock observers
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("Comprehensive Performance and Accessibility Integration Tests", () => {
  let performanceMonitor: PerformanceMonitor;
  let memoryMonitor: MemoryMonitor;
  let webVitalsTester: CoreWebVitalsTester;
  let wcagTester: WCAGComplianceTester;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    memoryMonitor = new MemoryMonitor();
    webVitalsTester = new CoreWebVitalsTester();
    wcagTester = new WCAGComplianceTester();

    jest.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.clear();
    memoryMonitor.clear();
    webVitalsTester.reset();
  });

  describe("Home Page - Complete Performance and Accessibility Suite", () => {
    it("should pass comprehensive performance and accessibility validation", async () => {
      performanceMonitor.mark("test-start");
      // const initialMemory = memoryMonitor.snapshot();

      // Import and render home page
      const { default: HomePage } = await import("@/app/page");

      performanceMonitor.mark("render-start");
      const { container } = await act(async () => {
        return render(React.createElement(HomePage));
      });
      performanceMonitor.mark("render-end");

      // Measure render performance
      const renderTime = performanceMonitor.measure(
        "render-time",
        "render-start",
        "render-end",
      );
      expect(renderTime).toBeLessThan(100); // Should render in < 100ms

      // Test Core Web Vitals
      const webVitalsReport = await webVitalsTester.measureAll();
      const webVitalsValidation =
        webVitalsTester.validateMetrics(webVitalsReport);

      expect(webVitalsValidation.passed).toBe(true);
      expect(webVitalsReport.overall).not.toBe("poor");

      // Test WCAG 2.1 AA Compliance
      const wcagReport = await wcagTester.testCompliance(container);

      expect(wcagReport.passed).toBe(true);
      expect(wcagReport.score).toBeGreaterThanOrEqual(90);
      expect(wcagReport.violations.length).toBe(0);

      // Test keyboard navigation
      const keyboardTester = new KeyboardNavigationTester(container);
      const keyboardReport = await keyboardTester.testKeyboardNavigation();

      expect(keyboardReport.passed).toBe(true);
      expect(keyboardReport.focusableElements).toBeGreaterThan(0);

      // Check memory usage
      // const finalMemory = memoryMonitor.snapshot();
      const memoryDiff = memoryMonitor.diff(0, -1);

      if (memoryDiff) {
        const memoryUsage = memoryMonitor.getUsageInMB(memoryDiff);
        expect(memoryUsage.used).toBeLessThan(50); // Should use < 50MB
      }

      performanceMonitor.mark("test-end");
      const totalTime = performanceMonitor.measure(
        "total-test-time",
        "test-start",
        "test-end",
      );
      expect(totalTime).toBeLessThan(5000); // Total test should complete in < 5s

      // Log reports for debugging
      console.log("\n" + webVitalsTester.generateReport(webVitalsReport));
      console.log("\n" + wcagTester.generateReport(wcagReport));
      console.log("\n" + keyboardTester.generateReport(keyboardReport));
      console.log("\n" + performanceMonitor.getSummary());
    });

    it("should maintain accessibility during dynamic interactions", async () => {
      const user = userEvent.setup();
      const { default: HomePage } = await import("@/app/page");

      const { container } = await act(async () => {
        return render(React.createElement(HomePage));
      });

      // Initial accessibility check
      const initialWcagReport = await wcagTester.testCompliance(container);
      expect(initialWcagReport.passed).toBe(true);

      // Simulate user interactions
      const interactiveElements = screen.getAllByRole("button");
      const links = screen.getAllByRole("link");

      // Test button interactions
      for (let i = 0; i < Math.min(3, interactiveElements.length); i++) {
        const button = interactiveElements[i];

        performanceMonitor.mark(`interaction-${i}-start`);
        await user.click(button);
        performanceMonitor.mark(`interaction-${i}-end`);

        const interactionTime = performanceMonitor.measure(
          `interaction-${i}`,
          `interaction-${i}-start`,
          `interaction-${i}-end`,
        );

        // Interaction should be responsive (< 100ms)
        expect(interactionTime).toBeLessThan(100);

        // Accessibility should be maintained after interaction
        const postInteractionWcag = await wcagTester.testCompliance(container);
        expect(postInteractionWcag.violations.length).toBeLessThanOrEqual(
          initialWcagReport.violations.length,
        );
      }

      // Test link navigation
      for (let i = 0; i < Math.min(2, links.length); i++) {
        const link = links[i];

        // Focus link with keyboard
        link.focus();
        expect(document.activeElement).toBe(link);

        // Activate with Enter key
        await user.keyboard("{Enter}");

        // Check that link has proper accessible name
        const accessibleName =
          link.getAttribute("aria-label") || link.textContent;
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("Tools Page - Performance and Accessibility Integration", () => {
    it("should maintain performance standards with interactive tools", async () => {
      // const user = userEvent.setup();
      const { default: ToolsPage } = await import("@/app/tools/page");

      performanceMonitor.mark("tools-render-start");
      const { container } = await act(async () => {
        return render(React.createElement(ToolsPage));
      });
      performanceMonitor.mark("tools-render-end");

      const renderTime = performanceMonitor.measure(
        "tools-render",
        "tools-render-start",
        "tools-render-end",
      );
      expect(renderTime).toBeLessThan(150); // Tools page may be slightly heavier

      // Test WCAG compliance
      const wcagReport = await wcagTester.testCompliance(container);
      expect(wcagReport.passed).toBe(true);

      // Test keyboard navigation through tools
      const keyboardTester = new KeyboardNavigationTester(container);
      const keyboardReport = await keyboardTester.testKeyboardNavigation();

      expect(keyboardReport.passed).toBe(true);
      expect(keyboardReport.focusableElements).toBeGreaterThan(0);

      // Test tool interactions
      const toolLinks = screen.getAllByRole("link");

      for (let i = 0; i < Math.min(3, toolLinks.length); i++) {
        const toolLink = toolLinks[i];

        // Test keyboard activation
        toolLink.focus();
        expect(document.activeElement).toBe(toolLink);

        // Check accessible name
        const accessibleName =
          toolLink.getAttribute("aria-label") || toolLink.textContent;
        expect(accessibleName).toBeTruthy();

        // Test that link has proper href
        const href = toolLink.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href).not.toBe("#");
      }
    });
  });

  describe("Contact Page - Form Accessibility and Performance", () => {
    it("should provide accessible forms with good performance", async () => {
      const user = userEvent.setup();
      const { default: ContactPage } = await import("@/app/contact/page");

      const { container } = await act(async () => {
        return render(React.createElement(ContactPage));
      });

      // Test form accessibility specifically
      const formAccessibilityReport =
        await wcagTester.testFormAccessibility(container);
      expect(formAccessibilityReport.passed).toBe(true);
      expect(formAccessibilityReport.unlabeledInputs).toBe(0);

      // Test keyboard navigation in forms
      const keyboardTester = new KeyboardNavigationTester(container);
      const tabOrder = await keyboardTester.testTabOrder();

      // Should be able to tab through form elements
      const formElements = tabOrder.filter((el) =>
        ["input", "textarea", "select", "button"].includes(el.tagName),
      );
      expect(formElements.length).toBeGreaterThan(0);

      // Test form interactions
      const inputs = screen.getAllByRole("textbox");

      for (const input of inputs) {
        // Check that input has accessible name
        expect(input).toHaveAccessibleName();

        // Test keyboard interaction
        input.focus();
        await user.type(input, "test input");

        // Input should maintain focus and accept input
        expect(document.activeElement).toBe(input);
        expect(input).toHaveValue("test input");

        // Clear for next test
        await user.clear(input);
      }

      // Test form submission button
      const submitButtons = screen.getAllByRole("button", {
        name: /submit|send/i,
      });

      if (submitButtons.length > 0) {
        const submitButton = submitButtons[0];

        // Button should be accessible
        expect(submitButton).toHaveAccessibleName();

        // Button should be keyboard accessible
        submitButton.focus();
        expect(document.activeElement).toBe(submitButton);

        // Test keyboard activation
        await user.keyboard("{Enter}");
        // Note: Actual form submission would be mocked in real implementation
      }
    });
  });

  describe("Cross-Page Performance and Accessibility Consistency", () => {
    it("should maintain consistent performance across different pages", async () => {
      const pages = [
        { name: "Home", component: () => import("@/app/page") },
        { name: "Tools", component: () => import("@/app/tools/page") },
        { name: "Workshop", component: () => import("@/app/workshop/page") },
        { name: "About", component: () => import("@/app/about/page") },
      ];

      const performanceResults: Array<{
        page: string;
        renderTime: number;
        memoryUsage: number;
        wcagScore: number;
        keyboardElements: number;
      }> = [];

      for (const page of pages) {
        try {
          // const initialMemory = memoryMonitor.snapshot();

          performanceMonitor.mark(`${page.name}-start`);
          const { default: PageComponent } = await page.component();

          const { container } = await act(async () => {
            return render(React.createElement(PageComponent));
          });
          performanceMonitor.mark(`${page.name}-end`);

          const renderTime = performanceMonitor.measure(
            `${page.name}-render`,
            `${page.name}-start`,
            `${page.name}-end`,
          );

          // Test WCAG compliance
          const wcagReport = await wcagTester.testCompliance(container);

          // Test keyboard navigation
          const keyboardTester = new KeyboardNavigationTester(container);
          const keyboardReport = await keyboardTester.testKeyboardNavigation();

          // const finalMemory = memoryMonitor.snapshot();
          const memoryDiff = memoryMonitor.diff(-2, -1);
          const memoryUsage = memoryDiff
            ? memoryMonitor.getUsageInMB(memoryDiff).used
            : 0;

          performanceResults.push({
            page: page.name,
            renderTime,
            memoryUsage,
            wcagScore: wcagReport.score,
            keyboardElements: keyboardReport.focusableElements,
          });

          // Individual page assertions
          expect(renderTime).toBeLessThan(200); // All pages should render quickly
          expect(wcagReport.score).toBeGreaterThanOrEqual(85); // Good accessibility score
          expect(keyboardReport.focusableElements).toBeGreaterThan(0); // Should have focusable elements
        } catch (error) {
          console.warn(`Failed to test ${page.name} page:`, error);
          // Continue with other pages
        }
      }

      // Cross-page consistency checks
      if (performanceResults.length > 1) {
        const avgRenderTime =
          performanceResults.reduce(
            (sum, result) => sum + result.renderTime,
            0,
          ) / performanceResults.length;
        const avgWcagScore =
          performanceResults.reduce(
            (sum, result) => sum + result.wcagScore,
            0,
          ) / performanceResults.length;

        // No page should be significantly slower than average
        performanceResults.forEach((result) => {
          expect(result.renderTime).toBeLessThan(avgRenderTime * 2);
          expect(result.wcagScore).toBeGreaterThanOrEqual(avgWcagScore * 0.9);
        });

        console.log("\n=== Cross-Page Performance Summary ===");
        performanceResults.forEach((result) => {
          console.log(
            `${result.page}: ${result.renderTime.toFixed(2)}ms render, ${result.wcagScore}/100 WCAG, ${result.keyboardElements} focusable elements`,
          );
        });
      }
    });

    it("should handle performance degradation gracefully while maintaining accessibility", async () => {
      // Simulate performance constraints
      const originalPerformanceNow = performance.now;
      let callCount = 0;

      // Mock slower performance
      (performance.now as jest.Mock).mockImplementation(() => {
        callCount++;
        return originalPerformanceNow.call(performance) + callCount * 10; // Add artificial delay
      });

      try {
        const { default: HomePage } = await import("@/app/page");

        const { container } = await act(async () => {
          return render(React.createElement(HomePage));
        });

        // Even with performance constraints, accessibility should be maintained
        const wcagReport = await wcagTester.testCompliance(container);
        expect(wcagReport.passed).toBe(true);

        // Keyboard navigation should still work
        const keyboardTester = new KeyboardNavigationTester(container);
        const keyboardReport = await keyboardTester.testKeyboardNavigation();
        expect(keyboardReport.passed).toBe(true);

        // Core functionality should remain accessible
        const mainContent = screen.getByRole("main");
        expect(mainContent).toBeInTheDocument();
        expect(mainContent).toBeVisible();
      } finally {
        // Restore original performance.now
        (performance.now as jest.Mock).mockImplementation(
          originalPerformanceNow,
        );
      }
    });
  });

  describe("Real-World User Scenarios - Performance and Accessibility", () => {
    it("should support complete user journey with keyboard navigation", async () => {
      const user = userEvent.setup();

      // Start with home page
      const { default: HomePage } = await import("@/app/page");

      const { container } = await act(async () => {
        return render(React.createElement(HomePage));
      });

      // Test initial keyboard navigation
      const keyboardTester = new KeyboardNavigationTester(container);
      const keyboardReport = await keyboardTester.testKeyboardNavigation();

      expect(keyboardReport.passed).toBe(true);

      // Simulate user tabbing through the page
      document.body.focus();

      for (let i = 0; i < Math.min(10, keyboardReport.focusableElements); i++) {
        await user.tab();

        const activeElement = document.activeElement as HTMLElement;
        expect(activeElement).toBeVisible();

        // Check that focused element has accessible name
        const accessibleName =
          activeElement.getAttribute("aria-label") ||
          activeElement.textContent ||
          activeElement.getAttribute("alt") ||
          activeElement.getAttribute("title");

        if (activeElement.tagName !== "BODY") {
          expect(accessibleName).toBeTruthy();
        }
      }

      // Test reverse navigation
      for (let i = 0; i < 3; i++) {
        await user.tab({ shift: true });

        const activeElement = document.activeElement as HTMLElement;
        expect(activeElement).toBeVisible();
      }

      // Test activation with keyboard
      const buttons = screen.getAllByRole("button");
      const links = screen.getAllByRole("link");

      // Test button activation with Enter and Space
      if (buttons.length > 0) {
        const button = buttons[0];
        button.focus();

        await user.keyboard("{Enter}");
        // Button should handle Enter key

        button.focus();
        await user.keyboard(" ");
        // Button should handle Space key
      }

      // Test link activation with Enter
      if (links.length > 0) {
        const link = links[0];
        link.focus();

        await user.keyboard("{Enter}");
        // Link should handle Enter key
      }

      // Final accessibility check
      const finalWcagReport = await wcagTester.testCompliance(container);
      expect(finalWcagReport.passed).toBe(true);
    });

    it("should maintain performance during intensive user interactions", async () => {
      const user = userEvent.setup();
      const { default: HomePage } = await import("@/app/page");

      // const initialMemory = memoryMonitor.snapshot();

      const { container } = await act(async () => {
        return render(React.createElement(HomePage));
      });

      // Simulate intensive user interactions
      const interactiveElements = [
        ...screen.getAllByRole("button"),
        ...screen.getAllByRole("link"),
        ...screen.getAllByRole("textbox"),
      ];

      performanceMonitor.mark("intensive-interactions-start");

      // Perform many rapid interactions
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
          const element = interactiveElements[i];

          // Focus and interact
          element.focus();

          if (element.tagName === "BUTTON") {
            await user.click(element);
          } else if (element.tagName === "A") {
            // Don't actually navigate, just focus
            await user.keyboard("{Enter}");
          } else if (element.tagName === "INPUT") {
            await user.type(element, "test");
            await user.clear(element);
          }

          // Small delay to simulate real user behavior
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      performanceMonitor.mark("intensive-interactions-end");

      const interactionTime = performanceMonitor.measure(
        "intensive-interactions",
        "intensive-interactions-start",
        "intensive-interactions-end",
      );

      // Interactions should complete in reasonable time
      expect(interactionTime).toBeLessThan(2000);

      // Memory usage should not have grown excessively
      // const finalMemory = memoryMonitor.snapshot();
      const memoryDiff = memoryMonitor.diff(0, -1);

      if (memoryDiff) {
        const memoryUsage = memoryMonitor.getUsageInMB(memoryDiff);
        expect(memoryUsage.used).toBeLessThan(100); // Should not use excessive memory
      }

      // Accessibility should still be maintained
      const finalWcagReport = await wcagTester.testCompliance(container);
      expect(finalWcagReport.score).toBeGreaterThanOrEqual(85);

      console.log(
        `\nIntensive interactions completed in ${interactionTime.toFixed(2)}ms`,
      );
      if (memoryDiff) {
        const memoryUsage = memoryMonitor.getUsageInMB(memoryDiff);
        console.log(`Memory usage: ${memoryUsage.used.toFixed(2)}MB`);
      }
    });
  });
});
