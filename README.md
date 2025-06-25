# 個人 Web サイト (my-web-2025)

samuido（木村友亮）の個人ポートフォリオサイトプロジェクト

## 🌐 サイト概要

**URL**: `yusuke-kim.com`  
**技術スタック**: Next.js 15 + TailwindCSS v4 + TypeScript  
**開発期間**: 2025 年 1 月〜

### 主要機能

- **About**: プロフィール・デジタル名刺・リンクマップ
- **Portfolio**: 作品ギャラリー・フィルタリング・詳細ページ
- **Workshop**: プラグイン販売・ブログ・ダウンロード管理
- **Tools**: 依頼費用計算機・QR コード生成器・実用ツール群

## 🚀 クイックスタート

### 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで確認
open http://localhost:3000
```

### ビルド・デプロイ

```bash
# 本番ビルド
npm run build

# 静的エクスポート
npm run export

# Vercel デプロイ
npm run deploy
```

## 📚 プロジェクト設計書

詳細な設計ドキュメントは [`documents/`](./documents/) フォルダに格納されています：

### 📁 ドキュメント構成

- **[01-project-overview/](./documents/01-project-overview/)** - プロジェクト基本情報・実装準備
- **[02-architecture/](./documents/02-architecture/)** - データ構造・API 設計
- **[03-features/](./documents/03-features/)** - 各機能の詳細仕様
- **[04-development/](./documents/04-development/)** - 開発フェーズ計画
- **[05-operations/](./documents/05-operations/)** - 運用・災害復旧
- **[06-compliance/](./documents/06-compliance/)** - アクセシビリティ・法的対応
- **[07-design/](./documents/07-design/)** - デザインシステム・コンポーネント

### 📖 重要ドキュメント

| ファイル                                                            | 内容                                   |
| ------------------------------------------------------------------- | -------------------------------------- |
| [基本情報](./documents/01-project-overview/basic-info.md)           | サイト概要・デザイン思想・技術スタック |
| [実装準備](./documents/01-project-overview/implementation-ready.md) | すぐに実装可能な機能一覧               |
| [データ構造](./documents/02-architecture/data-structure.md)         | TypeScript 型定義・JSON 管理           |
| [フェーズ計画](./documents/04-development/phase-planning.md)        | 開発ロードマップ・マイルストーン       |

> **注意**: `docoments/` フォルダは誤字のため、正式なドキュメントは `documents/` フォルダを参照してください。

## 🛠️ 技術仕様

### フロントエンド

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS v4
- **Language**: TypeScript
- **UI Components**: カスタムコンポーネントライブラリ

### データ管理

- **CMS**: JSON ベースのヘッドレス CMS
- **画像最適化**: Next.js Image コンポーネント
- **SEO**: 動的メタタグ生成

### デプロイ・インフラ

- **Hosting**: GCP (本番) / Vercel (開発)
- **CDN**: Cloudflare
- **SSL**: Let's Encrypt

## 📊 開発進捗

| フェーズ                   | ステータス | 期間   | 完了度 |
| -------------------------- | ---------- | ------ | ------ |
| Phase 1: 基盤構築          | 🔄 進行中  | 2 週間 | 20%    |
| Phase 2: About & Portfolio | ⏳ 待機中  | 3 週間 | 0%     |
| Phase 3: データ管理        | ⏳ 待機中  | 2 週間 | 0%     |
| Phase 4: 基本ツール        | ⏳ 待機中  | 3 週間 | 0%     |

詳細な進捗は [開発管理](./documents/04-development/) を参照してください。

## 📝 開発ルール

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

## 📧 連絡先

**開発者**: samuido (木村友亮)  
**Email**: rebuild.up.up@gmail.com  
**GitHub**: [@361do_sleep](https://github.com/samuido)

---

**Last Updated**: 2025-01-01  
**License**: All Rights Reserved
