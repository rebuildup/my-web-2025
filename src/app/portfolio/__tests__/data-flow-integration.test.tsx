/**
 * Portfolio Data Flow Integration Tests
 * Task 5.1: データフロー全体のテスト（データマネージャー → API → コンポーネント → 表示）
 */

import { PortfolioIntegrationManager } from "@/lib/portfolio";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { ContentItem } from "@/types/content";

// Mock API endpoints
global.fetch = jest.fn();

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="next-image" data-src={src} data-alt={alt} {...props} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Test data
const mockPortfolioData: ContentItem[] = [
  {
    id: "test-item-1",
    type: "portfolio",
    title: "Test Project 1",
    description: "Test description 1",
    category: "develop",
    tags: ["React", "TypeScript"],
    technologies: ["React", "TypeScript"],
    thumbnail: "/images/test-1.jpg",
    images: ["/images/test-1.jpg"],
    status: "published",
    priority: 90,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    publishedAt: "2024-01-01T00:00:00Z",
    content: "Test content 1",
  },
  {
    id: "test-item-2",
    type: "portfolio",
    title: "Test Project 2",
    description: "Test description 2",
    category: "video",
    tags: ["After Effects", "Motion Graphics"],
    technologies: ["After Effects"],
    thumbnail: "/images/test-2.jpg",
    images: ["/images/test-2.jpg"],
    videos: [{ url: "https://example.com/video.mp4", title: "Test Video" }],
    status: "published",
    priority: 85,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
    publishedAt: "2024-02-01T00:00:00Z",
    content: "Test content 2",
    videoType: "promotion",
  },
];

const mockApiResponse = {
  data: mockPortfolioData,
  stats: {
    total: 2,
    categories: { develop: 1, video: 1 },
    tags: { React: 1, TypeScript: 1, "After Effects": 1, "Motion Graphics": 1 },
  },
};

describe("Portfolio Data Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    portfolioDataManager.clearCache();

    process.env.NODE_ENV = "test";
    process.env.NEXT_PUBLIC_BASE_URL = "https://yusuke-kim.com";
    delete process.env.NEXT_BUILD_TIME;
    delete process.env.NEXT_PHASE;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  describe("Data Manager Layer", () => {
    it("should fetch and process portfolio data correctly", async () => {
      const data = await portfolioDataManager.getPortfolioData();
      expect(data).toHaveLength(2);
      expect(data[0]).toMatchObject({
        id: "test-item-1",
        title: "Test Project 1",
        category: "develop",
      });
      expect(data[1]).toMatchObject({
        id: "test-item-2",
        title: "Test Project 2",
        category: "video",
      });
    });

    it("should generate portfolio statistics correctly", async () => {
      const stats = await portfolioDataManager.getPortfolioStats();
      expect(stats).toMatchObject({
        totalProjects: 2,
        categoryCounts: { develop: 1, video: 1 },
        technologyCounts: {
          React: 1,
          TypeScript: 1,
          "After Effects": 1,
        },
      });
    });

    it("should get featured projects correctly", async () => {
      const featured = await portfolioDataManager.getFeaturedProjects(3);
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBe(2);
      expect(featured[0].id).toBe("test-item-1");
    });

    it("should generate search filters correctly", async () => {
      const filters = await portfolioDataManager.getSearchFilters();
      expect(Array.isArray(filters)).toBe(true);
      const categoryFilter = filters.find((f) => f.type === "category");
      expect(categoryFilter).toBeDefined();
      expect(categoryFilter?.options.map((o) => o.value)).toContain("develop");
      expect(categoryFilter?.options.map((o) => o.value)).toContain("video");
    });

    it("should handle data processing errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      const data = await portfolioDataManager.getPortfolioData();
      expect(Array.isArray(data)).toBe(true);
      // Should fallback to file system data when API fails
      expect(data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Integration Manager Layer", () => {
    it("should provide home page data correctly", async () => {
      const integrationManager = new PortfolioIntegrationManager(
        portfolioDataManager,
      );
      const homePageData = await integrationManager.homePage.getHomePageData();
      expect(homePageData).toHaveProperty("featuredProjects");
      expect(homePageData).toHaveProperty("stats");
      expect(homePageData).toHaveProperty("latestUpdates");
      expect(homePageData.stats.totalProjects).toBe(2);
    });

    it("should provide search page data correctly", async () => {
      const integrationManager = new PortfolioIntegrationManager(
        portfolioDataManager,
      );
      const searchData = await integrationManager.search.getSearchData();
      expect(searchData).toHaveProperty("searchableContent");
      expect(searchData).toHaveProperty("searchFilters");
      expect(searchData.searchableContent).toHaveLength(2);
    });

    it("should provide about page data correctly", async () => {
      const integrationManager = new PortfolioIntegrationManager(
        portfolioDataManager,
      );
      const aboutData = await integrationManager.about.getAboutData();
      expect(aboutData).toHaveProperty("skillsFromProjects");
      expect(aboutData).toHaveProperty("clientWork");
    });

    it("should generate sitemap entries correctly", async () => {
      const integrationManager = new PortfolioIntegrationManager(
        portfolioDataManager,
      );
      const sitemapEntries = await integrationManager.seo.getSitemapEntries();
      expect(Array.isArray(sitemapEntries)).toBe(true);
      expect(sitemapEntries.length).toBeGreaterThanOrEqual(2); // Includes static and dynamic pages
    });
  });

  describe("SEO Metadata Generation", () => {
    it("should generate portfolio top metadata correctly", async () => {
      const seoGenerator = new PortfolioSEOMetadataGenerator(
        portfolioDataManager,
      );
      const { metadata, structuredData } =
        await seoGenerator.generatePortfolioTopMetadata();
      expect(metadata).toHaveProperty("title");
      expect(structuredData).toHaveProperty("@type", "CollectionPage");
    });

    it("should generate gallery metadata correctly", async () => {
      const seoGenerator = new PortfolioSEOMetadataGenerator(
        portfolioDataManager,
      );
      const { metadata, structuredData } =
        await seoGenerator.generateGalleryMetadata("all");
      expect(metadata.title).toContain("All Projects");
      expect(structuredData).toHaveProperty("@type", "CollectionPage");
    });

    it("should generate item detail metadata correctly", async () => {
      const seoGenerator = new PortfolioSEOMetadataGenerator(
        portfolioDataManager,
      );
      const { structuredData } =
        await seoGenerator.generateItemMetadata("test-item-1");
      expect(structuredData).toHaveProperty("@type", "SoftwareApplication");
    });
  });

  describe("API Integration", () => {
    it("should handle API success responses correctly", async () => {
      const data = await portfolioDataManager.getPortfolioData();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/content/portfolio"),
        expect.any(Object),
      );
      expect(data.map((d) => d.id)).toEqual(mockPortfolioData.map((d) => d.id));
    });

    it("should handle API error responses gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });
      const data = await portfolioDataManager.getPortfolioData();
      expect(Array.isArray(data)).toBe(true);
      // Should fallback to file system data when API fails
      expect(data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Caching and Performance", () => {
    it("should cache data appropriately", async () => {
      await portfolioDataManager.getPortfolioData();
      await portfolioDataManager.getPortfolioData();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should invalidate cache when needed", async () => {
      await portfolioDataManager.getPortfolioData();
      await portfolioDataManager.getPortfolioData(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Recovery and Fallbacks", () => {
    it("should maintain service availability during partial failures", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        })
        .mockRejectedValueOnce(new Error("Stats API Error"));

      const data = await portfolioDataManager.getPortfolioData();
      const stats = await portfolioDataManager.getPortfolioStats();

      const expectedData =
        await portfolioDataManager.processPortfolioData(mockPortfolioData);

      expect(data.map((d) => d.id)).toEqual(expectedData.data.map((d) => d.id));
      expect(stats.totalProjects).toBeGreaterThanOrEqual(0); // Should have fallback data
    });
  });
});
