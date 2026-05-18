# Content Database Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current per-content SQLite file layout with a Git-reviewable normalized content source that can be built into an efficient SQLite database for runtime reads.

**Architecture:** Use sharded text files under `data/content-source/` as the canonical source of truth, then compile them into `.generated/content.db` for runtime. Normalize reusable entities into relational files, keep opaque JSON only for truly open-ended metadata, and provide a compatibility repository so pages can migrate without a big-bang rewrite.

**Tech Stack:** Next.js App Router, Bun runtime, SQLite/Bun SQLite adapter, Rust CMS API, GitHub Actions deploy.

---

## Current Findings

- `data/contents/content-*.db` has 63 SQLite files, but only 61 content rows.
- Listing flows call `getAllFromIndex()`, which scans every DB file and opens each file to build an index.
- Detail flows then call `getContentDb(id)` and open a second per-content DB.
- `markdown-service.ts` repeats the same per-file scan for markdown pages.
- Actual data counts: 61 contents, 61 markdown pages, 193 tag rows, 44 asset rows, 110 link rows, 126 media rows, 0 relation rows, 0 manual date rows.
- `contents.ext` currently only contains `thumbnail` in 44 rows.
- `contents` has many unused or derived columns: tree fields, permissions, versioning, cache, private data, manual date table, relation table.
- The site still maps DB rows through older `ContentItem`/portfolio processors, so database independence exists only partially.

## Corrected Storage Model

The canonical content data must remain Git-manageable. A single SQLite file is not acceptable as the source of truth because it is binary, hard to review, hard to merge, and opaque in history.

Target split:

- Canonical source: `data/content-source/**/*.json`
- Generated runtime database: `.generated/content.db`
- Deployed artifact: generated `content.db` plus media payloads if needed

The SQLite database is a build product, not the canonical data store. It may be deleted and regenerated from the text source.

## Target Source Tree

```text
data/
  content-source/
    schema.json
    contents/
      portfolio/
        kosen-fes-2025.json
        my-web-2025.json
      workshop/
        ...
    markdown/
      kosen-fes-2025.md
      my-web-2025.md
    media/
      manifest.json
      kosen-fes-2025/
        media_1762426498159_ye3gp823c.webp
    tags.json
    links.json
```

Rules:

- One content item per JSON file.
- One markdown body per `.md` file.
- Media binary files are split by content id to keep Git diffs and history localized.
- Shared catalogs such as `tags.json` are text and sorted deterministically.
- Generated SQLite and generated indexes are ignored by Git.
- Runtime never scans every JSON file. Runtime reads generated SQLite.

## Canonical Text Schemas

`contents/<type>/<id>.json`:

```json
{
  "id": "kosen-fes-2025",
  "slug": "kosen-fes-2025",
  "title": "宇部高専祭ウェブサイト2025",
  "summary": "2025年 宇部高専祭ウェブサイトを制作しました",
  "type": "portfolio",
  "category": "develop",
  "status": "published",
  "visibility": "public",
  "priority": 0,
  "lang": "ja",
  "publicUrl": "https://www2.ube-k.ac.jp/fes2025/",
  "tags": ["develop", "React", "Vite", "Web"],
  "thumbnail": "media_1762426498159_ye3gp823c",
  "links": [
    {
      "href": "https://github.com/rebuildup/kosen-fes-2025",
      "label": "GitHub",
      "rel": "github",
      "primary": true
    }
  ],
  "seo": {
    "title": "宇部高専祭ウェブサイト2025",
    "description": "2025年 宇部高専祭ウェブサイトを制作しました"
  },
  "createdAt": "2025-11-06T10:52:47.555Z",
  "updatedAt": "2025-11-08T15:23:12.498Z",
  "publishedAt": "2025-11-06T10:52:47.555Z"
}
```

`media/manifest.json`:

```json
{
  "assets": [
    {
      "id": "media_1762426498159_ye3gp823c",
      "contentId": "kosen-fes-2025",
      "role": "thumbnail",
      "kind": "image",
      "storage": "path",
      "path": "media/kosen-fes-2025/media_1762426498159_ye3gp823c.webp",
      "mimeType": "image/webp",
      "width": 1200,
      "height": 630,
      "alt": ""
    }
  ]
}
```

Markdown files use regular Markdown with the existing CMS component tags normalized by the compiler:

```md
# 宇部高専祭ウェブサイト2025

2025年 宇部高専祭ウェブサイトを制作しました

<Image src="media_1762426498159_ye3gp823c" alt="" />
```

## Runtime Schema

Generated file:

- `.generated/content.db`

Core tables:

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'portfolio',
  category TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')),
  visibility TEXT NOT NULL CHECK(visibility IN ('public', 'unlisted', 'private')),
  priority INTEGER NOT NULL DEFAULT 0,
  lang TEXT NOT NULL DEFAULT 'ja',
  public_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  archived_at TEXT,
  CHECK(length(id) > 0),
  CHECK(length(slug) > 0)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE content_tags (
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (content_id, tag_id)
);

CREATE TABLE markdown_pages (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE REFERENCES contents(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  frontmatter_json TEXT NOT NULL DEFAULT '{}',
  html_cache TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')),
  lang TEXT NOT NULL DEFAULT 'ja',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  content_id TEXT REFERENCES contents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('thumbnail', 'gallery', 'download', 'embed', 'source')),
  kind TEXT NOT NULL CHECK(kind IN ('image', 'gif', 'video', 'audio', 'document', 'external')),
  storage TEXT NOT NULL CHECK(storage IN ('blob', 'url', 'path')),
  url TEXT,
  data BLOB,
  filename TEXT,
  mime_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK((storage = 'blob' AND data IS NOT NULL) OR (storage IN ('url', 'path') AND url IS NOT NULL))
);

CREATE TABLE content_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  href TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  rel TEXT NOT NULL DEFAULT 'other',
  is_primary INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE seo_metadata (
  content_id TEXT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  json_ld TEXT
);

CREATE TABLE content_search (
  content_id TEXT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL,
  tokens_json TEXT NOT NULL DEFAULT '[]'
);

CREATE VIRTUAL TABLE content_fts USING fts5(
  content_id UNINDEXED,
  title,
  summary,
  body,
  tags,
  content=''
);
```

Indexes:

```sql
CREATE INDEX idx_contents_status_type_published ON contents(status, type, published_at DESC);
CREATE INDEX idx_contents_category_published ON contents(category, published_at DESC);
CREATE INDEX idx_content_tags_tag ON content_tags(tag_id);
CREATE INDEX idx_media_assets_content_role ON media_assets(content_id, role, sort_order);
CREATE INDEX idx_content_links_content ON content_links(content_id, sort_order);
CREATE INDEX idx_markdown_pages_content ON markdown_pages(content_id);
```

Deliberately not in v1:

- `content_relations`, until related content is actually productized.
- tree columns: `parent_id`, `ancestor_ids`, `path`, `depth`, `child_count`, until nested content exists.
- permissions tables, because production CMS editing is dev-only and there is no multi-user model.
- persistent cache columns. Derived cache belongs in runtime cache or FTS, not canonical content data.
- `manual_dates`, because actual rows are zero.

## Compiler Contract

Create a deterministic compiler:

```bash
bun scripts/build-content-db.ts --source data/content-source --out .generated/content.db
bun scripts/check-content-source.ts --source data/content-source
```

Compiler responsibilities:

- Validate JSON source against Zod schemas.
- Validate unique ids, slugs, tag names, media ids.
- Validate every markdown file has a matching content item.
- Validate every media reference exists.
- Sort inserts deterministically.
- Build SQLite tables and FTS indexes.
- Fail CI if generated DB would differ from source.

The compiler is the boundary between Git-friendly content and RDB-friendly runtime.

## Compatibility Contract

Keep these public functions initially, but back them with `content.db`:

- `getAllFromIndex()`
- `getFromIndex(contentId)`
- `getContentDb(contentId)` only as deprecated wrapper or remove after callers migrate
- `getFullContent(db, id)`
- `saveFullContent(db, content)`
- `listMarkdownPages()`
- `findMarkdownPage()`
- media manager APIs

New internal API:

- `src/cms/lib/content-repository.ts`
  - `listContentSummaries(filters)`
  - `getContentDetail(id)`
  - `saveContentDetail(input)` writes canonical JSON/Markdown, then regenerates DB in dev
  - `deleteContent(id)`
  - `getMarkdownPageByContentId(id)`
  - `saveMarkdownPage(input)`
  - `getMediaAsset(id)`
  - `listMediaAssets(contentId, role?)`

## Task 1: Add Canonical Source Schemas

**Files:**
- Create: `src/cms/source/content-source-schema.ts`
- Create: `src/cms/source/content-source-loader.ts`
- Test: `src/cms/source/__tests__/content-source-loader.bun.test.ts`

**Step 1: Write failing tests**

Test that source JSON, markdown, media manifest, and tags load into a normalized in-memory model.

Run:

```bash
bun test src/cms/source/__tests__/content-source-loader.bun.test.ts
```

Expected: fails because files do not exist.

**Step 2: Implement source schemas**

Use Zod or explicit TypeScript validators. Keep canonical fields strict and reject unknown root-level fields unless they are under `metadata`.

**Step 3: Verify**

Run:

```bash
bun test src/cms/source/__tests__/content-source-loader.bun.test.ts
bun run type-check
```

Expected: pass.

**Step 4: Commit**

```bash
git add src/cms/source/content-source-schema.ts src/cms/source/content-source-loader.ts src/cms/source/__tests__/content-source-loader.bun.test.ts
git commit -m "feat(cms): add git-friendly content source schema"
```

## Task 2: Export Legacy DBs To Canonical Source

**Files:**
- Create: `scripts/export-content-source.ts`
- Create: `src/cms/source/__tests__/export-content-source.bun.test.ts`
- Modify: `package.json`

**Step 1: Write failing migration test**

Create a temp `data/contents/content-example.db` with current schema subset, run export into temp `content-source`, assert:

- one deterministic `contents/portfolio/example.json`
- one `markdown/example.md`
- media manifest includes thumbnail and BLOB media
- tags are sorted and deduplicated
- links are embedded in the content JSON in stable order

**Step 2: Implement migration script**

Script behavior:

```bash
bun scripts/export-content-source.ts --from data/contents --to data/content-source --dry-run
bun scripts/export-content-source.ts --from data/contents --to data/content-source
```

Rules:

- Never delete old DBs.
- Refuse to overwrite existing source files unless `--force`.
- Lowercase tag identity in `tags.name`, preserve original label in `display_name`.
- Generate missing `slug` from `contents.id`.
- Choose `contents.type` from known category tags: `develop`, `video`, `design`, `video&design`, otherwise `portfolio`.
- Convert `thumbnails` JSON into source `thumbnail` references and `media/manifest.json`.
- Convert `content_assets` into media manifest entries.
- Convert `media` rows into media files plus media manifest entries.

**Step 3: Verify**

Run:

```bash
bun test src/cms/source/__tests__/export-content-source.bun.test.ts
bun scripts/export-content-source.ts --from data/contents --to data/content-source --dry-run
```

Expected: dry run reports 61 content JSON files, 61 markdown files, 193 tag assignments, 126 media assets.

**Step 4: Commit**

```bash
git add scripts/export-content-source.ts src/cms/source/__tests__/export-content-source.bun.test.ts package.json data/content-source
git commit -m "feat(cms): export content into normalized source files"
```

## Task 3: Add Generated SQLite Builder

**Files:**
- Create: `src/cms/lib/content-schema.ts`
- Create: `src/cms/lib/content-database.ts`
- Create: `scripts/build-content-db.ts`
- Test: `src/cms/lib/__tests__/content-database-builder.bun.test.ts`

**Step 1: Write failing tests**

Load temp canonical source and assert generated SQLite has all target rows, FTS rows, and indexes.

**Step 2: Implement builder**

Builder reads `data/content-source`, validates it, then writes `.generated/content.db` atomically via temp file rename.

**Step 3: Verify**

Run:

```bash
bun test src/cms/lib/__tests__/content-database-builder.bun.test.ts
bun scripts/build-content-db.ts --source data/content-source --out .generated/content.db
```

**Step 4: Commit**

```bash
git add src/cms/lib/content-schema.ts src/cms/lib/content-database.ts scripts/build-content-db.ts src/cms/lib/__tests__/content-database-builder.bun.test.ts
git commit -m "feat(cms): build runtime database from content source"
```

## Task 4: Add Repository Layer

**Files:**
- Create: `src/cms/lib/content-repository.ts`
- Test: `src/cms/lib/__tests__/content-repository.bun.test.ts`

**Step 1: Write repository tests**

Cover:

- list published portfolio summaries without scanning files
- get one content detail with tags, links, markdown, media
- filter by type/category/status
- full-text search uses `content_fts`

**Step 2: Implement repository**

Use one database connection per operation. Keep return shapes close to existing `Content` and `ContentItem`.

**Step 3: Verify**

Run:

```bash
bun test src/cms/lib/__tests__/content-repository.bun.test.ts
bun run type-check
```

**Step 4: Commit**

```bash
git add src/cms/lib/content-repository.ts src/cms/lib/__tests__/content-repository.bun.test.ts
git commit -m "feat(cms): add normalized content repository"
```

## Task 5: Move Read Paths To Repository

**Files:**
- Modify: `src/cms/server/content-service.ts`
- Modify: `src/cms/server/markdown-service.ts`
- Modify: `src/cms/lib/content-db-manager.ts`
- Modify: `src/app/api/content/portfolio/route.ts`
- Modify: portfolio/gallery pages that call `getAllFromIndex()`
- Test: existing route and mapper tests

**Step 1: Add compatibility tests**

Assert existing public APIs still return the same counts and fields from generated `.generated/content.db`.

**Step 2: Replace internals**

`getAllFromIndex()` should call `contentRepository.listContentSummaries()`.

`loadAllContents()` should call repository directly, not loop over files.

`findMarkdownPage()` should query `markdown_pages` directly by id/slug/content_id.

**Step 3: Verify**

Run:

```bash
bun test
bun run type-check
bun run build
```

**Step 4: Commit**

```bash
git add src/cms/server src/cms/lib src/app/api/content/portfolio src/app/portfolio
git commit -m "refactor(cms): read content from normalized database"
```

## Task 6: Move Write Paths To Canonical Source

**Files:**
- Modify: `src/app/api/cms/contents/route.ts`
- Modify: `src/app/api/cms/markdown/route.ts`
- Modify: `src/app/api/cms/media/route.ts`
- Modify: `src/cms/lib/media-manager.ts`
- Test: existing API route tests plus new save/update tests

**Step 1: Write tests**

Cover:

- content create/update writes one `contents` row
- tag changes update join table
- markdown save updates `markdown_pages`
- media upload writes `media_assets`
- media delete removes only the requested asset

**Step 2: Implement writes**

Writes update canonical JSON/Markdown/media source files in development, then regenerate `.generated/content.db`. Production CMS writes remain disabled as today.

**Step 3: Verify**

Run:

```bash
bun test src/app/api/cms/contents/route.test.ts src/app/api/cms/media/route.test.ts
bun test
```

**Step 4: Commit**

```bash
git add src/app/api/cms src/cms/lib
git commit -m "refactor(cms): write content through normalized repository"
```

## Task 7: Remove Per-Content DB Runtime Dependency

**Files:**
- Modify: `scripts/copy-content-data.js`
- Modify: `.github/workflows/deploy.yml`
- Modify: `src/cms/lib/content-db-manager.ts`
- Modify: docs in `documents/`

**Step 1: Update copy script tests manually**

Run:

```bash
bun run build
```

Expected:

- `.next/server/data/content.db` exists as a generated artifact
- `.next/data/content.db` exists as a generated artifact
- canonical `data/content-source` remains Git-tracked
- no requirement for `.next/**/data/contents/*.db`

**Step 2: Update deploy packaging**

Package generated `.generated/content.db`. Do not treat it as canonical.

**Step 3: Keep legacy DBs temporarily**

Do not delete `data/contents` in the same commit. Mark them legacy and stop reading them at runtime.

**Step 4: Commit**

```bash
git add scripts/copy-content-data.js .github/workflows/deploy.yml src/cms/lib/content-db-manager.ts documents
git commit -m "chore(cms): package normalized content database"
```

## Task 8: Production Verification

**Files:**
- Modify only if verification finds defects.

**Step 1: Local checks**

Run:

```bash
bun test
bun run type-check
bun run build
bun --bun next start -p 3013
```

Verify:

```bash
curl http://127.0.0.1:3013/api/cms/contents
curl "http://127.0.0.1:3013/api/cms/markdown?id=kosen-fes-2025&contentId=kosen-fes-2025"
```

Use Playwright to verify `/portfolio/kosen-fes-2025` renders markdown body and images.

**Step 2: Deploy**

Push branch and watch GitHub Actions:

```bash
gh run watch <run-id> --exit-status
```

Expected:

- build succeeds
- Rust CMS API health succeeds
- Next app health succeeds
- portfolio page renders markdown content

**Step 3: Commit fixes if needed**

Small targeted commits only.

## Rollback Plan

- Keep `data/contents/*.db` untouched during initial migration.
- Repository can be gated by `CMS_USE_NORMALIZED_DB=1` for first release.
- If production fails, unset flag and fall back to legacy readers.
- After one successful deployment and verification, remove fallback in a follow-up cleanup.

## Acceptance Criteria

- The canonical content source is Git-reviewable text split by content/media ownership.
- The generated runtime SQLite DB is reproducible from source and is not the source of truth.
- Listing content does not scan or open 63 SQLite files.
- Markdown lookup is a direct indexed query, not a file loop.
- Tags, links, markdown, media, and SEO have relational ownership and foreign keys.
- Existing portfolio/gallery/workshop pages render the same public content.
- `bun test`, `bun run type-check`, `bun run build`, and GitHub Actions deploy pass.
