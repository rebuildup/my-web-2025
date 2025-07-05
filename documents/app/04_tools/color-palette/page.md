# カラーパレットツールページ (/tools/color-palette)

## 目的

色域を指定してランダムに色を生成するツールを提供し、デザイン作業での色選びを支援する。

## 主な要素

- 色域指定機能
- ランダム色生成
- パレット表示
- エクスポート機能

## 機能

### 色域指定機能

- **色相指定**: 色相の範囲指定
- **明度指定**: 明度の範囲指定
- **彩度指定**: 彩度の範囲指定
- **RGB指定**: RGB値での範囲指定
- **HEX指定**: HEX値での範囲指定

### ランダム色生成

- **単色生成**: 単一のランダム色生成
- **パレット生成**: 複数のランダム色生成
- **調和色生成**: 調和の取れた色の生成
- **補色生成**: 補色の生成

### パレット表示

- **グリッド表示**: 色をグリッドで表示
- **リスト表示**: 色をリストで表示
- **カラーコード表示**: RGB、HEX、HSL値の表示
- **色名表示**: 色名の表示

### エクスポート機能

- **コピー**: カラーコードのコピー
- **ダウンロード**: パレットのダウンロード
- **CSS出力**: CSS形式での出力
- **SCSS出力**: SCSS形式での出力

### 履歴機能

- **生成履歴**: 生成した色の履歴
- **お気に入り**: お気に入り色の保存
- **パレット保存**: 作成したパレットの保存
- **共有機能**: パレットの共有

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `color-spaces`, `export-formats`

## Meta情報

### SEO

- **title**: "Color Palette - samuido | カラーパレットツール"
- **description**: "色域を指定してランダムに色を生成するツール。デザイン作業での色選びを効率的に支援します。"
- **keywords**: "カラーパレット, 色生成, ランダム色, デザインツール, 色選び, RGB, HEX"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/color-palette"

### Open Graph

- **og:title**: "Color Palette - samuido | カラーパレットツール"
- **og:description**: "色域を指定してランダムに色を生成するツール。デザイン作業での色選びを効率的に支援します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/color-palette"
- **og:image**: "https://yusuke-kim.com/tools/color-palette-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Color Palette - samuido | カラーパレットツール"
- **twitter:description**: "色域を指定してランダムに色を生成するツール。デザイン作業での色選びを効率的に支援します。"
- **twitter:image**: "https://yusuke-kim.com/tools/color-palette-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Palette Tool",
  "description": "色域を指定してランダムに色を生成するツール",
  "url": "https://yusuke-kim.com/tools/color-palette",
  "applicationCategory": "DesignApplication",
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

### レスポンシブ対応

- **色表示**: デバイスに応じた色表示サイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **色生成**: 高速な色生成処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **色覚対応**: 色覚に配慮した表示
