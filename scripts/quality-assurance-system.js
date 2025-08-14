#!/usr/bin/env node

/**
 * Quality Assurance System
 *
 * Comprehensive quality assurance and continuous improvement system that:
 * - Monitors test quality metrics
 * - Enforces quality gates
 * - Provides automated recommendations
 * - Tracks improvement trends
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class QualityAssuranceSystem {
  constructor() {
    this.qaDir = path.join(process.cwd(), "coverage", "qa");
    this.configPath = path.join(this.qaDir, "qa-config.json");
    this.metricsPath = path.join(this.qaDir, "quality-metrics.json");
    this.reportsDir = path.join(this.qaDir, "reports");

    this.ensureDirectories();
    this.loadConfiguration();
  }

  /**
   * Ensure QA directories exist
   */
  ensureDirectories() {
    [this.qaDir, this.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load QA configuration
   */
  loadConfiguration() {
    const defaultConfig = {
      qualityGates: {
        coverage: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        performance: {
          maxTestExecutionTime: 120, // seconds
          maxSingleTestTime: 5, // seconds
          maxMemoryUsage: 512, // MB
        },
        reliability: {
          minPassRate: 100, // percentage
          maxFlakyTests: 0,
          maxFailingTests: 0,
        },
        maintainability: {
          minTestDensity: 80, // percentage
          maxTestDebt: 10, // hours
          maxComplexity: 10,
        },
      },
      monitoring: {
        enabled: true,
        frequency: "daily",
        alerts: {
          email: false,
          slack: false,
          console: true,
        },
      },
      automation: {
        autoFix: {
          enabled: false,
          types: ["formatting", "imports", "simple-refactoring"],
        },
        reporting: {
          enabled: true,
          formats: ["json", "html", "markdown"],
        },
      },
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        this.config = { ...defaultConfig, ...config };
      } else {
        this.config = defaultConfig;
        this.saveConfiguration();
      }
    } catch (error) {
      console.warn(
        "Could not load QA configuration, using defaults:",
        error.message,
      );
      this.config = defaultConfig;
    }
  }

  /**
   * Save QA configuration
   */
  saveConfiguration() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Could not save QA configuration:", error.message);
    }
  }

  /**
   * Run comprehensive quality assessment
   */
  async runQualityAssessment() {
    console.log("🔍 Running comprehensive quality assessment...");

    const assessment = {
      timestamp: new Date().toISOString(),
      gates: {},
      metrics: {},
      recommendations: [],
      status: "unknown",
    };

    try {
      // Run tests and collect coverage
      const testResults = await this.runTestsWithCoverage();

      // Assess each quality gate
      assessment.gates.coverage = this.assessCoverageGate(testResults.coverage);
      assessment.gates.performance = this.assessPerformanceGate(
        testResults.performance,
      );
      assessment.gates.reliability = this.assessReliabilityGate(
        testResults.reliability,
      );
      assessment.gates.maintainability = await this.assessMaintainabilityGate();

      // Calculate overall metrics
      assessment.metrics = this.calculateQualityMetrics(assessment.gates);

      // Generate recommendations
      assessment.recommendations = this.generateRecommendations(
        assessment.gates,
      );

      // Determine overall status
      assessment.status = this.determineOverallStatus(assessment.gates);

      // Save assessment
      const assessmentPath = path.join(
        this.reportsDir,
        `quality-assessment-${Date.now()}.json`,
      );
      fs.writeFileSync(assessmentPath, JSON.stringify(assessment, null, 2));

      console.log(
        `✅ Quality assessment completed. Report saved to: ${assessmentPath}`,
      );
      return assessment;
    } catch (error) {
      console.error("❌ Quality assessment failed:", error.message);
      assessment.status = "error";
      assessment.error = error.message;
      return assessment;
    }
  }

  /**
   * Run tests with coverage collection
   */
  async runTestsWithCoverage() {
    console.log("🧪 Running tests with coverage...");

    try {
      const startTime = Date.now();

      // Run tests with coverage
      const testOutput = execSync(
        "npm run test -- --coverage --silent --watchAll=false --json",
        {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 300000, // 5 minutes timeout
        },
      );

      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;

      // Parse test results
      const testResults = JSON.parse(testOutput);

      // Load coverage data
      const coveragePath = path.join(
        process.cwd(),
        "coverage",
        "coverage-summary.json",
      );
      let coverageData = {};

      if (fs.existsSync(coveragePath)) {
        coverageData = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
      }

      return {
        coverage: this.extractCoverageMetrics(coverageData),
        performance: {
          totalExecutionTime: executionTime,
          testResults: testResults,
        },
        reliability: this.extractReliabilityMetrics(testResults),
      };
    } catch (error) {
      console.error("Failed to run tests:", error.message);
      throw error;
    }
  }

  /**
   * Extract coverage metrics
   */
  extractCoverageMetrics(coverageData) {
    if (!coverageData.total) {
      return {
        statements: { pct: 0 },
        branches: { pct: 0 },
        functions: { pct: 0 },
        lines: { pct: 0 },
      };
    }

    return {
      statements: coverageData.total.statements,
      branches: coverageData.total.branches,
      functions: coverageData.total.functions,
      lines: coverageData.total.lines,
    };
  }

  /**
   * Extract reliability metrics
   */
  extractReliabilityMetrics(testResults) {
    const totalTests = testResults.numTotalTests || 0;
    const passedTests = testResults.numPassedTests || 0;
    const failedTests = testResults.numFailedTests || 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      flakyTests: 0, // Would need additional detection logic
    };
  }

  /**
   * Assess coverage quality gate
   */
  assessCoverageGate(coverage) {
    const gates = this.config.qualityGates.coverage;

    const results = {
      statements: {
        actual: coverage.statements.pct,
        required: gates.statements,
        passed: coverage.statements.pct >= gates.statements,
      },
      branches: {
        actual: coverage.branches.pct,
        required: gates.branches,
        passed: coverage.branches.pct >= gates.branches,
      },
      functions: {
        actual: coverage.functions.pct,
        required: gates.functions,
        passed: coverage.functions.pct >= gates.functions,
      },
      lines: {
        actual: coverage.lines.pct,
        required: gates.lines,
        passed: coverage.lines.pct >= gates.lines,
      },
    };

    const allPassed = Object.values(results).every((r) => r.passed);

    return {
      name: "Coverage",
      passed: allPassed,
      results,
      score: this.calculateCoverageScore(results),
    };
  }

  /**
   * Assess performance quality gate
   */
  assessPerformanceGate(performance) {
    const gates = this.config.qualityGates.performance;

    const results = {
      executionTime: {
        actual: performance.totalExecutionTime,
        required: gates.maxTestExecutionTime,
        passed: performance.totalExecutionTime <= gates.maxTestExecutionTime,
      },
      memoryUsage: {
        actual: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        required: gates.maxMemoryUsage,
        passed:
          process.memoryUsage().heapUsed / 1024 / 1024 <= gates.maxMemoryUsage,
      },
    };

    const allPassed = Object.values(results).every((r) => r.passed);

    return {
      name: "Performance",
      passed: allPassed,
      results,
      score: this.calculatePerformanceScore(results),
    };
  }

  /**
   * Assess reliability quality gate
   */
  assessReliabilityGate(reliability) {
    const gates = this.config.qualityGates.reliability;

    const results = {
      passRate: {
        actual: reliability.passRate,
        required: gates.minPassRate,
        passed: reliability.passRate >= gates.minPassRate,
      },
      failingTests: {
        actual: reliability.failedTests,
        required: gates.maxFailingTests,
        passed: reliability.failedTests <= gates.maxFailingTests,
      },
      flakyTests: {
        actual: reliability.flakyTests,
        required: gates.maxFlakyTests,
        passed: reliability.flakyTests <= gates.maxFlakyTests,
      },
    };

    const allPassed = Object.values(results).every((r) => r.passed);

    return {
      name: "Reliability",
      passed: allPassed,
      results,
      score: this.calculateReliabilityScore(results),
    };
  }

  /**
   * Assess maintainability quality gate
   */
  async assessMaintainabilityGate() {
    const gates = this.config.qualityGates.maintainability;

    // Calculate test density
    const sourceFiles = this.countSourceFiles();
    const testFiles = this.countTestFiles();
    const testDensity = sourceFiles > 0 ? (testFiles / sourceFiles) * 100 : 0;

    // Estimate test debt (simplified)
    const untestedFiles = Math.max(0, sourceFiles - testFiles);
    const testDebt = untestedFiles * 2; // 2 hours per file estimate

    const results = {
      testDensity: {
        actual: testDensity,
        required: gates.minTestDensity,
        passed: testDensity >= gates.minTestDensity,
      },
      testDebt: {
        actual: testDebt,
        required: gates.maxTestDebt,
        passed: testDebt <= gates.maxTestDebt,
      },
    };

    const allPassed = Object.values(results).every((r) => r.passed);

    return {
      name: "Maintainability",
      passed: allPassed,
      results,
      score: this.calculateMaintainabilityScore(results),
    };
  }

  /**
   * Count source files
   */
  countSourceFiles() {
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) return 0;

    let count = 0;
    const countFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.includes("__tests__")) {
          countFiles(filePath);
        } else if (
          file.match(/\.(ts|tsx|js|jsx)$/) &&
          !file.includes(".test.") &&
          !file.includes(".spec.")
        ) {
          count++;
        }
      });
    };

    countFiles(srcDir);
    return count;
  }

  /**
   * Count test files
   */
  countTestFiles() {
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) return 0;

    let count = 0;
    const countFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          countFiles(filePath);
        } else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          count++;
        }
      });
    };

    countFiles(srcDir);
    return count;
  }

  /**
   * Calculate quality scores
   */
  calculateCoverageScore(results) {
    const scores = Object.values(results).map((r) => r.actual);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculatePerformanceScore(results) {
    // Performance score based on how well we meet thresholds
    let score = 100;

    Object.values(results).forEach((result) => {
      if (!result.passed) {
        const ratio = result.actual / result.required;
        score -= Math.min(50, (ratio - 1) * 100); // Penalty based on how much we exceed
      }
    });

    return Math.max(0, score);
  }

  calculateReliabilityScore(results) {
    return results.passRate.actual;
  }

  calculateMaintainabilityScore(results) {
    let score = results.testDensity.actual;

    // Penalty for test debt
    if (!results.testDebt.passed) {
      const debtPenalty = Math.min(
        20,
        results.testDebt.actual - results.testDebt.required,
      );
      score -= debtPenalty;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate overall quality metrics
   */
  calculateQualityMetrics(gates) {
    const gateScores = Object.values(gates).map((gate) => gate.score);
    const overallScore =
      gateScores.reduce((sum, score) => sum + score, 0) / gateScores.length;

    const passedGates = Object.values(gates).filter(
      (gate) => gate.passed,
    ).length;
    const totalGates = Object.values(gates).length;

    return {
      overallScore: overallScore,
      gatePassRate: (passedGates / totalGates) * 100,
      passedGates: passedGates,
      totalGates: totalGates,
      individual: Object.fromEntries(
        Object.entries(gates).map(([key, gate]) => [key, gate.score]),
      ),
    };
  }

  /**
   * Generate recommendations based on gate results
   */
  generateRecommendations(gates) {
    const recommendations = [];

    Object.entries(gates).forEach(([gateName, gate]) => {
      if (!gate.passed) {
        switch (gateName) {
          case "coverage":
            recommendations.push({
              type: "coverage",
              priority: "high",
              title: "Improve Test Coverage",
              description: "Test coverage is below required thresholds",
              actions: this.getCoverageRecommendations(gate.results),
            });
            break;

          case "performance":
            recommendations.push({
              type: "performance",
              priority: "medium",
              title: "Optimize Test Performance",
              description: "Test execution performance needs improvement",
              actions: this.getPerformanceRecommendations(gate.results),
            });
            break;

          case "reliability":
            recommendations.push({
              type: "reliability",
              priority: "high",
              title: "Fix Test Reliability Issues",
              description: "Tests are failing or unreliable",
              actions: this.getReliabilityRecommendations(gate.results),
            });
            break;

          case "maintainability":
            recommendations.push({
              type: "maintainability",
              priority: "medium",
              title: "Improve Test Maintainability",
              description: "Test suite needs better maintainability",
              actions: this.getMaintainabilityRecommendations(gate.results),
            });
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Get coverage-specific recommendations
   */
  getCoverageRecommendations(results) {
    const actions = [];

    Object.entries(results).forEach(([metric, result]) => {
      if (!result.passed) {
        actions.push(
          `Increase ${metric} coverage from ${result.actual.toFixed(1)}% to ${result.required}%`,
        );
      }
    });

    actions.push("Use coverage reports to identify untested code");
    actions.push("Add tests for edge cases and error conditions");
    actions.push("Review and improve existing test quality");

    return actions;
  }

  /**
   * Get performance-specific recommendations
   */
  getPerformanceRecommendations(results) {
    const actions = [];

    if (!results.executionTime.passed) {
      actions.push(
        `Reduce test execution time from ${results.executionTime.actual.toFixed(1)}s to under ${results.executionTime.required}s`,
      );
      actions.push("Optimize slow tests or split into smaller suites");
      actions.push("Use parallel test execution");
    }

    if (!results.memoryUsage.passed) {
      actions.push(
        `Reduce memory usage from ${results.memoryUsage.actual.toFixed(1)}MB to under ${results.memoryUsage.required}MB`,
      );
      actions.push("Fix memory leaks in tests");
      actions.push("Improve test cleanup and teardown");
    }

    return actions;
  }

  /**
   * Get reliability-specific recommendations
   */
  getReliabilityRecommendations(results) {
    const actions = [];

    if (!results.passRate.passed) {
      actions.push(
        `Fix failing tests to achieve ${results.passRate.required}% pass rate`,
      );
    }

    if (!results.failingTests.passed) {
      actions.push(`Fix ${results.failingTests.actual} failing tests`);
    }

    if (!results.flakyTests.passed) {
      actions.push(`Fix ${results.flakyTests.actual} flaky tests`);
    }

    actions.push("Improve test isolation and cleanup");
    actions.push("Review and fix race conditions");
    actions.push("Ensure proper mocking of external dependencies");

    return actions;
  }

  /**
   * Get maintainability-specific recommendations
   */
  getMaintainabilityRecommendations(results) {
    const actions = [];

    if (!results.testDensity.passed) {
      actions.push(
        `Increase test density from ${results.testDensity.actual.toFixed(1)}% to ${results.testDensity.required}%`,
      );
      actions.push("Add tests for untested source files");
    }

    if (!results.testDebt.passed) {
      actions.push(
        `Reduce test debt from ${results.testDebt.actual} hours to under ${results.testDebt.required} hours`,
      );
      actions.push("Create implementation plan for missing tests");
    }

    actions.push("Refactor complex test code");
    actions.push("Improve test documentation and comments");
    actions.push("Standardize test patterns and utilities");

    return actions;
  }

  /**
   * Determine overall status
   */
  determineOverallStatus(gates) {
    const allPassed = Object.values(gates).every((gate) => gate.passed);

    if (allPassed) {
      return "passing";
    }

    const criticalFailed = Object.values(gates).some(
      (gate) =>
        !gate.passed &&
        (gate.name === "Coverage" || gate.name === "Reliability"),
    );

    return criticalFailed ? "failing" : "warning";
  }

  /**
   * Generate quality report
   */
  generateQualityReport(assessment) {
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Assurance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
        .status.passing { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.failing { background: #f8d7da; color: #721c24; }
        .gates { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .gate { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .gate.passed { border-left: 4px solid #28a745; }
        .gate.failed { border-left: 4px solid #dc3545; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
        .recommendation { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .recommendation.high { border-left: 4px solid #dc3545; }
        .recommendation.medium { border-left: 4px solid #ffc107; }
        .recommendation.low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Quality Assurance Report</h1>
            <p>Generated: ${new Date(assessment.timestamp).toLocaleString()}</p>
            <div class="status ${assessment.status}">${assessment.status.toUpperCase()}</div>
        </div>

        <div class="gates">
            ${Object.entries(assessment.gates)
              .map(
                ([name, gate]) => `
                <div class="gate ${gate.passed ? "passed" : "failed"}">
                    <h3>${gate.name} ${gate.passed ? "✅" : "❌"}</h3>
                    <p>Score: ${gate.score.toFixed(1)}%</p>
                    ${Object.entries(gate.results)
                      .map(
                        ([metric, result]) => `
                        <div class="metric">
                            <span>${metric}:</span>
                            <span>${result.actual.toFixed(1)}% / ${result.required}% ${result.passed ? "✅" : "❌"}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `,
              )
              .join("")}
        </div>

        ${
          assessment.recommendations.length > 0
            ? `
            <div class="recommendations">
                <h2>Recommendations</h2>
                ${assessment.recommendations
                  .map(
                    (rec) => `
                    <div class="recommendation ${rec.priority}">
                        <h4>${rec.title} (${rec.priority} priority)</h4>
                        <p>${rec.description}</p>
                        <ul>
                            ${rec.actions.map((action) => `<li>${action}</li>`).join("")}
                        </ul>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `
            : ""
        }
    </div>
</body>
</html>`;

    const reportPath = path.join(
      this.reportsDir,
      `qa-report-${Date.now()}.html`,
    );
    fs.writeFileSync(reportPath, reportHtml);

    return reportPath;
  }

  /**
   * Run complete quality assurance system
   */
  async run() {
    console.log("🛡️ Starting Quality Assurance System...\n");

    try {
      // Run quality assessment
      const assessment = await this.runQualityAssessment();

      // Generate reports
      const reportPath = this.generateQualityReport(assessment);

      // Display summary
      console.log("\n📊 QUALITY ASSESSMENT SUMMARY");
      console.log("==============================");
      console.log(`Overall Status: ${assessment.status.toUpperCase()}`);
      console.log(
        `Overall Score: ${assessment.metrics.overallScore.toFixed(1)}%`,
      );
      console.log(
        `Gates Passed: ${assessment.metrics.passedGates}/${assessment.metrics.totalGates}`,
      );

      console.log("\n🚪 QUALITY GATES");
      Object.entries(assessment.gates).forEach(([name, gate]) => {
        console.log(
          `${gate.name}: ${gate.passed ? "✅ PASSED" : "❌ FAILED"} (${gate.score.toFixed(1)}%)`,
        );
      });

      if (assessment.recommendations.length > 0) {
        console.log("\n💡 TOP RECOMMENDATIONS");
        assessment.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        });
      }

      console.log(`\n📄 Full report: ${reportPath}`);
      console.log(`⚙️ Configuration: ${this.configPath}`);

      // Exit with appropriate code
      if (assessment.status === "failing") {
        console.log(
          "\n❌ Quality gates failed. Please address the issues above.",
        );
        process.exit(1);
      } else if (assessment.status === "warning") {
        console.log(
          "\n⚠️ Some quality gates have warnings. Consider addressing them.",
        );
      } else {
        console.log("\n✅ All quality gates passed!");
      }
    } catch (error) {
      console.error("❌ Quality assurance system failed:", error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const qa = new QualityAssuranceSystem();
  qa.run().catch((error) => {
    console.error("❌ Quality assurance system failed:", error);
    process.exit(1);
  });
}

module.exports = QualityAssuranceSystem;
