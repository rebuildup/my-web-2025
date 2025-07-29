// 最終的なhydration問題の詳細調査
const http = require("http");

async function debugFinalHydration() {
  console.log("=== 最終Hydration問題調査 ===\n");

  // 1. 現在のページ状態を詳細分析
  console.log("1. ページ状態詳細分析");
  await analyzePageState();

  // 2. APIデータの確認
  console.log("\n2. APIデータ確認");
  await checkAPIData();

  // 3. 環境変数の最終確認
  console.log("\n3. 環境変数最終確認");
  await checkEnvironmentInBrowser();

  console.log("\n=== 調査完了 ===");
}

async function analyzePageState() {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/portfolio/gallery/all",
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`  ページ分析結果:`);
        console.log(`    ステータス: ${res.statusCode}`);
        console.log(`    Content-Length: ${data.length}`);

        // 重要な要素の存在確認
        const hasNextData = data.includes("__NEXT_DATA__");
        const hasNextScript = data.includes("/_next/static/chunks/");
        const hasReactRoot = data.includes("__next");
        const hasPortfolioData = data.includes("AllGalleryClient");
        const hasInitialItems = data.includes("initialItems");
        const hasSearchFilters = data.includes("searchFilters");

        console.log(`    __NEXT_DATA__: ${hasNextData ? "あり" : "なし"}`);
        console.log(`    Next.js scripts: ${hasNextScript ? "あり" : "なし"}`);
        console.log(`    React root: ${hasReactRoot ? "あり" : "なし"}`);
        console.log(
          `    AllGalleryClient: ${hasPortfolioData ? "あり" : "なし"}`
        );
        console.log(`    initialItems: ${hasInitialItems ? "あり" : "なし"}`);
        console.log(`    searchFilters: ${hasSearchFilters ? "あり" : "なし"}`);

        // Server-Side Rendering の確認
        const hasSSRContent =
          data.includes("All Projects") && data.includes("フィルター");
        console.log(`    SSR Content: ${hasSSRContent ? "あり" : "なし"}`);

        // エラーメッセージの詳細確認
        if (data.includes("error") || data.includes("Error")) {
          console.log(`    ⚠ エラーメッセージ検出:`);

          // 具体的なエラーを抽出
          const errorPatterns = [
            /Error: [^<\n]*/g,
            /TypeError: [^<\n]*/g,
            /ReferenceError: [^<\n]*/g,
            /SyntaxError: [^<\n]*/g,
          ];

          errorPatterns.forEach((pattern, index) => {
            const matches = data.match(pattern);
            if (matches) {
              console.log(
                `      パターン${index + 1}: ${matches.slice(0, 2).join(", ")}`
              );
            }
          });
        }

        // React Streaming の確認
        const hasStreaming = data.includes("self.__next_f.push");
        console.log(`    React Streaming: ${hasStreaming ? "あり" : "なし"}`);

        if (hasStreaming) {
          // Streaming データの分析
          const streamingMatches = data.match(
            /self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g
          );
          if (streamingMatches) {
            console.log(`    Streaming chunks: ${streamingMatches.length}個`);

            // 最初のchunkを分析
            try {
              const firstChunk = streamingMatches[0];
              const chunkData = firstChunk.match(
                /self\.__next_f\.push\(\[1,"([^"]+)"\]\)/
              );
              if (chunkData && chunkData[1]) {
                const decodedChunk = chunkData[1].replace(/\\"/g, '"');
                console.log(
                  `    First chunk preview: ${decodedChunk.substring(0, 100)}...`
                );
              }
            } catch (e) {
              console.log(`    Chunk analysis error: ${e.message}`);
            }
          }
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  ページ分析エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`  ページ分析タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function checkAPIData() {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/content/portfolio?limit=100",
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`  API状態:`);
          console.log(`    ステータス: ${res.statusCode}`);
          console.log(`    成功: ${jsonData.success}`);
          console.log(`    データ数: ${jsonData.data?.length || 0}`);

          if (jsonData.data && jsonData.data.length > 0) {
            const firstItem = jsonData.data[0];
            console.log(`    最初のアイテム:`);
            console.log(`      ID: ${firstItem.id}`);
            console.log(`      タイトル: ${firstItem.title}`);
            console.log(`      ステータス: ${firstItem.status}`);
            console.log(`      サムネイル: ${firstItem.thumbnail || "なし"}`);
            console.log(`      カテゴリ: ${firstItem.category}`);
          }
        } catch (error) {
          console.log(`  API JSONパースエラー: ${error.message}`);
        }
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  API確認エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  API確認タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function checkEnvironmentInBrowser() {
  // ブラウザ環境変数チェック用のテストページを作成
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/health",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`  環境確認:`);
        console.log(
          `    Health API: ${res.statusCode === 200 ? "正常" : "エラー"}`
        );
        console.log(`    Node.js環境: ${process.env.NODE_ENV || "未設定"}`);
        console.log(
          `    Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || "未設定"}`
        );
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  環境確認エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  環境確認タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

debugFinalHydration();
