/**
 * Optimized Jest configuration for 100% coverage collection
 * Enhanced for performance, memory efficiency, and reliable coverage reporting
 */

const nextJest = require("next/jest");
const os = require("os");

const createJestConfig = nextJest({
  dir: "./",
});

// Environment detection
const isCI = process.env.CI === "true";
const isCoverageMode =
  process.env.NODE_ENV === "coverage" || process.env.JEST_COVERAGE === "true";

// Performance optimization based on system resources
const getOptimalConfiguration = () => {
  const cpuCount = os.cpus().length;
  const totalMemoryGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);

  let config = {
    maxWorkers: 1, // Default to serial execution for stability
    workerIdleMemoryLimit: "256MB",
    testTimeout: 60000,
    nodeMemoryLimit: 4096,
  };

  if (isCI) {
    // Conservative CI configuration
    config = {
      maxWorkers: 1, // Serial execution in CI for reliability
      workerIdleMemoryLimit: "256MB",
      testTimeout: 45000,
      nodeMemoryLimit: Math.max(2048, Math.floor(totalMemoryGB * 1024 * 0.5)),
    };
  } else if (totalMemoryGB >= 16) {
    // High-memory local development
    config = {
      maxWorkers: Math.max(1, Math.floor(cpuCount * 0.6)),
      workerIdleMemoryLimit: "512MB",
      testTimeout: 60000,
      nodeMemoryLimit: Math.floor(totalMemoryGB * 1024 * 0.7),
    };
  } else if (totalMemoryGB >= 8) {
    // Medium-memory systems
    config = {
      maxWorkers: Math.max(1, Math.floor(cpuCount * 0.4)),
      workerIdleMemoryLimit: "384MB",
      testTimeout: 60000,
      nodeMemoryLimit: Math.floor(totalMemoryGB * 1024 * 0.6),
    };
  }

  return config;
};

const optimalConfig = getOptimalConfiguration();

const customJestConfig = {
  displayName: "100% Coverage Collection (Optimized)",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  setupFiles: ["<rootDir>/jest.setup.global.js"],
  testEnvironment: "jsdom",

  // Optimized parallel execution
  maxWorkers: optimalConfig.maxWorkers,
  workerIdleMemoryLimit: optimalConfig.workerIdleMemoryLimit,

  // Performance settings
  testTimeout: optimalConfig.testTimeout,
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache-coverage-optimized",

  // Memory management
  logHeapUsage: !isCI,
  detectOpenHandles: false,
  forceExit: true,

  // Mock management for performance
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Coverage configuration - comprehensive collection
  collectCoverage: true,
  coverageProvider: "v8", // Faster than babel
  coverageDirectory: "<rootDir>/coverage",

  // Comprehensive coverage collection from all source files
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
    "!src/test-utils/**",
    "!src/**/__tests__/**",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
    // Include middleware and other root files
    "middleware.ts",
  ],

  // Optimized report formats for different environments
  coverageReporters: isCI
    ? [
        "text-summary", // Brief summary for CI logs
        "json-summary", // For validation scripts
        "lcov", // For external services
        "cobertura", // For CI/CD systems
      ]
    : [
        "text", // Console output
        "text-summary", // Brief summary
        "html", // Detailed HTML report
        "json", // Machine-readable
        "json-summary", // Summary for dashboards
        "lcov", // For external services
        "cobertura", // XML format for CI/CD
        "clover", // Alternative XML format
      ],

  // Strict 100% coverage thresholds
  coverageThreshold: {
    global: {
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
    // Mock problematic modules
    "^three/examples/jsm/(.*)$": "<rootDir>/src/__mocks__/three-mock.js",
  },

  // Transform configuration
  transformIgnorePatterns: [
    "node_modules/(?!(marked|three|@testing-library)/)",
  ],

  // Coverage path ignore patterns - minimal exclusions
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/e2e/",
    "<rootDir>/temp_archive/",
    "/__tests__/",
    "/\\.test\\.",
    "/\\.spec\\.",
    "\\.d\\.ts$",
    "\\.stories\\.",
  ],

  // Output configuration
  verbose: !isCI,
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

  // Concurrency optimization
  maxConcurrency: isCI ? 1 : 3,

  // Error handling
  errorOnDeprecated: true,
  bail: false, // Don't bail - we want to see all coverage gaps

  // Custom reporters for enhanced output
  reporters: [
    "default",
    // Add custom reporter for coverage optimization tracking
    ["<rootDir>/scripts/coverage-optimization-reporter.js", {}],
  ],

  // Test result processor
  testResultsProcessor: "<rootDir>/scripts/test-results-processor.js",

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Snapshot serializers
  snapshotSerializers: [],

  // Watch plugins (disabled for coverage runs)
  watchPlugins: [],

  // Resolver configuration
  resolver: undefined,

  // Runtime configuration
  runtime: undefined,

  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["next/jest"],
  },

  // Module paths
  modulePaths: ["<rootDir>/src"],

  // Setup files after environment
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Test name pattern
  testNamePattern: undefined,

  // Test regex pattern
  testRegex: undefined,

  // Unmocked module path patterns
  unmockedModulePathPatterns: undefined,

  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
  ],

  // Notify mode
  notify: false,
  notifyMode: "failure-change",

  // Collect coverage only from changed files
  collectCoverageOnlyFrom: undefined,

  // Coverage reporters
  coverageReporters: isCI
    ? ["text-summary", "json-summary", "lcov", "cobertura"]
    : [
        "text",
        "text-summary",
        "html",
        "json",
        "json-summary",
        "lcov",
        "cobertura",
        "clover",
      ],

  // Coverage threshold per file
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // Specific thresholds for critical paths
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
  },
};

module.exports = createJestConfig(customJestConfig);
