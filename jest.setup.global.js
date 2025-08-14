/**
 * Global Jest setup for performance optimization and coverage enforcement
 * This file runs before Jest globals are available, so it only contains
 * environment setup and utility functions.
 */

// Performance monitoring
const startTime = Date.now();

// Memory usage tracking
const trackMemoryUsage = () => {
  if (
    process.env.NODE_ENV === "coverage" ||
    process.env.JEST_COVERAGE === "true"
  ) {
    const memUsage = process.memoryUsage();
    console.log(
      `Memory Usage - RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    );
  }
};

// Initialize global test environment
global.testStartTime = Date.now();

// Configure console for test environment
if (process.env.CI === "true") {
  // Reduce console noise in CI
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: () => {}, // Silent in CI
    debug: () => {}, // Silent in CI
    info: () => {}, // Silent in CI
    warn: originalConsole.warn,
    error: originalConsole.error,
  };
}

// Global error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Export utilities for tests
global.testUtils = {
  trackMemoryUsage,
  getTestDuration: () => Date.now() - global.testStartTime,
  startTime,
};
