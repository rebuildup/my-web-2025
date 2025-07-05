# 共通データ構造まとめ (Global)

サイト全体で使用する JSON / TypeScript 型定義の要点を集約しています。フル定義は `src/types/` を参照してください。

## 1. ContentItem — すべてのコンテンツの基盤

```
interface ContentItem {
  id: string;
  type: ContentType;            // portfolio | plugin | blog | profile | page | tool | asset
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  priority: number;             // 0-100
  createdAt: string;            // ISO 8601
  updatedAt?: string;
  publishedAt?: string;

  thumbnail?: string;
  images?: string[];
  videos?: MediaEmbed[];
  externalLinks?: ExternalLink[];
  downloadInfo?: DownloadInfo;
  content?: string;             // Markdown or HTML
  contentPath?: string;         // Markdown path
  stats?: ContentStats;
  seo?: SEOData;
  customFields?: Record<string, any>;
}
```

### 補助型 (抜粋)

- `MediaEmbed` : YouTube / Vimeo など埋め込み
- `ExternalLink` : GitHub / Booth / Demo 等
- `DownloadInfo` : ファイル名・サイズ・価格 など

## 2. SiteConfig — サイト設定

```
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
```

キーポイント:

- `theme.colors`, `theme.fonts` にブランドカラー / フォントを集中管理
- `features` で検索・コメント・RSS 等のトグル

## 3. FormConfig — フォーム宣言

- JSON でフォーム UI・バリデーション・送信先を一元管理
- `fields[]` に多様な `FormFieldType` (text / email / calculator …)

## 4. NavigationItem — 階層ナビ

- 再帰的 `children` によりツリーメニューを実現
- 役割: メイン/フッター/サイドバー共通で利用

## 5. PageConfig — ページ設定

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

```
src/app/api/
├── content/
│   ├── [type]/route.ts     # GET /api/content/[type] - コンテンツ取得
│   └── search/route.ts     # POST /api/content/search - 検索機能
├── stats/
│   ├── download/route.ts   # POST /api/stats/download - ダウンロード統計更新
│   └── view/route.ts       # POST /api/stats/view - 閲覧統計更新
├── contact/route.ts        # POST /api/contact - お問い合わせ送信
└── admin/
    ├── content/route.ts    # POST /api/admin/content - コンテンツ管理
    └── upload/route.ts     # POST /api/admin/upload - ファイルアップロード
```

### 検索機能実装

```ts
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

export const searchContent = async (
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean; // markdownファイルの内容も検索対象に含める
  } = {}
): Promise<SearchResult[]> => {
  // 検索インデックスから検索実行
  // 簡易モード: title, description, tags のみ
  // 詳細モード: markdownファイルの内容も含める
};
```

### 統計データ管理

```ts
// lib/stats/index.ts
export interface StatData {
  downloads: Record<string, number>;
  views: Record<string, number>;
  searches: Record<string, number>;
  lastUpdated: string;
}

export const updateStats = async (type: "download" | "view", id: string) => {
  // 統計データの更新
  // ローカルファイルへの書き込み
};
```

---

> **メンテナンス指針**: 新しいコンテンツタイプやフィールドを追加する際は `ContentItem.customFields` を優先し、型が安定したら正式フィールド化してください。データ管理は静的JSON形式で行い、Admin機能でのみ更新を行います。

## 6. パフォーマンス最適化ユーティリティ (実装例)

```ts
// lib/utils/performance.ts
import { lazy } from "react";

// 動的インポート (Chunk Split)
export const LazyComponents = {
  ColorPalette: lazy(() => import("@/components/tools/ColorPalette")),
  ThreeJSPlayground: lazy(
    () => import("@/components/playground/ThreeJSPlayground")
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
