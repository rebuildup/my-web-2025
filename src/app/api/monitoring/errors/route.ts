/**
 * API endpoint for error monitoring
 * Receives and stores error reports from the client
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
  category: "javascript" | "network" | "performance" | "user" | "system";
  resolved: boolean;
}

const ERRORS_DIR = path.join(
  process.cwd(),
  "public",
  "data",
  "monitoring",
  "errors",
);
const MAX_ERRORS_PER_FILE = 1000;

/**
 * Ensure monitoring directory exists
 */
async function ensureMonitoringDir(): Promise<void> {
  if (!existsSync(ERRORS_DIR)) {
    await mkdir(ERRORS_DIR, { recursive: true });
  }
}

/**
 * Get current error log file path
 */
function getCurrentErrorLogPath(): string {
  const today = new Date().toISOString().split("T")[0];
  return path.join(ERRORS_DIR, `errors-${today}.json`);
}

/**
 * Load existing errors from file
 */
async function loadExistingErrors(): Promise<ErrorReport[]> {
  const filePath = getCurrentErrorLogPath();

  try {
    if (existsSync(filePath)) {
      const content = await readFile(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to load existing errors:", error);
  }

  return [];
}

/**
 * Save errors to file
 */
async function saveErrors(errors: ErrorReport[]): Promise<void> {
  const filePath = getCurrentErrorLogPath();

  try {
    await writeFile(filePath, JSON.stringify(errors, null, 2));
  } catch (error) {
    console.error("Failed to save errors:", error);
    throw error;
  }
}

/**
 * Validate error report
 */
function validateErrorReport(data: unknown): data is ErrorReport {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).id === "string" &&
    typeof (data as Record<string, unknown>).timestamp === "string" &&
    typeof (data as Record<string, unknown>).message === "string" &&
    typeof (data as Record<string, unknown>).url === "string" &&
    typeof (data as Record<string, unknown>).userAgent === "string" &&
    ["low", "medium", "high", "critical"].includes(
      (data as Record<string, unknown>).severity as string,
    ) &&
    ["javascript", "network", "performance", "user", "system"].includes(
      (data as Record<string, unknown>).category as string,
    ) &&
    typeof (data as Record<string, unknown>).resolved === "boolean"
  );
}

/**
 * Check if error should be rate limited
 */
function shouldRateLimit(
  errors: ErrorReport[],
  newError: ErrorReport,
): boolean {
  const recentErrors = errors.filter((error) => {
    const errorTime = new Date(error.timestamp).getTime();
    const now = Date.now();
    return now - errorTime < 60000; // Last minute
  });

  // Rate limit: max 10 errors per minute from same session
  const sessionErrors = recentErrors.filter(
    (error) => error.sessionId === newError.sessionId,
  );

  if (sessionErrors.length >= 10) {
    return true;
  }

  // Rate limit: max 5 identical errors per minute
  const identicalErrors = recentErrors.filter(
    (error) => error.message === newError.message && error.url === newError.url,
  );

  return identicalErrors.length >= 5;
}

/**
 * Send critical error alert
 */
async function sendCriticalAlert(error: ErrorReport): Promise<void> {
  if (error.severity !== "critical") return;

  try {
    // In a real implementation, you would send this to your alerting system
    // For now, we'll just log it
    console.error("CRITICAL ERROR ALERT:", {
      id: error.id,
      message: error.message,
      url: error.url,
      timestamp: error.timestamp,
    });

    // You could integrate with services like:
    // - Slack webhook
    // - Email service
    // - PagerDuty
    // - Discord webhook
  } catch (alertError) {
    console.error("Failed to send critical alert:", alertError);
  }
}

/**
 * POST /api/monitoring/errors
 * Store error report
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      const userAgent = request.headers.get("user-agent") || "";
      const isPlaywrightTest =
        userAgent.includes("Playwright") ||
        process.env.PLAYWRIGHT_TEST === "true";

      if (process.env.NODE_ENV !== "test" && !isPlaywrightTest) {
        console.warn("Invalid JSON in error monitoring request:", jsonError);
      }
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 },
      );
    }

    // Validate data exists
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Validate error report
    if (!validateErrorReport(data)) {
      return NextResponse.json(
        { error: "Invalid error report format" },
        { status: 400 },
      );
    }

    await ensureMonitoringDir();

    // Load existing errors
    const existingErrors = await loadExistingErrors();

    // Check rate limiting
    if (shouldRateLimit(existingErrors, data)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Add new error
    existingErrors.push(data);

    // Keep only recent errors (last 1000)
    if (existingErrors.length > MAX_ERRORS_PER_FILE) {
      existingErrors.splice(0, existingErrors.length - MAX_ERRORS_PER_FILE);
    }

    // Save errors
    await saveErrors(existingErrors);

    // Send critical alert if needed
    await sendCriticalAlert(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in monitoring/errors API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/monitoring/errors
 * Retrieve error reports (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if admin access (in development only)
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") as
      | ErrorReport["severity"]
      | null;
    const category = searchParams.get("category") as
      | ErrorReport["category"]
      | null;
    const resolved = searchParams.get("resolved");
    const limit = parseInt(searchParams.get("limit") || "100");

    await ensureMonitoringDir();

    // Load errors from multiple days if needed
    const errors: ErrorReport[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      // Last 7 days
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const filePath = path.join(ERRORS_DIR, `errors-${dateStr}.json`);

      try {
        if (existsSync(filePath)) {
          const content = await readFile(filePath, "utf-8");
          const dayErrors = JSON.parse(content);
          errors.push(...dayErrors);
        }
      } catch (error) {
        console.error(`Failed to load errors for ${dateStr}:`, error);
      }
    }

    // Filter errors
    let filteredErrors = errors;

    if (severity) {
      filteredErrors = filteredErrors.filter(
        (error) => error.severity === severity,
      );
    }

    if (category) {
      filteredErrors = filteredErrors.filter(
        (error) => error.category === category,
      );
    }

    if (resolved !== null) {
      const isResolved = resolved === "true";
      filteredErrors = filteredErrors.filter(
        (error) => error.resolved === isResolved,
      );
    }

    // Sort by timestamp (newest first)
    filteredErrors.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Limit results
    filteredErrors = filteredErrors.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: errors.length,
      filtered: filteredErrors.length,
      bySeverity: {
        low: errors.filter((e) => e.severity === "low").length,
        medium: errors.filter((e) => e.severity === "medium").length,
        high: errors.filter((e) => e.severity === "high").length,
        critical: errors.filter((e) => e.severity === "critical").length,
      },
      byCategory: {
        javascript: errors.filter((e) => e.category === "javascript").length,
        network: errors.filter((e) => e.category === "network").length,
        performance: errors.filter((e) => e.category === "performance").length,
        user: errors.filter((e) => e.category === "user").length,
        system: errors.filter((e) => e.category === "system").length,
      },
      resolved: errors.filter((e) => e.resolved).length,
      unresolved: errors.filter((e) => !e.resolved).length,
    };

    return NextResponse.json({
      errors: filteredErrors,
      stats,
    });
  } catch (error) {
    console.error("Error in monitoring/errors GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
