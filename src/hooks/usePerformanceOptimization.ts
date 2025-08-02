"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Performance monitoring types
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentUpdates: number;
  lastUpdate: Date;
}

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      } else if (!throttleRef.current) {
        throttleRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now();
            throttleRef.current = null;
            callback(...args);
          },
          delay - (now - lastCallRef.current),
        );
      }
    }) as T,
    [callback, delay],
  );
}

// Lazy loading hook with Intersection Observer
export function useLazyLoad(options: LazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setIsLoaded(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible, isLoaded };
}

// Virtual scrolling hook for large lists
export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2,
    );

    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentUpdates: 0,
    lastUpdate: new Date(),
  });

  const renderStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  // End render timing
  const endRenderTiming = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    updateCountRef.current += 1;

    setMetrics((prev) => ({
      ...prev,
      renderTime,
      componentUpdates: updateCountRef.current,
      lastUpdate: new Date(),
      memoryUsage:
        (performance as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize || 0,
    }));

    // Log performance metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        updates: updateCountRef.current,
        memory: `${(((performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0) / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }, [componentName]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    updateCountRef.current = 0;
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      componentUpdates: 0,
      lastUpdate: new Date(),
    });
  }, []);

  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    resetMetrics,
  };
}

// Memory optimization hook
export function useMemoryOptimization() {
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach((fn) => fn());
    cleanupFunctionsRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Force garbage collection (development only)
  const forceGC = useCallback(() => {
    if (
      process.env.NODE_ENV === "development" &&
      (window as { gc?: () => void }).gc
    ) {
      (window as { gc?: () => void }).gc?.();
    }
  }, []);

  return { addCleanup, cleanup, forceGC };
}

// Batch updates hook for performance
export function useBatchUpdates<T>(
  initialValue: T,
  batchDelay: number = 16, // ~60fps
) {
  const [value, setValue] = useState<T>(initialValue);
  const pendingValueRef = useRef<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchedSetValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(pendingValueRef.current)
          : newValue;

      pendingValueRef.current = resolvedValue;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setValue(pendingValueRef.current);
        timeoutRef.current = null;
      }, batchDelay);
    },
    [batchDelay],
  );

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setValue(pendingValueRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, batchedSetValue, flushUpdates] as const;
}

// Image lazy loading with progressive enhancement
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setIsError(false);

    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsError(true);
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { currentSrc, isLoading, isError };
}
