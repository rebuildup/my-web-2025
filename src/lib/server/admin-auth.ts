import { type NextRequest, NextResponse } from "next/server";

export type AdminGuardResult =
	| { ok: true }
	| { ok: false; response: NextResponse };

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Check if a request is from localhost (development machine).
 */
export function isLocalDevelopmentRequest(
	request: Request | NextRequest,
): boolean {
	const hostname = new URL(request.url).hostname;
	return LOCALHOST_HOSTNAMES.has(hostname);
}

/**
 * Verify the admin authorization for a CMS mutation request.
 *
 * Policy: CMS content editing is development-server only.
 * Allows localhost development requests without a token.
 * Rejects all non-development requests regardless of token.
 */
export function requireAdminRequest(
	request: Request | NextRequest,
): AdminGuardResult {
	const isDevelopment = process.env.NODE_ENV === "development";

	// Only allow localhost development requests.
	if (isDevelopment && isLocalDevelopmentRequest(request)) {
		return { ok: true };
	}

	// All non-development requests are rejected.
	// CMS editing is development-server only, not available in production.
	return {
		ok: false,
		response: NextResponse.json(
			{ error: "CMS editing is only available in development" },
			{ status: 403 },
		),
	};
}
