/**
 * File Management Service Tests (Simplified)
 * Tests for markdown file management operations
 */

import { promises as fs } from "fs";
import { join } from "path";
import { MarkdownFileManager } from "../file-management";

// Mock fs module
const fileContents = new Map<string, string>();

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn((filePath: string, content: string) => {
      fileContents.set(filePath, content);
      return Promise.resolve(undefined);
    }),
    readFile: jest.fn((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve(fileContents.get(filePath)!);
      }
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    }),
    unlink: jest.fn((filePath: string) => {
      fileContents.delete(filePath);
      return Promise.resolve(undefined);
    }),
    access: jest.fn((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve(undefined);
      }
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    }),
    mkdir: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("MarkdownFileManager (Simplified)", () => {
  let manager: MarkdownFileManager;
  const testBasePath = "/test/markdown";

  beforeEach(() => {
    manager = new MarkdownFileManager(testBasePath);
    fileContents.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    fileContents.clear();
  });

  // Set timeout
  jest.setTimeout(5000);

  describe("Basic Operations", () => {
    it("should create markdown file", async () => {
      const contentId = "test-item-123";
      const contentType = "portfolio";
      const content = "# Test Content";

      mockFs.access.mockResolvedValueOnce(undefined);
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      const result = await manager.createMarkdownFile(
        contentId,
        contentType,
        content,
      );
      const expectedPath = join(testBasePath, "portfolio", `${contentId}.md`);

      expect(result).toBe(expectedPath);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        content,
        "utf8",
      );
    });

    it("should read markdown file", async () => {
      const filePath = join(testBasePath, "portfolio", "test-item.md");
      const content = "# Test Content";

      mockFs.readFile.mockResolvedValueOnce(content);

      const result = await manager.getMarkdownContent(filePath);
      expect(result).toBe(content);
    });

    it("should validate file path", async () => {
      const invalidPath = "/outside/path.md";
      await expect(manager.getMarkdownContent(invalidPath)).rejects.toThrow(
        "Invalid markdown file path",
      );
    });

    it("should generate correct file paths", () => {
      const contentId = "test-item-123";
      const portfolioPath = manager.generateFilePath(contentId, "portfolio");
      expect(portfolioPath).toBe(
        join(testBasePath, "portfolio", `${contentId}.md`),
      );
    });

    it("should validate content ID", () => {
      const invalidId = "";
      expect(() => manager.generateFilePath(invalidId, "portfolio")).toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle file not found", async () => {
      const filePath = join(testBasePath, "portfolio", "nonexistent.md");
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.getMarkdownContent(filePath)).rejects.toMatchObject({
        message: expect.stringContaining("Failed to read markdown file"),
        code: "ENOENT",
      });
    });
  });
});
