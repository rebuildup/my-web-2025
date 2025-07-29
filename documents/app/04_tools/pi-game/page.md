# 円周率ゲーム (/tools/pi-game)

## 目的

円周率を順番に押し続けるゲームを提供し、数字の記憶とタイピングスキルを向上させる。

## 主な要素

- テンキー表示
- 円周率表示
- スコア記録
- リセット機能

## 機能

### テンキー表示

- **数字キー**: 0-9の数字キーを表示
- **レイアウト**: 一般的なテンキーレイアウト
- **視覚的フィードバック**: 押したキーのハイライト表示
- **キーボード対応**: 物理キーボードでの入力対応

### 円周率表示

- **現在位置表示**: 現在押すべき数字を表示
- **進捗表示**: 正解した数字の進捗を表示
- **間違い表示**: 間違えた場合の表示
- **統計表示**: 正解率、連続正解数などの統計

### スコア記録

- **正解数**: 正しく押した数字の数
- **連続正解**: 連続で正解した最大数
- **正解率**: 全体の正解率
- **ハイスコア**: 最高記録の保存

### リセット機能

- **間違い時リセット**: 間違えた場合の自動リセット
- **手動リセット**: 手動でのリセット機能
- **統計リセット**: 統計データのリセット
- **設定リセット**: ゲーム設定のリセット

## ゲーム設定

### 難易度設定

- **初級**: 小数点以下10桁まで
- **中級**: 小数点以下50桁まで
- **上級**: 小数点以下100桁まで
- **マスター**: 小数点以下1000桁まで

### 表示設定

- **フォントサイズ**: 数字の表示サイズ調整
- **色設定**: テンキーの色設定
- **音設定**: 効果音の有効/無効
- **振動設定**: モバイルでの振動設定

## 円周率データ

### 基本データ

- **π = 3.1415926535...**: 円周率の基本値
- **精度**: 小数点以下1000桁まで対応
- **検証**: 正確性の検証済みデータ

### 統計データ

- **世界記録**: 円周率暗記の世界記録
- **平均記録**: 一般的な暗記記録
- **目標設定**: 段階的な目標設定

## データ

- `ContentItem` type: `tool`
- `customFields`: `pi-digits`, `difficulty-levels`, `scores`, `usage-count`

## Meta情報

### SEO

- **title**: "Pi Game - samuido | 円周率暗記ゲーム"
- **description**: "円周率を順番に押し続けるゲーム。数字の記憶とタイピングスキルを向上させます。"
- **keywords**: "円周率, 暗記ゲーム, 数字ゲーム, タイピング, 記憶力, π"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/pi-game"

### Open Graph

- **og:title**: "Pi Game - samuido | 円周率暗記ゲーム"
- **og:description**: "円周率を順番に押し続けるゲーム。数字の記憶とタイピングスキルを向上させます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/pi-game"
- **og:image**: "https://yusuke-kim.com/tools/pi-game-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Pi Game - samuido | 円周率暗記ゲーム"
- **twitter:description**: "円周率を順番に押し続けるゲーム。数字の記憶とタイピングスキルを向上させます。"
- **twitter:image**: "https://yusuke-kim.com/tools/pi-game-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Pi Game",
  "description": "円周率を順番に押し続ける暗記ゲーム",
  "url": "https://yusuke-kim.com/tools/pi-game",
  "applicationCategory": "GameApplication",
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
- **データ保存**: スコアや設定の保存

### ゲーム機能

- **正確性**: 円周率データの正確性
- **パフォーマンス**: スムーズなゲーム進行
- **統計機能**: 詳細な統計データ
