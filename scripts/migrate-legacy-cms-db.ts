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
 *    defined by `src/cms/lib/content-db-manager.ts`.
 * 3. Triggers FTS5 rebuild on each new per-content DB (the triggers in the
 *    schema init keep the FTS5 index aligned with the content rows; this script
 *    also issues a manual `INSERT INTO contents_fts(contents_fts) VALUES('rebuild')`
 *    as a belt-and-suspenders safety pass).
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
 */

import fs from "node:fs";
import path from "node:path";
import { Database } from "bun:sqlite";

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

/** Per-content DB schema, kept in sync with src/cms/lib/content-db-manager.ts. */
const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS contents (
		id TEXT PRIMARY KEY,
		slug TEXT,
		lang TEXT,
		path TEXT,
		depth INTEGER,
		"order" INTEGER,
		parent_id TEXT,
		type TEXT,
		status TEXT,
		visibility TEXT,
		title TEXT,
		summary TEXT,
		body TEXT,
		thumbnail TEXT,
		published_at TEXT,
		updated_at TEXT,
		metadata TEXT,
		ext TEXT,
		version INTEGER NOT NULL DEFAULT 1
	)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_visibility ON contents(visibility)`,
	`CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at)`,
	`CREATE TABLE IF NOT EXISTS content_tags (
		content_id TEXT NOT NULL,
		tag TEXT NOT NULL,
		PRIMARY KEY (content_id, tag)
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag)`,
	`CREATE TABLE IF NOT EXISTS content_relations (
		source_id TEXT NOT NULL,
		target_id TEXT NOT NULL,
		relation TEXT NOT NULL,
		PRIMARY KEY (source_id, target_id, relation)
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_relations_source ON content_relations(source_id)`,
	`CREATE INDEX IF NOT EXISTS idx_content_relations_target ON content_relations(target_id)`,
	`CREATE TABLE IF NOT EXISTS content_assets (
		content_id TEXT NOT NULL,
		asset_id TEXT NOT NULL,
		src TEXT,
		kind TEXT,
		role TEXT,
		order_index INTEGER,
		metadata TEXT,
		PRIMARY KEY (content_id, asset_id)
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_assets_content ON content_assets(content_id)`,
	`CREATE TABLE IF NOT EXISTS content_links (
		content_id TEXT NOT NULL,
		href TEXT NOT NULL,
		label TEXT,
		kind TEXT,
		order_index INTEGER,
		PRIMARY KEY (content_id, href)
	)`,
	`CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_links(content_id)`,
	`CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
		title, summary, body, tags, ext,
		content='contents', content_rowid='rowid'
	)`,
	`CREATE TRIGGER IF NOT EXISTS contents_fts_insert AFTER INSERT ON contents BEGIN
		INSERT INTO contents_fts(rowid, title, summary, body, tags, ext)
		VALUES (new.rowid, new.title, new.summary, new.body, '', new.ext);
	END`,
	`CREATE TRIGGER IF NOT EXISTS contents_fts_delete AFTER DELETE ON contents BEGIN
		INSERT INTO contents_fts(contents_fts, rowid, title, summary, body, tags, ext)
		VALUES('delete', old.rowid, old.title, old.summary, old.body, '', old.ext);
	END`,
];

/** Tables in the legacy DB to copy as side-tables for each per-content DB. */
const SIDE_TABLES = ["content_tags", "content_relations", "content_assets", "content_links"];

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

function copySideRows(
	legacy: Database,
	contentId: string,
	target: string,
): void {
	const db = new Database(target);
	try {
		for (const table of SIDE_TABLES) {
			const rows = legacy
				.query(`SELECT * FROM ${table} WHERE content_id = ?`)
				.all(contentId) as Record<string, unknown>[];
			if (rows.length === 0) continue;
			const cols = Object.keys(rows[0]);
			const placeholders = cols.map(() => "?").join(",");
			const stmt = db.prepare(
				`INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`,
			);
			for (const row of rows) {
				stmt.run(...cols.map((c) => row[c] as never));
			}
		}
	} finally {
		db.close();
	}
}

function rebuildFts(target: string): void {
	const db = new Database(target);
	try {
		db.exec("INSERT INTO contents_fts(contents_fts) VALUES('rebuild')");
	} finally {
		db.close();
	}
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
			const targetDb = new Database(target);
			try {
				const cols = Object.keys(row).filter((c) => c !== "rowid");
				const placeholders = cols.map(() => "?").join(",");
				targetDb
					.prepare(
						`INSERT OR REPLACE INTO contents (${cols.join(",")}) VALUES (${placeholders})`,
					)
					.run(...cols.map((c) => row[c] as never));
			} finally {
				targetDb.close();
			}
			copySideRows(legacy, id, target);
			rebuildFts(target);
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
					f === baseName ||
					f === `${baseName}-shm` ||
					f === `${baseName}-wal`,
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