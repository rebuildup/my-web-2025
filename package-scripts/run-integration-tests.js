#!/usr/bin/env node

/**
 * 統合テスト実行スクリプト
 * npm run test:integration で実行
 */

const { spawn } = require("child_process");
const path = require("path");

// テスト実行設定
const TEST_CONFIG = {
  // テストサーバーの起動確認
  serverUrl: "http://localhost:3000",
  serverStartTimeout: 30000,

  // テスト実行設定
  testTimeout: 300000, // 5分
  retryCount: 2,

  // 環境変数
  env: {
    ...process.env,
    NODE_ENV: "test",
    PLAYWRIGHT_BROWSERS_PATH: "./node_modules/playwright",
    TEST_PARALLEL: "1", // 統合テストは並列実行しない
  },
};

class IntegrationTestExecutor {
  constructor() {
    this.serverProcess = null;
    this.testProcess = null;
  }

  async execute() {
    console.log("🚀 Starting Portfolio System Integration Tests");
    console.log("=" * 50);

    try {
      // 1. 前提条件の確認
      await this.checkPrerequisites();

      // 2. テストサーバーの起動
      await this.startTestServer();

      // 3. サーバーの起動確認
      await this.waitForServer();

      // 4. 統合テストの実行
      await this.runIntegrationTests();

      console.log("✅ Integration tests completed successfully");
    } catch (error) {
      console.error("❌ Integration tests failed:", error.message);
      process.exit(1);
    } finally {
      // クリーンアップ
      await this.cleanup();
    }
  }

  async checkPrerequisites() {
    console.log("🔍 Checking prerequisites...");

    // Node.js バージョン確認
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
    if (majorVersion < 16) {
      throw new Error(`Node.js 16 or higher required. Current: ${nodeVersion}`);
    }

    // 必要なパッケージの確認
    const requiredPackages = ["@playwright/test", "playwright"];
    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
      } catch (error) {
        throw new Error(`Required package not found: ${pkg}. Run: npm install`);
      }
    }

    // テストファイルの存在確認
    const testFiles = [
      "./tests/integration/comprehensive-integration-test.js",
      "./tests/integration/test-runner.js",
    ];

    for (const file of testFiles) {
      try {
        require.resolve(path.resolve(file));
      } catch (error) {
        throw new Error(`Test file not found: ${file}`);
      }
    }

    console.log("✅ Prerequisites check passed");
  }

  async startTestServer() {
    console.log("🖥️ Starting test server...");

    return new Promise((resolve, reject) => {
      // Next.js 開発サーバーを起動
      this.serverProcess = spawn("npm", ["run", "dev"], {
        env: TEST_CONFIG.env,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let output = "";

      this.serverProcess.stdout.on("data", (data) => {
        output += data.toString();
        if (output.includes("ready") || output.includes("started server")) {
          console.log("✅ Test server started");
          resolve();
        }
      });

      this.serverProcess.stderr.on("data", (data) => {
        const error = data.toString();
        if (error.includes("Error") || error.includes("EADDRINUSE")) {
          reject(new Error(`Server startup failed: ${error}`));
        }
      });

      this.serverProcess.on("error", (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });

      // タイムアウト設定
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          reject(new Error("Server startup timeout"));
        }
      }, TEST_CONFIG.serverStartTimeout);
    });
  }

  async waitForServer() {
    console.log("⏳ Waiting for server to be ready...");

    const maxAttempts = 30;
    const delay = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${TEST_CONFIG.serverUrl}/api/health`);
        if (response.ok) {
          console.log("✅ Server is ready");
          return;
        }
      } catch (error) {
        // サーバーがまだ起動していない
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        process.stdout.write(".");
      }
    }

    throw new Error("Server failed to become ready within timeout period");
  }

  async runIntegrationTests() {
    console.log("🧪 Running integration tests...");

    return new Promise((resolve, reject) => {
      // Playwright テストを実行
      this.testProcess = spawn("node", ["./tests/integration/test-runner.js"], {
        env: TEST_CONFIG.env,
        stdio: "inherit",
      });

      this.testProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Tests failed with exit code: ${code}`));
        }
      });

      this.testProcess.on("error", (error) => {
        reject(new Error(`Test execution failed: ${error.message}`));
      });

      // テストタイムアウト
      setTimeout(() => {
        if (this.testProcess && !this.testProcess.killed) {
          this.testProcess.kill("SIGTERM");
          reject(new Error("Test execution timeout"));
        }
      }, TEST_CONFIG.testTimeout);
    });
  }

  async cleanup() {
    console.log("🧹 Cleaning up...");

    // テストプロセスの終了
    if (this.testProcess && !this.testProcess.killed) {
      this.testProcess.kill("SIGTERM");
    }

    // サーバープロセスの終了
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill("SIGTERM");

      // サーバーの完全終了を待機
      await new Promise((resolve) => {
        this.serverProcess.on("close", resolve);
        setTimeout(resolve, 5000); // 最大5秒待機
      });
    }

    console.log("✅ Cleanup completed");
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  const executor = new IntegrationTestExecutor();
  executor.execute();
}

module.exports = IntegrationTestExecutor;
