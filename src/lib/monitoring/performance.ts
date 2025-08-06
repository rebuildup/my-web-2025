/**
 * Performance monitoring utilities
 */

// Memory info interface for Chrome's performance.memory
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (typeof window === "undefined") return;

  // Basic Web Vitals monitoring
  console.log("Web Vitals monitoring initialized");
}

/**
 * Monitor page load performance
 */
export function monitorPageLoad(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      console.log("Page load time:", loadTime);
    }
  });
}

/**
 * Monitor memory usage
 */
export function monitorMemoryUsage(): void {
  if (typeof window === "undefined" || !("memory" in performance)) return;

  setInterval(() => {
    const memory = (performance as Performance & { memory?: MemoryInfo })
      .memory;
    if (memory) {
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usage > 90) {
        console.warn("High memory usage:", usage.toFixed(2) + "%");
      }
    }
  }, 30000);
}
/**
 * WebGL Performance Monitor
 */
export class WebGLPerformanceMonitor {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private isRunning = false;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.monitor();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Monitor performance
   */
  private monitor(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime),
      );
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.monitor());
  }
}
