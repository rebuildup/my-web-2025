# 環境変数管理

sops / sealed-secrets / 1Password CLI / dotenv-vault は採用しない。`.env*` ファイル + このメモ + 既存 secret store の最小構成で運用する。

## 原則

1. **コードが読む変数だけを `.env*` に書く**。コードが読まない値は入れない (管理点が増えるだけ)。
2. **本物の secret はローカルに置かない**。`.env` (git ignore) は commit されず、clone する度に再生成が必要であることを前提にする。
3. **`wrangler secret put` / GitHub Secrets / パスワードマネージャー** を secret の置き場所として固定する。
4. **recovery は issue / 運用 runbook から辿る**。`AGENTS.md` の「recovery starts from the Issue, PR, Git refs, and `docs/agent/recovery.md`」と同じ流儀。

## `.env*` の役割 (2026-09 時点)

| ファイル | git | 役割 | 含むもの |
|---|---|---|---|
| `.env` | ignore | ローカル実体 (native / WSL / Windows host) | コードが読む変数だけ |
| `.env.example` | tracked | リファレンス (最小構成の雛形) | 全変数、値は空または `https://yusuke-kim.com` |
| `.env.development.example` | tracked | dev override 雛形 | localhost 系 + `CMS_USE_RUST_API=0` |
| `.env.production.example` | tracked | prod override 雛形 | 本番 URL + `CMS_USE_RUST_API=1` |

`.env.production` (real) はかつて GCP server 上で実値を保持していたが、ADR-0014 で Cloudflare 単独構成へ移行後は **作成しない**。本番 runtime secret は Cloudflare 側で持つ。

## どこに何を置くか

| 値 | 置き場所 | 設定コマンド |
|---|---|---|
| `R2_ACCESS_KEY_ID` | Cloudflare Workers Secret | `wrangler secret put R2_ACCESS_KEY_ID` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare Workers Secret | `wrangler secret put R2_SECRET_ACCESS_KEY` |
| `R2_ENDPOINT` | (固定) Cloudflare dashboard 記載値 | `.env.example` のコメントに記載 |
| `R2_BUCKET=cms-data` | (固定) wrangler.toml / `.env` のコメント | `.env.example` に記載 |
| `SENTRY_DSN` | Cloudflare Workers Secret | `wrangler secret put SENTRY_DSN` |
| `RESEND_API_KEY` | Cloudflare Workers Secret | `wrangler secret put RESEND_API_KEY` |
| `RECAPTCHA_SECRET_KEY` | Cloudflare Workers Secret | `wrangler secret put RECAPTCHA_SECRET_KEY` |
| `X_BEARER_TOKEN` | Cloudflare Workers Secret | `wrangler secret put X_BEARER_TOKEN` |
| `NEXT_PUBLIC_GA_ID` | Cloudflare Pages build env | dashboard Pages project → Settings → Environment variables |
| `NEXT_PUBLIC_SITE_URL` | Cloudflare Pages build env | 同上 |
| `NEXT_PUBLIC_CMS_API_BASE_URL` | Cloudflare Pages build env | 同上 |
| `CLOUDFLARE_API_TOKEN` (DNS:edit scope) | **1Password 等 password manager** | ad-hoc curl 用。wrangler OAuth (Workers scope) では不足する DNS / cache 操作でだけ参照 |

## `.env` 再生成 (clone 直後)

```bash
cp .env.example .env
# 必要なら以下をローカル値に編集:
#   CMS_API_DATA_DIR=/home/<user>/work/my-web-2025/data/db
#   NODE_ENV=development
#   CMS_USE_RUST_API=0
# R2_* / Cloudflare token は .env に書かない (secret store 側で持つ)
```

`.env` 自体は `.gitignore` 配下なので、**`git clone` / `git pull` / `git submodule update` のいずれでも降ってこない**. WSL 上に clone し直す場合も、ネイティブ Linux / macOS に clone する場合も、Windows host に clone する場合も、§ 「`.env` 再生成」の手順 (`cp .env.example .env`) を手作業で必ず実行する.

## 削除時の注意

リポジトリ clone を削除する前に `.env` を救出する。`.env` には Cloudflare / R2 の **実値 token が入っている可能性があり**、clone 削除と同時に消える (memory `feedback_env_file_naming.md` 参照)。

救出先候補:
- `~/.env.backup-2026-09-06` (home 直下)
- 1Password Secure Note
- 別ボリュームの USB

R2 token の rotate 手順は `apps/cms-api/README` の "R2 credentials" 章を参照。

## 監査ログ

- **2026-09-06**: `RESEND_API_KEY` / `RECAPTCHA_SECRET_KEY` / `CLOUDFLARE_API_TOKEN` を `.env.example` から削除 (コードから参照なし / ad-hoc 用は 1Password 側へ移管)。`R2_ACCESS_KEY_ID` 等も `.env` 雛形から外し、Workers Secret 運用に統一。関連 PR: #392。
- **2026-08-30**: ADR-0014 制定と同時に `.env.production` を GCP server 上のみで保持する運用を終了。
