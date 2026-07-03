# 連番PNGプレビューツール (/tools/sequential-png-preview)

## 目的

連番PNGファイルをプレビューし、アニメーションとして表示するツール.複数のプレビュー方法を提供.

## 主な要素

- ファイル選択機能
- プレビュー表示
- アニメーション制御
- エクスポート機能

## 機能

### ファイル選択機能

- **複数ファイル選択**: 複数のPNGファイルを選択
- **フォルダ選択**: フォルダ内のPNGファイルを一括選択
- **ZIPファイル対応**: ZIPファイル内のPNGファイルを展開
- **ドラッグ&ドロップ**: ファイルのドラッグ&ドロップ対応

### プレビュー表示

- **アニメーション表示**: 連番PNGをアニメーションとして表示
- **フレーム表示**: 個別フレームの表示
- **グリッド表示**: 複数フレームのグリッド表示
- **スライダー表示**: フレーム間のスライダー操作

### アニメーション制御

- **再生/停止**: アニメーションの再生・停止制御
- **速度調整**: 再生速度の調整
- **ループ設定**: ループ再生の設定
- **フレーム選択**: 特定フレームへのジャンプ

### エクスポート機能

- **GIF出力**: アニメーションGIFとして出力
- **MP4出力**: MP4動画として出力
- **フレーム出力**: 個別フレームの出力
- **設定保存**: プレビュー設定の保存

## プレビューモード

### 複数ファイルプレビュー

- **ファイル選択**: 複数のPNGファイルを手動選択
- **順序確認**: ファイルの順序を確認・調整
- **プレビュー**: 選択したファイルをアニメーション表示
- **編集機能**: ファイルの追加・削除・順序変更

### フォルダプレビュー

- **フォルダ選択**: フォルダ内のPNGファイルを自動検出
- **自動ソート**: ファイル名による自動ソート
- **フィルター機能**: 特定条件でのファイルフィルター
- **一括処理**: フォルダ内ファイルの一括処理

### ZIPプレビュー

- **ZIP選択**: ZIPファイル内のPNGファイルを展開
- **自動展開**: ZIPファイルの自動展開
- **構造保持**: ZIP内のフォルダ構造を保持
- **圧縮対応**: 各種圧縮形式に対応

## アニメーション設定

### 基本設定

- **フレームレート**: 1-60fpsの範囲で設定
- **ループ設定**: ループ再生の有効/無効
- **方向設定**: 順再生・逆再生・往復再生
- **品質設定**: プレビュー品質の調整

### 表示設定

- **サイズ調整**: プレビューサイズの調整
- **アスペクト比**: アスペクト比の保持/変更
- **背景設定**: 背景色の設定
- **グリッド表示**: グリッド線の表示

### 制御設定

- **キーボード操作**: キーボードでの操作
- **マウス操作**: マウスでの操作
- **タッチ操作**: タッチデバイスでの操作
- **ショートカット**: 各種ショートカットキー

## データ

- `ContentItem` type: `tool`
- `customFields`: `preview-modes`, `animation-settings`, `export-formats`, `usage-count`

## Meta情報

### SEO

- **title**: "Sequential PNG Preview - samuido | 連番PNGプレビュー"
- **description**: "連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応."
- **keywords**: "連番PNG, プレビュー, アニメーション, 画像表示, ZIP対応, フォルダ対応"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/sequential-png-preview"

### Open Graph

- **og:title**: "Sequential PNG Preview - samuido | 連番PNGプレビュー"
- **og:description**: "連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応."
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/sequential-png-preview"
- **og:image**: "https://yusuke-kim.com/tools/sequential-png-preview-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Sequential PNG Preview - samuido | 連番PNGプレビュー"
- **twitter:description**: "連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応."
- **twitter:image**: "https://yusuke-kim.com/tools/sequential-png-preview-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Sequential PNG Preview",
  "description": "連番PNGファイルをアニメーションとしてプレビュー",
  "url": "https://yusuke-kim.com/tools/sequential-png-preview",
  "applicationCategory": "MultimediaApplication",
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
- **視覚的フィードバック**: 明確な操作フィードバック

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: 設定や履歴の保存

### ファイル処理

- **ファイル読み込み**: 各種ファイル形式の読み込み
- **ZIP展開**: ZIPファイルの展開機能
- **メモリ管理**: 適切なメモリ使用
- **パフォーマンス**: 高速なファイル処理
