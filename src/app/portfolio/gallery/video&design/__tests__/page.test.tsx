/**
 * Video&Design Page Tests
 * Task 7.1: video&designページのフィルタリング修正テスト
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import type { PortfolioContentItem } from "@/types/portfolio";
import { render, screen } from "@testing-library/react";
import VideoDesignProjectsPage from "../page";

// Mock the portfolio data manager
jest.mock("@/lib/portfolio/data-manager", () => ({
  portfolioDataManager: {
    getPortfolioData: jest.fn(),
  },
}));

// Mock the enhanced gallery filter
jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn(),
    sortItems: jest.fn((items) => items),
  },
}));

// Mock the SEO metadata generator
jest.mock("@/lib/portfolio/seo-metadata-generator", () => ({
  PortfolioSEOMetadataGenerator: jest.fn().mockImplementation(() => ({
    generateGalleryMetadata: jest.fn().mockResolvedValue({
      structuredData: { "@type": "CollectionPage" },
    }),
  })),
}));

// Mock the VideoDesignGallery component
jest.mock("../components/VideoDesignGallery", () => ({
  VideoDesignGallery: ({
    items,
  }: {
    items: { id: string; title: string }[];
  }) => (
    <div data-testid="video-design-gallery">
      <div data-testid="gallery-items-count">{items.length} items</div>
      {items.map((item) => (
        <div key={item.id} data-testid={`gallery-item-${item.id}`}>
          {item.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock Next.js Link component
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

describe("VideoDesignProjectsPage", () => {
  const mockPortfolioDataManager = jest.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/portfolio/data-manager").portfolioDataManager,
  );
  const mockEnhancedGalleryFilter = jest.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/portfolio/enhanced-gallery-filter").enhancedGalleryFilter,
  );

  const testItems: (PortfolioContentItem | EnhancedContentItem)[] = [
    // Enhanced item with video and design categories
    {
      id: "enhanced-1",
      type: "portfolio",
      title: "Multi-category Video Design",
      description: "A project with video and design",
      categories: ["video", "design"],
      tags: ["motion", "graphics"],
      status: "published",
      priority: 80,
      createdAt: "2024-01-15T00:00:00Z",
      isOtherCategory: false,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    } as EnhancedContentItem,

    // Enhanced item with video&design category
    {
      id: "enhanced-2",
      type: "portfolio",
      title: "Video & Design Project",
      description: "A video&design project",
      categories: ["video&design"],
      tags: ["creative", "concept"],
      status: "published",
      priority: 70,
      createdAt: "2024-02-10T00:00:00Z",
      isOtherCategory: false,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    } as EnhancedContentItem,

    // Legacy video item
    {
      id: "legacy-1",
      type: "portfolio",
      title: "Legacy Video Project",
      description: "A legacy video project",
      category: "video",
      tags: ["editing"],
      status: "published",
      priority: 60,
      createdAt: "2024-01-01T00:00:00Z",
    } as PortfolioContentItem,

    // Legacy design item
    {
      id: "legacy-2",
      type: "portfolio",
      title: "Legacy Design Project",
      description: "A legacy design project",
      category: "design",
      tags: ["visual"],
      status: "published",
      priority: 50,
      createdAt: "2024-03-01T00:00:00Z",
    } as PortfolioContentItem,

    // Item with Other category (should be excluded)
    {
      id: "other-1",
      type: "portfolio",
      title: "Other Category Project",
      description: "A project in other category",
      categories: ["other"],
      tags: ["experimental"],
      status: "published",
      priority: 40,
      createdAt: "2024-04-01T00:00:00Z",
      isOtherCategory: true,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    } as EnhancedContentItem,

    // Develop item (should be excluded from video&design)
    {
      id: "develop-1",
      type: "portfolio",
      title: "Development Project",
      description: "A development project",
      category: "develop",
      tags: ["coding"],
      status: "published",
      priority: 30,
      createdAt: "2024-05-01T00:00:00Z",
    } as PortfolioContentItem,
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Successful rendering", () => {
    beforeEach(() => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);

      // Mock enhanced gallery filter to return only video&design relevant items
      const videoDesignItems = testItems.filter((item) => {
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

    it("should render the page with correct title and description", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByText("Video & Design")).toBeInTheDocument();
      expect(
        screen.getByText(
          /デザインコンセプトと映像表現を融合した創造的なプロジェクト集です/,
        ),
      ).toBeInTheDocument();
    });

    it("should render design approach section", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByText("Design Approach")).toBeInTheDocument();
      expect(screen.getByText("Concept Development")).toBeInTheDocument();
      expect(screen.getByText("Visual Language")).toBeInTheDocument();
      expect(screen.getByText("Motion Design")).toBeInTheDocument();
      expect(screen.getByText("System Integration")).toBeInTheDocument();
    });

    it("should render the gallery with filtered items", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByTestId("video-design-gallery")).toBeInTheDocument();

      // Should show 4 items (excluding Other and Develop categories)
      expect(screen.getByTestId("gallery-items-count")).toHaveTextContent(
        "4 items",
      );

      // Should show video&design relevant items
      expect(screen.getByTestId("gallery-item-enhanced-1")).toHaveTextContent(
        "Multi-category Video Design",
      );
      expect(screen.getByTestId("gallery-item-enhanced-2")).toHaveTextContent(
        "Video & Design Project",
      );
      expect(screen.getByTestId("gallery-item-legacy-1")).toHaveTextContent(
        "Legacy Video Project",
      );
      expect(screen.getByTestId("gallery-item-legacy-2")).toHaveTextContent(
        "Legacy Design Project",
      );

      // Should not show Other or Develop items
      expect(
        screen.queryByTestId("gallery-item-other-1"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("gallery-item-develop-1"),
      ).not.toBeInTheDocument();
    });

    it("should call enhanced gallery filter with correct parameters", async () => {
      await VideoDesignProjectsPage();

      expect(
        mockEnhancedGalleryFilter.filterItemsForGallery,
      ).toHaveBeenCalledWith(testItems, "video&design", {
        status: "published",
        includeOther: false,
      });
    });

    it("should render navigation links", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(screen.getByText("← Portfolio に戻る")).toBeInTheDocument();
      expect(screen.getByText("All Projects")).toBeInTheDocument();
      expect(screen.getByText("Video Only")).toBeInTheDocument();
      expect(screen.getByText("Commission")).toBeInTheDocument();
    });

    it("should render footer", async () => {
      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText("© 2025 samuido - Video & Design Projects"),
      ).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    beforeEach(() => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([]);
    });

    it("should show empty state when no video&design items are found", async () => {
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
  });

  describe("Error handling", () => {
    it("should handle data loading errors gracefully", async () => {
      mockPortfolioDataManager.getPortfolioData.mockRejectedValue(
        new Error("Data loading failed"),
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      expect(
        screen.getByText(/Error loading video & design gallery/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Data loading failed/)).toBeInTheDocument();
    });

    it("should handle SEO generation errors gracefully", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems.slice(0, 4),
      );

      // Mock SEO error
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
  });

  describe("Filtering logic", () => {
    it("should correctly identify enhanced vs legacy items", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);

      const videoDesignItems = testItems.filter((item) => {
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

      await VideoDesignProjectsPage();

      // Should have called the filter with all items
      expect(
        mockEnhancedGalleryFilter.filterItemsForGallery,
      ).toHaveBeenCalledWith(testItems, "video&design", {
        status: "published",
        includeOther: false,
      });
    });

    it("should exclude Other category items", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);

      // Mock filter to exclude Other category items
      const filteredItems = testItems.filter((item) => {
        if ("categories" in item && item.isOtherCategory) {
          return false;
        }
        if ("categories" in item && Array.isArray(item.categories)) {
          return item.categories.some((cat) =>
            ["video", "design", "video&design"].includes(cat),
          );
        }
        return ["video", "design", "video&design"].includes(
          item.category || "",
        );
      });

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        filteredItems,
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      // Should not include Other category items
      expect(
        screen.queryByTestId("gallery-item-other-1"),
      ).not.toBeInTheDocument();

      // Should include video&design relevant items
      expect(screen.getByTestId("gallery-item-enhanced-1")).toBeInTheDocument();
      expect(screen.getByTestId("gallery-item-enhanced-2")).toBeInTheDocument();
      expect(screen.getByTestId("gallery-item-legacy-1")).toBeInTheDocument();
      expect(screen.getByTestId("gallery-item-legacy-2")).toBeInTheDocument();
    });

    it("should exclude Develop category items", async () => {
      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);

      // Mock filter to exclude Develop category items
      const filteredItems = testItems.filter((item) => {
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
        filteredItems,
      );

      const page = await VideoDesignProjectsPage();
      render(page);

      // Should not include Develop category items
      expect(
        screen.queryByTestId("gallery-item-develop-1"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Debug logging", () => {
    it("should log debug information", async () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockPortfolioDataManager.getPortfolioData.mockResolvedValue(testItems);
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems.slice(0, 4),
      );

      await VideoDesignProjectsPage();

      expect(consoleSpy).toHaveBeenCalledWith(
        "=== VideoDesignProjectsPage EXECUTED ===",
      );
      expect(consoleSpy).toHaveBeenCalledWith("Fetching portfolio data...");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Video&Design page debug:",
        expect.objectContaining({
          totalItems: testItems.length,
          videoDesignItems: 4,
          enhancedItems: expect.any(Number),
          legacyItems: expect.any(Number),
        }),
      );
    });
  });
});
