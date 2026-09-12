-- CMS API Migration 002: Restrict list_index to published entries
--
-- The original `list_index` view (001_init.sql) only filtered
-- `deleted_at IS NULL`. Any caller of `/api/entries` therefore received
-- drafts, archived, private, and unlisted entries. This migration tightens
-- the public read path to `status = 'published' AND visibility IN
-- ('public','unlisted')` and adds a sibling `list_index_admin` view for
-- future admin tooling that legitimately needs the full rowset.
--
-- FTS5 caveat: 001 created `search_index` as a contentless FTS5 table with
-- `content=list_index, content_rowid=rowid`. FTS5 holds an internal
-- reference to the content table by oid — drop-and-recreate of the view
-- leaves that reference dangling and the next rebuild errors with
-- "no such column: T.rowid". The supported pattern for an external-content
-- FTS5 over a view we want to redefine is: drop FTS5, redefine view,
-- recreate FTS5, then rebuild its index. That is what we do here.

DROP TABLE IF EXISTS search_index;

DROP VIEW IF EXISTS list_index;

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
    (SELECT src FROM assets WHERE entry_id = e.id AND "order" = 0 LIMIT 1) AS thumbnail,
    (SELECT GROUP_CONCAT(t.name)
       FROM entry_tags et JOIN tags t ON et.tag_id = t.id
      WHERE et.entry_id = e.id) AS tags
FROM entries e
WHERE e.deleted_at IS NULL
  AND e.status = 'published'
  AND e.visibility IN ('public', 'unlisted');

CREATE VIEW IF NOT EXISTS list_index_admin AS
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
    (SELECT src FROM assets WHERE entry_id = e.id AND "order" = 0 LIMIT 1) AS thumbnail,
    (SELECT GROUP_CONCAT(t.name)
       FROM entry_tags et JOIN tags t ON et.tag_id = t.id
      WHERE et.entry_id = e.id) AS tags
FROM entries e
WHERE e.deleted_at IS NULL;

-- Recreate the FTS5 contentless table against the new list_index. The
-- schema mirrors 001_init.sql exactly — only the content= reference binds
-- to the new view.
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
    id,
    title,
    summary,
    content=list_index,
    content_rowid=rowid
);
