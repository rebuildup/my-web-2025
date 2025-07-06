import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  optimizeImage,
  generateBlurDataURL,
  generateSizes,
  memoryOptimization,
  cacheManager,
  performanceMonitor,
  debounce,
  throttle,
  createIntersectionObserver,
  preloadImage,
  preloadImages,
  type ImageOptimizationOptions,
} from './performance';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  hasOwnProperty: vi.fn((key: string) => key in mockLocalStorage.store),
};

// Mock window and DOM
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Image constructor
global.Image = vi.fn().mockImplementation(() => ({
  onload: null,
  onerror: null,
  src: '',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.store = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('optimizeImage', () => {
    it('should return optimized image options with defaults', () => {
      const result = optimizeImage('/test.jpg');

      expect(result).toMatchObject({
        src: '/test.jpg',
        quality: 85,
        format: 'webp',
        priority: false,
        placeholder: 'blur',
        loading: 'lazy',
      });
      expect(result.blurDataURL).toBeDefined();
      expect(result.sizes).toBeDefined();
    });

    it('should override default options', () => {
      const options: ImageOptimizationOptions = {
        width: 800,
        height: 600,
        quality: 95,
        format: 'png',
        priority: true,
        placeholder: 'empty',
      };

      const result = optimizeImage('/test.jpg', options);

      expect(result).toMatchObject({
        src: '/test.jpg',
        width: 800,
        height: 600,
        quality: 95,
        format: 'png',
        priority: true,
        placeholder: 'empty',
        loading: 'eager',
      });
    });
  });

  describe('generateBlurDataURL', () => {
    it('should return a data URL for server-side rendering', () => {
      // Mock document.createElement to return null (server-side)
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockReturnValue(null);

      const result = generateBlurDataURL();
      expect(result).toMatch(/^data:image\/jpeg;base64,/);

      document.createElement = originalCreateElement;
    });
  });

  describe('generateSizes', () => {
    it('should return default sizes when no width provided', () => {
      const result = generateSizes();
      expect(result).toBe('(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
    });

    it('should return appropriate sizes for small width', () => {
      const result = generateSizes(300);
      expect(result).toBe('(max-width: 768px) 100vw, 400px');
    });

    it('should return appropriate sizes for medium width', () => {
      const result = generateSizes(600);
      expect(result).toBe('(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px');
    });

    it('should return appropriate sizes for large width', () => {
      const result = generateSizes(1000);
      expect(result).toBe('(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px');
    });
  });

  describe('cacheManager', () => {
    it('should set and get cache with TTL', () => {
      const testData = { test: 'data' };
      cacheManager.setCache('test-key', testData, 3600);

      const result = cacheManager.getCache('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for expired cache', () => {
      const testData = { test: 'data' };

      // Mock Date.now to simulate past time for setting
      const originalNow = Date.now;
      Date.now = vi.fn(() => 1000);
      cacheManager.setCache('test-key', testData, 1); // 1 second TTL

      // Mock Date.now to simulate future time for getting (after TTL)
      Date.now = vi.fn(() => 2500); // 1.5 seconds later
      const result = cacheManager.getCache('test-key');

      expect(result).toBeNull();
      Date.now = originalNow;
    });

    it('should clear cache by pattern', () => {
      cacheManager.setCache('test-1', 'data1');
      cacheManager.setCache('test-2', 'data2');
      cacheManager.setCache('other-1', 'data3');

      cacheManager.clearCache('test');

      expect(cacheManager.getCache('test-1')).toBeNull();
      expect(cacheManager.getCache('test-2')).toBeNull();
      expect(cacheManager.getCache('other-1')).toEqual('data3');
    });

    it('should calculate cache size', () => {
      cacheManager.setCache('key1', 'value1');
      cacheManager.setCache('key2', 'value2');

      const size = cacheManager.getCacheSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('performanceMonitor', () => {
    it('should measure performance of sync function', async () => {
      const testFn = () => 'result';
      const { result, duration } = await performanceMonitor.measurePerformance(testFn, 'test-sync');

      expect(result).toBe('result');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure performance of async function', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return 'async-result';
      };

      const { result, duration } = await performanceMonitor.measurePerformance(
        testFn,
        'test-async'
      );

      expect(result).toBe('async-result');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should track memory usage', () => {
      const memoryInfo = performanceMonitor.trackMemoryUsage();

      expect(memoryInfo).toMatchObject({
        usedJSHeapSize: expect.any(Number),
        totalJSHeapSize: expect.any(Number),
        jsHeapSizeLimit: expect.any(Number),
        usagePercentage: expect.any(Number),
      });
    });

    it('should return render measurement function', () => {
      const measureEnd = performanceMonitor.measureComponentRender('TestComponent');
      expect(typeof measureEnd).toBe('function');

      // Should not throw when called
      expect(() => measureEnd()).not.toThrow();
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 10);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 15));

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 10);

      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });
  });

  describe('createIntersectionObserver', () => {
    it('should create IntersectionObserver with default options', () => {
      const callback = vi.fn();
      const observer = createIntersectionObserver(callback);

      expect(observer).toBeDefined();
      expect(IntersectionObserver).toHaveBeenCalledWith(
        callback,
        expect.objectContaining({
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        })
      );
    });

    it('should create IntersectionObserver with custom options', () => {
      const callback = vi.fn();
      const options = { threshold: 0.5, rootMargin: '20px' };
      const observer = createIntersectionObserver(callback, options);

      expect(observer).toBeDefined();
      expect(IntersectionObserver).toHaveBeenCalledWith(callback, expect.objectContaining(options));
    });
  });

  describe('preloadImage', () => {
    it('should resolve when image loads successfully', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: '',
      };

      global.Image = vi.fn().mockImplementation(() => mockImage);

      const promise = preloadImage('/test.jpg');

      // Simulate successful load
      if (mockImage.onload) {
        (mockImage.onload as (event: Event) => void)(new Event('load'));
      }

      await expect(promise).resolves.toBeUndefined();
      expect(mockImage.src).toBe('/test.jpg');
    });

    it('should reject when image fails to load', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: '',
      };

      global.Image = vi.fn().mockImplementation(() => mockImage);

      const promise = preloadImage('/invalid.jpg');

      // Simulate load error
      if (mockImage.onerror) {
        (mockImage.onerror as (event: Event) => void)(new Event('error'));
      }

      await expect(promise).rejects.toBeDefined();
    });
  });

  describe('preloadImages', () => {
    it('should preload multiple images', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: '',
      };

      global.Image = vi.fn().mockImplementation(() => mockImage);

      const promise = preloadImages(['/img1.jpg', '/img2.jpg']);

      // Simulate successful loads
      if (mockImage.onload) {
        setTimeout(
          () => (mockImage.onload as ((event: Event) => void) | null)?.(new Event('load')),
          0
        );
      }

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('memoryOptimization', () => {
    it('should dispose Three.js objects safely', () => {
      const mockGeometry = { dispose: vi.fn() };
      const mockMaterial = { dispose: vi.fn() };
      const mockChild = {
        geometry: mockGeometry,
        material: mockMaterial,
      };
      const mockScene = {
        traverse: vi.fn(callback => callback(mockChild)),
        children: [mockChild],
        remove: vi.fn(),
      };

      memoryOptimization.disposeThreeObjects(mockScene);

      expect(mockGeometry.dispose).toHaveBeenCalled();
      expect(mockMaterial.dispose).toHaveBeenCalled();
      expect(mockScene.remove).toHaveBeenCalledWith(mockChild);
    });

    it('should dispose PIXI objects safely', () => {
      const mockStage = { destroy: vi.fn() };
      const mockRenderer = { destroy: vi.fn() };
      const mockLoader = { destroy: vi.fn() };
      const mockApp = {
        stage: mockStage,
        renderer: mockRenderer,
        loader: mockLoader,
      };

      memoryOptimization.disposePixiObjects(mockApp);

      expect(mockStage.destroy).toHaveBeenCalledWith({
        children: true,
        texture: true,
        baseTexture: true,
      });
      expect(mockRenderer.destroy).toHaveBeenCalledWith(true);
      expect(mockLoader.destroy).toHaveBeenCalled();
    });
  });
});
