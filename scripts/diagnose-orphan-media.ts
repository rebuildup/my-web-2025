/**
 * Diagnose orphan media references across all per-content CMS databases.
 *
 * Scans:
 *   - `contents.thumbnails` (JSON: image.src / gif.src / webm.src / webm.poster)
 *   - `markdown_pages.body` (`<Image src="…?contentId=X&id=Y&raw=1" />` tags)
 *   - `markdown_pages.html_cache` (`<img src="…?contentId=X&id=Y&raw=1" />` tags)
 *
 * For each (contentId, mediaId) pair extracted, probes the per-content DB
 * to confirm the row exists. Outputs:
 *
 *   - `data/diagnostics/orphan-media.json` (machine-readable)
 *   - `data/diagnostics/orphan-media.md`    (human report grouped by content)
 *
 * Honors the same `CONTENT_DATA_DIR` env var the CMS modules use, so it
 * works against `./data/contents/` locally and any production-mounted path.
 *
 * Exports `runDiagnostic({ dataDir })` so tests can call it directly against a
 * temp directory without spawning a subprocess. CLI usage goes through
 * `main()`, which calls `runDiagnostic()` and exits with code 2 on orphans.
 */

import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface RunDiagnosticOptions {
	dataDir?: string;
}

export interface RunDiagnosticResult {
	totalScanned: number;
	totalOrphans: number;
	jsonPath: string;
	mdPath: string;
	orphans: OrphanRef[];
}

type SourceField =
	| "contents.thumbnails.image.src"
	| "contents.thumbnails.gif.src"
	| "contents.thumbnails.webm.src"
	| "contents.thumbnails.webm.poster"
	| "markdown_pages.body"
	| "markdown_pages.html_cache";

interface OrphanRef {
	sourceContentId: string;
	sourceTitle?: string;
	sourceField: SourceField;
	mediaId: string;
	brokenUrl: string;
	lineNumber?: number;
	matchOffset?: number;
}

const MEDIA_URL_RE =
	/https?:\/\/[^"\s)]+\/api\/cms\/media\?[^"\s)]*contentId=([A-Za-z0-9_-]+)[^"\s)]*&id=([A-Za-z0-9_-]+)/g;
const MEDIA_URL_RE_BARE =
	/\/api\/cms\/media\?[^"\s)]*contentId=([A-Za-z0-9_-]+)[^"\s)]*&id=([A-Za-z0-9_-]+)/g;

function extractMediaRefs(
	text: string,
	sourceField: SourceField,
): Array<{ mediaId: string; contentId: string; index: number }> {
	if (!text) return [];
	const refs: Array<{ mediaId: string; contentId: string; index: number }> = [];
	const regex = sourceField.startsWith("markdown_pages")
		? MEDIA_URL_RE
		: MEDIA_URL_RE_BARE;
	for (let match = regex.exec(text); match !== null; match = regex.exec(text)) {
		refs.push({ contentId: match[1], mediaId: match[2], index: match.index });
	}
	return refs;
}

function lineNumberForOffset(text: string, offset: number): number {
	let line = 1;
	for (let i = 0; i < offset && i < text.length; i++) {
		if (text[i] === "\n") line++;
	}
	return line;
}

function mediaExists(dbPath: string, mediaId: string): boolean {
	if (!existsSync(dbPath)) return false;
	const db = new Database(dbPath, { readonly: true });
	try {
		const row = db
			.query("SELECT 1 FROM media WHERE id = ? LIMIT 1")
			.get(mediaId);
		return row !== null;
	} finally {
		db.close();
	}
}

function scanDbFileInDir(file: string, contentsDir: string): OrphanRef[] {
	const dbPath = join(contentsDir, file);
	const contentId = file.slice("content-".length, -".db".length);
	const db = new Database(dbPath, { readonly: true });
	const refs: OrphanRef[] = [];
	try {
		const titleRow = db
			.query("SELECT title FROM contents WHERE id = ? LIMIT 1")
			.get(contentId) as { title?: string } | undefined;
		const title = titleRow?.title;

		const contentsRows = db
			.query("SELECT thumbnails FROM contents WHERE id = ? LIMIT 1")
			.get(contentId) as { thumbnails: string | null } | undefined;

		if (contentsRows?.thumbnails) {
			try {
				const parsed = JSON.parse(contentsRows.thumbnails) as Record<
					string,
					{ src?: string; poster?: string }
				>;
				for (const variant of ["image", "gif"] as const) {
					const url = parsed[variant]?.src;
					if (!url) continue;
					for (const r of extractMediaRefs(
						url,
						`contents.thumbnails.${variant}.src` as SourceField,
					)) {
						refs.push({
							sourceContentId: contentId,
							sourceTitle: title,
							sourceField: `contents.thumbnails.${variant}.src` as SourceField,
							mediaId: r.mediaId,
							brokenUrl: url,
						});
					}
				}
				const webmUrl = parsed.webm?.src;
				if (webmUrl) {
					for (const r of extractMediaRefs(
						webmUrl,
						"contents.thumbnails.webm.src",
					)) {
						refs.push({
							sourceContentId: contentId,
							sourceTitle: title,
							sourceField: "contents.thumbnails.webm.src",
							mediaId: r.mediaId,
							brokenUrl: webmUrl,
						});
					}
				}
				const webmPoster = parsed.webm?.poster;
				if (webmPoster) {
					for (const r of extractMediaRefs(
						webmPoster,
						"contents.thumbnails.webm.poster",
					)) {
						refs.push({
							sourceContentId: contentId,
							sourceTitle: title,
							sourceField: "contents.thumbnails.webm.poster",
							mediaId: r.mediaId,
							brokenUrl: webmPoster,
						});
					}
				}
			} catch (err) {
				console.warn(`[diagnose] Bad thumbnails JSON for ${contentId}:`, err);
			}
		}

		const markdownRows = db
			.query(
				"SELECT id, slug, body, html_cache FROM markdown_pages WHERE content_id = ? OR content_id IS NULL",
			)
			.all(contentId) as Array<{
			id: string;
			slug: string;
			body: string;
			html_cache: string;
		}>;

		for (const page of markdownRows) {
			for (const r of extractMediaRefs(page.body, "markdown_pages.body")) {
				refs.push({
					sourceContentId: contentId,
					sourceTitle: title,
					sourceField: "markdown_pages.body",
					mediaId: r.mediaId,
					brokenUrl: `[slug=${page.slug}] ${page.body.slice(
						Math.max(0, r.index),
						Math.min(page.body.length, r.index + 200),
					)}`,
					lineNumber: lineNumberForOffset(page.body, r.index),
					matchOffset: r.index,
				});
			}
			for (const r of extractMediaRefs(
				page.html_cache,
				"markdown_pages.html_cache",
			)) {
				refs.push({
					sourceContentId: contentId,
					sourceTitle: title,
					sourceField: "markdown_pages.html_cache",
					mediaId: r.mediaId,
					brokenUrl: `[slug=${page.slug}] ${page.html_cache.slice(
						Math.max(0, r.index),
						Math.min(page.html_cache.length, r.index + 200),
					)}`,
					lineNumber: lineNumberForOffset(page.html_cache, r.index),
					matchOffset: r.index,
				});
			}
		}
	} finally {
		db.close();
	}
	return refs;
}

/**
 * Run the orphan media diagnostic against the given data directory.
 *
 * @param opts.dataDir  Directory containing `contents/*.db`. Defaults to
 *                      `process.env.CONTENT_DATA_DIR` or `./data`.
 * @returns Counts and paths plus the orphan list. The reports are also
 *          written to `<dataDir>/diagnostics/orphan-media.{json,md}`.
 */
export function runDiagnostic(
	opts: RunDiagnosticOptions = {},
): RunDiagnosticResult {
	const dataDir = opts.dataDir ?? process.env.CONTENT_DATA_DIR ?? "./data";
	const contentsDir = join(dataDir, "contents");
	const outDir = join(dataDir, "diagnostics");
	const jsonOut = join(outDir, "orphan-media.json");
	const mdOut = join(outDir, "orphan-media.md");

	if (!existsSync(contentsDir)) {
		throw new Error(
			`[diagnose] Contents directory not found: ${contentsDir}. Set CONTENT_DATA_DIR env var or pass { dataDir }.`,
		);
	}

	mkdirSync(outDir, { recursive: true });

	const dbFiles = readdirSync(contentsDir)
		.filter((f) => f.startsWith("content-") && f.endsWith(".db"))
		.sort();

	const allRefs: OrphanRef[] = [];
	for (const file of dbFiles) {
		const refs = scanDbFileInDir(file, contentsDir);
		allRefs.push(...refs);
	}

	const checked = new Set<string>();
	const orphans: OrphanRef[] = [];
	for (const ref of allRefs) {
		const key = `${ref.sourceContentId}|${ref.mediaId}|${ref.sourceField}|${ref.lineNumber ?? ""}|${ref.matchOffset ?? ""}`;
		if (checked.has(key)) continue;
		checked.add(key);

		const sanitizedContentId = ref.sourceContentId.replace(
			/[^A-Za-z0-9_-]/g,
			"_",
		);
		const probeDbPath = join(contentsDir, `content-${sanitizedContentId}.db`);

		if (!mediaExists(probeDbPath, ref.mediaId)) {
			orphans.push(ref);
		}
	}

	const grouped: Record<string, OrphanRef[]> = {};
	for (const o of orphans) {
		const list = grouped[o.sourceContentId] ?? [];
		list.push(o);
		grouped[o.sourceContentId] = list;
	}

	const jsonPayload = {
		generatedAt: new Date().toISOString(),
		contentsDir,
		totalScanned: allRefs.length,
		totalOrphans: orphans.length,
		orphans,
		grouped,
	};

	writeFileSync(jsonOut, JSON.stringify(jsonPayload, null, 2));

	const mdLines: string[] = [];
	mdLines.push(`# Orphan media references (${orphans.length})`);
	mdLines.push("");
	mdLines.push(`Generated at ${jsonPayload.generatedAt}`);
	mdLines.push(
		`Scanned: ${dbFiles.length} per-content DBs in \`${contentsDir}\``,
	);
	mdLines.push("");
	mdLines.push(`Total media URL references: ${allRefs.length}`);
	mdLines.push(`Total orphans: **${orphans.length}**`);
	mdLines.push("");
	for (const [contentId, refs] of Object.entries(grouped).sort()) {
		mdLines.push(
			`## ${contentId}${refs[0].sourceTitle ? ` — ${refs[0].sourceTitle}` : ""}`,
		);
		mdLines.push("");
		for (const r of refs) {
			const loc =
				r.sourceField + (r.lineNumber != null ? ` (line ${r.lineNumber})` : "");
			mdLines.push(`- **${r.mediaId}** at \`${loc}\``);
			mdLines.push(
				`  - ${r.brokenUrl.slice(0, 200)}${r.brokenUrl.length > 200 ? "…" : ""}`,
			);
		}
		mdLines.push("");
	}

	writeFileSync(mdOut, mdLines.join("\n"));

	return {
		totalScanned: allRefs.length,
		totalOrphans: orphans.length,
		jsonPath: jsonOut,
		mdPath: mdOut,
		orphans,
	};
}

function main() {
	const dataDir = process.env.CONTENT_DATA_DIR ?? "./data";
	console.log(`[diagnose] Scanning per-content DBs in ${dataDir}/contents`);
	const result = runDiagnostic();
	console.log(`[diagnose] ${result.totalScanned} media URL references scanned`);
	console.log(`[diagnose] ${result.totalOrphans} orphan references found`);
	console.log(`[diagnose] Wrote ${result.jsonPath}`);
	console.log(`[diagnose] Wrote ${result.mdPath}`);
	if (result.totalOrphans > 0) {
		process.exit(2);
	}
}

if (import.meta.main) {
	main();
}
