---
name: sync-cms-entries
description: Import legacy portfolio / markdown / media into the Rust CMS via the project's sync scripts. Use when migrating data from the old JSON / markdown / media layout into `data/contents/content-{id}.db` and the Rust API. Encodes the canonical script flags and the verification path so a sync never bypasses the admin API.
---

# Sync CMS Entries

The repository ships three sync scripts under `scripts/` for moving legacy data into the current CMS layout (`data/contents/content-{id}.db` + Rust API). This skill is the single entry point for invoking them in the right order with the right flags.

## When to use

- "legacy ポートフォリオを取り込んで" / "import the old JSON"
- "Markdown ファイルを CMS へ登録"
- "メディアファイルを Rust CMS へ転送"
- Any bulk content migration from the pre-Rust layout into the current per-item DB / Rust API.

## The scripts

```bash
# 1. 構造化 JSON -> data/contents/content-{id}.db への投入
bun run sync:cms-entries        # scripts/sync-legacy-contents-to-rust.ts

# 2. Markdown 本文 -> 各 content DB の markdown カラム / files
bun run sync:cms-markdown        # scripts/sync-legacy-markdown-to-rust.ts
```

> メディア (画像 / 動画 / 音声) は 2026-08 のアーキテクチャ修正で **Rust API への直接 POST** が正. `scripts/sync-legacy-media-to-rust.ts` と `bun run sync:cms-media` は削除済み. 詳細は `docs/adr/0004-distributed-sqlite-cms.md` の 2026-08 更新を参照.

## Workflow

1. Confirm the Rust CMS API is reachable and the target `data/` directory is writable:
   ```bash
   curl -fsS http://127.0.0.1:3001/health || bun run dev:cms-api
   ```
2. Run `sync:cms-entries` first. Watch for `mapper round-trip mismatch` warnings — they mean a row in the legacy JSON doesn't fit `src/cms/types/content.ts` and `src/cms/lib/content-mapper.ts`. Fix the mapper, do not coerce with `as any`.
3. Run `sync:cms-markdown` next. Verify a few sample slugs via `GET /api/content/{id}` — markdown body should match the source.
4. Final checks:
   - `GET /api/cms/contents` returns the new total.
   - `GET /api/search/index?q=<common-term>` returns hits (FTS5 sanity).
   - `GET /api/admin/tags/stats` reflects any new tags.

## Constraints

- These scripts are the ONLY supported bulk import path. Do not write directly to `data/contents/*.db` (the `block-binary.sh` hook will refuse, and the data will desync from FTS5).
- Do not re-run a sync without a clean target — duplicate IDs will surface as unique constraint errors. Roll back the partial run before retrying.
- FTS5 triggers in `content-db-manager.ts` must stay enabled. If a script disables them to speed up bulk writes, re-enable them before the final commit.
- After sync, run the canonical gate (`verify-and-commit` skill) before opening a PR.

## Reference

- `scripts/sync-legacy-contents-to-rust.ts` — JSON → DB
- `scripts/sync-legacy-markdown-to-rust.ts` — Markdown → DB
- `src/cms/types/content.ts` — canonical `Content` schema
- `src/cms/lib/content-mapper.ts` — row ↔ `Content`
- `src/cms/lib/content-db-manager.ts` — schema init + FTS5 triggers
- `src/cms/lib/migrations/` — schema migrations
- `.claude/skills/add-content/SKILL.md` — single-item path (use that for one-off edits, this skill for bulk)
