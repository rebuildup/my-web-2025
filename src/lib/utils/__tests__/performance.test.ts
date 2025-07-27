/**
 * @jest-environment jsdom
 */

import {
  PerformanceMonitor,
  MemoryManager,
  ResourcePreloader,
  BundleMonitor,
  usePerformanceOptimization,
  offlineUtils,
  dataPersistence,
  performanceMonitoring,
  initializePerformanceMonitoring,
} from "../performance";

// Mock performance API
const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

Object.defineProperty(global, "PerformanceObserver", {
  writable: true,
  value: mockPerformanceObserver,
});

// Mock performance.memory
Object.defineProperty(performance, "memory", {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
});

// Mock gtag
Object.defineProperty(window, "gtag", {
  writable: true,
  value: jest.fn(),
});

describe("Performance Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("PerformanceMonitor", () => {
    it("should initialize observers", () => {
      new PerformanceMonitor();
      expect(mockPerformanceObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
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

    it("should cleanup observers", () => {
      const monitor = new PerformanceMonitor();
      monitor.cleanup();
      expect(mockDisconnect).toHaveBeenCalled();
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

    it("should monitor chunk loading", () => {
      BundleMonitor.monitorChunkLoading();
      expect(mockPerformanceObserver).toHaveBeenCalled();
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
