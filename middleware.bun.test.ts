import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function makeRequest(url: string, headers: Record<string, string> = {}) {
	return new NextRequest(url, {
		headers: new Headers(headers),
	});
}

describe("subdomain redirects", () => {
	test("redirects links subdomain from forwarded Host header", () => {
		const request = makeRequest("http://127.0.0.1:3010/", {
			"x-forwarded-host": "links.yusuke-kim.com",
		});

		const response = middleware(request);

		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe(
			"http://links.yusuke-kim.com/about/links",
		);
	});

	test("keeps forwarded https protocol for subdomain redirects", () => {
		const request = makeRequest("http://127.0.0.1:3010/?ref=test", {
			"x-forwarded-host": "links.yusuke-kim.com",
			"x-forwarded-proto": "https",
		});

		const response = middleware(request);

		expect(response.status).toBe(301);
		expect(response.headers.get("location")).toBe(
			"https://links.yusuke-kim.com/about/links?ref=test",
		);
	});
});
