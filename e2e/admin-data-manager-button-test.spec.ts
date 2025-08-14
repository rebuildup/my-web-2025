import { expect, test } from "@playwright/test";

test.describe("Admin Data Manager - Button Test", () => {
  test("should find save button", async ({ page }) => {
    await page.goto("/admin/data-manager");

    // Wait for client-side hydration
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(3000);

    // ページの全てのボタンを確認
    const allButtons = await page.locator("button").allTextContents();
    console.log("All buttons on page:", allButtons);

    // 保存ボタンを複数の方法で探す
    const saveButtonJP = page.locator('button:has-text("保存")');
    const saveButtonEN = page.locator('button:has-text("Save")');
    const submitButton = page.locator('button[type="submit"]');

    console.log("Looking for Japanese save button...");
    const jpVisible = await saveButtonJP.isVisible();
    console.log("Japanese save button visible:", jpVisible);

    console.log("Looking for English save button...");
    const enVisible = await saveButtonEN.isVisible();
    console.log("English save button visible:", enVisible);

    console.log("Looking for submit button...");
    const submitVisible = await submitButton.isVisible();
    console.log("Submit button visible:", submitVisible);

    if (submitVisible) {
      const submitText = await submitButton.textContent();
      console.log("Submit button text:", submitText);
    }

    // フォームが表示されているか確認
    const titleInput = page.locator('input[placeholder*="タイトル"]');
    const titleVisible = await titleInput.isVisible();
    console.log("Title input visible:", titleVisible);

    // フォーム要素が表示されていることを確認
    await expect(titleInput).toBeVisible();

    // 保存ボタンが存在することを確認（日本語または英語）
    const saveButton = saveButtonJP.or(saveButtonEN).or(submitButton);
    await expect(saveButton).toBeVisible();

    console.log("SUCCESS: Save button found and visible");
  });

  test("should test form submission without clicking save", async ({
    page,
  }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(3000);

    // フォームに入力
    await page.fill('input[placeholder*="タイトル"]', "フォームテスト");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "フォーム送信のテストです。",
    );

    // フォーム要素の確認
    const form = page.locator("form");
    await expect(form).toBeVisible();

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    console.log("Form and submit button are visible");

    // フォームの状態を確認
    const titleValue = await page
      .locator('input[placeholder*="タイトル"]')
      .inputValue();
    const descValue = await page
      .locator('textarea[placeholder*="説明"]')
      .inputValue();

    expect(titleValue).toBe("フォームテスト");
    expect(descValue).toBe("フォーム送信のテストです。");

    console.log("Form values are correct");
    console.log("Title:", titleValue);
    console.log("Description:", descValue);
  });
});
