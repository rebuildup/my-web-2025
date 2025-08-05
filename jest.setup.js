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
        args[0].includes("Received `false` for a non-boolean attribute"))
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
        args[0].includes("VideoDesignGallery: Item missing valid"))
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
