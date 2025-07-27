/**
 * Tests for error tracking system
 */

import { errorTracker, captureError } from "../error-tracking";

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
  (fetch as jest.Mock).mockClear();

  // Clear previous errors
  errorTracker.cleanup(new Date());
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe("ErrorTracker", () => {
  describe("error capture", () => {
    it("should capture basic error", () => {
      const error = new Error("Test error");

      captureError(error);

      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error");
      expect(errors[0].severity).toBe("medium");
      expect(errors[0].category).toBe("javascript");
      expect(errors[0].resolved).toBe(false);
    });

    it("should capture error with context", () => {
      const error = new Error("Network error");
      const context = { type: "network", url: "/api/test" };

      captureError(error, context, "high");

      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].context).toEqual(context);
      expect(errors[0].severity).toBe("high");
      expect(errors[0].category).toBe("network");
    });

    it("should categorize errors correctly", () => {
      const networkError = new Error("fetch failed");
      const performanceError = new Error("performance issue");
      const userError = new Error("user action failed");
      const systemError = new Error("memory allocation failed");

      captureError(networkError, { type: "network" });
      captureError(performanceError, { type: "performance" });
      captureError(userError, { type: "user" });
      captureError(systemError);

      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(4);
      expect(errors.find((e) => e.message === "fetch failed")?.category).toBe(
        "network",
      );
      expect(
        errors.find((e) => e.message === "performance issue")?.category,
      ).toBe("performance");
      expect(
        errors.find((e) => e.message === "user action failed")?.category,
      ).toBe("user");
      expect(
        errors.find((e) => e.message === "memory allocation failed")?.category,
      ).toBe("system");
    });

    it("should send error report to API", () => {
      const error = new Error("API test error");

      captureError(error);

      expect(fetch).toHaveBeenCalledWith("/api/monitoring/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("API test error"),
      });
    });
  });

  describe("error filtering", () => {
    beforeEach(() => {
      // Clear previous errors
      errorTracker.cleanup(new Date());

      // Add test errors
      captureError(new Error("Critical error"), undefined, "critical");
      captureError(new Error("High error"), undefined, "high");
      captureError(new Error("Medium error"), undefined, "medium");
      captureError(new Error("Low error"), undefined, "low");
      captureError(new Error("Network error"), { type: "network" });
      captureError(new Error("Performance error"), { type: "performance" });
    });

    it("should filter by severity", () => {
      const criticalErrors = errorTracker.getErrors({ severity: "critical" });
      const highErrors = errorTracker.getErrors({ severity: "high" });

      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].message).toBe("Critical error");
      expect(highErrors).toHaveLength(1);
      expect(highErrors[0].message).toBe("High error");
    });

    it("should filter by category", () => {
      const networkErrors = errorTracker.getErrors({ category: "network" });
      const performanceErrors = errorTracker.getErrors({
        category: "performance",
      });

      expect(networkErrors).toHaveLength(1);
      expect(networkErrors[0].message).toBe("Network error");
      expect(performanceErrors).toHaveLength(1);
      expect(performanceErrors[0].message).toBe("Performance error");
    });

    it("should filter by resolved status", () => {
      const errors = errorTracker.getErrors();
      const firstError = errors[0];

      errorTracker.resolveError(firstError.id);

      const unresolvedErrors = errorTracker.getErrors({ resolved: false });
      const resolvedErrors = errorTracker.getErrors({ resolved: true });

      expect(unresolvedErrors).toHaveLength(errors.length - 1);
      expect(resolvedErrors).toHaveLength(1);
      expect(resolvedErrors[0].id).toBe(firstError.id);
    });

    it("should filter by date", () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentErrors = errorTracker.getErrors({ since: oneHourAgo });

      expect(recentErrors.length).toBeGreaterThan(0);

      const futureDate = new Date(Date.now() + 3600000);
      const futureErrors = errorTracker.getErrors({ since: futureDate });

      expect(futureErrors).toHaveLength(0);
    });
  });

  describe("error statistics", () => {
    beforeEach(() => {
      errorTracker.cleanup(new Date());

      captureError(new Error("Critical 1"), undefined, "critical");
      captureError(new Error("Critical 2"), undefined, "critical");
      captureError(new Error("High 1"), undefined, "high");
      captureError(new Error("Medium 1"), undefined, "medium");
      captureError(new Error("Network 1"), { type: "network" });
      captureError(new Error("Performance 1"), { type: "performance" });

      const errors = errorTracker.getErrors();
      errorTracker.resolveError(errors[0].id);
    });

    it("should calculate error statistics correctly", () => {
      const stats = errorTracker.getErrorStats();

      expect(stats.total).toBe(6);
      expect(stats.bySeverity.critical).toBe(2);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.medium).toBe(3); // medium is default
      expect(stats.byCategory.network).toBe(1);
      expect(stats.byCategory.performance).toBe(1);
      expect(stats.byCategory.javascript).toBe(4); // javascript is default
      expect(stats.resolved).toBe(1);
      expect(stats.unresolved).toBe(5);
    });
  });

  describe("performance issue tracking", () => {
    it("should track performance issues", () => {
      const performanceIssues = errorTracker.getPerformanceIssues();

      // Performance issues are tracked automatically by the performance monitor
      // This test verifies the getter works
      expect(Array.isArray(performanceIssues)).toBe(true);
    });

    it("should filter performance issues by type", () => {
      const lcpIssues = errorTracker.getPerformanceIssues({ type: "lcp" });
      const fidIssues = errorTracker.getPerformanceIssues({ type: "fid" });

      expect(Array.isArray(lcpIssues)).toBe(true);
      expect(Array.isArray(fidIssues)).toBe(true);
    });

    it("should filter performance issues by date", () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentIssues = errorTracker.getPerformanceIssues({
        since: oneHourAgo,
      });

      expect(Array.isArray(recentIssues)).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should clean up old errors", () => {
      captureError(new Error("Test error"));

      const beforeCleanup = errorTracker.getErrors();
      expect(beforeCleanup.length).toBeGreaterThan(0);

      // Clean up everything older than 1 second from now
      const futureDate = new Date(Date.now() + 1000);
      errorTracker.cleanup(futureDate);

      const afterCleanup = errorTracker.getErrors();
      expect(afterCleanup).toHaveLength(0);
    });

    it("should keep recent errors during cleanup", () => {
      captureError(new Error("Recent error"));

      // Clean up everything older than 1 hour ago
      const oneHourAgo = new Date(Date.now() - 3600000);
      errorTracker.cleanup(oneHourAgo);

      const errors = errorTracker.getErrors();
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
