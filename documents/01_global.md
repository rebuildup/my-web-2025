# 共通データ構造まとめ (Global)

サイト全体で使用する JSON / TypeScript 型定義の要点を集約しています。フル定義は `src/types/` を参照してください。

## 1. ContentItem — すべてのコンテンツの基盤

```typescript
interface ContentItem {
  id: string;
  type: ContentType; // portfolio | plugin | blog | profile | page | tool | asset
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  priority: number; // 0-100
  createdAt: string; // ISO 8601
  updatedAt?: string;
  publishedAt?: string;

  thumbnail?: string;
  images?: string[];
  videos?: MediaEmbed[];
  externalLinks?: ExternalLink[];
  downloadInfo?: DownloadInfo;
  content?: string; // Markdown or HTML
  contentPath?: string; // Markdown path
  stats?: ContentStats;
  seo?: SEOData;
  customFields?: Record<string, any>;
}

type ContentType =
  | "portfolio"
  | "plugin"
  | "blog"
  | "profile"
  | "page"
  | "tool"
  | "asset"
  | "download";

interface MediaEmbed {
  type: "youtube" | "vimeo" | "code" | "social" | "iframe";
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface ExternalLink {
  type: "github" | "demo" | "booth" | "website" | "other";
  url: string;
  title: string;
  description?: string;
}

interface DownloadInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  price?: number;
  version?: string;
  downloadCount: number;
  lastDownloaded?: string;
}

interface ContentStats {
  views: number;
  downloads?: number;
  likes?: number;
  shares?: number;
  lastViewed?: string;
}

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}
```

### 補助型 (抜粋)

- `MediaEmbed` : YouTube / Vimeo など埋め込み
- `ExternalLink` : GitHub / Booth / Demo 等
- `DownloadInfo` : ファイル名・サイズ・価格 など

## 2. SiteConfig — サイト設定

```typescript
interface SiteConfig {
  name: string;
  description: string;
  url: string;
  language: string;
  author: AuthorInfo;
  theme: ThemeConfig;
  features: FeatureConfig;
  integrations: IntegrationConfig;
  seo: GlobalSEOConfig;
}

interface AuthorInfo {
  name: string;
  alternateName: string;
  email: string;
  jobTitle: string;
  description: string;
  socialLinks: SocialLink[];
}

interface SocialLink {
  platform: "twitter" | "github" | "linkedin" | "instagram";
  url: string;
  username: string;
}

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface FeatureConfig {
  search: boolean;
  comments: boolean;
  rss: boolean;
  analytics: boolean;
  admin: boolean;
}

interface IntegrationConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  adobeFonts: {
    enabled: boolean;
    kitId: string;
  };
  recaptcha: {
    enabled: boolean;
    siteKey: string;
  };
  resend: {
    enabled: boolean;
    apiKey: string;
  };
}

interface GlobalSEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  defaultTwitterImage: string;
  siteName: string;
  locale: string;
}
```

キーポイント:

- `theme.colors`, `theme.fonts` にブランドカラー / フォントを集中管理
- `features` で検索・コメント・RSS 等のトグル

## 3. FormConfig — フォーム宣言

```typescript
interface FormConfig {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  validation: ValidationRule[];
  submitConfig: SubmitConfig;
  successMessage?: string;
  errorMessage?: string;
}

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation[];
  options?: FormFieldOption[];
  defaultValue?: any;
}

type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "calculator";

interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FieldValidation {
  type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: any;
  message: string;
}

interface ValidationRule {
  fieldId: string;
  rules: FieldValidation[];
}

interface SubmitConfig {
  method: "POST";
  action: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}
```

- JSON でフォーム UI・バリデーション・送信先を一元管理
- `fields[]` に多様な `FormFieldType` (text / email / calculator …)

## 4. NavigationItem — 階層ナビ

```typescript
interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
  disabled?: boolean;
  priority: number;
}
```

- 再帰的 `children` によりツリーメニューを実現
- 役割: メイン/フッター/サイドバー共通で利用

## 5. PageConfig — ページ設定

```typescript
interface PageConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  content: {
    source: "static" | "dynamic" | "api";
    data?: any;
    apiEndpoint?: string;
  };
  layout: {
    type: "default" | "custom";
    grid?: GridConfig;
    components?: string[];
  };
  seo: SEOData;
  features: {
    search: boolean;
    comments: boolean;
    share: boolean;
  };
}

interface GridConfig {
  columns: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  gap: string;
  padding: string;
}
```

- `content.source` に static / dynamic / api を指定し SSR/ISR/SSG を切替
- `layout.grid` でレスポンシブ列数を JSON で宣言

---

### 利用パターン早見表

| ページ         | ContentItem.type | 補足                               |
| -------------- | ---------------- | ---------------------------------- |
| ポートフォリオ | `portfolio`      | category: video/design/programming |
| プラグイン配布 | `plugin`         | downloadInfo.price で有料判定      |
| ブログ記事     | `blog`           | contentPath: Markdown              |
| プロフィール   | `profile`        | customFields に経歴・QR など       |
| ツール         | `tool`           | customFields.toolConfig で設定     |

---

## 7. データ管理とAPI設計

### データ保存形式

```
public/data/
├── content/
│   ├── portfolio.json      # ポートフォリオデータ
│   ├── blog.json          # ブログ記事データ
│   ├── plugin.json        # プラグインデータ
│   ├── download.json      # ダウンロードデータ
│   ├── tool.json          # ツールデータ
│   └── profile.json       # プロフィールデータ
├── stats/
│   ├── download-stats.json # ダウンロード統計
│   ├── view-stats.json     # 閲覧統計
│   └── search-stats.json   # 検索統計
└── cache/
    ├── search-index.json   # 検索インデックス
    └── site-map.json       # サイトマップ
```

### API Routes 設計

```typescript
// src/app/api/content/[type]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { type: string } }
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const data = await getContentByType(params.type, {
      category,
      limit,
      offset,
    });

    return Response.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        total: data.length,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// src/app/api/content/search/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    const { query, type, category, limit = 10 } = await request.json();

    const results = await searchContent(query, { type, category, limit });

    return Response.json({
      success: true,
      data: results,
      query,
      filters: { type, category },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}

// src/app/api/stats/download/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    const { id } = await request.json();

    await updateDownloadStats(id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to update stats" },
      { status: 500 }
    );
  }
}

// src/app/api/stats/view/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    const { id } = await request.json();

    await updateViewStats(id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to update stats" },
      { status: 500 }
    );
  }
}

// src/app/api/contact/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.json();

    // バリデーション
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // reCAPTCHA検証
    const recaptchaValid = await verifyRecaptcha(formData.recaptchaToken);
    if (!recaptchaValid) {
      return Response.json(
        { success: false, error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // メール送信
    await sendContactEmail(formData);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to send contact form" },
      { status: 500 }
    );
  }
}

// src/app/api/admin/content/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    // 開発環境チェック
    if (process.env.NODE_ENV !== "development") {
      return Response.json(
        { success: false, error: "Admin access denied in production" },
        { status: 403 }
      );
    }

    const { action, data } = await request.json();

    switch (action) {
      case "create":
        await createContent(data);
        break;
      case "update":
        await updateContent(data);
        break;
      case "delete":
        await deleteContent(data.id);
        break;
      default:
        return Response.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Admin operation failed" },
      { status: 500 }
    );
  }
}

// src/app/api/admin/upload/route.ts
export async function POST(request: Request): Promise<Response> {
  try {
    // 開発環境チェック
    if (process.env.NODE_ENV !== "development") {
      return Response.json(
        { success: false, error: "Admin access denied in production" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // ファイル検証
    const validation = validateUploadedFile(file, type);
    if (!validation.isValid) {
      return Response.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // ファイル保存
    const filePath = await saveUploadedFile(file, type);

    return Response.json({
      success: true,
      data: { filePath, fileName: file.name },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "File upload failed" },
      { status: 500 }
    );
  }
}
```

### 検索機能実装

```typescript
// lib/search/index.ts
export interface SearchIndex {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  searchableContent: string; // title + description + content + tags
}

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  url: string;
  score: number;
  highlights: string[];
}

export const searchContent = async (
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean; // markdownファイルの内容も検索対象に含める
  } = {}
): Promise<SearchResult[]> => {
  const { type, category, limit = 10, includeContent = false } = options;

  try {
    // 検索インデックス読み込み
    const searchIndex = await loadSearchIndex();

    // フィルタリング
    let filteredIndex = searchIndex;
    if (type) {
      filteredIndex = filteredIndex.filter((item) => item.type === type);
    }
    if (category) {
      filteredIndex = filteredIndex.filter(
        (item) => item.category === category
      );
    }

    // Fuse.jsを使用したファジー検索
    const fuse = new Fuse(filteredIndex, {
      keys: ["title", "description", "tags"],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });

    const results = fuse.search(query);

    // 結果の整形
    const searchResults: SearchResult[] = results
      .slice(0, limit)
      .map((result) => ({
        id: result.item.id,
        type: result.item.type,
        title: result.item.title,
        description: result.item.description,
        url: generateContentUrl(result.item),
        score: result.score || 0,
        highlights: result.matches?.map((match) => match.value) || [],
      }));

    return searchResults;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};
```

### 統計データ管理

```typescript
// lib/stats/index.ts
export interface StatData {
  downloads: Record<string, number>;
  views: Record<string, number>;
  searches: Record<string, number>;
  lastUpdated: string;
}

export const updateStats = async (type: "download" | "view", id: string) => {
  try {
    const statsPath = `public/data/stats/${type}-stats.json`;
    const stats = await loadStats(statsPath);

    // 統計更新
    if (!stats[id]) {
      stats[id] = 0;
    }
    stats[id]++;

    // ファイル保存
    await saveStats(statsPath, stats);

    return true;
  } catch (error) {
    console.error(`Failed to update ${type} stats:`, error);
    return false;
  }
};

export const getStats = async (type: "download" | "view", id?: string) => {
  try {
    const statsPath = `public/data/stats/${type}-stats.json`;
    const stats = await loadStats(statsPath);

    if (id) {
      return stats[id] || 0;
    }

    return stats;
  } catch (error) {
    console.error(`Failed to get ${type} stats:`, error);
    return id ? 0 : {};
  }
};
```

---

> **メンテナンス指針**: 新しいコンテンツタイプやフィールドを追加する際は `ContentItem.customFields` を優先し、型が安定したら正式フィールド化してください。データ管理は静的JSON形式で行い、Admin機能でのみ更新を行います。

## 6. パフォーマンス最適化ユーティリティ (実装例)

```typescript
// lib/utils/performance.ts
import { lazy } from "react";

// 動的インポート (Chunk Split)
export const LazyComponents = {
  ColorPalette: lazy(() => import("@/components/tools/ColorPalette")),
  ThreeJSPlayground: lazy(
    () => import("@/components/playground/ThreeJSPlayground")
  ),
  ProtoType: lazy(() => import("@/components/tools/ProtoType")),
  SequentialPngPreview: lazy(
    () => import("@/components/tools/SequentialPngPreview")
  ),
};

// 画像最適化 Wrapper
export const optimizeImage = (
  src: string,
  {
    width,
    height,
    quality = 85,
    format = "webp",
  }: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "png" | "jpg";
  } = {}
) => ({
  src,
  width,
  height,
  quality,
  format,
  placeholder: "blur" as const,
  blurDataURL: generateBlurDataURL(),
});

// メモリリーク防止 (Three.js)
export const memoryOptimization = {
  disposeThreeObjects: (scene: any) => {
    scene.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  },

  disposePixiObjects: (app: any) => {
    if (app.stage) {
      app.stage.destroy({ children: true });
    }
    if (app.renderer) {
      app.renderer.destroy();
    }
  },
};

// キャッシュ管理
export const cacheManager = {
  setCache: (key: string, data: any, ttl: number = 3600) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getCache: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp, ttl } = JSON.parse(item);
      const now = Date.now();

      if (now - timestamp > ttl * 1000) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  },

  clearCache: (pattern?: string) => {
    if (pattern) {
      Object.keys(localStorage)
        .filter((key) => key.includes(pattern))
        .forEach((key) => localStorage.removeItem(key));
    } else {
      localStorage.clear();
    }
  },
};
```

### 適用ガイド

1. 3D/Canvas 系は必ず **SSR 無効** で動的 import。
2. 画像は `optimizeImage()` ラッパを経由し Next Image に渡す。
3. プレイグラウンドページ `unmount` 時に `memoryOptimization.disposeThreeObjects(scene)` を呼び出す。

---

## 8. カテゴリ・タグ設計

### 作品カテゴリ例

- 依頼
- 個人制作
- 映像
- デザイン
- プログラミング
- 3DCG
- DTM

### タグ設計例

- 使用ツール: AfterEffects, Blender, Photoshop, Unity, etc.
- 技術スタック: React, Next.js, TypeScript, Tailwind CSS, etc.
- 細分類: ショート動画, MV, UI/UX, ゲーム, etc.

> **管理方法**: これらのカテゴリ・タグはdata-managerから自由に追加・編集・削除可能です。

## 9. エラーハンドリング設計

```typescript
// lib/utils/error-handling.ts
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "ContentError";
  }
}

export const errorHandler = {
  handleApiError: (error: any): AppError => {
    if (error instanceof ContentError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      details: error.message,
      timestamp: new Date().toISOString(),
    };
  },

  logError: (error: AppError) => {
    console.error("Application Error:", error);
    // 本番環境ではSentry等に送信
  },
};
```

## 10. バリデーション設計

```typescript
// lib/utils/validation.ts
export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== "";
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  fileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },
};
```
