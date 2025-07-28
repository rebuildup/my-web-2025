/**
 * Unit Tests for Portfolio Data Manager
 * Task 1.2: データ処理パイプライン統合管理のテスト
 */

import { PortfolioDataManager } from "../data-manager";
import { PortfolioDataProcessor } from "../data-processor";
import { SEOMetadataGenerator } from "../seo-generator";
import { PortfolioSearchIndexGenerator } from "../search-index";
import { ContentItem } from "@/types/content";

// Mock the fetch function
global.fetch = jest.fn();

describe("PortfolioDataManager", () => {
  let dataManager: PortfolioDataManager;
  let mockDataProcessor: jest.Mocked<PortfolioDataProcessor>;
  let mockSeoGenerator: jest.Mocked<SEOMetadataGenerator>;
  let mockSearchIndexGenerator: jest.Mocked<PortfolioSearchIndexGenerator>;

  const mockRawData: ContentItem[] = [
    {
      id: "test-1",
      type: "portfolio",
      title: "React App",
      description: "Test React application",
      category: "develop",
      tags: ["React", "TypeScript"],
      status: "published",
      priority: 90,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "test-2",
      type: "portfolio",
      title: "Unity Game",
      description: "Test Unity game",
      category: "develop",
      tags: ["Unity", "C#"],
      status: "published",
      priority: 85,
      createdAt: "2024-02-01T00:00:00Z",
    },
  ];

  const mockProcessedData = mockRawData.map((item) => ({
    ...item,
    technologies: item.tags,
    thumbnail: "/test-thumb.jpg",
    seo: {
      title: item.title,
      description: item.description,
      keywords: item.tags,
      ogImage: "/test-og.jpg",
      twitterImage: "/test-twitter.jpg",
      canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
      structuredData: {},
    },
  }));

  beforeEach(() => {
    // Create mocked dependencies
    mockDataProcessor = {
      processRawData: jest.fn(),
      generatePortfolioStats: jest.fn(),
    } as unknown as jest.Mocked<PortfolioDataProcessor>;

    mockSeoGenerator = {
      generateGalleryMetadata: jest.fn(),
      generateDetailMetadata: jest.fn(),
      generatePlaygroundMetadata: jest.fn(),
      generateSitemapEntries: jest.fn(),
      generatePortfolioStructuredData: jest.fn(),
      generateGalleryStructuredData: jest.fn(),
    } as unknown as jest.Mocked<SEOMetadataGenerator>;

    mockSearchIndexGenerator = {
      generateSearchIndex: jest.fn(),
      generateSearchFilters: jest.fn(),
      generateSearchStats: jest.fn(),
      searchPortfolioItems: jest.fn(),
    } as unknown as jest.Mocked<PortfolioSearchIndexGenerator>;

    // Create data manager with mocked dependencies
    dataManager = new PortfolioDataManager(
      mockDataProcessor,
      mockSeoGenerator,
      mockSearchIndexGenerator,
    );

    // Setup default mock responses
    mockDataProcessor.processRawData.mockResolvedValue(mockProcessedData);
    mockDataProcessor.generatePortfolioStats.mockResolvedValue({
      totalProjects: 2,
      categoryCounts: { develop: 2 },
      technologyCounts: { React: 1, Unity: 1 },
      lastUpdate: new Date("2024-02-01T00:00:00Z"),
    });

    mockSearchIndexGenerator.generateSearchIndex.mockReturnValue([
      {
        id: "test-1",
        type: "portfolio",
        title: "React App",
        description: "Test React application",
        content: "",
        tags: ["React", "TypeScript"],
        category: "develop",
        searchableContent: "react app test react application",
        technologies: ["React", "TypeScript"],
        priority: 90,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);

    mockSearchIndexGenerator.generateSearchFilters.mockReturnValue([
      {
        type: "category",
        options: [{ value: "develop", label: "開発", count: 2 }],
      },
    ]);

    mockSearchIndexGenerator.generateSearchStats.mockReturnValue({
      totalItems: 2,
      categoryDistribution: { develop: 2 },
      technologyDistribution: { React: 1, Unity: 1 },
      yearDistribution: { "2024": 2 },
    });

    mockSearchIndexGenerator.searchPortfolioItems.mockReturnValue([
      {
        id: "test-1",
        type: "portfolio",
        title: "React App",
        description: "Test React application",
        url: "/portfolio/test-1",
        score: 1.0,
        highlights: [],
      },
    ]);

    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockRawData }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processPortfolioData", () => {
    it("should process raw data through the complete pipeline", async () => {
      const result = await dataManager.processPortfolioData(mockRawData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProcessedData);
      expect(mockDataProcessor.processRawData).toHaveBeenCalledWith(
        mockRawData,
      );
      expect(mockSearchIndexGenerator.generateSearchIndex).toHaveBeenCalledWith(
        mockProcessedData,
      );
      expect(mockDataProcessor.generatePortfolioStats).toHaveBeenCalledWith(
        mockProcessedData,
      );
    });

    it("should handle processing errors gracefully", async () => {
      mockDataProcessor.processRawData.mockRejectedValue(
        new Error("Processing failed"),
      );

      const result = await dataManager.processPortfolioData(mockRawData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "Data processing failed: Processing failed",
      );
      expect(result.data).toEqual([]);
    });

    it("should update cache after successful processing", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const cacheStatus = dataManager.getCacheStatus();
      expect(cacheStatus.itemCount).toBe(2);
      expect(cacheStatus.isValid).toBe(true);
    });
  });

  describe("getPortfolioData", () => {
    it("should return cached data when cache is valid", async () => {
      // First call to populate cache
      await dataManager.processPortfolioData(mockRawData);

      // Second call should use cache
      const data = await dataManager.getPortfolioData();

      expect(data).toEqual(mockProcessedData);
      expect(global.fetch).toHaveBeenCalledTimes(0); // No additional API calls
    });

    it("should fetch fresh data when cache is invalid", async () => {
      await dataManager.getPortfolioData();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/content/portfolio"),
        expect.any(Object),
      );
      expect(mockDataProcessor.processRawData).toHaveBeenCalled();
    });

    it("should force refresh when requested", async () => {
      // Populate cache first
      await dataManager.processPortfolioData(mockRawData);

      // Force refresh
      await dataManager.getPortfolioData(true);

      expect(global.fetch).toHaveBeenCalled();
      expect(mockDataProcessor.processRawData).toHaveBeenCalledTimes(2);
    });

    it("should return cached data when fresh data processing fails", async () => {
      // Populate cache first
      await dataManager.processPortfolioData(mockRawData);

      // Mock fetch failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

      const data = await dataManager.getPortfolioData(true);

      expect(data).toEqual(mockProcessedData); // Should return cached data
    });
  });

  describe("getPortfolioItem", () => {
    it("should return specific portfolio item by ID", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const item = await dataManager.getPortfolioItem("test-1");

      expect(item).toBeDefined();
      expect(item?.id).toBe("test-1");
      expect(item?.title).toBe("React App");
    });

    it("should return null for non-existent item", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const item = await dataManager.getPortfolioItem("non-existent");

      expect(item).toBeNull();
    });
  });

  describe("getPortfolioItemsByCategory", () => {
    it("should return all items for 'all' category", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const items = await dataManager.getPortfolioItemsByCategory("all");

      expect(items).toHaveLength(2);
    });

    it("should filter items by specific category", async () => {
      const mixedData = [
        ...mockRawData,
        {
          id: "video-1",
          type: "portfolio" as const,
          title: "Video Project",
          description: "Test video",
          category: "video",
          tags: ["After Effects"],
          status: "published" as const,
          priority: 80,
          createdAt: "2024-03-01T00:00:00Z",
        },
      ];

      const mixedProcessedData = mixedData.map((item) => ({
        ...item,
        technologies: item.tags,
        thumbnail: "/test-thumb.jpg",
        seo: {
          title: item.title,
          description: item.description,
          keywords: item.tags,
          ogImage: "/test-og.jpg",
          twitterImage: "/test-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
      }));

      mockDataProcessor.processRawData.mockResolvedValue(mixedProcessedData);
      await dataManager.processPortfolioData(mixedData);

      const developItems =
        await dataManager.getPortfolioItemsByCategory("develop");
      const videoItems = await dataManager.getPortfolioItemsByCategory("video");

      expect(developItems).toHaveLength(2);
      expect(videoItems).toHaveLength(1);
      expect(videoItems[0].id).toBe("video-1");
    });
  });

  describe("searchPortfolioItems", () => {
    it("should search portfolio items with query", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const results = await dataManager.searchPortfolioItems("React");

      expect(
        mockSearchIndexGenerator.searchPortfolioItems,
      ).toHaveBeenCalledWith(
        "React",
        expect.any(Array),
        expect.objectContaining({
          limit: 50,
          includeContent: true,
        }),
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("test-1");
    });

    it("should apply category filter", async () => {
      await dataManager.processPortfolioData(mockRawData);

      await dataManager.searchPortfolioItems("test", { category: "develop" });

      const searchIndexArg =
        mockSearchIndexGenerator.searchPortfolioItems.mock.calls[0][1];
      expect(searchIndexArg.every((item) => item.category === "develop")).toBe(
        true,
      );
    });

    it("should apply technology filter", async () => {
      await dataManager.processPortfolioData(mockRawData);

      await dataManager.searchPortfolioItems("test", { technology: "React" });

      const searchIndexArg =
        mockSearchIndexGenerator.searchPortfolioItems.mock.calls[0][1];
      expect(
        searchIndexArg.every((item) =>
          item.technologies.some((tech: string) =>
            tech.toLowerCase().includes("react"),
          ),
        ),
      ).toBe(true);
    });

    it("should apply year filter", async () => {
      await dataManager.processPortfolioData(mockRawData);

      await dataManager.searchPortfolioItems("test", { year: "2024" });

      const searchIndexArg =
        mockSearchIndexGenerator.searchPortfolioItems.mock.calls[0][1];
      expect(
        searchIndexArg.every(
          (item) =>
            new Date(item.createdAt).getFullYear().toString() === "2024",
        ),
      ).toBe(true);
    });

    it("should apply custom limit", async () => {
      await dataManager.processPortfolioData(mockRawData);

      await dataManager.searchPortfolioItems("test", { limit: 10 });

      expect(
        mockSearchIndexGenerator.searchPortfolioItems,
      ).toHaveBeenCalledWith(
        "test",
        expect.any(Array),
        expect.objectContaining({ limit: 10 }),
      );
    });
  });

  describe("getFeaturedProjects", () => {
    it("should return featured projects sorted by priority and date", async () => {
      const dataWithPriorities = [
        { ...mockRawData[0], priority: 95, updatedAt: "2024-01-20T00:00:00Z" },
        { ...mockRawData[1], priority: 90, updatedAt: "2024-01-25T00:00:00Z" },
        {
          id: "test-3",
          type: "portfolio" as const,
          title: "Old Project",
          description: "Old project",
          category: "develop",
          tags: ["JavaScript"],
          status: "published" as const,
          priority: 100,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-05T00:00:00Z",
        },
      ];

      const processedWithPriorities = dataWithPriorities.map((item) => ({
        ...item,
        technologies: item.tags,
        thumbnail: "/test-thumb.jpg",
        seo: {
          title: item.title,
          description: item.description,
          keywords: item.tags,
          ogImage: "/test-og.jpg",
          twitterImage: "/test-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
      }));

      mockDataProcessor.processRawData.mockResolvedValue(
        processedWithPriorities,
      );
      await dataManager.processPortfolioData(dataWithPriorities);

      const featured = await dataManager.getFeaturedProjects(2);

      expect(featured).toHaveLength(2);
      expect(featured[0].id).toBe("test-3"); // Highest priority
      expect(featured[1].id).toBe("test-1"); // Second highest priority
    });

    it("should filter only published items", async () => {
      const dataWithDrafts = [
        { ...mockRawData[0], status: "draft" as const },
        { ...mockRawData[1], status: "published" as const },
      ];

      const processedWithDrafts = dataWithDrafts.map((item) => ({
        ...item,
        technologies: item.tags,
        thumbnail: "/test-thumb.jpg",
        seo: {
          title: item.title,
          description: item.description,
          keywords: item.tags,
          ogImage: "/test-og.jpg",
          twitterImage: "/test-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
      }));

      mockDataProcessor.processRawData.mockResolvedValue(processedWithDrafts);
      await dataManager.processPortfolioData(dataWithDrafts);

      const featured = await dataManager.getFeaturedProjects();

      expect(featured).toHaveLength(1);
      expect(featured[0].id).toBe("test-2");
    });
  });

  describe("getRelatedItems", () => {
    it("should return related items based on relatedItems field", async () => {
      const dataWithRelated = mockProcessedData.map((item) => ({
        ...item,
        relatedItems: item.id === "test-1" ? ["test-2"] : [],
      }));

      mockDataProcessor.processRawData.mockResolvedValue(dataWithRelated);
      await dataManager.processPortfolioData(mockRawData);

      const related = await dataManager.getRelatedItems("test-1");

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe("test-2");
    });

    it("should return empty array for item without related items", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const related = await dataManager.getRelatedItems("test-1");

      expect(related).toHaveLength(0);
    });

    it("should return empty array for non-existent item", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const related = await dataManager.getRelatedItems("non-existent");

      expect(related).toHaveLength(0);
    });
  });

  describe("cache management", () => {
    it("should invalidate cache", async () => {
      await dataManager.processPortfolioData(mockRawData);

      let cacheStatus = dataManager.getCacheStatus();
      expect(cacheStatus.isValid).toBe(true);

      dataManager.invalidateCache();

      cacheStatus = dataManager.getCacheStatus();
      expect(cacheStatus.isValid).toBe(false);
      expect(cacheStatus.itemCount).toBe(0);
    });

    it("should provide cache status information", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const cacheStatus = dataManager.getCacheStatus();

      expect(cacheStatus.isValid).toBe(true);
      expect(cacheStatus.itemCount).toBe(2);
      expect(cacheStatus.searchIndexSize).toBe(1);
      expect(cacheStatus.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe("API integration", () => {
    it("should handle API errors gracefully", async () => {
      // Clear cache first
      dataManager.invalidateCache();

      // Mock empty processed data when raw data is empty
      mockDataProcessor.processRawData.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const data = await dataManager.getPortfolioData();

      expect(data).toEqual([]); // Should return empty array on API failure
    });

    it("should handle non-OK API responses", async () => {
      // Clear cache first
      dataManager.invalidateCache();

      // Mock empty processed data when raw data is empty
      mockDataProcessor.processRawData.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const data = await dataManager.getPortfolioData();

      expect(data).toEqual([]);
    });

    it("should fallback to file system when API fails in production", async () => {
      // Clear cache first
      dataManager.invalidateCache();

      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("API not available"),
      );

      // Mock file system fallback
      const mockFs = {
        readFile: jest.fn().mockResolvedValue(JSON.stringify(mockRawData)),
      };
      const mockPath = {
        join: jest.fn().mockReturnValue("/mock/path/portfolio.json"),
      };

      jest.doMock("fs/promises", () => mockFs);
      jest.doMock("path", () => mockPath);

      // Mock processed data
      mockDataProcessor.processRawData.mockResolvedValue(mockProcessedData);

      const originalEnv = process.env.NODE_ENV;
      const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      (process.env as Record<string, string | undefined>).NODE_ENV =
        "production";
      delete process.env.NEXT_PUBLIC_BASE_URL;

      const data = await dataManager.getPortfolioData();

      // API should be called first, then fallback to file system
      expect(global.fetch).toHaveBeenCalled();
      expect(data).toEqual(
        mockProcessedData.filter((item) => item.status === "published"),
      );

      (process.env as Record<string, string | undefined>).NODE_ENV =
        originalEnv;
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
    });
  });

  describe("integration with other services", () => {
    it("should generate sitemap entries", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const sitemapEntries = [
        {
          url: "https://yusuke-kim.com/portfolio/test-1",
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
      ];
      mockSeoGenerator.generateSitemapEntries.mockReturnValue(sitemapEntries);

      const result = await dataManager.generateSitemapEntries();

      expect(mockSeoGenerator.generateSitemapEntries).toHaveBeenCalledWith(
        mockProcessedData,
      );
      expect(result).toEqual(sitemapEntries);
    });

    it("should get search filters", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const filters = await dataManager.getSearchFilters();

      expect(filters).toEqual([
        {
          type: "category",
          options: [{ value: "develop", label: "開発", count: 2 }],
        },
      ]);
    });

    it("should get search stats", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const stats = await dataManager.getSearchStats();

      expect(stats.totalItems).toBe(2);
      expect(stats.categoryDistribution.develop).toBe(2);
    });

    it("should get portfolio stats", async () => {
      await dataManager.processPortfolioData(mockRawData);

      const stats = await dataManager.getPortfolioStats();

      expect(stats.totalProjects).toBe(2);
      expect(stats.categoryCounts.develop).toBe(2);
    });
  });
});
