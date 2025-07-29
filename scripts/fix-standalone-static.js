// Standalone buildの静的ファイル問題を修正するスクリプト
const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function fixStandaloneStatic() {
  console.log("=== Standalone静的ファイル修正 ===\n");

  const standaloneDir = path.join(process.cwd(), ".next", "standalone");
  const buildDir = path.join(process.cwd(), ".next");

  // 1. .next/static を .next/standalone/.next/static にコピー
  const staticSrc = path.join(buildDir, "static");
  const staticDest = path.join(standaloneDir, ".next", "static");

  console.log("1. 静的ファイルをコピー中...");
  console.log(`From: ${staticSrc}`);
  console.log(`To: ${staticDest}`);

  if (fs.existsSync(staticSrc)) {
    copyRecursiveSync(staticSrc, staticDest);
    console.log("✓ 静的ファイルのコピー完了");
  } else {
    console.log("✗ 静的ファイルのソースが見つかりません");
  }

  // 2. server.js の静的ファイル配信設定を確認
  const serverJsPath = path.join(standaloneDir, "server.js");
  if (fs.existsSync(serverJsPath)) {
    console.log("✓ server.js が存在します");
  } else {
    console.log("✗ server.js が見つかりません");
  }

  // 3. 必要なディレクトリ構造を作成
  const requiredDirs = [
    path.join(standaloneDir, ".next", "static", "chunks"),
    path.join(standaloneDir, ".next", "static", "css"),
    path.join(standaloneDir, ".next", "static", "media"),
  ];

  console.log("\n2. 必要なディレクトリ構造を確認中...");
  requiredDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ ディレクトリ作成: ${dir}`);
    } else {
      console.log(`✓ ディレクトリ存在: ${dir}`);
    }
  });

  // 4. 静的ファイルの存在確認
  console.log("\n3. 重要な静的ファイルの確認...");
  const importantFiles = [
    path.join(staticDest, "chunks"),
    path.join(staticDest, "css"),
  ];

  importantFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const files = fs.readdirSync(filePath);
      console.log(`✓ ${path.basename(filePath)}: ${files.length}個のファイル`);
    } else {
      console.log(`✗ ${path.basename(filePath)}: 見つかりません`);
    }
  });

  console.log("\n=== 修正完了 ===");
}

fixStandaloneStatic();
