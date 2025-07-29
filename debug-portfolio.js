// ポートフォリオデータの状態を確認するデバッグスクリプト
const fs = require("fs");
const path = require("path");

async function debugPortfolioData() {
  console.log("=== ポートフォリオデータ デバッグ ===\n");

  try {
    // 1. ファイルからデータを読み込み
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      "portfolio.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    console.log("1. ファイルからのデータ読み込み");
    console.log("  総アイテム数:", data.length);

    // 2. ステータス別の分布を確認
    const statusDistribution = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    console.log("  ステータス分布:", statusDistribution);

    // 3. publishedアイテムの詳細
    const publishedItems = data.filter((item) => item.status === "published");
    console.log("\n2. Publishedアイテム");
    console.log("  Published数:", publishedItems.length);
    console.log("  Published項目:");
    publishedItems.forEach((item, index) => {
      console.log(
        `    ${index + 1}. ${item.title} (${item.category}) - ${item.id}`
      );
    });

    // 4. カテゴリ別分布（publishedのみ）
    const categoryDistribution = publishedItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    console.log("\n3. Published項目のカテゴリ分布:", categoryDistribution);

    // 5. サムネイル画像の状態確認
    console.log("\n4. サムネイル画像の状態");
    publishedItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
      console.log(`     Thumbnail: ${item.thumbnail || "なし"}`);
      console.log(`     Images: ${(item.images || []).length}個`);
    });
  } catch (error) {
    console.error("エラー:", error.message);
  }

  console.log("\n=== デバッグ完了 ===");
}

debugPortfolioData();
