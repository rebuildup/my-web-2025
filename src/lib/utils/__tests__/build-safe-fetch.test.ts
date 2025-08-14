/**
 * @jest-environment jsdom
 */

import {
  buildSafeFetch,
  getApiUrl,
  shouldSkipFetchDuringBuild,
} from "../build-safe-fetch";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
};

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(console, mockConsole);

  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.NEXT_PUBLIC_BASE_URL;
});

describe("shouldSkipFetchDuringBuild", () => {
  it("should return true in production without base URL", () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_BASE_URL;

    expect(shouldSkipFetchDuringBuild()).toBe(true);
  });

  it("should return false in production with base URL", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";

    expect(shouldSkipFetchDuringBuild()).toBe(false);
  });

  it("should return false in development", () => {
    process.env.NODE_ENV = "development";

    expect(shouldSkipFetchDuringBuild()).toBe(false);
  });

  it("should return false in test environment", () => {
    process.env.NODE_ENV = "test";

    expect(shouldSkipFetchDuringBuild()).toBe(false);
  });

  it("should handle undefined NODE_ENV", () => {
    delete process.env.NODE_ENV;

    expect(shouldSkipFetchDuringBuild()).toBe(false);
  });
});

describe("buildSafeFetch", () => {
  it("should skip fetch during build when shouldSkipFetchDuringBuild returns true", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_BASE_URL;

    const result = await buildSafeFetch("https://api.example.com/data");

    expect(result).toBeNull();
    expect(mockConsole.log).toHaveBeenCalledWith(
      "Skipping fetch during build: https://api.example.com/data",
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should perform fetch when not skipping build", async () => {
    process.env.NODE_ENV = "development";
    const mockResponse = new Response('{"data": "test"}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await buildSafeFetch("https://api.example.com/data");

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      undefined,
    );
    expect(mockConsole.log).not.toHaveBeenCalled();
  });

  it("should pass fetch options correctly", async () => {
    process.env.NODE_ENV = "development";
    const mockResponse = new Response('{"data": "test"}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "data" }),
    };

    const result = await buildSafeFetch(
      "https://api.example.com/data",
      options,
    );

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      options,
    );
  });

  it("should handle fetch errors gracefully", async () => {
    process.env.NODE_ENV = "development";
    const fetchError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(fetchError);

    const result = await buildSafeFetch("https://api.example.com/data");

    expect(result).toBeNull();
    expect(mockConsole.warn).toHaveBeenCalledWith(
      "Fetch failed for https://api.example.com/data:",
      fetchError,
    );
  });

  it("should handle fetch timeout errors", async () => {
    process.env.NODE_ENV = "development";
    const timeoutError = new Error("Request timeout");
    mockFetch.mockRejectedValueOnce(timeoutError);

    const result = await buildSafeFetch("https://api.example.com/data", {
      signal: AbortSignal.timeout(5000),
    });

    expect(result).toBeNull();
    expect(mockConsole.warn).toHaveBeenCalledWith(
      "Fetch failed for https://api.example.com/data:",
      timeoutError,
    );
  });

  it("should handle network errors", async () => {
    process.env.NODE_ENV = "development";
    const networkError = new TypeError("Failed to fetch");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await buildSafeFetch("https://api.example.com/data");

    expect(result).toBeNull();
    expect(mockConsole.warn).toHaveBeenCalledWith(
      "Fetch failed for https://api.example.com/data:",
      networkError,
    );
  });
});

describe("getApiUrl", () => {
  it("should use NEXT_PUBLIC_BASE_URL when available", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com";

    const url = getApiUrl("/api/users");

    expect(url).toBe("https://myapp.com/api/users");
  });

  it("should use localhost when NEXT_PUBLIC_BASE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;

    const url = getApiUrl("/api/users");

    expect(url).toBe("http://localhost:3000/api/users");
  });

  it("should handle paths without leading slash", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com";

    const url = getApiUrl("api/users");

    expect(url).toBe("https://myapp.comapi/users");
  });

  it("should handle empty path", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com";

    const url = getApiUrl("");

    expect(url).toBe("https://myapp.com");
  });

  it("should handle base URL with trailing slash", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com/";

    const url = getApiUrl("/api/users");

    expect(url).toBe("https://myapp.com//api/users");
  });

  it("should handle complex paths", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com";

    const url = getApiUrl("/api/v1/users/123?include=profile");

    expect(url).toBe("https://myapp.com/api/v1/users/123?include=profile");
  });
});

describe("Integration tests", () => {
  it("should work correctly in production build scenario", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_BASE_URL;

    const apiUrl = getApiUrl("/api/data");
    const result = await buildSafeFetch(apiUrl);

    expect(apiUrl).toBe("http://localhost:3000/api/data");
    expect(result).toBeNull();
    expect(mockConsole.log).toHaveBeenCalledWith(
      "Skipping fetch during build: http://localhost:3000/api/data",
    );
  });

  it("should work correctly in production runtime scenario", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_BASE_URL = "https://myapp.com";

    const mockResponse = new Response('{"success": true}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const apiUrl = getApiUrl("/api/data");
    const result = await buildSafeFetch(apiUrl);

    expect(apiUrl).toBe("https://myapp.com/api/data");
    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://myapp.com/api/data",
      undefined,
    );
  });

  it("should work correctly in development scenario", async () => {
    process.env.NODE_ENV = "development";

    const mockResponse = new Response('{"dev": true}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const apiUrl = getApiUrl("/api/dev-data");
    const result = await buildSafeFetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    expect(apiUrl).toBe("http://localhost:3000/api/dev-data");
    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/dev-data",
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
    );
  });
});
