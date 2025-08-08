/**
 * Integration System Tests
 * Task 1.3: 他ページ連携システムの実装
 */

import { PortfolioContentItem } from "../../../types/portfolio";
import { PortfolioDataManager } from "../data-manager";
import { PortfolioIntegrationManager } from "../integration-manager";
import {
  AboutIntegration,
  AnalyticsIntegration,
  HomePageIntegration,
  SearchIntegration,
  SEOIntegration,
} from "../integrations";

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

const mockDataManager = {
  getPortfolioData: jest.fn().mockResolvedValue(mockPortfolioItems),
  getPortfolioStats: jest.fn().mockResolvedValue({
    totalProjects: 3,
    categoryCounts: { develop: 1, video: 1, "video&design": 1 },
    technologyCounts: { React: 1, "After Effects": 1, Figma: 1 },
    lastUpdate: new Date(),
  }),
  getFeaturedProjects: jest
    .fn()
    .mockResolvedValue(mockPortfolioItems.slice(0, 3)),
  getSearchFilters: jest.fn().mockResolvedValue([
    { type: "category", value: "develop", label: "Develop", count: 1 },
    { type: "category", value: "video", label: "Video", count: 1 },
    {
      type: "category",
      value: "video&design",
      label: "Video & Design",
      count: 1,
    },
    { type: "technology", value: "React", label: "React", count: 1 },
  ]),
  generateSearchIndex: jest
    .fn()
    .mockReturnValue(
      mockPortfolioItems.map((item) => ({ ...item, searchableText: "" })),
    ),
  searchPortfolioItems: jest.fn().mockImplementation(async (query) => {
    if (query === "React") {
      return [
        {
          item: mockPortfolioItems[0],
          score: 1,
          matchedFields: ["technologies"],
        },
      ];
    }
    return [];
  }),
  getItemById: jest.fn().mockImplementation(async (id) => {
    return mockPortfolioItems.find((item) => item.id === id) || null;
  }),
  getAboutPageData: jest.fn().mockResolvedValue({}),
  getSitemapEntries: jest.fn().mockResolvedValue(
    mockPortfolioItems.map((item) => ({
      url: `/portfolio/${item.id}`,
      lastModified: new Date(),
    })),
  ),
  updateMetaTags: jest.fn().mockResolvedValue({}),
  trackPortfolioView: jest.fn(),
  getDashboardData: jest.fn().mockResolvedValue({}),
} as unknown as PortfolioDataManager;

describe("Portfolio Integration System", () => {
  let homePageIntegration: HomePageIntegration;
  let searchIntegration: SearchIntegration;
  let aboutIntegration: AboutIntegration;
  let seoIntegration: SEOIntegration;
  let analyticsIntegration: AnalyticsIntegration;
  let integrationManager: PortfolioIntegrationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    (mockDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
      mockPortfolioItems,
    );
    (mockDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
      totalProjects: 3,
      categoryCounts: { develop: 1, video: 1, "video&design": 1 },
      technologyCounts: { React: 1, "After Effects": 1, Figma: 1 },
      lastUpdate: new Date(),
    });
    (mockDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
      mockPortfolioItems.slice(0, 3),
    );

    homePageIntegration = new HomePageIntegration(mockDataManager);
    searchIntegration = new SearchIntegration(mockDataManager);
    aboutIntegration = new AboutIntegration(mockDataManager);
    seoIntegration = new SEOIntegration(mockDataManager);
    analyticsIntegration = new AnalyticsIntegration(mockDataManager);
    integrationManager = new PortfolioIntegrationManager(
      mockDataManager as PortfolioDataManager,
    );
  });

  describe("HomePageIntegration", () => {
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
    });

    it("should search portfolio items correctly", async () => {
      const results = await searchIntegration.searchPortfolioItems("React");

      expect(results).toHaveLength(1);
      expect(results[0].item.id).toBe("project-1");
    });
  });

  describe("AboutIntegration", () => {
    it("should get complete about page data", async () => {
      const aboutData = await aboutIntegration.getAboutData();

      expect(aboutData).toHaveProperty("skills");
      expect(aboutData).toHaveProperty("clientWork");
      expect(aboutData).toHaveProperty("summary");
    });
  });

  describe("SEOIntegration", () => {
    it("should generate sitemap entries correctly", async () => {
      const sitemapEntries = await seoIntegration.generateSitemapEntries();

      expect(sitemapEntries.length).toBe(3);
    });

    it("should generate meta tags correctly", async () => {
      const metaTags = await seoIntegration.updateMetaTags("detail", {
        item: mockPortfolioItems[0],
      });

      expect(metaTags).toHaveProperty("title");
      expect(metaTags.title).toContain("React Portfolio Website");
    });
  });

  describe("AnalyticsIntegration", () => {
    it("should track portfolio view correctly", () => {
      analyticsIntegration.trackPortfolioView("project-1");
    });
  });

  describe("PortfolioIntegrationManager", () => {
    it("should get dashboard data correctly", async () => {
      const dashboardData = await integrationManager.getDashboardData();

      expect(dashboardData).toHaveProperty("homePage");
      expect(dashboardData).toHaveProperty("search");
      expect(dashboardData).toHaveProperty("about");
    });
  });
});
