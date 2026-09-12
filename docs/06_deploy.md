# デプロイ手順書

> **目的**: GitHub Actions で Cloudflare へ自動デプロイする手順
> **対象**: Next.js 静的エクスポート + Rust CMS API (axum + sqlx) を Cloudflare Pages + Workers + Containers で運用
> **canonical workflow**: `.github/workflows/deploy-cloudflare.yml`
> **旧 VM デプロイ手順**: [`docs/archive/deploy-vm.md`](./archive/deploy-vm.md)（GCP/PM2/nginx 構成。Sprint 2.2.0 で Cloudflare へ完全移行したため運用停止）

---

## 1. アーキテクチャ概要

### 構成要素
- **フロントエンド**: Next.js 16 (`output: "export"` で生成された静的 HTML/JS) → Cloudflare Pages
- **CMS API**: Rust (axum 0.7 + sqlx 0.8 + tokio) バイナリ → Cloudflare Worker から Container binding で呼び出し
- **ランタイム**: Bun 1.4.2 (`packageManager` / CI / ローカルビルド)
- **静的アセット**: Cloudflare R2 (`cms-data` バケット) — Worker が `hydrate` ステップで hydrate、`R2_KEY_PREFIX` 配下に保存
- **コンテンツ DB**: SQLite (1 アイテム 1 DB, `data/contents/content-{id}.db`) を git 管理。`deploy-cloudflare.yml` の `Package per-content SQLite databases` ステップで `content-data.tar.gz` に固めて Container 起動時に展開
- **管理 API**: 書き込みエンドポイントは `CMS_API_ADMIN_JWT_SECRET` (HS256) で認証。Cloudflare Container env に `wrangler secret put` で投入

### デプロイフロー (`.github/workflows/deploy-cloudflare.yml`)
1. `lint / type-check / test`: `bun run lint` / `bun run type-check` / `bun x knip` / `bun run test` + `cargo fmt --check` / `cargo clippy -D warnings` / `cargo test --all-targets`
2. `build`: `bun install --frozen-lockfile` → `bun --bun next build` (`out/` 生成) → `out/` を `deployment-static.tar.gz` に固める → `data/contents/` を `content-data.tar.gz` に固める → Rust toolchain 設定 → `cargo build --release` → `cms-api` バイナリを `cms-api-binary.tar.gz` に固める
3. `deploy`: Pages deploy (`out/`) + Worker deploy (`wrangler deploy`) + R2 hydrate (`cms-data`) + Container 起動時に `content-data.tar.gz` を展開

Bun の静的ビルドは SIGILL 132 で teardown 失敗する既知問題があるが、`out/index.html` が存在すれば exit 132 を許容する。

---

## 2. 必要な GitHub Secrets / Variables

### Secrets
| Name | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Wrangler / R2 操作 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |
| `CMS_API_ADMIN_JWT_SECRET` | CMS API 書き込み JWT (HS256) |

### Variables
| Name | 用途 |
|---|---|
| `R2_BUCKET_NAME` | CMS コンテンツ用 R2 バケット (デフォルト: `cms-data`) |
| `R2_KEY_PREFIX` | R2 キー名前空間プレフィックス (デフォルト: `cms/`) |
| `CLOUDFLARE_WORKER_STAGING_URL` | スモークテスト用 staging URL |

設定場所: repo Settings → Secrets and variables → Actions

---

## 3. デプロイ実行

### 自動 (push to `release-*`)
PR が `release-*` または `main` へマージされると `deploy-cloudflare.yml` がトリガーされる。Container の cold-start 時間を考慮して `healthcheck` grace は 60s。

### 手動 (workflow_dispatch)
GitHub Actions タブから `deploy-cloudflare.yml` → Run workflow。最新の `release-*` ブランチ HEAD をデプロイする。

### ロールバック
直近の Cloudflare Pages / Workers デプロイ履歴から一つ前に戻す:

```bash
# Pages
wrangler pages deployment rollback --project-name=my-web-2025

# Worker
wrangler rollback
```

DB スキーマ変更を巻き戻す場合は `release-2-x-x` ブランチから hotfix PR を出し、Sprint を 1 個戻す。

---

## 4. 動作確認 (スモークテスト)

デプロイ完了後、`$CLOUDFLARE_WORKER_STAGING_URL` に対して以下を `curl` で確認:

```bash
curl -sf "$STAGING_URL/" | head -5                                   # 200 + HTML
curl -sf "$STAGING_URL/api/entries" | jq 'length'                   # 公開済み一覧
curl -sf "$STAGING_URL/api/search?q=test" | jq '.results | length'   # 検索
curl -sf -X POST "$STAGING_URL/api/entries"                          # 401 (auth 必須)
curl -sf -X POST "$STAGING_URL/api/entries" \
  -H "Authorization: Bearer $ADMIN_JWT" -d '{...}'                   # 200/201
```

`list_index` (公開済みのみ) と `list_index_admin` (admin only) のカウント差で権限境界を確認:

```bash
curl -sf "$STAGING_URL/api/entries" | jq 'length'                   # 公開済み
sqlite3 cms-api-dev.db "SELECT COUNT(*) FROM list_index_admin"      # 全件 (admin 経由のみ)
```

---

## 5. トラブルシューティング

### `out/index.html missing after build`
- Bun SIGILL 132 以外の本物のビルド失敗。`bun run build` をローカルで再現
- `.github/workflows/deploy-cloudflare.yml` の `Build` ステップのログを確認

### Container cold-start で `/api/entries → 404`
- Worker router の Container binding 確認
- `healthcheck` ステップの grace 期間中に失敗 → リトライ (50s sleep + retry)

### R2 hydrate が空に見える
- `R2_KEY_PREFIX` が `cms-data` バケットのキー名前空間と一致しているか確認
- `R2_BUCKET_NAME` / `R2_KEY_PREFIX` env の確認

### 書き込みが 401 を返す
- `CMS_API_ADMIN_JWT_SECRET` が Cloudflare Container env に入っているか確認 (`wrangler secret list`)
- JWT の `exp` が現在時刻より未来か確認 (`validation.leeway = 0` なので 1 秒でも過去なら 401)
