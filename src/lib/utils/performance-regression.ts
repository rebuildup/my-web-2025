/**
 * Performance regression testing utilities
 * Implements automated performance testing and regression detection
 */

import { CORE_WEB_VITALS_THRESHOLDS } from "./core-web-vitals";

// Performance baseline interface
export interface PerformanceBaseline {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  bundleSize: number;
  timestamp: number;
  version: string;
  environment: "development" | "production" | "staging";
}

// Performance regression result
export interface RegressionResult {
  metric: keyof PerformanceBaseline;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  isRegression: boolean;
  severity: "low" | "medium" | "high";
}

// Performance regression detector
export class PerformanceRegressionDetector {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private regressionThresholds: Record<
    keyof Omit<PerformanceBaseline, "timestamp" | "version" | "environment">,
    number
  > = {
    lcp: 0.1, // 10% increase is considered regression
    fid: 0.2, // 20% increase is considered regression
    cls: 0.1, // 10% increase is considered regression
    ttfb: 0.15, // 15% increase is considered regression
    fcp: 0.1, // 10% increase is considered regression
    bundleSize: 0.05, // 5% increase is considered regression
  };

  constructor() {
    this.loadBaselines();
  }

  // Load baselines from localStorage or API
  private loadBaselines(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("performance-baselines");
        if (stored) {
          const baselines = JSON.parse(stored);
          Object.entries(baselines).forEach(([key, value]) => {
            this.baselines.set(key, value as PerformanceBaseline);
          });
        }
      } catch (error) {
        console.warn("Failed to load performance baselines:", error);
      }
    }
  }

  // Save baselines to localStorage
  private saveBaselines(): void {
    if (typeof window !== "undefined") {
      try {
        const baselines = Object.fromEntries(this.baselines);
        localStorage.setItem(
          "performance-baselines",
          JSON.stringify(baselines),
        );
      } catch (error) {
        console.warn("Failed to save performance baselines:", error);
      }
    }
  }

  // Set baseline for a specific environment
  public setBaseline(
    environment: "development" | "production" | "staging",
    metrics: Partial<PerformanceBaseline>,
  ): void {
    const baseline: PerformanceBaseline = {
      lcp: metrics.lcp || 0,
      fid: metrics.fid || 0,
      cls: metrics.cls || 0,
      ttfb: metrics.ttfb || 0,
      fcp: metrics.fcp || 0,
      bundleSize: metrics.bundleSize || 0,
      timestamp: Date.now(),
      version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
      environment,
    };

    this.baselines.set(environment, baseline);
    this.saveBaselines();
  }

  // Check for regressions against baseline
  public checkRegression(
    environment: "development" | "production" | "staging",
    currentMetrics: Partial<PerformanceBaseline>,
  ): RegressionResult[] {
    const baseline = this.baselines.get(environment);
    if (!baseline) {
      console.warn(`No baseline found for environment: ${environment}`);
      return [];
    }

    const results: RegressionResult[] = [];

    Object.entries(currentMetrics).forEach(([metric, currentValue]) => {
      if (currentValue === null || currentValue === undefined) return;

      const metricKey = metric as keyof PerformanceBaseline;
      const baselineValue = baseline[metricKey];

      // Skip non-numeric metrics
      if (
        metricKey === "timestamp" ||
        metricKey === "version" ||
        metricKey === "environment"
      ) {
        return;
      }

      const threshold =
        this.regressionThresholds[
          metricKey as keyof typeof this.regressionThresholds
        ];

      if (
        typeof baselineValue === "number" &&
        typeof currentValue === "number"
      ) {
        const change = currentValue - baselineValue;
        const changePercent =
          baselineValue > 0 ? (change / baselineValue) * 100 : 0;
        const isRegression = changePercent > threshold * 100;

        let severity: "low" | "medium" | "high" = "low";
        if (changePercent > threshold * 200) {
          severity = "high";
        } else if (changePercent > threshold * 150) {
          severity = "medium";
        }

        results.push({
          metric: metricKey,
          baseline: baselineValue,
          current: currentValue,
          change,
          changePercent,
          isRegression,
          severity,
        });
      }
    });

    return results;
  }

  // Generate regression report
  public generateRegressionReport(
    environment: "development" | "production" | "staging",
    currentMetrics: Partial<PerformanceBaseline>,
  ): {
    hasRegressions: boolean;
    regressions: RegressionResult[];
    improvements: RegressionResult[];
    summary: {
      totalChecks: number;
      regressionCount: number;
      improvementCount: number;
      highSeverityCount: number;
    };
  } {
    const results = this.checkRegression(environment, currentMetrics);
    const regressions = results.filter((r) => r.isRegression);
    const improvements = results.filter((r) => !r.isRegression && r.change < 0);

    return {
      hasRegressions: regressions.length > 0,
      regressions,
      improvements,
      summary: {
        totalChecks: results.length,
        regressionCount: regressions.length,
        improvementCount: improvements.length,
        highSeverityCount: regressions.filter((r) => r.severity === "high")
          .length,
      },
    };
  }

  // Get all baselines
  public getBaselines(): Map<string, PerformanceBaseline> {
    return new Map(this.baselines);
  }

  // Clear baselines
  public clearBaselines(): void {
    this.baselines.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem("performance-baselines");
    }
  }
}

// Performance test runner
export class PerformanceTestRunner {
  private detector: PerformanceRegressionDetector;

  constructor() {
    this.detector = new PerformanceRegressionDetector();
  }

  // Run performance test suite
  public async runPerformanceTests(): Promise<{
    metrics: PerformanceBaseline;
    regressionReport: ReturnType<
      PerformanceRegressionDetector["generateRegressionReport"]
    >;
    recommendations: string[];
  }> {
    const metrics = await this.collectMetrics();
    const environment = process.env.NODE_ENV as "development" | "production";
    const regressionReport = this.detector.generateRegressionReport(
      environment,
      metrics,
    );
    const recommendations = this.generateRecommendations(
      metrics,
      regressionReport,
    );

    return {
      metrics,
      regressionReport,
      recommendations,
    };
  }

  // Collect current performance metrics
  private async collectMetrics(): Promise<PerformanceBaseline> {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceBaseline> = {};

      // Collect Core Web Vitals
      if ("PerformanceObserver" in window) {
        let collectedCount = 0;
        const targetCount = 3; // LCP, FID, CLS

        const checkComplete = () => {
          collectedCount++;
          if (collectedCount >= targetCount) {
            resolve({
              lcp: metrics.lcp || 0,
              fid: metrics.fid || 0,
              cls: metrics.cls || 0,
              ttfb: metrics.ttfb || 0,
              fcp: metrics.fcp || 0,
              bundleSize: this.estimateBundleSize(),
              timestamp: Date.now(),
              version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
              environment: process.env.NODE_ENV as "development" | "production",
            });
          }
        };

        // LCP
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[
              entries.length - 1
            ] as PerformanceEntry & {
              startTime: number;
            };
            metrics.lcp = lastEntry.startTime;
            checkComplete();
          });
          lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        } catch {
          checkComplete();
        }

        // FID
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fidEntry = entry as PerformanceEntry & {
                processingStart: number;
                startTime: number;
              };
              if ("processingStart" in fidEntry && "startTime" in fidEntry) {
                metrics.fid = fidEntry.processingStart - fidEntry.startTime;
              }
            });
            checkComplete();
          });
          fidObserver.observe({ entryTypes: ["first-input"] });
        } catch {
          checkComplete();
        }

        // CLS
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const clsEntry = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if ("value" in clsEntry && "hadRecentInput" in clsEntry) {
                if (!clsEntry.hadRecentInput) {
                  clsValue += clsEntry.value;
                }
              }
            });
            metrics.cls = clsValue;
            checkComplete();
          });
          clsObserver.observe({ entryTypes: ["layout-shift"] });
        } catch {
          checkComplete();
        }

        // TTFB
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          metrics.ttfb = navigation.responseStart - navigation.requestStart;
        }

        // FCP
        const paintEntries = performance.getEntriesByType("paint");
        const fcpEntry = paintEntries.find(
          (entry) => entry.name === "first-contentful-paint",
        );
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
        }

        // Fallback timeout
        setTimeout(() => {
          resolve({
            lcp: metrics.lcp || 0,
            fid: metrics.fid || 0,
            cls: metrics.cls || 0,
            ttfb: metrics.ttfb || 0,
            fcp: metrics.fcp || 0,
            bundleSize: this.estimateBundleSize(),
            timestamp: Date.now(),
            version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
            environment: process.env.NODE_ENV as "development" | "production",
          });
        }, 5000);
      } else {
        // Fallback for browsers without PerformanceObserver
        resolve({
          lcp: 0,
          fid: 0,
          cls: 0,
          ttfb: 0,
          fcp: 0,
          bundleSize: this.estimateBundleSize(),
          timestamp: Date.now(),
          version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
          environment: process.env.NODE_ENV as "development" | "production",
        });
      }
    });
  }

  // Estimate bundle size
  private estimateBundleSize(): number {
    // This would typically be provided by webpack stats
    // For now, estimate based on loaded resources
    const resources = performance.getEntriesByType("resource");
    const jsResources = resources.filter(
      (resource) =>
        resource.name.includes(".js") && resource.name.includes("_next/static"),
    );

    return (
      jsResources.reduce((total, resource) => {
        const resourceEntry = resource as PerformanceEntry & {
          transferSize?: number;
        };
        return total + (resourceEntry.transferSize || 0);
      }, 0) / 1024
    ); // Convert to KB
  }

  // Generate performance recommendations
  private generateRecommendations(
    metrics: PerformanceBaseline,
    regressionReport: ReturnType<
      PerformanceRegressionDetector["generateRegressionReport"]
    >,
  ): string[] {
    const recommendations: string[] = [];

    // Check against Core Web Vitals thresholds
    if (metrics.lcp > CORE_WEB_VITALS_THRESHOLDS.LCP.GOOD) {
      recommendations.push(
        "LCP optimization needed: Preload critical resources, optimize images, improve server response time",
      );
    }

    if (metrics.fid > CORE_WEB_VITALS_THRESHOLDS.FID.GOOD) {
      recommendations.push(
        "FID optimization needed: Break up long tasks, defer non-critical JavaScript, optimize event handlers",
      );
    }

    if (metrics.cls > CORE_WEB_VITALS_THRESHOLDS.CLS.GOOD) {
      recommendations.push(
        "CLS optimization needed: Set explicit image dimensions, avoid layout shifts, optimize font loading",
      );
    }

    // Add regression-specific recommendations
    regressionReport.regressions.forEach((regression) => {
      if (regression.severity === "high") {
        recommendations.push(
          `Critical regression in ${regression.metric}: ${regression.changePercent.toFixed(1)}% increase from baseline`,
        );
      }
    });

    // Bundle size recommendations
    if (metrics.bundleSize > 1024) {
      // 1MB
      recommendations.push(
        "Bundle size optimization needed: Implement code splitting, remove unused dependencies, optimize imports",
      );
    }

    return recommendations;
  }

  // Set baseline for current environment
  public setBaseline(): void {
    this.collectMetrics().then((metrics) => {
      const environment = process.env.NODE_ENV as "development" | "production";
      this.detector.setBaseline(environment, metrics);
      if (process.env.NODE_ENV === "development") {
        console.log(`Performance baseline set for ${environment}:`, metrics);
      }
    });
  }
}

// Initialize performance regression testing
export const initializePerformanceRegression = (): PerformanceTestRunner => {
  const testRunner = new PerformanceTestRunner();

  // Set baseline on first load in development
  if (process.env.NODE_ENV === "development") {
    setTimeout(() => {
      testRunner.setBaseline();
    }, 3000); // Wait for page to stabilize
  }

  return testRunner;
};
