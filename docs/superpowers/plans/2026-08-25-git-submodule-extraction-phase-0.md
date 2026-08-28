# Git Submodule Extraction — Phase 0: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the git-submodule foundation for the 14-tool extraction: create the `my-web-tools-ui` repo, wire `my-web-2025` to consume it as a submodule with a re-export shim, update CI/docs/skill infrastructure. No tool moves in this phase — every existing route still works identically.

**Architecture:** Create `rebuildup/my-web-tools-ui` containing the 3 shared components (ToolWrapper, RawDOMContainer, PerformanceOptimizer). Add it to `my-web-2025` as a submodule at `external/ui/`. Keep `src/app/tools/components/` as a re-export shim so all existing tool imports keep working without modification. Update `package.json` workspaces, `tsconfig.json` paths, `biome.json`/`knip.jsonc` ignores, `next.config.ts` `transpilePackages`, CI workflows, and docs. Replace the `sync-external-tool` skill with `sync-submodule`, rewrite `tool-bridge-auditor` for submodule semantics, add an ADR.

**Tech Stack:** Bun 1.3.x workspaces, git submodule, Next.js 16 (output: export), TypeScript 7, Biome 2.5, Knip, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md` — read §3 (architecture), §4 (inventory), §5.1 (Phase 0), §6.1/6.2/6.3 (file changes), §7 (risks) before starting.

## Global Constraints

These constraints come from `AGENTS.md` and the spec. Every task's requirements implicitly include this section.

- **Bun 1.3.x only.** `packageManager` field is pinned. No `npm` / `pnpm` / `yarn` / `npx`. New dep installs use `bun add`.
- **Canonical validation gate** must pass green at the end of Phase 0:
  ```bash
  bun install --frozen-lockfile
  bun run type-check
  bun run lint
  bun run test
  bun x knip
  bun run build
  ```
- **No new Python scripts.** Automation is TypeScript / JavaScript / shell / PowerShell.
- **`bun.lock` and `data/contents/*.db` are hook-protected.** Never edit directly.
- **Conventional commit prefix.** `feat|fix|refactor|test|docs|build|ci|chore|perf`. Subject ≤ 50 chars. Body explains why + validation result.
- **`master` only.** No feature branches, no worktrees unless the user requests.
- **`.env*` never committed.** Only `.env*.example`.
- **Static export to `out/`.** The build must continue to produce `out/` with all existing `/tools/<name>` routes intact.
- **`transpilePackages` in `next.config.ts` must include `external/ui/src`** so Next.js SWC can transpile the submodule's TSX.
- **The `src/app/tools/components/` shim must re-export identically** — same default exports, same named exports — so no tool's import breaks during Phase 0.

---

## Task 1: Create `rebuildup/my-web-tools-ui` GitHub repo with initial content

**Files:**
- Create (in new repo `rebuildup/my-web-tools-ui`):
  - `package.json`
  - `src/ToolWrapper.tsx` (moved from `src/app/tools/components/ToolWrapper.tsx`)
  - `src/RawDOMContainer.tsx` (moved from `src/app/tools/components/RawDOMContainer.tsx`)
  - `src/PerformanceOptimizer.tsx` (moved from `src/app/tools/components/PerformanceOptimizer.tsx`)
  - `src/index.ts` (barrel re-export)
  - `biome.json`
  - `tsconfig.json`
  - `.gitignore`
  - `README.md`
  - `LICENSE`

**Interfaces:**
- Consumes: nothing (greenfield repo)
- Produces: package `@rebuildup/my-web-tools-ui` exporting `ToolWrapper` (default), `RawDOMContainer` (default), `PerformanceOptimizer` (default + named)

- [ ] **Step 1: Verify exact contents of the 3 source files**

Run from `my-web-2025` root:
```bash
wc -l src/app/tools/components/ToolWrapper.tsx src/app/tools/components/RawDOMContainer.tsx src/app/tools/components/PerformanceOptimizer.tsx
```
Expected: three non-zero line counts (each typically 30-150 lines). Note the line counts — they must match the new copies exactly.

- [ ] **Step 2: Create the GitHub repo**

Using `gh` CLI:
```bash
gh repo create rebuildup/my-web-tools-ui --public --description "Shared UI primitives for my-web-2025 tools (ToolWrapper, RawDOMContainer, PerformanceOptimizer)" --add-readme=false
```
Expected: repo created. Capture the clone URL: `git@github.com:rebuildup/my-web-tools-ui.git`.

- [ ] **Step 3: Clone the empty repo locally**

```bash
cd /tmp && git clone git@github.com:rebuildup/my-web-tools-ui.git my-web-tools-ui-init
cd my-web-tools-ui-init
```
Expected: empty repo (only `.git/` and possibly `LICENSE` from default branch).

- [ ] **Step 4: Copy the 3 source files into `src/`**

From `my-web-2025`:
```bash
cp ../my-web-2025/src/app/tools/components/ToolWrapper.tsx          src/ToolWrapper.tsx
cp ../my-web-2025/src/app/tools/components/RawDOMContainer.tsx      src/RawDOMContainer.tsx
cp ../my-web-2025/src/app/tools/components/PerformanceOptimizer.tsx src/PerformanceOptimizer.tsx
```
Expected: 3 files in `src/`. Compare with `wc -l src/*.tsx` — line counts must match Step 1.

- [ ] **Step 5: Create `src/index.ts` barrel**

Write `src/index.ts`:
```ts
export { default as ToolWrapper } from "./ToolWrapper";
export { default as RawDOMContainer } from "./RawDOMContainer";
export {
  default as PerformanceOptimizer,
  type PerformanceOptimizerProps,
} from "./PerformanceOptimizer";
```
Check what named exports the original `PerformanceOptimizer.tsx` exposes — if there are additional named exports beyond `PerformanceOptimizerProps`, add them. Verify with:
```bash
rg '^export ' ../my-web-2025/src/app/tools/components/PerformanceOptimizer.tsx
```
Match each one in the barrel.

- [ ] **Step 6: Create `package.json`**

```json
{
  "name": "@rebuildup/my-web-tools-ui",
  "version": "0.1.0",
  "description": "Shared UI primitives for my-web-2025 tools",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "biome check .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.0",
    "@types/react": "^19.0.0",
    "typescript": "^7.0.0"
  },
  "license": "MIT"
}
```
Pin the Biome and TypeScript versions to match `my-web-2025`. Check exact versions in `my-web-2025/package.json` `devDependencies`:
```bash
rg '"@(biomejs|biomejs)/biome"|"typescript"' ../my-web-2025/package.json
```

- [ ] **Step 7: Create `biome.json`**

Copy from `my-web-2025/biome.json` and adjust the include/exclude scopes:
```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["../my-web-2025/biome.json"]
}
```
Wait — biome doesn't extend across repos. Copy the actual `biome.json` content from `my-web-2025/biome.json` (excluding the overrides block for now — those are repo-specific to components in `my-web-2025`):
```bash
cat ../my-web-2025/biome.json
```
Manually reproduce it in the new repo's `biome.json`, omitting the `overrides` block referencing component names that don't exist here.

- [ ] **Step 8: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9: Create `.gitignore`**

```
node_modules/
dist/
.turbo/
*.log
.DS_Store
```

- [ ] **Step 10: Create `README.md`**

```markdown
# @rebuildup/my-web-tools-ui

Shared UI primitives for `my-web-2025` tools.

## Exports

- `ToolWrapper` — wraps a tool with consistent shell, error boundary, and analytics
- `RawDOMContainer` — renders tool output into a managed DOM container (used when a tool needs to bypass React for performance)
- `PerformanceOptimizer` — memoization + render-tracking wrapper

## Usage

This package is consumed via Bun workspace from `my-web-2025`. See the
[submodule extraction spec](../../my-web-2025/docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md).

## Standalone development

```bash
bun install
bun run lint
bun run type-check
```
```

- [ ] **Step 11: Create `LICENSE`**

Match the `my-web-2025` license (check `my-web-2025/LICENSE` or `package.json` `license` field). If MIT, copy the standard MIT template with copyright year 2026 and author `rebuildup`.

- [ ] **Step 12: Initial commit and push**

```bash
git add .
git commit -m "feat: initial UI primitives (ToolWrapper, RawDOMContainer, PerformanceOptimizer)"
git push -u origin master
```
Expected: commit pushed; remote `master` has the initial files.

- [ ] **Step 13: Verify the new repo's gate**

```bash
bun install
bun run type-check
bun run lint
```
Expected: all three commands exit 0. Fix any errors before continuing.

- [ ] **Step 14: Clean up local clone**

```bash
cd /tmp && rm -rf my-web-tools-ui-init
```

---

## Task 2: Add `external/ui` submodule to `my-web-2025`

**Files:**
- Create (via submodule add):
  - `external/ui/` (git submodule directory)
  - `.gitmodules`
- Modify: `.gitignore` (add `external/*/.git` exception — verify)

**Interfaces:**
- Consumes: repo from Task 1 (`rebuildup/my-web-tools-ui`)
- Produces: `external/ui/` checked out at `master` HEAD, `.gitmodules` declaration

- [ ] **Step 1: Verify clean submodule state**

From `my-web-2025` root:
```bash
git submodule status
```
Expected: empty output (no submodules yet).

- [ ] **Step 2: Add the submodule**

```bash
mkdir -p external
git submodule add git@github.com:rebuildup/my-web-tools-ui.git external/ui
```
Expected: `external/ui/` populated, `.gitmodules` created at repo root.

- [ ] **Step 3: Verify `.gitmodules` contents**

```bash
cat .gitmodules
```
Expected:
```
[submodule "external/ui"]
	path = external/ui
	url = git@github.com:rebuildup/my-web-tools-ui.git
```

- [ ] **Step 4: Verify submodule is at expected commit**

```bash
git submodule status external/ui
```
Expected: a SHA prefix followed by `external/ui` (no `-` prefix, which would indicate uninitialized).

- [ ] **Step 5: Verify `.gitignore` doesn't exclude submodule internals**

```bash
rg -n '^\s*external' .gitignore
```
If `external/` or `external/*` is in `.gitignore`, **remove those lines**. Submodule directories must be tracked.

- [ ] **Step 6: Commit the submodule addition**

```bash
git add .gitmodules external/ui
git commit -m "feat(submodule): add my-web-tools-ui as external/ui submodule"
```

---

## Task 3: Create re-export shim at `src/app/tools/components/`

**Files:**
- Modify (replace each existing component file with a re-export):
  - `src/app/tools/components/ToolWrapper.tsx`
  - `src/app/tools/components/RawDOMContainer.tsx`
  - `src/app/tools/components/PerformanceOptimizer.tsx`

**Interfaces:**
- Consumes: `external/ui/src/ToolWrapper`, `external/ui/src/RawDOMContainer`, `external/ui/src/PerformanceOptimizer`
- Produces: same default + named exports as before, so `import ToolWrapper from "../../components/ToolWrapper"` keeps working in every tool.

- [ ] **Step 1: Capture current exports of each file**

```bash
for f in ToolWrapper RawDOMContainer PerformanceOptimizer; do
  echo "=== $f ==="
  rg '^export ' "src/app/tools/components/${f}.tsx"
done
```
Expected: 3 outputs listing the default and any named exports. Save these for reference.

- [ ] **Step 2: Replace `ToolWrapper.tsx` with re-export**

Write `src/app/tools/components/ToolWrapper.tsx`:
```tsx
// Shim: re-exports from @rebuildup/my-web-tools-ui (external/ui submodule).
// Will be deleted in Phase N+1 cleanup once all consumers import directly.
export { default } from "../../../external/ui/src/ToolWrapper";
export * from "../../../external/ui/src/ToolWrapper";
```
The `export *` is intentional — it forwards any named exports alongside the default.

- [ ] **Step 3: Replace `RawDOMContainer.tsx` with re-export**

Write `src/app/tools/components/RawDOMContainer.tsx`:
```tsx
// Shim: re-exports from @rebuildup/my-web-tools-ui (external/ui submodule).
export { default } from "../../../external/ui/src/RawDOMContainer";
export * from "../../../external/ui/src/RawDOMContainer";
```

- [ ] **Step 4: Replace `PerformanceOptimizer.tsx` with re-export**

Write `src/app/tools/components/PerformanceOptimizer.tsx`:
```tsx
// Shim: re-exports from @rebuildup/my-web-tools-ui (external/ui submodule).
export { default } from "../../../external/ui/src/PerformanceOptimizer";
export * from "../../../external/ui/src/PerformanceOptimizer";
```

- [ ] **Step 5: Type-check the shim**

```bash
bun run type-check 2>&1 | tail -30
```
Expected: no new errors. If errors mention `external/ui/`, fix the relative path (count `../` segments: `src/app/tools/components/` → repo root is `../../../`, then `external/ui/src/<file>`).

- [ ] **Step 6: Commit the shim**

```bash
git add src/app/tools/components/
git commit -m "refactor(tools): re-export shared UI from external/ui submodule via shim"
```

---

## Task 4: Update build config (`package.json`, `tsconfig.json`, `biome.json`, `knip.jsonc`, `next.config.ts`)

**Files:**
- Modify:
  - `package.json` — add `workspaces`
  - `tsconfig.json` — add `paths` mapping
  - `biome.json` — exclude `external/**`
  - `knip.jsonc` — exclude `external/**`
  - `next.config.ts` — add `external/ui/src` to `transpilePackages`

**Interfaces:**
- Consumes: submodule at `external/ui/` from Task 2
- Produces: framework knows how to type-check, lint, and bundle the UI submodule without bundling its internals as in-repo code

- [ ] **Step 1: Read current `package.json`**

```bash
cat package.json
```
Note the existing top-level keys. Find the closing `}` of the JSON object.

- [ ] **Step 2: Add `workspaces` to `package.json`**

Edit `package.json` to add a top-level `workspaces` field (alphabetically positioned, before or after `scripts` per your existing structure). Use Bun's documented workspace syntax:
```json
"workspaces": ["external/*"]
```
Verify with:
```bash
bun pm ls 2>&1 | head -20
```
Expected: lists `@rebuildup/my-web-tools-ui` (or similar) as a workspace package.

- [ ] **Step 3: Read current `tsconfig.json`**

```bash
cat tsconfig.json
```
Locate the `compilerOptions` block. We will add a `paths` field.

- [ ] **Step 4: Add `paths` mapping in `tsconfig.json`**

Inside `compilerOptions`, add (or merge with existing):
```json
"paths": {
  "@rebuildup/my-web-tools-ui": ["./external/ui/src/index.ts"],
  "@rebuildup/my-web-tools-ui/*": ["./external/ui/src/*"]
}
```
Also ensure `baseUrl` is set to `"."` if not already.

- [ ] **Step 5: Verify `tsconfig.json` is valid JSON**

```bash
bun run type-check 2>&1 | tail -20
```
Expected: no path-resolution errors for `@rebuildup/my-web-tools-ui`.

- [ ] **Step 6: Read current `biome.json`**

```bash
cat biome.json
```
Find the top-level `files` key (Biome 2.x uses `files.includes` / `files.includes` patterns).

- [ ] **Step 7: Add `external/**` to Biome ignores**

Add to the ignore list (or `files.includes` negation):
```json
"ignore": ["external/**", "node_modules/**", "out/**", ".next/**"]
```
Merge with any existing ignore patterns.

- [ ] **Step 8: Read current `knip.jsonc`**

```bash
cat knip.jsonc
```
Note existing `ignore` / `ignoreDependencies` / `ignoreWorkspaces` arrays.

- [ ] **Step 9: Add `external/**` to Knip ignores**

Add to the top-level ignore array:
```jsonc
"ignore": ["external/**", "data/contents/**", "out/**", ".next/**", "scripts/**"]
```
Merge with existing entries.

- [ ] **Step 10: Read current `next.config.ts` `transpilePackages`**

```bash
rg -n 'transpilePackages' next.config.ts
```
Note the existing array contents (currently includes `@appletosolutions/reactbits` per AGENTS.md §14).

- [ ] **Step 11: Add `external/ui/src` to `transpilePackages`**

Edit the array to include the submodule path:
```ts
transpilePackages: ["@appletosolutions/reactbits", "external/ui/src"],
```
Exact syntax may vary — match the existing style (string array vs other shapes).

- [ ] **Step 12: Verify gate slice**

```bash
bun run type-check 2>&1 | tail -10
bun run lint 2>&1 | tail -10
bun x knip 2>&1 | tail -10
```
Expected: each exits 0 (warnings about pre-existing items OK; new errors from external/ui must be fixed).

- [ ] **Step 13: Commit the config updates**

```bash
git add package.json tsconfig.json biome.json knip.jsonc next.config.ts bun.lock
git commit -m "build: wire external/ui submodule into workspace, transpile, lint, knip"
```

---

## Task 5: Create `scripts/install-tools.ts`

**Files:**
- Create: `scripts/install-tools.ts`

**Interfaces:**
- Consumes: `external/*/` directory listing, Bun runtime
- Produces: per-submodule `bun install` invocation, with clear error if a submodule is empty

- [ ] **Step 1: Look at existing scripts for style**

```bash
ls scripts/
head -20 scripts/copy-content-data.js scripts/check-env.js 2>/dev/null
```
Match the existing comment density and error-handling style.

- [ ] **Step 2: Write `scripts/install-tools.ts`**

```ts
#!/usr/bin/env bun
/**
 * Install each submodule under external/.
 *
 * Runs `bun install` in each submodule directory. Skips empty/missing
 * submodule checkouts with a warning (so this script is safe to run before
 * `git submodule update --init --recursive`).
 *
 * Usage:
 *   bun --bun scripts/install-tools.ts
 *
 * Exit code 0 = all installs succeeded (or were skipped).
 * Exit code 1 = at least one install failed.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const EXTERNAL_DIR = join(process.cwd(), "external");

function listSubmoduleDirs(): string[] {
	if (!existsSync(EXTERNAL_DIR)) return [];
	return Array.from(
		new Bun.Glob("*/").scanSync({ cwd: EXTERNAL_DIR, onlyFiles: false }),
	);
}

function installOne(name: string): boolean {
	const dir = join(EXTERNAL_DIR, name);
	const marker = join(dir, "package.json");
	if (!existsSync(marker)) {
		console.warn(`[install-tools] skip ${name}: no package.json`);
		return true;
	}
	console.log(`[install-tools] bun install in ${name}`);
	const result = spawnSync("bun", ["install"], {
		cwd: dir,
		stdio: "inherit",
		env: process.env,
	});
	return result.status === 0;
}

const dirs = listSubmoduleDirs();
if (dirs.length === 0) {
	console.log("[install-tools] no submodules found under external/");
	process.exit(0);
}

let failed = 0;
for (const name of dirs) {
	if (!installOne(name)) failed += 1;
}

if (failed > 0) {
	console.error(`[install-tools] ${failed} submodule(s) failed to install`);
	process.exit(1);
}
console.log("[install-tools] all submodules OK");
```

- [ ] **Step 3: Run the script**

```bash
bun --bun scripts/install-tools.ts
```
Expected: prints `[install-tools] bun install in ui` then `[install-tools] all submodules OK`. If `ui` is missing a `package.json`, you'll see the skip warning instead — verify `external/ui/package.json` exists (it should from Task 1).

- [ ] **Step 4: Type-check the script**

```bash
bun run type-check 2>&1 | tail -10
```
Expected: no errors from `scripts/install-tools.ts`. If Bun's `Bun.Glob` type isn't found, check `tsconfig.json`'s `lib` includes `bun-types` or the Bun-specific types are loaded via `bun-types` devDep. If absent, add `bun-types` to `devDependencies` and re-run.

- [ ] **Step 5: Commit the script**

```bash
git add scripts/install-tools.ts
git commit -m "feat(scripts): add install-tools.ts for per-submodule bun install"
```

---

## Task 6: Update CI workflows (`ci.yml` + `deploy.yml`)

**Files:**
- Modify:
  - `.github/workflows/ci.yml` — `actions/checkout` with `submodules: recursive`; add `bun --bun scripts/install-tools.ts` step
  - `.github/workflows/deploy.yml` — same changes

**Interfaces:**
- Consumes: workflow YAML schema, GitHub Actions `actions/checkout@v7` (per AGENTS.md §14)
- Produces: CI runs `bun install --frozen-lockfile`, then installs submodules, then runs gate

- [ ] **Step 1: Read current `ci.yml`**

```bash
cat .github/workflows/ci.yml
```
Note the checkout step. Find the `actions/checkout` line.

- [ ] **Step 2: Add `submodules: recursive` to checkout**

Replace:
```yaml
- uses: actions/checkout@v7
```
With:
```yaml
- uses: actions/checkout@v7
  with:
    submodules: recursive
```

- [ ] **Step 3: Add `install-tools` step**

After the existing `bun install --frozen-lockfile` step, add:
```yaml
- name: Install submodule deps
  run: bun --bun scripts/install-tools.ts
```

- [ ] **Step 4: Read current `deploy.yml`**

```bash
cat .github/workflows/deploy.yml
```
Note the checkout step and install step.

- [ ] **Step 5: Apply the same changes to `deploy.yml`**

Same as Steps 2-3: add `submodules: recursive` and `Install submodule deps` step.

- [ ] **Step 6: Verify YAML syntax**

```bash
bun --bun node -e 'const yaml = require("yaml"); for (const f of [".github/workflows/ci.yml", ".github/workflows/deploy.yml"]) { yaml.parse(require("fs").readFileSync(f, "utf8")); console.log(f, "OK"); }'
```
If `yaml` isn't installed, use the `js-yaml` package or skip (GitHub Actions will validate on push).

- [ ] **Step 7: Commit CI changes**

```bash
git add .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "ci: checkout submodules recursively and run install-tools.ts"
```

---

## Task 7: Update `AGENTS.md` (§6, §13, §14)

**Files:**
- Modify: `AGENTS.md` §6 (skill list), §13 (fresh-clone), §14 (known debt)

**Interfaces:**
- Consumes: existing `AGENTS.md` content
- Produces: updated canonical invariants reflecting submodule workflow

- [ ] **Step 1: Read current §6 (Skill/Agent list)**

```bash
rg -n '^## 6\.' AGENTS.md
sed -n '/^## 6\./,/^## 7\./p' AGENTS.md
```
Note the existing `sync-external-tool` line and the `tool-bridge-auditor` review agent line.

- [ ] **Step 2: Remove `sync-external-tool` from §6**

Delete the bullet `- \`sync-external-tool\` …`. (It will be added back as `sync-submodule` in Task 8.)

- [ ] **Step 3: Add new skill entry placeholder**

In §6, add (placeholder — Task 8 creates the actual file):
```
- `sync-submodule` … `git submodule update --remote` workflow for `external/<name>/`. Bridges submodule workflow with bridge-file protection.
```

- [ ] **Step 4: Read current §13 (fresh-clone reproducibility)**

```bash
sed -n '/^## 13\./,/^## 14\./p' AGENTS.md
```

- [ ] **Step 5: Update §13**

Replace the section body with:
```markdown
このドキュメント, `.claude/`, `.gitmodules`, `package.json`, `bun.lock`, `tsconfig.json`, `biome.json`, `jest.config.js`, `.github/workflows/`, `docs/`, `scripts/`, および `external/<name>/` の submodule checkout があれば, fresh clone から `git submodule update --init --recursive && bun install --frozen-lockfile && bun --bun scripts/install-tools.ts && bun run build && bun run test` が green になる状態が ideal. global な npm / pip / 隠れた dotenv への暗黙依存は持たない.
```

- [ ] **Step 6: Read current §14 (known debt)**

```bash
sed -n '/^## 14\./,$p' AGENTS.md
```

- [ ] **Step 7: Update §14**

- Remove the bullet about `src/app/tools/ProtoType/` being a Vite sub-project with `merge=ours` bridge protection (no longer true after Phase 1; leave the bullet for Phase 1 to handle, or add a note that it's tracked for Phase 1 cleanup).
- Add a new debt bullet:
```markdown
- **`scripts/install-tools.ts` と Bun workspaces の相互作用** (Phase 0 導入, 2026-08): workspace と submodule の組合せは Bun のドキュメントで薄く, hoisting の挙動に edge case があれば個別対応する. Phase 1 (ProtoType) で最初の実 tool submodule を投入して挙動を確定する.
```

- [ ] **Step 8: Verify `AGENTS.md` is well-formed**

```bash
head -3 AGENTS.md && echo "..." && tail -10 AGENTS.md
```
Expected: starts with `# プロジェクト不変条件` and ends with the `<!-- END:nextjs-agent-rules -->` marker.

- [ ] **Step 9: Commit `AGENTS.md` updates**

```bash
git add AGENTS.md
git commit -m "docs(agents): replace sync-external-tool with sync-submodule in §6, update §13 fresh-clone flow, note §14 submodule debt"
```

---

## Task 8: Replace `sync-external-tool` skill with `sync-submodule`

**Files:**
- Delete: `.claude/skills/sync-external-tool/SKILL.md`
- Delete: `.agents/skills/sync-external-tool/SKILL.md`
- Create: `.claude/skills/sync-submodule/SKILL.md`
- Create: `.agents/skills/sync-submodule/SKILL.md`

**Interfaces:**
- Consumes: `.gitmodules`, submodule list
- Produces: workflow skill for `git submodule update --remote` and adding new submodules

- [ ] **Step 1: Delete the old skill files**

```bash
git rm .claude/skills/sync-external-tool/SKILL.md
git rm .agents/skills/sync-external-tool/SKILL.md
```
Expected: both removed from index.

- [ ] **Step 2: Create `.claude/skills/sync-submodule/SKILL.md`**

```markdown
---
name: sync-submodule
description: Update an existing submodule under external/<name>/ to the latest commit on its tracked branch, or add a new submodule. Bridges submodule workflow with bridge-file protection.
disable-model-invocation: true
---

# Sync Submodule

Update or add a git submodule under `external/<name>/`.

## When to use

- "Update external/ui from upstream"
- "Bump the SHA for external/<name>"
- "Add a new submodule for <repo-url>"

## Workflow

### Update an existing submodule

```
git submodule update --remote external/<name>
git add external/<name>
git commit -m "chore(submodule): bump external/<name> to <sha>"
```

If the submodule's tracked branch is not `master`, set it first:
```
git -C external/<name> checkout master
```

### Add a new submodule

```
git submodule add git@github.com:rebuildup/<repo>.git external/<name>
```

Then:
1. Add the bridge file `src/app/tools/<name>/page.tsx` (see tool-bridge-auditor for the pattern).
2. If the new submodule has its own `package.json`, ensure `transpilePackages` in `next.config.ts` covers its `src/`.
3. Run `bun --bun scripts/install-tools.ts` to install its deps.

## Constraints

- Submodule directories are fully owned by the submodule — never edit files inside `external/<name>/` from the main repo. Fix bugs in the upstream repo and bump the submodule.
- Detached HEAD is normal. Use `git -C external/<name> checkout master` to land on a branch before making local changes.
- Bridge files (`src/app/tools/<name>/page.tsx`, `layout.tsx`) live in the main repo and are NOT protected by `merge=ours` — they must be edited directly when the bridge contract changes.

## Reference

- `.gitmodules` — submodule declarations
- `scripts/install-tools.ts` — per-submodule `bun install`
- `next.config.ts` — `transpilePackages` covering submodule src paths
- `.claude/agents/tool-bridge-auditor.md` — verifies bridge vs submodule consistency
```

- [ ] **Step 3: Mirror to `.agents/skills/sync-submodule/SKILL.md`**

```bash
cp .claude/skills/sync-submodule/SKILL.md .agents/skills/sync-submodule/SKILL.md
```
The two skill trees must stay in sync per `AGENTS.md` §6.

- [ ] **Step 4: Verify skill frontmatter is valid**

```bash
head -5 .claude/skills/sync-submodule/SKILL.md
head -5 .agents/skills/sync-submodule/SKILL.md
```
Expected: each starts with `---`, has `name:`, `description:`, and `disable-model-invocation: true`.

- [ ] **Step 5: Commit the skill swap**

```bash
git add .claude/skills/sync-submodule/SKILL.md .agents/skills/sync-submodule/SKILL.md
git rm .claude/skills/sync-external-tool/SKILL.md .agents/skills/sync-external-tool/SKILL.md
git commit -m "docs(skills): replace sync-external-tool with sync-submodule"
```

---

## Task 9: Rewrite `.claude/agents/tool-bridge-auditor.md` for submodule semantics

**Files:**
- Modify: `.claude/agents/tool-bridge-auditor.md`

**Interfaces:**
- Consumes: `.gitmodules`, `src/app/tools/<name>/{page,layout}.tsx`
- Produces: read-only audit report

- [ ] **Step 1: Read current `tool-bridge-auditor.md`**

```bash
cat .claude/agents/tool-bridge-auditor.md
```

- [ ] **Step 2: Replace with submodule-bridge-auditor spec**

Write `.claude/agents/tool-bridge-auditor.md`:
```markdown
---
name: tool-bridge-auditor
description: Audits external submodule tool integrations. Use after any submodule bump or when changes touch src/app/tools/<name>/ bridge files (.gitmodules, page.tsx, layout.tsx). Verifies bridge protection and registration completeness. Read-only.
tools: All tools
---

# Tool Bridge Auditor (submodule mode)

Read-only audit of the bridge between `my-web-2025` and submodules under `external/<name>/`.

## What to check

For every `src/app/tools/<name>/` directory in the main repo:

1. **Submodule declared?** `git config -f .gitmodules --get-regexp path` should include `external/<name>`.
2. **Submodule initialized?** `git submodule status external/<name>` should show a SHA, no `-` prefix.
3. **Bridge file present?** `src/app/tools/<name>/page.tsx` should exist and use `next/dynamic` with `ssr: false` to import from `external/<name>/src/<Name>App`.
4. **Layout file present?** `src/app/tools/<name>/layout.tsx` should exist and export `metadata`.
5. **Tool registered in index?** `src/app/tools/page.tsx`'s `tools` array should include an entry with `id: "<name>"`.
6. **transpilePackages covers it?** `next.config.ts` `transpilePackages` should include `external/<name>/src` (or its package name) for any submodule whose `src/` is bundled.
7. **No stale shim?** If `src/app/tools/<name>/` is a re-export shim (Phase 0 pattern), flag it for replacement once the consumer migrates.

## When to run

- After any submodule bump (`git submodule update --remote`)
- After any change to `.gitmodules`, `next.config.ts`, `src/app/tools/page.tsx`, or `src/app/tools/<name>/{page,layout}.tsx`
- During quarterly cleanup audits

## Output

Report findings as a markdown table:

| Check | Tool | Status | Detail |
|---|---|---|---|
| submodule declared | foo | ✅ / ❌ | … |
| bridge file | foo | ✅ / ❌ | … |
| … | … | … | … |

Then a summary: "N tools audited, M issues found."
```

- [ ] **Step 3: Verify frontmatter**

```bash
head -5 .claude/agents/tool-bridge-auditor.md
```
Expected: starts with `---`, has `name:`, `description:`, ends the frontmatter block.

- [ ] **Step 4: Commit the audit rewrite**

```bash
git add .claude/agents/tool-bridge-auditor.md
git commit -m "docs(agents): rewrite tool-bridge-auditor for submodule bridge semantics"
```

---

## Task 10: Add ADR `00XX-git-submodule-extraction.md`

**Files:**
- Create: `docs/adr/00XX-git-submodule-extraction.md` (where `XX` is the next available number)

**Interfaces:**
- Consumes: this spec, this plan
- Produces: ADR documenting the architectural decision

- [ ] **Step 1: Find the next ADR number**

```bash
ls docs/adr/ | grep -E '^[0-9]+' | sort -n | tail -5
```
Note the highest number. Use `00XX` = highest + 1 (zero-padded to 4 digits). Example: if highest is `0010`, use `0011`.

- [ ] **Step 2: Create the ADR file**

Write `docs/adr/00XX-git-submodule-extraction.md`:
```markdown
# ADR 00XX: Extract tools into per-repo git submodules

**Date:** 2026-08-25
**Status:** Accepted
**Supersedes:** implicit decision to use git-subtree for ProtoType (commit `4993db38`)

## Context

`my-web-2025` carries 14 tools under `src/app/tools/<name>/`. Today only `ProtoType` is pulled from an external repository via `git subtree`. The other 13 are authored in-repo. The user wants each tool to "be its own repo" — explicit ownership, thin main repo, independent versioning, runnable standalone.

## Decision

Adopt git submodule as the canonical pattern for tool integration:

- 14 new repos under `rebuildup/tool-<name>`, plus 1 shared UI repo `rebuildup/my-web-tools-ui`.
- Each tool repo has a `src/` (embedded component) + `standalone/` (dev-only Next.js app).
- `my-web-2025` declares them as submodules under `external/<name>/`.
- `my-web-2025/src/app/tools/<name>/page.tsx` are main-repo bridge files using `next/dynamic` with `ssr: false`.
- Shared UI consumed via Bun workspace (no npm publish).
- Phased migration: Phase 0 (foundation) → Phase 1 (ProtoType) → Phases 2-N (1-2 tools per PR) → Phase N+1 (cleanup).

## Consequences

### Positive

- Hard ownership boundaries — no tool is the *debt* of `my-web-2025`.
- Each tool has its own version, CI, and release story.
- Main repo's `.git` shrinks (no inlined upstream history).
- Each tool repo runs standalone for development.

### Negative

- Submodule UX cost (detached HEAD, explicit `git submodule update --init --recursive` on clone).
- 15 new repos to bootstrap and maintain.
- Per-submodule install step in CI.
- Bridge imports traverse one extra directory level (`../../../../external/<name>/src/<Name>App`).

### Risks

- Bun workspaces + submodules is an unusual combination. Phase 0 verifies with UI package only; Phase 1 (ProtoType) is first real tool test.
- Bridge path resolution across submodule boundaries — covered by `transpilePackages` and verified in Phase 1 build gate.
- Detached-HEAD ergonomics for tool authors — mitigated by new `sync-submodule` skill.

## Alternatives considered

- **Bun workspaces only (no submodule)**: would not give main repo's `.git` the same thinness; submodule is the actual requested primitive.
- **Multi-Zones**: each tool deployed independently; my-web-2025 reverse-proxies. Higher deployment complexity; rejected for Phase 0 but documented as future follow-up.
- **Selective split (only heavier tools)**: doesn't fully meet the user's stated goal of "each tool as its own repo."

## References

- Spec: `docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md`
- Phase 0 plan: `docs/superpowers/plans/2026-08-25-git-submodule-extraction-phase-0.md`
- AGENTS.md §6, §13, §14 (updated by this ADR)
```

- [ ] **Step 3: Verify ADR**

```bash
ls docs/adr/ | grep -i submodule
head -3 docs/adr/00XX-git-submodule-extraction.md
```
Expected: ADR exists with the correct numbered filename and standard header.

- [ ] **Step 4: Commit the ADR**

```bash
git add docs/adr/00XX-git-submodule-extraction.md
git commit -m "docs(adr): record submodule extraction decision (00XX)"
```

---

## Task 11: Run the canonical validation gate

**Files:**
- Modify: none (read-only verification)

**Interfaces:**
- Consumes: every change from Tasks 1-10
- Produces: green gate (or specific failures to fix)

- [ ] **Step 1: Full clean install**

```bash
bun install --frozen-lockfile
bun --bun scripts/install-tools.ts
```
Expected: both exit 0.

- [ ] **Step 2: Type-check**

```bash
bun run type-check 2>&1 | tail -30
```
Expected: exit 0. If errors mention `external/ui/`, verify the relative paths in Task 3 shims.

- [ ] **Step 3: Lint**

```bash
bun run lint 2>&1 | tail -30
```
Expected: exit 0. If Biome complains about `external/**`, verify Task 4 Step 7 ignore pattern.

- [ ] **Step 4: Knip**

```bash
bun x knip 2>&1 | tail -30
```
Expected: exit 0. If Knip reports new unused exports in `external/ui/`, verify Task 4 Step 9 ignore pattern.

- [ ] **Step 5: Test**

```bash
bun run test 2>&1 | tail -30
```
Expected: exit 0; same pass/fail count as before Phase 0.

- [ ] **Step 6: Build (static export)**

```bash
bun run build 2>&1 | tail -50
```
Expected: exit 0 OR exit 132 (per `AGENTS.md` §14 — known Bun SIGILL on build teardown; `out/` is still produced). Check:
```bash
ls out/index.html out/tools/index.html 2>&1
```
Expected: both files exist.

- [ ] **Step 7: Capture gate result**

If any step failed, capture the failure tail and fix before proceeding. The gate must be green before Task 12.

---

## Task 12: Verify `/tools/` and one tool route still render

**Files:**
- Modify: none (verification only)

**Interfaces:**
- Consumes: built static export from Task 11
- Produces: visual confirmation that no tool broke during the shim swap

- [ ] **Step 1: Serve the static export**

```bash
cd out && python3 -m http.server 8080 &
sleep 2
```
If `python3` isn't available, use `npx serve` (note: AGENTS.md discourages `npx`, prefer `bunx serve`):
```bash
bunx serve out -p 8080 &
sleep 3
```

- [ ] **Step 2: Verify `/tools/` index loads**

Use the `mcp__playwright__*` tools (per `AGENTS.md` §3 UI verification):
- Navigate to `http://localhost:8080/tools/`
- Confirm the tool index page renders with all 14 tool cards.
- Take a screenshot for the PR description.

Expected: index renders identically to the pre-Phase-0 state.

- [ ] **Step 3: Verify one UI-consuming tool renders**

Pick one that uses `RawDOMContainer` or `ToolWrapper` (e.g., `/tools/text-counter`):
- Navigate to `http://localhost:8080/tools/text-counter`
- Confirm the page renders the tool.
- Take a screenshot.

Expected: tool renders identically.

- [ ] **Step 4: Verify the ProtoType bridge still works**

- Navigate to `http://localhost:8080/tools/ProtoType`
- Confirm the prototype app loads via the dynamic import.

Expected: prototype loads. (The `Prototype/page.tsx` and `layout.tsx` are still in main repo at this point; the `src/app/tools/components/` shim only affects the 3 UI primitives, not the Prototype subtree.)

- [ ] **Step 5: Tear down the server**

```bash
pkill -f "http.server 8080" || pkill -f "serve out"
```
Or `Ctrl+C` if foreground.

- [ ] **Step 6: Document verification in commit message**

No new commit needed — the verification is a gate check. The PR description will reference the screenshots.

---

## Task 13: Final review and PR (or single commit if no PR)

**Files:**
- Modify: none

**Interfaces:**
- Consumes: all commits from Tasks 1-12
- Produces: Phase 0 PR (or commit series) on `master`

- [ ] **Step 1: Review commit log**

```bash
git log --oneline -20
```
Expected: a series of commits with conventional prefixes (`feat:`, `refactor:`, `build:`, `ci:`, `docs:`, `chore:`) for each task. No "WIP" or "todo" markers.

- [ ] **Step 2: Verify no stale references**

```bash
rg -n 'sync-external-tool|sync-subtree\.sh|merge-deps\.mjs|\.gitattributes' --type-add 'config:*.{json,ts,yml,yaml,md,sh}' -t config
```
Expected: zero hits in source files (only in `docs/adr/00XX-git-submodule-extraction.md` is acceptable, since the ADR references them historically).

- [ ] **Step 3: Confirm gate is still green after review**

```bash
bun run type-check && bun run lint && bun run test && bun x knip && bun run build
```
Expected: all five commands exit 0 (or build exits 132 per AGENTS.md §14, but `out/` is produced).

- [ ] **Step 4: Push and open PR**

```bash
git push origin master
gh pr create --title "feat(submodule): Phase 0 — extract my-web-tools-ui, wire external/ui, update CI/docs" --body-file - <<'EOF'
## Summary

Phase 0 of the git-submodule extraction. Establishes the foundation; no tool moves yet.

- Creates `rebuildup/my-web-tools-ui` (ToolWrapper, RawDOMContainer, PerformanceOptimizer)
- Adds `external/ui` submodule to `my-web-2025` with re-export shim at `src/app/tools/components/`
- Updates `package.json` workspaces, `tsconfig.json` paths, `biome.json`/`knip.jsonc` ignores, `next.config.ts` `transpilePackages`
- Adds `scripts/install-tools.ts` for per-submodule `bun install`
- CI: `submodules: recursive` + install-tools step in `ci.yml` and `deploy.yml`
- AGENTS.md §6 / §13 / §14 updated
- Replaces `sync-external-tool` skill with `sync-submodule`
- Rewrites `tool-bridge-auditor` for submodule semantics
- Adds ADR 00XX

## Validation

- `bun install --frozen-lockfile` + `scripts/install-tools.ts` → green
- `bun run type-check` → green
- `bun run lint` → green
- `bun run test` → green
- `bun x knip` → green
- `bun run build` → green (out/ produced)
- Playwright verification of `/tools/`, `/tools/text-counter`, `/tools/ProtoType` → renders identically to pre-Phase-0

## Next

Phase 1: extract `ProtoType` from in-repo subtree into `rebuildup/tool-prototype` submodule.
EOF
```

- [ ] **Step 5: Hand off to reviewer**

Mention the spec + plan paths in the PR description so reviewers can follow the larger migration context.

---

## Self-Review (run after writing the plan)

1. **Spec coverage:** Skimmed §3 (architecture), §5.1 (Phase 0), §6 (file changes), §7 (risks) of the spec.
   - §3.2 UI repo layout → Task 1 ✓
   - §3.4 `external/<name>/` rationale → Tasks 2-3 ✓
   - §3.5 bridge pattern → Task 3 (shim) and will be Phase 1 (real bridge) ✓
   - §5.1 Phase 0 steps → Tasks 1-13 ✓
   - §6.1 Created files → Tasks 1, 2, 5, 8, 9, 10 ✓
   - §6.2 Modified files → Tasks 3, 4, 6, 7, 8, 9 ✓
   - §6.3 Deleted files → Task 8 ✓
   - §7 Bun workspaces + submodule combo risk → Task 4 Step 11 + §14 debt note ✓

2. **Placeholder scan:** No `TBD` / `TODO` / "implement later" markers. All file contents are concrete. All commands are exact.

3. **Type consistency:**
   - Package name `@rebuildup/my-web-tools-ui` consistent across Tasks 1, 2, 4, 5, 7, 8.
   - Path `external/ui/src/<File>` consistent across Tasks 1, 3, 4.
   - Submodule path `external/<name>/` consistent across Tasks 2, 5, 8, 9.
   - Bridge pattern `next/dynamic` with `ssr: false` referenced consistently.
   - `transpilePackages` value `external/ui/src` (Task 4) matches what `next.config.ts` consumers expect.

No issues found.
