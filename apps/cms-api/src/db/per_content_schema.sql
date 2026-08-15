-- Per-content SQLite database schema.
--
-- This file mirrors `src/cms/lib/content-db-manager.ts::initializeContentDbSchema`
-- + `ensureManualDatesTable` + `ensureMediaTable` byte-for-byte. It is the
-- schema installed by Rust when `create_media` / `delete_media` open a brand
-- new `content-{id}.db` (no file yet on disk). The schema must remain
-- byte-for-byte compatible with the Bun-side initialization so that opening a
-- DB created by Rust from Bun (or vice versa) is symmetric.
--
-- Statements are split on `;` and stripped of `--` line comments by the
-- `include_str!` loader in `routes/media.rs`, so this file must not contain
-- `;` inside string literals and must use `--` for comments only.
--
-- Drift detection: `cargo test per_content_schema_matches_bun_construction`
-- in `routes/media.rs` compares the resulting schema against an in-memory
-- baseline. Any schema change here must be paired with the same change in
-- `src/cms/lib/content-db-manager.ts`.

CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  public_url TEXT,
  summary TEXT,
  lang TEXT DEFAULT 'ja',
  parent_id TEXT,
  ancestor_ids TEXT,
  path TEXT,
  depth INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'draft' CHECK(visibility IN ('public', 'unlisted', 'private', 'draft')),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  unpublished_at TEXT,
  search_full_text TEXT,
  search_tokens TEXT,
  version INTEGER DEFAULT 1,
  version_latest_id TEXT,
  version_previous_id TEXT,
  version_history_ref TEXT,
  permissions_readers TEXT,
  permissions_editors TEXT,
  permissions_owner TEXT,
  thumbnails TEXT,
  searchable TEXT,
  i18n TEXT,
  seo TEXT,
  cache TEXT,
  private_data TEXT,
  ext TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_accessed_at TEXT
);

CREATE TABLE IF NOT EXISTS content_tags (
  content_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (content_id, tag),
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag);

CREATE TABLE IF NOT EXISTS content_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,
  bidirectional INTEGER DEFAULT 0,
  weight REAL DEFAULT 1.0,
  meta TEXT,
  FOREIGN KEY (source_id) REFERENCES contents(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES contents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_content_relations_source ON content_relations(source_id);
CREATE INDEX IF NOT EXISTS idx_content_relations_target ON content_relations(target_id);

CREATE TABLE IF NOT EXISTS content_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  src TEXT NOT NULL,
  type TEXT,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  meta TEXT,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_content_assets_content ON content_assets(content_id);

CREATE TABLE IF NOT EXISTS content_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  href TEXT NOT NULL,
  label TEXT,
  rel TEXT,
  is_primary INTEGER DEFAULT 0,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_links(content_id);

CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
  id UNINDEXED,
  title,
  summary,
  search_full_text,
  content=contents,
  content_rowid=rowid
);

CREATE TRIGGER IF NOT EXISTS contents_fts_insert AFTER INSERT ON contents BEGIN
  INSERT INTO contents_fts(rowid, id, title, summary, search_full_text)
  VALUES (new.rowid, new.id, new.title, new.summary, new.search_full_text);
END;

CREATE TRIGGER IF NOT EXISTS contents_fts_delete AFTER DELETE ON contents BEGIN
  DELETE FROM contents_fts WHERE rowid = old.rowid;
END;

-- NOTE: There is intentionally NO contents_fts_update trigger.
-- Bun SQLite FTS5 external-content xUpdate raises SQLITE_CORRUPT_VTAB
-- (errno 267) when a single trigger issues both DELETE and INSERT against
-- the same virtual table inside one statement. The application refreshes
-- the FTS row from saveFullContent / saveMarkdownPage instead.

CREATE TABLE IF NOT EXISTS markdown_pages (
  id TEXT PRIMARY KEY,
  content_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  frontmatter TEXT NOT NULL,
  body TEXT NOT NULL,
  html_cache TEXT,
  path TEXT,
  lang TEXT DEFAULT 'ja',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_markdown_pages_slug ON markdown_pages(slug);
CREATE INDEX IF NOT EXISTS idx_markdown_pages_content ON markdown_pages(content_id);

CREATE VIRTUAL TABLE IF NOT EXISTS markdown_pages_fts USING fts5(
  id UNINDEXED,
  slug UNINDEXED,
  body,
  content=markdown_pages,
  content_rowid=rowid
);

CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_insert AFTER INSERT ON markdown_pages BEGIN
  INSERT INTO markdown_pages_fts(rowid, id, slug, body)
  VALUES (new.rowid, new.id, new.slug, new.body);
END;

CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_delete AFTER DELETE ON markdown_pages BEGIN
  DELETE FROM markdown_pages_fts WHERE rowid = old.rowid;
END;

-- NOTE: There is intentionally NO markdown_pages_fts_update trigger. See
-- the equivalent note on contents_fts_update above for rationale.

CREATE TABLE IF NOT EXISTS manual_dates (
  content_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  description TEXT,
  tags TEXT,
  data BLOB,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_content ON media(content_id);
CREATE INDEX IF NOT EXISTS idx_media_mime ON media(mime_type);

-- Pre-emptively drop broken FTS update triggers that older Bun-side schemas
-- may have left behind. Mirrors `dropBrokenFtsUpdateTriggers` in
-- `src/cms/lib/content-db-manager.ts`. Safe no-op on freshly created DBs.
DROP TRIGGER IF EXISTS contents_fts_update;
DROP TRIGGER IF EXISTS markdown_pages_fts_update;
