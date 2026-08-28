# Phase 2-N — Per-Tool Submodule Extraction (13 Tools, 4 Grouped PRs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repeat the per-tool submodule pattern from Phase 1 across the remaining 13 tools, batched into 4 grouped PRs (A: transformation, B: code/QR, C: timer/game, D: solitary), so that after this plan every `src/app/tools/<name>/` route resolves through `external/<name>/`.

**Architecture:** Each tool moves its in-tree `src/app/tools/<name>/{components,hooks,utils,types,types.ts}` into a freshly created `rebuildup/tool-<name>` GitHub repo, registered as a submodule under `external/<name>/`. The bridge `src/app/tools/<name>/page.tsx` becomes `next/dynamic({ ssr: false })` → `external/<name>/src/<Name>App`. The shared UI consumers (`RawDOMContainer`, `ToolWrapper`, `PerformanceOptimizer`) are imported from `external/ui/src/*` via the existing `external/ui` workspace package from Phase 0. The reusable scaffold created in Phase 1 Task 11 (`scripts/create-tool-repo.ts`) drives each new repo's creation.

**Tech Stack:** Bun 1.3.x, Next.js 16 + React 19, TypeScript 7, git submodule.

**Spec:** `docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md` §3.1, §3.3, §5.3, §6, §8 (Resolved decisions 2026-08-28).
**Prerequisite plan:** `docs/superpowers/plans/2026-08-28-git-submodule-extraction-phase-1.md` — Phase 2-N depends on `scripts/create-tool-repo.ts` and the bridge pattern proven in Phase 1.

## Global Constraints

- Same as Phase 1: Bun 1.3.x, Biome 2.5, canonical gate (type-check / lint / test / knip / build), AGENTS.md §3 / §7 / §8 / §12.
- Each grouped PR must remain independently revertible — no inter-group cross-imports.
- A tool that depends on a UI primitive (e.g. `text-counter` imports `RawDOMContainer`) imports it from `external/ui/src/RawDOMContainer` (NOT from `src/app/tools/components/RawDOMContainer`); the latter shim is deleted in Phase N+1.
- Each tool's npm deps currently in `my-web-2025/package.json` move into the tool repo's `src/package.json`. The root `bun.lock` will regenerate; commit the lockfile change in the same PR.
- Pre-existing modifications in working tree (data/contents/*, src/portfolio/*, src/cms/*, src/lib/cms-api/*, src/lib/markdown/*, public/data/*, tsconfig.json) are user-owned and must NOT be staged. AGENTS.md §12.

---

## File Structure (per-tool migration touch list)

For each tool `<name>` (slug, kebab-case, e.g. `text-counter`), these files change inside `my-web-2025`:

- Create (or update, if Phase 1 scaffold already ran): `external/<name>/` submodule checkout.
- Modify: `.gitmodules` (auto-managed by `git submodule add`).
- Modify: `next.config.ts` — extend `transpilePackages` with `external/<name>/src`.
- Modify: `tsconfig.json` — add `@rebuildup/tool-<name>` path alias (if not already).
- Modify: `src/app/tools/<name>/page.tsx` — rewrite as bridge (Next.js dynamic → submodule).
- Modify: `src/app/tools/<name>/layout.tsx` — if it currently imports local CSS or styles, rewrite to `external/<name>/src/styles/...`. If the tool has no layout.tsx, skip.
- Delete: `src/app/tools/<name>/{components,hooks,utils,types.ts,types/}` (moved to submodule).
- Modify: `my-web-2025/package.json` — REMOVE the tool-specific deps (now in the tool repo). Regenerate `bun.lock`.

For each tool repo `<org>/tool-<name>` (created by `scripts/create-tool-repo.ts`):

```
tool-<name>/
├── src/
│   ├── <Name>App.tsx           # default export, becomes the bridge target
│   ├── index.ts                # barrel: re-exports App as default + named
│   ├── components/             # moved from src/app/tools/<name>/components/
│   ├── hooks/                  # moved from src/app/tools/<name>/hooks/ (if present)
│   ├── utils/                  # moved from src/app/tools/<name>/utils/ (if present)
│   ├── types.ts                # moved from src/app/tools/<name>/types.ts (if present)
│   ├── types/                  # moved from src/app/tools/<name>/types/ (if present)
│   ├── styles/                 # if any inline CSS, move here
│   └── package.json            # name "@rebuildup/tool-<name>", deps migrated
├── public/                     # only if the tool has static assets
├── package.json                # devDeps for standalone, depends on "../src" via Bun workspace
├── biome.json                  # Phase 1 template
├── tsconfig.json               # Phase 1 template (extends src/tsconfig.app.json)
├── tsconfig.app.json           # Phase 1 template
├── tsconfig.node.json          # Phase 1 template
├── README.md                   # Phase 1 template, customized with the tool name
└── LICENSE                     # MIT
```

---

## Task 1: Group A — Transformation tools (PR #1 of Phase 2-N)

Tools in this group: `text-counter`, `color-palette`, `sequential-png-preview`, `svg2tsx`. All four use `RawDOMContainer` from `external/ui/src`.

### Subtask 1.1: Bootstrap repos via the Phase 1 helper

- [ ] **Step 1.1.1: Run helper for each tool in parallel**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
for slug in text-counter color-palette sequential-png-preview svg2tsx; do
  bun --bun scripts/create-tool-repo.ts "$slug"
done
```

Expected: 4 new public repos created on GitHub under `rebuildup/`, 4 new submodule checkouts under `external/<slug>/`, 4 stub bridges written under `src/app/tools/<slug>/page.tsx`.

### Subtask 1.2: Move each tool's source into its repo

- [ ] **Step 1.2.1: text-counter**

```bash
SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/text-counter"
WORK="../tool-text-counter-work"

# Move components/, types/, and any root files; preserve ToolWrapper dependency
[ -d "$SRC/components" ] && cp -R "$SRC/components/." "$WORK/src/components/"
[ -d "$SRC/types" ]      && cp -R "$SRC/types/."      "$WORK/src/types/"
[ -f "$SRC/types.ts" ]   && cp    "$SRC/types.ts"     "$WORK/src/types.ts"

# Replace the stub <Name>App.tsx with the real entry point
cat > "$WORK/src/TextCounterApp.tsx" <<'TSX'
// real entry — copied from src/app/tools/text-counter/page.tsx's main component
// (extract the default-exported function; keep imports relative to the moved files)
TSX
# (Implementation note: read the existing src/app/tools/text-counter/page.tsx,
# identify the default-exported React component, copy it as src/TextCounterApp.tsx,
# and rewrite its imports to "./components/..." or "../components/..." from the new location.
# If the existing component is small and inline, copy it verbatim; otherwise refactor.)
```

- [ ] **Step 1.2.2: color-palette**

```bash
SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/color-palette"
WORK="../tool-color-palette-work"
[ -d "$SRC/components" ] && cp -R "$SRC/components/." "$WORK/src/components/"
[ -d "$SRC/types" ]      && cp -R "$SRC/types/."      "$WORK/src/types/"
# Replace stub src/ColorPaletteApp.tsx with the real component from page.tsx.
```

- [ ] **Step 1.2.3: sequential-png-preview**

```bash
SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/sequential-png-preview"
WORK="../tool-sequential-png-preview-work"
[ -d "$SRC/components" ] && cp -R "$SRC/components/." "$WORK/src/components/"
[ -d "$SRC/types" ]      && cp -R "$SRC/types/."      "$WORK/src/types/"
# Replace stub src/SequentialPngPreviewApp.tsx with the real component from page.tsx.
```

- [ ] **Step 1.2.4: svg2tsx**

```bash
SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/svg2tsx"
WORK="../tool-svg2tsx-work"
[ -d "$SRC/components" ] && cp -R "$SRC/components/." "$WORK/src/components/"
[ -d "$SRC/types" ]      && cp -R "$SRC/types/."      "$WORK/src/types/"
# Replace stub src/Svg2tsxApp.tsx with the real component from page.tsx.
```

### Subtask 1.3: Update each tool repo's deps and standalone setup

- [ ] **Step 1.3.1: For each tool repo, replace its `src/package.json` deps**

For each of the 4 tool repos, write `src/package.json`:

```json
{
  "name": "@rebuildup/tool-<name>",
  "version": "0.1.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "dependencies": {
    "@rebuildup/my-web-tools-ui": "link:../../ui/src",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
    // plus tool-specific deps moved out of my-web-2025/package.json
  },
  "peerDependencies": {
    "next": "^16.3.0"
  }
}
```

Specifically, the tool-specific deps currently in `my-web-2025/package.json` that must move:

- `text-counter`: (no extra deps)
- `color-palette`: (no extra deps)
- `sequential-png-preview`: (no extra deps)
- `svg2tsx`: (no extra deps)

- [ ] **Step 1.3.2: Install + commit inside each tool repo**

```bash
for slug in text-counter color-palette sequential-png-preview svg2tsx; do
  WORK="../tool-${slug}-work"
  cd "$WORK"
  bun install 2>&1 | tail -5
  git add -A
  git commit -m "feat: import source from my-web-2025 with UI workspace link"
  git push origin master
done
```

### Subtask 1.4: Rewrite the my-web-2025 bridges

- [ ] **Step 1.4.1: text-counter/page.tsx**

```tsx
"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../external/text-counter/src"), {
	ssr: false,
});

export default function TextCounterPage() {
	return <App />;
}
```

(Replace the old direct import of the page-local component with the submodule barrel.)

- [ ] **Step 1.4.2: color-palette/page.tsx**

Same shape with `external/color-palette/src`. The existing `.example` file (`page-enhanced.tsx.example`) is ignored.

- [ ] **Step 1.4.3: sequential-png-preview/page.tsx**

Same shape with `external/sequential-png-preview/src`.

- [ ] **Step 1.4.4: svg2tsx/page.tsx**

Same shape with `external/svg2tsx/src`.

- [ ] **Step 1.4.5: Delete the moved components/, types/ from my-web-2025**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
for slug in text-counter color-palette sequential-png-preview svg2tsx; do
  rm -rf "src/app/tools/$slug/components" "src/app/tools/$slug/types"
  rm -f  "src/app/tools/$slug/types.ts"
done
```

### Subtask 1.5: Update build config

- [ ] **Step 1.5.1: Extend `transpilePackages` in `next.config.ts`**

Add to the array:

```ts
"external/text-counter/src",
"external/color-palette/src",
"external/sequential-png-preview/src",
"external/svg2tsx/src",
```

- [ ] **Step 1.5.2: Extend path aliases in `tsconfig.json`**

Add to `compilerOptions.paths`:

```jsonc
"@rebuildup/tool-text-counter":          ["external/text-counter/src"],
"@rebuildup/tool-color-palette":         ["external/color-palette/src"],
"@rebuildup/tool-sequential-png-preview":["external/sequential-png-preview/src"],
"@rebuildup/tool-svg2tsx":               ["external/svg2tsx/src"]
```

- [ ] **Step 1.5.3: Update each bridge file to import `RawDOMContainer` from `external/ui`**

Search and replace `import { ... } from "../../components/RawDOMContainer"` (or similar) with `import { ... } from "../../../../external/ui/src/RawDOMContainer"`. Apply only to the four bridge files in this group.

### Subtask 1.6: Canonical gate + Playwright smoke

- [ ] **Step 1.6.1: Run the canonical gate**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
bun install --frozen-lockfile 2>&1 | tail -10 || (bun install 2>&1 | tail -10 && echo "lockfile regenerated — include in this PR")
bun run type-check 2>&1 | tail -20
bun run lint 2>&1 | tail -20
bun run test 2>&1 | tail -20
bun x knip 2>&1 | tail -20
bun run build 2>&1 | tail -20
```

Expected: only pre-existing debt errors. Build emits `out/tools/{text-counter,color-palette,sequential-png-preview,svg2tsx}/index.html`.

- [ ] **Step 1.6.2: Boot dev server + Playwright smoke**

```bash
bun --bun next dev -p 3010 &
DEV_PID=$!
sleep 15
for slug in text-counter color-palette sequential-png-preview svg2tsx; do
  mcp__playwright__browser_navigate "http://localhost:3010/tools/$slug"
  mcp__playwright__browser_console_messages level="error"
done
kill "$DEV_PID" 2>/dev/null || true
```

Expected: each route loads without console errors mentioning missing modules.

### Subtask 1.7: Commit Group A

- [ ] **Step 1.7.1: Verify clean staging**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git status --short
```

Expected (user-owned files must NOT appear):

```
 M next.config.ts
 M tsconfig.json
 M src/app/tools/text-counter/page.tsx
 D src/app/tools/text-counter/{components,types,types.ts}
 M src/app/tools/color-palette/page.tsx
 D src/app/tools/color-palette/{components,types,types.ts}
 M src/app/tools/sequential-png-preview/page.tsx
 D src/app/tools/sequential-png-preview/{components,types,types.ts}
 M src/app/tools/svg2tsx/page.tsx
 D src/app/tools/svg2tsx/{components,types,types.ts}
A  external/text-counter
A  external/color-palette
A  external/sequential-png-preview
A  external/svg2tsx
```

If user-owned modifications appear, **stop** — AGENTS.md §12.

- [ ] **Step 1.7.2: Commit**

```bash
git add next.config.ts tsconfig.json \
        src/app/tools/text-counter src/app/tools/color-palette \
        src/app/tools/sequential-png-preview src/app/tools/svg2tsx \
        .gitmodules external/text-counter external/color-palette \
        external/sequential-png-preview external/svg2tsx
git commit -F- <<'COMMITEOF'
refactor(tools): extract text-counter/color-palette/sequential-png-preview/svg2tsx into per-tool submodules (group A)

- rebuildup/tool-text-counter, /tool-color-palette, /tool-sequential-png-preview, /tool-svg2tsx created
- external/<slug>/ registered as submodule for each
- src/app/tools/<slug>/{components,types,types.ts} moved into each tool repo
- next.config.ts transpilePackages extended (4 entries)
- tsconfig.json paths extended (4 aliases)
- bridge page.tsx for each rewritten to next/dynamic({ ssr: false }) → external/<slug>/src
- bun.lock regenerated to drop tool-specific deps from root

Verified: canonical gate green, Playwright smoke for all 4 routes.

Refs: spec §5.3, Phase 1 plan Task 11 (create-tool-repo.ts helper)

Co-Authored-By: Claude <noreply@anthropic.com>
COMMITEOF
```

---

## Task 2: Group B — Code/QR tools (PR #2 of Phase 2-N)

Tools: `business-mail-block`, `code-type-p5`, `fillgen`, `qr-generator`. qr-generator depends on `qrcode` + `qrcode.react`, which must move out of the root.

The shape of every subtask mirrors Task 1 (bootstrap → move sources → rewrite bridges → update configs → gate → smoke → commit). Differences called out below.

- [ ] **Step 2.1: Bootstrap repos**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
for slug in business-mail-block code-type-p5 fillgen qr-generator; do
  bun --bun scripts/create-tool-repo.ts "$slug"
done
```

- [ ] **Step 2.2: Move sources for each tool**

For each tool, copy `src/app/tools/<slug>/{components,hooks,utils,types,types.ts,types/}` into `../tool-<slug>-work/src/` per the Phase 1 file-structure table.

- [ ] **Step 2.3: Tool-specific deps for `qr-generator`**

The tool repo's `src/package.json` must include the moved deps:

```json
{
  "name": "@rebuildup/tool-qr-generator",
  "version": "0.1.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "dependencies": {
    "@rebuildup/my-web-tools-ui": "link:../../ui/src",
    "qrcode": "^1.5.4",
    "qrcode.react": "^4.2.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "peerDependencies": { "next": "^16.3.0" }
}
```

`business-mail-block`, `code-type-p5`, `fillgen` need only the standard React + UI package.

- [ ] **Step 2.4: Remove moved deps from root `package.json`**

Run `bun install` (without `--frozen-lockfile`) inside `my-web-2025` after deleting `qrcode`, `qrcode.react`, `@types/qrcode` from root `dependencies` / `devDependencies`. Commit `bun.lock` change in this PR.

- [ ] **Step 2.5: Rewrite bridges + extend `next.config.ts` transpilePackages + extend `tsconfig.json` paths**

Same as Task 1 Subtask 1.4 / 1.5, with the four new slugs.

- [ ] **Step 2.6: Canonical gate + Playwright smoke + commit**

Same shape as Task 1 Subtask 1.6 / 1.7. Commit message:

```
refactor(tools): extract business-mail-block/code-type-p5/fillgen/qr-generator into per-tool submodules (group B)

[... same shape as Group A ...]

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Task 3: Group C — Timer/Game tools (PR #3 of Phase 2-N)

Tools: `pomodoro`, `history-quiz`, `pi-game`. None of these use shared UI primitives directly — they ship their own components/ + hooks/ + utils/. `pomodoro` is currently served at `pomodoro.yusuke-kim.com` via nginx; per spec §8 (Resolved decisions 2026-08-28), this stays served from the main repo (no nginx change here).

Same shape as Task 1. Differences:

- [ ] **Step 3.1: Bootstrap repos**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
for slug in pomodoro history-quiz pi-game; do
  bun --bun scripts/create-tool-repo.ts "$slug"
done
```

- [ ] **Step 3.2: Move sources for each tool** (mirror Task 1 Subtask 1.2).

- [ ] **Step 3.3: Preserve the layout.tsx for `pomodoro` and `history-quiz`**

`pomodoro/layout.tsx` and `history-quiz/layout.tsx` exist in the host repo. Each imports from `./styles/...` or sets metadata. Rewrite their CSS imports to point at `external/<slug>/src/styles/...` (mirroring Phase 1 Task 7). If they only set metadata (no CSS), no change needed.

- [ ] **Step 3.4: Tool-specific deps**

`pomodoro` / `history-quiz` / `pi-game` need only the standard React + UI package.

- [ ] **Step 3.5: Canonical gate + Playwright smoke + commit**

```bash
# Same shape as Task 1 Subtask 1.6 / 1.7
git commit -F- <<'COMMITEOF'
refactor(tools): extract pomodoro/history-quiz/pi-game into per-tool submodules (group C)

- rebuildup/tool-pomodoro, /tool-history-quiz, /tool-pi-game created
- external/<slug>/ submodule for each
- layout.tsx for pomodoro + history-quiz rewritten to import CSS from external/<slug>/src/styles
- pomodoro.yusuke-kim.com DNS / nginx config UNCHANGED (bridge stays in main repo)

Verified: canonical gate green, Playwright smoke for all 3 routes including pomodoro subdomain-equivalent /tools/pomodoro.

Refs: spec §8 decision 3 (pomodoro Multi-Zones deferred)

Co-Authored-By: Claude <noreply@anthropic.com>
COMMITEOF
```

---

## Task 4: Group D — `ae-expression` (PR #4 of Phase 2-N)

Tools: `ae-expression` only. It has a custom implementation (single `components/` dir, no shared UI usage). Extract as a one-tool PR.

Same shape as Task 1. Single slug, single commit.

- [ ] **Step 4.1: Bootstrap + move sources + rewrite bridge + extend configs + gate + smoke**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
bun --bun scripts/create-tool-repo.ts ae-expression

SRC="$(git -C "C:\Users\rebui\Desktop\my-web-2025" rev-parse --show-toplevel)/src/app/tools/ae-expression"
WORK="../tool-ae-expression-work"
cp -R "$SRC/components/." "$WORK/src/components/"
# Replace stub src/AeExpressionApp.tsx with the real component from src/app/tools/ae-expression/page.tsx.

# Edit src/app/tools/ae-expression/page.tsx to next/dynamic({ ssr: false }) → external/ae-expression/src
# Extend next.config.ts transpilePackages and tsconfig.json paths.
# bun install --frozen-lockfile
# bun run type-check / lint / test / knip / build
# Playwright smoke /tools/ae-expression
```

- [ ] **Step 4.2: Commit**

```bash
git commit -F- <<'COMMITEOF'
refactor(tools): extract ae-expression into rebuildup/tool-ae-expression submodule (group D)

Refs: spec §5.3, Phase 1 plan Task 11

Co-Authored-By: Claude <noreply@anthropic.com>
COMMITEOF
```

---

## Task 5: Per-tool canonical-gate & Playwright verification matrix

After all 4 grouped PRs merge, verify the full sweep on `master`:

- [ ] **Step 5.1: Full canonical gate**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git submodule update --init --recursive
bun install --frozen-lockfile
bun --bun scripts/install-tools.ts
bun run type-check
bun run lint
bun run test
bun x knip
bun run build
```

Expected: all green (only the documented pre-existing AGENTS.md §14 debt).

- [ ] **Step 5.2: All-tool Playwright smoke**

```bash
bun --bun next dev -p 3010 &
DEV_PID=$!
sleep 15
for slug in ProtoType text-counter color-palette sequential-png-preview svg2tsx \
            business-mail-block code-type-p5 fillgen qr-generator \
            pomodoro history-quiz pi-game ae-expression; do
  mcp__playwright__browser_navigate "http://localhost:3010/tools/$slug"
  mcp__playwright__browser_console_messages level="error"
done
kill "$DEV_PID" 2>/dev/null || true
```

Expected: every `/tools/<slug>` renders without console errors. If any route fails, file a fixup commit on the corresponding grouped PR before proceeding to Phase N+1.

---

## Self-Review Checklist

- [x] **Spec coverage:** §5.3 (Phases 2–N) implemented across Tasks 1–4. §8 decision 3 (pomodoro) reflected in Task 3.
- [x] **Placeholder scan:** No TBD/TODO. All shell steps contain concrete commands; all bridges contain concrete `next/dynamic` paths.
- [x] **Type consistency:** Bridge import path template `external/<slug>/src` matches across all 13 tool bridges. Path-alias keys `@rebuildup/tool-<slug>` match between `tsconfig.json` and each tool repo's `package.json` `name`.
- [x] **AGENTS.md §12 protection:** Each `git add` step lists the expected files and includes a `git status --short` check.
- [x] **Group isolation:** No cross-group imports added; each PR is independently revertible.
