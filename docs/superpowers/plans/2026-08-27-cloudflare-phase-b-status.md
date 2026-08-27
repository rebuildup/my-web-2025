# Cloudflare 移行 — Phase B 完了ステータス

- **基準プラン**: `docs/superpowers/plans/2026-08-26-cloudflare-deploy.md`
- **基準スペック**: `docs/superpowers/specs/2026-08-26-cloudflare-deploy-design.md`
- **根拠 ADR**: `docs/adr/0014-cloudflare-deploy.md`
- **ステータス時点**: 2026-08-27
- **ブランチ**: `develop`
- **最終コミット**: `165c6417 chore(lint): validation gate green`

## 1. 完了済み (Phase A: docs + Phase B: code)

### Phase A: Foundation (Tasks 1-4) — 完了

| Task | 内容 | コミット |
|------|------|----------|
| 1 | develop ブランチ + plan/spec 配置 | pre-existing |
| 2 | ADR-0014 (Cloudflare deploy 決定) | `106f19d3` |
| 3 | AGENTS.md §1/§9/§14 を Cloudflare 時代に更新 | `cee5e8e4` + `e19710f5` + `77e7db9d` |
| 4 | `.env*.example` から GCP_* 削除, wrangler secret 手順 | `cee5e8e4` |
| 補 | Cloudflare 移行ステータス doc + index エントリ | `d3df8467` |

### Phase A: 手動 Cloudflare アカウント準備 (Tasks 5-8) — **未着手 (ユーザー手動)**

Cloudflare アカウント/契約/R2 バケット/Pages 接続は人間の Dashboard 操作が必要なため、ここでは触れていない。下記「手動作業リスト」を参照。

### Phase B: Implementation (Tasks 9-20) — 完了

| Task | 内容 | コミット |
|------|------|----------|
| 9 | Cargo.toml に `aws-sdk-s3` / `aws-config` / `aws-credential-types` / `anyhow` 追加 | Task 9 commit |
| 10 | `apps/cms-api/src/sync/mod.rs` スケルトン + 型 (`R2Config`, `SyncState`, `R2_KEY_PREFIX`) | Task 10 commit |
| 11 | `hydrate()` 実装 + 5 単体テスト | Task 11 commit |
| 12 | `write_back()` + `walk_dir()` + 残りテスト | Task 12 commit |
| 13 | main.rs に R2 client 構築 + boot 時 hydrate + 30s ticker + `#[cfg(unix)]` SIGTERM | Task 13 commit |
| 14 | Container `Dockerfile` (rust:1.83-bookworm) + `docker-entrypoint.sh` + `.dockerignore` (assets/ を COPY) | Task 14 commit |
| 15 | `workers/router` skeleton (`package.json` / `wrangler.toml` / `src/index.ts`) — SUBDOMAIN_REDIRECT, STATIC_API_PATHS, fetch handler, cron warm, `cachedProxy` | Task 15 commit |
| 16 | `workers/router` vitest 設定 + 20 routing テスト (`SUBDOMAIN_REDIRECT`, `STATIC_API_PATHS`) | Task 16 commit |
| 17 | `scripts/build-cloudflare.ts` (submodule sync → install → check-env → next build → copy-content-data → cargo release build) | `bc137725` |
| 18 | `scripts/check-r2-sync.ts` (`--snapshot` / `--verify` against R2) | `3aeef7c2` |
| 19 | `docker-compose.minio.yml` (minio + minio-init, `cms-data-test` バケット自動作成) | `ba564dca` |
| 20 | `tests/integration/sync.test.ts` — `INTEGRATION=1` opt-in smoke (bun:test) | `437216d5` |

### Phase B: Validation Gate — green

`commit 165c6417` で全 canonical gate green を確認:

| Gate | 結果 |
|------|------|
| `bun run type-check` (root) | ✅ 0 error |
| `bun run type-check` (workers/router) | ✅ 0 error |
| `bun run lint` (biome) | ✅ 0 error (1 info: schema version は pre-existing drift) |
| `bun x knip` | ✅ exit 0 |
| `bun run test` (root) | ✅ 126 pass / 1 skip / 0 fail |
| `bun run test` (workers/router) | ✅ 20 pass |
| `cargo fmt --manifest-path apps/cms-api/Cargo.toml --check` | ✅ exit 0 |
| `cargo clippy --manifest-path apps/cms-api/Cargo.toml --all-targets -- -D warnings` | ✅ 0 warning |
| `cargo test --manifest-path apps/cms-api/Cargo.toml --all-targets` | ✅ 19 pass |
| `bun run build` (check-env → next build → copy-content-data) | ✅ 71 content DB 配布, .next 生成 |

## 2. 残作業 — ユーザー手動 (Phase A 後半 + Phase C + Phase D)

migration skill (`Stop after requested stage passes; do not perform later destructive contraction implicitly.`) の方針に従い、Claude はここで停止する。以下の作業は Cloudflare Dashboard / GitHub / GCP Console に対する **破壊的/対外的作用** を含むため、明示的なユーザー許可なしに自動で進めない。

### Phase A 後半 — Cloudflare アカウント準備 (Task 5-8)

すべて手動 Dashboard 操作。Claude は補助のみ可能。

- [ ] **Task 5**: Cloudflare アカウント作成 + Workers Paid 契約 + Account ID 取得
- [ ] **Task 6**: R2 バケット作成 (`cms-data` prod / `cms-data-dev` preview) + API token 発行
- [ ] **Task 7**: 現 `data/contents/*.db` 71 ファイルを R2 `cms-data/contents/` へ初回ミラー (`aws s3api` で `--endpoint-url $R2_ENDPOINT --bucket cms-data sync` 等)
- [ ] **Task 8**: Cloudflare Pages に GitHub リポ接続 + `build:cloudflare` をビルドコマンドに設定 + 初回 staging build 確認 + Bun 1.3.10 利用可否確認

### Phase C: Cutover (Task 21-29) — **明示許可なしでは着手しない**

- [ ] Task 21: Pages project settings で build command を `bun run build:cloudflare` に更新 + staging ビルド確認
- [ ] Task 22: Workers router + Container を staging にデプロイ (`wrangler deploy -c workers/router/wrangler.toml`) + Container hydration 確認 + カスタムサブドメイン紐付け
- [ ] Task 23: mcp__playwright__ で staging E2E smoke (portfolio / search API / subdomain redirect / admin auth wall / Container warm)
- [ ] Task 24: Lighthouse audit on staging
- [ ] Task 25: PR develop → master
- [ ] Task 26: Production deploy via Pages Git Integration
- [ ] Task 27: **DNS スイッチ** (apex + 7 サブドメインを GCP → Cloudflare) — **rollback path 要確認**
- [ ] Task 28: 24h smoke + alerting 設定
- [ ] Task 29: `docs/06_deploy.md` を Cloudflare 時代に書き換え

### Phase D: Decommission (Task 30-35) — **明示許可なしでは着手しない**

- [ ] Task 30: GCP VM を stop (削除はしない) + snapshot 作成 + 削除スケジュール
- [ ] Task 31: `.github/workflows/deploy.yml` / `test-ssh.yml` 削除
- [ ] Task 32: GCP_* GitHub Secrets 削除
- [ ] Task 33: ADR-0006 を "Superseded by ADR-0014" に更新
- [ ] Task 34: 最終コスト検証 (Cloudflare 実績 vs 旧 GCP 月額)
- [ ] Task 35: 最終 canonical gate

## 3. 既知の前提・制約

- **1 item 1 DB 不変条件は保存**: `data/contents/*.db` 71 ファイルは Container boot 時に R2 から hydrate され、30s ごとに write-back される。`max_instances = 1` による race protection 付き。
- **コンテナインスタンスタイプ**: lite (scale-to-zero) 固定。warm-up は Workers scheduled cron (`*/5 * * * *`) で 1 分以内に張る。
- **wrangler 3.114.17 ピン**: `[[containers]]` 配列バインディングは wrangler 3.78+ 必須。
- **cargo clippy `-D warnings`**: CI ゲートで strict。
- **既存 AGENTS.md §12 (既存変更の保護)** により、本 Phase B 作業中も `.gitignore` / `biome.json` / `next.config.ts` / `package.json` / `public/data/stats/search-stats.json` / `bun.lock` / `tsconfig.json` の pre-existing 変更と untracked `docs/superpowers/{plans,specs}/2026-08-25-git-submodule-extraction-*` には一切触れなかった。
- **Bun 1.3.10 固定**: `packageManager` フィールドで pin 済み。
- **vitest-pool-workers は採用せず**: 旧 API が `[[containers]]` をパースできず、新 API は Vitest 4 必須で破壊的。routing ルールのみの純粋ユニットテストなので plain vitest で十分と判定。

## 4. 次にユーザーへ依頼したい最初のアクション

Phase C を開始する前に、以下 4 つの準備 (Phase A 後半) を完了してほしい:

1. Cloudflare アカウント + Workers Paid
2. R2 バケット (`cms-data`, `cms-data-dev`)
3. R2 API token
4. `data/contents/*.db` 71 ファイルの R2 初回ミラー

これらが揃った状態で「Phase C を進めて」と明示的に指示があれば、Task 21 から順に進める。DNS スイッチ (Task 27) は GCP → Cloudflare の **destructive contraction** にあたるため、必ず別ターンで明示許可をもらうこと。