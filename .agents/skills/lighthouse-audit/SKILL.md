---
name: lighthouse-audit
description: Run a local Lighthouse audit against the production static export, capture Performance / Accessibility / Best Practices / SEO scores, and gate commits / PRs on regressions. Use after a UI / asset / route change, before opening a deploy PR, or when the user asks for a performance check. Stores artifacts under .tmp/ — never committed.
---

# Lighthouse Audit

This skill runs Lighthouse against the production static export, captures the four category scores, and surfaces regressions against the previous run.

## When to use

- "パフォーマンス確認" / "Lighthouse 回して" / "Lighthouse score 落ちてない?"
- After any change that affects: bundle size, image loading, route generation, font loading, third-party scripts, or admin pages.
- Before opening a deploy PR (pair with `deploy-check`).

## Workflow

1. Build the production static export so Lighthouse audits the real artifact, not dev mode:
   ```bash
   bun run build
   ```
   The build is the slowest step and may SIGILL 132 at teardown under Bun 1.3.14 — verify `out/index.html` exists (see `deploy-check` skill).

2. Serve the static export locally:
   ```bash
   bun --bun npx --yes serve out -l 3011 &
   # wait for "Accepting connections at http://localhost:3011"
   ```
   Pick a port different from the dev port (3010) and from the CMS API (3001).

3. Run Lighthouse against the target route (default: `/`):
   ```bash
   bun x lighthouse http://localhost:3011/ \
     --preset=desktop \
     --output=json --output=html \
     --output-path=.tmp/lighthouse \
     --chrome-flags="--headless --no-sandbox" \
     --quiet
   ```
   For mobile: drop `--preset=desktop`. For multiple routes, run the command per route and suffix the output path.

4. Parse the JSON and compare against `.tmp/lighthouse.previous.json` (if it exists):
   ```bash
   bun -e "
   const cur = await Bun.file('.tmp/lighthouse.report.json').json();
   const prev = await Bun.file('.tmp/lighthouse.previous.json').json().catch(() => null);
   for (const k of ['performance','accessibility','best-practices','seo']) {
     const c = Math.round(cur.categories[k].score * 100);
     const p = prev ? Math.round(prev.categories[k].score * 100) : null;
     console.log(k.padEnd(16), c, p === null ? '(no baseline)' : (c - p >= 0 ? '+'+(c-p) : (c-p)));
   }
   "
   ```

5. Save `.tmp/lighthouse.report.json` as `.tmp/lighthouse.previous.json` only if the user accepts the new scores. Never commit anything under `.tmp/`.

## Pass / fail heuristic (sane defaults)

- **Performance** >= 90 (desktop) or >= 80 (mobile).
- **Accessibility** >= 95.
- **Best Practices** >= 95.
- **SEO** >= 95.

If any score drops by more than 5 points vs the baseline, fix the regression before committing the UI change.

## Constraints

- Audit must run against the **built artifact** (`out/`), not `next dev` — the latter inflates scores via HMR / source maps.
- Artifacts live in `.tmp/lighthouse.*` only. The repo `.gitignore` already ignores `lighthouse-results/`, but `.tmp/` is the canonical scratch space for this skill.
- Don't run Lighthouse against a remote URL by default — measurements depend on network and CDN edge state. Local measurements are reproducible.
- If the user is on a non-Chromium machine, install Chrome via Playwright (`bunx playwright install chromium`) and pass `--chrome-path=...` to Lighthouse.
- Audit is a gate, not a guarantee. It catches regressions; it doesn't replace Playwright for visual / interaction verification.

## Reference

- `docs/05_requirement.md` — non-functional targets (LCP < 2.5s, CLS < 0.1, TTFB < 800ms)
- `docs/04_package.md` — `lighthouse` devDependency
- `.claude/skills/deploy-check/SKILL.md` — pre-deploy gate (use this skill alongside it)
- `.claude/skills/verify-and-commit/SKILL.md` — general pre-commit gate
