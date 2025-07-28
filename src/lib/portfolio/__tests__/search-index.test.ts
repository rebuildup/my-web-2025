/**
 * Unit Tests for Portfolio Search Index Generator
 * Task 1.2: 検索インデックス生成機能のテスト
 */

import { PortfolioSearchIndexGenerator } from "../search-index";
import { PortfolioContentItem } from "../data-processor";

describe("PortfolioSearchIndexGenerator", () => {
  let generator: PortfolioSearchIndexGenerator;
  let mockPortfolioItems: PortfolioContentItem[];

  beforeEach(() => {
    generator = new PortfolioSearchIndexGenerator();

    mockPortfolioItems = [
      {
        id: "react-app-1",
        type: "portfolio",
        title: "React Dashboard Application",
        description: "Modern dashboard built with React and TypeScript",
        category: "develop",
        tags: ["React", "TypeScript", "Dashboard"],
        technologies: ["React", "TypeScript"],
        status: "published",
        priority: 90,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        thumbnail: "/thumb1.jpg",
        projectType: "web",
        content:
          "This is a comprehensive dashboard application with real-time data visualization.",
        seo: {
          title: "React Dashboard Application",
          description: "Modern dashboard built with React and TypeScript",
          keywords: ["React", "TypeScript", "Dashboard"],
          ogImage: "/og1.jpg",
          twitterImage: "/twitter1.jpg",
          canonical: "https://yusuke-kim.com/portfolio/react-app-1",
          structuredData: {},
        },
      },
      {
        id: "unity-game-1",
        type: "portfolio",
        title: "Unity 3D Game",
        description: "Action-packed 3D game developed in Unity",
        category: "develop",
        tags: ["Unity", "C#", "3D", "Game"],
        technologies: ["Unity", "C#"],
        status: "published",
        priority: 85,
        createdAt: "2024-02-01T00:00:00Z",
        updatedAt: "2024-02-10T00:00:00Z",
        thumbnail: "/thumb2.jpg",
        projectType: "game",
        content:
          "An immersive 3D action game with advanced physics and AI systems.",
        seo: {
          title: "Unity 3D Game",
          description: "Action-packed 3D game developed in Unity",
          keywords: ["Unity", "C#", "3D", "Game"],
          ogImage: "/og2.jpg",
          twitterImage: "/twitter2.jpg",
          canonical: "https://yusuke-kim.com/portfolio/unity-game-1",
          structuredData: {},
        },
      },
      {
        id: "video-project-1",
        type: "portfolio",
        title: "Motion Graphics Video",
        description: "Corporate promotional video with motion graphics",
        category: "video",
        tags: ["After Effects", "Motion Graphics", "Video"],
        technologies: ["After Effects"],
        status: "published",
        priority: 80,
        createdAt: "2024-03-01T00:00:00Z",
        updatedAt: "2024-03-05T00:00:00Z",
        thumbnail: "/thumb3.jpg",
        videoType: "promotion",
        content:
          "A visually stunning promotional video featuring advanced motion graphics techniques.",
        seo: {
          title: "Motion Graphics Video",
          description: "Corporate promotional video with motion graphics",
          keywords: ["After Effects", "Motion Graphics", "Video"],
          ogImage: "/og3.jpg",
          twitterImage: "/twitter3.jpg",
          canonical: "https://yusuke-kim.com/portfolio/video-project-1",
          structuredData: {},
        },
      },
    ];
  });

  describe("generateSearchIndex", () => {
    it("should generate search index for all portfolio items", () => {
      const searchIndex = generator.generateSearchIndex(mockPortfolioItems);

      expect(searchIndex).toHaveLength(3);

      const reactItem = searchIndex.find((item) => item.id === "react-app-1")!;
      expect(reactItem.title).toBe("React Dashboard Application");
      expect(reactItem.technologies).toEqual(["React", "TypeScript"]);
      expect(reactItem.projectType).toBe("web");
      expect(reactItem.searchableContent).toContain("react dashboard");
      expect(reactItem.searchableContent).toContain("typescript");
    });

    it("should create comprehensive searchable content", () => {
      const searchIndex = generator.generateSearchIndex(mockPortfolioItems);
      const reactItem = searchIndex.find((item) => item.id === "react-app-1")!;

      expect(reactItem.searchableContent).toContain(
        "react dashboard application",
      );
      expect(reactItem.searchableContent).toContain("modern dashboard built");
      expect(reactItem.searchableContent).toContain(
        "comprehensive dashboard application",
      );
      expect(reactItem.searchableContent).toContain("react");
      expect(reactItem.searchableContent).toContain("typescript");
      expect(reactItem.searchableContent).toContain("develop");
    });

    it("should normalize searchable content properly", () => {
      const searchIndex = generator.generateSearchIndex(mockPortfolioItems);
      const item = searchIndex[0];

      // Should be lowercase
      expect(item.searchableContent).toBe(item.searchableContent.toLowerCase());

      // Should not contain special characters
      expect(item.searchableContent).not.toMatch(/[^\w\s]/);

      // Should have normalized whitespace
      expect(item.searchableContent).not.toMatch(/\s{2,}/);
    });
  });

  describe("searchPortfolioItems", () => {
    let searchIndex: ReturnType<typeof generator.generateSearchIndex>;

    beforeEach(() => {
      searchIndex = generator.generateSearchIndex(mockPortfolioItems);
    });

    it("should return all items when no query is provided", () => {
      const results = generator.searchPortfolioItems("", searchIndex);

      expect(results).toHaveLength(3);
      // Should be sorted by priority
      expect(results[0].id).toBe("react-app-1"); // priority 90
      expect(results[1].id).toBe("unity-game-1"); // priority 85
      expect(results[2].id).toBe("video-project-1"); // priority 80
    });

    it("should search by title with high score", () => {
      const results = generator.searchPortfolioItems(
        "React Dashboard",
        searchIndex,
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("react-app-1");
      expect(results[0].score).toBeGreaterThan(3.0); // Title match should have high score
    });

    it("should search by technology with high score", () => {
      const results = generator.searchPortfolioItems("Unity", searchIndex);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("unity-game-1");
      expect(results[0].score).toBeGreaterThan(2.0); // Technology match should have high score
    });

    it("should search by category", () => {
      const results = generator.searchPortfolioItems("develop", searchIndex);

      expect(results.length).toBe(2); // Two develop items
      expect(
        results.every(
          (r) =>
            mockPortfolioItems.find((item) => item.id === r.id)?.category ===
            "develop",
        ),
      ).toBe(true);
    });

    it("should search by content", () => {
      const results = generator.searchPortfolioItems(
        "visualization",
        searchIndex,
        {
          includeContent: true,
        },
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("react-app-1"); // Contains "visualization" in content
    });

    it("should apply category filter", () => {
      const results = generator.searchPortfolioItems("", searchIndex, {
        category: "video",
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("video-project-1");
    });

    it("should apply limit", () => {
      const results = generator.searchPortfolioItems("", searchIndex, {
        limit: 2,
      });

      expect(results).toHaveLength(2);
    });

    it("should generate highlights for search results", () => {
      const results = generator.searchPortfolioItems(
        "React TypeScript",
        searchIndex,
      );

      expect(results.length).toBeGreaterThan(0);
      const reactResult = results.find((r) => r.id === "react-app-1")!;
      expect(reactResult.highlights.length).toBeGreaterThan(0);
      expect(reactResult.highlights.some((h) => h.includes("<mark>"))).toBe(
        true,
      );
    });

    it("should boost recent items", () => {
      // Create items with different update dates
      const recentItem: PortfolioContentItem = {
        ...mockPortfolioItems[0],
        id: "recent-item",
        updatedAt: new Date().toISOString(), // Very recent
        priority: 50, // Lower priority
      };

      const oldItem: PortfolioContentItem = {
        ...mockPortfolioItems[0],
        id: "old-item",
        updatedAt: "2020-01-01T00:00:00Z", // Very old
        priority: 60, // Higher priority
      };

      const testItems = [recentItem, oldItem];
      const testIndex = generator.generateSearchIndex(testItems);
      const results = generator.searchPortfolioItems("React", testIndex);

      // Recent item should score higher despite lower priority
      expect(results[0].id).toBe("recent-item");
    });
  });

  describe("generateSearchFilters", () => {
    let searchIndex: ReturnType<typeof generator.generateSearchIndex>;

    beforeEach(() => {
      searchIndex = generator.generateSearchIndex(mockPortfolioItems);
    });

    it("should generate category filters", () => {
      const filters = generator.generateSearchFilters(searchIndex);
      const categoryFilter = filters.find((f) => f.type === "category");
      expect(categoryFilter).toBeDefined();
      expect(categoryFilter!.options.length).toBeGreaterThan(0);

      const developOption = categoryFilter!.options.find(
        (o) => o.value === "develop",
      );
      expect(developOption).toBeDefined();
      expect(developOption!.count).toBe(2);
      expect(developOption!.label).toBe("開発");

      const videoOption = categoryFilter!.options.find(
        (o) => o.value === "video",
      );
      expect(videoOption).toBeDefined();
      expect(videoOption!.count).toBe(1);
      expect(videoOption!.label).toBe("映像");
    });

    it("should generate technology filters", () => {
      const filters = generator.generateSearchFilters(searchIndex);
      const technologyFilter = filters.find((f) => f.type === "technology");

      expect(technologyFilter).toBeDefined();
      expect(technologyFilter!.options.length).toBeGreaterThan(0);

      const reactOption = technologyFilter!.options.find(
        (o) => o.value === "React",
      );
      expect(reactOption).toBeDefined();
      expect(reactOption!.count).toBe(1);

      const unityOption = technologyFilter!.options.find(
        (o) => o.value === "Unity",
      );
      expect(unityOption).toBeDefined();
      expect(unityOption!.count).toBe(1);
    });

    it("should generate year filters", () => {
      const filters = generator.generateSearchFilters(searchIndex);
      const yearFilter = filters.find((f) => f.type === "year");

      expect(yearFilter).toBeDefined();
      expect(yearFilter!.options.length).toBeGreaterThan(0);

      const year2024Option = yearFilter!.options.find(
        (o) => o.value === "2024",
      );
      expect(year2024Option).toBeDefined();
      expect(year2024Option!.count).toBe(3); // All items are from 2024
      expect(year2024Option!.label).toBe("2024年");
    });

    it("should sort technology filters by count", () => {
      // Add more items to test sorting
      const additionalItems: PortfolioContentItem[] = [
        {
          ...mockPortfolioItems[0],
          id: "react-2",
          technologies: ["React", "JavaScript"],
        },
        {
          ...mockPortfolioItems[0],
          id: "react-3",
          technologies: ["React", "Node.js"],
        },
      ];

      const allItems = [...mockPortfolioItems, ...additionalItems];
      const allIndex = generator.generateSearchIndex(allItems);
      const filters = generator.generateSearchFilters(allIndex);
      const technologyFilter = filters.find((f) => f.type === "technology");

      expect(technologyFilter).toBeDefined();
      // React should be first (appears 3 times)
      expect(technologyFilter!.options[0].value).toBe("React");
      expect(technologyFilter!.options[0].count).toBe(3);
    });

    it("should limit technology filters to top 20", () => {
      const filters = generator.generateSearchFilters(searchIndex);
      const technologyFilter = filters.find((f) => f.type === "technology");

      if (technologyFilter) {
        expect(technologyFilter.options.length).toBeLessThanOrEqual(20);
      }
    });
  });

  describe("generateSearchStats", () => {
    let searchIndex: ReturnType<typeof generator.generateSearchIndex>;

    beforeEach(() => {
      searchIndex = generator.generateSearchIndex(mockPortfolioItems);
    });

    it("should generate correct search statistics", () => {
      const stats = generator.generateSearchStats(searchIndex);

      expect(stats.totalItems).toBe(3);
      expect(stats.categoryDistribution.develop).toBe(2);
      expect(stats.categoryDistribution.video).toBe(1);
      expect(stats.technologyDistribution.React).toBe(1);
      expect(stats.technologyDistribution.Unity).toBe(1);
      expect(stats.technologyDistribution["After Effects"]).toBe(1);
      expect(stats.yearDistribution["2024"]).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("should handle empty search index", () => {
      const results = generator.searchPortfolioItems("test", []);
      expect(results).toHaveLength(0);
    });

    it("should handle items without content", () => {
      const itemsWithoutContent = mockPortfolioItems.map((item) => ({
        ...item,
        content: undefined,
      }));

      const searchIndex = generator.generateSearchIndex(itemsWithoutContent);
      const results = generator.searchPortfolioItems("test", searchIndex);

      expect(results).toBeDefined();
    });

    it("should handle items without technologies", () => {
      const itemsWithoutTech = mockPortfolioItems.map((item) => ({
        ...item,
        technologies: [],
      }));

      const searchIndex = generator.generateSearchIndex(itemsWithoutTech);
      const filters = generator.generateSearchFilters(searchIndex);
      const technologyFilters = filters.filter((f) => f.type === "technology");

      expect(technologyFilters).toHaveLength(0);
    });

    it("should handle special characters in search query", () => {
      const testSearchIndex = generator.generateSearchIndex(mockPortfolioItems);
      const results = generator.searchPortfolioItems(
        "React & TypeScript!",
        testSearchIndex,
      );
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("should handle very long search queries", () => {
      const testSearchIndex = generator.generateSearchIndex(mockPortfolioItems);
      const longQuery =
        "React TypeScript Dashboard Application Modern Development Web Frontend Backend Database API Integration Testing Deployment";
      const results = generator.searchPortfolioItems(
        longQuery,
        testSearchIndex,
      );
      expect(results).toBeDefined();
    });
  });
});
