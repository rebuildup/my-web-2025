/**
 * メディア（画像）管理機能
 */

import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import type { MediaRow } from "@/cms/types/database";
import type { MediaItem } from "@/cms/types/media";
import {
	getContentDb,
	getDataDirectory,
	getFromIndex,
} from "./content-db-manager";

const MEDIA_STORE_DIR = path.join(getDataDirectory(), "media-store");
ensureDirectory(MEDIA_STORE_DIR);

interface PersistedMediaRecord {
	id: string;
	contentId: string;
	filename: string;
	mimeType: string;
	size: number;
	width?: number;
	height?: number;
	alt?: string;
	description?: string;
	tags?: string[];
	data: Buffer;
	createdAt: string;
	updatedAt: string;
}

// ========== メディア保存 ==========

export function saveMedia(
	contentId: string,
	mediaData: {
		id: string;
		filename: string;
		mimeType: string;
		size: number;
		width?: number;
		height?: number;
		alt?: string;
		description?: string;
		tags?: string[];
		data: Buffer;
	},
): void {
	const db = getContentDb(contentId);

	try {
		ensureContentRow(db, contentId);

		const now = new Date().toISOString();
		const record: PersistedMediaRecord = {
			id: mediaData.id,
			contentId,
			filename: mediaData.filename,
			mimeType: mediaData.mimeType,
			size: mediaData.size,
			width: mediaData.width,
			height: mediaData.height,
			alt: mediaData.alt,
			description: mediaData.description,
			tags: mediaData.tags,
			data: mediaData.data,
			createdAt: now,
			updatedAt: now,
		};

		insertOrReplaceMediaRow(db, record);
		persistMediaToStore(record);
	} finally {
		db.close();
	}
}

// ========== メディア取得 ==========

export function getMedia(contentId: string, mediaId: string): MediaItem | null {
	const db = getContentDb(contentId);

	try {
		syncMediaStoreToDb(contentId, db);

		const stmt = db.prepare(`
      SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at
      FROM media
      WHERE id = ?
    `);

		const row = stmt.get(mediaId) as MediaRow | undefined;

		if (!row) {
			console.warn(
				`[media-manager] Media not found in database: contentId=${contentId}, mediaId=${mediaId}`,
			);
			return null;
		}

		const data = deriveMediaBuffer(row.data);

		if (!data) {
			console.warn(
				`[media-manager] Media data is null or undefined: contentId=${contentId}, mediaId=${mediaId}`,
			);
		}

		return {
			id: row.id,
			contentId: row.content_id,
			filename: row.filename || row.src,
			mimeType: row.mime_type || row.type,
			size: row.size || 0,
			width: row.width,
			height: row.height,
			alt: row.alt,
			description: row.description || "",
			tags: row.tags ? JSON.parse(row.tags) : [],
			data,
			createdAt: row.created_at || new Date().toISOString(),
			updatedAt: row.updated_at || new Date().toISOString(),
		};
	} catch (error) {
		console.error(
			`[media-manager] Error getting media: contentId=${contentId}, mediaId=${mediaId}`,
			error,
		);
		return null;
	} finally {
		db.close();
	}
}

// ========== メディア一覧取得 ==========

export function listMedia(contentId: string): MediaItem[] {
	const db = getContentDb(contentId);

	try {
		syncMediaStoreToDb(contentId, db);

		const stmt = db.prepare(`
      SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, created_at, updated_at
      FROM media
      ORDER BY created_at DESC
    `);

		const rows = stmt.all() as Array<{
			id: string;
			content_id: string;
			filename: string;
			mime_type: string;
			size: number;
			width: number;
			height: number;
			alt: string;
			description: string;
			tags: string;
			created_at: string;
			updated_at: string;
		}>;

		return rows.map((row) => ({
			id: row.id,
			contentId: row.content_id,
			filename: row.filename,
			mimeType: row.mime_type,
			size: row.size,
			width: row.width,
			height: row.height,
			alt: row.alt,
			description: row.description,
			tags: row.tags ? JSON.parse(row.tags) : undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));
	} finally {
		db.close();
	}
}

// ========== メディア削除 ==========

export function deleteMedia(contentId: string, mediaId: string): boolean {
	const db = getContentDb(contentId);

	try {
		const stmt = db.prepare("DELETE FROM media WHERE id = ?");
		const result = stmt.run(mediaId);
		if (result.changes > 0) {
			deleteMediaFromStore(contentId, mediaId);
		}
		return result.changes > 0;
	} finally {
		db.close();
	}
}

// ========== メディア統計 ==========

export function getMediaStats(contentId: string): {
	totalCount: number;
	totalSize: number;
	byMimeType: Record<string, number>;
} {
	const db = getContentDb(contentId);

	try {
		syncMediaStoreToDb(contentId, db);

		const countStmt = db.prepare("SELECT COUNT(*) as count FROM media");
		const sizeStmt = db.prepare("SELECT SUM(size) as total FROM media");
		const typeStmt = db.prepare(
			"SELECT mime_type, COUNT(*) as count FROM media GROUP BY mime_type",
		);

		const countRow = countStmt.get() as { count: number };
		const sizeRow = sizeStmt.get() as { total: number | null };
		const typeRows = typeStmt.all() as Array<{
			mime_type: string;
			count: number;
		}>;

		const byMimeType: Record<string, number> = {};
		for (const row of typeRows) {
			byMimeType[row.mime_type] = row.count;
		}

		return {
			totalCount: countRow.count,
			totalSize: sizeRow.total || 0,
			byMimeType,
		};
	} finally {
		db.close();
	}
}

function deriveMediaBuffer(source: MediaRow["data"]): Buffer | undefined {
	if (!source) {
		return undefined;
	}
	if (typeof source === "string") {
		// Base64エンコードされた文字列の場合
		try {
			return Buffer.from(source, "base64");
		} catch {
			// Base64でない場合はそのままBufferに変換
			return Buffer.from(source);
		}
	}
	if (Buffer.isBuffer(source)) {
		// 既にBufferの場合はそのまま返す
		return source;
	}
	// その他の型の場合はBufferに変換を試みる
	try {
		if (typeof source === "object" && source !== null) {
			// Uint8ArrayやArrayBufferのようなオブジェクトの場合
			if ("byteLength" in source && "byteOffset" in source) {
				// Uint8Arrayのような型
				return Buffer.from(source as unknown as ArrayLike<number>);
			}
			if ("byteLength" in source && !("byteOffset" in source)) {
				// ArrayBufferのような型
				return Buffer.from(new Uint8Array(source as unknown as ArrayBuffer));
			}
		}
		// その他の場合はBuffer.fromで変換を試みる
		if (typeof source === "string") {
			return Buffer.from(source);
		}
		return Buffer.from(source as unknown as ArrayLike<number>);
	} catch {
		// 変換に失敗した場合はundefinedを返す
		return undefined;
	}
}

function ensureContentRow(db: Database.Database, contentId: string) {
	if (!contentId) {
		return;
	}

	const exists = db
		.prepare("SELECT 1 FROM contents WHERE id = ?")
		.get(contentId) as unknown;
	if (exists) {
		return;
	}

	const indexData = getFromIndex(contentId);
	const now = new Date().toISOString();

	const payload = {
		id: contentId,
		title: indexData?.title ?? contentId,
		summary: indexData?.summary ?? null,
		lang: indexData?.lang ?? "ja",
		visibility: indexData?.visibility ?? "draft",
		status: indexData?.status ?? "draft",
		published_at: indexData?.publishedAt ?? null,
		created_at: indexData?.createdAt ?? now,
		updated_at: indexData?.updatedAt ?? now,
	};

	db.prepare(
		`INSERT INTO contents (
      id, title, summary, lang, visibility, status, published_at, created_at, updated_at
    ) VALUES (
      @id, @title, @summary, @lang, @visibility, @status, @published_at, @created_at, @updated_at
    )`,
	).run(payload);
}

function insertOrReplaceMediaRow(
	db: Database.Database,
	record: PersistedMediaRecord,
) {
	const stmt = db.prepare(`
    INSERT OR REPLACE INTO media (
      id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

	stmt.run(
		record.id,
		record.contentId,
		record.filename,
		record.mimeType,
		record.size,
		record.width || null,
		record.height || null,
		record.alt || null,
		record.description || null,
		record.tags ? JSON.stringify(record.tags) : null,
		record.data,
		record.createdAt,
		record.updatedAt,
	);
}

function persistMediaToStore(record: PersistedMediaRecord): void {
	try {
		const dir = getMediaStoreDir(record.contentId);
		ensureDirectory(dir);
		fs.writeFileSync(
			getMediaBinaryPath(record.contentId, record.id),
			record.data,
		);
		const meta = {
			id: record.id,
			contentId: record.contentId,
			filename: record.filename,
			mimeType: record.mimeType,
			size: record.size,
			width: record.width,
			height: record.height,
			alt: record.alt,
			description: record.description,
			tags: record.tags,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		};
		fs.writeFileSync(
			getMediaMetaPath(record.contentId, record.id),
			JSON.stringify(meta, null, 2),
		);
	} catch (error) {
		console.warn("[media-manager] Failed to persist media to store:", error);
	}
}

function deleteMediaFromStore(contentId: string, mediaId: string): void {
	for (const target of [
		getMediaBinaryPath(contentId, mediaId),
		getMediaMetaPath(contentId, mediaId),
	]) {
		try {
			if (fs.existsSync(target)) {
				fs.rmSync(target, { force: true });
			}
		} catch (error) {
			console.warn("[media-manager] Failed to delete media file:", error);
		}
	}
}

function syncMediaStoreToDb(contentId: string, db: Database.Database): void {
	const dir = getMediaStoreDir(contentId);
	if (!fs.existsSync(dir)) {
		return;
	}
	for (const entry of fs.readdirSync(dir)) {
		if (!entry.endsWith(".json")) continue;
		const mediaId = entry.slice(0, -".json".length);
		const exists = db
			.prepare("SELECT 1 FROM media WHERE id = ?")
			.get(mediaId) as unknown;
		if (exists) continue;
		const record = loadPersistedMedia(contentId, mediaId);
		if (!record) continue;
		try {
			insertOrReplaceMediaRow(db, record);
		} catch (error) {
			console.warn(
				`[media-manager] Failed to rehydrate media ${mediaId} for ${contentId}:`,
				error,
			);
		}
	}
}

function loadPersistedMedia(
	contentId: string,
	mediaId: string,
): PersistedMediaRecord | null {
	try {
		const metaPath = getMediaMetaPath(contentId, mediaId);
		const binPath = getMediaBinaryPath(contentId, mediaId);
		if (!fs.existsSync(metaPath) || !fs.existsSync(binPath)) {
			return null;
		}
		const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Omit<
			PersistedMediaRecord,
			"data"
		>;
		const data = fs.readFileSync(binPath);
		return {
			...meta,
			data,
		};
	} catch (error) {
		console.warn("[media-manager] Failed to load persisted media:", error);
		return null;
	}
}

function getMediaStoreDir(contentId: string): string {
	return path.join(MEDIA_STORE_DIR, sanitizeId(contentId));
}

function getMediaBinaryPath(contentId: string, mediaId: string): string {
	return path.join(getMediaStoreDir(contentId), `${mediaId}.bin`);
}

function getMediaMetaPath(contentId: string, mediaId: string): string {
	return path.join(getMediaStoreDir(contentId), `${mediaId}.json`);
}

function ensureDirectory(dir: string): void {
	try {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	} catch (error) {
		console.warn("[media-manager] Failed to ensure directory:", error);
	}
}

function sanitizeId(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
