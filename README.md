# samuido Website (2025 Edition)

最新のWeb技術で構築された包括的なポートフォリオ兼コンテンツ管理プラットフォームです.高機能な管理ダッシュボード、3Dグラフィックスの統合、SQLiteを使用したローカルファーストなアーキテクチャを特徴としています.

## 技術スタック (Technology Stack)

- **フレームワーク**: [Next.js](https://nextjs.org) 16 (App Router, `output: "export"` 静的エクスポート)
- **言語**: TypeScript 7
- **UI & スタイリング**:
  - [Tailwind CSS](https://tailwindcss.com) v4
  - [Material UI](https://mui.com/) v9
  - [Chakra UI](https://chakra-ui.com/) v3
  - Radix UI ベースの共通 UI コンポーネント
- **CMS バックエンド**: Rust (axum + sqlx) on port 3001 (`apps/cms-api/`)
- **データベース**: SQLite (`bun:sqlite` 読み取り, Rust sqlx で読み書き, 1 アイテム 1 DB `data/contents/content-{id}.db`)
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
bun i
```

### 開発サーバの起動 (Development)

**Web サイト (Next.js)**

```bash
bun run dev
```

ブラウザで [http://localhost:3010](http://localhost:3010) を開いてください.

**CMS API (Rust)**

CMS API は Rust 製です. Linux / macOS などのネイティブ環境では、リリースビルドをプリビルドして直接バイナリ実行するのが推奨導線です. Windows / WSL 環境では従来通り `wslc:*` ヘルパーも利用可能です.

```bash
# ネイティブ (Linux / macOS):
# 1. リリースビルドをプリビルド (apps/cms-api/Dockerfile と同じ cargo フラグ)
bun run cms-api:build
# 2. CMS API を起動 (プリビルドがあれば直接実行、なければ cargo run にフォールバック)
bun run dev:cms-api
```

API は [http://localhost:3001](http://localhost:3001) で動作します.

詳しい Rust ツールチェーンのセットアップ手順は [`docs/agent/cms-native-dev.md`](docs/agent/cms-native-dev.md) を参照してください.

**両方を同時に起動する場合**

```bash
# Next.js + CMS API を同時に起動
bun run dev:full
```

> Windows / WSL で `wslc:pull` / `wslc:run` を使う導線は削除せず温存しています. 詳細は `package.json#scripts` 内の `wslc:*` を参照.

### 停止 (Stop)

Ctrl+C でプロセスを停止してください.



## 品質保証 (Quality Assurance)

高速なLintとフォーマットのために Biome を使用しています.

```bash
bun run lint
bun run format
bun run test
```
