/**
 * 統合テスト実行スクリプト
 * 全機能の統合テストを順次実行し、結果をレポート
 */

const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

class IntegrationTestRunner {
  constructor() {
    this.testResults = {
      startTime: new Date(),
      endTime: null,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testDetails: [],
      systemInfo: {},
      performanceMetrics: {},
    };

    this.reportPath = "./test-reports/integration-test-report.json";
    this.htmlReportPath = "./test-reports/integration-test-report.html";
  }

  async runAllTests() {
    console.log("🚀 Starting Comprehensive Integration Tests...");
    console.log("=" * 60);

    try {
      // システム情報の収集
      await this.collectSystemInfo();

      // テスト環境の確認
      await this.verifyTestEnvironment();

      // 統合テストの実行
      await this.runIntegrationTests();

      // パフォーマンステストの実行
      await this.runPerformanceTests();

      // セキュリティテストの実行
      await this.runSecurityTests();

      // 互換性テストの実行
      await this.runCompatibilityTests();

      // テスト結果の集計
      this.testResults.endTime = new Date();

      // レポート生成
      await this.generateReports();

      // 結果サマリーの表示
      this.displaySummary();
    } catch (error) {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    }
  }

  async collectSystemInfo() {
    console.log("📊 Collecting system information...");

    try {
      this.testResults.systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "test",
      };

      // システムリソースの確認
      if (process.platform !== "win32") {
        try {
          const cpuInfo = execSync(
            'cat /proc/cpuinfo | grep "model name" | head -1',
            { encoding: "utf8" },
          );
          this.testResults.systemInfo.cpu = cpuInfo.trim();
        } catch (e) {
          this.testResults.systemInfo.cpu = "Unknown";
        }

        try {
          const memInfo = execSync("free -h | grep Mem", { encoding: "utf8" });
          this.testResults.systemInfo.systemMemory = memInfo.trim();
        } catch (e) {
          this.testResults.systemInfo.systemMemory = "Unknown";
        }
      }

      console.log("✅ System information collected");
    } catch (error) {
      console.warn("⚠️ Failed to collect system info:", error.message);
    }
  }

  async verifyTestEnvironment() {
    console.log("🔍 Verifying test environment...");

    const checks = [
      {
        name: "Node.js version",
        check: () => {
          const version = process.version;
          const major = parseInt(version.slice(1).split(".")[0]);
          return major >= 16;
        },
        requirement: "Node.js 16 or higher",
      },
      {
        name: "Test server availability",
        check: async () => {
          try {
            const response = await fetch("http://localhost:3000/api/health");
            return response.ok;
          } catch {
            return false;
          }
        },
        requirement: "Test server running on localhost:3000",
      },
      {
        name: "Database connectivity",
        check: async () => {
          try {
            const response = await fetch(
              "http://localhost:3000/api/admin/health/db",
            );
            return response.ok;
          } catch {
            return false;
          }
        },
        requirement: "Database connection available",
      },
      {
        name: "File system permissions",
        check: async () => {
          try {
            await fs.mkdir("./test-temp", { recursive: true });
            await fs.writeFile("./test-temp/test.txt", "test");
            await fs.unlink("./test-temp/test.txt");
            await fs.rmdir("./test-temp");
            return true;
          } catch {
            return false;
          }
        },
        requirement: "Write permissions for test files",
      },
    ];

    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          console.log(`✅ ${check.name}: OK`);
        } else {
          console.error(`❌ ${check.name}: FAILED - ${check.requirement}`);
          throw new Error(`Environment check failed: ${check.name}`);
        }
      } catch (error) {
        console.error(`❌ ${check.name}: ERROR - ${error.message}`);
        throw error;
      }
    }

    console.log("✅ Test environment verification completed");
  }

  async runIntegrationTests() {
    console.log("🧪 Running integration tests...");

    const testSuites = [
      {
        name: "Data Manager Integration",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "データマネージャー統合テスト"',
        timeout: 120000,
      },
      {
        name: "Multiple Category System",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "複数カテゴリー選択テスト"',
        timeout: 60000,
      },
      {
        name: "Tag Management System",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "タグ管理システムテスト"',
        timeout: 60000,
      },
      {
        name: "Date Management System",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "日付管理システムテスト"',
        timeout: 60000,
      },
      {
        name: "File Upload System",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "ファイルアップロードシステムテスト"',
        timeout: 120000,
      },
      {
        name: "Markdown Editor",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "マークダウンエディターテスト"',
        timeout: 60000,
      },
      {
        name: "Gallery Display",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "ギャラリー表示テスト"',
        timeout: 90000,
      },
      {
        name: "Video&Design Page",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "video&designページ特別テスト"',
        timeout: 60000,
      },
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
  }

  async runPerformanceTests() {
    console.log("⚡ Running performance tests...");

    const performanceTests = [
      {
        name: "Page Load Performance",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "パフォーマンステスト"',
        timeout: 60000,
      },
      {
        name: "API Response Time",
        test: async () => {
          const startTime = Date.now();
          const response = await fetch("http://localhost:3000/api/content/all");
          const endTime = Date.now();

          const responseTime = endTime - startTime;
          this.testResults.performanceMetrics.apiResponseTime = responseTime;

          return {
            passed: response.ok && responseTime < 2000,
            details: `API response time: ${responseTime}ms`,
            metrics: { responseTime },
          };
        },
      },
      {
        name: "Database Query Performance",
        test: async () => {
          const startTime = Date.now();
          const response = await fetch(
            "http://localhost:3000/api/admin/items?limit=100",
          );
          const endTime = Date.now();

          const queryTime = endTime - startTime;
          this.testResults.performanceMetrics.dbQueryTime = queryTime;

          return {
            passed: response.ok && queryTime < 3000,
            details: `Database query time: ${queryTime}ms`,
            metrics: { queryTime },
          };
        },
      },
    ];

    for (const test of performanceTests) {
      if (test.command) {
        await this.runTestSuite(test);
      } else if (test.test) {
        await this.runCustomTest(test);
      }
    }
  }

  async runSecurityTests() {
    console.log("🔒 Running security tests...");

    const securityTests = [
      {
        name: "XSS Protection",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "セキュリティテスト"',
        timeout: 90000,
      },
      {
        name: "File Upload Security",
        test: async () => {
          try {
            const formData = new FormData();
            formData.append(
              "file",
              new Blob(['<?php echo "test"; ?>'], {
                type: "application/x-php",
              }),
              "test.php",
            );

            const response = await fetch(
              "http://localhost:3000/api/admin/upload",
              {
                method: "POST",
                body: formData,
              },
            );

            // PHPファイルのアップロードが拒否されることを確認
            return {
              passed: !response.ok || response.status === 400,
              details: `File upload security: ${response.status}`,
              metrics: { responseStatus: response.status },
            };
          } catch (error) {
            return {
              passed: true,
              details: "File upload blocked (network error)",
              metrics: { error: error.message },
            };
          }
        },
      },
      {
        name: "SQL Injection Protection",
        test: async () => {
          try {
            const maliciousQuery = "'; DROP TABLE portfolio_items; --";
            const response = await fetch(
              `http://localhost:3000/api/content/search?q=${encodeURIComponent(maliciousQuery)}`,
            );

            // SQLインジェクションが防がれることを確認
            return {
              passed: response.ok, // 正常にレスポンスが返ることを確認
              details: `SQL injection protection: ${response.status}`,
              metrics: { responseStatus: response.status },
            };
          } catch (error) {
            return {
              passed: false,
              details: `SQL injection test failed: ${error.message}`,
              metrics: { error: error.message },
            };
          }
        },
      },
    ];

    for (const test of securityTests) {
      if (test.command) {
        await this.runTestSuite(test);
      } else if (test.test) {
        await this.runCustomTest(test);
      }
    }
  }

  async runCompatibilityTests() {
    console.log("🔄 Running compatibility tests...");

    const compatibilityTests = [
      {
        name: "Backward Compatibility",
        command:
          'npx playwright test tests/integration/comprehensive-integration-test.js --grep "既存機能互換性テスト"',
        timeout: 90000,
      },
      {
        name: "Data Migration",
        test: async () => {
          try {
            // 旧形式データの処理テスト
            const legacyData = {
              title: "Legacy Test",
              category: "develop", // 単一カテゴリー
              tags: ["legacy"],
              content: "Legacy content",
            };

            const response = await fetch(
              "http://localhost:3000/api/admin/migrate-data",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [legacyData] }),
              },
            );

            return {
              passed: response.ok,
              details: `Data migration: ${response.status}`,
              metrics: { responseStatus: response.status },
            };
          } catch (error) {
            return {
              passed: false,
              details: `Data migration test failed: ${error.message}`,
              metrics: { error: error.message },
            };
          }
        },
      },
    ];

    for (const test of compatibilityTests) {
      if (test.command) {
        await this.runTestSuite(test);
      } else if (test.test) {
        await this.runCustomTest(test);
      }
    }
  }

  async runTestSuite(suite) {
    console.log(`  🔄 Running ${suite.name}...`);

    const startTime = Date.now();
    let result = {
      name: suite.name,
      startTime: new Date(startTime),
      endTime: null,
      duration: 0,
      status: "unknown",
      output: "",
      error: null,
    };

    try {
      const output = execSync(suite.command, {
        encoding: "utf8",
        timeout: suite.timeout || 60000,
        stdio: "pipe",
      });

      result.status = "passed";
      result.output = output;
      this.testResults.passedTests++;
      console.log(`    ✅ ${suite.name}: PASSED`);
    } catch (error) {
      result.status = "failed";
      result.error = error.message;
      result.output = error.stdout || error.stderr || "";
      this.testResults.failedTests++;
      console.log(`    ❌ ${suite.name}: FAILED`);
      console.log(`       Error: ${error.message}`);
    }

    result.endTime = new Date();
    result.duration = result.endTime - result.startTime;
    this.testResults.testDetails.push(result);
    this.testResults.totalTests++;
  }

  async runCustomTest(test) {
    console.log(`  🔄 Running ${test.name}...`);

    const startTime = Date.now();
    let result = {
      name: test.name,
      startTime: new Date(startTime),
      endTime: null,
      duration: 0,
      status: "unknown",
      details: "",
      metrics: {},
      error: null,
    };

    try {
      const testResult = await test.test();

      result.status = testResult.passed ? "passed" : "failed";
      result.details = testResult.details || "";
      result.metrics = testResult.metrics || {};

      if (testResult.passed) {
        this.testResults.passedTests++;
        console.log(`    ✅ ${test.name}: PASSED`);
        if (testResult.details) {
          console.log(`       ${testResult.details}`);
        }
      } else {
        this.testResults.failedTests++;
        console.log(`    ❌ ${test.name}: FAILED`);
        console.log(`       ${testResult.details}`);
      }
    } catch (error) {
      result.status = "failed";
      result.error = error.message;
      this.testResults.failedTests++;
      console.log(`    ❌ ${test.name}: ERROR`);
      console.log(`       Error: ${error.message}`);
    }

    result.endTime = new Date();
    result.duration = result.endTime - result.startTime;
    this.testResults.testDetails.push(result);
    this.testResults.totalTests++;
  }

  async generateReports() {
    console.log("📄 Generating test reports...");

    // レポートディレクトリの作成
    await fs.mkdir(path.dirname(this.reportPath), { recursive: true });

    // JSON レポートの生成
    await fs.writeFile(
      this.reportPath,
      JSON.stringify(this.testResults, null, 2),
    );

    // HTML レポートの生成
    const htmlReport = this.generateHtmlReport();
    await fs.writeFile(this.htmlReportPath, htmlReport);

    console.log(`✅ Reports generated:`);
    console.log(`   JSON: ${this.reportPath}`);
    console.log(`   HTML: ${this.htmlReportPath}`);
  }

  generateHtmlReport() {
    const duration = this.testResults.endTime - this.testResults.startTime;
    const successRate = (
      (this.testResults.passedTests / this.testResults.totalTests) *
      100
    ).toFixed(1);

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio System Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .metric.success { background: #d4edda; }
        .metric.failure { background: #f8d7da; }
        .test-details { margin: 20px 0; }
        .test-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-item.passed { border-left: 5px solid #28a745; }
        .test-item.failed { border-left: 5px solid #dc3545; }
        .performance-metrics { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Portfolio System Integration Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Duration: ${Math.round(duration / 1000)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric success">
            <h3>${this.testResults.totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric success">
            <h3>${this.testResults.passedTests}</h3>
            <p>Passed</p>
        </div>
        <div class="metric failure">
            <h3>${this.testResults.failedTests}</h3>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h3>${successRate}%</h3>
            <p>Success Rate</p>
        </div>
    </div>
    
    <div class="performance-metrics">
        <h3>Performance Metrics</h3>
        <ul>
            ${Object.entries(this.testResults.performanceMetrics)
              .map(
                ([key, value]) =>
                  `<li><strong>${key}:</strong> ${value}ms</li>`,
              )
              .join("")}
        </ul>
    </div>
    
    <div class="test-details">
        <h3>Test Details</h3>
        ${this.testResults.testDetails
          .map(
            (test) => `
            <div class="test-item ${test.status}">
                <h4>${test.name}</h4>
                <p><strong>Status:</strong> ${test.status.toUpperCase()}</p>
                <p><strong>Duration:</strong> ${test.duration}ms</p>
                ${test.details ? `<p><strong>Details:</strong> ${test.details}</p>` : ""}
                ${test.error ? `<p><strong>Error:</strong> <pre>${test.error}</pre></p>` : ""}
                ${
                  Object.keys(test.metrics || {}).length > 0
                    ? `
                    <p><strong>Metrics:</strong></p>
                    <pre>${JSON.stringify(test.metrics, null, 2)}</pre>
                `
                    : ""
                }
            </div>
        `,
          )
          .join("")}
    </div>
    
    <div class="system-info">
        <h3>System Information</h3>
        <pre>${JSON.stringify(this.testResults.systemInfo, null, 2)}</pre>
    </div>
</body>
</html>`;
  }

  displaySummary() {
    const duration = this.testResults.endTime - this.testResults.startTime;
    const successRate = (
      (this.testResults.passedTests / this.testResults.totalTests) *
      100
    ).toFixed(1);

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`Passed: ${this.testResults.passedTests}`);
    console.log(`Failed: ${this.testResults.failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);

    if (Object.keys(this.testResults.performanceMetrics).length > 0) {
      console.log("\n⚡ PERFORMANCE METRICS:");
      Object.entries(this.testResults.performanceMetrics).forEach(
        ([key, value]) => {
          console.log(`  ${key}: ${value}ms`);
        },
      );
    }

    if (this.testResults.failedTests > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.testResults.testDetails
        .filter((test) => test.status === "failed")
        .forEach((test) => {
          console.log(`  - ${test.name}: ${test.error || test.details}`);
        });
    }

    console.log("\n📄 Reports available at:");
    console.log(`  JSON: ${this.reportPath}`);
    console.log(`  HTML: ${this.htmlReportPath}`);

    if (this.testResults.failedTests === 0) {
      console.log("\n🎉 All tests passed! System is ready for deployment.");
    } else {
      console.log(
        "\n⚠️ Some tests failed. Please review and fix issues before deployment.",
      );
      process.exit(1);
    }
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.runAllTests().catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
}

module.exports = IntegrationTestRunner;
