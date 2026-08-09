---
name: deploy-check
description: Pre-deploy local verification that mirrors .github/workflows/deploy.yml's `verification` job (type-check, lint, knip, test). Use before tagging a release, opening a deploy PR, or running the GitHub Actions deploy workflow. Surfaces gate failures and the known SIGILL teardown behavior so the agent never lies about a green deploy.
---

# Deploy Check

The GitHub Actions `deploy.yml` separates `verification` from the actual `deploy` job so a fresh runner can build the static export after a clean checkout. This skill runs the same `verification` set locally before you ever click **Run workflow** in the Actions tab.

## When to use

- "リリース前の確認" / "deploy 前の検証" / "tag を切る前にもう一度"
- Any time the user is about to run the `Bun Build, Static Export and Server Deploy` workflow, push a tag, or promote a build to `releases/`.

## What to run, in order

The exact same gates `deploy.yml#verification` runs on the runner. Run them on a **fresh checkout** when possible — `bun test` opens `data/contents/*.db` via `bun:sqlite` and leaves WAL/SHM artifacts that pollute a follow-up `next build` (see the comment in `deploy.yml` lines 8-13).

```bash
# 0. Fresh checkout
git status --short   # abort if there are untracked files unrelated to the deploy
git fetch --prune

# 1. Install (locked)
bun install --frozen-lockfile

# 2. Static + dynamic gates (Bun side)
bun run type-check
bun run lint
bun x knip
bun run test

# 3. Rust CMS API gate (apps/cms-api/)
cd apps/cms-api
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test --all-targets
cd ../..
```

UI changes additionally need Playwright smoke on the affected route (use `mcp__playwright__*` or `bun run test:e2e` if defined locally).

## Known pitfalls the agent must surface

- **`bun --bun next build` SIGILL 132 on Bun 1.3.14 + Next 16.3.0**: the build itself completes, `out/index.html` lands on disk, then the runtime crashes during `bun:sqlite` teardown. `deploy.yml` tolerates exit 132 **iff** `out/index.html` exists; otherwise the workflow fails. Reproduce locally with the same flag and check that the artifact exists before claiming green.
- **Knip `knip.jsonc` rule relaxation**: files / exports / types / nsExports / nsTypes are off. Don't be alarmed by the small surface area — that's intentional, not a false-negative.
- **Bun version drift**: `package.json` pins 1.3.10, `ci.yml` and `deploy.yml` use 1.3.14, `claude.yml` uses 1.3.10. If your local Bun is 1.3.10, you may not see the SIGILL the runner sees, and vice versa. Document the local version in the deploy PR body.
- **Biome overrides**: nine components have stricter `noArrayIndexKey`. Don't open overrides casually.

## What to report

| Gate         | Command                              | Result | Notes (only when FAIL or env note) |
| ------------ | ------------------------------------ | ------ | ----------------------------------- |
| Install      | `bun install --frozen-lockfile`      | PASS / FAIL | |
| Type check   | `bun run type-check`                 | PASS / FAIL | |
| Lint         | `bun run lint`                       | PASS / FAIL | |
| Dead code    | `bun x knip`                         | PASS / FAIL | |
| Tests        | `bun run test`                       | PASS / FAIL | |
| Rust fmt     | `cargo fmt --all -- --check` (apps/cms-api/) | PASS / FAIL | |
| Rust clippy  | `cargo clippy --all-targets -- -D warnings` (apps/cms-api/) | PASS / FAIL | |
| Rust tests   | `cargo test --all-targets` (apps/cms-api/) | PASS / FAIL | |
| Env note     | local Bun version                    | x.y.z  | e.g. 1.3.10 (matches `package.json`) |
| SIGILL check | `bun run build` exit 132 tolerance  | ok / not-applicable | if reproducible, mention it in the PR |

Stop at the first FAIL and fix the root cause. No `--no-verify`, no skipped tests, no blanket lint suppression. When everything is green, hand off to the user — the agent does NOT trigger the GitHub Actions deploy.

## Reference

- `.github/workflows/deploy.yml` — the canonical `verification` job this skill mirrors
- `.github/workflows/ci.yml` — PR-time check
- `AGENTS.md` §14 — known quality debt (SIGILL, Bun version drift, transpilePackages hack)
- `.claude/skills/verify-and-commit/SKILL.md` — pre-commit gate (subset of this skill's gates)
