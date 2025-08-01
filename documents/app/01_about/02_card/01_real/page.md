# 本名デジタル名刺ページ (/about/card/real)

## 目的

本名のデジタル名刺として、実物の名刺と同じサイズで表示し、QRコードやダウンロード機能を提供する。

## 主な要素

- デジタル名刺表示 (実物サイズ)
- QRコード (拡大表示機能)
- ダウンロードボタン (PDF/PNG)
- 連絡先情報

## 機能

### デジタル名刺表示

- **サイズ**: 一般的な名刺の比率で、パソコンやスマホで実物と同じ大きさに表示
- **レイアウト**: 名刺らしいデザインとレイアウト
- **情報表示**:
  - 名前: 木村友亮
  - 職種: Webデザイナー・開発者
  - 連絡先情報
  - スキル概要

### QRコード機能

- **配置**: 名刺ページの一角に配置
- **拡大表示**: クリックで拡大表示
- **リンク機能**: QRコードからそのページのリンクに飛べる
- **内容**: 名刺ページのURL

### ダウンロード機能

- **PDF形式**: 印刷用のPDFファイル
- **PNG形式**: 画像としてのPNGファイル
- **ファイル名**: 適切なファイル名でダウンロード

### 連絡先情報

- **メール**: 361do.sleep(at)gmail.com
- **X**: @361do_sleep (開発関連)
- **X**: @361do_design (映像・デザイン関連)
- **サイト**: yusuke-kim.com

## データ

- `ContentItem` type: `business-card`
- `customFields`: `contact`, `skills`, `qr-code`

## Meta情報

### SEO

- **title**: "Digital Business Card - samuido | 木村友亮のデジタル名刺"
- **description**: "Webデザイナー・開発者木村友亮のデジタル名刺。QRコード付きでダウンロード可能。"
- **keywords**: "デジタル名刺, 木村友亮, ビジネスカード, QRコード, 連絡先"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/card/real"

### Open Graph

- **og:title**: "Digital Business Card - samuido | 木村友亮のデジタル名刺"
- **og:description**: "Webデザイナー・開発者木村友亮のデジタル名刺。QRコード付きでダウンロード可能。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/about/card/real"
- **og:image**: "https://yusuke-kim.com/about/card-real-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Digital Business Card - samuido | 木村友亮のデジタル名刺"
- **twitter:description**: "Webデザイナー・開発者木村友亮のデジタル名刺。QRコード付きでダウンロード可能。"
- **twitter:image**: "https://yusuke-kim.com/about/card-real-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "木村友亮",
  "alternateName": "samuido",
  "jobTitle": "Webデザイナー・開発者",
  "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
  "url": "https://yusuke-kim.com/about/card/real",
  "email": "361do.sleep(at)gmail.com",
  "sameAs": [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design"
  ],
  "knowsAbout": [
    "Web Design",
    "Frontend Development",
    "Video Production",
    "Graphic Design"
  ]
}
```

## 技術要件

### レスポンシブ対応

- **実物サイズ**: デバイスに関係なく実物の名刺と同じサイズで表示
- **印刷対応**: PDFダウンロードで印刷可能
- **画像最適化**: PNGダウンロードで高品質

### QRコード機能

- **生成**: 動的QRコード生成
- **拡大表示**: モーダルまたはポップアップでの拡大表示
- **リンク機能**: 名刺ページへの直接リンク
