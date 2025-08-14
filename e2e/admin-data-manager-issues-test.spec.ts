import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Issues Test", () => {
  test("should test new data creation", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(3000);

    // フォームに入力
    const timestamp = Date.now();
    const title = `新規データテスト_${timestamp}`;
    const description = `新規データ作成のテストです。作成時刻: ${new Date().toLocaleString("ja-JP")}`;

    await page.fill('input[placeholder*="タイトル"]', title);
    await page.fill('textarea[placeholder*="説明"]', description);

    // コンテンツエリアにテキストを入力
    const contentArea = page.locator("textarea").last();
    if (await contentArea.isVisible()) {
      await contentArea.fill(
        "# 新規データのテスト\n\nこれは新規データ作成のテストです。\n\n- 項目1\n- 項目2\n- 項目3",
      );
      console.log("Content area filled");
    }

    // ネットワークリクエストを監視
    let saveRequestMade = false;
    let saveResponseData: {
      success: boolean;
      data?: { title: string };
    } | null = null;

    page.on("request", (request) => {
      if (
        request.url().includes("/api/admin/content") &&
        request.method() === "POST"
      ) {
        saveRequestMade = true;
        console.log("Save request detected");
      }
    });

    page.on("response", async (response) => {
      if (
        response.url().includes("/api/admin/content") &&
        response.request().method() === "POST"
      ) {
        try {
          saveResponseData = await response.json();
          console.log("Save response data:", saveResponseData);
        } catch (error) {
          console.log("Error parsing response:", error);
        }
      }
    });

    // 保存ボタンをクリック
    const saveButton = page.locator('button[type="submit"]');
    await saveButton.click();

    // 保存処理の完了を待つ
    await page.waitForTimeout(10000);

    console.log("Save request made:", saveRequestMade);
    console.log("Save response data:", saveResponseData);

    // 保存が成功したことを確認
    expect(saveRequestMade).toBe(true);

    if (saveResponseData) {
      expect(saveResponseData.success).toBe(true);
      expect(saveResponseData.data).toBeDefined();
      expect(saveResponseData.data.title).toBe(title);
      console.log("SUCCESS: New data created successfully");
    }
  });

  test("should test tag functionality", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(3000);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "タグテスト");
    await page.fill('textarea[placeholder*="説明"]', "タグ機能のテストです。");

    // タグ入力フィールドを探す
    const tagInput = page.locator('input[placeholder*="タグ"]');
    if (await tagInput.isVisible()) {
      console.log("Tag input found");

      // タグAPIの動作を確認
      const tagApiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch("/api/admin/tags");
          const data = await response.json();
          return data;
        } catch (error) {
          return { error: error.message };
        }
      });

      console.log("Tag API response:", tagApiResponse);

      // タグを入力
      await tagInput.click();
      await tagInput.fill("新しいタグ");
      await tagInput.press("Enter");
      await page.waitForTimeout(2000);

      // タグが追加されたかチェック
      const tagElements = page.locator('span:has-text("新しいタグ")');
      const tagVisible = await tagElements.first().isVisible();
      console.log("Tag visible after creation:", tagVisible);

      if (tagVisible) {
        console.log("SUCCESS: Tag creation works");
      } else {
        console.log("WARNING: Tag not visible after creation");
      }
    } else {
      console.log("WARNING: Tag input not found");
    }
  });

  test("should test markdown content display", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 既存のアイテムがあるかチェック
    const existingItems = page.locator('[data-testid="portfolio-item"]');
    const itemCount = await existingItems.count();
    console.log("Existing portfolio items:", itemCount);

    if (itemCount > 0) {
      // 最初のアイテムをクリック
      await existingItems.first().click();
      await page.waitForTimeout(3000);

      // Markdownエディターが表示されているかチェック
      const markdownEditor = page.locator('textarea[placeholder*="markdown"]');
      const textareaEditor = page.locator("textarea").last();

      let editorFound = false;
      let editorContent = "";

      if (await markdownEditor.isVisible()) {
        editorFound = true;
        editorContent = await markdownEditor.inputValue();
        console.log(
          "Markdown editor found with content:",
          editorContent.length,
          "characters",
        );
      } else if (await textareaEditor.isVisible()) {
        editorFound = true;
        editorContent = await textareaEditor.inputValue();
        console.log(
          "Textarea editor found with content:",
          editorContent.length,
          "characters",
        );
      }

      if (editorFound) {
        if (editorContent.length > 0) {
          console.log("SUCCESS: Content is displayed in editor");
          console.log("Content preview:", editorContent.substring(0, 100));
        } else {
          console.log("WARNING: Editor found but content is empty");
        }
      } else {
        console.log("WARNING: No content editor found");
      }
    } else {
      console.log("No existing items to test markdown display");
    }
  });

  test("should test API endpoints directly", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(2000);

    // タグAPIをテスト
    const tagApiResult = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/admin/tags");
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          dataLength: data.data ? data.data.length : 0,
          data: data.data,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log("Tag API test result:", tagApiResult);
    expect(tagApiResult.status).toBe(200);
    expect(tagApiResult.success).toBe(true);

    // コンテンツAPIをテスト
    const contentApiResult = await page.evaluate(async () => {
      try {
        const testData = {
          id: `api-test-${Date.now()}`,
          type: "portfolio",
          title: "API直接テスト",
          description: "API直接呼び出しのテストです",
          categories: ["develop"],
          tags: ["api-test"],
          status: "published",
          priority: 50,
          content: "# APIテスト\n\nこれはAPI直接テストです。",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const response = await fetch("/api/admin/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });

        const result = await response.json();
        return {
          status: response.status,
          success: result.success,
          data: result.data,
          error: result.error,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log("Content API test result:", contentApiResult);
    expect(contentApiResult.status).toBe(200);
    expect(contentApiResult.success).toBe(true);
    expect(contentApiResult.data).toBeDefined();
  });
});
