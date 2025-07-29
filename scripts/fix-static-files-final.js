// 最終的な静的ファイル修正スクリプト
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
        path.join(dest, childItemName),
      );
    });
  } else {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function fixStaticFilesFinal() {
  console.log("=== 最終静的ファイル修正 ===\n");

  const buildDir = path.join(process.cwd(), ".next");
  const standaloneDir = path.join(process.cwd(), ".next", "standalone");

  // 1. .next/static 全体を .next/standalone/.next/static にコピー
  const staticSrc = path.join(buildDir, "static");
  const staticDest = path.join(standaloneDir, ".next", "static");

  console.log("1. 静的ファイル全体をコピー中...");
  console.log(`From: ${staticSrc}`);
  console.log(`To: ${staticDest}`);

  if (fs.existsSync(staticSrc)) {
    // 既存のディレクトリを削除してから再作成
    if (fs.existsSync(staticDest)) {
      fs.rmSync(staticDest, { recursive: true, force: true });
    }

    copyRecursiveSync(staticSrc, staticDest);
    console.log("✓ 静的ファイルのコピー完了");

    // コピー後の確認
    const chunksDir = path.join(staticDest, "chunks");
    const cssDir = path.join(staticDest, "css");

    if (fs.existsSync(chunksDir)) {
      const chunkFiles = fs.readdirSync(chunksDir);
      console.log(`✓ chunks: ${chunkFiles.length}個のファイル`);

      // 重要なファイルの存在確認
      const importantFiles = [
        "vendors-f69bbce6435507a3.js",
        "main-app-5bb0a82addfdc9aa.js",
        "webpack-7ce12a5216d413b4.js",
      ];

      importantFiles.forEach((file) => {
        if (chunkFiles.includes(file)) {
          console.log(`  ✓ ${file} 存在`);
        } else {
          console.log(`  ✗ ${file} 見つからない`);
        }
      });
    }

    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      console.log(`✓ css: ${cssFiles.length}個のファイル`);
      cssFiles.forEach((file) => {
        console.log(`  - ${file}`);
      });
    }
  } else {
    console.log("✗ 静的ファイルのソースが見つかりません");
    return;
  }

  // 2. server.js の確認と修正
  console.log("\n2. server.js の確認...");
  const serverJsPath = path.join(standaloneDir, "server.js");

  if (fs.existsSync(serverJsPath)) {
    console.log("✓ server.js が存在します");

    // server.js の内容を確認（静的ファイル配信の設定）
    const serverContent = fs.readFileSync(serverJsPath, "utf-8");
    if (serverContent.includes("/_next/static")) {
      console.log("✓ server.js に静的ファイル配信設定が含まれています");
    } else {
      console.log("⚠ server.js に静的ファイル配信設定が見つかりません");
    }
  } else {
    console.log("✗ server.js が見つかりません");
  }

  // 3. 権限の確認
  console.log("\n3. ファイル権限の確認...");
  try {
    const testFile = path.join(
      staticDest,
      "chunks",
      "webpack-7ce12a5216d413b4.js",
    );
    if (fs.existsSync(testFile)) {
      const stats = fs.statSync(testFile);
      console.log(`✓ テストファイル読み取り可能 (${stats.size} bytes)`);
    }
  } catch (error) {
    console.log(`✗ ファイル権限エラー: ${error.message}`);
  }

  console.log("\n=== 修正完了 ===");
  console.log("本番サーバーを再起動してください");
}

fixStaticFilesFinal();
