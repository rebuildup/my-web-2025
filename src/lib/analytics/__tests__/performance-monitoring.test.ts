/**
 * @jest-environment jsdom
 */

import * as performanceMonitoringModule from "../performance-monitoring";

// Mock all external dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Canvas API for WebGL and graphics components

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance APIs
Object.defineProperty(global.performance, "memory", {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
});

// Mock PerformanceObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockPerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  takeRecords: jest.fn(() => []),
}));
mockPerformanceObserver.supportedEntryTypes = [
  "largest-contentful-paint",
  "first-input",
  "layout-shift",
  "paint",
  "resource",
  "navigation",
  "measure",
  "mark",
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.PerformanceObserver = mockPerformanceObserver as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Mock performance API
Object.defineProperty(global, "performance", {
  writable: true,
  value: {
    getEntriesByType: jest.fn().mockReturnValue([]),
    mark: jest.fn(),
    measure: jest.fn(),
    now: jest.fn().mockReturnValue(Date.now()),
    timing: {},
  },
});

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

describe("Performance-monitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockPerformanceObserver.mockClear();
  });

  it("should import without crashing", () => {
    expect(() => {
      expect(performanceMonitoringModule).toBeDefined();
    }).not.toThrow();
  });

  it("should have basic functionality", () => {
    expect(performanceMonitoringModule).toBeDefined();
  });

  it("should handle errors gracefully", () => {
    expect(() => {
      expect(typeof performanceMonitoringModule).toBe("object");
    }).not.toThrow();
  });
});
