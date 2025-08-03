/**
 * Tests for markdown content types
 */

import {
  ContentItem,
  EmbedReference,
  isMarkdownContentItem,
  MarkdownContentItem,
  MarkdownFileMetadata,
  MediaData,
  validateMarkdownContentItem,
} from "../index";

describe("Markdown Content Types", () => {
  describe("MarkdownContentItem", () => {
    it("should extend ContentItem with markdown fields", () => {
      const markdownItem: MarkdownContentItem = {
        id: "test-1",
        type: "portfolio",
        title: "Test Item",
        description: "Test description",
        category: "develop",
        tags: ["test"],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00.000Z",
        markdownPath: "/path/to/markdown.md",
        markdownMigrated: true,
      };

      expect(markdownItem.markdownPath).toBe("/path/to/markdown.md");
      expect(markdownItem.markdownMigrated).toBe(true);
    });

    it("should work without markdown fields", () => {
      const basicItem: MarkdownContentItem = {
        id: "test-2",
        type: "portfolio",
        title: "Basic Item",
        description: "Basic description",
        category: "develop",
        tags: ["test"],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      expect(basicItem.markdownPath).toBeUndefined();
      expect(basicItem.markdownMigrated).toBeUndefined();
    });
  });

  describe("MarkdownFileMetadata", () => {
    it("should have all required fields", () => {
      const metadata: MarkdownFileMetadata = {
        id: "test-1",
        filePath: "/path/to/file.md",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T12:00:00.000Z",
        size: 1024,
        checksum: "abc123",
      };

      expect(metadata.id).toBe("test-1");
      expect(metadata.filePath).toBe("/path/to/file.md");
      expect(metadata.size).toBe(1024);
      expect(metadata.checksum).toBe("abc123");
    });
  });

  describe("EmbedReference", () => {
    it("should support image references", () => {
      const imageRef: EmbedReference = {
        type: "image",
        index: 0,
        altText: "Test image",
      };

      expect(imageRef.type).toBe("image");
      expect(imageRef.index).toBe(0);
      expect(imageRef.altText).toBe("Test image");
    });

    it("should support video references", () => {
      const videoRef: EmbedReference = {
        type: "video",
        index: 1,
        customText: "Demo video",
      };

      expect(videoRef.type).toBe("video");
      expect(videoRef.index).toBe(1);
      expect(videoRef.customText).toBe("Demo video");
    });

    it("should support link references", () => {
      const linkRef: EmbedReference = {
        type: "link",
        index: 2,
      };

      expect(linkRef.type).toBe("link");
      expect(linkRef.index).toBe(2);
    });
  });

  describe("MediaData", () => {
    it("should contain arrays for different media types", () => {
      const mediaData: MediaData = {
        images: ["image1.jpg", "image2.png"],
        videos: [
          {
            type: "youtube",
            url: "https://youtube.com/watch?v=123",
            title: "Test Video",
          },
        ],
        externalLinks: [
          {
            type: "github",
            url: "https://github.com/test/repo",
            title: "Test Repo",
          },
        ],
      };

      expect(mediaData.images).toHaveLength(2);
      expect(mediaData.videos).toHaveLength(1);
      expect(mediaData.externalLinks).toHaveLength(1);
    });
  });

  describe("Type Guards", () => {
    describe("validateMarkdownContentItem", () => {
      it("should validate valid markdown content item", () => {
        const validItem = {
          id: "test-1",
          type: "portfolio",
          title: "Test Item",
          description: "Test description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: "2023-01-01T00:00:00.000Z",
          markdownPath: "/path/to/markdown.md",
          markdownMigrated: true,
        };

        expect(validateMarkdownContentItem(validItem)).toBe(true);
      });

      it("should validate basic content item without markdown fields", () => {
        const basicItem = {
          id: "test-2",
          type: "portfolio",
          title: "Basic Item",
          description: "Basic description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: "2023-01-01T00:00:00.000Z",
        };

        expect(validateMarkdownContentItem(basicItem)).toBe(true);
      });

      it("should reject invalid items", () => {
        const invalidItem = {
          id: "test-3",
          // missing required fields
        };

        expect(validateMarkdownContentItem(invalidItem)).toBe(false);
      });
    });

    describe("isMarkdownContentItem", () => {
      it("should identify items with markdown fields", () => {
        const markdownItem: ContentItem = {
          id: "test-1",
          type: "portfolio",
          title: "Test Item",
          description: "Test description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: "2023-01-01T00:00:00.000Z",
          markdownPath: "/path/to/markdown.md",
        };

        expect(isMarkdownContentItem(markdownItem)).toBe(true);
      });

      it("should identify items with migration flag", () => {
        const migratedItem: ContentItem = {
          id: "test-2",
          type: "portfolio",
          title: "Test Item",
          description: "Test description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: "2023-01-01T00:00:00.000Z",
          markdownMigrated: false,
        };

        expect(isMarkdownContentItem(migratedItem)).toBe(true);
      });

      it("should not identify basic content items", () => {
        const basicItem: ContentItem = {
          id: "test-3",
          type: "portfolio",
          title: "Basic Item",
          description: "Basic description",
          category: "develop",
          tags: ["test"],
          status: "published",
          priority: 50,
          createdAt: "2023-01-01T00:00:00.000Z",
        };

        expect(isMarkdownContentItem(basicItem)).toBe(false);
      });
    });
  });
});
