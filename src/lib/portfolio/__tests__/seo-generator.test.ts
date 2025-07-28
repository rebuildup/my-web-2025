/**
 * Unit Tests for SEO Metadata Generator
 * Task 1.2: SEOメタデータ自動生成のテスト
 */

import { SEOMetadataGenerator } from "../seo-generator";
import { PortfolioContentItem } from "../data-processor";

describe("SEOMetadataGenerator", () => {
  let generator: SEOMetadataGenerator;
  let mockPortfolioItem: PortfolioContentItem;

  beforeEach(() => {
    generator = new SEOMetadataGenerator();

    mockPortfolioItem = {
      id: "test-portfolio-item",
      type: "portfolio",
      title: "React Dashboard Application",
      description:
        "Modern dashboard built with React and TypeScript for data visualization",
      category: "develop",
      tags: ["React", "TypeScript", "Dashboard", "Data Visualization"],
      technologies: ["React", "TypeScript", "Chart.js"],
      status: "published",
      priority: 90,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      publishedAt: "2024-01-01T00:00:00Z",
      thumbnail: "/images/portfolio/react-dashboard-thumb.jpg",
      projectType: "web",
      content: "Detailed project description...",
      seo: {
        title: "React Dashboard Application",
        description: "Modern dashboard built with React and TypeScript",
        keywords: ["React", "TypeScript", "Dashboard"],
        ogImage: "/images/portfolio/react-dashboard-og.jpg",
        twitterImage: "/images/portfolio/react-dashboard-twitter.jpg",
        canonical: "https://yusuke-kim.com/portfolio/test-portfolio-item",
        structuredData: {},
      },
    };
  });

  describe("generateGalleryMetadata", () => {
    it("should generate metadata for all gallery", () => {
      const metadata = generator.generateGalleryMetadata("all");

      expect(metadata.title).toBe(
        "全作品ギャラリー - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "samuidoの全作品を時系列・カテゴリ・技術で絞り込み表示",
      );
      expect(metadata.keywords).toContain("ポートフォリオ");
      expect(metadata.keywords).toContain("全作品");
      expect(metadata.keywords).toContain("Web開発");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/gallery/all",
      );
    });

    it("should generate metadata for develop gallery", () => {
      const metadata = generator.generateGalleryMetadata("develop");

      expect(metadata.title).toBe(
        "開発作品ギャラリー - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "Web開発・ゲーム開発・技術実装に重点を置いた作品集",
      );
      expect(metadata.keywords).toContain("Web開発");
      expect(metadata.keywords).toContain("ゲーム開発");
      expect(metadata.keywords).toContain("React");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/gallery/develop",
      );
    });

    it("should generate metadata for video gallery", () => {
      const metadata = generator.generateGalleryMetadata("video");

      expect(metadata.title).toBe(
        "映像作品ギャラリー - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "映像制作・モーショングラフィックス・アニメーション作品集",
      );
      expect(metadata.keywords).toContain("映像制作");
      expect(metadata.keywords).toContain("モーショングラフィックス");
      expect(metadata.keywords).toContain("After Effects");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/gallery/video",
      );
    });

    it("should generate metadata for video&design gallery", () => {
      const metadata = generator.generateGalleryMetadata("video&design");

      expect(metadata.title).toBe(
        "映像・デザイン作品ギャラリー - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "デザインコンセプトと映像表現を融合した作品集",
      );
      expect(metadata.keywords).toContain("映像デザイン");
      expect(metadata.keywords).toContain("ブランディング");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/gallery/video&design",
      );
    });

    it("should include OpenGraph metadata", () => {
      const metadata = generator.generateGalleryMetadata("all");

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(
        "全作品ギャラリー - samuido | ポートフォリオ",
      );
      expect((metadata.openGraph as Record<string, unknown>)?.type).toBe(
        "website",
      );
      expect(metadata.openGraph?.url).toBe(
        "https://yusuke-kim.com/portfolio/gallery/all",
      );
      expect(metadata.openGraph?.siteName).toBe("samuido");
      expect(metadata.openGraph?.locale).toBe("ja_JP");
      expect(metadata.openGraph?.images).toBeDefined();
      expect(
        (metadata.openGraph?.images as Record<string, unknown>[])?.[0].url,
      ).toBe("https://yusuke-kim.com/images/portfolio/gallery-all-og.jpg");
    });

    it("should include Twitter Card metadata", () => {
      const metadata = generator.generateGalleryMetadata("develop");

      expect(metadata.twitter).toBeDefined();
      expect((metadata.twitter as Record<string, unknown>)?.card).toBe(
        "summary_large_image",
      );
      expect(metadata.twitter?.title).toBe(
        "開発作品ギャラリー - samuido | ポートフォリオ",
      );
      expect(metadata.twitter?.creator).toBe("@361do_sleep");
      expect(metadata.twitter?.images).toBeDefined();
      expect((metadata.twitter?.images as string[])?.[0]).toBe(
        "https://yusuke-kim.com/images/portfolio/gallery-develop-twitter.jpg",
      );
    });
  });

  describe("generateDetailMetadata", () => {
    it("should generate metadata for portfolio detail page", () => {
      const metadata = generator.generateDetailMetadata(mockPortfolioItem);

      expect(metadata.title).toBe(
        "React Dashboard Application - samuido | ポートフォリオ",
      );
      expect(metadata.description).toBe(
        "Modern dashboard built with React and TypeScript for data visualization",
      );
      expect(metadata.keywords).toContain("React");
      expect(metadata.keywords).toContain("TypeScript");
      expect(metadata.keywords).toContain("Dashboard");
      expect(metadata.keywords).toContain("ポートフォリオ");
      expect(metadata.keywords).toContain("samuido");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/test-portfolio-item",
      );
    });

    it("should include OpenGraph metadata for detail page", () => {
      const metadata = generator.generateDetailMetadata(mockPortfolioItem);

      expect(metadata.openGraph).toBeDefined();
      expect((metadata.openGraph as Record<string, unknown>)?.type).toBe(
        "article",
      );
      expect(
        (metadata.openGraph as Record<string, unknown>)?.publishedTime,
      ).toBe("2024-01-01T00:00:00Z");
      expect(
        (metadata.openGraph as Record<string, unknown>)?.modifiedTime,
      ).toBe("2024-01-15T00:00:00Z");
      expect(
        (metadata.openGraph?.images as Record<string, unknown>[])?.[0].url,
      ).toBe("/images/portfolio/react-dashboard-thumb.jpg");
    });

    it("should use default images when thumbnail is not available", () => {
      const itemWithoutThumbnail = {
        ...mockPortfolioItem,
        thumbnail: "",
      };

      const metadata = generator.generateDetailMetadata(itemWithoutThumbnail);

      expect(
        (metadata.openGraph?.images as Record<string, unknown>[])?.[0].url,
      ).toBe("https://yusuke-kim.com/images/portfolio/default-og.jpg");
      expect((metadata.twitter?.images as string[])?.[0]).toBe(
        "https://yusuke-kim.com/images/portfolio/default-twitter.jpg",
      );
    });
  });

  describe("generatePlaygroundMetadata", () => {
    it("should generate metadata for design playground", () => {
      const metadata = generator.generatePlaygroundMetadata("design");

      expect(metadata.title).toBe(
        "デザインプレイグラウンド - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "インタラクティブデザイン実験とCSS/JavaScript実装",
      );
      expect(metadata.keywords).toContain("デザイン実験");
      expect(metadata.keywords).toContain("インタラクティブ");
      expect(metadata.keywords).toContain("CSS");
      expect(metadata.keywords).toContain("JavaScript");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/playground/design",
      );
    });

    it("should generate metadata for WebGL playground", () => {
      const metadata = generator.generatePlaygroundMetadata("WebGL");

      expect(metadata.title).toBe(
        "WebGLプレイグラウンド - samuido | ポートフォリオ",
      );
      expect(metadata.description).toContain(
        "Three.js・WebGLを使用した3Dグラフィックス・シェーダー実験",
      );
      expect(metadata.keywords).toContain("WebGL");
      expect(metadata.keywords).toContain("Three.js");
      expect(metadata.keywords).toContain("3Dグラフィックス");
      expect(metadata.keywords).toContain("シェーダー");
      expect(metadata.alternates?.canonical).toBe(
        "https://yusuke-kim.com/portfolio/playground/WebGL",
      );
    });
  });

  describe("generatePortfolioStructuredData", () => {
    it("should generate basic structured data", () => {
      const structuredData =
        generator.generatePortfolioStructuredData(mockPortfolioItem);

      expect(structuredData).toMatchObject({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication", // develop category
        name: "React Dashboard Application",
        description:
          "Modern dashboard built with React and TypeScript for data visualization",
        url: "https://yusuke-kim.com/portfolio/test-portfolio-item",
        creator: {
          "@type": "Person",
          name: "木村友亮",
          alternateName: "samuido",
          url: "https://yusuke-kim.com",
        },
        dateCreated: "2024-01-01T00:00:00Z",
        dateModified: "2024-01-15T00:00:00Z",
        keywords: "React, TypeScript, Dashboard, Data Visualization",
      });
    });

    it("should generate SoftwareApplication structured data for develop category", () => {
      const structuredData =
        generator.generatePortfolioStructuredData(mockPortfolioItem);

      expect(structuredData).toMatchObject({
        "@type": "SoftwareApplication",
        applicationCategory: "WebApplication",
        programmingLanguage: ["React", "TypeScript", "Chart.js"],
        operatingSystem: "Web Browser",
        applicationSubCategory: "web",
      });
    });

    it("should generate VideoObject structured data for video category", () => {
      const videoItem: PortfolioContentItem = {
        ...mockPortfolioItem,
        category: "video",
        videoType: "promotion",
        duration: 120,
      };

      const structuredData =
        generator.generatePortfolioStructuredData(videoItem);

      expect(structuredData).toMatchObject({
        "@type": "VideoObject",
        genre: "promotion",
        duration: "PT120S",
        uploadDate: "2024-01-01T00:00:00Z",
        thumbnailUrl: "/images/portfolio/react-dashboard-thumb.jpg",
      });
    });

    it("should generate VisualArtwork structured data for design category", () => {
      const designItem: PortfolioContentItem = {
        ...mockPortfolioItem,
        category: "design",
      };

      const structuredData =
        generator.generatePortfolioStructuredData(designItem);

      expect(structuredData).toMatchObject({
        "@type": "VisualArtwork",
        artMedium: "Digital Design",
        artworkSurface: "Digital",
      });
    });

    it("should generate basic CreativeWork for unknown categories", () => {
      const unknownItem: PortfolioContentItem = {
        ...mockPortfolioItem,
        category: "unknown",
      };

      const structuredData =
        generator.generatePortfolioStructuredData(unknownItem);

      expect(structuredData).toMatchObject({
        "@type": "CreativeWork",
      });
    });
  });

  describe("generateGalleryStructuredData", () => {
    it("should generate CollectionPage structured data", () => {
      const mockItems: PortfolioContentItem[] = [
        mockPortfolioItem,
        {
          ...mockPortfolioItem,
          id: "item-2",
          title: "Unity Game Project",
        },
      ];

      const structuredData = generator.generateGalleryStructuredData(
        "all",
        mockItems,
      );

      expect(structuredData).toMatchObject({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "全作品ギャラリー",
        description: "samuidoの全作品ギャラリー",
        url: "https://yusuke-kim.com/portfolio/gallery/all",
        creator: {
          "@type": "Person",
          name: "木村友亮",
          alternateName: "samuido",
          url: "https://yusuke-kim.com",
        },
      });
    });

    it("should include ItemList with portfolio items", () => {
      const mockItems: PortfolioContentItem[] = [
        mockPortfolioItem,
        {
          ...mockPortfolioItem,
          id: "item-2",
          title: "Unity Game Project",
        },
      ];

      const structuredData = generator.generateGalleryStructuredData(
        "develop",
        mockItems,
      ) as Record<string, unknown> & { mainEntity: Record<string, unknown> };

      expect(structuredData.mainEntity).toMatchObject({
        "@type": "ItemList",
        numberOfItems: 2,
      });

      expect(
        (structuredData.mainEntity as Record<string, unknown>).itemListElement,
      ).toHaveLength(2);
      expect(
        (
          (structuredData.mainEntity as Record<string, unknown>)
            .itemListElement as Record<string, unknown>[]
        )[0],
      ).toMatchObject({
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "CreativeWork",
          name: "React Dashboard Application",
          url: "https://yusuke-kim.com/portfolio/test-portfolio-item",
        },
      });
    });

    it("should limit ItemList to 10 items", () => {
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        ...mockPortfolioItem,
        id: `item-${i}`,
        title: `Project ${i}`,
      }));

      const structuredData = generator.generateGalleryStructuredData(
        "all",
        manyItems,
      ) as Record<string, unknown> & { mainEntity: Record<string, unknown> };

      expect(
        (structuredData.mainEntity as Record<string, unknown>).numberOfItems,
      ).toBe(15);
      expect(
        (structuredData.mainEntity as Record<string, unknown>).itemListElement,
      ).toHaveLength(10);
    });
  });

  describe("generateSitemapEntries", () => {
    it("should generate sitemap entries for static and dynamic pages", () => {
      const mockItems: PortfolioContentItem[] = [
        mockPortfolioItem,
        {
          ...mockPortfolioItem,
          id: "item-2",
          title: "Unity Game Project",
          updatedAt: "2024-02-01T00:00:00Z",
        },
      ];

      const entries = generator.generateSitemapEntries(mockItems);

      // Should include static pages
      const portfolioEntry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio",
      );
      expect(portfolioEntry).toBeDefined();
      expect(portfolioEntry?.priority).toBe(1.0);
      expect(portfolioEntry?.changeFrequency).toBe("weekly");

      const allGalleryEntry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio/gallery/all",
      );
      expect(allGalleryEntry).toBeDefined();
      expect(allGalleryEntry?.priority).toBe(0.9);

      const playgroundEntry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio/playground/design",
      );
      expect(playgroundEntry).toBeDefined();
      expect(playgroundEntry?.priority).toBe(0.7);
      expect(playgroundEntry?.changeFrequency).toBe("monthly");

      // Should include dynamic pages
      const detailEntry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio/test-portfolio-item",
      );
      expect(detailEntry).toBeDefined();
      expect(detailEntry?.priority).toBe(0.8);
      expect(detailEntry?.changeFrequency).toBe("monthly");
      expect(detailEntry?.lastModified).toEqual(
        new Date("2024-01-15T00:00:00Z"),
      );
    });

    it("should include all required static pages", () => {
      const mockItems: PortfolioContentItem[] = [
        mockPortfolioItem,
        {
          ...mockPortfolioItem,
          id: "item-2",
          title: "Unity Game Project",
          updatedAt: "2024-02-01T00:00:00Z",
        },
      ];

      const entries = generator.generateSitemapEntries(mockItems);
      const staticUrls = entries.map((e) => e.url);

      expect(staticUrls).toContain("https://yusuke-kim.com/portfolio");
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/gallery/all",
      );
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/gallery/develop",
      );
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/gallery/video",
      );
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/gallery/video&design",
      );
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/playground/design",
      );
      expect(staticUrls).toContain(
        "https://yusuke-kim.com/portfolio/playground/WebGL",
      );
    });

    it("should use updatedAt for lastModified when available", () => {
      const mockItems: PortfolioContentItem[] = [
        mockPortfolioItem,
        {
          ...mockPortfolioItem,
          id: "item-2",
          title: "Unity Game Project",
          updatedAt: "2024-02-01T00:00:00Z",
        },
      ];

      const entries = generator.generateSitemapEntries(mockItems);
      const item2Entry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio/item-2",
      );

      expect(item2Entry?.lastModified).toEqual(
        new Date("2024-02-01T00:00:00Z"),
      );
    });

    it("should fallback to createdAt when updatedAt is not available", () => {
      const itemWithoutUpdatedAt = {
        ...mockPortfolioItem,
        updatedAt: undefined,
      };

      const entries = generator.generateSitemapEntries([itemWithoutUpdatedAt]);
      const itemEntry = entries.find(
        (e) => e.url === "https://yusuke-kim.com/portfolio/test-portfolio-item",
      );

      expect(itemEntry?.lastModified).toEqual(new Date("2024-01-01T00:00:00Z"));
    });
  });
});
