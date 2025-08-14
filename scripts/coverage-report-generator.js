#!/usr/bin/env node

/**
 * Enhanced Coverage Report Generator
 * Generates comprehensive coverage reports with performance insights
 * and actionable recommendations for achieving 100% coverage
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class CoverageReportGenerator {
  constructor() {
    this.coverageDir = path.join(process.cwd(), "coverage");
    this.reportsDir = path.join(this.coverageDir, "reports");
    this.timestamp = new Date().toISOString();
    this.isCI = process.env.CI === "true";
  }

  /**
   * Generate comprehensive coverage reports
   */
  async generateReports() {
    console.log("📊 Generating enhanced coverage reports...");

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    try {
      // Load coverage data
      const coverageData = this.loadCoverageData();

      // Generate various report formats
      await this.generateSummaryReport(coverageData);
      await this.generateDetailedAnalysis(coverageData);
      await this.generateGapAnalysis(coverageData);
      await this.generatePerformanceReport();
      await this.generateActionableReport(coverageData);

      // Generate consolidated dashboard
      await this.generateDashboard(coverageData);

      console.log("✅ Coverage reports generated successfully");
      this.logReportSummary();
    } catch (error) {
      console.error("❌ Error generating coverage reports:", error.message);
      throw error;
    }
  }

  /**
   * Load coverage data from various sources
   */
  loadCoverageData() {
    const coverageSummaryPath = path.join(
      this.coverageDir,
      "coverage-summary.json",
    );
    const coverageFinalPath = path.join(
      this.coverageDir,
      "coverage-final.json",
    );

    if (!fs.existsSync(coverageSummaryPath)) {
      throw new Error(
        "Coverage summary file not found. Run tests with coverage first.",
      );
    }

    const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf8"));
    let detailed = null;

    if (fs.existsSync(coverageFinalPath)) {
      detailed = JSON.parse(fs.readFileSync(coverageFinalPath, "utf8"));
    }

    return { summary, detailed };
  }

  /**
   * Generate summary report with key metrics
   */
  async generateSummaryReport(coverageData) {
    const { summary } = coverageData;
    const { total } = summary;

    const summaryReport = {
      timestamp: this.timestamp,
      status: this.getCoverageStatus(total),
      metrics: {
        statements: {
          percentage: total.statements.pct,
          covered: total.statements.covered,
          total: total.statements.total,
          uncovered: total.statements.total - total.statements.covered,
        },
        branches: {
          percentage: total.branches.pct,
          covered: total.branches.covered,
          total: total.branches.total,
          uncovered: total.branches.total - total.branches.covered,
        },
        functions: {
          percentage: total.functions.pct,
          covered: total.functions.covered,
          total: total.functions.total,
          uncovered: total.functions.total - total.functions.covered,
        },
        lines: {
          percentage: total.lines.pct,
          covered: total.lines.covered,
          total: total.lines.total,
          uncovered: total.lines.total - total.lines.covered,
        },
      },
      thresholds: {
        target: 100,
        gaps: {
          statements: Math.max(0, 100 - total.statements.pct),
          branches: Math.max(0, 100 - total.branches.pct),
          functions: Math.max(0, 100 - total.functions.pct),
          lines: Math.max(0, 100 - total.lines.pct),
        },
      },
      fileCount: Object.keys(summary).length - 1, // Exclude 'total'
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-summary-enhanced.json"),
      JSON.stringify(summaryReport, null, 2),
    );

    return summaryReport;
  }

  /**
   * Generate detailed file-by-file analysis
   */
  async generateDetailedAnalysis(coverageData) {
    const { summary } = coverageData;

    const fileAnalysis = [];

    Object.entries(summary).forEach(([filePath, data]) => {
      if (filePath === "total") return;

      const analysis = {
        file: filePath.replace(process.cwd(), ""),
        metrics: {
          statements: data.statements,
          branches: data.branches,
          functions: data.functions,
          lines: data.lines,
        },
        status: this.getFileStatus(data),
        priority: this.calculateFilePriority(data),
        estimatedEffort: this.estimateEffort(data),
      };

      fileAnalysis.push(analysis);
    });

    // Sort by priority (highest first)
    fileAnalysis.sort((a, b) => b.priority - a.priority);

    const detailedReport = {
      timestamp: this.timestamp,
      totalFiles: fileAnalysis.length,
      fileAnalysis,
      summary: {
        fullyTested: fileAnalysis.filter((f) => f.status === "complete").length,
        partiallyTested: fileAnalysis.filter((f) => f.status === "partial")
          .length,
        untested: fileAnalysis.filter((f) => f.status === "none").length,
        highPriority: fileAnalysis.filter((f) => f.priority >= 8).length,
        mediumPriority: fileAnalysis.filter(
          (f) => f.priority >= 5 && f.priority < 8,
        ).length,
        lowPriority: fileAnalysis.filter((f) => f.priority < 5).length,
      },
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-detailed-analysis.json"),
      JSON.stringify(detailedReport, null, 2),
    );

    return detailedReport;
  }

  /**
   * Generate gap analysis with specific recommendations
   */
  async generateGapAnalysis(coverageData) {
    const { summary } = coverageData;
    const { total } = summary;

    const gaps = [];

    // Identify coverage gaps
    if (total.statements.pct < 100) {
      gaps.push({
        type: "statements",
        current: total.statements.pct,
        target: 100,
        gap: 100 - total.statements.pct,
        uncoveredCount: total.statements.total - total.statements.covered,
        recommendation:
          "Add tests for uncovered statements. Focus on error handling and edge cases.",
        priority: "high",
        estimatedHours: Math.ceil(
          (total.statements.total - total.statements.covered) * 0.1,
        ),
      });
    }

    if (total.branches.pct < 100) {
      gaps.push({
        type: "branches",
        current: total.branches.pct,
        target: 100,
        gap: 100 - total.branches.pct,
        uncoveredCount: total.branches.total - total.branches.covered,
        recommendation:
          "Add tests for uncovered branches. Test both true/false conditions in if statements and switch cases.",
        priority: "high",
        estimatedHours: Math.ceil(
          (total.branches.total - total.branches.covered) * 0.15,
        ),
      });
    }

    if (total.functions.pct < 100) {
      gaps.push({
        type: "functions",
        current: total.functions.pct,
        target: 100,
        gap: 100 - total.functions.pct,
        uncoveredCount: total.functions.total - total.functions.covered,
        recommendation:
          "Add tests for uncovered functions. Ensure all exported functions are tested.",
        priority: "medium",
        estimatedHours: Math.ceil(
          (total.functions.total - total.functions.covered) * 0.2,
        ),
      });
    }

    if (total.lines.pct < 100) {
      gaps.push({
        type: "lines",
        current: total.lines.pct,
        target: 100,
        gap: 100 - total.lines.pct,
        uncoveredCount: total.lines.total - total.lines.covered,
        recommendation:
          "Add tests for uncovered lines. This often correlates with statements coverage.",
        priority: "medium",
        estimatedHours: Math.ceil(
          (total.lines.total - total.lines.covered) * 0.05,
        ),
      });
    }

    const gapAnalysis = {
      timestamp: this.timestamp,
      status: gaps.length === 0 ? "complete" : "incomplete",
      totalGaps: gaps.length,
      gaps,
      totalEstimatedHours: gaps.reduce(
        (sum, gap) => sum + gap.estimatedHours,
        0,
      ),
      nextSteps: this.generateNextSteps(gaps),
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-gap-analysis.json"),
      JSON.stringify(gapAnalysis, null, 2),
    );

    return gapAnalysis;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport() {
    const performanceFiles = [
      "coverage-performance-report.json",
      "jest-memory-report.json",
      "test-summary-enhanced.json",
    ];

    const performanceData = {};

    performanceFiles.forEach((file) => {
      const filePath = path.join(this.reportsDir, file);
      if (fs.existsSync(filePath)) {
        try {
          performanceData[file.replace(".json", "")] = JSON.parse(
            fs.readFileSync(filePath, "utf8"),
          );
        } catch (error) {
          console.warn(`Warning: Could not load ${file}:`, error.message);
        }
      }
    });

    const performanceReport = {
      timestamp: this.timestamp,
      summary: {
        testExecutionTime:
          performanceData["test-summary-enhanced"]?.performance?.testExecution
            ?.totalDuration || 0,
        memoryUsage:
          performanceData["jest-memory-report"]?.analysis?.peakMemory?.heap ||
          0,
        coverageCollectionOverhead:
          this.calculateCoverageOverhead(performanceData),
      },
      recommendations: this.generatePerformanceRecommendations(performanceData),
      rawData: performanceData,
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-performance-summary.json"),
      JSON.stringify(performanceReport, null, 2),
    );

    return performanceReport;
  }

  /**
   * Generate actionable report with specific tasks
   */
  async generateActionableReport(coverageData) {
    const { summary } = coverageData;

    const tasks = [];
    let taskId = 1;

    // Generate tasks for each file that needs coverage
    Object.entries(summary).forEach(([filePath, data]) => {
      if (filePath === "total") return;

      const fileStatus = this.getFileStatus(data);
      if (fileStatus !== "complete") {
        const relativePath = filePath.replace(process.cwd(), "");

        // Generate specific tasks based on what's missing
        if (data.statements.pct < 100) {
          tasks.push({
            id: taskId++,
            type: "statements",
            file: relativePath,
            description: `Add tests for ${data.statements.total - data.statements.covered} uncovered statements`,
            currentCoverage: data.statements.pct,
            priority: this.calculateFilePriority(data),
            estimatedHours: Math.ceil(
              (data.statements.total - data.statements.covered) * 0.1,
            ),
            commands: [
              `npm run test:coverage:100 -- --testPathPattern="${relativePath.replace(/\.[^/.]+$/, "")}"`,
              "# Review HTML coverage report to identify uncovered lines",
              "# Add test cases for uncovered statements",
            ],
          });
        }

        if (data.branches.pct < 100) {
          tasks.push({
            id: taskId++,
            type: "branches",
            file: relativePath,
            description: `Add tests for ${data.branches.total - data.branches.covered} uncovered branches`,
            currentCoverage: data.branches.pct,
            priority: this.calculateFilePriority(data),
            estimatedHours: Math.ceil(
              (data.branches.total - data.branches.covered) * 0.15,
            ),
            commands: [
              `npm run test:coverage:100 -- --testPathPattern="${relativePath.replace(/\.[^/.]+$/, "")}"`,
              "# Review HTML coverage report to identify uncovered branches",
              "# Add test cases for both true/false conditions",
            ],
          });
        }

        if (data.functions.pct < 100) {
          tasks.push({
            id: taskId++,
            type: "functions",
            file: relativePath,
            description: `Add tests for ${data.functions.total - data.functions.covered} uncovered functions`,
            currentCoverage: data.functions.pct,
            priority: this.calculateFilePriority(data),
            estimatedHours: Math.ceil(
              (data.functions.total - data.functions.covered) * 0.2,
            ),
            commands: [
              `npm run test:coverage:100 -- --testPathPattern="${relativePath.replace(/\.[^/.]+$/, "")}"`,
              "# Identify uncovered functions in the file",
              "# Create test cases for each uncovered function",
            ],
          });
        }
      }
    });

    // Sort tasks by priority
    tasks.sort((a, b) => b.priority - a.priority);

    const actionableReport = {
      timestamp: this.timestamp,
      totalTasks: tasks.length,
      estimatedTotalHours: tasks.reduce(
        (sum, task) => sum + task.estimatedHours,
        0,
      ),
      tasksByPriority: {
        high: tasks.filter((t) => t.priority >= 8).length,
        medium: tasks.filter((t) => t.priority >= 5 && t.priority < 8).length,
        low: tasks.filter((t) => t.priority < 5).length,
      },
      tasks: tasks.slice(0, 50), // Limit to top 50 tasks
      quickWins: tasks.filter((t) => t.estimatedHours <= 1).slice(0, 10),
      nextSteps: [
        "1. Start with high-priority tasks (priority >= 8)",
        "2. Focus on quick wins (estimated <= 1 hour) for momentum",
        "3. Run coverage reports frequently to track progress",
        "4. Use 'npm run test:coverage:100' to validate changes",
      ],
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-actionable-tasks.json"),
      JSON.stringify(actionableReport, null, 2),
    );

    return actionableReport;
  }

  /**
   * Generate consolidated dashboard
   */
  async generateDashboard(coverageData) {
    const summaryReport = JSON.parse(
      fs.readFileSync(
        path.join(this.reportsDir, "coverage-summary-enhanced.json"),
        "utf8",
      ),
    );
    const gapAnalysis = JSON.parse(
      fs.readFileSync(
        path.join(this.reportsDir, "coverage-gap-analysis.json"),
        "utf8",
      ),
    );
    const actionableReport = JSON.parse(
      fs.readFileSync(
        path.join(this.reportsDir, "coverage-actionable-tasks.json"),
        "utf8",
      ),
    );

    const dashboard = {
      timestamp: this.timestamp,
      status: summaryReport.status,
      overview: {
        currentCoverage: {
          statements: summaryReport.metrics.statements.percentage,
          branches: summaryReport.metrics.branches.percentage,
          functions: summaryReport.metrics.functions.percentage,
          lines: summaryReport.metrics.lines.percentage,
        },
        progress: {
          totalGaps: gapAnalysis.totalGaps,
          totalTasks: actionableReport.totalTasks,
          estimatedHours: actionableReport.estimatedTotalHours,
          quickWins: actionableReport.quickWins.length,
        },
        files: {
          total: summaryReport.fileCount,
          fullyTested:
            actionableReport.tasksByPriority.high +
            actionableReport.tasksByPriority.medium +
            actionableReport.tasksByPriority.low,
          needsWork:
            summaryReport.fileCount -
            (actionableReport.tasksByPriority.high +
              actionableReport.tasksByPriority.medium +
              actionableReport.tasksByPriority.low),
        },
      },
      recommendations: [
        ...gapAnalysis.nextSteps,
        ...actionableReport.nextSteps,
      ],
      reports: {
        summary: "coverage-summary-enhanced.json",
        detailed: "coverage-detailed-analysis.json",
        gaps: "coverage-gap-analysis.json",
        tasks: "coverage-actionable-tasks.json",
        performance: "coverage-performance-summary.json",
      },
    };

    fs.writeFileSync(
      path.join(this.reportsDir, "coverage-dashboard.json"),
      JSON.stringify(dashboard, null, 2),
    );

    return dashboard;
  }

  /**
   * Helper methods
   */
  getCoverageStatus(total) {
    const allMetrics = [
      total.statements.pct,
      total.branches.pct,
      total.functions.pct,
      total.lines.pct,
    ];
    const allComplete = allMetrics.every((pct) => pct === 100);
    const anyStarted = allMetrics.some((pct) => pct > 0);

    if (allComplete) return "complete";
    if (anyStarted) return "partial";
    return "none";
  }

  getFileStatus(data) {
    const allMetrics = [
      data.statements.pct,
      data.branches.pct,
      data.functions.pct,
      data.lines.pct,
    ];
    const allComplete = allMetrics.every((pct) => pct === 100);
    const anyStarted = allMetrics.some((pct) => pct > 0);

    if (allComplete) return "complete";
    if (anyStarted) return "partial";
    return "none";
  }

  calculateFilePriority(data) {
    // Priority based on how much coverage is missing and file importance
    const avgCoverage =
      (data.statements.pct +
        data.branches.pct +
        data.functions.pct +
        data.lines.pct) /
      4;
    const coverageGap = 100 - avgCoverage;

    // Higher priority for larger gaps
    let priority = Math.min(10, Math.max(1, Math.ceil(coverageGap / 10)));

    // Boost priority for certain file types
    const filePath = data.file || "";
    if (filePath.includes("/api/")) priority += 2; // API routes are important
    if (filePath.includes("/components/")) priority += 1; // Components are important
    if (filePath.includes("/lib/")) priority += 1; // Library functions are important

    return Math.min(10, priority);
  }

  estimateEffort(data) {
    const uncoveredStatements = data.statements.total - data.statements.covered;
    const uncoveredBranches = data.branches.total - data.branches.covered;
    const uncoveredFunctions = data.functions.total - data.functions.covered;

    // Rough estimation: 0.1 hours per statement, 0.15 per branch, 0.2 per function
    return Math.ceil(
      uncoveredStatements * 0.1 +
        uncoveredBranches * 0.15 +
        uncoveredFunctions * 0.2,
    );
  }

  generateNextSteps(gaps) {
    const steps = [];

    if (gaps.length === 0) {
      return ["🎉 Congratulations! 100% coverage achieved!"];
    }

    // Sort gaps by priority
    const sortedGaps = gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    steps.push("📋 Recommended next steps:");

    sortedGaps.forEach((gap, index) => {
      steps.push(
        `${index + 1}. Address ${gap.type} coverage (${gap.gap.toFixed(1)}% gap, ~${gap.estimatedHours}h)`,
      );
    });

    steps.push(
      "🔍 Use 'npm run test:coverage:100' to see detailed coverage report",
    );
    steps.push("📊 Open coverage/index.html to see visual coverage report");

    return steps;
  }

  calculateCoverageOverhead(performanceData) {
    // Estimate coverage collection overhead based on available data
    const testData = performanceData["test-summary-enhanced"];
    if (!testData) return "unknown";

    const totalTime = testData.performance?.testExecution?.totalDuration || 0;
    const estimatedOverhead = totalTime * 0.3; // Assume 30% overhead for coverage

    return {
      estimated: Math.round(estimatedOverhead),
      percentage: 30,
      note: "Estimated based on typical coverage instrumentation overhead",
    };
  }

  generatePerformanceRecommendations(performanceData) {
    const recommendations = [];

    const memoryData = performanceData["jest-memory-report"];
    const testData = performanceData["test-summary-enhanced"];

    if (memoryData?.analysis?.peakMemory?.heap > 2048) {
      recommendations.push({
        type: "memory",
        message:
          "High memory usage detected. Consider using --runInBand or reducing maxWorkers.",
        priority: "high",
      });
    }

    if (testData?.performance?.testExecution?.totalDuration > 300000) {
      recommendations.push({
        type: "performance",
        message:
          "Long test execution time. Consider optimizing test setup or using parallel execution.",
        priority: "medium",
      });
    }

    return recommendations;
  }

  logReportSummary() {
    const dashboardPath = path.join(this.reportsDir, "coverage-dashboard.json");
    if (fs.existsSync(dashboardPath)) {
      const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

      console.log("\n📊 Coverage Report Summary:");
      console.log(`Status: ${dashboard.status}`);
      console.log(
        `Current Coverage: ${dashboard.overview.currentCoverage.statements}% statements, ${dashboard.overview.currentCoverage.branches}% branches`,
      );
      console.log(`Tasks Remaining: ${dashboard.overview.progress.totalTasks}`);
      console.log(
        `Estimated Effort: ${dashboard.overview.progress.estimatedHours} hours`,
      );
      console.log(
        `Quick Wins Available: ${dashboard.overview.progress.quickWins}`,
      );
      console.log(`\n📁 Reports available in: ${this.reportsDir}`);
      console.log(`🎯 Main dashboard: coverage-dashboard.json`);
    }
  }
}

// CLI usage
async function main() {
  const generator = new CoverageReportGenerator();

  try {
    await generator.generateReports();
    console.log("🎉 Coverage report generation completed successfully!");
  } catch (error) {
    console.error("❌ Coverage report generation failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CoverageReportGenerator;
