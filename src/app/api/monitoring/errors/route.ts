/**
 * Error Monitoring API
 * Collects and processes client-side errors
 */

import { securityUtils } from "@/lib/utils/security";
import { NextRequest, NextResponse } from "next/server";

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent?: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  component?: string;
  props?: Record<string, unknown>;
}

// Rate limiting
const errorRateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

function checkErrorRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxErrors = 10; // 10 errors per minute per IP

  const current = errorRateLimitMap.get(ip);

  if (!current || now > current.resetTime) {
    errorRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxErrors) {
    return false;
  }

  current.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Allow error monitoring in all environments for debugging
    // Only disable if explicitly set
    if (process.env.DISABLE_ERROR_MONITORING === "true") {
      return NextResponse.json(
        { error: "Error monitoring is disabled" },
        { status: 403 },
      );
    }

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkErrorRateLimit(ip)) {
      return NextResponse.json(
        { error: "Error rate limit exceeded" },
        { status: 429 },
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.warn("Invalid JSON in error monitoring request:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 },
      );
    }

    // Validate body exists
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Sanitize error data
    const errorReport: ErrorReport = {
      message: securityUtils.sanitizeHtml(body.message || "Unknown error"),
      stack: body.stack
        ? securityUtils.sanitizeHtml(body.stack.substring(0, 5000))
        : undefined,
      url: securityUtils.sanitizeUrl(body.url || ""),
      lineNumber: Number(body.lineNumber) || undefined,
      columnNumber: Number(body.columnNumber) || undefined,
      userAgent: body.userAgent?.substring(0, 500),
      timestamp: Number(body.timestamp) || Date.now(),
      userId: body.userId ? securityUtils.sanitizeHtml(body.userId) : undefined,
      sessionId: body.sessionId
        ? securityUtils.sanitizeHtml(body.sessionId)
        : undefined,
      component: body.component
        ? securityUtils.sanitizeHtml(body.component)
        : undefined,
      props: body.props ? sanitizeProps(body.props) : undefined,
    };

    // Filter out sensitive information
    if (securityUtils.containsSensitiveInfo(errorReport.message)) {
      errorReport.message = "[REDACTED - Contains sensitive information]";
    }

    if (
      errorReport.stack &&
      securityUtils.containsSensitiveInfo(errorReport.stack)
    ) {
      errorReport.stack = "[REDACTED - Contains sensitive information]";
    }

    // Store error report
    await storeErrorReport(errorReport);

    // Analyze error for severity
    const severity = analyzeErrorSeverity(errorReport);

    // Send to external monitoring if configured
    if (process.env.SENTRY_DSN) {
      await forwardToSentry(errorReport, severity);
    }

    return NextResponse.json({
      success: true,
      severity,
      id: generateErrorId(errorReport),
    });
  } catch (error) {
    console.error("Error monitoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Sanitize props object
 */
function sanitizeProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === "string") {
      sanitized[key] = securityUtils.sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = "[Object]";
    } else {
      sanitized[key] = value;
    }
  });

  return securityUtils.sanitizeLogData(sanitized);
}

/**
 * Store error report
 */
async function storeErrorReport(errorReport: ErrorReport): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const errorsDir = path.join(process.cwd(), "logs", "errors");
    await fs.mkdir(errorsDir, { recursive: true });

    const today = new Date().toISOString().split("T")[0];
    const filePath = path.join(errorsDir, `errors-${today}.jsonl`);

    const logEntry = JSON.stringify(errorReport) + "\n";
    await fs.appendFile(filePath, logEntry);
  } catch (error) {
    console.error("Failed to store error report:", error);
  }
}

/**
 * Analyze error severity
 */
function analyzeErrorSeverity(
  errorReport: ErrorReport,
): "low" | "medium" | "high" | "critical" {
  const message = errorReport.message.toLowerCase();

  // Critical errors
  if (message.includes("chunk load") || message.includes("network error")) {
    return "critical";
  }

  // High severity errors
  if (
    message.includes("webgl") ||
    message.includes("canvas") ||
    message.includes("memory")
  ) {
    return "high";
  }

  // Medium severity errors
  if (message.includes("component") || message.includes("render")) {
    return "medium";
  }

  // Default to low severity
  return "low";
}

/**
 * Forward error to Sentry
 */
async function forwardToSentry(
  errorReport: ErrorReport,
  severity: string,
): Promise<void> {
  // In production, this would use the Sentry SDK
  // For now, just log the forwarding action
  if (process.env.NODE_ENV === "development") {
    console.log("Would forward to Sentry:", {
      message: errorReport.message,
      severity,
      component: errorReport.component,
    });
  }
}

/**
 * Generate unique error ID
 */
async function generateErrorId(errorReport: ErrorReport): Promise<string> {
  const crypto = await import("crypto");
  const hash = crypto
    .createHash("md5")
    .update(errorReport.message + errorReport.url + errorReport.component)
    .digest("hex");

  return `err_${hash.substring(0, 8)}`;
}

export async function GET() {
  return NextResponse.json({
    message: "Error Monitoring API",
    endpoints: {
      POST: "Submit error reports",
    },
  });
}
