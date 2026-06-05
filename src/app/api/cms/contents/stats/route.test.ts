import { afterEach, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

afterEach(() => {
	globalThis.fetch = originalFetch;
	process.env = { ...originalEnv };
});

test("stats fetches entries from Rust API even when CMS_USE_RUST_API is unset", async () => {
	delete process.env.CMS_USE_RUST_API;
	process.env.CMS_API_BASE_URL = "http://cms-api.test";

	const requestedUrls: string[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url = input.toString();
		requestedUrls.push(url);
		if (url === "http://cms-api.test/entries") {
			return Response.json([
				{
					id: "LiteGlow",
					entry_type: "portfolio",
					status: "published",
					visibility: "public",
					title: "LiteGlow",
					summary: null,
					lang: "ja",
					published_at: null,
					created_at: "2026-01-01T00:00:00.000Z",
					updated_at: "2026-01-01T00:00:00.000Z",
					slug: "LiteGlow",
					thumbnail: null,
					tags: null,
				},
			]);
		}

		return Response.json({ error: "unexpected url" }, { status: 500 });
	}) as typeof fetch;

	const { GET } = await import("./route");
	const response = await GET();
	const body = await response.json();

	expect(response.status).toBe(200);
	expect(body.totalContents).toBe(1);
	expect(body.contentsList[0]).toMatchObject({
		id: "LiteGlow",
		title: "LiteGlow",
		dbFile: "cms-api-dev.db",
	});
	expect(requestedUrls).toEqual(["http://cms-api.test/entries"]);
});
