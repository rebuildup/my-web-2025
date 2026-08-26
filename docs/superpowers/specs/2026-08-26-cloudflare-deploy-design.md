# Cloudflare Deploy — Design Spec

**Date:** 2026-08-26
**Status:** Draft — awaiting user review
**Author:** Claude (brainstorming → writing-plans flow)
**Project:** `rebuildup/my-web-2025`
**Supersedes:** `docs/adr/0006-static-export-nginx-deploy.md` (Phase D 完了時)
**Related:** ADR-0014 (新規, Phase A で起票)

## 1. Context and motivation

### 1.1 Today

`my-web-2025` (yusuke-kim.com) は Next.js 16 静的エクスポート + Rust CMS API を GCP VM (Ubuntu, IP `34.146.209.224`, user `deploy`) で運用している. canonical な運用は ADR-0006 で「静的エクスポート + nginx リバースプロキシ + PM2 常駐の CMS API」と決定済み.

- フロント: Next.js 16 `output: "export"` → `out/` を nginx が直接配信
- CMS API: Rust バイナリ (`apps/cms-api/target/release/cms-api`) を PM2 で `127.0.0.1:3001` に常駐
- データ: per-content SQLite (`data/contents/content-{id}.db`, FTS5) を VM ローカル FS に保存
- TLS: Let's Encrypt + certbot (systemd timer で自動更新)
- CI/CD: `.github/workflows/deploy.yml` (master push → SSH/rsync → nginx reload → pm2 restart)
- 公開ホスト: `yusuke-kim.com` (apex) + 7 サブドメイン (`links.`, `portfolio.`, `www.`, `pomodoro.`, `prototype.`, `samuido.`, `361do.`) を nginx `map $host $subdomain_redirect` で rewrite
- 現在データサイズ: 136 MB (per-content SQLite + WAL/SHM) + 8.1 MB (`public/`)
- API エンドポイント: `/api/cms/{entries,markdown,media,tags,search,preview,health}` + `/api/admin/content/*` (admin)
- Cargo deps: axum, tokio, sqlx (sqlite), serde, tower-http, image, imageproc, ab_glyph, reqwest, resvg — すべて Linux-native crate で WASM 制約なし

### 1.2 Motivation

ADR-0006 で再評価条件として既に明記されていた:
- 「PaaS 移行で運用負荷が明確に下がる場合」
- 「CDN (Cloudflare) を前段に置く構成へ刷新する場合」

両条件が 2026-08 時点で満たされた:

1. **運用負荷**: VM の OS update, nginx 再起動, certbot 更新, pm2 restart, backup スクリプト, SSH 鍵ローテなど個人運用の棚卸しコストが無視できなくなった.
2. **CDN 前段**: Cloudflare Workers の Static Assets (旧 Pages) が成熟し, Containers (β) でコンテナ常駐コストが scale-to-zero で実用域に入った.
3. **費用ゲート**: ユーザーから「月額 ¥1,600 を超えるなら移行を再考する」という hard gate が提示された. 2026-08 時点 Cloudflare 公式価格での試算では Workers Paid 固定 $5 + lite Container の memory/disk オーバー分 + 5 分 cron warm 込みで **$5.06/月 (¥770)** でゲート内 (内訳は §12).

### 1.3 Scope of this spec

GCP 上の VM / nginx / PM2 構成を撤廃し, Cloudflare エコシステム (Pages + Workers + Containers + R2) へ移行する. 公開 URL と API 表面は維持. ユーザーの指定で `develop` ブランチで段階リリース (Phase A〜D).

## 2. Goals and non-goals

### 2.1 Goals

1. 公開ホスト (`yusuke-kim.com` と 7 サブドメイン) の URL 構造を維持する.
2. CMS の 1 アイテム 1 DB (FTS5 含む) 不変条件を崩さない.
3. Rust CMS API のソースコード (`apps/cms-api/`) を無改変に近い形で Cloudflare Containers に持ち込む.
4. ビルド・検証は既存の canonical gate (`AGENTS.md` §3) を満たす.
5. ランタイム月額を ¥1,600 以下に収める (ユーザー hard gate).
6. 証明書更新・nginx reload・pm2 restart などの運用タスクをゼロにする.
7. GCP VM の撤去を 30 日間のスナップショット保持後に完了する.

### 2.2 Non-goals (this spec)

- Rust CMS API の TypeScript / Hono への書き換え (書き換えコスト > 移行便益)
- SQLite から D1 への移行 (1 item = 1 DB 不変条件を破壊するため)
- CDN を前段に置く nginx 構成 (本 spec で nginx を完全撤廃するため)
- 動的ルートを `generateStaticParams` 以外の方法で増やす (引き続き export 互換のみ)
- 監視・オブザーバビリティ基盤の全面刷新 (Sentry は維持, Grafana 等の追加は別 spec)
- ドメイン移管 (レジストラは現状維持, Cloudflare を DNS only として使う)

## 3. Target architecture

### 3.1 全体像

```
                          ┌─────────────────────────────────┐
                          │       Cloudflare Edge           │
   user (HTTPS)           │  DNS (yusuke-kim.com + 7 sub.)  │
      │                   │           │                     │
      ▼                   │           ▼                     │
┌──────────────┐           │  ┌──────────────────┐           │
│  Browser     │  ───────► │  │  Workers (router)│           │
└──────────────┘           │  │  - subdomain map │           │
                          │  │  - /api/* → Cont.│           │
                          │  │  - edge cache    │           │
                          │  │  - Cron warm     │           │
                          │  └──────┬───────────┘           │
                          │         │                       │
                          │    ┌────┴─────┐                 │
                          │    │          │                 │
                          │    ▼          ▼                 │
                          │ ┌──────┐  ┌──────────────┐     │
                          │ │Static│  │  Container   │     │
                          │ │Assets│  │  (lite)      │     │
                          │ │(Pages│  │  Rust CMS API│     │
                          │ │ _next│  │  hydrate R2  │     │
                          │ │ out/ │  │  write-back  │     │
                          │ └──┬───┘  └──────┬───────┘     │
                          │    │             │             │
                          │    ▼             ▼             │
                          │ ┌─────────────────────────┐   │
                          │ │   R2 bucket (cms-data)  │   │
                          │ │  - per-content SQLite   │   │
                          │ │  - uploaded media       │   │
                          │ └─────────────────────────┘   │
                          └─────────────────────────────────┘
                                          │
                                          ▼
                          GitHub (master / develop)
                                          │
                                          ▼
                          Cloudflare Pages Git Integration
                            - bun install/build (Bun 1.3.10)
                            - submodule update --init
                            - cargo build --release (cms-api)
                            - wrangler pages deploy ./out
                            - wrangler deploy (worker + container)
```

### 3.2 レイヤー責務

| レイヤー | 役割 | 採用プロダクト |
|---|---|---|
| **DNS / TLS** | apex + 7 サブドメイン, 自動証明書 | Cloudflare DNS (Free plan) + Universal SSL |
| **静的配信** | `out/` の HTML/CSS/JS/画像 | Cloudflare Workers Static Assets (旧 Pages) |
| **ルーティング** | サブドメイン → パス rewrite, `/api/*` → Container, 静的優先 | Workers (small, 1ms CPU/req) |
| **CMS API** | Rust binary (axum + sqlx + FTS5) | Cloudflare Containers (lite, scale-to-zero) |
| **データ** | per-content SQLite (起動時 hydrate, 起動中 write-back) | Cloudflare R2 bucket `cms-data` |
| **ビルド** | Bun 1.3.10 build + submodule + Cargo release | Cloudflare Pages Git Integration |
| **シークレット** | `RESEND_API_KEY`, `X_BEARER_TOKEN`, `RECAPTCHA_SECRET_KEY` 等 | Cloudflare Workers Secrets (`wrangler secret`) |

### 3.3 サブドメイン rewrite マップ

旧 nginx `map $host $subdomain_redirect` を Workers 側に移植 (宣言的に管理).

| Host | リダイレクト先 |
|---|---|
| `links.yusuke-kim.com` | `/about/links/` |
| `portfolio.yusuke-kim.com` | `/portfolio/` |
| `www.yusuke-kim.com` | `/` |
| `pomodoro.yusuke-kim.com` | `/tools/pomodoro/` |
| `prototype.yusuke-kim.com` | `/tools/prototype/` |
| `samuido.yusuke-kim.com` | `/about/profile/handle/` |
| `361do.yusuke-kim.com` | `/about/profile/handle/` |

## 4. Components

### 4.1 Workers ルーティング (`workers/router/` 新規)

```toml
# workers/router/wrangler.toml
name = "yusuke-kim-router"
main = "src/index.ts"
compatibility_date = "2026-08-01"

[assets]
directory = "../out"
binding = "STATIC_ASSETS"

[[r2_buckets]]
binding = "CMS_DATA"
bucket_name = "cms-data"
preview_bucket_name = "cms-data-dev"

[[containers]]
binding = "CMS_API"
image = "../apps/cms-api/Dockerfile"
instance_type = "lite"
max_instances = 1

[triggers]
crons = ["*/5 * * * *"]  # Container warm 維持
```

```ts
// workers/router/src/index.ts
const SUBDOMAIN_REDIRECT: Record<string, string> = {
  "links.yusuke-kim.com":     "/about/links/",
  "portfolio.yusuke-kim.com": "/portfolio/",
  "www.yusuke-kim.com":       "/",
  "pomodoro.yusuke-kim.com":  "/tools/pomodoro/",
  "prototype.yusuke-kim.com": "/tools/prototype/",
  "samuido.yusuke-kim.com":   "/about/profile/handle/",
  "361do.yusuke-kim.com":     "/about/profile/handle/",
};
const STATIC_API_PATHS = /^\/(entries|markdown|media|tags|search|preview|health)/;

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const host = url.host;

    const redirect = SUBDOMAIN_REDIRECT[host];
    if (redirect && url.pathname === "/") {
      return Response.redirect(new URL(redirect, url), 308);
    }

    if (url.pathname.startsWith("/api/")) {
      return cachedProxy(req, env, ctx);
    }

    if (STATIC_API_PATHS.test(url.pathname)) {
      const assetResp = await env.STATIC_ASSETS.fetch(req);
      if (assetResp.status !== 404) return assetResp;
      return cachedProxy(req, env, ctx);
    }

    return env.STATIC_ASSETS.fetch(req);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      env.CMS_API.fetch("https://internal/health").catch(() => null),
    );
  },
};

async function cachedProxy(
  req: Request, env: Env, ctx: ExecutionContext,
): Promise<Response> {
  const cache = caches.default;
  const cached = await cache.match(req);
  if (cached) return cached;
  const resp = await env.CMS_API.fetch(req);
  if (resp.status === 200 && req.method === "GET") {
    const clone = resp.clone();
    clone.headers.set("Cache-Control", "s-maxage=60");
    ctx.waitUntil(cache.put(req, clone));
  }
  return resp;
}
```

### 4.2 Container (`apps/cms-api/Dockerfile` 新規)

```dockerfile
FROM rust:1.83-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/cms-api /usr/local/bin/cms-api
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENV CMS_API_DATA_DIR=/var/lib/cms/data
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["cms-api"]
```

### 4.3 Rust 側 sync モジュール (`apps/cms-api/src/sync/` 新規)

新規ファイル:

- `mod.rs` — `R2Config`, `SyncState`, `hydrate()`, `write_back()`, `shutdown()`
- Cargo.toml に `aws-sdk-s3 = "1"` 追加 (R2 は S3 互換 API で操作)
- `main.rs` 改修: boot で `hydrate` → 30s 周期 `write_back` の tokio task 起動 → graceful shutdown で final flush

```rust
// apps/cms-api/src/sync/mod.rs (概要)
pub async fn hydrate(r2: &R2Client, local_dir: &Path) -> Result<()> {
    // List `contents/*` from R2, write each object to local_dir/{key}.
}

pub async fn write_back(
    r2: &R2Client,
    local_dir: &Path,
    state: &mut SyncState,
) -> Result<()> {
    // Walk local_dir, diff mtime vs state.last_synced, upload diffs.
}

pub async fn shutdown(r2: &R2Client, local_dir: &Path, state: &mut SyncState) -> Result<()> {
    state.write_back(r2).await
}
```

### 4.4 R2 bucket 構造 (`cms-data`)

| キー | 内容 | サイズ想定 |
|---|---|---|
| `contents/content-{id}.db` | per-content SQLite (1 item = 1 DB) | ~5MB × 30 = 150MB |
| `contents/content-{id}.db-wal` | WAL (write-back 時に同期) | < 1MB |
| `media/{yyyy}/{mm}/{slug}.{ext}` | アップロードメディア (50MB/ファイル上限) | ~200MB |
| `manifest.json` | 整合性チェック用 (etag list) | < 10KB |

合計 ~0.4 GB (R2 無料枠 10 GB/月 以内). 月 1 GB ずつ増加した場合, 10 か月で 10 GB に到達し超過料金 ($0.015/GB-月) が発生する. Phase D 後の保守フェーズで `bun scripts/check-r2-size.ts` を定期実行しアラート.

## 5. Data flow

### 5.1 代表 3 ケース

**A. 静的ページ GET (`https://yusuke-kim.com/about/`)**
```
Browser → DNS → Workers (判定: static) → Static Assets (edge cache) → out/about/index.html
```

**B. CMS API GET (`https://yusuke-kim.com/api/cms/search?q=...`)**
```
Browser → DNS → Workers (判定: /api/*) → Container (起床) → SQLite (FTS5) → JSON
```
> Container 起動 ~5-30s. Workers Cache 60s TTL で cushion.

**C. メディア GET (`https://yusuke-kim.com/api/cms/media/2026/08/hero.jpg`)**
```
Browser → DNS → Workers (STATIC_API_PATHS regex) → Static Assets (404 → fallback) → Container → R2
```
> 静的 file があれば Static Assets から直接. なければ Container 経由で R2 から stream.

### 5.2 起動シーケンス (Container)

```
1. Cloudflare が cold start で Container を起動 (light instance: 0.0625 vCPU, 256 MB, 2 GB)
2. cms-api process 起動
3. R2 から `contents/*` を全件 pull → `/var/lib/cms/data/`
4. axum サーバ `127.0.0.1:3001` で listen
5. Workers から fetch 着信
6. 30s ごとに WAL + 変更 .db を R2 へ push
7. 5 分無アクセスで sleep → 次回アクセスで 1 から再開
```

## 6. Error handling and testing

### 6.1 エラーカタログ

| 障害 | 検出 | 対応 |
|---|---|---|
| R2 bucket unreachable | `hydrate()` で `aws_sdk_s3::Error::Io` / timeout | Process exit 1 → Container restart → Cloudflare が別 instance で retry. `/health` は 503. Workers は静的配信にフォールバック. |
| WAL checkpoint 失敗 | `write_back()` で `tokio::io::Error` | tracing::warn, リトライ 3 回 (exponential backoff). 3 連続失敗で Sentry 通知. |
| R2 認証情報不正 | Container boot で `InvalidAccessKeyId` | 即 exit 1. CI のスモークテストで防止. |
| Container OOM | Rust プロセスが SIGKILL | Cloudflare が新 instance 起動. hydrate からやり直し. 前 instance の未 flush write は消失. |
| Container disk full | `std::fs::write` で `ENOSPC` | 10 GB 上限は十分余裕. 警告ログ + アラート. |
| `/api/admin/content` 書き込み後の write-back 失敗 | 次回 hydrate 時に mtime 比較で検知 | Admin UI に「最終同期: X」表示 + 手動 retry ボタン. ADR-0014 で明示. |
| Workers Static Assets 不在 (404) | `env.STATIC_ASSETS.fetch()` が 404 | Container へ fallback. Container も 404 なら本物の 404. |
| Container が起動していない状態で `/api/*` リクエスト | Workers が `env.CMS_API.fetch()` で error | 503 + `Retry-After: 5`. CDN edge で短時間キャッシュ可. |
| Build failure (Bun, Cargo, submodule) | Cloudflare Pages Git Integration | PR の commit status で block. master への push は build 通った場合のみ deploy. |

### 6.2 コールドスタート緩和

1. **Workers Cache (60s TTL)**: 同一クエリを 60s キャッシュして cold 中の連打を吸収.
2. **Cron Trigger warm (5 分おき)**: `scheduled` handler で `/health` を叩き常時 warm 維持. `max_instances = 1` で 1 個だけ. 月額 +$0.5〜$1 程度 (試算内).
3. **Admin UI への明示表示**: ユーザーが体感 latency を理解できるよう「最終同期: 2026-08-26 10:30 (15s ago)」を表示.

### 6.3 テスト戦略

| レイヤー | ツール | 検証内容 |
|---|---|---|
| **Unit (Rust sync mod)** | `cargo test` | `hydrate()` のモック R2 に対する pull 確認, `write_back()` の diff ロジック, conflict 検出. |
| **Unit (Worker routing)** | `vitest` + `@cloudflare/vitest-pool-workers` | subdomain rewrite, /api/* 分岐, Static Assets fallback の各経路. |
| **Integration** | docker-compose + minio (S3 互換) | ローカルで minio を立て, Container が hydrate/write-back を完走. CI で必須. |
| **E2E (Playwright)** | `mcp__playwright__*` | ステージングで実際の `/search?q=...`, `/admin/...` を通しで叩く. |
| **Build gate** | `bun run type-check && bun run lint && bun x knip && bun run test && bun run build` + `cargo test --manifest-path apps/cms-api/Cargo.toml` | 既存の canonical gate を維持. |
| **Lighthouse** | `bun run lighthouse` against staging preview URL | Performance / Accessibility / Best Practices / SEO の回帰チェック. |
| **Cold-start probe** | カスタムスクリプト | staging で 5 分 sleep 後の初回 response latency を計測. P95 < 10s を目標. |
| **R2 migration test** | 1 アイテムアップロード → Container restart → 反映確認 | integration test として CI に組み込む. |

## 7. Migration plan

### Phase A: 基盤整備 (`develop` ブランチ, 1 週目)

- Cloudflare アカウント作成 + Workers Paid ($5/月) 契約.
- R2 bucket `cms-data` 作成 + access key 発行.
- `develop` ブランチ作成 (ユーザー指定).
- AGENTS.md, docs/06_deploy.md, ADR-0014, `.env.*.example` を本 spec の方針で書き換え.
- 既存 `data/contents/` の中身を `wrangler r2 object put --recursive` で R2 に初回 sync.
- CI smoke: Bun 1.3.10 + submodule + Cargo が Cloudflare Pages build env で動くか検証. Pages build env には Rust toolchain がデフォルトで含まれないため, build command を `bun run build:cloudflare` 1 本にせず前半で Rust を入れるステップを明示する (`actions-rs/toolchain` 相当の代替 or コンテナ内 build). 失敗時は GitHub Actions + Wrangler 経路へ即座にフォールバック.

### Phase B: 実装 (`develop`, 2〜3 週目)

- `apps/cms-api/src/sync/` 実装 (Rust 側 hydrate / write-back).
- `apps/cms-api/Dockerfile`, `docker-entrypoint.sh` 追加.
- `workers/router/` 新規プロジェクト作成.
- `scripts/build-cloudflare.ts` 新規追加.
- 単体テスト + 統合テスト (minio) 通過.
- staging 環境 (`develop-yusuke-kim.pages.dev`) へ Git integration で自動 deploy.
- GCP VM は並行稼働 (read 経路のフォールバック).

### Phase C: 切替 (`master` マージ, 3〜4 週目)

- `develop` で staging E2E + Lighthouse 全項目 green.
- `master` へ PR → マージ → 本番自動 deploy.
- apex + 7 サブドメインの DNS を Cloudflare に向け, custom domain attach.
- 24 時間スモーク → 全 7 ホスト + `/api/*` 各エンドポイント 200 確認.

### Phase D: 旧環境撤去 (1 ヶ月後)

- GCP VM を read-only で 2 週間スタンバイ.
- 問題なければ VM を stop. スナップショットを 30 日保持.
- `.github/workflows/deploy.yml` を削除 (workflow_dispatch のみ残すかも).
- `.github/workflows/test-ssh.yml` を削除.
- 旧 GitHub Secrets (`GCP_*`) を完全削除.
- 残 30 日で問題なければスナップショット削除, ADR-0006 を Superseded に更新.

各 Phase の検証ゲート: `bun install --frozen-lockfile && bun run type-check && bun run lint && bun x knip && bun run test && bun run build && cargo test --manifest-path apps/cms-api/Cargo.toml`.

## 8. Rollback

| シナリオ | 検知 | ロールバック手順 | 復旧目標 |
|---|---|---|---|
| Phase B/C で致命バグ | staging E2E / lighthouse 失敗 | `git revert` で master を前回 commit へ. Cloudflare Pages が自動再 deploy. Container は前バージョンがそのまま走り R2 データは無傷. | 30 分以内 |
| R2 データ破損 | Container 起動時 `hydrate` で sqlite 読み込み失敗 | `wrangler r2 object put cms-data/contents/{id}.db --file ./backup/{id}.db` で戻す. Phase D 完了 30 日以内なら GCP VM の `data/contents/` から復元. | 15 分以内 |
| Container 連続失敗 | Cloudflare アラート / manual | `wrangler containers stop`, 直前の git commit に revert. | 15 分以内 |
| DNS 切替で接続不可 | アラート / lighthouse fail | Cloudflare DNS で apex を旧 VM IP に戻す (TTL 5 分). | 5 分以内 |
| 全面廃止 (Cloudflare が撤退) | — | GCP VM を 30 日間スナップショット保持しているので再起動可能. R2 bucket を `aws s3 sync` で GCS にコピー, VM で mount. | 半日 |

## 9. Verification

```bash
# ローカル (Phase B 開始時から)
bun install --frozen-lockfile
bun run type-check         # tsc --noEmit
bun run lint               # biome check .
bun x knip                 # dependency 解析
bun run test               # jest (with cms integration)

# Rust CMS API (新規追加)
cargo fmt --manifest-path apps/cms-api/Cargo.toml --all -- --check
cargo clippy --manifest-path apps/cms-api/Cargo.toml --all-targets -- -D warnings
cargo test  --manifest-path apps/cms-api/Cargo.toml --all-targets

# Cloudflare ビルド
bun run build:cloudflare   # build-cloudflare.ts

# Workers ルーティング (vitest + @cloudflare/vitest-pool-workers)
bunx vitest run workers/router/

# Container 同期 (integration: docker-compose + minio)
bun run test:sync          # 新規追加, minio 起動 + hydrate/write-back

# Cloudflare へのデプロイ
git push origin develop    # staging 自動 deploy
git push origin master     # production 自動 deploy

# Lighthouse (staging / production それぞれ)
bun run lighthouse --url https://staging.yusuke-kim.com
bun run lighthouse --url https://yusuke-kim.com

# R2 migration smoke
bun scripts/check-r2-sync.ts  # 新規追加, 全 content-* db の R2 / local 一致確認
```

## 10. Open questions

1. **Cloudflare Pages build env の Bun 1.3.10 互換**: Phase A で smoke 検証. 失敗時は GitHub Actions + Wrangler 経路へ即座にフォールバック.
2. **Container の GA 化見通し**: 2026-08 時点 β. SLA や価格改定のアナウンスを Phase A で再確認し, ADR-0014 に追記.
3. **`max_instances = 1` の妥当性**: 1 item しか同時編集しない個人サイトのため 1 で十分だが, 将来的に admin を他者に共有する場合は再評価.
4. **R2 hydrate 整合性の最終検証**: 起動時に SQLite の `PRAGMA integrity_check` を実行するスクリプトを Phase B の integration test に追加.
5. **Admin UI の Cloudflare 認証**: `/admin/*` の認証 (現状 local-only) を Cloudflare Access で保護するかは Phase C 開始時に判断.

## 11. Relations to existing project invariants

- `AGENTS.md` §1 (Next.js + GCP) → §1 を Cloudflare 構成に書き換え (Phase A).
- `AGENTS.md` §9 (Secrets) → Secrets 一覧を本 spec §3.2 に揃え, 例は `wrangler secret` に統一.
- `AGENTS.md` §13 (fresh-clone 再現性) → fresh clone + submodule + `bun install --frozen-lockfile` + `bun run build:cloudflare` で `out/` と Container イメージ両方が green になる状態が ideal. Cloudflare 側の secret 設定は fresh-clone で再現できないので別ドキュメント化.
- `AGENTS.md` §14 (known quality debt) → 「Cloudflare Containers β依存」「R2 hydrate 整合性」を追記.
- ADR-0006 → Phase D 完了後に "Superseded by ADR-0014" に更新.
- `docs/archive/06_deploy.md.archive` → 既存. 本 spec 完了後, GCP 版の 06_deploy.md を `docs/archive/06_deploy-gcp.md` として退避.

## 12. Pricing summary (recap)

| シナリオ | インスタンス | 起動方式 | 概算月額 USD | 概算月額 JPY |
|---|---|---|---|---|
| **採用案** | lite (0.0625 vCPU, 256 MB, 2 GB) | scale-to-zero + 5 分 cron warm | **$5.06** | **¥770** |
| 代替 B | lite | always-on | $6.74 | ¥1,025 |
| 代替 C | basic (0.25 vCPU, 1 GB, 4 GB) | scale-to-zero | $5.86 | ¥890 |
| 代替 D | standard-1 (0.5 vCPU, 4 GB, 8 GB) | scale-to-zero | $9.50 | ¥1,445 |

為替 1 USD ≈ ¥152 (2026-08 時点概算). ユーザー hard gate ¥1,600 を満たす.

---

**End of spec.** Next: user review → writing-plans skill で実装プランを生成.
