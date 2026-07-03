# /tools ルート仕様

`/tools` は実用的なWebツールのコレクションで構成されます.

## ページ構成

| パス                            | 役割                           | 対応ファイル                     |
| ------------------------------- | ------------------------------ | -------------------------------- |
| `/tools`                        | Toolsトップページ              | `page.md`                        |
| `/tools/ae-expression`          | AfterEffectsエクスプレッション | `ae-expression/page.md`          |
| `/tools/business-mail-block`    | ビジネスメールテンプレート     | `business-mail-block/page.md`    |
| `/tools/color-palette`          | カラーパレット生成             | `color-palette/page.md`          |
| `/tools/pi-game`                | 円周率ゲーム                   | `pi-game/page.md`                |
| `/tools/pomodoro`               | ポモドーロタイマー             | `pomodoro/page.md`               |
| `/tools/ProtoType`              | PIXIjsタイピングゲーム         | `ProtoType/page.md`              |
| `/tools/qr-generator`           | QRコード生成                   | `qr-generator/page.md`           |
| `/tools/sequential-png-preview` | 連番PNGプレビュー              | `sequential-png-preview/page.md` |
| `/tools/svg2tsx`                | SVG to TSX変換                 | `svg2tsx/page.md`                |
| `/tools/text-counter`           | テキストカウンター             | `text-counter/page.md`           |

## ツール仕様

### ae-expression

- **目的**: AfterEffectsのエクスプレッションを一覧表示
- **機能**: Scratchのブロック風UIで引数設定
- **表示**: わかりやすい引数表示と設定機能

### business-mail-block

- **目的**: ビジネスメールのテンプレートを組み合わせるツール
- **機能**: Scratchのようにブロックを組み合わせてメール作成
- **出力**: 完成したメールテンプレート

### color-palette

- **目的**: 色域を指定してランダムに色を生成
- **機能**:
  - 色域指定
  - ランダム色生成
  - パレット保存

### pi-game

- **目的**: 円周率を順番に押し続けるゲーム
- **機能**:
  - テンキー表示
  - 円周率の順番に押下
  - 間違えたらリセット
  - スコア記録

### pomodoro

- **目的**: シンプルなポモドーロタイマー
- **機能**:
  - 25分作業 / 5分休憩
  - 通知機能
  - カスタマイズ可能

### ProtoType

- **目的**: PIXIjsのタイピングゲーム
- **機能**:
  - GitHubリポジトリ使用
  - タイピングゲーム機能
  - スコア記録

### qr-generator

- **目的**: URLからQRコードを生成
- **機能**:
  - URL入力
  - QRコード生成
  - ダウンロード機能

### sequential-png-preview

- **目的**: 連番PNGをプレビュー
- **機能**:
  - 複数ファイルからプレビュー
  - フォルダからプレビュー
  - ZIPからプレビュー
- **特徴**: ローカル処理、ファイルアップロードなし

### svg2tsx

- **目的**: SVG画像をReactコンポーネントに変換
- **機能**:
  - SVG画像またはコードから変換
  - TSX形式でダウンロード
- **特徴**: ローカル処理、ファイルアップロードなし

### text-counter

- **目的**: テキストの文字数をカウント
- **機能**:
  - 単純な文字数カウント
  - 改行数カウント
  - 1行の文字数設定による行数カウント

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
