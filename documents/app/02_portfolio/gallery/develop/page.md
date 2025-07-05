# 開発作品ギャラリーページ (/portfolio/gallery/develop)

## 目的

開発作品を2列で交互に左右に配置し、クリックで詳細パネルを表示する。

## 主な要素

- 2列交互配置のサムネイルカード
- 詳細パネル表示
- フィルター機能
- ソート機能

## 機能

### 2列交互配置のサムネイルカード

- **レイアウト**: サムネイル画像を2列で交互に左右に配置
- **カードサイズ**: 統一されたカードサイズ
- **サムネイル画像**: 作品の代表画像を表示
- **タイトル**: 作品のタイトル
- **技術スタック**: 使用技術の表示
- **交互配置**: 左右交互の配置で視覚的な流れを作成

### 詳細パネル表示

- **プロダクトプレビュー動画**: 埋め込み動画の表示
- **スクリーンショット**: 複数のスクリーンショットを表示
- **タイトル**: 作品のタイトル
- **簡単な説明**: 作品の概要説明
- **リポジトリリンク**: GitHubなどのリポジトリへのリンク
- **詳細ページリンク**: 詳細ページへのリンク
- **モーダル表示**: オーバーレイでの詳細表示

### フィルター機能

- **技術フィルター**: React、NextJS、TypeScript、Unityなど
- **カテゴリーフィルター**: Webアプリ、ゲーム、ツール、プラグイン
- **年別フィルター**: 制作年による絞り込み
- **タグフィルター**: タグによる絞り込み

### ソート機能

- **新着順**: 最新の作品から表示
- **技術順**: 使用技術による並び替え
- **アルファベット順**: タイトルによる並び替え

## データ

- `ContentItem` type: `portfolio`
- `customFields`: `thumbnail`, `technology`, `category`, `tags`, `year`, `description`, `preview-video`, `screenshots`, `repository`, `detail-link`

## Meta情報

### SEO

- **title**: "Development Works - samuido | 開発作品ギャラリー"
- **description**: "samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。"
- **keywords**: "開発作品, Webアプリ, ゲーム開発, ツール, プラグイン, React, NextJS"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/gallery/develop"

### Open Graph

- **og:title**: "Development Works - samuido | 開発作品ギャラリー"
- **og:description**: "samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/gallery/develop"
- **og:image**: "https://yusuke-kim.com/portfolio/gallery-develop-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Development Works - samuido | 開発作品ギャラリー"
- **twitter:description**: "samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/gallery-develop-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "samuido Development Works Gallery",
  "description": "開発作品ギャラリー",
  "url": "https://yusuke-kim.com/portfolio/gallery/develop",
  "mainEntity": {
    "@type": "ItemList",
    "name": "開発作品一覧",
    "description": "Webアプリ、ゲーム、ツール、プラグインなどの開発作品"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### レスポンシブ対応

- **2列レイアウト**: デバイスに応じた2列配置
- **交互配置**: 左右交互の配置を維持
- **タッチ対応**: モバイルでのタップ操作

### パフォーマンス

- **遅延読み込み**: スクロールに応じた画像読み込み
- **動画最適化**: プレビュー動画の最適化
- **キャッシュ**: 画像と動画の適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **フォーカス管理**: 詳細パネルのフォーカス管理
