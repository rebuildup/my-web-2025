/**
 * Tests for performance monitoring utilities
 */

import {
  initWebVitals,
  monitorMemoryUsage,
  monitorPageLoad,
  WebGLPerformanceMonitor,
} from "../performance";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock performance API
const mockPerformance = {
  getEntriesByType: jest.fn(),
  now: jest.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
  },
};

// Mock window object
const mockWindow = {
  addEventListener: jest.fn(),
  requestAnimationFrame: jest.fn(),
};

// Mock requestAnimationFrame
(
  global as unknown as { requestAnimationFrame: jest.Mock }
).requestAnimationFrame = jest.fn();

// Mock timers
jest.useFakeTimers();

describe("Performance Monitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Mock console
    Object.assign(console, mockConsole);

    // Mock globals
    (global as unknown as { performance: unknown }).performance =
      mockPerformance;
    (global as unknown as { window: unknown }).window = mockWindow;
    (
      global as unknown as { requestAnimationFrame: jest.Mock }
    ).requestAnimationFrame = jest.fn();

    mockPerformance.now.mockReturnValue(1000);
    (
      global as unknown as { requestAnimationFrame: jest.Mock }
    ).requestAnimationFrame.mockImplementation((callback: () => void) => {
      setTimeout(callback, 16); // ~60fps
      return 1;
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("initWebVitals", () => {
    it("should initialize Web Vitals monitoring", () => {
      initWebVitals();

      expect(mockConsole.log).toHaveBeenCalledWith(
        "Web Vitals monitoring initialized",
      );
    });

    it("should handle server-side environment gracefully", () => {
      // Test that the function doesn't throw
      expect(() => initWebVitals()).not.toThrow();

      // In Jest environment, window exists so it should log
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Web Vitals monitoring initialized",
      );
    });
  });

  describe("monitorPageLoad", () => {
    it("should set up page load monitoring", () => {
      // Clear mocks before test
      jest.clearAllMocks();

      // Mock window.addEventListener
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      monitorPageLoad();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );

      addEventListenerSpy.mockRestore();
    });

    it("should log page load time when page loads", () => {
      const mockNavigationTiming = {
        loadEventEnd: 2000,
        loadEventStart: 1500,
      };

      mockPerformance.getEntriesByType.mockReturnValue([mockNavigationTiming]);

      // Clear mocks before test
      jest.clearAllMocks();

      // Mock window.addEventListener
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      monitorPageLoad();

      // Get the load event handler
      const loadHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "load",
      )?.[1];

      expect(loadHandler).toBeDefined();

      // Simulate load event
      loadHandler();

      expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith(
        "navigation",
      );
      expect(mockConsole.log).toHaveBeenCalledWith("Page load time:", 500);

      addEventListenerSpy.mockRestore();
    });

    it("should handle missing navigation timing", () => {
      mockPerformance.getEntriesByType.mockReturnValue([]);

      // Clear mocks before test
      jest.clearAllMocks();

      // Mock window.addEventListener
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      monitorPageLoad();

      const loadHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "load",
      )?.[1];

      expect(loadHandler).toBeDefined();

      // Simulate load event
      loadHandler();

      expect(mockConsole.log).not.toHaveBeenCalledWith(
        expect.stringContaining("Page load time"),
      );

      addEventListenerSpy.mockRestore();
    });

    it("should handle server-side environment gracefully", () => {
      // Test that the function doesn't throw
      expect(() => monitorPageLoad()).not.toThrow();
    });
  });

  describe("monitorMemoryUsage", () => {
    it("should set up memory monitoring interval", () => {
      const setIntervalSpy = jest.spyOn(global, "setInterval");

      monitorMemoryUsage();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    });

    it("should warn about high memory usage", () => {
      // Set up high memory usage scenario - over 90% usage
      const highMemoryUsage = {
        usedJSHeapSize: 182 * 1024 * 1024, // 182MB (91% of 200MB)
        totalJSHeapSize: 200 * 1024 * 1024, // 200MB
        jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
      };

      // Clear mocks before test
      jest.clearAllMocks();

      // Mock window and performance.memory
      const originalWindow = global.window;
      const originalPerformance = global.performance;

      // Ensure window exists
      (global as unknown as { window: unknown }).window = mockWindow;

      // Mock performance with memory property
      Object.defineProperty(global, "performance", {
        value: {
          ...originalPerformance,
          memory: highMemoryUsage,
        },
        writable: true,
        configurable: true,
      });

      // Mock setInterval to capture the callback
      const setIntervalSpy = jest.spyOn(global, "setInterval");

      monitorMemoryUsage();

      // Verify setInterval was called
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);

      // Get the callback function from setInterval
      const callback = setIntervalSpy.mock.calls[0][0] as () => void;

      // Execute the callback directly
      callback();

      expect(mockConsole.warn).toHaveBeenCalledWith(
        "High memory usage:",
        "91.00%",
      );

      // Restore original values
      global.window = originalWindow;
      Object.defineProperty(global, "performance", {
        value: originalPerformance,
        writable: true,
        configurable: true,
      });

      setIntervalSpy.mockRestore();
    });

    it("should not warn about normal memory usage", () => {
      monitorMemoryUsage();

      // Fast-forward timer
      jest.advanceTimersByTime(30000);

      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it("should handle missing memory API", () => {
      (global as unknown as { performance: unknown }).performance = {
        ...mockPerformance,
        memory: undefined,
      };

      expect(() => monitorMemoryUsage()).not.toThrow();

      // Fast-forward timer
      jest.advanceTimersByTime(30000);

      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it("should handle server-side environment gracefully", () => {
      // Test that the function doesn't throw
      expect(() => monitorMemoryUsage()).not.toThrow();
    });
  });

  describe("WebGLPerformanceMonitor", () => {
    let mockGL: WebGLRenderingContext;
    let monitor: WebGLPerformanceMonitor;

    beforeEach(() => {
      mockGL = {} as WebGLRenderingContext;
      monitor = new WebGLPerformanceMonitor(mockGL);
    });

    describe("constructor", () => {
      it("should create monitor with WebGL context", () => {
        expect(monitor).toBeDefined();
        expect(monitor.getFPS()).toBe(0);
      });

      it("should work with WebGL2 context", () => {
        const mockGL2 = {} as WebGL2RenderingContext;
        const monitor2 = new WebGLPerformanceMonitor(mockGL2);
        expect(monitor2).toBeDefined();
      });
    });

    describe("start", () => {
      it("should start monitoring", () => {
        monitor.start();

        expect(mockPerformance.now).toHaveBeenCalled();
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });

      it("should not start if already running", () => {
        monitor.start();
        jest.clearAllMocks();

        monitor.start();

        expect(mockPerformance.now).not.toHaveBeenCalled();
      });
    });

    describe("stop", () => {
      it("should stop monitoring", () => {
        monitor.start();
        monitor.stop();

        // The monitoring loop should not continue
        jest.clearAllMocks();
        jest.advanceTimersByTime(100);

        expect(global.requestAnimationFrame).not.toHaveBeenCalled();
      });
    });

    describe("getFPS", () => {
      it("should return current FPS", () => {
        expect(monitor.getFPS()).toBe(0);
      });

      it("should calculate FPS correctly", () => {
        let currentTime = 1000;
        mockPerformance.now.mockImplementation(() => currentTime);

        monitor.start();

        // Simulate frames over 1 second
        for (let i = 0; i < 60; i++) {
          currentTime += 16.67; // ~60fps
          mockPerformance.now.mockReturnValue(currentTime);

          // Trigger the monitoring loop
          const rafCallback = (global.requestAnimationFrame as jest.Mock).mock
            .calls[i]?.[0];
          if (rafCallback) {
            rafCallback();
          }
        }

        // After 1 second, FPS should be calculated
        currentTime = 2000;
        mockPerformance.now.mockReturnValue(currentTime);

        const rafCallback = (global.requestAnimationFrame as jest.Mock).mock
          .calls[59]?.[0];
        if (rafCallback) {
          rafCallback();
        }

        expect(monitor.getFPS()).toBeGreaterThan(0);
      });
    });

    describe("edge cases", () => {
      it("should handle multiple start/stop cycles", () => {
        monitor.start();
        monitor.stop();
        monitor.start();
        monitor.stop();

        expect(() => monitor.getFPS()).not.toThrow();
      });

      it("should handle stop before start", () => {
        expect(() => monitor.stop()).not.toThrow();
      });

      it("should handle getFPS before start", () => {
        expect(monitor.getFPS()).toBe(0);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle all monitoring functions together", () => {
      // Clear mocks before test
      jest.clearAllMocks();

      // Mock window.addEventListener
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      expect(() => {
        initWebVitals();
        monitorPageLoad();
        monitorMemoryUsage();
      }).not.toThrow();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Web Vitals monitoring initialized",
      );

      addEventListenerSpy.mockRestore();
    });

    it("should handle browser compatibility issues", () => {
      // Remove performance API
      const originalPerformance = (
        global as unknown as { performance: unknown }
      ).performance;

      Object.defineProperty(global, "performance", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => {
        initWebVitals();
        monitorPageLoad();
        monitorMemoryUsage();
      }).not.toThrow();

      // Restore performance API
      Object.defineProperty(global, "performance", {
        value: originalPerformance,
        writable: true,
        configurable: true,
      });
    });

    it("should work in different environments", () => {
      // Test that all functions work without throwing
      expect(() => {
        initWebVitals();
        monitorPageLoad();
        monitorMemoryUsage();
      }).not.toThrow();
    });
  });
});
