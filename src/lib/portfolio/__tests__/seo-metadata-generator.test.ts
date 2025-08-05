/**
 * Tests for Portfolio SEO Metadata Generator
 * Ensures proper metadata generation for all portfolio pages
 */

import { PortfolioContentItem } from "@/types/portfolio";
import { PortfolioDataManager } from "../data-manager";
import { PortfolioSEOMetadataGenerator } from "../seo-metadata-generator";

// Mock portfolio data manager
const mockDataManager = {
  getPortfolioStats: jest.fn(),
  getFeaturedProjects: jest.fn(),
  getPortfolioItemsByCategory: jest.fn(),
  getItemById: jest.fn(),
} as unknown as PortfolioDataManager;

// Mock portfolio item
const mockPortfolioItem: PortfolioContentItem = {
  id: "test-portfolio-item",
  type: "portfolio",
  title: "Test Portfolio Item",
  description: "This is a test portfolio item for SEO metadata generation",
  category: "develop",
  tags: ["React", "TypeScript", "Next.js"],
  technologies: ["React", "TypeScript", "Next.js"],
  thumbnail: "/images/test-thumbnail.jpg",
  images: ["/images/test-image-1.jpg", "/images/test-image-2.jpg"],
  status: "published",
  priority: 80,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
  publishedAt: "2024-01-01T00:00:00Z",
  content: "Detailed content about the portfolio item",
  repository: {
    url: "https://github.com/test/repo",
    title: "Test Repository",
    type: "github",
  },
  seo: {
    title: "Test Portfolio Item | Portfolio | samuido",
    description: "This is a test portfolio item for SEO metadata generation",
    keywords: ["React", "TypeScript", "Next.js"],
    ogImage: "/images/test-og.jpg",
    twitterImage: "/images/test-twitter.jpg",
    canonical: "https://yusuke-kim.com/portfolio/test-portfolio-item",
    structuredData: {},
  },
};

describe("PortfolioSEOMetadataGenerator", () => {
  let seoGenerator: PortfolioSEOMetadataGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    seoGenerator = new PortfolioSEOMetadataGenerator(mockDataManager);
  });

  describe("generatePortfolioTopMetadata", () => {
    beforeEach(() => {
      (mockDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
        totalProjects: 10,
        categoryCounts: { develop: 5, video: 3, design: 2 },
        technologyCounts: { React: 5, "After Effects": 3, Unity: 2 },
      });

      (mockDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue([
        mockPortfolioItem,
      ]);
    });

    it("should generate metadata for portfolio top page", async () => {
      const result = await seoGenerator.generatePortfolioTopMetadata();

      expect(result.metadata.title).toContain("Portfolio");
      expect(result.metadata.title).toContain("samuido");
      expect(result.metadata.description).toContain("10件のプロジェクト");
      expect(result.metadata.keywords).toContain("ポートフォリオ");
      expect(result.metadata.keywords).toContain("React");
      expect(result.metadata.openGraph?.title).toBeDefined();
      expect(result.metadata.twitter).toHaveProperty(
        "card",
        "summary_large_image",
      );
    });

    it("should generate structured data for portfolio top page", async () => {
      const result = await seoGenerator.generatePortfolioTopMetadata();

      expect(result.structuredData).toHaveProperty(
        "@context",
        "https://schema.org",
      );
      expect(result.structuredData).toHaveProperty("@type", "CollectionPage");
      expect(result.structuredData).toHaveProperty("name", "samuido Portfolio");
      expect(result.structuredData).toHaveProperty("creator");
      expect(result.structuredData).toHaveProperty("mainEntity");
    });

    it("should handle errors gracefully", async () => {
      (mockDataManager.getPortfolioStats as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await seoGenerator.generatePortfolioTopMetadata();

      expect(result.metadata.title).toContain("ポートフォリオ");
      expect(result.structuredData).toHaveProperty("@context");
    });
  });

  describe("generateGalleryMetadata", () => {
    beforeEach(() => {
      (
        mockDataManager.getPortfolioItemsByCategory as jest.Mock
      ).mockResolvedValue([mockPortfolioItem]);
    });

    it("should generate metadata for develop gallery", async () => {
      const result = await seoGenerator.generateGalleryMetadata("develop");

      expect(result.metadata.title).toContain("開発");
      expect(result.metadata.description).toContain("Webアプリケーション");
      expect(result.metadata.keywords).toContain("React");
      expect(result.metadata.alternates?.canonical).toContain(
        "/portfolio/gallery/develop",
      );
    });

    it("should generate metadata for video gallery", async () => {
      const result = await seoGenerator.generateGalleryMetadata("video");

      expect(result.metadata.title).toContain("映像");
      expect(result.metadata.description).toContain("ミュージックビデオ");
      expect(result.metadata.keywords).toContain("After Effects");
    });

    it("should generate metadata for video&design gallery", async () => {
      const result = await seoGenerator.generateGalleryMetadata("video&design");

      expect(result.metadata.title).toContain("映像・デザイン");
      expect(result.metadata.description).toContain("映像制作とデザイン");
      expect(result.metadata.keywords).toContain("デザイン");
    });

    it("should generate structured data with breadcrumb", async () => {
      const result = await seoGenerator.generateGalleryMetadata("develop");

      expect(result.structuredData).toHaveProperty("@type", "CollectionPage");
      expect(result.structuredData).toHaveProperty("breadcrumb");
      expect(result.structuredData).toHaveProperty("mainEntity");
    });

    it("should handle unknown category", async () => {
      const result = await seoGenerator.generateGalleryMetadata("unknown");

      expect(result.metadata.title).toContain("All Projects");
      expect(result.metadata.description).toContain(
        "Web開発、映像制作、デザイン",
      );
    });
  });

  describe("generateDetailMetadata", () => {
    it("should generate metadata for portfolio detail page", async () => {
      const result =
        await seoGenerator.generateDetailMetadata(mockPortfolioItem);

      expect(result.metadata.title).toBe(
        "Test Portfolio Item | ポートフォリオ | samuido",
      );
      expect(result.metadata.description).toBe(mockPortfolioItem.description);
      expect(result.metadata.keywords).toContain("Test Portfolio Item");
      expect(result.metadata.keywords).toContain("develop");
      expect(result.metadata.keywords).toContain("React");
      expect(result.metadata.alternates?.canonical).toContain(
        "/portfolio/test-portfolio-item",
      );
    });

    it("should generate OpenGraph metadata", async () => {
      const result =
        await seoGenerator.generateDetailMetadata(mockPortfolioItem);

      expect(result.metadata.openGraph?.title).toBe("Test Portfolio Item");
      expect(result.metadata.openGraph).toHaveProperty("type", "article");
      expect(result.metadata.openGraph?.images).toBeDefined();
    });

    it("should generate Twitter Card metadata", async () => {
      const result =
        await seoGenerator.generateDetailMetadata(mockPortfolioItem);

      expect(result.metadata.twitter).toHaveProperty(
        "card",
        "summary_large_image",
      );
      expect(result.metadata.twitter?.title).toBe("Test Portfolio Item");
      expect(result.metadata.twitter).toHaveProperty("creator", "@361do_sleep");
    });

    it("should generate category-specific structured data for development", async () => {
      const result =
        await seoGenerator.generateDetailMetadata(mockPortfolioItem);

      expect(result.structuredData).toHaveProperty(
        "@type",
        "SoftwareApplication",
      );
      expect(result.structuredData).toHaveProperty(
        "applicationCategory",
        "WebApplication",
      );
      expect(result.structuredData).toHaveProperty("programmingLanguage");
      expect(result.structuredData).toHaveProperty("codeRepository");
    });

    it("should generate category-specific structured data for video", async () => {
      const videoItem = {
        ...mockPortfolioItem,
        category: "video",
        duration: 120,
        videos: [
          { url: "https://youtube.com/watch?v=test", type: "youtube" as const },
        ],
      };

      const result = await seoGenerator.generateDetailMetadata(videoItem);

      expect(result.structuredData).toHaveProperty("@type", "VideoObject");
      expect(result.structuredData).toHaveProperty("duration", "PT120S");
      expect(result.structuredData).toHaveProperty("embedUrl");
    });

    it("should generate category-specific structured data for design", async () => {
      const designItem = { ...mockPortfolioItem, category: "design" };

      const result = await seoGenerator.generateDetailMetadata(designItem);

      expect(result.structuredData).toHaveProperty("@type", "VisualArtwork");
      expect(result.structuredData).toHaveProperty(
        "artMedium",
        "Digital Design",
      );
    });
  });

  describe("generatePlaygroundMetadata", () => {
    it("should generate metadata for design playground", async () => {
      const result = await seoGenerator.generatePlaygroundMetadata("design");

      expect(result.metadata.title).toContain("デザイン実験");
      expect(result.metadata.description).toContain("インタラクティブデザイン");
      expect(result.metadata.keywords).toContain("インタラクティブ");
      expect(result.metadata.alternates?.canonical).toContain(
        "/portfolio/playground/design",
      );
    });

    it("should generate metadata for WebGL playground", async () => {
      const result = await seoGenerator.generatePlaygroundMetadata("WebGL");

      expect(result.metadata.title).toContain("WebGL実験");
      expect(result.metadata.description).toContain("3Dグラフィックス");
      expect(result.metadata.keywords).toContain("WebGL");
      expect(result.metadata.keywords).toContain("Three.js");
    });

    it("should generate structured data with features", async () => {
      const result = await seoGenerator.generatePlaygroundMetadata("design");

      expect(result.structuredData).toHaveProperty("@type", "WebPage");
      expect(result.structuredData).toHaveProperty("mainEntity");
      expect(result.structuredData).toHaveProperty("breadcrumb");

      const mainEntity = (result.structuredData as Record<string, unknown>)
        .mainEntity;
      expect(mainEntity).toHaveProperty("@type", "SoftwareApplication");
      expect(mainEntity).toHaveProperty("featureList");
    });

    it("should handle unknown playground type", async () => {
      const result = await seoGenerator.generatePlaygroundMetadata("unknown");

      expect(result.metadata.title).toContain("デザイン実験");
      expect(result.metadata.description).toContain("インタラクティブデザイン");
    });
  });

  describe("configuration", () => {
    it("should use custom configuration", () => {
      const customConfig = {
        baseUrl: "https://custom.example.com",
        siteName: "Custom Site",
        twitterHandle: "@custom",
        defaultImage: "/custom-image.jpg",
        locale: "en_US",
      };

      const customGenerator = new PortfolioSEOMetadataGenerator(
        mockDataManager,
        customConfig,
      );

      expect(
        (customGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("baseUrl", "https://custom.example.com");
      expect(
        (customGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("siteName", "Custom Site");
      expect(
        (customGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("twitterHandle", "@custom");
    });

    it("should use default configuration when not provided", () => {
      expect(
        (seoGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("baseUrl", "https://yusuke-kim.com");
      expect(
        (seoGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("siteName", "samuido");
      expect(
        (seoGenerator as unknown as Record<string, unknown>).config,
      ).toHaveProperty("twitterHandle", "@361do_sleep");
    });
  });

  describe("error handling", () => {
    it("should handle data manager errors gracefully", async () => {
      (mockDataManager.getPortfolioStats as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const result = await seoGenerator.generatePortfolioTopMetadata();

      expect(result.metadata).toBeDefined();
      expect(result.structuredData).toBeDefined();
      expect(result.metadata.title).toContain("ポートフォリオ");
    });

    it("should handle missing item data gracefully", async () => {
      const incompleteItem = {
        ...mockPortfolioItem,
        thumbnail: "/fallback-image.jpg",
        images: [],
        technologies: [],
        tags: [],
      };

      const result = await seoGenerator.generateDetailMetadata(incompleteItem);

      expect(result.metadata).toBeDefined();
      expect(result.structuredData).toBeDefined();
      expect(result.metadata.title).toContain("Test Portfolio Item");
    });
  });
});
