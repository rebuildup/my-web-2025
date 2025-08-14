#!/usr/bin/env node

/**
 * Test Quality Monitoring Dashboard
 *
 * This script creates a comprehensive dashboard for monitoring test quality metrics,
 * tracking coverage trends, and identifying areas for improvement.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TestQualityDashboard {
  constructor() {
    this.metricsHistory = this.loadMetricsHistory();
    this.currentMetrics = null;
    this.dashboardPath = path.join(
      process.cwd(),
      "coverage",
      "quality-dashboard.html",
    );
    this.metricsPath = path.join(
      process.cwd(),
      "coverage",
      "metrics-history.json",
    );
  }

  /**
   * Load historical metrics data
   */
  loadMetricsHistory() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        return JSON.parse(fs.readFileSync(this.metricsPath, "utf8"));
      }
    } catch (error) {
      console.warn("Could not load metrics history:", error.message);
    }
    return [];
  }

  /**
   * Save metrics history
   */
  saveMetricsHistory() {
    try {
      fs.writeFileSync(
        this.metricsPath,
        JSON.stringify(this.metricsHistory, null, 2),
      );
    } catch (error) {
      console.error("Could not save metrics history:", error.message);
    }
  }

  /**
   * Collect current test metrics
   */
  async collectCurrentMetrics() {
    console.log("📊 Collecting current test metrics...");

    try {
      // Run tests with coverage
      const testOutput = execSync(
        "npm run test -- --coverage --silent --watchAll=false",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      // Parse coverage data
      const coveragePath = path.join(
        process.cwd(),
        "coverage",
        "coverage-summary.json",
      );
      let coverageData = {};

      if (fs.existsSync(coveragePath)) {
        coverageData = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
      }

      // Collect test execution metrics
      const testMetrics = this.parseTestOutput(testOutput);

      this.currentMetrics = {
        timestamp: new Date().toISOString(),
        coverage: this.extractCoverageMetrics(coverageData),
        tests: testMetrics,
        quality: this.calculateQualityMetrics(testMetrics, coverageData),
        performance: this.measureTestPerformance(),
        trends: this.calculateTrends(),
      };

      // Add to history
      this.metricsHistory.push(this.currentMetrics);

      // Keep only last 30 entries
      if (this.metricsHistory.length > 30) {
        this.metricsHistory = this.metricsHistory.slice(-30);
      }

      this.saveMetricsHistory();

      return this.currentMetrics;
    } catch (error) {
      console.error("Error collecting metrics:", error.message);
      return null;
    }
  }

  /**
   * Parse test execution output
   */
  parseTestOutput(output) {
    const lines = output.split("\n");
    const metrics = {
      totalSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      executionTime: 0,
    };

    lines.forEach((line) => {
      if (line.includes("Test Suites:")) {
        const match = line.match(/(\d+) passed/);
        if (match) metrics.totalSuites = parseInt(match[1]);
      }
      if (line.includes("Tests:")) {
        const passedMatch = line.match(/(\d+) passed/);
        const failedMatch = line.match(/(\d+) failed/);
        const skippedMatch = line.match(/(\d+) skipped/);

        if (passedMatch) metrics.passedTests = parseInt(passedMatch[1]);
        if (failedMatch) metrics.failedTests = parseInt(failedMatch[1]);
        if (skippedMatch) metrics.skippedTests = parseInt(skippedMatch[1]);

        metrics.totalTests =
          metrics.passedTests + metrics.failedTests + metrics.skippedTests;
      }
      if (line.includes("Time:")) {
        const match = line.match(/Time:\s*(\d+\.?\d*)\s*s/);
        if (match) metrics.executionTime = parseFloat(match[1]);
      }
    });

    return metrics;
  }

  /**
   * Extract coverage metrics from coverage data
   */
  extractCoverageMetrics(coverageData) {
    if (!coverageData.total) {
      return {
        lines: { pct: 0 },
        statements: { pct: 0 },
        functions: { pct: 0 },
        branches: { pct: 0 },
      };
    }

    return {
      lines: coverageData.total.lines,
      statements: coverageData.total.statements,
      functions: coverageData.total.functions,
      branches: coverageData.total.branches,
    };
  }

  /**
   * Calculate quality metrics
   */
  calculateQualityMetrics(testMetrics, coverageData) {
    const coverage = this.extractCoverageMetrics(coverageData);
    const avgCoverage =
      (coverage.lines.pct +
        coverage.statements.pct +
        coverage.functions.pct +
        coverage.branches.pct) /
      4;

    const testReliability =
      testMetrics.totalTests > 0
        ? (testMetrics.passedTests / testMetrics.totalTests) * 100
        : 0;

    const testDensity = this.calculateTestDensity();

    return {
      overallScore: this.calculateOverallQualityScore(
        avgCoverage,
        testReliability,
        testDensity,
      ),
      coverageScore: avgCoverage,
      reliabilityScore: testReliability,
      densityScore: testDensity,
      performanceScore: this.calculatePerformanceScore(
        testMetrics.executionTime,
      ),
    };
  }

  /**
   * Calculate test density (tests per source file)
   */
  calculateTestDensity() {
    try {
      const srcFiles = this.countSourceFiles();
      const testFiles = this.countTestFiles();
      return testFiles > 0 ? (testFiles / srcFiles) * 100 : 0;
    } catch (error) {
      return 0;
    }
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
   * Calculate overall quality score
   */
  calculateOverallQualityScore(coverage, reliability, density) {
    return coverage * 0.4 + reliability * 0.4 + density * 0.2;
  }

  /**
   * Calculate performance score based on execution time
   */
  calculatePerformanceScore(executionTime) {
    // Score based on execution time (lower is better)
    // 100 for < 30s, decreasing linearly to 0 for > 300s
    if (executionTime < 30) return 100;
    if (executionTime > 300) return 0;
    return 100 - ((executionTime - 30) / 270) * 100;
  }

  /**
   * Measure test performance
   */
  measureTestPerformance() {
    return {
      executionTime: this.currentMetrics?.tests?.executionTime || 0,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate trends from historical data
   */
  calculateTrends() {
    if (this.metricsHistory.length < 2) {
      return {
        coverage: "stable",
        quality: "stable",
        performance: "stable",
      };
    }

    const recent = this.metricsHistory.slice(-5);
    const older = this.metricsHistory.slice(-10, -5);

    if (older.length === 0)
      return { coverage: "stable", quality: "stable", performance: "stable" };

    const recentAvg = this.calculateAverageMetrics(recent);
    const olderAvg = this.calculateAverageMetrics(older);

    return {
      coverage: this.getTrend(recentAvg.coverage, olderAvg.coverage),
      quality: this.getTrend(recentAvg.quality, olderAvg.quality),
      performance: this.getTrend(olderAvg.performance, recentAvg.performance), // Inverted for performance
    };
  }

  /**
   * Calculate average metrics for a set of data points
   */
  calculateAverageMetrics(dataPoints) {
    if (dataPoints.length === 0)
      return { coverage: 0, quality: 0, performance: 0 };

    const totals = dataPoints.reduce(
      (acc, point) => ({
        coverage: acc.coverage + (point.quality?.coverageScore || 0),
        quality: acc.quality + (point.quality?.overallScore || 0),
        performance: acc.performance + (point.tests?.executionTime || 0),
      }),
      { coverage: 0, quality: 0, performance: 0 },
    );

    return {
      coverage: totals.coverage / dataPoints.length,
      quality: totals.quality / dataPoints.length,
      performance: totals.performance / dataPoints.length,
    };
  }

  /**
   * Determine trend direction
   */
  getTrend(current, previous) {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return "stable";
    return diff > 0 ? "improving" : "declining";
  }

  /**
   * Generate HTML dashboard
   */
  generateDashboard() {
    if (!this.currentMetrics) {
      console.error("No metrics available. Run collectCurrentMetrics() first.");
      return;
    }

    const html = this.generateDashboardHTML();

    // Ensure coverage directory exists
    const coverageDir = path.dirname(this.dashboardPath);
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }

    fs.writeFileSync(this.dashboardPath, html);
    console.log(`📊 Dashboard generated: ${this.dashboardPath}`);
  }

  /**
   * Generate dashboard HTML content
   */
  generateDashboardHTML() {
    const metrics = this.currentMetrics;
    const trends = metrics.trends;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Quality Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        .trend {
            font-size: 0.8em;
            padding: 4px 8px;
            border-radius: 4px;
            margin-top: 8px;
            display: inline-block;
        }
        .trend.improving { background: #d4edda; color: #155724; }
        .trend.declining { background: #f8d7da; color: #721c24; }
        .trend.stable { background: #e2e3e5; color: #383d41; }
        .coverage-bars {
            margin: 20px 0;
        }
        .coverage-bar {
            margin: 10px 0;
        }
        .coverage-bar-label {
            font-size: 0.9em;
            margin-bottom: 4px;
        }
        .coverage-bar-track {
            background: #e0e0e0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
        }
        .coverage-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff4444, #ffaa00, #44ff44);
            transition: width 0.3s ease;
        }
        .history-chart {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .recommendations {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .recommendation {
            padding: 10px;
            margin: 10px 0;
            border-left: 4px solid #007bff;
            background: #f8f9fa;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>Test Quality Dashboard</h1>
            <p class="timestamp">Last updated: ${new Date(metrics.timestamp).toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Overall Quality Score</div>
                <div class="metric-value" style="color: ${this.getScoreColor(metrics.quality.overallScore)}">${metrics.quality.overallScore.toFixed(1)}%</div>
                <div class="trend ${trends.quality}">${trends.quality}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Test Coverage</div>
                <div class="metric-value" style="color: ${this.getScoreColor(metrics.quality.coverageScore)}">${metrics.quality.coverageScore.toFixed(1)}%</div>
                <div class="trend ${trends.coverage}">${trends.coverage}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Test Reliability</div>
                <div class="metric-value" style="color: ${this.getScoreColor(metrics.quality.reliabilityScore)}">${metrics.quality.reliabilityScore.toFixed(1)}%</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Test Density</div>
                <div class="metric-value" style="color: ${this.getScoreColor(metrics.quality.densityScore)}">${metrics.quality.densityScore.toFixed(1)}%</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Performance Score</div>
                <div class="metric-value" style="color: ${this.getScoreColor(metrics.quality.performanceScore)}">${metrics.quality.performanceScore.toFixed(1)}%</div>
                <div class="trend ${trends.performance}">${trends.performance}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Execution Time</div>
                <div class="metric-value">${metrics.tests.executionTime.toFixed(1)}s</div>
            </div>
        </div>

        <div class="metric-card">
            <h3>Coverage Breakdown</h3>
            <div class="coverage-bars">
                <div class="coverage-bar">
                    <div class="coverage-bar-label">Lines: ${metrics.coverage.lines.pct.toFixed(1)}%</div>
                    <div class="coverage-bar-track">
                        <div class="coverage-bar-fill" style="width: ${metrics.coverage.lines.pct}%"></div>
                    </div>
                </div>
                <div class="coverage-bar">
                    <div class="coverage-bar-label">Statements: ${metrics.coverage.statements.pct.toFixed(1)}%</div>
                    <div class="coverage-bar-track">
                        <div class="coverage-bar-fill" style="width: ${metrics.coverage.statements.pct}%"></div>
                    </div>
                </div>
                <div class="coverage-bar">
                    <div class="coverage-bar-label">Functions: ${metrics.coverage.functions.pct.toFixed(1)}%</div>
                    <div class="coverage-bar-track">
                        <div class="coverage-bar-fill" style="width: ${metrics.coverage.functions.pct}%"></div>
                    </div>
                </div>
                <div class="coverage-bar">
                    <div class="coverage-bar-label">Branches: ${metrics.coverage.branches.pct.toFixed(1)}%</div>
                    <div class="coverage-bar-track">
                        <div class="coverage-bar-fill" style="width: ${metrics.coverage.branches.pct}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="recommendations">
            <h3>Recommendations</h3>
            ${this.generateRecommendations()
              .map((rec) => `<div class="recommendation">${rec}</div>`)
              .join("")}
        </div>

        <div class="metric-card">
            <h3>Test Statistics</h3>
            <p><strong>Total Test Suites:</strong> ${metrics.tests.totalSuites}</p>
            <p><strong>Total Tests:</strong> ${metrics.tests.totalTests}</p>
            <p><strong>Passed:</strong> ${metrics.tests.passedTests}</p>
            <p><strong>Failed:</strong> ${metrics.tests.failedTests}</p>
            <p><strong>Skipped:</strong> ${metrics.tests.skippedTests}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Get color based on score
   */
  getScoreColor(score) {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  }

  /**
   * Generate recommendations based on current metrics
   */
  generateRecommendations() {
    const recommendations = [];
    const metrics = this.currentMetrics;

    if (metrics.quality.coverageScore < 80) {
      recommendations.push(
        "🎯 Focus on increasing test coverage. Current coverage is below 80%.",
      );
    }

    if (metrics.quality.reliabilityScore < 95) {
      recommendations.push(
        "🔧 Address failing tests to improve reliability score.",
      );
    }

    if (metrics.quality.densityScore < 50) {
      recommendations.push(
        "📝 Add more test files. Test density is below recommended threshold.",
      );
    }

    if (metrics.quality.performanceScore < 70) {
      recommendations.push(
        "⚡ Optimize test execution time. Consider parallel execution or test splitting.",
      );
    }

    if (metrics.tests.executionTime > 120) {
      recommendations.push(
        "🚀 Test execution time is high. Consider optimizing slow tests or using test sharding.",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "✅ All metrics look good! Continue maintaining high quality standards.",
      );
    }

    return recommendations;
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    if (!this.currentMetrics) {
      console.error("No metrics available.");
      return;
    }

    const metrics = this.currentMetrics;

    console.log("\n📊 TEST QUALITY DASHBOARD SUMMARY");
    console.log("=====================================");
    console.log(
      `Overall Quality Score: ${metrics.quality.overallScore.toFixed(1)}%`,
    );
    console.log(`Coverage Score: ${metrics.quality.coverageScore.toFixed(1)}%`);
    console.log(
      `Reliability Score: ${metrics.quality.reliabilityScore.toFixed(1)}%`,
    );
    console.log(`Test Density: ${metrics.quality.densityScore.toFixed(1)}%`);
    console.log(
      `Performance Score: ${metrics.quality.performanceScore.toFixed(1)}%`,
    );
    console.log(`Execution Time: ${metrics.tests.executionTime.toFixed(1)}s`);
    console.log("\n📈 TRENDS");
    console.log(`Coverage: ${metrics.trends.coverage}`);
    console.log(`Quality: ${metrics.trends.quality}`);
    console.log(`Performance: ${metrics.trends.performance}`);
    console.log("\n💡 RECOMMENDATIONS");
    this.generateRecommendations().forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.replace(/[🎯🔧📝⚡🚀✅]/g, "").trim()}`);
    });
    console.log("\n");
  }

  /**
   * Run complete dashboard generation
   */
  async run() {
    console.log("🚀 Starting Test Quality Dashboard...\n");

    const metrics = await this.collectCurrentMetrics();
    if (!metrics) {
      console.error("❌ Failed to collect metrics");
      process.exit(1);
    }

    this.generateDashboard();
    this.generateSummaryReport();

    console.log(`✅ Dashboard available at: ${this.dashboardPath}`);
    console.log(`📊 Metrics history saved to: ${this.metricsPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new TestQualityDashboard();
  dashboard.run().catch((error) => {
    console.error("❌ Dashboard generation failed:", error);
    process.exit(1);
  });
}

module.exports = TestQualityDashboard;
