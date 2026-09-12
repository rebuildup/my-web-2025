# プロジェクトエージェント契約

このファイルは dispatcher です。詳細な手順は `docs/agent/` と project-local Skill を必要なときだけ読みます。

## 境界と SoT

- 公開アプリは `src/app/`、CMS は `src/cms/`、Rust API は `apps/cms-api/`、tool submodule は `external/`。
- `origin/main` と `main` は released/integrated source state。active sprint は `release-<major>-<minor>-<patch>`。
- top-level Issue の ticket branch は Issue 番号だけ (`123`)。`issue/` prefix や slug は付けない。
- Issue / Project が durable work state、PR が review/integration state、Git が source state。local directory、会話、session ID を SoT にしない。
- worker の入力は immutable snapshot、結果は immutable commit/ref/result とし、parent の working tree を直接変更しない。
- 実行・lease・generation・checkpoint の詳細は `docs/agent/parallel-orchestration.md` と `docs/agent/recovery.md`。

## 判断と安全

判断の優先順位は `project policy/architecture/invariant -> spec/task -> coherent implementation -> official current guidance -> ecosystem convention -> local judgment`。public contract、security/privacy、不可逆操作、コスト、release scopeに影響する矛盾だけ user に確認します。

- 既存の未コミット変更を上書き、stage、commitしない。特に `data/contents/*.db*` は直接編集しない。
- secret、dotenv実値、machine-specific absolute path、private reasoningをcheckpoint/result/logに保存しない。
- worker は独立した writable workspace/process/port mapping/database/cache/artifact を持つ。共有は immutable/cacheable state のみ。
- root coordinator は分解・委譲・統合・release判断を担当し、sandbox lifecycle は Supervisor/control plane の責務とする。
- 同じ ticket に複数 generation が同時に side effect を行わない。stale generation の結果は統合しない。

## Stack と開発入口

- Bun `1.3.x`、Next.js 16 App Router/static export、React 19、TypeScript 7、Biome 2.5、Jest/Bun test、Knip、Rust axum/sqlx CMS、Cloudflare Pages/Workers/Containers/R2。
- `bun install --frozen-lockfile`。通常の起動は `bun run dev` (3010)、CMS API は `bun run dev:cms-api` (3001)。
- 仕様は `docs/app/`、横断設計は `docs/01_global.md`〜`07_rules.md`、長期判断は `docs/adr/`。
- 初回/復旧時は `docs/agent/onboarding.md` を読む。release/Issue/PR は `docs/agent/release-workflow.md`、sprint/board/retro/WIP の背後にある前提は `docs/agent/agile-premises.md` (DRAFT, PR #393)、検証とsecurityは `docs/agent/quality-security.md`。

## 検証

worker は focused gate、ticket integration は変更surfaceに応じた full applicable gate、release は release-wide gate。最終候補の canonical entry point は次の順です。

```text
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test
bun x knip
bun run build
```

Rust変更は `cargo fmt --all -- --check`、`cargo clippy --all-targets -- -D warnings`、`cargo test --all-targets`。UI変更は Playwrightで実描画、性能確認は `.tmp/`。途中中断・stale snapshotのgreenをfull passとして再利用しない。

## Skills / adapters

- Skills は `.claude/skills/` を canonical、`.agents/skills/` を同期mirrorとする。同期は `scripts/sync-agent-skills.sh --check` が利用可能な場合に確認する。
- content変更は `add-content`、submoduleは `sync-submodule`、Reactは `react-doctor`、deploy前は `deploy-check`/`lighthouse-audit`、完了時は `verify-and-commit`。
- 並行化は `parallel-orchestration`、環境分離は `sandbox-runtime`、復旧は `agent-recovery`、GitHub deliveryは `github-delivery`、判断は `engineering-decisions` を必要時だけ読む。
- `.claude/settings.json` のbinary DB保護hookを無効化しない。`.codex/config.toml` は公式docs参照とUI確認用のadapterであり、project truthではない。

## 言語とGitHub運用

- source/identifier/comment/developer log/config identifierは英語。内部docsは日本語。Issue/PR/review discussionは日本語。commit messageは英語のConventional Commit。
- 1 Issue = 1 ticket branch = 1 Draft PR。詳細な状態遷移、Project columns、checkpoint、release PRは `docs/agent/release-workflow.md`。
- 新規Python automationは禁止。temporary artifactは `.tmp/`、外部参照は `.reference/`。dotenv実値はcommitしない。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
