# Portfolio System Documentation

## 概要

Next.js 16 (App Router, standalone) + pnpm + PM2 で動く現行ポートフォリオサイトの技術ドキュメント.データはリポジトリ内の `data/contents/*.db` をビルド時にスタンドアロン成果物へ同梱し、外部DBは不要.

## 目次

1. [システム概要](#システム概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [コンポーネント構成](#コンポーネント構成)
4. [データ管理システム](#データ管理システム)
5. [プレイグラウンドシステム](#プレイグラウンドシステム)
6. [WebGL実験システム](#webgl実験システム)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [保守・運用ガイド](#保守運用ガイド)
9. [トラブルシューティング](#トラブルシューティング)
10. [開発ガイド](#開発ガイド)

## システム概要

### 実装カバレッジ

- ポートフォリオトップ `/portfolio`
- ギャラリー群 `/portfolio/gallery/{all,develop,video,video&design}`
- 動的詳細 `/portfolio/[slug]`
- カテゴリ詳細 `/portfolio/detail/*`
- Playground / Tools（ProtoType 同梱、`pnpm proto:sync` で更新）
- 管理・データ系 API（開発環境限定の管理ルートを含む）
- SEO/OGP メタデータ生成、サイトマップ

### 技術スタック

- フレームワーク: Next.js 16 (App Router, standalone 出力)
- 言語/ツール: TypeScript 5.9, pnpm 10, Biome (lint/format)
- スタイリング: Tailwind CSS v4 + Chakra UI / MUI 併用
- メディア/3D: Three.js, Pixi.js, @ffmpeg/ffmpeg, GSAP
- テスト: Jest + Testing Library（E2E は未同梱／必要に応じて追加）
- 運用: PM2 (Node 20) 常駐、データは同梱 SQLite
## アーキテクチャ

### システム構成図

```
Portfolio System
├── Data Laye
```
