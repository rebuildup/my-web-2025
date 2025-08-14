#!/usr/bin/env node

/**
 * Coverage Collection Optimizer
 * Optimizes Jest configuration and execution for 100% coverage collection
 * Handles memory management, parallel execution, and performance monitoring
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

class CoverageCollectionOptimizer {
  constructor() {
    this.startTime = Date.now();
    this.memorySnapshots = [];
    this.isCI = process.env.CI === "true";
    this.isCoverageMode =
      process.env.NODE_ENV === "coverage" ||
      process.env.JEST_COVERAGE === "true";
  }

  /**
   * Take a memory snapshot for monitoring
   */
  takeMemorySnapshot(label = "unknown") {
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

    if (!this.isCI) {
      console.log(
        `📊 Memory [${label}]: RSS ${snapshot.rss}MB, Heap ${snapshot.heapUsed}/${snapshot.heapTotal}MB`,
      );
    }

    return snapshot;
  }

  /**
   * Get optimal Jest configuration for coverage collection
   */
  getOptimalJestConfig() {
    const cpuCount = os.cpus().length;
    const totalMemoryGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);

    // Calculate optimal workers based on system resources
    let maxWorkers;
    if (this.isCI) {
      // Conservative for CI environments
      maxWorkers = Math.max(1, Math.floor(cpuCount * 0.5));
    } else if (totalMemoryGB >= 16) {
      // High memory systems can handle more workers
      maxWorkers = Math.max(1, Math.floor(cpuCount * 0.8));
    } else if (totalMemoryGB >= 8) {
      // Medium memory systems
      maxWorkers = Math.max(1, Math.floor(cpuCount * 0.6));
    } else {
      // Low memory systems
      maxWorkers = Math.max(1, Math.floor(cpuCount * 0.4));
    }

    // Calculate memory limits
    const workerMemoryLimit = this.isCI ? "256MB" : "512MB";
    const nodeMemoryLimit = Math.max(
      4096,
      Math.floor(totalMemoryGB * 1024 * 0.7),
    ); // 70% of total memory

    return {
      maxWorkers,
      workerMemoryLimit,
      nodeMemoryLimit,
      testTimeout: this.isCI ? 45000 : 60000,
      cpuCount,
      totalMemoryGB,
    };
  }

  /**
   * Clean up cache directories to free memory
   */
  cleanupCaches() {
    const cacheDirectories = [
      ".jest-cache",
      ".jest-cache-coverage",
      "node_modules/.cache",
      ".next/cache",
    ];

    cacheDirectories.forEach((dir) => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        try {
          execSync(`rm -rf "${fullPath}"`, { stdio: "ignore" });
          console.log(`🧹 Cleaned cache: ${dir}`);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  }

  /**
   * Optimize Node.js runtime for coverage collection
   */
  optimizeNodeRuntime() {
    const config = this.getOptimalJestConfig();

    // Set Node.js memory limit
    process.env.NODE_OPTIONS = `--max-old-space-size=${config.nodeMemoryLimit}`;

    // Enable garbage collection optimizations
    if (!this.isCI) {
      process.env.NODE_OPTIONS += " --expose-gc";
    }

    // Optimize V8 for coverage instrumentation
    process.env.NODE_OPTIONS += " --optimize-for-size";

    console.log(
      `🚀 Node.js optimized: ${config.nodeMemoryLimit}MB memory limit, ${config.maxWorkers} workers`,
    );

    return config;
  }

  /**
   * Run coverage collection with optimizations
   */
  async runOptimizedCoverage() {
    console.log("🔍 Starting optimized coverage collection...");

    this.takeMemorySnapshot("start");

    // Clean up caches first
    this.cleanupCaches();

    // Optimize Node.js runtime
    const config = this.optimizeNodeRuntime();

    this.takeMemorySnapshot("after-optimization");

    // Prepare Jest command
    const jestConfig = this.isCI
      ? "jest.config.100-coverage.js"
      : "jest.config.100-coverage.js";
    const jestCommand = [
      "npx",
      "jest",
      "--config",
      jestConfig,
      "--coverage",
      "--watchAll=false",
    ];

    if (this.isCI) {
      jestCommand.push("--ci");
    }

    // Add parallel execution if not in CI
    if (!this.isCI && config.maxWorkers > 1) {
      jestCommand.push(`--maxWorkers=${config.maxWorkers}`);
    } else {
      jestCommand.push("--runInBand"); // Serial execution for CI
    }

    console.log(`📋 Jest command: ${jestCommand.join(" ")}`);

    try {
      // Run Jest with optimizations
      const jestProcess = spawn(jestCommand[0], jestCommand.slice(1), {
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "coverage",
          JEST_COVERAGE: "true",
        },
      });

      // Monitor memory usage during execution
      const memoryMonitor = setInterval(() => {
        this.takeMemorySnapshot("during-execution");
      }, 30000); // Every 30 seconds

      return new Promise((resolve, reject) => {
        jestProcess.on("close", (code) => {
          clearInterval(memoryMonitor);
          this.takeMemorySnapshot("end");

          if (code === 0) {
            console.log("✅ Coverage collection completed successfully");
            this.generatePerformanceReport();
            resolve(code);
          } else {
            console.error(`❌ Coverage collection failed with code ${code}`);
            this.generatePerformanceReport();
            reject(new Error(`Jest exited with code ${code}`));
          }
        });

        jestProcess.on("error", (error) => {
          clearInterval(memoryMonitor);
          console.error("❌ Failed to start Jest process:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("❌ Error running coverage collection:", error);
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: {
        total: duration,
        formatted: `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`,
      },
      environment: {
        isCI: this.isCI,
        nodeVersion: process.version,
        platform: os.platform(),
        cpuCount: os.cpus().length,
        totalMemoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      },
      memorySnapshots: this.memorySnapshots,
      peakMemory: {
        rss: Math.max(...this.memorySnapshots.map((s) => s.rss)),
        heap: Math.max(...this.memorySnapshots.map((s) => s.heapUsed)),
      },
      optimization: this.getOptimalJestConfig(),
    };

    // Save performance report
    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "coverage-performance-report.json"),
      JSON.stringify(report, null, 2),
    );

    // Log summary
    console.log("\n📊 Performance Summary:");
    console.log(`⏱️  Duration: ${report.duration.formatted}`);
    console.log(
      `🧠 Peak Memory: RSS ${report.peakMemory.rss}MB, Heap ${report.peakMemory.heap}MB`,
    );
    console.log(
      `💾 Report saved: coverage/reports/coverage-performance-report.json`,
    );
  }

  /**
   * Validate coverage results
   */
  async validateCoverageResults() {
    const coverageFile = path.join(
      process.cwd(),
      "coverage",
      "coverage-summary.json",
    );

    if (!fs.existsSync(coverageFile)) {
      throw new Error("Coverage summary file not found");
    }

    const coverage = JSON.parse(fs.readFileSync(coverageFile, "utf8"));
    const { total } = coverage;

    const metrics = ["statements", "branches", "functions", "lines"];
    const failures = metrics.filter((metric) => total[metric].pct < 100);

    if (failures.length > 0) {
      console.error("❌ Coverage validation failed:");
      failures.forEach((metric) => {
        console.error(`  ${metric}: ${total[metric].pct}% (required: 100%)`);
      });
      throw new Error(
        `Coverage validation failed for ${failures.length} metrics`,
      );
    }

    console.log("✅ Coverage validation passed: 100% achieved for all metrics");
    return true;
  }
}

// CLI usage
async function main() {
  const optimizer = new CoverageCollectionOptimizer();

  try {
    await optimizer.runOptimizedCoverage();
    await optimizer.validateCoverageResults();
    console.log(
      "🎉 Coverage collection and validation completed successfully!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Coverage collection failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CoverageCollectionOptimizer;
