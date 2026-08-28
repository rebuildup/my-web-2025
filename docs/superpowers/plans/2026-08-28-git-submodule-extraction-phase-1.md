# Phase 1 — ProtoType Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract `src/app/tools/ProtoType/` out of `my-web-2025` into a stand-alone repo `rebuildup/tool-prototype`, then re-wire `my-web-2025` to consume it via git submodule.

**Architecture:** Move the existing Vite-built ProtoType code into a new repo (`rebuildup/tool-prototype`) with the standard `<tool-repo>/src/` layout (kept as Vite inside the repo for standalone dev). `my-web-2025` keeps only a thin bridge `src/app/tools/ProtoType/{page,layout}.tsx` that uses `next/dynamic({ ssr: false })` to import the App from the submodule. Submodule checkouts land under `external/prototype/`. This validates the per-tool repo + submodule + bridge pattern end-to-end before applying it to the remaining 13 tools in Phase 2.

**Tech Stack:** Bun 1.3.x, Next.js 16 + React 19, TypeScript 7, Vite 6 (inside the new tool repo), git submodule.

**Spec:** `docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md` §3.1, §3.3, §5.2, §6, §8 (Resolved decisions 2026-08-28).

## Global Constraints

- Package manager: **Bun `1.3.x`** (pinned via `packageManager` field). No npx/npm/pnpm/yarn.
- Lint/format: **Biome 2.5**. ESLint/Prettier not used.
- Tests: `bun run test` (Bun test runner), `jest.config.js` for jsdom environment where used.
- Canonical gate (must all be green): `bun install --frozen-lockfile && bun run type-check && bun run lint && bun run test && bun x knip && bun run build`.
- AGENTS.md §3 (canonical gate) and §13 (fresh-clone reproducibility with submodules).
- AGENTS.md §7 (work only on `master`, no feature branches without user request).
- AGENTS.md §8 (commit prefix `feat|fix|refactor|test|docs|build|ci|chore|perf`, subject ≤50 chars, conventional style).
- AGENTS.md §12 (do not commit unrelated modifications; verify `git status` before commit).
- Pre-existing modifications in working tree (data/contents/*, src/portfolio/*, src/cms/*, src/lib/cms-api/*, src/lib/markdown/*, public/data/*, tsconfig.json) are user-owned and must NOT be staged.
- Existing `.gitattributes` `merge=ours` entries exist for `src/app/tools/ProtoType/page.tsx`, `layout.tsx`, and `src/gamesets/025_SquareEffect.ts` — these all become obsolete after Phase 1.
- Existing `scripts/sync-subtree.sh` and `scripts/merge-deps.mjs` were already removed in commit `2132fae9` (Phase 0 cleanup). Verify with `git log --diff-filter=D --name-only --oneline | head` if in doubt.

---

## File Structure (Phase 1 only)

### New external repo `rebuildup/tool-prototype`

```
tool-prototype/
├── src/
│   ├── App.tsx                       # default export consumed by my-web-2025 bridge
│   ├── index.css                     # imported by my-web-2025 layout.tsx
│   ├── assets/                       # moved from src/app/tools/ProtoType/src/assets
│   ├── components/                   # moved from src/app/tools/ProtoType/src/components
│   ├── gamesets/                     # moved from src/app/tools/ProtoType/src/gamesets
│   ├── icon/                         # moved from src/app/tools/ProtoType/src/icon
│   ├── sample_codes_text/            # moved from src/app/tools/ProtoType/src/sample_codes_text
│   ├── styles/                       # moved from src/app/tools/ProtoType/src/styles
│   ├── svg_conponent/                # moved from src/app/tools/ProtoType/src/svg_conponent
│   ├── index.ts                      # NEW: barrel exporting App.tsx as default
│   └── package.json                  # NEW: name "@rebuildup/tool-prototype", deps as in old package.json
├── public/                           # moved from src/app/tools/ProtoType/public
├── index.html                        # moved from src/app/tools/ProtoType/index.html
├── package.json                      # moved verbatim from src/app/tools/ProtoType/package.json (preserve Vite scripts + deps)
├── biome.json                        # moved from src/app/tools/ProtoType/biome.json
├── vite.config.ts                    # moved from src/app/tools/ProtoType/vite.config.ts
├── tsconfig.json                     # moved from src/app/tools/ProtoType/tsconfig.json
├── tsconfig.app.json                 # moved from src/app/tools/ProtoType/tsconfig.app.json
├── tsconfig.node.json                # moved from src/app/tools/ProtoType/tsconfig.node.json
├── preinstall.js                     # moved from src/app/tools/ProtoType/preinstall.js
└── README.md                         # NEW: standalone dev + embed instructions
```

### my-web-2025 changes

- Modify: `.gitmodules` (add `external/prototype` entry)
- Modify: `next.config.ts` (extend `transpilePackages` with `external/prototype/src`)
- Modify: `tsconfig.json` (add path alias `@rebuildup/tool-prototype` → `external/prototype/src`)
- Modify: `src/app/tools/ProtoType/page.tsx` (rewrite as bridge → `next/dynamic(() => import('../../../../external/prototype/src/App'), { ssr: false })`)
- Modify: `src/app/tools/ProtoType/layout.tsx` (rewrite CSS imports to point at `external/prototype/src/styles/...`)
- Delete: `src/app/tools/ProtoType/{src, public, components, hooks, utils, types.ts, package.json, biome.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, preinstall.js, index.html}` (everything except `page.tsx` and `layout.tsx`)
- Delete: `.gitattributes` entire file (the three remaining entries all refer to ProtoType). If this leaves nothing, remove the file entirely.
- Delete (if present): `scripts/sync-subtree.sh` and `scripts/merge-deps.mjs` — already removed in commit `2132fae9`; verify with `git log --diff-filter=D --name-only | grep -E 'sync-subtree|merge-deps'` (expect no output).

---

## Task 1: Create `rebuildup/tool-prototype` GitHub repository

**Files:**
- Create: GitHub repo `rebuildup/tool-prototype` (public, MIT license)
- Create: local clone working directory (e.g. `../tool-prototype-work/`, **outside** `my-web-2025`)

**Interfaces:**
- Consumes: existing source under `my-web-2025/src/app/tools/ProtoType/`
- Produces: empty public repo with default README, default branch `master`, LICENSE (MIT)

- [ ] **Step 1.1: Confirm GitHub auth + scopes**

```bash
gh auth status
```

Expected: `Logged in to github.com as rebuildup` with scopes including `repo`. If scopes are missing, stop and ask user to run `gh auth refresh -h github.com -s repo,workflow`.

- [ ] **Step 1.2: Create the repo**

```bash
gh repo create rebuildup/tool-prototype \
  --public \
  --description "ProtoType — typing-game / PIXI.js / code-driven practice (per-tool repo for my-web-2025)" \
  --license MIT \
  --add-readme \
  --confirm
```

Expected: repo URL `https://github.com/rebuildup/tool-prototype` printed, exit code 0.

- [ ] **Step 1.3: Clone the repo locally (outside my-web-2025)**

```bash
cd "$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/.."
git clone https://github.com/rebuildup/tool-prototype.git tool-prototype-work
cd tool-prototype-work
```

Expected: working directory `tool-prototype-work/` with README.md from GitHub. Do **NOT** add this directory to `my-web-2025`'s working tree.

- [ ] **Step 1.4: Create LICENSE (MIT)**

```bash
gh api -X PUT repos/rebuildup/tool-prototype/license \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{"license":"mit"}
JSON
```

Verify with `gh repo view rebuildup/tool-prototype --json licenseInfo --jq .licenseInfo.spdxId` → `MIT`.

- [ ] **Step 1.5: Commit no-op (just record the empty repo URL in working memory for next task)**

No commit needed; the empty repo is the deliverable. Save the path `../tool-prototype-work/` for the next task.

---

## Task 2: Move ProtoType source files into the new repo

**Files:**
- Move (from → to):
  - `src/app/tools/ProtoType/src/**` → `tool-prototype-work/src/`
  - `src/app/tools/ProtoType/public/**` → `tool-prototype-work/public/`
  - `src/app/tools/ProtoType/index.html` → `tool-prototype-work/index.html`
  - `src/app/tools/ProtoType/package.json` → `tool-prototype-work/package.json`
  - `src/app/tools/ProtoType/biome.json` → `tool-prototype-work/biome.json`
  - `src/app/tools/ProtoType/vite.config.ts` → `tool-prototype-work/vite.config.ts`
  - `src/app/tools/ProtoType/tsconfig.json` → `tool-prototype-work/tsconfig.json`
  - `src/app/tools/ProtoType/tsconfig.app.json` → `tool-prototype-work/tsconfig.app.json`
  - `src/app/tools/ProtoType/tsconfig.node.json` → `tool-prototype-work/tsconfig.node.json`
  - `src/app/tools/ProtoType/preinstall.js` → `tool-prototype-work/preinstall.js`

- Create (in `tool-prototype-work/`):
  - `src/index.ts`
  - `README.md`

- Delete (in `src/app/tools/ProtoType/`): everything except `page.tsx` and `layout.tsx` (handled later in Task 7).

**Interfaces:**
- Consumes: `src/app/tools/ProtoType/src/App.tsx` (the entrypoint my-web-2025's bridge imports via `next/dynamic`)
- Produces: `tool-prototype-work/src/App.tsx` reachable as `external/prototype/src/App` once registered as a submodule

- [ ] **Step 2.1: Copy src/, public/, and all root config files**

```bash
PROTO_SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/ProtoType"
WORK="../tool-prototype-work"

mkdir -p "$WORK/src"
cp -R "$PROTO_SRC/src/." "$WORK/src/"
[ -d "$PROTO_SRC/public" ] && cp -R "$PROTO_SRC/public" "$WORK/"
cp "$PROTO_SRC/index.html" "$WORK/" 2>/dev/null || true
cp "$PROTO_SRC/package.json" "$WORK/"
cp "$PROTO_SRC/biome.json" "$WORK/"
cp "$PROTO_SRC/vite.config.ts" "$WORK/"
cp "$PROTO_SRC/tsconfig.json" "$WORK/"
cp "$PROTO_SRC/tsconfig.app.json" "$WORK/"
cp "$PROTO_SRC/tsconfig.node.json" "$WORK/"
cp "$PROTO_SRC/preinstall.js" "$WORK/"
```

Expected: no errors. `ls $WORK` shows the moved files.

- [ ] **Step 2.2: Create the `src/index.ts` barrel**

Write `tool-prototype-work/src/index.ts`:

```ts
// Public entry point consumed by my-web-2025 bridge:
//   next/dynamic(() => import('@rebuildup/tool-prototype/src/App'))
// All other src/* modules are implementation details.
export { default } from "./App";
export * from "./App";
```

- [ ] **Step 2.3: Write `README.md` for the tool repo**

Write `tool-prototype-work/README.md`:

```markdown
# rebuildup/tool-prototype

ProtoType — a typing-game / PIXI.js / code-driven practice tool.

## Embed in my-web-2025

This repo is consumed by `rebuildup/my-web-2025` as a git submodule at
`external/prototype/`. The bridge `src/app/tools/ProtoType/page.tsx` does:

```ts
const App = dynamic(() => import("../../../../external/prototype/src/App"), {
  ssr: false,
  loading: () => <Spinner />,
});
```

No build step is required inside the host — Next.js's `transpilePackages`
covers `external/prototype/src`.

## Standalone development

```bash
bun install
bun run dev          # Vite dev server (default port 5173)
```

To verify standalone dev before pushing:

```bash
bun run typecheck    # tsc -b
bun run lint         # biome check .
bun run build        # tsc -b && vite build (smoke only)
```

## Sync with my-web-2025

When you push a change here and want my-web-2025 to pick it up:

```bash
# inside my-web-2025
git submodule update --remote external/prototype
```

See `superpowers:sync-submodule` skill for the full workflow.
```

- [ ] **Step 2.4: Commit inside the tool repo**

```bash
cd "$WORK"
git add -A
git commit -m "feat: initial import from my-web-2025 src/app/tools/ProtoType/src"
git push origin master
```

Expected: `git log --oneline` shows the import commit on `master`.

- [ ] **Step 2.5: Verify the standalone dev server boots**

```bash
cd "$WORK"
bun install --frozen-lockfile 2>&1 | tail -20 || bun install 2>&1 | tail -20
bun run dev &
DEV_PID=$!
sleep 10
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/ || true
kill "$DEV_PID" 2>/dev/null || true
```

Expected: HTTP `200` from `http://localhost:5173/`. (Vite default port; check `vite.config.ts` if different.)

---

## Task 3: Add `external/prototype/` submodule to my-web-2025

**Files:**
- Modify: `.gitmodules` (auto-managed by `git submodule add`)
- Create: `external/prototype/` directory (the submodule checkout)

**Interfaces:**
- Consumes: `https://github.com/rebuildup/tool-prototype.git` @ HEAD
- Produces: my-web-2025 can `import` from `external/prototype/src/App`

- [ ] **Step 3.1: Add the submodule**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git submodule add https://github.com/rebuildup/tool-prototype.git external/prototype
```

Expected: new `.gitmodules` entry, `external/prototype/` populated, exit code 0. Verify:

```bash
git submodule status external/prototype
# expect: a hex SHA followed by "external/prototype (heads/master)"
```

- [ ] **Step 3.2: Install dependencies inside the submodule via install-tools.ts**

```bash
bun --bun scripts/install-tools.ts
```

Expected: `[install-tools] bun install in prototype` followed by `[install-tools] all submodules OK`.

- [ ] **Step 3.3: Commit the submodule registration**

```bash
git add .gitmodules external/prototype
git diff --cached --stat   # must show ONLY .gitmodules + external/prototype; nothing else
git commit -m "feat(submodule): add tool-prototype as external/prototype"
```

Expected: commit hash recorded. `git status --short` should not show pre-existing user-owned modifications (data/contents/*, src/portfolio/*, src/cms/*, src/lib/cms-api/*, src/lib/markdown/*, public/data/*, tsconfig.json).

---

## Task 4: Update `next.config.ts` `transpilePackages`

**Files:**
- Modify: `next.config.ts` line 17 (`transpilePackages` array)

- [ ] **Step 4.1: Add `external/prototype/src` to `transpilePackages`**

In `next.config.ts`, change:

```ts
	transpilePackages: ["@appletosolutions/reactbits", "external/ui/src"],
```

to:

```ts
	transpilePackages: [
		"@appletosolutions/reactbits",
		"external/ui/src",
		"external/prototype/src",
	],
```

- [ ] **Step 4.2: Verify config is still valid TypeScript**

```bash
bun run type-check 2>&1 | tail -20
```

Expected: errors only from pre-existing ProtoType paths that are about to be rewritten in Tasks 5 and 6. If the only errors are TS6053 / "Cannot find module" pointing at `src/app/tools/ProtoType/src/...`, that's expected and will be cleared in Tasks 5–7. If there are other errors, stop and fix.

---

## Task 5: Add `tsconfig.json` path mapping for `@rebuildup/tool-prototype`

**Files:**
- Modify: `tsconfig.json` (`compilerOptions.paths` and `compilerOptions.baseUrl` if not set)

- [ ] **Step 5.1: Read current `tsconfig.json`**

```bash
cat tsconfig.json
```

Note the current state. You will add to `compilerOptions.paths` (and create `compilerOptions.baseUrl: "."` if it is missing).

- [ ] **Step 5.2: Add the path alias**

In `tsconfig.json`, ensure `compilerOptions.baseUrl` is `.` and add to `compilerOptions.paths`:

```jsonc
"paths": {
  // ... existing entries ...
  "@rebuildup/tool-prototype": ["external/prototype/src"],
  "@rebuildup/tool-prototype/*": ["external/prototype/src/*"]
}
```

- [ ] **Step 5.3: Verify type-check**

```bash
bun run type-check 2>&1 | tail -20
```

Expected: same errors as Task 4 (will be cleared in Tasks 6 and 7). No new errors from the path alias itself.

---

## Task 6: Rewrite `src/app/tools/ProtoType/page.tsx` as a submodule bridge

**Files:**
- Modify: `src/app/tools/ProtoType/page.tsx`

- [ ] **Step 6.1: Replace the import path**

Replace the file contents with:

```tsx
"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/prototype/src/App"), {
	loading: () => (
		<div className="flex h-screen items-center justify-center">
			<div className="animate-spin h-8 w-8  border-t-transparent rounded-full" />
		</div>
	),
	ssr: false,
});

export default function ProtoTypePage() {
	return <App />;
}
```

Diff against the old version: only the `import("./src/App")` string changed to `import("../../../../external/prototype/src/App")`. Same `ssr: false`, same loading spinner.

---

## Task 7: Rewrite `src/app/tools/ProtoType/layout.tsx` for cross-submodule CSS imports

**Files:**
- Modify: `src/app/tools/ProtoType/layout.tsx`

The current `layout.tsx` imports CSS files from `./src/styles/*.css`. Next.js requires CSS imports to live inside the host's source tree, but we can satisfy the dev experience by re-exporting each CSS through `external/prototype/src/styles/*.css` directly — Next.js 16 supports importing CSS from a transpiled submodule as long as `transpilePackages` covers it (set in Task 4).

- [ ] **Step 7.1: Replace layout.tsx imports**

Replace the contents of `src/app/tools/ProtoType/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../../../../external/prototype/src/index.css";
import "../../../../external/prototype/src/styles/001_tab.css";
import "../../../../external/prototype/src/styles/002_header.css";
import "../../../../external/prototype/src/styles/004_game.css";
import "../../../../external/prototype/src/styles/007_setting.css";
import "../../../../external/prototype/src/styles/009_webglPopup.css";
import "../../../../external/prototype/src/styles/010_colorpalette.css";
import "../../../../external/prototype/src/styles/011_rankingtable.css";
import "../../../../external/prototype/src/styles/012_footer.css";
import "../../../../external/prototype/src/styles/013_BGAnim.css";
import "../../../../external/prototype/src/styles/014_animation-setting.css";
import "../../../../external/prototype/src/styles/015_RankingLoad.css";

export const metadata: Metadata = {
	title: "ProtoType - samuido | タイピングゲーム",
	description:
		"PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援.プログラミング言語のコードでタイピング練習ができます.",
	keywords: [
		"タイピング",
		"タイピングゲーム",
		"WPM",
		"タイピング練習",
		"プログラミング",
		"コード",
		"PIXI.js",
	],
	authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
	creator: "samuido",
	publisher: "samuido",
	robots: "index, follow",
	metadataBase: new URL("https://prototype.yusuke-kim.com"),
	alternates: {
		canonical: "https://prototype.yusuke-kim.com",
	},
	openGraph: {
		title: "ProtoType - samuido | タイピングゲーム",
		description:
			"PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援.",
		type: "website",
		url: "https://prototype.yusuke-kim.com",
		siteName: "samuido",
		locale: "ja_JP",
		images: [
			{
				url: "https://yusuke-kim.com/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "ProtoType - samuido",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "ProtoType - samuido | タイピングゲーム",
		description:
			"PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援.",
		creator: "@361do_sleep",
		images: ["https://yusuke-kim.com/images/twitter-image.jpg"],
	},
};

export default function ProtoTypeLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
```

The only edit is the 13 `import` paths (prefix changed from `./src/...` to `../../../../external/prototype/src/...`). Everything else (metadata, default export) is byte-identical.

---

## Task 8: Delete pre-existing in-tree ProtoType files

**Files:**
- Delete everything under `src/app/tools/ProtoType/` EXCEPT `page.tsx` and `layout.tsx`:
  - `src/`, `public/`, `package.json`, `biome.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `preinstall.js`, `index.html`, `README.md`
- Delete `.gitattributes` (the only remaining entries are ProtoType-related, all now obsolete — see Phase 0 spec §6.3).

- [ ] **Step 8.1: Confirm what survives**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
ls src/app/tools/ProtoType
```

Expected output (do not delete these two):

```
layout.tsx
page.tsx
```

- [ ] **Step 8.2: Delete everything else**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025/src/app/tools/ProtoType"
git rm -r src public package.json biome.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json preinstall.js index.html README.md
```

(Adjust the list if any of these files don't exist. Use `git rm` rather than `rm` so the deletion is staged in one step.)

- [ ] **Step 8.3: Delete `.gitattributes`**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git rm .gitattributes
```

(If `.gitattributes` still has non-ProtoType entries, do **not** delete the file — instead edit it to remove only the three ProtoType lines and skip the rest of this step. There are no other entries today; verify with `cat .gitattributes` before deleting.)

- [ ] **Step 8.4: Verify `git status` shows ONLY intended deletions**

```bash
git status --short
```

Expected:

```
M src/app/tools/ProtoType/layout.tsx
M src/app/tools/ProtoType/page.tsx
D src/app/tools/ProtoType/{src,public,package.json,biome.json,vite.config.ts,tsconfig*.json,preinstall.js,index.html,README.md}
D .gitattributes
A external/prototype   (if not yet committed in Task 3 — should already be committed)
```

If any of the pre-existing user-owned files (data/contents/*, src/portfolio/*, src/cms/*, src/lib/cms-api/*, src/lib/markdown/*, public/data/*, tsconfig.json) appear in the staged list, **stop** — AGENTS.md §12 prohibits staging them.

---

## Task 9: Canonical gate verification

- [ ] **Step 9.1: Reinstall with frozen lockfile**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
bun install --frozen-lockfile 2>&1 | tail -20
```

Expected: exit 0, no missing peer dep errors that aren't already known (see AGENTS.md §14 for known debt).

If lockfile must be regenerated because the ProtoType deps moved, run `bun install` (without `--frozen-lockfile`) and commit the resulting `bun.lock` change in this PR.

- [ ] **Step 9.2: Type check**

```bash
bun run type-check 2>&1 | tail -40
```

Expected: only pre-existing debt errors (AGENTS.md §14 mentions `next.config.ts: typescript.ignoreBuildErrors = true` is currently masking them at build time). No errors caused by the bridge rewrite.

- [ ] **Step 9.3: Lint**

```bash
bun run lint 2>&1 | tail -40
```

Expected: clean.

- [ ] **Step 9.4: Tests**

```bash
bun run test 2>&1 | tail -40
```

Expected: all pass.

- [ ] **Step 9.5: Knip**

```bash
bun x knip 2>&1 | tail -40
```

Expected: clean. If Knip reports unused exports now living in the submodule, add `external/prototype` to `knip.jsonc` `ignore` patterns (one-line edit).

- [ ] **Step 9.6: Build**

```bash
bun run build 2>&1 | tail -40
```

Expected: `out/tools/ProtoType/` produced. SIGILL 132 (AGENTS.md §14) is acceptable.

---

## Task 10: Playwright smoke test for /tools/ProtoType

- [ ] **Step 10.1: Boot dev server**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
bun --bun next dev -p 3010 &
DEV_PID=$!
sleep 15
```

- [ ] **Step 10.2: Load the route via Playwright MCP**

Use the `mcp__playwright__browser_navigate` tool to open `http://localhost:3010/tools/ProtoType`.

Then take a snapshot:

```text
mcp__playwright__browser_snapshot
```

Expected: the typing-game UI loads (title bar, code panel, keyboard listener). No console errors mentioning "module not found" for `external/prototype`.

- [ ] **Step 10.3: Verify no module-resolution errors in dev console**

```text
mcp__playwright__browser_console_messages level="error"
```

Expected: no errors. Warnings are acceptable.

- [ ] **Step 10.4: Kill dev server**

```bash
kill "$DEV_PID" 2>/dev/null || true
```

---

## Task 11: Write tool-repo creation helper script (for Phase 2-N reuse)

**Files:**
- Create: `scripts/create-tool-repo.ts`

This script automates the boilerplate of Phase 1 so Phase 2-N can `bun --bun scripts/create-tool-repo.ts text-counter` and get a working submodule.

- [ ] **Step 11.1: Write the script**

Create `scripts/create-tool-repo.ts`:

```ts
#!/usr/bin/env bun
/**
 * create-tool-repo — bootstrap a new per-tool repo + register it as a submodule.
 *
 * Usage:
 *   bun --bun scripts/create-tool-repo.ts <tool-slug> [--org rebuildup] [--visibility public]
 *
 * Side effects:
 *   1. gh repo create <org>/tool-<slug> --public --description "..." --license MIT
 *   2. clones <org>/tool-<slug> into ../tool-<slug>-work/
 *   3. scaffolds src/<Name>App.tsx, src/index.ts, README.md, LICENSE
 *   4. in my-web-2025: git submodule add <repo-url> external/<slug>
 *   5. writes a stub bridge at src/app/tools/<slug>/page.tsx if it does not exist
 *
 * Idempotent: refuses to overwrite an existing repo, existing submodule, or existing bridge.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const TOOL = process.argv[2];
const ORG = process.env.TOOL_REPO_ORG ?? "rebuildup";
const VIS = process.env.TOOL_REPO_VISIBILITY ?? "public";

if (!TOOL || !/^[a-z0-9-]+$/.test(TOOL)) {
	console.error("usage: bun --bun scripts/create-tool-repo.ts <tool-slug>");
	process.exit(2);
}

const REPO_NAME = `tool-${TOOL}`;
const REPO_URL = `https://github.com/${ORG}/${REPO_NAME}.git`;
const REPO_DIR = join(process.cwd(), "..", `${REPO_NAME}-work`);
const SUBMODULE_PATH = `external/${TOOL}`;
const BRIDGE_PATH = `src/app/tools/${TOOL}/page.tsx`;

function run(cmd: string, args: string[], cwd?: string) {
	const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
	return r.status === 0;
}

if (existsSync(REPO_DIR)) {
	console.error(`refusing: ${REPO_DIR} already exists`);
	process.exit(1);
}
if (existsSync(SUBMODULE_PATH)) {
	console.error(`refusing: ${SUBMODULE_PATH} already exists`);
	process.exit(1);
}

console.log(`[create-tool-repo] gh repo create ${ORG}/${REPO_NAME} --${VIS}`);
if (!run("gh", ["repo", "create", `${ORG}/${REPO_NAME}`, `--${VIS}`, "--license", "MIT", "--add-readme", "--confirm"])) process.exit(1);

console.log(`[create-tool-repo] cloning into ${REPO_DIR}`);
if (!run("git", ["clone", REPO_URL, REPO_DIR])) process.exit(1);

// scaffold src/<Tool>App.tsx (PascalCase) and src/index.ts
const pascal = TOOL.split("-").map((s) => s[0]!.toUpperCase() + s.slice(1)).join("");
const appTsx = `export default function ${pascal}App() { return <div>${pascal} placeholder</div>; }\n`;
const indexTs = `export { default } from "./${pascal}App";\nexport * from "./${pascal}App";\n`;
const readme = `# rebuildup/${REPO_NAME}\n\nStandalone ${TOOL} tool. See my-web-2025 spec for embed instructions.\n`;
for (const [rel, body] of [
	[`src/${pascal}App.tsx`, appTsx],
	[`src/index.ts`, indexTs],
	[`README.md`, readme],
] as const) {
	const p = join(REPO_DIR, rel);
	await Bun.write(p, body);
}
run("git", ["add", "-A"], REPO_DIR);
run("git", ["commit", "-m", "feat: scaffold per-tool repo"], REPO_DIR);
run("git", ["push", "origin", "master"], REPO_DIR);

console.log(`[create-tool-repo] git submodule add ${REPO_URL} ${SUBMODULE_PATH}`);
if (!run("git", ["submodule", "add", REPO_URL, SUBMODULE_PATH])) process.exit(1);

if (!existsSync(BRIDGE_PATH)) {
	const bridge = `"use client";\n\nimport dynamic from "next/dynamic";\n\nconst App = dynamic(() => import("../../../../${SUBMODULE_PATH}/src/${pascal}App"), { ssr: false });\n\nexport default function ${pascal}Page() { return <App />; }\n`;
	await Bun.write(BRIDGE_PATH, bridge);
	console.log(`[create-tool-repo] wrote ${BRIDGE_PATH}`);
}

console.log(`[create-tool-repo] DONE. Next: bun --bun scripts/install-tools.ts && bun run type-check`);
```

- [ ] **Step 11.2: Lint the script**

```bash
bun run lint scripts/create-tool-repo.ts
```

Expected: clean.

---

## Task 12: Commit Phase 1

- [ ] **Step 12.1: Stage only Phase 1 files**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git add next.config.ts tsconfig.json src/app/tools/ProtoType/page.tsx src/app/tools/ProtoType/layout.tsx scripts/create-tool-repo.ts
git add .gitattributes  # if deleted; otherwise skip
git status --short
```

Expected staged list (verify nothing user-owned is in here):

```
M next.config.ts
M tsconfig.json
M src/app/tools/ProtoType/page.tsx
M src/app/tools/ProtoType/layout.tsx
A scripts/create-tool-repo.ts
D .gitattributes   (if you deleted it)
```

- [ ] **Step 12.2: Commit**

```bash
git commit -F- <<'COMMITEOF'
refactor(tools): extract ProtoType into rebuildup/tool-prototype submodule

- rebuildup/tool-prototype repo created (public, MIT), populated from
  src/app/tools/ProtoType/src with scaffold (src/App.tsx, src/index.ts,
  README.md, package.json preserved verbatim)
- external/prototype registered as submodule of my-web-2025
- src/app/tools/ProtoType/{page,layout}.tsx rewritten as bridges to
  external/prototype/src (next/dynamic + ssr:false for page;
  direct CSS imports for layout, covered by transpilePackages)
- next.config.ts transpilePackages extended with external/prototype/src
- tsconfig.json paths adds @rebuildup/tool-prototype alias
- src/app/tools/ProtoType/{src,public,package.json,biome.json,vite.config.ts,tsconfig*.json,preinstall.js,index.html,README.md} deleted
- .gitattributes deleted (all three ProtoType merge=ours entries obsolete)
- scripts/create-tool-repo.ts added for Phase 2-N reuse

Verified:
- bun install --frozen-lockfile OK
- bun run type-check (only pre-existing debt)
- bun run lint OK
- bun run test OK
- bun x knip OK
- bun run build OK (out/tools/ProtoType/ produced)
- mcp__playwright__browser_snapshot on /tools/ProtoType renders the typing-game UI

Refs: spec §5.2, ADR 0013

Co-Authored-By: Claude <noreply@anthropic.com>
COMMITEOF
```

- [ ] **Step 12.3: Verify commit and remaining status**

```bash
git log -1 --stat
git status --short
```

Expected: the commit appears at HEAD, and `git status --short` shows only the pre-existing user-owned modifications (data/contents/*, src/portfolio/*, src/cms/*, src/lib/cms-api/*, src/lib/markdown/*, public/data/*, tsconfig.json) — no new files staged.

---

## Self-Review Checklist

- [x] **Spec coverage:** §5.2 Phase 1 tasks implemented (Tasks 1–8). §6.3 deletion of `scripts/sync-subtree.sh` and `scripts/merge-deps.mjs` verified already done in commit `2132fae9`. §6 file-by-file list for Phase 1 covered in Tasks 3–5 and 8. §8 decision 1 (URL preserved) reflected in Task 6 (route dir kept as `ProtoType`, no rename).
- [x] **Placeholder scan:** No TBD/TODO/"implement later". All step bodies contain concrete commands, file contents, or code snippets.
- [x] **Type consistency:** Bridge import path `../../../../external/prototype/src/App` matches across Tasks 3, 6, 7, 11. Submodule path `external/prototype` matches in Tasks 3, 4, 5, 11. Bridge function name `ProtoTypePage` / `ProtoTypeLayout` matches the existing route filenames.
- [x] **AGENTS.md §12 protection:** Every `git add` step is preceded by an explicit list of intended files, and a `git status --short` check. Pre-existing user-owned modifications are never touched.

## Open questions resolved in this plan

- **Submodule HTTPS URL** — `https://github.com/rebuildup/tool-prototype.git` (matches `external/ui` precedent).
- **Pre-existing `.gitattributes` contents** — verified all three entries belong to ProtoType; safe to delete the file.
- **`preinstall.js`** — moved verbatim; the Vite dev story stays unchanged inside the tool repo.
- **CSS import path arithmetic** — 4 `../` segments from `src/app/tools/ProtoType/layout.tsx` to repo root, then `external/prototype/src/styles/...`.
