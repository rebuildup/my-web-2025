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
