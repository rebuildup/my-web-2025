import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Final Fix Test", () => {
  test.beforeEach(async ({ page }) => {
    // 開発環境でのみ動作するため、NODE_ENVを設定
    await page.addInitScript(() => {
      Object.defineProperty(process, "env", {
        value: { NODE_ENV: "development" },
      });
    });
  });

  test("should save manual date settings correctly after fix", async ({
    page,
  }) => {
    // コンソールログをキャプチャ
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

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
    const testTitle = `最終修正テスト-${Date.now()}`;
    await page.fill('input[placeholder*="タイトル"]', testTitle);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "最終修正後の日付管理テストです。",
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
      await page.waitForTimeout(2000); // 状態更新を待機

      // Manualモードに切り替わったことを確認
      const manualButton = page.locator("button").filter({ hasText: "Manual" });
      await expect(manualButton).toBeVisible();

      // 日付入力フィールドに値を設定
      const dateInput = page.locator('input[type="text"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.clear();
        await dateInput.fill("2025/12/31");
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

    // 保存後、データを確認
    const savedData = await page.evaluate(async (title) => {
      try {
        const response = await fetch(
          "/api/content/portfolio?limit=50&status=all",
        );
        const data = await response.json();
        return data.data.find(
          (item: { title: string }) => item.title === title,
        );
      } catch (error) {
        return { error: error.message };
      }
    }, testTitle);

    console.log("=== Final Test Results ===");
    console.log("Saved item:", JSON.stringify(savedData, null, 2));

    // 検証
    if (savedData && !savedData.error) {
      console.log("✅ Item found in saved data");
      console.log(`useManualDate: ${savedData.useManualDate}`);
      console.log(`manualDate: ${savedData.manualDate}`);

      if (savedData.useManualDate === true) {
        console.log("✅ SUCCESS: useManualDate is correctly set to true");
      } else {
        console.log(
          "❌ ERROR: useManualDate is not true:",
          savedData.useManualDate,
        );
      }

      if (savedData.manualDate && savedData.manualDate.includes("2025-12-31")) {
        console.log("✅ SUCCESS: manualDate is correctly set");
      } else {
        console.log(
          "❌ ERROR: manualDate is not correct:",
          savedData.manualDate,
        );
      }
    } else {
      console.log("❌ ERROR: Item not found or error occurred");
    }

    // コンソールログを出力
    console.log("=== Console Logs ===");
    logs.forEach((log) => console.log(log));

    // アサーション
    expect(savedData).toBeTruthy();
    expect(savedData.useManualDate).toBe(true);
    expect(savedData.manualDate).toBeTruthy();
  });
});
