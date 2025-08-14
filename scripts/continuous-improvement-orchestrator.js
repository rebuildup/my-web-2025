#!/usr/bin/env node

/**
 * Continuous Improvement Orchestrator
 *
 * Master orchestrator that coordinates all quality assurance and continuous improvement systems:
 * - Runs quality dashboard updates
 * - Executes maintenance system checks
 * - Performs quality assessments
 * - Generates comprehensive reports
 * - Provides unified interface for all QA operations
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Import our QA systems
const TestQualityDashboard = require("./test-quality-dashboard");
const TestMaintenanceSystem = require("./test-maintenance-system");
const QualityAssuranceSystem = require("./quality-assurance-system");

class ContinuousImprovementOrchestrator {
  constructor() {
    this.outputDir = path.join(
      process.cwd(),
      "coverage",
      "continuous-improvement",
    );
    this.reportsDir = path.join(this.outputDir, "reports");
    this.configPath = path.join(this.outputDir, "orchestrator-config.json");

    this.ensureDirectories();
    this.loadConfiguration();

    // Initialize subsystems
    this.dashboard = new TestQualityDashboard();
    this.maintenance = new TestMaintenanceSystem();
    this.qualityAssurance = new QualityAssuranceSystem();
  }

  /**
   * Ensure directories exist
   */
  ensureDirectories() {
    [this.outputDir, this.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load orchestrator configuration
   */
  loadConfiguration() {
    const defaultConfig = {
      schedule: {
        dashboard: "daily",
        maintenance: "weekly",
        qualityAssurance: "on-demand",
      },
      reporting: {
        unified: true,
        formats: ["json", "html", "markdown"],
        retention: 30, // days
      },
      automation: {
        autoFix: false,
        notifications: true,
        ciIntegration: true,
      },
      thresholds: {
        qualityScore: 80,
        coverageScore: 100,
        performanceScore: 70,
        reliabilityScore: 95,
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
        "Could not load orchestrator configuration, using defaults:",
        error.message,
      );
      this.config = defaultConfig;
    }
  }

  /**
   * Save orchestrator configuration
   */
  saveConfiguration() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(
        "Could not save orchestrator configuration:",
        error.message,
      );
    }
  }

  /**
   * Run complete continuous improvement cycle
   */
  async runCompleteCycle() {
    console.log("🚀 Starting Continuous Improvement Cycle...\n");

    const cycleResults = {
      timestamp: new Date().toISOString(),
      results: {},
      summary: {},
      recommendations: [],
      status: "unknown",
    };

    try {
      // Step 1: Update Quality Dashboard
      console.log("📊 Step 1: Updating Quality Dashboard...");
      const dashboardMetrics = await this.dashboard.collectCurrentMetrics();
      this.dashboard.generateDashboard();
      cycleResults.results.dashboard = {
        status: "completed",
        metrics: dashboardMetrics,
        timestamp: new Date().toISOString(),
      };

      // Step 2: Run Maintenance System
      console.log("\n🔧 Step 2: Running Maintenance System...");
      const maintenanceReport =
        await this.maintenance.generateMaintenanceReport();
      cycleResults.results.maintenance = {
        status: "completed",
        report: maintenanceReport,
        timestamp: new Date().toISOString(),
      };

      // Step 3: Perform Quality Assessment
      console.log("\n🛡️ Step 3: Performing Quality Assessment...");
      const qualityAssessment =
        await this.qualityAssurance.runQualityAssessment();
      cycleResults.results.qualityAssurance = {
        status: "completed",
        assessment: qualityAssessment,
        timestamp: new Date().toISOString(),
      };

      // Step 4: Generate Unified Summary
      console.log("\n📋 Step 4: Generating Unified Summary...");
      cycleResults.summary = this.generateUnifiedSummary(cycleResults.results);
      cycleResults.recommendations = this.generateUnifiedRecommendations(
        cycleResults.results,
      );
      cycleResults.status = this.determineOverallStatus(cycleResults.results);

      // Step 5: Generate Reports
      console.log("\n📄 Step 5: Generating Reports...");
      await this.generateUnifiedReports(cycleResults);

      // Step 6: Cleanup Old Reports
      console.log("\n🧹 Step 6: Cleaning Up Old Reports...");
      this.cleanupOldReports();

      console.log("\n✅ Continuous Improvement Cycle Completed!");
      return cycleResults;
    } catch (error) {
      console.error("❌ Continuous Improvement Cycle Failed:", error.message);
      cycleResults.status = "error";
      cycleResults.error = error.message;
      return cycleResults;
    }
  }

  /**
   * Generate unified summary from all subsystem results
   */
  generateUnifiedSummary(results) {
    const summary = {
      overallHealth: 0,
      qualityScore: 0,
      coverageScore: 0,
      performanceScore: 0,
      reliabilityScore: 0,
      criticalIssues: 0,
      totalRecommendations: 0,
      systemStatus: {},
    };

    // Dashboard metrics
    if (results.dashboard?.metrics) {
      const metrics = results.dashboard.metrics;
      summary.qualityScore = metrics.quality?.overallScore || 0;
      summary.coverageScore = metrics.quality?.coverageScore || 0;
      summary.performanceScore = metrics.quality?.performanceScore || 0;
      summary.reliabilityScore = metrics.quality?.reliabilityScore || 0;
    }

    // Maintenance system results
    if (results.maintenance?.report) {
      const report = results.maintenance.report;
      summary.systemStatus.maintenance = {
        health: report.summary?.overallHealth || 0,
        criticalIssues: report.summary?.criticalIssues || 0,
        totalIssues: report.summary?.totalIssues || 0,
      };
      summary.criticalIssues += report.summary?.criticalIssues || 0;
    }

    // Quality assurance results
    if (results.qualityAssurance?.assessment) {
      const assessment = results.qualityAssurance.assessment;
      summary.systemStatus.qualityGates = {
        passed: assessment.metrics?.passedGates || 0,
        total: assessment.metrics?.totalGates || 0,
        score: assessment.metrics?.overallScore || 0,
      };
      summary.totalRecommendations += assessment.recommendations?.length || 0;
    }

    // Calculate overall health
    const scores = [
      summary.qualityScore,
      summary.coverageScore,
      summary.performanceScore,
      summary.reliabilityScore,
    ].filter((score) => score > 0);

    summary.overallHealth =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return summary;
  }

  /**
   * Generate unified recommendations from all subsystems
   */
  generateUnifiedRecommendations(results) {
    const recommendations = [];

    // Dashboard recommendations
    if (results.dashboard?.metrics?.quality) {
      const quality = results.dashboard.metrics.quality;

      if (quality.overallScore < this.config.thresholds.qualityScore) {
        recommendations.push({
          source: "dashboard",
          type: "quality",
          priority: "high",
          title: "Improve Overall Quality Score",
          description: `Quality score (${quality.overallScore.toFixed(1)}%) is below threshold (${this.config.thresholds.qualityScore}%)`,
          actions: [
            "Focus on coverage improvement",
            "Address reliability issues",
            "Optimize performance",
          ],
        });
      }

      if (quality.coverageScore < this.config.thresholds.coverageScore) {
        recommendations.push({
          source: "dashboard",
          type: "coverage",
          priority: "high",
          title: "Achieve 100% Test Coverage",
          description: `Coverage (${quality.coverageScore.toFixed(1)}%) must reach 100%`,
          actions: [
            "Add tests for uncovered code",
            "Review coverage reports",
            "Implement missing test cases",
          ],
        });
      }
    }

    // Maintenance recommendations
    if (results.maintenance?.report?.recommendations) {
      results.maintenance.report.recommendations.forEach((rec) => {
        recommendations.push({
          source: "maintenance",
          ...rec,
        });
      });
    }

    // Quality assurance recommendations
    if (results.qualityAssurance?.assessment?.recommendations) {
      results.qualityAssurance.assessment.recommendations.forEach((rec) => {
        recommendations.push({
          source: "qualityAssurance",
          ...rec,
        });
      });
    }

    // Deduplicate and prioritize recommendations
    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Prioritize and deduplicate recommendations
   */
  prioritizeRecommendations(recommendations) {
    // Group by type and merge similar recommendations
    const grouped = {};

    recommendations.forEach((rec) => {
      const key = `${rec.type}-${rec.title}`;
      if (!grouped[key]) {
        grouped[key] = rec;
        grouped[key].sources = [rec.source];
      } else {
        grouped[key].sources.push(rec.source);
        // Merge actions
        if (rec.actions) {
          grouped[key].actions = [
            ...new Set([...grouped[key].actions, ...rec.actions]),
          ];
        }
      }
    });

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return Object.values(grouped).sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Determine overall status from all subsystem results
   */
  determineOverallStatus(results) {
    let status = "passing";

    // Check dashboard status
    if (results.dashboard?.metrics?.quality) {
      const quality = results.dashboard.metrics.quality;
      if (quality.overallScore < this.config.thresholds.qualityScore) {
        status = "warning";
      }
      if (quality.coverageScore < this.config.thresholds.coverageScore) {
        status = "failing";
      }
    }

    // Check maintenance status
    if (results.maintenance?.report?.summary) {
      const summary = results.maintenance.report.summary;
      if (summary.criticalIssues > 0) {
        status = "failing";
      } else if (summary.totalIssues > 5) {
        status = status === "passing" ? "warning" : status;
      }
    }

    // Check quality assurance status
    if (results.qualityAssurance?.assessment?.status) {
      const qaStatus = results.qualityAssurance.assessment.status;
      if (qaStatus === "failing") {
        status = "failing";
      } else if (qaStatus === "warning" && status === "passing") {
        status = "warning";
      }
    }

    return status;
  }

  /**
   * Generate unified reports in multiple formats
   */
  async generateUnifiedReports(cycleResults) {
    const timestamp = Date.now();

    // JSON Report
    if (this.config.reporting.formats.includes("json")) {
      const jsonPath = path.join(
        this.reportsDir,
        `unified-report-${timestamp}.json`,
      );
      fs.writeFileSync(jsonPath, JSON.stringify(cycleResults, null, 2));
      console.log(`📄 JSON report: ${jsonPath}`);
    }

    // HTML Report
    if (this.config.reporting.formats.includes("html")) {
      const htmlPath = path.join(
        this.reportsDir,
        `unified-report-${timestamp}.html`,
      );
      const htmlContent = this.generateHtmlReport(cycleResults);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`📄 HTML report: ${htmlPath}`);
    }

    // Markdown Report
    if (this.config.reporting.formats.includes("markdown")) {
      const mdPath = path.join(
        this.reportsDir,
        `unified-report-${timestamp}.md`,
      );
      const mdContent = this.generateMarkdownReport(cycleResults);
      fs.writeFileSync(mdPath, mdContent);
      console.log(`📄 Markdown report: ${mdPath}`);
    }
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(cycleResults) {
    const summary = cycleResults.summary;
    const status = cycleResults.status;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Continuous Improvement Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
        .status.passing { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.failing { background: #f8d7da; color: #721c24; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .metric-label { color: #666; font-size: 0.9em; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
        .recommendation { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .recommendation.high { border-left: 4px solid #dc3545; }
        .recommendation.medium { border-left: 4px solid #ffc107; }
        .recommendation.low { border-left: 4px solid #28a745; }
        .systems { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .system { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Continuous Improvement Report</h1>
            <p>Generated: ${new Date(cycleResults.timestamp).toLocaleString()}</p>
            <div class="status ${status}">${status.toUpperCase()}</div>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-label">Overall Health</div>
                <div class="metric-value" style="color: ${this.getScoreColor(summary.overallHealth)}">${summary.overallHealth.toFixed(1)}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Quality Score</div>
                <div class="metric-value" style="color: ${this.getScoreColor(summary.qualityScore)}">${summary.qualityScore.toFixed(1)}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Coverage Score</div>
                <div class="metric-value" style="color: ${this.getScoreColor(summary.coverageScore)}">${summary.coverageScore.toFixed(1)}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Critical Issues</div>
                <div class="metric-value" style="color: ${summary.criticalIssues > 0 ? "#dc3545" : "#28a745"}">${summary.criticalIssues}</div>
            </div>
        </div>

        <div class="systems">
            <div class="system">
                <h3>Quality Dashboard</h3>
                <p>Status: ${cycleResults.results.dashboard?.status || "Unknown"}</p>
                <p>Last Updated: ${cycleResults.results.dashboard?.timestamp ? new Date(cycleResults.results.dashboard.timestamp).toLocaleString() : "N/A"}</p>
            </div>
            <div class="system">
                <h3>Maintenance System</h3>
                <p>Status: ${cycleResults.results.maintenance?.status || "Unknown"}</p>
                <p>Health: ${summary.systemStatus.maintenance?.health || 0}%</p>
            </div>
            <div class="system">
                <h3>Quality Assurance</h3>
                <p>Status: ${cycleResults.results.qualityAssurance?.status || "Unknown"}</p>
                <p>Gates: ${summary.systemStatus.qualityGates?.passed || 0}/${summary.systemStatus.qualityGates?.total || 0}</p>
            </div>
        </div>

        ${
          cycleResults.recommendations.length > 0
            ? `
            <div class="recommendations">
                <h2>Priority Recommendations</h2>
                ${cycleResults.recommendations
                  .slice(0, 10)
                  .map(
                    (rec) => `
                    <div class="recommendation ${rec.priority}">
                        <h4>${rec.title} (${rec.priority} priority)</h4>
                        <p>${rec.description}</p>
                        <p><strong>Sources:</strong> ${rec.sources.join(", ")}</p>
                        ${
                          rec.actions
                            ? `
                            <ul>
                                ${rec.actions
                                  .slice(0, 3)
                                  .map((action) => `<li>${action}</li>`)
                                  .join("")}
                            </ul>
                        `
                            : ""
                        }
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
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport(cycleResults) {
    const summary = cycleResults.summary;
    const status = cycleResults.status;

    return `# Continuous Improvement Report

**Generated**: ${new Date(cycleResults.timestamp).toLocaleString()}  
**Status**: ${status.toUpperCase()}

## Summary

- **Overall Health**: ${summary.overallHealth.toFixed(1)}%
- **Quality Score**: ${summary.qualityScore.toFixed(1)}%
- **Coverage Score**: ${summary.coverageScore.toFixed(1)}%
- **Performance Score**: ${summary.performanceScore.toFixed(1)}%
- **Reliability Score**: ${summary.reliabilityScore.toFixed(1)}%
- **Critical Issues**: ${summary.criticalIssues}
- **Total Recommendations**: ${summary.totalRecommendations}

## System Status

### Quality Dashboard
- **Status**: ${cycleResults.results.dashboard?.status || "Unknown"}
- **Last Updated**: ${cycleResults.results.dashboard?.timestamp ? new Date(cycleResults.results.dashboard.timestamp).toLocaleString() : "N/A"}

### Maintenance System
- **Status**: ${cycleResults.results.maintenance?.status || "Unknown"}
- **Health**: ${summary.systemStatus.maintenance?.health || 0}%
- **Critical Issues**: ${summary.systemStatus.maintenance?.criticalIssues || 0}
- **Total Issues**: ${summary.systemStatus.maintenance?.totalIssues || 0}

### Quality Assurance
- **Status**: ${cycleResults.results.qualityAssurance?.status || "Unknown"}
- **Gates Passed**: ${summary.systemStatus.qualityGates?.passed || 0}/${summary.systemStatus.qualityGates?.total || 0}
- **QA Score**: ${summary.systemStatus.qualityGates?.score || 0}%

## Priority Recommendations

${cycleResults.recommendations
  .slice(0, 10)
  .map(
    (rec, i) => `
### ${i + 1}. ${rec.title} (${rec.priority} priority)

**Description**: ${rec.description}  
**Sources**: ${rec.sources.join(", ")}

${
  rec.actions
    ? `**Actions**:
${rec.actions
  .slice(0, 5)
  .map((action) => `- ${action}`)
  .join("\n")}`
    : ""
}
`,
  )
  .join("")}

## Next Steps

1. **Address Critical Issues**: Focus on ${summary.criticalIssues} critical issues first
2. **Improve Coverage**: Work towards 100% test coverage
3. **Monitor Trends**: Continue regular quality monitoring
4. **Team Review**: Schedule team review of recommendations

---

*Report generated by Continuous Improvement Orchestrator*`;
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
   * Clean up old reports based on retention policy
   */
  cleanupOldReports() {
    const retentionDays = this.config.reporting.retention;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = fs.readdirSync(this.reportsDir);
      let deletedCount = 0;

      files.forEach((file) => {
        const filePath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${deletedCount} old reports`);
      }
    } catch (error) {
      console.warn("Could not clean up old reports:", error.message);
    }
  }

  /**
   * Display summary to console
   */
  displaySummary(cycleResults) {
    const summary = cycleResults.summary;

    console.log("\n📊 CONTINUOUS IMPROVEMENT SUMMARY");
    console.log("==================================");
    console.log(`Overall Status: ${cycleResults.status.toUpperCase()}`);
    console.log(`Overall Health: ${summary.overallHealth.toFixed(1)}%`);
    console.log(`Quality Score: ${summary.qualityScore.toFixed(1)}%`);
    console.log(`Coverage Score: ${summary.coverageScore.toFixed(1)}%`);
    console.log(`Critical Issues: ${summary.criticalIssues}`);

    console.log("\n🔧 SYSTEM STATUS");
    console.log(
      `Dashboard: ${cycleResults.results.dashboard?.status || "Unknown"}`,
    );
    console.log(
      `Maintenance: ${cycleResults.results.maintenance?.status || "Unknown"}`,
    );
    console.log(
      `Quality Assurance: ${cycleResults.results.qualityAssurance?.status || "Unknown"}`,
    );

    if (cycleResults.recommendations.length > 0) {
      console.log("\n💡 TOP RECOMMENDATIONS");
      cycleResults.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
    }

    console.log(`\n📁 Reports saved to: ${this.reportsDir}`);
  }

  /**
   * Run orchestrator
   */
  async run() {
    console.log("🎯 Continuous Improvement Orchestrator");
    console.log("=====================================\n");

    try {
      const results = await this.runCompleteCycle();
      this.displaySummary(results);

      // Exit with appropriate code based on status
      if (results.status === "failing") {
        console.log(
          "\n❌ Critical issues detected. Please address them immediately.",
        );
        process.exit(1);
      } else if (results.status === "warning") {
        console.log(
          "\n⚠️ Some issues detected. Consider addressing them soon.",
        );
        process.exit(0);
      } else {
        console.log("\n✅ All systems healthy. Keep up the great work!");
        process.exit(0);
      }
    } catch (error) {
      console.error("❌ Orchestrator failed:", error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const orchestrator = new ContinuousImprovementOrchestrator();
  orchestrator.run().catch((error) => {
    console.error("❌ Orchestrator failed:", error);
    process.exit(1);
  });
}

module.exports = ContinuousImprovementOrchestrator;
