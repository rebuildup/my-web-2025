/**
 * Performance monitoring and alerting system
 * Implements real-time performance tracking with alerts and optimization suggestions
 */

export interface PerformanceThresholds {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  memoryUsage: number; // Memory usage percentage
  bundleSize: number; // Bundle size (KB)
}

export interface PerformanceAlert {
  type: "warning" | "error" | "info";
  metric: keyof PerformanceThresholds;
  value: number;
  threshold: number;
  message: string;
  suggestions: string[];
  timestamp: number;
}

export class PerformanceAlerting {
  private thresholds: PerformanceThresholds = {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    fcp: 1800, // 1.8s
    ttfb: 600, // 600ms
    memoryUsage: 80, // 80%
    bundleSize: 1024, // 1MB
  };

  private alerts: PerformanceAlert[] = [];
  private callbacks: Set<(alert: PerformanceAlert) => void> = new Set();

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }
  }

  // Check performance metric against threshold
  public checkMetric(
    metric: keyof PerformanceThresholds,
    value: number,
  ): PerformanceAlert | null {
    const threshold = this.thresholds[metric];
    let alertType: "warning" | "error" | "info" = "info";
    let message = "";
    let suggestions: string[] = [];

    // Determine alert type and message based on metric
    switch (metric) {
      case "lcp":
        if (value > threshold * 1.5) {
          alertType = "error";
          message = `Largest Contentful Paint is critically slow: ${value}ms`;
          suggestions = [
            "Optimize images with WebP format and proper sizing",
            "Implement critical CSS inlining",
            "Use Next.js Image component with priority loading",
            "Consider server-side rendering optimization",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `Largest Contentful Paint exceeds threshold: ${value}ms`;
          suggestions = [
            "Preload critical resources",
            "Optimize font loading with font-display: swap",
            "Reduce render-blocking resources",
          ];
        }
        break;

      case "fid":
        if (value > threshold * 2) {
          alertType = "error";
          message = `First Input Delay is critically high: ${value}ms`;
          suggestions = [
            "Break up long-running JavaScript tasks",
            "Use code splitting and dynamic imports",
            "Implement proper event delegation",
            "Consider using Web Workers for heavy computations",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `First Input Delay exceeds threshold: ${value}ms`;
          suggestions = [
            "Defer non-critical JavaScript",
            "Optimize event handlers",
            "Use requestIdleCallback for non-urgent tasks",
          ];
        }
        break;

      case "cls":
        if (value > threshold * 2) {
          alertType = "error";
          message = `Cumulative Layout Shift is critically high: ${value}`;
          suggestions = [
            "Set explicit dimensions for images and videos",
            "Reserve space for dynamic content",
            "Avoid inserting content above existing content",
            "Use CSS aspect-ratio for responsive elements",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `Cumulative Layout Shift exceeds threshold: ${value}`;
          suggestions = [
            "Preload fonts to prevent font swap",
            "Use skeleton screens for loading states",
            "Avoid dynamically injected content",
          ];
        }
        break;

      case "fcp":
        if (value > threshold * 1.5) {
          alertType = "error";
          message = `First Contentful Paint is critically slow: ${value}ms`;
          suggestions = [
            "Optimize critical rendering path",
            "Inline critical CSS",
            "Minimize render-blocking resources",
            "Use HTTP/2 server push for critical resources",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `First Contentful Paint exceeds threshold: ${value}ms`;
          suggestions = [
            "Optimize server response time",
            "Use CDN for static assets",
            "Implement resource hints (preconnect, dns-prefetch)",
          ];
        }
        break;

      case "ttfb":
        if (value > threshold * 2) {
          alertType = "error";
          message = `Time to First Byte is critically slow: ${value}ms`;
          suggestions = [
            "Optimize server-side processing",
            "Implement proper caching strategies",
            "Use CDN for global content delivery",
            "Optimize database queries",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `Time to First Byte exceeds threshold: ${value}ms`;
          suggestions = [
            "Enable server-side caching",
            "Optimize API response times",
            "Use edge computing for dynamic content",
          ];
        }
        break;

      case "memoryUsage":
        if (value > threshold * 1.2) {
          alertType = "error";
          message = `Memory usage is critically high: ${value}%`;
          suggestions = [
            "Implement proper cleanup for Three.js/PIXI.js objects",
            "Use memory profiling to identify leaks",
            "Optimize image and video memory usage",
            "Implement lazy loading for heavy components",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `Memory usage exceeds threshold: ${value}%`;
          suggestions = [
            "Review component lifecycle and cleanup",
            "Optimize data structures and caching",
            "Use object pooling for frequently created objects",
          ];
        }
        break;

      case "bundleSize":
        if (value > threshold * 1.5) {
          alertType = "error";
          message = `Bundle size is critically large: ${value}KB`;
          suggestions = [
            "Implement aggressive code splitting",
            "Remove unused dependencies",
            "Use dynamic imports for heavy libraries",
            "Optimize webpack configuration",
          ];
        } else if (value > threshold) {
          alertType = "warning";
          message = `Bundle size exceeds threshold: ${value}KB`;
          suggestions = [
            "Analyze bundle with webpack-bundle-analyzer",
            "Implement tree shaking",
            "Use lighter alternatives for heavy libraries",
          ];
        }
        break;
    }

    if (alertType !== "info") {
      const alert: PerformanceAlert = {
        type: alertType,
        metric,
        value,
        threshold,
        message,
        suggestions,
        timestamp: Date.now(),
      };

      this.alerts.push(alert);
      this.notifyCallbacks(alert);

      // Log alert in development
      if (process.env.NODE_ENV === "development") {
        console.group(`Performance Alert: ${alertType.toUpperCase()}`);
        console.log(message);
        console.log("Suggestions:", suggestions);
        console.groupEnd();
      }

      return alert;
    }

    return null;
  }

  // Subscribe to performance alerts
  public subscribe(callback: (alert: PerformanceAlert) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Notify all subscribers
  private notifyCallbacks(alert: PerformanceAlert): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        console.error("Performance alert callback error:", error);
      }
    });
  }

  // Get all alerts
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  // Clear alerts
  public clearAlerts(): void {
    this.alerts = [];
  }

  // Get alerts by type
  public getAlertsByType(
    type: "warning" | "error" | "info",
  ): PerformanceAlert[] {
    return this.alerts.filter((alert) => alert.type === type);
  }

  // Get alerts by metric
  public getAlertsByMetric(
    metric: keyof PerformanceThresholds,
  ): PerformanceAlert[] {
    return this.alerts.filter((alert) => alert.metric === metric);
  }

  // Update thresholds
  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Generate performance report
  public generateReport(): {
    summary: {
      totalAlerts: number;
      errorCount: number;
      warningCount: number;
      infoCount: number;
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const errorAlerts = this.getAlertsByType("error");
    const warningAlerts = this.getAlertsByType("warning");
    const infoAlerts = this.getAlertsByType("info");

    // Generate prioritized recommendations
    const recommendations = new Set<string>();

    // Add suggestions from error alerts first
    errorAlerts.forEach((alert) => {
      alert.suggestions.forEach((suggestion) =>
        recommendations.add(suggestion),
      );
    });

    // Add suggestions from warning alerts
    warningAlerts.forEach((alert) => {
      alert.suggestions.forEach((suggestion) =>
        recommendations.add(suggestion),
      );
    });

    return {
      summary: {
        totalAlerts: this.alerts.length,
        errorCount: errorAlerts.length,
        warningCount: warningAlerts.length,
        infoCount: infoAlerts.length,
      },
      alerts: this.alerts,
      recommendations: Array.from(recommendations),
    };
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets: Record<string, number> = {
    "initial-js": 200, // KB
    "initial-css": 50, // KB
    images: 500, // KB per page
    fonts: 100, // KB
    "total-page-size": 1000, // KB
  };

  private usage: Record<string, number> = {};

  constructor(customBudgets?: Record<string, number>) {
    if (customBudgets) {
      this.budgets = { ...this.budgets, ...customBudgets };
    }
  }

  // Track resource usage
  public trackUsage(category: string, size: number): void {
    this.usage[category] = (this.usage[category] || 0) + size;
  }

  // Check if budget is exceeded
  public checkBudget(category: string): {
    exceeded: boolean;
    usage: number;
    budget: number;
    percentage: number;
  } {
    const usage = this.usage[category] || 0;
    const budget = this.budgets[category] || Infinity;
    const percentage = (usage / budget) * 100;

    return {
      exceeded: usage > budget,
      usage,
      budget,
      percentage,
    };
  }

  // Get budget status for all categories
  public getBudgetStatus(): Record<
    string,
    {
      exceeded: boolean;
      usage: number;
      budget: number;
      percentage: number;
    }
  > {
    const status: Record<
      string,
      {
        exceeded: boolean;
        usage: number;
        budget: number;
        percentage: number;
      }
    > = {};

    Object.keys(this.budgets).forEach((category) => {
      status[category] = this.checkBudget(category);
    });

    return status;
  }

  // Reset usage tracking
  public resetUsage(): void {
    this.usage = {};
  }
}

// Real-time performance monitoring
export class RealTimeMonitor {
  private alerting: PerformanceAlerting;
  private budget: PerformanceBudget;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    thresholds?: Partial<PerformanceThresholds>,
    budgets?: Record<string, number>,
  ) {
    this.alerting = new PerformanceAlerting(thresholds);
    this.budget = new PerformanceBudget(budgets);
  }

  // Start monitoring
  public startMonitoring(interval: number = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceMetrics();
    }, interval);

    if (process.env.NODE_ENV === "development") {
      console.log("Performance monitoring started");
    }
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Performance monitoring stopped");
    }
  }

  // Check all performance metrics
  private checkPerformanceMetrics(): void {
    if (typeof window === "undefined") return;

    // Check Core Web Vitals
    this.checkCoreWebVitals();

    // Check memory usage
    this.checkMemoryUsage();

    // Check bundle size
    this.checkBundleSize();
  }

  // Check Core Web Vitals
  private checkCoreWebVitals(): void {
    if ("PerformanceObserver" in window) {
      // This would be integrated with the PerformanceMonitor class
      // For now, we'll simulate some checks
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        // Check TTFB
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.alerting.checkMetric("ttfb", ttfb);
      }
    }
  }

  // Check memory usage
  private checkMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (
        performance as Performance & {
          memory: {
            usedJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.alerting.checkMetric("memoryUsage", usage);
    }
  }

  // Check bundle size
  private checkBundleSize(): void {
    // This would integrate with webpack stats or Next.js build info
    // For now, we'll simulate a check
    if (
      typeof window !== "undefined" &&
      (window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__
    ) {
      // Estimate bundle size based on loaded chunks
      const estimatedSize = 800; // KB - this would be calculated from actual bundle
      this.alerting.checkMetric("bundleSize", estimatedSize);
    }
  }

  // Get alerting instance
  public getAlerting(): PerformanceAlerting {
    return this.alerting;
  }

  // Get budget instance
  public getBudget(): PerformanceBudget {
    return this.budget;
  }

  // Generate comprehensive report
  public generateReport(): {
    performance: ReturnType<PerformanceAlerting["generateReport"]>;
    budget: ReturnType<PerformanceBudget["getBudgetStatus"]>;
    timestamp: number;
  } {
    return {
      performance: this.alerting.generateReport(),
      budget: this.budget.getBudgetStatus(),
      timestamp: Date.now(),
    };
  }
}

// Initialize performance monitoring
export const initializePerformanceAlerting = (
  thresholds?: Partial<PerformanceThresholds>,
  budgets?: Record<string, number>,
): RealTimeMonitor => {
  const monitor = new RealTimeMonitor(thresholds, budgets);

  // Start monitoring in development
  if (process.env.NODE_ENV === "development") {
    monitor.startMonitoring(10000); // Check every 10 seconds in dev
  } else {
    monitor.startMonitoring(30000); // Check every 30 seconds in production
  }

  return monitor;
};
