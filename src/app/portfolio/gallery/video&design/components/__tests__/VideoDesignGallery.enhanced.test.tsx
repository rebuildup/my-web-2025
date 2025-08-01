/**
 * Enhanced VideoDesignGallery Component Tests
 * Task 7.1: video&designページのフィルタリング修正
 */

import type { EnhancedContentItem, PortfolioContentItem } from "@/types";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { VideoDesignGallery } from "../VideoDesignGallery";

// Mock the enhanced gallery filter
jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn((items) => items),
    sortItems: jest.fn((items) => [...items]),
  },
}));

// Get the mocked functions
const { enhancedGalleryFilter } = jest.requireMock(
  "@/lib/portfolio/enhanced-gallery-filter",
);
const mockFilterItemsForGallery = enhancedGalleryFilter.filterItemsForGallery;
const mockSortItems = enhancedGalleryFilter.sortItems;

// Mock the grid layout utils
jest.mock("@/lib/portfolio/grid-layout-utils", () => ({
  generateGridLayout: jest.fn((items: unknown[]) =>
    items.map((item) => ({ ...item, gridSize: "medium" })),
  ),
  createBalancedLayout: jest.fn((items: unknown[]) => items),
  getGridItemClasses: jest.fn(() => "col-span-1"),
  getGridItemMinHeight: jest.fn(() => "min-h-64"),
}));

const mockEnhancedItems: EnhancedContentItem[] = [
  {
    id: "1",
    title: "Video Project",
    description: "A video project",
    categories: ["video"],
    tags: ["motion", "animation"],
    status: "published",
    priority: 80,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    thumbnail: "/test-image.jpg",
    url: "/project/1",
    images: [],
    isOtherCategory: false,
    useManualDate: false,
    originalImages: [],
    processedImages: [],
  },
  {
    id: "2",
    title: "Design Project",
    description: "A design project",
    categories: ["design"],
    tags: ["ui", "branding"],
    status: "published",
    priority: 70,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
    thumbnail: "/test-image-2.jpg",
    url: "/project/2",
    images: [],
    isOtherCategory: false,
    useManualDate: false,
    originalImages: [],
    processedImages: [],
  },
];
const mockLegacyItems: PortfolioContentItem[] = [
  {
    id: "3",
    title: "Legacy Video&Design Project",
    description: "A legacy video&design project",
    category: "video&design",
    tags: ["legacy", "combined"],
    status: "published",
    priority: 90,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
    thumbnail: "/test-image-3.jpg",
    url: "/project/3",
    images: [],
  },
];

const mockMixedItems = [...mockEnhancedItems, ...mockLegacyItems];

describe("VideoDesignGallery Enhanced", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Item Validation and Error Handling", () => {
    it("should handle invalid items gracefully", () => {
      const invalidItems = [
        null,
        undefined,
        { id: "", title: "" }, // Invalid item
        ...mockEnhancedItems,
      ] as (
        | EnhancedContentItem
        | null
        | undefined
        | { id: string; title: string }
      )[];

      render(
        <VideoDesignGallery
          items={invalidItems as (EnhancedContentItem | PortfolioContentItem)[]}
        />,
      );

      // Should still render valid items
      expect(screen.getByText("Video Project")).toBeInTheDocument();
      expect(screen.getByText("Design Project")).toBeInTheDocument();
    });

    it("should handle non-array items input", () => {
      render(
        <VideoDesignGallery
          items={
            null as unknown as (EnhancedContentItem | PortfolioContentItem)[]
          }
        />,
      );

      // Should show empty state
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });
  });

  describe("Multi-Category Support", () => {
    it("should display enhanced items with multiple categories", () => {
      const multiCategoryItem: EnhancedContentItem = {
        ...mockEnhancedItems[0],
        id: "multi-1",
        title: "Multi-Category Project",
        categories: ["video", "design"],
      };

      render(<VideoDesignGallery items={[multiCategoryItem]} />);

      expect(screen.getByText("Multi-Category Project")).toBeInTheDocument();
    });

    it("should show correct category statistics", () => {
      render(<VideoDesignGallery items={mockMixedItems} />);

      // Should show category breakdown in results
      expect(screen.getByText(/Video: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Design: 1/)).toBeInTheDocument();
      expect(screen.getByText(/V&D: 1/)).toBeInTheDocument();
    });
  });

  describe("Filtering Functionality", () => {
    beforeEach(() => {
      // Reset mocks before each test
      mockFilterItemsForGallery.mockClear();
      mockSortItems.mockClear();
    });

    it("should filter by category correctly", () => {
      // Mock filter to return only video items when video category is selected
      mockFilterItemsForGallery.mockImplementation(
        (
          items: (EnhancedContentItem | PortfolioContentItem)[],
          _galleryType: string,
          options: { categories?: string[] },
        ) => {
          if (options.categories && options.categories.includes("video")) {
            return items.filter(
              (item) =>
                ("categories" in item && item.categories?.includes("video")) ||
                ("category" in item && item.category === "video"),
            );
          }
          return items;
        },
      );

      render(<VideoDesignGallery items={mockMixedItems} />);

      const categoryFilter = screen.getByLabelText("Category");
      fireEvent.change(categoryFilter, { target: { value: "video" } });

      // Should show only video items
      expect(screen.getByText("Video Project")).toBeInTheDocument();
      expect(screen.queryByText("Design Project")).not.toBeInTheDocument();
    });

    it("should filter by year correctly", () => {
      render(<VideoDesignGallery items={mockMixedItems} />);

      const yearFilter = screen.getByLabelText("Year");
      fireEvent.change(yearFilter, { target: { value: "2024" } });

      // All items are from 2024, so all should be visible
      expect(screen.getByText("Video Project")).toBeInTheDocument();
      expect(screen.getByText("Design Project")).toBeInTheDocument();
    });

    it("should reset filters correctly", () => {
      // Mock filter to return empty results initially, then all items after reset
      mockFilterItemsForGallery.mockImplementation(
        (
          items: (EnhancedContentItem | PortfolioContentItem)[],
          _galleryType: string,
          options: Record<string, unknown>,
        ) => {
          // If no options or default options, return all items
          if (!options || Object.keys(options).length === 0) {
            return items;
          }
          // Otherwise return empty to trigger empty state
          return [];
        },
      );

      render(<VideoDesignGallery items={mockMixedItems} />);

      // Apply a filter that results in no items
      const categoryFilter = screen.getByLabelText("Category");
      fireEvent.change(categoryFilter, { target: { value: "nonexistent" } });

      // Should show empty state with reset button
      expect(screen.getByText("No projects found")).toBeInTheDocument();

      // Reset filters
      const resetButton = screen.getByText("Reset Filters");
      fireEvent.click(resetButton);

      // All items should be visible again
      expect(screen.getByText("Video Project")).toBeInTheDocument();
      expect(screen.getByText("Design Project")).toBeInTheDocument();
    });
  });

  describe("Deduplication", () => {
    it("should handle duplicate items correctly", () => {
      // Mock filter to handle deduplication
      mockFilterItemsForGallery.mockImplementation(
        (items: (EnhancedContentItem | PortfolioContentItem)[]) => {
          // Simple deduplication by id
          const seen = new Set();
          return items.filter((item) => {
            if (seen.has(item.id)) {
              return false;
            }
            seen.add(item.id);
            return true;
          });
        },
      );

      const duplicateItems = [
        ...mockEnhancedItems,
        ...mockEnhancedItems, // Duplicate the items
      ];

      render(<VideoDesignGallery items={duplicateItems} />);

      // Should only show each item once
      const videoProjects = screen.getAllByText("Video Project");
      expect(videoProjects).toHaveLength(1);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no items match filters", () => {
      // Test with empty items array to trigger empty state
      render(<VideoDesignGallery items={[]} />);

      expect(screen.getByText("No projects found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters to see more projects."),
      ).toBeInTheDocument();
    });
  });
});
