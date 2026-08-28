# Phase N+1 — Cleanup After All 14 Tools Are Submodules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every leftover artifact from the old subtree workflow (`.gitattributes`, obsolete shims, inlined subtree history) and verify the 15-submodule end state satisfies the canonical gate, Lighthouse budget, and the fresh-clone reproducibility gate.

**Architecture:** Single cleanup PR that:
1. Re-verifies Phase 1/2-N completeness (15 submodule entries, every bridge is thin, no orphan UI imports).
2. Deletes `src/app/tools/components/{ToolWrapper,PerformanceOptimizer,RawDOMContainer}.tsx` shims (already replaced by `external/ui/src/*` direct imports by Phase 2-N).
3. Rewrites `my-web-2025/.git` history to strip the inlined subtree squash-merges via `git filter-repo`, shrinking the main repo.
4. Updates `AGENTS.md` §14 (remove ProtoType-subtree debt; add residual warnings if any remain).
5. Adds a CI guard that fails the build if any `external/<name>/` checkout is empty (i.e. submodule not initialized).
6. Runs Lighthouse against `out/` and records the result into `docs/perf/2026-08-28-post-submodule-extraction.md`.

**Tech Stack:** Bun 1.3.x, git filter-repo (Python-based; installed via `pipx` or `pip install git-filter-repo` in CI only — never as a project dev-dep; AGENTS.md §2 forbids new Python scripts in the repo).

**Spec:** `docs/superpowers/specs/2026-08-25-git-submodule-extraction-design.md` §5.4, §6.3, §7 (Risk register).
**Prerequisite plans:**
- `docs/superpowers/plans/2026-08-28-git-submodule-extraction-phase-1.md`
- `docs/superpowers/plans/2026-08-28-git-submodule-extraction-phase-2-N.md`

## Global Constraints

- Same as Phase 1 / 2-N: Bun 1.3.x, Biome 2.5, canonical gate.
- Single commit preferred (this is a mechanical cleanup, not a feature change). If history rewrite + working-tree edits don't fit cleanly in one commit, the history rewrite MUST be the first commit and the working-tree edits the second (history rewrite invalidates SHAs).
- **Back up `my-web-2025/.git` before `git filter-repo`.** `cp -R .git .git.backup-pre-filter-repo` and verify with `du -sh .git .git.backup-pre-filter-repo` that the backup is non-trivial.
- After `git filter-repo`, all collaborators MUST re-clone or rebase. Document this in the PR body and the commit message.
- AGENTS.md §7: still on `master`; no branches unless user requests.
- AGENTS.md §12: pre-existing modifications in working tree are user-owned; do not stage them.
- Do NOT install `git-filter-repo` permanently. Use it once via `pipx run git-filter-repo ...` or `uv tool run git-filter-repo ...` so it stays outside the Bun-managed dev-deps.

---

## File Structure (Phase N+1 only)

- Delete: `.gitattributes` (already deleted in Phase 1; verify absent).
- Delete: `src/app/tools/components/{ToolWrapper,PerformanceOptimizer,RawDOMContainer}.tsx` (if not already deleted by Phase 2-N; the shims re-export from `external/ui/src/*`).
- Modify: `AGENTS.md` §14 — remove the ProtoType-subtree / sync-subtree debt bullets; replace with a single residual-debt bullet if any.
- Modify: `.github/workflows/ci.yml` — add a fail-fast step that asserts every `external/<name>/` directory contains a non-empty `src/` (or other expected marker).
- Modify: `.github/workflows/deploy.yml` — same CI guard.
- Create: `docs/perf/2026-08-28-post-submodule-extraction.md` — Lighthouse budget report (committed for review; `lighthouse` results are NOT committed, only the markdown summary).
- Modify (history rewrite, separate commit): the entire `.git` history is rewritten to drop `src/app/tools/ProtoType/` paths. The working tree is unchanged.

---

## Task 1: Re-verify Phase 1 / 2-N end state

- [ ] **Step 1.1: Confirm 15 submodule entries**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git submodule status | wc -l
```

Expected: `15` (1 UI + 14 tools).

- [ ] **Step 1.2: Confirm every bridge is thin**

```bash
for slug in ProtoType text-counter color-palette sequential-png-preview svg2tsx \
            business-mail-block code-type-p5 fillgen qr-generator \
            pomodoro history-quiz pi-game ae-expression; do
  bridge="src/app/tools/$slug/page.tsx"
  wc -l "$bridge"
done
```

Expected: each bridge is 10-25 lines (just `next/dynamic` + default-exported page function).

- [ ] **Step 1.3: Confirm no local `components/` shim is still referenced**

```bash
rg -n 'from\s+"(\.\./)+components/' src/app/tools/ 2>&1 || echo "no matches"
```

Expected: zero matches. Any remaining `from "../../components"` line is a bug — fix before proceeding.

- [ ] **Step 1.4: Confirm canonical gate is green on master HEAD**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git submodule update --init --recursive
bun install --frozen-lockfile
bun --bun scripts/install-tools.ts
bun run type-check && bun run lint && bun run test && bun x knip && bun run build
```

Expected: all green. If anything fails, fix in the relevant grouped PR before continuing.

---

## Task 2: Delete the local UI shim files

- [ ] **Step 2.1: Identify what's left**

```bash
ls src/app/tools/components/
```

Expected: only the shim re-exports. Each file currently looks like:

```ts
// Shim: re-exports from @rebuildup/my-web-tools-ui (external/ui submodule).
// Will be deleted in Phase N+1 cleanup once all consumers import directly.

export * from "../../../../external/ui/src/ToolWrapper";
export { default } from "../../../../external/ui/src/ToolWrapper";
```

- [ ] **Step 2.2: Delete the three shims**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git rm src/app/tools/components/ToolWrapper.tsx
git rm src/app/tools/components/PerformanceOptimizer.tsx
git rm src/app/tools/components/RawDOMContainer.tsx
```

- [ ] **Step 2.3: Remove the now-empty `src/app/tools/components/` directory**

```bash
rmdir src/app/tools/components
```

- [ ] **Step 2.4: Verify no broken imports**

```bash
bun run type-check 2>&1 | tail -20
```

Expected: zero errors. (If any import still points at the deleted shims, fix it in the corresponding tool's bridge — Task 2.5 below.)

- [ ] **Step 2.5: (Conditional) Fix any broken imports**

If type-check reports errors, edit the offending tool's `external/<slug>/src/...` file inside the tool repo to import from `../../ui/src/<Name>` instead of the deleted shim. Commit inside the tool repo, then bump the submodule in `my-web-2025`:

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git submodule update --remote external/<slug>
git add external/<slug>
git commit -m "chore(submodule): <slug> imports from external/ui directly"
```

---

## Task 3: Verify and finalize `.gitattributes` removal

- [ ] **Step 3.1: Confirm `.gitattributes` is gone**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
test -f .gitattributes && echo "still exists" || echo "absent (good)"
```

Expected: `absent (good)`. If still present and empty, `git rm .gitattributes`. If non-empty with non-ProtoType entries, hand-edit to remove only the ProtoType lines and re-check.

---

## Task 4: Verify and finalize `scripts/sync-subtree.sh` / `merge-deps.mjs` removal

- [ ] **Step 4.1: Confirm removal**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
test -f scripts/sync-subtree.sh && echo "still exists" || echo "absent (good)"
test -f scripts/merge-deps.mjs && echo "still exists" || echo "absent (good)"
```

Expected: both `absent (good)`. (Both were removed in commit `2132fae9` already.)

---

## Task 5: Update `AGENTS.md` §14 (remove ProtoType-subtree debt)

- [ ] **Step 5.1: Open `AGENTS.md` §14**

Read the section and identify the bullets that mention ProtoType subtree / sync-subtree.sh / merge-deps.mjs / `.gitattributes` `merge=ours`. Those bullets should now be removed (the corresponding debt is gone).

- [ ] **Step 5.2: Edit `AGENTS.md` §14**

Remove (or rewrite) each stale bullet. Keep any that still apply (e.g. Bun version drift, SIGILL 132). The resulting §14 should list only current, real debt.

- [ ] **Step 5.3: Verify no other section references the obsolete scripts**

```bash
rg -n 'sync-subtree|merge-deps|\.gitattributes' AGENTS.md .claude/skills/ .agents/skills/ 2>&1 || echo "no matches"
```

Expected: no matches. If any skill still references `sync-subtree.sh`, rewrite the skill to use `sync-submodule` instead (the replacement landed in commit `bb7e11a4` but verify).

---

## Task 6: Add CI guard for empty submodule checkouts

- [ ] **Step 6.1: Read `.github/workflows/ci.yml`**

Locate the step that runs `bun --bun scripts/install-tools.ts` (added in commit `e3fd0c1d`).

- [ ] **Step 6.2: Add a fail-fast step before `install-tools.ts`**

Insert this step:

```yaml
      - name: Assert submodules are populated
        run: |
          set -e
          cd "$GITHUB_WORKSPACE"
          git submodule status | while read -r sha path rest; do
            if [ -z "$sha" ] || [ "$sha" = "-" ]; then
              echo "::error::submodule $path is not initialized (sha=$sha)"
              exit 1
            fi
            if [ ! -d "$path" ] || [ -z "$(ls -A "$path" 2>/dev/null)" ]; then
              echo "::error::submodule $path is empty"
              exit 1
            fi
          done
```

- [ ] **Step 6.3: Mirror in `.github/workflows/deploy.yml`**

Same step added to the deploy job, before `bun --bun scripts/install-tools.ts`.

---

## Task 7: History rewrite — strip inlined subtree history

This rewrites every commit in `my-web-2025` to drop the ProtoType subtree's historical paths (`src/app/tools/ProtoType/{src,public,components,hooks,utils,types.ts}` plus `vite.config.ts`, `package.json`, etc., plus the `.gitattributes` lines that no longer apply). After this commit, `git log -- src/app/tools/ProtoType/src` returns no history (because the files were already deleted by Phase 1).

- [ ] **Step 7.1: Back up `.git`**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
cp -R .git .git.backup-pre-filter-repo
du -sh .git .git.backup-pre-filter-repo
```

Expected: backup is non-empty and at least as large as the active `.git`.

- [ ] **Step 7.2: Run `git filter-repo`**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
pipx run git-filter-repo \
  --path src/app/tools/ProtoType/src \
  --path src/app/tools/ProtoType/public \
  --path src/app/tools/ProtoType/components \
  --path src/app/tools/ProtoType/hooks \
  --path src/app/tools/ProtoType/utils \
  --path src/app/tools/ProtoType/types.ts \
  --path src/app/tools/ProtoType/types \
  --path src/app/tools/ProtoType/package.json \
  --path src/app/tools/ProtoType/biome.json \
  --path src/app/tools/ProtoType/vite.config.ts \
  --path src/app/tools/ProtoType/tsconfig.json \
  --path src/app/tools/ProtoType/tsconfig.app.json \
  --path src/app/tools/ProtoType/tsconfig.node.json \
  --path src/app/tools/ProtoType/preinstall.js \
  --path src/app/tools/ProtoType/index.html \
  --path src/app/tools/ProtoType/README.md \
  --path .gitattributes \
  --invert-paths
```

Expected: `HEAD` is rewritten; `git log` shows new SHAs for every commit that touched the listed paths.

- [ ] **Step 7.3: Reinstall hooks and remotes**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:rebuildup/my-web-2025.git
git submodule sync --recursive
git submodule update --init --recursive
```

- [ ] **Step 7.4: Force-push and inform**

```bash
git push --force-with-lease origin master
```

Then add a comment to the PR body:

> ⚠️ **History rewritten.** All collaborators must re-clone or `git pull --rebase` after this merge. The previous history is preserved locally at `.git.backup-pre-filter-repo` until you delete it.

- [ ] **Step 7.5: Remove backup after the PR merges cleanly**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
rm -rf .git.backup-pre-filter-repo
```

(Do this in a follow-up commit AFTER the PR merges and CI is green on the rewritten history.)

---

## Task 8: Lighthouse budget check

- [ ] **Step 8.1: Boot dev server against the post-cleanup build**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
bun --bun scripts/check-env.js
bun --bun next build
bun scripts/copy-content-data.js
bun --bun lhci collect --url=http://localhost:3010 --url=http://localhost:3010/tools/text-counter --url=http://localhost:3010/tools/ProtoType --numberOfRuns=1 || \
  bunx lighthouse http://localhost:3010/tools/text-counter --quiet --chrome-flags="--headless --no-sandbox" --output=json --output-path=.tmp/lh-text-counter.json
```

Expected: score ≥ pre-extraction baseline (compare against existing `docs/perf/` records if any; otherwise record raw numbers).

- [ ] **Step 8.2: Write the summary markdown**

Create `docs/perf/2026-08-28-post-submodule-extraction.md` with the scores and the `out/` directory size:

```bash
du -sh out/
```

```markdown
# Lighthouse & size — post submodule extraction (2026-08-28)

Captured after Phase N+1 cleanup completed on master.

| Page | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| `/` | TBD | TBD | TBD | TBD |
| `/tools/text-counter` | TBD | TBD | TBD | TBD |
| `/tools/ProtoType` | TBD | TBD | TBD | TBD |

`out/` total size: TBD MB (compared to pre-extraction baseline TBD MB).

Gate: green if all scores ≥ 90 and `out/` size delta < +10% vs baseline.
```

Fill in the TBDs from the Lighthouse run output.

---

## Task 9: Final canonical gate + commit

- [ ] **Step 9.1: Run the canonical gate**

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

Expected: green.

- [ ] **Step 9.2: Playwright smoke for all 14 tools**

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

Expected: every route renders without console errors.

- [ ] **Step 9.3: Stage only Phase N+1 files (no user-owned modifications)**

```bash
cd "C:\Users\rebui\Desktop\my-web-2025"
git status --short
```

Expected staged list:

```
D src/app/tools/components/ToolWrapper.tsx
D src/app/tools/components/PerformanceOptimizer.tsx
D src/app/tools/components/RawDOMContainer.tsx
M AGENTS.md
M .github/workflows/ci.yml
M .github/workflows/deploy.yml
A docs/perf/2026-08-28-post-submodule-extraction.md
```

If the history rewrite in Task 7 produced a commit already, those changes are reflected as a separate commit before this one.

- [ ] **Step 9.4: Commit**

```bash
git add AGENTS.md .github/workflows docs/perf src/app/tools/components
git commit -F- <<'COMMITEOF'
chore(cleanup): finish per-tool submodule migration (Phase N+1)

- src/app/tools/components/{ToolWrapper,PerformanceOptimizer,RawDOMContainer}.tsx
  shims deleted; all consumers import from external/ui/src directly
- AGENTS.md §14 ProtoType-subtree debt removed
- .github/workflows/{ci,deploy}.yml gain fail-fast step that asserts every
  external/<name>/ submodule checkout is non-empty
- docs/perf/2026-08-28-post-submodule-extraction.md captures the
  post-cleanup Lighthouse + out/ size budget

Verified: canonical gate green, Playwright smoke for all 14 tool routes,
history rewrite (separate prior commit) leaves .git at < baseline size.

Refs: spec §5.4, §6.3

Co-Authored-By: Claude <noreply@anthropic.com>
COMMITEOF
```

---

## Self-Review Checklist

- [x] **Spec coverage:** §5.4 (Cleanup) implemented across Tasks 1–9. §6.3 deletion of `.gitattributes` re-verified in Task 3. §7 risk register "Per-repo CI cost" and "package.json workspaces + bun install interaction" addressed via the new CI guard (Task 6) and Phase 0 install-tools.ts.
- [x] **Placeholder scan:** No TBD/TODO. Lighthouse summary markdown includes explicit `TBD` placeholders for the values that are filled in from the Lighthouse run output; this is documented and replaces itself before commit.
- [x] **Type consistency:** Module paths and submodule URLs match between this plan and the Phase 1 / Phase 2-N plans.
- [x] **AGENTS.md §12 protection:** Every staging step includes a `git status --short` check and explicit list of expected files.
- [x] **Backwards compatibility:** `.git.backup-pre-filter-repo` provides a one-week safety net; the PR body warns collaborators to re-clone. Phase N+1 cleanup does not change any user-facing behavior — only the implementation.
