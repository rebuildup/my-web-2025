# AfterEffectsエクスプレッションツールページ (/tools/ae-expression)

## 目的

AfterEffectsのエクスプレッションをScratchのブロック風の見た目で一覧表示し、設定できる引数をわかりやすく表示する。

## 主な要素

- エクスプレッション一覧
- Scratch風ブロック表示
- 引数設定機能
- 検索機能

## 機能

### エクスプレッション一覧

- **カテゴリ別表示**: アニメーション、エフェクト、変形、その他
- **Scratch風ブロック**: ブロック風の見た目でエクスプレッションを表示
- **引数表示**: 設定できる引数をわかりやすく表示
- **説明文**: エクスプレッションの説明

### Scratch風ブロック表示

- **ブロックデザイン**: Scratchのようなブロック風デザイン
- **カラーコーディング**: カテゴリ別の色分け
- **ドラッグ&ドロップ**: ブロックのドラッグ&ドロップ操作
- **組み合わせ**: ブロックの組み合わせ機能

### 引数設定機能

- **引数入力**: 数値、テキスト、ブール値の入力
- **リアルタイムプレビュー**: 設定変更のリアルタイムプレビュー
- **デフォルト値**: 引数のデフォルト値表示
- **バリデーション**: 入力値の検証

### 検索機能

- **名前検索**: エクスプレッション名での検索
- **カテゴリ検索**: カテゴリ別での検索
- **引数検索**: 引数名での検索
- **リアルタイム検索**: 入力に応じたリアルタイム検索

### エクスポート機能

- **コピー**: エクスプレッションコードのコピー
- **ダウンロード**: エクスプレッションコードのダウンロード
- **AfterEffects連携**: AfterEffectsへの直接連携

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `parameters`, `code`, `examples`, `difficulty`

## Meta情報

### SEO

- **title**: "AfterEffects Expressions - samuido | エクスプレッションツール"
- **description**: "AfterEffectsのエクスプレッションをScratch風ブロックでわかりやすく表示。設定できる引数とリアルタイムプレビューで簡単にエクスプレッションを作成できます。"
- **keywords**: "AfterEffects, エクスプレッション, Scratch, ブロック, アニメーション, エフェクト"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/ae-expression"

### Open Graph

- **og:title**: "AfterEffects Expressions - samuido | エクスプレッションツール"
- **og:description**: "AfterEffectsのエクスプレッションをScratch風ブロックでわかりやすく表示。設定できる引数とリアルタイムプレビューで簡単にエクスプレッションを作成できます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/ae-expression"
- **og:image**: "https://yusuke-kim.com/tools/ae-expression-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "AfterEffects Expressions - samuido | エクスプレッションツール"
- **twitter:description**: "AfterEffectsのエクスプレッションをScratch風ブロックでわかりやすく表示。設定できる引数とリアルタイムプレビューで簡単にエクスプレッションを作成できます。"
- **twitter:image**: "https://yusuke-kim.com/tools/ae-expression-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AfterEffects Expressions Tool",
  "description": "AfterEffectsのエクスプレッションをScratch風ブロックで表示するツール",
  "url": "https://yusuke-kim.com/tools/ae-expression",
  "applicationCategory": "MultimediaApplication",
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

- **ブロック表示**: デバイスに応じたブロックサイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **リアルタイム処理**: 引数変更のリアルタイム処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
