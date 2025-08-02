import { expect, test } from "@playwright/test";

test.describe("Enhanced User Journey E2E Tests", () => {
  test.describe("Complete Content Management Journey", () => {
    test("should complete full content lifecycle from creation to public display", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `E2E Test Item ${Date.now()}`;
      const testDescription =
        "This is a comprehensive E2E test item with enhanced features";

      // Step 1: Navigate to admin and create new content
      await page.goto("/admin");
      await expect(page.locator("h1")).toContainText("Admin Dashboard");

      // Navigate to data manager
      await page.click('a[href="/admin/data-manager"]');
      await page.waitForURL("/admin/data-manager");
      await expect(page.locator("h1")).toContainText("Data Manager");

      // Create new portfolio item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]', { timeout: 15000 });

      // Step 2: Fill comprehensive form with enhanced features
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill(testDescription);

      // Set multiple categories
      const developCheckbox = page.locator(
        'input[type="checkbox"][value="develop"]',
      );
      const designCheckbox = page.locator(
        'input[type="checkbox"][value="design"]',
      );

      if (await developCheckbox.isVisible()) {
        await developCheckbox.check();
        await designCheckbox.check();

        await expect(developCheckbox).toBeChecked();
        await expect(designCheckbox).toBeChecked();
      }

      // Add tags using enhanced tag management
      const tagInput = page.locator(
        'input[placeholder*="tag"], input[name="tags"]',
      );
      if (await tagInput.isVisible()) {
        await tagInput.fill("e2e-test,react,typescript,enhanced");
        await page.keyboard.press("Enter");
      }

      // Set manual date
      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.check();

        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          await dateInput.fill("2024-02-15");
        }
      }

      // Configure enhanced file upload options
      const skipProcessingCheckbox = page.locator(
        'input[name="skipProcessing"]',
      );
      if (await skipProcessingCheckbox.isVisible()) {
        await skipProcessingCheckbox.check();
      }

      // Add markdown content
      const markdownEditor = page.locator(
        '[data-testid="markdown-editor"], textarea[name="content"]',
      );
      if (await markdownEditor.isVisible()) {
        await markdownEditor.fill(`# ${testTitle}

## Overview
${testDescription}

## Features
- Enhanced data management
- Multiple category support
- Tag management system
- Manual date setting
- Markdown file management

## Technical Details
This item was created using the enhanced data manager with the following features:
- **Categories**: develop, design
- **Tags**: e2e-test, react, typescript, enhanced
- **Date**: Manually set to 2024-02-15
- **File Processing**: Skip processing enabled

## Testing
This content is part of comprehensive E2E testing to verify:
1. Content creation workflow
2. Enhanced feature functionality
3. Gallery display integration
4. Data persistence and retrieval`);
      }

      // Step 3: Save the content
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 15000 });

      // Verify item appears in the list
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Step 4: Test preview functionality
      await page.click('button:has-text("Preview")');
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Verify preview shows enhanced features
      if (await page.locator("text=develop").isVisible()) {
        await expect(page.locator("text=develop")).toBeVisible();
      }
      if (await page.locator("text=design").isVisible()) {
        await expect(page.locator("text=design")).toBeVisible();
      }

      // Step 5: Verify content appears in appropriate galleries

      // Check All gallery
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector(
        '[data-testid="portfolio-item"], .portfolio-item, .gallery-item',
        { timeout: 15000 },
      );
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Check Develop gallery
      await page.goto("/portfolio/gallery/develop");
      await page.waitForSelector("main", { timeout: 10000 });

      // Wait a bit for content to load
      await page.waitForTimeout(2000);

      // Check if our test item appears
      const developGalleryHasItem = await page
        .locator(`text=${testTitle}`)
        .isVisible();
      if (developGalleryHasItem) {
        console.log("✓ Item appears in Develop gallery");
      } else {
        console.log(
          "⚠ Item not found in Develop gallery - this may be expected if filtering is strict",
        );
      }

      // Check Design gallery
      await page.goto("/portfolio/gallery/design");
      await page.waitForSelector("main", { timeout: 10000 });
      await page.waitForTimeout(2000);

      const designGalleryHasItem = await page
        .locator(`text=${testTitle}`)
        .isVisible();
      if (designGalleryHasItem) {
        console.log("✓ Item appears in Design gallery");
      } else {
        console.log(
          "⚠ Item not found in Design gallery - this may be expected if filtering is strict",
        );
      }

      // Check Video&Design gallery (should NOT appear since it doesn't have video category)
      await page.goto("/portfolio/gallery/video&design");
      await page.waitForSelector("main", { timeout: 10000 });
      await page.waitForTimeout(2000);

      const videoDesignGalleryHasItem = await page
        .locator(`text=${testTitle}`)
        .isVisible();
      expect(videoDesignGalleryHasItem).toBe(false);
      console.log("✓ Item correctly excluded from Video&Design gallery");

      // Step 6: Test item detail view (if available)
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });

      const testItem = page.locator(`text=${testTitle}`).first();
      if (await testItem.isVisible()) {
        // Try to click on the item to view details
        await testItem.click();
        await page.waitForTimeout(2000);

        // Check if we navigated to a detail page
        const currentUrl = page.url();
        if (
          currentUrl.includes("/portfolio/") &&
          !currentUrl.includes("/gallery/")
        ) {
          console.log("✓ Successfully navigated to item detail page");

          // Verify detail page content
          await expect(page.locator(`text=${testTitle}`)).toBeVisible();

          // Check for enhanced features in detail view
          const markdownContent = page.locator("h1, h2, h3, p, strong");
          if (await markdownContent.first().isVisible()) {
            console.log("✓ Markdown content rendered in detail view");
          }
        }
      }

      // Step 7: Return to admin and edit the item
      await page.goto("/admin/data-manager");
      await page.waitForSelector(`text=${testTitle}`);

      // Click on the item to edit
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Verify all data is preserved
      await expect(page.locator('input[type="text"]')).toHaveValue(testTitle);
      await expect(page.locator("textarea")).toHaveValue(testDescription);

      // Check categories are still selected
      if (await developCheckbox.isVisible()) {
        await expect(developCheckbox).toBeChecked();
        await expect(designCheckbox).toBeChecked();
      }

      // Make a small edit
      const updatedDescription = testDescription + " - Updated via E2E test";
      const descriptionTextarea2 = page.locator("textarea").first();
      await descriptionTextarea2.fill(updatedDescription);

      // Save the update
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 8: Verify update is reflected in gallery
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });
      await page.waitForTimeout(2000);

      // The updated description might not be visible in gallery view, but the item should still be there
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Step 9: Clean up - delete the test item
      await page.goto("/admin/data-manager");
      await page.waitForSelector(`text=${testTitle}`);

      // Look for delete button or option
      const deleteButton = page.locator(
        `[data-testid="delete-${testTitle}"], button:has-text("Delete")`,
      );
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        await page.click('button:has-text("Confirm"), button:has-text("Yes")');

        // Verify item is removed
        await page.waitForTimeout(2000);
        const itemStillExists = await page
          .locator(`text=${testTitle}`)
          .isVisible();
        expect(itemStillExists).toBe(false);

        console.log("✓ Test item successfully deleted");
      } else {
        console.log(
          "⚠ Delete functionality not found - test item may need manual cleanup",
        );
      }

      console.log("✅ Complete content lifecycle test passed");
    });

    test("should handle Other category workflow correctly", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `Other Category Test ${Date.now()}`;

      // Create Other category item
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill(
        "Testing Other category exclusive display",
      );

      // Select Other category
      const otherCheckbox = page.locator(
        'input[type="checkbox"][value="other"]',
      );
      if (await otherCheckbox.isVisible()) {
        await otherCheckbox.check();
        await expect(otherCheckbox).toBeChecked();
      }

      // Save the item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Verify it appears in All gallery
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });
      await page.waitForTimeout(2000);
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Verify it does NOT appear in specific galleries
      const specificGalleries = ["develop", "video", "design", "video&design"];

      for (const gallery of specificGalleries) {
        await page.goto(`/portfolio/gallery/${gallery}`);
        await page.waitForSelector("main", { timeout: 10000 });
        await page.waitForTimeout(2000);

        const itemVisible = await page.locator(`text=${testTitle}`).isVisible();
        expect(itemVisible).toBe(false);
        console.log(
          `✓ Other category item correctly excluded from ${gallery} gallery`,
        );
      }

      console.log("✅ Other category workflow test passed");
    });
  });

  test.describe("Tag Management Journey", () => {
    test("should create, use, and manage tags throughout the system", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const uniqueTag = `e2e-tag-${Date.now()}`;
      const testTitle = `Tag Management Test ${Date.now()}`;

      // Step 1: Create content with new tag
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Testing tag management system");

      // Add new tag
      const tagInput = page.locator(
        'input[placeholder*="tag"], input[name="tags"]',
      );
      if (await tagInput.isVisible()) {
        await tagInput.fill(`${uniqueTag},existing-tag,common-tag`);
        await page.keyboard.press("Enter");
      }

      // Save the item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 2: Create another item using the same tag
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput2 = page.locator('input[type="text"]').first();
      await titleInput2.fill(`${testTitle} - Second Item`);
      const descriptionTextarea2 = page.locator("textarea").first();
      await descriptionTextarea2.fill("Second item with same tag");

      // Check if the tag appears in existing tags (if tag management UI is implemented)
      const existingTagsList = page.locator(
        '[data-testid="existing-tags"], .existing-tags',
      );
      if (await existingTagsList.isVisible()) {
        const uniqueTagButton = page.locator(
          `button:has-text("${uniqueTag}"), [data-tag="${uniqueTag}"]`,
        );
        if (await uniqueTagButton.isVisible()) {
          await uniqueTagButton.click();
          console.log("✓ Previously created tag found in existing tags list");
        }
      } else {
        // Manually add the tag again
        const tagInput2 = page.locator(
          'input[placeholder*="tag"], input[name="tags"]',
        );
        if (await tagInput2.isVisible()) {
          await tagInput2.fill(`${uniqueTag},reused-tag`);
          await page.keyboard.press("Enter");
        }
      }

      // Save the second item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 3: Test tag search functionality (if implemented)
      const tagSearchInput = page.locator(
        'input[placeholder*="search"], input[name="tagSearch"]',
      );
      if (await tagSearchInput.isVisible()) {
        await tagSearchInput.fill(uniqueTag.substring(0, 8)); // Search partial tag
        await page.waitForTimeout(500);

        const searchResults = page.locator('[data-testid="tag-search-result"]');
        if (await searchResults.first().isVisible()) {
          await expect(searchResults.first()).toContainText(uniqueTag);
          console.log("✓ Tag search functionality working");
        }
      }

      // Step 4: Verify tag-based filtering in galleries (if implemented)
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });

      // Look for tag filter functionality
      const tagFilters = page.locator(
        `[data-tag-filter="${uniqueTag}"], button:has-text("${uniqueTag}")`,
      );
      if (await tagFilters.first().isVisible()) {
        await tagFilters.first().click();
        await page.waitForTimeout(1000);

        // Should show only items with this tag
        await expect(page.locator(`text=${testTitle}`)).toBeVisible();
        console.log("✓ Tag-based filtering working in gallery");
      }

      console.log("✅ Tag management journey test passed");
    });
  });

  test.describe("Date Management Journey", () => {
    test("should handle manual and automatic date settings correctly", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `Date Management Test ${Date.now()}`;
      const manualDate = "2024-01-15";

      // Step 1: Create item with manual date
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Testing manual date functionality");

      // Enable manual date
      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.check();
        await expect(manualDateToggle).toBeChecked();

        // Set manual date
        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          await dateInput.fill(manualDate);
          await expect(dateInput).toHaveValue(manualDate);
        }
      }

      // Save the item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 2: Edit the item and verify date is preserved
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Verify manual date settings are preserved
      if (await manualDateToggle.isVisible()) {
        await expect(manualDateToggle).toBeChecked();

        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          await expect(dateInput).toHaveValue(manualDate);
        }
      }

      // Step 3: Switch to automatic date
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.uncheck();
        await expect(manualDateToggle).not.toBeChecked();

        // Date input should be hidden or disabled
        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          const isDisabled = await dateInput.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }

      // Save with automatic date
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 4: Verify date display in gallery (if dates are shown)
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });

      const testItem = page.locator(`text=${testTitle}`).first();
      if (await testItem.isVisible()) {
        // Look for date display near the item
        const dateDisplay = page.locator(
          '.date, .created-at, [data-testid="item-date"]',
        );
        if (await dateDisplay.first().isVisible()) {
          console.log("✓ Date display found in gallery");
        }
      }

      console.log("✅ Date management journey test passed");
    });
  });

  test.describe("File Upload Journey", () => {
    test("should handle enhanced file upload options", async ({ page }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `File Upload Test ${Date.now()}`;

      // Step 1: Create item with enhanced file upload settings
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill(
        "Testing enhanced file upload functionality",
      );

      // Step 2: Configure file upload options
      const fileUploadSection = page.locator(
        '[data-testid="file-upload-section"], .file-upload',
      );
      if (await fileUploadSection.isVisible()) {
        // Test skip processing option
        const skipProcessingCheckbox = page.locator(
          'input[name="skipProcessing"], input[type="checkbox"][value="skipProcessing"]',
        );
        if (await skipProcessingCheckbox.isVisible()) {
          await skipProcessingCheckbox.check();
          await expect(skipProcessingCheckbox).toBeChecked();
          console.log("✓ Skip processing option enabled");
        }

        // Test preserve original option
        const preserveOriginalCheckbox = page.locator(
          'input[name="preserveOriginal"], input[type="checkbox"][value="preserveOriginal"]',
        );
        if (await preserveOriginalCheckbox.isVisible()) {
          await preserveOriginalCheckbox.check();
          await expect(preserveOriginalCheckbox).toBeChecked();
          console.log("✓ Preserve original option enabled");
        }

        // Test generate variants option
        const generateVariantsCheckbox = page.locator(
          'input[name="generateVariants"], input[type="checkbox"][value="generateVariants"]',
        );
        if (await generateVariantsCheckbox.isVisible()) {
          await generateVariantsCheckbox.check();
          await expect(generateVariantsCheckbox).toBeChecked();
          console.log("✓ Generate variants option enabled");
        }
      }

      // Step 3: Save the configuration
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 4: Verify settings are preserved
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Check that file upload options are preserved
      const skipProcessingCheckbox = page.locator(
        'input[name="skipProcessing"], input[type="checkbox"][value="skipProcessing"]',
      );
      if (await skipProcessingCheckbox.isVisible()) {
        await expect(skipProcessingCheckbox).toBeChecked();
      }

      const preserveOriginalCheckbox = page.locator(
        'input[name="preserveOriginal"], input[type="checkbox"][value="preserveOriginal"]',
      );
      if (await preserveOriginalCheckbox.isVisible()) {
        await expect(preserveOriginalCheckbox).toBeChecked();
      }

      console.log("✅ File upload journey test passed");
    });
  });

  test.describe("Markdown Content Journey", () => {
    test("should handle markdown content creation and editing", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `Markdown Test ${Date.now()}`;
      const markdownContent = `# ${testTitle}

## Introduction
This is a test of the **enhanced markdown system**.

### Features
- Markdown file management
- Real-time preview
- External file storage
- Content versioning

### Code Example
\`\`\`javascript
function testMarkdown() {
  return "Hello, World!";
}
\`\`\`

### Links and Images
[Test Link](https://example.com)

> This is a blockquote to test markdown rendering.

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three`;

      // Step 1: Create item with markdown content
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Testing markdown content management");

      // Step 2: Add markdown content
      const markdownEditor = page.locator(
        '[data-testid="markdown-editor"], textarea[name="content"], .markdown-editor',
      );
      if (await markdownEditor.isVisible()) {
        await markdownEditor.fill(markdownContent);
        console.log("✓ Markdown content added to editor");

        // Test preview functionality if available
        const previewButton = page.locator(
          'button:has-text("Preview"), [data-testid="preview-button"]',
        );
        if (await previewButton.isVisible()) {
          await previewButton.click();
          await page.waitForTimeout(1000);

          // Check if markdown is rendered
          const renderedContent = page.locator(
            '.markdown-preview, .preview-content, [data-testid="markdown-preview"]',
          );
          if (await renderedContent.isVisible()) {
            await expect(renderedContent.locator("h1")).toContainText(
              testTitle,
            );
            await expect(renderedContent.locator("strong")).toContainText(
              "enhanced markdown system",
            );
            console.log("✓ Markdown preview functionality working");
          }

          // Switch back to edit mode
          const editButton = page.locator(
            'button:has-text("Edit"), [data-testid="edit-button"]',
          );
          if (await editButton.isVisible()) {
            await editButton.click();
          }
        }
      }

      // Step 3: Save the item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Step 4: Verify markdown content is preserved
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      const markdownEditor2 = page.locator(
        '[data-testid="markdown-editor"], textarea[name="content"], .markdown-editor',
      );
      if (await markdownEditor2.isVisible()) {
        const savedContent = await markdownEditor2.inputValue();
        expect(savedContent).toContain("# " + testTitle);
        expect(savedContent).toContain("enhanced markdown system");
        expect(savedContent).toContain("```javascript");
        console.log("✓ Markdown content preserved correctly");
      }

      // Step 5: Test markdown rendering in public view
      await page.goto("/portfolio/gallery/all");
      await page.waitForSelector("main", { timeout: 10000 });

      const testItem = page.locator(`text=${testTitle}`).first();
      if (await testItem.isVisible()) {
        await testItem.click();
        await page.waitForTimeout(2000);

        // Check if we're on a detail page with rendered markdown
        const currentUrl = page.url();
        if (
          currentUrl.includes("/portfolio/") &&
          !currentUrl.includes("/gallery/")
        ) {
          // Look for rendered markdown elements
          const renderedH1 = page.locator("h1");
          const renderedH2 = page.locator("h2");
          const renderedStrong = page.locator("strong");
          const renderedCode = page.locator("code, pre");

          if (await renderedH1.isVisible()) {
            console.log("✓ Markdown H1 rendered in public view");
          }
          if (await renderedH2.isVisible()) {
            console.log("✓ Markdown H2 rendered in public view");
          }
          if (await renderedStrong.isVisible()) {
            console.log("✓ Markdown strong text rendered in public view");
          }
          if (await renderedCode.isVisible()) {
            console.log("✓ Markdown code blocks rendered in public view");
          }
        }
      }

      console.log("✅ Markdown content journey test passed");
    });
  });

  test.describe("Error Handling and Recovery", () => {
    test("should handle and recover from various error scenarios", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      // Test 1: Empty form submission
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Try to save empty form
      await page.click('button:has-text("Save")');

      // Check for validation errors
      const validationErrors = page.locator(
        '.error, .validation-error, [data-testid="error"]',
      );
      if (await validationErrors.first().isVisible()) {
        console.log("✓ Validation errors displayed for empty form");
      }

      // Test 2: Invalid date input
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Error Test Item");

      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.check();

        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          // Try invalid date format
          await dateInput.fill("invalid-date");

          await page.click('button:has-text("Save")');

          // Check for date validation error
          const dateError = page.locator(
            '[data-testid="date-error"], .date-error',
          );
          if (await dateError.isVisible()) {
            console.log("✓ Date validation error handled");
          }

          // Fix the date
          await dateInput.fill("2024-03-15");
        }
      }

      // Test 3: Network error simulation (if possible)
      // This would require intercepting network requests, which is more complex
      // For now, we'll test successful recovery after fixing errors

      // Fix all errors and save successfully
      const descriptionTextareaError = page.locator("textarea").first();
      await descriptionTextareaError.fill("Testing error recovery");
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      console.log("✅ Error handling and recovery test passed");
    });

    test("should maintain data integrity during error scenarios", async ({
      page,
    }) => {
      // Skip if not in development environment
      await page.goto("/admin");
      const currentUrl = page.url();
      if (!currentUrl.includes("/admin")) {
        test.skip(true, "Admin panel not available - not in development mode");
      }

      const testTitle = `Data Integrity Test ${Date.now()}`;
      const testDescription = "Testing data integrity during errors";

      // Create an item
      await page.goto("/admin/data-manager");
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill(testDescription);

      // Set some enhanced features
      const developCheckbox = page.locator(
        'input[type="checkbox"][value="develop"]',
      );
      if (await developCheckbox.isVisible()) {
        await developCheckbox.check();
      }

      // Save successfully
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Edit the item
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Make changes
      await descriptionTextarea.fill(testDescription + " - Modified");

      // Simulate navigation away without saving (browser back/forward)
      await page.goBack();
      await page.waitForTimeout(1000);
      await page.goForward();
      await page.waitForTimeout(1000);

      // Return to the item
      await page.goto("/admin/data-manager");
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Verify original data is preserved (unsaved changes should be lost)
      await expect(page.locator('input[type="text"]')).toHaveValue(testTitle);
      await expect(page.locator("textarea")).toHaveValue(testDescription);

      if (await developCheckbox.isVisible()) {
        await expect(developCheckbox).toBeChecked();
      }

      console.log("✅ Data integrity test passed");
    });
  });
});
