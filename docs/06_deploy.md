# デプロイ手順書

> **目的**: GitHub Actions で Cloudflare (Workers + Container + Static Assets) へ自動デプロイする手順
> **canonical workflow**: `.github/workflows/deploy-cloudflare.yml` (`main` push / `workflow_dispatch`)
> **Cloudflare Pages**: GitHub Integration で out-of-band build (本 workflow は Pages を操作しない)
> **旧 VM デプロイ手順**: [`docs/archive/deploy-vm.md`](./archive/deploy-vm.md)（GCP/PM2/nginx 構成。Sprint 2.2.0 で Cloudflare へ完全移行済み、Sprint 2.2.0 でサイト公開終了予定）

---

## 1. アーキテクチャ概要

### 構成要素
- **Workers Router**: `workers/router/wrangler.toml` の `yusuke-kim-router` Worker。`/api/*` を Container に proxy、それ以外は Static Assets を serve。
- **CMS API Container**: `apps/cms-api/Dockerfile` で build → `wrangler deploy` が image を Cloudflare Containers (DO class `CMSApiContainer`) へ push。`sleepAfter = "10m"`, `instance_type = "lite"`, `max_instances = 1`。
- **Static Assets**: Workers Static Assets (binding `STATIC_ASSETS`、`directory = "../../out"`)。Next.js 16 の `output: "export"` で生成された `out/` を配信。
- **Cloudflare Pages**: GitHub Integration が `out/` を別 build として out-of-band で配信（本 workflow はノータッチ）。
- **ランタイム**: Bun 1.4.2 (`package.json#packageManager` 固定、CI runner と同一)
- **データ**: Cloudflare R2 bucket `cms-data`（`cms-data-dev` が preview）。Container 起動時に hydrate。
- **管理 API**: 書き込みエンドポイントは `CMS_API_ADMIN_JWT_SECRET` (HS256) で認証。Container env に `wrangler secret put` で投入（Workers Secrets 経由）。

### デプロイフロー (`.github/workflows/deploy-cloudflare.yml`)
1. **Setup**: Bun 1.4.2 + `bun install --frozen-lockfile` + `bun --bun scripts/install-tools.ts` (workspace deps for workers/router)
2. **Offline dump (best-effort)**: `bun scripts/dump-cms-index.ts` を staging Container (`$CLOUDFLARE_WORKER_STAGING_URL`) に対して実行し、`node_modules/.cache/cms-build/cms-index.json` と `markdown-pages.json` を materialize。**この step は `continue-on-error: true`** (PR #433 review) — 既存 staging が 404 でも新 Container の deploy は継続する。失敗時は `::warning::` annotation + 空 cache で続行。
3. **Build**: `bun run build` (offline build path, `CMS_USE_RUST_API=0` + `CMS_INDEX_JSON` / `CMS_MARKDOWN_JSON` 経由) → `out/` 生成。Bun SIGILL 132 teardown は `out/index.html` 存在条件下で許容 (commit `4447faf2`)。
4. **Container build**: Docker Buildx で `apps/cms-api/Dockerfile` を build。
5. **Push Workers Secrets**: `wrangler secret put` で `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `X_BEARER_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `SENTRY_DSN`, `CMS_API_ADMIN_JWT_SECRET` を Cloudflare へ push (idempotent)。空の secret は skip + `::warning::`。
6. **Deploy**: `wrangler deploy --config wrangler.toml` が Worker + Container image + Static Assets を single command で deploy。

---

## 2. 必要な GitHub Secrets

### Secrets (workflow / wrangler secret put 経由)
| Name | 用途 | Container env? |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | wrangler / Cloudflare API 操作 (Workers:edit + R2:write + Account:read + Containers:write) | — |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID | — |
| `R2_ACCESS_KEY_ID` | R2 認証 (CMS hydrate 用) | ✅ Container env |
| `R2_SECRET_ACCESS_KEY` | R2 認証 | ✅ Container env |
| `SENTRY_DSN` | エラー監視 | — |
| `RESEND_API_KEY` | メール送信 (Worker から) | — |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA 検証 | — |
| `X_BEARER_TOKEN` | Twitter API | — |
| `CMS_API_ADMIN_JWT_SECRET` | **CMS API 書き込み JWT (HS256)** — `apps/cms-api/src/routes/auth.rs` の `require_admin` middleware が検証。Container env 必須。**空だと production の全 write endpoint が 401** | ✅ Container env |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL`, `CLOUDFLARE_WORKER_STAGING_URL` | Next.js build env / staging URL | — |

設定場所: repo Settings → Secrets and variables → Actions

---

## 3. デプロイ実行

### 自動 (push to `main`)
`main` への merge で `deploy-cloudflare.yml` がトリガーされる。concurrency group `deploy-cloudflare-main` で同一 main HEAD の重複実行を排除。

### 手動 (workflow_dispatch)
GitHub Actions タブ → `Deploy Cloudflare (Workers + Container)` → Run workflow。最新の `main` HEAD を再デプロイする。

### タイミング
- 旧 staging が 404 の状態でも新 Container の deploy は止まらない (commit step 4 で `continue-on-error: true` を付与)。
- Container cold-start で `/api/entries` が初回 503/timeout する可能性があるため、Cloudflare Containers の `waitForPort` は 180s (`portReadyTimeoutMS = 180_000`) を確保。

---

## 4. 動作確認 (Quick verification)

デプロイ完了後、`$CLOUDFLARE_WORKER_STAGING_URL` (本番 URL でも可) に対して:

```bash
# 静的ページ (Pages / Static Assets)
curl -sf -o /dev/null -w "%{http_code}\n" "$STAGING_URL/"                                  # 200

# Worker → Container proxy
curl -sf "$STAGING_URL/api/entries" | jq 'length'                                          # 公開済み一覧のエントリ数
curl -sf "$STAGING_URL/api/entries?visibility=public&status=published" | jq 'length'      # list_index 経由

# 認証境界 (commit 3 + commit 8 で write + preview GET は保護)
curl -s -X POST "$STAGING_URL/api/entries" -d '{}' -w "\nstatus=%{http_code}\n"            # 401
curl -s -X PATCH "$STAGING_URL/api/entries/x" -w "\nstatus=%{http_code}\n"                 # 401
curl -sf "$STAGING_URL/api/preview/draft-slug" -w "\nstatus=%{http_code}\n"                # 401 (preview GET も JWT 必須)
curl -sf -H "Authorization: Bearer $ADMIN_JWT" "$STAGING_URL/api/preview/draft-slug" -w "\nstatus=%{http_code}\n"  # 200 (admin)

# Search
curl -sf "$STAGING_URL/api/search?q=test" | jq '.results | length'                         # 検索結果数
```

`list_index` (公開済みのみ) と `list_index_admin` (admin only) の差分で権限境界を確認:

```bash
curl -sf "$STAGING_URL/api/entries" | jq 'length'                                          # 公開済み
# Container 内 DB に対して admin で叩いた結果と比較:
sqlite3 cms-api-dev.db "SELECT COUNT(*) FROM list_index_admin"                             # 全件
```

---

## 5. ロールバック

直近の Worker deploy を一つ前に戻す:

```bash
cd workers/router
./node_modules/.bin/wrangler rollback                                                   # Worker + Container を前回状態に戻す
```

DB スキーマ変更を巻き戻す場合は hotfix PR を `release-2-x-x` ベースで出し、Sprint を 1 個戻す。

---

## 6. トラブルシューティング

### deploy workflow が「Dump CMS index」で失敗する
- `continue-on-error: true` を設定済み (commit step 4) なので deploy 自体は止まらない。
- それでも `cms-index.json` が空の場合、Static Assets は build 時に空 index を使い、リクエスト時に live Container へ fallback する (`shouldUseRustCmsApi()` の挙動)。

### `/api/entries` が 404 を返す
- Worker → Container binding (`CMS_API`) の namespace を確認: `wrangler deployments list`
- Container が cold-start 中の可能性 → 60s 待って retry
- 旧 `CmsApiContainer` (lowercase m/s) の stale namespace が残っていないか `wrangler delete --force yusuke-kim-router` で再 deploy (歴史的事案、`wrangler.toml:49-52` 参照)

### write endpoint が 401 を返す
- `CMS_API_ADMIN_JWT_SECRET` が GitHub Secrets に入っているか確認 (`gh secret list`)
- Cloudflare 側に secret が push されているか確認: `wrangler secret list`
- JWT の `exp` が現在時刻より未来か (`validation.leeway = 0` なので 1 秒でも過去なら 401)

### preview GET も認証を要求するようになった (commit 8 で追加)
- 想定動作。`/api/preview/*` と `/preview/*` は admin-only by contract。有効な JWT を `Authorization: Bearer` で送る。

### `out/index.html missing after build`
- Bun SIGILL 132 以外の本物のビルド失敗。`bun run build` をローカルで再現 (`bun --version` が 1.4.2 か確認)。
- `.github/workflows/deploy-cloudflare.yml` の `Build` step ログを確認。
