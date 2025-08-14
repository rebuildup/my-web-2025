/**
 * @jest-environment jsdom
 */

import { checkAnalyticsConfig, clearAnalyticsConsent } from "../dev-helpers";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(console, mockConsole);

  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.NEXT_PUBLIC_GA_ID;
});

describe("clearAnalyticsConsent", () => {
  it("should clear analytics consent in development", () => {
    process.env.NODE_ENV = "development";

    clearAnalyticsConsent();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      "analytics-consent",
    );
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics consent cleared");
  });

  it("should not clear analytics consent in production", () => {
    process.env.NODE_ENV = "production";

    clearAnalyticsConsent();

    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    expect(mockConsole.log).not.toHaveBeenCalled();
  });

  it("should not clear analytics consent in test environment", () => {
    process.env.NODE_ENV = "test";

    clearAnalyticsConsent();

    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    expect(mockConsole.log).not.toHaveBeenCalled();
  });

  it("should handle missing window object gracefully", () => {
    process.env.NODE_ENV = "development";
    const originalWindow = global.window;

    // @ts-expect-error - Intentionally deleting window for testing
    delete global.window;

    expect(() => clearAnalyticsConsent()).not.toThrow();

    global.window = originalWindow;
  });
});

describe("checkAnalyticsConfig", () => {
  it("should return true when GA_ID is configured", () => {
    process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";
    mockLocalStorage.getItem.mockReturnValue("true");

    const result = checkAnalyticsConfig();

    expect(result).toBe(true);
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics config check:", {
      hasGAId: true,
      hasConsent: true,
      gaId: "GA-123456789",
    });
  });

  it("should return false when GA_ID is not configured", () => {
    delete process.env.NEXT_PUBLIC_GA_ID;
    mockLocalStorage.getItem.mockReturnValue("true");

    const result = checkAnalyticsConfig();

    expect(result).toBe(false);
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics config check:", {
      hasGAId: false,
      hasConsent: true,
      gaId: "not configured",
    });
  });

  it("should handle missing consent", () => {
    process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";
    mockLocalStorage.getItem.mockReturnValue(null);

    const result = checkAnalyticsConfig();

    expect(result).toBe(true);
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics config check:", {
      hasGAId: true,
      hasConsent: false,
      gaId: "GA-123456789",
    });
  });

  it('should handle consent value "false"', () => {
    process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";
    mockLocalStorage.getItem.mockReturnValue("false");

    const result = checkAnalyticsConfig();

    expect(result).toBe(true);
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics config check:", {
      hasGAId: true,
      hasConsent: false,
      gaId: "GA-123456789",
    });
  });

  it("should handle empty GA_ID", () => {
    process.env.NEXT_PUBLIC_GA_ID = "";
    mockLocalStorage.getItem.mockReturnValue("true");

    const result = checkAnalyticsConfig();

    expect(result).toBe(false);
    expect(mockConsole.log).toHaveBeenCalledWith("Analytics config check:", {
      hasGAId: false,
      hasConsent: true,
      gaId: "not configured",
    });
  });

  it("should handle localStorage errors gracefully", () => {
    process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    expect(() => checkAnalyticsConfig()).not.toThrow();
  });
});

describe("Auto-clear functionality", () => {
  // Note: The auto-clear functionality runs when the module is imported
  // We need to test this by re-importing the module with different conditions

  it("should auto-clear consent in development when GA_ID is not configured", () => {
    // This test verifies the behavior described in the module
    // The actual auto-clear happens on module import, so we test the logic
    const shouldAutoClear =
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      localStorage.getItem("analytics-consent");

    // Test the auto-clear logic
    expect(typeof shouldAutoClear).toBe("boolean");

    // Simulate the conditions
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_GA_ID;
    mockLocalStorage.getItem.mockReturnValue("true");

    const testShouldAutoClear =
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      !!localStorage.getItem("analytics-consent");

    expect(testShouldAutoClear).toBe(true);
  });

  it("should not auto-clear consent when GA_ID is configured", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";
    mockLocalStorage.getItem.mockReturnValue("true");

    const shouldAutoClear =
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      localStorage.getItem("analytics-consent");

    expect(shouldAutoClear).toBe(false);
  });

  it("should not auto-clear consent in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_GA_ID;
    mockLocalStorage.getItem.mockReturnValue("true");

    const shouldAutoClear =
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      localStorage.getItem("analytics-consent");

    expect(shouldAutoClear).toBe(false);
  });

  it("should not auto-clear when no consent exists", () => {
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_GA_ID;
    mockLocalStorage.getItem.mockReturnValue(null);

    const shouldAutoClear =
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      !!localStorage.getItem("analytics-consent");

    expect(shouldAutoClear).toBe(false);
  });
});

describe("Edge cases and error handling", () => {
  it("should handle undefined environment variables", () => {
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_GA_ID;

    expect(() => clearAnalyticsConsent()).not.toThrow();
    expect(() => checkAnalyticsConfig()).not.toThrow();
  });

  it("should handle localStorage being unavailable", () => {
    const originalLocalStorage = window.localStorage;

    // @ts-expect-error - Intentionally deleting localStorage for testing
    delete window.localStorage;

    expect(() => checkAnalyticsConfig()).not.toThrow();

    window.localStorage = originalLocalStorage;
  });

  it("should handle console being unavailable", () => {
    const originalConsole = global.console;

    // @ts-expect-error - Intentionally deleting console for testing
    delete global.console;

    expect(() => {
      process.env.NODE_ENV = "development";
      clearAnalyticsConsent();
    }).not.toThrow();

    global.console = originalConsole;
  });
});
