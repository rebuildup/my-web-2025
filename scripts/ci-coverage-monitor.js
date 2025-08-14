#!/usr/bin/env node

/**
 * CI/CD Coverage Monitoring Script
 * Provides comprehensive coverage monitoring and reporting for CI/CD pipelines
 */

const fs = require("fs");
const path = require("path");

const COVERAGE_FILE = path.join(
  process.cwd(),
  "coverage",
  "coverage-summary.json",
);
const REPORTS_DIR = path.join(process.cwd(), "coverage", "reports");

class CICoverageMonitor {
  constructor() {
    this.threshold = 100;
    this.ciContext = this.getCIContext();
  }

  getCIContext() {
    return {
      isCI: process.env.CI === "true",
      isGitHubActions: process.env.GITHUB_ACTIONS === "true",
      branch:
        process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "unknown",
      commit: process.env.GITHUB_SHA || process.env.COMMIT_SHA || "unknown",
      pr:
        process.env.GITHUB_EVENT_NAME === "pull_request"
          ? process.env.GITHUB_EVENT_NUMBER
          : null,
      runId: process.env.GITHUB_RUN_ID || null,
      actor: process.env.GITHUB_ACTOR || process.env.USER || "unknown",
    };
  }

  async monitor() {
    console.log("🔍 Starting CI/CD coverage monitoring...");

    if (!fs.existsSync(COVERAGE_FILE)) {
      this.handleError("Coverage file not found", "COVERAGE_FILE_MISSING");
      return;
    }

    try {
      const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, "utf8"));
      const analysis = this.analyzeCoverage(coverageData);

      await this.generateReports(analysis);
      await this.setOutputs(analysis);
      await this.createAnnotations(analysis);

      if (analysis.status === "FAILED") {
        process.exit(1);
      }

      console.log("✅ Coverage monitoring completed successfully");
    } catch (error) {
      this.handleError(
        `Error during coverage monitoring: ${error.message}`,
        "MONITORING_ERROR",
      );
    }
  }

  analyzeCoverage(coverageData) {
    const { total } = coverageData;
    const metrics = ["statements", "branches", "functions", "lines"];
    const failures = [];

    metrics.forEach((metric) => {
      const percentage = total[metric].pct;
      if (percentage < this.threshold) {
        failures.push({
          metric,
          actual: percentage,
          required: this.threshold,
          gap: this.threshold - percentage,
        });
      }
    });

    const status = failures.length > 0 ? "FAILED" : "PASSED";

    return {
      timestamp: new Date().toISOString(),
      status,
      threshold: this.threshold,
      failures,
      summary: total,
      ciContext: this.ciContext,
      recommendations: this.generateRecommendations(failures),
      metrics: {
        totalFiles: Object.keys(coverageData).length - 1, // exclude 'total'
        failedMetrics: failures.length,
        overallScore: this.calculateOverallScore(total),
      },
    };
  }

  calculateOverallScore(total) {
    return (
      (total.statements.pct +
        total.branches.pct +
        total.functions.pct +
        total.lines.pct) /
      4
    ).toFixed(2);
  }

  generateRecommendations(failures) {
    if (failures.length === 0) {
      return [
        {
          type: "success",
          message: "Excellent! All coverage thresholds met at 100%",
          action: "Continue maintaining high test quality",
        },
      ];
    }

    const recommendations = [];

    failures.forEach((failure) => {
      switch (failure.metric) {
        case "statements":
          recommendations.push({
            type: "improvement",
            metric: failure.metric,
            message: `Add ${Math.ceil(failure.gap * 10)} more test assertions to cover uncovered statements`,
            action:
              "Focus on error handling, edge cases, and conditional logic",
            priority: "high",
          });
          break;
        case "branches":
          recommendations.push({
            type: "improvement",
            metric: failure.metric,
            message: `Add ${Math.ceil(failure.gap * 5)} more conditional tests to cover uncovered branches`,
            action:
              "Test both true/false conditions in if statements and switch cases",
            priority: "high",
          });
          break;
        case "functions":
          recommendations.push({
            type: "improvement",
            metric: failure.metric,
            message: `Add tests for ${Math.ceil(failure.gap * 2)} uncovered functions`,
            action: "Ensure all exported functions and methods are tested",
            priority: "medium",
          });
          break;
        case "lines":
          recommendations.push({
            type: "improvement",
            metric: failure.metric,
            message: `Cover ${Math.ceil(failure.gap * 10)} more lines of code`,
            action: "This often correlates with statements coverage",
            priority: "medium",
          });
          break;
      }
    });

    return recommendations;
  }

  async generateReports(analysis) {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    // Generate main report
    const reportPath = path.join(
      REPORTS_DIR,
      `ci-coverage-report-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

    // Generate status-specific report
    const statusReportPath = path.join(
      REPORTS_DIR,
      `coverage-${analysis.status.toLowerCase()}-${Date.now()}.json`,
    );
    fs.writeFileSync(statusReportPath, JSON.stringify(analysis, null, 2));

    console.log(`📁 Reports generated:`);
    console.log(`  - Main report: ${reportPath}`);
    console.log(`  - Status report: ${statusReportPath}`);
  }

  async setOutputs(analysis) {
    if (!this.ciContext.isGitHubActions) return;

    const outputs = [
      `coverage_status=${analysis.status.toLowerCase()}`,
      `coverage_failures=${analysis.failures.length}`,
      `coverage_score=${analysis.metrics.overallScore}`,
      `coverage_threshold=${this.threshold}`,
      `total_files=${analysis.metrics.totalFiles}`,
    ];

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, outputs.join("\n") + "\n");
      console.log("📤 GitHub Actions outputs set");
    }
  }

  async createAnnotations(analysis) {
    if (!this.ciContext.isGitHubActions) return;

    if (analysis.status === "FAILED") {
      // Create error annotations for each failure
      analysis.failures.forEach((failure) => {
        console.log(
          `::error title=Coverage Threshold Not Met::${failure.metric} coverage is ${failure.actual}% but requires ${failure.required}% (gap: ${failure.gap}%)`,
        );
      });

      // Create summary annotation
      console.log(
        `::error title=Coverage Quality Gate Failed::${analysis.failures.length} metrics below 100% threshold. Overall score: ${analysis.metrics.overallScore}%`,
      );
    } else {
      console.log(
        `::notice title=Coverage Quality Gate Passed::All coverage thresholds met at 100%. Overall score: ${analysis.metrics.overallScore}%`,
      );
    }

    // Create recommendations as notices
    analysis.recommendations.forEach((rec) => {
      if (rec.type === "improvement") {
        console.log(
          `::notice title=Coverage Improvement::${rec.message} - ${rec.action}`,
        );
      }
    });
  }

  handleError(message, code) {
    console.error(`❌ ${message}`);

    if (this.ciContext.isGitHubActions) {
      console.log(
        `::error title=Coverage Monitoring Error::${message} (Code: ${code})`,
      );
    }

    // Generate error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      status: "ERROR",
      error: { message, code },
      ciContext: this.ciContext,
    };

    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(REPORTS_DIR, `coverage-error-${Date.now()}.json`),
      JSON.stringify(errorReport, null, 2),
    );

    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new CICoverageMonitor();
  monitor.monitor().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}

module.exports = { CICoverageMonitor };
