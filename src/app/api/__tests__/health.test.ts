/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// Mock the file system operations before importing the route
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue("health-check"),
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock path module
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

// Mock console methods to avoid noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Import after mocks are set up
import { GET } from "../health/route";

// Mock the stats and data functions
jest.mock("@/lib/stats", () => ({
  getStatsSummary: jest.fn().mockResolvedValue({
    totalViews: 100,
    totalDownloads: 50,
    totalSearches: 25,
    topQueries: [],
    topContent: [],
    topDownloads: [],
  }),
}));

jest.mock("@/lib/data", () => ({
  getContentStatistics: jest.fn().mockResolvedValue({
    totalItems: 10,
    itemsByType: {},
    itemsByStatus: {},
  }),
}));

describe("/api/health", () => {
  beforeEach(() => {
    // Mock process methods
    jest.spyOn(process, "uptime").mockReturnValue(123.45);
    jest.spyOn(process, "cwd").mockReturnValue("/mock/project/root");
    jest.spyOn(process, "memoryUsage").mockReturnValue({
      rss: 100 * 1024 * 1024, // 100MB
      heapTotal: 50 * 1024 * 1024, // 50MB
      heapUsed: 30 * 1024 * 1024, // 30MB
      external: 10 * 1024 * 1024, // 10MB
      arrayBuffers: 5 * 1024 * 1024, // 5MB
    });

    // Mock environment variables
    process.env.npm_package_version = "1.0.0";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return health status", async () => {
    const request = new NextRequest("http://localhost:3000/api/health");
    const response = await GET(request);
    const data = await response.json();

    // Log response for debugging if test fails
    if (response.status !== 200) {
      console.log("Response status:", response.status);
      console.log("Response data:", data);
    }

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("checks");
    expect(data.checks).toHaveProperty("filesystem");
    expect(data.checks).toHaveProperty("dataFiles");
    expect(data.checks).toHaveProperty("memory");
    expect(data.checks).toHaveProperty("dependencies");
  });

  it("should return detailed metrics when requested", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/health?detailed=true",
    );
    const response = await GET(request);
    const data = await response.json();

    // Log response for debugging if test fails
    if (response.status !== 200) {
      console.log("Response status:", response.status);
      console.log("Response data:", data);
    }

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("metrics");
    expect(data.metrics).toHaveProperty("totalContent");
    expect(data.metrics).toHaveProperty("totalViews");
    expect(data.metrics).toHaveProperty("totalDownloads");
    expect(data.metrics).toHaveProperty("totalSearches");
  });
});
