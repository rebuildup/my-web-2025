# 全作品ギャラリーページ (/portfolio/gallery/all)

## 目的

すべての作品をサムネイル画像のカード一覧で表示し、クリックで詳細パネルを表示する。

## 主な要素

- サムネイル画像カード一覧
- 詳細パネル表示
- フィルター機能
- ソート機能

## 機能

### サムネイル画像カード一覧

- **カードサイズ**: 一定の大きさで統一されたカード表示
- **サムネイル画像**: 作品の代表画像を表示
- **タイトル**: 作品のタイトル
- **カテゴリー**: 開発、映像、デザインなどのカテゴリー表示
- **グリッドレイアウト**: レスポンシブなグリッド配置

### 詳細パネル表示

- **メインコンテンツ**:
  - 動画の埋め込み（YouTube、Vimeo）
  - 画像ギャラリー
  - スクリーンショット一覧
- **タイトル**: 作品のタイトル
- **簡単な説明**: 作品の概要説明
- **詳細ページリンク**: 別タブで詳細ページを開く
- **モーダル表示**: オーバーレイでの詳細表示

### フィルター機能

- **カテゴリーフィルター**: 開発、映像、デザイン、その他
- **技術フィルター**: 使用技術による絞り込み
- **年別フィルター**: 制作年による絞り込み
- **タグフィルター**: タグによる絞り込み

### ソート機能

- **新着順**: 最新の作品から表示
- **人気順**: 人気度による並び替え
- **アルファベット順**: タイトルによる並び替え

## データ

- `ContentItem` type: `portfolio`
- `customFields`: `thumbnail`, `category`, `tags`, `year`, `description`, `main-content`, `detail-link`

## Meta情報

### SEO

- **title**: "All Works - samuido | 全作品ギャラリー"
- **description**: "samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。"
- **keywords**: "ポートフォリオ, 作品ギャラリー, Web開発, 映像制作, デザイン, サムネイル"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/gallery/all"

### Open Graph

- **og:title**: "All Works - samuido | 全作品ギャラリー"
- **og:description**: "samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/gallery/all"
- **og:image**: "https://yusuke-kim.com/portfolio/gallery-all-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "All Works - samuido | 全作品ギャラリー"
- **twitter:description**: "samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/gallery-all-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "samuido All Works Gallery",
  "description": "全作品ギャラリー",
  "url": "https://yusuke-kim.com/portfolio/gallery/all",
  "mainEntity": {
    "@type": "ItemList",
    "name": "作品一覧",
    "description": "Web開発、映像制作、デザイン作品の一覧"
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

- **グリッドレイアウト**: デバイスに応じたカード配置
- **タッチ対応**: モバイルでのタップ操作
- **画像最適化**: WebP形式での画像配信

### パフォーマンス

- **遅延読み込み**: スクロールに応じた画像読み込み
- **キャッシュ**: 画像の適切なキャッシュ設定
- **圧縮**: 画像の最適化

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **フォーカス管理**: 詳細パネルのフォーカス管理
