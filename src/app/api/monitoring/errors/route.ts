import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const errorData = await request.json();

		// Log error with structured format
		console.error("Application Error:", {
			timestamp: new Date().toISOString(),
			type: errorData.type || "unknown",
			error: errorData.error,
			url: errorData.url,
			userAgent: errorData.userAgent,
			stack: errorData.stack,
		});

		// In production, send to error tracking service
		// Example: await Sentry.captureException(errorData);
		// Example: await sendToDataDog(errorData);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error reporting failed:", error);
		return NextResponse.json(
			{ error: "Failed to report error" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	// Return error monitoring status
	return NextResponse.json({
		status: "monitoring",
		timestamp: new Date().toISOString(),
		errorReporting: "active",
	});
}
