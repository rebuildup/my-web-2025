# テスト戦略

## 概要

このドキュメントでは、個人 Web サイトのテスト戦略と実装方法について詳述します。

## テスト階層

```typescript
// lib/testing/config.ts
export const testingConfig = {
  // テスト種別
  types: {
    unit: {
      framework: "vitest",
      coverage: 80,
      timeout: 5000,
      parallel: true,
    },

    integration: {
      framework: "vitest",
      coverage: 70,
      timeout: 10000,
      database: "memory",
    },

    e2e: {
      framework: "playwright",
      browsers: ["chromium", "firefox", "webkit"],
      timeout: 30000,
      headless: true,
    },

    visual: {
      framework: "playwright",
      threshold: 0.2,
      updateSnapshots: false,
    },
  },
};
```

## ユニットテスト

### コンポーネントテスト

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button Component", () => {
  test("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  test("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies variant styles correctly", () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-blue-600");
  });
});
```

### ユーティリティ関数テスト

```typescript
// tests/unit/utils/formatters.test.ts
import { formatDate, formatCurrency, slugify } from "@/lib/utils/formatters";

describe("Formatters", () => {
  describe("formatDate", () => {
    test("formats date correctly", () => {
      const date = new Date("2025-01-01");
      expect(formatDate(date, "YYYY-MM-DD")).toBe("2025-01-01");
    });
  });

  describe("formatCurrency", () => {
    test("formats JPY correctly", () => {
      expect(formatCurrency(1000, "JPY")).toBe("¥1,000");
    });
  });

  describe("slugify", () => {
    test("converts text to URL-safe slug", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("テスト記事")).toBe("tesuto-ji-shi");
    });
  });
});
```

## 統合テスト

### API 統合テスト

```typescript
// tests/integration/api/contact.test.ts
import { testApiHandler } from "next-test-api-route-handler";
import handler from "@/pages/api/contact";

describe("/api/contact", () => {
  test("POST - sends contact form successfully", async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            message: "Test message",
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      },
    });
  });

  test("POST - validates required fields", async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "invalid-email",
            message: "",
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.errors).toBeDefined();
      },
    });
  });
});
```

### データベース統合テスト

```typescript
// tests/integration/data/content.test.ts
import { getContentItems, createContentItem } from "@/lib/data/content";

describe("Content Data Layer", () => {
  beforeEach(() => {
    // テスト用データの準備
    vi.clearAllMocks();
  });

  test("retrieves content items by type", async () => {
    const portfolioItems = await getContentItems("portfolio");
    expect(portfolioItems).toBeInstanceOf(Array);
    expect(portfolioItems.every((item) => item.type === "portfolio")).toBe(
      true
    );
  });

  test("creates content item with valid data", async () => {
    const newItem = {
      type: "portfolio",
      title: "Test Project",
      slug: "test-project",
      status: "published",
    };

    const created = await createContentItem(newItem);
    expect(created.id).toBeDefined();
    expect(created.title).toBe("Test Project");
  });
});
```

## E2E テスト

### ページナビゲーションテスト

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Site Navigation", () => {
  test("navigates through main pages", async ({ page }) => {
    await page.goto("/");

    // Home page
    await expect(page).toHaveTitle(/samuido/);

    // About page
    await page.click('nav a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator("h1")).toContainText("About");

    // Portfolio page
    await page.click('nav a[href="/portfolio"]');
    await expect(page).toHaveURL(/\/portfolio/);
    await expect(page.locator("h1")).toContainText("Portfolio");

    // Tools page
    await page.click('nav a[href="/tools"]');
    await expect(page).toHaveURL(/\/tools/);
    await expect(page.locator("h1")).toContainText("Tools");
  });
});
```

### フォーム送信テスト

```typescript
// tests/e2e/contact-form.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test("submits contact form successfully", async ({ page }) => {
    await page.goto("/contact");

    // Fill form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('textarea[name="message"]', "This is a test message.");

    // Submit form
    await page.click('button[type="submit"]');

    // Check success message
    await expect(page.locator(".success-message")).toContainText("送信完了");
  });

  test("shows validation errors", async ({ page }) => {
    await page.goto("/contact");

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator(".error-message")).toContainText("必須項目");
  });
});
```

### ツール機能テスト

```typescript
// tests/e2e/tools.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Tools", () => {
  test("SVG to TSX converter works", async ({ page }) => {
    await page.goto("/tools/svg-to-tsx");

    const svgCode = '<svg><circle cx="50" cy="50" r="40"/></svg>';

    // Input SVG
    await page.fill('textarea[placeholder*="SVG"]', svgCode);

    // Convert
    await page.click('button:has-text("変換")');

    // Check output
    const output = await page.locator("textarea:nth-of-type(2)").inputValue();
    expect(output).toContain("export const SvgComponent");
    expect(output).toContain("circle");
  });

  test("color palette generator works", async ({ page }) => {
    await page.goto("/tools/color-palette");

    // Generate palette
    await page.click('button:has-text("生成")');

    // Check colors are displayed
    const colorBoxes = page.locator(".color-box");
    await expect(colorBoxes).toHaveCount(5);

    // Check HEX values
    const hexValues = page.locator(".hex-value");
    await expect(hexValues.first()).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
```

## ビジュアルリグレッションテスト

```typescript
// tests/visual/pages.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  const pages = [
    { name: "home", url: "/" },
    { name: "about", url: "/about" },
    { name: "portfolio", url: "/portfolio" },
    { name: "tools", url: "/tools" },
    { name: "contact", url: "/contact" },
  ];

  for (const page of pages) {
    test(`${page.name} page visual consistency`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.url);
      await browserPage.waitForLoadState("networkidle");

      // Desktop screenshot
      await expect(browserPage).toHaveScreenshot(`${page.name}-desktop.png`);

      // Mobile screenshot
      await browserPage.setViewportSize({ width: 375, height: 667 });
      await expect(browserPage).toHaveScreenshot(`${page.name}-mobile.png`);
    });
  }
});
```

## パフォーマンステスト

```typescript
// tests/performance/lighthouse.test.ts
import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("meets Core Web Vitals thresholds", async ({ page }) => {
    await page.goto("/");

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};

          entries.forEach((entry) => {
            if (entry.name === "LCP") vitals.lcp = entry.startTime;
            if (entry.name === "FID") vitals.fid = entry.duration;
            if (entry.name === "CLS") vitals.cls = entry.value;
          });

          resolve(vitals);
        }).observe({
          entryTypes: [
            "largest-contentful-paint",
            "first-input",
            "layout-shift",
          ],
        });
      });
    });

    // Assert thresholds
    expect(vitals.lcp).toBeLessThan(2500); // Good LCP
    expect(vitals.fid).toBeLessThan(100); // Good FID
    expect(vitals.cls).toBeLessThan(0.1); // Good CLS
  });
});
```

## テスト設定

### CI/CD 統合

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

### テスト設定ファイル

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## テスト実行・設定

### 設定値

```typescript
const testConfiguration = {
  coverage: {
    unit: 80, // ユニットテスト: 80%以上
    integration: 70, // 統合テスト: 70%以上
    e2e: 60, // E2Eテスト: 60%以上
  },

  timeout: {
    unit: 5000, // 5秒
    integration: 10000, // 10秒
    e2e: 30000, // 30秒
  },

  retry: {
    unit: 2, // 2回リトライ
    integration: 1, // 1回リトライ
    e2e: 0, // リトライなし
  },

  notification: {
    slack: false, // Slack通知（将来的に）
    email: false, // メール通知
    github: true, // GitHub Issues作成
  },
};
```
