// Unit tests for the Workers router. We test the pure routing rules
// (subdomain rewrite map + STATIC_API_PATHS regex) directly without
// the Cloudflare runtime. Integration tests run against the deployed
// staging URL via Playwright (see Task 23 in the Cloudflare deploy plan).
import { describe, it, expect } from "vitest";

// Mirror of SUBDOMAIN_REDIRECT in src/index.ts. Kept in sync manually;
// integration tests assert the deployed behavior matches.
const SUBDOMAIN_REDIRECT: Record<string, string> = {
	"links.yusuke-kim.com": "/about/links/",
	"portfolio.yusuke-kim.com": "/portfolio/",
	"www.yusuke-kim.com": "/",
	"pomodoro.yusuke-kim.com": "/tools/pomodoro/",
	"prototype.yusuke-kim.com": "/tools/prototype/",
	"samuido.yusuke-kim.com": "/about/profile/handle/",
	"361do.yusuke-kim.com": "/about/profile/handle/",
};

// Mirrors the nginx location-regex used to detect static-API path
// collisions. The static page must win; the Container is the fallback.
const STATIC_API_PATHS = /^\/(entries|markdown|media|tags|search|preview|health)/;

describe("subdomain rewrite map", () => {
	it.each([
		["links.yusuke-kim.com", "/about/links/"],
		["portfolio.yusuke-kim.com", "/portfolio/"],
		["www.yusuke-kim.com", "/"],
		["pomodoro.yusuke-kim.com", "/tools/pomodoro/"],
		["prototype.yusuke-kim.com", "/tools/prototype/"],
		["samuido.yusuke-kim.com", "/about/profile/handle/"],
		["361do.yusuke-kim.com", "/about/profile/handle/"],
	])("%s on / redirects to %s", (host, target) => {
		expect(SUBDOMAIN_REDIRECT[host]).toBe(target);
	});

	it("yusuke-kim.com apex has no rewrite entry", () => {
		expect(SUBDOMAIN_REDIRECT["yusuke-kim.com"]).toBeUndefined();
	});
});

describe("STATIC_API_PATHS regex", () => {
	it.each([
		"/search?q=x",
		"/media/foo.jpg",
		"/entries?limit=5",
		"/markdown/post-1",
		"/tags/javascript",
		"/preview/123",
		"/health",
	])("matches %s", (path) => {
		expect(STATIC_API_PATHS.test(path)).toBe(true);
	});

	it.each(["/about", "/portfolio", "/", "/api/search", "/api/cms/health"])(
		"does not match %s",
		(path) => {
			expect(STATIC_API_PATHS.test(path)).toBe(false);
		},
	);
});