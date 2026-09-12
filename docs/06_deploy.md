# デプロイ手順書

> **目的**: GitHub Actions で Cloudflare (Workers + Container + Static Assets) へ自動デプロイする手順
> **canonical workflow**: `.github/workflows/deploy-cloudflare.yml` (`main` push / `workflow_dispatch`)
> **Cloudflare Pages**: Dashboard の GitHub Integration で out-of-band build (本 workflow は Pages を deploy しない)
> **旧 VM デプロイ手順**: [`docs/archive/deploy-vm.md`](./archive/deploy-vm.md)（GCP/PM2/nginx 構成。Sprint 2.2.0 で Cloudflare へ完全移行済み）

---

## 1. アーキテクチャ概要

### この workflow が deploy するもの

- **Workers Router**: `workers/router/wrangler.toml` の `yusuke-kim-router`。`[[routes]]` で `yusuke-kim.com/api/*` と `*.yusuke-kim.com/api/*` を bind し、それ以外の静的 surface は Cloudflare Pages が担当 (Pages は out-of-band)。
- **CMS API Container**: `apps/cms-api/Dockerfile` を `wrangler deploy` の `[[containers]]` ブロック経由で build + push (DO class `CMSApiContainer`, `instance_type = "lite"`, `max_instances = 1`)。**Container image の build は wrangler 4.x が `wrangler deploy` 内で実行する** — workflow に別 build step は存在しない (Docker Buildx step は daemon 準備のみ)。
- **Workers Static Assets**: `[assets] directory = "../../out"`, binding `STATIC_ASSETS`。Next.js `output: "export"` で生成された `out/` を Worker 経由で serve (主に workers.dev URL / Worker 直接アクセスのフォールバック)。
- **ランタイム**: Bun 1.4.2 (`package.json#packageManager` 固定、CI runner と同一)
- **データ**: Cloudflare R2 bucket `cms-data` (`cms-data-dev` が preview)。Container 起動時に hydrate — **per-content `content-data.tar.gz` の packaging は存在しない** (R2 hydrate のみ)。
- **管理 API**: 書き込みエンドポイントは `CMS_API_ADMIN_JWT_SECRET` (HS256) で認証。`wrangler secret put` で Worker Secrets に push → Container 起動時 envVars として bind (`workers/router/src/index.ts` の `CMSApiContainer` コンストラクタ経由)。

### この workflow が deploy しないもの

- **Cloudflare Pages**: out-of-band (Dashboard の GitHub Integration)。
- **cms-api binary tar**: Rust CMS は Container image としてのみ ship され、別 tar としては package されない。

### デプロイフロー (`.github/workflows/deploy-cloudflare.yml`)

1. **Checkout**: `actions/checkout@v7` (submodules: recursive)
2. **Setup**: Bun 1.4.2 + `bun install --frozen-lockfile` + `bun --bun scripts/install-tools.ts` (workspace deps for `workers/router`)
3. **Offline dump (best-effort)**: `bun scripts/dump-cms-index.ts` を staging Container (`$CLOUDFLARE_WORKER_STAGING_URL`) に対して実行し、`node_modules/.cache/cms-build/{cms-index,markdown-pages}.json` を materialize。**`continue-on-error: true`** (PR #433 review) — 既存 staging が 404 でも新 Container の deploy は継続する。
4. **Build static export**: `bun run build` (offline path, `CMS_USE_RUST_API=0` + `CMS_INDEX_JSON` / `CMS_MARKDOWN_JSON` 経由) → `out/` 生成。Bun SIGILL 132 teardown は `out/index.html` 存在条件下で許容。
5. **Docker Buildx setup**: `docker/setup-buildx-action@v3` — daemon 準備のみ。**Container image の build はここから先の `wrangler deploy` 内で実行**。
6. **Push Workers Secrets**: `wrangler secret put` で `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `X_BEARER_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `SENTRY_DSN`, `CMS_API_ADMIN_JWT_SECRET` を Cloudflare へ push (idempotent)。空 secret は skip + `::warning::`。
7. **Deploy (single command)**: `./node_modules/.bin/wrangler deploy --config wrangler.toml` が Worker + Container image + Static Assets を一度に deploy。Container image build + push はこの step 内で完結。

---

## 2. 必要な GitHub Secrets

| Name | 用途 | Container env? |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | wrangler / Cloudflare API 操作 (Workers:edit + R2:write + Account:read + Containers:write) | — |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID | — |
| `R2_ACCESS_KEY_ID` | R2 認証 (CMS hydrate 用) | ✅ Container env (Worker Secrets 経由) |
| `R2_SECRET_ACCESS_KEY` | R2 認証 | ✅ Container env |
| `SENTRY_DSN` | エラー監視 | — |
| `RESEND_API_KEY` | メール送信 (Worker から) | — |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA 検証 | — |
| `X_BEARER_TOKEN` | Twitter API | — |
| `CMS_API_ADMIN_JWT_SECRET` | **CMS API 書き込み JWT (HS256)** — `apps/cms-api/src/routes/auth.rs` の `require_admin` middleware が検証。**Container env に bind 必須**。空だと production の全 write endpoint が 401 | ✅ Container env |
| `NEXT_PUBLIC_GA_ID` | Next.js build env (GA) | — |
| `NEXT_PUBLIC_SITE_URL` | Next.js build env (絶対 URL の基準) | — |
| `CLOUDFLARE_WORKER_STAGING_URL` | offline dump が叩く staging URL | — |

設定場所: repo Settings → Secrets and variables → Actions

---

## 3. デプロイ実行

### 自動 (push to `main`)
`main` への merge で `deploy-cloudflare.yml` がトリガーされる。concurrency group `deploy-cloudflare-main` + `cancel-in-progress: true` で同一 main HEAD の重複実行を排除。

### 手動 (workflow_dispatch)
GitHub Actions タブ → `Deploy Cloudflare (Workers + Container)` → Run workflow。最新の `main` HEAD を再デプロイする。

### タイミング
- 旧 staging が 404 の状態でも新 Container の deploy は止まらない (step 3 で `continue-on-error: true`)。
- Container cold-start 初回は `/api/entries` が 503/timeout する可能性あり → 60s 待って retry。

---

## 4. Quick verification after deploy

デプロイ完了後、`$CLOUDFLARE_WORKER_STAGING_URL` に対して:

```bash
# 1. Worker Static Assets (Worker 直接 URL / /api/* 以外の Worker 経路)
curl -sf -o /dev/null -w "%{http_code}\n" "$CLOUDFLARE_WORKER_STAGING_URL/"            # 期待: 200

# 2. Worker → Container proxy (本番ドメインの /api/*)
curl -sf "$CLOUDFLARE_WORKER_STAGING_URL/api/entries" | jq 'length'                     # 期待: 公開済みエントリ数 (>0)
curl -sf "$CLOUDFLARE_WORKER_STAGING_URL/api/search?q=test" | jq '.results | length'    # 期待: 検索結果数

# 3. 認証境界 — write / preview は JWT 必須
curl -s -X POST  "$CLOUDFLARE_WORKER_STAGING_URL/api/entries" -d '{}' -w "\nstatus=%{http_code}\n"     # 期待: 401
curl -s -X PATCH "$CLOUDFLARE_WORKER_STAGING_URL/api/entries/x" -w "\nstatus=%{http_code}\n"          # 期待: 401
# Preview router exposes /api/preview/routes/:path and /api/preview/entries/:id
# (PR #433 review: /api/preview/<bare> → 404 router, with real id → 401 without JWT).
curl -s          "$CLOUDFLARE_WORKER_STAGING_URL/api/preview/entries/<known-id>" -w "\nstatus=%{http_code}\n"  # 期待: 401
curl -sf -H "Authorization: Bearer $ADMIN_JWT" \
     "$CLOUDFLARE_WORKER_STAGING_URL/api/preview/entries/<known-id>" -w "\nstatus=%{http_code}\n"             # 期待: 200

# 4. Read 境界 (commit B7-B11 で draft/private GET は 404 を返す)
curl -s "$CLOUDFLARE_WORKER_STAGING_URL/api/entries/<draft-id>" -w "\nstatus=%{http_code}\n"           # 期待: 404
curl -s "$CLOUDFLARE_WORKER_STAGING_URL/api/markdown?id=<draft-slug>" -w "\nstatus=%{http_code}\n"      # 期待: 404
curl -s "$CLOUDFLARE_WORKER_STAGING_URL/api/cms/og/<draft-id>.png" -w "\nstatus=%{http_code}\n"        # 期待: 404
curl -s "$CLOUDFLARE_WORKER_STAGING_URL/api/cms/media?contentId=<draft-id>" -w "\nstatus=%{http_code}\n"  # 期待: 404
```

期待値のまとめ: Static = 200, list = 公開済み数 (>0), search = 結果数, write/preview (無 JWT) = 401, preview (admin JWT) = 200, draft/private GET = 404。

---

## 5. ロールバック

直近の Worker deploy を一つ前に戻す:

```bash
cd workers/router
./node_modules/.bin/wrangler rollback
```

DB スキーマ変更を巻き戻す場合は hotfix PR を `release-2-x-x` ベースで出し、Sprint を 1 個戻す。

---

## 6. トラブルシューティング

### 「Dump CMS index + markdown pages from Container」が失敗する
- `continue-on-error: true` を設定済みなので deploy 自体は止まらない。
- `cms-index.json` が空の場合、Static Assets は build 時に空 index を使い、リクエスト時に live Container へ fallback する。

### `/api/entries` が 404 を返す
- Worker → Container binding (`CMS_API`) の namespace を確認: `wrangler deployments list`
- Container cold-start 中の可能性 → 60s 待って retry
- 旧 `CmsApiContainer` (lowercase m/s) の stale namespace が残っていないか `wrangler delete --force yusuke-kim-router` で再 deploy (歴史的事案、`workers/router/wrangler.toml` 参照)

### write endpoint が 401 を返す
- `CMS_API_ADMIN_JWT_SECRET` が GitHub Secrets に入っているか確認 (`gh secret list`)
- Cloudflare 側に secret が push されているか確認: `wrangler secret list`
- JWT の `exp` が現在時刻より未来か (`validation.leeway = 0` なので 1 秒でも過去なら 401)
- workflow の「Push Workers Secrets」step ログで `::warning::CMS_API_ADMIN_JWT_SECRET is empty` が出ていないか確認

### preview GET も認証を要求するようになった (commit 8 で追加)
- 想定動作。`/api/preview/routes/:path` と `/api/preview/entries/:id` は admin-only by contract。有効な JWT を `Authorization: Bearer` で送る (実 ID が必要。`/api/preview/draft-slug` のような bare path は router にマッチせず 404 を返す点に注意)。

### draft/private の個別 GET が 404 を返すようになった (commit B7-B11 で追加)
- 想定動作。`GET /api/entries/:id`, `GET /api/markdown`, `GET /api/cms/og/:id`, `GET /api/cms/media?contentId=...` は `status = 'published' AND visibility IN ('public', 'unlisted')` を満たす行のみ返す。admin でも個別 GET は 404 (admin は `list_index_admin` view 経由か、admin tools の write 応答で取得)。

### `out/index.html missing after build`
- Bun SIGILL 132 以外の本物のビルド失敗。`bun run build` をローカルで再現 (`bun --version` が 1.4.2 か確認)。
- `.github/workflows/deploy-cloudflare.yml` の `Build Next.js static export (Workers Static Assets source)` step ログを確認。

### Container image build が wrangler deploy 内で失敗する
- Docker Buildx step が完走しているか確認 (daemon が無いと wrangler が image を build できない)。
- `apps/cms-api/Dockerfile` のローカル build を再現: `docker build -f apps/cms-api/Dockerfile apps/cms-api`
