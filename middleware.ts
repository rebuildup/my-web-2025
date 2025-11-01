import { type NextRequest, NextResponse } from "next/server";

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

// Check if request is from localhost
function isLocalhost(request: NextRequest) {
	const hostname = request.nextUrl.hostname;
	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
	);
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Handle image requests with proper headers
	if (pathname.startsWith("/images/")) {
		const response = NextResponse.next();

		// Set proper CORS headers for images
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET");
		response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

		// Set proper cache headers based on environment
		if (process.env.NODE_ENV === "production") {
			response.headers.set(
				"Cache-Control",
				"public, max-age=86400, stale-while-revalidate=31536000",
			);
		} else {
			response.headers.set("Cache-Control", "no-cache");
		}

		return response;
	}

	// Admin panel access control
	if (pathname.startsWith("/admin")) {
		// Block access if not in development environment
		if (!isDevelopment()) {
			console.warn(`Admin access blocked: Not in development environment`);
			return NextResponse.redirect(new URL("/", request.url));
		}

		// Block access if not from localhost (additional security)
		if (!isLocalhost(request)) {
			console.warn(
				`Admin access blocked: Not from localhost (${request.nextUrl.hostname})`,
			);
			return NextResponse.redirect(new URL("/", request.url));
		}

		// Add security headers for admin pages
		const response = NextResponse.next();

		// Prevent caching of admin pages
		response.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, proxy-revalidate",
		);
		response.headers.set("Pragma", "no-cache");
		response.headers.set("Expires", "0");

		// Additional security headers
		response.headers.set(
			"X-Robots-Tag",
			"noindex, nofollow, noarchive, nosnippet",
		);
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-Content-Type-Options", "nosniff");

		return response;
	}

	// Admin API access control
	if (pathname.startsWith("/api/admin")) {
		// Block access if not in development environment
		if (!isDevelopment()) {
			return NextResponse.json(
				{ error: "Admin API is only available in development environment" },
				{ status: 403 },
			);
		}

		// Block access if not from localhost
		if (!isLocalhost(request)) {
			return NextResponse.json(
				{ error: "Admin API is only accessible from localhost" },
				{ status: 403 },
			);
		}

		// Add CORS headers for admin API
		const response = NextResponse.next();
		response.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);

		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/api/admin/:path*", "/images/:path*"],
};
