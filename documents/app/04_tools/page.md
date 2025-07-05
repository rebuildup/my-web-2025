# Toolsトップページ (/tools)

## 目的

実用的なWebツールのコレクションを提供し、ユーザーの作業効率向上を支援する。

## 主な要素

- ヒーローヘッダー (Tools概要)
- ツール一覧カード (各ツールへの導線)
- 人気ツールのハイライト
- 統計情報 (利用回数、人気ランキングなど)

## ツール仕様

### ae-expression

- **目的**: AfterEffectsのエクスプレッションを一覧表示
- **機能**: Scratchのブロック風UIで引数設定
- **表示**: わかりやすい引数表示と設定機能
- **対象ユーザー**: AfterEffectsユーザー

### business-mail-block

- **目的**: ビジネスメールのテンプレートを組み合わせるツール
- **機能**: Scratchのようにブロックを組み合わせてメール作成
- **出力**: 完成したメールテンプレート
- **対象ユーザー**: ビジネスパーソン

### color-palette

- **目的**: 色域を指定してランダムに色を生成
- **機能**:
  - 色域指定
  - ランダム色生成
  - パレット保存
- **対象ユーザー**: デザイナー、開発者

### pi-game

- **目的**: 円周率を順番に押し続けるゲーム
- **機能**:
  - テンキー表示
  - 円周率の順番に押下
  - 間違えたらリセット
  - スコア記録
- **対象ユーザー**: 一般ユーザー

### pomodoro

- **目的**: シンプルなポモドーロタイマー
- **機能**:
  - 25分作業 / 5分休憩
  - 通知機能
  - カスタマイズ可能
- **対象ユーザー**: 一般ユーザー

### ProtoType

- **目的**: PIXIjsのタイピングゲーム
- **機能**:
  - GitHubリポジトリ使用 (https://github.com/rebuildup/ProtoType)
  - タイピングゲーム機能
  - スコア記録
- **対象ユーザー**: ゲームユーザー

### qr-generator

- **目的**: URLからQRコードを生成
- **機能**:
  - URL入力
  - QRコード生成
  - ダウンロード機能
- **対象ユーザー**: 一般ユーザー

### sequential-png-preview

- **目的**: 連番PNGをプレビュー
- **機能**:
  - 複数ファイルからプレビュー
  - フォルダからプレビュー
  - ZIPからプレビュー
- **特徴**: ローカル処理、ファイルアップロードなし
- **対象ユーザー**: アニメーター、デザイナー

### svg2tsx

- **目的**: SVG画像をReactコンポーネントに変換
- **機能**:
  - SVG画像またはコードから変換
  - TSX形式でダウンロード
- **特徴**: ローカル処理、ファイルアップロードなし
- **対象ユーザー**: React開発者

### text-counter

- **目的**: テキストの文字数をカウント
- **機能**:
  - 単純な文字数カウント
  - 改行数カウント
  - 1行の文字数設定による行数カウント
- **対象ユーザー**: 一般ユーザー

## 共通仕様

### 技術要件

- **レスポンシブ対応**: 全ツールでレスポンシブデザイン
- **オフライン対応**: 全ツールでオフライン動作
- **エラーハンドリング**: 適切なエラーハンドリングとコンソール出力
- **アクセシビリティ**: 多くの人が使う可能性があるため重視
  - キーボードナビゲーション対応
  - スクリーンリーダー対応

### パフォーマンス

- **読み込み時間**: 1秒以内を目標
- **画像最適化**: WebP形式使用
- **キャッシュ**: 適切なキャッシュ設定

### 無償公開

- **ライセンス**: 全ツール無償公開
- **利用制限**: なし

## データ

- `ContentItem` type: `tool`
- 利用統計: 各ツールの利用回数
- 人気ランキング: 利用回数によるランキング

## Meta情報

### SEO

- **title**: "Tools - samuido | 実用的なWebツール集"
- **description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **keywords**: "Webツール, カラーパレット, QRコード, ポモドーロ, タイピングゲーム, 実用ツール"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools"

### Open Graph

- **og:title**: "Tools - samuido | 実用的なWebツール集"
- **og:description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools"
- **og:image**: "https://yusuke-kim.com/tools-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Tools - samuido | 実用的なWebツール集"
- **twitter:description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **twitter:image**: "https://yusuke-kim.com/tools-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "samuido Tools",
  "description": "実用的なWebツールのコレクション",
  "url": "https://yusuke-kim.com/tools",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Webツール一覧",
    "description": "カラーパレット、QRコード、タイマーなどの実用ツール"
  }
}
```
