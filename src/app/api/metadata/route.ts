/**
 * Metadata API Route
 * Fetches Open Graph and SEO metadata from URLs
 */

import type { NextRequest } from "next/server";

interface MetadataResponse {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(html: string, baseUrl: string): MetadataResponse {
	const metadata: MetadataResponse = {};

	// Extract title
	const titleMatch =
		html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
		html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
		html.match(/<title[^>]*>([^<]+)<\/title>/i);
	if (titleMatch) {
		metadata.title = titleMatch[1].trim();
	}

	// Extract description
	const descriptionMatch =
		html.match(
			/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
		) ||
		html.match(
			/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i,
		) ||
		html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
	if (descriptionMatch) {
		metadata.description = descriptionMatch[1].trim();
	}

	// Extract image
	const imageMatch =
		html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
		html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
	if (imageMatch) {
		let imageUrl = imageMatch[1].trim();
		// Convert relative URLs to absolute
		if (imageUrl.startsWith("//")) {
			imageUrl = `https:${imageUrl}`;
		} else if (imageUrl.startsWith("/")) {
			try {
				const url = new URL(baseUrl);
				imageUrl = `${url.protocol}//${url.host}${imageUrl}`;
			} catch {
				// If baseUrl is invalid, keep original
			}
		} else if (!imageUrl.startsWith("http")) {
			try {
				const url = new URL(baseUrl);
				imageUrl = `${url.protocol}//${url.host}/${imageUrl}`;
			} catch {
				// If baseUrl is invalid, keep original
			}
		}
		metadata.image = imageUrl;
	}

	// Extract URL
	const urlMatch = html.match(
		/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i,
	);
	if (urlMatch) {
		metadata.url = urlMatch[1].trim();
	}

	return metadata;
}

/**
 * GET /api/metadata?url=...
 * Fetches metadata from a URL
 */
export async function GET(request: NextRequest): Promise<Response> {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url")?.trim();

		if (!url) {
			return Response.json({ error: "URL parameter is required" }, { status: 400 });
		}

		// Validate URL
		let targetUrl: URL;
		try {
			targetUrl = new URL(url);
		} catch {
			return Response.json({ error: "Invalid URL" }, { status: 400 });
		}

		// Only allow http and https
		if (!["http:", "https:"].includes(targetUrl.protocol)) {
			return Response.json(
				{ error: "Only HTTP and HTTPS URLs are allowed" },
				{ status: 400 },
			);
		}

		// Fetch the URL
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (compatible; MetadataBot/1.0; +https://yusuke-kim.com)",
				},
				redirect: "follow",
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				return Response.json(
					{ error: `Failed to fetch URL: ${response.statusText}` },
					{ status: response.status },
				);
			}

			const html = await response.text();
			const metadata = extractMetadata(html, url);

			// If no title found, try to get it from the URL
			if (!metadata.title) {
				try {
					metadata.title = targetUrl.hostname.replace(/^www\./, "");
				} catch {
					metadata.title = url;
				}
			}

			return Response.json(metadata, {
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
				},
			});
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				return Response.json({ error: "Request timeout" }, { status: 408 });
			}
			throw error;
		}
	} catch (error) {
		console.error("[Metadata API] Error:", error);
		return Response.json(
			{
				error: "Failed to fetch metadata",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

