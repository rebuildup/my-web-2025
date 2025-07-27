/**
 * Monitoring Dashboard Component (Development Only)
 * Displays error tracking and performance monitoring data
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  getErrors,
  getPerformanceIssues,
  getErrorStats,
  ErrorReport,
  PerformanceIssue,
} from "@/lib/analytics/error-tracking";
import {
  getPerformanceSummary,
  PerformanceAlert,
} from "@/lib/analytics/performance-monitoring";

interface MonitoringDashboardProps {
  className?: string;
}

interface ErrorStats {
  total: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byCategory: {
    javascript: number;
    network: number;
    performance: number;
    user: number;
    system: number;
  };
  resolved: number;
  unresolved: number;
}

interface PerformanceSummary {
  metrics: unknown[];
  alerts: PerformanceAlert[];
  budgetStatus: Record<string, "pass" | "warning" | "fail">;
}

export function MonitoringDashboard({
  className = "",
}: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "errors" | "performance" | "alerts"
  >("errors");
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [performanceIssues, setPerformanceIssues] = useState<
    PerformanceIssue[]
  >([]);
  const [errorStats, setErrorStats] = useState<ErrorStats>({
    total: 0,
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    byCategory: {
      javascript: 0,
      network: 0,
      performance: 0,
      user: 0,
      system: 0,
    },
    resolved: 0,
    unresolved: 0,
  });
  const [performanceSummary, setPerformanceSummary] =
    useState<PerformanceSummary>({
      metrics: [],
      alerts: [],
      budgetStatus: {},
    });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Monitoring dashboard is only available in development mode.
        </p>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load client-side data
      const clientErrors = getErrors();
      const clientPerformanceIssues = getPerformanceIssues();
      const clientErrorStats = getErrorStats();
      const clientPerformanceSummary = getPerformanceSummary();

      setErrors(clientErrors);
      setPerformanceIssues(clientPerformanceIssues);
      setErrorStats(clientErrorStats);
      setPerformanceSummary(clientPerformanceSummary);

      // Load server-side data
      try {
        const [serverErrors, serverPerformance] = await Promise.all([
          fetch("/api/monitoring/errors").then((res) =>
            res.ok ? res.json() : null,
          ),
          fetch("/api/monitoring/performance").then((res) =>
            res.ok ? res.json() : null,
          ),
        ]);

        if (serverErrors) {
          setErrors((prev) => [...prev, ...serverErrors.errors]);
        }

        if (serverPerformance) {
          setPerformanceSummary((prev) => ({
            ...prev,
            serverMetrics: serverPerformance.metrics,
            serverStats: serverPerformance.stats,
          }));
        }
      } catch (serverError) {
        console.warn("Failed to load server monitoring data:", serverError);
      }
    } catch (error) {
      console.error("Failed to load monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "medium":
        return "text-blue-600 bg-blue-50";
      case "low":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Monitoring Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-time error tracking and performance monitoring
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4" aria-label="Tabs">
          {[
            { id: "errors", name: "Errors", count: errors.length },
            {
              id: "performance",
              name: "Performance",
              count: performanceIssues.length,
            },
            {
              id: "alerts",
              name: "Alerts",
              count: performanceSummary.alerts.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "errors" | "performance" | "alerts")
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              Loading monitoring data...
            </span>
          </div>
        ) : (
          <>
            {/* Errors Tab */}
            {activeTab === "errors" && (
              <div>
                {/* Error Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Errors
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {errorStats.total}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-500">
                      Critical
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                      {errorStats.bySeverity.critical}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-500">
                      High
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {errorStats.bySeverity.high}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-500">
                      Resolved
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {errorStats.resolved}
                    </p>
                  </div>
                </div>

                {/* Error List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Errors
                  </h3>
                  {errors.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No errors recorded
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {errors.slice(0, 10).map((error, index) => (
                        <div
                          key={error.id || index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}
                                >
                                  {error.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {error.category}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(error.timestamp)}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {error.message}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {error.url}
                              </p>
                              {error.stack && (
                                <details className="mt-2">
                                  <summary className="text-sm text-blue-600 cursor-pointer">
                                    Stack trace
                                  </summary>
                                  <pre className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                    {error.stack.substring(0, 500)}...
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div>
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(performanceSummary.budgetStatus).map(
                    ([metric, status]) => (
                      <div
                        key={metric}
                        className={`p-4 rounded-lg ${
                          status === "pass"
                            ? "bg-green-50"
                            : status === "warning"
                              ? "bg-yellow-50"
                              : "bg-red-50"
                        }`}
                      >
                        <h3 className="text-sm font-medium text-gray-500">
                          {metric.toUpperCase()}
                        </h3>
                        <p
                          className={`text-lg font-bold ${
                            status === "pass"
                              ? "text-green-600"
                              : status === "warning"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {/* Performance Issues */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Performance Issues
                  </h3>
                  {performanceIssues.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No performance issues detected
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {performanceIssues.slice(0, 10).map((issue, index) => (
                        <div
                          key={issue.id || index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}
                                >
                                  {issue.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(issue.timestamp)}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {issue.type.toUpperCase()}: {issue.value}ms
                                (threshold: {issue.threshold}ms)
                              </h4>
                              <p className="text-sm text-gray-600">
                                {issue.url}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === "alerts" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Alerts
                </h3>
                {performanceSummary.alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No active alerts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {performanceSummary.alerts
                      .slice(0, 10)
                      .map((alert, index: number) => (
                        <div
                          key={alert.id || index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}
                                >
                                  {alert.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(alert.timestamp)}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {alert.metric}: {alert.value} (threshold:{" "}
                                {alert.threshold})
                              </h4>
                              <p className="text-sm text-gray-600">
                                {alert.url}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={loadData}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
