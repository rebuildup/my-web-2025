/**
 * Tests for Markdown File Management System
 */

import { ContentType } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";
import { MarkdownFileManager } from "../file-management";

// Use a test directory to avoid interfering with actual files
const TEST_BASE_PATH = "test-markdown";

describe("MarkdownFileManager", () => {
  let fileManager: MarkdownFileManager;

  beforeEach(() => {
    fileManager = new MarkdownFileManager({ basePath: TEST_BASE_PATH });
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("generateFilePath", () => {
    it("should generate correct file path for portfolio content", () => {
      const filePath = fileManager.generateFilePath(
        "test-portfolio-123",
        "portfolio",
      );
      const expected = path.join(
        TEST_BASE_PATH,
        "portfolio",
        "test-portfolio-123.md",
      );
      expect(filePath).toBe(expected);
    });

    it("should generate correct file path for blog content", () => {
      const filePath = fileManager.generateFilePath("test-blog-456", "blog");
      const expected = path.join(TEST_BASE_PATH, "blog", "test-blog-456.md");
      expect(filePath).toBe(expected);
    });

    it("should throw error for unsupported content type", () => {
      expect(() => {
        fileManager.generateFilePath("test-123", "unsupported" as ContentType);
      }).toThrow("Unsupported content type: unsupported");
    });
  });

  describe("createMarkdownFile", () => {
    it("should create a new markdown file", async () => {
      const content = "# Test Content\n\nThis is a test markdown file.";
      const filePath = await fileManager.createMarkdownFile(
        "test-123",
        "portfolio",
        content,
      );

      expect(filePath).toContain("test-123.md");

      // Verify file was created
      const exists = await fileManager.fileExists(filePath);
      expect(exists).toBe(true);

      // Verify content
      const savedContent = await fileManager.getMarkdownContent(filePath);
      expect(savedContent).toBe(content);
    });

    it("should throw error if file already exists", async () => {
      const content = "# Test Content";
      await fileManager.createMarkdownFile("test-123", "portfolio", content);

      await expect(
        fileManager.createMarkdownFile("test-123", "portfolio", content),
      ).rejects.toThrow("Markdown file already exists");
    });
  });

  describe("getMarkdownContent", () => {
    it("should read markdown file content", async () => {
      const content = "# Test Content\n\nThis is a test.";
      const filePath = await fileManager.createMarkdownFile(
        "test-123",
        "portfolio",
        content,
      );

      const readContent = await fileManager.getMarkdownContent(filePath);
      expect(readContent).toBe(content);
    });

    it("should throw error for non-existent file", async () => {
      const nonExistentPath = path.join(
        TEST_BASE_PATH,
        "portfolio",
        "non-existent.md",
      );

      await expect(
        fileManager.getMarkdownContent(nonExistentPath),
      ).rejects.toThrow("Markdown file not found");
    });
  });

  describe("updateMarkdownFile", () => {
    it("should update existing markdown file", async () => {
      const originalContent = "# Original Content";
      const updatedContent = "# Updated Content\n\nThis has been updated.";

      const filePath = await fileManager.createMarkdownFile(
        "test-123",
        "portfolio",
        originalContent,
      );
      await fileManager.updateMarkdownFile(filePath, updatedContent);

      const readContent = await fileManager.getMarkdownContent(filePath);
      expect(readContent).toBe(updatedContent);
    });

    it("should throw error for non-existent file", async () => {
      const nonExistentPath = path.join(
        TEST_BASE_PATH,
        "portfolio",
        "non-existent.md",
      );

      await expect(
        fileManager.updateMarkdownFile(nonExistentPath, "content"),
      ).rejects.toThrow("Markdown file not found");
    });
  });

  describe("deleteMarkdownFile", () => {
    it("should delete existing markdown file", async () => {
      const content = "# Test Content";
      const filePath = await fileManager.createMarkdownFile(
        "test-123",
        "portfolio",
        content,
      );

      // Verify file exists
      expect(await fileManager.fileExists(filePath)).toBe(true);

      // Delete file
      await fileManager.deleteMarkdownFile(filePath);

      // Verify file no longer exists
      expect(await fileManager.fileExists(filePath)).toBe(false);
    });

    it("should throw error for non-existent file", async () => {
      const nonExistentPath = path.join(
        TEST_BASE_PATH,
        "portfolio",
        "non-existent.md",
      );

      await expect(
        fileManager.deleteMarkdownFile(nonExistentPath),
      ).rejects.toThrow("Markdown file not found");
    });
  });

  describe("getFileMetadata", () => {
    it("should return correct metadata for existing file", async () => {
      const content = "# Test Content";
      const filePath = await fileManager.createMarkdownFile(
        "test-123",
        "portfolio",
        content,
      );

      const metadata = await fileManager.getFileMetadata(filePath);

      expect(metadata.id).toBe("test-123");
      expect(metadata.filePath).toBe(filePath);
      expect(metadata.size).toBeGreaterThan(0);
      expect(metadata.createdAt).toBeDefined();
      expect(metadata.updatedAt).toBeDefined();
    });
  });

  describe("listMarkdownFiles", () => {
    it("should list all markdown files for a content type", async () => {
      // Create multiple files
      await fileManager.createMarkdownFile("test-1", "portfolio", "# Test 1");
      await fileManager.createMarkdownFile("test-2", "portfolio", "# Test 2");
      await fileManager.createMarkdownFile("test-3", "blog", "# Test 3");

      const portfolioFiles = await fileManager.listMarkdownFiles("portfolio");
      const blogFiles = await fileManager.listMarkdownFiles("blog");

      expect(portfolioFiles).toHaveLength(2);
      expect(blogFiles).toHaveLength(1);

      const portfolioIds = portfolioFiles.map((f) => f.id).sort();
      expect(portfolioIds).toEqual(["test-1", "test-2"]);
    });

    it("should return empty array for content type with no files", async () => {
      const files = await fileManager.listMarkdownFiles("plugin");
      expect(files).toEqual([]);
    });
  });

  describe("path utilities", () => {
    it("should convert between relative and absolute paths", () => {
      const absolutePath = path.resolve(process.cwd(), "test/file.md");
      const relativePath = fileManager.getRelativePath(absolutePath);
      const backToAbsolute = fileManager.getAbsolutePath(relativePath);

      expect(relativePath).toBe("test/file.md");
      expect(backToAbsolute).toBe(absolutePath);
    });

    it("should validate file paths correctly", () => {
      const validPath = path.join(TEST_BASE_PATH, "portfolio", "test.md");
      const invalidPath = "/outside/path/test.md";
      const invalidExtension = path.join(
        TEST_BASE_PATH,
        "portfolio",
        "test.txt",
      );

      expect(fileManager.validateFilePath(validPath)).toBe(true);
      expect(fileManager.validateFilePath(invalidPath)).toBe(false);
      expect(fileManager.validateFilePath(invalidExtension)).toBe(false);
    });
  });
});
