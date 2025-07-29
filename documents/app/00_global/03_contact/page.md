# お問い合わせページ (/contact)

## 目的

ユーザーからの質問・依頼を受け付け、適切な対応を行う。

## 主な要素

- お問い合わせフォーム
- バリデーション機能
- スパム対策
- 送信確認機能

## 機能

### お問い合わせフォーム

- **必須項目**:
  - 名前 (必須)
  - メールアドレス (必須)
  - 件名 (必須)
  - お問い合わせ内容 (必須)
- **任意項目**:
  - 会社名・組織名
  - 電話番号
  - 希望連絡方法
- **カテゴリー選択**:
  - 開発依頼
  - 映像制作依頼
  - プラグイン・ツールについて
  - その他

### バリデーション機能

- **名前**: 1文字以上、100文字以内
- **メールアドレス**: 有効なメールアドレス形式
- **件名**: 1文字以上、200文字以内
- **お問い合わせ内容**: 10文字以上、2000文字以内
- **リアルタイムバリデーション**: 入力中にエラー表示

### スパム対策

- **reCAPTCHA v3**: Google reCAPTCHAによる自動スパム検出
- **日本語フィルター**: 日本語以外の言語での送信をブロック
- **送信制限**: 同一IPからの過度な送信を制限
- **内容チェック**: スパムらしい内容の自動検出

### 送信確認機能

- **送信前確認**: 入力内容の確認画面
- **送信完了**: 送信完了の確認メッセージ
- **自動返信**: 送信者への自動返信メール
- **管理通知**: 管理者への通知メール

## データ

- `FormConfig` id: `contact-form`
- `customFields`: `name`, `email`, `subject`, `content`, `category`

## Meta情報

### SEO

- **title**: "Contact - samuido | お問い合わせ"
- **description**: "Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問、その他お問い合わせはこちらから。"
- **keywords**: "お問い合わせ, ご依頼, 質問, 連絡先, Webデザイン, 開発依頼"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/contact"

### Open Graph

- **og:title**: "Contact - samuido | お問い合わせ"
- **og:description**: "Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問、その他お問い合わせはこちらから。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/contact"
- **og:image**: "https://yusuke-kim.com/contact-og-image.png"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Contact - samuido | お問い合わせ"
- **twitter:description**: "Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問、その他お問い合わせはこちらから。"
- **twitter:image**: "https://yusuke-kim.com/contact-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "samuido Contact",
  "description": "お問い合わせフォーム",
  "url": "https://yusuke-kim.com/contact",
  "mainEntity": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "361do.sleep(at)gmail.com",
    "availableLanguage": "Japanese"
  },
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  }
}
```

## 技術要件

### フォーム機能

- **レスポンシブ対応**: 各デバイスでの入力しやすさ
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **エラーハンドリング**: 適切なエラーメッセージ表示

### セキュリティ

- **CSRF対策**: CSRFトークンによる不正送信防止
- **XSS対策**: 入力値の適切なエスケープ
- **SQLインジェクション対策**: プリペアドステートメント使用

### メール機能

- **送信確認**: 送信者の入力内容確認
- **自動返信**: 送信者への自動返信メール
- **管理通知**: 管理者への通知メール
- **エラー処理**: 送信失敗時の適切な処理
