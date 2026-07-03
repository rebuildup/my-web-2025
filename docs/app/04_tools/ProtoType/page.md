# ProtoType タイピングゲーム (/tools/ProtoType)

## 目的

PIXIjsを使用したタイピングゲームを提供し、タイピングスキルの向上を支援する.

## 主な要素

- タイピングゲーム画面
- スコア記録機能
- GitHubリポジトリ連携
- 設定機能

## 機能

### タイピングゲーム画面

- **テキスト表示**: タイプすべきテキストの表示
- **入力フィールド**: ユーザーの入力を受け付ける
- **リアルタイム判定**: 入力文字のリアルタイム判定
- **視覚的フィードバック**: 正解・不正解の視覚的フィードバック

### スコア記録機能

- **WPM記録**: Words Per Minute（1分間の単語数）
- **正確性記録**: タイピングの正確性
- **ハイスコア**: 最高記録の保存
- **統計表示**: 詳細な統計データ

### GitHubリポジトリ連携

- **リポジトリ**: https://github.com/rebuildup/ProtoType
- **自動更新**: リポジトリの更新を自動反映
- **バージョン管理**: ゲームのバージョン管理
- **貢献機能**: コミュニティからの貢献受付

### 設定機能

- **難易度設定**: タイピングの難易度調整
- **テキスト選択**: タイプするテキストの選択
- **表示設定**: 画面表示のカスタマイズ
- **音声設定**: 効果音の設定

## ゲームモード

### 練習モード

- **基本練習**: 基本的なタイピング練習
- **単語練習**: 単語単位での練習
- **文章練習**: 文章単位での練習
- **カスタム練習**: ユーザー定義の練習

### チャレンジモード

- **時間制限**: 制限時間内でのタイピング
- **文字数制限**: 指定文字数のタイピング
- **正確性重視**: 正確性を重視したモード
- **速度重視**: 速度を重視したモード

### 競争モード

- **ランキング**: 他のプレイヤーとの競争
- **リアルタイム対戦**: リアルタイムでの対戦
- **トーナメント**: トーナメント形式の競争
- **チーム戦**: チームでの競争

## 技術仕様

### PIXIjs使用

- **2Dレンダリング**: PIXIjsによる2Dグラフィックス
- **パフォーマンス**: 高速なレンダリング
- **アニメーション**: スムーズなアニメーション
- **レスポンシブ**: 各デバイスでの対応

### データ管理

- **ローカルストレージ**: スコアや設定の保存
- **GitHub連携**: リポジトリとの連携
- **統計データ**: 詳細な統計データ管理
- **バックアップ**: データのバックアップ

## データ

- `ContentItem` type: `tool`
- `customFields`: `game-modes`, `scores`, `github-repo`, `usage-count`

## Meta情報

### SEO

- **title**: "ProtoType Typing Game - samuido | PIXIjs タイピングゲーム"
- **description**: "PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援."
- **keywords**: "タイピングゲーム, PIXIjs, WPM, 正確性, スコア記録, 練習"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/ProtoType"

### Open Graph

- **og:title**: "ProtoType Typing Game - samuido | PIXIjs タイピングゲーム"
- **og:description**: "PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援."
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/ProtoType"
- **og:image**: "https://yusuke-kim.com/tools/ProtoType-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "ProtoType Typing Game - samuido | PIXIjs タイピングゲーム"
- **twitter:description**: "PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援."
- **twitter:image**: "https://yusuke-kim.com/tools/ProtoType-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ProtoType Typing Game",
  "description": "PIXIjsを使用したタイピングゲーム",
  "url": "https://yusuke-kim.com/tools/ProtoType",
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
  },
  "codeRepository": "https://github.com/rebuildup/ProtoType"
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

- **正確性**: 正確なタイピング判定
- **パフォーマンス**: スムーズなゲーム進行
- **統計機能**: 詳細な統計データ
