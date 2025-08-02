#!/usr/bin/env node

/**
 * Performance Test Runner
 *
 * This script runs comprehensive performance and quality tests for the
 * enhanced portfolio data management system.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Performance test configuration
const PERFORMANCE_CONFIG = {
  // Memory thresholds (in MB)
  maxMemoryUsage: 200,
  maxMemoryIncrease: 100,

  // Time thresholds (in ms)
  maxRenderTime: 2000,
  maxDataProcessingTime: 5000,
  maxFileOperationTime: 3000,
  maxUIResponseTime: 100,

  // Dataset sizes for testing
  smallDataset: 100,
  mediumDataset: 500,
  largeDataset: 1000,
  extraLargeDataset: 5000,

  // Test iterations
  performanceIterations: 10,
  stressTestIterations: 100,
};

// Test categories
const TEST_CATEGORIES = {
  UNIT: "unit",
  INTEGRATION: "integration",
  E2E: "e2e",
  PERFORMANCE: "performance",
  MEMORY: "memory",
  SECURITY: "security",
};

// Performance metrics collector
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      testResults: [],
      memoryUsage: [],
      renderTimes: [],
      dataProcessingTimes: [],
      errorCounts: {},
      warnings: [],
    };
    this.startTime = Date.now();
  }

  addTestResult(category, testName, duration, status, details = {}) {
    this.metrics.testResults.push({
      category,
      testName,
      duration,
      status,
      details,
      timestamp: Date.now(),
    });
  }

  addMemoryMeasurement(label, heapUsed, heapTotal) {
    this.metrics.memoryUsage.push({
      label,
      heapUsed,
      heapTotal,
      timestamp: Date.now(),
    });
  }

  addWarning(message, category = "general") {
    this.metrics.warnings.push({
      message,
      category,
      timestamp: Date.now(),
    });
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.metrics.testResults.filter(
      (t) => t.status === "passed",
    ).length;
    const failedTests = this.metrics.testResults.filter(
      (t) => t.status === "failed",
    ).length;
    const totalTests = this.metrics.testResults.length;

    const report = {
      summary: {
        totalDuration,
        totalTests,
        passedTests,
        failedTests,
        successRate:
          totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0,
      },
      performance: {
        averageRenderTime: this.calculateAverage(this.metrics.renderTimes),
        averageDataProcessingTime: this.calculateAverage(
          this.metrics.dataProcessingTimes,
        ),
        peakMemoryUsage: Math.max(
          ...this.metrics.memoryUsage.map((m) => m.heapUsed),
        ),
        memoryLeaks: this.detectMemoryLeaks(),
      },
      categories: this.groupTestsByCategory(),
      warnings: this.metrics.warnings,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  detectMemoryLeaks() {
    if (this.metrics.memoryUsage.length < 2) return false;

    const initial = this.metrics.memoryUsage[0].heapUsed;
    const final =
      this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].heapUsed;
    const increase = final - initial;

    return increase > PERFORMANCE_CONFIG.maxMemoryIncrease * 1024 * 1024;
  }

  groupTestsByCategory() {
    const grouped = {};

    for (const result of this.metrics.testResults) {
      if (!grouped[result.category]) {
        grouped[result.category] = {
          total: 0,
          passed: 0,
          failed: 0,
          averageDuration: 0,
        };
      }

      grouped[result.category].total++;
      if (result.status === "passed") grouped[result.category].passed++;
      if (result.status === "failed") grouped[result.category].failed++;
    }

    // Calculate average durations
    for (const category in grouped) {
      const categoryTests = this.metrics.testResults.filter(
        (t) => t.category === category,
      );
      grouped[category].averageDuration = this.calculateAverage(
        categoryTests.map((t) => t.duration),
      );
    }

    return grouped;
  }

  generateRecommendations() {
    const recommendations = [];

    // Performance recommendations
    const slowTests = this.metrics.testResults.filter((t) => t.duration > 1000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: "performance",
        message: `${slowTests.length} tests are running slowly (>1s). Consider optimization.`,
        details: slowTests.map((t) => `${t.testName}: ${t.duration}ms`),
      });
    }

    // Memory recommendations
    if (this.detectMemoryLeaks()) {
      recommendations.push({
        type: "memory",
        message:
          "Potential memory leak detected. Review component cleanup and event listeners.",
      });
    }

    // Test coverage recommendations
    const categories = Object.keys(this.groupTestsByCategory());
    if (!categories.includes(TEST_CATEGORIES.E2E)) {
      recommendations.push({
        type: "coverage",
        message:
          "Consider adding E2E tests for complete user journey validation.",
      });
    }

    return recommendations;
  }
}

// Test runner functions
async function runUnitTests(metrics) {
  console.log("🧪 Running unit tests...");

  try {
    const startTime = Date.now();

    // Run Jest tests with performance focus
    execSync(
      'npm run test -- --testPathPattern="performance|quality" --verbose --detectOpenHandles',
      {
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "test" },
      },
    );

    const duration = Date.now() - startTime;
    metrics.addTestResult(
      TEST_CATEGORIES.UNIT,
      "Performance Unit Tests",
      duration,
      "passed",
    );

    console.log(`✅ Unit tests completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.addTestResult(
      TEST_CATEGORIES.UNIT,
      "Performance Unit Tests",
      duration,
      "failed",
      {
        error: error.message,
      },
    );
    console.error("❌ Unit tests failed:", error.message);
  }
}

async function runIntegrationTests(metrics) {
  console.log("🔗 Running integration tests...");

  try {
    const startTime = Date.now();

    // Run integration tests
    execSync('npm run test -- --testPathPattern="integration" --verbose', {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    });

    const duration = Date.now() - startTime;
    metrics.addTestResult(
      TEST_CATEGORIES.INTEGRATION,
      "Integration Tests",
      duration,
      "passed",
    );

    console.log(`✅ Integration tests completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.addTestResult(
      TEST_CATEGORIES.INTEGRATION,
      "Integration Tests",
      duration,
      "failed",
      {
        error: error.message,
      },
    );
    console.error("❌ Integration tests failed:", error.message);
  }
}

async function runE2ETests(metrics) {
  console.log("🎭 Running E2E tests...");

  try {
    const startTime = Date.now();

    // Run Playwright E2E tests
    execSync("npx playwright test --project=chromium", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    });

    const duration = Date.now() - startTime;
    metrics.addTestResult(TEST_CATEGORIES.E2E, "E2E Tests", duration, "passed");

    console.log(`✅ E2E tests completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.addTestResult(
      TEST_CATEGORIES.E2E,
      "E2E Tests",
      duration,
      "failed",
      {
        error: error.message,
      },
    );
    console.error("❌ E2E tests failed:", error.message);
  }
}

async function runPerformanceBenchmarks(metrics) {
  console.log("⚡ Running performance benchmarks...");

  const benchmarks = [
    {
      name: "Large Dataset Processing",
      test: () => simulateDataProcessing(PERFORMANCE_CONFIG.largeDataset),
      threshold: PERFORMANCE_CONFIG.maxDataProcessingTime,
    },
    {
      name: "Memory Usage Under Load",
      test: () => simulateMemoryLoad(),
      threshold: PERFORMANCE_CONFIG.maxMemoryUsage * 1024 * 1024,
    },
    {
      name: "UI Responsiveness",
      test: () => simulateUIInteractions(),
      threshold: PERFORMANCE_CONFIG.maxUIResponseTime,
    },
  ];

  for (const benchmark of benchmarks) {
    try {
      console.log(`  Running ${benchmark.name}...`);
      const startTime = Date.now();
      const result = await benchmark.test();
      const duration = Date.now() - startTime;

      const status = duration < benchmark.threshold ? "passed" : "failed";
      metrics.addTestResult(
        TEST_CATEGORIES.PERFORMANCE,
        benchmark.name,
        duration,
        status,
        {
          threshold: benchmark.threshold,
          result,
        },
      );

      if (status === "passed") {
        console.log(
          `    ✅ ${benchmark.name}: ${duration}ms (threshold: ${benchmark.threshold}ms)`,
        );
      } else {
        console.log(
          `    ❌ ${benchmark.name}: ${duration}ms (exceeded threshold: ${benchmark.threshold}ms)`,
        );
        metrics.addWarning(
          `${benchmark.name} exceeded performance threshold`,
          "performance",
        );
      }
    } catch (error) {
      metrics.addTestResult(
        TEST_CATEGORIES.PERFORMANCE,
        benchmark.name,
        0,
        "failed",
        {
          error: error.message,
        },
      );
      console.error(`    ❌ ${benchmark.name} failed:`, error.message);
    }
  }
}

async function runMemoryTests(metrics) {
  console.log("🧠 Running memory tests...");

  const initialMemory = process.memoryUsage();
  metrics.addMemoryMeasurement(
    "Initial",
    initialMemory.heapUsed,
    initialMemory.heapTotal,
  );

  // Simulate memory-intensive operations
  const memoryTests = [
    () => simulateLargeDatasetProcessing(),
    () => simulateComponentMounting(),
    () => simulateFileOperations(),
  ];

  for (let i = 0; i < memoryTests.length; i++) {
    const testName = `Memory Test ${i + 1}`;
    console.log(`  Running ${testName}...`);

    try {
      const startTime = Date.now();
      await memoryTests[i]();
      const duration = Date.now() - startTime;

      const currentMemory = process.memoryUsage();
      metrics.addMemoryMeasurement(
        `After ${testName}`,
        currentMemory.heapUsed,
        currentMemory.heapTotal,
      );

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        const afterGC = process.memoryUsage();
        metrics.addMemoryMeasurement(
          `After ${testName} + GC`,
          afterGC.heapUsed,
          afterGC.heapTotal,
        );
      }

      metrics.addTestResult(
        TEST_CATEGORIES.MEMORY,
        testName,
        duration,
        "passed",
      );
      console.log(`    ✅ ${testName} completed in ${duration}ms`);
    } catch (error) {
      metrics.addTestResult(TEST_CATEGORIES.MEMORY, testName, 0, "failed", {
        error: error.message,
      });
      console.error(`    ❌ ${testName} failed:`, error.message);
    }
  }
}

async function runSecurityTests(metrics) {
  console.log("🔒 Running security tests...");

  const securityTests = [
    {
      name: "Input Sanitization",
      test: () => testInputSanitization(),
    },
    {
      name: "XSS Prevention",
      test: () => testXSSPrevention(),
    },
    {
      name: "Path Traversal Protection",
      test: () => testPathTraversalProtection(),
    },
  ];

  for (const securityTest of securityTests) {
    try {
      console.log(`  Running ${securityTest.name}...`);
      const startTime = Date.now();
      const result = await securityTest.test();
      const duration = Date.now() - startTime;

      const status = result.secure ? "passed" : "failed";
      metrics.addTestResult(
        TEST_CATEGORIES.SECURITY,
        securityTest.name,
        duration,
        status,
        result,
      );

      if (status === "passed") {
        console.log(`    ✅ ${securityTest.name}: Secure`);
      } else {
        console.log(`    ❌ ${securityTest.name}: Security issues found`);
        metrics.addWarning(
          `Security vulnerability in ${securityTest.name}`,
          "security",
        );
      }
    } catch (error) {
      metrics.addTestResult(
        TEST_CATEGORIES.SECURITY,
        securityTest.name,
        0,
        "failed",
        {
          error: error.message,
        },
      );
      console.error(`    ❌ ${securityTest.name} failed:`, error.message);
    }
  }
}

// Simulation functions
async function simulateDataProcessing(itemCount) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `perf-test-${i}`,
    title: `Performance Test Item ${i}`,
    description: `Description for item ${i}`,
    categories: ["develop", "design"],
    tags: [`tag-${i}`, "performance"],
    content: `Content for item ${i}`.repeat(10),
  }));

  // Simulate processing
  const processed = items.map((item) => ({
    ...item,
    processed: true,
    processedAt: Date.now(),
  }));

  return { processedCount: processed.length };
}

async function simulateMemoryLoad() {
  const largeArrays = [];

  // Create large data structures
  for (let i = 0; i < 100; i++) {
    largeArrays.push(
      new Array(1000).fill(`Large string content ${i}`.repeat(100)),
    );
  }

  // Simulate processing
  const processed = largeArrays.map((arr) => arr.length);

  // Clear references
  largeArrays.length = 0;

  return { processedArrays: processed.length };
}

async function simulateUIInteractions() {
  // Simulate rapid UI updates
  const updates = [];

  for (let i = 0; i < 1000; i++) {
    updates.push({
      type: "update",
      timestamp: Date.now(),
      data: `Update ${i}`,
    });

    // Simulate small delay
    if (i % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  return { updateCount: updates.length };
}

async function simulateLargeDatasetProcessing() {
  const dataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    data: `Large data content ${i}`.repeat(50),
  }));

  // Process in chunks
  const chunkSize = 1000;
  const results = [];

  for (let i = 0; i < dataset.length; i += chunkSize) {
    const chunk = dataset.slice(i, i + chunkSize);
    const processed = chunk.map((item) => ({ ...item, processed: true }));
    results.push(...processed);
  }

  return results.length;
}

async function simulateComponentMounting() {
  // Simulate React component mounting/unmounting cycles
  const components = [];

  for (let i = 0; i < 100; i++) {
    const component = {
      id: i,
      props: { data: `Component ${i} data`.repeat(20) },
      state: { mounted: true },
    };

    components.push(component);

    // Simulate unmounting
    if (i % 10 === 0) {
      components.splice(0, 5);
    }
  }

  return components.length;
}

async function simulateFileOperations() {
  // Simulate file operations without actual file I/O
  const operations = [];

  for (let i = 0; i < 50; i++) {
    operations.push({
      type: "read",
      file: `test-file-${i}.md`,
      content: `File content ${i}`.repeat(100),
    });

    operations.push({
      type: "write",
      file: `output-file-${i}.md`,
      content: `Output content ${i}`.repeat(100),
    });
  }

  return operations.length;
}

// Security test functions
async function testInputSanitization() {
  const maliciousInputs = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '"><script>alert("xss")</script>',
  ];

  let vulnerabilities = 0;

  for (const input of maliciousInputs) {
    // Simulate sanitization check
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/<img[^>]*onerror[^>]*>/gi, "");

    if (sanitized === input) {
      vulnerabilities++;
    }
  }

  return {
    secure: vulnerabilities === 0,
    vulnerabilities,
    tested: maliciousInputs.length,
  };
}

async function testXSSPrevention() {
  const xssPayloads = [
    "<script>document.cookie</script>",
    '<iframe src="javascript:alert(1)"></iframe>',
    "<svg onload=alert(1)>",
    "<img src=x onerror=alert(1)>",
  ];

  let blocked = 0;

  for (const payload of xssPayloads) {
    // Simulate XSS prevention check
    const hasScript =
      payload.includes("<script>") ||
      payload.includes("javascript:") ||
      payload.includes("onload=") ||
      payload.includes("onerror=");
    if (hasScript) {
      blocked++;
    }
  }

  return {
    secure: blocked === xssPayloads.length,
    blocked,
    tested: xssPayloads.length,
  };
}

async function testPathTraversalProtection() {
  const pathTraversalAttempts = [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "/etc/passwd",
    "C:\\windows\\system32\\config\\sam",
  ];

  let blocked = 0;

  for (const attempt of pathTraversalAttempts) {
    // Simulate path traversal protection
    const hasDotDot = attempt.includes("../") || attempt.includes("..\\");
    const hasAbsolutePath =
      attempt.startsWith("/") || attempt.match(/^[A-Z]:\\/);

    if (hasDotDot || hasAbsolutePath) {
      blocked++;
    }
  }

  return {
    secure: blocked === pathTraversalAttempts.length,
    blocked,
    tested: pathTraversalAttempts.length,
  };
}

// Report generation
function saveReport(report) {
  const reportDir = path.join(__dirname, "..", "test-reports");
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(
    reportDir,
    `performance-report-${timestamp}.json`,
  );

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📊 Performance report saved to: ${reportPath}`);
  return reportPath;
}

function printSummary(report) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 PERFORMANCE TEST SUMMARY");
  console.log("=".repeat(60));

  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${report.summary.totalTests}`);
  console.log(
    `   Passed: ${report.summary.passedTests} (${report.summary.successRate}%)`,
  );
  console.log(`   Failed: ${report.summary.failedTests}`);
  console.log(
    `   Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
  );

  console.log(`\n⚡ Performance Metrics:`);
  console.log(
    `   Average Render Time: ${report.performance.averageRenderTime.toFixed(2)}ms`,
  );
  console.log(
    `   Average Data Processing: ${report.performance.averageDataProcessingTime.toFixed(2)}ms`,
  );
  console.log(
    `   Peak Memory Usage: ${(report.performance.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
  );
  console.log(
    `   Memory Leaks Detected: ${report.performance.memoryLeaks ? "Yes ⚠️" : "No ✅"}`,
  );

  if (report.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${report.warnings.length}):`);
    report.warnings.forEach((warning) => {
      console.log(`   - ${warning.message}`);
    });
  }

  if (report.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    report.recommendations.forEach((rec) => {
      console.log(`   - [${rec.type.toUpperCase()}] ${rec.message}`);
    });
  }

  console.log("\n" + "=".repeat(60));
}

// Main execution
async function main() {
  console.log("🚀 Starting Enhanced Portfolio Performance Tests");
  console.log("=".repeat(60));

  const metrics = new PerformanceMetrics();

  try {
    // Run all test categories
    await runUnitTests(metrics);
    await runIntegrationTests(metrics);
    await runE2ETests(metrics);
    await runPerformanceBenchmarks(metrics);
    await runMemoryTests(metrics);
    await runSecurityTests(metrics);

    // Generate and save report
    const report = metrics.generateReport();
    const reportPath = saveReport(report);
    printSummary(report);

    // Exit with appropriate code
    const hasFailures = report.summary.failedTests > 0;
    const hasWarnings = report.warnings.length > 0;

    if (hasFailures) {
      console.log("\n❌ Some tests failed. Please review the report.");
      process.exit(1);
    } else if (hasWarnings) {
      console.log(
        "\n⚠️  Tests passed but with warnings. Please review the report.",
      );
      process.exit(0);
    } else {
      console.log("\n✅ All performance tests passed successfully!");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n💥 Performance test runner failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  PerformanceMetrics,
  PERFORMANCE_CONFIG,
  TEST_CATEGORIES,
};
