# プロジェクト不変条件 (canonical agent contract)

このプロジェクトは Next.js 16 + React 19 + TypeScript 7 を App Router で運用する samuido 個人サイト(yusuke-kim.com 公開, Cloudflare Pages (Static Assets) + Workers + Containers (lite) + R2 で運用 (詳細は ADR-0014))である. AI エージェントが作業するときの canonical な不変条件をここに集約する. 詳細手順は Skill / docs/ / ADR 側へ委譲する.

## 1. プロジェクト境界

- 公開アプリ: `src/app/`. ルートは `/`, `/about`, `/portfolio`, `/workshop`, `/tools`, `/search`, `/privacy-policy`, `/contact`, `/404`. 管理画面は `/admin/*`(本番では Nginx が `/api/` を Rust CMS API 127.0.0.1:3001 へプロキシ).
- 開発サーバー: `bun run dev` → port 3010.
- 分散 SQLite CMS: `src/cms/`(server / lib / types / migrations) と `data/contents/content-{id}.db`(1 アイテム 1 DB, FTS5 仮想テーブル). バイナリ DB と lockfile は hook で編集拒否.
- Rust CMS API: `apps/cms-api/`. ビルド成果物 `apps/cms-api/target/release/cms-api`. 本番では systemd/pm2 ではなく pm2 で常駐し、nginx が `/api/` をフォワード.
- 静的エクスポート成果物: `out/`. これがデプロイ単位. ランタイム DB / キューは持たない.
- エージェント環境: `.claude/` を canonical とし、`.codex/` (Codex MCP 設定) と `.agents/` (skill ミラー) は同期で運用する.

## 2. ツールチェーン (Bun 固定)

- Package manager: **Bun `1.3.x`**(`packageManager` フィールドで pin). 追加取得は `bun add` / `bun install --frozen-lockfile`. npm / pnpm / yarn / npx の常用は禁止.
- ランタイム: Bun 1.3 (Node 20 fallback). `bun --bun next ...` 経由で Next を起動.
- Lint / Format: **Biome 2.5** (`bun run lint` / `bun run format`). ESLint / Prettier は使わない.
- 依存解析: **Knip** (`bun x knip`).
- 単体テスト: **Jest 30 + Testing Library** (`bun run test`, `jest.config.js`, `jsdom`). Bun 標準の `bun test` は `test` script で併用されるが coverage 計測は Jest 側.
- E2E: Playwright.
- 静的検証 CI: react-doctor(`bun run doctor` / `bunx react-doctor@latest`).
- Lighthouse / Perf: `lighthouse` (devDependency).
- 検索: `rg` / `rg --files` を第一選択.
- Python script 新規追加禁止. 自動化は TypeScript / JavaScript / shell / PowerShell.

## 3. 検証 (canonical gate)

実装タスクは次の **フルセット** を warning 0 / error 0 で通すまで完了ではない. focused test は開発中許可, 最終判定は full set.

```bash
bun install --frozen-lockfile
bun run type-check          # tsc --noEmit (tsconfig.json)
bun run lint                # biome check .
bun run test                # jest
bun x knip                  # dependency / unused export 解析
bun run build               # check-env → next build → copy-content-data
```

UI 変更を含む場合は Playwright (または mcp__playwright__) で実描画を確認すること. Lighthouse レポートは `.tmp/` に置き、コミットしない.

## 4. ディレクトリ責務 (大まかな地図)

- `src/app/` ルート定義. 各 `page.tsx` / `layout.tsx` は App Router 流儀.
- `src/components/` UI プリミティブ + 機能コンポーネント. `ui/`, `admin/`, `playground/`, `providers/`, `layout/`, `markdown/` のサブツリー.
- `src/lib/` 横断ロジック. `cms-api/`, `portfolio/`, `seo/`, `markdown/`, `analytics/`, `playground/`, `server-cache.ts`, `init/` ほか.
- `src/cms/` 分散 SQLite CMS 本体. `server/content-service.ts` が公開読み取り、`src/app/api/admin/content/route.ts` が書き込み.
- `src/types/` ドメイン型 (`content.ts`, `enhanced-content.ts`, `portfolio.ts`, `playground.ts`).
- `apps/cms-api/` Rust 製 CMS API. `Cargo.toml` / `target/`. CMS_USE_RUST_API=1 で Next 側が proxy として `/api/cms/*` を叩く.
- `docs/` 仕様 / 設計 / ページ仕様. `docs/app/` はルート別 spec. `docs/archive/` は旧版(参照用). `docs/adr/` に意思決定を残す(本 init で整備).
- `scripts/` ビルド補助 (`copy-content-data.js`, `check-env.js`, `filter-warnings.js`, 各種 TS ツール).
- `data/contents/*.db` は git 管理外(`.gitignore` で除外). バイナリ. 直接編集禁止.
- `public/` 画像 / favicons / 静的 HTML / Typekit loader. 触る前に影響範囲を確認.

## 5. 設計 (docs/) 先行

`docs/app/<route>/page.md` がルート仕様, `docs/01_global.md`〜`07_rules.md` が横断設計. 実装前に該当 spec を読む. 仕様変更は spec を先に更新し合意してから実装する. `docs/archive/` は読み取り専用.

## 6. Skill / Agent 発見

canonical な Skill は `.agents/skills/` に置き、`.claude/skills/` と同期する. review agent は `.claude/agents/` に置く. 自動 activation は description のトリガーキーワードに従う. Skill の主要一覧:

- `add-content` … `data/contents/content-{id}.db` への追加 / 編集. `/api/admin/content` 経由が唯一の正.
- `react-doctor` … React コード変更後の health check と `/doctor` フルトリアージ.
- `sync-submodule` … `git submodule update --remote` workflow for `external/<name>/`. Bridges submodule workflow with bridge-file protection.
- `verify-and-commit` … canonical 検証ゲートの実行順序と commit メッセージ規約(本 init で追加).
- `sync-cms-entries` … legacy JSON / markdown / media を Rust CMS へ取り込む import scripts のランナー(本 init で追加).
- `deploy-check` … `.github/workflows/deploy.yml#verification` と同じ gate を fresh checkout でローカル実行. SIGILL 132 の吸収条件も明記(本 init で追加).
- `lighthouse-audit` … `out/` ビルド成果物に対する Performance / Accessibility / Best Practices / SEO のスコアリングとベースライン比較(本 init で追加).

review agent:

- `cms-content-reviewer` … `src/cms/`, `data/contents/`, `src/app/api/cms/`, `src/app/api/admin/content/` 配下変更の妥当性検証(read-only).
- `tool-bridge-auditor` … `src/app/tools/<name>/` のブリッジ保護 / 登録整合性(read-only).

## 7. ブランチ / worktree

ローカル `main` のみで作業. feature branch / 一時 branch / worktree は AI エージェント側で勝手に作らない. ユーザーが指定した場合のみ例外. `git status` で無関係な未コミット変更がないか毎回確認し、干渉しない.

## 8. コミット / メッセージ

- コミット prefix: `feat|fix|refactor|test|docs|build|ci|chore|perf` の conventional prefix.
- 件名は 50 字以内目安. 本文に変更理由と検証結果.
- 関連 ADR / spec / issue を本文で参照.
- 1 タスク = 1 commit を基本とする. 検証と無関係な整形は含めない.

## 9. セキュリティ / 秘密情報

- `.env*` ファイルは git ignore. 例外は `.env*.example` のみ.
- Cloudflare Workers Secrets (`wrangler secret put <NAME>`): `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `X_BEARER_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- Cloudflare Pages Environment Variables (build-time): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CMS_API_BASE_URL`.
- `SENTRY_DSN` は Cloudflare Workers Secrets (Container env) に注入.
- HTML / Markdown は `dompurify` または `isomorphic-dompurify` 経由が既定. 生 HTML を React へ直接渡さない.
- CSP / HSTS / X-Frame-Options はリバースプロキシ側で付与(本リポジトリ範囲外).
- 個人情報: 収集しない設計. 問い合わせはメール + メッセージのみで永続化しない.

## 10. モード / 権限 / 信頼

AI エージェントの mode / permission / authentication gate は正当な user gate として扱う. bypass を試みない. 必要な操作が mode 制約を超えるなら、ユーザーに明示的に mode 変更を依頼する. SSH / deploy / pm2 操作は安全のため対話的な承認を経る.

## 11. サブエージェント並列化

論理的に駆動可能な最大数の subagent を使う. 直列化が必要なのは次の場合のみ:

- 同一ファイルの同時編集
- shared mutable state の競合
- Git index / HEAD 操作の競合
- 公式 phase 依存(例: 検証 → デプロイ)

disjoint file ownership を割り当て、各 subagent の完了作業は自分の担当変更のみを含む独立 commit にする. コミット操作自体は直列化する.

## 12. 既存変更の保護

`git status` で未コミット変更が現れた場合、それはユーザーの作業である可能性が高い. 上書き / stage / commit せず、ユーザーに確認する. 同じファイルに自分が書き込む必要があるなら明示的に合意を取る.

## 13. Fresh-clone 再現性

このドキュメント, `.claude/`, `.gitmodules`, `package.json`, `bun.lock`, `tsconfig.json`, `biome.json`, `jest.config.js`, `.github/workflows/`, `docs/`, `scripts/`, および `external/<name>/` の submodule checkout があれば, fresh clone から `git submodule update --init --recursive && bun install --frozen-lockfile && bun --bun scripts/install-tools.ts && bun run build && bun run test` が green になる状態が ideal. global な npm / pip / 隠れた dotenv への暗黙依存は持たない.

## 14. 既知の quality debt (監査 2026-08 で確認)

- **`next.config.ts: typescript.ignoreBuildErrors = true`**: ビルド時 TS エラー抑制. CI の `bun run type-check` は gate として有効だが、ビルド経路は冗長. 改善する場合は外部ツール `src/app/tools/ProtoType/**` の TS エラーを分離して扱ってから enable に戻す.
- **`bun --bun next build` の SIGILL teardown** (Bun 1.3.14 + Next.js 16.3.0): `bun:sqlite` クリーンアップで 132 で終了する. ビルド自体は完了し `out/index.html` が出る. `.github/workflows/deploy.yml` は exit 132 を警告扱いで吸収している. 解消したら CI から吸収ロジックを撤去.
- **Bun バージョン散らばり**: `package.json` = 1.3.10 / `ci.yml` & `deploy.yml` = 1.3.14 / `claude.yml` = 1.3.10. CI と本リポジトリで意図せず揃っていない. 統一する場合は SIGILL との同時解消を ADR に残す.
- **`@appletosolutions/reactbits` の transpilePackages hack**: workspace 依存が `@chakra-ui/react` を正しく解決できないため `next.config.ts` の `transpilePackages` で吸収. 上流修正が入るまで維持.
- **Knip ルール緩和 (`knip.jsonc`)**: files / exports / types / nsExports / nsTypes を off. 一時的な dead code ノイズ回避. 残った false positive は個別 ignore で対応.
- **`external/<tool-slug>/` per-tool submodules** (Phase 1 + Phase 2-N, 13 entries: 12 tools + 1 prototype Vite sub-project): text-counter / color-palette / sequential-png-preview / svg2tsx / business-mail-block / code-type-p5 / fillgen / qr-generator / pomodoro / history-quiz / pi-game / ae-expression / prototype. Shared UI primitives (ToolWrapper / RawDOMContainer / PerformanceOptimizer) live in **`src/components/tools-ui/`** on the parent (the former `external/ui` submodule was dissolved in Phase N+1). Bridges in `src/app/tools/<slug>/page.tsx` use `next/dynamic({ ssr: false })` → barrel import via 4-dot relative path; `src/app/tools/<slug>/components/...` from inside a tool submodule uses **4-dot relative to `../../../../src/components/tools-ui/...`**. Tool-specific deps live in each submodule's `package.json`. **`transpilePackages` array in `next.config.ts`** must be extended per batch. tsconfig.json carries `@rebuildup/tool-<slug>` path aliases. Adding a new tool requires: helper scaffold + source move + bridge rewrite + path alias + transpilePackages entry.
- **Submodule branch workflow** (2026-08-29, P3-B): `develop` is the working branch in each of the 13 submodules (12 tools + prototype). New work lands on `develop` and merges into `main` via PR on the submodule repo. The parent repo refreshes gitlinks automatically via `.github/workflows/sync-submodules.yml` (15-min poll + `workflow_dispatch`), which opens a PR titled `chore(submodule): sync gitlinks to origin/main tip` against `main` (gitlink は origin/main tip に自動進行). Manual gitlink SHA bump は **禁止** (CI / reviewer-driven sync のみ). 13 entries have `.gitmodules` で `branch = main` 宣言済. `git submodule update --remote` は `--merge` 無しで使う (force-push された submodule で unrelated histories が出るため).
- **(removed) `external/ui` submodule**: dissolved 2026-08-29 into `src/components/tools-ui/`. All tool submodules rewritten to import from there via 4-dot relative. No parked items remain under this slot.
- **`scripts/install-tools.ts` と Bun workspaces の相互作用** (Phase 0 導入, 2026-08): workspace と submodule の組合せは Bun のドキュメントで薄く, hoisting の挙動に edge case があれば個別対応する. Phase 1 (ProtoType) で最初の実 tool submodule を投入して挙動を確定する.
- **Biome overrides**: 9 コンポーネントのみ `noArrayIndexKey` を `error`. 過剰検知回避と要件精度の tradeoff. 解消したら overrides を外す.
- **Audio asset rules in `next.config.ts`** (2026-08-29, post ProtoType URL switch): `.wav` files imported by `external/prototype/src/gamesets/012_soundplay.ts` (and potentially other submodule sources) need both webpack AND Turbopack rules because `bun run build` uses Turbopack (`▲ Next.js 16.3.0 (Turbopack)`) and the build runner does not share config with the legacy webpack block. The webpack block at line ~151 covers `\.(wav|mp3|ogg|flac)$` with `type: "asset/resource"`. The Turbopack block at line ~38 mirrors it via `rules: { "*.wav": { type: "asset" } }`. **Adding new audio types or new submodules with audio imports requires updating both blocks**. Future clean-up: unify via a shared loader abstraction if Next.js adds one.
- **Cloudflare Containers β依存**: 2026-08 時点で β 機能. SLA と価格改定のアナウンスを Phase A で再確認.
- **R2 hydrate 整合性**: Container 起動時に per-content DB を R2 からローカルへ hydrate するが, 起動直後の同時起動やスリープ中の整合性にレースリスクあり. `max_instances = 1` で構造的に防止. `PRAGMA integrity_check` を boot で実行.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
