/**
 * Test-aware logger utility
 * Suppresses logs during test execution while preserving them in development/production
 */

const isTestEnvironment =
  process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

export const testLogger = {
  log: (...args: unknown[]) => {
    if (!isTestEnvironment) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isTestEnvironment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (!isTestEnvironment) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (!isTestEnvironment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (!isTestEnvironment) {
      console.debug(...args);
    }
  },
};
