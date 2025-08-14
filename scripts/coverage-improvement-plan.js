#!/usr/bin/env node

/**
 * Coverage Improvement Plan Generator
 * Creates a prioritized plan for improving test coverage to 100%
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

class CoverageImprovementPlan {
  constructor() {
    this.srcDir = path.join(process.cwd(), "src");
    this.coverageDir = path.join(process.cwd(), "coverage");
    this.coverageDataPath = path.join(this.coverageDir, "coverage-final.json");
  }

  async generatePlan() {
    console.log("📋 Generating Coverage Improvement Plan...\n");

    // Get all source files
    const allFiles = this.getAllSourceFiles();
    console.log(`📁 Found ${allFiles.length} source files\n`);

    // Load coverage data if available
    let coverageData = {};
    if (fs.existsSync(this.coverageDataPath)) {
      coverageData = JSON.parse(fs.readFileSync(this.coverageDataPath, "utf8"));
    }

    // Analyze files
    const analysis = this.analyzeFiles(allFiles, coverageData);

    // Generate improvement plan
    this.generateImprovementPlan(analysis);

    // Create test files for uncovered areas
    this.generateTestFileRecommendations(analysis);
  }

  getAllSourceFiles() {
    const patterns = [
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.js",
      "src/**/*.jsx",
    ];

    const excludePatterns = [
      "**/node_modules/**",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "**/coverage/**",
      "**/*.d.ts",
      "**/stories/**",
      "**/storybook/**",
    ];

    let files = [];
    patterns.forEach((pattern) => {
      const matches = glob.sync(pattern, {
        ignore: excludePatterns,
        cwd: process.cwd(),
      });
      files = files.concat(matches);
    });

    return [...new Set(files)]; // Remove duplicates
  }

  analyzeFiles(allFiles, coverageData) {
    const analysis = {
      uncovered: [],
      partiallyTested: [],
      wellTested: [],
      fullyTested: [],
    };

    allFiles.forEach((filePath) => {
      const absolutePath = path.resolve(filePath);
      const coverage = coverageData[absolutePath];

      if (!coverage) {
        // No coverage data means no tests
        analysis.uncovered.push({
          path: filePath,
          type: this.getFileType(filePath),
          priority: this.calculatePriority(filePath),
          estimatedEffort: this.estimateEffort(filePath),
        });
        return;
      }

      // Calculate coverage percentages
      const lineCoverage = this.calculateLineCoverage(coverage);
      const functionCoverage = this.calculateFunctionCoverage(coverage);
      const branchCoverage = this.calculateBranchCoverage(coverage);

      const avgCoverage =
        (lineCoverage + functionCoverage + branchCoverage) / 3;

      const fileAnalysis = {
        path: filePath,
        type: this.getFileType(filePath),
        priority: this.calculatePriority(filePath),
        estimatedEffort: this.estimateEffort(filePath),
        coverage: {
          lines: lineCoverage,
          functions: functionCoverage,
          branches: branchCoverage,
          average: avgCoverage,
        },
      };

      if (avgCoverage === 0) {
        analysis.uncovered.push(fileAnalysis);
      } else if (avgCoverage < 50) {
        analysis.partiallyTested.push(fileAnalysis);
      } else if (avgCoverage < 100) {
        analysis.wellTested.push(fileAnalysis);
      } else {
        analysis.fullyTested.push(fileAnalysis);
      }
    });

    // Sort by priority and coverage
    analysis.uncovered.sort((a, b) => b.priority - a.priority);
    analysis.partiallyTested.sort(
      (a, b) => a.coverage.average - b.coverage.average,
    );
    analysis.wellTested.sort((a, b) => a.coverage.average - b.coverage.average);

    return analysis;
  }

  calculateLineCoverage(coverage) {
    if (!coverage.s || Object.keys(coverage.s).length === 0) return 0;
    const covered = Object.values(coverage.s).filter((v) => v > 0).length;
    const total = Object.keys(coverage.s).length;
    return (covered / total) * 100;
  }

  calculateFunctionCoverage(coverage) {
    if (!coverage.f || Object.keys(coverage.f).length === 0) return 100; // No functions = 100%
    const covered = Object.values(coverage.f).filter((v) => v > 0).length;
    const total = Object.keys(coverage.f).length;
    return (covered / total) * 100;
  }

  calculateBranchCoverage(coverage) {
    if (!coverage.b || Object.keys(coverage.b).length === 0) return 100; // No branches = 100%
    const allBranches = Object.values(coverage.b).flat();
    const covered = allBranches.filter((v) => v > 0).length;
    const total = allBranches.length;
    return total > 0 ? (covered / total) * 100 : 100;
  }

  getFileType(filePath) {
    if (filePath.includes("/api/")) return "api";
    if (filePath.includes("/lib/")) return "utility";
    if (filePath.includes("/components/")) return "component";
    if (filePath.includes("/hooks/")) return "hook";
    if (filePath.includes("/app/") && filePath.endsWith("page.tsx"))
      return "page";
    if (filePath.includes("/app/") && filePath.endsWith("layout.tsx"))
      return "layout";
    if (filePath.includes("/types/")) return "types";
    return "other";
  }

  calculatePriority(filePath) {
    let priority = 1;

    // API routes are high priority
    if (filePath.includes("/api/")) priority += 3;

    // Core utilities are high priority
    if (filePath.includes("/lib/") && !filePath.includes("__tests__"))
      priority += 2;

    // Main pages are medium-high priority
    if (filePath.includes("/app/") && filePath.endsWith("page.tsx"))
      priority += 2;

    // Components are medium priority
    if (filePath.includes("/components/")) priority += 1;

    // Hooks are medium priority
    if (filePath.includes("/hooks/")) priority += 1;

    // Critical business logic gets extra priority
    if (filePath.includes("portfolio") || filePath.includes("admin"))
      priority += 1;

    return priority;
  }

  estimateEffort(filePath) {
    // Estimate effort in hours based on file type and complexity
    const type = this.getFileType(filePath);

    const baseEffort = {
      api: 2, // API routes need request/response testing
      utility: 1, // Utility functions are usually straightforward
      component: 3, // Components need render + interaction tests
      hook: 2, // Hooks need behavior testing
      page: 4, // Pages need comprehensive testing
      layout: 2, // Layouts need structure testing
      types: 0.5, // Types need minimal testing
      other: 1,
    };

    return baseEffort[type] || 1;
  }

  generateImprovementPlan(analysis) {
    console.log("📊 COVERAGE IMPROVEMENT PLAN");
    console.log("=".repeat(60));
    console.log(
      `📁 Total Files: ${analysis.uncovered.length + analysis.partiallyTested.length + analysis.wellTested.length + analysis.fullyTested.length}`,
    );
    console.log(`🔴 Uncovered: ${analysis.uncovered.length}`);
    console.log(`🟡 Partially Tested: ${analysis.partiallyTested.length}`);
    console.log(`🟢 Well Tested: ${analysis.wellTested.length}`);
    console.log(`✅ Fully Tested: ${analysis.fullyTested.length}`);
    console.log("");

    // Phase 1: Critical uncovered files
    const phase1 = analysis.uncovered
      .filter((f) => f.priority >= 4)
      .slice(0, 20);

    if (phase1.length > 0) {
      console.log("🚨 PHASE 1: CRITICAL UNCOVERED FILES (Priority 4+)");
      console.log("=".repeat(60));
      let totalEffort = 0;
      phase1.forEach((file, index) => {
        console.log(
          `${index + 1}. ${file.path} (${file.type}) - ${file.estimatedEffort}h`,
        );
        totalEffort += file.estimatedEffort;
      });
      console.log(`\n⏱️  Estimated effort: ${totalEffort} hours\n`);
    }

    // Phase 2: High priority uncovered files
    const phase2 = analysis.uncovered
      .filter((f) => f.priority >= 3 && f.priority < 4)
      .slice(0, 30);

    if (phase2.length > 0) {
      console.log("⚠️  PHASE 2: HIGH PRIORITY UNCOVERED FILES (Priority 3)");
      console.log("=".repeat(60));
      let totalEffort = 0;
      phase2.forEach((file, index) => {
        console.log(
          `${index + 1}. ${file.path} (${file.type}) - ${file.estimatedEffort}h`,
        );
        totalEffort += file.estimatedEffort;
      });
      console.log(`\n⏱️  Estimated effort: ${totalEffort} hours\n`);
    }

    // Phase 3: Improve partially tested files
    const phase3 = analysis.partiallyTested.slice(0, 20);

    if (phase3.length > 0) {
      console.log("📈 PHASE 3: IMPROVE PARTIALLY TESTED FILES");
      console.log("=".repeat(60));
      let totalEffort = 0;
      phase3.forEach((file, index) => {
        console.log(
          `${index + 1}. ${file.path} (${file.coverage.average.toFixed(1)}%) - ${file.estimatedEffort}h`,
        );
        totalEffort += file.estimatedEffort;
      });
      console.log(`\n⏱️  Estimated effort: ${totalEffort} hours\n`);
    }

    // Summary
    const totalUncovered = analysis.uncovered.length;
    const totalPartial = analysis.partiallyTested.length;
    const totalEffort = [...phase1, ...phase2, ...phase3].reduce(
      (sum, f) => sum + f.estimatedEffort,
      0,
    );

    console.log("📋 IMPLEMENTATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`🎯 Target: 100% test coverage`);
    console.log(`📊 Current: ~44% coverage`);
    console.log(`📁 Files needing work: ${totalUncovered + totalPartial}`);
    console.log(`⏱️  Estimated total effort: ${totalEffort} hours`);
    console.log(
      `📅 Recommended timeline: ${Math.ceil(totalEffort / 8)} working days`,
    );
    console.log("");

    console.log("🛠️  RECOMMENDED APPROACH:");
    console.log("1. Start with Phase 1 (critical files)");
    console.log("2. Use test templates from templates/test-templates/");
    console.log("3. Focus on one file type at a time");
    console.log("4. Run coverage after each phase");
    console.log("5. Aim for incremental improvements");
    console.log("");

    // Save detailed plan
    this.savePlan(analysis);
  }

  generateTestFileRecommendations(analysis) {
    console.log("📝 TEST FILE RECOMMENDATIONS");
    console.log("=".repeat(60));

    const recommendations = [];

    // Group by file type for better organization
    const byType = {};
    analysis.uncovered.forEach((file) => {
      if (!byType[file.type]) byType[file.type] = [];
      byType[file.type].push(file);
    });

    Object.entries(byType).forEach(([type, files]) => {
      console.log(`\n${type.toUpperCase()} FILES (${files.length}):`);
      files.slice(0, 10).forEach((file) => {
        const testPath = this.suggestTestPath(file.path);
        console.log(`  ${file.path} → ${testPath}`);
        recommendations.push({
          sourceFile: file.path,
          testFile: testPath,
          type: file.type,
          priority: file.priority,
          effort: file.estimatedEffort,
        });
      });
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more files`);
      }
    });

    return recommendations;
  }

  suggestTestPath(sourcePath) {
    const dir = path.dirname(sourcePath);
    const filename = path.basename(sourcePath, path.extname(sourcePath));
    const ext = path.extname(sourcePath);

    // Check if __tests__ directory exists or should be created
    const testDir = path.join(dir, "__tests__");
    const testFile = `${filename}.test${ext}`;

    return path.join(testDir, testFile).replace(/\\/g, "/");
  }

  savePlan(analysis) {
    const planPath = path.join(this.coverageDir, "improvement-plan.json");
    const plan = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles:
          analysis.uncovered.length +
          analysis.partiallyTested.length +
          analysis.wellTested.length +
          analysis.fullyTested.length,
        uncovered: analysis.uncovered.length,
        partiallyTested: analysis.partiallyTested.length,
        wellTested: analysis.wellTested.length,
        fullyTested: analysis.fullyTested.length,
      },
      phases: {
        phase1: analysis.uncovered.filter((f) => f.priority >= 4).slice(0, 20),
        phase2: analysis.uncovered
          .filter((f) => f.priority >= 3 && f.priority < 4)
          .slice(0, 30),
        phase3: analysis.partiallyTested.slice(0, 20),
      },
      allUncovered: analysis.uncovered,
      partiallyTested: analysis.partiallyTested,
    };

    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
    console.log(`💾 Detailed improvement plan saved to: ${planPath}`);
  }
}

// Run the plan generator
if (require.main === module) {
  const planner = new CoverageImprovementPlan();
  planner.generatePlan().catch(console.error);
}

module.exports = CoverageImprovementPlan;
