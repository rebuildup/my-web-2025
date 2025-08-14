import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Save Functionality", () => {
  test("should save portfolio item successfully", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // フォームに入力
    await page.fill(
      'input[placeholder*="タイトル"]',
      "テストポートフォリオアイテム",
    );
    await page.fill(
      'textarea[placeholder*="説明"]',
      "これはPlaywrightテスト用のポートフォリオアイテムです。",
    );

    // カテゴリを選択（拡張モードの場合）
    const developCategory = page.locator("text=develop").first();
    if (await developCategory.isVisible()) {
      await developCategory.click();
      await page.waitForTimeout(500);
    }

    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');

    // 保存完了メッセージまたは成功状態を確認
    await expect(
      page.locator("text=保存完了").or(page.locator("text=Saved")),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should test markdown content functionality", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "Markdownテストアイテム");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "Markdown機能のテストです。",
    );

    // コンテンツエリアにMarkdownを入力
    const contentArea = page.locator("textarea").last();
    if (await contentArea.isVisible()) {
      await contentArea.fill(
        "# テストコンテンツ\n\nこれはMarkdownのテストです。\n\n- リスト項目1\n- リスト項目2",
      );
    }

    // 保存
    await page.click('button:has-text("保存")');

    // 保存完了を確認
    await expect(
      page.locator("text=保存完了").or(page.locator("text=Saved")),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should test tag management functionality", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "タグテストアイテム");
    await page.fill('textarea[placeholder*="説明"]', "タグ機能のテストです。");

    // タグ入力フィールドを探す
    const tagInput = page.locator('input[placeholder*="タグ"]');
    if (await tagInput.isVisible()) {
      await tagInput.click();
      await tagInput.fill("テストタグ");
      await tagInput.press("Enter");
      await page.waitForTimeout(1000);

      // タグが追加されたことを確認
      await expect(page.locator("text=テストタグ")).toBeVisible();
    }

    // 保存
    await page.click('button:has-text("保存")');

    // 保存完了を確認
    await expect(
      page.locator("text=保存完了").or(page.locator("text=Saved")),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should test date management functionality", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "日付テストアイテム");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "日付管理機能のテストです。",
    );

    // 日付管理タブをクリック
    const dateTab = page.locator('button:has-text("日付管理")');
    if (await dateTab.isVisible()) {
      await dateTab.click();
      await page.waitForTimeout(1000);

      // 日付管理の要素を確認
      await expect(page.locator("text=日付管理")).toBeVisible();
      await expect(page.locator("text=有効日付")).toBeVisible();
    }

    // 基本情報タブに戻る
    await page.click('button:has-text("基本情報")');
    await page.waitForTimeout(500);

    // 保存
    await page.click('button:has-text("保存")');

    // 保存完了を確認
    await expect(
      page.locator("text=保存完了").or(page.locator("text=Saved")),
    ).toBeVisible({ timeout: 15000 });
  });

  test("should test gallery integration", async ({ page }) => {
    // まずデータマネージャーでアイテムを作成
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(3000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(1000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(1000);

    // 基本情報を入力
    await page.fill(
      'input[placeholder*="タイトル"]',
      "ギャラリーテストアイテム",
    );
    await page.fill(
      'textarea[placeholder*="説明"]',
      "ギャラリー連携のテストです。",
    );

    // 保存
    await page.click('button:has-text("保存")');

    // 保存完了を確認
    await expect(
      page.locator("text=保存完了").or(page.locator("text=Saved")),
    ).toBeVisible({ timeout: 15000 });

    // ギャラリーページに移動
    await page.goto("/portfolio/gallery/all");
    await page.waitForTimeout(2000);

    // ソート機能をテスト
    const sortSelect = page.locator("select").last();
    if (await sortSelect.isVisible()) {
      await expect(
        page.locator('option:has-text("日付（新しい順）")'),
      ).toBeVisible();
      await expect(
        page.locator('option:has-text("日付（古い順）")'),
      ).toBeVisible();

      // 日付ソートを選択
      await sortSelect.selectOption("effectiveDate-desc");
      await page.waitForTimeout(1000);
    }

    // 作成したアイテムが表示されることを確認
    await expect(page.locator("text=ギャラリーテストアイテム")).toBeVisible({
      timeout: 10000,
    });
  });
});
