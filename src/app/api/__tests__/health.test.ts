/**
 * @jest-environment node
 */

import { GET } from "../health/route";
import { NextRequest } from "next/server";

// Mock the file system operations
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue("health-check"),
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
  },
}));

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
  it("should return health status", async () => {
    const request = new NextRequest("http://localhost:3000/api/health");
    const response = await GET(request);
    const data = await response.json();

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

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("metrics");
    expect(data.metrics).toHaveProperty("totalContent");
    expect(data.metrics).toHaveProperty("totalViews");
    expect(data.metrics).toHaveProperty("totalDownloads");
    expect(data.metrics).toHaveProperty("totalSearches");
  });
});
