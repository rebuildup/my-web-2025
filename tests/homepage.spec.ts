// Homepage E2E tests
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the main site navigation', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.locator('h1')).toContainText('samuido');

    // Check category cards by looking for specific h3 elements in the navigation
    const categories = ['About', 'Portfolio', 'Workshop', 'Tools'];

    for (const category of categories) {
      await expect(page.locator(`h3:text("${category}")`)).toBeVisible();
    }
  });

  test('should have working category links', async ({ page }) => {
    await page.goto('/');

    // Test About link - click on the link containing About h3
    await page.click('a:has(h3:text("About"))');
    await expect(page).toHaveURL('/about');

    // Go back to homepage
    await page.goto('/');

    // Test Portfolio link - click on the link containing Portfolio h3
    await page.click('a:has(h3:text("Portfolio"))');
    await expect(page).toHaveURL('/portfolio');

    // Go back to homepage
    await page.goto('/');

    // Test Tools link - click on the link containing Tools h3
    await page.click('a:has(h3:text("Tools"))');
    await expect(page).toHaveURL('/tools');
  });

  test('should have search link navigation', async ({ page }) => {
    await page.goto('/');

    // Find search link
    const searchLink = page.locator('a[href="/search"]');
    await expect(searchLink).toBeVisible();

    // Test search page navigation
    await searchLink.click();
    await expect(page).toHaveURL('/search');
  });

  test('should display recent updates section', async ({ page }) => {
    await page.goto('/');

    // Check recent updates section
    await expect(page.locator('text=Latest Updates')).toBeVisible();

    // Check for update items (using the actual content from page.tsx)
    await expect(page.locator('text=最新作品タイトル')).toBeVisible();
    await expect(page.locator('text=最新ブログ記事')).toBeVisible();
    await expect(page.locator('text=新機能追加')).toBeVisible();
  });

  test('should have proper footer', async ({ page }) => {
    await page.goto('/');

    // Check footer content
    await expect(page.locator('footer')).toContainText('© 2025 samuido (木村友亮)');
    await expect(page.locator('footer')).toContainText(
      'フロントエンドエンジニア・Webデザイナー・映像クリエイター'
    );
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/');

    // Check page title (from layout.tsx)
    await expect(page).toHaveTitle(/samuido/);

    // Check language
    const htmlLang = page.locator('html');
    await expect(htmlLang).toHaveAttribute('lang', 'ja');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that category cards are visible on mobile
    const aboutCard = page.locator('a:has(h3:text("About"))');
    await expect(aboutCard).toBeVisible();

    // Check that the main title is still visible and readable
    await expect(page.locator('h1')).toBeVisible();

    // Check that search link is still functional
    const searchLink = page.locator('a[href="/search"]');
    await expect(searchLink).toBeVisible();
  });

  test('should have proper contrast and accessibility', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveCount(3); // Main Categories, Site Functions, Latest Updates

    // Check for proper link accessibility
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(5);

    // Check that all images have alt text (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        await expect(img).toHaveAttribute('alt');
      }
    }
  });

  test('should load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Check that page loads within 5 seconds (adjusted for development environment)
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);

    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.container-grid')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation - focus on the first category link
    const firstLink = page.locator('a:has(h3:text("About"))');
    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    // Should be able to activate links with Enter
    await page.keyboard.press('Enter');

    // Should navigate to the linked page
    await expect(page).toHaveURL('/about');
  });
});
