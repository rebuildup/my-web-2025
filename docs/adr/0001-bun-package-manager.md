# ADR-0001: パッケージマネージャに Bun を採用

## ステータス
Accepted (2025-12 時点, 2026-08 再確認)

## コンテキスト
Next.js 16 + React 19 + TypeScript 7 の本番デプロイ(GCP VM, pm2)で lockfile 厳密運用と高速 install が必要. ローカル開発と CI が一貫したツールで動くことが望まれる.

## 検討した選択肢
- A: **Bun 1.3.x** (`packageManager` フィールドで pin).
- B: npm 10.
- C: pnpm 9.
- D: Yarn 4 (Berry).

## 決定
**A を採用.** 根拠:
- install / script 実行速度. Next 16 の dev / build 起動時間.
- `bun --bun next ...` で Bun ランタイムを Next に注入できる.
- `bun:sqlite` を Rust CMS と並ぶ SQLite レイヤで活用できる(legacy / dev).
- `packageManager` フィールドで Corepack 的に pin できる.

## 影響
- プラス: lockfile 単一 (`bun.lock`), install 高速, `bun:sqlite` を dev / legacy 経路で利用可能.
- マイナス: 一部ネイティブモジュール (`better-sqlite3`) は Bun runtime で `bun rebuild` が必要なケースあり. ただし本プロジェクトは Rust CMS API へ移行したため本番経路では問題なし.
- トレードオフ: CI runner / VM にも Bun が必要. 採用 OS のセットアップ手順 (`docs/06_deploy.md`) で明示.

## 再評価条件
- Bun が archived / major 停滞した場合.
- 本番デプロイの deploy script が Bun install 失敗を運用で解決できなくなった場合.
- better-sqlite3 など native dep が Bun で解決不能になり、回避策が複数同時に要る場合.
