# データ管理ページ (/admin/data-manager)

## 目的

開発サーバーでのみ動作するコンテンツデータ管理ツール。動画、画像、埋め込み要素、markdownファイルなどのコンテンツデータを入力し、jsonファイルとしてpublicに保存し、プレビュー機能を提供する。

## 主な要素

- コンテンツデータ入力フォーム
- ファイル管理機能
- プレビュー機能
- JSON出力機能
- 画像変換機能

## 機能

### コンテンツデータ入力

- **基本情報入力**: タイトル、説明、カテゴリー、タグ
- **動画データ**: YouTube、Vimeoなどの埋め込みURL
- **画像データ**: 複数画像のアップロード・管理
- **埋め込み要素**: 外部コンテンツの埋め込み設定
- **Markdownファイル**: 詳細ページ用のMarkdown作成

### ファイル管理機能

- **ローカルファイル保存**: 入力ファイルをpublicの規定場所に保存
- **Markdownファイル作成**: 詳細ページ用のMarkdownファイル自動生成
- **ファイル構造管理**: 適切なディレクトリ構造での保存
- **ファイル名管理**: 一意性を保ったファイル名生成

### プレビュー機能

- **リアルタイムプレビュー**: 入力内容のリアルタイムプレビュー
- **最終表示プレビュー**: 実際のサイトでの表示プレビュー
- **レスポンシブプレビュー**: デバイス別の表示確認
- **Markdownプレビュー**: Markdown内容のプレビュー

### JSON出力機能

- **データ構造化**: 入力データの適切なJSON構造化
- **public保存**: JSONファイルをpublicディレクトリに保存
- **バックアップ**: 既存データのバックアップ機能
- **バリデーション**: データ形式の検証機能

### 画像変換機能

- **ffmpeg連携**: ffmpegを使用した画像変換
- **WebP変換**: 画像のWebP形式への変換
- **最適化**: 画像サイズ・品質の最適化
- **複数形式対応**: PNG、JPEG、WebP形式対応

### データ管理機能

- **追加機能**: 新しいコンテンツデータの追加
- **編集機能**: 既存データの編集
- **削除機能**: データの削除
- **一覧表示**: 管理データの一覧表示

## 開発サーバー限定機能

- **開発環境判定**: 開発サーバーでのみ動作
- **管理者権限不要**: 開発環境のため権限チェック不要
- **ローカル処理**: すべてローカルで完結する処理

## データ

- `ContentItem` type: `admin`
- `customFields`: `title`, `description`, `category`, `media-files`, `markdown-content`, `json-output`

## Meta情報

### SEO

- **title**: "Data Manager - samuido | データ管理"
- **description**: "開発サーバー専用のコンテンツデータ管理ツール。動画、画像、Markdownファイルなどを管理し、JSON出力とプレビュー機能を提供します。"
- **keywords**: "データ管理, コンテンツ管理, JSON, Markdown, プレビュー, 開発ツール"
- **robots**: "noindex, nofollow"
- **canonical**: "https://yusuke-kim.com/admin/data-manager"

### Open Graph

- **og:title**: "Data Manager - samuido | データ管理"
- **og:description**: "開発サーバー専用のコンテンツデータ管理ツール。動画、画像、Markdownファイルなどを管理し、JSON出力とプレビュー機能を提供します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/admin/data-manager"
- **og:image**: "https://yusuke-kim.com/admin/data-manager-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Data Manager - samuido | データ管理"
- **twitter:description**: "開発サーバー専用のコンテンツデータ管理ツール。動画、画像、Markdownファイルなどを管理し、JSON出力とプレビュー機能を提供します。"
- **twitter:image**: "https://yusuke-kim.com/admin/data-manager-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Data Manager",
  "description": "開発サーバー専用のコンテンツデータ管理ツール",
  "url": "https://yusuke-kim.com/admin/data-manager",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web Browser",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "creator": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### 開発環境限定

- **環境判定**: 開発サーバーでのみ動作
- **権限管理**: 管理者権限チェック不要
- **ローカル処理**: すべてローカルで完結

### ファイル処理

- **ffmpeg連携**: 画像変換のためのffmpeg統合
- **ファイル保存**: publicディレクトリへの適切な保存
- **Markdown生成**: 詳細ページ用Markdownの自動生成

### パフォーマンス

- **リアルタイム処理**: 入力内容のリアルタイム処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
