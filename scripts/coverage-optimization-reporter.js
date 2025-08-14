/**
 * Coverage Optimization Reporter
 * Custom Jest reporter for tracking coverage collection performance
 * and providing optimization insights
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class CoverageOptimizationReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.startTime = Date.now();
    this.memorySnapshots = [];
    this.testMetrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      slowTests: [],
      memoryIntensiveTests: [],
    };
    this.isCI = process.env.CI === "true";
    this.isCoverageMode =
      process.env.NODE_ENV === "coverage" ||
      process.env.JEST_COVERAGE === "true";
  }

  onRunStart(results, options) {
    this.takeMemorySnapshot("run-start");

    if (!this.isCI) {
      console.log("🔍 Starting optimized coverage collection...");
      console.log(
        `📊 Configuration: ${this.globalConfig.maxWorkers} workers, ${this.globalConfig.testTimeout}ms timeout`,
      );
    }
  }

  onTestStart(test) {
    // Track memory before each test if needed
    if (Math.random() < 0.1) {
      // Sample 10% of tests
      this.takeMemorySnapshot(`test-start-${path.basename(test.path)}`);
    }
  }

  onTestResult(test, testResult, aggregatedResult) {
    const testDuration = testResult.perfStats.runtime;
    const testPath = test.path.replace(process.cwd(), "");

    // Track test metrics
    this.testMetrics.totalTests +=
      testResult.numPassingTests + testResult.numFailingTests;
    this.testMetrics.passedTests += testResult.numPassingTests;
    this.testMetrics.failedTests += testResult.numFailingTests;
    this.testMetrics.skippedTests += testResult.numPendingTests;

    // Identify slow tests (> 5 seconds)
    if (testDuration > 5000) {
      this.testMetrics.slowTests.push({
        path: testPath,
        duration: testDuration,
        tests: testResult.numPassingTests + testResult.numFailingTests,
      });
    }

    // Sample memory usage for some tests
    if (Math.random() < 0.05) {
      // Sample 5% of tests
      const memSnapshot = this.takeMemorySnapshot(
        `test-end-${path.basename(test.path)}`,
      );
      if (memSnapshot.heapUsed > 1024) {
        // > 1GB
        this.testMetrics.memoryIntensiveTests.push({
          path: testPath,
          memoryUsed: memSnapshot.heapUsed,
          duration: testDuration,
        });
      }
    }
  }

  onRunComplete(contexts, results) {
    this.takeMemorySnapshot("run-complete");

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    // Generate optimization report
    const optimizationReport = this.generateOptimizationReport(
      results,
      totalDuration,
    );

    // Save report
    this.saveOptimizationReport(optimizationReport);

    // Log summary
    this.logOptimizationSummary(optimizationReport);
  }

  takeMemorySnapshot(label) {
    const memUsage = process.memoryUsage();
    const snapshot = {
      timestamp: Date.now(),
      label,
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    };

    this.memorySnapshots.push(snapshot);
    return snapshot;
  }

  generateOptimizationReport(results, totalDuration) {
    const peakMemory = Math.max(...this.memorySnapshots.map((s) => s.heapUsed));
    const averageMemory = Math.round(
      this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) /
        this.memorySnapshots.length,
    );

    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        isCI: this.isCI,
        isCoverageMode: this.isCoverageMode,
        nodeVersion: process.version,
        platform: os.platform(),
        cpuCount: os.cpus().length,
        totalMemoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      },
      configuration: {
        maxWorkers: this.globalConfig.maxWorkers,
        testTimeout: this.globalConfig.testTimeout,
        coverageProvider: this.globalConfig.coverageProvider,
        cacheEnabled: this.globalConfig.cache,
      },
      performance: {
        totalDuration,
        formattedDuration: `${Math.floor(totalDuration / 60000)}m ${Math.floor((totalDuration % 60000) / 1000)}s`,
        testsPerSecond: Math.round(
          (this.testMetrics.totalTests * 1000) / totalDuration,
        ),
        averageTestTime: Math.round(
          totalDuration / this.testMetrics.totalTests,
        ),
      },
      memory: {
        peakMemoryMB: peakMemory,
        averageMemoryMB: averageMemory,
        memoryGrowth: this.calculateMemoryGrowth(),
        snapshots: this.memorySnapshots.length,
      },
      testMetrics: this.testMetrics,
      coverage: {
        enabled: results.coverageMap ? true : false,
        filesWithCoverage: results.coverageMap
          ? Object.keys(results.coverageMap).length
          : 0,
      },
      optimization: {
        recommendations: this.generateOptimizationRecommendations(
          totalDuration,
          peakMemory,
        ),
        efficiency: this.calculateEfficiencyScore(totalDuration, peakMemory),
      },
    };

    return report;
  }

  calculateMemoryGrowth() {
    if (this.memorySnapshots.length < 2) return { growth: 0, trend: "stable" };

    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    const growth = last.heapUsed - first.heapUsed;
    const growthPercent = Math.round((growth / first.heapUsed) * 100);

    let trend = "stable";
    if (growthPercent > 50) trend = "high-growth";
    else if (growthPercent > 20) trend = "moderate-growth";
    else if (growthPercent < -20) trend = "decreasing";

    return { growth, growthPercent, trend };
  }

  generateOptimizationRecommendations(duration, peakMemory) {
    const recommendations = [];

    // Duration-based recommendations
    if (duration > 300000) {
      // > 5 minutes
      recommendations.push({
        type: "performance",
        priority: "high",
        message:
          "Test execution is slow. Consider increasing maxWorkers or optimizing slow tests.",
        value: `${Math.round(duration / 1000)}s total`,
      });
    }

    // Memory-based recommendations
    if (peakMemory > 2048) {
      // > 2GB
      recommendations.push({
        type: "memory",
        priority: "high",
        message:
          "High memory usage detected. Consider using --runInBand or reducing test complexity.",
        value: `${peakMemory}MB peak`,
      });
    }

    // Slow tests recommendations
    if (this.testMetrics.slowTests.length > 0) {
      recommendations.push({
        type: "slow-tests",
        priority: "medium",
        message: `${this.testMetrics.slowTests.length} slow tests detected. Consider optimizing or splitting them.`,
        value: this.testMetrics.slowTests.slice(0, 3).map((t) => t.path),
      });
    }

    // Memory-intensive tests
    if (this.testMetrics.memoryIntensiveTests.length > 0) {
      recommendations.push({
        type: "memory-intensive",
        priority: "medium",
        message: `${this.testMetrics.memoryIntensiveTests.length} memory-intensive tests detected.`,
        value: this.testMetrics.memoryIntensiveTests
          .slice(0, 3)
          .map((t) => t.path),
      });
    }

    // Configuration recommendations
    if (this.globalConfig.maxWorkers > 1 && peakMemory > 1024) {
      recommendations.push({
        type: "configuration",
        priority: "low",
        message: "Consider reducing maxWorkers to decrease memory usage.",
        value: `Current: ${this.globalConfig.maxWorkers} workers`,
      });
    }

    return recommendations;
  }

  calculateEfficiencyScore(duration, peakMemory) {
    // Simple efficiency scoring (0-100)
    let score = 100;

    // Penalize long duration
    if (duration > 600000)
      score -= 30; // > 10 minutes
    else if (duration > 300000)
      score -= 15; // > 5 minutes
    else if (duration > 180000) score -= 5; // > 3 minutes

    // Penalize high memory usage
    if (peakMemory > 4096)
      score -= 30; // > 4GB
    else if (peakMemory > 2048)
      score -= 15; // > 2GB
    else if (peakMemory > 1024) score -= 5; // > 1GB

    // Penalize slow tests
    score -= Math.min(20, this.testMetrics.slowTests.length * 2);

    // Penalize failed tests
    score -= Math.min(30, this.testMetrics.failedTests * 5);

    return Math.max(0, score);
  }

  saveOptimizationReport(report) {
    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "coverage-optimization-report.json"),
      JSON.stringify(report, null, 2),
    );
  }

  logOptimizationSummary(report) {
    if (this.isCI && report.testMetrics.failedTests === 0) {
      // Minimal output in CI for successful runs
      console.log(
        `✅ Coverage collection completed: ${report.performance.formattedDuration}, ${report.memory.peakMemoryMB}MB peak`,
      );
      return;
    }

    console.log("\n📊 Coverage Collection Optimization Report:");
    console.log(`⏱️  Duration: ${report.performance.formattedDuration}`);
    console.log(
      `🧠 Memory: ${report.memory.peakMemoryMB}MB peak, ${report.memory.averageMemoryMB}MB average`,
    );
    console.log(`🎯 Efficiency Score: ${report.optimization.efficiency}/100`);
    console.log(
      `📈 Tests: ${report.testMetrics.totalTests} total, ${report.testMetrics.passedTests} passed`,
    );

    if (report.testMetrics.failedTests > 0) {
      console.log(`❌ Failed Tests: ${report.testMetrics.failedTests}`);
    }

    if (report.testMetrics.slowTests.length > 0) {
      console.log(`🐌 Slow Tests: ${report.testMetrics.slowTests.length}`);
    }

    if (report.optimization.recommendations.length > 0) {
      console.log("\n💡 Optimization Recommendations:");
      report.optimization.recommendations.slice(0, 3).forEach((rec) => {
        const priority =
          rec.priority === "high"
            ? "🔴"
            : rec.priority === "medium"
              ? "🟡"
              : "🟢";
        console.log(`  ${priority} ${rec.message}`);
      });
    }

    console.log(
      `📁 Full report: coverage/reports/coverage-optimization-report.json`,
    );
  }
}

module.exports = CoverageOptimizationReporter;
