import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Simple Tests", () => {
  test("should load data manager page successfully", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // ページタイトルの確認
    await expect(page.locator("h1")).toContainText("Data Manager");

    // 基本的な要素の存在確認
    await expect(
      page.locator("text=コンテンツデータの作成・編集・管理を行います"),
    ).toBeVisible();
    await expect(page.locator("text=Content Type")).toBeVisible();
  });

  test("should be able to select portfolio content type", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await expect(page.locator('button:has-text("Portfolio")')).toHaveClass(
      /bg-foreground/,
    );
  });

  test("should create new portfolio item form", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');

    // フォームが表示されることを確認
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();
    await expect(page.locator('label:has-text("説明")')).toBeVisible();
  });

  test("should fill basic form fields", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');

    // フォームに入力
    await page.fill('input[placeholder*="タイトル"]', "テストポートフォリオ");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "これはテスト用のポートフォリオアイテムです。",
    );

    // 入力値の確認
    await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(
      "テストポートフォリオ",
    );
    await expect(page.locator('textarea[placeholder*="説明"]')).toHaveValue(
      "これはテスト用のポートフォリオアイテムです。",
    );
  });

  test("should switch between tabs", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');

    // タブの確認と切り替え
    const tabs = ["基本情報", "メディア", "リンク", "SEO設定"];

    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await expect(tabButton).toHaveClass(/bg-foreground/);
      }
    }
  });

  test("should test form validation", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(2000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');

    // Set up dialog handler before triggering the action
    let dialogMessage = "";
    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // タイトルを空のまま保存を試行
    await page.click('button:has-text("保存")');

    // Wait for dialog to appear and be handled
    await page.waitForTimeout(1000);

    // バリデーションエラーの確認
    expect(dialogMessage).toContain("タイトルは必須項目です");
  });
});
