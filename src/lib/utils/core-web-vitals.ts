/**
 * Core Web Vitals optimization and monitoring
 * Implements LCP, FID, CLS optimization strategies and measurement
 */

// Core Web Vitals thresholds
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: {
    GOOD: 2500, // ≤ 2.5s
    NEEDS_IMPROVEMENT: 4000, // 2.5s - 4.0s
  },
  FID: {
    GOOD: 100, // ≤ 100ms
    NEEDS_IMPROVEMENT: 300, // 100ms - 300ms
  },
  CLS: {
    GOOD: 0.1, // ≤ 0.1
    NEEDS_IMPROVEMENT: 0.25, // 0.1 - 0.25
  },
  INP: {
    GOOD: 200, // ≤ 200ms (Interaction to Next Paint)
    NEEDS_IMPROVEMENT: 500, // 200ms - 500ms
  },
} as const;

// Core Web Vitals metrics interface
export interface CoreWebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  fcp: number | null;
}

// Performance rating
export type PerformanceRating = "good" | "needs-improvement" | "poor";

// Core Web Vitals monitor class
export class CoreWebVitalsMonitor {
  private metrics: CoreWebVitalsMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    ttfb: null,
    fcp: null,
  };

  private observers: PerformanceObserver[] = [];
  private callbacks: Set<(metrics: CoreWebVitalsMetrics) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint (LCP)
    this.observeMetric("largest-contentful-paint", (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      this.metrics.lcp = lastEntry.startTime;
      this.notifyCallbacks();
    });

    // First Input Delay (FID)
    this.observeMetric("first-input", (entries) => {
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart: number;
          startTime: number;
        };
        if ("processingStart" in fidEntry && "startTime" in fidEntry) {
          this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          this.notifyCallbacks();
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric("layout-shift", (entries) => {
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
      this.metrics.cls = clsValue;
      this.notifyCallbacks();
    });

    // Interaction to Next Paint (INP) - newer metric
    this.observeMetric("event", (entries) => {
      entries.forEach(
        (
          entry: PerformanceEntry & {
            duration: number;
            interactionId?: number;
          },
        ) => {
          if (entry.interactionId) {
            this.metrics.inp = entry.duration;
            this.notifyCallbacks();
          }
        },
      );
    });

    // First Contentful Paint (FCP)
    this.observeMetric("paint", (entries) => {
      entries.forEach(
        (
          entry: PerformanceEntry & {
            name: string;
            startTime: number;
          },
        ) => {
          if (entry.name === "first-contentful-paint") {
            this.metrics.fcp = entry.startTime;
            this.notifyCallbacks();
          }
        },
      );
    });

    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  private observeMetric(
    entryType: string,
    callback: (entries: PerformanceEntry[]) => void,
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      this.notifyCallbacks();
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback({ ...this.metrics });
      } catch (error) {
        console.error("Core Web Vitals callback error:", error);
      }
    });
  }

  // Subscribe to metrics updates
  public subscribe(
    callback: (metrics: CoreWebVitalsMetrics) => void,
  ): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Get current metrics
  public getMetrics(): CoreWebVitalsMetrics {
    return { ...this.metrics };
  }

  // Get performance rating for a metric
  public static getRating(
    metric: keyof CoreWebVitalsMetrics,
    value: number | null,
  ): PerformanceRating {
    if (value === null) return "poor";

    switch (metric) {
      case "lcp":
        return value <= CORE_WEB_VITALS_THRESHOLDS.LCP.GOOD
          ? "good"
          : value <= CORE_WEB_VITALS_THRESHOLDS.LCP.NEEDS_IMPROVEMENT
            ? "needs-improvement"
            : "poor";

      case "fid":
        return value <= CORE_WEB_VITALS_THRESHOLDS.FID.GOOD
          ? "good"
          : value <= CORE_WEB_VITALS_THRESHOLDS.FID.NEEDS_IMPROVEMENT
            ? "needs-improvement"
            : "poor";

      case "cls":
        return value <= CORE_WEB_VITALS_THRESHOLDS.CLS.GOOD
          ? "good"
          : value <= CORE_WEB_VITALS_THRESHOLDS.CLS.NEEDS_IMPROVEMENT
            ? "needs-improvement"
            : "poor";

      case "inp":
        return value <= CORE_WEB_VITALS_THRESHOLDS.INP.GOOD
          ? "good"
          : value <= CORE_WEB_VITALS_THRESHOLDS.INP.NEEDS_IMPROVEMENT
            ? "needs-improvement"
            : "poor";

      default:
        return "poor";
    }
  }

  // Generate performance report
  public generateReport(): {
    metrics: CoreWebVitalsMetrics;
    ratings: Record<keyof CoreWebVitalsMetrics, PerformanceRating>;
    score: number;
    recommendations: string[];
  } {
    const ratings = {
      lcp: CoreWebVitalsMonitor.getRating("lcp", this.metrics.lcp),
      fid: CoreWebVitalsMonitor.getRating("fid", this.metrics.fid),
      cls: CoreWebVitalsMonitor.getRating("cls", this.metrics.cls),
      inp: CoreWebVitalsMonitor.getRating("inp", this.metrics.inp),
      ttfb: "good" as PerformanceRating, // TTFB doesn't have standard thresholds
      fcp: "good" as PerformanceRating, // FCP doesn't have standard thresholds
    };

    // Calculate overall score (0-100)
    const goodCount = Object.values(ratings).filter(
      (rating) => rating === "good",
    ).length;
    const totalMetrics = Object.keys(ratings).length;
    const score = Math.round((goodCount / totalMetrics) * 100);

    // Generate recommendations
    const recommendations: string[] = [];

    if (ratings.lcp !== "good") {
      recommendations.push(
        "Optimize Largest Contentful Paint: Use Next.js Image optimization, preload critical resources, optimize server response time",
      );
    }

    if (ratings.fid !== "good") {
      recommendations.push(
        "Improve First Input Delay: Break up long tasks, use code splitting, defer non-critical JavaScript",
      );
    }

    if (ratings.cls !== "good") {
      recommendations.push(
        "Reduce Cumulative Layout Shift: Set explicit dimensions for images, avoid inserting content above existing content",
      );
    }

    if (ratings.inp !== "good") {
      recommendations.push(
        "Optimize Interaction to Next Paint: Optimize event handlers, use requestIdleCallback for non-urgent tasks",
      );
    }

    return {
      metrics: this.metrics,
      ratings,
      score,
      recommendations,
    };
  }

  // Cleanup observers
  public cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.callbacks.clear();
  }
}

// LCP optimization utilities
export class LCPOptimizer {
  // Preload critical resources
  public static preloadCriticalResources(): void {
    const criticalResources = [
      { href: "/images/og-image.jpg", as: "image" },
      { href: "/favicon.ico", as: "image" },
    ];

    criticalResources.forEach(({ href, as }) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = as;
      if (as === "image") {
        link.type = "image/jpeg";
      }
      document.head.appendChild(link);
    });
  }

  // Optimize font loading
  public static optimizeFontLoading(): void {
    // Add font-display: swap to existing font declarations
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'neue-haas-grotesk-display';
        font-display: swap;
      }
      @font-face {
        font-family: 'zen-kaku-gothic-new';
        font-display: swap;
      }
      @font-face {
        font-family: 'Noto Sans JP';
        font-display: swap;
      }
      @font-face {
        font-family: 'Shippori Antique B1';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  // Optimize critical CSS
  public static inlineCriticalCSS(): void {
    // This would typically be done at build time
    // For now, we ensure critical styles are loaded first
    const criticalStyles = `
      body { 
        font-family: 'Noto Sans JP', sans-serif; 
        background: #222222; 
        color: #ffffff; 
      }
      .container-system { 
        width: 100%; 
        margin: 0 auto; 
        padding: 0 1rem; 
      }
    `;

    const style = document.createElement("style");
    style.textContent = criticalStyles;
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// FID optimization utilities
export class FIDOptimizer {
  // Break up long tasks
  public static breakUpLongTasks<T>(
    items: T[],
    processor: (item: T) => void,
    batchSize: number = 5,
  ): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;

      function processBatch() {
        const endIndex = Math.min(index + batchSize, items.length);

        for (let i = index; i < endIndex; i++) {
          processor(items[i]);
        }

        index = endIndex;

        if (index < items.length) {
          // Use scheduler API if available, otherwise setTimeout
          if (
            "scheduler" in window &&
            "postTask" in
              (
                window as Window & {
                  scheduler: {
                    postTask: (
                      fn: () => void,
                      options: { priority: string },
                    ) => void;
                  };
                }
              ).scheduler
          ) {
            (
              window as Window & {
                scheduler: {
                  postTask: (
                    fn: () => void,
                    options: { priority: string },
                  ) => void;
                };
              }
            ).scheduler.postTask(processBatch, {
              priority: "user-blocking",
            });
          } else {
            setTimeout(processBatch, 0);
          }
        } else {
          resolve();
        }
      }

      processBatch();
    });
  }

  // Defer non-critical JavaScript
  public static deferNonCriticalJS(): void {
    // Defer analytics and other non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer="true"]');
    scripts.forEach((script) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          script.removeAttribute("data-defer");
        });
      } else {
        setTimeout(() => {
          script.removeAttribute("data-defer");
        }, 1000);
      }
    });
  }

  // Optimize event handlers
  public static optimizeEventHandlers(): void {
    // Use passive event listeners where possible
    const passiveEvents = ["touchstart", "touchmove", "wheel", "scroll"];

    passiveEvents.forEach((eventType) => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new Event("optimizedResize"));
      }, 100);
    });
  }
}

// CLS optimization utilities
export class CLSOptimizer {
  // Set explicit dimensions for images
  public static setImageDimensions(): void {
    const images = document.querySelectorAll("img:not([width]):not([height])");
    images.forEach((img) => {
      // Set aspect ratio to prevent layout shift
      (img as HTMLImageElement).style.aspectRatio = "16 / 9";
      (img as HTMLImageElement).style.width = "100%";
      (img as HTMLImageElement).style.height = "auto";
    });
  }

  // Reserve space for dynamic content
  public static reserveSpaceForDynamicContent(): void {
    // Add skeleton screens for loading states
    const loadingElements = document.querySelectorAll('[data-loading="true"]');
    loadingElements.forEach((element) => {
      element.classList.add("animate-pulse", "bg-gray-200");
    });
  }

  // Optimize font loading to prevent FOIT/FOUT
  public static optimizeFontLoading(): void {
    // Use font-display: swap and preload fonts
    const fontPreloads = [
      "/fonts/neue-haas-grotesk-display.woff2",
      "/fonts/zen-kaku-gothic-new.woff2",
    ];

    fontPreloads.forEach((fontUrl) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = fontUrl;
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets = {
    lcp: CORE_WEB_VITALS_THRESHOLDS.LCP.GOOD,
    fid: CORE_WEB_VITALS_THRESHOLDS.FID.GOOD,
    cls: CORE_WEB_VITALS_THRESHOLDS.CLS.GOOD,
    bundleSize: 1024, // KB
    imageSize: 500, // KB per page
  };

  private violations: Array<{
    metric: string;
    value: number;
    budget: number;
    timestamp: number;
  }> = [];

  public checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets[metric as keyof typeof this.budgets];
    if (!budget) return true;

    const isWithinBudget = value <= budget;

    if (!isWithinBudget) {
      this.violations.push({
        metric,
        value,
        budget,
        timestamp: Date.now(),
      });

      // Log violation in development
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Performance budget violation: ${metric} = ${value} (budget: ${budget})`,
        );
      }
    }

    return isWithinBudget;
  }

  public getViolations(): typeof this.violations {
    return [...this.violations];
  }

  public clearViolations(): void {
    this.violations = [];
  }
}

// Initialize Core Web Vitals monitoring
export const initializeCoreWebVitals = (): CoreWebVitalsMonitor => {
  const monitor = new CoreWebVitalsMonitor();

  // Apply optimizations
  if (typeof window !== "undefined") {
    // LCP optimizations
    LCPOptimizer.preloadCriticalResources();
    LCPOptimizer.optimizeFontLoading();
    LCPOptimizer.inlineCriticalCSS();

    // FID optimizations
    FIDOptimizer.deferNonCriticalJS();
    FIDOptimizer.optimizeEventHandlers();

    // CLS optimizations
    CLSOptimizer.setImageDimensions();
    CLSOptimizer.reserveSpaceForDynamicContent();
    CLSOptimizer.optimizeFontLoading();

    // Monitor and report
    monitor.subscribe((metrics) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Core Web Vitals:", metrics);
      }

      // Send to analytics in production
      if (
        process.env.NODE_ENV === "production" &&
        typeof window !== "undefined" &&
        window.gtag
      ) {
        Object.entries(metrics).forEach(([metric, value]) => {
          if (value !== null && window.gtag) {
            window.gtag("event", "core_web_vitals", {
              metric_name: metric,
              metric_value: value,
              custom_parameter: "performance_monitoring",
            });
          }
        });
      }
    });
  }

  return monitor;
};
