# ADR 0013: Extract tools into per-repo git submodules

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
