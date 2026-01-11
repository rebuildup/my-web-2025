# Workshopトップページ (/workshop)

## 目的

プラグイン配布、素材ダウンロード、ブログ機能への導線を提供し、クリエイティブなコンテンツのハブページ.

## 主な要素

- ヒーローヘッダー (Workshop概要)
- カテゴリ選択カード (ブログ / プラグイン / ダウンロード)
- 最新コンテンツのハイライト
- 統計情報 (記事数、プラグイン数、ダウンロード数など)

## 機能仕様

### ブログ機能 (blog)

- **目的**: 技術記事、チュートリアル、解説記事の配信
- **コンテンツ**: markdownファイルをHTMLに変換してプレビュー
- **埋め込みコンテンツ**:
  - YouTube、Vimeo（動画）
  - Code（コードブロック）
  - X（ソーシャルメディア）
  - その他iframe対応コンテンツ
- **カテゴリ管理**: タグによる分類
  - 技術記事
  - チュートリアル
  - 解説記事
  - 制作過程
- **機能**:
  - 記事一覧表示
  - 詳細ページ
  - タグフィルター
  - 検索機能
- **コメント**: 機能なし
- **更新頻度**: 不定期

### プラグイン配布 (plugins)

- **目的**: AfterEffects、Premiere Proなどのプラグイン配布
- **機能**:
  - プラグイン一覧表示
  - 詳細ページ（blogと同じ場所に配置）
  - ダウンロード統計表示
  - バージョン管理
- **対応ソフト**: 各プラグインで異なるため、詳細ページで明記
- **ダウンロード**: 統計機能付き
- **バージョン管理**:
  - バージョン履歴表示
  - 更新日時
  - 変更内容

### 素材ダウンロード (downloads)

- **目的**: テンプレート、素材集などの配布
- **機能**:
  - 素材一覧表示
  - 詳細ページ（blogと同じ場所に配置）
  - ダウンロード統計表示
  - ライセンス情報表示
- **ファイル形式**: 複数ファイルはzipにまとめて配布
- **ライセンス**: 詳細ページに記載
- **カテゴリ**:
  - テンプレート
  - 素材集
  - サンプルファイル
  - その他

## 統合仕様

### 共通機能

- **詳細ページ**: blog、plugins、downloadsの詳細ページは同じ場所に配置
- **markdownプレビュー**: 全コンテンツでmarkdownファイルをHTMLに変換
- **埋め込みコンテンツ**: YouTube、Vimeo、Code、Xなど
- **タグ管理**: カテゴリ、技術、ソフトウェアなど
- **検索機能**: タイトル、タグ、内容からの検索

### データ管理

- **ContentItem**: type: `blog`, `plugin`, `download`
- **統計データ**: ダウンロード数、閲覧数
- **バージョン管理**: プラグインのバージョン履歴

## アクセス解析

- **ダウンロード統計**: 各プラグイン・素材のダウンロード数
- **閲覧統計**: 記事・プラグインの閲覧数
- **人気ランキング**: ダウンロード数・閲覧数によるランキング

## データ

- `ContentItem` type: `blog`, `plugin`, `download`
- タグ管理: カテゴリ、技術、ソフトウェアなど
- 統計データ: ダウンロード数、閲覧数

## Meta情報

### SEO

- **title**: "Workshop - samuido | プラグイン・ブログ・素材配布"
- **description**: "AfterEffectsプラグイン、技術記事、素材の配布サイト.フロントエンドエンジニアsamuidoのクリエイティブハブ."
- **keywords**: "AfterEffects, プラグイン, 技術記事, 素材配布, チュートリアル, ブログ"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/workshop"

### Open Graph

- **og:title**: "Workshop - samuido | プラグイン・ブログ・素材配布"
- **og:description**: "AfterEffectsプラグイン、技術記事、素材の配布サイト.フロントエンドエンジニアsamuidoのクリエイティブハブ."
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/workshop"
- **og:image**: "https://yusuke-kim.com/workshop-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Workshop - samuido | プラグイン・ブログ・素材配布"
- **twitter:description**: "AfterEffectsプラグイン、技術記事、素材の配布サイト.フロントエンドエンジニアsamuidoのクリエイティブハブ."
- **twitter:image**: "https://yusuke-kim.com/workshop-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "samuido Workshop",
  "description": "AfterEffectsプラグイン、技術記事、素材の配布サイト",
  "url": "https://yusuke-kim.com/workshop",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "プラグイン・記事・素材一覧",
    "description": "AfterEffectsプラグイン、技術記事、素材のコレクション"
  }
}
```
