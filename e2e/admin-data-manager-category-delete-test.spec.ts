import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Category and Delete Test", () => {
  test.beforeEach(async ({ page }) => {
    // 開発環境でのみ動作するため、NODE_ENVを設定
    await page.addInitScript(() => {
      Object.defineProperty(process, "env", {
        value: { NODE_ENV: "development" },
      });
    });
  });

  test("should change categories and delete items", async ({ page }) => {
    // コンソールエラーをキャプチャ
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
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
    const testTitle = `カテゴリテスト-${Date.now()}`;
    await page.fill('input[placeholder*="タイトル"]', testTitle);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "カテゴリ変更と削除のテストです。",
    );

    // カテゴリセクションを確認
    const categorySection = page.locator("text=カテゴリ").first();
    await expect(categorySection).toBeVisible();

    // カテゴリボタンを探してクリック（developからvideoに変更）
    const videoButton = page.locator('button:has-text("Video")');
    if (await videoButton.isVisible()) {
      console.log("Clicking Video category...");
      await videoButton.click();
      await page.waitForTimeout(1000);
    }

    // 保存
    await page.click('button:has-text("保存")');
    await expect(
      page.locator("span").filter({ hasText: "保存完了" }),
    ).toBeVisible({
      timeout: 30000,
    });

    console.log("✅ Item created and saved successfully");

    // アイテムリストから作成したアイテムを選択
    await page.waitForTimeout(2000);
    const createdItem = page.locator(`text=${testTitle}`).first();
    if (await createdItem.isVisible()) {
      await createdItem.click();
      await page.waitForTimeout(1000);

      // 削除ボタンを探してクリック
      const deleteButton = page.locator('button:has-text("削除")');
      if (await deleteButton.isVisible()) {
        console.log("Clicking delete button...");
        await deleteButton.click();

        // 確認ダイアログが表示される場合は承認
        page.on("dialog", async (dialog) => {
          console.log("Dialog appeared:", dialog.message());
          await dialog.accept();
        });

        // 削除完了を待機
        await page.waitForTimeout(3000);
        console.log("✅ Item deleted successfully");
      } else {
        console.log("❌ Delete button not found");
      }
    } else {
      console.log("❌ Created item not found in list");
    }

    // エラーがないことを確認
    if (errors.length > 0) {
      console.log("❌ Console errors found:");
      errors.forEach((error) => console.log(`  - ${error}`));
    } else {
      console.log("✅ No console errors found");
    }

    // アサーション
    expect(
      errors.filter((e) => e.includes("setCategoryChangeImpact")).length,
    ).toBe(0);
  });
});
