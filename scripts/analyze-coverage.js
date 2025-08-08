#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * カバレッジ分析ツール
 * 現在のテストカバレッジを分析し、未テストファイルを特定する
 */

// 除外するファイルパターン
const EXCLUDE_PATTERNS = [
  /\.d\.ts$/,
  /\.stories\.(js|jsx|ts|tsx)$/,
  /\/index\.(js|jsx|ts|tsx)$/,
  /\/__tests__\//,
  /\.test\.(js|jsx|ts|tsx)$/,
  /\.spec\.(js|jsx|ts|tsx)$/,
  /node_modules/,
  /\.next/,
  /coverage/,
  /public/,
  /scripts/,
  /e2e/,
];

/**
 * srcディレクトリ内の全ファイルを取得
 */
function getAllSourceFiles(dir = "src", files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllSourceFiles(fullPath, files);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
      // 除外パターンをチェック
      const shouldExclude = EXCLUDE_PATTERNS.some((pattern) =>
        pattern.test(fullPath),
      );
      if (!shouldExclude) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * テストファイルが存在するかチェック
 */
function hasTestFile(sourceFile) {
  // Windowsパスを正規化
  const normalizedPath = sourceFile.replace(/\\/g, "/");

  const possibleTestPaths = [
    // 同じディレクトリの __tests__ フォルダ
    normalizedPath
      .replace(/\.(js|jsx|ts|tsx)$/, ".test.$1")
      .replace(/\/([^/]+)\.test\./, "/__tests__/$1.test."),
    normalizedPath
      .replace(/\.(js|jsx|ts|tsx)$/, ".spec.$1")
      .replace(/\/([^/]+)\.spec\./, "/__tests__/$1.spec."),

    // __tests__ ディレクトリ内（ルートレベル）
    normalizedPath
      .replace(/src\//, "__tests__/")
      .replace(/\.(js|jsx|ts|tsx)$/, ".test.$1"),
    normalizedPath
      .replace(/src\//, "__tests__/")
      .replace(/\.(js|jsx|ts|tsx)$/, ".spec.$1"),

    // 同じディレクトリ内
    normalizedPath.replace(/\.(js|jsx|ts|tsx)$/, ".test.$1"),
    normalizedPath.replace(/\.(js|jsx|ts|tsx)$/, ".spec.$1"),

    // より柔軟なパターン - ファイル名ベース
    ...generateFlexibleTestPaths(normalizedPath),
  ];

  // Windowsパスに戻して存在チェック
  return possibleTestPaths.some((testPath) => {
    const windowsPath = testPath.replace(/\//g, "\\");
    return fs.existsSync(testPath) || fs.existsSync(windowsPath);
  });
}

/**
 * より柔軟なテストパスを生成
 */
function generateFlexibleTestPaths(sourceFile) {
  const paths = [];
  const fileName = sourceFile
    .split("/")
    .pop()
    .replace(/\.(js|jsx|ts|tsx)$/, "");
  const extension = sourceFile.match(/\.(js|jsx|ts|tsx)$/)?.[1] || "ts";

  // 様々なテストファイルパターンを生成
  const testPatterns = [
    `${fileName}.test.${extension}`,
    `${fileName}.spec.${extension}`,
  ];

  // プロジェクト内の全ディレクトリでテストファイルを検索
  const searchDirs = ["src", "__tests__", "tests"];

  searchDirs.forEach((dir) => {
    testPatterns.forEach((pattern) => {
      // 再帰的にディレクトリを検索
      try {
        const found = findFileRecursively(dir, pattern);
        if (found.length > 0) {
          paths.push(...found);
        }
      } catch (error) {
        // ディレクトリが存在しない場合は無視
      }
    });
  });

  return paths;
}

/**
 * ファイルを再帰的に検索
 */
function findFileRecursively(dir, fileName) {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        results.push(...findFileRecursively(fullPath, fileName));
      } else if (item === fileName) {
        results.push(fullPath.replace(/\\/g, "/"));
      }
    }
  } catch (error) {
    // アクセス権限エラーなどは無視
  }

  return results;
}

/**
 * ファイルの複雑度を推定
 */
function estimateComplexity(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    const functions = (content.match(/function|const.*=.*=>|class/g) || [])
      .length;
    const conditionals = (content.match(/if|switch|for|while|\?/g) || [])
      .length;

    if (lines > 200 || functions > 10 || conditionals > 15) return "high";
    if (lines > 100 || functions > 5 || conditionals > 8) return "medium";
    return "low";
  } catch (error) {
    return "unknown";
  }
}

/**
 * ファイルタイプを判定
 */
function getFileType(filePath) {
  // Windowsパスの場合はスラッシュに統一
  const normalizedPath = filePath.replace(/\\/g, "/");

  if (normalizedPath.includes("/app/") && normalizedPath.includes("/page."))
    return "page";
  if (normalizedPath.includes("/app/") && normalizedPath.includes("/layout."))
    return "layout";
  if (normalizedPath.includes("/app/api/")) return "api";
  if (normalizedPath.includes("/components/")) return "component";
  if (normalizedPath.includes("/hooks/")) return "hook";
  if (normalizedPath.includes("/lib/")) return "utility";
  if (normalizedPath.includes("/types/")) return "type";
  return "other";
}

/**
 * 優先度を計算
 */
function calculatePriority(filePath, complexity, hasTest) {
  const type = getFileType(filePath);
  let priority = 5; // base priority

  // ファイルタイプによる調整
  const typeWeights = {
    api: 3,
    page: 2,
    component: 2,
    utility: 1,
    hook: 1,
    layout: 2,
    type: -1,
    other: 0,
  };

  priority += typeWeights[type] || 0;

  // 複雑度による調整
  const complexityWeights = {
    high: 3,
    medium: 1,
    low: 0,
    unknown: 0,
  };

  priority += complexityWeights[complexity] || 0;

  // 既存テストの有無による調整
  if (hasTest) {
    priority -= 2; // 既にテストがある場合は優先度を下げる
  }

  return Math.max(1, Math.min(10, priority));
}

/**
 * メイン分析関数
 */
function analyzeCoverage() {
  console.log("🔍 テストカバレッジ分析を開始します...\n");

  // 全ソースファイルを取得
  const sourceFiles = getAllSourceFiles();
  console.log(`📁 対象ファイル数: ${sourceFiles.length}`);

  // 未テストファイルを特定
  const untestedFiles = [];
  const testedFiles = [];

  for (const file of sourceFiles) {
    const hasTest = hasTestFile(file);
    const complexity = estimateComplexity(file);
    const type = getFileType(file);
    const priority = calculatePriority(file, complexity, hasTest);

    const fileInfo = {
      path: file,
      type,
      complexity,
      priority,
      hasTest,
      estimatedEffort:
        complexity === "high" ? 4 : complexity === "medium" ? 2 : 1,
    };

    if (hasTest) {
      testedFiles.push(fileInfo);
    } else {
      untestedFiles.push(fileInfo);
    }
  }

  // 結果をソート（優先度順）
  untestedFiles.sort((a, b) => b.priority - a.priority);

  // 統計情報
  const totalFiles = sourceFiles.length;
  const testedCount = testedFiles.length;
  const untestedCount = untestedFiles.length;
  const coveragePercentage = ((testedCount / totalFiles) * 100).toFixed(1);

  console.log("\n📊 テストカバレッジ統計:");
  console.log(`   総ファイル数: ${totalFiles}`);
  console.log(`   テスト済み: ${testedCount} (${coveragePercentage}%)`);
  console.log(
    `   未テスト: ${untestedCount} (${(100 - coveragePercentage).toFixed(1)}%)`,
  );

  // ファイルタイプ別統計
  const typeStats = {};
  sourceFiles.forEach((file) => {
    const type = getFileType(file);
    if (!typeStats[type]) typeStats[type] = { total: 0, tested: 0 };
    typeStats[type].total++;
    if (hasTestFile(file)) typeStats[type].tested++;
  });

  console.log("\n📋 ファイルタイプ別統計:");
  Object.entries(typeStats).forEach(([type, stats]) => {
    const percentage = ((stats.tested / stats.total) * 100).toFixed(1);
    console.log(`   ${type}: ${stats.tested}/${stats.total} (${percentage}%)`);
  });

  // 未テストファイル一覧（優先度順）
  if (untestedFiles.length > 0) {
    console.log("\n🚨 未テストファイル一覧 (優先度順):");
    untestedFiles.slice(0, 20).forEach((file, index) => {
      console.log(
        `   ${index + 1}. [P${file.priority}] ${file.path} (${file.type}, ${file.complexity})`,
      );
    });

    if (untestedFiles.length > 20) {
      console.log(`   ... 他 ${untestedFiles.length - 20} ファイル`);
    }
  }

  // 推定作業時間
  const totalEffort = untestedFiles.reduce(
    (sum, file) => sum + file.estimatedEffort,
    0,
  );
  console.log(`\n⏱️  推定作業時間: ${totalEffort} 時間`);

  // 優先度別の推奨順序
  const highPriority = untestedFiles.filter((f) => f.priority >= 7);
  const mediumPriority = untestedFiles.filter(
    (f) => f.priority >= 4 && f.priority < 7,
  );
  const lowPriority = untestedFiles.filter((f) => f.priority < 4);

  console.log("\n🎯 推奨実装順序:");
  console.log(
    `   高優先度: ${highPriority.length} ファイル (${highPriority.reduce((sum, f) => sum + f.estimatedEffort, 0)} 時間)`,
  );
  console.log(
    `   中優先度: ${mediumPriority.length} ファイル (${mediumPriority.reduce((sum, f) => sum + f.estimatedEffort, 0)} 時間)`,
  );
  console.log(
    `   低優先度: ${lowPriority.length} ファイル (${lowPriority.reduce((sum, f) => sum + f.estimatedEffort, 0)} 時間)`,
  );

  // JSONレポート出力
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      testedFiles: testedCount,
      untestedFiles: untestedCount,
      coveragePercentage: parseFloat(coveragePercentage),
      estimatedEffort: totalEffort,
    },
    typeStats,
    untestedFiles,
    testedFiles,
  };

  fs.writeFileSync("coverage-analysis.json", JSON.stringify(report, null, 2));
  console.log("\n💾 詳細レポートを coverage-analysis.json に保存しました");

  return report;
}

// スクリプトが直接実行された場合
if (require.main === module) {
  try {
    analyzeCoverage();
  } catch (error) {
    console.error("❌ 分析中にエラーが発生しました:", error.message);
    process.exit(1);
  }
}

module.exports = { analyzeCoverage };
