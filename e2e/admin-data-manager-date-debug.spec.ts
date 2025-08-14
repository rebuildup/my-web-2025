import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Date Management Debug", () => {
  test.beforeEach(async ({ page }) => {
    // 開発環境でのみ動作するため、NODE_ENVを設定
    await page.addInitScript(() => {
      Object.defineProperty(process, "env", {
        value: { NODE_ENV: "development" },
      });
    });
  });

  // ヘルパー関数：ページの初期化とPortfolioタイプの選択
  const setupPortfolioPage = async (page: import("@playwright/test").Page) => {
    await page.goto("/admin/data-manager");

    // ページが完全に読み込まれるまで待機
    await expect(page.locator("h1")).toContainText("Data Manager");

    // APIリクエストの完了を待機
    try {
      await page.waitForResponse(
        (response) =>
          response.url().includes("/api/content/portfolio") &&
          response.status() === 200,
        { timeout: 15000 },
      );
    } catch {
      console.log("API response wait timeout, continuing...");
    }

    // データの読み込みが完了するまで待機
    await page.waitForTimeout(3000);

    // Portfolioボタンが有効になるまで待機
    await expect(page.locator('button:has-text("Portfolio")')).toBeEnabled({
      timeout: 30000,
    });

    // コンテンツリストが表示されるまで待機
    await expect(page.locator("text=Portfolio Items")).toBeVisible({
      timeout: 10000,
    });

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
  };

  // ヘルパー関数：新規作成フォームを開く
  const createNewPortfolioItem = async (
    page: import("@playwright/test").Page,
  ) => {
    await setupPortfolioPage(page);

    // 新規作成ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("+ 新規作成")')).toBeEnabled({
      timeout: 30000,
    });

    // 新規作成ボタンをクリック
    await page.click('button:has-text("+ 新規作成")');

    // フォームが表示されるまで待機
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();
  };

  test("should debug date management functionality", async ({ page }) => {
    // コンソールログをキャプチャ
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await createNewPortfolioItem(page);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "日付管理テスト");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "日付管理機能のデバッグテストです。",
    );

    // 日付管理タブに移動
    const dateTab = page.locator('button:has-text("日付管理")');
    await expect(dateTab).toBeVisible();
    await dateTab.click();

    // 日付管理の要素を確認
    await expect(page.locator("h3:has-text('日付管理')")).toBeVisible();

    // Manual Date機能をテスト
    const manualDateToggle = page.locator('input[type="checkbox"]').first();
    if (await manualDateToggle.isVisible()) {
      console.log("Manual date toggle found, clicking...");
      await manualDateToggle.check();

      // チェックされたことを確認
      await expect(manualDateToggle).toBeChecked();

      // 日付入力フィールドが表示されるまで待機
      await page.waitForTimeout(1000);

      // 日付を設定
      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.isVisible()) {
        await dateInput.fill("2025-12-25");
        console.log("Date set to 2025-12-25");
      }
    }

    // 保存前にフォームの状態をログ出力
    await page.evaluate(() => {
      console.log("=== Form state before save ===");
    });

    // 保存ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("保存")')).toBeEnabled();

    // 保存
    await page.click('button:has-text("保存")');

    // 保存完了メッセージの確認
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    // コンソールログを出力
    console.log("=== Console Logs ===");
    logs.forEach((log) => console.log(log));

    // 保存後、アイテムを再度開いて確認
    await page.waitForTimeout(2000);

    // アイテムリストから作成したアイテムを選択
    const createdItem = page.locator("text=日付管理テスト").first();
    if (await createdItem.isVisible()) {
      await createdItem.click();

      // 日付管理タブに移動
      await dateTab.click();

      // Manual Date設定が保持されているかを確認
      const toggleAfterSave = page.locator('input[type="checkbox"]').first();
      const isChecked = await toggleAfterSave.isChecked();
      console.log("Manual date toggle after save:", isChecked);

      if (!isChecked) {
        console.error("ERROR: Manual date setting was not saved!");
      } else {
        console.log("SUCCESS: Manual date setting was saved correctly!");
      }
    }
  });
});
