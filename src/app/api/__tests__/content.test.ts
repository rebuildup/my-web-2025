/**
 * @jest-environment node
 */

import { GET } from "../content/[type]/route";
import { NextRequest } from "next/server";

// Mock the file system operations
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(
      JSON.stringify([
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Portfolio Item",
          description: "Test description",
          category: "web",
          tags: ["react", "typescript"],
          status: "published",
          priority: 100,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "test-2",
          type: "portfolio",
          title: "Another Portfolio Item",
          description: "Another description",
          category: "mobile",
          tags: ["react-native", "javascript"],
          status: "published",
          priority: 90,
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ]),
    ),
  },
}));

describe("/api/content/[type]", () => {
  it("should return content for valid type", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/content/portfolio",
    );
    const context = { params: Promise.resolve({ type: "portfolio" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("type", "portfolio");
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(data).toHaveProperty("filters");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toHaveLength(2);
  });

  it("should filter content by category", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/content/portfolio?category=web",
    );
    const context = { params: Promise.resolve({ type: "portfolio" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].category).toBe("web");
  });

  it("should filter content by tags", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/content/portfolio?tags=typescript",
    );
    const context = { params: Promise.resolve({ type: "portfolio" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].tags).toContain("typescript");
  });

  it("should return error for invalid content type", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/content/invalid",
    );
    const context = { params: Promise.resolve({ type: "invalid" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Invalid content type");
  });

  it("should handle pagination", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/content/portfolio?limit=1&offset=1",
    );
    const context = { params: Promise.resolve({ type: "portfolio" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.pagination.total).toBe(2);
    expect(data.pagination.limit).toBe(1);
    expect(data.pagination.offset).toBe(1);
    expect(data.pagination.hasMore).toBe(false);
  });
});
