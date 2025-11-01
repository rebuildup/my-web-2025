import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();

		// In production, you would send this to a monitoring service
		// For now, we'll just log it
		console.log("Performance Metric:", {
			timestamp: new Date().toISOString(),
			...data,
		});

		// You could also store in a database or send to external monitoring
		// Example: await sendToDataDog(data);
		// Example: await sendToSentry(data);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Performance monitoring error:", error);
		return NextResponse.json(
			{ error: "Failed to record performance metric" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	// Return current performance status
	return NextResponse.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: process.memoryUsage(),
	});
}
