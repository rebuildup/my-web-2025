# Design Document

## Overview

このドキュメントでは、ポートフォリオページの完全実装のための設計を詳述します。現在の実装を基盤として、documentsの仕様に従って11のページを含む包括的なポートフォリオシステムを構築します。

### 現在の実装状況

- ✅ ポートフォリオトップページ (`/portfolio`) - 基本実装済み
- ✅ 作品詳細ページ (`/portfolio/[slug]`) - 基本実装済み
- ✅ データ管理システム (`ContentItem`型、API) - 実装済み
- ✅ アナリティクス機能 - 実装済み
- ❌ ギャラリーページ群 - 未実装
- ❌ 詳細ページ群 - 未実装
- ❌ プレイグラウンドページ群 - 未実装

## Architecture

### システム構成

```
Portfolio System
├── Data Layer
│   ├── ContentItem (型定義)
│   ├── API Endpoints (/api/content/[type])
│   └── JSON Data Files (public/data/content/portfolio.json)
├── Page Layer
│   ├── Top Page (/portfolio)
│   ├── Gallery Pages (/portfolio/gallery/*)
│   ├── Detail Pages (/portfolio/detail/*)
│   ├── Playground Pages (/portfolio/playground/*)
│   └── Dynamic Detail Page (/portfolio/[slug])
├── Component Layer
│   ├── Gallery Components
│   ├── Detail Components
│   ├── Playground Components
│   └── Analytics Components
└── Utility Layer
    ├── Data Fetching
    ├── SEO Management
    └── Performance Optimization
```

### データフロー

```
User Request → Next.js Router → Page Component → API Call → Data Layer → JSON File
                                     ↓
User Interface ← Component Rendering ← Data Processing ← API Response ← File System
```

## Components and Interfaces

### 1. ギャラリーコンポーネント

#### AllGallery Component

```typescript
interface AllGalleryProps {
  items: ContentItem[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

interface FilterOptions {
  category?: string;
  tags?: string[];
  year?: number;
  sortBy: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder: "asc" | "desc";
}
```

**機能:**

- 統一されたカードレイアウト
- 詳細パネル表示（モーダル）
- フィルター・ソート機能
- 無限スクロールまたはページネーション

#### DevelopGallery Component

```typescript
interface DevelopGalleryProps {
  items: ContentItem[];
  filters: DevelopFilterOptions;
}

interface DevelopFilterOptions extends FilterOptions {
  technologies?: string[];
  projectType?: "web" | "game" | "tool" | "plugin";
}
```

**機能:**

- 2列交互配置レイアウト
- 技術スタック強調表示
- リポジトリリンク表示
- プレビュー動画埋め込み

#### VideoGallery Component

```typescript
interface VideoGalleryProps {
  items: ContentItem[];
  filters: VideoFilterOptions;
}

interface VideoFilterOptions extends FilterOptions {
  videoType?: "mv" | "lyric" | "animation" | "promotion";
  client?: string;
}
```

**機能:**

- foriioライクなレイアウト
- 動画プレビュー機能
- YouTube/Vimeo埋め込み
- 軽量プレビュー

#### VideoDesignGallery Component

```typescript
interface VideoDesignGalleryProps {
  items: ContentItem[];
  gridConfig: GridConfig;
}

interface GridConfig {
  columns: number;
  aspectRatio: number;
  dynamicSizing: boolean;
}
```

**機能:**

- 縦3列グリッドレイアウト
- コンテンツ応答型サイズ調整
- ホバー表示機能
- アスペクト比計算

### 2. プレイグラウンドコンポーネント

#### DesignPlayground Component

```typescript
interface DesignPlaygroundProps {
  experiments: ExperimentItem[];
  interactionMode: "mouse" | "touch" | "keyboard";
}

interface ExperimentItem {
  id: string;
  title: string;
  description: string;
  technology: string[];
  interactive: boolean;
  component: React.ComponentType;
}
```

#### WebGLPlayground Component

```typescript
interface WebGLPlaygroundProps {
  experiments: WebGLExperiment[];
  deviceCapabilities: DeviceCapabilities;
}

interface WebGLExperiment extends ExperimentItem {
  webglType: "3d" | "shader" | "particle" | "effect";
  performanceLevel: "low" | "medium" | "high";
}

interface DeviceCapabilities {
  webglSupport: boolean;
  performanceLevel: "low" | "medium" | "high";
  touchSupport: boolean;
}
```

### 3. 共通コンポーネント

#### DetailPanel Component

```typescript
interface DetailPanelProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  variant: "modal" | "sidebar" | "inline";
}
```

#### FilterBar Component

```typescript
interface FilterBarProps {
  filters: FilterOptions;
  availableFilters: AvailableFilters;
  onFilterChange: (filters: FilterOptions) => void;
}

interface AvailableFilters {
  categories: string[];
  tags: string[];
  years: number[];
  technologies?: string[];
}
```

## Data Models

### データ処理戦略

#### 1. データ変換・正規化

```typescript
interface DataProcessor {
  normalizePortfolioData(rawData: any[]): PortfolioContentItem[];
  validateDataIntegrity(data: PortfolioContentItem[]): ValidationResult;
  transformForGallery(
    data: PortfolioContentItem[],
    galleryType: GalleryType,
  ): GalleryItem[];
  generateSearchIndex(data: PortfolioContentItem[]): SearchIndex[];
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### 2. データキャッシュ・同期

```typescript
interface DataCache {
  portfolioData: Map<string, PortfolioContentItem>;
  searchIndex: SearchIndex[];
  categoryStats: CategoryStats;
  lastUpdated: Date;

  updateCache(newData: PortfolioContentItem[]): void;
  invalidateCache(): void;
  syncWithAPI(): Promise<void>;
}
```

#### 3. 他ページとの連携データ

```typescript
interface CrossPageData {
  // ホームページ連携
  featuredProjects: PortfolioContentItem[];
  portfolioStats: PortfolioStats;

  // 検索ページ連携
  searchableContent: SearchableItem[];
  searchFilters: SearchFilter[];

  // About/Commission ページ連携
  skillsFromProjects: Skill[];
  clientWork: ClientProject[];

  // サイトマップ連携
  portfolioUrls: SitemapEntry[];
}
```

### 拡張ContentItem型

現在の`ContentItem`型を拡張して、ポートフォリオ特有のフィールドを追加：

```typescript
interface PortfolioContentItem extends ContentItem {
  // ギャラリー表示用
  thumbnail: string;
  aspectRatio?: number;
  gridSize?: "1x1" | "1x2" | "2x1" | "2x2" | "1x3";

  // 開発系作品用
  repository?: ExternalLink;
  technologies: string[];
  projectType?: "web" | "game" | "tool" | "plugin";

  // 映像作品用
  videoType?: "mv" | "lyric" | "animation" | "promotion";
  client?: string;
  duration?: number;

  // プレイグラウンド用
  interactive?: boolean;
  experimentType?: "design" | "webgl";
  performanceLevel?: "low" | "medium" | "high";

  // SEO・メタデータ
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterImage: string;
    canonical: string;
    structuredData: object;
  };
}
```

### ページメタデータ型

```typescript
interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  structuredData: object;
}

interface OpenGraphData {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  siteName: string;
  locale: string;
}

interface TwitterCardData {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  image: string;
  creator: string;
}
```

## Error Handling

### エラー処理戦略

1. **データ取得エラー**
   - APIエラー時のフォールバック表示
   - 空データ時の適切なメッセージ
   - ネットワークエラー時のリトライ機能

2. **画像・動画読み込みエラー**
   - 画像読み込み失敗時のプレースホルダー
   - 動画埋め込み失敗時の代替表示
   - 遅延読み込み時のローディング状態

3. **WebGLエラー**
   - WebGL非対応デバイスでの代替表示
   - パフォーマンス不足時の品質調整
   - シェーダーコンパイルエラー処理

### エラーコンポーネント

```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorDisplayProps {
  error: Error;
  retry?: () => void;
  variant: "page" | "component" | "inline";
}
```

## Testing Strategy

### npm run test:all 実行戦略

全てのタスクで `npm run test:all` を実行し、エラーや警告を完全に解決する戦略：

#### 1. テスト実行フロー

```bash
# test:all の内容（scripts/run-all-tests.ps1）
npm run type-check     # TypeScript型チェック
npm run lint          # ESLint
npm run format:check  # Prettier
npm run test          # Jest単体テスト
npm run test:e2e      # Playwright E2Eテスト
npm run lighthouse    # Lighthouse性能テスト
```

#### 2. 各テストレベルでの対応

**TypeScript型チェック:**

- 全ての新規コンポーネントの型定義
- 既存型との互換性確保
- strict モードでのエラー解決

**ESLint:**

- アクセシビリティルール準拠
- React/Next.js ベストプラクティス
- カスタムルールの追加

**Prettier:**

- コードフォーマット統一
- import順序の統一
- 改行・インデント統一

### 1. ユニットテスト（Jest）

**対象コンポーネント:**

- ギャラリーコンポーネント群
- フィルター・ソート機能
- データ変換ユーティリティ
- SEOメタデータ生成
- 他ページ連携機能

**100%カバレッジ達成戦略:**

```typescript
describe("Portfolio System", () => {
  describe("Data Processing", () => {
    it("should normalize portfolio data correctly", () => {});
    it("should validate data integrity", () => {});
    it("should transform data for different gallery types", () => {});
    it("should generate search index", () => {});
    it("should handle malformed data gracefully", () => {});
  });

  describe("Cross-Page Integration", () => {
    it("should provide featured projects for home page", () => {});
    it("should generate searchable content for search page", () => {});
    it("should extract skills for about page", () => {});
    it("should generate sitemap entries", () => {});
  });

  describe("AllGallery Component", () => {
    it("should render all portfolio items", () => {});
    it("should filter items by category", () => {});
    it("should sort items by date", () => {});
    it("should open detail panel on item click", () => {});
    it("should handle empty data gracefully", () => {});
    it("should support keyboard navigation", () => {});
    it("should be accessible to screen readers", () => {});
  });

  describe("API Integration", () => {
    it("should fetch portfolio data successfully", () => {});
    it("should handle API errors gracefully", () => {});
    it("should cache data appropriately", () => {});
    it("should sync data across components", () => {});
  });
});
```

### 2. 統合テスト

**対象機能:**

- API → コンポーネント間のデータフロー
- ページ間ナビゲーション
- フィルター状態の永続化
- アナリティクス連携
- 他ページとの連携機能

**他ページ連携テスト:**

```typescript
describe("Cross-Page Integration", () => {
  describe("Home Page Integration", () => {
    it("should provide featured projects to home page", () => {});
    it("should update portfolio stats on home page", () => {});
    it("should sync portfolio links from home page", () => {});
  });

  describe("Search Page Integration", () => {
    it("should include portfolio items in search results", () => {});
    it("should provide portfolio-specific filters", () => {});
    it("should maintain search state across navigation", () => {});
  });

  describe("About/Commission Integration", () => {
    it("should extract skills from portfolio projects", () => {});
    it("should showcase client work examples", () => {});
    it("should link to relevant portfolio items", () => {});
  });

  describe("Sitemap Integration", () => {
    it("should generate all portfolio URLs for sitemap", () => {});
    it("should update sitemap when portfolio changes", () => {});
    it("should set appropriate priorities and frequencies", () => {});
  });
});
```

### 3. E2Eテスト

**主要ユーザージャーニー:**

1. ポートフォリオトップ → カテゴリ選択 → ギャラリー → 詳細ページ
2. 検索機能 → フィルター適用 → 結果表示
3. プレイグラウンド → インタラクション → 実験体験
4. モバイルでのタッチ操作
5. アクセシビリティ（キーボードナビゲーション）

### 4. パフォーマンステスト

**測定指標:**

- Lighthouse スコア 90+
- LCP ≤ 2.5s
- FID ≤ 100ms
- CLS ≤ 0.1
- WebGL フレームレート 60fps

### 5. アクセシビリティテスト

**テスト項目:**

- WCAG 2.1 AA準拠
- キーボードナビゲーション
- スクリーンリーダー対応
- フォーカス管理
- カラーコントラスト

## Performance Optimization

### 1. 画像最適化

- Next.js Image コンポーネント使用
- WebP形式での配信
- 遅延読み込み実装
- レスポンシブ画像対応

### 2. コード分割

```typescript
// 動的インポートによるコード分割
const AllGallery = dynamic(() => import('./components/AllGallery'), {
  loading: () => <GalleryLoading />,
  ssr: false
});

const WebGLPlayground = dynamic(() => import('./components/WebGLPlayground'), {
  loading: () => <WebGLLoading />,
  ssr: false
});
```

### 3. キャッシュ戦略

- **静的ファイル**: 1年キャッシュ
- **コンテンツデータ**: 1時間キャッシュ
- **検索インデックス**: 12時間キャッシュ
- **統計データ**: リアルタイム更新

### 4. WebGL最適化

- デバイス性能に応じた品質調整
- フレームレート監視
- メモリ使用量制限
- GPU使用量最適化

## SEO and Metadata Management

### 1. 動的メタデータ生成

```typescript
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;

  const baseMetadata = {
    title: `${getCategoryTitle(category)} - samuido | ポートフォリオ`,
    description: getCategoryDescription(category),
    keywords: getCategoryKeywords(category),
    canonical: `https://yusuke-kim.com/portfolio/gallery/${category}`,
  };

  return {
    ...baseMetadata,
    openGraph: generateOpenGraph(baseMetadata),
    twitter: generateTwitterCard(baseMetadata),
  };
}
```

### 2. 構造化データ

各ページタイプに応じた構造化データを生成：

```typescript
const generateStructuredData = (pageType: string, data: any) => {
  switch (pageType) {
    case "gallery":
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: data.title,
        description: data.description,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: data.itemCount,
        },
      };
    case "detail":
      return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: data.title,
        description: data.description,
        creator: {
          "@type": "Person",
          name: "木村友亮",
        },
      };
  }
};
```

### 3. サイトマップ生成

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const portfolioItems = getPortfolioItems();

  const staticPages = [
    "/portfolio",
    "/portfolio/gallery/all",
    "/portfolio/gallery/develop",
    "/portfolio/gallery/video",
    "/portfolio/gallery/video&design",
    "/portfolio/playground/design",
    "/portfolio/playground/WebGL",
  ];

  const dynamicPages = portfolioItems.map((item) => `/portfolio/${item.id}`);

  return [...staticPages, ...dynamicPages].map((url) => ({
    url: `https://yusuke-kim.com${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: url === "/portfolio" ? 1 : 0.8,
  }));
}
```

## Security Considerations

### 1. コンテンツセキュリティ

- DOMPurify によるHTMLサニタイゼーション
- XSS攻撃対策
- CSP ヘッダー設定

### 2. API セキュリティ

- レート制限実装
- 入力値バリデーション
- エラー情報の適切な隠蔽

### 3. 外部コンテンツ

- YouTube/Vimeo埋め込みの安全な実装
- 外部リンクの rel="noopener noreferrer"
- iframe サンドボックス設定

## Deployment and Monitoring

### 1. デプロイメント戦略

- Vercel での自動デプロイ
- プレビューデプロイでの事前確認
- 段階的ロールアウト

### 2. モニタリング

- Google Analytics 連携
- エラー監視（Sentry等）
- パフォーマンス監視
- ユーザー行動分析

### 3. A/Bテスト

- ギャラリーレイアウトの最適化
- フィルター UI の改善
- プレイグラウンド体験の向上

## Cross-Page Integration Strategy

### 1. ホームページ連携

#### データ提供

```typescript
interface HomePageIntegration {
  getFeaturedProjects(): Promise<PortfolioContentItem[]>;
  getPortfolioStats(): Promise<PortfolioStats>;
  getLatestUpdates(): Promise<UpdateInfo[]>;
}

interface PortfolioStats {
  totalProjects: number;
  categoryCounts: Record<string, number>;
  technologyCounts: Record<string, number>;
  lastUpdate: Date;
}
```

#### 実装方法

- ホームページのポートフォリオセクションに最新3件を表示
- 統計情報をリアルタイム更新
- ポートフォリオページへの適切なリンク設置

### 2. 検索ページ連携

#### 検索インデックス生成

```typescript
interface SearchIntegration {
  generateSearchIndex(): Promise<SearchIndex[]>;
  getSearchFilters(): Promise<SearchFilter[]>;
  searchPortfolioItems(
    query: string,
    filters: SearchFilter[],
  ): Promise<SearchResult[]>;
}

interface SearchIndex {
  id: string;
  type: "portfolio";
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  searchableText: string;
  url: string;
  thumbnail: string;
}
```

#### 実装方法

- 全ポートフォリオアイテムを検索対象に含める
- カテゴリ・技術・タグによるフィルター提供
- 検索結果からポートフォリオ詳細への直接リンク

### 3. About/Commission ページ連携

#### スキル抽出

```typescript
interface AboutIntegration {
  extractSkillsFromProjects(): Promise<Skill[]>;
  getClientWorkExamples(): Promise<ClientProject[]>;
  getRelevantPortfolioItems(skillType: string): Promise<PortfolioContentItem[]>;
}

interface Skill {
  name: string;
  category: "development" | "design" | "video";
  level: number;
  projectCount: number;
  examples: string[]; // portfolio item IDs
}
```

#### 実装方法

- プロジェクトから使用技術を自動抽出
- クライアントワークの実例として表示
- スキル説明に関連ポートフォリオへのリンク

### 4. サイトマップ・SEO連携

#### URL生成

```typescript
interface SEOIntegration {
  generateSitemapEntries(): Promise<SitemapEntry[]>;
  updateMetaTags(pageType: string, data: any): Promise<MetaTags>;
  generateStructuredData(item: PortfolioContentItem): Promise<object>;
}

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}
```

#### 実装方法

- 全ポートフォリオページのURL自動生成
- 動的メタタグ生成
- 構造化データの適切な設定

### 5. アナリティクス連携

#### データ収集

```typescript
interface AnalyticsIntegration {
  trackPortfolioView(itemId: string): void;
  trackGalleryInteraction(galleryType: string, action: string): void;
  trackPlaygroundUsage(experimentId: string): void;
  generatePortfolioReport(): Promise<AnalyticsReport>;
}
```

#### 実装方法

- Google Analytics イベント送信
- ユーザー行動の詳細追跡
- パフォーマンス指標の監視

## Data Processing Architecture

### 1. データ正規化パイプライン

```typescript
class PortfolioDataProcessor {
  async processRawData(rawData: any[]): Promise<PortfolioContentItem[]> {
    const normalized = await this.normalizeData(rawData);
    const validated = await this.validateData(normalized);
    const enriched = await this.enrichData(validated);
    return enriched;
  }

  private async normalizeData(data: any[]): Promise<PortfolioContentItem[]> {
    return data.map((item) => ({
      ...item,
      thumbnail: item.thumbnail || item.images?.[0] || "/default-thumb.jpg",
      technologies: item.tags?.filter((tag) => this.isTechnology(tag)) || [],
      aspectRatio: this.calculateAspectRatio(item.images?.[0]),
      gridSize: this.determineGridSize(item.category, item.images),
    }));
  }

  private async validateData(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    return data.filter((item) => {
      const isValid = this.validateItem(item);
      if (!isValid) {
        console.warn(`Invalid portfolio item: ${item.id}`);
      }
      return isValid;
    });
  }

  private async enrichData(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    return Promise.all(
      data.map(async (item) => ({
        ...item,
        seo: await this.generateSEOData(item),
        searchIndex: this.generateSearchIndex(item),
        relatedItems: await this.findRelatedItems(item, data),
      })),
    );
  }
}
```

### 2. キャッシュ管理システム

```typescript
class PortfolioCache {
  private cache = new Map<string, any>();
  private lastUpdate = new Map<string, Date>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600000,
  ): Promise<T> {
    const cached = this.cache.get(key);
    const lastUpdate = this.lastUpdate.get(key);

    if (cached && lastUpdate && Date.now() - lastUpdate.getTime() < ttl) {
      return cached;
    }

    const fresh = await fetcher();
    this.cache.set(key, fresh);
    this.lastUpdate.set(key, new Date());
    return fresh;
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.lastUpdate.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.lastUpdate.clear();
    }
  }
}
```

### 3. エラーハンドリング・復旧

```typescript
class PortfolioErrorHandler {
  async handleDataError(error: Error, context: string): Promise<any> {
    console.error(`Portfolio data error in ${context}:`, error);

    // エラー報告
    this.reportError(error, context);

    // フォールバック戦略
    switch (context) {
      case "gallery":
        return this.getFallbackGalleryData();
      case "detail":
        return this.getFallbackDetailData();
      case "search":
        return this.getFallbackSearchData();
      default:
        return null;
    }
  }

  private async getFallbackGalleryData(): Promise<PortfolioContentItem[]> {
    // キャッシュからの復旧を試行
    const cached = await this.tryRecoverFromCache();
    if (cached) return cached;

    // 最小限のダミーデータを返す
    return this.getMinimalPortfolioData();
  }
}
```
