/**
 * Video&Design Page Comprehensive Tests
 * Task 7.3: video&designページのテスト・検証
 *
 * 包括的なテスト：
 * - 表示内容の正確性テスト
 * - 複数カテゴリーアイテムの表示テスト
 * - フィルター機能のテスト
 * - パフォーマンステスト
 * - アクセシビリティテスト
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import type { PortfolioContentItem } from "@/types/portfolio";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import VideoDesignProjectsPage from "../page";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
jest.mock("@/lib/portfolio/data-manager", () => ({
  portfolioDataManager: {
    getPortfolioData: jest.fn(),
  },
}));

jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn(),
    sortItems: jest.fn((items) => items),
  },
}));

jest.mock("@/lib/portfolio/seo-metadata-generator", () => ({
  PortfolioSEOMetadataGenerator: jest.fn().mockImplementation(() => ({
    generateGalleryMetadata: jest.fn().mockResolvedValue({
      structuredData: { "@type": "CollectionPage" },
    }),
  })),
}));

// Mock VideoDesignGallery with enhanced props
jest.mock("../components/VideoDesignGallery", () => ({
  VideoDesignGallery: ({
    items,
    showVideoItems = true,
    showDesignItems = true,
    showVideoDesignItems = true,
    deduplication = true,
    enableCaching = true,
    onError,
  }: {
    items: (PortfolioContentItem | EnhancedContentItem)[];
    showVideoItems?: boolean;
    showDesignItems?: boolean;
    showVideoDesignItems?: boolean;
    deduplication?: boolean;
    enableCaching?: boolean;
    onError?: (error: Error) => void;
  }) => (
    <div data-testid="video-design-gallery">
      <div data-testid="gallery-config">
        Video: {showVideoItems ? "ON" : "OFF"}, Design:{" "}
        {showDesignItems ? "ON" : "OFF"}, V&D:{" "}
        {showVideoDesignItems ? "ON" : "OFF"}, Dedup:{" "}
        {deduplication ? "ON" : "OFF"}, Cache: {enableCaching ? "ON" : "OFF"}
      </div>
      <div data-testid="gallery-items-count">{items.length} items</div>
      {items.map((item) => (
        <div key={item.id} data-testid={`gallery-item-${item.id}`}>
          <span data-testid={`item-title-${item.id}`}>{item.title}</span>
          <span data-testid={`item-categories-${item.id}`}>
            {"categories" in item ? item.categories?.join(", ") : item.category}
          </span>
        </div>
      ))}
      {onError && (
        <button
          data-testid="trigger-error"
          onClick={() => onError(new Error("Test error"))}
        >
          Trigger Error
        </button>
      )}
    </div>
  ),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("VideoDesignProjectsPage - Comprehensive Tests", () => {
  const mockPortfolioDataManager = jest.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/portfolio/data-manager").portfolioDataManager,
  );
  const mockEnhancedGalleryFilter = jest.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/portfolio/enhanced-gallery-filter").enhancedGalleryFilter,
  );

  // Comprehensive test data
  const comprehensiveTestItems: (PortfolioContentItem | EnhancedContentItem)[] =
    [
      // Enhanced item with multiple categories
      {
        id: "multi-cat-1",
        type: "portfolio",
        title: "Multi-Category Project",
        description: "A project with video and design categories",
        categories: ["video", "design"],
        tags: ["motion", "graphics", "creative"],
        status: "published",
        priority: 90,
        createdAt: "2024-01-15T00:00:00Z",
        isOtherCategory: false,
        useManualDate: false,
        originalImages: ["original1.jpg"],
        processedImages: ["processed1.jpg"],
      } as EnhancedContentItem,

      // Enhanced item with video&design category
      {
        id: "video-design-1",
        type: "portfolio",
        title: "Video & Design Fusion",
        description: "A dedicated video&design project",
        categories: ["video&design"],
        tags: ["concept", "storytelling"],
        status: "published",
        priority: 85,
        createdAt: "2024-02-10T00:00:00Z",
        isOtherCategory: false,
        useManualDate: true,
        manualDate: "2024-02-15T00:00:00Z",
        originalImages: [],
        processedImages: ["vd1.jpg", "vd2.jpg"],
      } as EnhancedContentItem,

      // Enhanced item with all three categories
      {
        id: "triple-cat-1",
        type: "portfolio",
        title: "Triple Category Project",
        description: "A project with video, design, and video&design",
        categories: ["video", "design", "video&design"],
        tags: ["comprehensive", "multimedia"],
        status: "published",
        priority: 95,
        createdAt: "2024-03-01T00:00:00Z",
        isOtherCategory: false,
        useManualDate: false,
        originalImages: ["orig_triple.jpg"],
        processedImages: ["proc_triple.jpg"],
      } as EnhancedContentItem,

      // Legacy video item
      {
        id: "legacy-video-1",
        type: "portfolio",
        title: "Legacy Video Project",
        description: "A legacy video project",
        category: "video",
        tags: ["editing", "post-production"],
        status: "published",
        priority: 70,
        createdAt: "2024-01-01T00:00:00Z",
        images: ["legacy_video.jpg"],
      } as PortfolioContentItem,

      // Legacy design item
      {
        id: "legacy-design-1",
        type: "portfolio",
        title: "Legacy Design Project",
        description: "A legacy design project",
        category: "design",
        tags: ["visual", "branding"],
        status: "published",
        priority: 65,
        createdAt: "2024-03-01T00:00:00Z",
        images: ["legacy_design.jpg"],
      } as PortfolioContentItem,

      // Legacy video&design item
      {
        id: "legacy-vd-1",
        type: "portfolio",
        title: "Legacy Video & Design",
        description: "A legacy video&design project",
        category: "video&design",
        tags: ["motion-graphics"],
        status: "published",
        priority: 75,
        createdAt: "2024-04-01T00:00:00Z",
        images: ["legacy_vd.jpg"],
      } as PortfolioContentItem,

      // Items that should be excluded
      {
        id: "other-1",
        type: "portfolio",
        title: "Other Category Project",
        description: "Should be excluded",
        categories: ["other"],
        tags: ["experimental"],
        status: "published",
        priority: 40,
        createdAt: "2024-05-01T00:00:00Z",
        isOtherCategory: true,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,

      {
        id: "develop-1",
        type: "portfolio",
        title: "Development Project",
        description: "Should be excluded",
        category: "develop",
        tags: ["coding"],
        status: "published",
        priority: 30,
        createdAt: "2024-06-01T00:00:00Z",
        images: ["develop.jpg"],
      } as PortfolioContentItem,

      // Draft item (should be excluded)
      {
        id: "draft-1",
        type: "portfolio",
        title: "Draft Video Project",
        description: "Should be excluded",
        categories: ["video"],
        tags: ["draft"],
        status: "draft",
        priority: 50,
        createdAt: "2024-07-01T00:00:00Z",
        isOtherCategory: false,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,
    ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("1. 表示内容の正確性テスト", () => {
    beforeEach(() => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );

      // Filter to include only video&design relevant items
      const videoDesignItems = comprehensiveTestItems.filter((item) => {
        if (item.status !== "published") return false;

        if ("categories" in item && Array.isArray(item.categories)) {
          return (
            item.categories.some((cat) =>
              ["video", "design", "video&design"].includes(cat),
            ) && !item.isOtherCategory
          );
        }
        return ["video", "design", "video&design"].includes(
          item.category || "",
        );
      });

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        videoDesignItems,
      );
    });

    it("should display correct page title and metadata", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByText("Video & Design")).toBeInTheDocument();
      expect(
        screen.getByText(
          /デザインコンセプトと映像表現を融合した創造的なプロジェクト集です/,
        ),
      ).toBeInTheDocument();
    });

    it("should display all design approach sections", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      const expectedSections = [
        "Design Approach",
        "Concept Development",
        "Visual Language",
        "Motion Design",
        "System Integration",
      ];

      expectedSections.forEach((section) => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it("should display correct navigation links", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByText("← Portfolio に戻る")).toBeInTheDocument();
      expect(screen.getByText("All Projects")).toBeInTheDocument();
      expect(screen.getByText("Video Only")).toBeInTheDocument();
      expect(screen.getByText("Commission")).toBeInTheDocument();
    });

    it("should display correct footer information", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText("© 2025 samuido - Video & Design Projects"),
      ).toBeInTheDocument();
    });

    it("should display gallery with correct configuration", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByTestId("gallery-config")).toHaveTextContent(
        "Video: ON, Design: ON, V&D: ON, Dedup: ON, Cache: ON",
      );
    });
  });

  describe("2. 複数カテゴリーアイテムの表示テスト", () => {
    beforeEach(() => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );

      const videoDesignItems = comprehensiveTestItems.filter((item) => {
        if (item.status !== "published") return false;

        if ("categories" in item && Array.isArray(item.categories)) {
          return (
            item.categories.some((cat) =>
              ["video", "design", "video&design"].includes(cat),
            ) && !item.isOtherCategory
          );
        }
        return ["video", "design", "video&design"].includes(
          item.category || "",
        );
      });

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        videoDesignItems,
      );
    });

    it("should display enhanced items with multiple categories", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Multi-category item
      expect(screen.getByTestId("item-title-multi-cat-1")).toHaveTextContent(
        "Multi-Category Project",
      );
      expect(
        screen.getByTestId("item-categories-multi-cat-1"),
      ).toHaveTextContent("video, design");

      // Triple category item
      expect(screen.getByTestId("item-title-triple-cat-1")).toHaveTextContent(
        "Triple Category Project",
      );
      expect(
        screen.getByTestId("item-categories-triple-cat-1"),
      ).toHaveTextContent("video, design, video&design");
    });

    it("should display video&design category items", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByTestId("item-title-video-design-1")).toHaveTextContent(
        "Video & Design Fusion",
      );
      expect(
        screen.getByTestId("item-categories-video-design-1"),
      ).toHaveTextContent("video&design");
    });

    it("should display legacy items correctly", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Legacy video item
      expect(screen.getByTestId("item-title-legacy-video-1")).toHaveTextContent(
        "Legacy Video Project",
      );
      expect(
        screen.getByTestId("item-categories-legacy-video-1"),
      ).toHaveTextContent("video");

      // Legacy design item
      expect(
        screen.getByTestId("item-title-legacy-design-1"),
      ).toHaveTextContent("Legacy Design Project");
      expect(
        screen.getByTestId("item-categories-legacy-design-1"),
      ).toHaveTextContent("design");

      // Legacy video&design item
      expect(screen.getByTestId("item-title-legacy-vd-1")).toHaveTextContent(
        "Legacy Video & Design",
      );
      expect(
        screen.getByTestId("item-categories-legacy-vd-1"),
      ).toHaveTextContent("video&design");
    });

    it("should exclude non-video&design items", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Should not display Other category items
      expect(
        screen.queryByTestId("gallery-item-other-1"),
      ).not.toBeInTheDocument();

      // Should not display Develop category items
      expect(
        screen.queryByTestId("gallery-item-develop-1"),
      ).not.toBeInTheDocument();

      // Should not display draft items
      expect(
        screen.queryByTestId("gallery-item-draft-1"),
      ).not.toBeInTheDocument();
    });

    it("should display correct item count", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Should show 6 items (excluding other, develop, and draft)
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "6 items",
      );
    });
  });

  describe("3. フィルター機能のテスト", () => {
    it("should call enhanced gallery filter with correct parameters", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([]);

      await VideoDesignProjectsPage();

      expect(
        mockEnhancedGalleryFilter.filterItemsForGallery,
      ).toHaveBeenCalledWith(comprehensiveTestItems, "video&design", {
        status: "published",
        includeOther: false,
      });
    });

    it("should handle empty filter results", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([]);

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText("No video & design projects found"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Video and design projects will appear here once they are published.",
        ),
      ).toBeInTheDocument();
    });

    it("should handle filter with only legacy items", async () => {
      const legacyOnlyItems = comprehensiveTestItems.filter(
        (item) =>
          !("categories" in item) &&
          ["video", "design", "video&design"].includes(item.category || ""),
      );

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        legacyOnlyItems,
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "3 items",
      );
      expect(
        screen.getByTestId("gallery-item-legacy-video-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("gallery-item-legacy-design-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("gallery-item-legacy-vd-1"),
      ).toBeInTheDocument();
    });

    it("should handle filter with only enhanced items", async () => {
      const enhancedOnlyItems = comprehensiveTestItems.filter(
        (item) =>
          "categories" in item &&
          Array.isArray(item.categories) &&
          item.categories.some((cat) =>
            ["video", "design", "video&design"].includes(cat),
          ) &&
          !item.isOtherCategory &&
          item.status === "published",
      );

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        enhancedOnlyItems,
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "3 items",
      );
      expect(
        screen.getByTestId("gallery-item-multi-cat-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("gallery-item-video-design-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("gallery-item-triple-cat-1"),
      ).toBeInTheDocument();
    });
  });

  describe("4. パフォーマンステスト", () => {
    it("should handle large datasets efficiently", async () => {
      // Create a large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: `perf-test-${index}`,
        type: "portfolio" as const,
        title: `Performance Test Item ${index}`,
        description: `Description for item ${index}`,
        categories:
          index % 3 === 0
            ? ["video"]
            : index % 3 === 1
              ? ["design"]
              : ["video&design"],
        tags: [`tag${index}`],
        status: "published" as const,
        priority: Math.floor(Math.random() * 100),
        createdAt: new Date(2024, 0, (index % 30) + 1).toISOString(),
        isOtherCategory: false,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      })) as EnhancedContentItem[];

      const startTime = performance.now();

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(largeDataset);
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        largeDataset.slice(0, 100),
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "100 items",
      );
    });

    it("should handle concurrent data loading", async () => {
      const promises = Array.from({ length: 10 }, async () => {
        mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
          comprehensiveTestItems,
        );
        mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
          comprehensiveTestItems.slice(0, 3),
        );

        return VideoDesignProjectsPage();
      });

      const results = await Promise.all(promises);

      // All promises should resolve successfully
      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    it("should measure and log performance metrics", async () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        comprehensiveTestItems.slice(0, 6),
      );

      await VideoDesignProjectsPage();

      // Should log performance information
      expect(consoleSpy).toHaveBeenCalledWith(
        "Video&Design page debug:",
        expect.objectContaining({
          totalItems: expect.any(Number),
          videoDesignItems: expect.any(Number),
          enhancedItems: expect.any(Number),
          legacyItems: expect.any(Number),
        }),
      );
    });
  });

  describe("5. アクセシビリティテスト", () => {
    beforeEach(() => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );

      const videoDesignItems = comprehensiveTestItems.filter((item) => {
        if (item.status !== "published") return false;

        if ("categories" in item && Array.isArray(item.categories)) {
          return (
            item.categories.some((cat) =>
              ["video", "design", "video&design"].includes(cat),
            ) && !item.isOtherCategory
          );
        }
        return ["video", "design", "video&design"].includes(
          item.category || "",
        );
      });

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        videoDesignItems,
      );
    });

    it("should have no accessibility violations", async () => {
      const page = await VideoDesignProjectsPage();
      const { container } = render(page);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading hierarchy", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Video & Design");

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it("should have proper link accessibility", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
        // Links should have accessible text content
        expect(link.textContent?.trim()).toBeTruthy();
      });
    });

    it("should have proper ARIA labels where needed", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Navigation should have proper structure
      const navigations = screen.getAllByRole("navigation");
      expect(navigations.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      const focusableElements = screen.getAllByRole("link");

      // All links should be focusable
      focusableElements.forEach((element) => {
        expect(element).not.toHaveAttribute("tabindex", "-1");
      });
    });

    it("should have proper semantic structure", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      // Should have main content area
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();

      // Should have proper section structure
      const sections = screen.getAllByRole("heading");
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("6. エラーハンドリングテスト", () => {
    it("should handle data loading errors gracefully", async () => {
      mockPortfolioDataManager.getPortfolioData.mockRejectedValue(
        new Error("Network error"),
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText(/Error loading video & design gallery/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    it("should handle filter errors gracefully", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockImplementation(() => {
        throw new Error("Filter error");
      });

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText(/Error loading video & design gallery/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Filter error/)).toBeInTheDocument();
    });

    it("should handle SEO generation errors without breaking the page", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        comprehensiveTestItems,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        comprehensiveTestItems.slice(0, 3),
      );

      const mockSEOGenerator = jest.mocked(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@/lib/portfolio/seo-metadata-generator")
          .PortfolioSEOMetadataGenerator,
      );
      mockSEOGenerator.mockImplementation(() => ({
        generateGalleryMetadata: jest
          .fn()
          .mockRejectedValue(new Error("SEO error")),
      }));

      const page = await VideoDesignProjectsPage();
      render(page);

      // Page should still render even if SEO fails
      expect(screen.getByText("Video & Design")).toBeInTheDocument();
      expect(screen.getByTestId("video-design-gallery")).toBeInTheDocument();
    });

    it("should handle malformed data gracefully", async () => {
      const malformedData = [
        null,
        undefined,
        { id: "invalid" }, // Missing required fields
        {
          id: "valid",
          type: "portfolio",
          title: "Valid Item",
          description: "Valid description",
          categories: ["video"],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ] as (PortfolioContentItem | EnhancedContentItem)[];

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        malformedData,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([
        malformedData[3],
      ]);

      const page = await VideoDesignProjectsPage();
      render(page);

      // Should only show valid items
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "1 items",
      );
      expect(screen.getByTestId("gallery-item-valid")).toBeInTheDocument();
    });
  });

  describe("7. 統合テスト", () => {
    it("should work end-to-end with real-world data patterns", async () => {
      const realWorldData = [
        // Mixed enhanced and legacy items
        {
          id: "real-enhanced-1",
          type: "portfolio",
          title: "Modern Video Project",
          description: "A modern video project with enhanced features",
          categories: ["video", "design"],
          tags: ["modern", "creative"],
          status: "published",
          priority: 80,
          createdAt: "2024-01-15T00:00:00Z",
          isOtherCategory: false,
          useManualDate: true,
          manualDate: "2024-01-20T00:00:00Z",
          originalImages: ["orig1.jpg"],
          processedImages: ["proc1.jpg"],
        } as EnhancedContentItem,

        {
          id: "real-legacy-1",
          type: "portfolio",
          title: "Classic Design Work",
          description: "A classic design project",
          category: "design",
          tags: ["classic", "timeless"],
          status: "published",
          priority: 70,
          createdAt: "2024-02-01T00:00:00Z",
          images: ["classic.jpg"],
        } as PortfolioContentItem,
      ];

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(
        realWorldData,
      );
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        realWorldData,
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      // Should render both enhanced and legacy items
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "2 items",
      );
      expect(
        screen.getByTestId("gallery-item-real-enhanced-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("gallery-item-real-legacy-1"),
      ).toBeInTheDocument();

      // Should have proper gallery configuration
      expect(screen.getByTestId("gallery-config")).toHaveTextContent(
        "Video: ON, Design: ON, V&D: ON, Dedup: ON, Cache: ON",
      );
    });

    it("should maintain performance with mixed data types", async () => {
      const mixedData = [
        ...comprehensiveTestItems,
        ...(Array.from({ length: 50 }, (_, i) => ({
          id: `mixed-${i}`,
          type: "portfolio" as const,
          title: `Mixed Item ${i}`,
          description: `Description ${i}`,
          category: i % 2 === 0 ? "video" : "design",
          tags: [`tag${i}`],
          status: "published" as const,
          priority: 50,
          createdAt: new Date(2024, 0, i + 1).toISOString(),
        })) as PortfolioContentItem[]),
      ];

      const startTime = performance.now();

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(mixedData);
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        mixedData.slice(0, 30),
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(500); // Should be fast even with mixed data
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "30 items",
      );
    });
  });
});
