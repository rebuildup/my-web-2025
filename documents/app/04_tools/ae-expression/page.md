# AfterEffects エクスプレッションツール (/tools/ae-expression)

## 目的

AfterEffectsのエクスプレッションをScratchのブロック風UIで一覧表示し、引数設定をわかりやすく行えるツール。

## 主な要素

- エクスプレッション一覧
- Scratch風ブロックUI
- 引数設定パネル
- プレビュー機能

## 機能

### エクスプレッション一覧

- **カテゴリ別表示**: アニメーション、エフェクト、変形などのカテゴリ
- **検索機能**: エクスプレッション名や説明からの検索
- **フィルター機能**: カテゴリ、難易度、使用頻度による絞り込み
- **お気に入り機能**: よく使うエクスプレッションを保存

### Scratch風ブロックUI

- **ブロック形式**: 視覚的にわかりやすいブロック表示
- **ドラッグ&ドロップ**: 引数の設定をドラッグ&ドロップで操作
- **色分け**: カテゴリ別の色分け表示
- **階層表示**: ネストしたエクスプレッションの階層表示

### 引数設定パネル

- **数値入力**: スライダーやテキスト入力での数値設定
- **選択肢**: ドロップダウンでの選択肢設定
- **ブール値**: チェックボックスでの真偽値設定
- **文字列**: テキストエリアでの文字列設定

### プレビュー機能

- **リアルタイムプレビュー**: 設定変更時の即座なプレビュー
- **アニメーション表示**: エクスプレッションの動作をアニメーション表示
- **コード表示**: 生成されたエクスプレッションコードの表示
- **コピー機能**: 生成されたコードをクリップボードにコピー

## エクスプレッション例

### アニメーション系

- **wiggle**: ランダムな動きを生成
- **loopOut**: アニメーションをループ
- **time**: 時間に基づくアニメーション
- **random**: ランダムな値を生成

### エフェクト系

- **blur**: ぼかし効果
- **glow**: グロー効果
- **wave**: 波効果
- **ripple**: 波紋効果

### 変形系

- **scale**: スケール変更
- **rotation**: 回転
- **position**: 位置変更
- **opacity**: 透明度変更

## データ

- `ContentItem` type: `tool`
- `customFields`: `expressions`, `categories`, `difficulty`, `usage-count`

## Meta情報

### SEO

- **title**: "AE Expression Tool - samuido | AfterEffects エクスプレッション"
- **description**: "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。"
- **keywords**: "AfterEffects, エクスプレッション, アニメーション, エフェクト, Scratch, ブロックUI"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/ae-expression"

### Open Graph

- **og:title**: "AE Expression Tool - samuido | AfterEffects エクスプレッション"
- **og:description**: "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/ae-expression"
- **og:image**: "https://yusuke-kim.com/tools/ae-expression-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "AE Expression Tool - samuido | AfterEffects エクスプレッション"
- **twitter:description**: "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。"
- **twitter:image**: "https://yusuke-kim.com/tools/ae-expression-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AE Expression Tool",
  "description": "AfterEffectsのエクスプレッションをScratch風ブロックUIで設定",
  "url": "https://yusuke-kim.com/tools/ae-expression",
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
- **パフォーマンス**: スムーズなアニメーションとレスポンス

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: お気に入りや設定の保存

### エクスプレッション管理

- **データベース**: エクスプレッション情報の管理
- **カテゴリ分類**: 適切なカテゴリ分類
- **検索機能**: 高速な検索機能
