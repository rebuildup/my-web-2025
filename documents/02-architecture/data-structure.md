# データ構造設計

## 基本設計原則

### 統一性

- 全コンテンツで共通のベース構造を使用
- 一貫した命名規則の適用
- 型安全性の確保

### 拡張性

- 新しいコンテンツタイプの追加が容易
- フィールドの動的追加に対応
- バージョニング対応

### パフォーマンス

- 必要なデータのみの取得
- 効率的なキャッシュ戦略
- 段階的データ読み込み

## 主要データ構造

### 1. ContentItem - 統一コンテンツアイテム

```typescript
// src/types/content.ts
export interface ContentItem {
  // 基本情報
  id: string; // 一意識別子
  type: ContentType; // コンテンツタイプ
  title: string; // タイトル
  description: string; // 説明文
  slug: string; // URL用スラッグ

  // メタデータ
  createdAt: string; // 作成日時（ISO 8601）
  updatedAt: string; // 更新日時（ISO 8601）
  publishedAt?: string; // 公開日時
  status: "draft" | "published" | "archived";

  // 分類・タグ
  category: string; // カテゴリ
  tags: string[]; // タグ配列

  // メディア
  featuredImage?: string; // アイキャッチ画像
  images?: string[]; // 画像配列
  videos?: string[]; // 動画配列

  // コンテンツ
  content?: string; // Markdown/HTML コンテンツ
  excerpt?: string; // 抜粋

  // 拡張フィールド
  metadata?: Record<string, any>; // 動的メタデータ

  // SEO
  seo?: SEOData;
}

export type ContentType =
  | "portfolio" // ポートフォリオ作品
  | "blog" // ブログ記事
  | "plugin" // プラグイン
  | "tool" // ツール
  | "profile" // プロフィール
  | "page"; // 固定ページ

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}
```

### 2. SiteConfig - サイト設定構造

```typescript
// src/types/config.ts
export interface SiteConfig {
  // 基本情報
  site: {
    name: string;
    description: string;
    url: string;
    logo: string;
    favicon: string;
  };

  // 作者情報
  author: {
    name: string;
    handle: string;
    email: string;
    bio: string;
    avatar: string;
    location: string;
  };

  // ソーシャルメディア
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    booth?: string;
    [key: string]: string | undefined;
  };

  // ナビゲーション
  navigation: NavigationItem[];

  // テーマ設定
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };

  // 機能設定
  features: {
    blog: boolean;
    portfolio: boolean;
    tools: boolean;
    shop: boolean;
    comments: boolean;
    analytics: boolean;
  };

  // SEO設定
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultOgImage: string;
  };
}
```

### 3. FormConfig - 統一フォーム設定

```typescript
// src/types/form.ts
export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  actions: FormAction[];
  validation?: ValidationRule[];
  styling?: FormStyling;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation[];
  conditional?: ConditionalLogic;
}

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "number"
  | "range"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "image"
  | "hidden";

export interface FormAction {
  type: "submit" | "reset" | "custom";
  label: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  redirect?: string;
  confirmation?: string;
}
```

### 4. NavigationItem - ナビゲーション構造

```typescript
// src/types/navigation.ts
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  description?: string;
  children?: NavigationItem[];

  // 表示制御
  visible: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;

  // アクセス制御
  requireAuth?: boolean;
  roles?: string[];

  // スタイリング
  highlight?: boolean;
  className?: string;

  // 動作制御
  external?: boolean;
  newTab?: boolean;
  onClick?: string; // JavaScript関数名
}
```

### 5. PageConfig - ページ設定構造

```typescript
// src/types/page.ts
export interface PageConfig {
  // ページ基本情報
  slug: string;
  title: string;
  description?: string;
  template: PageTemplate;

  // レイアウト
  layout: "default" | "full" | "minimal" | "custom";
  sections: PageSection[];

  // SEO・メタデータ
  seo: SEOData;
  metadata: Record<string, any>;

  // アクセス制御
  public: boolean;
  requireAuth?: boolean;

  // キャッシュ設定
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
    tags: string[];
  };
}

export type PageTemplate =
  | "static" // 静的ページ
  | "list" // リスト表示
  | "detail" // 詳細ページ
  | "form" // フォームページ
  | "tool" // ツールページ
  | "custom"; // カスタムページ

export interface PageSection {
  id: string;
  type: SectionType;
  title?: string;
  content?: any;
  config?: Record<string, any>;
  order: number;
  visible: boolean;
}

export type SectionType =
  | "hero"
  | "about"
  | "portfolio"
  | "blog"
  | "tools"
  | "contact"
  | "gallery"
  | "testimonials"
  | "skills"
  | "experience"
  | "custom";
```

## データ活用パターン

### パターン 1: ポートフォリオギャラリー

```typescript
// data/portfolio.json
{
  "items": [
    {
      "id": "portfolio-web-redesign",
      "type": "portfolio",
      "title": "企業サイトリデザイン",
      "category": "web-design",
      "tags": ["UI/UX", "リデザイン", "レスポンシブ"],
      "featuredImage": "/images/portfolio/web-redesign-thumb.jpg",
      "images": ["/images/portfolio/web-redesign-1.jpg"],
      "metadata": {
        "client": "ABC株式会社",
        "duration": "3ヶ月",
        "technologies": ["Next.js", "Tailwind CSS"]
      }
    }
  ]
}
```

### パターン 2: プラグイン販売ページ

```typescript
// data/plugins.json
{
  "items": [
    {
      "id": "plugin-auto-backup",
      "type": "plugin",
      "title": "自動バックアッププラグイン",
      "category": "productivity",
      "metadata": {
        "price": 500,
        "currency": "JPY",
        "downloadUrl": "https://booth.pm/items/...",
        "version": "1.2.0",
        "compatibility": ["After Effects 2023", "2024"]
      }
    }
  ]
}
```

### パターン 3: ブログシステム

```typescript
// data/blog.json
{
  "items": [
    {
      "id": "blog-nextjs-tips",
      "type": "blog",
      "title": "Next.js開発のコツ",
      "content": "# Next.js開発のコツ\n\n...",
      "excerpt": "Next.js開発で役立つ実践的なテクニック",
      "publishedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## JSON ファイル管理

### データファイル構成

```
data/
├── site-config.json     # サイト全体設定
├── navigation.json      # ナビゲーション設定
├── content/
│   ├── portfolio.json   # ポートフォリオデータ
│   ├── blog.json       # ブログ記事データ
│   ├── plugins.json    # プラグインデータ
│   ├── tools.json      # ツールデータ
│   └── pages.json      # 固定ページデータ
├── forms/
│   ├── contact.json    # お問い合わせフォーム
│   ├── estimate.json   # 見積もりフォーム
│   └── subscription.json # 購読フォーム
└── metadata/
    ├── categories.json # カテゴリマスター
    ├── tags.json      # タグマスター
    └── skills.json    # スキルマスター
```

### データ管理原則

1. **単一責任**: 各 JSON ファイルは特定の責任を持つ
2. **正規化**: 重複データを避け、参照関係を明確化
3. **バージョニング**: スキーマ変更時の後方互換性
4. **バリデーション**: 型定義による厳密な検証

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [API 設計](./api-design.md)
- [パフォーマンス最適化](./performance.md)
