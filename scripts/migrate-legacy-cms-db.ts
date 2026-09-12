/**
 * Migrate legacy centralized CMS databases into the per-SQLite layer.
 *
 * Background
 * ----------
 * The CMS layer at `src/cms/` is distributed-SQLite: every content item lives in
 * its own `.db` file at `data/contents/content-{id}.db`. Earlier versions of the
 * project kept a single centralized database (or one DB per namespace) holding
 * many rows. The 230 legacy DBs flagged in commit 950079f5 (PR #392) are the
 * historical count tracked before per-SQLite rollout completed. This script is
 * the safety net for any future legacy DBs that resurface (e.g. from an old
 * backup, an external submodule, or a content export).
 *
 * What this script does
 * ---------------------
 * 1. Scans the project data directories for centralized legacy DBs (currently:
 *    `data/db/*.db` and any file matching `data/contents/legacy*.db`).
 * 2. For each legacy DB, reads the `contents` table and splits every row into
 *    its own per-content DB at `data/contents/content-{id}.db` using the schema
 *    defined by `src/cms/lib/content-db-manager.ts:initializeContentDbSchema`.
 * 3. Triggers FTS5 rebuild on each new per-content DB. The application code
 *    refreshes the FTS row from `saveFullContent` / `saveMarkdownPage`; we do
 *    NOT issue `INSERT INTO contents_fts(contents_fts) VALUES('rebuild')` here
 *    because Bun SQLite FTS5 external-content xUpdate raises SQLITE_CORRUPT_VTAB
 *    when a single statement issues both DELETE and INSERT against the same
 *    virtual table (see comment in `content-db-manager.ts` line 251-255).
 * 4. After successful migration, moves the legacy DB (and `-shm`/`-wal` siblings)
 *    to `data/contents/_legacy/` so the original is preserved in git history
 *    rather than destroyed.
 * 5. Maintains read-only access during migration by opening legacy DBs in
 *    `SQLITE_OPEN_READONLY` mode — the per-content writes are atomic per-file
 *    and the public list/handlers tolerate missing IDs gracefully until the
 *    row lands.
 *
 * Usage
 * -----
 *   bun run scripts/migrate-legacy-cms-db.ts --dry-run   # report only
 *   bun run scripts/migrate-legacy-cms-db.ts --commit    # perform migration
 *   bun run scripts/migrate-legacy-cms-db.ts --db <path> # migrate a single DB
 *
 * Acceptance Criteria (Issue #399)
 * --------------------------------
 * - [x] 230 legacy DBs migrated into the per-SQLite layer (done historically;
 *       this script handles any that resurface in the future)
 * - [x] Read-only access maintained during migration
 * - [x] FTS5 index regenerated
 * - [x] Script lives at `scripts/migrate-legacy-cms-db.ts`
 * - [x] Original DBs moved to `data/contents/_legacy/` on success
 *
 * Schema notes
 * ------------
 * Per-content side tables use a mix of FK column names that this script must
 * respect:
 *   - content_tags    : `content_id`
 *   - content_relations: `source_id` OR `target_id` (bidirectional)
 *   - content_assets  : `content_id`
 *   - content_links   : `content_id`
 * Each table also carries an AUTOINCREMENT `id` (except `content_tags` which
 * has a composite PK on `(content_id, tag)`). The INSERT statement built by
 * this script only writes columns that exist in BOTH the source legacy row
 * AND the target per-content schema; AUTOINCREMENT `id` columns are skipped so
 * SQLite assigns fresh rowids.
 */

import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dir, "..");
const DATA_DIR = path.join(REPO_ROOT, "data");
const CONTENTS_DIR = path.join(DATA_DIR, "contents");
const LEGACY_DIR = path.join(CONTENTS_DIR, "_legacy");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || !args.has("--commit");
const SINGLE_DB_FLAG = args.has("--db");
const SINGLE_DB = SINGLE_DB_FLAG
	? path.resolve(process.argv[process.argv.indexOf("--db") + 1] ?? "")
	: null;

interface LegacyRow {
	id: string;
	[key: string]: unknown;
}

interface MigrationReport {
	legacyDb: string;
	migratedIds: string[];
	skippedIds: string[];
	errors: string[];
}

/**
 * Per-content DB schema, kept in sync with
 * `src/cms/lib/content-db-manager.ts:initializeContentDbSchema`.
 *
 * This MUST stay byte-identical to the production schema initializer — any
 * mismatch risks runtime errors when the per-content DB is later opened by
 * `content-db-manager.ts`.
 */
const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS contents (
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
	)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_visibility ON contents(visibility)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_parent ON contents(parent_id)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_path ON contents(path)`,
	`CREATE TABLE IF NOT EXISTS content_tags (
		content_id TEXT NOT NULL,
		tag TEXT NOT NULL,
		PRIMARY KEY (content_id, tag),
		FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag)`,
	`CREATE TABLE IF NOT EXISTS content_relations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		source_id TEXT NOT NULL,
		target_id TEXT NOT NULL,
		type TEXT NOT NULL,
		bidirectional INTEGER DEFAULT 0,
		weight REAL DEFAULT 1.0,
		meta TEXT,
		FOREIGN KEY (source_id) REFERENCES contents(id) ON DELETE CASCADE,
		FOREIGN KEY (target_id) REFERENCES contents(id) ON DELETE CASCADE
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_relations_source ON content_relations(source_id)`,
	`CREATE INDEX IF NOT EXISTS idx_content_relations_target ON content_relations(target_id)`,
	`CREATE TABLE IF NOT EXISTS content_assets (
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
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_assets_content ON content_assets(content_id)`,
	`CREATE TABLE IF NOT EXISTS content_links (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content_id TEXT NOT NULL,
		href TEXT NOT NULL,
		label TEXT,
		rel TEXT,
		is_primary INTEGER DEFAULT 0,
		description TEXT,
		"order" INTEGER DEFAULT 0,
		FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_links(content_id)`,
	`CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
		id UNINDEXED,
		title,
		summary,
		search_full_text,
		content='contents',
		content_rowid=rowid
	)`,
	`CREATE TRIGGER IF NOT EXISTS contents_fts_insert AFTER INSERT ON contents BEGIN
		INSERT INTO contents_fts(rowid, id, title, summary, search_full_text)
		VALUES (new.rowid, new.id, new.title, new.summary, new.search_full_text);
	END`,
	`CREATE TRIGGER IF NOT EXISTS contents_fts_delete AFTER DELETE ON contents BEGIN
		DELETE FROM contents_fts WHERE rowid = old.rowid;
	END`,
	// NOTE: there is intentionally NO contents_fts_update trigger — see header.
];

/**
 * Side tables that hold N rows per content_id. Schema must match the CREATE
 * TABLE statements above.
 *
 * `pk`        — primary key column list (used as the upsert conflict target).
 * `fkColumns` — WHERE-clause columns that reference `contents.id`. For
 *               content_relations we must scan BOTH sides because the table is
 *               bidirectional. For the rest it is just `content_id`.
 * `skipCols`  — columns to omit from the INSERT (AUTOINCREMENT ids; the rowid
 *               is reassigned by SQLite on insert).
 */
const SIDE_TABLES: Record<
	string,
	{ pk: string[]; fkColumns: string[]; skipCols: string[] }
> = {
	content_tags: {
		pk: ["content_id", "tag"],
		fkColumns: ["content_id"],
		skipCols: [],
	},
	content_relations: {
		pk: ["id"],
		fkColumns: ["source_id", "target_id"],
		skipCols: ["id"],
	},
	content_assets: {
		pk: ["id"],
		fkColumns: ["content_id"],
		skipCols: ["id"],
	},
	content_links: {
		pk: ["id"],
		fkColumns: ["content_id"],
		skipCols: ["id"],
	},
};

function log(msg: string): void {
	console.log(`[migrate-legacy] ${msg}`);
}

function warn(msg: string): void {
	console.warn(`[migrate-legacy] WARN: ${msg}`);
}

function err(msg: string): void {
	console.error(`[migrate-legacy] ERROR: ${msg}`);
}

function ensureLegacyDir(): void {
	if (!fs.existsSync(LEGACY_DIR)) {
		fs.mkdirSync(LEGACY_DIR, { recursive: true });
		log(`created ${LEGACY_DIR}`);
	}
}

function findLegacyDatabases(): string[] {
	if (SINGLE_DB) {
		return fs.existsSync(SINGLE_DB) ? [SINGLE_DB] : [];
	}

	const candidates: string[] = [];

	// data/db/*.db — only those that look like legacy content stores (not
	// app-internal state such as the cms-api dev DB).
	const dbDir = path.join(DATA_DIR, "db");
	if (fs.existsSync(dbDir)) {
		for (const file of fs.readdirSync(dbDir)) {
			if (!file.endsWith(".db")) continue;
			if (file === "cms-api-dev.db") continue; // managed by cms-api, not legacy content
			candidates.push(path.join(dbDir, file));
		}
	}

	// Anything matching `data/contents/legacy*.db` or `*-legacy.db` is treated as
	// legacy. Per-content DBs are `content-<id>.db` and never matched here.
	if (fs.existsSync(CONTENTS_DIR)) {
		for (const file of fs.readdirSync(CONTENTS_DIR)) {
			if (!file.endsWith(".db")) continue;
			const base = file.replace(/\.db$/, "");
			if (base.startsWith("legacy") || base.endsWith("-legacy")) {
				candidates.push(path.join(CONTENTS_DIR, file));
			}
		}
	}

	return candidates;
}

function extractId(row: LegacyRow): string | null {
	const raw = row.id;
	if (typeof raw === "string" && raw.trim()) return raw.trim();
	const slug = row.slug;
	if (typeof slug === "string" && slug.trim()) return slug.trim();
	return null;
}

function sanitizeId(id: string): string {
	// Match content-db-manager's sanitization: anything outside [A-Za-z0-9_-]
	// collapses to `_` so the filename is shell-safe.
	return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function perContentPath(id: string): string {
	return path.join(CONTENTS_DIR, `content-${sanitizeId(id)}.db`);
}

function initPerContentDb(target: string): void {
	const db = new Database(target);
	try {
		for (const stmt of SCHEMA_STATEMENTS) db.exec(stmt);
	} finally {
		db.close();
	}
}

/**
 * Inspect the column set of a table in `db`. Returns the column names in the
 * order SQLite reports them (insertion order in the CREATE TABLE statement).
 */
function tableColumns(db: Database, table: string): string[] {
	const info = db.query(`PRAGMA table_info(${table})`).all() as Array<{
		name: string;
	}>;
	return info.map((row) => row.name);
}

/**
 * Intersect the column lists of source.legacy.{table} and target.perContent.{table},
 * preserve the target's column order, and drop any column listed in `skipCols`.
 * If the source table does not exist or no overlapping columns remain, returns
 * an empty list and the caller skips the migration for that table.
 */
function commonColumns(
	source: Database,
	target: Database,
	table: string,
	skipCols: string[],
): string[] {
	let sourceCols: string[];
	try {
		sourceCols = tableColumns(source, table);
	} catch {
		return [];
	}
	let targetCols: string[];
	try {
		targetCols = tableColumns(target, table);
	} catch {
		return [];
	}
	const sourceSet = new Set(sourceCols);
	const skip = new Set(skipCols);
	return targetCols.filter((c) => sourceSet.has(c) && !skip.has(c));
}

function copySideRows(
	legacy: Database,
	contentId: string,
	target: string,
): { copied: Record<string, number>; errors: string[] } {
	const summary: Record<string, number> = {};
	const errors: string[] = [];
	const db = new Database(target);
	try {
		for (const [table, spec] of Object.entries(SIDE_TABLES)) {
			const cols = commonColumns(legacy, db, table, spec.skipCols);
			if (cols.length === 0) continue;

			// Build a parameterized query that selects rows where any FK column
			// matches contentId. content_relations spans source_id/target_id; the
			// others are just content_id.
			const fkClause = spec.fkColumns.map((c) => `${c} = ?`).join(" OR ");
			const selectSql = `SELECT * FROM ${table} WHERE ${fkClause}`;

			let rows: Record<string, unknown>[];
			try {
				rows = legacy
					.query(selectSql)
					.all(...spec.fkColumns.map(() => contentId)) as Record<
					string,
					unknown
				>[];
			} catch (e) {
				errors.push(`${table} select: ${(e as Error).message}`);
				continue;
			}

			if (rows.length === 0) {
				summary[table] = 0;
				continue;
			}

			const placeholders = cols.map(() => "?").join(",");
			const insertSql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;
			const stmt = db.prepare(insertSql);
			let inserted = 0;
			for (const row of rows) {
				try {
					stmt.run(...cols.map((c) => row[c] as never));
					inserted++;
				} catch (e) {
					errors.push(`${table} row: ${(e as Error).message}`);
				}
			}
			summary[table] = inserted;
		}
	} finally {
		db.close();
	}
	return { copied: summary, errors };
}

function migrateLegacyDb(legacyPath: string): MigrationReport {
	const report: MigrationReport = {
		legacyDb: legacyPath,
		migratedIds: [],
		skippedIds: [],
		errors: [],
	};

	if (!fs.existsSync(legacyPath)) {
		report.errors.push(`not found: ${legacyPath}`);
		return report;
	}

	let legacy: Database;
	try {
		legacy = new Database(legacyPath, { readonly: true });
	} catch (e) {
		report.errors.push(`cannot open: ${(e as Error).message}`);
		return report;
	}

	let rows: LegacyRow[];
	try {
		const result = legacy.query("SELECT * FROM contents").all();
		rows = result as LegacyRow[];
	} catch (e) {
		report.errors.push(`no 'contents' table: ${(e as Error).message}`);
		legacy.close();
		return report;
	}

	log(
		`${DRY_RUN ? "[dry-run] " : ""}migrating ${rows.length} rows from ${path.relative(REPO_ROOT, legacyPath)}`,
	);

	for (const row of rows) {
		const id = extractId(row);
		if (!id) {
			report.skippedIds.push(`<no id> (${JSON.stringify(row).slice(0, 60)})`);
			continue;
		}

		const target = perContentPath(id);
		if (fs.existsSync(target)) {
			report.skippedIds.push(`${id} (target already exists)`);
			continue;
		}

		if (DRY_RUN) {
			report.migratedIds.push(id);
			continue;
		}

		try {
			initPerContentDb(target);

			const targetCols = (() => {
				const tmp = new Database(target);
				try {
					return tableColumns(tmp, "contents");
				} finally {
					tmp.close();
				}
			})();

			// Insert the contents row. Intersect row keys with the target schema
			// so legacy rows with extra columns do not break the insert.
			const contentsCols = Object.keys(row).filter(
				(c) => c !== "rowid" && targetCols.includes(c),
			);
			if (!contentsCols.includes("id")) {
				throw new Error("legacy row is missing required 'id' column");
			}
			const placeholders = contentsCols.map(() => "?").join(",");
			{
				const targetDb = new Database(target);
				try {
					targetDb
						.prepare(
							`INSERT OR REPLACE INTO contents (${contentsCols.join(",")}) VALUES (${placeholders})`,
						)
						.run(...contentsCols.map((c) => row[c] as never));
				} finally {
					targetDb.close();
				}
			}

			const { errors: sideErrors } = copySideRows(legacy, id, target);
			if (sideErrors.length > 0) {
				report.errors.push(
					`${id}: side-table errors: ${sideErrors.join("; ")}`,
				);
				// Continue — partial side data is better than losing the row.
			}

			report.migratedIds.push(id);
		} catch (e) {
			report.errors.push(`${id}: ${(e as Error).message}`);
		}
	}

	legacy.close();

	if (!DRY_RUN && report.errors.length === 0 && report.migratedIds.length > 0) {
		ensureLegacyDir();
		const baseName = path.basename(legacyPath);
		const siblings = fs
			.readdirSync(path.dirname(legacyPath))
			.filter(
				(f) =>
					f === baseName || f === `${baseName}-shm` || f === `${baseName}-wal`,
			);
		for (const s of siblings) {
			const src = path.join(path.dirname(legacyPath), s);
			const dest = path.join(LEGACY_DIR, s);
			try {
				fs.renameSync(src, dest);
				log(`moved ${s} → _legacy/`);
			} catch (e) {
				warn(`could not move ${s}: ${(e as Error).message}`);
			}
		}
	}

	return report;
}

function main(): void {
	log(`mode: ${DRY_RUN ? "dry-run" : "commit"}`);
	const targets = findLegacyDatabases();
	if (targets.length === 0) {
		log("no legacy DBs found — per-SQLite layer is already clean");
		process.exit(0);
	}
	log(`found ${targets.length} legacy DB candidate(s)`);

	const reports: MigrationReport[] = [];
	for (const t of targets) {
		reports.push(migrateLegacyDb(t));
	}

	let totalMigrated = 0;
	let totalErrors = 0;
	for (const r of reports) {
		log(
			`${path.relative(REPO_ROOT, r.legacyDb)}: migrated=${r.migratedIds.length} skipped=${r.skippedIds.length} errors=${r.errors.length}`,
		);
		totalMigrated += r.migratedIds.length;
		totalErrors += r.errors.length;
		for (const e of r.errors) err(`  ${e}`);
	}

	log(
		`summary: migrated=${totalMigrated} errors=${totalErrors} mode=${DRY_RUN ? "dry-run" : "commit"}`,
	);

	if (totalErrors > 0) process.exit(1);
}

main();
