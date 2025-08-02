/**
 * Error tracking and monitoring system
 * Captures and reports errors with context information
 */

export interface ErrorReport {
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

export interface PerformanceIssue {
  id: string;
  timestamp: string;
  type: "lcp" | "fid" | "cls" | "ttfb" | "memory" | "bundle";
  value: number;
  threshold: number;
  url: string;
  severity: "warning" | "critical";
  context?: Record<string, unknown>;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private performanceIssues: PerformanceIssue[] = [];
  private sessionId: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  /**
   * Initialize error tracking
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Global error handler
    window.addEventListener("error", (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "global_error",
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        {
          type: "unhandled_promise_rejection",
        },
      );
    });

    // Network error monitoring
    this.monitorNetworkErrors();

    // Performance monitoring
    this.monitorPerformance();

    this.isInitialized = true;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Capture and report error
   */
  captureError(
    error: Error,
    context?: Record<string, unknown>,
    severity: ErrorReport["severity"] = "medium",
  ): void {
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "",
      sessionId: this.sessionId,
      context,
      severity,
      category: this.categorizeError(error, context),
      resolved: false,
    };

    // Store error locally
    this.errors.push(errorReport);

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        event_category: "Errors",
        event_label: error.message,
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        severity: severity,
        category: errorReport.category,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Error captured:", errorReport);
    }

    // Send error report
    this.sendErrorReport(errorReport);
  }

  /**
   * Categorize error based on type and context
   */
  private categorizeError(
    error: Error,
    context?: Record<string, unknown>,
  ): ErrorReport["category"] {
    if (context?.type === "network" || error.message.includes("fetch")) {
      return "network";
    }
    if (
      context?.type === "performance" ||
      error.message.includes("performance")
    ) {
      return "performance";
    }
    if (context?.type === "user" || error.message.includes("user")) {
      return "user";
    }
    if (error.message.includes("system") || error.message.includes("memory")) {
      return "system";
    }
    return "javascript";
  }

  /**
   * Monitor network errors
   */
  private monitorNetworkErrors(): void {
    // Override fetch to monitor network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Skip monitoring for monitoring endpoints to avoid infinite loops
        const url = typeof args[0] === "string" ? args[0] : args[0]?.toString();
        if (url?.includes("/api/monitoring/")) {
          return response;
        }

        if (!response.ok) {
          this.captureError(
            new Error(
              `Network error: ${response.status} ${response.statusText}`,
            ),
            {
              type: "network",
              url: args[0],
              status: response.status,
              statusText: response.statusText,
            },
            response.status >= 500 ? "high" : "medium",
          );
        }

        return response;
      } catch (error) {
        // Skip monitoring for monitoring endpoints to avoid infinite loops
        const url = typeof args[0] === "string" ? args[0] : args[0]?.toString();
        if (url?.includes("/api/monitoring/")) {
          throw error;
        }

        this.captureError(
          error instanceof Error ? error : new Error(String(error)),
          {
            type: "network",
            url: args[0],
          },
          "high",
        );
        throw error;
      }
    };
  }

  /**
   * Monitor performance issues
   */
  private monitorPerformance(): void {
    // Monitor Core Web Vitals
    if ("PerformanceObserver" in window) {
      // LCP monitoring
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
          element?: { tagName: string };
          url?: string;
        };

        if (lastEntry.startTime > 2500) {
          // LCP threshold
          this.reportPerformanceIssue({
            type: "lcp",
            value: lastEntry.startTime,
            threshold: 2500,
            context: {
              element: lastEntry.element?.tagName,
              url: lastEntry.url,
            },
          });
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch {
        // LCP not supported
      }

      // FID monitoring
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart?: number;
          };
          if (fidEntry.processingStart) {
            const fid = fidEntry.processingStart - entry.startTime;

            if (fid > 100) {
              // FID threshold
              this.reportPerformanceIssue({
                type: "fid",
                value: fid,
                threshold: 100,
                context: {
                  eventType: entry.name,
                },
              });
            }
          }
        });
      });

      try {
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch {
        // FID not supported
      }

      // CLS monitoring
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & {
            value?: number;
            sources?: {
              node?: { tagName: string };
              previousRect: DOMRect;
              currentRect: DOMRect;
            }[];
          };
          if (clsEntry.value && clsEntry.value > 0.1) {
            // CLS threshold
            this.reportPerformanceIssue({
              type: "cls",
              value: clsEntry.value,
              threshold: 0.1,
              context: {
                sources: clsEntry.sources?.map((source) => ({
                  element: source.node?.tagName,
                  previousRect: source.previousRect,
                  currentRect: source.currentRect,
                })),
              },
            });
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch {
        // CLS not supported
      }
    }

    // Memory monitoring
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (
          performance as typeof performance & {
            memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (memoryUsage > 0.9) {
          // 90% memory usage threshold
          this.reportPerformanceIssue({
            type: "memory",
            value: memoryUsage * 100,
            threshold: 90,
            context: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
            },
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Report performance issue
   */
  private reportPerformanceIssue(
    issue: Omit<PerformanceIssue, "id" | "timestamp" | "url" | "severity">,
  ): void {
    const performanceIssue: PerformanceIssue = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      severity: issue.value > issue.threshold * 2 ? "critical" : "warning",
      ...issue,
    };

    this.performanceIssues.push(performanceIssue);

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "performance_metric", {
        event_category: "Performance",
        event_label: performanceIssue.type,
        metric_value: performanceIssue.value,
        threshold: performanceIssue.threshold,
        severity: performanceIssue.severity,
        url: performanceIssue.url,
        context: performanceIssue.context,
      });
    }

    // Send to monitoring endpoint
    this.sendPerformanceReport(performanceIssue);

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Performance issue detected:", performanceIssue);
    }
  }

  /**
   * Send error report to monitoring endpoint
   */
  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      await fetch("/api/monitoring/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      // Fail silently to avoid infinite error loops
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send error report:", error);
      }
    }
  }

  /**
   * Send performance report to monitoring endpoint
   */
  private async sendPerformanceReport(
    performanceIssue: PerformanceIssue,
  ): Promise<void> {
    try {
      // Convert PerformanceIssue to the format expected by the API
      const alertData = {
        id: performanceIssue.id,
        timestamp: performanceIssue.timestamp,
        metric: performanceIssue.type,
        value: performanceIssue.value,
        threshold: performanceIssue.threshold,
        severity: performanceIssue.severity,
        url: performanceIssue.url,
        context: performanceIssue.context,
      };

      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertData),
      });
    } catch (error) {
      // Fail silently to avoid infinite error loops
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send performance report:", error);
      }
    }
  }

  /**
   * Get error reports
   */
  getErrors(filter?: {
    severity?: ErrorReport["severity"];
    category?: ErrorReport["category"];
    resolved?: boolean;
    since?: Date;
  }): ErrorReport[] {
    let filteredErrors = [...this.errors];

    if (filter) {
      if (filter.severity) {
        filteredErrors = filteredErrors.filter(
          (error) => error.severity === filter.severity,
        );
      }
      if (filter.category) {
        filteredErrors = filteredErrors.filter(
          (error) => error.category === filter.category,
        );
      }
      if (filter.resolved !== undefined) {
        filteredErrors = filteredErrors.filter(
          (error) => error.resolved === filter.resolved,
        );
      }
      if (filter.since) {
        filteredErrors = filteredErrors.filter(
          (error) => new Date(error.timestamp) >= filter.since!,
        );
      }
    }

    return filteredErrors.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get performance issues
   */
  getPerformanceIssues(filter?: {
    type?: PerformanceIssue["type"];
    since?: Date;
  }): PerformanceIssue[] {
    let filteredIssues = [...this.performanceIssues];

    if (filter) {
      if (filter.type) {
        filteredIssues = filteredIssues.filter(
          (issue) => issue.type === filter.type,
        );
      }
      if (filter.since) {
        filteredIssues = filteredIssues.filter(
          (issue) => new Date(issue.timestamp) >= filter.since!,
        );
      }
    }

    return filteredIssues.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Clear old errors and performance issues
   */
  cleanup(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): void {
    this.errors = this.errors.filter(
      (error) => new Date(error.timestamp) >= olderThan,
    );
    this.performanceIssues = this.performanceIssues.filter(
      (issue) => new Date(issue.timestamp) >= olderThan,
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorReport["severity"], number>;
    byCategory: Record<ErrorReport["category"], number>;
    resolved: number;
    unresolved: number;
  } {
    const stats = {
      total: this.errors.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byCategory: {
        javascript: 0,
        network: 0,
        performance: 0,
        user: 0,
        system: 0,
      },
      resolved: 0,
      unresolved: 0,
    };

    this.errors.forEach((error) => {
      stats.bySeverity[error.severity]++;
      stats.byCategory[error.category]++;
      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export const captureError = (
  error: Error,
  context?: Record<string, unknown>,
  severity?: ErrorReport["severity"],
) => errorTracker.captureError(error, context, severity);

export const getErrors = (
  filter?: Parameters<typeof errorTracker.getErrors>[0],
) => errorTracker.getErrors(filter);

export const getPerformanceIssues = (
  filter?: Parameters<typeof errorTracker.getPerformanceIssues>[0],
) => errorTracker.getPerformanceIssues(filter);

export const getErrorStats = () => errorTracker.getErrorStats();
// Types are already exported above
