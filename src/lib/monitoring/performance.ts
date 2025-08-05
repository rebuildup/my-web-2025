/**
 * Performance Monitoring
 * Web Vitals and custom performance metrics tracking
 */

import { getProductionConfig } from "@/lib/config/production";
import { capturePerformance } from "./sentry";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

export interface WebGLPerformanceMetric {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  textureMemory: number;
  drawCalls: number;
  triangles: number;
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  const config = getProductionConfig();

  if (!config.monitoring.performance.webVitals) {
    return;
  }

  // Dynamic import to avoid bundling in development
  if (typeof window !== "undefined") {
    import("web-vitals")
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(onPerfEntry);
        onINP(onPerfEntry);
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
      })
      .catch(() => {
        console.warn(
          "web-vitals not available, skipping Web Vitals monitoring",
        );
      });
  }
}

/**
 * Handle performance entry
 */
function onPerfEntry(metric: PerformanceMetric): void {
  const config = getProductionConfig();

  // Send to analytics
  if (
    config.monitoring.analytics.enabled &&
    typeof window !== "undefined" &&
    window.gtag
  ) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      non_interaction: true,
    });
  }

  // Send to Sentry
  capturePerformance(metric.name, metric.value);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
  }

  // Send to custom endpoint
  sendPerformanceMetric(metric);
}

/**
 * Send performance metric to custom endpoint
 */
async function sendPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  try {
    await fetch("/api/monitoring/performance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (error) {
    console.error("Failed to send performance metric:", error);
  }
}

/**
 * Monitor WebGL performance
 */
export class WebGLPerformanceMonitor {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private isMonitoring = false;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Start monitoring
   */
  start(): void {
    const config = getProductionConfig();

    if (!config.webgl.performanceMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.frameCount++;

    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = 1000 / this.frameTime;

      // Send metrics if FPS is below threshold
      if (this.fps < 30) {
        this.sendWebGLMetrics();
      }
    }

    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): WebGLPerformanceMetric {
    // Memory info extension for future use
    // const memoryInfo = (this.gl as WebGLRenderingContext).getExtension(
    //   "WEBGL_debug_renderer_info"
    // );

    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.getMemoryUsage(),
      textureMemory: this.getTextureMemory(),
      drawCalls: this.getDrawCalls(),
      triangles: this.getTriangleCount(),
    };
  }

  /**
   * Send WebGL metrics
   */
  private async sendWebGLMetrics(): Promise<void> {
    const metrics = this.getMetrics();

    try {
      await fetch("/api/monitoring/webgl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: Date.now(),
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error("Failed to send WebGL metrics:", error);
    }

    // Send to Sentry
    capturePerformance("webgl.fps", metrics.fps);
    capturePerformance("webgl.memory", metrics.memoryUsage);
  }

  /**
   * Get memory usage (approximate)
   */
  private getMemoryUsage(): number {
    const perfWithMemory = performance as unknown as {
      memory?: { usedJSHeapSize: number };
    };
    if (perfWithMemory.memory) {
      return perfWithMemory.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get texture memory usage (approximate)
   */
  private getTextureMemory(): number {
    // This is an approximation - actual texture memory is hard to measure
    const canvas = this.gl.canvas as HTMLCanvasElement;
    return (canvas.width * canvas.height * 4) / 1024 / 1024; // MB
  }

  /**
   * Get draw calls count (approximate)
   */
  private getDrawCalls(): number {
    // This would need to be tracked manually in the application
    return 0;
  }

  /**
   * Get triangle count (approximate)
   */
  private getTriangleCount(): number {
    // This would need to be tracked manually in the application
    return 0;
  }
}

/**
 * Monitor page load performance
 */
export function monitorPageLoad(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    // Navigation timing
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl:
          navigation.secureConnectionStart > 0
            ? navigation.connectEnd - navigation.secureConnectionStart
            : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        domReady:
          navigation.domContentLoadedEventEnd -
          (navigation as unknown as { navigationStart: number })
            .navigationStart,
        pageLoad:
          navigation.loadEventEnd -
          (navigation as unknown as { navigationStart: number })
            .navigationStart,
      };

      // Send metrics
      Object.entries(metrics).forEach(([name, value]) => {
        if (value > 0) {
          capturePerformance(`page.${name}`, value);
        }
      });
    }

    // Resource timing
    const resources = performance.getEntriesByType("resource");
    const slowResources = resources.filter(
      (resource) => resource.duration > 1000,
    );

    if (slowResources.length > 0) {
      capturePerformance("page.slowResources", slowResources.length);
    }
  });
}

/**
 * Monitor memory usage
 */
export function monitorMemoryUsage(): void {
  const perfWithMemory = performance as unknown as {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
  if (typeof window === "undefined" || !perfWithMemory.memory) {
    return;
  }

  setInterval(() => {
    const memory = perfWithMemory.memory!;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const totalMB = memory.totalJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

    // Alert if memory usage is high
    if (usedMB > limitMB * 0.8) {
      capturePerformance("memory.high", usedMB);
    }

    // Send periodic memory metrics
    if (Math.random() < 0.1) {
      // 10% sampling
      capturePerformance("memory.used", usedMB);
      capturePerformance("memory.total", totalMB);
    }
  }, 30000); // Check every 30 seconds
}
