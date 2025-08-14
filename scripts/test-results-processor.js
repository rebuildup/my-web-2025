/**
 * Enhanced Jest test results processor for 100% coverage enforcement
 * Processes test results with performance monitoring and memory management
 * Generates comprehensive reports for CI/CD integration and coverage analysis
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = (results) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const isCI = process.env.CI === "true";
  const isCoverageMode =
    process.env.NODE_ENV === "coverage" || process.env.JEST_COVERAGE === "true";

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), "coverage", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Collect performance metrics
  const memUsage = process.memoryUsage();
  const performanceMetrics = {
    timestamp,
    memoryUsage: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
    systemInfo: {
      cpuCount: os.cpus().length,
      totalMemoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      platform: os.platform(),
      nodeVersion: process.version,
    },
    testExecution: {
      totalDuration: results.testResults.reduce(
        (acc, suite) => acc + suite.perfStats.runtime,
        0,
      ),
      averageSuiteTime:
        results.numTotalTestSuites > 0
          ? Math.round(
              results.testResults.reduce(
                (acc, suite) => acc + suite.perfStats.runtime,
                0,
              ) / results.numTotalTestSuites,
            )
          : 0,
      slowestSuites: results.testResults
        .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime)
        .slice(0, 5)
        .map((suite) => ({
          testFilePath: suite.testFilePath.replace(process.cwd(), ""),
          runtime: suite.perfStats.runtime,
          numTests: suite.numPassingTests + suite.numFailingTests,
        })),
    },
  };

  // Generate enhanced test summary report
  const testSummary = {
    timestamp,
    success: results.success,
    environment: {
      isCI,
      isCoverageMode,
      nodeEnv: process.env.NODE_ENV,
    },
    metrics: {
      testSuites: {
        total: results.numTotalTestSuites,
        passed: results.numPassedTestSuites,
        failed: results.numFailedTestSuites,
        passRate:
          results.numTotalTestSuites > 0
            ? Math.round(
                (results.numPassedTestSuites / results.numTotalTestSuites) *
                  100,
              )
            : 0,
      },
      tests: {
        total: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests,
        passRate:
          results.numTotalTests > 0
            ? Math.round((results.numPassedTests / results.numTotalTests) * 100)
            : 0,
      },
    },
    performance: performanceMetrics,
    failedSuites: results.testResults
      .filter((suite) => suite.numFailingTests > 0)
      .map((suite) => ({
        testFilePath: suite.testFilePath.replace(process.cwd(), ""),
        numFailingTests: suite.numFailingTests,
        failureMessage: suite.failureMessage
          ? suite.failureMessage.substring(0, 500)
          : null,
        runtime: suite.perfStats.runtime,
      })),
  };

  // Write enhanced test summary
  fs.writeFileSync(
    path.join(reportsDir, "test-summary-enhanced.json"),
    JSON.stringify(testSummary, null, 2),
  );

  // Generate coverage enforcement report if coverage data is available
  if (results.coverageMap) {
    const coverageEnforcement = {
      timestamp,
      enforced: true,
      mode: isCoverageMode ? "100% enforcement" : "standard",
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
      performance: {
        coverageCollectionTime: performanceMetrics.testExecution.totalDuration,
        memoryUsage: performanceMetrics.memoryUsage,
      },
      // Don't include the full coverage map to reduce file size
      coverageMapSize: Object.keys(results.coverageMap).length,
    };

    fs.writeFileSync(
      path.join(reportsDir, "coverage-enforcement-enhanced.json"),
      JSON.stringify(coverageEnforcement, null, 2),
    );
  }

  // Generate CI/CD optimized report
  const ciReport = {
    timestamp,
    status: results.success ? "PASSED" : "FAILED",
    summary: {
      testSuites: `${results.numPassedTestSuites}/${results.numTotalTestSuites}`,
      tests: `${results.numPassedTests}/${results.numTotalTests}`,
      duration: `${Math.round(performanceMetrics.testExecution.totalDuration / 1000)}s`,
      memory: `${performanceMetrics.memoryUsage.heapUsed}MB`,
    },
    metrics: testSummary.metrics,
    performance: {
      totalDuration: performanceMetrics.testExecution.totalDuration,
      memoryPeak: performanceMetrics.memoryUsage.heapUsed,
      averageSuiteTime: performanceMetrics.testExecution.averageSuiteTime,
    },
    failures: testSummary.failedSuites.length,
    environment: {
      ci: isCI,
      coverage: isCoverageMode,
      node: process.version,
      platform: os.platform(),
    },
  };

  fs.writeFileSync(
    path.join(reportsDir, "ci-report-enhanced.json"),
    JSON.stringify(ciReport, null, 2),
  );

  // Generate performance analysis report
  const performanceReport = {
    timestamp,
    analysis: {
      testExecutionEfficiency: {
        totalTests: results.numTotalTests,
        totalDuration: performanceMetrics.testExecution.totalDuration,
        averageTestTime:
          results.numTotalTests > 0
            ? Math.round(
                performanceMetrics.testExecution.totalDuration /
                  results.numTotalTests,
              )
            : 0,
        testsPerSecond:
          performanceMetrics.testExecution.totalDuration > 0
            ? Math.round(
                (results.numTotalTests * 1000) /
                  performanceMetrics.testExecution.totalDuration,
              )
            : 0,
      },
      memoryEfficiency: {
        peakMemoryMB: performanceMetrics.memoryUsage.heapUsed,
        memoryPerTest:
          results.numTotalTests > 0
            ? Math.round(
                (performanceMetrics.memoryUsage.heapUsed /
                  results.numTotalTests) *
                  100,
              ) / 100
            : 0,
        memoryUtilization: Math.round(
          (performanceMetrics.memoryUsage.heapUsed /
            performanceMetrics.memoryUsage.heapTotal) *
            100,
        ),
      },
      recommendations: generatePerformanceRecommendations(
        performanceMetrics,
        results,
      ),
    },
    rawMetrics: performanceMetrics,
  };

  fs.writeFileSync(
    path.join(reportsDir, "performance-analysis.json"),
    JSON.stringify(performanceReport, null, 2),
  );

  // Log optimized summary to console
  const processingTime = Date.now() - startTime;

  if (!isCI || results.numFailedTests > 0) {
    console.log("\n📊 Enhanced Test Results Summary:");
    console.log(
      `✅ Test Suites: ${results.numPassedTestSuites}/${results.numTotalTestSuites} passed (${testSummary.metrics.testSuites.passRate}%)`,
    );
    console.log(
      `✅ Tests: ${results.numPassedTests}/${results.numTotalTests} passed (${testSummary.metrics.tests.passRate}%)`,
    );
    console.log(
      `⏱️  Duration: ${Math.round(performanceMetrics.testExecution.totalDuration / 1000)}s`,
    );
    console.log(`🧠 Memory: ${performanceMetrics.memoryUsage.heapUsed}MB peak`);

    if (results.numFailedTests > 0) {
      console.log(`❌ Failed Tests: ${results.numFailedTests}`);
    }

    if (isCoverageMode) {
      console.log(`🔍 Coverage Mode: 100% enforcement active`);
    }

    console.log(`📁 Enhanced reports generated in: ${reportsDir}`);
    console.log(`📊 Report processing time: ${processingTime}ms`);
  }

  // Force garbage collection if available (for memory optimization)
  if (global.gc && !isCI) {
    global.gc();
  }

  return results;
};

/**
 * Generate performance recommendations based on metrics
 */
function generatePerformanceRecommendations(metrics, results) {
  const recommendations = [];

  // Memory recommendations
  if (metrics.memoryUsage.heapUsed > 2048) {
    // > 2GB
    recommendations.push({
      type: "memory",
      priority: "high",
      message:
        "High memory usage detected. Consider running tests with --runInBand or reducing maxWorkers.",
      value: `${metrics.memoryUsage.heapUsed}MB`,
    });
  }

  // Performance recommendations
  if (metrics.testExecution.averageSuiteTime > 5000) {
    // > 5 seconds per suite
    recommendations.push({
      type: "performance",
      priority: "medium",
      message:
        "Slow test suites detected. Consider optimizing test setup or mocking heavy dependencies.",
      value: `${metrics.testExecution.averageSuiteTime}ms average`,
    });
  }

  // Test efficiency recommendations
  if (
    results.numTotalTests > 0 &&
    metrics.testExecution.totalDuration / results.numTotalTests > 1000
  ) {
    // > 1 second per test
    recommendations.push({
      type: "efficiency",
      priority: "medium",
      message:
        "Tests are running slowly. Consider reviewing test complexity and async operations.",
      value: `${Math.round(metrics.testExecution.totalDuration / results.numTotalTests)}ms per test`,
    });
  }

  // Coverage mode recommendations
  if (
    process.env.NODE_ENV === "coverage" &&
    metrics.testExecution.totalDuration > 300000
  ) {
    // > 5 minutes
    recommendations.push({
      type: "coverage",
      priority: "low",
      message:
        "Coverage collection is taking a long time. Consider using parallel execution or optimizing test setup.",
      value: `${Math.round(metrics.testExecution.totalDuration / 1000)}s total`,
    });
  }

  return recommendations;
}
