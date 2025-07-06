/**
 * Core Web Vitals monitoring and performance tracking system
 * Implements real-time performance monitoring with threshold alerts
 */

export interface WebVital {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
  inp: { good: number; poor: number };
}

// Performance thresholds based on Core Web Vitals guidelines
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 }, // ms
  fid: { good: 100, poor: 300 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // score
  fcp: { good: 1800, poor: 3000 }, // ms
  ttfb: { good: 800, poor: 1800 }, // ms
  inp: { good: 200, poor: 500 }, // ms
};

/**
 * Get performance rating based on thresholds
 */
export function getPerformanceRating(
  metric: keyof PerformanceThresholds,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Core Web Vitals using the web-vitals library pattern
 */
export function trackWebVitals(onPerfEntry?: (metric: WebVital) => void): void {
  if (typeof window === 'undefined' || !onPerfEntry) return;

  try {
    // Track LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      if (lastEntry) {
        const metric: WebVital = {
          name: 'LCP',
          value: lastEntry.startTime,
          id: generateUniqueId(),
          delta: lastEntry.startTime,
          rating: getPerformanceRating('lcp', lastEntry.startTime),
        };
        onPerfEntry(metric);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Track FID (First Input Delay)
    const fidObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-input') {
          const metric: WebVital = {
            name: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            id: generateUniqueId(),
            delta: (entry as any).processingStart - entry.startTime,
            rating: getPerformanceRating('fid', (entry as any).processingStart - entry.startTime),
          };
          onPerfEntry(metric);
        }
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      
      const metric: WebVital = {
        name: 'CLS',
        value: clsValue,
        id: generateUniqueId(),
        delta: clsValue,
        rating: getPerformanceRating('cls', clsValue),
      };
      onPerfEntry(metric);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Track FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          const metric: WebVital = {
            name: 'FCP',
            value: entry.startTime,
            id: generateUniqueId(),
            delta: entry.startTime,
            rating: getPerformanceRating('fcp', entry.startTime),
          };
          onPerfEntry(metric);
        }
      });
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // Track TTFB (Time to First Byte)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.fetchStart;
      const metric: WebVital = {
        name: 'TTFB',
        value: ttfb,
        id: generateUniqueId(),
        delta: ttfb,
        rating: getPerformanceRating('ttfb', ttfb),
      };
      onPerfEntry(metric);
    }

    // Track INP (Interaction to Next Paint) - for modern browsers
    if ('PerformanceEventTiming' in window) {
      const inpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const duration = entry.processingEnd - entry.startTime;
          const metric: WebVital = {
            name: 'INP',
            value: duration,
            id: generateUniqueId(),
            delta: duration,
            rating: getPerformanceRating('inp', duration),
          };
          onPerfEntry(metric);
        });
      });
      inpObserver.observe({ type: 'event', buffered: true });
    }
  } catch (error) {
    console.warn('Performance monitoring failed:', error);
  }
}

/**
 * Generate unique ID for metrics
 */
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Send performance data to analytics
 */
export function sendToAnalytics(metric: WebVital): void {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: metric.name,
      value: Math.round(metric.value),
      custom_map: {
        metric_id: metric.id,
        metric_rating: metric.rating,
      },
    });
  }

  // Send to internal analytics API
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(error => {
      console.warn('Failed to send performance data:', error);
    });
  }
}

/**
 * Get current performance metrics summary
 */
export function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise(resolve => {
    const metrics: PerformanceMetrics = {};
    let pendingMetrics = 0;

    const handleMetric = (metric: WebVital) => {
      metrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric.value;
      pendingMetrics--;
      
      if (pendingMetrics === 0) {
        resolve(metrics);
      }
    };

    // Count expected metrics
    pendingMetrics = 6; // LCP, FID, CLS, FCP, TTFB, INP

    // Track all metrics with timeout
    trackWebVitals(handleMetric);

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(metrics);
    }, 5000);
  });
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitoring(
  onMetric?: (metric: WebVital) => void
): PerformanceMetrics {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMetric = (metric: WebVital) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
      }));
      
      if (onMetric) onMetric(metric);
      sendToAnalytics(metric);
    };

    trackWebVitals(handleMetric);
  }, [onMetric]);

  return metrics;
}

// TypeScript import for React
import React from 'react';