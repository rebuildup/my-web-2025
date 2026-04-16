import "server-only";

import { getAllFromIndex, getContentDb } from "@/cms/lib/content-db-manager";
import type { MarkdownPageRow } from "@/cms/lib/markdown-mapper";
import type { SqliteDatabase } from "@/cms/lib/sqlite";
import {
	deleteMarkdownPage as deleteMarkdownRow,
	getMarkdownPage as getMarkdownPageFromDb,
	rowToMarkdownPage,
	saveMarkdownPage,
} from "@/cms/lib/markdown-mapper";
import type { MarkdownPage } from "@/cms/types/markdown";
import { markdownCache } from "@/lib/server-cache";

type MarkdownMatch = {
	page: MarkdownPage;
	contentId: string;
};

function unique<T>(values: T[]): T[] {
	return [...new Set(values.filter(Boolean))];
}

function getCandidateContentIds(preferredId?: string): string[] {
	if (preferredId) {
		return [preferredId];
	}

	const indexEntries = getAllFromIndex();
	return unique(indexEntries.map((entry) => entry.id));
}

function withContentDb<T>(contentId: string, fn: (db: SqliteDatabase) => T): T {
	const db = getContentDb(contentId);
	try {
		return fn(db);
	} finally {
		db.close();
	}
}

function mapRows(
	rows: MarkdownPageRow[],
	fallbackContentId: string,
): MarkdownPage[] {
	return rows.map((row) => {
		const page = rowToMarkdownPage(row);
		if (!page.contentId) {
			page.contentId = fallbackContentId;
		}
		return page;
	});
}

export function listMarkdownPages(options?: {
	contentId?: string;
}): MarkdownPage[] {
	const cacheKey = `markdown-list-${options?.contentId || "all"}`;

	const cached = markdownCache.get(cacheKey) as MarkdownPage[] | undefined;
	if (cached) {
		console.log(`[MarkdownService] Cache hit for: ${cacheKey}`);
		return cached;
	}

	const ids = getCandidateContentIds(options?.contentId);
	const pages: MarkdownPage[] = [];

	console.log(
		`[MarkdownService] listMarkdownPages called with contentId: ${options?.contentId}`,
	);
	console.log(`[MarkdownService] Candidate content IDs: ${ids.length}`);

	for (const id of ids) {
		const rows = withContentDb(id, (db) => {
			console.log(
				`[MarkdownService] Querying markdown pages from database: ${id}`,
			);
			return db
				.prepare(
					`SELECT id, content_id, slug, frontmatter, body, html_cache, path, lang, status, version, created_at, updated_at, published_at
           FROM markdown_pages
           ORDER BY updated_at DESC`,
				)
				.all() as MarkdownPageRow[];
		});
		console.log(
			`[MarkdownService] Found ${rows.length} markdown pages for content ID: ${id}`,
		);
		pages.push(...mapRows(rows, id));
	}

	console.log(`[MarkdownService] Total markdown pages loaded: ${pages.length}`);
	const result = pages.sort((a, b) => {
		const aTime = a.updatedAt || "";
		const bTime = b.updatedAt || "";
		return bTime.localeCompare(aTime);
	});

	markdownCache.set(cacheKey, result);
	return result;
}

function findMarkdownRow(
	identifier: string,
	options?: { contentId?: string; slugOnly?: boolean },
): MarkdownMatch | null {
	const ids = getCandidateContentIds(options?.contentId);

	for (const id of ids) {
		const row = withContentDb(id, (db) => {
			if (options?.slugOnly) {
				return db
					.prepare("SELECT * FROM markdown_pages WHERE slug = ? LIMIT 1")
					.get(identifier) as MarkdownPageRow | undefined;
			}
			return db
				.prepare(
					"SELECT * FROM markdown_pages WHERE id = ? OR slug = ? LIMIT 1",
				)
				.get(identifier, identifier) as MarkdownPageRow | undefined;
		}) as MarkdownPageRow | undefined;

		if (row) {
			const page = rowToMarkdownPage(row);
			const contentId = page.contentId || id;
			return {
				page: {
					...page,
					contentId,
				},
				contentId,
			};
		}
	}

	return null;
}

export function findMarkdownPage(
	identifier: string,
	options?: { contentId?: string },
): MarkdownMatch | null {
	return findMarkdownRow(identifier, options);
}

export function findMarkdownPageBySlug(
	slug: string,
	options?: { contentId?: string },
): MarkdownMatch | null {
	return findMarkdownRow(slug, { ...options, slugOnly: true });
}

export function slugExists(slug: string, excludeId?: string): boolean {
	const found = findMarkdownPageBySlug(slug);
	if (!found) return false;
	if (excludeId && found.page.id === excludeId) {
		return false;
	}
	return true;
}

export function saveMarkdownPageForContent(
	contentId: string,
	page: Partial<MarkdownPage>,
): MarkdownPage {
	const result = withContentDb(contentId, (db) => {
		saveMarkdownPage(db, { ...page, contentId });
		const identifier = page.id || page.slug || page.contentId || contentId;
		const saved =
			(identifier && getMarkdownPageFromDb(db, identifier)) ||
			findMarkdownRow(identifier ?? "", { contentId })?.page;
		if (!saved) {
			throw new Error(`Failed to read saved markdown page (${identifier})`);
		}
		if (!saved.contentId) {
			saved.contentId = contentId;
		}
		return saved;
	});
	markdownCache.clear();
	return result;
}

export function deleteMarkdownPage(
	identifier: string,
	options?: { contentId?: string },
): boolean {
	const target = findMarkdownPage(identifier, options);
	if (!target) {
		return false;
	}

	const result = withContentDb(target.contentId, (db) =>
		deleteMarkdownRow(db, identifier),
	);
	markdownCache.clear();
	return result;
}
