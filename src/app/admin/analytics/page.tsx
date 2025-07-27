"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SiteStatistics,
  ContentMetrics,
  SystemHealth,
  AuditLog,
} from "@/lib/admin/analytics";

interface AnalyticsData {
  statistics: SiteStatistics;
  metrics: ContentMetrics[];
  health: SystemHealth;
  logs: AuditLog[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Design system classes
  const CardStyle =
    "bg-base border border-foreground p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";

  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setBackupLoading(true);
      setBackupMessage(null);

      const response = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "backup" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create backup");
      }

      const result = await response.json();
      setBackupMessage(`Backup created successfully: ${result.backupPath}`);

      // Refresh data to update logs
      await fetchAnalyticsData();
    } catch (err) {
      setBackupMessage(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setBackupLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "pass":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
      case "fail":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              <header className="space-y-6">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Analytics & Monitoring
                </h1>
                <p className="noto-sans-jp-light text-sm">
                  Loading analytics data...
                </p>
              </header>
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              <header className="space-y-6">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Analytics & Monitoring
                </h1>
                <p className="noto-sans-jp-light text-sm text-red-600">
                  Error: {error}
                </p>
              </header>
              <button
                onClick={fetchAnalyticsData}
                className="border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Header */}
            <header className="space-y-6">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                Analytics & Monitoring
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                サイト統計・パフォーマンス監視・システムヘルス管理
              </p>
              <div className="flex gap-4">
                <button
                  onClick={fetchAnalyticsData}
                  className="border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  Refresh Data
                </button>
                <button
                  onClick={createBackup}
                  disabled={backupLoading}
                  className="border border-accent px-4 py-2 hover:bg-accent hover:text-background transition-colors disabled:opacity-50"
                >
                  {backupLoading ? "Creating Backup..." : "Create Backup"}
                </button>
              </div>
              {backupMessage && (
                <div className="border border-accent p-4">
                  <p className="noto-sans-jp-light text-sm">{backupMessage}</p>
                </div>
              )}
            </header>

            {/* System Health */}
            <section className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary">
                System Health
              </h2>
              <div
                className={`${CardStyle} ${getStatusColor(data.health.status)}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={Global_title}>
                    Overall Status: {data.health.status.toUpperCase()}
                  </h3>
                  <span className="text-sm">{new Date().toLocaleString()}</span>
                </div>

                <div className="grid-system grid-1 md:grid-2 gap-4">
                  {data.health.checks.map((check, index) => (
                    <div
                      key={index}
                      className="border border-foreground p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="noto-sans-jp-regular text-sm">
                          {check.name}
                        </h4>
                        <span
                          className={`text-xs ${getStatusColor(check.status)}`}
                        >
                          {check.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="noto-sans-jp-light text-xs">
                        {check.message}
                      </p>
                    </div>
                  ))}
                </div>

                {data.health.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={Global_title}>Active Alerts</h4>
                    {data.health.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`border p-2 ${getStatusColor(alert.level)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{alert.message}</span>
                          <span className="text-xs">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Site Statistics */}
            <section className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary">
                Site Statistics
              </h2>

              {/* Content Statistics */}
              <div className={CardStyle}>
                <h3 className={Card_title}>Content Overview</h3>
                <div className="grid-system grid-2 md:grid-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {data.statistics.content.total}
                    </div>
                    <div className="text-sm">Total Items</div>
                  </div>
                  {Object.entries(data.statistics.content.byType).map(
                    ([type, count]) => (
                      <div key={type} className="text-center space-y-2">
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-sm capitalize">{type}</div>
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className={Global_title}>By Status</h4>
                  <div className="grid-system grid-2 md:grid-4 gap-2">
                    {Object.entries(data.statistics.content.byStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="border border-foreground p-2 text-center"
                        >
                          <div className="font-bold">{count}</div>
                          <div className="text-xs capitalize">{status}</div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* File Statistics */}
              <div className={CardStyle}>
                <h3 className={Card_title}>File System</h3>
                <div className="grid-system grid-2 md:grid-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-primary">
                      {formatBytes(data.statistics.files.totalSize)}
                    </div>
                    <div className="text-sm">Total Size</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {data.statistics.files.imageCount}
                    </div>
                    <div className="text-sm">Images</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {data.statistics.files.videoCount}
                    </div>
                    <div className="text-sm">Videos</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {data.statistics.files.downloadCount}
                    </div>
                    <div className="text-sm">Downloads</div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className={CardStyle}>
                <h3 className={Card_title}>System Information</h3>
                <div className="grid-system grid-2 md:grid-4 gap-4">
                  <div className="space-y-2">
                    <h4 className={Global_title}>Environment</h4>
                    <p className="text-sm">
                      {data.statistics.system.environment}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className={Global_title}>Node.js</h4>
                    <p className="text-sm">
                      {data.statistics.system.nodeVersion}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className={Global_title}>Uptime</h4>
                    <p className="text-sm">
                      {formatUptime(data.statistics.system.uptime)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className={Global_title}>Memory</h4>
                    <p className="text-sm">
                      {formatBytes(data.statistics.system.memoryUsage.heapUsed)}{" "}
                      /{" "}
                      {formatBytes(
                        data.statistics.system.memoryUsage.heapTotal,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Content Performance */}
            <section className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary">
                Content Performance
              </h2>
              <div className={CardStyle}>
                <h3 className={Card_title}>Top Content by Views</h3>
                <div className="space-y-2">
                  {data.metrics.slice(0, 10).map((metric) => (
                    <div
                      key={metric.id}
                      className="border border-foreground p-3 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="noto-sans-jp-regular text-sm">
                          {metric.title}
                        </h4>
                        <p className="noto-sans-jp-light text-xs text-accent">
                          {metric.type} • ID: {metric.id}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-bold">
                          {metric.views} views
                        </div>
                        {metric.downloads && (
                          <div className="text-xs">
                            {metric.downloads} downloads
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary">
                Recent Activity
              </h2>

              {/* Recently Updated Content */}
              <div className={CardStyle}>
                <h3 className={Card_title}>Recently Updated Content</h3>
                <div className="space-y-2">
                  {data.statistics.content.recentlyUpdated
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="border border-foreground p-3 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="noto-sans-jp-regular text-sm">
                            {item.title}
                          </h4>
                          <p className="noto-sans-jp-light text-xs text-accent">
                            {item.type} • {item.status}
                          </p>
                        </div>
                        <div className="text-xs">
                          {item.updatedAt &&
                            new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Audit Logs */}
              <div className={CardStyle}>
                <h3 className={Card_title}>Audit Logs</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.logs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-foreground p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="noto-sans-jp-regular text-sm">
                          {log.action} • {log.resource}
                        </h4>
                        <span className="text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {Object.keys(log.details).length > 0 && (
                        <div className="text-xs noto-sans-jp-light">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="Admin navigation">
              <div className="grid-system grid-1 xs:grid-2 gap-6">
                <Link
                  href="/admin"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>
                    ← Back to Admin Dashboard
                  </span>
                </Link>

                <Link
                  href="/admin/data-manager"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Data Manager →</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
