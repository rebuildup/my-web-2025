import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPerformanceRating,
  trackWebVitals,
  sendToAnalytics,
  getPerformanceMetrics,
  PERFORMANCE_THRESHOLDS,
  type WebVital,
} from './vitals';

// Mock performance APIs
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock PerformanceObserver
  mockPerformanceObserver.mockImplementation((callback: PerformanceObserverCallback) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
  }));
  
  global.PerformanceObserver = mockPerformanceObserver as any;
  
  // Mock performance.getEntriesByType
  global.performance = {
    ...global.performance,
    getEntriesByType: vi.fn().mockReturnValue([
      {
        responseStart: 150,
        fetchStart: 50,
      } as PerformanceNavigationTiming,
    ]),
  };

  // Mock fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response);

  // Mock window.gtag
  Object.defineProperty(global, 'window', {
    value: {
      ...global.window,
      gtag: vi.fn(),
      location: { pathname: '/test' },
      navigator: { userAgent: 'test-agent' },
    },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Performance Vitals', () => {
  describe('getPerformanceRating', () => {
    it('should return "good" for values within good threshold', () => {
      expect(getPerformanceRating('lcp', 2000)).toBe('good');
      expect(getPerformanceRating('fid', 50)).toBe('good');
      expect(getPerformanceRating('cls', 0.05)).toBe('good');
    });

    it('should return "needs-improvement" for values between good and poor', () => {
      expect(getPerformanceRating('lcp', 3000)).toBe('needs-improvement');
      expect(getPerformanceRating('fid', 200)).toBe('needs-improvement');
      expect(getPerformanceRating('cls', 0.15)).toBe('needs-improvement');
    });

    it('should return "poor" for values above poor threshold', () => {
      expect(getPerformanceRating('lcp', 5000)).toBe('poor');
      expect(getPerformanceRating('fid', 400)).toBe('poor');
      expect(getPerformanceRating('cls', 0.3)).toBe('poor');
    });

    it('should handle edge cases correctly', () => {
      expect(getPerformanceRating('lcp', PERFORMANCE_THRESHOLDS.lcp.good)).toBe('good');
      expect(getPerformanceRating('lcp', PERFORMANCE_THRESHOLDS.lcp.poor)).toBe('needs-improvement');
    });
  });

  describe('trackWebVitals', () => {
    it('should set up performance observers', () => {
      const mockCallback = vi.fn();
      trackWebVitals(mockCallback);

      expect(mockPerformanceObserver).toHaveBeenCalledTimes(5); // LCP, FID, CLS, FCP, INP
      expect(mockObserve).toHaveBeenCalledTimes(5);
    });

    it('should handle missing callback gracefully', () => {
      expect(() => trackWebVitals()).not.toThrow();
    });

    it('should handle performance observer errors', () => {
      mockPerformanceObserver.mockImplementation(() => {
        throw new Error('PerformanceObserver not supported');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => trackWebVitals(vi.fn())).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Performance monitoring failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should return early for server-side environment', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const mockCallback = vi.fn();
      trackWebVitals(mockCallback);

      expect(mockPerformanceObserver).not.toHaveBeenCalled();
    });

    it('should track TTFB from navigation timing', () => {
      const mockCallback = vi.fn();
      trackWebVitals(mockCallback);

      // TTFB should be calculated from navigation timing
      expect(global.performance.getEntriesByType).toHaveBeenCalledWith('navigation');
    });
  });

  describe('sendToAnalytics', () => {
    const mockMetric: WebVital = {
      name: 'LCP',
      value: 2000,
      id: 'test-id',
      delta: 2000,
      rating: 'good',
    };

    it('should send data to Google Analytics when available', () => {
      const mockGtag = vi.fn();
      (global.window as any).gtag = mockGtag;

      sendToAnalytics(mockMetric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: 'LCP',
        value: 2000,
        custom_map: {
          metric_id: 'test-id',
          metric_rating: 'good',
        },
      });
    });

    it('should send data to internal analytics API', () => {
      sendToAnalytics(mockMetric);

      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'LCP',
          value: 2000,
          rating: 'good',
          timestamp: expect.any(Number),
          url: '/test',
          userAgent: 'test-agent',
        }),
      });
    });

    it('should handle fetch errors gracefully', () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sendToAnalytics(mockMetric);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send performance data:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle missing window gracefully', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      expect(() => sendToAnalytics(mockMetric)).not.toThrow();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return a promise that resolves with metrics', async () => {
      const metricsPromise = getPerformanceMetrics();
      expect(metricsPromise).toBeInstanceOf(Promise);

      const metrics = await metricsPromise;
      expect(metrics).toEqual(expect.objectContaining({}));
    });

    it('should timeout after 5 seconds', async () => {
      vi.useFakeTimers();
      
      const metricsPromise = getPerformanceMetrics();
      
      // Fast-forward time
      vi.advanceTimersByTime(5000);
      
      const metrics = await metricsPromise;
      expect(metrics).toEqual(expect.objectContaining({}));
      
      vi.useRealTimers();
    });
  });

  describe('PERFORMANCE_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(PERFORMANCE_THRESHOLDS.lcp).toEqual({ good: 2500, poor: 4000 });
      expect(PERFORMANCE_THRESHOLDS.fid).toEqual({ good: 100, poor: 300 });
      expect(PERFORMANCE_THRESHOLDS.cls).toEqual({ good: 0.1, poor: 0.25 });
      expect(PERFORMANCE_THRESHOLDS.fcp).toEqual({ good: 1800, poor: 3000 });
      expect(PERFORMANCE_THRESHOLDS.ttfb).toEqual({ good: 800, poor: 1800 });
      expect(PERFORMANCE_THRESHOLDS.inp).toEqual({ good: 200, poor: 500 });
    });

    it('should have good thresholds less than poor thresholds', () => {
      Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, thresholds]) => {
        expect(thresholds.good).toBeLessThan(thresholds.poor);
      });
    });
  });
});