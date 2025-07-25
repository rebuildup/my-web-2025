# /global ルート仕様

`/global` はサイト全体で共通して使用される機能ページで構成されます。

## ページ構成

| パス              | 役割                 | 対応ファイル                |
| ----------------- | -------------------- | --------------------------- |
| `/404`            | 404エラーページ      | `00_404/page.md`            |
| `/privacy-policy` | プライバシーポリシー | `01_privacy-policy/page.md` |
| `/search`         | サイト内検索         | `02_search/page.md`         |
| `/contact`        | お問い合わせフォーム | `03_contact/page.md`        |

## 機能仕様

### 404エラーページ (00_404)

- **目的**: 存在しないページへのアクセス時の表示
- **機能**:
  - エラーメッセージ表示
  - ホームページへの導線
  - 検索機能提供

### プライバシーポリシー (01_privacy-policy)

- **目的**: 個人情報保護方針の明示
- **内容**:
  - 収集する個人情報の種類（アクセス履歴などのアナリティクスのみ）
  - Cookie使用について（ページに依存、拒否可能）
  - GoogleAnalyticsの使用について
  - 個人情報の取り扱い方針

### サイト内検索 (02_search)

- **目的**: サイト内コンテンツの検索機能
- **機能**:
  - 簡易モード: タイトルやタグからの検索
  - 詳細モード: markdownファイルの内容も含めた検索
  - 検索結果の一覧表示
- **対象**: サイトのコンテンツデータ
- **履歴**: 検索履歴の保存なし

### お問い合わせフォーム (03_contact)

- **目的**: ユーザーからの問い合わせ受付
- **機能**:
  - 必須項目: メールアドレス
  - 任意項目: 問い合わせの種類、内容
  - 送信先: rebuild.up.up(at)gmail.com (開発・技術関連)
- **スパム対策**: 日本語を含まない内容はブロック
- **自動返信**: なし

## 共通仕様

### 技術要件

- **レスポンシブ対応**: 全ページでレスポンシブデザイン
- **アクセシビリティ**: 基本的なアクセシビリティ対応
- **SEO**: 適切なメタ情報設定

### セキュリティ

- **個人情報**: 最小限の収集
- **Cookie**: 必要最小限の使用
- **スパム対策**: 日本語チェック機能

### 分析・測定

- **GoogleAnalytics**: アクセス解析
- **プライバシー保護**: 個人を特定しない範囲での分析
