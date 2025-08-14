#!/usr/bin/env node

/**
 * Test Maintenance System
 *
 * Establishes regular test review and maintenance processes including:
 * - Automated test health checks
 * - Test debt identification
 * - Maintenance scheduling
 * - Quality trend analysis
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TestMaintenanceSystem {
  constructor() {
    this.maintenanceDir = path.join(process.cwd(), "coverage", "maintenance");
    this.reportsDir = path.join(this.maintenanceDir, "reports");
    this.schedulesDir = path.join(this.maintenanceDir, "schedules");

    this.ensureDirectories();
  }

  /**
   * Ensure maintenance directories exist
   */
  ensureDirectories() {
    [this.maintenanceDir, this.reportsDir, this.schedulesDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Perform comprehensive test health check
   */
  async performHealthCheck() {
    console.log("🏥 Performing test health check...");

    const healthReport = {
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: [],
      metrics: {},
      summary: {},
    };

    try {
      // Check for flaky tests
      const flakyTests = await this.detectFlakyTests();
      if (flakyTests.length > 0) {
        healthReport.issues.push({
          type: "flaky_tests",
          severity: "high",
          count: flakyTests.length,
          details: flakyTests,
          description: "Tests that fail intermittently",
        });
        healthReport.recommendations.push(
          "🔧 Fix flaky tests to improve reliability",
        );
      }

      // Check for slow tests
      const slowTests = await this.identifySlowTests();
      if (slowTests.length > 0) {
        healthReport.issues.push({
          type: "slow_tests",
          severity: "medium",
          count: slowTests.length,
          details: slowTests,
          description: "Tests taking longer than expected",
        });
        healthReport.recommendations.push(
          "⚡ Optimize slow tests for better performance",
        );
      }

      // Check for outdated test dependencies
      const outdatedDeps = await this.checkTestDependencies();
      if (outdatedDeps.length > 0) {
        healthReport.issues.push({
          type: "outdated_dependencies",
          severity: "low",
          count: outdatedDeps.length,
          details: outdatedDeps,
          description: "Test dependencies that need updating",
        });
        healthReport.recommendations.push(
          "📦 Update test dependencies to latest versions",
        );
      }

      // Check test coverage trends
      const coverageTrends = await this.analyzeCoverageTrends();
      healthReport.metrics.coverage = coverageTrends;

      // Check for test debt
      const testDebt = await this.calculateTestDebt();
      healthReport.metrics.testDebt = testDebt;

      // Generate summary
      healthReport.summary = {
        overallHealth: this.calculateOverallHealth(healthReport),
        criticalIssues: healthReport.issues.filter((i) => i.severity === "high")
          .length,
        totalIssues: healthReport.issues.length,
        maintenanceRequired: healthReport.issues.length > 0,
      };

      // Save health report
      const reportPath = path.join(
        this.reportsDir,
        `health-check-${Date.now()}.json`,
      );
      fs.writeFileSync(reportPath, JSON.stringify(healthReport, null, 2));

      console.log(`✅ Health check completed. Report saved to: ${reportPath}`);
      return healthReport;
    } catch (error) {
      console.error("❌ Health check failed:", error.message);
      return null;
    }
  }

  /**
   * Detect flaky tests by running tests multiple times
   */
  async detectFlakyTests() {
    console.log("🔍 Detecting flaky tests...");

    const flakyTests = [];
    const testRuns = 3; // Run tests 3 times to detect flakiness

    try {
      for (let i = 0; i < testRuns; i++) {
        const output = execSync(
          "npm run test -- --silent --watchAll=false --json",
          {
            encoding: "utf8",
            stdio: "pipe",
          },
        );

        const results = JSON.parse(output);

        // Track test results across runs
        if (results.testResults) {
          results.testResults.forEach((testFile) => {
            testFile.assertionResults.forEach((test) => {
              const testId = `${testFile.name}::${test.title}`;

              if (!flakyTests.find((f) => f.id === testId)) {
                flakyTests.push({
                  id: testId,
                  file: testFile.name,
                  title: test.title,
                  results: [],
                });
              }

              const flakyTest = flakyTests.find((f) => f.id === testId);
              flakyTest.results.push(test.status);
            });
          });
        }
      }

      // Filter for actually flaky tests (inconsistent results)
      return flakyTests.filter((test) => {
        const uniqueResults = [...new Set(test.results)];
        return uniqueResults.length > 1;
      });
    } catch (error) {
      console.warn("Could not detect flaky tests:", error.message);
      return [];
    }
  }

  /**
   * Identify slow tests
   */
  async identifySlowTests() {
    console.log("🐌 Identifying slow tests...");

    try {
      const output = execSync(
        "npm run test -- --silent --watchAll=false --verbose",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const slowTests = [];
      const lines = output.split("\n");

      lines.forEach((line) => {
        // Look for test timing information
        const match = line.match(/✓\s+(.+?)\s+\((\d+)\s*ms\)/);
        if (match) {
          const testName = match[1];
          const duration = parseInt(match[2]);

          // Consider tests over 1000ms as slow
          if (duration > 1000) {
            slowTests.push({
              name: testName,
              duration: duration,
              severity: duration > 5000 ? "high" : "medium",
            });
          }
        }
      });

      return slowTests;
    } catch (error) {
      console.warn("Could not identify slow tests:", error.message);
      return [];
    }
  }

  /**
   * Check test dependencies for updates
   */
  async checkTestDependencies() {
    console.log("📦 Checking test dependencies...");

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const testDeps = [
        "@testing-library/react",
        "@testing-library/jest-dom",
        "@testing-library/user-event",
        "jest",
        "jest-environment-jsdom",
      ];

      const outdated = [];

      testDeps.forEach((dep) => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          // This is a simplified check - in a real implementation,
          // you'd want to check against npm registry for latest versions
          outdated.push({
            name: dep,
            current: packageJson.devDependencies[dep],
            type: "devDependency",
          });
        }
      });

      return outdated;
    } catch (error) {
      console.warn("Could not check dependencies:", error.message);
      return [];
    }
  }

  /**
   * Analyze coverage trends
   */
  async analyzeCoverageTrends() {
    console.log("📈 Analyzing coverage trends...");

    try {
      const metricsPath = path.join(
        process.cwd(),
        "coverage",
        "metrics-history.json",
      );

      if (!fs.existsSync(metricsPath)) {
        return { trend: "no_data", message: "No historical data available" };
      }

      const history = JSON.parse(fs.readFileSync(metricsPath, "utf8"));

      if (history.length < 2) {
        return {
          trend: "insufficient_data",
          message: "Need more data points for trend analysis",
        };
      }

      const recent = history.slice(-5);
      const older = history.slice(-10, -5);

      if (older.length === 0) {
        return {
          trend: "stable",
          message: "Not enough historical data for comparison",
        };
      }

      const recentAvg =
        recent.reduce(
          (sum, item) => sum + (item.quality?.coverageScore || 0),
          0,
        ) / recent.length;
      const olderAvg =
        older.reduce(
          (sum, item) => sum + (item.quality?.coverageScore || 0),
          0,
        ) / older.length;

      const diff = recentAvg - olderAvg;

      return {
        trend:
          Math.abs(diff) < 1 ? "stable" : diff > 0 ? "improving" : "declining",
        recentAverage: recentAvg,
        previousAverage: olderAvg,
        change: diff,
        message: `Coverage ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff).toFixed(1)}%`,
      };
    } catch (error) {
      console.warn("Could not analyze coverage trends:", error.message);
      return { trend: "error", message: error.message };
    }
  }

  /**
   * Calculate test debt
   */
  async calculateTestDebt() {
    console.log("💳 Calculating test debt...");

    try {
      // Count source files without tests
      const sourceFiles = this.getAllSourceFiles();
      const testFiles = this.getAllTestFiles();

      const untestedFiles = sourceFiles.filter((srcFile) => {
        const testFile = this.getCorrespondingTestFile(srcFile);
        return !testFiles.includes(testFile);
      });

      // Estimate effort to create missing tests
      const estimatedHours = untestedFiles.length * 2; // 2 hours per test file estimate

      return {
        untestedFiles: untestedFiles.length,
        totalSourceFiles: sourceFiles.length,
        testCoverage:
          ((sourceFiles.length - untestedFiles.length) / sourceFiles.length) *
          100,
        estimatedEffort: estimatedHours,
        priority:
          untestedFiles.length > 50
            ? "high"
            : untestedFiles.length > 20
              ? "medium"
              : "low",
      };
    } catch (error) {
      console.warn("Could not calculate test debt:", error.message);
      return { error: error.message };
    }
  }

  /**
   * Get all source files
   */
  getAllSourceFiles() {
    const srcDir = path.join(process.cwd(), "src");
    const files = [];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && !item.includes("__tests__")) {
          scanDirectory(itemPath);
        } else if (
          item.match(/\.(ts|tsx|js|jsx)$/) &&
          !item.includes(".test.") &&
          !item.includes(".spec.")
        ) {
          files.push(itemPath);
        }
      });
    };

    scanDirectory(srcDir);
    return files;
  }

  /**
   * Get all test files
   */
  getAllTestFiles() {
    const srcDir = path.join(process.cwd(), "src");
    const files = [];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          files.push(itemPath);
        }
      });
    };

    scanDirectory(srcDir);
    return files;
  }

  /**
   * Get corresponding test file for a source file
   */
  getCorrespondingTestFile(sourceFile) {
    const dir = path.dirname(sourceFile);
    const basename = path.basename(sourceFile, path.extname(sourceFile));
    const ext = path.extname(sourceFile);

    // Check for test file in same directory
    const sameDir = path.join(dir, `${basename}.test${ext}`);
    if (fs.existsSync(sameDir)) return sameDir;

    // Check for test file in __tests__ subdirectory
    const testsDir = path.join(dir, "__tests__", `${basename}.test${ext}`);
    if (fs.existsSync(testsDir)) return testsDir;

    return testsDir; // Return expected path even if it doesn't exist
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealth(healthReport) {
    let score = 100;

    healthReport.issues.forEach((issue) => {
      switch (issue.severity) {
        case "high":
          score -= 20;
          break;
        case "medium":
          score -= 10;
          break;
        case "low":
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Create maintenance schedule
   */
  createMaintenanceSchedule() {
    console.log("📅 Creating maintenance schedule...");

    const schedule = {
      created: new Date().toISOString(),
      schedules: {
        daily: {
          description: "Daily automated checks",
          tasks: [
            "Run test suite",
            "Check for new failing tests",
            "Monitor test execution time",
          ],
          automation: "CI/CD pipeline",
        },
        weekly: {
          description: "Weekly maintenance tasks",
          tasks: [
            "Run comprehensive health check",
            "Review test coverage trends",
            "Identify and fix flaky tests",
            "Update test documentation",
          ],
          automation: "Scheduled script",
        },
        monthly: {
          description: "Monthly strategic review",
          tasks: [
            "Review test strategy effectiveness",
            "Update test dependencies",
            "Analyze test debt and create improvement plan",
            "Team review of test quality metrics",
          ],
          automation: "Manual review with automated reports",
        },
        quarterly: {
          description: "Quarterly comprehensive review",
          tasks: [
            "Complete test architecture review",
            "Update testing standards and guidelines",
            "Performance optimization review",
            "Tool and framework evaluation",
          ],
          automation: "Manual strategic review",
        },
      },
      nextActions: this.generateNextActions(),
    };

    const schedulePath = path.join(
      this.schedulesDir,
      "maintenance-schedule.json",
    );
    fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2));

    console.log(`✅ Maintenance schedule created: ${schedulePath}`);
    return schedule;
  }

  /**
   * Generate next actions based on current state
   */
  generateNextActions() {
    return [
      {
        action: "Set up automated health checks",
        priority: "high",
        effort: "medium",
        description: "Configure CI/CD to run health checks on every commit",
      },
      {
        action: "Create test quality dashboard",
        priority: "high",
        effort: "low",
        description: "Set up monitoring dashboard for test metrics",
      },
      {
        action: "Establish test review process",
        priority: "medium",
        effort: "low",
        description: "Define process for regular test code reviews",
      },
      {
        action: "Implement flaky test detection",
        priority: "medium",
        effort: "medium",
        description: "Automated detection and reporting of unreliable tests",
      },
    ];
  }

  /**
   * Generate maintenance report
   */
  async generateMaintenanceReport() {
    console.log("📋 Generating maintenance report...");

    const healthCheck = await this.performHealthCheck();
    const schedule = this.createMaintenanceSchedule();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallHealth: healthCheck?.summary?.overallHealth || 0,
        criticalIssues: healthCheck?.summary?.criticalIssues || 0,
        totalIssues: healthCheck?.summary?.totalIssues || 0,
        maintenanceRequired: healthCheck?.summary?.maintenanceRequired || false,
      },
      healthCheck,
      schedule,
      recommendations: this.generateMaintenanceRecommendations(healthCheck),
    };

    const reportPath = path.join(
      this.reportsDir,
      `maintenance-report-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    const readableReport = this.generateReadableReport(report);
    const readablePath = path.join(
      this.reportsDir,
      `maintenance-report-${Date.now()}.md`,
    );
    fs.writeFileSync(readablePath, readableReport);

    console.log(`✅ Maintenance report generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${readablePath}`);

    return report;
  }

  /**
   * Generate maintenance recommendations
   */
  generateMaintenanceRecommendations(healthCheck) {
    const recommendations = [];

    if (!healthCheck) {
      recommendations.push({
        type: "setup",
        priority: "high",
        description: "Set up health check system to monitor test quality",
      });
      return recommendations;
    }

    if (healthCheck.summary.criticalIssues > 0) {
      recommendations.push({
        type: "critical",
        priority: "high",
        description: `Address ${healthCheck.summary.criticalIssues} critical issues immediately`,
      });
    }

    if (healthCheck.metrics.testDebt?.priority === "high") {
      recommendations.push({
        type: "debt",
        priority: "high",
        description:
          "High test debt detected. Create plan to add missing tests",
      });
    }

    if (healthCheck.metrics.coverage?.trend === "declining") {
      recommendations.push({
        type: "coverage",
        priority: "medium",
        description:
          "Coverage is declining. Review recent changes and add tests",
      });
    }

    const flakyTests = healthCheck.issues.find((i) => i.type === "flaky_tests");
    if (flakyTests && flakyTests.count > 0) {
      recommendations.push({
        type: "reliability",
        priority: "high",
        description: `Fix ${flakyTests.count} flaky tests to improve reliability`,
      });
    }

    const slowTests = healthCheck.issues.find((i) => i.type === "slow_tests");
    if (slowTests && slowTests.count > 5) {
      recommendations.push({
        type: "performance",
        priority: "medium",
        description: `Optimize ${slowTests.count} slow tests to improve execution time`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "maintenance",
        priority: "low",
        description:
          "Continue regular maintenance schedule. All metrics look good!",
      });
    }

    return recommendations;
  }

  /**
   * Generate human-readable report
   */
  generateReadableReport(report) {
    return `# Test Maintenance Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Overall Health**: ${report.summary.overallHealth}%
- **Critical Issues**: ${report.summary.criticalIssues}
- **Total Issues**: ${report.summary.totalIssues}
- **Maintenance Required**: ${report.summary.maintenanceRequired ? "Yes" : "No"}

## Health Check Results

${
  report.healthCheck
    ? `
### Issues Found

${report.healthCheck.issues
  .map(
    (issue) => `
- **${issue.type.replace("_", " ").toUpperCase()}** (${issue.severity})
  - Count: ${issue.count}
  - Description: ${issue.description}
`,
  )
  .join("")}

### Recommendations

${report.healthCheck.recommendations.map((rec) => `- ${rec}`).join("\n")}

### Metrics

${
  report.healthCheck.metrics.coverage
    ? `
**Coverage Trends**: ${report.healthCheck.metrics.coverage.trend} (${report.healthCheck.metrics.coverage.message})
`
    : ""
}

${
  report.healthCheck.metrics.testDebt
    ? `
**Test Debt**: ${report.healthCheck.metrics.testDebt.untestedFiles} untested files (${report.healthCheck.metrics.testDebt.priority} priority)
`
    : ""
}
`
    : "Health check data not available"
}

## Maintenance Schedule

### Daily Tasks
${report.schedule.schedules.daily.tasks.map((task) => `- ${task}`).join("\n")}

### Weekly Tasks
${report.schedule.schedules.weekly.tasks.map((task) => `- ${task}`).join("\n")}

### Monthly Tasks
${report.schedule.schedules.monthly.tasks.map((task) => `- ${task}`).join("\n")}

### Quarterly Tasks
${report.schedule.schedules.quarterly.tasks.map((task) => `- ${task}`).join("\n")}

## Recommendations

${report.recommendations
  .map(
    (rec) => `
### ${rec.type.toUpperCase()} (${rec.priority} priority)
${rec.description}
`,
  )
  .join("")}

## Next Actions

${report.schedule.nextActions
  .map(
    (action) => `
- **${action.action}** (${action.priority} priority, ${action.effort} effort)
  ${action.description}
`,
  )
  .join("")}
`;
  }

  /**
   * Run complete maintenance system
   */
  async run() {
    console.log("🔧 Starting Test Maintenance System...\n");

    try {
      const report = await this.generateMaintenanceReport();

      console.log("\n📊 MAINTENANCE SUMMARY");
      console.log("======================");
      console.log(`Overall Health: ${report.summary.overallHealth}%`);
      console.log(`Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`Total Issues: ${report.summary.totalIssues}`);
      console.log(
        `Maintenance Required: ${report.summary.maintenanceRequired ? "Yes" : "No"}`,
      );

      if (report.recommendations.length > 0) {
        console.log("\n💡 TOP RECOMMENDATIONS");
        report.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(
            `${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`,
          );
        });
      }

      console.log(`\n✅ Maintenance system setup complete!`);
      console.log(`📁 Reports saved to: ${this.reportsDir}`);
      console.log(`📅 Schedule saved to: ${this.schedulesDir}`);
    } catch (error) {
      console.error("❌ Maintenance system failed:", error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const maintenance = new TestMaintenanceSystem();
  maintenance.run().catch((error) => {
    console.error("❌ Maintenance system failed:", error);
    process.exit(1);
  });
}

module.exports = TestMaintenanceSystem;
