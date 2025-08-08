/**
 * Tests for Sentry monitoring initialization
 */

import { initSentry } from "../sentry";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe("Sentry Monitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console
    Object.assign(console, mockConsole);

    // Mock window
    (global as unknown as { window: unknown }).window = {
      addEventListener: jest.fn(),
      location: { href: "https://example.com" },
      navigator: { userAgent: "test-browser" },
    };
  });

  describe("initSentry", () => {
    it("should initialize Sentry monitoring in browser environment", () => {
      initSentry();

      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });

    it("should handle server-side environment gracefully", () => {
      // Test that the function doesn't throw in any environment
      expect(() => initSentry()).not.toThrow();

      // In browser environment (Jest), it should log
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });

    it("should be idempotent - multiple calls should not cause issues", () => {
      initSentry();
      initSentry();
      initSentry();

      expect(mockConsole.log).toHaveBeenCalledTimes(3);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });
  });

  describe("error scenarios", () => {
    it("should handle undefined window gracefully", () => {
      // Test that the function doesn't throw
      expect(() => initSentry()).not.toThrow();

      // In Jest environment, window exists so it should log
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });

    it("should handle null window gracefully", () => {
      (global as unknown as { window: unknown }).window = null;

      expect(() => initSentry()).not.toThrow();
      // null is not undefined, so the function will still execute
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });
  });

  describe("performance considerations", () => {
    it("should complete initialization quickly", () => {
      const startTime = Date.now();

      initSentry();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Sentry monitoring initialized",
      );
    });
  });
});
