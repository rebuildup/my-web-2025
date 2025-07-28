/**
 * Integration System Tests
 * Task 1.3: 他ページ連携システムの実装
 */

import {
  HomePageIntegration,
  SearchIntegration,
  AboutIntegration,
  SEOIntegration,
  AnalyticsIntegration,
  PortfolioIntegrationManager,
} from "../integrations";
import { PortfolioDataManager } from "../data-manager";
import { PortfolioContentItem } from "@/types/portfolio";

// Mock data
const mockPortfolioItems: PortfolioContentItem[] = [
  {
    id: "project-1",
    type: "portfolio",
    title: "React Portfolio Website",
    description: "Modern portfolio website built with React and Next.js",
    content: "Detailed content about the React portfolio project...",
    category: "develop",
    status: "published",
    tags: ["portfolio", "web", "modern"],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    thumbnail: "/images/project-1-thumb.jpg",
    images: ["/images/project-1-1.jpg", "/images/project-1-2.jpg"],
    priority: 9,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
    repository: {
      url: "https://github.com/user/project-1",
      type: "github",
      title: "Project 1 Repository",
    },
    projectType: "web",
    seo: {
      title: "React Portfolio Website",
      description: "Modern portfolio website built with React and Next.js",
      keywords: ["React", "Next.js", "portfolio"],
      ogImage: "/images/project-1-og.jpg",
      twitterImage: "/images/project-1-twitter.jpg",
      canonical: "/portfolio/project-1",
      structuredData: {},
    },
  },
  {
    id: "project-2",
    type: "portfolio",
    title: "Music Video Animation",
    description: "Animated music video created with After Effects",
    content: "Creative animation project for music video...",
    category: "video",
    status: "published",
    tags: ["animation", "music", "creative"],
    technologies: ["After Effects", "Cinema 4D", "Premiere Pro"],
    thumbnail: "/images/project-2-thumb.jpg",
    images: ["/images/project-2-1.jpg"],
    priority: 8,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z",
    client: "Music Artist XYZ",
    videoType: "mv",
    duration: 180,
    seo: {
      title: "Music Video Animation",
      description: "Animated music video created with After Effects",
      keywords: ["animation", "music video", "After Effects"],
      ogImage: "/images/project-2-og.jpg",
      twitterImage: "/images/project-2-twitter.jpg",
      canonical: "/portfolio/project-2",
      structuredData: {},
    },
  },
  {
    id: "project-3",
    title: "Brand Identity Design",
    description: "Complete brand identity design for startup",
    content:
      "Comprehensive branding project including logo, colors, typography...",
    category: "video&design",
    status: "published",
    tags: ["branding", "identity", "startup"],
    technologies: ["Figma", "Illustrator", "Photoshop"],
    thumbnail: "/images/project-3-thumb.jpg",
    images: [
      "/images/project-3-1.jpg",
      "/images/project-3-2.jpg",
      "/images/project-3-3.jpg",
    ],
    priority: 7,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    client: "Startup ABC",
    projectType: "web",
    type: "portfolio",
    seo: {
      title: "Brand Identity Design",
      description: "Complete brand identity design for startup",
      keywords: ["branding", "identity", "design"],
      ogImage: "/images/project-3-og.jpg",
      twitterImage: "/images/project-3-twitter.jpg",
      canonical: "/portfolio/project-3",
      structuredData: {},
    },
  },
];

// Mock PortfolioDataManager
class MockPortfolioDataManager extends PortfolioDataManager {
  async getAllItems(): Promise<PortfolioContentItem[]> {
    return mockPortfolioItems;
  }

  async getItemById(id: string): Promise<PortfolioContentItem | null> {
    return mockPortfolioItems.find((item) => item.id === id) || null;
  }

  async getItemsByCategory(category: string): Promise<PortfolioContentItem[]> {
    return mockPortfolioItems.filter((item) => item.category === category);
  }

  async clearCache(): Promise<void> {
    // Mock implementation
  }
}

describe("Portfolio Integration System", () => {
  let dataManager: MockPortfolioDataManager;
  let homePageIntegration: HomePageIntegration;
  let searchIntegration: SearchIntegration;
  let aboutIntegration: AboutIntegration;
  let seoIntegration: SEOIntegration;
  let analyticsIntegration: AnalyticsIntegration;
  let integrationManager: PortfolioIntegrationManager;

  beforeEach(() => {
    dataManager = new MockPortfolioDataManager();
    homePageIntegration = new HomePageIntegration(dataManager);
    searchIntegration = new SearchIntegration(dataManager);
    aboutIntegration = new AboutIntegration(dataManager);
    seoIntegration = new SEOIntegration(dataManager);
    analyticsIntegration = new AnalyticsIntegration(dataManager);
    integrationManager = new PortfolioIntegrationManager(dataManager);
  });

  describe("HomePageIntegration", () => {
    it("should get featured projects correctly", async () => {
      const featuredProjects = await homePageIntegration.getFeaturedProjects();

      expect(featuredProjects).toHaveLength(3);
      expect(featuredProjects[0].id).toBe("project-1"); // Highest priority
      expect(featuredProjects[1].id).toBe("project-2");
      expect(featuredProjects[2].id).toBe("project-3");
    });

    it("should generate portfolio stats correctly", async () => {
      const stats = await homePageIntegration.getPortfolioStats();

      expect(stats.totalProjects).toBe(3);
      expect(stats.categoryCounts).toEqual({
        develop: 1,
        video: 1,
        "video&design": 1,
      });
      expect(stats.technologyCounts["React"]).toBe(1);
      expect(stats.technologyCounts["After Effects"]).toBe(1);
      expect(stats.lastUpdate).toBeInstanceOf(Date);
    });

    it("should get latest updates correctly", async () => {
      const updates = await homePageIntegration.getLatestUpdates();

      expect(updates).toHaveLength(3);
      expect(updates[0].id).toBe("project-1"); // Most recently updated
      expect(updates[0].title).toBe("React Portfolio Website");
      expect(updates[0].category).toBe("develop");
    });

    it("should get complete home page data", async () => {
      const homePageData = await homePageIntegration.getHomePageData();

      expect(homePageData).toHaveProperty("featuredProjects");
      expect(homePageData).toHaveProperty("stats");
      expect(homePageData).toHaveProperty("latestUpdates");
      expect(homePageData.featuredProjects).toHaveLength(3);
      expect(homePageData.stats.totalProjects).toBe(3);
    });
  });

  describe("SearchIntegration", () => {
    it("should generate search index correctly", async () => {
      const searchIndex = await searchIntegration.generateSearchIndex();

      expect(searchIndex).toHaveLength(3);
      expect(searchIndex[0]).toHaveProperty("id");
      expect(searchIndex[0]).toHaveProperty("type", "portfolio");
      expect(searchIndex[0]).toHaveProperty("searchableText");
      expect(searchIndex[0]).toHaveProperty("url");
      expect(searchIndex[0].url).toBe("/portfolio/project-1");
    });

    it("should generate search filters correctly", async () => {
      const filters = await searchIntegration.getSearchFilters();

      const categoryFilters = filters.filter((f) => f.type === "category");
      const technologyFilters = filters.filter((f) => f.type === "technology");

      expect(categoryFilters).toHaveLength(3);
      expect(technologyFilters.length).toBeGreaterThan(0);
      expect(categoryFilters.find((f) => f.value === "develop")).toBeTruthy();
      expect(technologyFilters.find((f) => f.value === "React")).toBeTruthy();
    });

    it("should search portfolio items correctly", async () => {
      const results = await searchIntegration.searchPortfolioItems("React");

      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe("project-1");
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].matchedFields).toContain("technologies");
    });

    it("should filter search results correctly", async () => {
      const results = await searchIntegration.searchPortfolioItems("", [
        { type: "category", value: "develop" },
      ]);

      expect(results).toHaveLength(1);
      expect(results[0].item.category).toBe("develop");
    });

    it("should get search statistics correctly", async () => {
      const stats = await searchIntegration.getSearchStats();

      expect(stats.totalItems).toBe(3);
      expect(stats.categories).toBeGreaterThan(0);
      expect(stats.technologies).toBeGreaterThan(0);
      expect(stats.lastIndexed).toBeInstanceOf(Date);
    });
  });

  describe("AboutIntegration", () => {
    it("should extract skills from projects correctly", async () => {
      const skills = await aboutIntegration.extractSkillsFromProjects();

      expect(skills.length).toBeGreaterThan(0);

      const reactSkill = skills.find((s) => s.name === "React");
      expect(reactSkill).toBeTruthy();
      expect(reactSkill?.category).toBe("development");
      expect(reactSkill?.projectCount).toBe(1);
      expect(reactSkill?.examples).toContain("project-1");
    });

    it("should get client work examples correctly", async () => {
      const clientWork = await aboutIntegration.getClientWorkExamples();

      expect(clientWork).toHaveLength(2); // project-2 and project-3 have clients
      expect(clientWork[0].client).toBeTruthy();
      expect(
        clientWork.find((w) => w.client === "Music Artist XYZ"),
      ).toBeTruthy();
    });

    it("should get relevant portfolio items correctly", async () => {
      const relevantItems =
        await aboutIntegration.getRelevantPortfolioItems("React");

      expect(relevantItems).toHaveLength(1);
      expect(relevantItems[0].id).toBe("project-1");
    });

    it("should get technology experience correctly", async () => {
      const techExperience = await aboutIntegration.getTechnologyExperience();

      expect(techExperience.length).toBeGreaterThan(0);

      const reactExp = techExperience.find((t) => t.technology === "React");
      expect(reactExp).toBeTruthy();
      expect(reactExp?.projectCount).toBe(1);
      expect(reactExp?.proficiencyLevel).toBeGreaterThan(0);
    });

    it("should get complete about page data", async () => {
      const aboutData = await aboutIntegration.getAboutPageData();

      expect(aboutData).toHaveProperty("skills");
      expect(aboutData).toHaveProperty("clientWork");
      expect(aboutData).toHaveProperty("techExperience");
      expect(aboutData).toHaveProperty("summary");
      expect(aboutData.summary.totalSkills).toBeGreaterThan(0);
    });
  });

  describe("SEOIntegration", () => {
    it("should generate sitemap entries correctly", async () => {
      const sitemapEntries = await seoIntegration.generateSitemapEntries();

      expect(sitemapEntries.length).toBeGreaterThan(10); // Static pages + dynamic pages

      const portfolioEntry = sitemapEntries.find((e) =>
        e.url.endsWith("/portfolio"),
      );
      expect(portfolioEntry).toBeTruthy();
      expect(portfolioEntry?.priority).toBe(1.0);

      const dynamicEntry = sitemapEntries.find((e) =>
        e.url.endsWith("/portfolio/project-1"),
      );
      expect(dynamicEntry).toBeTruthy();
    });

    it("should generate Next.js sitemap correctly", async () => {
      const nextSitemap = await seoIntegration.generateNextSitemap();

      expect(Array.isArray(nextSitemap)).toBe(true);
      expect(nextSitemap.length).toBeGreaterThan(0);
      expect(nextSitemap[0]).toHaveProperty("url");
      expect(nextSitemap[0]).toHaveProperty("lastModified");
      expect(nextSitemap[0]).toHaveProperty("changeFrequency");
      expect(nextSitemap[0]).toHaveProperty("priority");
    });

    it("should generate meta tags correctly", async () => {
      const metaTags = await seoIntegration.updateMetaTags("detail", {
        item: mockPortfolioItems[0],
      });

      expect(metaTags).toHaveProperty("title");
      expect(metaTags).toHaveProperty("description");
      expect(metaTags).toHaveProperty("keywords");
      expect(metaTags).toHaveProperty("canonical");
      expect(metaTags).toHaveProperty("openGraph");
      expect(metaTags).toHaveProperty("twitter");
      expect(metaTags).toHaveProperty("structuredData");

      expect(metaTags.title).toContain("React Portfolio Website");
      expect(metaTags.canonical).toContain("/portfolio/project-1");
    });

    it("should generate structured data correctly", async () => {
      const structuredData = await seoIntegration.generateStructuredData(
        mockPortfolioItems[0],
      );

      expect(structuredData).toHaveProperty("@context", "https://schema.org");
      expect(structuredData).toHaveProperty("@type");
      expect(structuredData).toHaveProperty("name", "React Portfolio Website");
      expect(structuredData).toHaveProperty("creator");
    });
  });

  describe("AnalyticsIntegration", () => {
    it("should track portfolio view correctly", () => {
      const mockGtag = jest.fn();
      (window as unknown as { gtag: jest.Mock }).gtag = mockGtag;

      analyticsIntegration.trackPortfolioView("project-1", {
        source: "gallery",
      });

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "portfolio_view",
        expect.objectContaining({
          event_category: "portfolio",
          event_label: "project-1",
        }),
      );
    });

    it("should track gallery interaction correctly", () => {
      const mockGtag = jest.fn();
      (window as unknown as { gtag: jest.Mock }).gtag = mockGtag;

      analyticsIntegration.trackGalleryInteraction(
        "all",
        "filter",
        "project-1",
      );

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "gallery_interaction",
        expect.objectContaining({
          event_category: "portfolio",
        }),
      );
    });

    it("should generate analytics report correctly", async () => {
      const report = await analyticsIntegration.generatePortfolioReport();

      expect(report).toHaveProperty("summary");
      expect(report).toHaveProperty("timeRange");
      expect(report).toHaveProperty("trends");
      expect(report.summary).toHaveProperty("totalPageViews");
      expect(report.summary).toHaveProperty("topItems");
      expect(report.summary).toHaveProperty("topCategories");
    });

    it("should get real-time stats correctly", async () => {
      const realTimeStats = await analyticsIntegration.getRealTimeStats();

      expect(realTimeStats).toHaveProperty("activeUsers");
      expect(realTimeStats).toHaveProperty("currentPageViews");
      expect(realTimeStats).toHaveProperty("recentInteractions");
      expect(typeof realTimeStats.activeUsers).toBe("number");
    });
  });

  describe("PortfolioIntegrationManager", () => {
    it("should initialize correctly", async () => {
      await expect(integrationManager.initialize()).resolves.not.toThrow();
    });

    it("should get dashboard data correctly", async () => {
      const dashboardData = await integrationManager.getDashboardData();

      expect(dashboardData).toHaveProperty("homePage");
      expect(dashboardData).toHaveProperty("search");
      expect(dashboardData).toHaveProperty("about");
      expect(dashboardData).toHaveProperty("analytics");
      expect(dashboardData).toHaveProperty("lastUpdated");
    });

    it("should get item integration data correctly", async () => {
      const itemData =
        await integrationManager.getItemIntegrationData("project-1");

      expect(itemData).toHaveProperty("item");
      expect(itemData).toHaveProperty("seo");
      expect(itemData).toHaveProperty("structuredData");
      expect(itemData).toHaveProperty("relatedItems");
      expect(itemData).toHaveProperty("skillsUsed");
      expect(itemData?.item.id).toBe("project-1");
    });

    it("should perform health check correctly", async () => {
      const healthCheck = await integrationManager.healthCheck();

      expect(healthCheck).toHaveProperty("status");
      expect(healthCheck).toHaveProperty("checks");
      expect(["healthy", "degraded", "unhealthy"]).toContain(
        healthCheck.status,
      );
      expect(healthCheck.checks).toHaveProperty("dataManager");
      expect(healthCheck.checks).toHaveProperty("search");
      expect(healthCheck.checks).toHaveProperty("seo");
      expect(healthCheck.checks).toHaveProperty("about");
      expect(healthCheck.checks).toHaveProperty("homePage");
    });

    it("should refresh all integrations correctly", async () => {
      await expect(
        integrationManager.refreshAllIntegrations(),
      ).resolves.not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle data manager errors gracefully", async () => {
      const errorDataManager = {
        getAllItems: jest
          .fn()
          .mockRejectedValue(new Error("Data fetch failed")),
      } as unknown as MockPortfolioDataManager;

      const errorHomeIntegration = new HomePageIntegration(errorDataManager);
      const result = await errorHomeIntegration.getFeaturedProjects();

      expect(result).toEqual([]);
    });

    it("should handle search errors gracefully", async () => {
      const errorDataManager = {
        getAllItems: jest.fn().mockRejectedValue(new Error("Search failed")),
      } as unknown as MockPortfolioDataManager;

      const errorSearchIntegration = new SearchIntegration(errorDataManager);
      const result = await errorSearchIntegration.searchPortfolioItems("test");

      expect(result).toEqual([]);
    });

    it("should handle SEO generation errors gracefully", async () => {
      const errorDataManager = {
        getAllItems: jest
          .fn()
          .mockRejectedValue(new Error("SEO generation failed")),
      } as unknown as MockPortfolioDataManager;

      const errorSEOIntegration = new SEOIntegration(errorDataManager);
      const result = await errorSEOIntegration.generateSitemapEntries();

      expect(result).toEqual([]);
    });
  });

  describe("Performance", () => {
    it("should handle large datasets efficiently", async () => {
      // Create a large mock dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPortfolioItems[0],
        id: `project-${i}`,
        title: `Project ${i}`,
      }));

      const largeDataManager = {
        getAllItems: jest.fn().mockResolvedValue(largeDataset),
      } as unknown as MockPortfolioDataManager;

      const searchIntegration = new SearchIntegration(largeDataManager);

      const startTime = Date.now();
      const searchIndex = await searchIntegration.generateSearchIndex();
      const endTime = Date.now();

      expect(searchIndex).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
