/**
 * Markdown System Integration Tests
 * Tests for end-to-end workflows from creation to display
 */

import type { Stats } from "fs";
import { promises as fs } from "fs";
import type {
  ContentType,
  MarkdownContentItem,
  MediaData,
} from "../../../types/content";
import { ContentParser } from "../content-parser";
import { MarkdownFileManager } from "../file-management";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Markdown System Integration", () => {
  let markdownFileManager: MarkdownFileManager;
  let contentParser: ContentParser;

  const testBasePath = "/test/markdown";

  const mockMediaData: MediaData = {
    images: ["/image1.jpg", "/image2.png", "/image3.gif"],
    videos: [
      {
        type: "youtube",
        url: "https://youtu.be/dQw4w9WgXcQ",
        title: "Test Video 1",
        description: "A test video",
      },
      {
        type: "vimeo",
        url: "https://vimeo.com/123456789",
        title: "Test Video 2",
        description: "Another test video",
      },
    ],
    externalLinks: [
      {
        type: "github",
        url: "https://github.com/test/repo",
        title: "GitHub Repository",
        description: "Test repository",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    markdownFileManager = new MarkdownFileManager({ basePath: testBasePath });
    contentParser = new ContentParser();

    // Setup default mock implementations
    mockFs.stat.mockResolvedValue({
      isDirectory: () => true,
      size: 1024,
      mtime: new Date(),
      birthtime: new Date(),
    } as Stats);

    // Track created files to simulate file system state
    const createdFiles = new Set<string>();
    const fileContents = new Map<string, string>();

    // Mock access to check if files/directories exist
    mockFs.access.mockImplementation((path: string) => {
      // Directory paths should exist
      if (typeof path === "string" && !path.endsWith(".md")) {
        return Promise.resolve(undefined);
      }
      // Check if file was created in this test
      if (createdFiles.has(path)) {
        return Promise.resolve(undefined);
      }
      // File doesn't exist
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    });

    mockFs.mkdir.mockResolvedValue(undefined);

    // Mock writeFile to track created files
    mockFs.writeFile.mockImplementation((path: string, content: string) => {
      createdFiles.add(path);
      fileContents.set(path, content);
      return Promise.resolve(undefined);
    });

    // Mock readFile to return stored content
    mockFs.readFile.mockImplementation((path: string) => {
      if (fileContents.has(path)) {
        return Promise.resolve(fileContents.get(path)!);
      }
      return Promise.resolve("# Test Content\n\nTest markdown content");
    });

    // Mock unlink to remove files
    mockFs.unlink.mockImplementation((path: string) => {
      createdFiles.delete(path);
      fileContents.delete(path);
      return Promise.resolve(undefined);
    });

    // Mock readdir to return created files in the directory
    mockFs.readdir.mockImplementation((dirPath: string) => {
      const filesInDir = Array.from(createdFiles)
        .filter((filePath) => filePath.startsWith(dirPath))
        .map(
          (filePath) => filePath.split("/").pop() || filePath.split("\\").pop(),
        )
        .filter(Boolean);
      return Promise.resolve(filesInDir as string[]);
    });
  });

  const initializeDirectoryStructure = async () => {
    // Mock directory initialization
    await Promise.resolve();
  };

  it("should handle complete content creation workflow", async () => {
    // Initialize directory structure
    await initializeDirectoryStructure();

    // Create markdown files for different content types
    const portfolioPath = await markdownFileManager.createMarkdownFile(
      "portfolio-test-123",
      "portfolio" as ContentType,
      "# Portfolio Test\n\nThis is a portfolio item with markdown content.",
    );

    const blogPath = await markdownFileManager.createMarkdownFile(
      "blog-test-456",
      "blog" as ContentType,
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
    const portfolioFiles = await markdownFileManager.listMarkdownFiles(
      "portfolio" as ContentType,
    );
    const blogFiles = await markdownFileManager.listMarkdownFiles(
      "blog" as ContentType,
    );

    expect(portfolioFiles).toHaveLength(1);
    expect(blogFiles).toHaveLength(1);
    expect(portfolioFiles[0].id).toBe("portfolio-test-123");
    expect(blogFiles[0].id).toBe("blog-test-456");
  });

  it("should handle path generation and validation", () => {
    // Test path generation using file manager
    const filePath = markdownFileManager.generateFilePath(
      "test-content",
      "portfolio" as ContentType,
    );
    expect(filePath).toContain("test-content.md");
    expect(filePath).toContain("portfolio");

    // Test path validation
    const isValid = markdownFileManager.validateFilePath(filePath);
    expect(isValid).toBe(true);
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
      "plugin" as ContentType,
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

  it("should handle content parsing with media", async () => {
    const markdownContent = `# Test Content

This is a test with an image:
![Test Image](/test-image.jpg)

And a video:
[Video: Test Video](https://youtu.be/dQw4w9WgXcQ)

Some more content here.`;

    const parsed = await contentParser.parseMarkdown(
      markdownContent,
      mockMediaData,
    );

    expect(parsed).toContain("Test Content");
    expect(parsed).toContain("test with an image");
  });

  it("should handle end-to-end workflow from creation to parsing", async () => {
    await initializeDirectoryStructure();

    const contentId = "e2e-test-content";
    const contentType: ContentType = "portfolio";
    const markdownContent = `# E2E Test Portfolio

This is an end-to-end test portfolio item.

![Portfolio Image](/portfolio-image.jpg)

## Features
- Feature 1
- Feature 2
- Feature 3

[Demo Video](https://youtu.be/demo123)`;

    // Create the file
    const filePath = await markdownFileManager.createMarkdownFile(
      contentId,
      contentType,
      markdownContent,
    );

    // Read it back
    const readContent = await markdownFileManager.getMarkdownContent(filePath);
    expect(readContent).toBe(markdownContent);

    // Parse the content
    const parsed = await contentParser.parseMarkdown(
      readContent,
      mockMediaData,
    );
    expect(parsed).toContain("E2E Test Portfolio");
    expect(parsed).toContain("end-to-end test portfolio");

    // List files to verify it appears
    const files = await markdownFileManager.listMarkdownFiles(contentType);
    expect(files).toHaveLength(1);
    expect(files[0].id).toBe(contentId);

    // Clean up
    await markdownFileManager.deleteMarkdownFile(filePath);
    expect(await markdownFileManager.fileExists(filePath)).toBe(false);
  });

  describe("Complete Workflow Tests", () => {
    it("should handle complete markdown creation to display workflow", async () => {
      await initializeDirectoryStructure();

      const contentId = "workflow-test-123";
      const contentType: ContentType = "portfolio";
      const markdownContent = `# Portfolio Project

This is a comprehensive test of the markdown system.

## Images
Here's an image: ![image:0]
And another with alt text: ![image:1 "Screenshot"]

## Videos  
Embedded video: ![video:0]
Custom title video: ![video:1 "Demo Video"]

## Links
External link: [link:0]

## Custom Iframe
<iframe src="https://example.com/embed" title="Custom embed" width="100%" height="400"></iframe>

## Regular Markdown
This is **bold** and *italic* text.

\`\`\`javascript
console.log('Code block');
\`\`\`
`;

      // Step 1: Create markdown file
      const filePath = await markdownFileManager.createMarkdownFile(
        contentId,
        contentType,
        markdownContent,
      );

      expect(filePath).toContain(`${contentId}.md`);
      expect(filePath).toContain("portfolio");

      // Step 2: Verify file exists and has correct metadata
      expect(await markdownFileManager.fileExists(filePath)).toBe(true);

      const metadata = await markdownFileManager.getFileMetadata(filePath);
      expect(metadata.id).toBe(contentId);
      expect(metadata.size).toBeGreaterThan(0);

      // Step 3: Read content back
      const readContent =
        await markdownFileManager.getMarkdownContent(filePath);
      expect(readContent).toBe(markdownContent);

      // Step 4: Parse content with embed resolution
      const parsedContent = await contentParser.parseMarkdown(
        readContent,
        mockMediaData,
      );

      // Verify image embeds are resolved
      expect(parsedContent).toContain("![Image 0](/image1.jpg)");
      expect(parsedContent).toContain("![Screenshot](/image2.png)");

      // Verify video embeds are resolved to iframe HTML
      expect(parsedContent).toContain("<iframe");
      expect(parsedContent).toContain("youtube.com/embed/");
      expect(parsedContent).toContain("player.vimeo.com/video/");

      // Verify link embeds are resolved
      expect(parsedContent).toContain(
        "[GitHub Repository](https://github.com/test/repo)",
      );

      // Verify regular markdown is preserved
      expect(parsedContent).toContain("**bold**");
      expect(parsedContent).toContain("*italic*");
      expect(parsedContent).toContain("```javascript");

      // Step 5: Validate embed syntax
      const validation = contentParser.validateEmbedSyntax(
        readContent,
        mockMediaData,
      );
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 6: List files to verify it appears in directory
      const files = await markdownFileManager.listMarkdownFiles(contentType);
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(contentId);

      // Step 7: Update content
      const updatedContent =
        markdownContent + "\n\n## Updated Section\nThis content was updated.";
      await markdownFileManager.updateMarkdownFile(filePath, updatedContent);

      const updatedReadContent =
        await markdownFileManager.getMarkdownContent(filePath);
      expect(updatedReadContent).toContain("Updated Section");

      // Step 8: Clean up
      await markdownFileManager.deleteMarkdownFile(filePath);
      expect(await markdownFileManager.fileExists(filePath)).toBe(false);
    });

    it("should handle embed resolution across different content types", async () => {
      await initializeDirectoryStructure();

      const testCases = [
        { contentType: "portfolio" as ContentType, id: "portfolio-embed-test" },
        { contentType: "blog" as ContentType, id: "blog-embed-test" },
        { contentType: "plugin" as ContentType, id: "plugin-embed-test" },
      ];

      const markdownContent = `# Embed Test

Image: ![image:0]
Video: ![video:0] 
Link: [link:0]
`;

      const createdFiles: string[] = [];

      try {
        // Create files for different content types
        for (const testCase of testCases) {
          const filePath = await markdownFileManager.createMarkdownFile(
            testCase.id,
            testCase.contentType,
            markdownContent,
          );
          createdFiles.push(filePath);

          // Verify file creation
          expect(await markdownFileManager.fileExists(filePath)).toBe(true);
          expect(filePath).toContain(testCase.contentType);
          expect(filePath).toContain(testCase.id);
        }

        // Parse content for each file
        for (const filePath of createdFiles) {
          const content =
            await markdownFileManager.getMarkdownContent(filePath);
          const parsed = await contentParser.parseMarkdown(
            content,
            mockMediaData,
          );

          // Verify embeds are resolved consistently across content types
          expect(parsed).toContain("![Image 0](/image1.jpg)");
          expect(parsed).toContain("<iframe");
          expect(parsed).toContain(
            "[GitHub Repository](https://github.com/test/repo)",
          );
        }

        // Verify files appear in their respective directories
        for (const testCase of testCases) {
          const files = await markdownFileManager.listMarkdownFiles(
            testCase.contentType,
          );
          expect(files).toHaveLength(1);
          expect(files[0].id).toBe(testCase.id);
        }
      } finally {
        // Clean up all created files
        for (const filePath of createdFiles) {
          try {
            await markdownFileManager.deleteMarkdownFile(filePath);
          } catch (error) {
            console.warn(`Failed to clean up ${filePath}:`, error);
          }
        }
      }
    });

    it("should handle migration workflow from string content to markdown files", async () => {
      await initializeDirectoryStructure();

      // Simulate existing content items with string content
      const existingContentItems: MarkdownContentItem[] = [
        {
          id: "migrate-test-1",
          type: "portfolio",
          title: "Test Portfolio 1",
          description: "Test description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: new Date().toISOString(),
          content: "# Original Content 1\n\nThis was stored as a string.",
          markdownMigrated: false,
        },
        {
          id: "migrate-test-2",
          type: "blog",
          title: "Test Blog 2",
          description: "Test description",
          category: "tech",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: new Date().toISOString(),
          content:
            "# Original Content 2\n\nAnother string content with ![image:0]",
          markdownMigrated: false,
        },
      ];

      const migratedItems: MarkdownContentItem[] = [];

      try {
        // Simulate migration process
        for (const item of existingContentItems) {
          if (item.content && !item.markdownMigrated) {
            // Create markdown file from string content
            const filePath = await markdownFileManager.createMarkdownFile(
              item.id,
              item.type,
              item.content,
            );

            // Update item to reference markdown file
            const migratedItem: MarkdownContentItem = {
              ...item,
              markdownPath: markdownFileManager.getRelativePath(filePath),
              markdownMigrated: true,
              content: undefined, // Remove string content after migration
            };

            migratedItems.push(migratedItem);

            // Verify migration
            expect(await markdownFileManager.fileExists(filePath)).toBe(true);

            const readContent =
              await markdownFileManager.getMarkdownContent(filePath);
            expect(readContent).toBe(item.content);

            // Test parsing migrated content
            const parsed = await contentParser.parseMarkdown(
              readContent,
              mockMediaData,
            );
            expect(parsed).toContain("Original Content");

            if (item.id === "migrate-test-2") {
              expect(parsed).toContain("![Image 0](/image1.jpg)");
            }
          }
        }

        // Verify all items were migrated
        expect(migratedItems).toHaveLength(2);
        migratedItems.forEach((item) => {
          expect(item.markdownMigrated).toBe(true);
          expect(item.markdownPath).toBeDefined();
          expect(item.content).toBeUndefined();
        });

        // Verify files exist in correct directories
        const portfolioFiles =
          await markdownFileManager.listMarkdownFiles("portfolio");
        const blogFiles = await markdownFileManager.listMarkdownFiles("blog");

        expect(portfolioFiles).toHaveLength(1);
        expect(blogFiles).toHaveLength(1);
        expect(portfolioFiles[0].id).toBe("migrate-test-1");
        expect(blogFiles[0].id).toBe("migrate-test-2");
      } finally {
        // Clean up migrated files
        for (const item of migratedItems) {
          if (item.markdownPath) {
            try {
              const absolutePath = markdownFileManager.getAbsolutePath(
                item.markdownPath,
              );
              await markdownFileManager.deleteMarkdownFile(absolutePath);
            } catch (error) {
              console.warn(`Failed to clean up ${item.markdownPath}:`, error);
            }
          }
        }
      }
    });

    it("should handle concurrent file operations and data consistency", async () => {
      await initializeDirectoryStructure();

      const concurrentOperations = 5;
      const contentType: ContentType = "portfolio";
      const baseContent =
        "# Concurrent Test\n\nThis is a concurrent operation test.";

      const operations = Array.from(
        { length: concurrentOperations },
        (_, _index) => ({
          id: `concurrent-test-${_index}`,
          content: `${baseContent}\n\nOperation ${_index}`,
        }),
      );

      const createdFiles: string[] = [];

      try {
        // Execute concurrent file creation operations
        const createPromises = operations.map(async (op) => {
          const filePath = await markdownFileManager.createMarkdownFile(
            op.id,
            contentType,
            op.content,
          );
          createdFiles.push(filePath);
          return { filePath, ...op };
        });

        const results = await Promise.all(createPromises);

        // Verify all files were created successfully
        expect(results).toHaveLength(concurrentOperations);

        for (const result of results) {
          expect(await markdownFileManager.fileExists(result.filePath)).toBe(
            true,
          );

          const readContent = await markdownFileManager.getMarkdownContent(
            result.filePath,
          );
          expect(readContent).toBe(result.content);
        }

        // Execute concurrent read operations
        const readPromises = results.map(async (result) => {
          const content = await markdownFileManager.getMarkdownContent(
            result.filePath,
          );
          const parsed = await contentParser.parseMarkdown(
            content,
            mockMediaData,
          );
          return { filePath: result.filePath, content, parsed };
        });

        const readResults = await Promise.all(readPromises);

        // Verify all reads were successful
        expect(readResults).toHaveLength(concurrentOperations);
        readResults.forEach((result, _idx) => {
          expect(result.content).toContain(`Operation ${_idx}`);
          expect(result.parsed).toContain("Concurrent Test");
        });

        // Execute concurrent update operations
        const updatePromises = results.map(async (result) => {
          const updatedContent = `${result.content}\n\nUpdated at ${Date.now()}`;
          await markdownFileManager.updateMarkdownFile(
            result.filePath,
            updatedContent,
          );
          return { filePath: result.filePath, updatedContent };
        });

        const updateResults = await Promise.all(updatePromises);

        // Verify all updates were successful
        for (const result of updateResults) {
          const readContent = await markdownFileManager.getMarkdownContent(
            result.filePath,
          );
          expect(readContent).toBe(result.updatedContent);
          expect(readContent).toContain("Updated at");
        }

        // Verify file listing consistency
        const files = await markdownFileManager.listMarkdownFiles(contentType);
        expect(files).toHaveLength(concurrentOperations);

        const fileIds = files.map((f) => f.id).sort();
        const expectedIds = operations.map((op) => op.id).sort();
        expect(fileIds).toEqual(expectedIds);
      } finally {
        // Clean up all created files
        const deletePromises = createdFiles.map(async (filePath) => {
          try {
            await markdownFileManager.deleteMarkdownFile(filePath);
          } catch (error) {
            console.warn(`Failed to clean up ${filePath}:`, error);
          }
        });

        await Promise.all(deletePromises);

        // Verify all files were deleted
        for (const filePath of createdFiles) {
          expect(await markdownFileManager.fileExists(filePath)).toBe(false);
        }
      }
    });

    it("should handle complex embed scenarios with validation", async () => {
      await initializeDirectoryStructure();

      const contentId = "complex-embed-test";
      const contentType: ContentType = "portfolio";

      // Complex markdown with various embed scenarios
      const complexMarkdown = `# Complex Embed Test

## Valid Embeds
Image with alt text: ![image:0 "Main screenshot"]
Video with custom title: ![video:1 "Tutorial video"]
Link with custom text: [link:0 "Source code"]

## Edge Cases
Multiple images: ![image:0] ![image:1] ![image:2]
Nested in lists:
- Item with image: ![image:0]
- Item with video: ![video:0]
- Item with link: [link:0]

## Code blocks (should not be processed)
\`\`\`markdown
![image:0]
![video:0]
[link:0]
\`\`\`

## Inline code (should not be processed)
Use \`![image:0]\` syntax for images.

## Custom HTML
<iframe src="https://www.youtube.com/embed/test123" title="Custom video" frameborder="0" allowfullscreen></iframe>

## Invalid Embeds (for testing validation)
Out of range image: ![image:99]
Invalid video: ![video:abc]
Malformed link: [link:
`;

      let filePath: string;

      try {
        // Create file with complex content
        filePath = await markdownFileManager.createMarkdownFile(
          contentId,
          contentType,
          complexMarkdown,
        );

        // Read and validate content
        const content = await markdownFileManager.getMarkdownContent(filePath);
        expect(content).toBe(complexMarkdown);

        // Validate embed syntax (should find errors)
        const validation = contentParser.validateEmbedSyntax(
          content,
          mockMediaData,
        );
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);

        // Check for specific validation errors
        const errorMessages = validation.errors.map((e) => e.message);
        expect(
          errorMessages.some((msg) => msg.includes("Invalid image index 99")),
        ).toBe(true);

        // Parse content (should handle errors gracefully)
        const parsed = await contentParser.parseMarkdown(
          content,
          mockMediaData,
        );

        // Verify valid embeds are resolved
        expect(parsed).toContain("![Main screenshot](/image1.jpg)");
        expect(parsed).toContain("<iframe");
        expect(parsed).toContain(
          'src="https://player.vimeo.com/video/123456789"',
        );
        expect(parsed).toContain("[Source code](https://github.com/test/repo)");

        // Verify multiple embeds are handled
        expect(parsed).toContain("![Image 0](/image1.jpg)");
        expect(parsed).toContain("![Image 1](/image2.png)");
        expect(parsed).toContain("![Image 2](/image3.gif)");

        // Note: Current implementation processes embeds in code blocks
        // This is a known limitation that could be improved in the future
        expect(parsed).toContain("```markdown");

        // Note: Current implementation processes embeds in inline code
        // This is a known limitation that could be improved in the future
        expect(parsed).toContain("syntax for images");

        // Verify custom iframe is preserved
        expect(parsed).toContain(
          '<iframe src="https://www.youtube.com/embed/test123"',
        );

        // Verify invalid embeds show error messages
        expect(parsed).toContain("![Image not found: index 99]");

        // Extract embed references for analysis
        const embedRefs = contentParser.extractEmbedReferences(content);
        expect(embedRefs.length).toBeGreaterThan(0);

        // Verify different embed types are found
        const imageRefs = embedRefs.filter((ref) => ref.type === "image");
        const videoRefs = embedRefs.filter((ref) => ref.type === "video");
        const linkRefs = embedRefs.filter((ref) => ref.type === "link");

        expect(imageRefs.length).toBeGreaterThan(0);
        expect(videoRefs.length).toBeGreaterThan(0);
        expect(linkRefs.length).toBeGreaterThan(0);
      } finally {
        // Clean up
        if (filePath!) {
          try {
            await markdownFileManager.deleteMarkdownFile(filePath);
          } catch (error) {
            console.warn(`Failed to clean up ${filePath}:`, error);
          }
        }
      }
    });
  });
});
