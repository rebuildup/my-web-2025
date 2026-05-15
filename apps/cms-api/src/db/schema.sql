-- CMS API Database Schema
-- Write Model (normalized structure for edit/save/history)
-- Read Model (views and FTS5 virtual tables for fast display)

-- ============================================================
-- WRITE MODEL: Core Tables
-- ============================================================

CREATE TABLE entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'portfolio',
    slug TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'draft' CHECK(visibility IN ('public', 'unlisted', 'private', 'draft')),
    title TEXT NOT NULL DEFAULT '',
    summary TEXT,
    lang TEXT DEFAULT 'ja',
    path TEXT,
    depth INTEGER DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    parent_id TEXT REFERENCES entries(id) ON DELETE SET NULL,
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE entry_revisions (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    body_json TEXT NOT NULL DEFAULT '{}',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE blocks (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    revision_id TEXT REFERENCES entry_revisions(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    block_type TEXT NOT NULL,
    data_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    src TEXT NOT NULL,
    type TEXT,
    width INTEGER,
    height INTEGER,
    alt TEXT,
    meta_json TEXT DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE entry_tags (
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);

CREATE TABLE links (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    href TEXT NOT NULL,
    label TEXT,
    rel TEXT,
    is_primary INTEGER DEFAULT 0,
    description TEXT,
    "order" INTEGER DEFAULT 0
);

CREATE TABLE manual_dates (
    content_id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- READ MODEL: Views
-- ============================================================

CREATE VIEW list_index AS
SELECT
    e.id,
    e.type,
    e.status,
    e.visibility,
    e.title,
    e.summary,
    e.lang,
    e.published_at,
    e.created_at,
    e.updated_at,
    e.slug,
    (SELECT src FROM assets WHERE entry_id = e.id AND "order" = 0 LIMIT 1) as thumbnail,
    (SELECT GROUP_CONCAT(t.name) FROM entry_tags et JOIN tags t ON et.tag_id = t.id WHERE et.entry_id = e.id) as tags
FROM entries e
WHERE e.deleted_at IS NULL;

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE search_index USING fts5(
    id,
    title,
    summary,
    content=list_index,
    content_rowid=rowid
);

-- ============================================================
-- INDEXES: Performance
-- ============================================================

CREATE INDEX idx_entries_status ON entries(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_entries_type ON entries(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_entries_published_at ON entries(published_at DESC) WHERE deleted_at IS NULL AND published_at IS NOT NULL;
CREATE INDEX idx_entries_slug ON entries(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_entry_revisions_entry ON entry_revisions(entry_id);
CREATE INDEX idx_blocks_entry_revision ON blocks(entry_id, revision_id);
CREATE INDEX idx_assets_entry ON assets(entry_id);
CREATE INDEX idx_links_entry ON links(entry_id);
CREATE INDEX idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);