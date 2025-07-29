// React Streaming問題の詳細調査
const http = require("http");

async function debugStreamingIssue() {
  console.log("=== React Streaming問題調査 ===\n");

  // 1. ページの完全なHTMLを取得して分析
  console.log("1. 完全なHTML分析");
  await analyzeCompleteHTML();

  // 2. Streaming chunksの詳細分析
  console.log("\n2. Streaming chunks詳細分析");
  await analyzeStreamingChunks();

  console.log("\n=== 調査完了 ===");
}

async function analyzeCompleteHTML() {
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
        console.log(`  HTML分析結果:`);
        console.log(`    Total length: ${data.length} bytes`);

        // HTMLの構造を詳細分析
        const hasHtml = data.includes("<html");
        const hasHead = data.includes("<head");
        const hasBody = data.includes("<body");
        const hasMain = data.includes("<main");
        const hasNextRoot = data.includes('id="__next"');

        console.log(`    HTML structure:`);
        console.log(`      <html>: ${hasHtml}`);
        console.log(`      <head>: ${hasHead}`);
        console.log(`      <body>: ${hasBody}`);
        console.log(`      <main>: ${hasMain}`);
        console.log(`      __next root: ${hasNextRoot}`);

        // React関連の要素
        const reactElements = [
          "AllGalleryClient",
          "initialItems",
          "searchFilters",
          "PortfolioCard",
          "FilterBar",
          "SortControls",
          "All Projects",
          "フィルター",
          "projects",
        ];

        console.log(`    React elements:`);
        reactElements.forEach((element) => {
          const found = data.includes(element);
          console.log(`      ${element}: ${found ? "✓" : "✗"}`);
        });

        // エラーメッセージの詳細検索
        const errorKeywords = [
          "Error",
          "TypeError",
          "ReferenceError",
          "SyntaxError",
          "failed",
          "undefined",
          "null",
        ];

        console.log(`    Error analysis:`);
        errorKeywords.forEach((keyword) => {
          const regex = new RegExp(keyword, "gi");
          const matches = data.match(regex);
          if (matches && matches.length > 0) {
            console.log(`      ${keyword}: ${matches.length} occurrences`);

            // エラーの文脈を抽出
            const contextRegex = new RegExp(`.{0,50}${keyword}.{0,50}`, "gi");
            const contexts = data.match(contextRegex);
            if (contexts) {
              contexts.slice(0, 2).forEach((context, index) => {
                console.log(
                  `        ${index + 1}: "${context.replace(/\n/g, " ")}"`,
                );
              });
            }
          }
        });

        // Streaming データの分析
        const streamingPattern = /self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g;
        const streamingMatches = [...data.matchAll(streamingPattern)];

        console.log(`    Streaming analysis:`);
        console.log(`      Total chunks: ${streamingMatches.length}`);

        if (streamingMatches.length > 0) {
          streamingMatches.slice(0, 3).forEach((match, index) => {
            try {
              const chunkData = match[1];
              const decoded = chunkData
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
              console.log(
                `      Chunk ${index + 1} preview: "${decoded.substring(0, 100)}..."`,
              );

              // チャンクにReactコンポーネントが含まれているかチェック
              const hasComponent =
                decoded.includes("AllGalleryClient") ||
                decoded.includes("initialItems") ||
                decoded.includes("searchFilters");
              console.log(
                `      Chunk ${index + 1} has components: ${hasComponent}`,
              );
            } catch (e) {
              console.log(
                `      Chunk ${index + 1} decode error: ${e.message}`,
              );
            }
          });
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  HTML分析エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(15000, () => {
      console.log(`  HTML分析タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function analyzeStreamingChunks() {
  // 複数回リクエストして一貫性を確認
  console.log("  複数回リクエストでの一貫性確認:");

  for (let i = 1; i <= 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機

    const result = await quickPageCheck(i);
    console.log(`    Request ${i}: ${result}`);
  }
}

function quickPageCheck(requestNum) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/portfolio/gallery/all",
      method: "GET",
      headers: {
        Accept: "text/html",
        "Cache-Control": "no-cache",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const hasAllGalleryClient = data.includes("AllGalleryClient");
        const hasInitialItems = data.includes("initialItems");
        const hasStreamingChunks = data.includes("self.__next_f.push");
        const contentLength = data.length;

        resolve(
          `Status: ${res.statusCode}, Length: ${contentLength}, AllGalleryClient: ${hasAllGalleryClient}, InitialItems: ${hasInitialItems}, Streaming: ${hasStreamingChunks}`,
        );
      });
    });

    req.on("error", (error) => {
      resolve(`Error: ${error.message}`);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve("Timeout");
    });

    req.end();
  });
}

debugStreamingIssue();
