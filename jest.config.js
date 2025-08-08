const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  // Extreme memory optimization
  maxWorkers: 1, // Run tests serially
  workerIdleMemoryLimit: "512MB", // Increase worker memory limit for 24GB setup
  logHeapUsage: false,
  detectOpenHandles: false,
  forceExit: true,
  testTimeout: 30000, // Increase timeout for memory-constrained environment
  // Memory optimization settings
  cache: false, // Disable Jest cache
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxConcurrency: 1, // Limit concurrent tests
  // Additional optimizations
  collectCoverage: false, // Disable coverage collection by default
  // Reduce test file discovery overhead
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/temp_archive/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!(marked|three)/)"],
  // Additional memory optimizations
  verbose: false, // Reduce output to save memory
  silent: false, // Keep some output for debugging
  // Optimize test environment
  testEnvironmentOptions: {
    url: "http://localhost",
    resources: "usable",
  },
  // Garbage collection optimization
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
