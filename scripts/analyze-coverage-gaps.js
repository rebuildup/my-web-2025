#!/usr/bin/env node

/**
 * Coverage Gap Analysis Script
 * Analyzes current test coverage and identifies areas needing improvement
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class CoverageAnalyzer {
  constructor() {
    this.coverageDir = path.join(process.cwd(), "coverage");
    this.coverageSummaryPath = path.join(
      this.coverageDir,
      "coverage-summary.json",
    );
    this.coverageDataPath = path.join(this.coverageDir, "coverage-final.json");
  }

  async analyzeCoverage() {
    console.log("🔍 Analyzing test coverage gaps...\n");

    // Check if coverage data exists
    if (!fs.existsSync(this.coverageSummaryPath)) {
      console.log(
        "❌ Coverage data not found. Running tests with coverage...\n",
      );
      try {
        execSync(
          "npm run test:coverage -- --watchAll=false --passWithNoTests",
          {
            stdio: "inherit",
            timeout: 300000, // 5 minutes timeout
          },
        );
      } catch (error) {
        console.log(
          "⚠️  Tests completed with some failures, but coverage data should be available\n",
        );
      }
    }

    if (!fs.existsSync(this.coverageSummaryPath)) {
      console.error("❌ Could not generate coverage data");
      process.exit(1);
    }

    const coverageSummary = JSON.parse(
      fs.readFileSync(this.coverageSummaryPath, "utf8"),
    );
    const coverageData = JSON.parse(
      fs.readFileSync(this.coverageDataPath, "utf8"),
    );

    this.generateCoverageReport(coverageSummary, coverageData);
  }

  generateCoverageReport(summary, data) {
    const total = summary.total;

    console.log("📊 CURRENT COVERAGE SUMMARY");
    console.log("=".repeat(50));
    console.log(
      `Lines:      ${total.lines.pct.toFixed(2)}% (${total.lines.covered}/${total.lines.total})`,
    );
    console.log(
      `Statements: ${total.statements.pct.toFixed(2)}% (${total.statements.covered}/${total.statements.total})`,
    );
    console.log(
      `Functions:  ${total.functions.pct.toFixed(2)}% (${total.functions.covered}/${total.functions.total})`,
    );
    console.log(
      `Branches:   ${total.branches.pct.toFixed(2)}% (${total.branches.covered}/${total.branches.total})`,
    );
    console.log("");

    // Calculate gaps to 100%
    const gaps = {
      lines: total.lines.total - total.lines.covered,
      statements: total.statements.total - total.statements.covered,
      functions: total.functions.total - total.functions.covered,
      branches: total.branches.total - total.branches.covered,
    };

    console.log("🎯 GAPS TO 100% COVERAGE");
    console.log("=".repeat(50));
    console.log(`Lines needed:      ${gaps.lines}`);
    console.log(`Statements needed: ${gaps.statements}`);
    console.log(`Functions needed:  ${gaps.functions}`);
    console.log(`Branches needed:   ${gaps.branches}`);
    console.log("");

    // Analyze files by coverage level
    const files = Object.entries(data)
      .filter(([path]) => !path.includes("node_modules"))
      .map(([path, coverage]) => ({
        path: path.replace(process.cwd(), "").replace(/\\/g, "/"),
        lines: coverage.s
          ? (Object.values(coverage.s).filter((v) => v > 0).length /
              Object.keys(coverage.s).length) *
            100
          : 0,
        functions: coverage.f
          ? (Object.values(coverage.f).filter((v) => v > 0).length /
              Object.keys(coverage.f).length) *
            100
          : 0,
        branches: coverage.b
          ? (Object.values(coverage.b)
              .flat()
              .filter((v) => v > 0).length /
              Object.values(coverage.b).flat().length) *
            100
          : 100,
        statements: coverage.s
          ? (Object.values(coverage.s).filter((v) => v > 0).length /
              Object.keys(coverage.s).length) *
            100
          : 0,
      }))
      .filter((file) => !isNaN(file.lines));

    // Categorize files by coverage level
    const zeroCoverage = files.filter((f) => f.lines === 0);
    const lowCoverage = files.filter((f) => f.lines > 0 && f.lines < 50);
    const mediumCoverage = files.filter((f) => f.lines >= 50 && f.lines < 80);
    const highCoverage = files.filter((f) => f.lines >= 80 && f.lines < 100);
    const fullCoverage = files.filter((f) => f.lines === 100);

    console.log("📁 FILES BY COVERAGE LEVEL");
    console.log("=".repeat(50));
    console.log(`🔴 Zero Coverage (0%):     ${zeroCoverage.length} files`);
    console.log(`🟠 Low Coverage (1-49%):   ${lowCoverage.length} files`);
    console.log(`🟡 Medium Coverage (50-79%): ${mediumCoverage.length} files`);
    console.log(`🟢 High Coverage (80-99%):  ${highCoverage.length} files`);
    console.log(`✅ Full Coverage (100%):    ${fullCoverage.length} files`);
    console.log("");

    // Show priority files (0% coverage)
    if (zeroCoverage.length > 0) {
      console.log("🚨 PRIORITY: FILES WITH 0% COVERAGE");
      console.log("=".repeat(50));
      zeroCoverage
        .sort((a, b) => a.path.localeCompare(b.path))
        .slice(0, 20) // Show top 20
        .forEach((file) => {
          console.log(`  ${file.path}`);
        });
      if (zeroCoverage.length > 20) {
        console.log(`  ... and ${zeroCoverage.length - 20} more files`);
      }
      console.log("");
    }

    // Show files with low coverage that could be improved
    if (lowCoverage.length > 0) {
      console.log("⚠️  LOW COVERAGE FILES (IMPROVEMENT OPPORTUNITIES)");
      console.log("=".repeat(50));
      lowCoverage
        .sort((a, b) => a.lines - b.lines)
        .slice(0, 15) // Show top 15
        .forEach((file) => {
          console.log(`  ${file.path} (${file.lines.toFixed(1)}%)`);
        });
      if (lowCoverage.length > 15) {
        console.log(`  ... and ${lowCoverage.length - 15} more files`);
      }
      console.log("");
    }

    // Generate recommendations
    this.generateRecommendations(zeroCoverage, lowCoverage, gaps);

    // Generate detailed report file
    this.generateDetailedReport({
      summary: total,
      gaps,
      files: {
        zero: zeroCoverage,
        low: lowCoverage,
        medium: mediumCoverage,
        high: highCoverage,
        full: fullCoverage,
      },
    });
  }

  generateRecommendations(zeroCoverage, lowCoverage, gaps) {
    console.log("💡 RECOMMENDATIONS");
    console.log("=".repeat(50));

    if (zeroCoverage.length > 0) {
      console.log("1. 🎯 Focus on Zero Coverage Files:");
      console.log("   - Start with API routes and utility functions");
      console.log("   - Create basic smoke tests for components");
      console.log("   - Prioritize business-critical functionality");
      console.log("");
    }

    if (lowCoverage.length > 0) {
      console.log("2. 📈 Improve Low Coverage Files:");
      console.log("   - Add tests for uncovered branches");
      console.log("   - Test error handling paths");
      console.log("   - Add edge case testing");
      console.log("");
    }

    const totalGaps =
      gaps.lines + gaps.statements + gaps.functions + gaps.branches;
    const estimatedHours = Math.ceil(totalGaps / 10); // Rough estimate: 10 items per hour

    console.log("3. ⏱️  Estimated Effort:");
    console.log(`   - Total uncovered items: ${totalGaps}`);
    console.log(`   - Estimated time: ${estimatedHours} hours`);
    console.log(`   - Recommended approach: Incremental improvement`);
    console.log("");

    console.log("4. 🛠️  Next Steps:");
    console.log("   - Run: npm test -- --coverage --watchAll=false");
    console.log(
      "   - Focus on one file type at a time (API → Utils → Components)",
    );
    console.log("   - Use test templates from templates/test-templates/");
    console.log("   - Aim for 10-20% improvement per iteration");
    console.log("");
  }

  generateDetailedReport(data) {
    const reportPath = path.join(
      this.coverageDir,
      "coverage-gap-analysis.json",
    );
    const report = {
      timestamp: new Date().toISOString(),
      summary: data.summary,
      gaps: data.gaps,
      fileCategories: {
        zeroCoverage: data.files.zero.length,
        lowCoverage: data.files.low.length,
        mediumCoverage: data.files.medium.length,
        highCoverage: data.files.high.length,
        fullCoverage: data.files.full.length,
      },
      priorityFiles: data.files.zero.slice(0, 50),
      improvementOpportunities: data.files.low.slice(0, 30),
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    console.log("");
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new CoverageAnalyzer();
  analyzer.analyzeCoverage().catch(console.error);
}

module.exports = CoverageAnalyzer;
