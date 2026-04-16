/**
 * Database migration: Add performance indexes to all content databases
 * Run this script to add indexes to existing databases for faster queries
 */

import fs from "node:fs";
import path from "node:path";
import { openSqliteDb } from "../sqlite";

const CONTENT_DB_DIR = path.join(process.cwd(), "data", "contents");

interface SqliteDatabase {
	exec(sql: string): void;
	close(): void;
}

function openSqlite(dbPath: string): SqliteDatabase {
	const db = openSqliteDb(dbPath);
	try {
		db.pragma("journal_mode = WAL");
	} catch {
		// ignore
	}
	return db;
}

function listContentDbFiles(): string[] {
	if (!fs.existsSync(CONTENT_DB_DIR)) {
		console.warn(
			`[Migration] Contents DB directory does not exist: ${CONTENT_DB_DIR}`,
		);
		return [];
	}
	const files = fs.readdirSync(CONTENT_DB_DIR);
	return files.filter((file) => file.endsWith(".db")).sort();
}

function extractContentIdFromFileName(file: string): string {
	if (!file.startsWith("content-") || !file.endsWith(".db")) {
		return file.replace(/\.db$/, "");
	}
	return file.slice("content-".length, -".db".length);
}

export function addPerformanceIndexes(): void {
	const indexes = [
		"CREATE INDEX IF NOT EXISTS idx_contents_updated_at ON contents(updated_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)",
		"CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_markdown_pages_updated ON markdown_pages(updated_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_markdown_pages_status ON markdown_pages(status)",
		"CREATE INDEX IF NOT EXISTS idx_markdown_pages_slug ON markdown_pages(slug)",
	];

	const dbFiles = listContentDbFiles();
	console.log(`[Migration] Processing ${dbFiles.length} database files`);

	let successCount = 0;
	let failCount = 0;

	for (const file of dbFiles) {
		const contentId = extractContentIdFromFileName(file);
		const dbPath = path.join(CONTENT_DB_DIR, file);

		try {
			const db = openSqlite(dbPath);

			for (const idx of indexes) {
				try {
					db.exec(idx);
				} catch (e) {
					console.warn(
						`[Migration] Index creation failed for ${contentId}:`,
						e,
					);
				}
			}

			db.close();
			successCount++;
			console.log(`[Migration] Indexes added to: ${contentId}`);
		} catch (e) {
			failCount++;
			console.error(`[Migration] Failed to process ${contentId}:`, e);
		}
	}

	console.log(
		`[Migration] Complete: ${successCount} success, ${failCount} failed`,
	);
}

// Run if executed directly
if (require.main === module) {
	console.log("[Migration] Starting performance index migration...");
	addPerformanceIndexes();
	console.log("[Migration] Migration complete");
}
