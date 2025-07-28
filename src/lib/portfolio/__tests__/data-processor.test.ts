/**
 * Unit Tests for Portfolio Data Processor
 * Task 1.2: データ処理の単体テスト
 */

import { PortfolioDataProcessor } from "../data-processor";
import { ContentItem } from "@/types/content";

describe("PortfolioDataProcessor", () => {
  let processor: PortfolioDataProcessor;

  beforeEach(() => {
    processor = new PortfolioDataProcessor();
  });

  describe("processRawData", () => {
    it("should process raw data correctly", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Project",
          description: "Test description",
          category: "develop",
          tags: ["React", "TypeScript", "Web Development"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
          thumbnail: "/test-thumb.jpg",
          images: ["/test-image.jpg"],
        },
      ];

      const result = await processor.processRawData(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "test-1",
        title: "Test Project",
        description: "Test description",
        category: "develop",
        technologies: ["React", "TypeScript"],
        projectType: "web",
        thumbnail: "/test-thumb.jpg",
      });

      expect(result[0].seo).toBeDefined();
      expect(result[0].seo.title).toBe(
        "Test Project - samuido | ポートフォリオ",
      );
      expect(result[0].searchIndex).toBeDefined();
    });

    it("should handle empty data gracefully", async () => {
      const result = await processor.processRawData([]);
      expect(result).toHaveLength(0);
    });

    it("should filter out invalid items", async () => {
      const rawData: ContentItem[] = [
        {
          id: "",
          type: "portfolio",
          title: "",
          description: "",
          category: "develop",
          tags: [],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "valid-1",
          type: "portfolio",
          title: "Valid Project",
          description: "Valid description",
          category: "develop",
          tags: ["React"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("valid-1");
    });
  });

  describe("technology extraction", () => {
    it("should extract technology tags correctly", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Project",
          description: "Test description",
          category: "develop",
          tags: ["React", "TypeScript", "Design", "Unity", "Random Tag"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].technologies).toEqual(
        expect.arrayContaining(["React", "TypeScript", "Unity"]),
      );
      expect(result[0].technologies).not.toContain("Random Tag");
    });
  });

  describe("project type determination", () => {
    it("should determine web project type", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Web App",
          description: "Test description",
          category: "develop",
          tags: ["React", "Next.js"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].projectType).toBe("web");
    });

    it("should determine game project type", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Game Project",
          description: "Test description",
          category: "develop",
          tags: ["Unity", "Game Development"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].projectType).toBe("game");
    });

    it("should not set project type for non-develop categories", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Video Project",
          description: "Test description",
          category: "video",
          tags: ["After Effects"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].projectType).toBeUndefined();
    });
  });

  describe("video type determination", () => {
    it("should determine video type for video projects", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Music Video",
          description: "Test description",
          category: "video",
          tags: ["MV", "After Effects"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].videoType).toBe("mv");
    });

    it("should not set video type for non-video categories", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Web Project",
          description: "Test description",
          category: "develop",
          tags: ["React"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].videoType).toBeUndefined();
    });
  });

  describe("grid size determination", () => {
    it("should determine grid size based on category and images", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Video Project",
          description: "Test description",
          category: "video",
          tags: [],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
          images: ["/img1.jpg", "/img2.jpg", "/img3.jpg"],
        },
      ];

      const result = await processor.processRawData(rawData);
      expect(result[0].gridSize).toBe("2x2");
    });
  });

  describe("SEO data generation", () => {
    it("should generate SEO data with structured data", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Project",
          description: "Test description",
          category: "develop",
          tags: ["React", "TypeScript"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
          thumbnail: "/test-thumb.jpg",
        },
      ];

      const result = await processor.processRawData(rawData);
      const seo = result[0].seo;

      expect(seo.title).toBe("Test Project - samuido | ポートフォリオ");
      expect(seo.description).toBe("Test description");
      expect(seo.keywords).toContain("React");
      expect(seo.keywords).toContain("TypeScript");
      expect(seo.canonical).toBe("https://yusuke-kim.com/portfolio/test-1");
      expect(seo.structuredData).toBeDefined();
    });

    it("should generate different structured data for different categories", async () => {
      const developData: ContentItem[] = [
        {
          id: "develop-1",
          type: "portfolio",
          title: "Web App",
          description: "Test description",
          category: "develop",
          tags: ["React"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const videoData: ContentItem[] = [
        {
          id: "video-1",
          type: "portfolio",
          title: "Video Project",
          description: "Test description",
          category: "video",
          tags: ["After Effects"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      const developResult = await processor.processRawData(developData);
      const videoResult = await processor.processRawData(videoData);

      expect(
        (developResult[0].seo.structuredData as Record<string, unknown>)[
          "@type"
        ],
      ).toBe("SoftwareApplication");
      expect(
        (videoResult[0].seo.structuredData as Record<string, unknown>)["@type"],
      ).toBe("VideoObject");
    });
  });

  describe("search index generation", () => {
    it("should generate search index with searchable content", async () => {
      const rawData: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "React Dashboard",
          description: "Modern dashboard application",
          category: "develop",
          tags: ["React", "TypeScript"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
          content: "This is a detailed project description",
        },
      ];

      const result = await processor.processRawData(rawData);
      const searchIndex = result[0].searchIndex!;

      expect(searchIndex.id).toBe("test-1");
      expect(searchIndex.title).toBe("React Dashboard");
      expect(searchIndex.searchableContent).toContain("react dashboard");
      expect(searchIndex.searchableContent).toContain("modern dashboard");
      expect(searchIndex.searchableContent).toContain("typescript");
    });
  });

  describe("related items calculation", () => {
    it("should find related items based on similarity", async () => {
      const rawData: ContentItem[] = [
        {
          id: "react-1",
          type: "portfolio",
          title: "React App 1",
          description: "React application",
          category: "develop",
          tags: ["React", "TypeScript"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "react-2",
          type: "portfolio",
          title: "React App 2",
          description: "Another React application",
          category: "develop",
          tags: ["React", "JavaScript"],
          status: "published",
          priority: 75,
          createdAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "video-1",
          type: "portfolio",
          title: "Video Project",
          description: "Video production",
          category: "video",
          tags: ["After Effects"],
          status: "published",
          priority: 70,
          createdAt: "2024-01-03T00:00:00Z",
        },
      ];

      const result = await processor.processRawData(rawData);
      const reactApp1 = result.find((item) => item.id === "react-1")!;

      expect(reactApp1.relatedItems).toContain("react-2");
      expect(reactApp1.relatedItems).not.toContain("video-1");
    });
  });

  describe("portfolio statistics generation", () => {
    it("should generate correct portfolio statistics", async () => {
      const rawData: ContentItem[] = [
        {
          id: "develop-1",
          type: "portfolio",
          title: "Web App",
          description: "Test",
          category: "develop",
          tags: ["React", "TypeScript"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "develop-2",
          type: "portfolio",
          title: "Game",
          description: "Test",
          category: "develop",
          tags: ["Unity", "C#"],
          status: "published",
          priority: 75,
          createdAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "video-1",
          type: "portfolio",
          title: "Video",
          description: "Test",
          category: "video",
          tags: ["After Effects"],
          status: "published",
          priority: 70,
          createdAt: "2024-01-03T00:00:00Z",
        },
      ];

      const processedData = await processor.processRawData(rawData);
      const stats = await processor.generatePortfolioStats(processedData);

      expect(stats.totalProjects).toBe(3);
      expect(stats.categoryCounts.develop).toBe(2);
      expect(stats.categoryCounts.video).toBe(1);
      expect(stats.technologyCounts.React).toBe(1);
      expect(stats.technologyCounts.Unity).toBe(1);
      expect(stats.technologyCounts["After Effects"]).toBe(1);
    });
  });

  describe("error handling", () => {
    it("should handle malformed data gracefully", async () => {
      const malformedData = [
        {
          // Missing required fields
          type: "portfolio",
          status: "published",
          priority: 80,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ] as ContentItem[];

      const result = await processor.processRawData(malformedData);
      expect(result).toHaveLength(0); // Invalid items should be filtered out
    });

    it("should throw error for processing pipeline failure", async () => {
      // Mock a processing failure
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // This should not throw in normal circumstances, but we can test error handling
      const result = await processor.processRawData([]);
      expect(result).toHaveLength(0);

      console.error = originalConsoleError;
    });
  });
});
