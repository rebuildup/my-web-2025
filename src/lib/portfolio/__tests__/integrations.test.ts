/**
 * @jest-environment jsdom
 */

import {
  AboutIntegration,
  AnalyticsIntegration,
  HomePageIntegration,
  SearchIntegration,
  SEOIntegration,
} from "../integrations";

// Mock the data manager
const mockDataManager = {
  getPortfolioData: jest.fn(),
  getPortfolioStats: jest.fn(),
  getFeaturedProjects: jest.fn(),
  getSearchFilters: jest.fn(),
} as jest.Mocked<typeof import("@/lib/portfolio/data-manager")>;

const mockPortfolioData = [
  {
    id: "project-1",
    title: "Test Project 1",
    description: "A test project for development",
    category: "develop",
    tags: ["React", "TypeScript"],
    technologies: ["React", "TypeScript", "Next.js"],
    content: "This is test content for project 1",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-06-01T00:00:00.000Z",
    publishedAt: "2023-01-15T00:00:00.000Z",
    thumbnail: "/images/project1.jpg",
    images: ["/images/project1.jpg", "/images/project1-2.jpg"],
    priority: 80,
    searchIndex: {
      searchableContent: "test project development react typescript",
    },
  },
  {
    id: "project-2",
    title: "Video Project",
    description: "A video editing project",
    category: "video",
    tags: ["After Effects", "Premiere"],
    technologies: ["After Effects", "Premiere Pro"],
    content: "Video project content",
    createdAt: "2023-02-01T00:00:00.000Z",
    updatedAt: "2023-07-01T00:00:00.000Z",
    publishedAt: "2023-02-15T00:00:00.000Z",
    thumbnail: "/images/project2.jpg",
    priority: 70,
  },
];

describe("Portfolio Integrations", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDataManager.getPortfolioData.mockResolvedValue(mockPortfolioData);
    mockDataManager.getPortfolioStats.mockResolvedValue({
      totalProjects: 2,
      categoryCounts: { develop: 1, video: 1 },
      technologyCounts: { React: 1, TypeScript: 1, "After Effects": 1 },
      lastUpdate: new Date("2023-07-01T00:00:00.000Z"),
    });
    mockDataManager.getFeaturedProjects.mockResolvedValue(
      mockPortfolioData.slice(0, 1),
    );
    mockDataManager.getSearchFilters.mockResolvedValue([
      {
        type: "category",
        options: [
          { value: "develop", label: "Development", count: 1 },
          { value: "video", label: "Video", count: 1 },
        ],
      },
    ]);
  });

  describe("HomePageIntegration", () => {
    it("should create instance and get home page data", async () => {
      const homeIntegration = new HomePageIntegration(mockDataManager);
      const result = await homeIntegration.getHomePageData();

      expect(result.featuredProjects).toHaveLength(1);
      expect(result.featuredProjects[0].id).toBe("project-1");
      expect(result.stats.totalProjects).toBe(2);
      expect(result.latestUpdates).toHaveLength(2);
    });

    it("should sort latest updates by updatedAt descending", async () => {
      const homeIntegration = new HomePageIntegration(mockDataManager);
      const result = await homeIntegration.getHomePageData();

      expect(result.latestUpdates[0].id).toBe("project-2");
      expect(result.latestUpdates[1].id).toBe("project-1");
    });
  });

  describe("SearchIntegration", () => {
    it("should create instance and get search data", async () => {
      const searchIntegration = new SearchIntegration(mockDataManager);
      const result = await searchIntegration.getSearchData();

      expect(result.searchableContent).toHaveLength(2);
      const ids = result.searchableContent.map((item) => item.id);
      expect(ids).toContain("project-1");
      expect(ids).toContain("project-2");
      expect(result.searchFilters).toHaveLength(1);
    });

    it("should search portfolio items by query", async () => {
      const searchIntegration = new SearchIntegration(mockDataManager);
      const results = await searchIntegration.searchPortfolioItems("React");

      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe("project-1");
    });

    it("should filter by category", async () => {
      const searchIntegration = new SearchIntegration(mockDataManager);
      const results = await searchIntegration.searchPortfolioItems("", [
        { type: "category", value: "video" },
      ]);

      expect(results).toHaveLength(1);
      expect(results[0].item.category).toBe("video");
    });

    it("should get search stats", async () => {
      const searchIntegration = new SearchIntegration(mockDataManager);
      const stats = await searchIntegration.getSearchStats();

      expect(stats.totalItems).toBe(2);
      expect(stats.categoryDistribution).toEqual({
        develop: 1,
        video: 1,
      });
    });
  });

  describe("AboutIntegration", () => {
    it("should create instance and extract skills from projects", async () => {
      const aboutIntegration = new AboutIntegration(mockDataManager);
      const skills = await aboutIntegration.extractSkillsFromProjects();

      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0].name).toBeDefined();
      expect(skills[0].projectCount).toBeGreaterThan(0);
    });

    it("should get client work examples", async () => {
      const aboutIntegration = new AboutIntegration(mockDataManager);
      const clientWork = await aboutIntegration.getClientWorkExamples();

      expect(clientWork).toHaveLength(2);
      const ids = clientWork.map((item) => item.id);
      expect(ids).toContain("project-1");
      expect(ids).toContain("project-2");
    });
  });

  describe("SEOIntegration", () => {
    it("should create instance and get sitemap entries", async () => {
      const seoIntegration = new SEOIntegration(mockDataManager);
      const entries = await seoIntegration.getSitemapEntries();

      expect(entries).toHaveLength(2);
      const urls = entries.map((entry) => entry.url);
      expect(urls.some((url) => url.includes("project-1"))).toBe(true);
      expect(urls.some((url) => url.includes("project-2"))).toBe(true);
    });

    it("should update meta tags for detail page", async () => {
      const seoIntegration = new SEOIntegration(mockDataManager);
      const metaTags = await seoIntegration.updateMetaTags("detail", {
        item: mockPortfolioData[0],
      });

      expect(metaTags.title).toBeDefined();
      expect(metaTags.description).toBeDefined();
      expect(typeof metaTags.title).toBe("string");
      expect(typeof metaTags.description).toBe("string");
    });

    it("should generate structured data", async () => {
      const seoIntegration = new SEOIntegration(mockDataManager);
      const structuredData = await seoIntegration.generateStructuredData(
        mockPortfolioData[0],
      );

      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("CreativeWork");
      expect(structuredData.name).toBeDefined();
      expect(typeof structuredData.name).toBe("string");
    });
  });

  describe("AnalyticsIntegration", () => {
    it("should create instance and track portfolio view", () => {
      const analyticsIntegration = new AnalyticsIntegration(mockDataManager);

      expect(() => {
        analyticsIntegration.trackPortfolioView("project-1", {
          source: "gallery",
        });
      }).not.toThrow();
    });

    it("should track gallery interaction", () => {
      const analyticsIntegration = new AnalyticsIntegration(mockDataManager);

      expect(() => {
        analyticsIntegration.trackGalleryInteraction(
          "develop",
          "filter_click",
          "project-1",
        );
      }).not.toThrow();
    });

    it("should generate portfolio report", async () => {
      const analyticsIntegration = new AnalyticsIntegration(mockDataManager);

      // Add some test events
      analyticsIntegration.trackPortfolioView("project-1");
      analyticsIntegration.trackPortfolioView("project-2");

      const report = await analyticsIntegration.generatePortfolioReport();

      expect(report.summary.totalViews).toBe(2);
      expect(report.events).toHaveLength(2);
    });
  });
});
