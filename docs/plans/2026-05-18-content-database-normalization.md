# Content Database Re-Architecture Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current per-content SQLite layout with a database-first architecture that keeps SQLite as the canonical source of truth, enforces all database access through the Rust CMS API, scales to roughly 1000 fully populated content items, and remains practical for Git-based development.

**Absolute Requirements:**

- Canonical content must live in database files, not JSON source files.
- The database system must function independently as databases, without requiring generated JSON indexes as the source of truth.
- Git-based development must remain practical, with bounded canonical database sizes and no uncontrolled binary growth.
- Next.js must not access databases directly.
- During development, Next.js may access content only through the Rust REST API.
- During production/public runtime, Next.js must not touch canonical databases.
- The CMS integration path used by the site must be migrated in the same delivery wave as the database re-architecture, so the old direct Next.js-side CMS database access does not linger as a parallel system.
- Non-Linux local development for the Rust backend should default to Docker-based execution so macOS and Windows environments do not depend on host-native Rust setup details.

**Architecture Direction:** Use multiple SQLite databases split by change pattern, size characteristics, and runtime responsibility. Keep canonical structured content in small Git-manageable SQLite files. Keep large media binaries out of canonical databases. Generate search and publish-time read artifacts from Rust.

**Tech Stack:** Rust CMS API, SQLite, SQLx, Next.js App Router, Bun, GitHub Actions deploy.

---

## Why The Previous Plan Was Rejected

The earlier normalization plan used:

- `data/content-source/**/*.json` as the canonical source
- `.generated/content.db` as a build artifact

That approach conflicts with the current non-negotiable requirements:

- It makes JSON, not SQLite, the true source of truth.
- It reintroduces coupling between canonical text files and derived database state.
- It weakens the database-first model that motivated the current system in the first place.

The revised direction is therefore:

- SQLite remains canonical.
- Rust is the only database authority.
- Generated artifacts are allowed only for derived read concerns such as search indexes and publish bundles.

---

## Current Findings

- `data/contents/` currently totals about `128MB`.
- Embedded media BLOBs account for about `108MB` of that size.
- The current architecture scales poorly because listing and markdown lookup scan many per-content DB files.
- The schema includes several low-value or currently unused areas:
  - `manual_dates`
  - `content_relations`
  - several tree-oriented fields
  - thumbnail JSON blobs
  - mixed storage of structured fields and opaque JSON
- Per-content DB isolation avoided the old JSON-plus-index coupling, but it also created runtime fan-out, repeated schema duplication, and growth pain.

Implication:

- The problem is not "SQLite".
- The problem is "one SQLite file per content item, each mixing metadata, body, and large binary payloads".

---

## Capacity Planning Assumption

The target design must remain viable for approximately:

- `1000` content items
- full schema population
- meaningful markdown bodies and metadata on most entries
- multiple tags, links, and media references per entry
- large media assets associated with many entries

Design decisions must be made for that target state, not the current 61-item dataset.

---

## Revised Architecture

### Canonical Databases

Canonical data is stored in multiple SQLite files under `data/db/`.

```text
data/
  db/
    catalog.db
    body.db
    taxonomy.db
    media-index.db
  media/
    <content-id>/
      <asset files>
  generated/
    search.db
    publish/
      content-read.db
      manifests/
```

### Role Of Each Database

#### `catalog.db`

Holds lightweight content identity and publishing metadata:

- content id
- slug
- type
- category
- title
- summary
- visibility
- status
- published dates
- SEO summary fields
- thumbnail asset reference

This is the primary listing and routing database.

#### `body.db`

Holds heavier authoring content:

- markdown body
- normalized page blocks if still needed
- revisions/history
- optional frontmatter-like structured page metadata

This database grows with content depth, but not with media binary size.

#### `taxonomy.db`

Holds relational structures that change independently from body text:

- tags
- content_tags
- links
- relations
- optional collections or cross-content groupings

This keeps reusable classifications and associations small and composable.

#### `media-index.db`

Holds only media metadata:

- asset id
- content id
- role
- file path
- mime type
- dimensions
- file size
- hash/checksum
- alt text
- sort order

This database never stores media BLOBs in canonical form.

### Non-Canonical Derived Databases

#### `generated/search.db`

Derived from canonical DBs. Contains:

- FTS tables
- search projections
- autocomplete data

Safe to regenerate. Not canonical.

#### `generated/publish/content-read.db`

Optional publish-time bundled read database used to feed public build/export flows.

Safe to regenerate. Not canonical.

---

## Why This Split Is Better

This split is based on change behavior and size behavior, not only feature labels.

- `catalog.db` changes often but stays small.
- `body.db` changes often and can grow moderately.
- `taxonomy.db` changes independently and stays small.
- `media-index.db` changes with uploads but stays metadata-only.
- search and public read projections can be regenerated and should not pollute canonical history.

This is more scalable than:

- a single giant SQLite file containing everything
- one database per content item
- canonical JSON plus generated SQLite

---

## Media Strategy

This is the critical rule:

**Large media files must not be stored as BLOBs in canonical SQLite databases.**

Canonical storage model:

- media binaries live as files under `data/media/<content-id>/`
- canonical DB stores only metadata and references
- asset integrity is tracked by hash, size, mime type, width, height, and path

Why:

- media BLOBs cause large binary churn in Git
- BLOB-heavy canonical DBs stop being reviewable and mergeable
- a single changed image can force a large DB binary diff

Allowed exceptions:

- tiny generated placeholders
- tiny icons or low-risk embedded binary fields under a strict size cap

Default rule:

- if it is user-authored media, it is file-backed, not DB-BLOB-backed

---

## Rust / Next.js Responsibility Boundary

### Rust CMS API

Rust is the only component allowed to:

- open canonical databases
- run migrations
- validate cross-database consistency
- write content
- write media metadata
- generate search DBs
- generate publish-time read bundles

Rust also owns compatibility and build tooling.

### Local Development Runtime Rule

For the Rust CMS API:

- Linux may run the backend directly with local `cargo run`.
- macOS and Windows should run the backend through Docker by default.
- development scripts should auto-select the Docker path on non-Linux hosts unless explicitly overridden.

### Site CMS Integration Rule

The site-side CMS connection must be switched in the same migration phase as the canonical database cutover.

This means:

- do not finish the new canonical database layer while leaving the site CMS bound to legacy `src/cms/lib/content-db-manager.ts` reads and writes
- do not introduce a long-lived period where both the legacy per-content DB path and the Rust API path are considered active CMS backends
- when development CMS editing is validated on the new Rust-backed path, the site integration should move at the same time

Short overlap for rollout safety is acceptable behind an explicit flag, but the plan should treat DB migration plus CMS connection migration as one coordinated cutover, not two unrelated projects.

### Next.js In Development

Next.js may:

- call Rust REST endpoints during local development
- fetch previews, lists, detail records, and rendered content via HTTP

Next.js may not:

- open SQLite files directly
- run schema logic
- perform fallback DB reads

### Next.js In Production

Public runtime must not touch canonical DBs.

Production options:

1. Build static pages from Rust-generated publish artifacts.
2. Build server routes that read only from a generated read bundle produced during deploy.

Preferred rule:

- canonical DBs are private to Rust and build/deploy workflows
- public app serves generated outputs only

---

## Recommended Canonical Schemas

### `catalog.db`

Core tables:

```sql
CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')),
  visibility TEXT NOT NULL CHECK(visibility IN ('public', 'unlisted', 'private')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'ja',
  priority INTEGER NOT NULL DEFAULT 0,
  public_url TEXT,
  thumbnail_asset_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  archived_at TEXT
);

CREATE TABLE seo_metadata (
  content_id TEXT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  seo_title TEXT,
  seo_description TEXT,
  og_image_asset_id TEXT,
  json_ld TEXT
);
```

### `body.db`

```sql
CREATE TABLE markdown_pages (
  content_id TEXT PRIMARY KEY,
  body TEXT NOT NULL,
  body_format TEXT NOT NULL DEFAULT 'markdown',
  rendered_cache TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE content_revisions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  body TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
```

If blocks are still a product requirement, use a separate blocks table in `body.db`. If not, remove them entirely.

### `taxonomy.db`

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE content_tags (
  content_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (content_id, tag_id)
);

CREATE TABLE content_links (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  href TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  rel TEXT NOT NULL DEFAULT 'other',
  is_primary INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE content_relations (
  source_content_id TEXT NOT NULL,
  target_content_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (source_content_id, target_content_id, relation_type)
);
```

### `media-index.db`

```sql
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  role TEXT NOT NULL,
  storage_kind TEXT NOT NULL CHECK(storage_kind IN ('file', 'external')),
  file_path TEXT,
  external_url TEXT,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  checksum TEXT,
  alt_text TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK(
    (storage_kind = 'file' AND file_path IS NOT NULL AND external_url IS NULL) OR
    (storage_kind = 'external' AND external_url IS NOT NULL AND file_path IS NULL)
  )
);
```

---

## Explicitly Remove Or Defer

Remove from the canonical v1 plan unless a real product requirement appears:

- `manual_dates`
- tree structure fields such as `depth`, `path`, `parent_id`
- embedded thumbnail JSON
- canonical media BLOB storage
- opaque mixed metadata fields without ownership rules

Defer unless proven necessary:

- arbitrary block editor storage
- revision history beyond a minimal audit/version table

---

## Consistency Model

Because canonical data is split across multiple SQLite files, Rust must own consistency checks.

Required guarantees:

- every content id in `body.db`, `taxonomy.db`, and `media-index.db` must exist in `catalog.db`
- every thumbnail asset id in `catalog.db` must exist in `media-index.db`
- every tag relation must reference an existing tag
- every media file path in `media-index.db` must exist on disk unless explicitly marked external

Rust must provide:

- `cargo` or CLI validation command
- consistency check on write
- consistency check in CI
- repair and diagnostics output for broken references

---

## Git Management Rules

Canonical Git-tracked assets:

- `data/db/catalog.db`
- `data/db/body.db`
- `data/db/taxonomy.db`
- `data/db/media-index.db`
- `data/media/...` only if repository policy allows the actual files to remain in Git

Not Git-tracked:

- `data/generated/search.db`
- `data/generated/publish/content-read.db`
- WAL/SHM files
- temporary migration output

Repository hygiene rules:

- enable WAL locally, but never commit `-wal` or `-shm`
- normalize vacuum/checkpoint behavior in maintenance commands
- keep search and cache DBs fully disposable

---

## 1000-Item Scale Expectations

Assuming around 1000 items with full metadata:

- `catalog.db` should remain comparatively small
- `taxonomy.db` should remain comparatively small
- `body.db` will grow with markdown and revision depth, but still be manageable if revision retention is bounded
- `media-index.db` stays manageable because it stores metadata only
- total canonical DB size should remain far smaller than a BLOB-backed monolith

The design remains viable at 1000 items because growth is dominated by file-backed media, not DB-backed media.

The main scaling risks are:

- uncontrolled revision retention in `body.db`
- overly large rendered caches stored canonically
- keeping generated search data under version control

Mitigations:

- cap revision retention or archive old revisions
- make rendered cache non-canonical
- regenerate search artifacts

---

## Migration Strategy

## Phase 1: Define Canonical Multi-DB Schema

**Files:**

- Modify: `apps/cms-api/src/db/schema.sql`
- Modify: `apps/cms-api/src/db/migrations/001_init.sql`
- Modify: `apps/cms-api/src/db/mod.rs`
- Create: `docs/plans/db-boundaries.md`

**Objectives:**

- replace the current single-schema write model with explicit multi-DB boundaries
- add real migration tracking
- remove direct dependence on rerunning raw schema files blindly

**Must Have:**

- one migration chain per canonical DB
- idempotent initialization
- version tracking tables

---

## Phase 2: Add Rust Database Boundary Layer

**Files:**

- Create: `apps/cms-api/src/db/catalog.rs`
- Create: `apps/cms-api/src/db/body.rs`
- Create: `apps/cms-api/src/db/taxonomy.rs`
- Create: `apps/cms-api/src/db/media_index.rs`
- Create: `apps/cms-api/src/db/consistency.rs`

**Objectives:**

- each DB gets an explicit repository/service layer
- cross-database operations happen only through Rust orchestration
- no shared ad hoc SQL from Next.js

---

## Phase 3: Extract Data From Per-Content DBs

**Files:**

- Create: `scripts/migrate-legacy-content-dbs.rs` or Bun wrapper that invokes Rust
- Create: migration tests and fixtures

**Rules:**

- keep legacy `data/contents/*.db` untouched during first migration
- read media BLOBs out of old DBs
- write media binaries to `data/media/<content-id>/...`
- write media metadata into `media-index.db`
- write content metadata into canonical DBs by ownership

**Output:**

- `catalog.db`
- `body.db`
- `taxonomy.db`
- `media-index.db`
- extracted media files

---

## Phase 4: Generate Derived Databases

**Files:**

- Create: `apps/cms-api/src/search/build_search_db.rs`
- Create: `apps/cms-api/src/publish/build_publish_bundle.rs`

**Derived Outputs:**

- `data/generated/search.db`
- `data/generated/publish/content-read.db`
- optional JSON manifests for build orchestration only

Generated artifacts must never become the source of truth.

---

## Phase 5: Route Next.js Through Rust In Development

**Files:**

- Modify: Next.js content fetchers
- Modify: local dev startup scripts

**Rules:**

- development: Next.js uses REST calls to Rust CMS API
- production/public runtime: Next.js serves generated output only
- remove all direct SQLite access from `src/cms/lib/content-db-manager.ts` and adjacent services

**Additional CMS Requirement:**

- admin CMS screens, content editing flows, markdown editing flows, media flows, and preview flows must all switch to the Rust API in this same phase
- the integration layer used by the site CMS should be treated as part of the migration critical path, not as follow-up cleanup

**Expected Deliverables:**

- a Rust-backed CMS client layer for Next.js admin screens
- replacement of direct server-side DB utility usage in CMS routes and services
- preview behavior verified against Rust responses before legacy DB reads are disabled

---

## Phase 6: Remove Legacy Runtime Dependency

**Files:**

- Modify: `src/cms/lib/content-db-manager.ts`
- Modify: `src/cms/server/content-service.ts`
- Modify: `src/cms/server/markdown-service.ts`
- Modify: build/deploy scripts

**Goal:**

- legacy per-content DBs are no longer read at runtime
- only Rust canonical DBs plus generated publish artifacts remain in the active architecture
- the site CMS is no longer coupled to legacy local DB helpers

---

## API Contract

Rust development API must support:

- list content summaries
- get content detail
- get markdown body
- search content
- list tags
- list relations
- list media metadata
- create/update content
- create/update markdown
- create/update link/tag relations
- upload media and register metadata

Public runtime must not expose canonical database semantics directly.

---

## Verification Plan

Local verification must include:

```bash
cd apps/cms-api && cargo test
cd apps/cms-api && cargo run --bin consistency-check
bun run build
bun --bun next dev -p 3010
```

Checks:

- Rust can open all canonical DBs
- consistency checks pass
- dev Next.js reads through REST only
- public build completes without canonical DB access
- search DB can be regenerated deterministically

Scale verification must include synthetic tests for about 1000 items with:

- realistic markdown volume
- realistic tag/link counts
- realistic media metadata counts
- no BLOB-backed canonical media

---

## Rollback Plan

- keep `data/contents/*.db` as legacy read-only fallback during the first rollout
- gate new Rust-backed flow with an environment flag
- if migration fails, return to legacy readers temporarily
- do not delete legacy DBs until:
  - canonical multi-DB migration passes
  - generated publish flow passes
  - local and deployed verification passes

---

## Acceptance Criteria

- SQLite remains the canonical source of truth.
- Canonical source is not JSON.
- No canonical DB stores large media BLOBs by default.
- Rust is the only database access layer.
- Next.js uses REST in development and generated outputs in public runtime.
- Search and publish bundles are generated artifacts, not canonical data.
- The design remains viable for about 1000 fully populated content items.
- Git-managed canonical DB sizes remain bounded because media binaries are file-backed and search data is disposable.
- Legacy per-content DB scanning is fully removed from active runtime paths.
