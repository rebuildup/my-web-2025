# 検索ページ (/search)

## 目的

サイト内のコンテンツを検索し、ユーザーが求める情報を素早く見つけられるようにする。

## 主な要素

- 検索フォーム
- 検索結果表示
- フィルター機能
- 検索履歴 (なし)

## 機能

### 検索フォーム

- **シンプル検索**: キーワード入力による基本検索
- **詳細検索**: カテゴリー、タグ、日付による絞り込み検索
- **リアルタイム検索**: 入力に応じた即座の検索結果表示
- **検索候補**: 入力中のキーワード候補表示

### 検索結果表示

- **結果一覧**: 検索結果の一覧表示
- **スニペット**: 検索結果の内容プレビュー
- **関連度順**: 関連度の高い順に結果を表示
- **ページネーション**: 大量の結果に対するページ分割

### フィルター機能

- **カテゴリーフィルター**: About、Portfolio、Workshop、Tools
- **タグフィルター**: 技術、デザイン、映像、開発など
- **日付フィルター**: 作成日による絞り込み
- **タイプフィルター**: ページ、記事、ツール、作品など

### 検索履歴

- **履歴なし**: プライバシーを重視し、検索履歴は保存しない
- **セッション内**: 現在のセッション内でのみ検索結果を保持

## 検索対象

### コンテンツタイプ

- **プロフィールページ**: 本名、ハンドルネーム、AIチャット
- **ポートフォリオ**: 作品詳細、ギャラリー
- **ワークショップ**: ブログ記事、プラグイン、ダウンロード
- **ツール**: 各種Webツール
- **グローバルページ**: プライバシーポリシー、お問い合わせ

### 検索インデックス

- **タイトル**: ページタイトル、記事タイトル
- **内容**: 本文、説明文、メタデータ
- **タグ**: カテゴリー、技術、ツール名
- **メタデータ**: 作成日、更新日、作者

## データ

- `SearchIndex` type: `content`
- `customFields`: `title`, `content`, `tags`, `category`, `date`

## Meta情報

### SEO

- **title**: "Search - samuido | サイト内検索"
- **description**: "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。"
- **keywords**: "検索, サイト内検索, ポートフォリオ, プロフィール, ツール"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/search"

### Open Graph

- **og:title**: "Search - samuido | サイト内検索"
- **og:description**: "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/search"
- **og:image**: "https://yusuke-kim.com/search-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Search - samuido | サイト内検索"
- **twitter:description**: "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。"
- **twitter:image**: "https://yusuke-kim.com/search-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "samuido",
  "description": "フロントエンドエンジニアsamuidoの個人サイト",
  "url": "https://yusuke-kim.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yusuke-kim.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### 検索機能

- **全文検索**: タイトル、内容、タグからの検索
- **ファジー検索**: タイプミスや類似語に対応
- **高速検索**: 即座の検索結果表示
- **関連度計算**: 検索キーワードとの関連度による並び替え

### レスポンシブ対応

- **デバイス対応**: PC、タブレット、スマートフォン
- **入力最適化**: 各デバイスでの検索しやすさを重視

### プライバシー

- **履歴なし**: 検索履歴を保存しない
- **セッション管理**: 現在のセッション内でのみ結果保持
