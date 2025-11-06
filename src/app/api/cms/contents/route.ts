import {
	addToIndex,
	copyContentDb,
	deleteContentDb,
	getAllFromIndex,
	getContentDb,
	getFromIndex,
} from "@/cms/lib/content-db-manager";
import { getFullContent, saveFullContent } from "@/cms/lib/content-mapper";
import type { Content } from "@/cms/types/content";

export const runtime = "nodejs";

// ========== OPTIONS: CORS preflight ==========
export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

// ========== GET: コンテンツ一覧取得 ==========
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		// 特定のコンテンツを取得
		if (id) {
			const indexData = getFromIndex(id);
			if (!indexData) {
				return Response.json({ error: "Content not found" }, { status: 404 });
			}

			const db = getContentDb(id);
			const fullContent = getFullContent(db, id);
			db.close();

			if (!fullContent) {
				return Response.json({ error: "Content not found" }, { status: 404 });
			}

			return Response.json(fullContent);
		}

		// 全コンテンツの一覧を取得（インデックスから）
		let contents: unknown[] = [];
		try {
			contents = getAllFromIndex();
		} catch (e) {
			// DB が利用できない環境では空配列で応答（サーバーエラーを避ける）
			console.warn("Index DB not available, returning empty contents list", e);
			contents = [];
		}
		return Response.json(contents, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("GET /api/contents error:", error);
		return Response.json(
			{ error: "Failed to fetch contents" },
			{ status: 500 },
		);
	}
}

// ========== POST: コンテンツ作成 ==========
export async function POST(req: Request) {
	try {
		const data = await req.json();

		if (!data.id || !data.title) {
			return Response.json(
				{ error: "ID and title are required" },
				{ status: 400 },
			);
		}

		const content: Partial<Content> = {
			id: data.id,
			title: data.title,
			summary: data.summary,
			tags: data.tags,
			lang: data.lang || "ja",
			status: data.status || "draft",
			visibility: data.visibility || "draft",
			publishedAt: data.publishedAt,
			unpublishedAt: data.unpublishedAt,
			thumbnails: data.thumbnails,
			assets: data.assets,
			links: data.links,
			seo: data.seo,
			searchable: data.searchable || {
				fullText: `${data.title} ${data.summary || ""} ${(data.tags || []).join(" ")}`,
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// コンテンツ専用のデータベースを作成・取得
		const db = getContentDb(data.id);

		try {
			// コンテンツデータを保存
			saveFullContent(db, content);

			// インデックスに追加
			if (
				content.id &&
				content.title &&
				content.createdAt &&
				content.updatedAt
			) {
				addToIndex({
					id: content.id,
					title: content.title,
					summary: content.summary,
					lang: content.lang,
					status: content.status,
					visibility: content.visibility,
					createdAt: content.createdAt,
					updatedAt: content.updatedAt,
					publishedAt: content.publishedAt,
					tags: content.tags,
					thumbnails: content.thumbnails as Record<string, unknown> | undefined,
					seo: content.seo as Record<string, unknown> | undefined,
				});
			}

			return Response.json({ ok: true, id: content.id });
		} finally {
			db.close();
		}
	} catch (error) {
		console.error("POST /api/contents error:", error);
		return Response.json(
			{ error: "Failed to create content" },
			{ status: 500 },
		);
	}
}

// ========== PUT: コンテンツ更新 ==========
export async function PUT(req: Request) {
	try {
		const data = await req.json();

		if (!data.id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		// 古いIDを取得（編集時にoldIdが送られてくる場合）
		const oldId = (data as any).oldId;
		const newId = data.id;

		// IDが変更されている場合（oldIdが指定され、oldIdとnewIdが異なる場合）
		let existingContent: Content | null = null;
		
		if (oldId && oldId !== newId) {
			// 古いIDで存在確認
			const indexData = getFromIndex(oldId);
			if (!indexData) {
				return Response.json({ error: "Content not found" }, { status: 404 });
			}

			// 既存のコンテンツを取得（リネーム前に）
			const oldDb = getContentDb(oldId);
			try {
				existingContent = getFullContent(oldDb, oldId);
				if (!existingContent) {
					return Response.json(
						{ error: "Content not found in database" },
						{ status: 404 },
					);
				}
			} finally {
				oldDb.close();
			}

			// 新しいDBファイルを作成してデータをコピー（既存の接続を閉じた後）
			const copySuccess = copyContentDb(oldId, newId);
			if (!copySuccess) {
				return Response.json(
					{ error: "Failed to copy content database" },
					{ status: 500 },
				);
			}
		} else {
			// IDが変更されていない場合、通常の更新処理
			const indexData = getFromIndex(newId);
			if (!indexData) {
				return Response.json({ error: "Content not found" }, { status: 404 });
			}
		}

		// コンテンツ専用のデータベースを取得（新しいIDで）
		const db = getContentDb(newId);

		try {
			// 既存のコンテンツを取得（リネームした場合は既に取得済み）
			let existing = existingContent;
			if (!existing) {
				existing = getFullContent(db, newId);
				if (!existing) {
					return Response.json(
						{ error: "Content not found in database" },
						{ status: 404 },
					);
				}
			}

			// 更新データをマージ
			const content: Partial<Content> = {
				...existing,
				...data,
				id: newId, // 新しいIDを使用
				updatedAt: new Date().toISOString(),
				// publishedAtが明示的に送信されている場合は更新、undefinedの場合は既存の値を保持
				// ただし、dataにpublishedAtプロパティが存在する場合は、その値を使用（undefinedでも）
				publishedAt: Object.prototype.hasOwnProperty.call(data, 'publishedAt') ? data.publishedAt : existing.publishedAt,
				unpublishedAt: Object.prototype.hasOwnProperty.call(data, 'unpublishedAt') ? data.unpublishedAt : existing.unpublishedAt,
				searchable: data.searchable || {
					fullText: `${data.title || existing.title} ${data.summary || existing.summary || ""} ${(data.tags || existing.tags || []).join(" ")}`,
				},
			};

			// コンテンツデータを更新
			saveFullContent(db, content);

			// インデックスを更新
			if (
				content.id &&
				content.title &&
				content.createdAt &&
				content.updatedAt
			) {
				addToIndex({
					id: content.id,
					title: content.title,
					summary: content.summary,
					lang: content.lang,
					status: content.status,
					visibility: content.visibility,
					createdAt: content.createdAt,
					updatedAt: content.updatedAt,
					publishedAt: content.publishedAt,
					tags: content.tags,
					thumbnails: content.thumbnails as Record<string, unknown> | undefined,
					seo: content.seo as Record<string, unknown> | undefined,
				});
			}

			return Response.json({ ok: true });
		} finally {
			db.close();
		}
	} catch (error) {
		console.error("PUT /api/contents error:", error);
		return Response.json(
			{ error: "Failed to update content" },
			{ status: 500 },
		);
	}
}

// ========== DELETE: コンテンツ削除 ==========
export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		// コンテンツデータベースごと削除
		const success = deleteContentDb(id);

		if (!success) {
			return Response.json({ error: "Content not found" }, { status: 404 });
		}

		return Response.json({ ok: true });
	} catch (error) {
		console.error("DELETE /api/contents error:", error);
		return Response.json(
			{ error: "Failed to delete content" },
			{ status: 500 },
		);
	}
}
