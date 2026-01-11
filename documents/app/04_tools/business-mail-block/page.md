# ビジネスメールブロックツール (/tools/business-mail-block)

## 目的

ビジネスメールのテンプレートをScratchのようにブロックを組み合わせて作成するツール.

## 主な要素

- メールブロック一覧
- Scratch風ブロックUI
- テンプレート組み合わせ機能
- プレビュー機能

## 機能

### メールブロック一覧

- **カテゴリ別表示**: 挨拶、本文、締め、署名などのカテゴリ
- **検索機能**: ブロック名や説明からの検索
- **フィルター機能**: カテゴリ、使用頻度、難易度による絞り込み
- **お気に入り機能**: よく使うブロックを保存

### Scratch風ブロックUI

- **ブロック形式**: 視覚的にわかりやすいブロック表示
- **ドラッグ&ドロップ**: ブロックの組み合わせをドラッグ&ドロップで操作
- **色分け**: カテゴリ別の色分け表示
- **階層表示**: ネストしたブロックの階層表示

### テンプレート組み合わせ機能

- **ブロック選択**: カテゴリ別のブロック選択
- **順序変更**: ブロックの順序を変更
- **カスタマイズ**: ブロック内のテキストをカスタマイズ
- **条件分岐**: 条件に応じたブロックの表示/非表示

### プレビュー機能

- **リアルタイムプレビュー**: 組み合わせ変更時の即座なプレビュー
- **メール表示**: 完成したメールの表示
- **コピー機能**: 生成されたメールをクリップボードにコピー
- **ダウンロード機能**: メールをテキストファイルでダウンロード

## メールブロック例

### 挨拶系

- **初回挨拶**: "はじめまして、[会社名]の[名前]です."
- **継続挨拶**: "いつもお世話になっております.[会社名]の[名前]です."
- **季節挨拶**: "暑い日が続いておりますが、いかがお過ごしでしょうか."

### 本文系

- **依頼**: "つきましては、[内容]についてご相談させていただきたく存じます."
- **確認**: "ご多忙の中恐縮ですが、[内容]についてご確認をお願いいたします."
- **報告**: "この度、[内容]についてご報告させていただきます."

### 締め系

- **返信依頼**: "ご検討のほど、よろしくお願いいたします."
- **連絡依頼**: "ご不明な点がございましたら、お気軽にお声がけください."
- **協力依頼**: "ご協力のほど、よろしくお願いいたします."

### 署名系

- **基本署名**: 会社名、部署名、名前、連絡先
- **カスタム署名**: カスタマイズ可能な署名
- **SNS署名**: SNSアカウントを含む署名

## データ

- `ContentItem` type: `tool`
- `customFields`: `mail-blocks`, `categories`, `templates`, `usage-count`

## Meta情報

### SEO

- **title**: "Business Mail Block Tool - samuido | ビジネスメール作成"
- **description**: "ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成."
- **keywords**: "ビジネスメール, テンプレート, Scratch, ブロックUI, メール作成, ビジネス文書"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools/business-mail-block"

### Open Graph

- **og:title**: "Business Mail Block Tool - samuido | ビジネスメール作成"
- **og:description**: "ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成."
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools/business-mail-block"
- **og:image**: "https://yusuke-kim.com/tools/business-mail-block-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Business Mail Block Tool - samuido | ビジネスメール作成"
- **twitter:description**: "ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成."
- **twitter:image**: "https://yusuke-kim.com/tools/business-mail-block-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Business Mail Block Tool",
  "description": "ビジネスメールをScratch風ブロックUIで作成",
  "url": "https://yusuke-kim.com/tools/business-mail-block",
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

### UI/UX

- **レスポンシブ対応**: 各デバイスでの使いやすさ
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **パフォーマンス**: スムーズなドラッグ&ドロップ操作

### 機能要件

- **ローカル処理**: すべてローカルで完結
- **オフライン対応**: インターネット接続不要
- **データ保存**: お気に入りやテンプレートの保存

### メール管理

- **テンプレート管理**: メールテンプレートの管理
- **カテゴリ分類**: 適切なカテゴリ分類
- **検索機能**: 高速な検索機能
