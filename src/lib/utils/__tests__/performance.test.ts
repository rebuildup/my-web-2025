/// <reference types="@types/dom" />
/**
 * @jest-environment jsdom
 */

import {
  BundleMonitor,
  dataPersistence,
  initializePerformanceMonitoring,
  MemoryManager,
  offlineUtils,
  PerformanceMonitor,
  performanceMonitoring,
  ResourcePreloader,
  usePerformanceOptimization,
} from "../performance";

// Mock performance API - these are already set up in jest.setup.js
// but we need to access the mock functions for testing
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

// Override the global mocks with our test-specific mocks
const mockPerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  takeRecords: jest.fn(() => []),
}));

// Create a proper mock constructor with supportedEntryTypes
const MockPerformanceObserverConstructor =
  mockPerformanceObserver as jest.MockedClass<typeof PerformanceObserver>;
Object.defineProperty(
  MockPerformanceObserverConstructor,
  "supportedEntryTypes",
  {
    value: [
      "largest-contentful-paint",
      "first-input",
      "layout-shift",
      "paint",
      "resource",
      "navigation",
      "measure",
      "mark",
    ],
    writable: false,
    enumerable: true,
    configurable: true,
  },
);

// Replace the global PerformanceObserver with our test mock
global.PerformanceObserver = MockPerformanceObserverConstructor;

// Mock Performance API
Object.defineProperty(global, "performance", {
  writable: true,
  value: {
    getEntriesByType: jest.fn().mockReturnValue([]),
    mark: jest.fn(),
    measure: jest.fn(),
    now: jest.fn().mockReturnValue(Date.now()),
    timing: {},
    navigation: {
      type: 0,
      redirectCount: 0,
    },
  },
});

describe("Performance Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset mock call counts
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockPerformanceObserver.mockClear();
  });

  describe("PerformanceMonitor", () => {
    it("should create a PerformanceMonitor instance", () => {
      const monitor = new PerformanceMonitor();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });

    it("should get metrics", () => {
      const monitor = new PerformanceMonitor();
      const metrics = monitor.getMetrics();

      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics.memoryUsage).toEqual({
        used: 1000000,
        total: 2000000,
        limit: 4000000,
      });
    });

    it("should have cleanup method", () => {
      const monitor = new PerformanceMonitor();
      expect(typeof monitor.cleanup).toBe("function");

      // Should not throw when called
      expect(() => monitor.cleanup()).not.toThrow();
    });

    it("should handle observer initialization errors gracefully", () => {
      // Mock PerformanceObserver to throw an error
      const errorMock = jest.fn().mockImplementation(() => {
        throw new Error("Observer not supported");
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.PerformanceObserver = errorMock as any;

      // Should not throw an error
      expect(() => new PerformanceMonitor()).not.toThrow();

      // Restore the original mock
      global.PerformanceObserver = MockPerformanceObserverConstructor;
    });
  });

  describe("MemoryManager", () => {
    it("should be a singleton", () => {
      const manager1 = MemoryManager.getInstance();
      const manager2 = MemoryManager.getInstance();
      expect(manager1).toBe(manager2);
    });

    it("should register and unregister cleanup functions", () => {
      const manager = MemoryManager.getInstance();
      const cleanup = jest.fn();

      manager.register(cleanup);
      manager.cleanup();
      expect(cleanup).toHaveBeenCalled();

      cleanup.mockClear();
      manager.unregister(cleanup);
      manager.cleanup();
      expect(cleanup).not.toHaveBeenCalled();
    });
  });

  describe("ResourcePreloader", () => {
    beforeEach(() => {
      document.head.innerHTML = "";
    });

    it("should preload critical resources", () => {
      ResourcePreloader.preloadCriticalResources();
      const links = document.head.querySelectorAll("link[rel='preload']");
      expect(links.length).toBeGreaterThan(0);
    });

    it("should preload individual resource", () => {
      ResourcePreloader.preloadResource("/test.woff2");
      const link = document.head.querySelector("link[href='/test.woff2']");

      expect(link).toBeTruthy();
      expect(link?.getAttribute("rel")).toBe("preload");
      expect(link?.getAttribute("as")).toBe("font");
      expect(link?.getAttribute("type")).toBe("font/woff2");
      expect(link?.getAttribute("crossorigin")).toBe("anonymous");
    });
  });

  describe("BundleMonitor", () => {
    it("should log bundle info in development", () => {
      const consoleSpy = jest.spyOn(console, "group").mockImplementation();
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const consoleGroupEndSpy = jest
        .spyOn(console, "groupEnd")
        .mockImplementation();

      BundleMonitor.logBundleInfo();

      expect(consoleSpy).toHaveBeenCalledWith("Bundle Information");
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it("should have monitorChunkLoading method", () => {
      expect(typeof BundleMonitor.monitorChunkLoading).toBe("function");

      // Should not throw when called
      expect(() => BundleMonitor.monitorChunkLoading()).not.toThrow();
    });

    it("should handle chunk loading monitoring errors gracefully", () => {
      // Mock PerformanceObserver to throw an error
      const errorMock = jest.fn().mockImplementation(() => {
        throw new Error("Observer not supported");
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.PerformanceObserver = errorMock as any;

      // Should not throw an error
      expect(() => BundleMonitor.monitorChunkLoading()).not.toThrow();

      // Restore the original mock
      global.PerformanceObserver = MockPerformanceObserverConstructor;
    });
  });

  describe("usePerformanceOptimization", () => {
    it("should return performance utilities", () => {
      const result = usePerformanceOptimization();

      expect(result).toHaveProperty("performanceMonitor");
      expect(result).toHaveProperty("memoryManager");
      expect(result).toHaveProperty("cleanup");
      expect(typeof result.cleanup).toBe("function");
    });
  });

  describe("offlineUtils", () => {
    it("should detect online status", () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: true,
      });

      expect(offlineUtils.isOnline()).toBe(true);
    });

    it("should handle connection change events", () => {
      const callback = jest.fn();
      const removeListener = offlineUtils.onConnectionChange(callback);

      // Simulate online event
      const onlineEvent = new Event("online");
      window.dispatchEvent(onlineEvent);
      expect(callback).toHaveBeenCalledWith(true);

      // Cleanup
      removeListener();
    });
  });

  describe("dataPersistence", () => {
    it("should get storage info", () => {
      const info = dataPersistence.getStorageInfo();
      expect(info).toHaveProperty("used");
      expect(info).toHaveProperty("available");
      expect(info).toHaveProperty("percentage");
    });

    it("should set and get items", () => {
      const testData = { test: "value" };
      const result = dataPersistence.setItem("test-key", testData);
      expect(result).toBe(true);

      const retrieved = dataPersistence.getItem("test-key", {});
      expect(retrieved).toEqual(testData);
    });
  });

  describe("performanceMonitoring", () => {
    it("should get memory usage", () => {
      const usage = performanceMonitoring.getMemoryUsage();
      expect(usage).toEqual({
        used: 1000000,
        total: 2000000,
        percentage: 50,
      });
    });

    it("should measure execution time", () => {
      const testFn = () => "result";
      const result = performanceMonitoring.measureTime(testFn);

      expect(result.result).toBe("result");
      expect(typeof result.duration).toBe("number");
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe("initializePerformanceMonitoring", () => {
    it("should initialize performance monitoring", () => {
      const monitor = initializePerformanceMonitoring();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });
});
