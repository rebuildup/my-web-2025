// 実際の静的ファイルパスをテストするスクリプト
const http = require("http");

async function testActualStaticFiles() {
  console.log("=== 実際の静的ファイルテスト ===\n");

  // HTMLから抽出された実際のファイルパス
  const actualPaths = [
    "/_next/static/css/cc3ed86401a250b4.css",
    "/_next/static/chunks/vendors-f69bbce6435507a3.js",
    "/_next/static/chunks/main-app-5bb0a82addfdc9aa.js",
    "/_next/static/chunks/app/layout-c3d8203b6f71603d.js",
    "/_next/static/chunks/ui-8b7c13ca5ea3da30.js",
    "/_next/static/chunks/webpack-7ce12a5216d413b4.js",
  ];

  console.log("実際のファイルパステスト:");
  for (const filePath of actualPaths) {
    await testStaticFile(filePath);
  }

  console.log("\n=== テスト完了 ===");
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
      const status = res.statusCode === 200 ? "✓" : "✗";
      const size = res.headers["content-length"] || "unknown";
      console.log(`  ${status} ${path} (${res.statusCode}) - ${size} bytes`);

      // データを読み捨て
      res.on("data", () => {});
      res.on("end", () => {
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`  ✗ ${path}: エラー - ${error.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`  ✗ ${path}: タイムアウト`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

testActualStaticFiles();
