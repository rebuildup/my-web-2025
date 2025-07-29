// React hydration問題の詳細調査
const http = require("http");
const fs = require("fs");

async function debugHydrationIssue() {
  console.log("=== React Hydration問題調査 ===\n");

  // 1. ギャラリーページのHTMLを詳細分析
  console.log("1. ギャラリーページHTML詳細分析");
  await analyzePageHTML("/portfolio/gallery/all");

  // 2. JavaScriptバンドルの確認
  console.log("\n2. JavaScriptバンドル確認");
  await checkJSBundles();

  // 3. 環境変数の設定確認
  console.log("\n3. 環境変数設定確認");
  checkEnvironmentVariables();

  console.log("\n=== 調査完了 ===");
}

function analyzePageHTML(path) {
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
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`  ページ分析結果:`);

        // Next.js関連の要素を確認
        const hasNextData = data.includes("__NEXT_DATA__");
        const hasNextScript = data.includes("/_next/static/chunks/");
        const hasReactRoot = data.includes("__next");
        const hasHydrationScript =
          data.includes("hydrate") || data.includes("hydrateRoot");

        console.log(`    __NEXT_DATA__: ${hasNextData ? "あり" : "なし"}`);
        console.log(`    Next.js scripts: ${hasNextScript ? "あり" : "なし"}`);
        console.log(`    React root: ${hasReactRoot ? "あり" : "なし"}`);
        console.log(
          `    Hydration script: ${hasHydrationScript ? "あり" : "なし"}`,
        );

        // エラーメッセージを探す
        const errorPatterns = [
          /error/gi,
          /Error/g,
          /failed/gi,
          /undefined/gi,
          /null/gi,
          /ReferenceError/gi,
          /TypeError/gi,
        ];

        console.log(`    エラーパターン検出:`);
        errorPatterns.forEach((pattern, index) => {
          const matches = data.match(pattern);
          if (matches && matches.length > 0) {
            console.log(
              `      パターン${index + 1} (${pattern}): ${matches.length}個`,
            );
            // 最初の数個のマッチを表示
            matches.slice(0, 3).forEach((match) => {
              const context = data.substring(
                Math.max(0, data.indexOf(match) - 50),
                data.indexOf(match) + match.length + 50,
              );
              console.log(`        "${context.replace(/\n/g, " ")}"`);
            });
          }
        });

        // __NEXT_DATA__の内容を確認
        if (hasNextData) {
          const nextDataMatch = data.match(
            /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s,
          );
          if (nextDataMatch) {
            try {
              const nextData = JSON.parse(nextDataMatch[1]);
              console.log(`    __NEXT_DATA__内容:`);
              console.log(`      buildId: ${nextData.buildId || "なし"}`);
              console.log(`      page: ${nextData.page || "なし"}`);
              console.log(
                `      props存在: ${nextData.props ? "あり" : "なし"}`,
              );
              if (nextData.props && nextData.props.pageProps) {
                console.log(
                  `      pageProps.initialItems: ${nextData.props.pageProps.initialItems?.length || 0}個`,
                );
                console.log(
                  `      pageProps.searchFilters: ${nextData.props.pageProps.searchFilters?.length || 0}個`,
                );
              }
            } catch (parseError) {
              console.log(
                `      __NEXT_DATA__パースエラー: ${parseError.message}`,
              );
            }
          }
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  HTML分析エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`  HTML分析タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function checkJSBundles() {
  // Next.js の静的ファイルをチェック
  const jsPaths = [
    "/_next/static/chunks/webpack.js",
    "/_next/static/chunks/main.js",
    "/_next/static/chunks/pages/_app.js",
    "/_next/static/chunks/pages/portfolio/gallery/all.js",
  ];

  for (const jsPath of jsPaths) {
    await testStaticFile(jsPath);
  }
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
      console.log(`  JS Bundle ${path}:`);
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
      console.log(`  JS Bundle ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  JS Bundle ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

function checkEnvironmentVariables() {
  console.log(`  本番環境変数の問題:`);
  console.log(
    `    NODE_ENV: ${process.env.NODE_ENV || "未設定"} (本番では'production'であるべき)`,
  );
  console.log(
    `    NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || "未設定"}`,
  );

  // 本番環境で必要な環境変数が設定されていない可能性
  if (!process.env.NODE_ENV) {
    console.log(`    ⚠ NODE_ENVが未設定 - これがhydration問題の原因の可能性`);
  }
}

debugHydrationIssue();
