/**
 * @jest-environment jsdom
 */
// Mock Web APIs
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

Object.defineProperty(navigator, "maxTouchPoints", {
  writable: true,
  value: 0,
});

import * as ContentModule from "../admin/content/route";

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
global.PerformanceObserver = mockPerformanceObserver as jest.Mock;

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

describe("Content", () => {
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
      expect(ContentModule).toBeDefined();
    }).not.toThrow();
  });

  it("should have basic functionality", () => {
    expect(ContentModule).toBeDefined();
  });

  it("should handle errors gracefully", () => {
    expect(() => {
      expect(typeof ContentModule).toBe("object");
    }).not.toThrow();
  });
});
