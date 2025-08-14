import {
  mockMatchMedia,
  mockNextNavigation,
  mockPerformanceAPI,
} from "../browser-mocks";

describe("browser-mocks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("mockMatchMedia", () => {
    it("should mock matchMedia with default false matches", () => {
      mockMatchMedia();

      const mediaQuery = window.matchMedia("(min-width: 768px)");

      expect(mediaQuery.matches).toBe(false);
      expect(mediaQuery.media).toBe("(min-width: 768px)");
      expect(typeof mediaQuery.addListener).toBe("function");
      expect(typeof mediaQuery.removeListener).toBe("function");
      expect(typeof mediaQuery.addEventListener).toBe("function");
      expect(typeof mediaQuery.removeEventListener).toBe("function");
      expect(typeof mediaQuery.dispatchEvent).toBe("function");
    });

    it("should mock matchMedia with custom matches value", () => {
      mockMatchMedia(true);

      const mediaQuery = window.matchMedia("(min-width: 768px)");

      expect(mediaQuery.matches).toBe(true);
    });

    it("should handle multiple media queries", () => {
      mockMatchMedia();

      const query1 = window.matchMedia("(min-width: 768px)");
      const query2 = window.matchMedia("(max-width: 1024px)");

      expect(query1.media).toBe("(min-width: 768px)");
      expect(query2.media).toBe("(max-width: 1024px)");
    });

    it("should provide working event listener methods", () => {
      mockMatchMedia();

      const mediaQuery = window.matchMedia("(min-width: 768px)");
      const mockListener = jest.fn();

      expect(() => {
        mediaQuery.addListener(mockListener);
        mediaQuery.removeListener(mockListener);
        mediaQuery.addEventListener("change", mockListener);
        mediaQuery.removeEventListener("change", mockListener);
      }).not.toThrow();
    });
  });

  describe("mockPerformanceAPI", () => {
    it("should mock performance.memory", () => {
      mockPerformanceAPI();

      expect(global.performance.memory).toBeDefined();
      expect(global.performance.memory.usedJSHeapSize).toBe(1000000);
      expect(global.performance.memory.totalJSHeapSize).toBe(2000000);
      expect(global.performance.memory.jsHeapSizeLimit).toBe(4000000);
    });

    it("should mock performance.now", () => {
      const mockNow = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(mockNow);

      mockPerformanceAPI();

      expect(typeof global.performance.now).toBe("function");
      expect(global.performance.now()).toBe(mockNow);
    });

    it("should allow performance.now to be called multiple times", () => {
      mockPerformanceAPI();

      const time1 = global.performance.now();
      const time2 = global.performance.now();

      expect(typeof time1).toBe("number");
      expect(typeof time2).toBe("number");
    });
  });

  describe("mockNextNavigation", () => {
    it("should mock Next.js navigation hooks", () => {
      mockNextNavigation();

      // This test verifies that the mock is set up correctly
      // The actual mock behavior would be tested in components that use these hooks
      expect(() => {
        jest.requireMock("next/navigation");
      }).not.toThrow();
    });

    it("should provide router methods", () => {
      mockNextNavigation();

      const { useRouter } = jest.requireMock("next/navigation");
      const router = useRouter();

      expect(typeof router.push).toBe("function");
      expect(typeof router.replace).toBe("function");
      expect(typeof router.prefetch).toBe("function");
      expect(typeof router.back).toBe("function");
      expect(typeof router.forward).toBe("function");
      expect(typeof router.refresh).toBe("function");
    });

    it("should provide search params and pathname", () => {
      mockNextNavigation();

      const { useSearchParams, usePathname } =
        jest.requireMock("next/navigation");

      expect(useSearchParams()).toBeInstanceOf(URLSearchParams);
      expect(usePathname()).toBe("/");
    });

    it("should provide redirect and notFound functions", () => {
      mockNextNavigation();

      const { redirect, notFound } = jest.requireMock("next/navigation");

      expect(typeof redirect).toBe("function");
      expect(typeof notFound).toBe("function");
    });
  });
});
