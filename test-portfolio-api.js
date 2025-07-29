// ポートフォリオAPI動作テスト用スクリプト
const testPortfolioAPI = async () => {
  const baseURL = "http://localhost:3000";

  console.log("=== ポートフォリオAPI動作テスト ===\n");

  // 1. 既存データの取得テスト
  console.log("1. 既存データの取得テスト");
  try {
    const response = await fetch(`${baseURL}/api/content/portfolio?limit=100`);
    const data = await response.json();
    console.log("✓ データ取得成功:", data.data?.length || 0, "件");
    console.log("  最初のアイテム:", data.data?.[0]?.title || "なし");
  } catch (error) {
    console.log("✗ データ取得失敗:", error.message);
  }

  // 2. 新しいアイテムの作成テスト
  console.log("\n2. 新しいアイテムの作成テスト");
  const testItem = {
    id: `portfolio-test-${Date.now()}`,
    type: "portfolio",
    title: "テストポートフォリオアイテム",
    description: "API動作テスト用のアイテムです",
    category: "test",
    tags: ["test", "api"],
    status: "draft",
    priority: 50,
    createdAt: new Date().toISOString(),
    content:
      "# テストコンテンツ\n\nこれはテスト用のマークダウンコンテンツです。",
  };

  try {
    const response = await fetch(`${baseURL}/api/admin/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testItem),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✓ アイテム作成成功:", result.data?.title);
    } else {
      const error = await response.json();
      console.log("✗ アイテム作成失敗:", error.error);
    }
  } catch (error) {
    console.log("✗ アイテム作成エラー:", error.message);
  }

  // 3. 作成後のデータ確認
  console.log("\n3. 作成後のデータ確認");
  try {
    const response = await fetch(`${baseURL}/api/content/portfolio?limit=100`);
    const data = await response.json();
    const testItems =
      data.data?.filter((item) => item.category === "test") || [];
    console.log("✓ テストアイテム数:", testItems.length);
  } catch (error) {
    console.log("✗ データ確認失敗:", error.message);
  }

  console.log("\n=== テスト完了 ===");
};

// Node.js環境で実行
if (typeof window === "undefined") {
  testPortfolioAPI();
} else {
  // ブラウザ環境で実行
  testPortfolioAPI();
}
