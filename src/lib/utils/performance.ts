/**
 * Performance Optimization Utilities
 * Based on documents/01_global.md and documents/05_requirement.md specifications
 */

import type { ImageProps } from "next/image";

// Dynamic import helpers for code splitting (LazyComponents)
// Note: These imports will be available once the components are implemented
export const LazyComponents = {
  // Tools components - will be implemented in later phases
  // ColorPalette: lazy(() => import("@/app/tools/components/ColorPalette")),
  // QRGenerator: lazy(() => import("@/app/tools/components/QRGenerator")),
  // TextCounter: lazy(() => import("@/app/tools/components/TextCounter")),
  // SVGToTSX: lazy(() => import("@/app/tools/components/SVGToTSX")),
  // SequentialPngPreview: lazy(() => import("@/app/tools/components/SequentialPngPreview")),
  // PomodoroTimer: lazy(() => import("@/app/tools/components/PomodoroTimer")),
  // PiGame: lazy(() => import("@/app/tools/components/PiGame")),
  // BusinessMailBlock: lazy(() => import("@/app/tools/components/BusinessMailBlock")),
  // AEExpression: lazy(() => import("@/app/tools/components/AEExpression")),
  // ProtoType: lazy(() => import("@/app/tools/components/ProtoType")),
  // Portfolio playground components - will be implemented in later phases
  // ThreeJSPlayground: lazy(() => import("@/app/portfolio/components/ThreeJSPlayground")),
  // DesignPlayground: lazy(() => import("@/app/portfolio/components/DesignPlayground")),
  // Heavy components that should be lazy loaded - will be implemented in later phases
  // VideoPlayer: lazy(() => import("@/components/ui/VideoPlayer")),
  // MarkdownRenderer: lazy(() => import("@/components/ui/MarkdownRenderer")),
  // SearchInterface: lazy(() => import("@/app/search/components/SearchInterface")),
};

// Image optimization wrapper with Next.js Image integration
export interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  sizes?: string;
}

export const optimizeImage = (
  src: string,
  options: OptimizedImageOptions = {},
): Partial<ImageProps> => {
  const {
    width,
    height,
    quality = 85,
    priority = false,
    placeholder = "blur",
    sizes,
  } = options;

  return {
    src,
    width,
    height,
    quality,
    priority,
    placeholder,
    blurDataURL: placeholder === "blur" ? generateBlurDataURL() : undefined,
    sizes: sizes || generateResponsiveSizes(),
    style: {
      width: "100%",
      height: "auto",
    },
  };
};

/**
 * Generate blur data URL for image placeholders
 */
function generateBlurDataURL(): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";
}

/**
 * Generate responsive sizes attribute for images
 */
function generateResponsiveSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
}

// Memory management utilities for Three.js/PIXI.js disposal
export const memoryOptimization = {
  /**
   * Dispose Three.js objects to prevent memory leaks
   */
  disposeThreeObjects: (scene: unknown) => {
    if (!scene || typeof scene !== "object") return;

    const sceneObj = scene as Record<string, unknown>;
    if (typeof sceneObj.traverse === "function") {
      sceneObj.traverse((child: unknown) => {
        if (child && typeof child === "object") {
          const childObj = child as Record<string, unknown>;

          if (childObj.geometry && typeof childObj.geometry === "object") {
            const geometry = childObj.geometry as Record<string, unknown>;
            if (typeof geometry.dispose === "function") {
              geometry.dispose();
            }
          }

          if (childObj.material) {
            disposeMaterial(childObj.material);
          }
        }
      });
    }

    // Clear the scene
    if (sceneObj.children && Array.isArray(sceneObj.children)) {
      while (sceneObj.children.length > 0) {
        if (typeof sceneObj.remove === "function") {
          sceneObj.remove(sceneObj.children[0]);
        }
      }
    }
  },

  /**
   * Dispose PIXI.js objects to prevent memory leaks
   */
  disposePixiObjects: (app: unknown) => {
    if (!app || typeof app !== "object") return;

    const appObj = app as Record<string, unknown>;

    if (appObj.stage && typeof appObj.stage === "object") {
      const stage = appObj.stage as Record<string, unknown>;
      if (typeof stage.destroy === "function") {
        stage.destroy({ children: true, texture: true, baseTexture: true });
      }
    }

    if (appObj.renderer && typeof appObj.renderer === "object") {
      const renderer = appObj.renderer as Record<string, unknown>;
      if (typeof renderer.destroy === "function") {
        renderer.destroy(true);
      }
    }

    if (appObj.loader && typeof appObj.loader === "object") {
      const loader = appObj.loader as Record<string, unknown>;
      if (typeof loader.destroy === "function") {
        loader.destroy();
      }
    }
  },

  /**
   * General cleanup for canvas-based applications
   */
  disposeCanvasContext: (canvas: HTMLCanvasElement) => {
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Reset canvas size to free memory
    canvas.width = 1;
    canvas.height = 1;
  },
};

/**
 * Helper function to dispose Three.js materials
 */
function disposeMaterial(material: unknown) {
  if (!material || typeof material !== "object") return;

  const materialObj = material as Record<string, unknown>;

  // Dispose textures
  const textureProps = [
    "map",
    "lightMap",
    "bumpMap",
    "normalMap",
    "specularMap",
    "envMap",
    "alphaMap",
    "aoMap",
    "displacementMap",
    "emissiveMap",
    "gradientMap",
    "metalnessMap",
    "roughnessMap",
  ];

  textureProps.forEach((prop) => {
    if (materialObj[prop] && typeof materialObj[prop] === "object") {
      const texture = materialObj[prop] as Record<string, unknown>;
      if (typeof texture.dispose === "function") {
        texture.dispose();
      }
    }
  });

  // Dispose the material itself
  if (typeof materialObj.dispose === "function") {
    materialObj.dispose();
  }
}

// Cache management system (static 1y, dynamic 1h)
export const cacheManager = {
  /**
   * Set cache with TTL (Time To Live)
   */
  setCache: (key: string, data: unknown, ttl: number = 3600): void => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to set cache:", error);
    }
  },

  /**
   * Get cache if not expired
   */
  getCache: <T = unknown>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const { data, timestamp, ttl } = JSON.parse(item);
      const now = Date.now();

      if (now - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Failed to get cache:", error);
      return null;
    }
  },

  /**
   * Clear cache by pattern or all
   */
  clearCache: (pattern?: string): void => {
    try {
      if (pattern) {
        Object.keys(localStorage)
          .filter((key) => key.startsWith("cache_") && key.includes(pattern))
          .forEach((key) => localStorage.removeItem(key));
      } else {
        Object.keys(localStorage)
          .filter((key) => key.startsWith("cache_"))
          .forEach((key) => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  },

  /**
   * Check if cache exists and is valid
   */
  hasValidCache: (key: string): boolean => {
    return cacheManager.getCache(key) !== null;
  },
};

// Bundle optimization and lazy loading utilities
export const bundleOptimization = {
  /**
   * Preload critical resources
   */
  preloadCriticalResources: (resources: string[]): void => {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;

      // Determine resource type
      if (resource.endsWith(".css")) {
        link.as = "style";
      } else if (resource.endsWith(".js")) {
        link.as = "script";
      } else if (resource.match(/\.(woff2?|ttf|otf)$/)) {
        link.as = "font";
        link.crossOrigin = "anonymous";
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = "image";
      }

      document.head.appendChild(link);
    });
  },

  /**
   * Lazy load non-critical CSS
   */
  loadCSS: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      document.head.appendChild(link);
    });
  },

  /**
   * Lazy load JavaScript modules
   */
  loadScript: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  },
};

// Cache headers configuration
export const cacheHeaders = {
  static: {
    "Cache-Control": "public, max-age=31536000, immutable", // 1 year
  },
  dynamic: {
    "Cache-Control": "public, max-age=3600, s-maxage=3600", // 1 hour
  },
  noCache: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Offline functionality utilities
export const offlineUtils = {
  /**
   * Check if the application is currently online
   */
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  /**
   * Listen for online/offline status changes
   */
  onConnectionChange: (callback: (isOnline: boolean) => void): (() => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  },

  /**
   * Show offline notification to user
   */
  showOfflineNotification: (
    message: string = "オフラインモードで動作中",
  ): void => {
    // Create or update offline indicator
    let indicator = document.getElementById("offline-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "offline-indicator";
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: #000;
        text-align: center;
        padding: 8px;
        font-size: 14px;
        z-index: 9999;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }

    indicator.textContent = message;
    indicator.style.transform = "translateY(0)";

    // Auto-hide after 5 seconds if back online
    setTimeout(() => {
      if (navigator.onLine && indicator) {
        indicator.style.transform = "translateY(-100%)";
      }
    }, 5000);
  },

  /**
   * Hide offline notification
   */
  hideOfflineNotification: (): void => {
    const indicator = document.getElementById("offline-indicator");
    if (indicator) {
      indicator.style.transform = "translateY(-100%)";
    }
  },
};

// Heavy computation optimization utilities
export const computationOptimization = {
  /**
   * Break heavy computations into chunks to prevent UI blocking
   */
  processInChunks: async <T, R>(
    items: T[],
    processor: (item: T, index: number) => R,
    chunkSize: number = 100,
    onProgress?: (progress: number) => void,
  ): Promise<R[]> => {
    const results: R[] = [];
    const totalItems = items.length;

    for (let i = 0; i < totalItems; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      // Process chunk
      const chunkResults = chunk.map((item, index) =>
        processor(item, i + index),
      );
      results.push(...chunkResults);

      // Report progress
      if (onProgress) {
        const progress = Math.min(100, ((i + chunkSize) / totalItems) * 100);
        onProgress(progress);
      }

      // Yield control to browser
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  },

  /**
   * Use Web Workers for heavy computations when available
   */
  useWebWorker: <T, R>(workerScript: string, data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (typeof Worker === "undefined") {
        reject(new Error("Web Workers not supported"));
        return;
      }

      const worker = new Worker(workerScript);

      worker.postMessage(data);

      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        worker.terminate();
        reject(new Error("Worker timeout"));
      }, 30000);
    });
  },

  /**
   * Optimize image processing operations
   */
  optimizeImageProcessing: (
    canvas: HTMLCanvasElement,
    operation: (ctx: CanvasRenderingContext2D) => void,
  ): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use willReadFrequently for better performance
    const optimizedCtx = canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: false,
    });

    if (optimizedCtx) {
      operation(optimizedCtx);
    } else {
      operation(ctx);
    }
  },
};

// Data persistence utilities for offline functionality
export const dataPersistence = {
  /**
   * Enhanced localStorage with compression and error handling
   */
  setItem: (
    key: string,
    value: unknown,
    compress: boolean = false,
  ): boolean => {
    try {
      const serialized = JSON.stringify(value);

      if (
        compress &&
        typeof window !== "undefined" &&
        "CompressionStream" in window
      ) {
        // Use compression for large data (future enhancement)
        // For now, just use regular storage
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Enhanced localStorage getter with error handling
   */
  getItem: <T = unknown>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;

      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${key}`, error);
      return defaultValue || null;
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Clear all tool-related data
   */
  clearToolData: (toolName?: string): void => {
    try {
      const keys = Object.keys(localStorage);
      const pattern = toolName ? `tool-${toolName}` : "tool-";

      keys
        .filter((key) => key.startsWith(pattern))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear tool data", error);
    }
  },

  /**
   * Get storage usage information
   */
  getStorageInfo: (): {
    used: number;
    available: number;
    percentage: number;
  } => {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (5MB typical limit)
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  },
};

// Performance monitoring utilities
export const performanceMonitoring = {
  /**
   * Measure function execution time
   */
  measureTime: <T extends (...args: unknown[]) => unknown>(
    func: T,
    label?: string,
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now();
      const result = func(...args) as ReturnType<T>;
      const end = performance.now();

      if (label) {
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
      }

      return result;
    };
  },

  /**
   * Monitor memory usage
   */
  getMemoryUsage: (): {
    used: number;
    total: number;
    percentage: number;
  } | null => {
    if ("memory" in performance) {
      const memory = (
        performance as unknown as {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return null;
  },

  /**
   * Track Core Web Vitals
   */
  trackWebVitals: (
    callback: (metric: { name: string; value: number }) => void,
  ): void => {
    // LCP - Largest Contentful Paint
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          callback({ name: "LCP", value: lastEntry.startTime });
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (error) {
        console.warn("Failed to observe LCP", error);
      }
    }

    // FID - First Input Delay
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            callback({
              name: "FID",
              value:
                (entry as unknown as { processingStart: number })
                  .processingStart - entry.startTime,
            });
          });
        });
        observer.observe({ entryTypes: ["first-input"] });
      } catch (error) {
        console.warn("Failed to observe FID", error);
      }
    }

    // CLS - Cumulative Layout Shift
    if ("PerformanceObserver" in window) {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const clsEntry = entry as unknown as {
              hadRecentInput: boolean;
              value: number;
            };
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
              callback({ name: "CLS", value: clsValue });
            }
          });
        });
        observer.observe({ entryTypes: ["layout-shift"] });
      } catch (error) {
        console.warn("Failed to observe CLS", error);
      }
    }
  },
};
