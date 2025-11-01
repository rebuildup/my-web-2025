/**
 * WebGL Performance Monitoring API
 * Collects and stores WebGL performance metrics
 */

import { type NextRequest, NextResponse } from "next/server";
import { getProductionConfig } from "@/lib/config/production";
import { securityUtils } from "@/lib/utils/security";

interface WebGLMetric {
	fps: number;
	frameTime: number;
	memoryUsage: number;
	textureMemory: number;
	drawCalls: number;
	triangles: number;
	timestamp: number;
	url: string;
	userAgent?: string;
}

// Rate limiting for monitoring endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const windowMs = 60000; // 1 minute
	const maxRequests = 60; // 60 requests per minute

	const current = rateLimitMap.get(ip);

	if (!current || now > current.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
		return true;
	}

	if (current.count >= maxRequests) {
		return false;
	}

	current.count++;
	return true;
}

export async function POST(request: NextRequest) {
	try {
		const config = getProductionConfig();

		// Check if monitoring is enabled
		if (!config.monitoring.performance.enabled) {
			return NextResponse.json(
				{ error: "Performance monitoring is disabled" },
				{ status: 403 },
			);
		}

		// Rate limiting
		const ip =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		if (!checkRateLimit(ip)) {
			return NextResponse.json(
				{ error: "Rate limit exceeded" },
				{ status: 429 },
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const metric: WebGLMetric = {
			fps: Number(body.fps) || 0,
			frameTime: Number(body.frameTime) || 0,
			memoryUsage: Number(body.memoryUsage) || 0,
			textureMemory: Number(body.textureMemory) || 0,
			drawCalls: Number(body.drawCalls) || 0,
			triangles: Number(body.triangles) || 0,
			timestamp: Number(body.timestamp) || Date.now(),
			url: securityUtils.sanitizeUrl(body.url || ""),
			userAgent: body.userAgent?.substring(0, 500), // Limit length
		};

		// Validate metric values
		if (metric.fps < 0 || metric.fps > 240) {
			return NextResponse.json({ error: "Invalid FPS value" }, { status: 400 });
		}

		if (metric.memoryUsage < 0 || metric.memoryUsage > 8192) {
			// Max 8GB
			return NextResponse.json(
				{ error: "Invalid memory usage value" },
				{ status: 400 },
			);
		}

		// Store metric (in production, this would go to a database)
		await storeWebGLMetric(metric);

		// Check for performance issues
		const issues = analyzeWebGLPerformance(metric);

		return NextResponse.json({
			success: true,
			issues,
			recommendations: generateRecommendations(metric),
		});
	} catch (error) {
		console.error("WebGL monitoring error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * Store WebGL metric
 */
async function storeWebGLMetric(metric: WebGLMetric): Promise<void> {
	// In production, store to database
	// For now, just log to console in development
	if (process.env.NODE_ENV === "development") {
		console.log("WebGL Metric:", {
			fps: metric.fps,
			memory: `${metric.memoryUsage.toFixed(1)}MB`,
			frameTime: `${metric.frameTime.toFixed(1)}ms`,
		});
	}

	// Store to file system for now (in production, use proper database)
	try {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		const metricsDir = path.join(process.cwd(), "logs", "webgl");
		await fs.mkdir(metricsDir, { recursive: true });

		const today = new Date().toISOString().split("T")[0];
		const filePath = path.join(metricsDir, `webgl-${today}.jsonl`);

		const logEntry = `${JSON.stringify(metric)}\n`;
		await fs.appendFile(filePath, logEntry);
	} catch (error) {
		console.error("Failed to store WebGL metric:", error);
	}
}

/**
 * Analyze WebGL performance for issues
 */
function analyzeWebGLPerformance(metric: WebGLMetric): string[] {
	const issues: string[] = [];

	if (metric.fps < 30) {
		issues.push("Low FPS detected");
	}

	if (metric.frameTime > 33) {
		// > 33ms = < 30fps
		issues.push("High frame time");
	}

	if (metric.memoryUsage > 1024) {
		// > 1GB
		issues.push("High memory usage");
	}

	if (metric.textureMemory > 512) {
		// > 512MB
		issues.push("High texture memory usage");
	}

	return issues;
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(metric: WebGLMetric): string[] {
	const recommendations: string[] = [];

	if (metric.fps < 30) {
		recommendations.push("Consider reducing rendering quality");
		recommendations.push("Enable performance optimizations");
	}

	if (metric.memoryUsage > 1024) {
		recommendations.push("Optimize memory usage");
		recommendations.push("Consider texture compression");
	}

	if (metric.drawCalls > 1000) {
		recommendations.push("Reduce draw calls by batching");
	}

	return recommendations;
}

export async function GET() {
	return NextResponse.json({
		message: "WebGL Performance Monitoring API",
		endpoints: {
			POST: "Submit WebGL performance metrics",
		},
	});
}
