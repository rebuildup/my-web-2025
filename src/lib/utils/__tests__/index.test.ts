/**
 * @jest-environment jsdom
 */

import {
  debounce,
  throttle,
  sleep,
  generateId,
  clamp,
  formatBytes,
  isClient,
  isServer,
} from "../index";

describe("Utility Functions", () => {
  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should delay function execution", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should cancel previous calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("first");
      debouncedFn("second");

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("second");
    });

    it("should handle multiple arguments", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1", "arg2", 123);
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", 123);
    });
  });

  describe("throttle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should limit function execution", () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn("first");
      throttledFn("second");
      throttledFn("third");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("first");
    });

    it("should allow execution after limit period", () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn("first");
      jest.advanceTimersByTime(100);
      throttledFn("second");

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, "first");
      expect(mockFn).toHaveBeenNthCalledWith(2, "second");
    });
  });

  describe("sleep", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should resolve after specified time", async () => {
      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });

    it("should work with different durations", async () => {
      const promise = sleep(500);
      jest.advanceTimersByTime(500);
      await promise;
      // In fake timers, we just verify it resolves
      expect(promise).resolves.toBeUndefined();
    });
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });

    it("should generate alphanumeric IDs", () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it("should generate multiple unique IDs", () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe("clamp", () => {
    it("should clamp value within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should handle edge cases", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
      expect(clamp(5, 5, 5)).toBe(5);
    });

    it("should work with negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(5, -10, -1)).toBe(-1);
    });

    it("should work with decimal values", () => {
      expect(clamp(2.5, 0, 5)).toBe(2.5);
      expect(clamp(-1.5, 0, 5)).toBe(0);
      expect(clamp(7.8, 0, 5)).toBe(5);
    });
  });

  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
    });

    it("should handle decimal places", () => {
      expect(formatBytes(1536, 1)).toBe("1.5 KB");
      expect(formatBytes(1536, 0)).toBe("2 KB");
      expect(formatBytes(1536, 3)).toBe("1.5 KB");
    });

    it("should handle large values", () => {
      expect(formatBytes(1099511627776)).toBe("1 TB");
      expect(formatBytes(1125899906842624)).toBe("1 PB");
    });

    it("should handle small values", () => {
      expect(formatBytes(512)).toBe("512 Bytes");
      expect(formatBytes(1)).toBe("1 Bytes");
    });

    it("should handle negative decimals", () => {
      expect(formatBytes(1536, -1)).toBe("2 KB");
    });
  });

  describe("isClient and isServer", () => {
    it("should detect client environment", () => {
      // In jsdom environment, window is defined
      expect(isClient).toBe(true);
      expect(isServer).toBe(false);
    });
  });
});
