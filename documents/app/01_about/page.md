# About トップページ (/about)

## 目的

著者の概要を紹介し、各サブページへの入口となるハブページ。本名とハンドルネームの2つのプロフィールへの導線を提供する。

## 主な要素

- ヒーローヘッダー (名前、キャッチコピー)
- プロフィール選択カード (本名プロフィール / ハンドルネームプロフィール)
- ナビゲーションカード (デジタル名刺 / リンクマップ / 依頼ページ)
- 最新のポートフォリオやツールへのハイライトリンク

## 機能

### プロフィール選択

- 本名プロフィール: 採用担当者や企業向けの正式な自己紹介
- ハンドルネームプロフィール: ラフな自己紹介、同業者向け

### 共通プロフィール情報

- **スキル**: デザイン(Photoshop, Illustrator, AdobeXD, Figma)、プログラミング言語(C, C++, C#, HTML, JavaScript, TypeScript, CSS)、技術スタック(React, NextJS, Tailwind CSS, p5js, PIXIjs, GSAP)、映像(AfterEffects, Aviult, PremierePro, Blender)、その他(Unity, Cubase)
- **基本情報**: 平成19年10月生、現役高専生(2025年7月現在)
- **自己紹介**: グラフィックデザイン、映像制作、個人開発など幅広く活動。やる気になれば何でもできるのが強み

### 本名プロフィール専用情報

- **経歴・学歴**: 2023/3 公立中学卒業、2023/4 高専入学、現在在学中
- **受賞歴**:
  - ~2023 市区学校美術展覧会 受賞多数
  - 2022/10 U-16プログラミングコンテスト山口大会2022 アイデア賞
  - 2023/10 U-16プログラミングコンテスト山口大会2023 技術賞 企業(プライムゲート)賞
  - 2024/3 中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位

## データ

- `ContentItem` type: `profile` の概要が中心
- 本名とハンドルネームの2つのプロフィールデータ

## Meta情報

### SEO

- **title**: "About - samuido | 木村友亮について"
- **description**: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。"
- **keywords**: "木村友亮, プロフィール, 経歴, スキル, Webデザイナー, フロントエンド開発者"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about"

### Open Graph

- **og:title**: "About - samuido | 木村友亮について"
- **og:description**: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。"
- **og:type**: "profile"
- **og:url**: "https://yusuke-kim.com/about"
- **og:image**: "https://yusuke-kim.com/about-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "About - samuido | 木村友亮について"
- **twitter:description**: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。"
- **twitter:image**: "https://yusuke-kim.com/about-twitter-image.jpg"
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
  "url": "https://yusuke-kim.com/about",
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
