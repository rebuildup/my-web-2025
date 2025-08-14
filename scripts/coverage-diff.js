#!/usr/bin/env node

/**
 * Coverage diff analysis script
 * Compares current coverage with a baseline (e.g., main branch)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CURRENT_COVERAGE_FILE = path.join(
  process.cwd(),
  "coverage",
  "coverage-summary.json",
);
const BASE_COVERAGE_FILE = path.join(
  process.cwd(),
  "base-coverage-summary.json",
);

function generateCoverageDiff(baseBranch = "main") {
  console.log("🔍 Generating coverage diff analysis...");

  // Check if current coverage exists
  if (!fs.existsSync(CURRENT_COVERAGE_FILE)) {
    console.error(
      "❌ Current coverage file not found. Please run tests with coverage first.",
    );
    console.error(`Expected file: ${CURRENT_COVERAGE_FILE}`);
    process.exit(1);
  }

  try {
    // Get current coverage
    const currentCoverage = JSON.parse(
      fs.readFileSync(CURRENT_COVERAGE_FILE, "utf8"),
    );

    // Try to get base coverage
    let baseCoverage;
    if (fs.existsSync(BASE_COVERAGE_FILE)) {
      baseCoverage = JSON.parse(fs.readFileSync(BASE_COVERAGE_FILE, "utf8"));
      console.log(`📁 Using existing base coverage from ${BASE_COVERAGE_FILE}`);
    } else {
      console.log(`🔄 Generating base coverage from ${baseBranch} branch...`);

      // Save current state
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      const hasUncommittedChanges =
        execSync("git status --porcelain", { encoding: "utf8" }).trim().length >
        0;

      if (hasUncommittedChanges) {
        console.log("💾 Stashing uncommitted changes...");
        execSync("git stash push -m 'coverage-diff-temp-stash'");
      }

      try {
        // Switch to base branch and run coverage
        execSync(`git checkout ${baseBranch}`);
        execSync("npm ci", { stdio: "inherit" });
        execSync("npm run test:coverage:100:ci", { stdio: "inherit" });

        if (fs.existsSync(CURRENT_COVERAGE_FILE)) {
          fs.copyFileSync(CURRENT_COVERAGE_FILE, BASE_COVERAGE_FILE);
          baseCoverage = JSON.parse(
            fs.readFileSync(BASE_COVERAGE_FILE, "utf8"),
          );
        } else {
          throw new Error("Base coverage generation failed");
        }
      } finally {
        // Restore original state
        execSync(`git checkout ${currentBranch}`);
        execSync("npm ci", { stdio: "inherit" });
        execSync("npm run test:coverage:100:ci", { stdio: "inherit" });

        if (hasUncommittedChanges) {
          console.log("🔄 Restoring uncommitted changes...");
          execSync("git stash pop");
        }
      }
    }

    // Calculate diff
    const diff = {
      statements:
        currentCoverage.total.statements.pct -
        baseCoverage.total.statements.pct,
      branches:
        currentCoverage.total.branches.pct - baseCoverage.total.branches.pct,
      functions:
        currentCoverage.total.functions.pct - baseCoverage.total.functions.pct,
      lines: currentCoverage.total.lines.pct - baseCoverage.total.lines.pct,
    };

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      baseBranch,
      current: currentCoverage.total,
      base: baseCoverage.total,
      diff,
      analysis: generateDiffAnalysis(diff),
    };

    // Save diff report
    const diffReportPath = path.join(
      process.cwd(),
      "coverage-diff-report.json",
    );
    fs.writeFileSync(diffReportPath, JSON.stringify(report, null, 2));

    // Display results
    console.log("\n📊 Coverage Diff Analysis:");
    console.log("=".repeat(50));

    const formatDiff = (value) => {
      const sign = value >= 0 ? "+" : "";
      const emoji = value > 0 ? "📈" : value < 0 ? "📉" : "➡️";
      return `${sign}${value.toFixed(2)}% ${emoji}`;
    };

    console.log(
      `Statements: ${currentCoverage.total.statements.pct}% (${formatDiff(diff.statements)})`,
    );
    console.log(
      `Branches:   ${currentCoverage.total.branches.pct}% (${formatDiff(diff.branches)})`,
    );
    console.log(
      `Functions:  ${currentCoverage.total.functions.pct}% (${formatDiff(diff.functions)})`,
    );
    console.log(
      `Lines:      ${currentCoverage.total.lines.pct}% (${formatDiff(diff.lines)})`,
    );

    console.log("\n📋 Analysis:");
    report.analysis.forEach((item) => {
      console.log(`${item.emoji} ${item.message}`);
    });

    console.log(`\n📁 Detailed report saved to: ${diffReportPath}`);

    return report;
  } catch (error) {
    console.error("❌ Error generating coverage diff:", error.message);
    process.exit(1);
  }
}

function generateDiffAnalysis(diff) {
  const analysis = [];

  const totalDiff =
    diff.statements + diff.branches + diff.functions + diff.lines;

  if (totalDiff > 0) {
    analysis.push({
      emoji: "🎉",
      message: `Overall coverage improved by ${(totalDiff / 4).toFixed(2)}% on average`,
    });
  } else if (totalDiff < 0) {
    analysis.push({
      emoji: "⚠️",
      message: `Overall coverage decreased by ${Math.abs(totalDiff / 4).toFixed(2)}% on average`,
    });
  } else {
    analysis.push({
      emoji: "➡️",
      message: "No significant change in overall coverage",
    });
  }

  // Analyze individual metrics
  Object.entries(diff).forEach(([metric, value]) => {
    if (value > 5) {
      analysis.push({
        emoji: "🚀",
        message: `Significant improvement in ${metric} coverage (+${value.toFixed(2)}%)`,
      });
    } else if (value < -5) {
      analysis.push({
        emoji: "🚨",
        message: `Significant decrease in ${metric} coverage (${value.toFixed(2)}%)`,
      });
    }
  });

  // Check for 100% achievement
  const current = diff;
  if (Object.values(current).every((val) => val === 100)) {
    analysis.push({
      emoji: "🏆",
      message: "Perfect 100% coverage achieved across all metrics!",
    });
  }

  return analysis;
}

// CLI usage
if (require.main === module) {
  const baseBranch = process.argv[2] || "main";
  generateCoverageDiff(baseBranch);
}

module.exports = { generateCoverageDiff };
