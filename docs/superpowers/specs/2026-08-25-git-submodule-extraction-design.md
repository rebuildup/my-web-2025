# Git Submodule Extraction — Design Spec

**Date:** 2026-08-25
**Status:** Accepted (open questions resolved 2026-08-28)
**Author:** Claude (brainstorming → writing-plans flow)
**Project:** `rebuildup/my-web-2025`

## 1. Context and motivation

### 1.1 Today

`my-web-2025` is a single Next.js 16 + React 19 + TypeScript 7 personal site deployed to GCP VM via nginx. It carries 14 tools under `src/app/tools/<name>/`. Only `ProtoType` is currently pulled in from an external repository (via `git subtree`, commit `4993db38`). The other 13 tools are authored in-repo.

The canonical subtree workflow lives in:

- `scripts/sync-subtree.sh` — pull/push
- `scripts/merge-deps.mjs` — merge upstream deps into root `package.json`
- `.gitattributes` — `merge=ours` bridge protection for `ProtoType/page.tsx`, `ProtoType/layout.tsx`, `ProtoType/src/gamesets/025_SquareEffect.ts`
- `.claude/skills/sync-external-tool/SKILL.md` and `.agents/skills/sync-external-tool/SKILL.md` — workflow spec
- `.claude/agents/tool-bridge-auditor.md` — read-only bridge audit agent

### 1.2 Motivation

The user wants each tool to "be its own repo" so that:

- **Ownership is explicit.** No tool is the *debt* of `my-web-2025`. Each tool repo has its own version, its own CI, its own release story.
- **The main repo stays thin.** Today `my-web-2025/.git` carries the full history of `ProtoType` inlined via subtree squash-merges. With submodules, the main repo holds only a SHA pointer.
- **Each tool runs standalone.** `git clone <tool-repo> && bun dev` works without the main repo. Useful for tool authors and for individual tool deployments.
- **`my-web-2025` still composes them all.** Submodules let the main repo bundle every tool into the static export.

This is a structural rewrite — not a refactor — of how the site is composed.

## 2. Goals and non-goals

### 2.1 Goals

1. Each of the 14 tools lives in its own GitHub repo under the `rebuildup` org.
2. Each tool repo is runnable standalone (`bun dev` shows just that tool).
3. `my-web-2025` references every tool via `git submodule`.
4. The shared UI library (`src/app/tools/components/`) becomes a separate repo consumed via Bun workspace.
5. `bun run build` (the canonical gate from `AGENTS.md` §3) still produces the static export under `out/` with all tool routes intact.
6. The fresh-clone gate (`AGENTS.md` §13) works with one extra command: `git submodule update --init --recursive`.

### 2.2 Non-goals (this spec)

- Replacing `@appletosolutions/reactbits` (an npm dep with a `transpilePackages` hack — out of scope; revisit only if requested).
- Splitting the Rust CMS API (`apps/cms-api/`) — already its own cargo project.
- Splitting the SQLite CMS DB schema — the per-content-DB model is internal to `src/cms/`.
- Publishing the UI package to npm — Bun workspace only (decision §6.4).
- Changing the public URL surface — `/tools/<name>` routes still work, just composed from submodules.
- Big-bang migration — phased, ProtoType first.

## 3. Target architecture

### 3.1 Per-tool repo layout

```
<tool-repo>/                          # e.g. rebuildup/tool-text-counter
├── src/                              # Embedded React component(s) — shared with my-web-2025
│   ├── <Name>App.tsx                 # Default-exported React component
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── types.ts
│   └── package.json                  # name: "@rebuildup/tool-<name>"; deps: tool-specific
├── standalone/                       # Demo Next.js app — `bun dev` inside this repo
│   ├── app/
│   │   └── page.tsx                  # imports "../src/<Name>App"
│   ├── next.config.ts
│   ├── biome.json
│   ├── tsconfig.json
│   └── package.json                  # devDeps: next, react; dep: "@rebuildup/tool-<name>": "link:../src"
├── .gitignore
├── biome.json                        # root-level Biome for src/
├── tsconfig.json
├── README.md                         # standalone dev + embed instructions
└── LICENSE
```

The `src/` package is the unit of reuse. The `standalone/` wrapper exists only to give the tool its own `bun dev` story; it imports from `../src/`.

### 3.2 UI package repo layout

```
my-web-tools-ui/                      # rebuildup/my-web-tools-ui
├── src/
│   ├── ToolWrapper.tsx
│   ├── RawDOMContainer.tsx
│   └── PerformanceOptimizer.tsx
├── package.json                      # name: "@rebuildup/my-web-tools-ui"; peerDeps: react
├── biome.json
├── tsconfig.json
├── README.md
└── LICENSE
```

No `standalone/` — UI is library-only.

### 3.3 Main repo layout after migration

```
my-web-2025/
├── .gitmodules                       # NEW: 14 submodule entries (15 with UI)
├── external/                         # Submodule checkouts
│   ├── ui/                           # → rebuildup/my-web-tools-ui
│   ├── text-counter/                 # → rebuildup/tool-text-counter
│   ├── business-mail-block/          # → rebuildup/tool-business-mail-block
│   ├── color-palette/                # → rebuildup/tool-color-palette
│   ├── ae-expression/                # → rebuildup/tool-ae-expression
│   ├── sequential-png-preview/       # → rebuildup/tool-sequential-png-preview
│   ├── svg2tsx/                      # → rebuildup/tool-svg2tsx
│   ├── code-type-p5/                 # → rebuildup/tool-code-type-p5
│   ├── fillgen/                      # → rebuildup/tool-fillgen
│   ├── history-quiz/                 # → rebuildup/tool-history-quiz
│   ├── pi-game/                      # → rebuildup/tool-pi-game
│   ├── pomodoro/                     # → rebuildup/tool-pomodoro
│   ├── qr-generator/                 # → rebuildup/tool-qr-generator
│   └── prototype/                    # → rebuildup/tool-prototype (was ProtoType)
├── src/app/tools/                    # Main-repo-owned bridge files ONLY
│   ├── page.tsx                      # Tool index (mostly unchanged)
│   ├── layout.tsx
│   ├── text-counter/page.tsx         # next/dynamic → ../../../../external/text-counter/src/<Name>App
│   ├── text-counter/layout.tsx
│   ├── ...                           # one bridge pair per tool
├── scripts/
│   ├── install-tools.ts              # NEW: per-submodule bun install
│   └── (sync-subtree.sh DELETED; merge-deps.mjs DELETED)
├── next.config.ts                    # transpilePackages extended for external/*
├── package.json                      # Framework deps only + workspaces
├── biome.json                        # Excludes external/**
├── tsconfig.json                     # Path mappings for external/*
├── knip.jsonc                        # Excludes external/**
└── ...
```

### 3.4 Why `external/<name>/` not `src/app/tools/<name>/`

A git submodule directory is *entirely* owned by the submodule. The parent repo cannot place files inside it. If `src/app/tools/text-counter/` is a submodule checkout, the main repo cannot add `page.tsx` alongside it.

Putting submodules under `external/` keeps `src/app/tools/<name>/` fully owned by the main repo, where Next.js App Router looks for `page.tsx` / `layout.tsx`.

The trade-off: bridge imports traverse one extra directory level (`../../../../external/<name>/src/<Name>App`). This is mechanical and stable.

### 3.5 Bridge pattern (proven — same as today's ProtoType)

```tsx
// my-web-2025/src/app/tools/text-counter/page.tsx  (main repo file)
"use client";
import dynamic from "next/dynamic";
const App = dynamic(
  () => import("../../../../external/text-counter/src/TextCounterApp"),
  { ssr: false },
);
export default function Page() {
  return <App />;
}
```

```tsx
// my-web-2025/src/app/tools/text-counter/layout.tsx  (main repo file)
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Text Counter" };
```

The `next/dynamic` with `ssr: false` is the same shape the current `ProtoType/page.tsx` already uses. Behavior is identical.

### 3.6 Standalone dev workflow

```bash
git clone git@github.com:rebuildup/tool-text-counter.git
cd tool-text-counter/standalone
bun install
bun dev
# → http://localhost:3010 shows just the text counter
```

The standalone app reuses `../src/`, so embedded and standalone behave identically.

### 3.7 Main repo fresh-clone flow (replaces AGENTS.md §13)

```bash
git clone --recurse-submodules git@github.com:rebuildup/my-web-2025.git
cd my-web-2025
bun install --frozen-lockfile
bun --bun scripts/install-tools.ts        # per-submodule bun install
bun run type-check && bun run lint && bun run test && bun x knip && bun run build
```

## 4. Repo inventory

The 14 tool repos, named by slug, with the source directory in today's `my-web-2025`:

| Slug | Today path | Notes |
|---|---|---|
| `prototype` | `src/app/tools/ProtoType/` | Already external via subtree. First to migrate. |
| `ae-expression` | `src/app/tools/ae-expression/` | Uses `RawDOMContainer` |
| `business-mail-block` | `src/app/tools/business-mail-block/` | Uses `ToolWrapper` |
| `code-type-p5` | `src/app/tools/code-type-p5/` | Uses `RawDOMContainer` |
| `color-palette` | `src/app/tools/color-palette/` | Uses `RawDOMContainer` |
| `fillgen` | `src/app/tools/fillgen/` | |
| `history-quiz` | `src/app/tools/history-quiz/` | |
| `pi-game` | `src/app/tools/pi-game/` | |
| `pomodoro` | `src/app/tools/pomodoro/` | Already served at pomodoro.yusuke-kim.com; this migration unifies its repo with the main repo |
| `qr-generator` | `src/app/tools/qr-generator/` | |
| `sequential-png-preview` | `src/app/tools/sequential-png-preview/` | Uses `RawDOMContainer` |
| `svg2tsx` | `src/app/tools/svg2tsx/` | Uses `RawDOMContainer` |
| `text-counter` | `src/app/tools/text-counter/` | Uses `RawDOMContainer` |
| (UI package) | `src/app/tools/components/` | Becomes `rebuildup/my-web-tools-ui` |

Plus the existing `ProtoType` upstream repo (referenced by the `prototype` submodule).

## 5. Migration phases

### 5.1 Phase 0 — Foundation (1 PR)

Land before any tool migration. Establishes the pattern and updates the canonical docs.

- Create `rebuildup/my-web-tools-ui` from the current `src/app/tools/components/` content. No code changes — pure move.
- Add `external/ui/` submodule to `my-web-2025`.
- Update `package.json` to add `"workspaces": ["external/*"]` and remove the tool-specific deps that move to tool repos in later phases (none yet — Phase 0 keeps tools in place).
- Update `biome.json`, `knip.jsonc`, `tsconfig.json` to ignore `external/**`.
- Update `next.config.ts` `transpilePackages` to include `external/ui/src`.
- Add `scripts/install-tools.ts` (no-op for now — Phase 0 has only the UI package).
- Update `.github/workflows/ci.yml` and `deploy.yml` to checkout with `submodules: recursive` and run `scripts/install-tools.ts`.
- Update `AGENTS.md` §6 (skill list), §13 (fresh-clone), §14 (debt).
- Delete `.claude/skills/sync-external-tool/` and `.agents/skills/sync-external-tool/`.
- Add `.claude/skills/sync-submodule/` describing `git submodule update --remote` workflow.
- Rewrite `.claude/agents/tool-bridge-auditor.md` for submodule-bridge audit (verify every `src/app/tools/<name>/page.tsx` bridge has a matching `.gitmodules` entry and that the submodule checkout is non-empty).
- Add ADR `00XX-git-submodule-extraction.md` to `docs/adr/`.
- Verify: `bun run type-check && bun run lint && bun run test && bun x knip && bun run build` all green; `mcp__playwright__*` confirms `/tools/` (tool index) still renders; all tool routes still work.

Gate: every existing tool route renders identically. No tool has moved yet.

### 5.2 Phase 1 — ProtoType (1 PR)

The smallest, already-isolated case. Validates the pattern end-to-end before applying to 13 more.

- Create `rebuildup/tool-prototype` from current `src/app/tools/ProtoType/src/` content.
- Add `src/`, `standalone/`, `package.json`, `biome.json`, `tsconfig.json` per §3.1.
- Add the `external/prototype/` submodule to `my-web-2025`.
- Move `src/app/tools/ProtoType/page.tsx` and `layout.tsx` ownership to main repo as `src/app/tools/prototype/page.tsx` + `layout.tsx` (rename `ProtoType` → `prototype` to match slug; verify with user whether URL changes or stays as `/tools/ProtoType`).
- Delete `src/app/tools/ProtoType/src/gamesets/025_SquareEffect.ts`'s `merge=ours` line (no more subtree merges).
- Delete `.gitattributes` entirely if no other entries remain.
- Delete `scripts/sync-subtree.sh` and `scripts/merge-deps.mjs`.
- Update `next.config.ts` to remove the subtree-specific entries (none today beyond reactbits, which stays).

Gate: `/tools/prototype` (or `/tools/ProtoType` if URL preserved) renders identically. Standalone `git clone rebuildup/tool-prototype && cd standalone && bun install && bun dev` works.

### 5.3 Phases 2–N — One to two tools per PR (multiple PRs)

After Phase 1 ships clean, repeat per tool, ordered by:

1. Tools that use shared UI (`text-counter`, `business-mail-block`, `color-palette`, `ae-expression`, `sequential-png-preview`, `svg2tsx`, `code-type-p5`) — first wave, because they validate UI package consumption.
2. Tools that don't use shared UI (`fillgen`, `history-quiz`, `pi-game`, `pomodoro`, `qr-generator`).

Each phase PR:

- Create `<tool-repo>` under `rebuildup/` org.
- Move the tool's current `src/app/tools/<name>/{components,hooks,utils,types.ts,<root files>}` to `<tool-repo>/src/`.
- Add `<tool-repo>/standalone/` per §3.1.
- Add `external/<name>/` submodule to `my-web-2025`.
- Create bridge `src/app/tools/<name>/page.tsx` and `layout.tsx` per §3.5.
- Move the tool's npm deps from `my-web-2025/package.json` to `<tool-repo>/src/package.json`.
- Update `transpilePackages` in `next.config.ts` to include `external/<name>/src`.
- Update `biome.json` / `knip.jsonc` exclude patterns if needed.
- Run the full gate (`type-check`, `lint`, `test`, `knip`, `build`).
- Use `mcp__playwright__*` to verify `/tools/<name>` renders identically to before.
- Commit message: `refactor(tools): extract <name> into rebuildup/tool-<name> submodule`.

### 5.4 Phase N+1 — Cleanup (1 PR, optional)

After all 14 tools are extracted:

- Remove empty `src/app/tools/components/` from main repo (now lives in `external/ui/`).
- Update `AGENTS.md` to remove any "ProtoType exclusion" or "subtree lockfile" debt entries.
- Update `knip.jsonc` and `biome.json` to fully exclude `external/**`.
- Update CI to fail-fast if `external/<name>/` is empty.

## 6. Detailed file-by-file change list

### 6.1 Created (new files)

| File | Phase | Purpose |
|---|---|---|
| `rebuildup/my-web-tools-ui` repo | 0 | Shared UI library |
| `rebuildup/tool-<name>` repos (×14) | 1–N+1 | Per-tool repos |
| `.gitmodules` | 0 | Submodule declarations |
| `external/<name>/` (×15) | 0–N+1 | Submodule checkouts |
| `src/app/tools/<name>/page.tsx` (×14 bridges) | 0–N+1 | Main-repo bridge files |
| `src/app/tools/<name>/layout.tsx` (×14) | 0–N+1 | Main-repo bridge layout files |
| `scripts/install-tools.ts` | 0 | Per-submodule `bun install` |
| `.claude/skills/sync-submodule/SKILL.md` | 0 | Submodule update workflow |
| `docs/adr/00XX-git-submodule-extraction.md` | 0 | ADR |

### 6.2 Modified

| File | Change |
|---|---|
| `package.json` | Add `workspaces: ["external/*"]`; remove tool-specific deps as they migrate |
| `next.config.ts` | Expand `transpilePackages` for `external/*/src` and `external/ui` |
| `biome.json` | Exclude `external/**` |
| `knip.jsonc` | Exclude `external/**` |
| `tsconfig.json` | Add path mappings for `@rebuildup/tool-<name>` and `@rebuildup/my-web-tools-ui` |
| `.github/workflows/ci.yml` | `submodules: recursive`; add `bun --bun scripts/install-tools.ts` step |
| `.github/workflows/deploy.yml` | Same as ci.yml |
| `AGENTS.md` §6 | Remove `sync-external-tool` skill; add submodule-related skills |
| `AGENTS.md` §13 | Update fresh-clone flow |
| `AGENTS.md` §14 | Remove ProtoType-subtree debt; add Bun-workspace + submodule combo debt |
| `.claude/agents/tool-bridge-auditor.md` | Rewrite for submodule-bridge audit |

### 6.3 Deleted

| File | Phase | Reason |
|---|---|---|
| `scripts/sync-subtree.sh` | 1 | Subtree workflow obsolete |
| `scripts/merge-deps.mjs` | 1 | Each tool owns its deps now |
| `.gitattributes` | 1 | No more subtree merges |
| `.claude/skills/sync-external-tool/SKILL.md` | 0 | Replaced by sync-submodule |
| `.agents/skills/sync-external-tool/SKILL.md` | 0 | Mirror of above |
| `src/app/tools/components/` (after all UI consumers migrated) | N+1 | Now in `external/ui/` |
| `src/app/tools/<name>/{components,hooks,utils,types.ts}` (×14) | 1–N+1 | Moved to per-tool repo |

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bun workspaces + submodules edge cases (`.git` per submodule dir confuses hoisting) | M | M | Phase 0 verifies with UI package only. Phase 1 (ProtoType) is first real tool test. Fallback: explicit `bun install` per submodule via `install-tools.ts`. |
| Bridge import paths break in `next build` (TypeScript path resolution across submodule boundary) | M | H | `transpilePackages` in `next.config.ts` covers each `external/<name>/src`. Verified by Phase 1 build gate. |
| Detached-HEAD ergonomics for tool authors (`git submodule update --remote` only fetches; commits happen in submodule dir) | M | M | New `sync-submodule` skill documents the workflow. Tool authors can develop in the standalone repo and PR upstream; main repo just bumps the pinned SHA. |
| `next/dynamic({ ssr: false })` may cause hydration mismatch on tool pages | L | M | Same pattern as today's ProtoType — already proven. If new issue, fall back to SSR + client-only render flag inside the component. |
| Static export `out/` size growth from bundling all 14 submodules | L | L | Today's build already includes all tools; no size change expected. Verify in Phase 1 gate. |
| Per-repo CI cost (15 repos × CI minutes) | L | L | Out of scope. Use the existing CI workflow per repo. |
| Tool URL rename (`/tools/ProtoType` → `/tools/prototype`) breaks inbound links | M | M | Decision in Phase 1 — preserve old URL with redirect, or rename and update any external links. User to decide. |
| `package.json` workspaces + `bun install --frozen-lockfile` interaction | L | H | Test in Phase 0 before any tool moves. Fallback: drop workspaces, use `install-tools.ts` exclusively. |

## 8. Resolved decisions (2026-08-28)

1. **ProtoType URL**: keep `/tools/ProtoType` (URL-stable). Main-repo route dir is renamed to `prototype/` for slug consistency; the bridge resolves to the existing `/tools/ProtoType` URL via `next.config.ts` `rewrites()` if needed, or by keeping the route directory name in PascalCase. Final approach decided in Phase 1 plan.
2. **Repo visibility**: all 15 new repos public under `rebuildup` org, matching the existing open-source posture.
3. **`pomodoro.yusuke-kim.com`**: **keep served from the main repo for now.** Standalone deployment from `rebuildup/tool-pomodoro/standalone/` is deferred to a Multi-Zones follow-up (§9). Phase N+1 cleanup retains `src/app/tools/pomodoro/` as a bridge into the per-tool repo; nginx config and DNS for `pomodoro.yusuke-kim.com` stay unchanged.
4. **`@appletosolutions/reactbits` `transpilePackages` hack**: keep as-is. Revisit only if explicitly requested in a separate spec.
5. **Bridge files vs. Multi-Zones**: use dynamic-import bridges (`next/dynamic({ ssr: false })`) for all 14 tools. Multi-Zones is a future follow-up; only `pomodoro.yusuke-kim.com` may eventually adopt it.

## 9. Out-of-scope follow-ups

- Replace `@appletosolutions/reactbits` with vendored submodule (if user wants).
- Convert `pomodoro.yusuke-kim.com` to fully independent deployment from its own repo.
- Convert each tool to also publish a native web component (not just Next.js dynamic-import embed).
- Auto-bump submodule SHAs via Dependabot (one PR per tool).

## 10. References

- `AGENTS.md` — canonical project invariants
- `.claude/agents/tool-bridge-auditor.md` — current subtree bridge audit (to be rewritten)
- `scripts/sync-subtree.sh` — current sync tool (to be deleted)
- `docs/adr/` — existing ADRs; this spec adds `00XX-git-submodule-extraction.md`
- [Git submodules documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules) — official reference
- [Next.js Multi-Zones](https://nextjs.org/docs/pages/building-your-application/deploying/multi-zones) — alternative architecture (not chosen here)
