# ハンドルネームプロフィールページ (/about/profile/handle)

## 目的

同業者向けのラフな自己紹介ページ。技術的な興味や活動を中心に紹介する。

## 主な要素

- ヒーローヘッダー (ハンドルネーム、ラフな自己紹介)
- スキルカード (技術スタック中心)
- 活動履歴 (制作活動、プロジェクト)
- 連絡先 & SNS リンク

## プロフィール情報

### 基本情報

- **ハンドルネーム**: samuido
- **生年月日**: 2007年10月生
- **現況**: 現役高専生(2025年7月現在)
- **自己紹介**: グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです

### スキル

- **デザイン**: Photoshop, Illustrator, AdobeXD, Figma
- **プログラミング言語**: C, C++, C#, HTML, JavaScript, TypeScript, CSS
- **技術スタック**: React, NextJS, Tailwind CSS, p5js, PIXIjs, GSAP
- **映像**: AfterEffects, Aviutl, PremierePro, Blender
- **その他**: Unity, Cubase

### 活動履歴

- **個人開発**: プラグイン、ツール、ゲーム制作
- **映像制作**: MV、リリックモーション、アニメーション
- **Web開発**: ポートフォリオサイト、ツールサイト
- **技術共有**: ブログ記事、チュートリアル

## 機能

### スキル表示

- **技術スタック重視**: プログラミング言語、フレームワーク、ライブラリ
- **レベル表示**: 各スキルの習熟度
- **カテゴリー別**: デザイン、プログラミング、映像、その他

### 活動履歴

- **制作活動**: 個人制作の履歴
- **プロジェクト**: 参加したプロジェクト
- **技術記事**: 執筆した記事やチュートリアル

### 連絡先

- **メール**: 361do.sleep(at)gmail.com
- **X**: @361do_sleep (開発関連)
- **X**: @361do_design (映像・デザイン関連)
- **GitHub**: 開発プロジェクト

## データ

- `ContentItem` type: `profile`
- `customFields`: `skills`, `activities`, `contact`

## Meta情報

### SEO

- **title**: "Profile - samuido | samuidoのプロフィール"
- **description**: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。"
- **keywords**: "samuido, プロフィール, フロントエンド, 技術スタック, 個人開発, 制作活動"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/profile/handle"

### Open Graph

- **og:title**: "Profile - samuido | samuidoのプロフィール"
- **og:description**: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。"
- **og:type**: "profile"
- **og:url**: "https://yusuke-kim.com/about/profile/handle"
- **og:image**: "https://yusuke-kim.com/about/profile-handle-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Profile - samuido | samuidoのプロフィール"
- **twitter:description**: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。"
- **twitter:image**: "https://yusuke-kim.com/about/profile-handle-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "samuido",
  "alternateName": "木村友亮",
  "jobTitle": "フロントエンドエンジニア",
  "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
  "url": "https://yusuke-kim.com/about/profile/handle",
  "sameAs": [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design"
  ],
  "knowsAbout": [
    "Frontend Development",
    "Web Design",
    "Video Production",
    "Game Development"
  ],
  "hasOccupation": {
    "@type": "Occupation",
    "name": "フロントエンドエンジニア",
    "description": "Web開発、デザイン、映像制作"
  }
}
```

詳細
