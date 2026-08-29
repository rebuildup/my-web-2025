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

If the submodule's tracked branch is not `main`, set it first:
```
git -C external/<name> checkout main
```

### Add a new submodule

```
git submodule add https://github.com/rebuildup/<repo>.git external/<name>
```

> Note: HTTPS is the repo convention (matches `.gitmodules`). SSH is no longer used since the rebuildup GitHub login has no SSH key configured. Use HTTPS for all new submodule URLs.

Then:
1. Add the bridge file `src/app/tools/<name>/page.tsx` (see tool-bridge-auditor for the pattern).
2. If the new submodule has its own `package.json`, ensure `transpilePackages` in `next.config.ts` covers its `src/`.
3. Run `bun --bun scripts/install-tools.ts` to install its deps.

> Canonical reference: the existing `external/ui` submodule uses HTTPS — see `.gitmodules`.

## Constraints

- Submodule directories are fully owned by the submodule — never edit files inside `external/<name>/` from the main repo. Fix bugs in the upstream repo and bump the submodule.
- Detached HEAD is normal. Use `git -C external/<name> checkout main` to land on a branch before making local changes.
- Bridge files (`src/app/tools/<name>/page.tsx`, `layout.tsx`) live in the main repo and are NOT protected by `merge=ours` — they must be edited directly when the bridge contract changes.

## Reference

- `.gitmodules` — submodule declarations
- `scripts/install-tools.ts` — per-submodule `bun install`
- `next.config.ts` — `transpilePackages` covering submodule src paths
- `.claude/agents/tool-bridge-auditor.md` — verifies bridge vs submodule consistency
