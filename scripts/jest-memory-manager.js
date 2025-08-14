/**
 * Jest Memory Manager
 * Provides memory management utilities for Jest tests during coverage collection
 * Helps prevent memory leaks and optimize test execution performance
 */

const fs = require("fs");
const path = require("path");

class JestMemoryManager {
  constructor() {
    this.memorySnapshots = [];
    this.startTime = Date.now();
    this.isCI = process.env.CI === "true";
    this.isCoverageMode =
      process.env.NODE_ENV === "coverage" ||
      process.env.JEST_COVERAGE === "true";
    this.memoryThreshold = this.isCI ? 1024 : 2048; // MB
  }

  /**
   * Initialize memory management for Jest
   */
  initialize() {
    // Set up global memory management
    global.jestMemoryManager = this;

    // Track initial memory usage
    this.takeSnapshot("initialization");

    // Set up periodic memory monitoring
    if (this.isCoverageMode) {
      this.startMemoryMonitoring();
    }

    // Set up cleanup handlers
    this.setupCleanupHandlers();

    console.log(
      `🧠 Jest Memory Manager initialized (threshold: ${this.memoryThreshold}MB)`,
    );
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(label = "unknown") {
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

    // Log memory usage if it's high or in verbose mode
    if (
      !this.isCI &&
      (snapshot.heapUsed > this.memoryThreshold * 0.7 ||
        process.env.VERBOSE_MEMORY === "true")
    ) {
      console.log(
        `📊 Memory [${label}]: RSS ${snapshot.rss}MB, Heap ${snapshot.heapUsed}/${snapshot.heapTotal}MB`,
      );
    }

    // Trigger garbage collection if memory is high
    if (snapshot.heapUsed > this.memoryThreshold && global.gc) {
      global.gc();
      console.log(`🧹 Triggered garbage collection at ${snapshot.heapUsed}MB`);
    }

    return snapshot;
  }

  /**
   * Start periodic memory monitoring
   */
  startMemoryMonitoring() {
    this.memoryMonitorInterval = setInterval(() => {
      const snapshot = this.takeSnapshot("periodic-check");

      // Warn if memory usage is getting high
      if (snapshot.heapUsed > this.memoryThreshold * 0.8) {
        console.warn(
          `⚠️  High memory usage: ${snapshot.heapUsed}MB (threshold: ${this.memoryThreshold}MB)`,
        );
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
  }

  /**
   * Set up cleanup handlers
   */
  setupCleanupHandlers() {
    // Clean up on process exit
    process.on("exit", () => {
      this.cleanup();
    });

    // Clean up on SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      this.cleanup();
      process.exit(0);
    });

    // Clean up on SIGTERM
    process.on("SIGTERM", () => {
      this.cleanup();
      process.exit(0);
    });

    // Clean up on uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      this.cleanup();
      process.exit(1);
    });

    // Clean up on unhandled rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      this.cleanup();
      process.exit(1);
    });
  }

  /**
   * Clean up resources and generate final report
   */
  cleanup() {
    this.stopMemoryMonitoring();
    this.takeSnapshot("cleanup");
    this.generateMemoryReport();
  }

  /**
   * Generate memory usage report
   */
  generateMemoryReport() {
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
        isCoverageMode: this.isCoverageMode,
        nodeVersion: process.version,
        memoryThreshold: this.memoryThreshold,
      },
      memorySnapshots: this.memorySnapshots,
      analysis: {
        peakMemory: {
          rss: Math.max(...this.memorySnapshots.map((s) => s.rss)),
          heap: Math.max(...this.memorySnapshots.map((s) => s.heapUsed)),
        },
        averageMemory: {
          rss: Math.round(
            this.memorySnapshots.reduce((sum, s) => sum + s.rss, 0) /
              this.memorySnapshots.length,
          ),
          heap: Math.round(
            this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) /
              this.memorySnapshots.length,
          ),
        },
        memoryGrowth: this.calculateMemoryGrowth(),
        recommendations: this.generateMemoryRecommendations(),
      },
    };

    // Save memory report
    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "jest-memory-report.json"),
      JSON.stringify(report, null, 2),
    );

    // Log summary if not in CI or if there are issues
    if (!this.isCI || report.analysis.peakMemory.heap > this.memoryThreshold) {
      console.log("\n🧠 Memory Usage Summary:");
      console.log(
        `📊 Peak Memory: RSS ${report.analysis.peakMemory.rss}MB, Heap ${report.analysis.peakMemory.heap}MB`,
      );
      console.log(
        `📈 Average Memory: RSS ${report.analysis.averageMemory.rss}MB, Heap ${report.analysis.averageMemory.heap}MB`,
      );
      console.log(`⏱️  Duration: ${report.duration.formatted}`);

      if (report.analysis.recommendations.length > 0) {
        console.log("💡 Recommendations:");
        report.analysis.recommendations.forEach((rec) => {
          console.log(`  - ${rec.message}`);
        });
      }

      console.log(
        `📁 Memory report saved: coverage/reports/jest-memory-report.json`,
      );
    }
  }

  /**
   * Calculate memory growth over time
   */
  calculateMemoryGrowth() {
    if (this.memorySnapshots.length < 2) {
      return { growth: 0, trend: "stable" };
    }

    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    const growth = last.heapUsed - first.heapUsed;
    const growthPercent = Math.round((growth / first.heapUsed) * 100);

    let trend = "stable";
    if (growthPercent > 50) trend = "high-growth";
    else if (growthPercent > 20) trend = "moderate-growth";
    else if (growthPercent < -20) trend = "decreasing";

    return {
      growth,
      growthPercent,
      trend,
      initialMemory: first.heapUsed,
      finalMemory: last.heapUsed,
    };
  }

  /**
   * Generate memory optimization recommendations
   */
  generateMemoryRecommendations() {
    const recommendations = [];
    const analysis = {
      peakMemory: Math.max(...this.memorySnapshots.map((s) => s.heapUsed)),
      averageMemory: Math.round(
        this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) /
          this.memorySnapshots.length,
      ),
      memoryGrowth: this.calculateMemoryGrowth(),
    };

    // High memory usage
    if (analysis.peakMemory > this.memoryThreshold) {
      recommendations.push({
        type: "memory",
        priority: "high",
        message: `Peak memory usage (${analysis.peakMemory}MB) exceeded threshold (${this.memoryThreshold}MB). Consider using --runInBand or reducing maxWorkers.`,
      });
    }

    // Memory growth
    if (analysis.memoryGrowth.growthPercent > 50) {
      recommendations.push({
        type: "memory-leak",
        priority: "high",
        message: `High memory growth detected (${analysis.memoryGrowth.growthPercent}%). Check for memory leaks in tests.`,
      });
    }

    // Coverage mode optimizations
    if (this.isCoverageMode && analysis.peakMemory > 1024) {
      recommendations.push({
        type: "coverage",
        priority: "medium",
        message:
          "High memory usage during coverage collection. Consider splitting test runs or using coverage-specific optimizations.",
      });
    }

    // CI optimizations
    if (this.isCI && analysis.peakMemory > 512) {
      recommendations.push({
        type: "ci",
        priority: "medium",
        message:
          "Consider reducing memory usage for CI environments by using serial execution or smaller worker counts.",
      });
    }

    return recommendations;
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (global.gc) {
      const beforeGC = this.takeSnapshot("before-gc");
      global.gc();
      const afterGC = this.takeSnapshot("after-gc");

      const memoryFreed = beforeGC.heapUsed - afterGC.heapUsed;
      if (memoryFreed > 0) {
        console.log(`🧹 Garbage collection freed ${memoryFreed}MB`);
      }

      return memoryFreed;
    }
    return 0;
  }

  /**
   * Get current memory status
   */
  getMemoryStatus() {
    const current = this.takeSnapshot("status-check");
    return {
      current,
      isHighMemory: current.heapUsed > this.memoryThreshold * 0.8,
      thresholdPercent: Math.round(
        (current.heapUsed / this.memoryThreshold) * 100,
      ),
      recommendation:
        current.heapUsed > this.memoryThreshold * 0.8
          ? "Consider running garbage collection or reducing test complexity"
          : "Memory usage is within acceptable limits",
    };
  }
}

// Export for use in Jest setup
module.exports = JestMemoryManager;

// Initialize if run directly
if (require.main === module) {
  const manager = new JestMemoryManager();
  manager.initialize();
}
