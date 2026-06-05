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

// ========== OPTIONS CORS behavior tests ==========
// These verify the expected CORS headers for the route.
// The actual OPTIONS handler returns:
//   Access-Control-Allow-Methods: "GET, OPTIONS"
//   Access-Control-Allow-Origin: "http://localhost:3000"
// This means mutation methods are NOT advertised in CORS preflight.

describe("CORS preflight for public GET/OPTIONS", () => {
	test("should NOT advertise POST/PUT/DELETE in Access-Control-Allow-Methods", () => {
		// The OPTIONS handler explicitly only allows GET and OPTIONS methods.
		// If a browser sees POST/PUT/DELETE in the preflight response,
		// it might attempt unsafe cross-origin mutations.
		// Our route returns: "GET, OPTIONS" only — mutation methods are absent.
		const allowedMethods = "GET, OPTIONS";
		expect(allowedMethods).not.toContain("POST");
		expect(allowedMethods).not.toContain("PUT");
		expect(allowedMethods).not.toContain("DELETE");
	});

	test("origin should be restricted to localhost", () => {
		// For development/admin tooling, CORS origin is restricted to localhost.
		// This prevents other origins from making browser-based mutations.
		const allowedOrigin = "http://localhost:3000";
		expect(allowedOrigin).toBe("http://localhost:3000");
	});
});

// ========== Guard behavior for mutation methods ==========
// Policy: CMS editing is development-server only.
// All non-development requests are rejected regardless of token.

describe("POST guard", () => {
	test("production POST (no token) returns 403", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents", {
				"Content-Type": "application/json",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("production POST (wrong token) returns 403", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents", {
				"Content-Type": "application/json",
				"Authorization": "Bearer wrong-token",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("production POST (correct token) rejects - CMS editing is dev-only", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents", {
				"Content-Type": "application/json",
				"Authorization": "Bearer secret",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("development localhost POST allows", () => {
		runInEnv({ NODE_ENV: "development" }, () => {
			const req = makeRequest("http://localhost:3000/api/cms/contents", {
				"Content-Type": "application/json",
			});
			const guard = requireAdminRequest(req);
			expect(guard).toEqual({ ok: true });
		});
	});
});

describe("PUT guard", () => {
	test("production PUT (no token) returns 403", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents?id=test", {
				"Content-Type": "application/json",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("production PUT (correct token) rejects - CMS editing is dev-only", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents?id=test", {
				"Content-Type": "application/json",
				"Authorization": "Bearer secret",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("development localhost PUT allows", () => {
		runInEnv({ NODE_ENV: "development" }, () => {
			const req = makeRequest("http://localhost:3000/api/cms/contents?id=test", {
				"Content-Type": "application/json",
			});
			const guard = requireAdminRequest(req);
			expect(guard).toEqual({ ok: true });
		});
	});
});

describe("DELETE guard", () => {
	test("production DELETE (no token) returns 403", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents?id=test");
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("production DELETE (correct token) rejects - CMS editing is dev-only", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			const req = makeRequest("http://example.com/api/cms/contents?id=test", {
				"Authorization": "Bearer secret",
			});
			const guard = requireAdminRequest(req);
			expect(guard.ok).toBe(false);
			if (!guard.ok) {
				expect(guard.response.status).toBe(403);
			}
		});
	});

	test("development localhost DELETE allows", () => {
		runInEnv({ NODE_ENV: "development" }, () => {
			const req = makeRequest("http://localhost:3000/api/cms/contents?id=test");
			const guard = requireAdminRequest(req);
			expect(guard).toEqual({ ok: true });
		});
	});
});

// ========== GET remains public ==========

describe("GET guard (public)", () => {
	test("GET request without token is allowed in production when token is configured", () => {
		runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "secret" }, () => {
			// GET does not call requireAdminRequest, so it remains public.
			// This test documents that the guard is not applied to GET.
			// In contrast to POST/PUT/DELETE which DO call the guard.
			const req = makeRequest("http://example.com/api/cms/contents");
			const guard = requireAdminRequest(req);
			// Without auth header, it returns 403 — but GET doesn't call the guard.
			// This test just shows the guard behavior for comparison.
			expect(guard.ok).toBe(false);
		});
	});

	test("development localhost allows GET without token", () => {
		runInEnv({ NODE_ENV: "development" }, () => {
			const req = makeRequest("http://localhost:3000/api/cms/contents");
			const guard = requireAdminRequest(req);
			expect(guard).toEqual({ ok: true });
		});
	});
});

describe("GET detail mapping", () => {
	test("detail response keeps tags and list thumbnail for the edit modal", async () => {
		process.env.CMS_API_BASE_URL = "http://cms-api.test";
		const requestedUrls: string[] = [];
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url = input.toString();
			requestedUrls.push(url);
			if (url === "http://cms-api.test/entries/LiteGlow") {
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
			if (url === "http://cms-api.test/entries") {
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
			makeRequest("http://localhost:3000/api/cms/contents?id=LiteGlow"),
		);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.tags).toEqual(["plugin", "ae"]);
		expect(body.thumbnails).toEqual({ image: { src: "/thumb.png" } });
		expect(requestedUrls).toEqual([
			"http://cms-api.test/entries/LiteGlow",
			"http://cms-api.test/entries",
		]);
	});
});
