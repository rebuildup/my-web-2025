import "@testing-library/jest-dom";

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
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
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

// Suppress React act warnings and navigation errors in tests
const originalError = console.error;
const originalWarn = console.warn;
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
        args[0].includes("SyntaxError: Unexpected end of JSON input"))
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
        args[0].includes("Error in monitoring/"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock window.matchMedia (only in browser environment)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
