// 本番環境でのファイル存在確認スクリプト
const fs = require("fs");
const path = require("path");

function checkProductionFiles() {
  console.log("=== 本番環境ファイル確認 ===\n");

  // 1. ポートフォリオデータファイルの確認
  console.log("1. ポートフォリオデータファイル確認");
  const portfolioPaths = [
    path.join(process.cwd(), "public/data/content/portfolio.json"),
    path.join(
      process.cwd(),
      ".next/standalone/public/data/content/portfolio.json",
    ),
    path.join(__dirname, "../public/data/content/portfolio.json"),
  ];

  portfolioPaths.forEach((filePath, index) => {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        console.log(`  ✓ パス${index + 1}: ${filePath}`);
        console.log(`    データ数: ${data.length}`);
        console.log(
          `    Published数: ${data.filter((item) => item.status === "published").length}`,
        );
      } else {
        console.log(`  ✗ パス${index + 1}: ${filePath} (存在しない)`);
      }
    } catch (error) {
      console.log(
        `  ✗ パス${index + 1}: ${filePath} (エラー: ${error.message})`,
      );
    }
  });

  // 2. 画像ファイルの確認
  console.log("\n2. 画像ファイル確認");
  const imagePaths = [
    path.join(
      process.cwd(),
      "public/images/portfolio/blen-1753707599484-8a4y4d.png",
    ),
    path.join(
      process.cwd(),
      ".next/standalone/public/images/portfolio/blen-1753707599484-8a4y4d.png",
    ),
  ];

  imagePaths.forEach((filePath, index) => {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✓ 画像パス${index + 1}: ${filePath}`);
        console.log(`    サイズ: ${stats.size} bytes`);
      } else {
        console.log(`  ✗ 画像パス${index + 1}: ${filePath} (存在しない)`);
      }
    } catch (error) {
      console.log(
        `  ✗ 画像パス${index + 1}: ${filePath} (エラー: ${error.message})`,
      );
    }
  });

  // 3. Next.js ビルドファイルの確認
  console.log("\n3. Next.js ビルドファイル確認");
  const buildPaths = [
    path.join(process.cwd(), ".next/standalone/server.js"),
    path.join(
      process.cwd(),
      ".next/standalone/.next/server/app/portfolio/gallery/all/page.js",
    ),
    path.join(
      process.cwd(),
      ".next/standalone/.next/server/app/api/content/portfolio/route.js",
    ),
  ];

  buildPaths.forEach((filePath, index) => {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(
          `  ✓ ビルドファイル${index + 1}: 存在 (${stats.size} bytes)`,
        );
      } else {
        console.log(`  ✗ ビルドファイル${index + 1}: ${filePath} (存在しない)`);
      }
    } catch (error) {
      console.log(
        `  ✗ ビルドファイル${index + 1}: ${filePath} (エラー: ${error.message})`,
      );
    }
  });

  // 4. 環境変数の確認
  console.log("\n4. 環境変数確認");
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || "未設定"}`);
  console.log(
    `  NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || "未設定"}`,
  );
  console.log(`  PWD: ${process.cwd()}`);

  console.log("\n=== 確認完了 ===");
}

checkProductionFiles();
