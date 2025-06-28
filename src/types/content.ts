// 統一コンテンツアイテム
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
  metadata?: Record<string, unknown>; // 動的メタデータ

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

// Portfolio Types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  tags: string[];

  // メディア
  featuredImage: string;
  images: string[];
  videos?: string[];

  // 詳細情報
  client?: string;
  projectPeriod: string;
  technologies: string[];
  challenges: string;
  solutions: string;
  results?: string;

  // リンク
  liveUrl?: string;
  sourceUrl?: string;
  caseStudyUrl?: string;

  // メタデータ
  featured: boolean;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type PortfolioCategory =
  | "web-development"
  | "ui-design"
  | "plugin-development"
  | "automation-tool"
  | "personal-project";

export interface PortfolioCategoryData {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface Technology {
  name: string;
  category: "frontend" | "backend" | "tools" | "design";
  color: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  // メタデータ
  publishedAt: string;
  updatedAt: string;
  status: "published" | "draft" | "scheduled";

  // 分類
  category: BlogCategory;
  tags: string[];

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
  };

  // メディア
  featuredImage?: string;
  imageAlt?: string;

  // エンゲージメント
  readTime: number;
  viewCount: number;
  likeCount: number;

  // 関連コンテンツ
  relatedPosts: string[];
  series?: {
    name: string;
    order: number;
    totalParts: number;
  };
}

export type BlogCategory =
  | "tech-tips"
  | "development"
  | "design"
  | "productivity"
  | "review"
  | "opinion";

export interface BlogCategoryData {
  id: string;
  label: string;
  description: string;
  color: string;
}

// Workshop Types (Plugin Sales)
export interface PluginProduct {
  id: string;
  name: string;
  description: string;
  shortDescription: string;

  // 販売情報
  price: number;
  currency: "JPY";
  salePrice?: number;
  availability: "available" | "sold_out" | "coming_soon";

  // 商品詳細
  version: string;
  compatibility: string[];
  fileSize: string;
  downloadCount: number;
  rating: number;
  reviewCount: number;

  // メディア
  featuredImage: string;
  screenshots: string[];
  demoVideo?: string;

  // 技術情報
  requirements: {
    software: string;
    version: string;
    os: string[];
  };

  features: string[];
  changelog: ChangelogEntry[];

  // 販売プラットフォーム
  platforms: {
    booth?: {
      url: string;
      productId: string;
    };
    gumroad?: {
      url: string;
      productId: string;
    };
    direct?: {
      enabled: boolean;
      stripeProductId?: string;
    };
  };

  // SEO・マーケティング
  tags: string[];
  category: "wordpress" | "vscode" | "chrome" | "figma" | "other";
  featured: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  type: "major" | "minor" | "patch";
}

// Form Types
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
  defaultValue?: string | number | boolean | string[] | null;
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

export interface FieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FieldValidation {
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: string | number | RegExp;
  message: string;
}

export interface ConditionalLogic {
  dependsOn: string;
  condition:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
  value: string | number | boolean;
}

export interface ValidationRule {
  fieldId: string;
  rules: FieldValidation[];
}

export interface FormStyling {
  layout: "vertical" | "horizontal" | "grid";
  spacing: "compact" | "normal" | "relaxed";
  theme: "light" | "dark" | "auto";
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}

// Filter Types
export interface FilterOptions {
  categories: {
    label: string;
    value: string;
    count: number;
  }[];

  technologies: {
    label: string;
    value: string;
    count: number;
    group: "frontend" | "backend" | "tools" | "design";
  }[];

  years: {
    label: string;
    value: number;
    count: number;
  }[];

  status: {
    featured: boolean;
    hasLiveDemo: boolean;
    hasSourceCode: boolean;
  };
}
