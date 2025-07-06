// Global setup for Playwright tests
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Development server is ready');

    // Pre-populate any test data if needed
    // This could include creating test content, clearing caches, etc.

    // Clear any existing local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log('🧹 Cleared local storage and session storage');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;
