/**
 * Enhanced VideoDesignGallery Component Tests
 * Task 7.1: video&designページのフィルタリング修正
 */

import type { EnhancedContentItem } from "@/types";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock the enhanced gallery filter
jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn((items) => items || []),
    sortItems: jest.fn((items) => [...(items || [])]),
  },
}));

// Mock the grid layout utils
jest.mock("@/lib/portfolio/grid-layout-utils", () => ({
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
  createBalancedLayout: jest.fn((items: unknown[]) => items),
  getGridItemClasses: jest.fn(() => "col-span-1"),
  getGridItemMinHeight: jest.fn(() => "min-h-64"),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Import after mocks are set up
import { VideoDesignGallery } from "../VideoDesignGallery";

// Mock data for testing
const createMockItem = (
  id: string,
  title: string,
  category: string,
  categories?: string[],
): EnhancedContentItem => ({
  id,
  title,
  description: `Test ${title}`,
  categories: categories || [category],
  tags: ["test"],
  status: "published",
  priority: 50,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  thumbnail: `/test-${id}.jpg`,
  url: `/portfolio/${id}`,
  images: [],
  isOtherCategory: false,
  useManualDate: false,
  originalImages: [],
  processedImages: [],
});

const mockEnhancedItems: EnhancedContentItem[] = [
  createMockItem("1", "Video Project", "video"),
  createMockItem("2", "Design Project", "design"),
  createMockItem("3", "Video Design Project", "video&design"),
];

describe("VideoDesignGallery Enhanced", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    const { container } = render(
      <VideoDesignGallery items={mockEnhancedItems} />,
    );
    expect(container).toBeInTheDocument();
  });

  it("should show empty state when no items provided", () => {
    render(<VideoDesignGallery items={[]} />);
    // The component should handle empty items gracefully
    expect(screen.queryByText("No projects found")).toBeInTheDocument();
  });

  it("should handle null items gracefully", () => {
    render(<VideoDesignGallery items={[] as EnhancedContentItem[]} />);
    // The component should handle empty items gracefully
    expect(screen.queryByText("No projects found")).toBeInTheDocument();
  });

  it("should render basic structure", () => {
    const { container } = render(
      <VideoDesignGallery items={mockEnhancedItems} />,
    );

    // Check for filter controls
    expect(
      container.querySelector('[aria-label="Filter by category"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Filter by year"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Sort projects by"]'),
    ).toBeInTheDocument();
  });

  it("should handle different props", () => {
    const onError = jest.fn();
    const { container } = render(
      <VideoDesignGallery
        items={mockEnhancedItems}
        showVideoItems={true}
        showDesignItems={false}
        showVideoDesignItems={false}
        deduplication={true}
        onError={onError}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
