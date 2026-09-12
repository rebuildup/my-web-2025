# CMS API ネイティブ開発ガイド (Linux / macOS / WSL without `wslc`)

> `docs/agent/onboarding.md` の最短セットアップに Rust ツールチェーン周りの詳細を足した派生ドキュメント. まず `onboarding.md` を通読してからこのファイルを読むことを推奨.

WSL や Docker を使わず、ホスト OS (Linux / macOS / WSL 内のディストリビューション) で直接 Rust CMS API をビルド・実行するための動線. `wslc:*` スクリプトは温存されており、Windows host で WSL container を回したいケースは今後も利用可能.

## 1. 前提条件

| 項目 | 推奨バージョン | 補足 |
| --- | --- | --- |
| Bun | `1.4.2` (`package.json#packageManager` 固定) | CI / wslc container と同一. |
| Rust | stable toolchain (`rustup` 由来) | `apps/cms-api/rust-toolchain.toml` は stable 指定. |
| SQLite | 不要 (Rust バイナリが `rusqlite` / `sqlx` を内包) | `data/contents/*.db` は Rust 側が読み書き. |
| `OPENSSL` 等のシステムライブラリ | 既定で OK | macOS は Command Line Tools, Debian 系は `build-essential` があれば十分. |

### Rust ツールチェーンのインストール

`docs/archive/deploy-vm.md` §2.5 (旧 VM デプロイ手順) の Rust toolchain install コマンドをローカル用にそのまま使う:

```bash
# Linux / macOS / WSL 共通
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
source "$HOME/.cargo/env"

# 動作確認
rustc --version
cargo --version
```

### WSL 固有の注意

WSL ディストリビューションを直接操作している場合は `wslc:*` を使わずこのドキュメントの手順でよい. Windows host の PowerShell から `wslc:run` を立てる動線は引き続き有効で、用途によって使い分ける. 混在させる必要はない.

## 2. プリビルド (推奨)

```bash
bun run cms-api:build
```

これは内部で次の cargo 呼び出しをするラッパー:

```
cargo build --release --locked --manifest-path apps/cms-api/Cargo.toml
```

`--release --locked` の組み合わせは `apps/cms-api/Dockerfile` (line 19) と完全一致し、本番コンテナのアーティファクトと bit 互換のバイナリが生成される. 成果物は `apps/cms-api/target/release/cms-api` (Windows ネイティブの場合は `cms-api.exe`).

```bash
test -x apps/cms-api/target/release/cms-api && echo "binary present"
```

## 3. CMS API の起動

### 3.1 プリビルド済みの場合 (推奨)

```bash
bun run dev:cms-api
```

`scripts/dev-cms-api.ts` は次の優先順位で動作する:

1. `apps/cms-api/target/release/cms-api` (または Windows host の `cms-api.exe`) が存在 → それを直接 `spawn` で起動.
2. 存在しない → `cargo run` にフォールバック (既存の挙動).

どちらの経路でも `CMS_API_HOST` / `CMS_API_PORT` / `CMS_API_DATA_DIR` / `CMS_API_CONTENT_DATA_DIR` の env-var は同じデフォルトで読み込まれる. `data/contents/*.db` 解決の SQLITE_CANTOPEN(14) 対策 (`<repoRoot>/data/contents` への上書き) は従来通り機能する.

### 3.2 フルスタック同時起動

```bash
bun run dev:full
```

Next.js dev server (port 3010) と CMS API (port 3001) を `scripts/dev-with-cms.ts` が `-/health` を 120 秒ポーリングしてから立ち上げる. 既存の挙動.

### 3.3 直接バイナリ実行 (上級者向け)

```bash
# env-var を明示指定して直接起動
CMS_API_HOST=127.0.0.1 \
CMS_API_PORT=3001 \
CMS_API_DATA_DIR=./data/db \
CMS_API_CONTENT_DATA_DIR="$(pwd)/data/contents" \
./apps/cms-api/target/release/cms-api
```

PM2 / launchd で運用する場合の基本形. Linux VM / VPS での foreground / 1 プロセスモデルも同設定.

## 4. 環境変数

| 変数 | 既定 | 用途 |
| --- | --- | --- |
| `CMS_API_HOST` | `127.0.0.1` | bind するホスト. Nginx や Cloudflare Tunnels 越しに公開する場合は `0.0.0.0` を指定. |
| `CMS_API_PORT` | `3001` | listen port. |
| `CMS_API_DATA_DIR` | `./data/db` | 統合 SQLite (gitignore 配下) の置き場所. 開発時は変更不要. |
| `CMS_API_CONTENT_DATA_DIR` | `<repoRoot>/data/contents` (自動解決) | per-content SQLite の置き場所. `dev-cms-api` の SQLITE_CANTOPEN(14) 対策で明示上書きされる. |

`.env` 自体の取得 / 配置は `docs/agent/env-management.md` を参照. clone 方法 (WSL / native / Windows host) に関わらず `cp .env.example .env` が必要.

## 5. 検証

`docs/agent/quality-security.md` (および `.claude/skills/deploy-check/SKILL.md`) に沿った gate をローカルで回す:

```bash
# Bun 側
bun install --frozen-lockfile
bun run type-check
bun run lint
bun x knip
bun run test

# Rust 側
( cd apps/cms-api && cargo fmt --all -- --check )
( cd apps/cms-api && cargo clippy --all-targets -- -D warnings )
( cd apps/cms-api && cargo test --all-targets )
```

最初の FAIL で停止. `--no-verify` や lint suppression は使わない.

## 6. よくある質問

### Q. ソースを編集したら自動で再ビルドされる?

はい. `bun run dev:cms-api` は起動時に release バイナリ (`apps/cms-api/target/release/cms-api`) と `apps/cms-api/` 配下のソース (`target/` / `.git/` を除外) の mtime を比較し、いずれかのソースが新しい場合は `[dev-cms-api] source newer than release binary, falling back to cargo run` をログして `cargo run` に切り替える. したがってソース反復開発のたびに `bun run cms-api:build` を再実行する必要はない.

プリビルド済みバイナリは、リリース相当の cargo フラグ (`--release --locked`) で動作確認したい・ベンチを取りたいといったときに活かすユースケース.

### Q. macOS でクロスコンパイルしたバイナリを CI で流せますか?

cargo の target triplet が host OS に固定されるため不可. macOS ↔ Linux を行き来する場合はそれぞれでビルドする. WSL ↔ Windows host のクロスも不可 (`wslc` で別ディストリビューションを使う構成を維持).

### Q. 既存の `wslc:*` 動線とどちらを使うべき?

- **Windows host + WSL container でコンテナ型開発が好み** → 従来通り `wslc:pull` / `wslc:run`.
- **ネイティブ Linux / macOS / WSL dist で直接 cargo** → このドキュメントの `cms-api:build` + `dev:cms-api`.
- **本番 VM (Linux) で systemd / PM2 から cargo バイナリを実行** → `docs/archive/deploy-vm.md` §2.5 経由の rustup + release バイナリ運用 (historical), これは本ドキュメントと同一.

両者は共存可能で, チームが混在していても README と `package.json#scripts` を見ればどちらかを選べる.

## 7. 関連ドキュメント

- `docs/agent/onboarding.md` — 最短セットアップ (Bun 導入 → `bun run dev`).
- `docs/agent/env-management.md` — `.env*` の扱い (clone 方法によらず `cp .env.example .env` が必要).
- `docs/archive/deploy-vm.md` §2.5 — Rust toolchain install の本番 VM 用レシピ (ローカル流用可, historical).
- `docs/06_deploy.md` — 現行の Cloudflare デプロイ手順 (canonical).
- `.claude/skills/deploy-check/SKILL.md` — リリース前検証 gate.
- `AGENTS.md` — プロジェクト全体の境界 / SoT.
