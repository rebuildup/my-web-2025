/**
 * Recovery script: dump entries from the running Container via /api/entries,
 * rebuild a minimal sqlite db with the entries table populated, and push it
 * to R2 `contents/cms-api-dev.db`. Bypasses the Container's write_back loop
 * when it's not picking up changes to cms-api-dev.db specifically (the
 * per-content DB files do get synced, only the aggregate cms-api-dev.db
 * appears stuck).
 *
 * Usage:
 *   CMS_API_BASE_URL=https://yusuke-kim-router.${SUBDOMAIN}.workers.dev \
 *   R2_BUCKET=cms-data \
 *   R2_ENDPOINT=https://${ACCOUNT_ID}.r2.cloudflarestorage.com \
 *   R2_ACCESS_KEY_ID=... \
 *   R2_SECRET_ACCESS_KEY=... \
 *   bun run scripts/dump-container-to-r2.ts
 */
import { spawnSync } from "node:child_process";
import { unlinkSync } from "node:fs";

const cmsApiBaseUrl = (
	process.env.CMS_API_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");
const bucket = process.env.R2_BUCKET || "cms-data";
const endpoint = process.env.R2_ENDPOINT;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;

if (!endpoint || !accessKey || !secretKey) {
	console.error(
		"[dump-container-to-r2] R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY must be set",
	);
	process.exit(1);
}

type Entry = {
	id: string;
	entry_type?: string;
	slug?: string | null;
	status?: string;
	visibility?: string;
	title?: string;
	summary?: string | null;
	lang?: string;
	path?: string | null;
	depth?: number;
	order?: number;
	parent_id?: string | null;
	published_at?: string | null;
	created_at?: string;
	updated_at?: string;
};

async function fetchAllEntries(): Promise<Entry[]> {
	const url = `${cmsApiBaseUrl}/api/entries`;
	const r = await fetch(url, { headers: { Accept: "application/json" } });
	if (!r.ok) {
		throw new Error(`GET ${url} → ${r.status}`);
	}
	return (await r.json()) as Entry[];
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'portfolio',
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL DEFAULT '',
  summary TEXT,
  lang TEXT DEFAULT 'ja',
  path TEXT,
  depth INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  parent_id TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE VIEW IF NOT EXISTS list_index AS
  SELECT
    e.id, e.type, e.status, e.visibility, e.title, e.summary, e.lang,
    e.published_at, e.created_at, e.updated_at, e.slug,
    NULL AS thumbnail,
    NULL AS tags
  FROM entries e
  WHERE e.deleted_at IS NULL;
`;

function escapeSqlString(value: string | null | undefined): string {
	if (value === null || value === undefined) return "NULL";
	const escaped = value.replace(/'/g, "''");
	return `'${escaped}'`;
}

function entriesToSqlScript(entries: Entry[]): string {
	const insertStatements = entries.map((e) => {
		const fields = [
			escapeSqlString(e.id),
			escapeSqlString(e.entry_type ?? "portfolio"),
			escapeSqlString(e.slug ?? null),
			escapeSqlString(e.status ?? "draft"),
			escapeSqlString(e.visibility ?? "public"),
			escapeSqlString(e.title ?? ""),
			escapeSqlString(e.summary ?? null),
			escapeSqlString(e.lang ?? "ja"),
			escapeSqlString(e.path ?? null),
			e.depth ?? 0,
			e.order ?? 0,
			escapeSqlString(e.parent_id ?? null),
			escapeSqlString(e.published_at ?? null),
			escapeSqlString(e.created_at ?? new Date().toISOString()),
			escapeSqlString(e.updated_at ?? new Date().toISOString()),
		];
		return `INSERT OR REPLACE INTO entries (id, type, slug, status, visibility, title, summary, lang, path, depth, "order", parent_id, published_at, created_at, updated_at) VALUES (${fields.join(", ")});`;
	});
	return insertStatements.join("\n");
}

function buildSqlite(entries: Entry[]): string {
	const tmpDbPath = `/tmp/dump-container-${Date.now()}.db`;
	const tmpSqlPath = `${tmpDbPath}.sql`;

	// Write SQL script to a file, then load it into a fresh sqlite db.
	const sql = `${SCHEMA_SQL}\n${entriesToSqlScript(entries)}\n`;
	Bun.write(tmpSqlPath, sql);

	// Delete any prior tmp db
	try {
		unlinkSync(tmpDbPath);
	} catch {
		// ignore
	}

	const result = spawnSync("sqlite3", [tmpDbPath], {
		input: sql,
		encoding: "utf8",
		stdio: ["pipe", "pipe", "inherit"],
	});
	if (result.status !== 0) {
		throw new Error(`sqlite3 init failed with status ${result.status}`);
	}

	return tmpDbPath;
}

function uploadToR2(localPath: string): void {
	const env: Record<string, string> = {
		...process.env,
		AWS_REGION: "auto",
		AWS_ACCESS_KEY_ID: accessKey ?? "",
		AWS_SECRET_ACCESS_KEY: secretKey ?? "",
	};
	const args = [
		"s3",
		"cp",
		localPath,
		`s3://${bucket}/contents/cms-api-dev.db`,
		"--endpoint-url",
		endpoint ?? "",
		"--only-show-errors",
	];

	const result = spawnSync("aws", args, { env, stdio: "inherit" });
	if (result.status !== 0) {
		throw new Error(`aws s3 cp exited with status ${result.status}`);
	}
}

async function main(): Promise<void> {
	console.log(
		`[dump-container-to-r2] Fetching entries from ${cmsApiBaseUrl}/api/entries`,
	);
	const list = await fetchAllEntries();
	console.log(`[dump-container-to-r2] Got ${list.length} entries`);

	const dbPath = buildSqlite(list);
	console.log(`[dump-container-to-r2] Built sqlite db at ${dbPath}`);

	console.log(
		`[dump-container-to-r2] Uploading to s3://${bucket}/contents/cms-api-dev.db`,
	);
	uploadToR2(dbPath);

	unlinkSync(dbPath);
	try {
		unlinkSync(`${dbPath}.sql`);
	} catch {
		// ignore
	}
	console.log(`[dump-container-to-r2] Done`);
}

main().catch((err) => {
	console.error("[dump-container-to-r2] Failed");
	console.error(err);
	process.exit(1);
});
