# カラーパレット生成ツール (/tools/color-palette)

## 目的

色域を指定してランダムに色を生成し、デザインに活用できるカラーパレットを作成するツール。

## 主な要素

- 色域設定パネル
- ランダム色生成機能
- パレット表示・管理
- エクスポート機能

## 機能

### 色域設定パネル

- **色相範囲**: 色相（Hue）の範囲を設定
- **彩度範囲**: 彩度（Saturation）の範囲を設定
- **明度範囲**: 明度（Value/Brightness）の範囲を設定
- **色数設定**: 生成する色の数を設定（1-20色）

### ランダム色生成機能

- **ワンクリック生成**: 設定に基づいてランダムに色を生成
- **連続生成**: 複数のパレットを連続生成
- **条件付き生成**: 特定の条件に基づいて色を生成
- **履歴機能**: 生成したパレットの履歴を保存

### パレット表示・管理

- **グリッド表示**: 生成された色をグリッド形式で表示
- **カラーコード表示**: HEX、RGB、HSL形式での色コード表示
- **色名表示**: 色の名前を表示（可能な場合）
- **ドラッグ&ドロップ**: 色の順序を変更

### エクスポート機能

- **CSS変数**: CSS変数形式でエクスポート
- **Tailwind設定**: Tailwind CSS設定形式でエクスポート
- **JSON形式**: JSON形式でエクスポート
- **画像形式**: パレットを画像としてダウンロード

## 色域設定例

### 暖色系

- **色相**: 0-60度（赤〜黄）
- **彩度**: 50-100%
- **明度**: 40-80%

### 寒色系

- **色相**: 180-240度（青〜紫）
- **彩度**: 50-100%
- **明度**: 40-80%

### パステル系

- **色相**: 全範囲
- **彩度**: 20-60%
- **明度**: 70-90%

### モノクロ系

- **色相**: 0度（無彩色）
- **彩度**: 0%
- **明度**: 10-90%

## データ

- `ContentItem` type: `tool`
- `customFields`: `color-ranges`, `palettes`, `export-formats`, `usage-count`

## Meta情報

### SEO

- **title**: "Color Palette Generator - samuido | カラーパレット生成"
- **description**: "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。"
- **keywords**: "カラーパレット, 色生成, デザイン, ランダム色, 色域設定, CSS変数"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/color-palette"

### Open Graph

- **og:title**: "Color Palette Generator - samuido | カラーパレット生成"
- **og:description**: "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/color-palette"
- **og:image**: "https://yusuke-kim.com/tools/color-palette-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Color Palette Generator - samuido | カラーパレット生成"
- **twitter:description**: "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。"
- **twitter:image**: "https://yusuke-kim.com/tools/color-palette-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Palette Generator",
  "description": "色域を指定してランダムにカラーパレットを生成",
  "url": "https://yusuke-kim.com/tools/color-palette",
  "applicationCategory": "DesignApplication",
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
- **カラーブラインド対応**: 色覚特性に配慮したデザイン

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: お気に入りパレットの保存

### 色管理

- **色空間変換**: HSV、RGB、HSL間の変換
- **色の一意性**: 重複しない色の生成
- **エクスポート機能**: 多様な形式でのエクスポート
