# 映像作品詳細ページ (/portfolio/detail/video/[slug])

## 目的

映像作品の詳細情報を表示し、動画とスクリーンショットで作品を紹介する。

## 主な要素

- 作品詳細情報
- 埋め込み動画
- スクリーンショットギャラリー
- 制作情報
- 外部リンク

## 機能

### 作品詳細情報

- **タイトル**: 作品のタイトル
- **説明**: 詳細な作品説明
- **制作期間**: 制作期間
- **使用ソフト**: 使用したソフトウェア
- **役割**: 制作での役割
- **制作背景**: 制作の背景や目的

### 埋め込み動画

- **メイン動画**: YouTube、Vimeoなどの動画埋め込み
- **自動再生**: 適切な自動再生設定
- **コントロール**: 再生・停止・音量調整
- **レスポンシブ**: デバイスに応じたサイズ調整
- **品質選択**: 動画品質の選択機能

### スクリーンショットギャラリー

- **複数画像**: 複数のスクリーンショット表示
- **ライトボックス**: クリックで拡大表示
- **スライダー**: 画像のスライド表示
- **サムネイル**: サムネイル一覧表示
- **アスペクト比**: 動画のアスペクト比に合わせた表示

### 制作情報

- **制作ソフト**: AfterEffects、Premiere Pro、Blenderなど
- **制作時間**: 実際の制作時間
- **クライアント**: クライアント情報（該当する場合）
- **制作規模**: 制作の規模や複雑さ
- **使用素材**: 使用した素材やライブラリ

### 外部リンク

- **作品リンク**: 外部サイトでの作品公開リンク
- **クライアントサイト**: クライアントのサイトリンク
- **SNS**: SNSでの作品紹介リンク

## データ

- `ContentItem` type: `portfolio-detail`
- `customFields`: `title`, `description`, `period`, `software`, `role`, `background`, `video-embed`, `screenshots`, `external-links`

## Meta情報

### SEO

- **title**: "[作品タイトル] - samuido | 映像作品詳細"
- **description**: "[作品タイトル]の詳細情報。制作背景、使用ソフト、スクリーンショットをご覧いただけます。"
- **keywords**: "映像作品, [作品タイトル], [使用ソフト], ポートフォリオ, 詳細"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/portfolio/detail/video/[slug]"

### Open Graph

- **og:title**: "[作品タイトル] - samuido | 映像作品詳細"
- **og:description**: "[作品タイトル]の詳細情報。制作背景、使用ソフト、スクリーンショットをご覧いただけます。"
- **og:type**: "video.other"
- **og:url**: "https://yusuke-kim.com/portfolio/detail/video/[slug]"
- **og:image**: "https://yusuke-kim.com/portfolio/detail-video-[slug]-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "player"
- **twitter:title**: "[作品タイトル] - samuido | 映像作品詳細"
- **twitter:description**: "[作品タイトル]の詳細情報。制作背景、使用ソフト、スクリーンショットをご覧いただけます。"
- **twitter:image**: "https://yusuke-kim.com/portfolio/detail-video-[slug]-twitter-image.jpg"
- **twitter:creator**: "@361do_design"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "[作品タイトル]",
  "description": "[作品説明]",
  "url": "https://yusuke-kim.com/portfolio/detail/video/[slug]",
  "thumbnailUrl": "https://yusuke-kim.com/portfolio/detail-video-[slug]-thumbnail.jpg",
  "uploadDate": "[アップロード日]",
  "duration": "[動画の長さ]",
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

- **動画埋め込み**: デバイスに応じた動画サイズ調整
- **画像ギャラリー**: レスポンシブな画像表示
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **動画最適化**: 適切な動画品質設定
- **画像最適化**: WebP形式での画像配信
- **遅延読み込み**: スクロールに応じた画像読み込み

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **動画アクセシビリティ**: 字幕・音声解説対応
