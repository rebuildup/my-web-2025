# QRコード生成ツール (/tools/qr-generator)

## 目的

URLからQRコードを生成し、簡単にシェアできるQRコードを作成するツール。

## 主な要素

- URL入力フォーム
- QRコード生成機能
- カスタマイズ機能
- ダウンロード機能

## 機能

### URL入力フォーム

- **URL入力**: 有効なURLの入力
- **バリデーション**: URL形式の検証
- **プレビュー**: 入力URLのプレビュー表示
- **履歴機能**: 最近使用したURLの履歴

### QRコード生成機能

- **リアルタイム生成**: 入力に応じたリアルタイム生成
- **エラー訂正**: QRコードのエラー訂正機能
- **サイズ調整**: QRコードのサイズ調整
- **品質設定**: QRコードの品質設定

### カスタマイズ機能

- **色設定**: QRコードの色カスタマイズ
- **背景設定**: 背景色の設定
- **ロゴ追加**: QRコード中央にロゴ追加
- **スタイル設定**: QRコードのスタイル設定

### ダウンロード機能

- **PNG形式**: PNG形式でのダウンロード
- **SVG形式**: SVG形式でのダウンロード
- **PDF形式**: PDF形式でのダウンロード
- **サイズ選択**: ダウンロードサイズの選択

## QRコード設定

### 基本設定

- **エラー訂正レベル**: L（7%）、M（15%）、Q（25%）、H（30%）
- **サイズ**: 21x21〜177x177の範囲
- **マージン**: QRコード周囲の余白設定
- **暗モード対応**: ダークテーマでの表示対応

### カスタマイズ設定

- **前景色**: QRコードの色設定
- **背景色**: 背景の色設定
- **ロゴ**: 中央に配置するロゴ画像
- **ロゴサイズ**: ロゴのサイズ調整

### 出力設定

- **解像度**: 出力画像の解像度設定
- **ファイル形式**: PNG、SVG、PDFの選択
- **ファイル名**: ダウンロードファイル名の設定
- **圧縮設定**: ファイルサイズの最適化

## 対応URL形式

### 基本URL

- **HTTP/HTTPS**: 一般的なWebサイトURL
- **メール**: mailto:形式のメールアドレス
- **電話**: tel:形式の電話番号
- **SMS**: sms:形式のSMS

### 特殊URL

- **Wi-Fi**: WiFi設定情報
- **位置情報**: 地図アプリでの位置情報
- **アプリ**: アプリストアへのリンク
- **カスタム**: カスタムスキーム

## データ

- `ContentItem` type: `tool`
- `customFields`: `qr-settings`, `customization`, `download-formats`, `usage-count`

## Meta情報

### SEO

- **title**: "QR Code Generator - samuido | QRコード生成"
- **description**: "URLからQRコードを簡単生成。カスタマイズ機能付きで美しいQRコードを作成できます。"
- **keywords**: "QRコード, 生成, URL, カスタマイズ, ダウンロード, シェア"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/qr-generator"

### Open Graph

- **og:title**: "QR Code Generator - samuido | QRコード生成"
- **og:description**: "URLからQRコードを簡単生成。カスタマイズ機能付きで美しいQRコードを作成できます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/qr-generator"
- **og:image**: "https://yusuke-kim.com/tools/qr-generator-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "QR Code Generator - samuido | QRコード生成"
- **twitter:description**: "URLからQRコードを簡単生成。カスタマイズ機能付きで美しいQRコードを作成できます。"
- **twitter:image**: "https://yusuke-kim.com/tools/qr-generator-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "QR Code Generator",
  "description": "URLからQRコードを生成するツール",
  "url": "https://yusuke-kim.com/tools/qr-generator",
  "applicationCategory": "UtilityApplication",
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
- **視覚的フィードバック**: 明確な生成フィードバック

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: 履歴や設定の保存

### QRコード機能

- **正確性**: 正確なQRコード生成
- **互換性**: 各種QRコードリーダーとの互換性
- **カスタマイズ**: 柔軟なカスタマイズ機能
