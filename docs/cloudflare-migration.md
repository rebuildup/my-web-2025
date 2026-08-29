# Cloudflare 移行ステータス (2026-08 in progress)

> **目的**: yusuke-kim.com の GCP VM + nginx + PM2 構成から Cloudflare への移行の **現在の状態 / 人間が行うべき作業 / 次フェーズで自動化される作業** の一覧.
>
> **canonical 仕様**: [`docs/superpowers/specs/2026-08-26-cloudflare-deploy-design.md`](superpowers/specs/2026-08-26-cloudflare-deploy-design.md)
> **decision**: [ADR-0014](adr/0014-cloudflare-deploy.md) (Accepted, supersedes [ADR-0006](adr/0006-static-export-nginx-deploy.md) once Phase D completes)
> **plan**: [`docs/superpowers/plans/2026-08-26-cloudflare-deploy.md`](superpowers/plans/2026-08-26-cloudflare-deploy.md) (35 tasks across 4 phases)
> **branch**: `develop`

## 1. 目標 (再掲)

- 公開 URL (`yusuke-kim.com` + 7 サブドメイン) の形を変えずにデプロイ基盤を PaaS 化
- 1 アイテム 1 SQLite DB の分散 CMS 不変条件を保持
- 月額 ¥1,600 以下の運用コスト (実測試算 $5.06 ≒ ¥770)

## 2. アーキテクチャ (採用案)

| レイヤ | 旧 (GCP) | 新 (Cloudflare) |
|---|---|---|
| 静的ホスティング | nginx + `out/` | Cloudflare Pages (Workers Static Assets) |
| ルーティング | nginx `map $host` | Cloudflare Workers (`yusuke-kim-router`) |
| CMS API | VM 上 Rust systemd/pm2 | Cloudflare Containers (lite, scale-to-to) |
| データ | VM ローカル FS | Cloudflare R2 bucket `cms-data` |
| TLS | Let's Encrypt / certbot | Cloudflare Universal SSL (自動) |
| CI/CD | GitHub Actions SSH/rsync | Cloudflare Pages Git Integration |

Workers Router の `wrangler.toml` で `max_instances = 1` を構造的に強制し、R2 上の per-content SQLite を hydrate / write-back する race を防ぐ.

## 3. 現状のタスク進捗

進捗は SDD ledger にある: [`.superpowers/sdd/2026-08-26-cloudflare-deploy/progress.md`](../.superpowers/sdd/2026-08-26-cloudflare-deploy/progress.md). Phase A のうち、AI エージェントが実行可能な 4 タスクは green.

| Phase | 内容 | 進捗 |
|---|---|---|
| A | foundation (ADR, AGENTS.md, env 整備) | 4/8 完了 (Tasks 5-8 は手動) |
| B | implementation (Rust sync, Workers, Dockerfile, build script) | 0/13 (Tasks 9-21) |
| C | cutover (deploy + DNS switch) | 0/8 (Tasks 22-29) |
| D | decommission (GCP 撤去) | 0/6 (Tasks 30-35) |

### 完了 (コミット済)

| Task | 件名 | Commit |
|---|---|---|
| 1 | plan ファイル seed | `e19710f5` |
| 2 | ADR-0014 作成 | `106f19d3` |
| 3 | AGENTS.md Cloudflare 化 | `77e7db9d` |
| 4 | .env.*.example の GCP_* 撤去 + wrangler secret 注記 | `cee5e8e4` |

### 残 deferred minor (merge 前 triage)

- `AGENTS.md §9` の `.env*` 行が二重になっている (Task 3 で brief 由来の重複). 意味は同一.
- `.env.example` で RESEND_API_KEY / RECAPTCHA_SECRET_KEY / X_BEARER_TOKEN が新旧 2 ヘッダ下に出現 (Task 4 で brief 由来).

両方とも機能面の欠陥ではなく文言整理. 移行完了後の follow-up cleanup で 1 行化可能.

## 4. 人間が行う作業 (Tasks 5-8)

これらは AI エージェントでは実行できない **Cloudflare Dashboard / シェルでの手動作業**. Plan には全部コマンド・URL まで書いてあるが、認証情報とブラウザ操作が必要.

### Task 5: Cloudflare アカウント + Workers Paid ($5/mo)

1. https://dash.cloudflare.com/ でサインアップ (既存なら sign in)
2. Dashboard → Workers & Pages → Plans → **Workers Paid** を選択
3. 右サイドバーから **Account ID** をコピー → 端末に保存:
   ```bash
   mkdir -p ~/.config/cloudflare
   echo "<YOUR_ACCOUNT_ID>" > ~/.config/cloudflare/account-id
   ```

### Task 6: R2 バケット + API トークン

1. Dashboard → R2 → Create bucket を 2 回:
   - `cms-data` (production, region `apac` 推奨)
   - `cms-data-dev` (preview / `wrangler dev` 用)
2. My Profile → API Tokens → Create Token (Custom):
   - Permissions: `Object Read & Write` (両バケットに限定)
   - TTL: 90 日 (ローテーションのリマインダーを calendar へ)
3. 取得値をローカル保存 (コミットしない):
   ```bash
   cat > ~/.config/cloudflare/r2.env <<EOF
   R2_ACCESS_KEY_ID=<paste>
   R2_SECRET_ACCESS_KEY=<paste>
   R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   EOF
   chmod 600 ~/.config/cloudflare/r2.env
   ```
4. 検証: `CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token> bunx wrangler r2 bucket list` で `cms-data` と `cms-data-dev` が出る.

### Task 7: 初期 R2 sync

`data/contents/content-*.db` を R2 `cms-data/contents/` 配下へミラー. Task 22 で実装する `check-r2-sync.ts` が manifest を再生成するので、今回は placeholder で OK.

```bash
cd "$(git rev-parse --show-toplevel)"
export AWS_ACCESS_KEY_ID="$(grep R2_ACCESS_KEY_ID ~/.config/cloudflare/r2.env | cut -d= -f2)"
export AWS_SECRET_ACCESS_KEY="$(grep R2_SECRET_ACCESS_KEY ~/.config/cloudflare/r2.env | cut -d= -f2)"
export AWS_ENDPOINT_URL="$(grep R2_ENDPOINT ~/.config/cloudflare/r2.env | cut -d= -f2-)"
aws s3 sync ./data/contents/ "s3://cms-data/contents/" \
  --endpoint-url "$AWS_ENDPOINT_URL" \
  --exclude "*" --include "*.db" --include "*.db-wal" --include "*.db-shm"
aws s3 ls "s3://cms-data/contents/" --endpoint-url "$AWS_ENDPOINT_URL" --recursive | head -20
```

### Task 8: Cloudflare Pages のビルド smoke

1. Dashboard → Workers & Pages → Create application → Pages → Connect to Git → `rebuildup/my-web-2025` → branch `develop` → Framework preset: `None`
2. Build settings:
   - Build command: `bun run build` (Task 21 で `bun run build:cloudflare` に切替)
   - Build output directory: `out`
   - Root directory: `/`
   - Env var: `BUN_VERSION=1.3.10`
3. Save and Deploy. Bun が見つからない等のエラーが出たら build command の先頭に下記を足して再 deploy:
   ```bash
   echo "=== Installing Bun ===" && curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH" && bun --version && \
   ```
4. 検証: `curl -fsSL https://develop.my-web-2025.pages.dev/about/ | head -5` が HTML を返す.

## 5. AI エージェントが次に行う作業 (Phase B, 全自動)

ユーザの Task 5-8 完了確認後、AI エージェントが Task 9 → Task 21 を順次コミット + レビュー. 主な生成物:

| 種類 | ファイル |
|---|---|
| Rust (sync module) | `apps/cms-api/src/sync/mod.rs`, `apps/cms-api/src/sync/mod_test.rs` |
| Rust (main.rs 統合) | `apps/cms-api/src/main.rs` |
| Dockerfile | `apps/cms-api/Dockerfile`, `apps/cms-api/docker-entrypoint.sh`, `apps/cms-api/.dockerignore` |
| Workers router | `workers/router/{package.json, wrangler.toml, tsconfig.json, src/index.ts, src/index.test.ts, vitest.config.ts}` |
| Build orchestration | `scripts/build-cloudflare.ts` |
| R2 sync / size 監視 | `scripts/check-r2-sync.ts`, `scripts/check-r2-size.ts` |
| 統合テスト | `docker-compose.minio.yml`, `tests/integration/sync.test.ts` |

各タスクは canonical validation gate (`bun install --frozen-lockfile && bun run type-check && bun run lint && bun x knip && bun run test && cargo test`) を green にすることを完了条件とする. Phase B 完了後は staging URL で E2E smoke (Playwright) → master PR → production deploy.

## 6. ロールバック

移行を途中で巻き戻すコストを最小化するため、以下を維持する:

- **GCP VM**: Phase D (Task 30) まで停止しない. DNS 切替後も 1 週間は terminate せず snapshot 化のみ.
- **DNS**: Cloudflare の DNS 設定は元に戻せるようプロキシ状態を DNS-only に切替可能な状態を保つ.
- **AGENTS.md §1**: GCP/Cloudflare の記述を revert 可能な commit 単位で残す.
- **rollback 1-command**: `wrangler r2 object delete --bucket cms-data contents/` で全 R2 データを削除 (sync 前の安全弁). R2 自体の課金は stop しないので、bucket ごと削除が確実.

## 7. fresh-clone 再現性 (一時的に broken)

`AGENTS.md §13` の fresh-clone green 条件は **移行完了後** に満たされる. それまでは:

- `bun run build` は GCP 構成の `out/` を生成 (Pages preview でも動く)
- CMS API はローカル動作 (Rust 直接起動 or `bun run dev:full`)
- Cloudflare R2 / Workers 関連コードは `develop` ブランチ上のみ

移行完了 (Phase D 完了) 時に AGENTS.md §13 を「Cloudflare Pages Git Integration で build + Workers Secrets で API keys」相当へ書き換える.

## 8. 既知の制約 / リスク

- **Cloudflare Containers β**: 2026-08 時点で β 機能. SLA / 価格改定のアナウンスを Phase A〜C で監視.
- **R2 SQLite hydrate 整合性**: `max_instances = 1` で構造的に防止しているが、`PRAGMA integrity_check` を boot 時に走らせる.
- **β機能 → GA 不移行リスク**: 価格が大きく跳ね上がる、または機能縮小したら ADR-0014 再評価条件に従い別 PaaS へ pivot.