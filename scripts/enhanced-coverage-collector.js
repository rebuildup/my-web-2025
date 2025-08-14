#!/usr/bin/env node

/**
 * Enhanced Coverage Collector
 * Optimized script for collecting 100% test coverage with performance monitoring
 * and memory management
 */

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const os = require("os");

class EnhancedCoverageCollector {
  constructor() {
    this.startTime = Date.now();
    this.isCI = process.env.CI === "true";
    this.memorySnapshots = [];
    this.phases = [
      { name: "preparation", status: "pending" },
      { name: "coverage-collection", status: "pending" },
      { name: "report-generation", status: "pending" },
      { name: "validation", status: "pending" },
    ];
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      console.log("🚀 Enhanced Coverage Collection Starting...");
      this.logSystemInfo();

      await this.executePhase("preparation", () => this.preparationPhase());
      await this.executePhase("coverage-collection", () =>
        this.coverageCollectionPhase(),
      );
      await this.executePhase("report-generation", () =>
        this.reportGenerationPhase(),
      );
      await this.executePhase("validation", () => this.validationPhase());

      console.log("🎉 Enhanced coverage collection completed successfully!");
      this.generateFinalReport();
      process.exit(0);
    } catch (error) {
      console.error("❌ Enhanced coverage collection failed:", error.message);
      this.generateErrorReport(error);
      process.exit(1);
    }
  }

  /**
   * Execute a phase with error handling and timing
   */
  async executePhase(phaseName, phaseFunction) {
    const phase = this.phases.find((p) => p.name === phaseName);
    if (!phase) throw new Error(`Unknown phase: ${phaseName}`);

    console.log(`\n📋 Phase: ${phaseName.toUpperCase()}`);
    phase.status = "running";
    phase.startTime = Date.now();

    try {
      await phaseFunction();
      phase.status = "completed";
      phase.endTime = Date.now();
      phase.duration = phase.endTime - phase.startTime;
      console.log(
        `✅ Phase ${phaseName} completed in ${Math.round(phase.duration / 1000)}s`,
      );
    } catch (error) {
      phase.status = "failed";
      phase.endTime = Date.now();
      phase.duration = phase.endTime - phase.startTime;
      phase.error = error.message;
      throw error;
    }
  }

  /**
   * Preparation phase - setup and optimization
   */
  async preparationPhase() {
    this.takeMemorySnapshot("preparation-start");

    // Clean up previous coverage data
    const coverageDir = path.join(process.cwd(), "coverage");
    if (fs.existsSync(coverageDir)) {
      console.log("🧹 Cleaning previous coverage data...");
      execSync(`rm -rf "${coverageDir}"`, { stdio: "ignore" });
    }

    // Clean up cache directories
    const cacheDirectories = [
      ".jest-cache",
      ".jest-cache-coverage",
      ".jest-cache-coverage-optimized",
      "node_modules/.cache",
    ];

    cacheDirectories.forEach((dir) => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        try {
          execSync(`rm -rf "${fullPath}"`, { stdio: "ignore" });
          console.log(`🧹 Cleaned cache: ${dir}`);
        } catch (error) {
          console.warn(`⚠️  Could not clean ${dir}:`, error.message);
        }
      }
    });

    // Optimize Node.js runtime
    this.optimizeNodeRuntime();

    // Verify Jest configuration
    this.verifyJestConfiguration();

    this.takeMemorySnapshot("preparation-end");
  }

  /**
   * Coverage collection phase - run tests with coverage
   */
  async coverageCollectionPhase() {
    this.takeMemorySnapshot("coverage-start");

    console.log("🔍 Starting optimized coverage collection...");

    // Determine optimal Jest configuration
    const jestConfig = this.selectOptimalJestConfig();
    console.log(`📋 Using Jest config: ${jestConfig}`);

    // Prepare Jest command
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

    // Add memory and performance optimizations
    const systemConfig = this.getSystemConfiguration();
    if (systemConfig.useSerialExecution) {
      jestCommand.push("--runInBand");
    } else {
      jestCommand.push(`--maxWorkers=${systemConfig.maxWorkers}`);
    }

    console.log(`📋 Jest command: ${jestCommand.join(" ")}`);

    // Run Jest with monitoring
    await this.runJestWithMonitoring(jestCommand);

    this.takeMemorySnapshot("coverage-end");
  }

  /**
   * Report generation phase - create comprehensive reports
   */
  async reportGenerationPhase() {
    console.log("📊 Generating comprehensive coverage reports...");

    // Run coverage report generator
    try {
      execSync("node scripts/coverage-report-generator.js", {
        stdio: "inherit",
      });
    } catch (error) {
      console.warn("⚠️  Coverage report generator failed:", error.message);
    }

    // Generate optimization insights
    this.generateOptimizationInsights();
  }

  /**
   * Validation phase - verify coverage results
   */
  async validationPhase() {
    console.log("✅ Validating coverage results...");

    const coverageSummaryPath = path.join(
      process.cwd(),
      "coverage",
      "coverage-summary.json",
    );

    if (!fs.existsSync(coverageSummaryPath)) {
      throw new Error("Coverage summary file not found");
    }

    const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
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

    // Log coverage summary
    console.log("\n📊 Coverage Summary:");
    metrics.forEach((metric) => {
      console.log(
        `  ${metric}: ${total[metric].pct}% (${total[metric].covered}/${total[metric].total})`,
      );
    });
  }

  /**
   * Run Jest with monitoring and error handling
   */
  async runJestWithMonitoring(jestCommand) {
    return new Promise((resolve, reject) => {
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

      jestProcess.on("close", (code) => {
        clearInterval(memoryMonitor);

        if (code === 0) {
          console.log("✅ Jest execution completed successfully");
          resolve(code);
        } else {
          console.error(`❌ Jest execution failed with code ${code}`);
          reject(new Error(`Jest exited with code ${code}`));
        }
      });

      jestProcess.on("error", (error) => {
        clearInterval(memoryMonitor);
        console.error("❌ Failed to start Jest process:", error);
        reject(error);
      });
    });
  }

  /**
   * Select optimal Jest configuration based on system resources
   */
  selectOptimalJestConfig() {
    const systemConfig = this.getSystemConfiguration();

    if (this.isCI) {
      return "jest.config.100-coverage-optimized.js";
    }

    if (systemConfig.totalMemoryGB >= 16) {
      return "jest.config.100-coverage-optimized.js";
    }

    return "jest.config.100-coverage.js";
  }

  /**
   * Get system configuration for optimization
   */
  getSystemConfiguration() {
    const cpuCount = os.cpus().length;
    const totalMemoryGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);

    let config = {
      cpuCount,
      totalMemoryGB,
      maxWorkers: 1,
      useSerialExecution: true,
    };

    if (!this.isCI && totalMemoryGB >= 16) {
      config.maxWorkers = Math.max(1, Math.floor(cpuCount * 0.6));
      config.useSerialExecution = false;
    } else if (!this.isCI && totalMemoryGB >= 8) {
      config.maxWorkers = Math.max(1, Math.floor(cpuCount * 0.4));
      config.useSerialExecution = false;
    }

    return config;
  }

  /**
   * Optimize Node.js runtime for coverage collection
   */
  optimizeNodeRuntime() {
    const systemConfig = this.getSystemConfiguration();
    const memoryLimit = Math.max(
      4096,
      Math.floor(systemConfig.totalMemoryGB * 1024 * 0.7),
    );

    process.env.NODE_OPTIONS = `--max-old-space-size=${memoryLimit}`;

    if (!this.isCI) {
      process.env.NODE_OPTIONS += " --expose-gc";
    }

    console.log(`🚀 Node.js optimized: ${memoryLimit}MB memory limit`);
  }

  /**
   * Verify Jest configuration exists and is valid
   */
  verifyJestConfiguration() {
    const configPath = this.selectOptimalJestConfig();
    const fullPath = path.join(process.cwd(), configPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Jest configuration not found: ${configPath}`);
    }

    console.log(`✅ Jest configuration verified: ${configPath}`);
  }

  /**
   * Take memory snapshot for monitoring
   */
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

    if (!this.isCI && snapshot.heapUsed > 1024) {
      console.log(`📊 Memory [${label}]: ${snapshot.heapUsed}MB heap`);
    }

    return snapshot;
  }

  /**
   * Generate optimization insights
   */
  generateOptimizationInsights() {
    const insights = {
      timestamp: new Date().toISOString(),
      systemInfo: this.getSystemConfiguration(),
      memoryUsage: {
        snapshots: this.memorySnapshots,
        peak: Math.max(...this.memorySnapshots.map((s) => s.heapUsed)),
        average: Math.round(
          this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) /
            this.memorySnapshots.length,
        ),
      },
      phases: this.phases,
      totalDuration: Date.now() - this.startTime,
    };

    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "enhanced-coverage-insights.json"),
      JSON.stringify(insights, null, 2),
    );

    console.log("📊 Optimization insights saved");
  }

  /**
   * Generate final report
   */
  generateFinalReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log("\n🎯 Enhanced Coverage Collection Summary:");
    console.log(
      `⏱️  Total Duration: ${Math.floor(totalDuration / 60000)}m ${Math.floor((totalDuration % 60000) / 1000)}s`,
    );
    console.log(
      `🧠 Peak Memory: ${Math.max(...this.memorySnapshots.map((s) => s.heapUsed))}MB`,
    );
    console.log(
      `📋 Phases Completed: ${this.phases.filter((p) => p.status === "completed").length}/${this.phases.length}`,
    );
    console.log(`📁 Reports Available: coverage/reports/`);
  }

  /**
   * Generate error report
   */
  generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
      },
      phases: this.phases,
      memorySnapshots: this.memorySnapshots,
      systemInfo: this.getSystemConfiguration(),
    };

    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "coverage-error-report.json"),
      JSON.stringify(errorReport, null, 2),
    );

    console.log(
      "📁 Error report saved: coverage/reports/coverage-error-report.json",
    );
  }

  /**
   * Log system information
   */
  logSystemInfo() {
    const systemConfig = this.getSystemConfiguration();

    console.log("💻 System Information:");
    console.log(`  Platform: ${os.platform()}`);
    console.log(`  Node.js: ${process.version}`);
    console.log(`  CPUs: ${systemConfig.cpuCount}`);
    console.log(`  Memory: ${systemConfig.totalMemoryGB}GB`);
    console.log(`  CI: ${this.isCI ? "Yes" : "No"}`);
  }
}

// CLI usage
async function main() {
  const collector = new EnhancedCoverageCollector();
  await collector.run();
}

if (require.main === module) {
  main();
}

module.exports = EnhancedCoverageCollector;
