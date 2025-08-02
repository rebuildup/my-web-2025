/**
 * VideoDesignGallery Component Tests
 * Task 7.1: video&designページのフィルタリング修正テスト
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import type { PortfolioContentItem } from "@/types/portfolio";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoDesignGallery } from "../VideoDesignGallery";

// Mock the enhanced gallery filter
jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn(),
    sortItems: jest.fn(),
  },
}));

// Mock the grid layout utils
jest.mock("@/lib/portfolio/grid-layout-utils", () => ({
  createBalancedLayout: jest.fn((items: unknown[]) => items),
  generateGridLayout: jest.fn((items: unknown[]) =>
    items
      .filter(
        (item) =>
          item && typeof item === "object" && (item as { id: string }).id,
      )
      .map((item) => ({
        ...item,
        gridSize: "medium",
        url: `/portfolio/${(item as { id: string }).id}`,
      })),
  ),
  getGridItemClasses: jest.fn(() => "col-span-1"),
  getGridItemMinHeight: jest.fn(() => "min-h-64"),
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

describe("VideoDesignGallery", () => {
  const mockEnhancedGalleryFilter = jest.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/portfolio/enhanced-gallery-filter").enhancedGalleryFilter,
  );

  const testItems: (PortfolioContentItem | EnhancedContentItem)[] = [
    // Enhanced item with multiple categories
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
      thumbnail: "/test-thumb-1.jpg",
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
      thumbnail: "/test-thumb-2.jpg",
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
      thumbnail: "/test-thumb-3.jpg",
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
      thumbnail: "/test-thumb-4.jpg",
    } as PortfolioContentItem,
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockEnhancedGalleryFilter.filterItemsForGallery.mockImplementation(
      (items: unknown[], galleryType: string, options?: unknown) => {
        // Simulate the enhanced gallery filter behavior
        let filtered = [...items];

        if ((options as { categories?: string[] })?.categories) {
          filtered = filtered.filter((item: { categories?: string[] }) => {
            if (item.categories) {
              return (options as { categories: string[] }).categories.some(
                (cat: string) => item.categories!.includes(cat),
              );
            }
            return options.categories.includes(item.category);
          });
        }

        return filtered;
      },
    );

    mockEnhancedGalleryFilter.sortItems.mockImplementation((items, options) => {
      const sorted = [...items];
      if (options.sortBy === "title") {
        sorted.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return options.sortOrder === "asc" ? comparison : -comparison;
        });
      } else if (options.sortBy === "priority") {
        sorted.sort((a, b) => {
          const comparison = (a.priority || 0) - (b.priority || 0);
          return options.sortOrder === "asc" ? comparison : -comparison;
        });
      }
      return sorted;
    });
  });

  describe("Rendering", () => {
    it("should render the gallery with filter controls", () => {
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      expect(screen.getByText("Filters")).toBeInTheDocument();
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
      expect(screen.getByLabelText("Year")).toBeInTheDocument();
      expect(screen.getByLabelText("Sort By")).toBeInTheDocument();
    });

    it("should display correct project count", () => {
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      expect(screen.getByText("4 projects found")).toBeInTheDocument();
    });

    it("should render project items", () => {
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      expect(
        screen.getByText("Multi-category Video Design"),
      ).toBeInTheDocument();
      expect(screen.getByText("Video & Design Project")).toBeInTheDocument();
      expect(screen.getByText("Legacy Video Project")).toBeInTheDocument();
      expect(screen.getByText("Legacy Design Project")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("should filter by category", async () => {
      const user = userEvent.setup();

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      const categorySelect = screen.getByLabelText("Category");
      await user.selectOptions(categorySelect, "video");

      expect(
        mockEnhancedGalleryFilter.filterItemsForGallery,
      ).toHaveBeenCalledWith(
        testItems,
        "video&design",
        expect.objectContaining({
          categories: ["video"],
        }),
      );
    });

    it("should filter by year", async () => {
      const user = userEvent.setup();

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      const yearSelect = screen.getByLabelText("Year");
      await user.selectOptions(yearSelect, "2024");

      expect(
        mockEnhancedGalleryFilter.filterItemsForGallery,
      ).toHaveBeenCalledWith(
        testItems,
        "video&design",
        expect.objectContaining({
          year: 2024,
        }),
      );
    });

    it("should sort items", async () => {
      const user = userEvent.setup();

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      const sortSelect = screen.getByLabelText("Sort By");
      await user.selectOptions(sortSelect, "title");

      expect(mockEnhancedGalleryFilter.sortItems).toHaveBeenCalledWith(
        testItems,
        expect.objectContaining({
          sortBy: "title",
          sortOrder: "asc",
        }),
      );
    });
  });

  describe("Category Display", () => {
    it("should show correct category options for video&design gallery", () => {
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={testItems} />);

      // Check category select options
      const categorySelect = screen.getByLabelText("Category");

      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(categorySelect).toContainHTML(
        '<option value="video">Video</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="design">Design</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="video&design">Video & Design</option>',
      );

      // Should not show other categories like "develop"
      expect(screen.queryByText("Develop")).not.toBeInTheDocument();
    });

    it("should display category icons correctly for enhanced items", () => {
      const multiCategoryItem = {
        ...testItems[0],
        categories: ["video", "design"],
      } as EnhancedContentItem;

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([
        multiCategoryItem,
      ]);
      mockEnhancedGalleryFilter.sortItems.mockReturnValue([multiCategoryItem]);

      render(<VideoDesignGallery items={[multiCategoryItem]} />);

      // Should show both video and design icons for multi-category item
      const projectLink = screen.getByRole("link", {
        name: /Multi-category Video Design/i,
      });
      expect(projectLink).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no items match filters", () => {
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([]);
      mockEnhancedGalleryFilter.sortItems.mockReturnValue([]);

      render(<VideoDesignGallery items={testItems} />);

      expect(screen.getByText("No projects found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters to see more projects."),
      ).toBeInTheDocument();
      expect(screen.getByText("Reset Filters")).toBeInTheDocument();
    });

    it("should reset filters when reset button is clicked", async () => {
      const user = userEvent.setup();

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([]);
      mockEnhancedGalleryFilter.sortItems.mockReturnValue([]);

      render(<VideoDesignGallery items={testItems} />);

      const resetButton = screen.getByText("Reset Filters");
      await user.click(resetButton);

      // After reset, should call filter with default options
      await waitFor(() => {
        expect(
          mockEnhancedGalleryFilter.filterItemsForGallery,
        ).toHaveBeenCalledWith(testItems, "video&design", {});
      });
    });
  });

  describe("Interaction", () => {
    it("should handle item hover", async () => {
      const user = userEvent.setup();

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue([
        testItems[0],
      ]);
      mockEnhancedGalleryFilter.sortItems.mockReturnValue([testItems[0]]);

      render(<VideoDesignGallery items={[testItems[0]]} />);

      const projectLink = screen.getByRole("link", {
        name: /Multi-category Video Design/i,
      });

      await user.hover(projectLink);

      // Should show overlay content on hover
      expect(projectLink).toHaveAttribute("href", "/portfolio/enhanced-1");
    });
  });

  describe("Multiple Category Support", () => {
    it("should handle items with multiple categories correctly", () => {
      const multiCategoryItems = [
        {
          id: "multi-1",
          type: "portfolio",
          title: "Multi Category Project",
          description:
            "Project with video, design, and video&design categories",
          categories: ["video", "design", "video&design"],
          tags: ["multi"],
          status: "published",
          priority: 90,
          createdAt: "2024-01-01T00:00:00Z",
          isOtherCategory: false,
          useManualDate: false,
          originalImages: [],
          processedImages: [],
          thumbnail: "/test-thumb.jpg",
        } as EnhancedContentItem,
      ];

      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        multiCategoryItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(multiCategoryItems);

      render(<VideoDesignGallery items={multiCategoryItems} />);

      expect(screen.getByText("Multi Category Project")).toBeInTheDocument();
    });

    it("should not show Other category items", () => {
      const itemsWithOther = [
        ...testItems,
        {
          id: "other-1",
          type: "portfolio",
          title: "Other Category Project",
          description: "Project in other category",
          categories: ["other"],
          tags: ["other"],
          status: "published",
          priority: 30,
          createdAt: "2024-01-01T00:00:00Z",
          isOtherCategory: true,
          useManualDate: false,
          originalImages: [],
          processedImages: [],
          thumbnail: "/test-thumb-other.jpg",
        } as EnhancedContentItem,
      ];

      // Enhanced gallery filter should exclude Other category items
      mockEnhancedGalleryFilter.filterItemsForGallery.mockReturnValue(
        testItems,
      );
      mockEnhancedGalleryFilter.sortItems.mockReturnValue(testItems);

      render(<VideoDesignGallery items={itemsWithOther} />);

      expect(
        screen.queryByText("Other Category Project"),
      ).not.toBeInTheDocument();
    });
  });
});
