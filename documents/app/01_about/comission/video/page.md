# 映像依頼ページ (/about/comission/video)

## 目的

映像制作の依頼について説明し、依頼の流れと料金体系を明示する。

## 主な要素

- 映像制作サービス概要
- 依頼の流れ説明
- 料金体系
- 連絡方法
- 実績紹介

## 機能

### 映像制作サービス概要

- **MV制作**: ミュージックビデオの制作
- **リリックモーション**: 歌詞に合わせたアニメーション
- **イラストアニメーション**: イラストを使ったアニメーション
- **プロモーション映像**: 商品・サービスのプロモーション映像
- **その他**: イベント映像、記録映像など

### 依頼の流れ

1. **お問い合わせ**: メールまたはXのDMで依頼内容を相談
2. **要件確認**: 映像の内容、長さ、スタイルの確認
3. **見積もり**: 制作期間と料金の見積もり
4. **制作開始**: 企画、脚本、制作作業
5. **レビュー・修正**: クライアントからのフィードバック反映
6. **納品**: 完成映像の納品とサポート

### 料金体系

- **基本料金**: 映像の長さ、複雑さに応じた基本料金
- **追加料金**: 修正回数、追加機能、緊急対応費用
- **支払い方法**: 前払い、分割払い対応
- **保証期間**: 納品後の保証期間

### 連絡方法

- **メール**: 361do.sleep@gmail.com
- **X (Twitter)**: @361do_design
- **対応時間**: 平日 9:00-18:00
- **返信時間**: 24時間以内

## 実績紹介

### 制作実績

- **MV**: 音楽アーティストのミュージックビデオ
- **リリックモーション**: 歌詞に合わせたアニメーション
- **イラストアニメーション**: オリジナルキャラクターのアニメーション
- **プロモーション映像**: 商品・サービスの紹介映像

### 使用ソフトウェア

- **AfterEffects**: アニメーション制作、エフェクト
- **Premiere Pro**: 動画編集、カラーグレーディング
- **Blender**: 3DCG制作
- **Photoshop**: イラスト制作、画像編集
- **Illustrator**: ベクターグラフィックス

## データ

- `ContentItem` type: `commission`
- `customFields`: `services`, `pricing`, `contact`, `portfolio`

## Meta情報

### SEO

- **title**: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像"
- **description**: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。"
- **keywords**: "映像制作, MV制作, リリックモーション, アニメーション, AfterEffects, Premiere Pro, フリーランス"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/about/comission/video"

### Open Graph

- **og:title**: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像"
- **og:description**: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/about/comission/video"
- **og:image**: "https://yusuke-kim.com/about/comission-video-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像"
- **twitter:description**: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。"
- **twitter:image**: "https://yusuke-kim.com/about/comission-video-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "samuido 映像制作サービス",
  "description": "MV制作、アニメーション、プロモーション映像制作サービス",
  "url": "https://yusuke-kim.com/about/comission/video",
  "provider": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido",
    "email": "361do.sleep@gmail.com"
  },
  "serviceType": "Video Production",
  "areaServed": "Japan",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "映像制作サービス",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "MV制作"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "リリックモーション"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "イラストアニメーション"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "プロモーション映像"
        }
      }
    ]
  }
}
```

## 技術要件

### レスポンシブ対応

- **デバイス対応**: PC、タブレット、スマートフォン
- **表示最適化**: 各デバイスでの見やすさを重視

### フォーム機能

- **お問い合わせ**: 簡単な問い合わせフォーム
- **見積もり依頼**: 詳細な見積もり依頼フォーム
