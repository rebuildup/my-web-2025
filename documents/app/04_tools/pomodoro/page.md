# ポモドーロタイマー (/tools/pomodoro)

## 概要

仕事・学習用のポモドーロタイマー。スマホ/タブレットのタッチ操作に正式対応し、付箋・画像・YouTube・ミニタイマーをドラッグして配置できます。左側のフローバーはホバー/タップでハイライトし、進行度が色でリアルタイムに満ちていきます。

## 主な機能

- **セッション管理**: 作業/小休憩/長休憩を自動で切り替え、現在のフェーズを中央タイマーとフローバーで表示。
- **リアルタイム進行バー**: 左フローバーに全体進捗レイヤー＋ステップごとの色塗りアニメーション。タップでもハイライト。
- **モバイル最適化**: ドック拡大や付箋ドラッグをタッチで操作可能。削除ゾーンもタップで反応。
- **通知・サウンド**: ブラウザ通知、効果音、バイブレーション (対応端末)。
- **カスタムレイアウト**: 付箋/画像/YouTube/ミニタイマーを自由配置。テーマ切替・音量・自動再生設定を保存。

## 使い方

1. `スタート`で作業セッションを開始。中央タイマーをタップして一時停止/再開。
2. 左フローバーをタップ/ホバーすると対象ステップが強調され、経過割合が色で満ちる。
3. 画面下ドックから付箋やYouTubeを追加し、ドラッグで移動。タップ長押しでも動かせます。
4. 削除したいウィジェットはドラッグして下部の破線ゾーンにドロップ。

## データ

- `ContentItem` type: `tool`
- `customFields`: `timer-settings`, `notifications`, `statistics`, `usage-count`

## Meta 情報

### SEO

- **title**: "Pomodoro Timer - モバイル対応のポモドーロタイマー | samuido"
- **description**: "スマホ/タブレット対応のポモドーロタイマー。左フローバーのリアルタイム進行色と付箋・YouTube配置で集中を可視化。"
- **keywords**: "ポモドーロ, タイマー, タスク管理, モバイル対応, 付箋, 進行バー"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/pomodoro"

### Open Graph

- **og:title**: "Pomodoro Timer - モバイル対応のポモドーロタイマー | samuido"
- **og:description**: "左フローバーがリアルタイムに満ちるモバイル対応ポモドーロタイマー。付箋やYouTubeも配置可能。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/pomodoro"
- **og:image**: "https://yusuke-kim.com/tools/pomodoro-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Pomodoro Timer - モバイル対応のポモドーロタイマー | samuido"
- **twitter:description**: "進行色が満ちるフローバーとタッチ操作に最適化したポモドーロタイマー。"
- **twitter:image**: "https://yusuke-kim.com/tools/pomodoro-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

