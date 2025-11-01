import { NextResponse } from "next/server";

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

// System status information
function getSystemStatus() {
	return {
		environment: process.env.NODE_ENV || "unknown",
		nodeVersion: process.version,
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		platform: process.platform,
		arch: process.arch,
		memoryUsage: process.memoryUsage(),
		isDevelopment: isDevelopment(),
	};
}

export async function GET() {
	// Only allow access in development environment
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Admin API is only available in development environment" },
			{ status: 403 },
		);
	}

	try {
		const status = getSystemStatus();

		return NextResponse.json({
			success: true,
			data: status,
		});
	} catch (error) {
		console.error("Error getting system status:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to get system status",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// Health check endpoint
export async function HEAD() {
	if (!isDevelopment()) {
		return new NextResponse(null, { status: 403 });
	}

	return new NextResponse(null, { status: 200 });
}
