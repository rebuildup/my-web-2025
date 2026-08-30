import { afterEach, expect, test, describe, mock } from "bun:test";
import { NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/server/admin-auth";

mock.module("server-only", () => ({}));

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

afterEach(() => {
	globalThis.fetch = originalFetch;
	process.env = { ...originalEnv };
});

function makeRequest(url: string, headers: Record<string, string> = {}): NextRequest {
	return new NextRequest(url, {
		headers: new Headers(headers),
	});
}

function runInEnv(env: Record<string, string | undefined>, fn: () => void) {
	const original = { ...process.env };
	for (const [key, val] of Object.entries(env)) {
		process.env[key] = val;
	}
	try {
		fn();
	} finally {
		process.env = original;
	}
}

async function params(id: string): Promise<{ id: string }> {
	return { id };
}

// ========== GET detail mapping (path-based) ==========
// These verify the detail endpoint populates the admin edit modal fields
// (assets, links, seo, relations, searchable, ext, thumbnails) by merging the
// Rust API result with the local SQLite fallback. Path-based routing is
// required because force-static + output:export drops query strings.

describe("GET detail (path-based)", () => {
	test("detail response keeps tags and list thumbnail for the edit modal", async () => {
		process.env.CMS_API_BASE_URL = "http://cms-api.test";
		process.env.CMS_USE_RUST_API = "1";
		const requestedUrls: string[] = [];
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url = input.toString();
			requestedUrls.push(url);
			if (url === "http://cms-api.test/api/entries/LiteGlow") {
				return Response.json({
					id: "LiteGlow",
					entry_type: "portfolio",
					status: "published",
					visibility: "public",
					title: "LiteGlow",
					summary: "summary",
					lang: "ja",
					path: null,
					depth: 0,
					order: 0,
					parent_id: null,
					published_at: null,
					created_at: "2026-01-01T00:00:00.000Z",
					updated_at: "2026-01-01T00:00:00.000Z",
					slug: "LiteGlow",
					public_url: null,
					thumbnails: null,
					assets: [],
					links: [],
					searchable: null,
					seo: null,
					relations: null,
					ext: { type: "portfolio", slug: "LiteGlow" },
				});
			}
			if (url === "http://cms-api.test/api/entries") {
				return Response.json([
					{
						id: "LiteGlow",
						entry_type: "portfolio",
						status: "published",
						visibility: "public",
						title: "LiteGlow",
						summary: "summary",
						lang: "ja",
						published_at: null,
						created_at: "2026-01-01T00:00:00.000Z",
						updated_at: "2026-01-01T00:00:00.000Z",
						slug: "LiteGlow",
						thumbnail: "/thumb.png",
						tags: "plugin, ae",
					},
				]);
			}
			return Response.json({ error: "unexpected url" }, { status: 500 });
		}) as typeof fetch;

		const { GET } = await import("./route");
		const response = await GET(
			makeRequest("http://localhost:3000/api/cms/contents/LiteGlow"),
			{ params: params("LiteGlow") },
		);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.tags).toEqual(["plugin", "ae"]);
		expect(body.thumbnails).toEqual({ image: { src: "/thumb.png" } });
		expect(requestedUrls).toEqual([
			"http://cms-api.test/api/entries/LiteGlow",
			"http://cms-api.test/api/entries",
		]);
	});

	test("enriches Rust API detail with local SQLite metadata when Rust returns null fields", async () => {
		process.env.CMS_API_BASE_URL = "http://cms-api.test";
		process.env.CMS_USE_RUST_API = "1";

		mock.module("@/cms/lib/content-db-manager", () => ({
			getFullContentById: (id: string) => {
				if (id !== "Migrated") return null;
				return {
					id: "Migrated",
					title: "Migrated",
					summary: "local summary",
					lang: "ja",
					status: "published",
					visibility: "public",
					path: "/workshop/blog/migrated",
					depth: 2,
					order: 5,
					parentId: "blog",
					publishedAt: "2026-02-01T00:00:00.000Z",
					createdAt: "2026-02-01T00:00:00.000Z",
					updatedAt: "2026-02-02T00:00:00.000Z",
					thumbnails: { image: { src: "/local-thumb.png" } },
					assets: [
						{
							kind: "image",
							src: "/local-asset.png",
							alt: "local asset",
						},
					],
					links: [
						{ href: "https://example.com", label: "Example" },
					],
					searchable: { fullText: "local full text body" },
					seo: { title: "Local SEO title", description: "Local SEO desc" },
					relations: { parent: "blog" },
					ext: { type: "blog", slug: "migrated", legacy: "value" },
				};
			},
			deleteContentDb: () => true,
		}));

		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url = input.toString();
			if (url === "http://cms-api.test/api/entries/Migrated") {
				return Response.json({
					id: "Migrated",
					entry_type: "blog",
					status: "published",
					visibility: "public",
					title: "Migrated",
					summary: null,
					lang: "ja",
					path: "/workshop/blog/migrated",
					depth: 2,
					order: 5,
					parent_id: "blog",
					published_at: "2026-02-01T00:00:00.000Z",
					created_at: "2026-02-01T00:00:00.000Z",
					updated_at: "2026-02-02T00:00:00.000Z",
					slug: "migrated",
					public_url: null,
					thumbnails: null,
					assets: null,
					links: null,
					searchable: null,
					seo: null,
					relations: null,
					ext: null,
				});
			}
			if (url === "http://cms-api.test/api/entries") {
				return Response.json([
					{
						id: "Migrated",
						entry_type: "blog",
						status: "published",
						visibility: "public",
						title: "Migrated",
						summary: null,
						lang: "ja",
						published_at: "2026-02-01T00:00:00.000Z",
						created_at: "2026-02-01T00:00:00.000Z",
						updated_at: "2026-02-02T00:00:00.000Z",
						slug: "migrated",
						thumbnail: null,
						tags: null,
					},
				]);
			}
			return Response.json({ error: "unexpected url" }, { status: 500 });
		}) as typeof fetch;

		const { GET } = await import("./route");
		const response = await GET(
			makeRequest("http://localhost:3000/api/cms/contents/Migrated"),
			{ params: params("Migrated") },
		);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.id).toBe("Migrated");
		expect(body.title).toBe("Migrated");
		expect(body.path).toBe("/workshop/blog/migrated");
		expect(body.thumbnails).toEqual({ image: { src: "/local-thumb.png" } });
		expect(body.assets).toHaveLength(1);
		expect(body.assets[0].src).toBe("/local-asset.png");
		expect(body.links).toHaveLength(1);
		expect(body.links[0].href).toBe("https://example.com");
		expect(body.searchable).toEqual({ fullText: "local full text body" });
		expect(body.seo).toEqual({
			title: "Local SEO title",
			description: "Local SEO desc",
		});
		expect(body.relations).toEqual({ parent: "blog" });
		expect(body.ext).toMatchObject({
			type: "blog",
			slug: "migrated",
			legacy: "value",
		});
	});

	test("falls back to local SQLite when Rust API is not configured", async () => {
		process.env.CMS_USE_RUST_API = "0";

		mock.module("@/cms/lib/content-db-manager", () => ({
			getFullContentById: (id: string) => {
				if (id !== "LocalOnly") return null;
				return {
					id: "LocalOnly",
					title: "LocalOnly",
					summary: "summary",
					lang: "ja",
					status: "published",
					visibility: "public",
					assets: [
						{ kind: "image", src: "/a.png", alt: "a" },
					],
					links: [{ href: "https://example.com", label: "ex" }],
					searchable: { fullText: "body" },
					seo: { title: "t", description: "d" },
					relations: { parent: "root" },
					ext: { type: "portfolio", slug: "LocalOnly" },
					thumbnails: { image: { src: "/thumb.png" } },
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
					depth: 0,
					order: 0,
				} as ReturnType<typeof import("@/cms/lib/content-db-manager").getFullContentById>;
			},
			deleteContentDb: () => true,
		}));

		const { GET } = await import("./route");
		const response = await GET(
			makeRequest("http://localhost:3000/api/cms/contents/LocalOnly"),
			{ params: params("LocalOnly") },
		);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.id).toBe("LocalOnly");
		expect(body.assets).toHaveLength(1);
		expect(body.thumbnails).toEqual({ image: { src: "/thumb.png" } });
	});

	test("returns 404 when content does not exist", async () => {
		process.env.CMS_USE_RUST_API = "0";

		mock.module("@/cms/lib/content-db-manager", () => ({
			getFullContentById: () => null,
			deleteContentDb: () => false,
		}));

		const { GET } = await import("./route");
		const response = await GET(
			makeRequest("http://localhost:3000/api/cms/contents/Missing"),
			{ params: params("Missing") },
		);
		expect(response.status).toBe(404);
	});
});

// ========== generateStaticParams ==========
// With output:export, every dynamic route needs to enumerate params at build
// time. Verify the helper reads data/contents/ and returns the expected shape.

describe("generateStaticParams", () => {
	test("returns content IDs derived from data/contents/content-*.db filenames", () => {
		const { generateStaticParams } = require("./route") as {
			generateStaticParams: () => Array<{ id: string }>;
		};
		const params = generateStaticParams();
		expect(Array.isArray(params)).toBe(true);
		// Each item should be { id: string } with no .db suffix.
		for (const p of params) {
			expect(typeof p.id).toBe("string");
			expect(p.id).not.toContain(".db");
		}
	});
});

// ========== DELETE guard ==========
// Same dev-only guard as route.ts: production rejects regardless of token.

describe("DELETE guard", () => {
	test("production DELETE (no token) returns 403", async () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest(
				"http://example.com/api/cms/contents/test/",
			);
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("development localhost DELETE allows", () => {
		runInEnv({ NODE_ENV: "development" }, () => {
			const req = makeRequest(
				"http://localhost:3000/api/cms/contents/test/",
			);
			const guard = requireAdminRequest(req);
			expect(guard).toEqual({ ok: true });
		});
	});
});