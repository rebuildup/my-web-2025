import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Debug Tests", () => {
  test("should debug save functionality", async ({ page }) => {
    // コンソールログを監視
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    // エラーを監視
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // ネットワークリクエストを監視
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/")) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });

    const responses: string[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        responses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    console.log("=== Initial logs ===");
    console.log(logs.slice(-10));

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    console.log("=== After portfolio selection ===");
    console.log(logs.slice(-5));
    console.log("Requests:", requests);
    console.log("Responses:", responses);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // フォームに入力
    await page.fill('input[placeholder*="タイトル"]', "デバッグテストアイテム");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "デバッグ用のテストアイテムです。",
    );

    console.log("=== Before save ===");
    console.log("Logs:", logs.slice(-5));
    console.log("Errors:", errors);
    console.log("Requests:", requests);
    console.log("Responses:", responses);

    // 保存ボタンの存在を確認
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeVisible();

    console.log("Save button found, attempting to click...");

    try {
      // 保存ボタンをクリック
      await saveButton.click();

      // 少し待機
      await page.waitForTimeout(5000);

      console.log("=== After save attempt ===");
      console.log("Logs:", logs.slice(-10));
      console.log("Errors:", errors);
      console.log("Requests:", requests);
      console.log("Responses:", responses);

      // 保存完了メッセージを確認
      const successMessage = page
        .locator("text=保存完了")
        .or(page.locator("text=Saved"));
      if (await successMessage.isVisible()) {
        console.log("SUCCESS: Save completed successfully");
      } else {
        console.log("WARNING: Save success message not found");
      }
    } catch (error) {
      console.log("ERROR during save:", error);
      console.log("Final logs:", logs);
      console.log("Final errors:", errors);
      console.log("Final requests:", requests);
      console.log("Final responses:", responses);
      throw error;
    }
  });

  test("should test API endpoints directly", async ({ page }) => {
    // APIエンドポイントを直接テスト
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(2000);

    // JavaScriptでAPIを直接呼び出し
    const apiResult = await page.evaluate(async () => {
      try {
        const testData = {
          id: `test-${Date.now()}`,
          type: "portfolio",
          title: "API直接テスト",
          description: "API直接呼び出しのテストです",
          categories: ["develop"],
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log("Sending API request with data:", testData);

        const response = await fetch("/api/admin/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });

        console.log("API Response status:", response.status);
        console.log(
          "API Response headers:",
          Object.fromEntries(response.headers.entries()),
        );

        const result = await response.json();
        console.log("API Response data:", result);

        return {
          status: response.status,
          ok: response.ok,
          data: result,
        };
      } catch (error) {
        console.error("API Error:", error);
        return {
          error: error.message,
        };
      }
    });

    console.log("API Test Result:", apiResult);

    // APIが正常に動作することを確認
    expect(apiResult.status).toBe(200);
    expect(apiResult.ok).toBe(true);
    expect(apiResult.data.success).toBe(true);
  });

  test("should test form submission step by step", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(3000);

    // Step 1: Portfolio選択
    console.log("Step 1: Selecting Portfolio");
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // Step 2: 新規作成
    console.log("Step 2: Creating new item");
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // Step 3: フォーム入力
    console.log("Step 3: Filling form");
    await page.fill(
      'input[placeholder*="タイトル"]',
      "ステップバイステップテスト",
    );
    await page.fill(
      'textarea[placeholder*="説明"]',
      "ステップバイステップのテストです。",
    );

    // Step 4: フォーム状態確認
    console.log("Step 4: Checking form state");
    const titleValue = await page
      .locator('input[placeholder*="タイトル"]')
      .inputValue();
    const descValue = await page
      .locator('textarea[placeholder*="説明"]')
      .inputValue();

    console.log("Title value:", titleValue);
    console.log("Description value:", descValue);

    expect(titleValue).toBe("ステップバイステップテスト");
    expect(descValue).toBe("ステップバイステップのテストです。");

    // Step 5: 保存ボタン確認
    console.log("Step 5: Checking save button");
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    console.log("Save button is visible and enabled");

    // Step 6: 保存実行（慎重に）
    console.log("Step 6: Attempting save");

    // フォーム送信イベントを監視
    let formSubmitted = false;
    page.on("request", (request) => {
      if (
        request.url().includes("/api/admin/content") &&
        request.method() === "POST"
      ) {
        formSubmitted = true;
        console.log("Form submission detected");
      }
    });

    await saveButton.click();

    // 少し待機してフォーム送信を確認
    await page.waitForTimeout(3000);

    console.log("Form submitted:", formSubmitted);

    if (formSubmitted) {
      console.log("SUCCESS: Form was submitted to API");
    } else {
      console.log("WARNING: Form submission not detected");
    }
  });
});
