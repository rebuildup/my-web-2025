# 映像作品ギャラリーページ (/portfolio/gallery/video)

## 目的

foriioライクな表示で映像作品をサムネイル画像とタイトルをカードとして表示し、詳細パネルで動画とスクリーンショットを表示する。

## 主な要素

- foriioライクなサムネイルカード
- 詳細パネル表示
- フィルター機能
- ソート機能

## 機能

### foriioライクなサムネイルカード

- **レイアウト**: foriioのような美しいカードレイアウト
- **サムネイル画像**: 作品の代表画像を表示
- **タイトル**: 作品のタイトル
- **カテゴリー**: MV、リリックモーション、アニメーションなど
- **グリッド配置**: 美しいグリッドレイアウト

### 詳細パネル表示

- **埋め込み動画**: YouTube、Vimeoなどの動画埋め込み
- **スクリーンショット**: 複数のスクリーンショットを小さく並べて表示
- **タイトル**: 作品のタイトル
- **簡単な説明**: 作品の概要説明
- **作品リンク**: 外部サイトへのリンク
- **詳細ページリンク**: 詳細ページへのリンク
- **モーダル表示**: オーバーレイでの詳細表示

### フィルター機能

- **カテゴリーフィルター**: MV、リリックモーション、アニメーション、プロモーション
- **年別フィルター**: 制作年による絞り込み
- **タグフィルター**: タグによる絞り込み
- **クライアントフィルター**: クライアントによる絞り込み

### ソート機能

- **新着順**: 最新の作品から表示
- **人気順**: 人気度による並び替え
- **アルファベット順**: タイトルによる並び替え

## データ

- `ContentItem` type: `portfolio`
- `customFields`: `thumbnail`, `category`, `tags`, `year`, `description`, `video-embed`, `screenshots`, `external-link`, `detail-link`

## Meta情報

### SEO

- **title**: "Video Works - samuido | 映像作品ギャラリー"
- **description**: "samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。"
- **keywords**: "映像作品, MV, リリックモーション, アニメーション, プロモーション映像, foriio"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/gallery/video"

### Open Graph

- **og:title**: "Video Works - samuido | 映像作品ギャラリー"
- **og:description**: "samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/gallery/video"
- **og:image**: "https://yusuke-kim.com/portfolio/gallery-video-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Video Works - samuido | 映像作品ギャラリー"
- **twitter:description**: "samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/gallery-video-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "samuido Video Works Gallery",
  "description": "映像作品ギャラリー",
  "url": "https://yusuke-kim.com/portfolio/gallery/video",
  "mainEntity": {
    "@type": "ItemList",
    "name": "映像作品一覧",
    "description": "MV、リリックモーション、アニメーション、プロモーション映像などの作品"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### レスポンシブ対応

- **foriioライクレイアウト**: 美しいグリッドレイアウト
- **タッチ対応**: モバイルでのタップ操作
- **画像最適化**: WebP形式での画像配信

### パフォーマンス

- **遅延読み込み**: スクロールに応じた画像読み込み
- **動画最適化**: 埋め込み動画の最適化
- **キャッシュ**: 画像と動画の適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **フォーカス管理**: 詳細パネルのフォーカス管理
