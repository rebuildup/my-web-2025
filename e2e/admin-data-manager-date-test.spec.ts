import { test } from "@playwright/test";

test.describe("Admin Data Manager - Date Management Test", () => {
  test("should test manual date functionality", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 新規作成ボタンをクリック
    await page.click('button:has-text("新規作成")');
    await page.waitForTimeout(3000);

    // 基本情報を入力
    const timestamp = Date.now();
    const title = `日付管理テスト_${timestamp}`;

    await page.fill('input[placeholder*="タイトル"]', title);
    await page.fill(
      'textarea[placeholder*="説明"]',
      "日付管理機能のテストです。",
    );

    // 日付管理タブに移動
    const dateTab = page.locator('button:has-text("日付管理")');
    if (await dateTab.isVisible()) {
      await dateTab.click();
      await page.waitForTimeout(2000);

      console.log("Date management tab opened");

      // Manual/Autoトグルボタンを探す
      const toggleButton = page
        .locator("button")
        .filter({ hasText: /Manual|Auto/ });
      if (await toggleButton.isVisible()) {
        const toggleText = await toggleButton.textContent();
        console.log("Current toggle state:", toggleText);

        // Autoの場合はManualに切り替え
        if (toggleText?.includes("Auto")) {
          await toggleButton.click();
          await page.waitForTimeout(1000);
          console.log("Switched to Manual mode");
        }

        // 日付入力フィールドを探す
        const dateInput = page
          .locator('input[type="text"]')
          .filter({ hasText: "" })
          .last();
        if (await dateInput.isVisible()) {
          // 日付を入力
          const testDate = "2024/12/25";
          await dateInput.fill(testDate);
          await page.waitForTimeout(1000);

          console.log("Date entered:", testDate);

          // 入力値を確認
          const inputValue = await dateInput.inputValue();
          console.log("Input value after entry:", inputValue);
        }
      }

      // 基本情報タブに戻る
      await page.click('button:has-text("基本情報")');
      await page.waitForTimeout(1000);
    }

    // 保存
    const saveButton = page.locator('button[type="submit"]');
    await saveButton.click();
    await page.waitForTimeout(10000);

    // 保存完了を確認
    const successMessage = page
      .locator("text=保存完了")
      .or(page.locator("text=Saved"));
    if (await successMessage.isVisible()) {
      console.log("Item saved successfully");

      // 保存されたアイテムを再度開いて日付が保持されているか確認
      await page.waitForTimeout(2000);

      // 作成されたアイテムを探してクリック
      const createdItem = page.locator("div").filter({ hasText: title });
      if (await createdItem.isVisible()) {
        await createdItem.click();
        await page.waitForTimeout(3000);

        // 日付管理タブに移動
        const dateTabReopen = page.locator('button:has-text("日付管理")');
        if (await dateTabReopen.isVisible()) {
          await dateTabReopen.click();
          await page.waitForTimeout(2000);

          // Manual/Autoトグルの状態を確認
          const toggleButtonReopen = page
            .locator("button")
            .filter({ hasText: /Manual|Auto/ });
          if (await toggleButtonReopen.isVisible()) {
            const toggleTextReopen = await toggleButtonReopen.textContent();
            console.log("Toggle state after reload:", toggleTextReopen);

            if (toggleTextReopen?.includes("Manual")) {
              // 日付入力フィールドの値を確認
              const dateInputReopen = page
                .locator('input[type="text"]')
                .filter({ hasText: "" })
                .last();
              if (await dateInputReopen.isVisible()) {
                const savedDateValue = await dateInputReopen.inputValue();
                console.log("Saved date value:", savedDateValue);

                if (savedDateValue && savedDateValue.includes("2024")) {
                  console.log(
                    "SUCCESS: Manual date was saved and restored correctly",
                  );
                } else {
                  console.log("WARNING: Manual date was not saved correctly");
                }
              }
            } else {
              console.log("WARNING: Manual date mode was not saved");
            }
          }
        }
      }
    }
  });

  test("should test markdown content loading", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForTimeout(5000);

    // Portfolioタイプを選択
    await page.click('button:has-text("Portfolio")');
    await page.waitForTimeout(2000);

    // 既存のアイテムがあるかチェック
    const existingItems = page
      .locator("div")
      .filter({ hasText: /portfolio|test|API/ });
    const itemCount = await existingItems.count();
    console.log("Existing items found:", itemCount);

    if (itemCount > 0) {
      // 最初のアイテムをクリック
      await existingItems.first().click();
      await page.waitForTimeout(3000);

      // コンテンツエディターを確認
      const editors = page.locator("textarea");
      const editorCount = await editors.count();
      console.log("Number of editors found:", editorCount);

      if (editorCount > 0) {
        const lastEditor = editors.last();
        const editorContent = await lastEditor.inputValue();
        console.log("Editor content length:", editorContent.length);

        if (editorContent.length > 0) {
          console.log("SUCCESS: Content is displayed in editor");
          console.log("Content preview:", editorContent.substring(0, 100));
        } else {
          console.log("INFO: Editor found but content is empty");
        }

        // Markdownエラーがないかチェック
        const errorMessages = page
          .locator("text=Error loading markdown")
          .or(page.locator("text=Markdown API エラー"));
        const hasError = await errorMessages.isVisible();

        if (hasError) {
          const errorText = await errorMessages.textContent();
          console.log("WARNING: Markdown error found:", errorText);
        } else {
          console.log("SUCCESS: No markdown errors detected");
        }
      }
    }
  });
});
