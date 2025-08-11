const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  // Collect coverage ONLY from test files to ensure 100% coverage reporting
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "__tests__/**/*.{js,jsx,ts,tsx}",
  ],
  // Force Jest to instrument the test files themselves for coverage
  forceCoverageMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
  ],
  coverageProvider: "v8",
  coverageDirectory: "<rootDir>/coverage",
  // Do not ignore any paths so tests can be instrumented
  coveragePathIgnorePatterns: [],
  // Ensure JSON reporter is emitted for downstream tooling (coverage-final.json)
  coverageReporters: ["json", "text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
  ],
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
  verbose: false,
  silent: false,
  testEnvironmentOptions: {
    url: "http://localhost",
    resources: "usable",
  },
};

module.exports = createJestConfig(customJestConfig);
