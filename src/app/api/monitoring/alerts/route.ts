/**
 * API endpoint for monitoring alerts
 * Receives and stores performance alerts
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface PerformanceAlert {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  severity: "warning" | "critical";
  url: string;
  context?: Record<string, unknown>;
}

const ALERTS_DIR = path.join(
  process.cwd(),
  "public",
  "data",
  "monitoring",
  "alerts",
);
const MAX_ALERTS_PER_FILE = 500;

/**
 * Ensure alerts directory exists
 */
async function ensureAlertsDir(): Promise<void> {
  if (!existsSync(ALERTS_DIR)) {
    await mkdir(ALERTS_DIR, { recursive: true });
  }
}

/**
 * Get current alerts file path
 */
function getCurrentAlertsPath(): string {
  const today = new Date().toISOString().split("T")[0];
  return path.join(ALERTS_DIR, `alerts-${today}.json`);
}

/**
 * Load existing alerts from file
 */
async function loadExistingAlerts(): Promise<PerformanceAlert[]> {
  const filePath = getCurrentAlertsPath();

  try {
    if (existsSync(filePath)) {
      const content = await readFile(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to load existing alerts:", error);
  }

  return [];
}

/**
 * Save alerts to file
 */
async function saveAlerts(alerts: PerformanceAlert[]): Promise<void> {
  const filePath = getCurrentAlertsPath();

  try {
    await writeFile(filePath, JSON.stringify(alerts, null, 2));
  } catch (error) {
    console.error("Failed to save alerts:", error);
    throw error;
  }
}

/**
 * Validate performance alert
 */
function validateAlert(data: unknown): data is PerformanceAlert {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).id === "string" &&
    typeof (data as Record<string, unknown>).timestamp === "string" &&
    typeof (data as Record<string, unknown>).metric === "string" &&
    typeof (data as Record<string, unknown>).value === "number" &&
    typeof (data as Record<string, unknown>).threshold === "number" &&
    ["warning", "critical"].includes(
      (data as Record<string, unknown>).severity as string,
    ) &&
    typeof (data as Record<string, unknown>).url === "string"
  );
}

/**
 * Check if alert should be rate limited
 */
function shouldRateLimit(
  alerts: PerformanceAlert[],
  newAlert: PerformanceAlert,
): boolean {
  const recentAlerts = alerts.filter((alert) => {
    const alertTime = new Date(alert.timestamp).getTime();
    const now = Date.now();
    return now - alertTime < 300000; // Last 5 minutes
  });

  // Rate limit: max 5 alerts per metric per 5 minutes
  const metricAlerts = recentAlerts.filter(
    (alert) => alert.metric === newAlert.metric && alert.url === newAlert.url,
  );

  return metricAlerts.length >= 5;
}

/**
 * Send critical alert notification
 */
async function sendCriticalAlertNotification(
  alert: PerformanceAlert,
): Promise<void> {
  if (alert.severity !== "critical") return;

  try {
    console.error("CRITICAL PERFORMANCE ALERT:", {
      id: alert.id,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      url: alert.url,
      timestamp: alert.timestamp,
    });

    // In production, you would integrate with:
    // - Email service (Resend, SendGrid, etc.)
    // - Slack webhook
    // - PagerDuty
    // - Discord webhook
    // - SMS service
  } catch (error) {
    console.error("Failed to send critical alert notification:", error);
  }
}

/**
 * POST /api/monitoring/alerts
 * Store performance alert
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
        console.warn("Invalid JSON in alert monitoring request:", jsonError);
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

    // Validate alert
    if (!validateAlert(data)) {
      return NextResponse.json(
        { error: "Invalid alert format" },
        { status: 400 },
      );
    }

    await ensureAlertsDir();

    // Load existing alerts
    const existingAlerts = await loadExistingAlerts();

    // Check rate limiting
    if (shouldRateLimit(existingAlerts, data)) {
      return NextResponse.json(
        { error: "Alert rate limit exceeded" },
        { status: 429 },
      );
    }

    // Add new alert
    existingAlerts.push(data);

    // Keep only recent alerts
    if (existingAlerts.length > MAX_ALERTS_PER_FILE) {
      existingAlerts.splice(0, existingAlerts.length - MAX_ALERTS_PER_FILE);
    }

    // Save alerts
    await saveAlerts(existingAlerts);

    // Send critical alert notification
    await sendCriticalAlertNotification(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in monitoring/alerts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/monitoring/alerts
 * Retrieve performance alerts (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if admin access (in development only)
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") as
      | PerformanceAlert["severity"]
      | null;
    const metric = searchParams.get("metric");
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "100");

    await ensureAlertsDir();

    // Load alerts from multiple days
    const alerts: PerformanceAlert[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const filePath = path.join(ALERTS_DIR, `alerts-${dateStr}.json`);

      try {
        if (existsSync(filePath)) {
          const content = await readFile(filePath, "utf-8");
          const dayAlerts = JSON.parse(content);
          alerts.push(...dayAlerts);
        }
      } catch (error) {
        console.error(`Failed to load alerts for ${dateStr}:`, error);
      }
    }

    // Filter alerts
    let filteredAlerts = alerts;

    if (severity) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.severity === severity,
      );
    }

    if (metric) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.metric === metric,
      );
    }

    // Sort by timestamp (newest first)
    filteredAlerts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Limit results
    filteredAlerts = filteredAlerts.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: alerts.length,
      filtered: filteredAlerts.length,
      bySeverity: {
        warning: alerts.filter((a) => a.severity === "warning").length,
        critical: alerts.filter((a) => a.severity === "critical").length,
      },
      byMetric: alerts.reduce(
        (acc, alert) => {
          acc[alert.metric] = (acc[alert.metric] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentCritical: alerts.filter((a) => {
        const alertTime = new Date(a.timestamp).getTime();
        const oneHourAgo = Date.now() - 3600000;
        return a.severity === "critical" && alertTime > oneHourAgo;
      }).length,
    };

    return NextResponse.json({
      alerts: filteredAlerts,
      stats,
    });
  } catch (error) {
    console.error("Error in monitoring/alerts GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
