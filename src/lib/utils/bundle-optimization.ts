/**
 * Bundle Optimization and Code Splitting Utilities
 * Implements dynamic imports and bundle size monitoring
 */

// Dynamic imports for heavy components
export const LazyComponents = {
  // PIXI.js components
  ProtoType: () => import("@/app/tools/ProtoType/components/ProtoTypeApp"),

  // Heavy tool components
  ColorPaletteGenerator: () =>
    import("@/app/tools/color-palette/components/ColorPaletteGenerator"),
  AEExpressionTool: () =>
    import("@/app/tools/ae-expression/components/AEExpressionTool"),

  // Performance monitoring
  CoreWebVitalsDisplay: () => import("@/components/ui/CoreWebVitalsMonitor"),
};

// Bundle size monitoring
export interface BundleInfo {
  totalSize: number;
  chunkSizes: Record<string, number>;
  unusedCode: string[];
  recommendations: string[];
}

export class BundleOptimizer {
  private static instance: BundleOptimizer;
  private loadedChunks: Set<string> = new Set();
  private chunkSizes: Map<string, number> = new Map();

  static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  // Monitor chunk loading
  public monitorChunkLoading(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes("_next/static/chunks/")) {
            const chunkName = this.extractChunkName(entry.name);
            const size = (entry as PerformanceResourceTiming).transferSize || 0;

            this.loadedChunks.add(chunkName);
            this.chunkSizes.set(chunkName, size);

            console.log(
              `Bundle: Loaded chunk ${chunkName} (${this.formatSize(size)})`,
            );

            // Check for large chunks
            if (size > 500 * 1024) {
              // 500KB
              console.warn(
                `Bundle: Large chunk detected: ${chunkName} (${this.formatSize(size)})`,
              );
              this.reportLargeChunk(chunkName, size);
            }
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.warn("Bundle monitoring failed to start:", error);
    }
  }

  // Extract chunk name from URL
  private extractChunkName(url: string): string {
    const match = url.match(/chunks\/(.+?)\.js/);
    return match ? match[1] : "unknown";
  }

  // Format byte size
  private formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Report large chunk
  private reportLargeChunk(chunkName: string, size: number): void {
    if (process.env.NODE_ENV === "production") {
      fetch("/api/monitoring/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "large_chunk_detected",
          chunkName,
          size,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail
      });
    }
  }

  // Get bundle information
  public getBundleInfo(): BundleInfo {
    const totalSize = Array.from(this.chunkSizes.values()).reduce(
      (sum, size) => sum + size,
      0,
    );
    const chunkSizes: Record<string, number> = {};

    this.chunkSizes.forEach((size, name) => {
      chunkSizes[name] = size;
    });

    const recommendations = this.generateRecommendations();

    return {
      totalSize,
      chunkSizes,
      unusedCode: [], // Would need more sophisticated analysis
      recommendations,
    };
  }

  // Generate optimization recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const totalSize = Array.from(this.chunkSizes.values()).reduce(
      (sum, size) => sum + size,
      0,
    );

    if (totalSize > 2 * 1024 * 1024) {
      // 2MB
      recommendations.push(
        "Consider implementing more aggressive code splitting",
      );
    }

    // Check for large individual chunks
    this.chunkSizes.forEach((size, name) => {
      if (size > 500 * 1024) {
        // 500KB
        recommendations.push(
          `Chunk "${name}" is large (${this.formatSize(size)}). Consider splitting further.`,
        );
      }
    });

    // Check for too many small chunks
    const smallChunks = Array.from(this.chunkSizes.values()).filter(
      (size) => size < 10 * 1024,
    ); // 10KB
    if (smallChunks.length > 10) {
      recommendations.push(
        "Consider combining small chunks to reduce HTTP requests",
      );
    }

    return recommendations;
  }

  // Preload critical chunks
  public preloadCriticalChunks(chunkNames: string[]): void {
    chunkNames.forEach((chunkName) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = `/_next/static/chunks/${chunkName}.js`;

      link.onload = () => {
        console.log(`Bundle: Preloaded chunk ${chunkName}`);
      };

      link.onerror = () => {
        console.warn(`Bundle: Failed to preload chunk ${chunkName}`);
      };

      document.head.appendChild(link);
    });
  }

  // Lazy load component with error handling
  public async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
  ): Promise<T> {
    try {
      const startTime = performance.now();
      const moduleResult = await importFn();
      const loadTime = performance.now() - startTime;

      console.log(
        `Bundle: Loaded ${componentName} in ${Math.round(loadTime)}ms`,
      );

      // Report slow loading
      if (loadTime > 2000) {
        // 2 seconds
        console.warn(
          `Bundle: Slow component load: ${componentName} (${Math.round(loadTime)}ms)`,
        );
      }

      return moduleResult.default;
    } catch (error) {
      console.error(`Bundle: Failed to load ${componentName}:`, error);
      throw error;
    }
  }
}

// Resource preloading utilities
export class ResourcePreloader {
  private static preloadedResources: Set<string> = new Set();
  private static preloadQueue: Array<{ url: string; priority: number }> = [];

  // Preload resource with priority
  public static preloadResource(url: string, priority: number = 0): void {
    if (this.preloadedResources.has(url)) return;

    this.preloadQueue.push({ url, priority });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);

    this.processPreloadQueue();
  }

  // Process preload queue
  private static processPreloadQueue(): void {
    if (this.preloadQueue.length === 0) return;

    const { url } = this.preloadQueue.shift()!;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;

    // Determine resource type
    if (url.includes(".woff2") || url.includes(".woff")) {
      link.as = "font";
      link.type = url.includes(".woff2") ? "font/woff2" : "font/woff";
      link.crossOrigin = "anonymous";
    } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = "image";
    } else if (url.includes(".js")) {
      link.as = "script";
    } else if (url.includes(".css")) {
      link.as = "style";
    }

    link.onload = () => {
      console.log("Resource preloaded:", url);
      this.preloadedResources.add(url);

      // Process next item in queue
      setTimeout(() => this.processPreloadQueue(), 100);
    };

    link.onerror = () => {
      console.warn("Failed to preload resource:", url);

      // Process next item in queue
      setTimeout(() => this.processPreloadQueue(), 100);
    };

    document.head.appendChild(link);
  }

  // Preload critical resources
  public static preloadCriticalResources(): void {
    const criticalResources = [
      { url: "/favicon.ico", priority: 10 },
      { url: "/manifest.json", priority: 9 },
      { url: "/images/og-image.png", priority: 8 },
      // Add more critical resources as needed
    ];

    criticalResources.forEach(({ url, priority }) => {
      this.preloadResource(url, priority);
    });
  }
}

// Tree shaking utilities
export class TreeShakingOptimizer {
  // Check for unused imports (development only)
  public static analyzeUnusedImports(): void {
    if (process.env.NODE_ENV !== "development") return;

    // This would require build-time analysis
    // For now, just log a reminder
    console.log("Tree Shaking: Run 'npm run analyze' to check for unused code");
  }

  // Optimize lodash imports
  public static optimizeLodashImports(): void {
    // This is handled by babel-plugin-import in next.config.ts
    console.log(
      "Tree Shaking: Lodash imports optimized via babel-plugin-import",
    );
  }
}

// Memory optimization for heavy components
export class MemoryOptimizer {
  private static disposables: Set<() => void> = new Set();

  // Register cleanup function
  public static register(cleanup: () => void): void {
    this.disposables.add(cleanup);
  }

  // Unregister cleanup function
  public static unregister(cleanup: () => void): void {
    this.disposables.delete(cleanup);
  }

  // Clean up all registered disposables
  public static cleanup(): void {
    this.disposables.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Memory cleanup error:", error);
      }
    });
    this.disposables.clear();
  }

  // Monitor memory usage
  public static monitorMemoryUsage(): void {
    if (typeof window === "undefined" || !("memory" in performance)) return;

    const memory = (
      performance as Performance & {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    };

    console.log("Memory usage:", usage);

    // Warn if memory usage is high
    if (usage.used > usage.limit * 0.8) {
      console.warn("High memory usage detected:", usage);

      // Trigger cleanup
      this.cleanup();
    }
  }
}

// Initialize bundle optimization
export const initializeBundleOptimization = (): BundleOptimizer => {
  const optimizer = BundleOptimizer.getInstance();

  // Start monitoring
  optimizer.monitorChunkLoading();

  // Preload critical resources
  ResourcePreloader.preloadCriticalResources();

  // Monitor memory usage periodically
  if (typeof window !== "undefined") {
    setInterval(() => {
      MemoryOptimizer.monitorMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  return optimizer;
};

// React hook for bundle optimization
export const useBundleOptimization = () => {
  const optimizer = BundleOptimizer.getInstance();

  return {
    loadComponent: optimizer.loadComponent.bind(optimizer),
    getBundleInfo: optimizer.getBundleInfo.bind(optimizer),
    preloadCriticalChunks: optimizer.preloadCriticalChunks.bind(optimizer),
  };
};
