import { NextRequest, NextResponse } from "next/server";
import {
  getSiteStatistics,
  getContentMetrics,
  getSystemHealth,
  getAuditLogs,
  createBackup,
  logAdminAction,
} from "@/lib/admin/analytics";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API not available in production" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "statistics":
        const statistics = await getSiteStatistics();
        return NextResponse.json(statistics);

      case "metrics":
        const metrics = await getContentMetrics();
        return NextResponse.json(metrics);

      case "health":
        const health = await getSystemHealth();
        return NextResponse.json(health);

      case "logs":
        const limit = parseInt(searchParams.get("limit") || "100");
        const logs = await getAuditLogs(limit);
        return NextResponse.json(logs);

      default:
        // Return all data by default
        const [stats, contentMetrics, systemHealth, auditLogs] =
          await Promise.all([
            getSiteStatistics(),
            getContentMetrics(),
            getSystemHealth(),
            getAuditLogs(50),
          ]);

        return NextResponse.json({
          statistics: stats,
          metrics: contentMetrics,
          health: systemHealth,
          logs: auditLogs,
        });
    }
  } catch (error) {
    console.error("Error in admin analytics API:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API not available in production" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "backup":
        const backupPath = await createBackup();
        await logAdminAction(
          "backup_created",
          "system",
          { backupPath },
          request,
        );
        return NextResponse.json({
          success: true,
          message: "Backup created successfully",
          backupPath,
        });

      case "log":
        const { logAction, resource, details } = body;
        await logAdminAction(logAction, resource, details, request);
        return NextResponse.json({
          success: true,
          message: "Action logged successfully",
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in admin analytics POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
