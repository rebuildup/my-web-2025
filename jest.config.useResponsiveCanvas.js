const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

// Optimized config specifically for useResponsiveCanvas test
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  // Extreme optimization for single test file
  maxWorkers: 1,
  workerIdleMemoryLimit: "256MB",
  logHeapUsage: false,
  detectOpenHandles: false,
  forceExit: true,
  testTimeout: 5000,
  cache: false,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxConcurrency: 1,
  collectCoverage: false,
  verbose: false,
  silent: true, // Reduce output for performance

  // Only run the specific test file
  testMatch: ["<rootDir>/src/hooks/__tests__/useResponsiveCanvas.test.ts"],

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/temp_archive/",
  ],

  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transformIgnorePatterns: ["node_modules/(?!(marked|three)/)"],

  testEnvironmentOptions: {
    url: "http://localhost",
    resources: "usable",
  },

  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
