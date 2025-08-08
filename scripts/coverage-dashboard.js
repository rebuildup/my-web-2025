#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { analyzeCoverage } = require("./analyze-coverage");
const { CoverageMonitor } = require("./coverage-monitoring");

/**
 * 統合カバレッジダッシュボード
 * テストファイル存在分析と実際のカバレッジ分析を統合
 */

class CoverageDashboard {
  constructor() {
    this.monitor = new CoverageMonitor();
  }

  /**
   * 統合ダッシュボードを生成
   */
  async generateDashboard() {
    console.log("🚀 統合カバレッジダッシュボードを生成中...\n");

    try {
      // 1. テストファイル存在分析
      console.log("📋 Step 1: テストファイル存在分析");
      const fileAnalysis = analyzeCoverage();

      // 2. 実際のカバレッジ分析
      console.log("\n📊 Step 2: 実際のカバレッジ分析");
      const coverageData = await this.monitor.getCoverageData();

      // 3. 統合レポート生成
      console.log("\n📈 Step 3: 統合レポート生成");
      this.generateIntegratedReport(fileAnalysis, coverageData);

      // 4. 実行計画生成
      console.log("\n📋 Step 4: 実行計画生成");
      this.generateActionPlan(fileAnalysis, coverageData);

      // 5. データ保存
      this.saveDashboardData(fileAnalysis, coverageData);
    } catch (error) {
      console.error("❌ ダッシュボード生成でエラーが発生:", error.message);
      process.exit(1);
    }
  }

  /**
   * 統合レポートを生成
   */
  generateIntegratedReport(fileAnalysis, coverageData) {
    console.log("=".repeat(80));
    console.log("📊 統合テストカバレッジレポート");
    console.log("=".repeat(80));
    console.log(`📅 生成日時: ${new Date().toLocaleString("ja-JP")}\n`);

    // ファイル存在統計
    console.log("📁 テストファイル存在統計:");
    console.log(`   総ファイル数: ${fileAnalysis.summary.totalFiles}`);
    console.log(
      `   テスト済み: ${fileAnalysis.summary.testedFiles} (${fileAnalysis.summary.coveragePercentage.toFixed(1)}%)`,
    );
    console.log(
      `   未テスト: ${fileAnalysis.summary.untestedFiles} (${(100 - fileAnalysis.summary.coveragePercentage).toFixed(1)}%)`,
    );
    console.log();

    // 実際のカバレッジ統計
    console.log("📈 実際のカバレッジ統計:");
    const { summary } = coverageData;
    console.log(
      `   Statements: ${summary.statements.percentage.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`,
    );
    console.log(
      `   Branches: ${summary.branches.percentage.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`,
    );
    console.log(
      `   Functions: ${summary.functions.percentage.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`,
    );
    console.log(
      `   Lines: ${summary.lines.percentage.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`,
    );
    console.log();

    // ファイルタイプ別詳細
    console.log("📋 ファイルタイプ別詳細:");
    Object.entries(fileAnalysis.typeStats).forEach(([type, stats]) => {
      const percentage = ((stats.tested / stats.total) * 100).toFixed(1);
      const status =
        stats.tested === stats.total
          ? "✅"
          : stats.tested > stats.total * 0.5
            ? "🟡"
            : "❌";
      console.log(
        `   ${status} ${type.padEnd(12)}: ${stats.tested}/${stats.total} (${percentage}%)`,
      );
    });
    console.log();

    // ギャップ分析
    this.generateGapAnalysis(fileAnalysis, coverageData);
  }

  /**
   * ギャップ分析を生成
   */
  generateGapAnalysis(fileAnalysis, coverageData) {
    console.log("🔍 ギャップ分析:");

    const fileExistenceRate = fileAnalysis.summary.coveragePercentage;
    const actualCoverageRate = coverageData.summary.statements.percentage;

    console.log(`   テストファイル存在率: ${fileExistenceRate.toFixed(1)}%`);
    console.log(`   実際のカバレッジ率: ${actualCoverageRate.toFixed(1)}%`);

    const gap = fileExistenceRate - actualCoverageRate;
    if (gap > 10) {
      console.log(`   ⚠️  大きなギャップを検出: ${gap.toFixed(1)}%`);
      console.log(`   → 既存テストの品質向上が必要です`);
    } else if (gap > 0) {
      console.log(`   📊 適度なギャップ: ${gap.toFixed(1)}%`);
      console.log(`   → テストの充実度向上が推奨されます`);
    } else {
      console.log(`   ✅ 良好な一致率です`);
    }
    console.log();
  }

  /**
   * 実行計画を生成
   */
  generateActionPlan(fileAnalysis, coverageData) {
    console.log("📋 実行計画:");
    console.log("-".repeat(50));

    // Phase 1: 未テストファイルの緊急対応
    const highPriorityFiles = fileAnalysis.untestedFiles
      .filter((f) => f.priority >= 7)
      .slice(0, 10);

    if (highPriorityFiles.length > 0) {
      console.log("🔥 Phase 1: 緊急対応 (高優先度ファイル)");
      highPriorityFiles.forEach((file, index) => {
        console.log(
          `   ${index + 1}. ${file.path} (${file.type}, ${file.complexity})`,
        );
      });
      console.log(
        `   推定時間: ${highPriorityFiles.reduce((sum, f) => sum + f.estimatedEffort, 0)} 時間\n`,
      );
    }

    // Phase 2: 低カバレッジファイルの改善
    const lowCoverageFiles = coverageData.files
      .filter(
        (f) => f.statements.percentage < 50 && f.statements.percentage > 0,
      )
      .sort((a, b) => a.statements.percentage - b.statements.percentage)
      .slice(0, 10);

    if (lowCoverageFiles.length > 0) {
      console.log("📈 Phase 2: 既存テストの改善 (低カバレッジファイル)");
      lowCoverageFiles.forEach((file, index) => {
        console.log(
          `   ${index + 1}. ${file.path} (${file.statements.percentage.toFixed(1)}%)`,
        );
      });
      console.log(`   推定時間: ${lowCoverageFiles.length * 2} 時間\n`);
    }

    // Phase 3: 100%達成のための最終調整
    console.log("🎯 Phase 3: 100%カバレッジ達成");
    console.log(
      `   残り未テストファイル: ${fileAnalysis.summary.untestedFiles} ファイル`,
    );
    console.log(`   推定総時間: ${fileAnalysis.summary.estimatedEffort} 時間`);
    console.log(
      `   推奨実装期間: ${Math.ceil(fileAnalysis.summary.estimatedEffort / 40)} 週間 (週40時間想定)\n`,
    );

    // 次のアクション
    console.log("🚀 次のアクション:");
    if (highPriorityFiles.length > 0) {
      console.log(`   1. ${highPriorityFiles[0].path} のテスト作成から開始`);
      console.log(`   2. npm run test:coverage:monitor で進捗確認`);
      console.log(`   3. 毎日の進捗をトラッキング`);
    } else {
      console.log(`   1. 既存テストの品質向上に注力`);
      console.log(`   2. カバレッジ率の向上を目指す`);
    }
    console.log();
  }

  /**
   * ダッシュボードデータを保存
   */
  saveDashboardData(fileAnalysis, coverageData) {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      fileAnalysis,
      coverageData,
      summary: {
        fileExistenceRate: fileAnalysis.summary.coveragePercentage,
        actualCoverageRate: coverageData.summary.statements.percentage,
        gap:
          fileAnalysis.summary.coveragePercentage -
          coverageData.summary.statements.percentage,
        totalFiles: fileAnalysis.summary.totalFiles,
        testedFiles: fileAnalysis.summary.testedFiles,
        untestedFiles: fileAnalysis.summary.untestedFiles,
        estimatedEffort: fileAnalysis.summary.estimatedEffort,
      },
    };

    fs.writeFileSync(
      "coverage-dashboard.json",
      JSON.stringify(dashboardData, null, 2),
    );
    console.log(
      "💾 ダッシュボードデータを coverage-dashboard.json に保存しました",
    );
  }

  /**
   * 履歴比較
   */
  showProgress() {
    const dashboardFile = "coverage-dashboard.json";
    const historyFile = "coverage-history.json";

    if (!fs.existsSync(dashboardFile)) {
      console.log("📊 ダッシュボードデータがありません");
      return;
    }

    try {
      const current = JSON.parse(fs.readFileSync(dashboardFile, "utf8"));

      console.log("📈 進捗レポート");
      console.log("=".repeat(50));
      console.log(
        `現在の状況 (${new Date(current.timestamp).toLocaleString("ja-JP")}):`,
      );
      console.log(
        `  テストファイル存在率: ${current.summary.fileExistenceRate.toFixed(1)}%`,
      );
      console.log(
        `  実際のカバレッジ率: ${current.summary.actualCoverageRate.toFixed(1)}%`,
      );
      console.log(
        `  未テストファイル: ${current.summary.untestedFiles} ファイル`,
      );
      console.log(`  推定残り時間: ${current.summary.estimatedEffort} 時間`);

      // 履歴との比較
      if (fs.existsSync(historyFile)) {
        const history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
        if (history.length > 1) {
          const previous = history[history.length - 2];
          const coverageImprovement =
            current.summary.actualCoverageRate -
            previous.summary.statements.percentage;

          console.log(`\n📊 前回からの変化:`);
          console.log(
            `  カバレッジ向上: ${coverageImprovement > 0 ? "+" : ""}${coverageImprovement.toFixed(2)}%`,
          );
        }
      }
    } catch (error) {
      console.error("❌ 進捗データの読み込みに失敗:", error.message);
    }
  }
}

// CLI実行
if (require.main === module) {
  const dashboard = new CoverageDashboard();
  const command = process.argv[2];

  switch (command) {
    case "progress":
      dashboard.showProgress();
      break;
    case "dashboard":
    default:
      dashboard.generateDashboard();
      break;
  }
}

module.exports = { CoverageDashboard };
