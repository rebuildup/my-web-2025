# ポモドーロタイマー (/tools/pomodoro)

## 目的

シンプルなポモドーロタイマーを提供し、効率的な作業時間管理を支援する。

## 主な要素

- タイマー表示
- 開始/停止/リセット機能
- 通知機能
- 設定機能

## 機能

### タイマー表示

- **時間表示**: 残り時間を分:秒形式で表示
- **プログレスバー**: 残り時間の視覚的表示
- **フェーズ表示**: 作業時間/休憩時間の表示
- **セット数表示**: 完了したセット数の表示

### 開始/停止/リセット機能

- **開始**: タイマーの開始
- **一時停止**: タイマーの一時停止
- **停止**: タイマーの停止とリセット
- **スキップ**: 現在のフェーズをスキップ

### 通知機能

- **ブラウザ通知**: フェーズ終了時のブラウザ通知
- **音声通知**: 効果音での通知
- **デスクトップ通知**: デスクトップ通知（許可時）
- **振動通知**: モバイルでの振動通知

### 設定機能

- **作業時間**: 作業時間の設定（デフォルト25分）
- **休憩時間**: 短い休憩時間の設定（デフォルト5分）
- **長い休憩時間**: 長い休憩時間の設定（デフォルト15分）
- **セット数**: 長い休憩までのセット数（デフォルト4セット）

## ポモドーロテクニック

### 基本ルール

- **25分作業**: 集中して25分間作業
- **5分休憩**: 短い休憩でリフレッシュ
- **4セット後に長い休憩**: 15分の長い休憩
- **中断時はリセット**: 中断した場合は最初からやり直し

### 効果的な使い方

- **集中環境**: 集中できる環境で使用
- **中断防止**: 作業中は中断を避ける
- **休憩活用**: 休憩時間を効果的に活用
- **記録**: 完了したセット数を記録

## カスタマイズ設定

### 時間設定

- **作業時間**: 15-60分の範囲で設定可能
- **短い休憩**: 1-10分の範囲で設定可能
- **長い休憩**: 10-30分の範囲で設定可能
- **セット数**: 1-10セットの範囲で設定可能

### 通知設定

- **通知音**: 通知音の選択
- **音量**: 通知音の音量調整
- **振動**: モバイルでの振動設定
- **自動開始**: 次のフェーズの自動開始設定

### 表示設定

- **テーマ**: ダーク/ライトテーマの選択
- **フォントサイズ**: 時間表示のフォントサイズ
- **色設定**: プログレスバーの色設定
- **アニメーション**: アニメーション効果の設定

## データ

- `ContentItem` type: `tool`
- `customFields`: `timer-settings`, `notifications`, `statistics`, `usage-count`

## Meta情報

### SEO

- **title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **description**: "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。"
- **keywords**: "ポモドーロ, タイマー, 時間管理, 集中力, 作業効率, 25分作業"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/pomodoro"

### Open Graph

- **og:title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **og:description**: "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/pomodoro"
- **og:image**: "https://yusuke-kim.com/tools/pomodoro-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Pomodoro Timer - samuido | ポモドーロタイマー"
- **twitter:description**: "シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。"
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
- **視覚的フィードバック**: 明確な時間表示とプログレス

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: 設定や統計の保存

### タイマー機能

- **正確性**: 正確な時間計測
- **通知機能**: 適切な通知機能
- **設定管理**: 柔軟な設定管理
