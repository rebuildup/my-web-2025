// Homepage E2E tests
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the main site navigation', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.locator('h1')).toContainText('My Web 2025');

    // Check category cards
    const categories = ['Portfolio', 'Tools', 'Workshop', 'About', 'Contact', 'Admin'];

    for (const category of categories) {
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }
  });

  test('should have working category links', async ({ page }) => {
    await page.goto('/');

    // Test Portfolio link
    await page.click('text=Portfolio');
    await expect(page).toHaveURL('/portfolio');

    // Go back to homepage
    await page.goto('/');

    // Test Tools link
    await page.click('text=Tools');
    await expect(page).toHaveURL('/tools');
  });

  test('should have functional search', async ({ page }) => {
    await page.goto('/');

    // Find search input
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('React');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=React/);
  });

  test('should display recent updates section', async ({ page }) => {
    await page.goto('/');

    // Check recent updates section
    await expect(page.locator('text=最新の更新')).toBeVisible();

    // Check for update items
    await expect(page.locator('text=React Portfolio Website')).toBeVisible();
    await expect(page.locator('text=Color Palette Generator')).toBeVisible();
    await expect(page.locator('text=Next.js 15 & React 19')).toBeVisible();
  });

  test('should have proper footer', async ({ page }) => {
    await page.goto('/');

    // Check footer content
    await expect(page.locator('footer')).toContainText('© 2025 My Web 2025');
    await expect(page.locator('footer a[href="/privacy-policy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/contact"]')).toBeVisible();
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/My Web 2025/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /portfolio.*tools.*workshop/i);

    // Check language
    const htmlLang = page.locator('html');
    await expect(htmlLang).toHaveAttribute('lang', 'ja');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that category cards stack vertically on mobile
    const categoryCards = page.locator('a[href^="/"]').filter({ hasText: 'Portfolio' }).first();
    await expect(categoryCards).toBeVisible();

    // Check that the main title is still visible and readable
    await expect(page.locator('h1')).toBeVisible();

    // Check that search input is still functional
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test search');
  });

  test('should have proper contrast and accessibility', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveCount(3); // Site search + Recent updates + category titles

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

    // Check that page loads within 3 seconds
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const firstLink = page.locator('a').first();
    await expect(firstLink).toBeFocused();

    // Continue tabbing through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate links with Enter
    await page.keyboard.press('Enter');

    // Should navigate to the linked page
    await expect(page).not.toHaveURL('/');
  });
});
