# 映像&デザイン作品ギャラリーページ (/portfolio/gallery/video&design)

## 目的

サムネイル画像を縦3列のグリッドで表示し、コンテンツに応じたサイズで独特な一覧表示を実現する。

## 主な要素

- 縦3列グリッドレイアウト
- コンテンツ応答型サイズ
- ホバー表示機能
- フィルター機能

## 機能

### 縦3列グリッドレイアウト

- **基本レイアウト**: 縦に3列で表示
- **アスペクト比**: 縦横のアスペクト比を決定
- **グリッドシステム**: グリッド上での配置
- **レスポンシブ**: デバイスに応じた列数調整

### コンテンツ応答型サイズ

- **1×2表示**: 縦長のコンテンツ
- **2×2表示**: 正方形のコンテンツ
- **1×3表示**: 横長のコンテンツ
- **サイズ計算**: コンテンツに応じた自動サイズ調整
- **縦長・横長対応**: アスペクト比に応じた表示

### ホバー表示機能

- **タイトル表示**: ホバー時にタイトルを表示
- **簡単な説明**: ホバー時に説明文を表示
- **作品リンク**: ホバー時に作品リンクを表示
- **詳細ページリンク**: ホバー時に詳細ページリンクを表示
- **オーバーレイ**: 美しいオーバーレイ表示

### フィルター機能

- **カテゴリーフィルター**: 映像、デザイン、その他
- **年別フィルター**: 制作年による絞り込み
- **タグフィルター**: タグによる絞り込み
- **サイズフィルター**: 縦長、横長、正方形による絞り込み

### ソート機能

- **新着順**: 最新の作品から表示
- **人気順**: 人気度による並び替え
- **サイズ順**: コンテンツサイズによる並び替え

## データ

- `ContentItem` type: `portfolio`
- `customFields`: `thumbnail`, `category`, `tags`, `year`, `description`, `aspect-ratio`, `size-type`, `external-link`, `detail-link`

## Meta情報

### SEO

- **title**: "Video & Design Works - samuido | 映像&デザイン作品ギャラリー"
- **description**: "samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。"
- **keywords**: "映像&デザイン, 映像作品, デザイン作品, グリッドレイアウト, アスペクト比"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/gallery/video&design"

### Open Graph

- **og:title**: "Video & Design Works - samuido | 映像&デザイン作品ギャラリー"
- **og:description**: "samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/portfolio/gallery/video&design"
- **og:image**: "https://yusuke-kim.com/portfolio/gallery-video-design-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Video & Design Works - samuido | 映像&デザイン作品ギャラリー"
- **twitter:description**: "samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/gallery-video-design-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "samuido Video & Design Works Gallery",
  "description": "映像&デザイン作品ギャラリー",
  "url": "https://yusuke-kim.com/portfolio/gallery/video&design",
  "mainEntity": {
    "@type": "ItemList",
    "name": "映像&デザイン作品一覧",
    "description": "映像とデザインを組み合わせた作品の一覧"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### レスポンシブ対応

- **3列グリッド**: デバイスに応じた列数調整
- **アスペクト比**: コンテンツに応じたサイズ調整
- **タッチ対応**: モバイルでのタップ操作

### パフォーマンス

- **遅延読み込み**: スクロールに応じた画像読み込み
- **画像最適化**: WebP形式での画像配信
- **キャッシュ**: 画像の適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **ホバー代替**: タッチデバイスでの代替操作
