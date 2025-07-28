/**
 * Portfolio Integration Tests
 * Tests the complete data flow from API to processed data
 */

import { portfolioDataManager } from "../data-manager";

// Mock the actual portfolio data
const mockApiResponse = {
  data: [
    {
      id: "portfolio-1753614504288",
      type: "portfolio",
      title: "reel 2024",
      description: "2024年に作った映像のまとめです",
      category: "video",
      tags: ["After Effects"],
      status: "published",
      priority: 50,
      createdAt: "2025-07-27T11:08:24.288Z",
      updatedAt: "2025-07-27T11:15:20.347Z",
      content: "# マークダウン\n## テスト\nテストマークダウン",
      images: ["/images/portfolio/--1753614822051-3k30ay.jpg"],
      thumbnail: "/images/portfolio/--1753614822051-3k30ay.jpg",
      videos: [
        {
          type: "youtube",
          url: "https://youtu.be/oqfjwzVYDc8?si=c5ExRsAXmassLp3E",
          title: "reel 2024",
          description: "説明の追加方法",
          thumbnail: "https://img.youtube.com/vi/oqfjwzVYDc8/maxresdefault.jpg",
        },
      ],
    },
  ],
};

// Mock fetch
global.fetch = jest.fn();

describe("Portfolio Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache
    portfolioDataManager.invalidateCache();
  });

  describe("Data Processing Pipeline", () => {
    it("should process raw API data into PortfolioContentItem format", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const items = await portfolioDataManager.getPortfolioData();

      expect(items).toHaveLength(1);
      const item = items[0];

      // Check that the item has been properly processed
      expect(item.id).toBe("portfolio-1753614504288");
      expect(item.title).toBe("reel 2024");
      expect(item.technologies).toEqual(["After Effects"]);
      expect(item.seo).toBeDefined();
      expect(item.seo.title).toContain("reel 2024");
      expect(item.seo.canonical).toContain("portfolio-1753614504288");
      expect(item.aspectRatio).toBe(16 / 9); // Default aspect ratio
      expect(item.gridSize).toBeDefined();
    });

    it("should generate proper gallery items for different gallery types", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const allItems =
        await portfolioDataManager.getPortfolioItemsByCategory("all");
      const videoItems =
        await portfolioDataManager.getPortfolioItemsByCategory("video");

      expect(allItems).toHaveLength(1);
      expect(videoItems).toHaveLength(1); // Should be categorized as video

      const galleryItem = allItems[0];
      expect(galleryItem.id).toBe("portfolio-1753614504288");
      expect(galleryItem.thumbnail).toBe(
        "/images/portfolio/--1753614822051-3k30ay.jpg",
      );
    });

    it("should generate search index correctly", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const searchIndex = await portfolioDataManager.getSearchIndex();

      expect(searchIndex).toHaveLength(1);
      const indexItem = searchIndex[0];

      expect(indexItem.id).toBe("portfolio-1753614504288");
      expect(indexItem.type).toBe("portfolio");
      expect(indexItem.searchableContent).toContain("reel 2024");
      expect(indexItem.searchableContent).toContain("after effects");
      expect(indexItem.technologies).toEqual(["After Effects"]);
    });

    it("should calculate statistics correctly", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const stats = await portfolioDataManager.getPortfolioStats();
      const categoryStats = await portfolioDataManager.getPortfolioStats();

      expect(stats.totalProjects).toBe(1);
      expect(stats.categoryCounts["video"]).toBe(1);
      expect(stats.technologyCounts["After Effects"]).toBe(1);

      expect(categoryStats.totalProjects).toBe(1);
      expect(categoryStats.categoryCounts["video"]).toBe(1); // Should be categorized as video
    });

    it("should handle search functionality", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const results = await portfolioDataManager.searchPortfolioItems("reel");

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("reel 2024");

      // Search for non-existent term
      const emptyResults =
        await portfolioDataManager.searchPortfolioItems("nonexistent");
      expect(emptyResults).toHaveLength(0);
    });

    it("should get featured projects correctly", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const featured = await portfolioDataManager.getFeaturedProjects(3);

      expect(featured).toHaveLength(1);
      expect(featured[0].title).toBe("reel 2024");
      expect(featured[0].status).toBe("published");
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const items = await portfolioDataManager.getPortfolioData();

      // Should return fallback data instead of throwing
      expect(Array.isArray(items)).toBe(true);
    });

    it("should handle malformed data gracefully", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ invalid: "data" }],
      });

      const items = await portfolioDataManager.getPortfolioData();

      // Should process even malformed data
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Caching", () => {
    it("should cache data properly", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await portfolioDataManager.getPortfolioData();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await portfolioDataManager.getPortfolioData();
      expect(fetch).toHaveBeenCalledTimes(1); // Still 1, not 2

      // Check cache health
      const health = portfolioDataManager.getCacheStatus();
      expect(health.isValid).toBe(true);
    });

    it("should invalidate cache properly", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await portfolioDataManager.getPortfolioData();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Invalidate cache
      portfolioDataManager.invalidateCache();

      // Mock second response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // Second call should fetch again
      await portfolioDataManager.getPortfolioData();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
