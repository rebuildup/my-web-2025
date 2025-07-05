# プラグイン一覧ページ (/workshop/plugins)

## 目的

作成したプラグインを一覧表示し、ダウンロードや使用方法を提供するページ。

## 主な要素

- プラグイン一覧表示
- 詳細情報表示
- ダウンロード機能
- 使用方法説明

## 機能

### プラグイン一覧表示

- **プラグインカード**: プラグインのサムネイルとタイトル表示
- **カテゴリ表示**: プラグインのカテゴリ表示
- **バージョン表示**: プラグインのバージョン表示
- **更新日表示**: 最終更新日の表示

### 詳細情報表示

- **機能説明**: プラグインの詳細な機能説明
- **技術仕様**: 使用技術やシステム要件
- **スクリーンショット**: プラグインの動作画面
- **デモ動画**: プラグインのデモ動画

### ダウンロード機能

- **直接ダウンロード**: プラグインファイルの直接ダウンロード
- **GitHubリンク**: GitHubリポジトリへのリンク
- **バージョン選択**: 複数バージョンからの選択
- **インストール方法**: インストール手順の説明

### 使用方法説明

- **セットアップ**: 初期設定の手順
- **使用方法**: 基本的な使用方法
- **設定項目**: 設定可能な項目の説明
- **トラブルシューティング**: よくある問題と解決方法

## プラグインカテゴリ

### AfterEffectsプラグイン

- **エクスプレッション**: エクスプレッション関連プラグイン
- **エフェクト**: エフェクト関連プラグイン
- **スクリプト**: スクリプト関連プラグイン
- **パネル**: カスタムパネルプラグイン

### Premiere Proプラグイン

- **エフェクト**: エフェクト関連プラグイン
- **トランジション**: トランジション関連プラグイン
- **スクリプト**: スクリプト関連プラグイン
- **エクステンション**: エクステンション関連プラグイン

### その他プラグイン

- **Webプラグイン**: Web用のプラグイン
- **デスクトップアプリ**: デスクトップアプリ用プラグイン
- **モバイルアプリ**: モバイルアプリ用プラグイン
- **その他**: その他のプラグイン

## プラグイン情報

### 基本情報

- **プラグイン名**: プラグインの名前
- **バージョン**: プラグインのバージョン
- **対応ソフト**: 対応するソフトウェア
- **対応OS**: 対応するオペレーティングシステム

### 技術情報

- **開発言語**: 使用した開発言語
- **フレームワーク**: 使用したフレームワーク
- **ライセンス**: プラグインのライセンス
- **依存関係**: 必要な依存関係

### ダウンロード情報

- **ファイルサイズ**: ダウンロードファイルのサイズ
- **ダウンロード数**: ダウンロード数
- **評価**: ユーザー評価
- **レビュー**: ユーザーレビュー

## データ

- `ContentItem` type: `plugin`
- `customFields`: `plugin-info`, `download-links`, `usage-guide`, `download-count`

## Meta情報

### SEO

- **title**: "Plugins - samuido | プラグイン一覧"
- **description**: "作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。"
- **keywords**: "プラグイン, AfterEffects, Premiere Pro, エクスプレッション, エフェクト, ダウンロード"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/workshop/plugins"

### Open Graph

- **og:title**: "Plugins - samuido | プラグイン一覧"
- **og:description**: "作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/workshop/plugins"
- **og:image**: "https://yusuke-kim.com/workshop/plugins-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Plugins - samuido | プラグイン一覧"
- **twitter:description**: "作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。"
- **twitter:image**: "https://yusuke-kim.com/workshop/plugins-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "samuido Plugins",
  "description": "作成したプラグインの一覧",
  "url": "https://yusuke-kim.com/workshop/plugins",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Plugin List",
    "description": "プラグインの一覧"
  }
}
```

## 技術要件

### UI/UX

- **レスポンシブ対応**: 各デバイスでの表示
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **視覚的フィードバック**: 明確なダウンロードフィードバック

### 機能要件

- **ファイル管理**: プラグインファイルの管理
- **ダウンロード機能**: 安全なダウンロード機能
- **統計機能**: ダウンロード数の統計

### プラグイン管理

- **バージョン管理**: プラグインのバージョン管理
- **更新通知**: プラグインの更新通知
- **互換性チェック**: ソフトウェアとの互換性チェック
