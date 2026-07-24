export const dynamic = "force-static";
import { getCmsApiBaseUrl, shouldUseRustCmsApi } from "@/lib/cms-api/config";
import { CmsApiProxyError, cmsApiFetch } from "@/lib/cms-api/server-client";
import { requireAdminRequest } from "@/lib/server/admin-auth";
import { getMedia } from "@/cms/lib/media-manager";

const DEFAULT_MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/svg+xml",
]);

function isValidBase64(data: string): boolean {
	try {
		if (!data || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
			return false;
		}
		const decoded = Buffer.from(data, "base64");
		return decoded.toString("base64") === data;
	} catch {
		return false;
	}
}

export async function GET(req: Request) {
	try {
		const url = req.url.startsWith("http")
			? new URL(req.url)
			: new URL(req.url, "http://localhost");
		const searchParams = url.searchParams;

		const contentId = searchParams.get("contentId");
		const mediaId = searchParams.get("id");

		if (!contentId) {
			return Response.json({ error: "contentId is required" }, { status: 400 });
		}

		if (!shouldUseRustCmsApi()) {
			if (!mediaId) {
				return Response.json({ error: "id is required" }, { status: 400 });
			}
			const media = getMedia(contentId, mediaId);
			if (!media || !media.data) {
				return Response.json({ error: "Media not found" }, { status: 404 });
			}
			return new Response(new Uint8Array(media.data), {
				status: 200,
				headers: {
					"Content-Type": media.mimeType || "application/octet-stream",
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			});
		}

		const rustParams = new URLSearchParams({ contentId });
		if (mediaId) rustParams.set("id", mediaId);
		const raw = searchParams.get("raw");
		if (raw) rustParams.set("raw", raw);

		if (mediaId && (raw === "1" || raw === "true")) {
			const response = await fetch(
				`${getCmsApiBaseUrl()}/media?${rustParams.toString()}`,
				{ cache: "no-store" },
			);
			if (!response.ok) {
				throw new CmsApiProxyError(
					`CMS API media raw request failed with status ${response.status}`,
					response.status,
				);
			}

			const body = await response.arrayBuffer();
			return new Response(body, {
				status: response.status,
				headers: {
					"Content-Type":
						response.headers.get("content-type") ||
						"application/octet-stream",
					"Cache-Control":
						response.headers.get("cache-control") ||
						"public, max-age=31536000, immutable",
				},
			});
		}

		const rustResponse = await cmsApiFetch<unknown>(
			`/media?${rustParams.toString()}`,
		);
		return Response.json(rustResponse);
	} catch (error) {
		console.error("GET /api/cms/media error:", error);
		return Response.json({ error: "Failed to fetch media" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) {
		return guard.response;
	}

	try {
		const data = await req.json();

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

		if (!ALLOWED_MEDIA_TYPES.has(data.mimeType)) {
			return Response.json(
				{ error: "Unsupported media type" },
				{ status: 415 },
			);
		}

		if (!isValidBase64(data.base64Data)) {
			return Response.json({ error: "Invalid base64 data" }, { status: 400 });
		}

		const maxBytes =
			Number(process.env.CMS_MAX_MEDIA_BYTES) || DEFAULT_MAX_MEDIA_BYTES;
		const buffer = Buffer.from(data.base64Data, "base64");
		if (buffer.length > maxBytes) {
			return Response.json({ error: "Media file too large" }, { status: 413 });
		}

		const response = await fetch(`${getCmsApiBaseUrl()}/media`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			return Response.json(
				{ error: "Failed to upload media", details: errorBody },
				{ status: response.status },
			);
		}

		return Response.json(await response.json());
	} catch (error) {
		console.error("POST /api/cms/media error:", error);
		return Response.json({ error: "Failed to upload media" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) {
		return guard.response;
	}

	try {
		const url = req.url.startsWith("http")
			? new URL(req.url)
			: new URL(req.url, "http://localhost");
		const searchParams = url.searchParams;

		const contentId = searchParams.get("contentId");
		const mediaId = searchParams.get("id");

		if (!contentId || !mediaId) {
			return Response.json(
				{ error: "contentId and id are required" },
				{ status: 400 },
			);
		}

		const rustParams = new URLSearchParams({ contentId, id: mediaId });
		const response = await fetch(
			`${getCmsApiBaseUrl()}/media?${rustParams.toString()}`,
			{
				method: "DELETE",
				headers: { Accept: "application/json" },
			},
		);

		if (!response.ok) {
			const errorBody = await response.text();
			return Response.json(
				{ error: "Failed to delete media", details: errorBody },
				{ status: response.status },
			);
		}

		return Response.json({ ok: true });
	} catch (error) {
		console.error("DELETE /api/cms/media error:", error);
		return Response.json({ error: "Failed to delete media" }, { status: 500 });
	}
}
