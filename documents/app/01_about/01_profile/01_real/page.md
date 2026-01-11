# 本名プロフィールページ (/about/profile/real)

## 目的

採用担当者や企業向けの正式な自己紹介ページ.経歴、学歴、受賞歴を詳細に紹介する.

## 主な要素

- ヒーローヘッダー (本名、正式な自己紹介)
- タイムラインUI (学歴・職歴・受賞歴)
- スキルカード (カテゴリー別フィルター & ソート)
- 連絡先 & SNS リンク

## プロフィール情報

### 基本情報

- **名前**: 木村友亮
- **生年月日**: 平成19年10月生
- **現況**: 現役高専生(2025年7月現在)
- **自己紹介**: グラフィックデザイン、映像制作、個人開発など幅広く活動しています.やる気になれば何でもできるのが強みです

### スキル

- **デザイン**: Photoshop, Illustrator, AdobeXD, Figma
- **プログラミング言語**: C, C++, C#, HTML, JavaScript, TypeScript, CSS
- **技術スタック**: React, NextJS, Tailwind CSS, p5js, PIXIjs, GSAP
- **映像**: AfterEffects, Aviutl, PremierePro, Blender
- **その他**: Unity, Cubase

### 経歴・学歴

- **2023/3**: 公立中学を卒業
- **2023/4**: 高専に入学
- **~2025**: 現在在学中

### 受賞歴

- **~2023**: 市区学校美術展覧会 受賞多数
- **2022/10**: U-16プログラミングコンテスト山口大会2022 アイデア賞
- **2023/10**: U-16プログラミングコンテスト山口大会2023 技術賞 企業(プライムゲート)賞
- **2024/3**: 中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位

## 機能

### タイムライン表示

- **学歴**: 時系列での学歴表示
- **受賞歴**: 受賞内容と日付の詳細表示
- **活動歴**: 制作活動やプロジェクトの履歴

### スキル表示

- **カテゴリー別**: デザイン、プログラミング、映像、その他
- **レベル表示**: 各スキルの習熟度
- **フィルター**: カテゴリー別の表示切り替え

### 連絡先

- **メール**: 361do.sleep(at)gmail.com
- **X**: @361do_sleep (開発関連)
- **X**: @361do_design (映像・デザイン関連)

## データ

- `ContentItem` type: `profile`
- `customFields`: `achievements`, `education`, `skills`, `contact`

## Meta情報

### SEO

- **title**: "Profile - samuido | 木村友亮の詳細プロフィール"
- **description**: "Webデザイナー・開発者木村友亮の詳細プロフィール.学歴、職歴、スキル、受賞歴を時系列でご紹介."
- **keywords**: "木村友亮, プロフィール, 経歴, 学歴, スキル, 職歴, 受賞歴, 高専生"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/profile/real"

### Open Graph

- **og:title**: "Profile - samuido | 木村友亮の詳細プロフィール"
- **og:description**: "Webデザイナー・開発者木村友亮の詳細プロフィール.学歴、職歴、スキル、受賞歴を時系列でご紹介."
- **og:type**: "profile"
- **og:url**: "https://yusuke-kim.com/about/profile/real"
- **og:image**: "https://yusuke-kim.com/about/profile-real-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Profile - samuido | 木村友亮の詳細プロフィール"
- **twitter:description**: "Webデザイナー・開発者木村友亮の詳細プロフィール.学歴、職歴、スキル、受賞歴を時系列でご紹介."
- **twitter:image**: "https://yusuke-kim.com/about/profile-real-twitter-image.jpg"
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
  "url": "https://yusuke-kim.com/about/profile/real",
  "sameAs": [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design"
  ],
  "knowsAbout": [
    "Web Design",
    "Frontend Development",
    "Video Production",
    "Graphic Design"
  ],
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "高専"
  },
  "award": [
    "U-16プログラミングコンテスト山口大会2022 アイデア賞",
    "U-16プログラミングコンテスト山口大会2023 技術賞",
    "中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位"
  ]
}
```
