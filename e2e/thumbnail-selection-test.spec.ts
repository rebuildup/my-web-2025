import { expect, test } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

test.describe("Thumbnail Selection and Save Test", () => {
  let originalPortfolioData: unknown;
  const portfolioPath = path.join(
    process.cwd(),
    "public/data/content/portfolio.json",
  );

  test.beforeAll(async () => {
    // Backup original portfolio data
    try {
      const content = await fs.readFile(portfolioPath, "utf-8");
      originalPortfolioData = JSON.parse(content);
    } catch {
      console.log("No existing portfolio data found");
      originalPortfolioData = [];
    }
  });

  test.afterAll(async () => {
    // Restore original data
    if (originalPortfolioData) {
      await fs.writeFile(
        portfolioPath,
        JSON.stringify(originalPortfolioData, null, 2),
      );
    }
  });

  test("should allow thumbnail selection and save correctly", async ({
    page,
  }) => {
    // Navigate to data manager
    await page.goto("/admin/data-manager");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Select portfolio content type (should be default)
    await page.click('button:has-text("Portfolio")');

    // Create new portfolio item
    await page.click('button:has-text("新規作成")');

    // Wait for form to appear
    await page.waitForSelector('input[placeholder*="タイトル"]');

    // Fill basic information
    await page.fill('input[placeholder*="タイトル"]', "Test Thumbnail Item");
    await page.fill(
      'textarea[placeholder*="説明"]',
      "Testing thumbnail selection functionality",
    );

    // Navigate to media tab
    await page.click('button:has-text("メディア")');

    // Wait for media section to load
    await page.waitForSelector('h3:has-text("Images & Files")');

    // Add test images via URL (simulating uploaded images)
    const testImages = [
      "/images/portfolio/test-image-1.jpg",
      "/images/portfolio/test-image-2.jpg",
      "/images/portfolio/test-image-3.jpg",
    ];

    // Add images via manual URL input
    for (const imageUrl of testImages) {
      await page.fill(
        'input[placeholder*="https://example.com/image.jpg"]',
        imageUrl,
      );
      await page.press(
        'input[placeholder*="https://example.com/image.jpg"]',
        "Enter",
      );
      await page.waitForTimeout(500); // Wait for image to be added
    }

    // Verify images were added
    const imageCount = await page.locator(".grid img").count();
    console.log(`Added ${imageCount} images`);
    expect(imageCount).toBeGreaterThan(0);

    // Check if thumbnail selector is visible
    const thumbnailSelect = page.locator(
      'select:has(option:has-text("Select thumbnail"))',
    );
    await expect(thumbnailSelect).toBeVisible();

    // Select the second image as thumbnail
    await thumbnailSelect.selectOption({ index: 2 }); // Select "Image 2"

    // Verify thumbnail selection
    const selectedValue = await thumbnailSelect.inputValue();
    console.log("Selected thumbnail value:", selectedValue);
    expect(selectedValue).toBe(testImages[1]);

    // Go back to basic tab to save
    await page.click('button:has-text("基本情報")');

    // Save the item
    await page.click('button[type="submit"]');

    // Wait for save to complete
    await page.waitForSelector('span:has-text("保存完了")', { timeout: 10000 });

    // Verify the data was saved correctly
    await page.waitForTimeout(2000); // Wait for file write

    // Read the saved data
    const savedContent = await fs.readFile(portfolioPath, "utf-8");
    const savedData = JSON.parse(savedContent);

    // Find the saved item
    const savedItem = savedData.find(
      (item: { title: string }) => item.title === "Test Thumbnail Item",
    );

    console.log("Saved item:", JSON.stringify(savedItem, null, 2));

    // Verify the item was saved with correct thumbnail
    expect(savedItem).toBeDefined();
    expect(savedItem.thumbnail).toBe(testImages[1]);
    expect(savedItem.images).toEqual(testImages);

    console.log("✓ Thumbnail selection and save test passed");
  });

  test("should fix missing thumbnails with repair function", async ({
    page,
  }) => {
    // First, create an item without thumbnail (simulate the issue)
    const testItem = {
      id: `portfolio-${Date.now()}`,
      type: "portfolio",
      title: "Item Without Thumbnail",
      description: "Testing thumbnail repair",
      categories: ["video"],
      tags: [],
      status: "published",
      priority: 50,
      content: "",
      useManualDate: false,
      images: [
        "/images/portfolio/test-repair-1.jpg",
        "/images/portfolio/test-repair-2.jpg",
      ],
      videos: [],
      externalLinks: [],
      isOtherCategory: false,
      originalImages: [],
      processedImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Note: No thumbnail property
    };

    // Add the test item to portfolio data
    const currentContent = await fs.readFile(portfolioPath, "utf-8");
    const currentData = JSON.parse(currentContent);
    currentData.push(testItem);
    await fs.writeFile(portfolioPath, JSON.stringify(currentData, null, 2));

    // Navigate to data manager
    await page.goto("/admin/data-manager");
    await page.waitForLoadState("networkidle");

    // Select portfolio content type
    await page.click('button:has-text("Portfolio")');

    // Wait for content list to load
    await page.waitForTimeout(2000);

    // Click the thumbnail repair button
    await page.click('button:has-text("サムネイル修復")');

    // Confirm the repair action
    await page.click('button:has-text("OK")');

    // Wait for repair to complete
    await page.waitForSelector("text=個のアイテムのサムネイルを修復しました", {
      timeout: 10000,
    });

    // Verify the repair worked
    const repairedContent = await fs.readFile(portfolioPath, "utf-8");
    const repairedData = JSON.parse(repairedContent);

    const repairedItem = repairedData.find(
      (item: { id: string }) => item.id === testItem.id,
    );

    console.log("Repaired item:", JSON.stringify(repairedItem, null, 2));

    expect(repairedItem).toBeDefined();
    expect(repairedItem.thumbnail).toBe(testItem.images[0]);

    console.log("✓ Thumbnail repair test passed");
  });

  test("should show thumbnail selection UI correctly", async ({ page }) => {
    await page.goto("/admin/data-manager");
    await page.waitForLoadState("networkidle");

    // Create new item
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('input[placeholder*="タイトル"]');

    // Fill basic info
    await page.fill('input[placeholder*="タイトル"]', "UI Test Item");

    // Go to media tab
    await page.click('button:has-text("メディア")');

    // Initially, thumbnail selector should not be visible (no images)
    const thumbnailSelectBefore = page.locator(
      'select:has(option:has-text("Select thumbnail"))',
    );
    await expect(thumbnailSelectBefore).not.toBeVisible();

    // Add an image
    await page.fill(
      'input[placeholder*="https://example.com/image.jpg"]',
      "/images/portfolio/ui-test.jpg",
    );
    await page.press(
      'input[placeholder*="https://example.com/image.jpg"]',
      "Enter",
    );

    // Now thumbnail selector should be visible
    await expect(thumbnailSelectBefore).toBeVisible();

    // Check that the image appears in the gallery
    const imageInGallery = page.locator(
      '.grid img[src="/images/portfolio/ui-test.jpg"]',
    );
    await expect(imageInGallery).toBeVisible();

    // Check that "Thumb" button is available
    const thumbButton = page.locator('button:has-text("Thumb")');
    await expect(thumbButton).toBeVisible();

    // Click the thumb button
    await thumbButton.click();

    // Verify thumbnail was set
    const selectedThumbnail = await thumbnailSelectBefore.inputValue();
    expect(selectedThumbnail).toBe("/images/portfolio/ui-test.jpg");

    console.log("✓ Thumbnail UI test passed");
  });

  test("should debug form data submission", async ({ page }) => {
    // Enable console logging
    page.on("console", (msg) => {
      if (msg.type() === "log" || msg.type() === "error") {
        console.log(`Browser ${msg.type()}: ${msg.text()}`);
      }
    });

    // Monitor network requests
    page.on("request", (request) => {
      if (request.url().includes("/api/admin/content")) {
        console.log(`API Request: ${request.method()} ${request.url()}`);
      }
    });

    page.on("response", (response) => {
      if (response.url().includes("/api/admin/content")) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/admin/data-manager");
    await page.waitForLoadState("networkidle");

    // Create and fill form
    await page.click('button:has-text("新規作成")');
    await page.fill('input[placeholder*="タイトル"]', "Debug Test Item");

    // Add image and set thumbnail
    await page.click('button:has-text("メディア")');
    await page.fill(
      'input[placeholder*="https://example.com/image.jpg"]',
      "/images/portfolio/debug-test.jpg",
    );
    await page.press(
      'input[placeholder*="https://example.com/image.jpg"]',
      "Enter",
    );

    // Wait for image to be added
    await page.waitForTimeout(1000);

    // Set as thumbnail using dropdown
    const thumbnailSelect = page.locator(
      'select:has(option:has-text("Select thumbnail"))',
    );
    await thumbnailSelect.selectOption("/images/portfolio/debug-test.jpg");

    // Go back to basic tab and save
    await page.click('button:has-text("基本情報")');

    // Submit form and capture the request
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    console.log("✓ Debug test completed - check console logs above");
  });
});
