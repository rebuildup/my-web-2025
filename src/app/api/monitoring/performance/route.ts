/**
 * API endpoint for performance monitoring
 * Receives and stores performance metrics and alerts
 */

import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  contentLoadTime?: number;
  toolInitTime?: number;
  searchResponseTime?: number;
  domContentLoaded?: number;
  windowLoad?: number;
  memoryUsage?: number;
  jsHeapSize?: number;
  connectionType?: string;
  effectiveType?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface PerformanceAlert {
  id: string;
  timestamp: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  severity: "warning" | "critical";
  url: string;
  context?: Record<string, unknown>;
}

// interface PerformanceReport {
//   metrics?: PerformanceMetrics[];
//   alert?: PerformanceAlert;
//   timestamp: string;
// }

const PERFORMANCE_DIR = path.join(
  process.cwd(),
  "public",
  "data",
  "monitoring",
  "performance",
);
const ALERTS_DIR = path.join(
  process.cwd(),
  "public",
  "data",
  "monitoring",
  "alerts",
);
const MAX_METRICS_PER_FILE = 1000;
const MAX_ALERTS_PER_FILE = 500;

/**
 * Ensure monitoring directories exist
 */
async function ensureMonitoringDirs(): Promise<void> {
  if (!existsSync(PERFORMANCE_DIR)) {
    await mkdir(PERFORMANCE_DIR, { recursive: true });
  }
  if (!existsSync(ALERTS_DIR)) {
    await mkdir(ALERTS_DIR, { recursive: true });
  }
}

/**
 * Get current performance metrics file path
 */
function getCurrentMetricsPath(): string {
  const today = new Date().toISOString().split("T")[0];
  return path.join(PERFORMANCE_DIR, `metrics-${today}.json`);
}

/**
 * Get current alerts file path
 */
function getCurrentAlertsPath(): string {
  const today = new Date().toISOString().split("T")[0];
  return path.join(ALERTS_DIR, `alerts-${today}.json`);
}

/**
 * Load existing metrics from file
 */
async function loadExistingMetrics(): Promise<PerformanceMetrics[]> {
  const filePath = getCurrentMetricsPath();

  try {
    if (existsSync(filePath)) {
      const content = await readFile(filePath, "utf-8");

      // Validate JSON before parsing
      if (!content.trim()) {
        return [];
      }

      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error("Invalid JSON in metrics file, resetting:", parseError);
        // Reset corrupted file
        await writeFile(filePath, "[]");
        return [];
      }
    }
  } catch (error) {
    console.error("Failed to load existing metrics:", error);
  }

  return [];
}

/**
 * Load existing alerts from file
 */
async function loadExistingAlerts(): Promise<PerformanceAlert[]> {
  const filePath = getCurrentAlertsPath();

  try {
    if (existsSync(filePath)) {
      const content = await readFile(filePath, "utf-8");

      // Validate JSON before parsing
      if (!content.trim()) {
        return [];
      }

      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error("Invalid JSON in alerts file, resetting:", parseError);
        // Reset corrupted file
        await writeFile(filePath, "[]");
        return [];
      }
    }
  } catch (error) {
    console.error("Failed to load existing alerts:", error);
  }

  return [];
}

/**
 * Save metrics to file with atomic write
 */
async function saveMetrics(metrics: PerformanceMetrics[]): Promise<void> {
  const filePath = getCurrentMetricsPath();
  const tempPath = `${filePath}.tmp`;

  try {
    // Write to temporary file first
    await writeFile(tempPath, JSON.stringify(metrics, null, 2));

    // Atomic rename
    const fs = await import("fs/promises");
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error("Failed to save metrics:", error);

    // Clean up temp file if it exists
    try {
      const fs = await import("fs/promises");
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    throw error;
  }
}

/**
 * Save alerts to file with atomic write
 */
async function saveAlerts(alerts: PerformanceAlert[]): Promise<void> {
  const filePath = getCurrentAlertsPath();
  const tempPath = `${filePath}.tmp`;

  try {
    // Write to temporary file first
    await writeFile(tempPath, JSON.stringify(alerts, null, 2));

    // Atomic rename
    const fs = await import("fs/promises");
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error("Failed to save alerts:", error);

    // Clean up temp file if it exists
    try {
      const fs = await import("fs/promises");
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    throw error;
  }
}

/**
 * Validate performance metrics
 */
function validateMetrics(data: unknown): data is PerformanceMetrics {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).timestamp === "string" &&
    typeof (data as Record<string, unknown>).url === "string" &&
    typeof (data as Record<string, unknown>).userAgent === "string"
  );
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
 * Calculate performance statistics
 */
function calculateStats(
  metrics: PerformanceMetrics[],
): Record<string, unknown> {
  if (metrics.length === 0) return {};

  const stats: Record<string, unknown> = {};
  const numericFields = [
    "lcp",
    "fid",
    "cls",
    "ttfb",
    "fcp",
    "contentLoadTime",
    "toolInitTime",
    "searchResponseTime",
    "memoryUsage",
  ];

  numericFields.forEach((field) => {
    const values = metrics
      .map((m) => (m as unknown as Record<string, unknown>)[field])
      .filter((v): v is number => typeof v === "number" && !isNaN(v));

    if (values.length > 0) {
      values.sort((a, b) => a - b);
      stats[field] = {
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        avg:
          values.reduce((sum: number, v: number) => sum + v, 0) / values.length,
        p50: values[Math.floor(values.length * 0.5)],
        p75: values[Math.floor(values.length * 0.75)],
        p90: values[Math.floor(values.length * 0.9)],
        p95: values[Math.floor(values.length * 0.95)],
      };
    }
  });

  return stats;
}

/**
 * Send critical performance alert
 */
async function sendCriticalAlert(alert: PerformanceAlert): Promise<void> {
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

    // In a real implementation, integrate with alerting systems
  } catch (alertError) {
    console.error("Failed to send critical performance alert:", alertError);
  }
}

/**
 * POST /api/monitoring/performance
 * Store performance metrics or alerts
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Allow performance monitoring in production for debugging
    if (process.env.DISABLE_PERFORMANCE_MONITORING === "true") {
      return NextResponse.json(
        { error: "Performance monitoring is disabled" },
        { status: 403 },
      );
    }

    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      // Silently handle JSON errors in production to prevent console spam
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Invalid JSON in performance monitoring request:",
          jsonError,
        );
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

    await ensureMonitoringDirs();

    // Handle metrics batch
    if (data.metrics && Array.isArray(data.metrics)) {
      const validMetrics = data.metrics.filter(validateMetrics);

      if (validMetrics.length === 0) {
        return NextResponse.json(
          { error: "No valid metrics provided" },
          { status: 400 },
        );
      }

      // Load existing metrics
      const existingMetrics = await loadExistingMetrics();

      // Add new metrics
      existingMetrics.push(...validMetrics);

      // Keep only recent metrics
      if (existingMetrics.length > MAX_METRICS_PER_FILE) {
        existingMetrics.splice(
          0,
          existingMetrics.length - MAX_METRICS_PER_FILE,
        );
      }

      // Save metrics
      await saveMetrics(existingMetrics);

      return NextResponse.json({
        success: true,
        processed: validMetrics.length,
      });
    }

    // Handle single alert
    if (validateAlert(data)) {
      // Load existing alerts
      const existingAlerts = await loadExistingAlerts();

      // Add new alert
      existingAlerts.push(data);

      // Keep only recent alerts
      if (existingAlerts.length > MAX_ALERTS_PER_FILE) {
        existingAlerts.splice(0, existingAlerts.length - MAX_ALERTS_PER_FILE);
      }

      // Save alerts
      await saveAlerts(existingAlerts);

      // Send critical alert if needed
      await sendCriticalAlert(data);

      return NextResponse.json({ success: true });
    }

    // Handle single metric
    if (validateMetrics(data)) {
      const existingMetrics = await loadExistingMetrics();
      existingMetrics.push(data);

      if (existingMetrics.length > MAX_METRICS_PER_FILE) {
        existingMetrics.splice(
          0,
          existingMetrics.length - MAX_METRICS_PER_FILE,
        );
      }

      await saveMetrics(existingMetrics);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  } catch (error) {
    console.error("Error in monitoring/performance API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/monitoring/performance
 * Retrieve performance metrics and alerts (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Allow access in production for monitoring
    // Only restrict if explicitly disabled
    if (process.env.DISABLE_MONITORING_API === "true") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "metrics"; // 'metrics' or 'alerts'
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "1000");

    await ensureMonitoringDirs();

    if (type === "alerts") {
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

      // Sort by timestamp (newest first)
      alerts.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // Limit results
      const limitedAlerts = alerts.slice(0, limit);

      return NextResponse.json({
        alerts: limitedAlerts,
        total: alerts.length,
        stats: {
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
        },
      });
    }

    // Load metrics from multiple days
    const metrics: PerformanceMetrics[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const filePath = path.join(PERFORMANCE_DIR, `metrics-${dateStr}.json`);

      try {
        if (existsSync(filePath)) {
          const content = await readFile(filePath, "utf-8");
          const dayMetrics = JSON.parse(content);
          metrics.push(...dayMetrics);
        }
      } catch (error) {
        console.error(`Failed to load metrics for ${dateStr}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    metrics.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Limit results
    const limitedMetrics = metrics.slice(0, limit);

    // Calculate statistics
    const stats = calculateStats(metrics);

    return NextResponse.json({
      metrics: limitedMetrics,
      total: metrics.length,
      stats,
    });
  } catch (error) {
    console.error("Error in monitoring/performance GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
