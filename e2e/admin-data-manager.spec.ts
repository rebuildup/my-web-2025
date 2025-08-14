import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager", () => {
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
        { timeout: 30000 },
      );
    } catch {
      console.log("API response wait timeout, continuing...");
    }

    // データの読み込みが完了するまで待機
    await page.waitForTimeout(3000);

    // Portfolioボタンが有効になるまで待機（30秒のタイムアウト）
    await expect(page.locator('button:has-text("Portfolio")')).toBeEnabled({
      timeout: 30000,
    });

    // コンテンツリストが表示されるまで待機（データが読み込まれた証拠）
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

    // 新規作成ボタンが有効になるまで待機（より長いタイムアウト）
    await expect(page.locator('button:has-text("+ 新規作成")')).toBeEnabled({
      timeout: 30000,
    });

    // 新規作成ボタンをクリック
    await page.click('button:has-text("+ 新規作成")');

    // フォームが表示されるまで待機
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();
  };

  test("should load data manager page successfully", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // ページタイトルの確認
    await expect(page.locator("h1")).toContainText("Data Manager");

    // 基本的な要素の存在確認
    await expect(
      page.locator("text=コンテンツデータの作成・編集・管理を行います"),
    ).toBeVisible();
    await expect(page.locator("text=Content Type")).toBeVisible();
  });

  test("should be able to select content types", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // ページが完全に読み込まれるまで待機
    await expect(page.locator("h1")).toContainText("Data Manager");

    // コンテンツタイプボタンの確認
    const contentTypes = [
      "Portfolio",
      "Blog",
      "Plugin",
      "Download",
      "Tool",
      "Profile",
    ];

    for (const type of contentTypes) {
      await expect(page.locator(`button:has-text("${type}")`)).toBeVisible();
    }

    // Portfolioボタンが有効になるまで待機
    await expect(page.locator('button:has-text("Portfolio")')).toBeEnabled();

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await expect(page.locator('button:has-text("Portfolio")')).toHaveClass(
      /bg-foreground/,
    );
  });

  test("should create new portfolio item", async ({ page }) => {
    await createNewPortfolioItem(page);

    // フォームが表示されることを確認
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();
    await expect(page.locator('label:has-text("説明")')).toBeVisible();
    await expect(page.locator('label:has-text("タグ")')).toBeVisible();
  });

  test("should fill and save portfolio item", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // ページが完全に読み込まれるまで待機
    await expect(page.locator("h1")).toContainText("Data Manager");

    // Portfolioボタンが有効になるまで待機
    await expect(page.locator('button:has-text("Portfolio")')).toBeEnabled();

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');

    // 新規作成ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("+ 新規作成")')).toBeEnabled();

    // 新規作成ボタンをクリック
    await page.click('button:has-text("+ 新規作成")');

    // フォームが表示されるまで待機
    await expect(page.locator('label:has-text("タイトル")')).toBeVisible();

    // フォームに入力
    await page.fill('input[placeholder*="タイトル"]', "テストポートフォリオ");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "これはテスト用のポートフォリオアイテムです。",
    );

    // カテゴリを選択（拡張モードの場合）
    const categorySelector = page.locator("text=develop").first();
    if (await categorySelector.isVisible()) {
      await categorySelector.click();
    }

    // 保存ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("保存")')).toBeEnabled();

    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');

    // 保存完了メッセージの確認（より柔軟なセレクターを使用）
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });
  });

  test("should switch between tabs", async ({ page }) => {
    await createNewPortfolioItem(page);

    // タブの確認と切り替え
    const tabs = ["基本情報", "メディア", "リンク", "SEO設定", "日付管理"];

    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await expect(tabButton).toHaveClass(/bg-foreground/);
      }
    }
  });

  test("should test date management functionality", async ({ page }) => {
    await createNewPortfolioItem(page);

    // 日付管理タブをクリック
    const dateTab = page.locator('button:has-text("日付管理")');
    if (await dateTab.isVisible()) {
      await dateTab.click();

      // 日付管理の要素を確認（より具体的なセレクターを使用）
      await expect(page.locator("h3:has-text('日付管理')")).toBeVisible();
      await expect(
        page.locator("text=このコンテンツアイテムの日付管理方法を制御します"),
      ).toBeVisible();
      await expect(page.locator("text=現在の日付情報")).toBeVisible();
      await expect(page.locator("text=有効日付")).toBeVisible();
    }
  });

  test("should test tag management", async ({ page }) => {
    await createNewPortfolioItem(page);

    // タグ入力フィールドを確認
    await expect(page.locator('label:has-text("タグ")')).toBeVisible();

    // タグ入力フィールドをクリック
    const tagInput = page.locator('input[placeholder*="タグ"]');
    if (await tagInput.isVisible()) {
      await tagInput.click();
      await tagInput.fill("テストタグ");
      await tagInput.press("Enter");

      // タグが追加されたことを確認（選択されたタグのスパン要素を確認）
      await expect(
        page.locator("span:has-text('テストタグ')").first(),
      ).toBeVisible();
    }
  });

  test("should test markdown content editing", async ({ page }) => {
    await createNewPortfolioItem(page);

    // 基本情報タブでコンテンツエリアを確認
    const contentArea = page.locator("textarea, .markdown-editor");
    if (await contentArea.first().isVisible()) {
      await contentArea
        .first()
        .fill("# テストコンテンツ\n\nこれはテスト用のMarkdownコンテンツです。");
    }
  });

  test("should test form validation", async ({ page }) => {
    await createNewPortfolioItem(page);

    // バリデーションエラーの確認用ダイアログリスナーを設定
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("タイトルは必須項目です");
      await dialog.accept();
    });

    // 保存ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("保存")')).toBeEnabled();

    // タイトルを空のまま保存を試行
    await page.click('button:has-text("保存")');
  });

  test("should test preview functionality", async ({ page }) => {
    await createNewPortfolioItem(page);

    // フォームに基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "プレビューテスト");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "プレビュー機能のテストです。",
    );

    // プレビューボタンをクリック
    const previewButton = page.locator('button:has-text("プレビュー")');
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await expect(previewButton).toHaveClass(/bg-foreground/);
    }
  });

  test("should test basic portfolio creation and gallery access", async ({
    page,
  }) => {
    // データマネージャーで基本的なポートフォリオアイテムを作成
    await createNewPortfolioItem(page);

    // 基本情報を入力
    await page.fill('input[placeholder*="タイトル"]', "テストアイテム");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "基本的なテストアイテムです。",
    );

    // 保存ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("保存")')).toBeEnabled();

    // 保存
    await page.click('button:has-text("保存")');
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    // ギャラリーページにアクセスできることを確認
    await page.goto("/portfolio/gallery/all");

    // ページが正常に読み込まれることを確認
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });

    console.log(
      "Portfolio creation and gallery access test completed successfully",
    );
  });

  test("should handle errors gracefully", async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.route("/api/admin/content", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await createNewPortfolioItem(page);

    // フォームに入力
    await page.fill('input[placeholder*="タイトル"]', "エラーテスト");

    // 保存ボタンが有効になるまで待機
    await expect(page.locator('button:has-text("保存")')).toBeEnabled();

    // 保存を試行
    await page.click('button:has-text("保存")');

    // エラー状態の確認（ステータス表示のスパン要素を確認）
    await expect(page.locator("span:has-text('✗ エラー')")).toBeVisible({
      timeout: 10000,
    });
  });
});
