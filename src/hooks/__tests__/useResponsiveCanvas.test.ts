/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";

// Mock useResponsive hook to avoid complex dependency chain
jest.mock("../useResponsive", () => ({
  useResponsive: jest.fn(() => ({
    breakpoints: {
      xs: false,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      "2xl": false,
    },
    viewport: {
      width: 1024,
      height: 768,
      aspectRatio: 1024 / 768,
    },
    touch: {
      isTouchDevice: false,
      maxTouchPoints: 0,
      supportsHover: true,
      supportsPointer: true,
    },
    orientation: "landscape" as const,
    isSmallScreen: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
}));

// Import after mocks are set up
import { useResponsive } from "../useResponsive";
import { useResponsiveCanvas } from "../useResponsiveCanvas";

// Get the mocked function for testing
const mockUseResponsive = useResponsive as jest.MockedFunction<
  typeof useResponsive
>;

// Mock responsive state for consistent testing
const mockResponsiveState = {
  breakpoints: {
    xs: false,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    "2xl": false,
  },
  viewport: {
    width: 1024,
    height: 768,
    aspectRatio: 1024 / 768,
  },
  touch: {
    isTouchDevice: false,
    maxTouchPoints: 0,
    supportsHover: true,
    supportsPointer: true,
  },
  orientation: "landscape" as const,
  isSmallScreen: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

// Mock mobile responsive state
const mockMobileResponsiveState = {
  ...mockResponsiveState,
  breakpoints: {
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
  },
  viewport: {
    width: 375,
    height: 667,
    aspectRatio: 375 / 667,
  },
  touch: {
    isTouchDevice: true,
    maxTouchPoints: 5,
    supportsHover: false,
    supportsPointer: false,
  },
  orientation: "portrait" as const,
  isSmallScreen: true,
  isMobile: true,
  isTablet: false,
  isDesktop: false,
};

// Create mock canvas element
const createMockCanvas = (type: "2d" | "webgl" = "2d") => {
  const mockContext =
    type === "2d" ? { scale: jest.fn() } : { viewport: jest.fn() };

  return {
    style: {},
    width: 0,
    height: 0,
    getContext: jest.fn((contextType: string) => {
      if (type === "2d" && contextType === "2d") return mockContext;
      if (
        type === "webgl" &&
        (contextType === "webgl" || contextType === "webgl2")
      )
        return mockContext;
      return null;
    }),
  } as unknown as HTMLCanvasElement;
};

describe("UseResponsiveCanvas", () => {
  // Reduced timeout for faster feedback
  jest.setTimeout(2000);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseResponsive.mockReturnValue(mockResponsiveState);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should import and initialize without crashing", () => {
    expect(useResponsiveCanvas).toBeDefined();
    expect(typeof useResponsiveCanvas).toBe("function");
  });

  it("should render hook and return expected structure", () => {
    const { result, unmount } = renderHook(() => useResponsiveCanvas());

    expect(result.current).toBeDefined();
    expect(result.current.dimensions).toBeDefined();
    expect(typeof result.current.dimensions.width).toBe("number");
    expect(typeof result.current.dimensions.height).toBe("number");
    expect(typeof result.current.dimensions.aspectRatio).toBe("number");
    expect(typeof result.current.dimensions.pixelRatio).toBe("number");
    expect(typeof result.current.setupCanvas).toBe("function");
    expect(typeof result.current.setupWebGLCanvas).toBe("function");
    expect(typeof result.current.calculateDimensions).toBe("function");

    unmount();
  });

  it("should handle custom config", () => {
    const config = {
      maxWidth: 800,
      maxHeight: 600,
      aspectRatio: 4 / 3,
    };

    const { result, unmount } = renderHook(() =>
      useResponsiveCanvas(undefined, config),
    );

    expect(result.current.dimensions).toBeDefined();
    expect(result.current.dimensions.width).toBeGreaterThan(0);
    expect(result.current.dimensions.height).toBeGreaterThan(0);

    unmount();
  });

  it("should handle mobile responsive state", () => {
    mockUseResponsive.mockReturnValue(mockMobileResponsiveState);

    const { result, unmount } = renderHook(() => useResponsiveCanvas());

    expect(result.current.dimensions).toBeDefined();
    expect(result.current.dimensions.width).toBeGreaterThan(0);
    expect(result.current.dimensions.height).toBeGreaterThan(0);

    unmount();
  });

  it("should setup canvas correctly", () => {
    const { result, unmount } = renderHook(() => useResponsiveCanvas());
    const mockCanvas = createMockCanvas("2d");

    const dimensions = result.current.setupCanvas(mockCanvas);

    expect(dimensions).toBeDefined();
    expect(typeof dimensions.width).toBe("number");
    expect(typeof dimensions.height).toBe("number");
    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");

    unmount();
  });

  it("should setup WebGL canvas correctly", () => {
    const { result, unmount } = renderHook(() => useResponsiveCanvas());
    const mockCanvas = createMockCanvas("webgl");

    const dimensions = result.current.setupWebGLCanvas(mockCanvas);

    expect(dimensions).toBeDefined();
    expect(typeof dimensions.width).toBe("number");
    expect(typeof dimensions.height).toBe("number");
    expect(mockCanvas.getContext).toHaveBeenCalled();

    unmount();
  });

  it("should calculate dimensions correctly", () => {
    const { result, unmount } = renderHook(() => useResponsiveCanvas());

    const dimensions = result.current.calculateDimensions();

    expect(dimensions).toBeDefined();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    expect(dimensions.aspectRatio).toBeGreaterThan(0);
    expect(dimensions.pixelRatio).toBeGreaterThan(0);
    expect(dimensions.displayWidth).toBeGreaterThan(0);
    expect(dimensions.displayHeight).toBeGreaterThan(0);

    unmount();
  });
});
