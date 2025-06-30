# テスト設計 & 実装進捗 (Progress)

> `testingStrategy` と実装状況を追跡

## 1. テスト戦略概要

| 種別        | ツール                 | 目標カバレッジ          | 備考                             |
| ----------- | ---------------------- | ----------------------- | -------------------------------- |
| Unit        | Jest + RTL             | 80% 行カバレッジ        | `src/components`, `src/lib`      |
| Integration | Playwright             | 主要 API & ルーティング | `navigation`, `forms`, `api`     |
| E2E         | Playwright             | 5 ユースケース          | Portfolio 閲覧 / ツール使用 など |
| Visual      | Playwright screenshots | 差分 < 0.1              | 全ページ + 主要コンポ            |
| Security    | npm audit / CodeQL     | Critical 0 件           | PR ごと実行                      |

## 2. 実装進捗

| モジュール                | テスト実装 | カバレッジ |
| ------------------------- | ---------- | ---------- |
| UI Components             | ✅ 完了    | 78%        |
| Layout Components         | 🔄 進行中  | 45%        |
| Utils (date, string)      | ✅ 完了    | 92%        |
| API Routes                | ⏳ 未着手  | -          |
| Tools (ColorPalette etc.) | ⏳ 未着手  | -          |

## 3. 自動化設定

- GitHub Actions `test` で Jest & Playwright を CI 実行
- `onPush: main` → Unit + Integration
- `onPR` → Unit + Integration + E2E + Visual

## 4. 実装要件チェックリスト

### 4.1 基盤・インフラ要件

- [ ] TypeScript型定義 (`src/types/`) - ContentItem, SiteConfig, FormConfig等
- [ ] パフォーマンス最適化ユーティリティ (`src/lib/utils/performance.ts`)
- [ ] 画像最適化ラッパー (`optimizeImage`)
- [ ] メモリリーク防止 (Three.js用)
- [ ] 動的インポート設定 (重いコンポーネント用)

### 4.2 デザインシステム

- [ ] Adobe Fonts設定 (Neue Haas Grotesk Display, Zen Kaku Gothic New)
- [ ] Google Fonts設定 (Noto Sans JP, Shippori Antique B1)
- [ ] カラーテーマ (原色の青 #0000ff, ダークグレー #222222)
- [ ] ファビコン (青い円形SVGアイコン)
- [ ] TailwindCSS v4設定

### 4.3 共通UIコンポーネント (`src/components/ui/`)

- [ ] Button (primary, secondary, ghost variants)
- [ ] Card (title, image props)
- [ ] Modal (open, onClose)
- [ ] Input (label, error)
- [ ] Select (options, value)
- [ ] Toast (type, message)

### 4.4 レイアウトコンポーネント (`src/components/layout/`)

- [ ] Header (グローバルナビ + ロゴ)
- [ ] Footer (サイト情報 + SNSリンク)
- [ ] Navigation (サイドバー/ドロワー切替)
- [ ] Sidebar (Admin/Docs用)

### 4.5 ページ実装

- [ ] メインページ (`/`) - サイトマップ・カテゴリカード
- [ ] About (`/about`) - プロフィール概要・サブページナビ
- [ ] Portfolio (`/portfolio`) - ギャラリー・フィルター・検索
- [ ] Tools (`/tools`) - ツール一覧・カテゴリタブ
- [ ] Workshop (`/workshop`) - プラグイン・ダウンロード・ブログ
- [ ] Contact (`/contact`) - フォーム・reCAPTCHA

### 4.6 専用コンポーネント

- [ ] Portfolio: GalleryCard, GalleryGrid, DetailView, FilterBar, SortDropdown
- [ ] Tools: ColorPalette, QRGenerator, EstimateCalculator
- [ ] Admin: ContentEditor, MarkdownEditor, FileUploader, ContentPreview
- [ ] Shared: SEOHead, SocialShare, Timeline, QRCode, LoadingSpinner

### 4.7 機能要件

- [ ] 検索機能 (全ページ共通)
- [ ] フィルター・ソート機能 (Portfolio, Tools, Workshop)
- [ ] フォームバリデーション (Contact)
- [ ] 画像最適化・遅延読み込み
- [ ] SEO最適化 (メタタグ, 構造化データ)
- [ ] アクセシビリティ対応 (WCAG 2.1 AA)

### 4.8 パフォーマンス要件

- [ ] Lighthouse Overall 90+
- [ ] LCP ≤ 2.5s
- [ ] FID (INP) ≤ 100ms
- [ ] CLS ≤ 0.1
- [ ] 初期JSバンドル ≤ 1MB

### 4.9 セキュリティ要件

- [ ] CSP設定
- [ ] HSTS設定
- [ ] Rate Limit実装
- [ ] CSRFトークン
- [ ] XSS対策 (DOMPurify)

### 4.10 デプロイ・CI/CD

- [ ] GitHub Actions設定
- [ ] GCP VM設定
- [ ] Apache設定
- [ ] SSL証明書設定
- [ ] バックアップ設定
- [ ] 監視・ログ設定

### 4.11 法務・コンプライアンス

- [ ] プライバシーポリシー
- [ ] 利用規約
- [ ] Cookieポリシー
- [ ] GDPR対応
- [ ] 日本個人情報保護法対応

## 5. 次ステップ (2025-07 Sprint)

1. API Routes のユニット & 統合テストを追加 (目標 70%)
2. Tools コンポーネントの E2E テスト 3 シナリオ
3. Visual Regression ベースライン更新
4. レポートを `docs/metrics/2025-07.md` に自動保存

## 6. 現在の実装状況

### 完了済み

- ✅ Next.js 15.3.4 セットアップ
- ✅ React 19.0.0 セットアップ
- ✅ TypeScript 5 セットアップ
- ✅ TailwindCSS v4 セットアップ
- ✅ ESLint設定
- ✅ 基本ページ構造 (`src/app/`)

### 進行中

- 🔄 パッケージインストール (lucide-react, framer-motion, three, pixi.js, axios, date-fns, prettier, jest, @playwright/test, lhci)

### 未着手

- ⏳ 型定義ファイル作成
- ⏳ 共通UIコンポーネント実装
- ⏳ レイアウトコンポーネント実装
- ⏳ 各ページコンポーネント実装
- ⏳ ツール機能実装
- ⏳ テスト実装
- ⏳ デプロイ設定

---

> **更新ルール**: Sprint 終了ごとにこのファイルの進捗テーブルを更新し、カバレッジを記録
