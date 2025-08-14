/**
 * Core Web Vitals Testing Utility
 * Provides comprehensive measurement and validation of Core Web Vitals metrics
 * for integration testing purposes.
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  threshold: {
    good: number;
    needsImprovement: number;
  };
}

export interface CoreWebVitalsReport {
  lcp: WebVitalMetric;
  fid: WebVitalMetric;
  cls: WebVitalMetric;
  fcp: WebVitalMetric;
  ttfb: WebVitalMetric;
  overall: "good" | "needs-improvement" | "poor";
}

/**
 * Core Web Vitals thresholds based on Google's recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 600, needsImprovement: 1500 }, // Time to First Byte (ms)
};

/**
 * Rates a metric value based on thresholds
 */
function rateMetric(
  value: number,
  threshold: { good: number; needsImprovement: number },
): "good" | "needs-improvement" | "poor" {
  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
}

/**
 * Mock Core Web Vitals measurement for testing
 */
export class CoreWebVitalsTester {
  private metrics: Partial<CoreWebVitalsReport> = {};

  /**
   * Simulate LCP measurement
   */
  measureLCP(): Promise<WebVitalMetric> {
    return new Promise((resolve) => {
      // Simulate realistic LCP timing
      const value = Math.random() * 3000 + 500; // 500-3500ms

      const metric: WebVitalMetric = {
        name: "LCP",
        value,
        rating: rateMetric(value, WEB_VITALS_THRESHOLDS.LCP),
        threshold: WEB_VITALS_THRESHOLDS.LCP,
      };

      this.metrics.lcp = metric;

      // Simulate async measurement
      setTimeout(() => resolve(metric), 10);
    });
  }

  /**
   * Simulate FID measurement
   */
  measureFID(): Promise<WebVitalMetric> {
    return new Promise((resolve) => {
      // Simulate realistic FID timing
      const value = Math.random() * 200 + 10; // 10-210ms

      const metric: WebVitalMetric = {
        name: "FID",
        value,
        rating: rateMetric(value, WEB_VITALS_THRESHOLDS.FID),
        threshold: WEB_VITALS_THRESHOLDS.FID,
      };

      this.metrics.fid = metric;

      setTimeout(() => resolve(metric), 5);
    });
  }

  /**
   * Simulate CLS measurement
   */
  measureCLS(): Promise<WebVitalMetric> {
    return new Promise((resolve) => {
      // Simulate realistic CLS score
      const value = Math.random() * 0.3; // 0-0.3

      const metric: WebVitalMetric = {
        name: "CLS",
        value,
        rating: rateMetric(value, WEB_VITALS_THRESHOLDS.CLS),
        threshold: WEB_VITALS_THRESHOLDS.CLS,
      };

      this.metrics.cls = metric;

      setTimeout(() => resolve(metric), 5);
    });
  }

  /**
   * Simulate FCP measurement
   */
  measureFCP(): Promise<WebVitalMetric> {
    return new Promise((resolve) => {
      // Simulate realistic FCP timing
      const value = Math.random() * 2500 + 300; // 300-2800ms

      const metric: WebVitalMetric = {
        name: "FCP",
        value,
        rating: rateMetric(value, WEB_VITALS_THRESHOLDS.FCP),
        threshold: WEB_VITALS_THRESHOLDS.FCP,
      };

      this.metrics.fcp = metric;

      setTimeout(() => resolve(metric), 5);
    });
  }

  /**
   * Simulate TTFB measurement
   */
  measureTTFB(): Promise<WebVitalMetric> {
    return new Promise((resolve) => {
      // Simulate realistic TTFB timing
      const value = Math.random() * 1000 + 100; // 100-1100ms

      const metric: WebVitalMetric = {
        name: "TTFB",
        value,
        rating: rateMetric(value, WEB_VITALS_THRESHOLDS.TTFB),
        threshold: WEB_VITALS_THRESHOLDS.TTFB,
      };

      this.metrics.ttfb = metric;

      setTimeout(() => resolve(metric), 5);
    });
  }

  /**
   * Measure all Core Web Vitals
   */
  async measureAll(): Promise<CoreWebVitalsReport> {
    const [lcp, fid, cls, fcp, ttfb] = await Promise.all([
      this.measureLCP(),
      this.measureFID(),
      this.measureCLS(),
      this.measureFCP(),
      this.measureTTFB(),
    ]);

    // Calculate overall rating
    const ratings = [
      lcp.rating,
      fid.rating,
      cls.rating,
      fcp.rating,
      ttfb.rating,
    ];
    const poorCount = ratings.filter((r) => r === "poor").length;
    const needsImprovementCount = ratings.filter(
      (r) => r === "needs-improvement",
    ).length;

    let overall: "good" | "needs-improvement" | "poor";
    if (poorCount > 0) {
      overall = "poor";
    } else if (needsImprovementCount > 1) {
      overall = "needs-improvement";
    } else {
      overall = "good";
    }

    return {
      lcp,
      fid,
      cls,
      fcp,
      ttfb,
      overall,
    };
  }

  /**
   * Validate that all metrics meet minimum standards
   */
  validateMetrics(report: CoreWebVitalsReport): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];

    if (report.lcp.rating === "poor") {
      failures.push(
        `LCP (${report.lcp.value}ms) exceeds poor threshold (${report.lcp.threshold.needsImprovement}ms)`,
      );
    }

    if (report.fid.rating === "poor") {
      failures.push(
        `FID (${report.fid.value}ms) exceeds poor threshold (${report.fid.threshold.needsImprovement}ms)`,
      );
    }

    if (report.cls.rating === "poor") {
      failures.push(
        `CLS (${report.cls.value}) exceeds poor threshold (${report.cls.threshold.needsImprovement})`,
      );
    }

    if (report.fcp.rating === "poor") {
      failures.push(
        `FCP (${report.fcp.value}ms) exceeds poor threshold (${report.fcp.threshold.needsImprovement}ms)`,
      );
    }

    if (report.ttfb.rating === "poor") {
      failures.push(
        `TTFB (${report.ttfb.value}ms) exceeds poor threshold (${report.ttfb.threshold.needsImprovement}ms)`,
      );
    }

    return {
      passed: failures.length === 0,
      failures,
    };
  }

  /**
   * Generate a performance report
   */
  generateReport(report: CoreWebVitalsReport): string {
    const lines = [
      "=== Core Web Vitals Report ===",
      "",
      `Overall Rating: ${report.overall.toUpperCase()}`,
      "",
      "Individual Metrics:",
      `  LCP: ${report.lcp.value.toFixed(1)}ms (${report.lcp.rating})`,
      `  FID: ${report.fid.value.toFixed(1)}ms (${report.fid.rating})`,
      `  CLS: ${report.cls.value.toFixed(3)} (${report.cls.rating})`,
      `  FCP: ${report.fcp.value.toFixed(1)}ms (${report.fcp.rating})`,
      `  TTFB: ${report.ttfb.value.toFixed(1)}ms (${report.ttfb.rating})`,
      "",
      "Thresholds:",
      `  LCP: Good ≤ ${WEB_VITALS_THRESHOLDS.LCP.good}ms, Needs Improvement ≤ ${WEB_VITALS_THRESHOLDS.LCP.needsImprovement}ms`,
      `  FID: Good ≤ ${WEB_VITALS_THRESHOLDS.FID.good}ms, Needs Improvement ≤ ${WEB_VITALS_THRESHOLDS.FID.needsImprovement}ms`,
      `  CLS: Good ≤ ${WEB_VITALS_THRESHOLDS.CLS.good}, Needs Improvement ≤ ${WEB_VITALS_THRESHOLDS.CLS.needsImprovement}`,
      `  FCP: Good ≤ ${WEB_VITALS_THRESHOLDS.FCP.good}ms, Needs Improvement ≤ ${WEB_VITALS_THRESHOLDS.FCP.needsImprovement}ms`,
      `  TTFB: Good ≤ ${WEB_VITALS_THRESHOLDS.TTFB.good}ms, Needs Improvement ≤ ${WEB_VITALS_THRESHOLDS.TTFB.needsImprovement}ms`,
    ];

    return lines.join("\n");
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {};
  }
}

/**
 * Performance monitoring utility for integration tests
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();

    if (startTime === undefined) {
      throw new Error(`Start mark "${startMark}" not found`);
    }

    if (endMark && endTime === undefined) {
      throw new Error(`End mark "${endMark}" not found`);
    }

    const duration = (endTime as number) - startTime;
    this.measures.set(name, duration);

    return duration;
  }

  /**
   * Get all measurements
   */
  getMeasures(): Map<string, number> {
    return new Map(this.measures);
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }

  /**
   * Generate performance summary
   */
  getSummary(): string {
    const lines = ["=== Performance Summary ===", ""];

    for (const [name, duration] of this.measures) {
      lines.push(`${name}: ${duration.toFixed(2)}ms`);
    }

    return lines.join("\n");
  }
}

/**
 * Memory usage monitoring utility
 */
export class MemoryMonitor {
  private snapshots: Array<{ timestamp: number; usage: MemoryInfo }> = [];

  /**
   * Take a memory snapshot
   */
  snapshot(): MemoryInfo | null {
    if ("memory" in performance) {
      const memory = (performance as { memory: MemoryInfo }).memory;
      const snapshot = {
        timestamp: Date.now(),
        usage: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        },
      };

      this.snapshots.push(snapshot);
      return snapshot.usage;
    }

    return null;
  }

  /**
   * Calculate memory usage difference between snapshots
   */
  diff(startIndex: number = 0, endIndex: number = -1): MemoryInfo | null {
    if (this.snapshots.length < 2) return null;

    const start = this.snapshots[startIndex];
    const end =
      this.snapshots[endIndex === -1 ? this.snapshots.length - 1 : endIndex];

    return {
      usedJSHeapSize: end.usage.usedJSHeapSize - start.usage.usedJSHeapSize,
      totalJSHeapSize: end.usage.totalJSHeapSize - start.usage.totalJSHeapSize,
      jsHeapSizeLimit: end.usage.jsHeapSizeLimit - start.usage.jsHeapSizeLimit,
    };
  }

  /**
   * Get memory usage in MB
   */
  getUsageInMB(usage: MemoryInfo): {
    used: number;
    total: number;
    limit: number;
  } {
    return {
      used: usage.usedJSHeapSize / (1024 * 1024),
      total: usage.totalJSHeapSize / (1024 * 1024),
      limit: usage.jsHeapSizeLimit / (1024 * 1024),
    };
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots = [];
  }
}

// Type definitions for memory monitoring
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
