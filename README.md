# samuido Website (2025 Edition)

最新のWeb技術で構築された包括的なポートフォリオ兼コンテンツ管理プラットフォームです。高機能な管理ダッシュボード、3Dグラフィックスの統合、SQLiteを使用したローカルファーストなアーキテクチャを特徴としています。

## 技術スタック (Technology Stack)

- **フレームワーク**: [Next.js](https://nextjs.org) 16 (App Router)
- **言語**: TypeScript 5.9
- **UI & スタイリング**: 
  - [Tailwind CSS](https://tailwindcss.com) v4
  - [Material UI](https://mui.com/) v7
  - [Shadcn UI](https://ui.shadcn.com/) コンポーネント
- **データベース**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (CMS用ローカルSQLite)
- **グラフィックス & アニメーション**:
  - [Three.js](https://threejs.org/) / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
  - [GSAP](https://gsap.com/)
- **Lint & フォーマット**: [Biome](https://biomejs.dev/)

## 機能 (Features)

### 公開セクション (Public Sections)
- **Portfolio** (`/portfolio`): 制作物やプロジェクトの展示。
- **Tools** (`/tools`): Webベースのツールやユーティリティ。
- **Workshop** (`/workshop`):
  - ブログ記事
  - プラグイン配布
  - ダウンロード素材
- **About** (`/about`): プロフィールとコンタクト情報。

### 管理ダッシュボード (Admin Dashboard) (`/admin`)
アプリケーションに統合された包括的なCMS機能です：
- **コンテンツ管理** (`/admin/content`): サイト内の全コンテンツに対するCRUD操作。
- **データマネージャー** (`/admin/data-manager`): データベースのメンテナンスと検査。
- **メディアライブラリ**: 画像やアセットファイルの管理。
- **Markdownエディタ**: ブログ記事やアーティクル作成専用のエディタ。
- **タグ管理**: コンテンツのタグ付け整理。
- **アクセス解析 (Analytics)**: サイト利用状況の可視化 (検討中)。

## はじめ方 (Getting Started)

### 前提条件 (Prerequisites)
- Node.js (最新のLTS推奨)
- pnpm (v10以上)

### インストール (Installation)

```bash
pnpm install
```

### 開発サーバの起動 (Development)

TurboPackを使用して高速なHMRで開発サーバーを起動します：

```bash
pnpm dev
# または
npm run dev
```

ブラウザで [http://localhost:3010](http://localhost:3010) を開いてください。



## 品質保証 (Quality Assurance)

高速なLintとフォーマットのために Biome を使用しています。

```bash
# Lintエラーのチェック
pnpm lint

# コードのフォーマット
pnpm format

# テストの実行
pnpm test
```
