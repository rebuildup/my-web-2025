# ADR-0005: CMS API を Rust 製サービスとして分離

## ステータス
Accepted

## コンテキスト
Next.js (Node) 側の read path を N ファイル SQLite スキャンで構成するとビルド時間とレスポンスタイムが悪化する. 一方で公開ページは静的エクスポート (`out/`) するので、サーバ処理は管理画面とメディア配信に限定したい.

## 検討した選択肢
- A: **Rust (axum / actix-web 系) を `apps/cms-api/` に分離** (port 3001).
- B: Next.js API Routes に Node 実装を残し SQLite を Node ドライバで開く.
- C: Edge / Cloudflare Workers + D1.

## 決定
**A を採用.** 根拠:
- SQLite アクセスが高速かつ型安全.
- 静的エクスポートと admin / メディア API の責務分離が明確.
- デプロイ: 静的サイト + Rust バイナリ + nginx リバースプロキシ (`docs/06_deploy.md`).
- Next 側の read helper (`src/lib/cms-api/`) が静的ビルド時に必要データだけ取得し埋め込む.

## 影響
- プラス: ビルド時のみ API が必要. 本番静的配信は `out/` のみで完結.
- マイナス: バイナリサイズ, Rust toolchain が CI / VM に必要.
- トレードオフ: `apps/cms-api/target/` は git ignore. `Cargo.lock` は ignore (バイナリ単体リリースのため).

## 再評価条件
- Rust toolchain のセットアップが運用負担になった場合.
- メディア配信量 / API レイテンシが Node 実装で十分になった場合.
- ホスティングを Cloudflare 等の Edge に完全移行する場合.
