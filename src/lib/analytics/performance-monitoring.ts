/**
 * Performance monitoring and alerting system
 * Tracks Core Web Vitals and custom performance metrics
 */

import { analytics } from "./google-analytics";

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Other important metrics
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint

  // Custom metrics
  contentLoadTime?: number;
  toolInitTime?: number;
  searchResponseTime?: number;

  // Resource metrics
  domContentLoaded?: number;
  windowLoad?: number;

  // Memory metrics
  memoryUsage?: number;
  jsHeapSize?: number;

  // Network metrics
  connectionType?: string;
  effectiveType?: string;

  timestamp: string;
  url: string;
  userAgent: string;
}

export interface PerformanceAlert {
  id: string;
  timestamp: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  severity: "warning" | "critical";
  url: string;
  context?: Record<string, unknown>;
}

export interface PerformanceBudget {
  lcp: number; // 2500ms
  fid: number; // 100ms
  cls: number; // 0.1
  ttfb: number; // 600ms
  fcp: number; // 1800ms
  contentLoadTime: number; // 3000ms
  toolInitTime: number; // 1000ms
  searchResponseTime: number; // 500ms
  memoryUsage: number; // 90%
  jsHeapSize: number; // 50MB
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isInitialized = false;

  private readonly budget: PerformanceBudget = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    fcp: 1800,
    contentLoadTime: 3000,
    toolInitTime: 1000,
    searchResponseTime: 500,
    memoryUsage: 90,
    jsHeapSize: 50 * 1024 * 1024, // 50MB
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Wait for page load to start monitoring
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.startMonitoring(),
      );
    } else {
      this.startMonitoring();
    }

    this.isInitialized = true;
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor navigation timing
    this.monitorNavigationTiming();

    // Monitor resource timing
    this.monitorResourceTiming();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor network information
    this.monitorNetworkInfo();

    // Set up periodic monitoring
    this.setupPeriodicMonitoring();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    if (!("PerformanceObserver" in window)) return;

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };

        this.recordMetric("lcp", lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      console.warn("LCP monitoring not supported");
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart?: number;
          };
          if (fidEntry.processingStart) {
            const fid = fidEntry.processingStart - entry.startTime;
            this.recordMetric("fid", fid);
          }
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch {
      console.warn("FID monitoring not supported");
    }

    // CLS Observer
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & {
            value?: number;
            hadRecentInput?: boolean;
          };
          if (
            clsEntry.value !== undefined &&
            clsEntry.hadRecentInput !== undefined
          ) {
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
            }
          }
        });
        this.recordMetric("cls", clsValue);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch {
      console.warn("CLS monitoring not supported");
    }
  }

  /**
   * Monitor navigation timing
   */
  private monitorNavigationTiming(): void {
    if (!("performance" in window) || !performance.getEntriesByType) return;

    const navigationEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length === 0) return;

    const navigation = navigationEntries[0];

    // TTFB
    const ttfb = navigation.responseStart - navigation.requestStart;
    this.recordMetric("ttfb", ttfb);

    // FCP
    if ("getEntriesByName" in performance) {
      const fcpEntries = performance.getEntriesByName("first-contentful-paint");
      if (fcpEntries.length > 0) {
        this.recordMetric("fcp", fcpEntries[0].startTime);
      }
    }

    // DOM Content Loaded
    const domContentLoaded =
      navigation.domContentLoadedEventEnd - navigation.fetchStart;
    this.recordMetric("domContentLoaded", domContentLoaded);

    // Window Load
    const windowLoad = navigation.loadEventEnd - navigation.fetchStart;
    this.recordMetric("windowLoad", windowLoad);
  }

  /**
   * Monitor resource timing
   */
  private monitorResourceTiming(): void {
    if (!("performance" in window) || !performance.getEntriesByType) return;

    const resourceEntries = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    // Analyze slow resources
    resourceEntries.forEach((resource) => {
      const loadTime = resource.responseEnd - resource.startTime;

      if (loadTime > 1000) {
        // Resources taking more than 1 second
        this.createAlert({
          metric: "contentLoadTime",
          value: loadTime,
          threshold: 1000,
          severity: loadTime > 3000 ? "critical" : "warning",
          context: {
            resourceName: resource.name,
            resourceType: this.getResourceType(resource.name),
            transferSize: resource.transferSize,
          },
        });
      }
    });
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (!("memory" in performance)) return;

    const memory = (
      performance as typeof performance & {
        memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      }
    ).memory;
    const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    this.recordMetric("memoryUsage", memoryUsage);
    this.recordMetric("jsHeapSize", memory.usedJSHeapSize);
  }

  /**
   * Monitor network information
   */
  private monitorNetworkInfo(): void {
    if (!("connection" in navigator)) return;

    const connection = (
      navigator as typeof navigator & {
        connection: { type: string; effectiveType: string };
      }
    ).connection;

    this.recordMetric("connectionType", connection.type, false);
    this.recordMetric("effectiveType", connection.effectiveType, false);
  }

  /**
   * Set up periodic monitoring
   */
  private setupPeriodicMonitoring(): void {
    // Monitor memory every 30 seconds
    setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000);

    // Send metrics every 5 minutes
    setInterval(() => {
      this.sendMetrics();
    }, 300000);
  }

  /**
   * Record a performance metric
   */
  private recordMetric(
    metric: keyof PerformanceMetrics,
    value: unknown,
    checkBudget: boolean = true,
  ): void {
    const currentMetrics = this.getCurrentMetrics();
    (currentMetrics as unknown as Record<string, unknown>)[metric] = value;

    // Check against performance budget
    if (checkBudget && typeof value === "number") {
      const threshold = this.budget[metric as keyof PerformanceBudget];
      if (threshold && value > threshold) {
        this.createAlert({
          metric,
          value,
          threshold,
          severity: value > threshold * 1.5 ? "critical" : "warning",
        });
      }
    }

    // Send to analytics
    if (typeof value === "number") {
      analytics.trackPerformance({ [metric]: value });
    }
  }

  /**
   * Get current metrics object
   */
  private getCurrentMetrics(): PerformanceMetrics {
    const now = new Date().toISOString();
    let currentMetrics = this.metrics.find((m) => m.timestamp === now);

    if (!currentMetrics) {
      currentMetrics = {
        timestamp: now,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      this.metrics.push(currentMetrics);
    }

    return currentMetrics;
  }

  /**
   * Create performance alert
   */
  private createAlert(
    alert: Omit<PerformanceAlert, "id" | "timestamp" | "url">,
  ): void {
    const performanceAlert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...alert,
    };

    this.alerts.push(performanceAlert);

    // Send alert to monitoring endpoint
    this.sendAlert(performanceAlert);

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Performance alert:", performanceAlert);
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return "script";
    if (url.match(/\.css$/)) return "stylesheet";
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return "image";
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return "font";
    if (url.match(/\.(mp4|webm|ogg)$/)) return "video";
    return "other";
  }

  /**
   * Send metrics to monitoring endpoint
   */
  private async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics: this.metrics,
          timestamp: new Date().toISOString(),
        }),
      });

      // Clear sent metrics
      this.metrics = [];
    } catch (error) {
      console.error("Failed to send performance metrics:", error);
    }
  }

  /**
   * Send alert to monitoring endpoint
   */
  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    try {
      await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error("Failed to send performance alert:", error);
    }
  }

  /**
   * Measure custom metric
   */
  measureCustomMetric(
    name: keyof PerformanceMetrics,
    startMark: string,
    endMark?: string,
  ): number {
    if (!("performance" in window)) return 0;

    try {
      const endMarkName = endMark || `${name}_end`;
      performance.mark(endMarkName);

      const measureName = `${name}_measure`;
      performance.measure(measureName, startMark, endMarkName);

      const measures = performance.getEntriesByName(measureName);
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        this.recordMetric(name, duration);
        return duration;
      }
    } catch (error) {
      console.error("Failed to measure custom metric:", error);
    }

    return 0;
  }

  /**
   * Start measuring custom metric
   */
  startMeasure(name: string): void {
    if ("performance" in window) {
      performance.mark(`${name}_start`);
    }
  }

  /**
   * End measuring custom metric
   */
  endMeasure(name: keyof PerformanceMetrics): number {
    return this.measureCustomMetric(name, `${name}_start`);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    metrics: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    budgetStatus: Record<keyof PerformanceBudget, "pass" | "warning" | "fail">;
  } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const budgetStatus: Record<
      keyof PerformanceBudget,
      "pass" | "warning" | "fail"
    > = {} as Record<keyof PerformanceBudget, "pass" | "warning" | "fail">;

    if (latestMetrics) {
      Object.keys(this.budget).forEach((key) => {
        const metricKey = key as keyof PerformanceBudget;
        const value = latestMetrics[metricKey] as number;
        const threshold = this.budget[metricKey];

        if (value === undefined) {
          budgetStatus[metricKey] = "pass";
        } else if (value <= threshold) {
          budgetStatus[metricKey] = "pass";
        } else if (value <= threshold * 1.5) {
          budgetStatus[metricKey] = "warning";
        } else {
          budgetStatus[metricKey] = "fail";
        }
      });
    }

    return {
      metrics: this.metrics,
      alerts: this.alerts,
      budgetStatus,
    };
  }

  /**
   * Clear old data
   */
  cleanup(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): void {
    this.metrics = this.metrics.filter(
      (metric) => new Date(metric.timestamp) >= olderThan,
    );
    this.alerts = this.alerts.filter(
      (alert) => new Date(alert.timestamp) >= olderThan,
    );
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startMeasure = (name: string) =>
  performanceMonitor.startMeasure(name);
export const endMeasure = (name: keyof PerformanceMetrics) =>
  performanceMonitor.endMeasure(name);
export const measureCustomMetric = (
  name: keyof PerformanceMetrics,
  startMark: string,
  endMark?: string,
) => performanceMonitor.measureCustomMetric(name, startMark, endMark);
export const getPerformanceSummary = () =>
  performanceMonitor.getPerformanceSummary();
// Types are already exported above
