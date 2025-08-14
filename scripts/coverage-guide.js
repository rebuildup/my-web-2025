#!/usr/bin/env node

/**
 * Coverage Guide Script
 * Helps developers understand what needs to be tested to reach 100% coverage
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const COVERAGE_FILE = path.join(
  process.cwd(),
  "coverage",
  "coverage-summary.json",
);
const LCOV_FILE = path.join(process.cwd(), "coverage", "lcov.info");

class CoverageGuide {
  constructor() {
    this.coverageData = null;
    this.lcovData = null;
  }

  async generateGuide() {
    console.log("📚 Generating Coverage Guide...");
    console.log("=".repeat(50));

    // Check if coverage data exists
    if (!fs.existsSync(COVERAGE_FILE)) {
      console.log("⚠️  No coverage data found. Running tests with coverage...");
      try {
        execSync("npm run test:coverage:100", { stdio: "inherit" });
      } catch (error) {
        console.error("❌ Failed to generate coverage data");
        process.exit(1);
      }
    }

    this.loadCoverageData();
    this.displayOverallStatus();
    this.displayDetailedAnalysis();
    this.displayRecommendations();
    this.displayCommands();
  }

  loadCoverageData() {
    this.coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, "utf8"));

    if (fs.existsSync(LCOV_FILE)) {
      this.lcovData = fs.readFileSync(LCOV_FILE, "utf8");
    }
  }

  displayOverallStatus() {
    const { total } = this.coverageData;

    console.log("\n📊 Current Coverage Status:");
    console.log("-".repeat(30));

    const metrics = [
      {
        name: "Statements",
        value: total.statements.pct,
        covered: total.statements.covered,
        total: total.statements.total,
      },
      {
        name: "Branches",
        value: total.branches.pct,
        covered: total.branches.covered,
        total: total.branches.total,
      },
      {
        name: "Functions",
        value: total.functions.pct,
        covered: total.functions.covered,
        total: total.functions.total,
      },
      {
        name: "Lines",
        value: total.lines.pct,
        covered: total.lines.covered,
        total: total.lines.total,
      },
    ];

    metrics.forEach((metric) => {
      const status = metric.value === 100 ? "✅" : "❌";
      const gap = metric.total - metric.covered;
      console.log(
        `${status} ${metric.name.padEnd(12)}: ${metric.value.toString().padStart(6)}% (${metric.covered}/${metric.total}${gap > 0 ? `, need ${gap} more` : ""})`,
      );
    });

    const overallScore =
      (total.statements.pct +
        total.branches.pct +
        total.functions.pct +
        total.lines.pct) /
      4;
    console.log(`\n🎯 Overall Score: ${overallScore.toFixed(2)}%`);
  }

  displayDetailedAnalysis() {
    console.log("\n🔍 Detailed Analysis:");
    console.log("-".repeat(30));

    const files = Object.entries(this.coverageData)
      .filter(([key]) => key !== "total")
      .map(([filePath, data]) => ({
        path: filePath,
        ...data,
        score:
          (data.statements.pct +
            data.branches.pct +
            data.functions.pct +
            data.lines.pct) /
          4,
      }))
      .sort((a, b) => a.score - b.score);

    // Show worst performing files
    const worstFiles = files.filter((file) => file.score < 100).slice(0, 10);

    if (worstFiles.length > 0) {
      console.log("\n📉 Files needing attention (worst first):");
      worstFiles.forEach((file, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${file.path}`);
        console.log(
          `    Score: ${file.score.toFixed(1)}% | S:${file.statements.pct}% B:${file.branches.pct}% F:${file.functions.pct}% L:${file.lines.pct}%`,
        );

        // Show what's missing
        const missing = [];
        if (file.statements.pct < 100)
          missing.push(
            `${file.statements.total - file.statements.covered} statements`,
          );
        if (file.branches.pct < 100)
          missing.push(
            `${file.branches.total - file.branches.covered} branches`,
          );
        if (file.functions.pct < 100)
          missing.push(
            `${file.functions.total - file.functions.covered} functions`,
          );
        if (file.lines.pct < 100)
          missing.push(`${file.lines.total - file.lines.covered} lines`);

        if (missing.length > 0) {
          console.log(`    Missing: ${missing.join(", ")}`);
        }
        console.log("");
      });
    }

    // Show files with 100% coverage
    const perfectFiles = files.filter((file) => file.score === 100);
    console.log(
      `\n✅ Files with 100% coverage: ${perfectFiles.length}/${files.length}`,
    );

    if (perfectFiles.length > 0 && perfectFiles.length <= 5) {
      console.log("Perfect files:");
      perfectFiles.forEach((file) => {
        console.log(`   ✅ ${file.path}`);
      });
    }
  }

  displayRecommendations() {
    const { total } = this.coverageData;

    console.log("\n💡 Recommendations:");
    console.log("-".repeat(30));

    const recommendations = [];

    if (total.statements.pct < 100) {
      const gap = total.statements.total - total.statements.covered;
      recommendations.push({
        priority: "HIGH",
        metric: "Statements",
        action: `Add tests to cover ${gap} uncovered statements`,
        tip: "Focus on error handling, edge cases, and conditional logic",
      });
    }

    if (total.branches.pct < 100) {
      const gap = total.branches.total - total.branches.covered;
      recommendations.push({
        priority: "HIGH",
        metric: "Branches",
        action: `Add tests to cover ${gap} uncovered branches`,
        tip: "Test both true/false conditions in if statements, switch cases, and ternary operators",
      });
    }

    if (total.functions.pct < 100) {
      const gap = total.functions.total - total.functions.covered;
      recommendations.push({
        priority: "MEDIUM",
        metric: "Functions",
        action: `Add tests for ${gap} uncovered functions`,
        tip: "Ensure all exported functions and methods are tested",
      });
    }

    if (total.lines.pct < 100) {
      const gap = total.lines.total - total.lines.covered;
      recommendations.push({
        priority: "MEDIUM",
        metric: "Lines",
        action: `Cover ${gap} more lines of code`,
        tip: "This often correlates with statements coverage",
      });
    }

    if (recommendations.length === 0) {
      console.log("🎉 Congratulations! You have achieved 100% coverage!");
      console.log("   Continue maintaining this high standard by:");
      console.log("   • Writing tests for new code");
      console.log("   • Reviewing coverage reports regularly");
      console.log("   • Keeping tests maintainable and meaningful");
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`   💡 ${rec.tip}`);
        console.log("");
      });
    }
  }

  displayCommands() {
    console.log("\n🛠️  Useful Commands:");
    console.log("-".repeat(30));

    const commands = [
      {
        command: "npm run test:coverage:100",
        description: "Run tests with 100% coverage enforcement",
      },
      {
        command: "npm run test:coverage:validate",
        description: "Validate current coverage against 100% threshold",
      },
      {
        command: "npm run test:coverage:diff",
        description: "Compare coverage with main branch",
      },
      {
        command: "npm run test:watch",
        description: "Run tests in watch mode for development",
      },
      {
        command: "open coverage/lcov-report/index.html",
        description: "Open HTML coverage report (shows uncovered lines)",
      },
    ];

    commands.forEach((cmd) => {
      console.log(`📝 ${cmd.command}`);
      console.log(`   ${cmd.description}`);
      console.log("");
    });

    console.log("🔗 Additional Resources:");
    console.log("   • Coverage reports: ./coverage/lcov-report/index.html");
    console.log("   • JSON summary: ./coverage/coverage-summary.json");
    console.log("   • LCOV data: ./coverage/lcov.info");
  }
}

// CLI usage
if (require.main === module) {
  const guide = new CoverageGuide();
  guide.generateGuide().catch((error) => {
    console.error("❌ Error generating coverage guide:", error);
    process.exit(1);
  });
}

module.exports = { CoverageGuide };
