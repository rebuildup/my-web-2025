---
name: verify-and-commit
description: Use when finishing a feature, fixing a bug, or before commit/push in this repository. Runs the canonical verification gate (type-check, lint, knip, test, build) in the documented order, surfaces the failures, and proposes a conventional-commit message. Does NOT commit on its own — gates the user on confirmation.
---

# Verify and Commit

This skill is the single entry point for the canonical quality gate defined in `AGENTS.md` §3. It runs the full suite, aggregates results, and hands off to a `git commit` only after every check is green.

## When to use

- "コミットする前にもう一回検証して" / "verify before commit" / "品質ゲートを通して" / "PR 出す前に確認"
- Any time the user is about to commit / push / open a PR and the gate hasn't already been run on the current working tree.

## What to run, in order

```bash
# 1. lockfile + type check
bun install --frozen-lockfile
bun run type-check

# 2. lint + dead code
bun run lint
bun x knip

# 3. unit + integration tests
bun run test

# 4. production build (the slowest gate — last)
bun run build
```

UI changes: also run `mcp__playwright__*` (or the project's Playwright suite) on the affected routes. Lighthouse results go under `.tmp/`, not committed.

## Output format

After running all five steps, report a single table:

| Gate              | Command                  | Result |
| ----------------- | ------------------------ | ------ |
| Install           | `bun install --frozen-lockfile` | PASS / FAIL |
| Type check        | `bun run type-check`     | PASS / FAIL |
| Lint              | `bun run lint`           | PASS / FAIL |
| Dead code         | `bun x knip`             | PASS / FAIL |
| Tests             | `bun run test`           | PASS / FAIL |
| Build             | `bun run build`          | PASS / FAIL |
| Visual (UI only)  | Playwright / Lighthouse  | PASS / FAIL / N/A |

If any row is FAIL, list the first actionable error per failed gate. Do not move on to the commit step until everything is green or the user explicitly accepts a partial state.

## Commit message proposal

Only after the gate is fully green, propose a single conventional-commit message:

- Prefix: `feat | fix | refactor | test | docs | build | ci | chore | perf`
- Subject: 50 chars or less, imperative mood, no trailing period.
- Body: one paragraph explaining the why, then a list of the changed files / areas.
- Footer: reference the relevant `docs/adr/NNNN-*.md` if the change touches a decided area, and any issue / PR numbers.

Wait for explicit user confirmation before running `git commit`. Never `--amend`, never `--no-verify`, never force-push.

## Constraints

- Do not skip a gate. If a check fails, fix the root cause — no `biome check --skip`, no `// @ts-ignore`, no `.only`, no blanket `|| true`.
- Do not commit `data/contents/*.db` or `bun.lock` (the `block-binary.sh` hook will reject the edit anyway).
- Do not create branches or worktrees without explicit user instruction.
- If a gate is environmentally broken (e.g. `bun run build` segfaults on Bun 1.3.14 — see `.github/workflows/deploy.yml` for the documented SIGILL workaround), call that out explicitly instead of pretending it's green.
