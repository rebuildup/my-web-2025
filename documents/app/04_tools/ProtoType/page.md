# ProtoTypeツールページ (/tools/ProtoType)

## 目的

前に作ったPIXIjsのタイピングゲームを提供し、https://github.com/rebuildup/ProtoType のリポジトリを使用する。

## 主な要素

- タイピングゲーム
- PIXIjs表示
- ゲーム進行管理
- スコア表示

## 機能

### タイピングゲーム

- **テキスト表示**: タイピング対象のテキスト表示
- **入力判定**: キー入力の正解判定
- **進捗表示**: タイピングの進捗表示
- **速度測定**: タイピング速度の測定

### PIXIjs表示

- **WebGL描画**: PIXIjsによるWebGL描画
- **アニメーション**: スムーズなアニメーション
- **視覚効果**: タイピングに応じた視覚効果
- **パフォーマンス**: 高パフォーマンスな描画

### ゲーム進行管理

- **レベル管理**: 難易度レベルの管理
- **ステージ進行**: ステージの進行管理
- **リセット機能**: ゲームのリセット機能
- **一時停止**: ゲームの一時停止機能

### スコア表示

- **タイピング速度**: WPM（Words Per Minute）表示
- **正確性**: タイピングの正確性表示
- **最高記録**: 最高スコアの記録
- **統計表示**: 詳細な統計表示

### 設定機能

- **難易度設定**: ゲーム難易度の調整
- **テーマ設定**: 視覚テーマの変更
- **音效設定**: 効果音のON/OFF
- **キー設定**: キー配置の変更

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `game-settings`, `score-system`, `repository-url`

## Meta情報

### SEO

- **title**: "ProtoType - samuido | PIXIjsタイピングゲーム"
- **description**: "PIXIjsで作ったタイピングゲーム。高パフォーマンスなWebGL描画で楽しいタイピング体験を提供します。"
- **keywords**: "ProtoType, PIXIjs, タイピングゲーム, WebGL, タイピング, ゲーム"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/ProtoType"

### Open Graph

- **og:title**: "ProtoType - samuido | PIXIjsタイピングゲーム"
- **og:description**: "PIXIjsで作ったタイピングゲーム。高パフォーマンスなWebGL描画で楽しいタイピング体験を提供します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/ProtoType"
- **og:image**: "https://yusuke-kim.com/tools/ProtoType-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "ProtoType - samuido | PIXIjsタイピングゲーム"
- **twitter:description**: "PIXIjsで作ったタイピングゲーム。高パフォーマンスなWebGL描画で楽しいタイピング体験を提供します。"
- **twitter:image**: "https://yusuke-kim.com/tools/ProtoType-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ProtoType",
  "description": "PIXIjsで作ったタイピングゲーム",
  "url": "https://yusuke-kim.com/tools/ProtoType",
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
  },
  "codeRepository": "https://github.com/rebuildup/ProtoType"
}
```

## 技術要件

### レスポンシブ対応

- **ゲーム表示**: デバイスに応じたゲームサイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **WebGL描画**: 高パフォーマンスなWebGL描画
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
