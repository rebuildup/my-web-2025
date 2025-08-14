#!/usr/bin/env node

/**
 * Coverage validation script for CI/CD pipelines
 * Validates that test coverage meets 100% threshold requirements
 */

const fs = require("fs");
const path = require("path");

const COVERAGE_THRESHOLD = 100;
const COVERAGE_FILE = path.join(
  process.cwd(),
  "coverage",
  "coverage-summary.json",
);

/**
 * Generate recommendations for improving coverage based on failures
 */
function generateRecommendations(failures, coverageData) {
  const recommendations = [];

  failures.forEach((failure) => {
    switch (failure.metric) {
      case "statements":
        recommendations.push({
          metric: failure.metric,
          suggestion:
            "Add tests for uncovered statements. Focus on error handling, edge cases, and conditional logic.",
          priority: "high",
          estimatedEffort: Math.ceil(failure.gap * 0.5) + " hours",
        });
        break;
      case "branches":
        recommendations.push({
          metric: failure.metric,
          suggestion:
            "Add tests for uncovered branches. Test both true/false conditions in if statements, switch cases, and ternary operators.",
          priority: "high",
          estimatedEffort: Math.ceil(failure.gap * 0.3) + " hours",
        });
        break;
      case "functions":
        recommendations.push({
          metric: failure.metric,
          suggestion:
            "Add tests for uncovered functions. Ensure all exported functions and methods are tested.",
          priority: "medium",
          estimatedEffort: Math.ceil(failure.gap * 0.4) + " hours",
        });
        break;
      case "lines":
        recommendations.push({
          metric: failure.metric,
          suggestion:
            "Add tests for uncovered lines. This often correlates with statements coverage.",
          priority: "medium",
          estimatedEffort: Math.ceil(failure.gap * 0.2) + " hours",
        });
        break;
    }
  });

  // Add general recommendations
  recommendations.push({
    metric: "general",
    suggestion:
      "Run 'npm run test:coverage:100' locally to see detailed coverage report with uncovered lines highlighted.",
    priority: "info",
    estimatedEffort: "immediate",
  });

  return recommendations;
}

function validateCoverage() {
  console.log("🔍 Validating test coverage...");

  // Check if coverage file exists
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error(
      "❌ Coverage file not found. Please run tests with coverage first.",
    );
    console.error(`Expected file: ${COVERAGE_FILE}`);
    process.exit(1);
  }

  try {
    // Read coverage data
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, "utf8"));
    const { total } = coverageData;

    console.log("\n📊 Coverage Summary:");
    console.log(`Statements: ${total.statements.pct}%`);
    console.log(`Branches: ${total.branches.pct}%`);
    console.log(`Functions: ${total.functions.pct}%`);
    console.log(`Lines: ${total.lines.pct}%`);

    // Validate each metric
    const metrics = ["statements", "branches", "functions", "lines"];
    const failures = [];

    metrics.forEach((metric) => {
      const percentage = total[metric].pct;
      if (percentage < COVERAGE_THRESHOLD) {
        failures.push({
          metric,
          actual: percentage,
          required: COVERAGE_THRESHOLD,
          gap: COVERAGE_THRESHOLD - percentage,
        });
      }
    });

    if (failures.length > 0) {
      console.error("\n❌ Coverage validation failed:");
      failures.forEach((failure) => {
        console.error(
          `  ${failure.metric}: ${failure.actual}% (required: ${failure.required}%, gap: ${failure.gap}%)`,
        );
      });

      // Generate detailed failure report
      const failureReport = {
        timestamp: new Date().toISOString(),
        status: "FAILED",
        threshold: COVERAGE_THRESHOLD,
        failures,
        summary: total,
        ciContext: {
          branch:
            process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "unknown",
          commit: process.env.GITHUB_SHA || process.env.COMMIT_SHA || "unknown",
          pr:
            process.env.GITHUB_EVENT_NAME === "pull_request"
              ? process.env.GITHUB_EVENT_NUMBER
              : null,
          runId: process.env.GITHUB_RUN_ID || null,
        },
        recommendations: generateRecommendations(failures, coverageData),
      };

      const reportsDir = path.join(process.cwd(), "coverage", "reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(reportsDir, "coverage-validation-failure.json"),
        JSON.stringify(failureReport, null, 2),
      );

      // Generate GitHub Actions annotations for CI
      if (process.env.CI === "true" && process.env.GITHUB_ACTIONS === "true") {
        failures.forEach((failure) => {
          console.log(
            `::error title=Coverage Threshold Not Met::${failure.metric} coverage is ${failure.actual}% but requires ${failure.required}% (gap: ${failure.gap}%)`,
          );
        });
      }

      console.error(
        `\n📁 Detailed failure report saved to: ${path.join(reportsDir, "coverage-validation-failure.json")}`,
      );

      // Set GitHub Actions output for downstream jobs
      if (process.env.GITHUB_OUTPUT) {
        const output = `coverage_status=failed\ncoverage_failures=${failures.length}\n`;
        fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
      }

      process.exit(1);
    }

    // Success
    console.log(
      "\n✅ Coverage validation passed! All metrics meet 100% threshold.",
    );

    // Generate success report
    const successReport = {
      timestamp: new Date().toISOString(),
      status: "PASSED",
      threshold: COVERAGE_THRESHOLD,
      summary: total,
      ciContext: {
        branch:
          process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "unknown",
        commit: process.env.GITHUB_SHA || process.env.COMMIT_SHA || "unknown",
        pr:
          process.env.GITHUB_EVENT_NAME === "pull_request"
            ? process.env.GITHUB_EVENT_NUMBER
            : null,
        runId: process.env.GITHUB_RUN_ID || null,
      },
    };

    const reportsDir = path.join(process.cwd(), "coverage", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, "coverage-validation-success.json"),
      JSON.stringify(successReport, null, 2),
    );

    // Set GitHub Actions output for downstream jobs
    if (process.env.GITHUB_OUTPUT) {
      const output = `coverage_status=passed\ncoverage_failures=0\n`;
      fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
    }

    // Generate GitHub Actions annotation for success
    if (process.env.CI === "true" && process.env.GITHUB_ACTIONS === "true") {
      console.log(
        "::notice title=Coverage Validation Passed::All coverage thresholds met at 100%",
      );
    }

    console.log(
      `📁 Success report saved to: ${path.join(reportsDir, "coverage-validation-success.json")}`,
    );
  } catch (error) {
    console.error("❌ Error reading coverage data:", error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  validateCoverage();
}

module.exports = { validateCoverage };
