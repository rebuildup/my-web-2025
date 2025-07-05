# SVG to TSX変換ツールページ (/tools/svg2tsx)

## 目的

svg画像をReactコンポーネントに変換するツールです。svg画像またはsvgのコードからtsxコードを生成し、ダウンロード可能です。ファイルはアップロードせず、処理はローカルで完結します。

## 主な要素

- SVGファイル/コード入力
- TSXコード生成
- ダウンロード機能
- ローカル処理

## 機能

- SVG画像ファイルまたはSVGコードを入力
- React用のTSXコードを自動生成
- 生成したTSXコードをダウンロード（.tsx形式）
- ファイルアップロード不要、すべてローカルで処理
- コードのプレビュー・コピー

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `input-methods`, `output-format`, `local-processing`
