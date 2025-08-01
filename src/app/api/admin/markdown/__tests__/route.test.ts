/**
 * Tests for Markdown API endpoints
 * @jest-environment node
 */

// Mock the markdown file manager first
jest.mock("@/lib/portfolio/markdown-file-manager", () => ({
  markdownFileManager: {
    createMarkdownFile: jest.fn(),
    listMarkdownFiles: jest.fn(),
    getMarkdownFileMetadata: jest.fn(),
    validateMarkdownPath: jest.fn(),
    clearCache: jest.fn(),
  },
}));

import { markdownFileManager } from "@/lib/portfolio/markdown-file-manager";
import { NextRequest } from "next/server";
import { DELETE, GET, POST } from "../route";

const mockMarkdownManager = markdownFileManager as jest.Mocked<
  typeof markdownFileManager
>;

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe("/api/admin/markdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("POST /api/admin/markdown", () => {
    it("should create markdown file successfully", async () => {
      const requestBody = {
        itemId: "test-item-1",
        content: "# Test Content\n\nThis is test markdown.",
      };

      const mockFilePath = "/test/path/test-item-1.md";
      mockMarkdownManager.createMarkdownFile.mockResolvedValueOnce(
        mockFilePath,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        filePath: mockFilePath,
        message: "Markdown file created successfully",
      });
      expect(mockMarkdownManager.createMarkdownFile).toHaveBeenCalledWith(
        requestBody.itemId,
        requestBody.content,
      );
    });

    it("should return 400 for missing required fields", async () => {
      const requestBody = {
        itemId: "test-item",
        // missing content
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("itemId and content are required");
    });

    it("should return 409 for existing file", async () => {
      const requestBody = {
        itemId: "existing-item",
        content: "# Existing Content",
      };

      mockMarkdownManager.createMarkdownFile.mockRejectedValueOnce(
        new Error("Markdown file already exists for item existing-item"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create markdown file");
    });

    it("should return 403 in production environment", async () => {
      process.env.NODE_ENV = "production";

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify({ itemId: "test", content: "test" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe(
        "Admin API is only available in development environment",
      );
    });
  });

  describe("GET /api/admin/markdown", () => {
    it("should list markdown files successfully", async () => {
      const mockFiles = ["/test/file1.md", "/test/file2.md"];
      const mockMetadata = {
        size: 100,
        created: new Date("2023-01-01"),
        modified: new Date("2023-01-02"),
        hash: "abc123",
      };

      mockMarkdownManager.listMarkdownFiles.mockResolvedValueOnce(mockFiles);
      mockMarkdownManager.getMarkdownFileMetadata.mockResolvedValue({
        filePath: "/test/file1.md",
        ...mockMetadata,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=list",
        {
          method: "GET",
        },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.files).toHaveLength(2);
      expect(data.files[0]).toMatchObject({
        filePath: "/test/file1.md",
        size: 100,
        hash: "abc123",
      });
    });

    it("should validate markdown path", async () => {
      const testPath = "/test/valid.md";
      mockMarkdownManager.validateMarkdownPath.mockReturnValueOnce(true);

      const request = new NextRequest(
        `http://localhost:3000/api/admin/markdown?operation=validate&path=${encodeURIComponent(testPath)}`,
        {
          method: "GET",
        },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        valid: true,
        path: testPath,
      });
      expect(mockMarkdownManager.validateMarkdownPath).toHaveBeenCalledWith(
        testPath,
      );
    });

    it("should return 400 for invalid operation", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=invalid",
        {
          method: "GET",
        },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid operation. Supported operations: list, validate",
      );
    });

    it("should return 400 for validate operation without path", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=validate",
        {
          method: "GET",
        },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("path parameter is required for validation");
    });
  });

  describe("DELETE /api/admin/markdown", () => {
    it("should clear cache successfully", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=clear-cache",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "All cache cleared",
      });
      expect(mockMarkdownManager.clearCache).toHaveBeenCalledWith(undefined);
    });

    it("should clear cache for specific file", async () => {
      const testPath = "/test/file.md";
      const request = new NextRequest(
        `http://localhost:3000/api/admin/markdown?operation=clear-cache&path=${encodeURIComponent(testPath)}`,
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: `Cache cleared for ${testPath}`,
      });
      expect(mockMarkdownManager.clearCache).toHaveBeenCalledWith(testPath);
    });

    it("should return 400 for invalid operation", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=invalid",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid operation. Supported operations: clear-cache",
      );
    });
  });

  describe("error handling", () => {
    it("should handle markdown manager errors gracefully", async () => {
      const requestBody = {
        itemId: "error-test",
        content: "# Error Test",
      };

      mockMarkdownManager.createMarkdownFile.mockRejectedValueOnce(
        new Error("File system error"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create markdown file");
      expect(data.details).toBe("File system error");
    });

    it("should handle metadata errors in file listing", async () => {
      const mockFiles = ["/test/file1.md", "/test/file2.md"];
      mockMarkdownManager.listMarkdownFiles.mockResolvedValueOnce(mockFiles);
      mockMarkdownManager.getMarkdownFileMetadata
        .mockResolvedValueOnce({
          filePath: "/test/file1.md",
          size: 100,
          created: new Date(),
          modified: new Date(),
          hash: "abc123",
        })
        .mockRejectedValueOnce(new Error("Metadata error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/markdown?operation=list",
        {
          method: "GET",
        },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.files).toHaveLength(2);
      expect(data.files[0]).toMatchObject({
        filePath: "/test/file1.md",
        size: 100,
      });
      expect(data.files[1]).toMatchObject({
        filePath: "/test/file2.md",
        error: "Failed to get metadata",
      });
    });
  });
});
