# Portfolio カテゴリー機能仕様

## 📋 概要

Portfolio カテゴリーは、制作物・プロジェクトをギャラリー形式で展示し、実績を効果的にアピールするセクションです。

## 🎯 主要機能

### 1. ギャラリーページ (`/portfolio`)

#### データ構造

```typescript
interface PortfolioItem {
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

type PortfolioCategory =
  | "web-development"
  | "ui-design"
  | "plugin-development"
  | "automation-tool"
  | "personal-project";
```

#### 表示機能

- **グリッドレイアウト**: マソリータイル風の可変グリッド
- **フィルタリング**: カテゴリ・技術スタック・年度別
- **ソート機能**: 最新順・人気順・カテゴリ順
- **検索機能**: タイトル・説明文・タグでの全文検索

### 2. フィルタリングシステム

#### フィルタ種別

```typescript
interface FilterOptions {
  categories: {
    label: string;
    value: PortfolioCategory;
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
```

#### UI コンポーネント

- **カテゴリータブ**: ホリゾンタルタブメニュー
- **技術タグ**: チェックボックス形式の多重選択
- **期間スライダー**: 範囲選択スライダー
- **検索ボックス**: リアルタイム検索（debounce 付き）

### 3. 詳細ページ (`/portfolio/[slug]`)

#### ページ構成

```typescript
interface PortfolioDetailPage {
  header: {
    title: string;
    subtitle: string;
    featuredImage: string;
    metadata: {
      category: string;
      client?: string;
      period: string;
      technologies: string[];
    };
  };

  overview: {
    challenge: string;
    solution: string;
    result?: string;
  };

  gallery: {
    images: ImageGalleryItem[];
    videos?: VideoItem[];
  };

  details: {
    features: FeatureItem[];
    technicalDetails: TechnicalDetail[];
    lessons: string[];
  };

  links: {
    live?: string;
    source?: string;
    demo?: string;
  };

  navigation: {
    previous?: PortfolioItem;
    next?: PortfolioItem;
  };
}
```

#### インタラクティブ要素

- **画像ギャラリー**: Lightbox 表示、ズーム・スライドショー
- **動画プレイヤー**: カスタム動画プレイヤー、字幕対応
- **コードスニペット**: シンタックスハイライト付きコード表示
- **プロトタイプ埋め込み**: Figma・CodePen 等の iframe 埋め込み

## 🎨 デザインシステム

### レイアウトパターン

```css
/* ギャラリーグリッド */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;

  /* マソリーレイアウト（CSS Grid 使用） */
  grid-template-rows: masonry;
}

/* カード設計 */
.portfolio-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.portfolio-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

### カラーシステム

- **カテゴリカラー**: 各カテゴリに固有のカラーを設定
  - Web Development: `#2563eb` (青)
  - UI Design: `#7c3aed` (紫)
  - Plugin Development: `#059669` (緑)
  - Automation Tool: `#dc2626` (赤)
  - Personal Project: `#d97706` (オレンジ)

### アニメーション

```css
/* 表示アニメーション */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.portfolio-item {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

/* スタガードアニメーション */
.portfolio-item:nth-child(1) {
  animation-delay: 0.1s;
}
.portfolio-item:nth-child(2) {
  animation-delay: 0.2s;
}
.portfolio-item:nth-child(3) {
  animation-delay: 0.3s;
}
```

## 🔧 技術実装

### データ管理

```typescript
// データファイル構成
const dataFiles = {
  "/data/portfolio/web-development.json": "Web開発プロジェクト",
  "/data/portfolio/ui-design.json": "UIデザイン作品",
  "/data/portfolio/plugins.json": "プラグイン・ツール",
  "/data/portfolio/personal.json": "個人プロジェクト",
};

// データ統合API
export async function getPortfolioItems(
  filters?: FilterOptions
): Promise<PortfolioItem[]> {
  // 全JSONファイルを読み込み
  const allItems = await Promise.all([
    import("/data/portfolio/web-development.json"),
    import("/data/portfolio/ui-design.json"),
    import("/data/portfolio/plugins.json"),
    import("/data/portfolio/personal.json"),
  ]);

  // フィルタリング・ソート処理
  return processItems(allItems.flat(), filters);
}
```

### パフォーマンス最適化

- **画像最適化**: Next.js Image コンポーネント、WebP 変換
- **遅延読み込み**: Intersection Observer による段階的読み込み
- **キャッシュ戦略**: ISR (Incremental Static Regeneration) 使用
- **CDN 配信**: 画像・動画の CDN 配信

### SEO 対策

```typescript
// メタデータ生成
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const item = getPortfolioItem(params.slug);

  return {
    title: `${item.title} | Portfolio - samuido`,
    description: item.description,
    keywords: [...item.tags, ...item.technologies],

    openGraph: {
      title: item.title,
      description: item.description,
      images: [item.featuredImage],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
      images: [item.featuredImage],
    },
  };
}
```

## 📊 コンテンツ戦略

### 掲載予定プロジェクト

1. **Web 開発**

   - コーポレートサイト制作 (React + TypeScript)
   - EC サイト開発 (Next.js + Stripe)
   - 管理画面システム (Vue.js + Laravel)

2. **UI デザイン**

   - モバイルアプリ UI (Figma)
   - Web サービス リデザイン
   - ブランディングデザイン

3. **プラグイン開発**

   - WordPress プラグイン
   - VS Code 拡張機能
   - Chrome 拡張機能

4. **自動化ツール**
   - 業務効率化スクリプト
   - API 連携ツール
   - デプロイ自動化

### コンテンツ更新戦略

- **頻度**: 月 2-3 回の新規追加
- **品質**: 各プロジェクトに詳細なケーススタディを付与
- **多様性**: 技術スタック・規模・分野の多様性を確保

## 🚀 実装ロードマップ

### Phase 2 (Week 1-3)

- ✅ 基本ギャラリーページ
- ✅ フィルタリング機能
- ✅ 詳細ページテンプレート

### Phase 3 (Week 1-2)

- 🔄 高度な検索機能
- 🔄 パフォーマンス最適化
- 🔄 SEO 強化

### Phase 5 (Week 1-4)

- ⏳ インタラクティブ要素
- ⏳ 3D プレビュー機能
- ⏳ アニメーション強化

## 📈 成功指標

### エンゲージメント

- **平均滞在時間**: 3 分以上
- **詳細ページ遷移率**: 40% 以上
- **外部リンククリック率**: 15% 以上

### SEO パフォーマンス

- **検索順位**: 関連キーワードで上位 10 位以内
- **オーガニック流入**: 月 500 セッション以上
- **被リンク**: 月 5 本以上

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [基本情報](../01-project-overview/basic-info.md)
- [データ構造](../02-architecture/data-structure.md)
- [About 機能](./about-features.md)
