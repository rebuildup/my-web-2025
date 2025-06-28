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

> **メンテナンス指針**: 新しいコンテンツタイプやフィールドを追加する際は `ContentItem.customFields` を優先し、型が安定したら正式フィールド化してください。

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
