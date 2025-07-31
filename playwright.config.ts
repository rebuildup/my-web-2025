import { defineConfig, devices } from "@playwright/test";
import { cpus } from "os";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Optimize workers for parallel execution */
  workers: process.env.CI ? 4 : Math.min(6, cpus().length),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["html"], ["github"]] : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Global test timeout - optimized for faster execution */
  timeout: 30000, // 30 seconds per test (reduced from 90s)
  expect: {
    timeout: 10000, // 10 seconds for expect assertions (reduced from 15s)
  },

  /* Configure projects for major browsers - optimized for parallel execution */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Optimize for faster execution
        launchOptions: {
          args: [
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--no-sandbox",
          ],
        },
      },
    },

    // Temporarily disable other browsers for faster CI execution
    // Uncomment when needed for cross-browser testing
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // 1 minute for server startup (reduced from 2 minutes)
    stdout: process.env.CI ? "ignore" : "pipe",
    stderr: process.env.CI ? "ignore" : "pipe",
    env: {
      PLAYWRIGHT_TEST: "true",
      NODE_ENV: "test",
      __NEXT_DISABLE_DEV_OVERLAY: "true",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
