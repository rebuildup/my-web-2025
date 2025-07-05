# ワークショップブログページ (/workshop/blog)

## 目的

技術的な知見や制作過程を共有するブログ記事を提供し、知識の共有とコミュニティ形成を促進する。

## 主な要素

- ブログ記事一覧
- カテゴリーフィルター
- 検索機能
- 記事詳細表示

## 機能

### ブログ記事一覧

- **記事カード**: タイトル、概要、投稿日、カテゴリー
- **サムネイル画像**: 記事の代表画像
- **タグ表示**: 記事に関連するタグ
- **レスポンシブ**: デバイスに応じたレイアウト

### カテゴリーフィルター

- **技術カテゴリー**: Web開発、映像制作、デザイン、ツール
- **難易度**: 初心者、中級者、上級者
- **年別フィルター**: 投稿年による絞り込み
- **タグフィルター**: タグによる絞り込み

### 検索機能

- **全文検索**: タイトル、本文、タグでの検索
- **リアルタイム検索**: 入力に応じたリアルタイム検索
- **検索履歴**: 検索履歴の保存
- **検索候補**: 検索候補の表示

### 記事詳細表示

- **Markdown表示**: Markdown形式での記事表示
- **コードハイライト**: シンタックスハイライト
- **画像表示**: 記事内の画像表示
- **関連記事**: 関連記事の表示

### ソート機能

- **新着順**: 最新の記事から表示
- **人気順**: 人気度による並び替え
- **カテゴリー順**: カテゴリーによる並び替え

## データ

- `ContentItem` type: `blog`
- `customFields`: `title`, `content`, `excerpt`, `category`, `tags`, `published-date`, `thumbnail`, `author`

## Meta情報

### SEO

- **title**: "Blog - samuido | ワークショップブログ"
- **description**: "samuidoのワークショップブログ。Web開発、映像制作、デザインに関する技術的な知見や制作過程を共有します。"
- **keywords**: "ブログ, 技術記事, Web開発, 映像制作, デザイン, ワークショップ"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/workshop/blog"

### Open Graph

- **og:title**: "Blog - samuido | ワークショップブログ"
- **og:description**: "samuidoのワークショップブログ。Web開発、映像制作、デザインに関する技術的な知見や制作過程を共有します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/workshop/blog"
- **og:image**: "https://yusuke-kim.com/workshop/blog-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Blog - samuido | ワークショップブログ"
- **twitter:description**: "samuidoのワークショップブログ。Web開発、映像制作、デザインに関する技術的な知見や制作過程を共有します。"
- **twitter:image**: "https://yusuke-kim.com/workshop/blog-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "samuido Workshop Blog",
  "description": "ワークショップブログ",
  "url": "https://yusuke-kim.com/workshop/blog",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "publisher": {
    "@type": "Organization",
    "name": "samuido",
    "url": "https://yusuke-kim.com/"
  }
}
```

## 技術要件

### レスポンシブ対応

- **記事カード**: デバイスに応じたカードレイアウト
- **検索機能**: モバイルでの検索操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **画像最適化**: WebP形式での画像配信
- **遅延読み込み**: スクロールに応じた画像読み込み
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **検索アクセシビリティ**: 検索機能のアクセシビリティ
