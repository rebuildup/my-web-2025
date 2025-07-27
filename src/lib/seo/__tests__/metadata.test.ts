/**
 * Tests for metadata generation
 */

import {
  generateBaseMetadata,
  generatePortfolioMetadata,
  generateToolMetadata,
  generateSearchMetadata,
} from "../metadata";
import { ContentItem } from "@/types/content";

describe("Metadata Generation", () => {
  const mockConfig = {
    baseUrl: "https://example.com",
    siteName: "Test Site",
    defaultTitle: "Test Site",
    defaultDescription: "A test website",
    defaultKeywords: ["test", "website"],
    author: {
      name: "Test Author",
      twitter: "@test",
    },
    images: {
      ogImage: "/og-image.jpg",
      twitterImage: "/twitter-image.jpg",
      favicon: "/favicon.ico",
    },
  };

  describe("generateBaseMetadata", () => {
    it("should generate basic metadata with defaults", () => {
      const pageData = {
        path: "/test",
      };

      const result = generateBaseMetadata(pageData, mockConfig);

      expect(result.title).toBe(mockConfig.defaultTitle);
      expect(result.description).toBe(mockConfig.defaultDescription);
      expect(result.keywords).toEqual(mockConfig.defaultKeywords);
      expect(result.alternates?.canonical).toBe("https://example.com/test");
      expect(result.robots).toBe("index, follow");
    });

    it("should generate metadata with custom values", () => {
      const pageData = {
        title: "Custom Title",
        description: "Custom description",
        keywords: ["custom", "keywords"],
        path: "/custom",
      };

      const result = generateBaseMetadata(pageData, mockConfig);

      expect(result.title).toBe("Custom Title - Test Site");
      expect(result.description).toBe("Custom description");
      expect(result.keywords).toEqual(["custom", "keywords"]);
      expect(result.alternates?.canonical).toBe("https://example.com/custom");
    });

    it("should handle noindex and nofollow flags", () => {
      const pageData = {
        path: "/private",
        noindex: true,
        nofollow: true,
      };

      const result = generateBaseMetadata(pageData, mockConfig);

      expect(result.robots).toBe("noindex, nofollow");
    });

    it("should generate proper Open Graph metadata", () => {
      const pageData = {
        title: "OG Test",
        description: "OG description",
        path: "/og-test",
      };

      const result = generateBaseMetadata(pageData, mockConfig);

      expect(result.openGraph?.title).toBe("OG Test - Test Site");
      expect(result.openGraph?.description).toBe("OG description");
      expect(result.openGraph?.url).toBe("https://example.com/og-test");
      expect((result.openGraph as { type?: string })?.type).toBe("website");
      expect(result.openGraph?.siteName).toBe("Test Site");
      expect(result.openGraph?.locale).toBe("ja_JP");
    });

    it("should generate proper Twitter Card metadata", () => {
      const pageData = {
        title: "Twitter Test",
        description: "Twitter description",
        path: "/twitter-test",
      };

      const result = generateBaseMetadata(pageData, mockConfig);

      expect((result.twitter as { card?: string })?.card).toBe(
        "summary_large_image",
      );
      expect(result.twitter?.title).toBe("Twitter Test - Test Site");
      expect(result.twitter?.description).toBe("Twitter description");
      expect(result.twitter?.creator).toBe("@test");
    });
  });

  describe("generatePortfolioMetadata", () => {
    it("should generate portfolio-specific metadata", () => {
      const mockItem: ContentItem = {
        id: "test-portfolio",
        type: "portfolio",
        title: "Test Portfolio Item",
        description: "A test portfolio item",
        category: "develop",
        tags: ["javascript", "react"],
        status: "published",
        priority: 80,
        createdAt: "2023-01-01T00:00:00Z",
        publishedAt: "2023-01-02T00:00:00Z",
        updatedAt: "2023-01-03T00:00:00Z",
        thumbnail: "/images/portfolio-test.jpg",
      };

      const result = generatePortfolioMetadata(mockItem, mockConfig);

      expect(result.title).toBe("Test Portfolio Item - Test Site");
      expect(result.description).toBe("A test portfolio item");
      expect(result.keywords).toEqual([
        ...mockConfig.defaultKeywords,
        ...mockItem.tags,
      ]);
      expect(result.alternates?.canonical).toBe(
        "https://example.com/portfolio/test-portfolio",
      );

      // Check article-specific Open Graph properties
      const ogData = result.openGraph as {
        type?: string;
        publishedTime?: string;
        modifiedTime?: string;
        tags?: string[];
      };
      expect(ogData?.type).toBe("article");
      expect(ogData?.publishedTime).toBe("2023-01-02T00:00:00Z");
      expect(ogData?.modifiedTime).toBe("2023-01-03T00:00:00Z");
      expect(ogData?.tags).toEqual(mockItem.tags);
    });
  });

  describe("generateToolMetadata", () => {
    it("should generate tool-specific metadata", () => {
      const toolData = {
        name: "Test Tool",
        description: "A useful test tool",
        keywords: ["tool", "utility"],
        path: "/tools/test-tool",
      };

      const result = generateToolMetadata(toolData, mockConfig);

      expect(result.title).toBe("Test Tool - Test Site");
      expect(result.description).toBe("A useful test tool");
      expect(result.keywords).toEqual([
        ...mockConfig.defaultKeywords,
        ...toolData.keywords,
        "ツール",
        "無料",
      ]);
      expect(result.alternates?.canonical).toBe(
        "https://example.com/tools/test-tool",
      );
    });
  });

  describe("generateSearchMetadata", () => {
    it("should generate search metadata without query", () => {
      const result = generateSearchMetadata(undefined, mockConfig);

      expect(result.title).toBe("サイト内検索 - Test Site");
      expect(result.description).toContain("サイト内のコンテンツを検索");
      expect(result.alternates?.canonical).toBe("https://example.com/search");
      expect(result.robots).toBe("index, follow");
    });

    it("should generate search metadata with query", () => {
      const query = "test query";
      const result = generateSearchMetadata(query, mockConfig);

      expect(result.title).toBe('"test query"の検索結果 - Test Site');
      expect(result.description).toContain('"test query"に関する検索結果');
      expect(result.alternates?.canonical).toBe(
        "https://example.com/search?q=test%20query",
      );
      expect(result.robots).toBe("noindex, follow"); // Search results should not be indexed
    });
  });
});
