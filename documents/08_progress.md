# テスト設計 & 実装進捗 (Progress)

> `testingStrategy` と実装状況を追跡

## 1. テスト戦略概要

| 種別        | ツール                 | 目標カバレッジ          | 備考                             |
| ----------- | ---------------------- | ----------------------- | -------------------------------- |
| Unit        | Jest + RTL             | 80% 行カバレッジ        | `src/components`, `src/lib`      |
| Integration | Playwright             | 主要 API & ルーティング | `navigation`, `forms`, `api`     |
| E2E         | Playwright             | 5 ユースケース          | Portfolio 閲覧 / ツール使用 など |
| Visual      | Playwright screenshots | 差分 < 0.1              | 全ページ + 主要コンポ            |
| Security    | npm audit / CodeQL     | Critical 0 件           | PR ごと実行                      |

## 2. 具体的なテストケース

### 2.1 Unit Tests (Jest + RTL)

#### ユーティリティ関数テスト

```typescript
// __tests__/lib/utils/validation.test.ts
import { validators } from '@/lib/utils/validation';

describe('validators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.jp')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validators.email('invalid-email')).toBe(false);
      expect(validators.email('test@')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
    });
  });

  describe('required', () => {
    it('should validate required fields', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required(0)).toBe(true);
      expect(validators.required(false)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(validators.minLength('test', 3)).toBe(true);
      expect(validators.minLength('test', 4)).toBe(true);
    });

    it('should reject strings shorter than minimum', () => {
      expect(validators.minLength('te', 3)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(validators.maxLength('test', 5)).toBe(true);
      expect(validators.maxLength('test', 4)).toBe(true);
    });

    it('should reject strings longer than maximum', () => {
      expect(validators.maxLength('testing', 5)).toBe(false);
    });
  });
});
```

#### 検索機能テスト

```typescript
// __tests__/lib/search/index.test.ts
import { searchContent, SearchResult } from '@/lib/search';

// Mock data
const mockSearchIndex = [
  {
    id: '1',
    type: 'portfolio',
    title: 'React Portfolio',
    description: 'A React-based portfolio',
    content: 'This is a portfolio built with React',
    tags: ['react', 'typescript'],
    category: 'programming',
    searchableContent:
      'React Portfolio A React-based portfolio This is a portfolio built with React react typescript',
  },
  {
    id: '2',
    type: 'tool',
    title: 'Color Palette Generator',
    description: 'Generate color palettes',
    content: 'A tool for generating color palettes',
    tags: ['design', 'colors'],
    category: 'tools',
    searchableContent:
      'Color Palette Generator Generate color palettes A tool for generating color palettes design colors',
  },
];

// Mock functions
jest.mock('@/lib/search', () => ({
  loadSearchIndex: jest.fn(() => Promise.resolve(mockSearchIndex)),
  generateContentUrl: jest.fn(item => `/${item.type}/${item.id}`),
}));

describe('searchContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return search results for valid query', async () => {
    const results = await searchContent('React');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('React Portfolio');
    expect(results[0].score).toBeLessThan(0.5); // Fuse.js score
  });

  it('should filter by type', async () => {
    const results = await searchContent('color', { type: 'tool' });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('tool');
  });

  it('should filter by category', async () => {
    const results = await searchContent('portfolio', {
      category: 'programming',
    });

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('programming');
  });

  it('should respect limit parameter', async () => {
    const results = await searchContent('a', { limit: 1 });

    expect(results).toHaveLength(1);
  });

  it('should return empty array for no matches', async () => {
    const results = await searchContent('nonexistent');

    expect(results).toHaveLength(0);
  });

  it('should handle search errors gracefully', async () => {
    // Mock error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const results = await searchContent('test');

    expect(results).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
```

#### 統計機能テスト

```typescript
// __tests__/lib/stats/index.test.ts
import { updateStats, getStats } from '@/lib/stats';

// Mock file system
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStats', () => {
    it('should update download stats', async () => {
      const mockReadFile = require('fs/promises').readFile;
      const mockWriteFile = require('fs/promises').writeFile;

      mockReadFile.mockResolvedValue(JSON.stringify({ 'test-id': 5 }));

      const result = await updateStats('download', 'test-id');

      expect(result).toBe(true);
      expect(mockWriteFile).toHaveBeenCalledWith(
        'public/data/stats/download-stats.json',
        JSON.stringify({ 'test-id': 6 })
      );
    });

    it('should handle new entries', async () => {
      const mockReadFile = require('fs/promises').readFile;
      const mockWriteFile = require('fs/promises').writeFile;

      mockReadFile.mockResolvedValue(JSON.stringify({}));

      const result = await updateStats('view', 'new-id');

      expect(result).toBe(true);
      expect(mockWriteFile).toHaveBeenCalledWith(
        'public/data/stats/view-stats.json',
        JSON.stringify({ 'new-id': 1 })
      );
    });

    it('should handle errors gracefully', async () => {
      const mockReadFile = require('fs/promises').readFile;
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = await updateStats('download', 'test-id');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return stats for specific ID', async () => {
      const mockReadFile = require('fs/promises').readFile;
      mockReadFile.mockResolvedValue(JSON.stringify({ 'test-id': 10 }));

      const result = await getStats('view', 'test-id');

      expect(result).toBe(10);
    });

    it('should return all stats when no ID provided', async () => {
      const mockReadFile = require('fs/promises').readFile;
      const mockStats = { id1: 5, id2: 10 };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStats));

      const result = await getStats('download');

      expect(result).toEqual(mockStats);
    });

    it('should return 0 for non-existent ID', async () => {
      const mockReadFile = require('fs/promises').readFile;
      mockReadFile.mockResolvedValue(JSON.stringify({}));

      const result = await getStats('view', 'non-existent');

      expect(result).toBe(0);
    });
  });
});
```

### 2.2 Integration Tests (Playwright)

#### API Routes テスト

```typescript
// tests/api/content.test.ts
import { test, expect } from '@playwright/test';

test.describe('Content API', () => {
  test('should return portfolio content', async ({ request }) => {
    const response = await request.get('/api/content/portfolio');
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should filter content by category', async ({ request }) => {
    const response = await request.get('/api/content/portfolio?category=video');
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    data.data.forEach((item: any) => {
      expect(item.category).toBe('video');
    });
  });

  test('should handle search requests', async ({ request }) => {
    const response = await request.post('/api/content/search', {
      data: {
        query: 'React',
        type: 'portfolio',
        limit: 5,
      },
    });
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should update download stats', async ({ request }) => {
    const response = await request.post('/api/stats/download', {
      data: { id: 'test-id' },
    });
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
  });

  test('should update view stats', async ({ request }) => {
    const response = await request.post('/api/stats/view', {
      data: { id: 'test-id' },
    });
    const data = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(data.success).toBe(true);
  });
});
```

#### フォームテスト

```typescript
// tests/forms/contact.test.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should submit valid contact form', async ({ page }) => {
    await page.goto('/contact');

    // Fill form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="subject"]', 'Test Subject');
    await page.fill('[name="content"]', 'This is a test message with sufficient content.');

    // Submit form
    await page.click('button[type="submit"]');

    // Check success message
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should show validation errors for invalid form', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('[data-field="name"] .error')).toBeVisible();
    await expect(page.locator('[data-field="email"] .error')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="subject"]', 'Test Subject');
    await page.fill('[name="content"]', 'Test content');

    await page.click('button[type="submit"]');

    await expect(page.locator('[data-field="email"] .error')).toBeVisible();
  });

  test('should handle reCAPTCHA', async ({ page }) => {
    await page.goto('/contact');

    // Fill form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="subject"]', 'Test Subject');
    await page.fill('[name="content"]', 'Test content');

    // Mock reCAPTCHA
    await page.evaluate(() => {
      window.grecaptcha = {
        ready: (callback: () => void) => callback(),
        execute: () => Promise.resolve('mock-token'),
      };
    });

    await page.click('button[type="submit"]');

    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### 2.3 E2E Tests (Playwright)

#### 主要ユーザーフロー

```typescript
// tests/e2e/user-flows.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Flows', () => {
  test('should navigate through portfolio gallery', async ({ page }) => {
    await page.goto('/portfolio');

    // Check gallery categories
    await expect(page.locator('[data-category="all"]')).toBeVisible();
    await expect(page.locator('[data-category="develop"]')).toBeVisible();
    await expect(page.locator('[data-category="video"]')).toBeVisible();
    await expect(page.locator('[data-category="video&design"]')).toBeVisible();

    // Click on develop category
    await page.click('[data-category="develop"]');

    // Check if items are filtered
    const items = page.locator('.portfolio-item');
    await expect(items).toHaveCount(await items.count());

    // Click on first item
    await page.click('.portfolio-item:first-child');

    // Check detail page
    await expect(page.locator('.portfolio-detail')).toBeVisible();
  });

  test('should use color palette tool', async ({ page }) => {
    await page.goto('/tools/color-palette');

    // Check tool interface
    await expect(page.locator('.color-palette')).toBeVisible();
    await expect(page.locator('.color-controls')).toBeVisible();

    // Generate colors
    await page.click('[data-action="generate"]');

    // Check if colors are generated
    const colorSwatches = page.locator('.color-swatch');
    await expect(colorSwatches).toHaveCount(5);

    // Save palette
    await page.click('[data-action="save"]');

    // Check saved palette
    await expect(page.locator('.saved-palette')).toBeVisible();
  });

  test('should search for content', async ({ page }) => {
    await page.goto('/search');

    // Enter search query
    await page.fill('[name="search"]', 'React');

    // Check search results
    await expect(page.locator('.search-results')).toBeVisible();

    // Filter by type
    await page.selectOption('[name="type"]', 'portfolio');

    // Check filtered results
    const results = page.locator('.search-result');
    await expect(results).toHaveCount(await results.count());
  });

  test('should download plugin', async ({ page }) => {
    await page.goto('/workshop/plugins');

    // Find a plugin
    await page.click('.plugin-item:first-child');

    // Check plugin details
    await expect(page.locator('.plugin-detail')).toBeVisible();

    // Click download
    await page.click('[data-action="download"]');

    // Check download confirmation
    await expect(page.locator('.download-confirmation')).toBeVisible();
  });

  test('should read blog post', async ({ page }) => {
    await page.goto('/workshop/blog');

    // Click on blog post
    await page.click('.blog-item:first-child');

    // Check blog content
    await expect(page.locator('.blog-content')).toBeVisible();
    await expect(page.locator('.blog-meta')).toBeVisible();

    // Check markdown rendering
    await expect(page.locator('h1, h2, h3')).toBeVisible();
  });
});
```

### 2.4 Visual Regression Tests

```typescript
// tests/visual/regression.test.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('should match homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('should match portfolio page screenshot', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveScreenshot('portfolio.png');
  });

  test('should match tools page screenshot', async ({ page }) => {
    await page.goto('/tools');
    await expect(page).toHaveScreenshot('tools.png');
  });

  test('should match contact form screenshot', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveScreenshot('contact.png');
  });

  test('should match responsive design', async ({ page }) => {
    await page.goto('/');

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('homepage-desktop.png');

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('homepage-tablet.png');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});
```

### 2.5 Performance Tests

```typescript
// tests/performance/lighthouse.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should meet Lighthouse performance standards', async ({ page }) => {
    const response = await page.goto('/');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const metrics: any = {};

          entries.forEach((entry: any) => {
            if (entry.name === 'LCP') metrics.lcp = entry.startTime;
            if (entry.name === 'FID') metrics.fid = entry.processingStart - entry.startTime;
            if (entry.name === 'CLS') metrics.cls = entry.value;
          });

          resolve(metrics);
        }).observe({
          entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
        });
      });
    });

    // Assert performance thresholds
    expect(metrics.lcp).toBeLessThan(2500); // 2.5s
    expect(metrics.fid).toBeLessThan(100); // 100ms
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/portfolio');

    // Check image loading
    const images = page.locator('img');
    await expect(images).toHaveCount(await images.count());

    // Check for lazy loading
    const lazyImages = page.locator('img[loading="lazy"]');
    await expect(lazyImages).toHaveCount(await lazyImages.count());
  });
});
```

## 3. 実装進捗

| モジュール                | テスト実装 | カバレッジ |
| ------------------------- | ---------- | ---------- |
| UI Components             | ✅ 完了    | 78%        |
| Layout Components         | 🔄 進行中  | 45%        |
| Utils (date, string)      | ✅ 完了    | 92%        |
| API Routes                | ⏳ 未着手  | -          |
| Tools (ColorPalette etc.) | ⏳ 未着手  | -          |

## 4. 自動化設定

- GitHub Actions `test` で Jest & Playwright を CI 実行
- `onPush: main` → Unit + Integration
- `onPR` → Unit + Integration + E2E + Visual

## 5. 実装要件チェックリスト

### 5.1 基盤・インフラ要件

- [ ] TypeScript型定義 (`src/types/`) - ContentItem, SiteConfig, FormConfig等
- [ ] パフォーマンス最適化ユーティリティ (`src/lib/utils/performance.ts`)
- [ ] 画像最適化ラッパー (`optimizeImage`)
- [ ] メモリリーク防止 (Three.js用)
- [ ] 動的インポート設定 (重いコンポーネント用)

### 5.2 デザインシステム

- [ ] Adobe Fonts設定 (Neue Haas Grotesk Display, Zen Kaku Gothic New)
- [ ] Google Fonts設定 (Noto Sans JP, Shippori Antique B1)
- [ ] カラーテーマ (原色の青 #0000ff, ダークグレー #222222)
- [ ] ファビコン (青い円形SVGアイコン)
- [ ] TailwindCSS v4設定

### 5.3 ページ固有コンポーネント設計

- [ ] 各ページディレクトリ内でのコンポーネント実装
- [ ] `src/app/[page]/components/` 構造の確立
- [ ] ページ間での独立性の確保
- [ ] コードの重複を許容した実装

### 5.4 共通ユーティリティ (`src/lib/utils/`)

- [ ] 日付処理ユーティリティ (date-fns連携)
- [ ] 文字列処理ユーティリティ
- [ ] 画像最適化ユーティリティ
- [ ] 検索機能ユーティリティ
- [ ] 統計データ処理ユーティリティ
- [ ] パフォーマンス最適化ユーティリティ

### 5.5 ページ実装

- [ ] メインページ (`/`) - サイトマップ・カテゴリカード
- [ ] About (`/about`) - プロフィール概要・サブページナビ
- [ ] Portfolio (`/portfolio`) - ギャラリー・フィルター・検索
- [ ] Tools (`/tools`) - ツール一覧・カテゴリタブ
- [ ] Workshop (`/workshop`) - プラグイン・ダウンロード・ブログ
- [ ] Contact (`/contact`) - フォーム・reCAPTCHA

### 5.6 ページ固有コンポーネント

- [ ] Portfolio: `src/app/portfolio/components/` 内でのギャラリー機能実装
- [ ] Tools: `src/app/tools/components/` 内でのツール機能実装
- [ ] Workshop: `src/app/workshop/components/` 内でのブログ・プラグイン機能実装
- [ ] About: `src/app/about/components/` 内でのプロフィール機能実装
- [ ] Admin: `src/app/admin/components/` 内でのコンテンツ管理機能実装
- [ ] Contact: `src/app/contact/components/` 内でのフォーム機能実装

### 5.7 機能要件

- [ ] 検索機能 (全ページ共通)
- [ ] フィルター・ソート機能 (Portfolio, Tools, Workshop)
- [ ] フォームバリデーション (Contact)
- [ ] 画像最適化・遅延読み込み
- [ ] SEO最適化 (メタタグ, 構造化データ)
- [ ] アクセシビリティ対応 (WCAG 2.1 AA)

### 5.8 パフォーマンス要件

- [ ] Lighthouse Overall 90+
- [ ] LCP ≤ 2.5s
- [ ] FID (INP) ≤ 100ms
- [ ] CLS ≤ 0.1
- [ ] 初期JSバンドル ≤ 1MB

### 5.9 セキュリティ要件

- [ ] CSP設定
- [ ] HSTS設定
- [ ] Rate Limit実装
- [ ] CSRFトークン
- [ ] XSS対策 (DOMPurify)

### 5.10 デプロイ・CI/CD

- [ ] GitHub Actions設定
- [ ] GCP VM設定
- [ ] Apache設定
- [ ] SSL証明書設定
- [ ] バックアップ設定
- [ ] 監視・ログ設定

### 5.11 法務・コンプライアンス

- [ ] プライバシーポリシー
- [ ] 利用規約
- [ ] Cookieポリシー
- [ ] GDPR対応
- [ ] 日本個人情報保護法対応

## 6. 次ステップ (2025-07 Sprint)

1. API Routes のユニット & 統合テストを追加 (目標 70%)
2. Tools コンポーネントの E2E テスト 3 シナリオ
3. Visual Regression ベースライン更新
4. レポートを `docs/metrics/2025-07.md` に自動保存

## 7. 現在の実装状況

### 完了済み

- ✅ Next.js 15.3.4 セットアップ
- ✅ React 19.0.0 セットアップ
- ✅ TypeScript 5 セットアップ
- ✅ TailwindCSS v4 セットアップ
- ✅ ESLint設定
- ✅ 基本ページ構造 (`src/app/`)

### 進行中

- 🔄 パッケージインストール (lucide-react, framer-motion, three, pixi.js, axios, date-fns, prettier, jest, @playwright/test, lhci)

### 未着手

- ⏳ 型定義ファイル作成
- ⏳ 共通UIコンポーネント実装
- ⏳ レイアウトコンポーネント実装
- ⏳ 各ページコンポーネント実装
- ⏳ ツール機能実装
- ⏳ テスト実装
- ⏳ デプロイ設定

---

> **更新ルール**: Sprint 終了ごとにこのファイルの進捗テーブルを更新し、カバレッジを記録
