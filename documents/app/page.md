# サイトルートページ (/)

## 目的

サイト全体のシンプルなインデックスとしてカテゴリへのリンクを提供し、すべてのページへの導線を繋ぐ。

## 主な要素

- ヒーローヘッダー (サイト概要)
- カテゴリカード (About / Portfolio / Workshop / Tools)
- ルート機能カード (Privacy Policy / Search / Contact)
- 最新コンテンツのハイライト

## 機能

### カテゴリカード

- **About**: プロフィール、デジタル名刺、依頼ページへの導線
- **Portfolio**: 4つのギャラリー（all / develop / video / video&design）への導線
- **Workshop**: プラグイン配布、ブログ、素材ダウンロードへの導線
- **Tools**: 実用的なWebツール集への導線

### ルート機能

- **Privacy Policy**: プライバシーポリシー
- **Search**: サイト内検索機能
- **Contact**: お問い合わせフォーム

### 検索機能

- **簡易モード**: タイトルやタグからの検索
- **詳細モード**: markdownファイルの内容も含めた検索
- **検索結果**: 検出されたコンテンツデータの一覧表示

## データ

- `ContentItem` type: `site` の概要が中心
- 各カテゴリの最新コンテンツ情報
- サイト統計情報

## Meta情報

### SEO

- **title**: "samuidoのサイトルート"
- **description**: "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました"
- **keywords**: "ポートフォリオ, Webデザイン, フロントエンド開発, ツール, プラグイン, ブログ"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/"

### Open Graph

- **og:title**: "samuidoのサイトルート"
- **og:description**: "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/"
- **og:image**: "https://yusuke-kim.com/og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "samuidoのサイトルート"
- **twitter:description**: "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました"
- **twitter:image**: "https://yusuke-kim.com/twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "samuido",
  "description": "フロントエンドエンジニアsamuidoの個人サイト",
  "url": "https://yusuke-kim.com/",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "jobTitle": "Webデザイナー・開発者",
    "url": "https://yusuke-kim.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "samuido",
    "url": "https://yusuke-kim.com/"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yusuke-kim.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## 技術要件

### パフォーマンス

- **読み込み時間**: 1秒以内を目標
- **画像最適化**: WebP形式使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **基本対応**: 全ページで基本的なアクセシビリティ対応
- **Toolsページ**: 特に重視（多くの人が使う可能性）

### SEO

- **構造化データ**: 各ページに独立したキーワードやmeta情報
- **サイトマップ**: フォルダ構造と一致
- **更新頻度**: 2日~1週間ごと（GitHubActions使用）

### 分析・測定

- **GoogleAnalytics**: 詳細なアクセス解析とユーザー行動測定
- **プライバシー保護**: 個人を特定しない範囲での分析
