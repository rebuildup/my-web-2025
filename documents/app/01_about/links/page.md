# リンクマップページ (/about/links)

## 目的

著者が管理する外部サービス・SNSへのリンクをカテゴリ別に一覧表示し、各種サービスへの導線を提供する。

## 主な要素

- カテゴリフィルター (SNS, 開発, クリエイティブ等)
- 検索ボックス & ソート機能
- 各リンクカードにアイコン・説明文を表示
- 統計情報 (フォロワー数、投稿数など)

## 機能

### カテゴリフィルター

- **SNS**: Twitter, Instagram, YouTube, TikTok
- **開発**: GitHub, Qiita, Zenn, 技術ブログ
- **クリエイティブ**: Behance, Dribbble, ArtStation
- **その他**: ポートフォリオサイト、ブログなど

### 検索・ソート機能

- **検索ボックス**: リンク名、説明文からの検索
- **ソート機能**:
  - 人気順 (フォロワー数)
  - 更新順 (最新投稿)
  - アルファベット順

### リンクカード表示

- **アイコン**: 各サービスのアイコン表示
- **説明文**: サービスでの活動内容
- **統計情報**: フォロワー数、投稿数など
- **更新日**: 最新投稿日時

## リンク一覧

### SNS

- **X (Twitter)**: @361do_sleep (開発関連)
- **X (Twitter)**: @361do_design (映像・デザイン関連)
- **YouTube**: 映像制作、チュートリアル
- **Instagram**: デザイン作品、制作過程

### 開発

- **GitHub**: オープンソースプロジェクト
- **Qiita**: 技術記事
- **Zenn**: 技術ブログ
- **個人ブログ**: 技術共有

### クリエイティブ

- **Behance**: デザイン作品
- **Dribbble**: UI/UXデザイン
- **ArtStation**: アート作品

## データ

- `ContentItem` type: `link-map`
- `customFields`: `category`, `url`, `description`, `icon`, `stats`

## Meta情報

### SEO

- **title**: "Links - samuido | リンクマップ"
- **description**: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。"
- **keywords**: "リンクマップ, SNS, 開発, クリエイティブ, 外部リンク, ソーシャルメディア"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/links"

### Open Graph

- **og:title**: "Links - samuido | リンクマップ"
- **og:description**: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/about/links"
- **og:image**: "https://yusuke-kim.com/about/links-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Links - samuido | リンクマップ"
- **twitter:description**: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。"
- **twitter:image**: "https://yusuke-kim.com/about/links-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "samuido Links",
  "description": "木村友亮の外部リンク集",
  "url": "https://yusuke-kim.com/about/links",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "外部リンク一覧",
    "description": "SNS、開発、クリエイティブ関連の外部リンク"
  }
}
```

## 技術要件

### レスポンシブ対応

- **グリッドレイアウト**: デバイスに応じたカード配置
- **タッチ対応**: モバイルでのタップ操作

### 外部API連携

- **統計情報**: 各SNSのAPIから統計情報を取得
- **更新情報**: 最新投稿の取得と表示
