/**
 * Performance monitoring and optimization utilities
 * Implements comprehensive performance tracking and memory management
 */

// Type definitions for Three.js and PIXI.js
// Type definitions for Three.js and PIXI.js
interface ThreeScene {
  traverse: (callback: (child: ThreeObject3D) => void) => void;
  children: ThreeObject3D[];
  remove: (object: ThreeObject3D) => void;
}

interface ThreeObject3D {
  geometry?: { dispose: () => void };
  material?: ThreeMaterial | ThreeMaterial[];
}

interface ThreeMesh extends ThreeObject3D {
  geometry: { dispose: () => void };
  material: ThreeMaterial | ThreeMaterial[];
}

interface ThreeMaterial {
  dispose: () => void;
  map?: ThreeTexture;
  lightMap?: ThreeTexture;
  bumpMap?: ThreeTexture;
  normalMap?: ThreeTexture;
  specularMap?: ThreeTexture;
  envMap?: ThreeTexture;
}

interface ThreeTexture {
  dispose: () => void;
}

interface PixiApplication {
  stage?: { destroy: (options?: { children?: boolean }) => void };
  renderer?: { destroy: (removeView?: boolean) => void };
  destroy: (removeView?: boolean) => void;
}

// Performance metrics interface
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

// Performance observer for Core Web Vitals
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            startTime: number;
          };
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric("lcp", lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn("LCP observer not supported", error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & {
              processingStart: number;
              startTime: number;
            };
            if ("processingStart" in fidEntry) {
              this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
              this.reportMetric("fid", this.metrics.fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn("FID observer not supported", error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if ("hadRecentInput" in clsEntry && "value" in clsEntry) {
              if (!clsEntry.hadRecentInput) {
                clsValue += clsEntry.value;
              }
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric("cls", clsValue);
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn("CLS observer not supported", error);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(
            (entry: PerformanceEntry & { name: string; startTime: number }) => {
              if (entry.name === "first-contentful-paint") {
                this.metrics.fcp = entry.startTime;
                this.reportMetric("fcp", entry.startTime);
              }
            },
          );
        });
        fcpObserver.observe({ entryTypes: ["paint"] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn("FCP observer not supported", error);
      }
    }

    // Memory usage monitoring
    this.monitorMemoryUsage();
  }

  private monitorMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (
        performance as Performance & {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
  }

  private reportMetric(name: string, value: number): void {
    // Report to analytics in production
    if (process.env.NODE_ENV === "production") {
      // Send to analytics service
      this.sendToAnalytics(name, value);
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Performance metric - ${name}:`, value);
    }
  }

  private sendToAnalytics(name: string, value: number): void {
    // Implementation for sending metrics to analytics service
    // This would typically send to Google Analytics, DataDog, etc.
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "performance_metric", {
        metric_name: name,
        metric_value: value,
        custom_parameter: "core_web_vitals",
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    this.monitorMemoryUsage();
    return { ...this.metrics };
  }

  public cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Memory management utilities for heavy components
export class MemoryManager {
  private static instance: MemoryManager;
  private disposables: Set<() => void> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Register cleanup function
  public register(cleanup: () => void): void {
    this.disposables.add(cleanup);
  }

  // Unregister cleanup function
  public unregister(cleanup: () => void): void {
    this.disposables.delete(cleanup);
  }

  // Clean up all registered disposables
  public cleanup(): void {
    this.disposables.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    });
    this.disposables.clear();
  }

  // Three.js specific cleanup
  public disposeThreeObjects(scene: ThreeScene): void {
    if (!scene) return;

    scene.traverse((child: ThreeObject3D) => {
      const mesh = child as ThreeMesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material: ThreeMaterial) => {
            this.disposeMaterial(material);
          });
        } else {
          this.disposeMaterial(mesh.material);
        }
      }
    });

    // Clear the scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }

  private disposeMaterial(material: ThreeMaterial): void {
    const materialWithMaps = material as ThreeMaterial & {
      map?: ThreeTexture;
      lightMap?: ThreeTexture;
      bumpMap?: ThreeTexture;
      normalMap?: ThreeTexture;
      specularMap?: ThreeTexture;
      envMap?: ThreeTexture;
    };

    if (materialWithMaps.map) materialWithMaps.map.dispose();
    if (materialWithMaps.lightMap) materialWithMaps.lightMap.dispose();
    if (materialWithMaps.bumpMap) materialWithMaps.bumpMap.dispose();
    if (materialWithMaps.normalMap) materialWithMaps.normalMap.dispose();
    if (materialWithMaps.specularMap) materialWithMaps.specularMap.dispose();
    if (materialWithMaps.envMap) materialWithMaps.envMap.dispose();
    material.dispose();
  }

  // PIXI.js specific cleanup
  public disposePixiObjects(app: PixiApplication): void {
    if (!app) return;

    if (app.stage) {
      app.stage.destroy({ children: true });
    }

    if (app.renderer) {
      app.renderer.destroy(true);
    }

    app.destroy(true);
  }
}

// Resource preloading utilities
export class ResourcePreloader {
  private static preloadedResources: Set<string> = new Set();

  // Preload critical resources
  public static preloadCriticalResources(): void {
    const criticalResources = [
      "/images/og-image.jpg",
      "/images/profile/profile-main.jpg",
      "/fonts/neue-haas-grotesk-display.woff2",
      "/fonts/zen-kaku-gothic-new.woff2",
    ];

    criticalResources.forEach((resource) => {
      this.preloadResource(resource);
    });
  }

  // Preload individual resource
  public static preloadResource(url: string): void {
    if (this.preloadedResources.has(url)) return;

    const link = document.createElement("link");
    link.rel = "preload";

    if (url.includes(".woff2") || url.includes(".woff")) {
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
    } else if (
      url.includes(".jpg") ||
      url.includes(".png") ||
      url.includes(".webp")
    ) {
      link.as = "image";
    } else if (url.includes(".js")) {
      link.as = "script";
    } else if (url.includes(".css")) {
      link.as = "style";
    }

    link.href = url;
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  // Lazy load images with intersection observer
  public static setupLazyLoading(): void {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove("lazy");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
}

// Bundle size monitoring
export class BundleMonitor {
  public static logBundleInfo(): void {
    if (process.env.NODE_ENV === "development") {
      console.group("Bundle Information");
      console.log(
        "Next.js version:",
        process.env.NEXT_PUBLIC_VERSION || "15.4.3",
      );
      console.log("Build time:", new Date().toISOString());

      // Log loaded chunks
      if (
        typeof window !== "undefined" &&
        (
          window as Window & {
            __NEXT_DATA__?: { chunks?: string[]; buildId?: string };
          }
        ).__NEXT_DATA__
      ) {
        const nextData = (
          window as Window & {
            __NEXT_DATA__: { chunks?: string[]; buildId?: string };
          }
        ).__NEXT_DATA__;
        console.log("Page chunks:", nextData.chunks || []);
        console.log("Build ID:", nextData.buildId);
      }

      console.groupEnd();
    }
  }

  // Monitor chunk loading performance
  public static monitorChunkLoading(): void {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes("_next/static/chunks/")) {
            console.log(`Chunk loaded: ${entry.name} in ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });
    }
  }
}

// Performance optimization hooks
export const usePerformanceOptimization = () => {
  const performanceMonitor = new PerformanceMonitor();
  const memoryManager = MemoryManager.getInstance();

  // Cleanup on unmount
  const cleanup = () => {
    performanceMonitor.cleanup();
    memoryManager.cleanup();
  };

  return {
    performanceMonitor,
    memoryManager,
    cleanup,
  };
};

// Offline utilities
export const offlineUtils = {
  isOnline: () => navigator.onLine,
  onConnectionChange: (callback: (isOnline: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  },
  showOfflineNotification: (message: string) => {
    console.log("Offline:", message);
  },
  hideOfflineNotification: () => {
    console.log("Back online");
  },
};

// Data persistence utilities
export const dataPersistence = {
  getStorageInfo: () => ({
    used: 0,
    available: 1000000,
    percentage: 0,
  }),
  setItem: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  clearToolData: (toolName: string) => {
    const key = `tool-${toolName}-settings`;
    localStorage.removeItem(key);
  },
};

// Computation optimization utilities
export const computationOptimization = {
  processInChunks: async <T, R>(
    items: T[],
    processor: (item: T, index: number) => R,
    chunkSize: number,
    onProgress?: (progress: number) => void,
  ): Promise<R[]> => {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = chunk.map((item, index) =>
        processor(item, i + index),
      );
      results.push(...chunkResults);

      const progress = ((i + chunkSize) / items.length) * 100;
      onProgress?.(Math.min(progress, 100));

      // Yield control to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  },
  useWebWorker: async <T, R>(workerScript: string, data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerScript);
      worker.postMessage(data);
      worker.onmessage = (e) => {
        resolve(e.data);
        worker.terminate();
      };
      worker.onerror = reject;
    });
  },
};

// Performance monitoring utilities
export const performanceMonitoring = {
  getMemoryUsage: () => {
    if ("memory" in performance && performance.memory) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return null;
  },
  measureTime: <T>(fn: () => T): { result: T; duration: number } => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    return { result, duration };
  },
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): PerformanceMonitor => {
  const monitor = new PerformanceMonitor();

  // Preload critical resources
  ResourcePreloader.preloadCriticalResources();

  // Setup lazy loading
  if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
      ResourcePreloader.setupLazyLoading();
      BundleMonitor.logBundleInfo();
      BundleMonitor.monitorChunkLoading();
    });
  }

  return monitor;
};
