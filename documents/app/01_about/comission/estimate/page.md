# 映像依頼料金計算機 (/about/comission/estimate)

## 目的

映像制作の見積もりをフォーム入力に基づいて自動計算し、その結果をコピー/共有できるようにする。

## 主な要素

- 料金計算フォーム
- リアルタイム価格計算
- 料金内訳表示
- 結果のコピー・共有機能

## 機能

### 料金計算フォーム

- **映像の種類**: MV、リリックモーション、イラストアニメーション、プロモーション映像
- **映像の長さ**: 30秒、1分、2分、3分、5分、10分、その他
- **品質レベル**: 標準、高品質、最高品質
- **編集内容**:
  - 基本的な編集
  - エフェクト追加
  - アニメーション制作
  - 3DCG制作
  - カラーグレーディング
- **納期**: 1週間、2週間、1ヶ月、2ヶ月、その他

### リアルタイム価格計算

- **基本料金**: 映像の種類と長さによる基本料金
- **品質係数**: 品質レベルに応じた係数
- **編集係数**: 編集内容に応じた追加料金
- **納期係数**: 緊急対応の場合の追加料金
- **合計金額**: すべての要素を考慮した最終金額

### 料金内訳表示

- **基本料金**: 映像の種類と長さによる料金
- **品質料金**: 品質レベルによる追加料金
- **編集料金**: 編集内容による追加料金
- **納期料金**: 納期による追加料金
- **合計**: すべての料金の合計

### 結果のコピー・共有機能

- **コピー機能**: 見積もり結果をクリップボードにコピー
- **共有機能**: 見積もり結果をSNSで共有
- **PDF出力**: 見積もり書をPDFでダウンロード

## データ

- `FormConfig` id: `video-calculator`
- `customFields`: `video-type`, `duration`, `quality`, `editing`, `deadline`

## Meta情報

### SEO

- **title**: "Video Estimate Calculator - samuido | 映像制作見積もり計算機"
- **description**: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。"
- **keywords**: "映像制作, 見積もり, 料金計算, 動画制作, 編集, 価格, 自動計算"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/comission/estimate"

### Open Graph

- **og:title**: "Video Estimate Calculator - samuido | 映像制作見積もり計算機"
- **og:description**: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/about/comission/estimate"
- **og:image**: "https://yusuke-kim.com/about/comission-estimate-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Video Estimate Calculator - samuido | 映像制作見積もり計算機"
- **twitter:description**: "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。"
- **twitter:image**: "https://yusuke-kim.com/about/comission-estimate-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "samuido Video Estimate Calculator",
  "description": "映像制作の見積もりを自動計算するアプリケーション",
  "url": "https://yusuke-kim.com/about/comission/estimate",
  "applicationCategory": "BusinessApplication",
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

### 計算機能

- **リアルタイム計算**: フォーム入力に応じた即座の計算
- **正確性**: 料金計算の正確性を保証
- **バリデーション**: 入力値の妥当性チェック

### レスポンシブ対応

- **デバイス対応**: PC、タブレット、スマートフォン
- **入力最適化**: 各デバイスでの入力しやすさを重視

### ユーザビリティ

- **直感的操作**: わかりやすいフォーム設計
- **結果表示**: 見やすい料金内訳表示
- **コピー機能**: 簡単な結果コピー機能
