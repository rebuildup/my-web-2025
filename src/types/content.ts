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
