// 本番環境APIテスト用スクリプト
const http = require("http");

function testProductionAPI() {
  console.log("=== 本番環境API直接テスト ===\n");

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/content/portfolio?limit=100",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    console.log(`ステータス: ${res.statusCode}`);
    console.log(`ヘッダー: ${JSON.stringify(res.headers)}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const jsonData = JSON.parse(data);
        console.log("レスポンス成功:");
        console.log("  データ数:", jsonData.data?.length || 0);
        console.log("  成功:", jsonData.success);
        if (jsonData.data && jsonData.data.length > 0) {
          console.log("  最初の項目:", jsonData.data[0].title);
        }
      } catch (error) {
        console.log("JSONパースエラー:", error.message);
        console.log("生データ:", data.substring(0, 200));
      }
    });
  });

  req.on("error", (error) => {
    console.error("リクエストエラー:", error.message);
  });

  req.setTimeout(5000, () => {
    console.error("リクエストタイムアウト");
    req.destroy();
  });

  req.end();
}

testProductionAPI();
