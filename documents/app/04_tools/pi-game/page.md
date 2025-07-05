# 円周率ゲームツールページ (/tools/pi-game)

## 目的

円周率をずっと押し続けるゲームを提供し、テンキーを表示して円周率の順番に押し続け、間違ったらリセットする。

## 主な要素

- テンキー表示
- 円周率表示
- ゲーム進行管理
- スコア表示

## 機能

### テンキー表示

- **数字キー**: 0-9の数字キー
- **視覚的フィードバック**: 正解・不正解の視覚的フィードバック
- **キーボード対応**: キーボードでの入力対応
- **タッチ対応**: タッチデバイスでの入力対応

### 円周率表示

- **現在位置表示**: 現在の円周率の位置表示
- **正解表示**: 正解の数字の表示
- **進捗表示**: 進捗状況の表示
- **ハイライト**: 現在の数字のハイライト

### ゲーム進行管理

- **正解判定**: 入力された数字の正解判定
- **リセット機能**: 間違った場合のリセット
- **継続機能**: 正解時の継続進行
- **一時停止**: ゲームの一時停止機能

### スコア表示

- **連続正解数**: 連続で正解した回数
- **最大記録**: 最大連続正解記録
- **現在記録**: 現在の連続正解記録
- **統計表示**: ゲーム統計の表示

### 設定機能

- **難易度設定**: 表示速度の調整
- **音效設定**: 効果音のON/OFF
- **テーマ設定**: 色テーマの変更
- **キー設定**: キー配置の変更

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `game-settings`, `score-system`

## Meta情報

### SEO

- **title**: "Pi Game - samuido | 円周率ゲーム"
- **description**: "円周率をずっと押し続けるゲーム。テンキーで円周率の順番に押し続け、間違ったらリセットします。"
- **keywords**: "円周率ゲーム, パイゲーム, 数字ゲーム, 記憶ゲーム, テンキー, リセット"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/pi-game"

### Open Graph

- **og:title**: "Pi Game - samuido | 円周率ゲーム"
- **og:description**: "円周率をずっと押し続けるゲーム。テンキーで円周率の順番に押し続け、間違ったらリセットします。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/pi-game"
- **og:image**: "https://yusuke-kim.com/tools/pi-game-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Pi Game - samuido | 円周率ゲーム"
- **twitter:description**: "円周率をずっと押し続けるゲーム。テンキーで円周率の順番に押し続け、間違ったらリセットします。"
- **twitter:image**: "https://yusuke-kim.com/tools/pi-game-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Pi Game",
  "description": "円周率をずっと押し続けるゲーム",
  "url": "https://yusuke-kim.com/tools/pi-game",
  "applicationCategory": "Game",
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

- **テンキー表示**: デバイスに応じたテンキーサイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **入力処理**: 高速な入力処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
