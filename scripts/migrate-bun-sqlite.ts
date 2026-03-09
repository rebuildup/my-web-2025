import fs from "node:fs";
import path from "node:path";
import { getContentDbPath, getDataDirectory } from "@/cms/lib/content-db-manager";
import { getFullContent, saveFullContent } from "@/cms/lib/content-mapper";
import { getMarkdownPage, saveMarkdownPage } from "@/cms/lib/markdown-mapper";
import { openSqliteDb } from "@/cms/lib/sqlite";

type VerificationResult = {
	dbFile: string;
	contentId?: string;
	status: "verified" | "empty" | "failed";
	message: string;
};

function listContentDatabases(): string[] {
	const contentsDir = path.join(getDataDirectory(), "contents");
	if (!fs.existsSync(contentsDir)) {
		return [];
	}
	return fs
		.readdirSync(contentsDir)
		.filter((file) => file.endsWith(".db"))
		.sort();
}

function verifyDatabase(dbFile: string): VerificationResult {
	const contentsDir = path.join(getDataDirectory(), "contents");
	const dbPath = path.join(contentsDir, dbFile);
	const db = openSqliteDb(dbPath);

	try {
		const integrity = db
			.prepare<{ integrity_check: string }>("PRAGMA integrity_check")
			.get();
		if (integrity?.integrity_check !== "ok") {
			return {
				dbFile,
				status: "failed",
				message: `integrity_check=${integrity?.integrity_check ?? "unknown"}`,
			};
		}

		const primary = db
			.prepare<{ id: string }>("SELECT id FROM contents ORDER BY created_at ASC LIMIT 1")
			.get();
		if (!primary?.id) {
			return {
				dbFile,
				status: "empty",
				message: "empty database",
			};
		}

		const content = getFullContent(db, primary.id);
		if (!content) {
			return {
				dbFile,
				contentId: primary.id,
				status: "failed",
				message: "primary content row could not be loaded",
			};
		}

		saveFullContent(db, content);

		const markdownRows = db
			.prepare<{ id: string }>("SELECT id FROM markdown_pages ORDER BY updated_at DESC")
			.all();
		for (const row of markdownRows) {
			const page = getMarkdownPage(db, row.id);
			if (page) {
				saveMarkdownPage(db, page);
			}
		}

		const mediaCount = db
			.prepare<{ count: number }>("SELECT COUNT(*) as count FROM media")
			.get()?.count ?? 0;

		return {
			dbFile,
			contentId: primary.id,
			status: "verified",
			message: `content+markdown round-trip ok, media=${mediaCount}`,
		};
	} finally {
		db.close();
	}
}

function main() {
	const dbFiles = listContentDatabases();
	if (dbFiles.length === 0) {
		console.log("[migrate-bun-sqlite] No content databases found");
		return;
	}

	const results = dbFiles.map(verifyDatabase);
	const failed = results.filter((result) => result.status === "failed");
	const verified = results.filter((result) => result.status === "verified");
	const empty = results.filter((result) => result.status === "empty");

	for (const result of results) {
		const label = result.status.toUpperCase().padEnd(8, " ");
		const contentLabel = result.contentId ? ` ${result.contentId}` : "";
		console.log(`[${label}] ${result.dbFile}${contentLabel} - ${result.message}`);
	}

	console.log(
		`[migrate-bun-sqlite] verified=${verified.length} empty=${empty.length} failed=${failed.length} total=${results.length}`,
	);

	if (failed.length > 0) {
		process.exitCode = 1;
	}
}

main();
