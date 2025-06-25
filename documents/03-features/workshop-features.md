# Workshop カテゴリー機能仕様

## 📋 概要

Workshop カテゴリーは、プラグイン販売・ブログ・技術記事などの創作活動を展開するセクションです。

## 🎯 主要機能

### 1. プラグイン販売 (`/workshop/plugins`)

#### 商品データ構造

```typescript
interface PluginProduct {
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
```

#### プラグイン一覧ページ

- **グリッドレイアウト**: 商品カード形式の一覧表示
- **フィルタリング**: カテゴリ・価格帯・評価・対応ソフトウェア
- **ソート機能**: 新着順・人気順・価格順・評価順
- **検索機能**: 商品名・説明・タグでの検索

#### プラグイン詳細ページ

```typescript
interface PluginDetailPage {
  hero: {
    name: string;
    tagline: string;
    featuredImage: string;
    price: number;
    purchaseButtons: PurchaseButton[];
  };

  overview: {
    description: string;
    features: FeatureItem[];
    screenshots: ImageGallery;
    demoVideo?: string;
  };

  details: {
    requirements: SystemRequirements;
    installation: InstallationGuide;
    usage: UsageGuide;
    faq: FAQItem[];
  };

  reviews: {
    rating: number;
    reviewCount: number;
    reviews: ReviewItem[];
  };

  related: PluginProduct[];
}
```

### 2. ブログシステム (`/workshop/blog`)

#### ブログ記事構造

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown

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
  readTime: number; // 推定読書時間（分）
  viewCount: number;
  likeCount: number;

  // 関連コンテンツ
  relatedPosts: string[]; // 関連記事ID
  series?: {
    name: string;
    order: number;
    totalParts: number;
  };
}

type BlogCategory =
  | "tech-tips"
  | "development"
  | "design"
  | "productivity"
  | "review"
  | "opinion";
```

#### ブログ機能

- **Markdown 対応**: MDX による拡張 Markdown
- **シンタックスハイライト**: コードブロックの色分け
- **目次自動生成**: 見出しから目次を自動作成
- **読書時間計算**: 文字数から読書時間を自動算出
- **関連記事推薦**: タグ・カテゴリベースの推薦
- **検索機能**: 全文検索対応

### 3. ダウンロード管理 (`/workshop/downloads`)

#### ダウンロードシステム

```typescript
interface DownloadItem {
  id: string;
  name: string;
  description: string;
  fileType: "plugin" | "template" | "resource" | "tool";

  // ファイル情報
  fileName: string;
  fileSize: number;
  downloadCount: number;

  // アクセス制御
  accessType: "free" | "paid" | "subscriber" | "member";
  purchaseRequired?: {
    productId: string;
    platform: "booth" | "gumroad" | "stripe";
  };

  // バージョン管理
  version: string;
  changelog: string;
  releaseDate: string;

  // メタデータ
  tags: string[];
  category: string;
  license: "MIT" | "GPL" | "Commercial" | "CC" | "Custom";
}
```

#### 認証・決済統合

- **購入確認**: Booth・Gumroad API での購入確認
- **ダウンロードリンク**: 一時的な署名付き URL 生成
- **利用統計**: ダウンロード数・人気度の追跡
- **不正防止**: IP 制限・ダウンロード回数制限

### 4. コメント・交流システム

#### コメント機能

```typescript
interface Comment {
  id: string;
  postId: string;
  parentId?: string; // 返信の場合

  // 投稿者情報
  author: {
    name: string;
    email: string;
    website?: string;
    avatar?: string;
  };

  // コンテンツ
  content: string;
  publishedAt: string;

  // モデレーション
  status: "approved" | "pending" | "spam" | "rejected";

  // エンゲージメント
  likeCount: number;
  replyCount: number;
}
```

#### モデレーション機能

- **自動スパム検出**: キーワードフィルタリング
- **手動承認**: 初回コメントは手動承認
- **返信通知**: メール通知システム
- **削除・編集**: 管理者による管理機能

## 🎨 デザインシステム

### レイアウトパターン

```css
/* ブログ記事レイアウト */
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
}

.blog-post h1,
.blog-post h2,
.blog-post h3 {
  margin-top: 2em;
  margin-bottom: 0.5em;
  scroll-margin-top: 100px; /* ヘッダー高さ分のマージン */
}

/* コードブロック */
.blog-post pre {
  background: #1e293b;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

/* プラグインカード */
.plugin-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.plugin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

### タイポグラフィ

- **見出し**: Geist Sans、ウェイト 600-700
- **本文**: system-ui、ウェイト 400
- **コード**: 'Fira Code'、等幅フォント
- **行間**: 1.7（読みやすさ重視）

## 🔧 技術実装

### Markdown 処理

```typescript
// MDX 設定
const mdxOptions = {
  remarkPlugins: [
    remarkGfm, // GitHub Flavored Markdown
    remarkToc, // 目次生成
    remarkMath, // 数式サポート
  ],
  rehypePlugins: [
    rehypeSlug, // 見出しにIDを付与
    rehypeAutolinkHeadings, // 見出しにリンクを追加
    rehypePrism, // シンタックスハイライト
    rehypeKatex, // 数式レンダリング
  ],
};

// カスタムコンポーネント
const components = {
  pre: CodeBlock, // カスタムコードブロック
  img: OptimizedImage, // 最適化画像
  a: ExternalLink, // 外部リンク
  blockquote: Callout, // カスタム引用
};
```

### SEO 最適化

```typescript
// ブログ記事メタデータ
export function generateBlogMetadata(post: BlogPost): Metadata {
  return {
    title: `${post.title} | Workshop - samuido`,
    description: post.excerpt,
    keywords: [...post.tags, post.category],

    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },

    alternates: {
      canonical: `https://yusuke-kim.com/workshop/blog/${post.slug}`,
    },
  };
}
```

### パフォーマンス最適化

- **静的生成**: ブログ記事の静的生成（ISR）
- **画像最適化**: WebP 変換、適切なサイズ配信
- **コード分割**: 動的インポートによる最適化
- **CDN**: 静的アセットの CDN 配信

## 📊 コンテンツ戦略

### ブログコンテンツ計画

1. **技術記事** (月 4-6 記事)

   - 開発ティップス・ハウツー
   - 新技術の解説・検証
   - パフォーマンス最適化

2. **プラグイン紹介** (月 2-3 記事)

   - 新作プラグインの解説
   - 使い方ガイド・チュートリアル
   - アップデート情報

3. **レビュー・評価** (月 1-2 記事)
   - ツール・サービスレビュー
   - 技術書レビュー
   - 競合分析

### プラグイン開発ロードマップ

1. **WordPress プラグイン**

   - SEO 最適化プラグイン
   - カスタムフィールド拡張
   - パフォーマンス監視

2. **VS Code 拡張**

   - コードスニペット集
   - プロジェクト管理拡張
   - Git 連携強化

3. **ブラウザ拡張**
   - 開発者ツール拡張
   - SNS 効率化ツール
   - デザイン支援ツール

## 🚀 実装ロードマップ

### Phase 5 (Week 1-4)

- ✅ ブログシステム基盤
- ✅ Markdown 処理設定
- ✅ プラグイン一覧ページ

### Phase 6 (Week 1-3)

- 🔄 コメントシステム
- 🔄 ダウンロード管理
- 🔄 決済統合（Booth 連携）

### Phase 7+ (継続)

- ⏳ 高度な検索・フィルタ
- ⏳ レコメンデーション
- ⏳ ユーザーダッシュボード

## 📈 成功指標

### エンゲージメント

- **ブログ記事平均滞在時間**: 4 分以上
- **プラグインページ滞在時間**: 2 分以上
- **コメント投稿率**: 記事あたり 2 件以上

### ビジネス指標

- **プラグイン月間売上**: 5 万円以上
- **ダウンロード数**: 月 100 件以上
- **メール登録率**: 月 20 人以上

### SEO パフォーマンス

- **オーガニック流入**: 月 1,000 セッション以上
- **技術記事検索順位**: 上位 5 位以内
- **被リンク**: 月 10 本以上

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [基本情報](../01-project-overview/basic-info.md)
- [Tools 機能](./tools-features.md)
- [データ構造](../02-architecture/data-structure.md)
