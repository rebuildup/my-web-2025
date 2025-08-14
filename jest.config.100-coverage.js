/**
 * Jest configuration optimized for 100% test coverage enforcement
 * This configuration is designed for CI/CD pipelines and coverage validation
 * Optimized for performance and memory efficiency during coverage collection
 */

const nextJest = require("next/jest");
const os = require("os");

const createJestConfig = nextJest({
  dir: "./",
});

// Environment-specific optimizations
const isCI = process.env.CI === "true";
const isCoverageMode =
  process.env.NODE_ENV === "coverage" || process.env.JEST_COVERAGE === "true";

// Optimized worker configuration for coverage collection
const getOptimalWorkers = () => {
  const cpuCount = os.cpus().length;
  if (isCI) {
    // Conservative for CI to avoid memory issues
    return Math.max(1, Math.floor(cpuCount * 0.5));
  }
  // More aggressive locally for faster coverage collection
  return Math.max(1, Math.floor(cpuCount * 0.8));
};

const customJestConfig = {
  displayName: "100% Coverage Enforcement",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",

  // Optimized parallel execution for coverage collection
  maxWorkers: getOptimalWorkers(),
  workerIdleMemoryLimit: isCI ? "256MB" : "512MB",

  // Performance settings optimized for coverage collection
  testTimeout: isCI ? 45000 : 60000, // Reduced timeout for CI
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache-coverage",

  // Fake timers configuration disabled to prevent timeout issues
  // fakeTimers: {
  //   enableGlobally: true,
  //   legacyFakeTimers: false,
  // },

  // Mock management
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Coverage configuration - optimized for performance and comprehensive collection
  collectCoverage: true,
  coverageProvider: "v8", // Faster than babel
  coverageDirectory: "<rootDir>/coverage",

  // Comprehensive coverage collection from all source files
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
    // Include all previously excluded files for 100% coverage
    "!src/test-utils/**", // Test utilities don't need coverage
    "!src/**/__tests__/**", // Test files themselves
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
  ],

  // Optimized report formats - prioritize essential formats for performance
  coverageReporters: isCI
    ? [
        "text-summary", // Brief summary for CI logs
        "json-summary", // For validation scripts
        "lcov", // For external services
        "cobertura", // For CI/CD systems
      ]
    : [
        "text", // Console output for developers
        "text-summary", // Brief summary
        "html", // Detailed HTML report for browsing
        "json", // Machine-readable for tools
        "json-summary", // Summary for dashboards
        "lcov", // For external services (Codecov, SonarQube)
        "cobertura", // XML format for CI/CD systems
        "clover", // Alternative XML format
      ],

  // Strict 100% coverage thresholds - enforced globally and per directory
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // Per-directory enforcement for granular control
    "./src/app/": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "./src/components/": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "./src/lib/": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "./src/hooks/": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "./src/types/": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  // Test discovery patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/temp_archive/",
    "<rootDir>/coverage/",
  ],

  // Module resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Transform configuration
  transformIgnorePatterns: [
    "node_modules/(?!(marked|three|@testing-library)/)",
  ],

  // Module name mapping for problematic modules
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Mock Three.js modules that cause issues
    "^three/examples/jsm/(.*)$": "<rootDir>/src/__mocks__/three-mock.js",
  },

  // Coverage path ignore patterns - minimal exclusions
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/e2e/",
    "<rootDir>/temp_archive/",
    // Only exclude actual test files and type definitions
    "/__tests__/",
    "/\\.test\\.",
    "/\\.spec\\.",
    "\\.d\\.ts$",
    "\\.stories\\.",
  ],

  // Output configuration - optimized for environment
  verbose: !isCI, // Reduce verbosity in CI for performance
  silent: false,

  // Test environment options
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    resources: "usable",
  },

  // Performance optimizations
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },

  // Memory and performance optimizations
  logHeapUsage: !isCI, // Only log heap usage locally
  detectOpenHandles: false, // Disable for performance
  forceExit: true, // Force exit to prevent hanging

  // Concurrency optimization
  maxConcurrency: isCI ? 2 : 5,

  // Error handling
  errorOnDeprecated: true,
  bail: false, // Don't bail - we want to see all coverage gaps

  // Custom reporters for enhanced output
  reporters: [
    "default",
    // Additional reporters can be added here when dependencies are installed
    // ["jest-html-reporters", { ... }],
  ],

  // Test result processor
  testResultsProcessor: "<rootDir>/scripts/test-results-processor.js",

  // Setup files
  setupFiles: ["<rootDir>/jest.setup.global.js"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Watch plugins for development (add when dependencies are installed)
  // watchPlugins: [
  //   "jest-watch-typeahead/filename",
  //   "jest-watch-typeahead/testname",
  // ],
};

module.exports = createJestConfig(customJestConfig);
