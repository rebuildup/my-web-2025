// Standalone buildの静的ファイル配信を完全に修正するスクリプト
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

function fixStandaloneFinal() {
  console.log("=== Standalone Build 完全修正 ===\n");

  const buildDir = path.join(process.cwd(), ".next");
  const standaloneDir = path.join(process.cwd(), ".next", "standalone");

  // 1. 既存の静的ファイルを削除
  const existingStaticDir = path.join(standaloneDir, ".next", "static");
  if (fs.existsSync(existingStaticDir)) {
    console.log("1. 既存の静的ファイルを削除中...");
    fs.rmSync(existingStaticDir, { recursive: true, force: true });
    console.log("✓ 削除完了");
  }

  // 2. .next/static を完全にコピー
  const staticSrc = path.join(buildDir, "static");
  const staticDest = path.join(standaloneDir, ".next", "static");

  console.log("2. 静的ファイルを完全コピー中...");
  console.log(`From: ${staticSrc}`);
  console.log(`To: ${staticDest}`);

  if (fs.existsSync(staticSrc)) {
    copyRecursiveSync(staticSrc, staticDest);
    console.log("✓ 静的ファイルのコピー完了");
  } else {
    console.log("✗ 静的ファイルのソースが見つかりません");
    return false;
  }

  // 3. server.js の静的ファイル配信設定を確認・修正
  console.log("\n3. server.js の静的ファイル配信設定を修正中...");
  const serverJsPath = path.join(standaloneDir, "server.js");

  if (fs.existsSync(serverJsPath)) {
    let serverContent = fs.readFileSync(serverJsPath, "utf-8");

    // 静的ファイル配信の設定を確認
    if (!serverContent.includes("/_next/static")) {
      console.log("⚠ server.js に静的ファイル配信設定が見つかりません");

      // 基本的な静的ファイル配信設定を追加
      const staticServeCode = `
// Static file serving for standalone build
const express = require('express');
const path = require('path');

// Serve static files from .next/static
app.use('/_next/static', express.static(path.join(__dirname, '.next/static'), {
  maxAge: '1y',
  immutable: true
}));

// Serve public files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d'
}));
`;

      // server.jsの適切な場所に挿入
      const insertPoint = serverContent.indexOf(
        "const server = http.createServer",
      );
      if (insertPoint !== -1) {
        serverContent =
          serverContent.slice(0, insertPoint) +
          staticServeCode +
          serverContent.slice(insertPoint);
        fs.writeFileSync(serverJsPath, serverContent);
        console.log("✓ server.js に静的ファイル配信設定を追加しました");
      } else {
        console.log("⚠ server.js の適切な挿入点が見つかりませんでした");
      }
    } else {
      console.log("✓ server.js に静的ファイル配信設定が含まれています");
    }
  } else {
    console.log("✗ server.js が見つかりません");
    return false;
  }

  // 4. 重要なファイルの存在確認
  console.log("\n4. 重要なファイルの存在確認...");
  const importantFiles = [
    "chunks/webpack-69783b0786f1abce.js",
    "chunks/ui-a489402f9e1db3d9.js",
    "chunks/vendors-f69bbce6435507a3.js",
    "css/cc3ed86401a250b4.css",
  ];

  let allFilesExist = true;
  importantFiles.forEach((file) => {
    const filePath = path.join(staticDest, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✓ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`  ✗ ${file} (見つからない)`);
      allFilesExist = false;
    }
  });

  // 5. ディレクトリ構造の確認
  console.log("\n5. ディレクトリ構造確認...");
  const checkDirs = [
    path.join(staticDest, "chunks"),
    path.join(staticDest, "css"),
    path.join(staticDest, "media"),
  ];

  checkDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      console.log(`  ✓ ${path.basename(dir)}: ${files.length}個のファイル`);
    } else {
      console.log(`  ✗ ${path.basename(dir)}: ディレクトリが存在しません`);
    }
  });

  console.log("\n=== 修正完了 ===");
  return allFilesExist;
}

const success = fixStandaloneFinal();
if (success) {
  console.log("✓ すべての修正が完了しました。サーバーを再起動してください。");
} else {
  console.log(
    "⚠ 一部の修正に問題がありました。ビルドを再実行することをお勧めします。",
  );
}
