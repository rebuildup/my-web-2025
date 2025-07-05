# 開発作品詳細ページ (/portfolio/detail/develop/[slug])

## 目的

開発作品の詳細情報を表示し、プロダクトの詳細な説明と技術情報を提供する。

## 主な要素

- 作品詳細情報
- プロダクトプレビュー動画
- スクリーンショットギャラリー
- 技術情報
- リポジトリリンク

## 機能

### 作品詳細情報

- **タイトル**: 作品のタイトル
- **説明**: 詳細な作品説明
- **制作期間**: 開発期間
- **使用技術**: 使用した技術スタック
- **役割**: 開発での役割
- **制作背景**: 制作の背景や目的

### プロダクトプレビュー動画

- **埋め込み動画**: YouTube、Vimeoなどの動画埋め込み
- **自動再生**: 適切な自動再生設定
- **コントロール**: 再生・停止・音量調整
- **レスポンシブ**: デバイスに応じたサイズ調整

### スクリーンショットギャラリー

- **複数画像**: 複数のスクリーンショット表示
- **ライトボックス**: クリックで拡大表示
- **スライダー**: 画像のスライド表示
- **サムネイル**: サムネイル一覧表示

### 技術情報

- **フロントエンド**: HTML、CSS、JavaScript、TypeScript
- **フレームワーク**: React、NextJS、Vue.jsなど
- **ライブラリ**: 使用したライブラリ一覧
- **開発環境**: 開発に使用したツール
- **デプロイ**: デプロイ環境とURL

### リポジトリリンク

- **GitHub**: GitHubリポジトリへのリンク
- **GitLab**: GitLabリポジトリへのリンク
- **その他**: その他のリポジトリサービス
- **ライセンス**: ライセンス情報

## データ

- `ContentItem` type: `portfolio-detail`
- `customFields`: `title`, `description`, `period`, `technology`, `role`, `background`, `preview-video`, `screenshots`, `repository`, `license`

## Meta情報

### SEO

- **title**: "[作品タイトル] - samuido | 開発作品詳細"
- **description**: "[作品タイトル]の詳細情報。使用技術、制作背景、スクリーンショットをご覧いただけます。"
- **keywords**: "開発作品, [作品タイトル], [使用技術], ポートフォリオ, 詳細"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/detail/develop/[slug]"

### Open Graph

- **og:title**: "[作品タイトル] - samuido | 開発作品詳細"
- **og:description**: "[作品タイトル]の詳細情報。使用技術、制作背景、スクリーンショットをご覧いただけます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/detail/develop/[slug]"
- **og:image**: "https://yusuke-kim.com/portfolio/detail-develop-[slug]-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "[作品タイトル] - samuido | 開発作品詳細"
- **twitter:description**: "[作品タイトル]の詳細情報。使用技術、制作背景、スクリーンショットをご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/detail-develop-[slug]-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "[作品タイトル]",
  "description": "[作品説明]",
  "url": "https://yusuke-kim.com/portfolio/detail/develop/[slug]",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "creator": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "dateCreated": "[制作開始日]",
  "dateModified": "[最終更新日]",
  "genre": "Web Development",
  "softwareVersion": "[バージョン]"
}
```

## 技術要件

### レスポンシブ対応

- **動画埋め込み**: デバイスに応じた動画サイズ調整
- **画像ギャラリー**: レスポンシブな画像表示
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **動画最適化**: 適切な動画品質設定
- **画像最適化**: WebP形式での画像配信
- **遅延読み込み**: スクロールに応じた画像読み込み

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **動画アクセシビリティ**: 字幕・音声解説対応
