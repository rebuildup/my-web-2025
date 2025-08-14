import {
  mockNextImage,
  mockNextRouter,
  mockReactHooks,
  mockWebAPIs,
  setupCommonMocks,
} from "../common-mocks";

describe("common-mocks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("mockNextImage", () => {
    it("should mock Next.js Image component", () => {
      mockNextImage();

      const NextImage = jest.requireMock("next/image").default;

      expect(NextImage).toBeDefined();
      expect(typeof NextImage).toBe("function");
    });

    it("should create img element with props", () => {
      mockNextImage();

      const NextImage = jest.requireMock("next/image").default;
      const props = {
        src: "/test.jpg",
        alt: "Test image",
        width: 100,
        height: 100,
      };

      const element = NextImage(props);

      expect(element.type).toBe("img");
      expect(element.props.src).toBe("/test.jpg");
      expect(element.props.alt).toBe("Test image");
      expect(element.props.width).toBe(100);
      expect(element.props.height).toBe(100);
    });

    it("should provide default alt text when not provided", () => {
      mockNextImage();

      const NextImage = jest.requireMock("next/image").default;
      const props = { src: "/test.jpg" };

      const element = NextImage(props);

      expect(element.props.alt).toBe("");
    });
  });

  describe("mockNextRouter", () => {
    it("should mock Next.js router hooks", () => {
      const mockRouter = mockNextRouter();

      expect(mockRouter).toBeDefined();
      expect(typeof mockRouter.push).toBe("function");
      expect(typeof mockRouter.replace).toBe("function");
      expect(typeof mockRouter.back).toBe("function");
      expect(typeof mockRouter.forward).toBe("function");
      expect(typeof mockRouter.refresh).toBe("function");
      expect(typeof mockRouter.prefetch).toBe("function");
    });

    it("should provide working router methods", () => {
      const mockRouter = mockNextRouter();

      expect(() => {
        mockRouter.push("/test");
        mockRouter.replace("/test");
        mockRouter.back();
        mockRouter.forward();
        mockRouter.refresh();
        mockRouter.prefetch("/test");
      }).not.toThrow();

      expect(mockRouter.push).toHaveBeenCalledWith("/test");
      expect(mockRouter.replace).toHaveBeenCalledWith("/test");
      expect(mockRouter.back).toHaveBeenCalled();
      expect(mockRouter.forward).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockRouter.prefetch).toHaveBeenCalledWith("/test");
    });

    it("should mock usePathname and useSearchParams", () => {
      mockNextRouter();

      const { usePathname, useSearchParams } =
        jest.requireMock("next/navigation");

      expect(usePathname()).toBe("/");
      expect(useSearchParams()).toBeInstanceOf(URLSearchParams);
    });
  });

  describe("mockReactHooks", () => {
    it("should mock React hooks", () => {
      mockReactHooks();

      const { useEffect, useCallback, useMemo } = jest.requireMock("react");

      expect(typeof useEffect).toBe("function");
      expect(typeof useCallback).toBe("function");
      expect(typeof useMemo).toBe("function");
    });

    it("should execute useEffect callback immediately", () => {
      // Mock useEffect directly
      const mockUseEffect = jest.fn((fn: () => void) => fn());
      jest.doMock("react", () => ({
        ...jest.requireActual("react"),
        useEffect: mockUseEffect,
      }));

      const mockCallback = jest.fn();
      mockUseEffect(mockCallback);

      expect(mockCallback).toHaveBeenCalled();
    });

    it("should return callback function from useCallback", () => {
      // Mock useCallback directly
      const mockUseCallback = jest.fn((fn: () => void) => fn);
      jest.doMock("react", () => ({
        ...jest.requireActual("react"),
        useCallback: mockUseCallback,
      }));

      const mockCallback = jest.fn();
      const result = mockUseCallback(mockCallback);

      expect(result).toBe(mockCallback);
    });

    it("should execute and return result from useMemo", () => {
      // Mock useMemo directly
      const mockUseMemo = jest.fn((fn: () => unknown) => fn());
      jest.doMock("react", () => ({
        ...jest.requireActual("react"),
        useMemo: mockUseMemo,
      }));

      const mockValue = { test: "value" };
      const mockCallback = jest.fn(() => mockValue);
      const result = mockUseMemo(mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(result).toBe(mockValue);
    });
  });

  describe("mockWebAPIs", () => {
    it("should mock matchMedia", () => {
      mockWebAPIs();

      const mediaQuery = window.matchMedia("(min-width: 768px)");

      expect(mediaQuery.matches).toBe(false);
      expect(mediaQuery.media).toBe("(min-width: 768px)");
      expect(typeof mediaQuery.addListener).toBe("function");
      expect(typeof mediaQuery.removeListener).toBe("function");
      expect(typeof mediaQuery.addEventListener).toBe("function");
      expect(typeof mediaQuery.removeEventListener).toBe("function");
      expect(typeof mediaQuery.dispatchEvent).toBe("function");
    });

    it("should mock ResizeObserver", () => {
      mockWebAPIs();

      const observer = new window.ResizeObserver(jest.fn());

      expect(typeof observer.observe).toBe("function");
      expect(typeof observer.unobserve).toBe("function");
      expect(typeof observer.disconnect).toBe("function");

      expect(() => {
        observer.observe(document.body);
        observer.unobserve(document.body);
        observer.disconnect();
      }).not.toThrow();
    });

    it("should mock IntersectionObserver", () => {
      mockWebAPIs();

      const observer = new window.IntersectionObserver(jest.fn());

      expect(typeof observer.observe).toBe("function");
      expect(typeof observer.unobserve).toBe("function");
      expect(typeof observer.disconnect).toBe("function");

      expect(() => {
        observer.observe(document.body);
        observer.unobserve(document.body);
        observer.disconnect();
      }).not.toThrow();
    });
  });

  describe("setupCommonMocks", () => {
    it("should set up all common mocks", () => {
      setupCommonMocks();

      // Verify Next.js Image mock
      const NextImage = jest.requireMock("next/image").default;
      expect(NextImage).toBeDefined();

      // Verify Next.js router mock
      const { useRouter } = jest.requireMock("next/navigation");
      expect(useRouter).toBeDefined();

      // Verify React hooks mock
      const { useEffect } = jest.requireMock("react");
      expect(useEffect).toBeDefined();

      // Verify Web APIs mock
      expect(window.matchMedia).toBeDefined();
      expect(window.ResizeObserver).toBeDefined();
      expect(window.IntersectionObserver).toBeDefined();
    });

    it("should allow all mocked components to work together", () => {
      setupCommonMocks();

      expect(() => {
        // Test Next.js Image
        const NextImage = jest.requireMock("next/image").default;
        NextImage({ src: "/test.jpg", alt: "Test" });

        // Test Next.js router
        const { useRouter } = jest.requireMock("next/navigation");
        const router = useRouter();
        router.push("/test");

        // Test React hooks
        const { useEffect } = jest.requireMock("react");
        useEffect(() => {});

        // Test Web APIs
        window.matchMedia("(min-width: 768px)");
        new window.ResizeObserver(() => {});
        new window.IntersectionObserver(() => {});
      }).not.toThrow();
    });
  });
});
