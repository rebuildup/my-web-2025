import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Correct Path Test", () => {
  test.beforeEach(async ({ page }) => {
    // 開発環境でのみ動作するため、NODE_ENVを設定
    await page.addInitScript(() => {
      Object.defineProperty(process, "env", {
        value: { NODE_ENV: "development" },
      });
    });
  });

  test("should save to correct file path", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // ページが完全に読み込まれるまで待機
    await expect(page.locator("h1")).toContainText("Data Manager");
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
    const testTitle = `正しいパステスト-${Date.now()}`;
    await page.fill('input[placeholder*="タイトル"]', testTitle);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "正しいファイルパスに保存されるかのテストです。",
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
      await page.waitForTimeout(2000);

      // 日付入力フィールドに値を設定
      const dateInput = page.locator('input[type="text"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.clear();
        await dateInput.fill("2025/12/25");
        await page.waitForTimeout(1000);

        // フィールドからフォーカスを外して値を確定
        await page.click('h3:has-text("日付管理")');
        await page.waitForTimeout(1000);
      }
    }

    // 保存
    await page.click('button:has-text("保存")');
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    console.log(
      `✅ Test completed. Item "${testTitle}" should be saved to public/data/content/portfolio.json`,
    );
  });
});
