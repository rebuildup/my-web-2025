interface ThreeGeometry {
  dispose: () => void;
}

interface ThreeMaterial {
  dispose: () => void;
  map?: { dispose: () => void };
  lightMap?: { dispose: () => void };
  bumpMap?: { dispose: () => void };
  normalMap?: { dispose: () => void };
  specularMap?: { dispose: () => void };
  envMap?: { dispose: () => void };
}

interface ThreeChild {
  geometry?: ThreeGeometry;
  material?: ThreeMaterial | ThreeMaterial[];
}

interface ThreeScene {
  traverse: (callback: (child: ThreeChild) => void) => void;
  children: ThreeChild[];
  remove: (child: ThreeChild) => void;
}

interface PixiStage {
  destroy: (options: { children?: boolean; texture?: boolean; baseTexture?: boolean }) => void;
}

interface PixiRenderer {
  destroy: (removeView: boolean) => void;
}

interface PixiLoader {
  destroy: () => void;
}

interface PixiApp {
  stage?: PixiStage;
  renderer?: PixiRenderer;
  loader?: PixiLoader;
}

interface Renderer {
  dispose: () => void;
  forceContextLoss: () => void;
  context: WebGLRenderingContext | WebGL2RenderingContext | null;
  domElement: HTMLCanvasElement | null;
}

declare global {
  interface Performance {
    memory: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Performance optimization utilities
import { lazy } from 'react';

// Dynamic imports for heavy components (Chunk Split)
export const LazyComponents = {
  ColorPalette: lazy(() => import('@/app/tools/components/ColorPalette')),
  QrGenerator: lazy(() => import('@/app/tools/components/QrGenerator')),
  TextCounter: lazy(() => import('@/app/tools/components/TextCounter')),
  PomodoroTimer: lazy(() => import('@/app/tools/components/PomodoroTimer')),
  ThreeJSPlayground: lazy(() => import('@/app/portfolio/components/ThreeJSPlayground')),
  PortfolioGallery: lazy(() => import('@/app/portfolio/components/PortfolioGallery')),
  BlogList: lazy(() => import('@/app/workshop/components/BlogList')),
  PluginList: lazy(() => import('@/app/workshop/components/PluginList')),
  ContactForm: lazy(() => import('@/app/contact/components/ContactForm')),
  AdminDataManager: lazy(() => import('@/app/admin/components/AdminDataManager')),
};

// Image optimization wrapper
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}

export const optimizeImage = (src: string, options: ImageOptimizationOptions = {}) => {
  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    priority = false,
    placeholder = 'blur',
  } = options;

  return {
    src,
    width,
    height,
    quality,
    format,
    priority,
    placeholder,
    blurDataURL: generateBlurDataURL(),
    loading: priority ? ('eager' as const) : ('lazy' as const),
    sizes: generateSizes(width),
  };
};

// Generate blur data URL for placeholder
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  }

  const htmlCanvas = canvas as HTMLCanvasElement;
  htmlCanvas.width = width;
  htmlCanvas.height = height;
  const ctx = htmlCanvas.getContext('2d') as CanvasRenderingContext2D;

  if (ctx) {
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, width, height);
  }

  return htmlCanvas.toDataURL() as string;
};

// Generate responsive sizes attribute
export const generateSizes = (width?: number): string => {
  if (!width) {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }

  if (width <= 400) {
    return '(max-width: 768px) 100vw, 400px';
  } else if (width <= 800) {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px';
  } else {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px';
  }
};

// Memory optimization for 3D libraries
export const memoryOptimization = {
  disposeThreeObjects: (scene: ThreeScene) => {
    if (!scene) return;

    scene.traverse((child: ThreeChild) => {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material: ThreeMaterial) => {
            disposeMaterial(material);
          });
        } else {
          disposeMaterial(child.material);
        }
      }
    });

    // Clear the scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  },

  disposePixiObjects: (app: PixiApp) => {
    if (!app) return;

    if (app.stage) {
      app.stage.destroy({ children: true, texture: true, baseTexture: true });
    }

    if (app.renderer) {
      app.renderer.destroy(true);
    }

    if (app.loader) {
      app.loader.destroy();
    }
  },

  disposeRenderer: (renderer: Renderer) => {
    if (!renderer) return;

    renderer.dispose();
    renderer.forceContextLoss();
    renderer.context = null;
    renderer.domElement = null;
  },
};

// Helper function to dispose materials
const disposeMaterial = (material: ThreeMaterial) => {
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.envMap) material.envMap.dispose();
  material.dispose();
};

// Cache management
export const cacheManager = {
  setCache: (key: string, data: unknown, ttl: number = 3600) => {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  },

  getCache: (key: string) => {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp, ttl } = JSON.parse(item);
      const now = Date.now();

      if (now - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  },

  clearCache: (pattern?: string) => {
    if (typeof window === 'undefined') return;

    try {
      if (pattern) {
        Object.keys(localStorage)
          .filter(key => key.includes(pattern))
          .forEach(key => localStorage.removeItem(key));
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  getCacheSize: (): number => {
    if (typeof window === 'undefined') return 0;

    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },
};

// Performance monitoring
export const performanceMonitor = {
  measurePerformance: async (fn: () => Promise<unknown> | unknown, label: string = 'operation') => {
    const start = performance.now();
    let result;

    try {
      result = await fn();
    } catch (error) {
      console.error(`Performance measurement failed for ${label}:`, error);
      throw error;
    }

    const end = performance.now();
    const duration = end - start;

    console.log(`${label} took ${duration.toFixed(2)}ms`);

    // Log warning for slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  },

  measureComponentRender: (componentName: string) => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const duration = end - start;

      if (duration > 16) {
        // More than one frame at 60fps
        console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  },

  trackMemoryUsage: () => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = performance.memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  },
};

// Debounce and throttle utilities
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Resource preloading
export const preloadResource = (href: string, as: string = 'fetch'): void => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (as === 'fetch') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (srcs: string[]): Promise<void> => {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Failed to preload some images:', error);
  }
};
