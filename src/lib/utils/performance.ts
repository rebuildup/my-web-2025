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
