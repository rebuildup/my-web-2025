import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { isLocalDevelopmentRequest, requireAdminRequest } from "../admin-auth";

// Test helpers
function makeRequest(
	url: string,
	headers: Record<string, string> = {},
): NextRequest {
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

test("development localhost allows", () => {
	runInEnv({ NODE_ENV: "development" }, () => {
		const req = makeRequest("http://localhost:3000/api/cms/contents");
		const result = requireAdminRequest(req);
		expect(result).toEqual({ ok: true });
	});
});

test("development 127.0.0.1 allows", () => {
	runInEnv({ NODE_ENV: "development" }, () => {
		const req = makeRequest("http://127.0.0.1:3000/api/cms/contents");
		const result = requireAdminRequest(req);
		expect(result).toEqual({ ok: true });
	});
});

test("development ::1 (IPv6 localhost) allows", () => {
	runInEnv({ NODE_ENV: "development" }, () => {
		const req = makeRequest("http://[::1]:3000/api/cms/contents");
		const result = requireAdminRequest(req);
		expect(result).toEqual({ ok: true });
	});
});

test("development localhost with bearer token allows", () => {
	runInEnv({ NODE_ENV: "development", ADMIN_API_TOKEN: "test-secret" }, () => {
		const req = makeRequest("http://localhost:3000/api/cms/contents", {
			Authorization: "Bearer test-secret",
		});
		const result = requireAdminRequest(req);
		expect(result).toEqual({ ok: true });
	});
});

test("development non-localhost without token rejects", () => {
	runInEnv({ NODE_ENV: "development" }, () => {
		const req = makeRequest("http://example.com/api/cms/contents");
		const result = requireAdminRequest(req);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.response.status).toBe(403);
		}
	});
});

test("production localhost with correct bearer rejects", () => {
	runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "test-secret" }, () => {
		const req = makeRequest("http://localhost:3000/api/cms/contents", {
			Authorization: "Bearer test-secret",
		});
		const result = requireAdminRequest(req);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.response.status).toBe(403);
		}
	});
});

test("production localhost without bearer rejects", () => {
	runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "test-secret" }, () => {
		const req = makeRequest("http://localhost:3000/api/cms/contents");
		const result = requireAdminRequest(req);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.response.status).toBe(403);
		}
	});
});

test("production example.com with bearer rejects", () => {
	runInEnv({ NODE_ENV: "production", ADMIN_API_TOKEN: "test-secret" }, () => {
		const req = makeRequest("http://example.com/api/cms/contents", {
			Authorization: "Bearer test-secret",
		});
		const result = requireAdminRequest(req);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.response.status).toBe(403);
		}
	});
});

test("isLocalDevelopmentRequest detects localhost hostname", () => {
	const reqLocalhost = makeRequest("http://localhost:3000/api");
	expect(isLocalDevelopmentRequest(reqLocalhost)).toBe(true);

	const req127 = makeRequest("http://127.0.0.1:3000/api");
	expect(isLocalDevelopmentRequest(req127)).toBe(true);

	const reqIPv6 = makeRequest("http://[::1]:3000/api");
	expect(isLocalDevelopmentRequest(reqIPv6)).toBe(true);
});

test("isLocalDevelopmentRequest returns false for non-localhost", () => {
	const req = makeRequest("http://example.com:3000/api");
	expect(isLocalDevelopmentRequest(req)).toBe(false);
});
