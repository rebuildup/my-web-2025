# Backend Performance Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** バックエンドとAPI層の高速化により全ページでLighthouse 95以上のスコア達成

**Architecture:** SQLite per-contentデータベースのキャッシュ層追加、N+1問題解消、ISR最適化、インデックス追加

**Tech Stack:** Next.js 16, SQLite (better-sqlite3), Server Components, ISR

---

## Phase 1: キャッシュ層実装

### Task 1: メモリキャッシュユーティリティ作成

**Files:**
- Create: `src/lib/cache/memory-cache.ts`

**Step 1: Create cache utility**

```typescript
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    this.defaultTtl = defaultTtlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const result = factory();
    if (result instanceof Promise) {
      return result.then((data) => {
        this.set(key, data, ttl);
        return data;
      });
    }
    this.set(key, result, ttl);
    return result;
  }

  async getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }
}

export const contentCache = new MemoryCache<unknown>(5 * 60 * 1000);
export const markdownCache = new MemoryCache<unknown>(5 * 60 * 1000);
```

**Step 2: Commit**

```bash
git add src/lib/cache/memory-cache.ts
git commit -m "feat: add memory cache utility for content caching"
```

---

### Task 2: Markdown Service キャッシュ統合

**Files:**
- Modify: `src/cms/server/markdown-service.ts:1-95`

**Step 1: Add cache import and wrap listMarkdownPages**

```typescript
import { markdownCache } from "@/lib/cache/memory-cache";

export function listMarkdownPages(options?: {
  contentId?: string;
}): MarkdownPage[] {
  const cacheKey = `markdown-list-${options?.contentId || "all"}`;
  
  const cached = markdownCache.get(cacheKey);
  if (cached) {
    console.log(`[MarkdownService] Cache hit for: ${cacheKey}`);
    return cached as MarkdownPage[];
  }
  
  // ... original logic
  
  const result = pages.sort((a, b) => {
    const aTime = a.updatedAt || "";
    const bTime = b.updatedAt || "";
    return bTime.localeCompare(aTime);
  });
  
  markdownCache.set(cacheKey, result);
  return result;
}
```

**Step 2: Add cache invalidation to save function**

```typescript
export function saveMarkdownPage(/* params */) {
  // ... existing save logic
  markdownCache.clear(); // Invalidate all markdown cache on write
}
```

**Step 3: Commit**

```bash
git add src/cms/server/markdown-service.ts
git commit -m "feat: add caching to listMarkdownPages for faster reads"
```

---

## Phase 2: N+1問題解消

### Task 3: Workshop page batch content fetching

**Files:**
- Modify: `src/app/workshop/page.tsx:220-280`

**Step 1: Create batch fetch function**

```typescript
async function fetchContentsBatch(contentIds: string[]): Promise<Map<string, unknown>> {
  const results = new Map<string, unknown>();
  
  // Fetch all at once using Promise.all with limit
  const batchSize = 10;
  for (let i = 0; i < contentIds.length; i += batchSize) {
    const batch = contentIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010"}/api/cms/contents?id=${encodeURIComponent(id)}`,
            { cache: "no-store" }
          );
          if (res.ok) {
            return { id, data: await res.json() };
          }
        } catch (e) {
          console.error(`[Workshop] Error fetching content ${id}:`, e);
        }
        return { id, data: null };
      })
    );
    batchResults.forEach(({ id, data }) => {
      if (data) results.set(id, data);
    });
  }
  
  return results;
}
```

**Step 2: Modify displayPagesWithCMS building**

```typescript
// Get all content IDs first
const contentIds = sortedContent.map((page) => page.contentId || page.slug);
const contentsMap = await fetchContentsBatch(contentIds);

const displayPagesWithCMS: ArticleData[] = sortedContent.map((page) => {
  const contentId = page.contentId || page.slug;
  const cmsContent = contentsMap.get(contentId);
  const thumbnail = getThumbnail(page, cmsContent);
  // ... rest of mapping
});
```

**Step 3: Commit**

```bash
git add src/app/workshop/page.tsx
git commit -m "perf: use batch fetching for CMS content in workshop page"
```

---

### Task 4: Blog detail page optimized data loading

**Files:**
- Modify: `src/app/workshop/blog/[slug]/page.tsx:38-80`

**Step 1: Create optimized data loader**

```typescript
async function loadBlogData(slug: string) {
  const cacheKey = `blog-detail-${slug}`;
  
  const cached = contentCache.get(cacheKey);
  if (cached) {
    return cached as { page: MarkdownPage; contentId: string; content: unknown };
  }

  const pageMatch = findMarkdownPage(slug);
  if (!pageMatch) return null;
  
  const contentId = pageMatch.page.contentId;
  const content = contentId 
    ? await getContentById("blog", contentId).catch(() => null)
    : null;
  
  const result = { page: pageMatch.page, contentId, content };
  contentCache.set(cacheKey, result);
  return result;
}
```

**Step 2: Commit**

```bash
git add src/app/workshop/blog/[slug]/page.tsx
git commit -m "perf: optimize blog detail page with caching"
```

---

## Phase 3: データベースインデックス追加

### Task 5: Add indexes to content database

**Files:**
- Create: `src/cms/lib/migrations/add-indexes.ts`

**Step 1: Create migration script**

```typescript
import { getContentDb } from "./content-db-manager";

export function addPerformanceIndexes() {
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_contents_updated_at ON contents(updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)",
    "CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_markdown_pages_updated ON markdown_pages(updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_markdown_pages_status ON markdown_pages(status)",
    "CREATE INDEX IF NOT EXISTS idx_markdown_pages_slug ON markdown_pages(slug)",
  ];

  const dbFiles = listContentDbFiles();
  
  for (const file of dbFiles) {
    const contentId = extractContentIdFromFileName(file);
    const db = getContentDb(contentId);
    
    for (const idx of indexes) {
      try {
        db.exec(idx);
      } catch (e) {
        console.warn(`[Migration] Index creation failed for ${contentId}:`, e);
      }
    }
    
    db.close();
  }
  
  console.log("[Migration] Performance indexes added to all databases");
}
```

**Step 2: Add to deploy script**

Modify `.github/workflows/deploy.yml` to run migration after deploy.

**Step 3: Commit**

```bash
git add src/cms/lib/migrations/add-indexes.ts .github/workflows/deploy.yml
git commit -m "perf: add database indexes for faster queries"
```

---

## Phase 4: ISR & Cache設定最適化

### Task 6: Optimize ISR settings

**Files:**
- Modify: `src/app/workshop/page.tsx:13`
- Modify: `src/app/workshop/blog/[slug]/page.tsx:14`

**Step 1: Change revalidate times**

```typescript
// workshop/page.tsx
export const revalidate = 3600; // 1 hour (was 300)

// workshop/blog/[slug]/page.tsx
export const revalidate = 3600; // 1 hour (was 300)
```

**Step 2: Add dynamic = force-dynamic for mutable content**

```typescript
export const dynamic = "force-dynamic";
```

**Step 3: Commit**

```bash
git add src/app/workshop/page.tsx src/app/workshop/blog/[slug]/page.tsx
git commit -m "perf: optimize ISR revalidate times for better performance"
```

---

## Phase 5: Lighthouse 95達成確認

### Task 7: Performance monitoring

**Files:**
- Create: `scripts/lighthouse-check.ts`

**Step 1: Create Lighthouse CI script**

```typescript
import { chromium } from "playwright";

const PAGES = [
  "https://yusuke-kim.com/",
  "https://yusuke-kim.com/workshop",
  "https://yusuke-kim.com/workshop/blog/reel-2025",
  "https://yusuke-kim.com/portfolio",
];

async function checkPage(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: "networkidle" });
  
  const metrics = await page.evaluate(() => ({
    fcp: performance.getEntriesByType("navigation")[0]?.responseStart,
    lcp: performance.getEntriesByType("paint").find((e) => e.name === "largest-contentful-paint")?.startTime,
  }));
  
  await browser.close();
  return metrics;
}

async function main() {
  for (const url of PAGES) {
    console.log(`Checking: ${url}`);
    const metrics = await checkPage(url);
    console.log(metrics);
  }
}

main();
```

**Step 2: Run and verify**

```bash
bun run scripts/lighthouse-check.ts
```

**Step 3: Commit**

```bash
git add scripts/lighthouse-check.ts
git commit -m "perf: add lighthouse performance monitoring"
```

---

## 完了チェックリスト

- [ ] メモリキャッシュの実装完了
- [ ] Markdown Service キャッシュ統合完了
- [ ] Workshop page batch fetching実装完了
- [ ] Blog detail page最適化完了
- [ ] データベースインデックス追加完了
- [ ] ISR設定最適化完了
- [ ] Lighthouseチェックで全ページ95以上達成
- [ ] デプロイ & 本番環境テスト完了