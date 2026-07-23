---
name: sync-external-tool
description: Sync or add an external git-subtree tool (e.g. ProtoType) under src/app/tools/<name>/. Use when pulling updates from an upstream repo or registering a new external tool. Bridges subtree workflow with bridge-file protection.
disable-model-invocation: true
---

# Sync External Tool

Add or update a git-subtree-backed tool under `src/app/tools/<name>/`. Bridge files (`page.tsx`, `layout.tsx`) plus `.gitattributes merge=ours` keep this safe across re-pulls.

## When to use

- "Update ProtoType from upstream"
- "Pull latest from <repo> into src/app/tools/<repo-name>"
- "Add a new external tool from <repo-url>"

## Workflow

### Update an existing tool

```
./scripts/sync-subtree.sh <name> <repo-url> [branch] [prefix]
```

Defaults: branch `main`, prefix `src/app/tools/<name>`. The script produces a squash-merge commit so history stays linear.

### Add a new tool

1. Run `./scripts/sync-subtree.sh <name> <repo-url> <branch> <prefix>`.
2. Create the bridge files (Next.js will route requests to the upstream app via dynamic import):
   - `<prefix>/page.tsx`:
     ```tsx
     "use client";
     import dynamic from "next/dynamic";
     const App = dynamic(() => import("./src/App"), { ssr: false });
     export default function Page() { return <App />; }
     ```
   - `<prefix>/layout.tsx`: CSS imports + `export const metadata: Metadata = { title: "<name>" }`.
3. Add bridge files to `.gitattributes` so future subtree pulls don't clobber them:
   ```
   src/app/tools/<name>/page.tsx merge=ours
   src/app/tools/<name>/layout.tsx merge=ours
   ```
4. Run `node scripts/merge-deps.mjs <prefix>/package.json --dry-run` first; if the diff looks right, run it without `--dry-run` to merge upstream deps into root `package.json`.
5. Add the tool to the `tools` array in `src/app/tools/page.tsx` (use existing entries as the format template — id/title/description/href/category/icon).
6. Verify by running `bun dev` and visiting `http://localhost:3010/tools/<name>`.
7. If the upstream ships a Chakra v3 surface (e.g. `@appletosolutions/reactbits`), confirm `transpilePackages` in `next.config.ts` includes the package name.

## Constraints

- Never edit files under `<prefix>/src/**` — that's upstream territory. Fix bugs in the upstream repo and re-pull.
- Always dry-run `merge-deps.mjs` first to inspect the proposed `package.json` diff before applying.
- TypeScript build errors are ignored at the repo level (`typescript.ignoreBuildErrors: true` in `next.config.ts`) — `bun dev` is the source of truth for integration issues.

## Reference

- `scripts/sync-subtree.sh` — subtree pull/push
- `scripts/merge-deps.mjs` — dep merger (supports `--dry-run`)
- `.gitattributes` — bridge-file protection (existing entry: ProtoType/page.tsx + layout.tsx)
- `next.config.ts` — `transpilePackages`
- `src/app/tools/page.tsx` — tool index
