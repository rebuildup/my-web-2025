# 作品詳細ページ (/portfolio/[slug])

## 目的

個々の作品の詳細情報、メディア、外部リンクを提供する。

## 主な要素

- ヒーロー画像 / 動画
- 作品説明 (Markdown)
- 使用技術 / ソフトウェア一覧
- 外部リンク (Demo, GitHub, Booth など)
- 関連作品リンク

## データ

- `ContentItem` type: `portfolio` (slug で検索)

## Meta情報 (動的生成)

### SEO

- **title**: `{作品タイトル} - samuido | ポートフォリオ`
- **description**: `{作品の説明文} - 使用技術: {技術名}, カテゴリ: {カテゴリ名}`
- **keywords**: `{作品タイトル}, {技術名}, {カテゴリ名}, ポートフォリオ, Webデザイン, 開発`
- **robots**: "index, follow"
- **canonical**: `https://yusuke-kim.com/portfolio/{slug}`

### Open Graph

- **og:title**: `{作品タイトル} - samuido | ポートフォリオ`
- **og:description**: `{作品の説明文} - 使用技術: {技術名}, カテゴリ: {カテゴリ名}`
- **og:type**: "article"
- **og:url**: `https://yusuke-kim.com/portfolio/{slug}`
- **og:image**: `{作品のサムネイル画像URL}`
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"
- **article:published_time**: `{publishedAt}`
- **article:modified_time**: `{updatedAt}`

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: `{作品タイトル} - samuido | ポートフォリオ`
- **twitter:description**: `{作品の説明文} - 使用技術: {技術名}, カテゴリ: {カテゴリ名}`
- **twitter:image**: `{作品のサムネイル画像URL}`
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "{作品タイトル}",
  "description": "{作品の説明文}",
  "url": "https://yusuke-kim.com/portfolio/{slug}",
  "image": "{作品のサムネイル画像URL}",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "url": "https://yusuke-kim.com/about"
  },
  "datePublished": "{publishedAt}",
  "dateModified": "{updatedAt}",
  "genre": "{カテゴリ名}",
  "keywords": "{タグ配列}",
  "softwareVersion": "{使用技術配列}"
}
```

---

> 詳細仕様は追って記述します。
