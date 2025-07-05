# ポートフォリオトップページ (/portfolio)

## 目的

4つのカテゴリ別ギャラリーへの導線を提供し、作品の全体像を把握できるハブページ。

## 主な要素

- ヒーローヘッダー (ポートフォリオ概要)
- カテゴリ選択カード (all / develop / video / video&design)
- 最新作品のハイライト
- 統計情報 (作品数、カテゴリ別作品数など)

## ギャラリー仕様

### all (全作品一覧)

- **目的**: バラエティを重視した全作品の一覧
- **フィルター機能**:
  - 時系列ソート（新着順/古い順）
  - カテゴリフィルター
  - タグフィルター
- **表示**: カードレイアウト、無限スクロールまたはページネーション
- **検索**: タイトル、タグ、説明文からの検索

### develop (開発系作品)

- **対象**: プログラミング関連の制作
  - プラグイン開発
  - ゲーム制作
  - Webアプリケーション
  - プログラミングを使った映像制作
- **フィルター**: 使用技術タグを重視
  - プログラミング言語 (C, C++, C#, JavaScript, TypeScript, HTML, CSS)
  - フレームワーク・ライブラリ (React, NextJS, p5js, PIXIjs, GSAP)
  - 開発ツール (Unity, Blender)
- **表示**: 技術詳細を強調したカードレイアウト
- **詳細ページ**: 技術詳細、実装方法、使用技術を重視

### video (映像作品)

- **対象**: 映像制作のみ
  - 依頼映像
  - 個人制作映像
- **プレビュー**: 軽量プレビュー機能
  - YouTube埋め込み
  - WebMファイル
  - サムネイル + 再生ボタン
- **フィルター**: 映像の種類を重視
  - MV（ミュージックビデオ）
  - リリックモーション
  - イラストアニメーション
  - プロモーション映像
  - その他
- **表示**: 動画プレビュー重視のレイアウト
- **詳細ページ**: 制作過程、使用ソフト、制作時間を重視

### video&design (映像・デザイン作品)

- **対象**: 映像に加えて画像などのデザイン、Webデザインなど
- **目的**: デザインスキルを強調、クリエイティブなギャラリー
- **フィルター**:
  - デザインカテゴリ（Webデザイン、グラフィックデザイン、UI/UX）
  - 映像カテゴリ（上記videoと同じ）
- **表示**: デザイン性を重視したレイアウト
- **詳細ページ**: デザインコンセプト、制作意図を重視

## 詳細ページ仕様

### 共通機能

- **コンテンツ**: markdownファイルをHTMLに変換してプレビュー
- **埋め込みコンテンツ**:
  - YouTube、Vimeo（動画）
  - Code（コードブロック）
  - X（ソーシャルメディア）
  - その他iframe対応コンテンツ
- **コメント機能**: なし
- **レスポンシブ対応**: モバイル・デスクトップ対応

### カテゴリ別詳細ページ

- **develop**: 技術詳細、実装方法、使用技術を重視
- **video**: 制作過程、使用ソフト、制作時間を重視
- **video&design**: デザインコンセプト、制作意図を重視

## データ

- `ContentItem` type: `portfolio`
- カテゴリ管理: フォルダ構造に準じた分類
- タグ管理: 技術、カテゴリ、制作年など

## Meta情報

### SEO

- **title**: "Portfolio - samuido | 作品ギャラリー"
- **description**: "Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。"
- **keywords**: "ポートフォリオ, 作品ギャラリー, Webデザイン, アプリケーション, フロントエンド, UI/UX, 映像制作"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio"

### Open Graph

- **og:title**: "Portfolio - samuido | 作品ギャラリー"
- **og:description**: "Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio"
- **og:image**: "https://yusuke-kim.com/portfolio-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Portfolio - samuido | 作品ギャラリー"
- **twitter:description**: "Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。"
- **twitter:image**: "https://yusuke-kim.com/portfolio-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Portfolio - samuido",
  "description": "Webデザイナー・開発者木村友亮の作品ポートフォリオ",
  "url": "https://yusuke-kim.com/portfolio",
  "mainEntity": {
    "@type": "ItemList",
    "name": "作品一覧",
    "description": "Webサイト、アプリケーション、デザイン作品のコレクション"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```
