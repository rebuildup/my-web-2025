import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

interface MarkdownRow {
	id: string;
	content_id: string | null;
	slug: string;
	frontmatter: string;
	body: string;
	html_cache: string | null;
	path: string | null;
	lang: string | null;
	status: string | null;
	version: number | null;
	created_at: string;
	updated_at: string;
	published_at: string | null;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENTS_DIR = path.join(DATA_DIR, "contents");
const SOURCE_DB_PATH = path.join(DATA_DIR, "content.db");

function sanitizeContentId(id: string): string {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function migrate(): void {
	if (!fs.existsSync(SOURCE_DB_PATH)) {
		console.log("[migrate] source content.db not found, nothing to migrate");
		return;
	}

	const source = new Database(SOURCE_DB_PATH, { readonly: true });
	source.pragma("journal_mode = OFF");
	const rows = source
		.prepare<[], MarkdownRow>(
			`SELECT id, content_id, slug, frontmatter, body, html_cache, path, lang, status, version, created_at, updated_at, published_at FROM markdown_pages`,
		)
		.all();

	console.log(`[migrate] Found ${rows.length} markdown rows to migrate`);

	for (const row of rows) {
		const contentId = row.content_id || row.slug;
		if (!contentId) {
			console.warn(
				`[migrate] Skipping row ${row.id} because content_id and slug are missing`,
			);
			continue;
		}
		const sanitized = sanitizeContentId(contentId);
		const targetPath = path.join(CONTENTS_DIR, `content-${sanitized}.db`);
		if (!fs.existsSync(targetPath)) {
			console.warn(
				`[migrate] Target DB missing for content ${contentId} (${targetPath}), skipping`,
			);
			continue;
		}

		const target = new Database(targetPath);
		try {
			target
				.prepare(
					`INSERT OR REPLACE INTO markdown_pages (
						id,
						content_id,
						slug,
						frontmatter,
						body,
						html_cache,
						path,
						lang,
						status,
						version,
						created_at,
						updated_at,
						published_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.run(
					row.id,
					row.content_id ?? contentId,
					row.slug,
					row.frontmatter,
					row.body,
					row.html_cache,
					row.path,
					row.lang,
					row.status,
					row.version,
					row.created_at,
					row.updated_at,
					row.published_at,
				);
		} finally {
			target.close();
		}
	}

	source.close();
	console.log("[migrate] Migration complete");
}

migrate();
