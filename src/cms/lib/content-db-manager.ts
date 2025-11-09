/**
 * コンテンツごとの個別データベース管理
 */

import fs from "node:fs";
import path from "node:path";
// Lazy-load better-sqlite3 only in Node.js runtime to avoid binding errors in other environments
import type Database from "better-sqlite3";
import { getFullContent, saveFullContent } from "@/cms/lib/content-mapper";
import type { Content } from "@/cms/types/content";
import type { ContentIndexRow } from "@/cms/types/database";

const DATA_DIR = resolveDataDirectory();
const CONTENT_DB_DIR = path.join(DATA_DIR, "contents");
const INDEX_DB_PATH = path.join(DATA_DIR, "index.db");

ensureDirectory(DATA_DIR);
ensureDirectory(CONTENT_DB_DIR);

function resolveDataDirectory(): string {
	const envDir =
		process.env.CONTENT_DATA_DIR ||
		process.env.NEXT_CONTENT_DATA_DIR ||
		process.env.PORTFOLIO_DATA_DIR ||
		process.env.NEXT_PUBLIC_CONTENT_DATA_DIR ||
		"";

	const cwd = process.cwd();
	const candidateRoots = [
		envDir,
		path.join(cwd, "data"),
		path.join(cwd, "..", "data"),
		path.join(cwd, "..", "..", "data"),
		path.join(cwd, ".next", "data"),
		path.join(cwd, "standalone", "data"),
		path.join(cwd, ".next", "standalone", "data"),
		path.join(__dirname, "..", "..", "..", "..", "data"),
		// デプロイ環境用のパス
		"/var/www/yusuke-kim/data",
		path.join(process.cwd(), "data"),
	].filter((dir): dir is string => Boolean(dir));

	for (const dir of candidateRoots) {
		try {
			if (fs.existsSync(dir)) {
				console.log(`[CMS] Using data directory: ${dir}`);
				return dir;
			}
		} catch (error) {
			console.warn(
				`[CMS] Failed to access data directory candidate ${dir}:`,
				error,
			);
		}
	}

	const fallback = path.join(cwd, "data");
	console.warn(
		`[CMS] Content data directory not found. Falling back to ${fallback} (directory will be created if missing).`,
	);
	console.warn(`[CMS] Checked directories: ${candidateRoots.join(", ")}`);
	return fallback;
}

function ensureDirectory(dir: string): void {
	try {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	} catch (error) {
		console.warn(`[CMS] Failed to ensure directory ${dir}:`, error);
	}
}

function getBetterSqlite3(): typeof import("better-sqlite3") {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const mod = require("better-sqlite3") as typeof import("better-sqlite3");
	return mod;
}

// ========== インデックスデータベース（コンテンツの一覧管理） ==========

export function getIndexDb(): Database.Database {
	const DatabaseCtor = getBetterSqlite3();
	// 念のため親ディレクトリを準備
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	let db: Database.Database;
	try {
		db = new DatabaseCtor(INDEX_DB_PATH);
	} catch {
		// ファイルDBが開けない環境ではメモリDBにフォールバック（読み取り系APIを継続）
		db = new DatabaseCtor(":memory:");
	}
	try {
		db.pragma("journal_mode = WAL");
	} catch {
		// 一部環境で失敗しても致命的ではないため無視
	}

	// インデックステーブル作成
	db.exec(`
    CREATE TABLE IF NOT EXISTS content_index (
      id TEXT PRIMARY KEY,
      db_file TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      lang TEXT DEFAULT 'ja',
      status TEXT DEFAULT 'draft',
      visibility TEXT DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      tags TEXT, -- JSON array
      thumbnails TEXT, -- JSON
      seo TEXT -- JSON
    );
    
    CREATE INDEX IF NOT EXISTS idx_content_index_status ON content_index(status);
    CREATE INDEX IF NOT EXISTS idx_content_index_created ON content_index(created_at);

    CREATE TABLE IF NOT EXISTS tag_catalog (
      name TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      last_used TEXT,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS manual_dates (
      content_id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

	return db;
}

// ========== コンテンツデータベースのファイル名生成 ==========

export function getContentDbPath(contentId: string): string {
	const sanitizedId = contentId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(CONTENT_DB_DIR, `content-${sanitizedId}.db`);
}

// ========== コンテンツデータベースの作成・取得 ==========

export function getContentDb(contentId: string): Database.Database {
	const dbPath = getContentDbPath(contentId);
	const isNewDb = !fs.existsSync(dbPath);

	const DatabaseCtor = getBetterSqlite3();
	const db = new DatabaseCtor(dbPath);
	try {
		db.pragma("journal_mode = WAL");
	} catch {
		// ignore pragma failure
	}

	// 新規データベースの場合はスキーマを作成
	if (isNewDb) {
		initializeContentDbSchema(db);
	}

	return db;
}

// ========== コンテンツデータベースのスキーマ初期化 ==========

function initializeContentDbSchema(db: Database.Database): void {
	// メインテーブル: contents
	db.exec(`
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
    
    CREATE TRIGGER IF NOT EXISTS contents_fts_update AFTER UPDATE ON contents BEGIN
      DELETE FROM contents_fts WHERE rowid = old.rowid;
      INSERT INTO contents_fts(rowid, id, title, summary, search_full_text)
      VALUES (new.rowid, new.id, new.title, new.summary, new.search_full_text);
    END;
    
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
    
    CREATE TRIGGER IF NOT EXISTS markdown_pages_fts_update AFTER UPDATE ON markdown_pages BEGIN
      DELETE FROM markdown_pages_fts WHERE rowid = old.rowid;
      INSERT INTO markdown_pages_fts(rowid, id, slug, body)
      VALUES (new.rowid, new.id, new.slug, new.body);
    END;
    
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      content_id TEXT,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      description TEXT,
      tags TEXT,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_media_content ON media(content_id);
    CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
  `);
}

// ========== インデックスデータベース操作 ==========

export function addToIndex(contentData: {
	id: string;
	title: string;
	summary?: string;
	lang?: string;
	status?: string;
	visibility?: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	tags?: string[];
	thumbnails?: Record<string, unknown>;
	seo?: Record<string, unknown>;
}): void {
	const indexDb = getIndexDb();
	const dbFile = path.basename(getContentDbPath(contentData.id));

	const stmt = indexDb.prepare(`
    INSERT OR REPLACE INTO content_index 
    (id, db_file, title, summary, lang, status, visibility, created_at, updated_at, published_at, tags, thumbnails, seo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

	stmt.run(
		contentData.id,
		dbFile,
		contentData.title,
		contentData.summary || null,
		contentData.lang || "ja",
		contentData.status || "draft",
		contentData.visibility || "draft",
		contentData.createdAt,
		contentData.updatedAt,
		contentData.publishedAt || null,
		contentData.tags ? JSON.stringify(contentData.tags) : null,
		contentData.thumbnails ? JSON.stringify(contentData.thumbnails) : null,
		contentData.seo ? JSON.stringify(contentData.seo) : null,
	);

	indexDb.close();
}

export function removeFromIndex(contentId: string): void {
	const indexDb = getIndexDb();
	indexDb.prepare("DELETE FROM content_index WHERE id = ?").run(contentId);
	indexDb.close();
}

export function getAllFromIndex(): Array<{
	id: string;
	dbFile: string;
	title: string;
	summary: string;
	lang: string;
	status: string;
	visibility: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	tags?: string;
	thumbnails?: string;
	seo?: string;
}> {
	const indexDb = getIndexDb();
	const rows = indexDb
		.prepare("SELECT * FROM content_index ORDER BY created_at DESC")
		.all() as ContentIndexRow[];
	indexDb.close();

	return rows.map((row: ContentIndexRow) => ({
		id: row.id,
		dbFile: row.db_file,
		title: row.title,
		summary: row.summary,
		lang: row.lang,
		status: row.status,
		visibility: row.visibility,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		publishedAt: row.published_at,
		tags: row.tags ? JSON.parse(row.tags) : undefined,
		thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
		seo: row.seo ? JSON.parse(row.seo) : undefined,
	}));
}

export function getFromIndex(contentId: string): {
	id: string;
	dbFile: string;
	title: string;
	summary: string;
	lang: string;
	status: string;
	visibility: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	tags?: string;
	thumbnails?: string;
	seo?: string;
} | null {
	const indexDb = getIndexDb();
	const row = indexDb
		.prepare("SELECT * FROM content_index WHERE id = ?")
		.get(contentId) as ContentIndexRow | undefined;
	indexDb.close();

	if (!row) return null;

	return {
		id: row.id,
		dbFile: row.db_file,
		title: row.title,
		summary: row.summary,
		lang: row.lang,
		status: row.status,
		visibility: row.visibility,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		publishedAt: row.published_at,
		tags: row.tags ? JSON.parse(row.tags) : undefined,
		thumbnails: row.thumbnails ? JSON.parse(row.thumbnails) : undefined,
		seo: row.seo ? JSON.parse(row.seo) : undefined,
	};
}

// ========== コンテンツデータベースコピー（新規作成してデータ移行） ==========

export function copyContentDb(oldId: string, newId: string): boolean {
	const oldPath = getContentDbPath(oldId);
	const newPath = getContentDbPath(newId);

	if (!fs.existsSync(oldPath)) {
		console.error(`Content database file not found: ${oldPath}`);
		return false;
	}

	// 新しいIDのDBファイルが既に存在する場合はエラー
	if (fs.existsSync(newPath)) {
		console.error(`Content database already exists for new ID: ${newId}`);
		return false;
	}

	try {
		// 古いDBから完全なコンテンツデータを取得
		const oldDb = getContentDb(oldId);
		let oldContent: Content | null = null;
		try {
			oldContent = getFullContent(oldDb, oldId);
			if (!oldContent) {
				console.error(`Content not found in old database: ${oldId}`);
				return false;
			}
		} finally {
			oldDb.close();
		}

		// 新しいIDでコンテンツデータを作成（IDを更新）
		const newContent: Partial<Content> = {
			...oldContent,
			id: newId, // 新しいIDに更新
			updatedAt: new Date().toISOString(),
		};

		// 新しいDBを作成してデータを保存
		const newDb = getContentDb(newId);
		try {
			saveFullContent(newDb, newContent);
		} finally {
			newDb.close();
		}

		// インデックスから古いIDを削除（新しいIDは後で追加される）
		removeFromIndex(oldId);

		// 古いDBファイルを削除（成功後に）
		try {
			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}
			const oldWalPath = `${oldPath}-wal`;
			if (fs.existsSync(oldWalPath)) {
				fs.unlinkSync(oldWalPath);
			}
			const oldShmPath = `${oldPath}-shm`;
			if (fs.existsSync(oldShmPath)) {
				fs.unlinkSync(oldShmPath);
			}
		} catch (error) {
			// 古いファイルの削除に失敗しても続行（後で削除できる）
			console.warn(`Failed to delete old database file: ${error}`);
		}

		return true;
	} catch (error) {
		console.error("Failed to copy content database:", error);
		console.error(`Old ID: ${oldId}, New ID: ${newId}`);
		console.error(`Old path: ${oldPath}, New path: ${newPath}`);
		return false;
	}
}

// ========== コンテンツデータベース削除 ==========

export function deleteContentDb(contentId: string): boolean {
	const dbPath = getContentDbPath(contentId);

	if (!fs.existsSync(dbPath)) {
		return false;
	}

	try {
		// データベースファイルとWALファイルを削除
		fs.unlinkSync(dbPath);

		const walPath = `${dbPath}-wal`;
		if (fs.existsSync(walPath)) {
			fs.unlinkSync(walPath);
		}

		const shmPath = `${dbPath}-shm`;
		if (fs.existsSync(shmPath)) {
			fs.unlinkSync(shmPath);
		}

		// インデックスから削除
		removeFromIndex(contentId);

		return true;
	} catch (error) {
		console.error("Failed to delete content database:", error);
		return false;
	}
}

// ========== 統計情報 ==========

export function getContentDbStats(): {
	totalContents: number;
	totalDbFiles: number;
	totalSize: number;
	contentsList: Array<{
		id: string;
		title: string;
		dbFile: string;
		size: number;
	}>;
} {
	const indexDb = getIndexDb();
	const allContents = indexDb
		.prepare("SELECT id, title, db_file FROM content_index")
		.all() as ContentIndexRow[];
	indexDb.close();

	let totalSize = 0;
	const contentsList = allContents.map((row: ContentIndexRow) => {
		const dbPath = path.join(CONTENT_DB_DIR, row.db_file);
		let size = 0;

		if (fs.existsSync(dbPath)) {
			const stats = fs.statSync(dbPath);
			size = stats.size;
			totalSize += size;
		}

		return {
			id: row.id,
			title: row.title,
			dbFile: row.db_file,
			size,
		};
	});

	return {
		totalContents: allContents.length,
		totalDbFiles: contentsList.length,
		totalSize,
		contentsList,
	};
}

// ========== タグカタログ操作 ==========

export interface TagCatalogEntry {
	name: string;
	created_at: string;
	last_used: string | null;
	metadata: string | null;
}

export function listTagCatalogEntries(): TagCatalogEntry[] {
	const db = getIndexDb();
	try {
		return db
			.prepare(
				"SELECT name, created_at, last_used, metadata FROM tag_catalog ORDER BY name ASC",
			)
			.all() as TagCatalogEntry[];
	} finally {
		db.close();
	}
}

export function upsertTagCatalogEntry(entry: {
	name: string;
	createdAt?: string;
	lastUsed?: string | null;
	metadata?: unknown;
}): void {
	const db = getIndexDb();
	try {
		const stmt = db.prepare(`
      INSERT INTO tag_catalog (name, created_at, last_used, metadata)
      VALUES (@name, COALESCE(@created_at, CURRENT_TIMESTAMP), @last_used, @metadata)
      ON CONFLICT(name) DO UPDATE SET
        last_used = COALESCE(excluded.last_used, tag_catalog.last_used),
        metadata = COALESCE(excluded.metadata, tag_catalog.metadata)
    `);
		stmt.run({
			name: entry.name,
			created_at: entry.createdAt ?? null,
			last_used: entry.lastUsed ?? null,
			metadata:
				entry.metadata !== undefined ? JSON.stringify(entry.metadata) : null,
		});
	} finally {
		db.close();
	}
}

export function removeTagCatalogEntry(name: string): boolean {
	const db = getIndexDb();
	try {
		const result = db
			.prepare("DELETE FROM tag_catalog WHERE name = ?")
			.run(name);
		return result.changes > 0;
	} finally {
		db.close();
	}
}

// ========== 手動日付管理 ==========

export interface ManualDateEntry {
	content_id: string;
	date: string;
	updated_at: string;
}

export function listManualDateEntries(): ManualDateEntry[] {
	const db = getIndexDb();
	try {
		return db
			.prepare(
				"SELECT content_id, date, updated_at FROM manual_dates ORDER BY updated_at DESC",
			)
			.all() as ManualDateEntry[];
	} finally {
		db.close();
	}
}

export function getManualDateEntry(contentId: string): ManualDateEntry | null {
	const db = getIndexDb();
	try {
		const row = db
			.prepare(
				"SELECT content_id, date, updated_at FROM manual_dates WHERE content_id = ?",
			)
			.get(contentId) as ManualDateEntry | undefined;
		return row ?? null;
	} finally {
		db.close();
	}
}

export function upsertManualDateEntry(contentId: string, date: string): void {
	const db = getIndexDb();
	try {
		const stmt = db.prepare(`
      INSERT INTO manual_dates (content_id, date, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(content_id) DO UPDATE SET
        date = excluded.date,
        updated_at = excluded.updated_at
    `);
		const now = new Date().toISOString();
		stmt.run(contentId, date, now);
	} finally {
		db.close();
	}
}

export function removeManualDateEntry(contentId: string): boolean {
	const db = getIndexDb();
	try {
		const result = db
			.prepare("DELETE FROM manual_dates WHERE content_id = ?")
			.run(contentId);
		return result.changes > 0;
	} finally {
		db.close();
	}
}
