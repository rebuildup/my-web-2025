# ページ名

## 目的

ページの目的

## 概要

ページの内容

## 主なリンク

ルートの場合直下につながるリンク

## 機能

ページ機能の一覧

## Meta情報

### SEO

- **title**: "サイトタイトル"
- **description**: "サイトの説明"
- **keywords**: "サイトのキーワード"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/リンク"

### Open Graph

- **og:title**: "サイトタイトル"
- **og:description**: "サイトの説明"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/リンク"
- **og:image**: "https://yusuke-kim.com/og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "サイトタイトル"
- **twitter:description**: "サイトの説明"
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

詳細
