import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getStatsSummary } from "@/lib/stats";
import { getContentStatistics } from "@/lib/data";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    filesystem: HealthCheckResult;
    dataFiles: HealthCheckResult;
    memory: HealthCheckResult;
    dependencies: HealthCheckResult;
  };
  metrics?: {
    totalContent: number;
    totalViews: number;
    totalDownloads: number;
    totalSearches: number;
  };
}

interface HealthCheckResult {
  status: "pass" | "fail" | "warn";
  message: string;
  duration?: number;
  details?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get("detailed") === "true";

  try {
    // Perform health checks
    const checks = await Promise.all([
      checkFilesystem(),
      checkDataFiles(),
      checkMemory(),
      checkDependencies(),
    ]);

    const [filesystem, dataFiles, memory, dependencies] = checks;

    // Determine overall status
    const hasFailures = checks.some((check) => check.status === "fail");
    const hasWarnings = checks.some((check) => check.status === "warn");

    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (hasFailures) {
      overallStatus = "unhealthy";
    } else if (hasWarnings) {
      overallStatus = "degraded";
    } else {
      overallStatus = "healthy";
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      checks: {
        filesystem,
        dataFiles,
        memory,
        dependencies,
      },
    };

    // Add detailed metrics if requested
    if (detailed) {
      try {
        const [stats, contentStats] = await Promise.all([
          getStatsSummary(),
          getContentStatistics(),
        ]);

        healthCheck.metrics = {
          totalContent: contentStats.totalItems,
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads,
          totalSearches: stats.totalSearches,
        };
      } catch (error) {
        console.warn("Failed to get detailed metrics:", error);
      }
    }

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === "healthy"
        ? 200
        : overallStatus === "degraded"
          ? 200
          : 503;

    // Set cache headers
    const headers = new Headers();
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Content-Type", "application/json");

    return NextResponse.json(healthCheck, {
      status: httpStatus,
      headers,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    const failedHealthCheck: HealthCheck = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      checks: {
        filesystem: { status: "fail", message: "Health check system failure" },
        dataFiles: { status: "fail", message: "Health check system failure" },
        memory: { status: "fail", message: "Health check system failure" },
        dependencies: {
          status: "fail",
          message: "Health check system failure",
        },
      },
    };

    return NextResponse.json(failedHealthCheck, { status: 503 });
  }
}

async function checkFilesystem(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Check if we can read/write to the data directory
    const dataDir = path.join(process.cwd(), "public/data");
    const testFile = path.join(dataDir, ".health-check");

    // Write test file
    await fs.writeFile(testFile, "health-check", "utf-8");

    // Read test file
    const content = await fs.readFile(testFile, "utf-8");

    // Clean up test file
    await fs.unlink(testFile);

    if (content !== "health-check") {
      throw new Error("File content mismatch");
    }

    return {
      status: "pass",
      message: "Filesystem read/write operations successful",
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Filesystem check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkDataFiles(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const dataDir = path.join(process.cwd(), "public/data");
    const requiredDirs = ["content", "stats", "cache"];
    const requiredFiles = [
      "content/portfolio.json",
      "content/blog.json",
      "content/plugin.json",
      "content/download.json",
      "content/tool.json",
      "content/profile.json",
      "stats/view-stats.json",
      "stats/download-stats.json",
      "stats/search-stats.json",
    ];

    // Check directories exist
    for (const dir of requiredDirs) {
      const dirPath = path.join(dataDir, dir);
      try {
        await fs.access(dirPath);
      } catch {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }

    // Check files exist (create if missing)
    const missingFiles: string[] = [];
    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      try {
        await fs.access(filePath);
      } catch {
        // Create missing file with empty array/object
        const defaultContent = file.includes("stats") ? "{}" : "[]";
        await fs.writeFile(filePath, defaultContent, "utf-8");
        missingFiles.push(file);
      }
    }

    const message =
      missingFiles.length > 0
        ? `Data files checked, created missing files: ${missingFiles.join(", ")}`
        : "All required data files present";

    return {
      status: missingFiles.length > 0 ? "warn" : "pass",
      message,
      duration: Date.now() - startTime,
      details: { missingFiles },
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Data files check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkMemory(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const memUsage = process.memoryUsage();
    const totalMemMB = Math.round(memUsage.rss / 1024 / 1024);
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    // Warning thresholds (adjust based on your deployment)
    const WARNING_THRESHOLD_MB = 512;
    const CRITICAL_THRESHOLD_MB = 1024;

    let status: "pass" | "warn" | "fail" = "pass";
    let message = `Memory usage: ${totalMemMB}MB RSS, ${heapUsedMB}MB/${heapTotalMB}MB heap`;

    if (totalMemMB > CRITICAL_THRESHOLD_MB) {
      status = "fail";
      message += " - CRITICAL: Memory usage too high";
    } else if (totalMemMB > WARNING_THRESHOLD_MB) {
      status = "warn";
      message += " - WARNING: High memory usage";
    }

    return {
      status,
      message,
      duration: Date.now() - startTime,
      details: {
        rss: totalMemMB,
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        external: Math.round(memUsage.external / 1024 / 1024),
      },
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Memory check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkDependencies(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Check if we're in a Node.js environment with basic functionality
    const hasNodeFeatures =
      typeof process !== "undefined" &&
      typeof process.version !== "undefined" &&
      typeof global !== "undefined";

    if (!hasNodeFeatures) {
      return {
        status: "fail",
        message: "Node.js environment not detected",
        duration: Date.now() - startTime,
      };
    }

    return {
      status: "pass",
      message: "Runtime environment check passed",
      duration: Date.now() - startTime,
      details: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Dependencies check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime,
    };
  }
}
