import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Network Debug", () => {
  test.beforeEach(async ({ page }) => {
    // 開発環境でのみ動作するため、NODE_ENVを設定
    await page.addInitScript(() => {
      Object.defineProperty(process, "env", {
        value: { NODE_ENV: "development" },
      });
    });
  });

  test("should debug network requests and data flow", async ({ page }) => {
    // ネットワークリクエストをキャプチャ
    const requests: Array<{ url: string; method: string; postData?: string }> =
      [];
    page.on("request", (request) => {
      if (request.url().includes("/api/admin/content")) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    // レスポンスもキャプチャ
    const responses: Array<{ url: string; status: number; body: string }> = [];
    page.on("response", async (response) => {
      if (response.url().includes("/api/admin/content")) {
        try {
          const responseBody = await response.text();
          responses.push({
            url: response.url(),
            status: response.status(),
            body: responseBody,
          });
        } catch {
          console.log("Failed to read response body");
        }
      }
    });

    // コンソールログをキャプチャ
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto("/admin/data-manager");

    // ページが完全に読み込まれるまで待機
    await expect(page.locator("h1")).toContainText("Data Manager");

    // データの読み込みが完了するまで待機
    await page.waitForTimeout(3000);

    // Portfolioボタンが有効になるまで待機
    await expect(page.locator('button:has-text("Portfolio")')).toBeEnabled({
      timeout: 30000,
    });

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("+ 新規作成")')).toBeEnabled({
      timeout: 30000,
    });

    // 新規作成ボタンをクリック
    await page.click('button:has-text("+ 新規作成")');

    // フォームが表示されるまで待機
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();

    // 基本情報を入力
    const testTitle = `ネットワークデバッグ-${Date.now()}`;
    await page.fill('input[placeholder*="タイトル"]', testTitle);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "ネットワークリクエストのデバッグテストです。",
    );

    // 日付管理タブに移動
    const dateTab = page.locator('button:has-text("日付管理")');
    await expect(dateTab).toBeVisible();
    await dateTab.click();

    // Manual/Auto toggleボタンを探してManualに切り替え
    const toggleButton = page.locator("button").filter({ hasText: "Auto" });

    if (await toggleButton.isVisible()) {
      console.log("Switching to Manual mode...");
      await toggleButton.click();
      await page.waitForTimeout(1000);

      // 日付入力フィールドに値を設定
      const dateInput = page.locator('input[type="text"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill("2025/12/31");
        await page.waitForTimeout(500);

        // フィールドからフォーカスを外して値を確定
        await page.click('h3:has-text("日付管理")');
        await page.waitForTimeout(500);
      }
    }

    // 保存前の状態をログ出力
    await page.evaluate(() => {
      console.log("=== About to save ===");
    });

    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');

    // 保存完了まで待機
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    // ネットワークリクエストとレスポンスを出力
    console.log("=== Network Requests ===");
    requests.forEach((req, index) => {
      console.log(`Request ${index + 1}:`);
      console.log(`  URL: ${req.url}`);
      console.log(`  Method: ${req.method}`);
      if (req.postData) {
        console.log(`  Post Data: ${req.postData}`);
        try {
          const parsedData = JSON.parse(req.postData);
          console.log(`  useManualDate: ${parsedData.useManualDate}`);
          console.log(`  manualDate: ${parsedData.manualDate}`);
        } catch (error) {
          console.log("  Failed to parse post data");
        }
      }
    });

    console.log("=== Network Responses ===");
    responses.forEach((res, index) => {
      console.log(`Response ${index + 1}:`);
      console.log(`  URL: ${res.url}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Body: ${res.body}`);
    });

    console.log("=== Console Logs ===");
    logs.forEach((log) => console.log(log));

    // 最後にファイルの内容を確認
    const fileContent = await page.evaluate(async () => {
      try {
        const response = await fetch(
          "/api/content/portfolio?limit=5&status=all",
        );
        const data = await response.json();
        return data.data;
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log("=== Current File Content ===");
    console.log(JSON.stringify(fileContent, null, 2));

    // 保存されたアイテムを検索
    const savedItem = Array.isArray(fileContent)
      ? fileContent.find((item: { title: string }) => item.title === testTitle)
      : null;

    if (savedItem) {
      console.log("=== Saved Item Found ===");
      console.log(`useManualDate: ${savedItem.useManualDate}`);
      console.log(`manualDate: ${savedItem.manualDate}`);
    } else {
      console.log("=== Saved Item NOT Found ===");
    }
  });
});
