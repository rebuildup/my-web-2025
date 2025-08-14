import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Save Test", () => {
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

  test("should save manual date settings correctly", async ({ page }) => {
    // コンソールログをキャプチャ
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await createNewPortfolioItem(page);

    // 基本情報を入力
    const testTitle = `日付保存テスト-${Date.now()}`;
    await page.fill('input[placeholder*="タイトル"]', testTitle);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "日付管理の保存機能をテストします。",
    );

    // 日付管理タブに移動
    const dateTab = page.locator('button:has-text("日付管理")');
    await expect(dateTab).toBeVisible();
    await dateTab.click();

    // Manual/Auto toggleボタンを探す
    const toggleButton = page.locator("button").filter({ hasText: "Auto" });

    if (await toggleButton.isVisible()) {
      console.log("Found Auto toggle, switching to Manual...");

      // Manualモードに切り替え
      await toggleButton.click();
      await page.waitForTimeout(1000);

      // 日付入力フィールドに値を設定
      const dateInput = page.locator('input[type="text"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill("2025/12/25");
        await page.waitForTimeout(500);

        // フィールドからフォーカスを外して値を確定
        await page.click('h3:has-text("日付管理")');
        await page.waitForTimeout(500);
      }
    }

    // 保存
    await page.click('button:has-text("保存")');
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    // 保存後、データを確認するためにAPIを呼び出し
    const response = await page.evaluate(async (title) => {
      const res = await fetch("/api/content/portfolio?limit=50&status=all");
      const data = await res.json();
      return data.data.find((item: { title: string }) => item.title === title);
    }, testTitle);

    console.log("Saved item data:", JSON.stringify(response, null, 2));

    // 保存されたデータを検証
    expect(response).toBeTruthy();
    expect(response.useManualDate).toBe(true);
    expect(response.manualDate).toBeTruthy();

    // コンソールログを出力
    console.log("=== Console Logs ===");
    logs.forEach((log) => console.log(log));

    if (response.useManualDate && response.manualDate) {
      console.log("✅ SUCCESS: Manual date settings were saved correctly!");
      console.log("useManualDate:", response.useManualDate);
      console.log("manualDate:", response.manualDate);
    } else {
      console.error("❌ ERROR: Manual date settings were not saved!");
      console.log("useManualDate:", response.useManualDate);
      console.log("manualDate:", response.manualDate);
    }
  });
});
