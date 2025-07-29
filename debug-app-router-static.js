// App Router用の静的ファイルパス調査
const http = require("http");
const fs = require("fs");
const path = require("path");

async function debugAppRouterStatic() {
  console.log("=== App Router静的ファイル調査 ===\n");

  // 1. 実際の静的ファイル構造を確認
  console.log("1. 実際の静的ファイル構造確認");
  checkStaticFileStructure();

  // 2. 正しいパスでJavaScriptファイルをテスト
  console.log("\n2. 正しいパスでJavaScriptファイルテスト");
  await testCorrectJSPaths();

  // 3. HTMLから実際のスクリプトパスを抽出
  console.log("\n3. HTMLから実際のスクリプトパス抽出");
  await extractScriptPaths();

  console.log("\n=== 調査完了 ===");
}

function checkStaticFileStructure() {
  const staticDir = path.join(
    process.cwd(),
    ".next",
    "standalone",
    ".next",
    "static",
  );

  console.log(`  静的ファイルディレクトリ: ${staticDir}`);

  if (fs.existsSync(staticDir)) {
    console.log("  ✓ 静的ディレクトリ存在");

    // chunksディレクトリの内容を確認
    const chunksDir = path.join(staticDir, "chunks");
    if (fs.existsSync(chunksDir)) {
      const chunkFiles = fs.readdirSync(chunksDir);
      console.log(`  ✓ chunks: ${chunkFiles.length}個のファイル`);
      console.log("    主要ファイル:");
      chunkFiles.slice(0, 5).forEach((file) => {
        console.log(`      - ${file}`);
      });
    }

    // CSSディレクトリの内容を確認
    const cssDir = path.join(staticDir, "css");
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      console.log(`  ✓ css: ${cssFiles.length}個のファイル`);
      cssFiles.forEach((file) => {
        console.log(`      - ${file}`);
      });
    }
  } else {
    console.log("  ✗ 静的ディレクトリが存在しません");
  }
}

async function testCorrectJSPaths() {
  // App Routerの正しいパス形式をテスト
  const testPaths = [
    "/_next/static/chunks/webpack-*.js",
    "/_next/static/chunks/main-*.js",
    "/_next/static/chunks/app-*.js",
    "/_next/static/css/app.css",
  ];

  // 実際のファイル名を取得
  const staticDir = path.join(
    process.cwd(),
    ".next",
    "standalone",
    ".next",
    "static",
  );
  const chunksDir = path.join(staticDir, "chunks");
  const cssDir = path.join(staticDir, "css");

  let actualPaths = [];

  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir);
    chunkFiles.forEach((file) => {
      actualPaths.push(`/_next/static/chunks/${file}`);
    });
  }

  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach((file) => {
      actualPaths.push(`/_next/static/css/${file}`);
    });
  }

  // 最初の5個をテスト
  for (const testPath of actualPaths.slice(0, 5)) {
    await testStaticFile(testPath);
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
      console.log(`  ${path}:`);
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
      console.log(`  ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function extractScriptPaths() {
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
        console.log("  HTMLから抽出されたスクリプトパス:");

        // スクリプトタグを抽出
        const scriptMatches = data.match(/<script[^>]*src="([^"]*)"[^>]*>/g);
        if (scriptMatches) {
          scriptMatches.forEach((match, index) => {
            const srcMatch = match.match(/src="([^"]*)"/);
            if (srcMatch) {
              console.log(`    ${index + 1}. ${srcMatch[1]}`);
            }
          });
        } else {
          console.log("    スクリプトタグが見つかりませんでした");
        }

        // CSSリンクを抽出
        const cssMatches = data.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g);
        if (cssMatches) {
          console.log("  HTMLから抽出されたCSSパス:");
          cssMatches.forEach((match, index) => {
            const hrefMatch = match.match(/href="([^"]*)"/);
            if (hrefMatch) {
              console.log(`    ${index + 1}. ${hrefMatch[1]}`);
            }
          });
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  HTML抽出エラー: ${error.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`  HTML抽出タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

debugAppRouterStatic();
