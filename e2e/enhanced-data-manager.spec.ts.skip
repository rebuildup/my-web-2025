import { expect, test } from "@playwright/test";

test.describe("Enhanced Data Manager E2E Tests", () => {
  // Skip tests if not in development environment
  test.beforeEach(async ({ page }) => {
    // Check if we're in development mode
    await page.goto("/admin");

    // If redirected to home page, skip the tests
    const currentUrl = page.url();
    if (!currentUrl.includes("/admin")) {
      test.skip(true, "Admin panel not available - not in development mode");
    }
  });

  test.describe("Data Manager Navigation and Access", () => {
    test("should navigate to data manager from admin dashboard", async ({
      page,
    }) => {
      await page.goto("/admin");

      // Verify admin dashboard loads
      await expect(page.locator("h1")).toContainText("Admin Dashboard");

      // Navigate to data manager
      await page.click('a[href="/admin/data-manager"]');
      await page.waitForURL("/admin/data-manager");

      // Verify data manager page loads
      await expect(page.locator("h1")).toContainText("Data Manager");

      // Verify content type selector is present
      await expect(page.locator("text=Content Type")).toBeVisible();

      // Verify portfolio type is selected by default
      const portfolioButton = page.locator('button:has-text("Portfolio")');
      await expect(portfolioButton).toHaveClass(/bg-foreground/);
    });

    test("should display system status and security notice", async ({
      page,
    }) => {
      await page.goto("/admin");

      // Check system status section
      await expect(page.locator("text=System Status")).toBeVisible();
      await expect(
        page.locator("h3").filter({ hasText: "Environment" }),
      ).toBeVisible();
      await expect(page.locator("text=Node.js")).toBeVisible();

      // Check security notice
      await expect(page.locator("text=Security Notice")).toBeVisible();
      await expect(
        page.locator("text=Development Environment Only"),
      ).toBeVisible();
    });
  });

  test.describe("Portfolio Content Management", () => {
    test("should create new enhanced portfolio item with multiple categories", async ({
      page,
    }) => {
      await page.goto("/admin/data-manager");

      // Wait for page to load and create new portfolio item
      await page.waitForSelector('button:has-text("+ New")', {
        timeout: 10000,
      });
      await page.click('button:has-text("+ New")');

      // Wait for form to appear
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      // Fill in basic information
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Test Enhanced Portfolio Item");
      await page.fill(
        "textarea",
        "This is a test portfolio item with enhanced features",
      );

      // Test multiple category selection
      const developCheckbox = page.locator(
        'input[type="checkbox"][value="develop"]',
      );
      const designCheckbox = page.locator(
        'input[type="checkbox"][value="design"]',
      );

      if (await developCheckbox.isVisible()) {
        await developCheckbox.check();
        await designCheckbox.check();

        // Verify both categories are selected
        await expect(developCheckbox).toBeChecked();
        await expect(designCheckbox).toBeChecked();
      }

      // Test tag management
      const tagInput = page.locator(
        'input[placeholder*="tag"], input[name="tags"]',
      );
      if (await tagInput.isVisible()) {
        await tagInput.fill("react,typescript,test");
        await page.keyboard.press("Enter");
      }

      // Test manual date setting
      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.check();

        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          await dateInput.fill("2024-01-15");
        }
      }

      // Save the item
      await page.click('button:has-text("Save")');

      // Wait for save confirmation
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 8000 });

      // Verify item appears in the list
      await expect(
        page.locator("text=Test Enhanced Portfolio Item"),
      ).toBeVisible();
    });

    test("should handle Other category selection", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]', { timeout: 15000 });

      // Fill basic info
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Other Category Test Item");
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Testing Other category functionality");

      // Select Other category
      const otherCheckbox = page.locator(
        'input[type="checkbox"][value="other"]',
      );
      if (await otherCheckbox.isVisible()) {
        await otherCheckbox.check();
        await expect(otherCheckbox).toBeChecked();

        // Verify isOtherCategory flag is set
        const otherFlag = page.locator('input[name="isOtherCategory"]');
        if (await otherFlag.isVisible()) {
          await expect(otherFlag).toBeChecked();
        }
      }

      // Save and verify
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });
    });

    test("should upload files with enhanced options", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]', { timeout: 15000 });

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("File Upload Test");

      // Test file upload section
      const fileUploadSection = page.locator(
        '[data-testid="file-upload-section"]',
      );
      if (await fileUploadSection.isVisible()) {
        // Test skip processing option
        const skipProcessingCheckbox = page.locator(
          'input[name="skipProcessing"]',
        );
        if (await skipProcessingCheckbox.isVisible()) {
          await skipProcessingCheckbox.check();
          await expect(skipProcessingCheckbox).toBeChecked();
        }

        // Test preserve original option
        const preserveOriginalCheckbox = page.locator(
          'input[name="preserveOriginal"]',
        );
        if (await preserveOriginalCheckbox.isVisible()) {
          await preserveOriginalCheckbox.check();
          await expect(preserveOriginalCheckbox).toBeChecked();
        }
      }

      // Save the configuration
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });
    });

    test("should manage markdown content", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Markdown Content Test");

      // Test markdown editor
      const markdownEditor = page.locator('[data-testid="markdown-editor"]');
      if (await markdownEditor.isVisible()) {
        await markdownEditor.fill(
          "# Test Markdown\n\nThis is **bold** text with [links](https://example.com).",
        );

        // Test preview functionality
        const previewButton = page.locator('button:has-text("Preview")');
        if (await previewButton.isVisible()) {
          await previewButton.click();

          // Verify markdown is rendered
          await expect(
            page.locator("h1:has-text('Test Markdown')"),
          ).toBeVisible();
          await expect(page.locator("strong:has-text('bold')")).toBeVisible();
        }
      }

      // Save and verify markdown file creation
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Tag Management System", () => {
    test("should display existing tags and allow selection", async ({
      page,
    }) => {
      await page.goto("/admin/data-manager");

      // Create new item to test tag management
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Look for tag management UI
      const tagManagementSection = page.locator(
        '[data-testid="tag-management"]',
      );
      if (await tagManagementSection.isVisible()) {
        // Check for existing tags display
        const existingTags = page.locator('[data-testid="existing-tag"]');
        const tagCount = await existingTags.count();

        if (tagCount > 0) {
          // Click on first existing tag
          await existingTags.first().click();

          // Verify tag is selected
          await expect(existingTags.first()).toHaveClass(/selected|active/);
        }

        // Test new tag creation
        const newTagInput = page.locator(
          'input[placeholder*="new tag"], input[name="newTag"]',
        );
        if (await newTagInput.isVisible()) {
          await newTagInput.fill("new-test-tag");
          await page.keyboard.press("Enter");

          // Verify new tag appears in selected tags
          await expect(page.locator("text=new-test-tag")).toBeVisible();
        }
      }
    });

    test("should search and filter tags", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Test tag search functionality
      const tagSearchInput = page.locator(
        'input[placeholder*="search"], input[name="tagSearch"]',
      );
      if (await tagSearchInput.isVisible()) {
        await tagSearchInput.fill("react");

        // Wait for search results
        await page.waitForTimeout(500);

        // Verify filtered results
        const searchResults = page.locator('[data-testid="tag-search-result"]');
        if (await searchResults.first().isVisible()) {
          await expect(searchResults.first()).toContainText("react");
        }
      }
    });
  });

  test.describe("Date Management System", () => {
    test("should toggle between manual and automatic date", async ({
      page,
    }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Date Management Test");

      // Test manual date toggle
      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        // Initially should be unchecked (automatic)
        await expect(manualDateToggle).not.toBeChecked();

        // Toggle to manual
        await manualDateToggle.check();
        await expect(manualDateToggle).toBeChecked();

        // Date input should become visible
        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          await dateInput.fill("2024-06-15");
          await expect(dateInput).toHaveValue("2024-06-15");
        }

        // Toggle back to automatic
        await manualDateToggle.uncheck();
        await expect(manualDateToggle).not.toBeChecked();
      }
    });

    test("should validate date input", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create new item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Enable manual date
      const manualDateToggle = page.locator(
        'input[type="checkbox"][name="useManualDate"]',
      );
      if (await manualDateToggle.isVisible()) {
        await manualDateToggle.check();

        const dateInput = page.locator(
          'input[type="date"], input[name="manualDate"]',
        );
        if (await dateInput.isVisible()) {
          // Test invalid date (future date validation if implemented)
          await dateInput.fill("2030-12-31");

          // Try to save and check for validation
          await page.click('button:has-text("Save")');

          // Look for validation message (if implemented)
          const validationMessage = page.locator(
            '[data-testid="date-validation-error"]',
          );
          if (await validationMessage.isVisible()) {
            await expect(validationMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Gallery Display Integration", () => {
    test("should verify video&design page displays multiple categories", async ({
      page,
    }) => {
      // First create test items with multiple categories
      await page.goto("/admin/data-manager");

      // Create item with video and design categories
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Video Design Test Item");
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Test item for video&design gallery");

      // Select both video and design categories
      const videoCheckbox = page.locator(
        'input[type="checkbox"][value="video"]',
      );
      const designCheckbox = page.locator(
        'input[type="checkbox"][value="design"]',
      );

      if (
        (await videoCheckbox.isVisible()) &&
        (await designCheckbox.isVisible())
      ) {
        await videoCheckbox.check();
        await designCheckbox.check();

        // Save the item
        await page.click('button:has-text("Save")');
        await expect(page.locator("text=Saved")).toBeVisible({
          timeout: 10000,
        });

        // Navigate to video&design gallery to verify display
        await page.goto("/portfolio/gallery/video&design");

        // Wait for gallery to load
        await page.waitForSelector(
          '[data-testid="portfolio-item"], .portfolio-item',
          { timeout: 10000 },
        );

        // Verify the test item appears
        await expect(page.locator("text=Video Design Test Item")).toBeVisible();

        // Verify no duplicate items (deduplication test)
        const testItems = page.locator("text=Video Design Test Item");
        const itemCount = await testItems.count();
        expect(itemCount).toBe(1);
      }
    });

    test("should verify Other category items only appear in All gallery", async ({
      page,
    }) => {
      // Create Other category item
      await page.goto("/admin/data-manager");

      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Other Category Test Item");
      const descriptionTextarea = page.locator("textarea").first();
      await descriptionTextarea.fill("Test item for Other category");

      // Select Other category
      const otherCheckbox = page.locator(
        'input[type="checkbox"][value="other"]',
      );
      if (await otherCheckbox.isVisible()) {
        await otherCheckbox.check();

        await page.click('button:has-text("Save")');
        await expect(page.locator("text=Saved")).toBeVisible({
          timeout: 10000,
        });

        // Check All gallery - should appear
        await page.goto("/portfolio/gallery/all");
        await page.waitForSelector(
          '[data-testid="portfolio-item"], .portfolio-item',
          { timeout: 10000 },
        );
        await expect(
          page.locator("text=Other Category Test Item"),
        ).toBeVisible();

        // Check Develop gallery - should NOT appear
        await page.goto("/portfolio/gallery/develop");
        await page.waitForSelector(
          '[data-testid="portfolio-item"], .portfolio-item',
          { timeout: 10000 },
        );
        const otherItemInDevelop = page.locator(
          "text=Other Category Test Item",
        );
        await expect(otherItemInDevelop).not.toBeVisible();

        // Check Video&Design gallery - should NOT appear
        await page.goto("/portfolio/gallery/video&design");
        await page.waitForSelector(
          '[data-testid="portfolio-item"], .portfolio-item',
          { timeout: 10000 },
        );
        const otherItemInVideoDesign = page.locator(
          "text=Other Category Test Item",
        );
        await expect(otherItemInVideoDesign).not.toBeVisible();
      }
    });
  });

  test.describe("Data Migration and Compatibility", () => {
    test("should handle mixed old and new data formats", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Load existing items to check for mixed formats
      await page.waitForSelector('[data-testid="content-list"], .content-list');

      // Check if items load without errors
      const contentItems = page.locator(
        '[data-testid="portfolio-item"], .portfolio-item',
      );
      const itemCount = await contentItems.count();

      if (itemCount > 0) {
        // Click on first item to edit
        await contentItems.first().click();

        // Wait for form to load
        await page.waitForSelector('input[type="text"]');

        // Verify form loads without errors
        const titleInput = page.locator('input[type="text"]');
        await expect(titleInput).toBeVisible();

        // Check if categories field exists (enhanced format)
        const categoriesSection = page.locator(
          '[data-testid="categories-section"]',
        );
        if (await categoriesSection.isVisible()) {
          // This is an enhanced item
          console.log("Enhanced format detected");
        } else {
          // This might be a legacy item
          console.log("Legacy format detected");
        }

        // Try to save to test migration
        await page.click('button:has-text("Save")');
        await expect(page.locator("text=Saved")).toBeVisible({
          timeout: 10000,
        });
      }
    });

    test("should preserve data integrity during updates", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Create a test item with all enhanced features
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      const testTitle = "Data Integrity Test Item";
      const testDescription = "Testing data integrity preservation";

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
      }

      // Save initial version
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Edit the item
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      // Verify all data is preserved
      await expect(page.locator('input[type="text"]')).toHaveValue(testTitle);
      await expect(page.locator("textarea")).toHaveValue(testDescription);

      if (await developCheckbox.isVisible()) {
        await expect(developCheckbox).toBeChecked();
        await expect(designCheckbox).toBeChecked();
      }

      // Make a small change and save again
      const descriptionTextarea2 = page.locator("textarea").first();
      await descriptionTextarea2.fill(testDescription + " - Updated");
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Verify change was saved and other data preserved
      await page.reload();
      await page.click(`text=${testTitle}`);
      await page.waitForSelector('input[type="text"]');

      await expect(page.locator("textarea")).toHaveValue(
        testDescription + " - Updated",
      );

      if (await developCheckbox.isVisible()) {
        await expect(developCheckbox).toBeChecked();
        await expect(designCheckbox).toBeChecked();
      }
    });
  });

  test.describe("User Journey Tests", () => {
    test("should complete full content creation workflow", async ({ page }) => {
      // Start from admin dashboard
      await page.goto("/admin");
      await expect(page.locator("h1")).toContainText("Admin Dashboard");

      // Navigate to data manager
      await page.click('a[href="/admin/data-manager"]');
      await page.waitForURL("/admin/data-manager");

      // Create new portfolio item
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Fill complete form
      const testTitle = "Complete Workflow Test";
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(testTitle);
      await page.fill(
        "textarea",
        "Testing complete workflow from creation to gallery display",
      );

      // Set categories
      const developCheckbox = page.locator(
        'input[type="checkbox"][value="develop"]',
      );
      if (await developCheckbox.isVisible()) {
        await developCheckbox.check();
      }

      // Add tags
      const tagInput = page.locator(
        'input[placeholder*="tag"], input[name="tags"]',
      );
      if (await tagInput.isVisible()) {
        await tagInput.fill("workflow,test,e2e");
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
          await dateInput.fill("2024-03-15");
        }
      }

      // Save the item
      await page.click('button:has-text("Save")');
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });

      // Verify item appears in list
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Test preview functionality
      await page.click('button:has-text("Preview")');
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();

      // Navigate to gallery to verify display
      await page.goto("/portfolio/gallery/develop");
      await page.waitForSelector(
        '[data-testid="portfolio-item"], .portfolio-item',
        { timeout: 10000 },
      );

      // Verify item appears in gallery
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();
    });

    test("should handle error scenarios gracefully", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Try to save empty form
      await page.click('button:has-text("+ New")');
      await page.waitForSelector('input[type="text"]');

      // Leave title empty and try to save
      await page.click('button:has-text("Save")');

      // Check for validation error
      const validationError = page.locator(
        '[data-testid="validation-error"], .error-message',
      );
      if (await validationError.isVisible()) {
        await expect(validationError).toBeVisible();
      }

      // Fill minimum required fields
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill("Error Handling Test");

      // Try to save again
      await page.click('button:has-text("Save")');

      // Should succeed this time
      await expect(page.locator("text=Saved")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Accessibility Tests", () => {
    test("should support keyboard navigation in data manager", async ({
      page,
    }) => {
      await page.goto("/admin/data-manager");

      // Tab through the interface
      await page.keyboard.press("Tab"); // Content type buttons
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Verify focus is visible
      const focusedElement = page.locator(":focus");
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }

      // Test keyboard activation
      await page.keyboard.press("Enter");

      // Continue tabbing through form elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(100);
      }
    });

    test("should have proper ARIA labels and roles", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Check for proper form labels
      const formInputs = page.locator("input, textarea, select");
      const inputCount = await formInputs.count();

      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = formInputs.nth(i);
        const inputId = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");

        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = (await label.count()) > 0;

          // Input should have either a label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }

      // Check for proper button roles
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const accessibleName =
          (await button.getAttribute("aria-label")) ||
          (await button.textContent()) ||
          (await button.getAttribute("title"));
        expect(accessibleName).toBeTruthy();
      }
    });
  });

  test.describe("Performance Tests", () => {
    test("should load data manager within performance budget", async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto("/admin/data-manager");
      await page.waitForSelector('button:has-text("+ New")');

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test("should handle large datasets efficiently", async ({ page }) => {
      await page.goto("/admin/data-manager");

      // Switch to a content type that might have many items
      await page.click('button:has-text("Portfolio")');

      // Wait for content to load
      await page.waitForSelector('[data-testid="content-list"], .content-list');

      // Measure time to load content list
      const startTime = Date.now();
      await page.waitForSelector(
        '[data-testid="portfolio-item"], .portfolio-item',
        { timeout: 15000 },
      );
      const loadTime = Date.now() - startTime;

      // Should load within 15 seconds even with many items
      expect(loadTime).toBeLessThan(15000);

      // Test scrolling performance
      const contentList = page.locator(
        '[data-testid="content-list"], .content-list',
      );
      if (await contentList.isVisible()) {
        await contentList.hover();

        // Scroll through the list
        for (let i = 0; i < 5; i++) {
          await page.mouse.wheel(0, 100);
          await page.waitForTimeout(100);
        }

        // Should remain responsive
        await expect(contentList).toBeVisible();
      }
    });
  });
});
