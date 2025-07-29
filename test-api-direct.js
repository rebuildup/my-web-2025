// APIを直接テストするスクリプト
async function testAPI() {
  console.log("=== API直接テスト ===\n");

  const baseURL = "http://localhost:3000";

  try {
    // 1. 全データ取得テスト
    console.log("1. 全データ取得テスト (status=all)");
    const allResponse = await fetch(
      `${baseURL}/api/content/portfolio?status=all&limit=100`,
    );
    const allData = await allResponse.json();
    console.log("  ステータス:", allResponse.status);
    console.log("  データ数:", allData.data?.length || 0);
    console.log("  成功:", allData.success);

    // 2. Publishedのみ取得テスト
    console.log("\n2. Publishedのみ取得テスト (デフォルト)");
    const publishedResponse = await fetch(
      `${baseURL}/api/content/portfolio?limit=100`,
    );
    const publishedData = await publishedResponse.json();
    console.log("  ステータス:", publishedResponse.status);
    console.log("  データ数:", publishedData.data?.length || 0);
    console.log("  成功:", publishedData.success);

    if (publishedData.data && publishedData.data.length > 0) {
      console.log("  最初の3項目:");
      publishedData.data.slice(0, 3).forEach((item, index) => {
        console.log(`    ${index + 1}. ${item.title} (${item.status})`);
      });
    }

    // 3. 特定カテゴリ取得テスト
    console.log("\n3. 特定カテゴリ取得テスト (develop)");
    const categoryResponse = await fetch(
      `${baseURL}/api/content/portfolio?category=develop&limit=100`,
    );
    const categoryData = await categoryResponse.json();
    console.log("  ステータス:", categoryResponse.status);
    console.log("  データ数:", categoryData.data?.length || 0);
    console.log("  成功:", categoryData.success);
  } catch (error) {
    console.error("エラー:", error.message);
  }

  console.log("\n=== テスト完了 ===");
}

testAPI();
