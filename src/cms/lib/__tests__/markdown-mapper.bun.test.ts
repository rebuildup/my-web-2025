import { expect, test } from "bun:test";
import { getMarkdownPage, saveMarkdownPage } from "../markdown-mapper";
import { openSqliteDb } from "../sqlite";

test("markdown pages can be found by linked content id", () => {
	const db = openSqliteDb(":memory:");

	try {
		db.exec(`
			CREATE TABLE markdown_pages (
				id TEXT PRIMARY KEY,
				content_id TEXT,
				slug TEXT NOT NULL UNIQUE,
				frontmatter TEXT NOT NULL,
				body TEXT NOT NULL,
				html_cache TEXT,
				path TEXT,
				lang TEXT DEFAULT 'ja',
				status TEXT DEFAULT 'draft',
				version INTEGER DEFAULT 1,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				published_at TEXT
			);
		`);

		saveMarkdownPage(db, {
			id: "md-entry",
			contentId: "portfolio-entry",
			slug: "entry-detail",
			body: "# Body",
			status: "published",
		});

		const page = getMarkdownPage(db, "portfolio-entry");

		expect(page?.id).toBe("md-entry");
		expect(page?.contentId).toBe("portfolio-entry");
		expect(page?.body).toBe("# Body");
	} finally {
		db.close();
	}
});
