# ポモドーロタイマーツールページ (/tools/pomodoro)

## 目的

シンプルなポモドーロタイマーを提供し、作業と休憩の時間管理を支援する。

## 主な要素

- タイマー表示
- 作業・休憩切り替え
- 通知機能
- 設定機能

## 機能

### タイマー表示

- **時間表示**: 残り時間の表示
- **プログレスバー**: 進捗状況の視覚的表示
- **状態表示**: 作業中・休憩中の状態表示
- **カウントダウン**: リアルタイムカウントダウン

### 作業・休憩切り替え

- **作業時間**: 25分の作業時間
- **短い休憩**: 5分の短い休憩
- **長い休憩**: 15分の長い休憩
- **自動切り替え**: 時間終了時の自動切り替え

### 通知機能

- **ブラウザ通知**: ブラウザ通知での時間終了通知
- **音效通知**: 効果音での通知
- **デスクトップ通知**: デスクトップ通知
- **通知設定**: 通知のON/OFF設定

### 設定機能

- **時間設定**: 作業・休憩時間のカスタマイズ
- **音效設定**: 効果音のON/OFF
- **テーマ設定**: 色テーマの変更
- **自動開始**: 自動開始の設定

### 統計機能

- **完了セッション**: 完了したポモドーロセッション数
- **総作業時間**: 総作業時間の表示
- **日別統計**: 日別の統計表示
- **エクスポート**: 統計データのエクスポート

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `timer-settings`, `notification-settings`

## Meta情報

### SEO

- **title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **description**: "シンプルなポモドーロタイマー。作業と休憩の時間管理を効率的に支援します。"
- **keywords**: "ポモドーロタイマー, 時間管理, 作業効率, タイマー, 通知"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/pomodoro"

### Open Graph

- **og:title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **og:description**: "シンプルなポモドーロタイマー。作業と休憩の時間管理を効率的に支援します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/pomodoro"
- **og:image**: "https://yusuke-kim.com/tools/pomodoro-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **twitter:description**: "シンプルなポモドーロタイマー。作業と休憩の時間管理を効率的に支援します。"
- **twitter:image**: "https://yusuke-kim.com/tools/pomodoro-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Pomodoro Timer",
  "description": "シンプルなポモドーロタイマー",
  "url": "https://yusuke-kim.com/tools/pomodoro",
  "applicationCategory": "ProductivityApplication",
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

- **タイマー表示**: デバイスに応じたタイマーサイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **タイマー精度**: 高精度なタイマー処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
