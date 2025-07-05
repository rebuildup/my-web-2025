# ブログページ (/workshop/blog)

## 目的

markdownファイルをhtml形式に変換してプレビューし、埋め込みコンテンツなども表示できるブログ機能。

## 主な要素

- 記事一覧表示
- Markdownプレビュー
- 埋め込みコンテンツ表示
- 検索機能

## 機能

### 記事一覧表示

- **記事カード**: 記事のサムネイルとタイトル表示
- **日付表示**: 投稿日時の表示
- **概要表示**: 記事の概要表示
- **タグ表示**: 記事のタグ表示

### Markdownプレビュー

- **リアルタイム変換**: MarkdownからHTMLへのリアルタイム変換
- **シンタックスハイライト**: コードブロックのシンタックスハイライト
- **テーブル表示**: Markdownテーブルの適切な表示
- **リスト表示**: 番号付き・番号なしリストの表示

### 埋め込みコンテンツ表示

- **動画埋め込み**: YouTube、Vimeoなどの動画埋め込み
- **画像埋め込み**: 画像の埋め込み表示
- **コード埋め込み**: コードの埋め込み表示
- **外部リンク**: 外部サイトへのリンク表示

### 検索機能

- **全文検索**: 記事内容からの検索
- **タイトル検索**: 記事タイトルからの検索
- **タグ検索**: タグからの検索
- **フィルター機能**: 日付・カテゴリでの絞り込み

## 記事内容

### 技術記事

- **開発手法**: 開発手法やベストプラクティス
- **技術解説**: 各種技術の詳細解説
- **チュートリアル**: ステップバイステップの解説
- **トラブルシューティング**: 問題解決の手順

### 制作記事

- **制作過程**: 作品制作の過程
- **技術紹介**: 使用技術の紹介
- **デザイン解説**: デザインの考え方
- **制作Tips**: 制作のコツやヒント

### その他記事

- **日記**: 日常の出来事や感想
- **イベント**: 参加したイベントの報告
- **書籍紹介**: 読んだ本の紹介
- **ツール紹介**: 便利なツールの紹介

## 埋め込みコンテンツ

### 動画コンテンツ

- **YouTube**: YouTube動画の埋め込み
- **Vimeo**: Vimeo動画の埋め込み
- **自前動画**: 自前の動画ファイル埋め込み
- **GIF**: アニメーションGIFの埋め込み

### 画像コンテンツ

- **画像表示**: 高品質な画像表示
- **ギャラリー**: 複数画像のギャラリー表示
- **比較表示**: 前後の比較画像表示
- **スクリーンショット**: スクリーンショットの表示

### コードコンテンツ

- **コードブロック**: シンタックスハイライト付きコード
- **実行可能コード**: ブラウザで実行可能なコード
- **デモ埋め込み**: 実際のデモの埋め込み
- **GitHub埋め込み**: GitHubリポジトリの埋め込み

## データ

- `ContentItem` type: `blog`
- `customFields`: `markdown-content`, `embedded-content`, `tags`, `publish-date`

## Meta情報

### SEO

- **title**: "Blog - samuido | 技術ブログ"
- **description**: "技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。"
- **keywords**: "技術ブログ, 開発記事, 制作過程, チュートリアル, Markdown"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/workshop/blog"

### Open Graph

- **og:title**: "Blog - samuido | 技術ブログ"
- **og:description**: "技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/workshop/blog"
- **og:image**: "https://yusuke-kim.com/workshop/blog-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Blog - samuido | 技術ブログ"
- **twitter:description**: "技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。"
- **twitter:image**: "https://yusuke-kim.com/workshop/blog-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "samuido Blog",
  "description": "技術記事、制作過程、チュートリアルなどを掲載",
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

### UI/UX

- **レスポンシブ対応**: 各デバイスでの読みやすさ
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **読みやすさ**: 適切なフォントサイズと行間

### 機能要件

- **Markdown変換**: 正確なMarkdownからHTML変換
- **埋め込み対応**: 各種コンテンツの埋め込み
- **検索機能**: 高速な検索機能

### コンテンツ管理

- **記事管理**: 記事の作成・編集・削除
- **タグ管理**: タグの管理
- **カテゴリ管理**: カテゴリの管理
