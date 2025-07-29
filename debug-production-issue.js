// 本番環境での問題を詳細にデバッグするスクリプト
const http = require("http");
const https = require("https");

async function debugProductionIssue() {
  console.log("=== 本番環境問題デバッグ ===\n");

  // 1. APIエンドポイントのテスト
  console.log("1. APIエンドポイントテスト");
  await testAPI("/api/content/portfolio?limit=100");

  // 2. 静的ファイルのテスト
  console.log("\n2. 静的ファイルテスト");
  await testStaticFile("/images/portfolio/blen-1753707599484-8a4y4d.png");

  // 3. ギャラリーページのテスト
  console.log("\n3. ギャラリーページテスト");
  await testPage("/portfolio/gallery/all");

  console.log("\n=== デバッグ完了 ===");
}

function testAPI(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Debug-Script",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`  API ${path}:`);
      console.log(`    ステータス: ${res.statusCode}`);
      console.log(`    Content-Type: ${res.headers["content-type"]}`);

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.headers["content-type"]?.includes("application/json")) {
            const jsonData = JSON.parse(data);
            console.log(`    データ数: ${jsonData.data?.length || 0}`);
            console.log(`    成功: ${jsonData.success}`);
            if (jsonData.data && jsonData.data.length > 0) {
              console.log(`    最初の項目: ${jsonData.data[0].title}`);
              console.log(
                `    サムネイル: ${jsonData.data[0].thumbnail || "なし"}`,
              );
            }
          } else {
            console.log(`    レスポンス長: ${data.length} bytes`);
            console.log(`    内容プレビュー: ${data.substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`    JSONパースエラー: ${error.message}`);
          console.log(`    生データ: ${data.substring(0, 200)}`);
        }
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  API ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`  API ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

function testStaticFile(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      console.log(`  静的ファイル ${path}:`);
      console.log(`    ステータス: ${res.statusCode}`);
      console.log(`    Content-Type: ${res.headers["content-type"]}`);
      console.log(`    Content-Length: ${res.headers["content-length"]}`);

      // データを読み捨て
      res.on("data", () => {});
      res.on("end", () => {
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  静的ファイル ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  静的ファイル ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

function testPage(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`  ページ ${path}:`);
      console.log(`    ステータス: ${res.statusCode}`);
      console.log(`    Content-Type: ${res.headers["content-type"]}`);

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`    HTML長: ${data.length} bytes`);

        // HTMLの内容を分析
        const hasReact = data.includes("__NEXT_DATA__");
        const hasCSS = data.includes("<style") || data.includes(".css");
        const hasJS = data.includes("<script");
        const hasPortfolioData =
          data.includes("portfolio") || data.includes("AllGalleryClient");

        console.log(`    React hydration: ${hasReact ? "あり" : "なし"}`);
        console.log(`    CSS: ${hasCSS ? "あり" : "なし"}`);
        console.log(`    JavaScript: ${hasJS ? "あり" : "なし"}`);
        console.log(
          `    ポートフォリオ関連: ${hasPortfolioData ? "あり" : "なし"}`,
        );

        // エラーメッセージの確認
        if (data.includes("error") || data.includes("Error")) {
          console.log(`    ⚠ エラーの可能性あり`);
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  ページ ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`  ページ ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

debugProductionIssue();
