/**
 * @jest-environment jsdom
 */

import {
  CacheConfig,
  CacheManager,
  cacheManager,
  CDNCacheHeaders,
  ServiceWorkerCache,
} from "../cache-manager";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: jest.fn(),
};

Object.defineProperty(navigator, "serviceWorker", {
  value: mockServiceWorker,
  writable: true,
});

// Mock caches API
const mockCache = {
  addAll: jest.fn(),
  add: jest.fn(),
  put: jest.fn(),
  match: jest.fn(),
};

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  match: jest.fn(),
  delete: jest.fn(),
};

Object.defineProperty(window, "caches", {
  value: mockCaches,
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("CacheManager", () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = CacheManager.getInstance();
    cache.clear();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = CacheManager.getInstance();
      const instance2 = CacheManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(cacheManager);
    });
  });

  describe("basic cache operations", () => {
    it("should set and get values", () => {
      const key = "test-key";
      const value = { data: "test-data" };

      const setResult = cache.set(key, value);
      expect(setResult).toBe(true);

      const retrieved = cache.get(key);
      expect(retrieved).toEqual(value);
    });

    it("should return null for non-existent keys", () => {
      const result = cache.get("non-existent-key");
      expect(result).toBeNull();
    });

    it("should delete values", () => {
      const key = "test-key";
      const value = "test-value";

      cache.set(key, value);
      expect(cache.has(key)).toBe(true);

      const deleted = cache.delete(key);
      expect(deleted).toBe(true);
      expect(cache.has(key)).toBe(false);
    });

    it("should check if key exists", () => {
      const key = "test-key";
      const value = "test-value";

      expect(cache.has(key)).toBe(false);

      cache.set(key, value);
      expect(cache.has(key)).toBe(true);
    });

    it("should clear all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      expect(cache.has("key1")).toBe(true);
      expect(cache.has("key2")).toBe(true);

      cache.clear();

      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(false);
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should respect custom TTL", () => {
      const key = "ttl-test";
      const value = "test-value";
      const ttl = 1000; // 1 second

      cache.set(key, value, ttl);
      expect(cache.get(key)).toBe(value);

      // Fast-forward time beyond TTL
      jest.advanceTimersByTime(1001);

      expect(cache.get(key)).toBeNull();
      expect(cache.has(key)).toBe(false);
    });

    it("should use default TTL when not specified", () => {
      const key = "default-ttl-test";
      const value = "test-value";

      cache.set(key, value);

      // Should still be available after 1 hour
      jest.advanceTimersByTime(60 * 60 * 1000);
      expect(cache.get(key)).toBe(value);

      // Should expire after default TTL (6 hours)
      jest.advanceTimersByTime(5 * 60 * 60 * 1000 + 1);
      expect(cache.get(key)).toBeNull();
    });
  });

  describe("cache statistics", () => {
    it("should track cache statistics", () => {
      // Set some values
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      // Get some values (hits)
      cache.get("key1");
      cache.get("key1");

      // Try to get non-existent value (miss)
      cache.get("non-existent");

      const stats = cache.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.missRate).toBeGreaterThan(0);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it("should calculate hit and miss rates correctly", () => {
      cache.set("key1", "value1");

      // 2 hits
      cache.get("key1");
      cache.get("key1");

      // 1 miss
      cache.get("non-existent");

      const stats = cache.getStats();

      expect(stats.hitRate).toBeCloseTo(66.67, 1); // 2/3 * 100
      expect(stats.missRate).toBeCloseTo(33.33, 1); // 1/3 * 100
    });
  });

  describe("cache configuration", () => {
    it("should accept configuration changes", () => {
      const newConfig: Partial<CacheConfig> = {
        maxSize: 1024 * 1024, // 1MB
        maxEntries: 100,
        defaultTTL: 30 * 60 * 1000, // 30 minutes
      };

      cache.configure(newConfig);

      // Configuration should be applied (we can't directly test private config,
      // but we can test behavior changes)
      const key = "config-test";
      const value = "test-value";

      cache.set(key, value);

      // Should expire after new default TTL
      jest.advanceTimersByTime(30 * 60 * 1000 + 1);
      expect(cache.get(key)).toBeNull();
    });
  });

  describe("playground-specific methods", () => {
    describe("experiment data caching", () => {
      it("should cache and retrieve experiment data", () => {
        const experimentId = "exp-123";
        const data = { result: "success", value: 42 };

        const cached = cache.cacheExperimentData(experimentId, data);
        expect(cached).toBe(true);

        const retrieved = cache.getExperimentData(experimentId);
        expect(retrieved).toEqual(data);
      });

      it("should use 6-hour TTL for experiment data", () => {
        const experimentId = "exp-ttl-test";
        const data = { test: "data" };

        cache.cacheExperimentData(experimentId, data);

        // Should be available after 5 hours
        jest.advanceTimersByTime(5 * 60 * 60 * 1000);
        expect(cache.getExperimentData(experimentId)).toEqual(data);

        // Should expire after 6 hours
        jest.advanceTimersByTime(60 * 60 * 1000 + 1);
        expect(cache.getExperimentData(experimentId)).toBeNull();
      });
    });

    describe("shader caching", () => {
      it("should cache and retrieve shader code", () => {
        const shaderId = "shader-123";
        const shaderCode =
          "precision mediump float; void main() { gl_FragColor = vec4(1.0); }";

        const cached = cache.cacheShader(shaderId, shaderCode);
        expect(cached).toBe(true);

        const retrieved = cache.getShader(shaderId);
        expect(retrieved).toBe(shaderCode);
      });

      it("should use 24-hour TTL for shaders", () => {
        const shaderId = "shader-ttl-test";
        const shaderCode = "test shader code";

        cache.cacheShader(shaderId, shaderCode);

        // Should be available after 23 hours
        jest.advanceTimersByTime(23 * 60 * 60 * 1000);
        expect(cache.getShader(shaderId)).toBe(shaderCode);

        // Should expire after 24 hours
        jest.advanceTimersByTime(60 * 60 * 1000 + 1);
        expect(cache.getShader(shaderId)).toBeNull();
      });
    });

    describe("performance metrics caching", () => {
      it("should cache and retrieve performance metrics", () => {
        const experimentId = "perf-123";
        const metrics = { fps: 60, drawCalls: 100 };

        const cached = cache.cachePerformanceMetrics(experimentId, metrics);
        expect(cached).toBe(true);

        const retrieved = cache.getPerformanceMetrics(experimentId);
        expect(retrieved).toEqual(metrics);
      });

      it("should use 5-minute TTL for performance metrics", () => {
        const experimentId = "perf-ttl-test";
        const metrics = { fps: 30 };

        cache.cachePerformanceMetrics(experimentId, metrics);

        // Should be available after 4 minutes
        jest.advanceTimersByTime(4 * 60 * 1000);
        expect(cache.getPerformanceMetrics(experimentId)).toEqual(metrics);

        // Should expire after 5 minutes
        jest.advanceTimersByTime(60 * 1000 + 1);
        expect(cache.getPerformanceMetrics(experimentId)).toBeNull();
      });
    });

    describe("texture caching", () => {
      it("should cache and retrieve texture data", () => {
        const textureId = "texture-123";
        const textureData = new ArrayBuffer(1024);

        const cached = cache.cacheTexture(textureId, textureData);
        expect(cached).toBe(true);

        const retrieved = cache.getTexture(textureId);
        expect(retrieved).toEqual(textureData);
      });

      it("should use 12-hour TTL for textures", () => {
        const textureId = "texture-ttl-test";
        const textureData = new ArrayBuffer(512);

        cache.cacheTexture(textureId, textureData);

        // Should be available after 11 hours
        jest.advanceTimersByTime(11 * 60 * 60 * 1000);
        expect(cache.getTexture(textureId)).toEqual(textureData);

        // Should expire after 12 hours
        jest.advanceTimersByTime(60 * 60 * 1000 + 1);
        expect(cache.getTexture(textureId)).toBeNull();
      });
    });

    describe("compiled shader caching", () => {
      it("should cache and retrieve compiled shader programs", () => {
        const programId = "program-123";
        const program = { id: "gl-program", uniforms: {} };

        const cached = cache.cacheCompiledShader(programId, program);
        expect(cached).toBe(true);

        const retrieved = cache.getCompiledShader(programId);
        expect(retrieved).toEqual(program);
      });
    });
  });

  describe("persistence", () => {
    it("should save to localStorage when persistence is enabled", () => {
      cache.set("persist-test", "test-value");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "playground-cache",
        expect.any(String),
      );
    });

    it("should load from localStorage on initialization", () => {
      const cacheData = {
        entries: [
          [
            "test-key",
            {
              data: "test-value",
              timestamp: Date.now(),
              ttl: 60000,
              accessCount: 0,
              lastAccessed: Date.now(),
              size: 20,
            },
          ],
        ],
        stats: { hits: 0, misses: 0, evictions: 0, totalRequests: 0 },
        timestamp: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cacheData));

      // Create new cache instance to trigger loading
      const newCache = new (CacheManager as typeof CacheManager)();
      expect(newCache).toBeDefined();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("playground-cache");
    });

    it("should handle localStorage errors gracefully", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      // Should not throw
      expect(() => cache.set("error-test", "value")).not.toThrow();
    });
  });

  describe("cleanup and eviction", () => {
    it("should clean up expired entries automatically", () => {
      const key = "cleanup-test";
      const value = "test-value";
      const ttl = 1000; // 1 second

      cache.set(key, value, ttl);
      expect(cache.has(key)).toBe(true);

      // Fast-forward past TTL
      jest.advanceTimersByTime(1001);

      // Trigger cleanup (normally happens on interval)
      jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes

      expect(cache.has(key)).toBe(false);
    });

    it("should evict entries when cache is full", () => {
      // Mock Date.now to ensure different timestamps
      let mockTime = 1000;
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => mockTime++);

      try {
        // Configure small cache for testing
        cache.configure({
          maxEntries: 2,
          maxSize: 1000,
        });

        // Fill cache to capacity
        cache.set("key1", "value1");
        cache.set("key2", "value2");

        // Access key1 to make it more recently used
        cache.get("key1");

        // Add third item - should evict key2 (least recently used)
        cache.set("key3", "value3");

        expect(cache.has("key1")).toBe(true);
        expect(cache.has("key2")).toBe(false);
        expect(cache.has("key3")).toBe(true);
      } finally {
        Date.now = originalDateNow;
      }
    });
  });

  describe("compression", () => {
    it("should compress large strings when enabled", () => {
      cache.configure({ enableCompression: true });

      const largeString = "a".repeat(2000); // Large string that should be compressed
      const key = "compression-test";

      cache.set(key, largeString);
      const retrieved = cache.get(key);

      expect(retrieved).toBe(largeString);
    });

    it("should not compress when disabled", () => {
      // Clear cache and reset configuration
      cache.clear();
      cache.configure({
        enableCompression: false,
        maxSize: 10 * 1024 * 1024, // 10MB
        maxEntries: 1000,
      });

      const largeString = "b".repeat(2000);
      const key = "no-compression-test";

      cache.set(key, largeString);
      const retrieved = cache.get(key);

      expect(retrieved).toBe(largeString);
    });
  });

  describe("destroy", () => {
    it("should clean up resources when destroyed", () => {
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      cache.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(cache.getStats().totalEntries).toBe(0);
    });
  });
});

describe("CDNCacheHeaders", () => {
  describe("getStaticAssetHeaders", () => {
    it("should return appropriate headers for static assets", () => {
      const headers = CDNCacheHeaders.getStaticAssetHeaders();

      expect(headers["Cache-Control"]).toContain("public");
      expect(headers["Cache-Control"]).toContain("max-age=31536000");
      expect(headers["Cache-Control"]).toContain("immutable");
      expect(headers).toHaveProperty("Expires");
      expect(headers).toHaveProperty("ETag");
    });
  });

  describe("getExperimentDataHeaders", () => {
    it("should return appropriate headers for experiment data", () => {
      const headers = CDNCacheHeaders.getExperimentDataHeaders();

      expect(headers["Cache-Control"]).toContain("public");
      expect(headers["Cache-Control"]).toContain("max-age=21600"); // 6 hours
      expect(headers["Cache-Control"]).toContain("stale-while-revalidate=3600");
      expect(headers).toHaveProperty("Expires");
      expect(headers).toHaveProperty("Vary");
    });
  });

  describe("getShaderHeaders", () => {
    it("should return appropriate headers for shader code", () => {
      const headers = CDNCacheHeaders.getShaderHeaders();

      expect(headers["Cache-Control"]).toContain("max-age=86400"); // 24 hours
      expect(headers["Content-Type"]).toBe("text/plain");
    });
  });

  describe("getPerformanceMetricsHeaders", () => {
    it("should return appropriate headers for performance metrics", () => {
      const headers = CDNCacheHeaders.getPerformanceMetricsHeaders();

      expect(headers["Cache-Control"]).toContain("max-age=300"); // 5 minutes
      expect(headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("getTextureHeaders", () => {
    it("should return appropriate headers for texture data", () => {
      const headers = CDNCacheHeaders.getTextureHeaders();

      expect(headers["Cache-Control"]).toContain("max-age=43200"); // 12 hours
      expect(headers["Cache-Control"]).toContain("immutable");
      expect(headers["Content-Type"]).toBe("application/octet-stream");
    });
  });
});

describe("ServiceWorkerCache", () => {
  describe("register", () => {
    it("should register service worker when supported", async () => {
      mockServiceWorker.register.mockResolvedValue({ scope: "/" });

      await ServiceWorkerCache.register();

      expect(mockServiceWorker.register).toHaveBeenCalledWith(
        "/sw-playground.js",
      );
    });

    it("should handle registration errors gracefully", async () => {
      mockServiceWorker.register.mockRejectedValue(
        new Error("Registration failed"),
      );

      // Should not throw
      await expect(ServiceWorkerCache.register()).resolves.toBeUndefined();
    });

    it("should handle missing service worker support", async () => {
      const originalServiceWorker = navigator.serviceWorker;

      // Temporarily remove serviceWorker by setting to undefined
      (
        navigator as typeof navigator & {
          serviceWorker?: ServiceWorkerContainer;
        }
      ).serviceWorker = undefined;

      // Should not throw
      await expect(ServiceWorkerCache.register()).resolves.toBeUndefined();

      // Restore original serviceWorker
      (
        navigator as typeof navigator & {
          serviceWorker?: ServiceWorkerContainer;
        }
      ).serviceWorker = originalServiceWorker;
    });
  });

  describe("cachePlaygroundAssets", () => {
    it("should cache playground assets when supported", async () => {
      // Mock the global objects directly
      (global as typeof global & { navigator: Navigator }).navigator = {
        ...navigator,
        serviceWorker: mockServiceWorker,
      };

      (
        global as typeof global & { window: Window & { caches: CacheStorage } }
      ).window = {
        ...window,
        caches: mockCaches,
      };

      // Reset mocks
      mockCaches.open.mockResolvedValue(mockCache);
      mockCache.addAll.mockResolvedValue(undefined);

      await ServiceWorkerCache.cachePlaygroundAssets();

      expect(mockCaches.open).toHaveBeenCalledWith("playground-v1");
      expect(mockCache.addAll).toHaveBeenCalledWith(
        expect.arrayContaining([
          "/portfolio/playground/design",
          "/portfolio/playground/WebGL",
        ]),
      );
    });

    it("should handle caching errors gracefully", async () => {
      mockCaches.open.mockRejectedValue(new Error("Cache error"));

      // Should not throw
      await expect(
        ServiceWorkerCache.cachePlaygroundAssets(),
      ).resolves.toBeUndefined();
    });

    it("should handle missing caches API", async () => {
      const originalCaches = window.caches;
      // @ts-expect-error - Intentionally deleting caches for testing
      delete window.caches;

      // Should not throw
      await expect(
        ServiceWorkerCache.cachePlaygroundAssets(),
      ).resolves.toBeUndefined();

      window.caches = originalCaches;
    });
  });
});
