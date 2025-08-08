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
  /* Optimize workers for parallel execution - minimum 10 workers */
  workers: process.env.CI
    ? Math.max(10, cpus().length)
    : Math.max(10, cpus().length),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["html"], ["github"]] : "html",
  /* Use quiet mode for less verbose output */
  quiet: true,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Global test timeout - optimized for speed */
  timeout: 120000, // 120 seconds per test (increased for heavy WebGL tests)
  expect: {
    timeout: 30000, // 30 seconds for expect assertions (increased for heavy components)
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
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
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
  // webServer configuration disabled - server started manually in test script
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: true, // Always reuse existing server
  //   timeout: 300000, // 5 minutes for server startup (increased)
  //   stdout: process.env.CI ? "ignore" : "pipe",
  //   stderr: process.env.CI ? "ignore" : "pipe",
  //   env: {
  //     PLAYWRIGHT_TEST: "true",
  //     NODE_ENV: "test",
  //     __NEXT_DISABLE_DEV_OVERLAY: "true",
  //     NEXT_TELEMETRY_DISABLED: "1",
  //   },
  // },
});
