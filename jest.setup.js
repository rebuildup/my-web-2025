import "@testing-library/jest-dom";

// Mock marked.js to avoid ES module issues
jest.mock("marked", () => ({
  marked: {
    parse: jest.fn((content) => `<p>${content}</p>`),
    setOptions: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    const { unoptimized, ...imgProps } = props;
    // Remove unoptimized prop entirely to avoid DOM warnings
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} />;
  },
}));

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock PerformanceObserver
const MockPerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// Add supportedEntryTypes as a static property
Object.defineProperty(MockPerformanceObserver, "supportedEntryTypes", {
  writable: true,
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
});

global.PerformanceObserver = MockPerformanceObserver;

// Mock performance.memory
Object.defineProperty(global.performance, "memory", {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
});

// Also ensure performance.memory is available on window.performance
if (typeof window !== "undefined") {
  Object.defineProperty(window.performance, "memory", {
    writable: true,
    value: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  });
}

// Mock performance.getEntriesByType
global.performance.getEntriesByType = jest.fn().mockReturnValue([]);

// Mock performance.getEntriesByName
global.performance.getEntriesByName = jest.fn().mockReturnValue([]);

// Mock performance.mark
global.performance.mark = jest.fn();

// Mock performance.measure
global.performance.measure = jest.fn();

// Mock performance.clearMarks
global.performance.clearMarks = jest.fn();

// Mock performance.clearMeasures
// Mock performance.now for timing tests
let mockTime = 1000; // Start with a base time
const performanceNowMock = jest.fn().mockImplementation(() => {
  const currentTime = mockTime;
  mockTime += 10 + Math.random() * 5; // Add consistent time increment (10-15ms)
  return currentTime;
});

// Ensure performance object exists and has now method
const mockPerformance = {
  now: performanceNowMock,
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByType: jest.fn().mockReturnValue([]),
  getEntriesByName: jest.fn().mockReturnValue([]),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

global.performance = mockPerformance;

// Reset mock time before each test
beforeEach(() => {
  mockTime = 1000; // Reset to base time
  performanceNowMock.mockClear();

  // Ensure performance is available in each test
  global.performance = {
    ...mockPerformance,
    now: performanceNowMock,
  };
});

global.performance.clearMeasures = jest.fn();

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
  return setTimeout(() => callback({ timeRemaining: () => 50 }), 0);
});

global.cancelIdleCallback = jest.fn((id) => clearTimeout(id));

// Ensure navigator exists before mocking its properties
if (!global.navigator) {
  global.navigator = {};
}

// Mock navigator.connection
Object.defineProperty(global.navigator, "connection", {
  writable: true,
  value: {
    effectiveType: "4g",
    downlink: 10,
    rtt: 100,
    saveData: false,
  },
});

// Mock navigator.onLine
Object.defineProperty(global.navigator, "onLine", {
  writable: true,
  value: true,
});

// Mock navigator.maxTouchPoints
Object.defineProperty(global.navigator, "maxTouchPoints", {
  writable: true,
  value: 0,
});

// Mock gtag
global.gtag = jest.fn();

// Mock window.gtag
if (typeof window !== "undefined") {
  window.gtag = jest.fn();
}

// Mock Next.js Web APIs
global.Request = jest.fn().mockImplementation((input, init) => ({
  url: typeof input === "string" ? input : input.url,
  method: init?.method || "GET",
  headers: new Headers(init?.headers),
  body: init?.body,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(""),
  formData: jest.fn().mockResolvedValue(new FormData()),
}));

global.Response = jest.fn().mockImplementation((body, init) => ({
  status: init?.status || 200,
  statusText: init?.statusText || "OK",
  headers: new Headers(init?.headers),
  body,
  json: jest.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  text: jest.fn().mockResolvedValue(body || ""),
}));

// Use the native URL constructor from Node.js
const { URL } = require("url");
global.URL = URL;

// Mock NextRequest and NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((input, init) => {
    const url = typeof input === "string" ? input : input.url;
    let urlObj;
    try {
      urlObj = new (require("url").URL)(url);
    } catch {
      urlObj = {
        pathname: "/",
        search: "",
        origin: "http://localhost:3000",
        href: url,
      };
    }
    return {
      url,
      method: init?.method || "GET",
      headers: new Headers(init?.headers),
      body: init?.body,
      json: jest.fn().mockResolvedValue({}),
      text: jest.fn().mockResolvedValue(""),
      formData: jest.fn().mockResolvedValue(new FormData()),
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        clear: jest.fn(),
      },
      nextUrl: {
        pathname: urlObj.pathname || "/",
        searchParams: new URLSearchParams(urlObj.search || ""),
        search: urlObj.search || "",
        origin: urlObj.origin || "http://localhost:3000",
        href: url,
      },
    };
  }),
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      const response = {
        status: init?.status || 200,
        statusText: init?.statusText || "OK",
        headers: new Headers(init?.headers),
        body: JSON.stringify(body),
        json: jest.fn().mockResolvedValue(body),
        text: jest.fn().mockResolvedValue(JSON.stringify(body)),
      };
      return response;
    }),
    redirect: jest.fn().mockImplementation((url, status = 302) => ({
      status,
      headers: new Headers({ Location: url }),
    })),
    rewrite: jest.fn().mockImplementation((url) => ({
      headers: new Headers({ "x-middleware-rewrite": url }),
    })),
    next: jest.fn().mockImplementation(() => ({
      status: 200,
      headers: new Headers(),
    })),
  },
}));

global.Headers = jest.fn().mockImplementation((init) => {
  const headers = new Map();
  if (init) {
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => headers.set(key.toLowerCase(), value));
    } else if (typeof init === "object") {
      Object.entries(init).forEach(([key, value]) =>
        headers.set(key.toLowerCase(), value),
      );
    }
  }
  return {
    get: (key) => headers.get(key.toLowerCase()),
    set: (key, value) => headers.set(key.toLowerCase(), value),
    has: (key) => headers.has(key.toLowerCase()),
    delete: (key) => headers.delete(key.toLowerCase()),
    entries: () => headers.entries(),
    keys: () => headers.keys(),
    values: () => headers.values(),
    forEach: (callback) => headers.forEach(callback),
  };
});

// Suppress React act warnings and navigation errors in tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: An update to") ||
        args[0].includes("An update to") ||
        args[0].includes("Not implemented: navigation") ||
        args[0].includes("Error in admin analytics API:") ||
        args[0].includes("Error logging admin action:") ||
        args[0].includes("Error creating backup:") ||
        args[0].includes("Failed to measure custom metric") ||
        args[0].includes("Invalid JSON in") ||
        args[0].includes("Error in monitoring/") ||
        args[0].includes("SyntaxError: Unexpected end of JSON input") ||
        args[0].includes("Validation error for") ||
        args[0].includes("Portfolio data processing failed:") ||
        args[0].includes("Received NaN for the `children` attribute") ||
        args[0].includes(
          "Received `true` for a non-boolean attribute `unoptimized`",
        ) ||
        args[0].includes("VideoDesignGallery Error") ||
        args[0].includes("Validation failed:") ||
        args[0].includes("Error creating markdown file:") ||
        args[0].includes("Error fetching featured projects:") ||
        args[0].includes("Error generating search index:") ||
        args[0].includes("Error generating sitemap entries:") ||
        args[0].includes("Error saving dates file:") ||
        args[0].includes("Error saving tags file:") ||
        args[0].includes("Error generating portfolio top metadata:") ||
        args[0].includes("Received `true` for a non-boolean attribute") ||
        args[0].includes("Received `false` for a non-boolean attribute") ||
        args[0].includes("for a non-boolean attribute `prefetch`") ||
        args[0].includes("for a non-boolean attribute `fill`") ||
        args[0].includes("Maximum update depth exceeded") ||
        args[0].includes("is an async Client Component") ||
        args[0].includes("A component suspended inside an `act` scope") ||
        args[0].includes("Error rendering portfolio detail page") ||
        args[0].includes("Image failed to load"))
    ) {
      return;
    }
    if (args[0] && args[0].type === "not implemented") {
      return;
    }
    // Skip intentional test errors
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("Test error")
    ) {
      return;
    }
    // Skip error handling test errors
    if (
      args[0] &&
      typeof args[0] === "object" &&
      args[0].code === "UNKNOWN_ERROR"
    ) {
      return;
    }
    // Skip Application Error logs from error handling tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Application Error:") ||
        args[0].includes("Application Warning:") ||
        args[0].includes("Application Info:"))
    ) {
      return;
    }
    // Skip when first argument is "Application Error:" and second is an object
    if (
      args[0] === "Application Error:" &&
      args[1] &&
      typeof args[1] === "object"
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Invalid JSON in") ||
        args[0].includes("Error in monitoring/") ||
        args[0].includes("Invalid portfolio item:") ||
        args[0].includes("Failed to get metadata for") ||
        args[0].includes("Failed to convert content to markdown file") ||
        args[0].includes("Failed to read markdown file") ||
        args[0].includes("Failed to update markdown file") ||
        args[0].includes("Failed to delete markdown file") ||
        args[0].includes("Error loading tags file:") ||
        args[0].includes("VideoDesignGallery: Invalid item object found") ||
        args[0].includes("VideoDesignGallery: Item missing valid") ||
        args[0].includes(
          "Performance regression monitoring failed to start:",
        ) ||
        args[0].includes("LCP observer not supported") ||
        args[0].includes("FID observer not supported") ||
        args[0].includes("CLS observer not supported") ||
        args[0].includes("FCP observer not supported") ||
        args[0].includes("Chunk loading monitoring not supported") ||
        args[0].includes("Failed to load markdown content:") ||
        args[0].includes("[MarkdownRenderer] Rendering error state"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.log = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Starting portfolio data processing") ||
        args[0].includes("Successfully processed") ||
        args[0].includes("Generated search index") ||
        args[0].includes("Cache updated with") ||
        args[0].includes("Portfolio data processing completed") ||
        args[0].includes("Returning cached portfolio data") ||
        args[0].includes("VideoDesignGallery received items:") ||
        args[0].includes("VideoDesignGallery: Removing duplicate item") ||
        args[0].includes("Successfully loaded") ||
        args[0].includes("=== Form submission started ===") ||
        args[0].includes("Original form data:") ||
        args[0].includes("Data to save:") ||
        args[0].includes("Calling onSave...") ||
        args[0].includes("Loading tags from tag manager...") ||
        args[0].includes("Loaded tags:") ||
        args[0].includes("New tag created successfully:") ||
        args[0].includes("Creating new tag:") ||
        args[0].includes("Updating tag usage for:") ||
        args[0].includes("After category filtering:") ||
        args[0].includes("Enhanced item") ||
        args[0].includes("[MarkdownRenderer]") ||
        args[0].includes("[Cache] Warmed cache") ||
        args[0].includes("Attempting to load portfolio item") ||
        args[0].includes("Portfolio item found:") ||
        args[0].includes("Portfolio item not found") ||
        (args[0].includes("Processing") && args[0].includes("portfolio items")))
    ) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Memory cleanup after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Mock window.matchMedia (both global and window)
const matchMediaMock = jest.fn().mockImplementation((query) => {
  // Return appropriate matches based on query
  let matches = false;
  if (query.includes("(hover: hover)")) matches = true;
  if (query.includes("(pointer: fine)")) matches = true;
  if (query.includes("(prefers-reduced-motion: reduce)")) matches = false;
  if (query.includes("(prefers-contrast: high)")) matches = false;
  if (query.includes("(min-width:")) matches = true; // Assume desktop by default

  const mockMediaQueryList = {
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  return mockMediaQueryList;
});

// Set on global object
Object.defineProperty(global, "matchMedia", {
  writable: true,
  value: matchMediaMock,
});

// Create a comprehensive window mock
const windowMock = {
  matchMedia: matchMediaMock,
  location: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
  },
  navigator: {
    userAgent: "test",
    maxTouchPoints: 0,
    onLine: true,
    connection: {
      effectiveType: "4g",
      downlink: 10,
      rtt: 100,
      saveData: false,
    },
  },
};

// Set window mock globally
global.window = windowMock;

// Also set matchMedia directly on global for non-window contexts
global.matchMedia = matchMediaMock;

// Ensure window is available in all test environments
beforeEach(() => {
  // Reset window mock for each test
  const freshWindowMock = {
    matchMedia: matchMediaMock,
    location: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
      pathname: "/",
      search: "",
    },
    navigator: {
      userAgent: "test",
      maxTouchPoints: 0,
      onLine: true,
      connection: {
        effectiveType: "4g",
        downlink: 10,
        rtt: 100,
        saveData: false,
      },
    },
  };

  global.window = freshWindowMock;
  global.matchMedia = matchMediaMock;

  // Also ensure window is available as a global property
  if (typeof globalThis !== "undefined") {
    globalThis.window = freshWindowMock;
  }
});
