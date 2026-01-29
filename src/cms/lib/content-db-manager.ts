import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { getFullContent, saveFullContent } from "@/cms/lib/content-mapper";
import type { Content } from "@/cms/types/content";
import type { ContentIndexRow } from "@/cms/types/database";

const DATA_DIR = resolveDataDirectory();
const CONTENT_DB_DIR = path.join(DATA_DIR, "contents");

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
	console.log(`[CMS] Current working directory: ${cwd}`);
	console.log(
		`[CMS] CONTENT_DATA_DIR: ${process.env.CONTENT_DATA_DIR || "not set"}`,
	);
	console.log(`[CMS] NODE_ENV: ${process.env.NODE_ENV}`);

	const candidateRoots = [
		envDir,
		path.join(cwd, "data"),
		path.join(cwd, "..", "data"),
		path.join(cwd, "..", "..", "data"),
		path.join(cwd, ".next", "data"),
		path.join(cwd, ".next", "server", "data"),
		path.join(cwd, "standalone", "data"),
		path.join(cwd, ".next", "standalone", "data"),
		path.join(__dirname, "..", "..", "..", "..", "data"),
		"/var/www/yusuke-kim/data",
		path.join(process.cwd(), "data"),
	].filter((dir): dir is string => Boolean(dir));

	console.log(`[CMS] Candidate data directories: ${candidateRoots.join(", ")}`);

	for (const dir of candidateRoots) {
		try {
			if (dir && fs.existsSync(dir)) {
				const stats = fs.statSync(dir);
				console.log(`[CMS] Found valid data directory: ${dir}`);
				console.log(
					`[CMS] Directory stats: isDirectory=${stats.isDirectory()}`,
				);
				// データディレクトリ内のファイル数を確認
				const contentsPath = path.join(dir, "contents");
				if (fs.existsSync(contentsPath)) {
					const files = fs.readdirSync(contentsPath);
					console.log(
						`[CMS] Contents directory found with ${files.length} files`,
					);
				}
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

function listContentDbFiles(): string[] {
	if (!fs.existsSync(CONTENT_DB_DIR)) {
		console.warn(
			`[CMS] Contents DB directory does not exist: ${CONTENT_DB_DIR}`,
		);
		return [];
	}
	const files = fs.readdirSync(CONTENT_DB_DIR);
	console.log(`[CMS] Found ${files.length} files in contents directory`);

	const dbFiles = files.filter((file) => file.endsWith(".db")).sort();

	console.log(`[CMS] Found ${dbFiles.length} DB files: ${dbFiles.join(", ")}`);
	return dbFiles;
}

function extractContentIdFromFileName(file: string): string {
	if (!file.startsWith("content-") || !file.endsWith(".db")) {
		return file.replace(/\.db$/, "");
	}
	return file.slice("content-".length, -".db".length);
}

export function getContentDbPath(contentId: string): string {
	const sanitizedId = contentId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(CONTENT_DB_DIR, `content-${sanitizedId}.db`);
}

export function getDataDirectory(): string {
	return DATA_DIR;
}

export function getContentDb(contentId: string): Database.Database {
	const dbPath = getContentDbPath(contentId);
	const isNewDb = !fs.existsSync(dbPath);

	if (process.env.NODE_ENV !== "production") {
		console.log(`[CMS] Opening database: ${dbPath}, isNewDb: ${isNewDb}`);
	}

	const DatabaseCtor = getBetterSqlite3();
	const db = new DatabaseCtor(dbPath);
	try {
		db.pragma("journal_mode = WAL");
	} catch {
		// ignore pragma failures
	}

	if (isNewDb) {
		initializeContentDbSchema(db);
	} else {
		ensureSchemaUpgrades(db);
	}

	return db;
}

function initializeContentDbSchema(db: Database.Database): void {
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
  `);

	ensureManualDatesTable(db);
	ensureMediaTable(db);
}

function ensureSchemaUpgrades(db: Database.Database): void {
	ensureManualDatesTable(db);
	ensureMediaTable(db);
}

function ensureManualDatesTable(db: Database.Database): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS manual_dates (
      content_id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function ensureMediaTable(db: Database.Database): void {
	db.exec(`
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
  `);
}

function readContentRowsFromFile(file: string): ContentIndexRow[] {
	const dbPath = path.join(CONTENT_DB_DIR, file);
	const DatabaseCtor = getBetterSqlite3();
	const db = new DatabaseCtor(dbPath);
	try {
		ensureSchemaUpgrades(db);
		const rows = db
			.prepare(
				`SELECT id, COALESCE(title, id) AS title, COALESCE(summary, '') AS summary, COALESCE(lang, 'ja') AS lang,
          COALESCE(status, 'draft') AS status, COALESCE(visibility, 'draft') AS visibility,
          created_at, updated_at, published_at, thumbnails, seo
        FROM contents ORDER BY created_at DESC`,
			)
			.all() as Array<{
			id: string;
			title: string;
			summary: string;
			lang: string;
			status: string;
			visibility: string;
			created_at: string;
			updated_at: string;
			published_at?: string | null;
			thumbnails?: string | null;
			seo?: string | null;
		}>;

		return rows.map((row) => {
			const tags = db
				.prepare("SELECT tag FROM content_tags WHERE content_id = ?")
				.all(row.id) as Array<{ tag: string }>;
			return {
				id: row.id,
				db_file: file,
				title: row.title,
				summary: row.summary,
				lang: row.lang,
				status: row.status,
				visibility: row.visibility,
				created_at: row.created_at,
				updated_at: row.updated_at,
				published_at: row.published_at ?? undefined,
				tags:
					tags.length > 0
						? JSON.stringify(tags.map((tag) => tag.tag))
						: undefined,
				thumbnails: row.thumbnails ?? undefined,
				seo: row.seo ?? undefined,
			};
		});
	} catch (error) {
		console.warn(`[CMS] Failed to read index data from ${file}:`, error);
		return [];
	} finally {
		db.close();
	}
}

export function addToIndex(_contentData: {
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
	// Index entries are derived directly from per-content databases, so no-op.
}

export function removeFromIndex(_contentId: string): void {
	// No aggregate index to update.
}

function parseJson<T>(value: string | null | undefined): T | undefined {
	if (!value) return undefined;
	try {
		return JSON.parse(value) as T;
	} catch {
		return undefined;
	}
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
	tags?: string[];
	thumbnails?: Record<string, unknown>;
	seo?: Record<string, unknown>;
}> {
	const rows = listContentDbFiles().flatMap((file) =>
		readContentRowsFromFile(file).map((row) => ({
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
			tags: parseJson<string[]>(row.tags),
			thumbnails: parseJson<Record<string, unknown>>(row.thumbnails),
			seo: parseJson<Record<string, unknown>>(row.seo),
		})),
	);

	return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
	tags?: string[];
	thumbnails?: Record<string, unknown>;
	seo?: Record<string, unknown>;
} | null {
	const dbPath = getContentDbPath(contentId);
	if (!fs.existsSync(dbPath)) {
		return null;
	}
	const DatabaseCtor = getBetterSqlite3();
	const db = new DatabaseCtor(dbPath);
	try {
		ensureSchemaUpgrades(db);
		const row = db
			.prepare(
				`SELECT id, title, COALESCE(summary, '') AS summary, COALESCE(lang, 'ja') AS lang,
          COALESCE(status, 'draft') AS status, COALESCE(visibility, 'draft') AS visibility,
          created_at, updated_at, published_at, thumbnails, seo
        FROM contents WHERE id = ? LIMIT 1`,
			)
			.get(contentId) as
			| {
					id: string;
					title: string;
					summary: string;
					lang: string;
					status: string;
					visibility: string;
					created_at: string;
					updated_at: string;
					published_at?: string | null;
					thumbnails?: string | null;
					seo?: string | null;
			  }
			| undefined;
		if (!row) {
			return null;
		}
		const tags = db
			.prepare("SELECT tag FROM content_tags WHERE content_id = ?")
			.all(row.id) as Array<{ tag: string }>;
		return {
			id: row.id,
			dbFile: path.basename(dbPath),
			title: row.title,
			summary: row.summary,
			lang: row.lang,
			status: row.status,
			visibility: row.visibility,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			publishedAt: row.published_at ?? undefined,
			tags: tags.length > 0 ? tags.map((tag) => tag.tag) : undefined,
			thumbnails: parseJson<Record<string, unknown>>(row.thumbnails),
			seo: parseJson<Record<string, unknown>>(row.seo),
		};
	} catch (error) {
		console.warn(`[CMS] Failed to read index entry for ${contentId}:`, error);
		return null;
	} finally {
		db.close();
	}
}

export function copyContentDb(oldId: string, newId: string): boolean {
	const oldPath = getContentDbPath(oldId);
	const newPath = getContentDbPath(newId);

	if (!fs.existsSync(oldPath)) {
		console.error(`Content database file not found: ${oldPath}`);
		return false;
	}

	if (fs.existsSync(newPath)) {
		console.error(`Content database already exists for new ID: ${newId}`);
		return false;
	}

	try {
		const oldDb = getContentDb(oldId);
		let oldContent: Content | null = null;
		try {
			oldContent = getFullContent(oldDb, oldId);
			if (!oldContent) {
				return false;
			}
		} finally {
			oldDb.close();
		}

		const newContent: Partial<Content> = {
			...oldContent,
			id: newId,
			updatedAt: new Date().toISOString(),
		};

		const newDb = getContentDb(newId);
		try {
			saveFullContent(newDb, newContent);
		} finally {
			newDb.close();
		}

		try {
			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}
			const wal = `${oldPath}-wal`;
			if (fs.existsSync(wal)) {
				fs.unlinkSync(wal);
			}
			const shm = `${oldPath}-shm`;
			if (fs.existsSync(shm)) {
				fs.unlinkSync(shm);
			}
		} catch (error) {
			console.warn(
				`[CMS] Failed to delete old database files for ${oldId}:`,
				error,
			);
		}

		return true;
	} catch (error) {
		console.error("Failed to copy content database:", error);
		return false;
	}
}

export function deleteContentDb(contentId: string): boolean {
	const dbPath = getContentDbPath(contentId);

	if (!fs.existsSync(dbPath)) {
		return false;
	}

	try {
		fs.unlinkSync(dbPath);

		const walPath = `${dbPath}-wal`;
		if (fs.existsSync(walPath)) {
			fs.unlinkSync(walPath);
		}

		const shmPath = `${dbPath}-shm`;
		if (fs.existsSync(shmPath)) {
			fs.unlinkSync(shmPath);
		}

		return true;
	} catch (error) {
		console.error("Failed to delete content database:", error);
		return false;
	}
}

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
	const summaries = getAllFromIndex();
	let totalSize = 0;
	const contentsList = summaries.map((summary) => {
		const dbPath = path.join(CONTENT_DB_DIR, summary.dbFile);
		let size = 0;
		if (fs.existsSync(dbPath)) {
			const stats = fs.statSync(dbPath);
			size = stats.size;
			totalSize += size;
		}
		return {
			id: summary.id,
			title: summary.title,
			dbFile: summary.dbFile,
			size,
		};
	});

	return {
		totalContents: summaries.length,
		totalDbFiles: contentsList.length,
		totalSize,
		contentsList,
	};
}

/**
 * タグを全てのコンテンツdbファイルから集約して取得
 * tag-catalog.jsonは使用せず、各dbファイルのcontent_tagsテーブルから直接取得
 */
function aggregateTagsFromAllDbs(): Map<
	string,
	{ count: number; firstUsed: string | null; lastUsed: string | null }
> {
	const tagMap = new Map<
		string,
		{ count: number; firstUsed: string | null; lastUsed: string | null }
	>();
	const DatabaseCtor = getBetterSqlite3();

	for (const file of listContentDbFiles()) {
		const dbPath = path.join(CONTENT_DB_DIR, file);
		let db: Database.Database | null = null;
		try {
			db = new DatabaseCtor(dbPath);
			ensureSchemaUpgrades(db);

			// コンテンツのタイムスタンプとタグを取得
			const rows = db
				.prepare(`
				SELECT ct.tag, c.created_at, c.updated_at
				FROM content_tags ct
				LEFT JOIN contents c ON ct.content_id = c.id
			`)
				.all() as Array<{
				tag: string;
				created_at: string | null;
				updated_at: string | null;
			}>;

			for (const row of rows) {
				const tag = row.tag.trim().toLowerCase();
				if (!tag) continue;

				const timestamp =
					row.updated_at || row.created_at || new Date().toISOString();
				const current = tagMap.get(tag) ?? {
					count: 0,
					firstUsed: timestamp,
					lastUsed: timestamp,
				};

				current.count += 1;

				if (
					!current.firstUsed ||
					(row.created_at &&
						new Date(row.created_at) < new Date(current.firstUsed))
				) {
					current.firstUsed = row.created_at || timestamp;
				}
				if (
					!current.lastUsed ||
					(timestamp && new Date(timestamp) > new Date(current.lastUsed))
				) {
					current.lastUsed = timestamp;
				}

				tagMap.set(tag, current);
			}
		} catch (error) {
			console.warn(`[CMS] Failed to read tags from ${file}:`, error);
		} finally {
			db?.close();
		}
	}

	return tagMap;
}

export interface TagCatalogEntry {
	name: string;
	created_at: string;
	last_used: string | null;
	metadata: string | null;
}

/**
 * 全てのタグをリスト - 各dbファイルから直接集約
 */
export function listTagCatalogEntries(): TagCatalogEntry[] {
	const tagMap = aggregateTagsFromAllDbs();
	const now = new Date().toISOString();

	return Array.from(tagMap.entries()).map(([name, data]) => ({
		name,
		created_at: data.firstUsed || now,
		last_used: data.lastUsed,
		metadata: null,
	}));
}

/**
 * タグ使用情報の更新 - 実際にはコンテンツにタグを追加/削除することで自動的に更新される
 * この関数は互換性のために残すが、no-op
 */
export function upsertTagCatalogEntry(_entry: {
	name: string;
	createdAt?: string;
	lastUsed?: string | null;
	metadata?: unknown;
}): void {
	// タグはコンテンツにタグを追加することで自動的に登録されるため、
	// この関数は何もしない（互換性のために残す）
}

/**
 * タグの削除 - 実際にはコンテンツからタグを削除することで自動的に削除される
 * この関数は互換性のために残すが、タグが使用中の場合はfalseを返す
 */
export function removeTagCatalogEntry(name: string): boolean {
	const normalized = name.trim().toLowerCase();
	if (!normalized) {
		return false;
	}

	// タグが使用されているかチェック
	const tagMap = aggregateTagsFromAllDbs();
	const usage = tagMap.get(normalized);

	if (usage && usage.count > 0) {
		// タグがまだ使用されている場合は削除できない
		return false;
	}

	// タグが使用されていない場合は「削除成功」として扱う
	// （実際には何も保存されていないので、単に存在しないことを確認するだけ）
	return true;
}

export interface ManualDateEntry {
	content_id: string;
	date: string;
	updated_at: string;
}

function readManualDateFromDb(
	db: Database.Database,
	fallbackId: string,
): ManualDateEntry | null {
	const row = db
		.prepare(
			"SELECT content_id, date, updated_at FROM manual_dates ORDER BY updated_at DESC LIMIT 1",
		)
		.get() as
		| { content_id?: string | null; date: string; updated_at: string }
		| undefined;
	if (!row) {
		return null;
	}
	return {
		content_id: row.content_id || fallbackId,
		date: row.date,
		updated_at: row.updated_at,
	};
}

function getPrimaryContentId(db: Database.Database): string | null {
	const row = db
		.prepare("SELECT id FROM contents ORDER BY created_at ASC LIMIT 1")
		.get() as { id: string } | undefined;
	return row?.id ?? null;
}

export function listManualDateEntries(): ManualDateEntry[] {
	const entries: ManualDateEntry[] = [];
	for (const file of listContentDbFiles()) {
		const dbPath = path.join(CONTENT_DB_DIR, file);
		const DatabaseCtor = getBetterSqlite3();
		const db = new DatabaseCtor(dbPath);
		try {
			ensureSchemaUpgrades(db);
			const fallbackId =
				getPrimaryContentId(db) ?? extractContentIdFromFileName(file);
			if (!fallbackId) {
				continue;
			}
			const entry = readManualDateFromDb(db, fallbackId);
			if (entry) {
				entries.push(entry);
			}
		} catch (error) {
			console.warn(`[CMS] Failed to read manual date from ${file}:`, error);
		} finally {
			db.close();
		}
	}
	return entries;
}

export function getManualDateEntry(contentId: string): ManualDateEntry | null {
	const db = getContentDb(contentId);
	try {
		return readManualDateFromDb(db, contentId);
	} finally {
		db.close();
	}
}

export function upsertManualDateEntry(contentId: string, date: string): void {
	const db = getContentDb(contentId);
	try {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO manual_dates (content_id, date, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(content_id) DO UPDATE SET date = excluded.date, updated_at = excluded.updated_at`,
		).run(contentId, date, now);
	} finally {
		db.close();
	}
}

export function removeManualDateEntry(contentId: string): boolean {
	const db = getContentDb(contentId);
	try {
		const result = db
			.prepare("DELETE FROM manual_dates WHERE content_id = ?")
			.run(contentId);
		return result.changes > 0;
	} finally {
		db.close();
	}
}

/**
 * Get tags for a content item from database
 */
export function getContentTags(contentId: string): string[] {
	try {
		const db = getContentDb(contentId);
		try {
			const rows = db
				.prepare("SELECT tag FROM content_tags WHERE content_id = ?")
				.all(contentId) as Array<{ tag: string }>;
			return rows.map((r) => r.tag);
		} finally {
			db.close();
		}
	} catch {
		return [];
	}
}
