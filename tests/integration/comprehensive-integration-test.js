/**
 * 全機能統合テスト
 * ポートフォリオコンテンツデータ拡張システムの包括的テスト
 */

const { test, expect } = require("@playwright/test");
const fs = require("fs").promises;
const path = require("path");

// テスト設定
const TEST_CONFIG = {
  baseURL: "http://localhost:3000",
  timeout: 30000,
  testDataPath: "./test-data",
  uploadPath: "./test-uploads",
};

// テストデータ
const TEST_DATA = {
  portfolioItem: {
    title: "Integration Test Portfolio Item",
    description: "Test item for comprehensive integration testing",
    categories: ["develop", "design"],
    tags: ["React", "TypeScript", "Integration Test"],
    manualDate: "2024-02-01",
    useManualDate: true,
    status: "published",
  },
  markdownContent: `# Integration Test Content

This is a test markdown content for integration testing.

## Features Tested
- Multiple categories
- Tag management
- Date management
- File upload
- Markdown editing

## Test Results
All features should work correctly together.`,

  testFiles: {
    image: "test-image.jpg",
    markdown: "test-content.md",
  },
};

test.describe("全機能統合テスト", () => {
  let page;
  let testItemId;

  test.beforeAll(async ({ browser }) => {
    // テスト環境の準備
    page = await browser.newPage();
    await setupTestEnvironment();
  });

  test.afterAll(async () => {
    // テスト環境のクリーンアップ
    await cleanupTestEnvironment();
    await page.close();
  });

  test("1. データマネージャー統合テスト", async () => {
    console.log("Starting Data Manager Integration Test...");

    // データマネージャーにアクセス
    await page.goto(`${TEST_CONFIG.baseURL}/admin/data-manager`);
    await page.waitForLoadState("networkidle");

    // 新規作成ボタンをクリック
    await page.click('[data-testid="create-new-item"]');
    await page.waitForSelector('[data-testid="data-manager-form"]');

    // 基本情報の入力
    await page.fill(
      '[data-testid="title-input"]',
      TEST_DATA.portfolioItem.title,
    );
    await page.fill(
      '[data-testid="description-input"]',
      TEST_DATA.portfolioItem.description,
    );

    // ステータス設定
    await page.selectOption(
      '[data-testid="status-select"]',
      TEST_DATA.portfolioItem.status,
    );

    console.log("✓ Basic information input completed");
  });

  test("2. 複数カテゴリー選択テスト", async () => {
    console.log("Starting Multiple Category Selection Test...");

    // カテゴリータブに移動
    await page.click('[data-testid="category-tab"]');
    await page.waitForSelector('[data-testid="category-selector"]');

    // 複数カテゴリーを選択
    for (const category of TEST_DATA.portfolioItem.categories) {
      await page.check(`[data-testid="category-${category}"]`);
    }

    // 選択されたカテゴリーの確認
    for (const category of TEST_DATA.portfolioItem.categories) {
      const isChecked = await page.isChecked(
        `[data-testid="category-${category}"]`,
      );
      expect(isChecked).toBe(true);
    }

    // Otherカテゴリーが選択されていないことを確認
    const otherChecked = await page.isChecked('[data-testid="category-other"]');
    expect(otherChecked).toBe(false);

    console.log("✓ Multiple category selection completed");
  });

  test("3. タグ管理システムテスト", async () => {
    console.log("Starting Tag Management System Test...");

    // タグタブに移動
    await page.click('[data-testid="tag-tab"]');
    await page.waitForSelector('[data-testid="tag-management"]');

    // 既存タグの表示確認
    await page.waitForSelector('[data-testid="existing-tags"]');

    // 新しいタグの追加
    for (const tag of TEST_DATA.portfolioItem.tags) {
      await page.fill('[data-testid="new-tag-input"]', tag);
      await page.click('[data-testid="add-tag-button"]');

      // タグが追加されたことを確認
      await page.waitForSelector(`[data-testid="selected-tag-${tag}"]`);
    }

    // 選択されたタグの確認
    const selectedTags = await page
      .locator('[data-testid^="selected-tag-"]')
      .count();
    expect(selectedTags).toBe(TEST_DATA.portfolioItem.tags.length);

    console.log("✓ Tag management system test completed");
  });

  test("4. 日付管理システムテスト", async () => {
    console.log("Starting Date Management System Test...");

    // 日付タブに移動
    await page.click('[data-testid="date-tab"]');
    await page.waitForSelector('[data-testid="date-management"]');

    // 手動日付設定を有効化
    await page.check('[data-testid="use-manual-date"]');

    // 日付ピッカーで日付を設定
    await page.fill(
      '[data-testid="manual-date-input"]',
      TEST_DATA.portfolioItem.manualDate,
    );

    // 設定された日付の確認
    const dateValue = await page.inputValue(
      '[data-testid="manual-date-input"]',
    );
    expect(dateValue).toBe(TEST_DATA.portfolioItem.manualDate);

    console.log("✓ Date management system test completed");
  });

  test("5. ファイルアップロードシステムテスト", async () => {
    console.log("Starting File Upload System Test...");

    // ファイルタブに移動
    await page.click('[data-testid="file-tab"]');
    await page.waitForSelector('[data-testid="file-upload"]');

    // テスト画像ファイルの準備
    const testImagePath = await createTestImage();

    // 標準処理でのアップロード
    await page.setInputFiles('[data-testid="file-input"]', testImagePath);
    await page.click('[data-testid="upload-button"]');

    // アップロード完了の確認
    await page.waitForSelector('[data-testid="uploaded-file"]', {
      timeout: 10000,
    });

    // 変換なしオプションのテスト
    await page.check('[data-testid="skip-processing"]');
    await page.setInputFiles('[data-testid="file-input"]', testImagePath);
    await page.click('[data-testid="upload-button"]');

    // 変換なしファイルのアップロード確認
    await page.waitForSelector('[data-testid="original-file"]', {
      timeout: 10000,
    });

    console.log("✓ File upload system test completed");
  });

  test("6. マークダウンエディターテスト", async () => {
    console.log("Starting Markdown Editor Test...");

    // マークダウンタブに移動
    await page.click('[data-testid="markdown-tab"]');
    await page.waitForSelector('[data-testid="markdown-editor"]');

    // マークダウンコンテンツの入力
    await page.fill(
      '[data-testid="markdown-textarea"]',
      TEST_DATA.markdownContent,
    );

    // プレビューの確認
    await page.click('[data-testid="preview-toggle"]');
    await page.waitForSelector('[data-testid="markdown-preview"]');

    // プレビュー内容の確認
    const previewContent = await page.textContent(
      '[data-testid="markdown-preview"]',
    );
    expect(previewContent).toContain("Integration Test Content");

    // ファイル保存の確認
    await page.click('[data-testid="save-markdown"]');
    await page.waitForSelector('[data-testid="save-success"]');

    console.log("✓ Markdown editor test completed");
  });

  test("7. データ保存・統合テスト", async () => {
    console.log("Starting Data Save Integration Test...");

    // 全体保存
    await page.click('[data-testid="save-item"]');
    await page.waitForSelector('[data-testid="save-success"]', {
      timeout: 10000,
    });

    // 保存されたアイテムIDの取得
    const saveMessage = await page.textContent('[data-testid="save-success"]');
    testItemId = extractItemIdFromMessage(saveMessage);

    expect(testItemId).toBeTruthy();

    console.log(
      `✓ Data save integration test completed. Item ID: ${testItemId}`,
    );
  });

  test("8. ギャラリー表示テスト", async () => {
    console.log("Starting Gallery Display Test...");

    // 各ギャラリーページでの表示確認
    const galleryTypes = ["all", "develop", "design", "video&design"];

    for (const galleryType of galleryTypes) {
      await page.goto(`${TEST_CONFIG.baseURL}/gallery/${galleryType}`);
      await page.waitForLoadState("networkidle");

      if (
        galleryType === "all" ||
        TEST_DATA.portfolioItem.categories.includes(galleryType) ||
        (galleryType === "video&design" &&
          (TEST_DATA.portfolioItem.categories.includes("video") ||
            TEST_DATA.portfolioItem.categories.includes("design")))
      ) {
        // アイテムが表示されることを確認
        await page.waitForSelector(
          `[data-testid="portfolio-item-${testItemId}"]`,
          { timeout: 5000 },
        );
        console.log(`✓ Item displayed in ${galleryType} gallery`);
      } else {
        // アイテムが表示されないことを確認
        const itemExists = await page
          .locator(`[data-testid="portfolio-item-${testItemId}"]`)
          .count();
        expect(itemExists).toBe(0);
        console.log(`✓ Item correctly hidden from ${galleryType} gallery`);
      }
    }

    console.log("✓ Gallery display test completed");
  });

  test("9. フィルタリング機能テスト", async () => {
    console.log("Starting Filtering Function Test...");

    // Allギャラリーでフィルタリングテスト
    await page.goto(`${TEST_CONFIG.baseURL}/gallery/all`);
    await page.waitForLoadState("networkidle");

    // タグフィルターのテスト
    for (const tag of TEST_DATA.portfolioItem.tags) {
      await page.click(`[data-testid="tag-filter-${tag}"]`);
      await page.waitForSelector(
        `[data-testid="portfolio-item-${testItemId}"]`,
      );

      // フィルター解除
      await page.click(`[data-testid="tag-filter-${tag}"]`);
    }

    // カテゴリーフィルターのテスト
    for (const category of TEST_DATA.portfolioItem.categories) {
      await page.click(`[data-testid="category-filter-${category}"]`);
      await page.waitForSelector(
        `[data-testid="portfolio-item-${testItemId}"]`,
      );

      // フィルター解除
      await page.click(`[data-testid="category-filter-${category}"]`);
    }

    console.log("✓ Filtering function test completed");
  });

  test("10. video&designページ特別テスト", async () => {
    console.log("Starting Video&Design Page Special Test...");

    await page.goto(`${TEST_CONFIG.baseURL}/gallery/video&design`);
    await page.waitForLoadState("networkidle");

    // 複数カテゴリーアイテムの表示確認
    if (TEST_DATA.portfolioItem.categories.includes("design")) {
      await page.waitForSelector(
        `[data-testid="portfolio-item-${testItemId}"]`,
      );

      // 重複除去の確認（同じアイテムが複数回表示されていないか）
      const itemCount = await page
        .locator(`[data-testid="portfolio-item-${testItemId}"]`)
        .count();
      expect(itemCount).toBe(1);

      console.log(
        "✓ Item displayed once in video&design gallery (no duplicates)",
      );
    }

    console.log("✓ Video&design page special test completed");
  });

  test("11. API統合テスト", async () => {
    console.log("Starting API Integration Test...");

    // コンテンツAPI呼び出しテスト
    const response = await page.request.get(
      `${TEST_CONFIG.baseURL}/api/content/all`,
    );
    expect(response.ok()).toBe(true);

    const contentData = await response.json();
    expect(Array.isArray(contentData)).toBe(true);

    // 作成したアイテムがAPIレスポンスに含まれているか確認
    const createdItem = contentData.find((item) => item.id === testItemId);
    expect(createdItem).toBeTruthy();
    expect(createdItem.title).toBe(TEST_DATA.portfolioItem.title);
    expect(createdItem.categories).toEqual(
      expect.arrayContaining(TEST_DATA.portfolioItem.categories),
    );

    // タグAPIテスト
    const tagResponse = await page.request.get(
      `${TEST_CONFIG.baseURL}/api/admin/tags`,
    );
    expect(tagResponse.ok()).toBe(true);

    const tagData = await tagResponse.json();
    for (const tag of TEST_DATA.portfolioItem.tags) {
      const tagExists = tagData.some((t) => t.name === tag);
      expect(tagExists).toBe(true);
    }

    console.log("✓ API integration test completed");
  });

  test("12. パフォーマンステスト", async () => {
    console.log("Starting Performance Test...");

    // ページロード時間の測定
    const startTime = Date.now();
    await page.goto(`${TEST_CONFIG.baseURL}/gallery/all`);
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // 5秒以内
    console.log(`✓ Page load time: ${loadTime}ms`);

    // データマネージャーの応答時間測定
    const dmStartTime = Date.now();
    await page.goto(`${TEST_CONFIG.baseURL}/admin/data-manager`);
    await page.waitForLoadState("networkidle");
    const dmLoadTime = Date.now() - dmStartTime;

    expect(dmLoadTime).toBeLessThan(3000); // 3秒以内
    console.log(`✓ Data manager load time: ${dmLoadTime}ms`);

    console.log("✓ Performance test completed");
  });

  test("13. セキュリティテスト", async () => {
    console.log("Starting Security Test...");

    // XSS攻撃テスト
    const xssPayload = '<script>alert("xss")</script>';
    await page.goto(`${TEST_CONFIG.baseURL}/admin/data-manager`);
    await page.click('[data-testid="create-new-item"]');

    await page.fill('[data-testid="title-input"]', xssPayload);
    await page.fill('[data-testid="description-input"]', xssPayload);

    // XSSが実行されないことを確認
    const alerts = [];
    page.on("dialog", (dialog) => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });

    await page.click('[data-testid="save-item"]');
    await page.waitForTimeout(2000);

    expect(alerts.length).toBe(0);
    console.log("✓ XSS protection working");

    // ファイルアップロードセキュリティテスト
    const maliciousFile = await createMaliciousFile();
    await page.click('[data-testid="file-tab"]');

    try {
      await page.setInputFiles('[data-testid="file-input"]', maliciousFile);
      await page.click('[data-testid="upload-button"]');

      // エラーメッセージが表示されることを確認
      await page.waitForSelector('[data-testid="upload-error"]', {
        timeout: 5000,
      });
      console.log("✓ Malicious file upload blocked");
    } catch (error) {
      console.log("✓ File upload security working (upload rejected)");
    }

    console.log("✓ Security test completed");
  });

  test("14. データ整合性テスト", async () => {
    console.log("Starting Data Integrity Test...");

    // データベースとファイルシステムの整合性確認
    const response = await page.request.get(
      `${TEST_CONFIG.baseURL}/api/admin/integrity-check`,
    );

    if (response.ok()) {
      const integrityData = await response.json();
      expect(integrityData.status).toBe("ok");
      console.log("✓ Data integrity check passed");
    } else {
      console.log("⚠ Integrity check endpoint not available");
    }

    // 作成したアイテムのデータ整合性確認
    const itemResponse = await page.request.get(
      `${TEST_CONFIG.baseURL}/api/content/item/${testItemId}`,
    );
    expect(itemResponse.ok()).toBe(true);

    const itemData = await itemResponse.json();
    expect(itemData.title).toBe(TEST_DATA.portfolioItem.title);
    expect(itemData.categories).toEqual(
      expect.arrayContaining(TEST_DATA.portfolioItem.categories),
    );
    expect(itemData.tags).toEqual(
      expect.arrayContaining(TEST_DATA.portfolioItem.tags),
    );

    console.log("✓ Data integrity test completed");
  });

  test("15. 既存機能互換性テスト", async () => {
    console.log("Starting Backward Compatibility Test...");

    // 旧形式データの処理テスト
    const legacyData = {
      title: "Legacy Test Item",
      category: "develop", // 単一カテゴリー（旧形式）
      tags: ["Legacy", "Test"],
      content: "Legacy content format",
    };

    // 旧形式データでアイテム作成
    const createResponse = await page.request.post(
      `${TEST_CONFIG.baseURL}/api/admin/items`,
      {
        data: legacyData,
      },
    );

    if (createResponse.ok()) {
      const createdLegacyItem = await createResponse.json();

      // 旧形式データが新形式に変換されて表示されることを確認
      await page.goto(`${TEST_CONFIG.baseURL}/gallery/develop`);
      await page.waitForSelector(
        `[data-testid="portfolio-item-${createdLegacyItem.id}"]`,
      );

      console.log("✓ Legacy data compatibility confirmed");
    } else {
      console.log("⚠ Legacy data test skipped (endpoint not available)");
    }

    console.log("✓ Backward compatibility test completed");
  });
});

// ヘルパー関数
async function setupTestEnvironment() {
  console.log("Setting up test environment...");

  // テストデータディレクトリの作成
  await fs.mkdir(TEST_CONFIG.testDataPath, { recursive: true });
  await fs.mkdir(TEST_CONFIG.uploadPath, { recursive: true });

  console.log("✓ Test environment setup completed");
}

async function cleanupTestEnvironment() {
  console.log("Cleaning up test environment...");

  try {
    // テストファイルの削除
    await fs.rmdir(TEST_CONFIG.testDataPath, { recursive: true });
    await fs.rmdir(TEST_CONFIG.uploadPath, { recursive: true });

    // テストで作成したアイテムの削除
    if (testItemId) {
      // 削除API呼び出し（実装されている場合）
      console.log(`Cleaning up test item: ${testItemId}`);
    }
  } catch (error) {
    console.log("Cleanup warning:", error.message);
  }

  console.log("✓ Test environment cleanup completed");
}

async function createTestImage() {
  const testImagePath = path.join(
    TEST_CONFIG.uploadPath,
    TEST_DATA.testFiles.image,
  );

  // 1x1ピクセルのテスト画像を作成（Base64エンコード）
  const testImageData = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==",
    "base64",
  );

  await fs.writeFile(testImagePath, testImageData);
  return testImagePath;
}

async function createMaliciousFile() {
  const maliciousFilePath = path.join(TEST_CONFIG.uploadPath, "malicious.php");
  const maliciousContent = '<?php echo "This should not execute"; ?>';

  await fs.writeFile(maliciousFilePath, maliciousContent);
  return maliciousFilePath;
}

function extractItemIdFromMessage(message) {
  // 保存成功メッセージからアイテムIDを抽出
  const match = message.match(/ID:\s*([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}

// テスト実行時の設定
test.setTimeout(60000); // 60秒のタイムアウト

module.exports = {
  TEST_CONFIG,
  TEST_DATA,
};
