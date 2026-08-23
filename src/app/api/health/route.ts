export const dynamic = "force-static";
/**
 * Production Health Check API
 * Provides system health status for monitoring
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProductionConfig } from "@/lib/config/production";
import { getProductionStatus } from "@/lib/init/production";

interface HealthCheck {
	status: "healthy" | "degraded" | "unhealthy";
	timestamp: string;
	version: string;
	environment: string;
	uptime: number;
	checks: {
		[key: string]: {
			status: "pass" | "fail" | "warn";
			message?: string;
			duration?: number;
		};
	};
}

const REQUIRED_ENV_VARS = ["NEXT_PUBLIC_SITE_URL"] as const;
const LOGS_DIR = path.join(process.cwd(), "logs");
const ERROR_LOGS_DIR = path.join(LOGS_DIR, "errors");
const PERF_LOGS_DIR = path.join(LOGS_DIR, "performance");
const PACKAGE_JSON_PATH = "package.json";

async function resolveLogSize(): Promise<number> {
	try {
		const [errorFiles, perfFiles] = await Promise.all([
			fs.readdir(ERROR_LOGS_DIR),
			fs.readdir(PERF_LOGS_DIR),
		]);
		const errorSet = new Set(errorFiles);
		const allPaths = [
			...errorFiles.map((file) => path.join(ERROR_LOGS_DIR, file)),
			...perfFiles
				.filter((file) => !errorSet.has(file))
				.map((file) => path.join(PERF_LOGS_DIR, file)),
		];
		const stats = await Promise.all(allPaths.map((filePath) => fs.stat(filePath)));
		return stats.reduce((sum, s) => sum + s.size, 0);
	} catch {
		return 0;
	}
}

export async function GET() {
	const startTime = Date.now();
	const config = getProductionConfig();
	const productionStatus = getProductionStatus();

	const healthCheck: HealthCheck = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		version: productionStatus.version,
		environment: productionStatus.environment,
		uptime: process.uptime(),
		checks: {},
	};

	// Check file system access
	try {
		await fs.access(PACKAGE_JSON_PATH);
		healthCheck.checks.filesystem = { status: "pass" };
	} catch {
		healthCheck.checks.filesystem = {
			status: "fail",
			message: "Cannot access file system",
		};
		healthCheck.status = "unhealthy";
	}

	// Check environment configuration
	try {
		const missing = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

		if (missing.length > 0) {
			healthCheck.checks.environment = {
				status: "fail",
				message: `Missing environment variables: ${missing.join(", ")}`,
			};
			healthCheck.status = "unhealthy";
		} else {
			healthCheck.checks.environment = { status: "pass" };
		}
	} catch {
		healthCheck.checks.environment = {
			status: "fail",
			message: "Environment check failed",
		};
		healthCheck.status = "unhealthy";
	}

	// Check monitoring services
	if (config.monitoring.sentry.enabled) {
		healthCheck.checks.sentry = config.monitoring.sentry.dsn
			? { status: "pass" }
			: { status: "warn", message: "Sentry enabled but DSN not configured" };
	}

	if (config.monitoring.analytics.enabled) {
		healthCheck.checks.analytics = config.monitoring.analytics.gaId
			? { status: "pass" }
			: {
					status: "warn",
					message: "Analytics enabled but GA ID not configured",
				};
	}

	// Check security configuration
	healthCheck.checks.security = {
		status:
			config.security.csp.enabled && config.security.hsts.enabled
				? "pass"
				: "warn",
		message:
			config.security.csp.enabled && config.security.hsts.enabled
				? undefined
				: "Some security features are disabled",
	};

	// Check WebGL configuration
	healthCheck.checks.webgl = {
		status: config.webgl.debug ? "warn" : "pass",
		message: config.webgl.debug ? "WebGL debug mode is enabled" : undefined,
	};

	// Check memory usage
	if (process.memoryUsage) {
		const memUsage = process.memoryUsage();
		const memUsageMB = memUsage.heapUsed / 1024 / 1024;

		healthCheck.checks.memory = {
			status: memUsageMB > 512 ? "warn" : "pass",
			message: `Memory usage: ${memUsageMB.toFixed(1)}MB`,
		};
	}

	// Check logs directory
	try {
		await fs.access(LOGS_DIR);
		const totalLogSize = await resolveLogSize();
		const logSizeMB = totalLogSize / 1024 / 1024;

		healthCheck.checks.logs = {
			status: logSizeMB > 100 ? "warn" : "pass",
			message: `Log size: ${logSizeMB.toFixed(1)}MB`,
		};
	} catch {
		healthCheck.checks.logs = {
			status: "warn",
			message: "Logs directory not accessible",
		};
	}

	// Calculate overall status
	const failedChecks = Object.values(healthCheck.checks).filter(
		(check) => check.status === "fail",
	);
	const warnChecks = Object.values(healthCheck.checks).filter(
		(check) => check.status === "warn",
	);

	if (failedChecks.length > 0) {
		healthCheck.status = "unhealthy";
	} else if (warnChecks.length > 0) {
		healthCheck.status = "degraded";
	}

	// Add response time
	const responseTime = Date.now() - startTime;
	healthCheck.checks.responseTime = {
		status: responseTime > 1000 ? "warn" : "pass",
		duration: responseTime,
	};

	// Set appropriate HTTP status
	const httpStatus =
		healthCheck.status === "healthy"
			? 200
			: healthCheck.status === "degraded"
				? 200
				: 503;

	return NextResponse.json(healthCheck, { status: httpStatus });
}

export async function HEAD() {
	// Simple health check for load balancers
	return new NextResponse(null, { status: 200 });
}
