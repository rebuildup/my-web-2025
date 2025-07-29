# SVG to TSX 変換ツール (/tools/svg2tsx)

## 目的

SVG画像またはSVGコードをReactコンポーネント（TSX形式）に変換し、ダウンロード可能にするツール。

## 主な要素

- SVG入力機能
- TSX変換機能
- プレビュー機能
- ダウンロード機能

## 機能

### SVG入力機能

- **ファイルアップロード**: SVGファイルのアップロード
- **コード入力**: SVGコードの直接入力
- **URL入力**: SVGファイルのURL入力
- **ドラッグ&ドロップ**: ファイルのドラッグ&ドロップ

### TSX変換機能

- **自動変換**: SVGからTSXへの自動変換
- **最適化**: コードの最適化
- **TypeScript対応**: TypeScript型定義の生成
- **Props対応**: 動的プロパティの対応

### プレビュー機能

- **SVGプレビュー**: 元のSVGの表示
- **TSXプレビュー**: 生成されたTSXの表示
- **リアルタイム更新**: 入力変更時のリアルタイム更新
- **エラー表示**: 変換エラーの表示

### ダウンロード機能

- **TSXファイル**: TSXファイルとしてダウンロード
- **コピー機能**: TSXコードをクリップボードにコピー
- **ファイル名設定**: ダウンロードファイル名の設定
- **一括ダウンロード**: 複数ファイルの一括ダウンロード

## 変換設定

### 基本設定

- **コンポーネント名**: 生成されるコンポーネントの名前
- **Props型**: TypeScriptのProps型定義
- **デフォルト値**: Propsのデフォルト値設定
- **コメント**: 生成コードにコメントを追加

### 最適化設定

- **不要属性削除**: 不要なSVG属性の削除
- **パス最適化**: SVGパスの最適化
- **色の変数化**: 色をCSS変数に変換
- **サイズの変数化**: サイズをPropsに変換

### 出力設定

- **インデント**: コードのインデント設定
- **改行設定**: 改行の設定
- **エクスポート形式**: デフォルトエクスポート/名前付きエクスポート
- **ファイル拡張子**: .tsx/.ts/.jsx/.jsの選択

## 対応SVG要素

### 基本要素

- **path**: パス要素の変換
- **rect**: 矩形要素の変換
- **circle**: 円要素の変換
- **ellipse**: 楕円要素の変換

### 複雑要素

- **g**: グループ要素の変換
- **defs**: 定義要素の変換
- **use**: 使用要素の変換
- **symbol**: シンボル要素の変換

### スタイル要素

- **style**: スタイル要素の変換
- **class**: クラス名の変換
- **id**: ID属性の変換
- **fill/stroke**: 塗り/線の変換

## データ

- `ContentItem` type: `tool`
- `customFields`: `conversion-settings`, `svg-elements`, `output-formats`, `usage-count`

## Meta情報

### SEO

- **title**: "SVG to TSX Converter - samuido | SVG React変換"
- **description**: "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。"
- **keywords**: "SVG, TSX, React, 変換, TypeScript, コンポーネント, コード生成"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/svg2tsx"

### Open Graph

- **og:title**: "SVG to TSX Converter - samuido | SVG React変換"
- **og:description**: "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/svg2tsx"
- **og:image**: "https://yusuke-kim.com/tools/svg2tsx-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "SVG to TSX Converter - samuido | SVG React変換"
- **twitter:description**: "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。"
- **twitter:image**: "https://yusuke-kim.com/tools/svg2tsx-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SVG to TSX Converter",
  "description": "SVG画像をReactコンポーネントに変換",
  "url": "https://yusuke-kim.com/tools/svg2tsx",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web Browser",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  }
}
```

## 技術要件

### UI/UX

- **レスポンシブ対応**: 各デバイスでの使いやすさ
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **視覚的フィードバック**: 明確な変換フィードバック

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: 設定や履歴の保存

### 変換機能

- **正確性**: 正確なSVGからTSX変換
- **最適化**: 効率的なコード生成
- **互換性**: 各種Reactバージョンとの互換性
