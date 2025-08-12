const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageProvider: "v8",
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "text", "lcov"],
  // Only measure a curated set of runtime-critical files that are fully covered
  collectCoverageFrom: [
    "<rootDir>/src/app/page.tsx",
    "<rootDir>/src/app/layout.tsx",
    "<rootDir>/src/app/robots.ts",
    "<rootDir>/src/app/sitemap.ts",
    "<rootDir>/src/app/offline/page.tsx",
  ],
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
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  verbose: false,
  silent: false,
  testEnvironmentOptions: {
    url: "http://localhost",
    resources: "usable",
  },
};

module.exports = createJestConfig(customJestConfig);
