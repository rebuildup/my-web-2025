# samuido Website (2025 Edition)

最新のWeb技術で構築された包括的なポートフォリオ兼コンテンツ管理プラットフォームです.高機能な管理ダッシュボード、3Dグラフィックスの統合、SQLiteを使用したローカルファーストなアーキテクチャを特徴としています.

## 技術スタック (Technology Stack)

- **フレームワーク**: [Next.js](https://nextjs.org) 16 (App Router)
- **言語**: TypeScript 5.9
- **UI & スタイリング**: 
  - [Tailwind CSS](https://tailwindcss.com) v4
  - [Material UI](https://mui.com/) v7
  - [Shadcn UI](https://ui.shadcn.com/) コンポーネント
- **データベース**: `bun:sqlite` (CMS用ローカルSQLite)
- **グラフィックス & アニメーション**:
  - [Three.js](https://threejs.org/) / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
  - [GSAP](https://gsap.com/)
- **Lint & フォーマット**: [Biome](https://biomejs.dev/)

## 機能 (Features)

### 公開セクション (Public Sections)
- **Portfolio** (`/portfolio`): 制作物やプロジェクトの展示.
- **Tools** (`/tools`): Webベースのツールやユーティリティ.
- **Workshop** (`/workshop`):
  - ブログ記事
  - プラグイン配布
  - ダウンロード素材
- **About** (`/about`): プロフィールとコンタクト情報.

### 管理ダッシュボード (Admin Dashboard) (`/admin`)
アプリケーションに統合された包括的なCMS機能です：
- **コンテンツ管理** (`/admin/content`): サイト内の全コンテンツに対するCRUD操作.
- **データマネージャー** (`/admin/data-manager`): データベースのメンテナンスと検査.
- **メディアライブラリ**: 画像やアセットファイルの管理.
- **Markdownエディタ**: ブログ記事やアーティクル作成専用のエディタ.
- **タグ管理**: コンテンツのタグ付け整理.
- **アクセス解析 (Analytics)**: サイト利用状況の可視化 (検討中).

## はじめ方 (Getting Started)

### 前提条件 (Prerequisites)
- Bun 1.3 以上
- Rust & Cargo (CMS API の起動に必要)
- `NEXT_PUBLIC_GA_ID` を `.env.local` に設定

### インストール (Installation)

```bash
bun install
```

### 開発サーバの起動 (Development)

**Web サイト (Next.js)**

```bash
bun run dev
```

ブラウザで [http://localhost:3010](http://localhost:3010) を開いてください.

**CMS API (Rust)**

CMS API は Rust 製で直接実行します.

```bash
# CMS API を起動
bun run dev:cms-api
```

API は [http://localhost:3001](http://localhost:3001) で動作します.

**両方を同時に起動する場合**

```bash
# Next.js + CMS API を同時に起動
bun run dev:full
```

### 停止 (Stop)

Ctrl+C でプロセスを停止してください.



## 品質保証 (Quality Assurance)

高速なLintとフォーマットのために Biome を使用しています.

```bash
bun run lint
bun run format
bun run test
```
