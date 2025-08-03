/**
 * Integration tests for the complete markdown file management system
 */

import { promises as fs } from "fs";
import {
  directoryManager,
  initializeDirectoryStructure,
  markdownFileManager,
  pathGenerator,
  validateDirectoryStructure,
} from "../index";

const TEST_BASE_PATH = "test-integration-markdown";

describe("Markdown System Integration", () => {
  beforeAll(async () => {
    // Set up test environment
    (markdownFileManager as unknown as { basePath: string }).basePath =
      TEST_BASE_PATH;
    (
      directoryManager as unknown as { structure: { basePath: string } }
    ).structure.basePath = TEST_BASE_PATH;
    (pathGenerator as unknown as { basePath: string }).basePath =
      TEST_BASE_PATH;
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should initialize directory structure and create files", async () => {
    // Initialize directory structure
    await initializeDirectoryStructure();

    // Validate structure
    const validation = await validateDirectoryStructure();
    expect(validation.isValid).toBe(true);
    expect(validation.missingDirectories).toHaveLength(0);

    // Create markdown files for different content types
    const portfolioPath = await markdownFileManager.createMarkdownFile(
      "portfolio-test-123",
      "portfolio",
      "# Portfolio Test\n\nThis is a portfolio item with markdown content.",
    );

    const blogPath = await markdownFileManager.createMarkdownFile(
      "blog-test-456",
      "blog",
      "# Blog Post\n\nThis is a blog post with markdown content.",
    );

    // Verify files were created
    expect(await markdownFileManager.fileExists(portfolioPath)).toBe(true);
    expect(await markdownFileManager.fileExists(blogPath)).toBe(true);

    // Verify content can be read
    const portfolioContent =
      await markdownFileManager.getMarkdownContent(portfolioPath);
    expect(portfolioContent).toContain("Portfolio Test");

    const blogContent = await markdownFileManager.getMarkdownContent(blogPath);
    expect(blogContent).toContain("Blog Post");

    // Test file listing
    const portfolioFiles =
      await markdownFileManager.listMarkdownFiles("portfolio");
    const blogFiles = await markdownFileManager.listMarkdownFiles("blog");

    expect(portfolioFiles).toHaveLength(1);
    expect(blogFiles).toHaveLength(1);
    expect(portfolioFiles[0].id).toBe("portfolio-test-123");
    expect(blogFiles[0].id).toBe("blog-test-456");
  });

  it("should handle path generation and validation", () => {
    // Test path generation
    const portfolioPath = pathGenerator.generatePath(
      "test-content",
      "portfolio",
    );
    expect(portfolioPath.fileName).toBe("test-content.md");
    expect(portfolioPath.directory).toContain("portfolio");

    // Test path parsing
    const parsed = pathGenerator.parsePath(portfolioPath.absolutePath);
    expect(parsed.contentId).toBe("test-content");
    expect(parsed.contentType).toBe("portfolio");
    expect(parsed.isValid).toBe(true);

    // Test path validation
    const validation = pathGenerator.validatePath(portfolioPath.absolutePath);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should handle file operations correctly", async () => {
    // Initialize if not already done
    await initializeDirectoryStructure();

    const contentId = "integration-test-789";
    const originalContent =
      "# Original Content\n\nThis is the original content.";
    const updatedContent =
      "# Updated Content\n\nThis content has been updated.";

    // Create file
    const filePath = await markdownFileManager.createMarkdownFile(
      contentId,
      "plugin",
      originalContent,
    );

    // Verify creation
    expect(await markdownFileManager.fileExists(filePath)).toBe(true);

    // Get metadata
    const metadata = await markdownFileManager.getFileMetadata(filePath);
    expect(metadata.id).toBe(contentId);
    expect(metadata.size).toBeGreaterThan(0);

    // Update file
    await markdownFileManager.updateMarkdownFile(filePath, updatedContent);

    // Verify update
    const readContent = await markdownFileManager.getMarkdownContent(filePath);
    expect(readContent).toBe(updatedContent);

    // Delete file
    await markdownFileManager.deleteMarkdownFile(filePath);

    // Verify deletion
    expect(await markdownFileManager.fileExists(filePath)).toBe(false);
  });
});
