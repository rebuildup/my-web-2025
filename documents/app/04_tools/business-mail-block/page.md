# ビジネスメールブロックツールページ (/tools/business-mail-block)

## 目的

ビジネスメールのテンプレートをScratchのように組み合わせるツールを提供し、効率的なメール作成を支援する。

## 主な要素

- メールテンプレートブロック
- Scratch風組み合わせ機能
- プレビュー機能
- エクスポート機能

## 機能

### メールテンプレートブロック

- **挨拶ブロック**: 様々な挨拶パターン
- **本文ブロック**: メール本文のテンプレート
- **結びブロック**: 結びの挨拶パターン
- **署名ブロック**: 署名テンプレート

### Scratch風組み合わせ機能

- **ドラッグ&ドロップ**: ブロックのドラッグ&ドロップ操作
- **ブロック接続**: ブロック同士の接続機能
- **カテゴリ分け**: ブロックのカテゴリ別表示
- **色分け**: カテゴリ別の色分け

### プレビュー機能

- **リアルタイムプレビュー**: 組み合わせのリアルタイムプレビュー
- **メール形式表示**: 実際のメール形式での表示
- **編集機能**: プレビュー内での直接編集
- **フォント調整**: フォントサイズやスタイルの調整

### エクスポート機能

- **コピー**: メール内容のコピー
- **ダウンロード**: メール内容のダウンロード
- **メールクライアント連携**: メールクライアントへの直接送信

### テンプレート管理

- **保存機能**: 作成したテンプレートの保存
- **読み込み機能**: 保存したテンプレートの読み込み
- **共有機能**: テンプレートの共有
- **カスタマイズ**: テンプレートのカスタマイズ

## データ

- `ContentItem` type: `tool`
- `customFields`: `title`, `description`, `category`, `blocks`, `templates`, `examples`

## Meta情報

### SEO

- **title**: "Business Mail Block - samuido | ビジネスメールブロックツール"
- **description**: "ビジネスメールのテンプレートをScratch風ブロックで組み合わせるツール。効率的なメール作成を支援します。"
- **keywords**: "ビジネスメール, テンプレート, Scratch, ブロック, メール作成, 効率化"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/business-mail-block"

### Open Graph

- **og:title**: "Business Mail Block - samuido | ビジネスメールブロックツール"
- **og:description**: "ビジネスメールのテンプレートをScratch風ブロックで組み合わせるツール。効率的なメール作成を支援します。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/business-mail-block"
- **og:image**: "https://yusuke-kim.com/tools/business-mail-block-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Business Mail Block - samuido | ビジネスメールブロックツール"
- **twitter:description**: "ビジネスメールのテンプレートをScratch風ブロックで組み合わせるツール。効率的なメール作成を支援します。"
- **twitter:image**: "https://yusuke-kim.com/tools/business-mail-block-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Business Mail Block Tool",
  "description": "ビジネスメールのテンプレートをScratch風ブロックで組み合わせるツール",
  "url": "https://yusuke-kim.com/tools/business-mail-block",
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

- **ブロック表示**: デバイスに応じたブロックサイズ調整
- **タッチ操作**: モバイルでのタッチ操作
- **レイアウト**: デバイスに応じたレイアウト調整

### パフォーマンス

- **リアルタイム処理**: ブロック組み合わせのリアルタイム処理
- **メモリ管理**: 適切なメモリ使用
- **キャッシュ**: 適切なキャッシュ設定

### アクセシビリティ

- **キーボード操作**: キーボードでのナビゲーション
- **スクリーンリーダー**: 適切なaria属性設定
- **代替操作**: タッチデバイスでの代替操作
