import {
	deleteMedia,
	getMedia,
	listMedia,
	saveMedia,
} from "@/cms/lib/media-manager";
import type { MediaUploadRequest } from "@/cms/types/media";

export const runtime = "nodejs";

// ========== GET: メディア取得・一覧 ==========
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const contentId = searchParams.get("contentId");
		const mediaId = searchParams.get("id");

		if (!contentId) {
			return Response.json({ error: "contentId is required" }, { status: 400 });
		}

        // 特定のメディアを取得
		if (mediaId) {
			const media = getMedia(contentId, mediaId);
			if (!media) {
				return Response.json({ error: "Media not found" }, { status: 404 });
			}

            // 生バイナリで返す（<img src> などで直接参照したい場合）
            const raw = searchParams.get("raw");
            if (raw === "1" || raw === "true") {
                if (!media.data) {
                    console.error(`[media-api] Media data not found for contentId=${contentId}, mediaId=${mediaId}`);
                    return new Response("Media data not found", { status: 404 });
                }
                // Bufferを明示的にUint8Arrayに変換（デプロイ環境での互換性のため）
                let body: Uint8Array;
                try {
                    if (Buffer.isBuffer(media.data)) {
                        body = new Uint8Array(media.data);
                    } else {
                        // Buffer以外の型の場合はBufferに変換してからUint8Arrayに変換
                        let buffer: Buffer;
                        if (typeof media.data === "string") {
                            buffer = Buffer.from(media.data);
                        } else if (typeof media.data === "object" && media.data !== null && "byteLength" in media.data && !("byteOffset" in media.data)) {
                            // ArrayBufferのような型
                            buffer = Buffer.from(new Uint8Array(media.data as unknown as ArrayBuffer));
                        } else {
                            buffer = Buffer.from(media.data as unknown as ArrayLike<number>);
                        }
                        body = new Uint8Array(buffer);
                    }
                } catch (error) {
                    console.error(`[media-api] Failed to convert media data to Uint8Array:`, error);
                    return new Response("Failed to process media data", { status: 500 });
                }
                return new Response(body as BodyInit, {
                    headers: {
                        "Content-Type": media.mimeType || "application/octet-stream",
                        "Cache-Control": "public, max-age=31536000, immutable",
                        "Content-Length": body.length.toString(),
                    },
                });
            }

            // バイナリデータをBase64に変換
			const base64 = media.data?.toString("base64");
			return Response.json(
				{
					...media,
					data: undefined,
					base64,
				},
				{
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				},
			);
		}

		// メディア一覧を取得（バイナリデータは含めない）
		const mediaList = listMedia(contentId);
		return Response.json(mediaList, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("GET /api/media error:", error);
		return Response.json({ error: "Failed to fetch media" }, { status: 500 });
	}
}

// ========== POST: メディアアップロード ==========
export async function POST(req: Request) {
	try {
		const data: MediaUploadRequest = await req.json();

		if (
			!data.contentId ||
			!data.filename ||
			!data.mimeType ||
			!data.base64Data
		) {
			return Response.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Base64をBufferに変換
		const buffer = Buffer.from(data.base64Data, "base64");

		const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		saveMedia(data.contentId, {
			id: mediaId,
			filename: data.filename,
			mimeType: data.mimeType,
			size: buffer.length,
			alt: data.alt,
			description: data.description,
			tags: data.tags,
			data: buffer,
		});

		return Response.json({ ok: true, id: mediaId });
	} catch (error) {
		console.error("POST /api/media error:", error);
		return Response.json({ error: "Failed to upload media" }, { status: 500 });
	}
}

// ========== DELETE: メディア削除 ==========
export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const contentId = searchParams.get("contentId");
		const mediaId = searchParams.get("id");

		if (!contentId || !mediaId) {
			return Response.json(
				{ error: "contentId and id are required" },
				{ status: 400 },
			);
		}

		const success = deleteMedia(contentId, mediaId);
		if (!success) {
			return Response.json({ error: "Media not found" }, { status: 404 });
		}

		return Response.json({ ok: true });
	} catch (error) {
		console.error("DELETE /api/media error:", error);
		return Response.json({ error: "Failed to delete media" }, { status: 500 });
	}
}
