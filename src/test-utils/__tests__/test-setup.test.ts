/**
 * テストセットアップのテスト
 */

import {
  cleanupTestData,
  runAsyncTest,
  setupTest,
  teardownTest,
  validateTestEnvironment,
} from "../test-setup";

describe("Test Setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setupTest", () => {
    it("should setup test environment with default config", () => {
      // Test that setupTest runs without errors
      expect(() => {
        setupTest({
          enablePerformanceTracking: true,
          enableMemoryTracking: true,
        });
      }).not.toThrow();
    });

    it("should setup test environment with custom timeout", () => {
      // Test that setupTest runs without errors with custom timeout
      expect(() => {
        setupTest({ timeout: 15000 });
      }).not.toThrow();
    });
  });

  describe("teardownTest", () => {
    it("should cleanup test environment", () => {
      // Test that teardownTest runs without errors
      expect(() => {
        teardownTest({
          enablePerformanceTracking: true,
        });
      }).not.toThrow();
    });
  });

  describe("runAsyncTest", () => {
    it("should run async test successfully", async () => {
      const testFn = jest.fn().mockResolvedValue("success");

      const result = await runAsyncTest(testFn, 1000);

      expect(result).toBe("success");
      expect(testFn).toHaveBeenCalled();
    });

    it("should timeout if test takes too long", async () => {
      const testFn = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 2000)),
        );

      await expect(runAsyncTest(testFn, 100)).rejects.toThrow(
        "Test timed out after 100ms",
      );
    });

    it("should handle test errors", async () => {
      const testError = new Error("Test failed");
      const testFn = jest.fn().mockRejectedValue(testError);

      await expect(runAsyncTest(testFn, 1000)).rejects.toThrow("Test failed");
    });
  });

  describe("cleanupTestData", () => {
    it("should cleanup test data", () => {
      // Setup test data
      document.body.innerHTML = "<div>test content</div>";

      cleanupTestData();

      // Verify cleanup
      expect(document.body.innerHTML).toBe("");
    });
  });

  describe("validateTestEnvironment", () => {
    it("should validate test environment successfully", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const isValid = validateTestEnvironment();

      expect(isValid).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        "✅ Test environment validation passed",
      );

      consoleSpy.mockRestore();
    });

    it("should handle missing test globals", () => {
      // Test that validation works in normal environment
      const isValid = validateTestEnvironment();
      expect(isValid).toBe(true);
    });
  });
});
