---
name: add-content
description: Create or modify a content item in the per-SQLite CMS. Use when adding portfolio entries, blog posts, downloads, or any content served via /api/cms/contents or /api/content/[id]. Encodes the schema, FTS5, and mapper invariants so the canonical Content interface stays the contract.
---

# Add Content Item

This project uses a distributed-SQLite CMS: every content item lives in its own `.db` file at `data/contents/content-{id}.db`. Adding content means bootstrapping that database with the right schema, populating FTS5, and registering through the admin API.

## When to use

- "Add a portfolio entry for X"
- "Create a blog post about Y"
- "Register download Z in the CMS"
- Any time content needs to land in `data/contents/`

## Workflow

1. Read `src/cms/types/content.ts` end-to-end before touching the DB. The `Content` interface is the canonical schema — any DB column added without updating the interface and `content-mapper.ts` is a contract violation.
2. Check if a migration applies. Use existing entries in `src/cms/lib/migrations/` as templates. Apply index migrations via `bun run migration:add-indexes`. Schema-level changes go in `content-db-manager.ts` schema init.
3. Insert via the admin API — never write directly to `data/contents/*.db` from a script:
   ```
   POST /api/admin/content
   Content-Type: application/json

   {
     "type": "portfolio" | "blog" | "download" | "plugin" | ...,
     "title": "...",
     "slug": "...",
     "tags": ["..."],
     "markdown": "...",
     ... other fields per Content interface
   }
   ```
   The handler in `src/app/api/admin/content/route.ts` opens the per-item DB, runs schema init from `content-db-manager.ts`, inserts the row, and registers the FTS5 entry.
4. Verify:
   - `GET /api/cms/contents` lists the new item
   - `GET /api/content/{id}` returns the single item
   - `GET /api/search/index?q=<relevant-term>` returns it for a meaningful query (FTS5 sanity check)
   - Tags appear in `GET /api/admin/tags/stats`
5. Never bypass `content-mapper.ts`. If the row format diverges from `Content`, fix the mapper and the type — never `as any` to silence.

## Constraints

- One `.db` per content item. Do not combine items into a shared DB — isolation is the whole point.
- FTS5 must stay in sync with the `content` table. Triggers in `content-db-manager.ts` keep them aligned — don't bypass them with raw `INSERT`/`UPDATE` SQL.
- Never edit `data/contents/*.db` directly. They are binary; all writes go through the admin API or `content-service.ts`.
- Tags are many-to-many via `tags` and `content_tags`. A new tag must populate both tables on insert.
- Media BLOBs go through `src/app/api/admin/files` (with progress tracking at `/upload/progress`). Don't write image files into the content DB unless they are explicitly content-embedded (rare; usually just store the path/URL).
- If importing from legacy JSON, use `scripts/sync-legacy-contents-to-rust.ts`, `scripts/sync-legacy-markdown-to-rust.ts`, or `scripts/sync-legacy-media-to-rust.ts` rather than rewriting data by hand.

## Reference

- `src/cms/lib/content-db-manager.ts` — DB lifecycle, schema init, FTS5 triggers
- `src/cms/lib/content-mapper.ts` — row ↔ `Content`
- `src/cms/server/content-service.ts` — public read API
- `src/cms/types/content.ts` — `Content` interface (canonical schema)
- `src/cms/lib/migrations/` — schema migrations
- `src/app/api/admin/content/route.ts` — admin POST handler
- `src/app/api/cms/contents/route.ts` — public list handler
- `scripts/sync-legacy-{contents,markdown,media}-to-rust.ts` — legacy JSON importer
