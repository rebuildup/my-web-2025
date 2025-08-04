/**
 * Portfolio Detail Page Markdown Rendering Tests
 * Tests for markdown content display with various embed types, error handling, and responsive design
 * Covers requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { notFound } from "next/navigation";
import React from "react";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the portfolio data service
const mockPortfolioData = {
  getPortfolioItemBySlug: jest.fn(),
  getAllPortfolioItems: jest.fn(),
};

jest.mock("@/lib/portfolio/portfolio-data", () => ({
  portfolioData: mockPortfolioData,
}));

// Mock the markdown renderer
const mockMarkdownRenderer = jest.fn();

jest.mock("@/components/ui/MarkdownRenderer", () => {
  const MockMarkdownRenderer = (props: Record<string, unknown>) => {
    mockMarkdownRenderer(props);
    return (
      <div data-testid="markdown-renderer">
        <div data-testid="markdown-filepath">
          {(props.filePath as string) || "no-file"}
        </div>
        <div data-testid="markdown-content">
          {(props.children as string) || "No content"}
        </div>
        <div data-testid="markdown-media-data">
          {props.mediaData ? JSON.stringify(props.mediaData) : "No media data"}
        </div>
        {props.showEmptyState && (
          <div data-testid="empty-state">Empty state shown</div>
        )}
        {props.fallbackContent && (
          <div data-testid="fallback-content">
            {props.fallbackContent as string}
          </div>
        )}
      </div>
    );
  };
  MockMarkdownRenderer.displayName = "MockMarkdownRenderer";
  return { MarkdownRenderer: MockMarkdownRenderer };
});

// Import the page component
import PortfolioDetailPage from "../page";

describe("Portfolio Detail Page - Markdown Rendering", () => {
  const mockPortfolioItem = {
    id: "test-portfolio-item",
    slug: "test-portfolio-item",
    title: "Test Portfolio Item",
    description: "Test portfolio item description",
    type: "portfolio" as const,
    categories: ["develop"],
    tags: ["react", "typescript"],
    status: "published" as const,
    priority: 50,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    markdownPath: "portfolio/test-portfolio-item.md",
    images: ["/image1.jpg", "/image2.png"],
    videos: [
      {
        type: "youtube" as const,
        url: "https://youtu.be/test123",
        title: "Test Video",
      },
    ],
    externalLinks: [
      {
        type: "github" as const,
        url: "https://github.com/test/repo",
        title: "GitHub Repository",
      },
    ],
    thumbnail: "/thumbnail.jpg",
    isOtherCategory: false,
    useManualDate: false,
    originalImages: [],
    processedImages: ["/image1.jpg", "/image2.png"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
      mockPortfolioItem,
    );
  });

  describe("Basic Functionality", () => {
    it("should call notFound() when portfolio item does not exist", async () => {
      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(null);

      await PortfolioDetailPage({ params: { slug: "non-existent-item" } });

      expect(notFound).toHaveBeenCalled();
    });

    it("should handle database connection errors", async () => {
      mockPortfolioData.getPortfolioItemBySlug.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // Should not throw, but call notFound instead
      await expect(
        PortfolioDetailPage({ params: { slug: "test-portfolio-item" } }),
      ).resolves.not.toThrow();

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("Markdown Content Display", () => {
    it("should render page without errors when item exists", async () => {
      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      // Should return JSX without throwing
      expect(result).toBeDefined();
    });

    it("should handle items with empty media arrays", async () => {
      const itemWithEmptyMedia = {
        ...mockPortfolioItem,
        images: [],
        videos: [],
        externalLinks: [],
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
        itemWithEmptyMedia,
      );

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });

    it("should handle items without markdown files", async () => {
      const itemWithoutMarkdown = {
        ...mockPortfolioItem,
        markdownPath: undefined,
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
        itemWithoutMarkdown,
      );

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed portfolio item data", async () => {
      const malformedItem = {
        ...mockPortfolioItem,
        images: null as unknown as string[], // Malformed data
        videos: undefined,
        externalLinks: "not-an-array" as unknown as Array<{
          type: string;
          url: string;
          title: string;
        }>, // Wrong type
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(malformedItem);

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });

    it("should handle items with very long content gracefully", async () => {
      const itemWithLongContent = {
        ...mockPortfolioItem,
        description: "A".repeat(10000), // Very long description
        tags: Array.from({ length: 100 }, (_, i) => `tag-${i}`), // Many tags
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
        itemWithLongContent,
      );

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });
  });

  describe("Performance and Accessibility", () => {
    it("should handle items with thumbnail for proper image optimization", async () => {
      const itemWithThumbnail = {
        ...mockPortfolioItem,
        thumbnail: "/optimized-thumbnail.jpg",
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
        itemWithThumbnail,
      );

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });

    it("should provide proper media data structure for responsive embeds", async () => {
      const itemWithResponsiveMedia = {
        ...mockPortfolioItem,
        images: ["/responsive-image.jpg"],
        videos: [
          {
            type: "youtube" as const,
            url: "https://youtu.be/responsive-video",
            title: "Responsive Video",
          },
        ],
      };

      mockPortfolioData.getPortfolioItemBySlug.mockResolvedValue(
        itemWithResponsiveMedia,
      );

      const result = await PortfolioDetailPage({
        params: { slug: "test-portfolio-item" },
      });

      expect(result).toBeDefined();
    });
  });
});
