/**
 * All Gallery Client Component Tests
 * Task 3.1: 全作品ギャラリークライアントコンポーネントのテスト
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllGalleryClient } from "../AllGalleryClient";

// Mock Next.js components
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock enhanced gallery filter
jest.mock("@/lib/portfolio/enhanced-gallery-filter", () => ({
  enhancedGalleryFilter: {
    filterItemsForGallery: jest.fn(
      (items: any[], galleryType: string, options: any) => {
        let filtered = [...items];

        // Apply search filter
        if (options?.search) {
          filtered = filtered.filter(
            (item: any) =>
              item.title.toLowerCase().includes(options.search.toLowerCase()) ||
              item.description
                .toLowerCase()
                .includes(options.search.toLowerCase()),
          );
        }

        // Apply category filter
        if (options?.categories && options.categories.length > 0) {
          filtered = filtered.filter((item: any) =>
            options.categories.includes(item.category),
          );
        }

        return filtered;
      },
    ),
    sortItems: jest.fn((items: any[]) => items),
  },
}));

// Mock child components
jest.mock("../PortfolioCard", () => ({
  PortfolioCard: ({ item, onClick }: { item: any; onClick: () => void }) => (
    <div data-testid={`portfolio-card-${item.id}`} onClick={onClick}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  ),
}));

jest.mock("../DetailModal", () => ({
  DetailModal: ({ item, onClose }: { item: any; onClose: () => void }) => (
    <div data-testid="detail-modal">
      <h2>{item.title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../FilterBar", () => ({
  FilterBar: ({
    filters,
    onFilterChange,
  }: {
    filters: any;
    onFilterChange: (filters: any) => void;
  }) => (
    <div data-testid="filter-bar">
      <input
        data-testid="search-input"
        placeholder="Search..."
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
      />
      <button
        data-testid="category-filter-develop"
        onClick={() => onFilterChange({ ...filters, category: "develop" })}
      >
        Develop
      </button>
    </div>
  ),
}));

jest.mock("../SortControls", () => ({
  SortControls: ({
    sort,
    onSortChange,
  }: {
    sort: any;
    onSortChange: (sort: any) => void;
  }) => (
    <div data-testid="sort-controls">
      <button
        data-testid="sort-by-title"
        onClick={() => onSortChange({ ...sort, sortBy: "title" })}
      >
        Sort by Title
      </button>
      <button
        data-testid="sort-order-toggle"
        onClick={() =>
          onSortChange({
            ...sort,
            sortOrder: sort.sortOrder === "asc" ? "desc" : "asc",
          })
        }
      >
        Toggle Order
      </button>
    </div>
  ),
}));

jest.mock("../Pagination", () => ({
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  ),
}));

const mockPortfolioItems = [
  {
    id: "item-1",
    type: "portfolio" as const,
    title: "React Project",
    description: "A React-based web application",
    category: "develop",
    tags: ["React", "TypeScript"],
    technologies: ["React", "TypeScript"],
    status: "published" as const,
    priority: 50,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    content: "Detailed project description",
    thumbnail: "/react-project.jpg",
    seo: {
      title: "React Project",
      description: "A React-based web application",
      keywords: ["React", "TypeScript"],
      ogImage: "/react-project.jpg",
      twitterImage: "/react-project.jpg",
      canonical: "/portfolio/item-1",
      structuredData: {},
    },
  },
  {
    id: "item-2",
    type: "portfolio" as const,
    title: "Video Project",
    description: "Motion graphics video",
    category: "video",
    tags: ["After Effects"],
    technologies: ["After Effects"],
    status: "published" as const,
    priority: 60,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    content: "Video project details",
    thumbnail: "/video-project.jpg",
    seo: {
      title: "Video Project",
      description: "Motion graphics video",
      keywords: ["After Effects"],
      ogImage: "/video-project.jpg",
      twitterImage: "/video-project.jpg",
      canonical: "/portfolio/item-2",
      structuredData: {},
    },
  },
  {
    id: "item-3",
    type: "portfolio" as const,
    title: "Unity Game",
    description: "3D game built with Unity",
    category: "develop",
    tags: ["Unity", "C#"],
    technologies: ["Unity", "C#"],
    status: "published" as const,
    priority: 70,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
    content: "Game development project",
    thumbnail: "/unity-game.jpg",
    seo: {
      title: "Unity Game",
      description: "3D game built with Unity",
      keywords: ["Unity", "C#"],
      ogImage: "/unity-game.jpg",
      twitterImage: "/unity-game.jpg",
      canonical: "/portfolio/item-3",
      structuredData: {},
    },
  },
];

const mockSearchFilters = [
  {
    type: "category" as const,
    options: [
      { value: "develop", label: "開発", count: 2 },
      { value: "video", label: "映像", count: 1 },
    ],
  },
  {
    type: "technology" as const,
    options: [
      { value: "React", label: "React", count: 1 },
      { value: "Unity", label: "Unity", count: 1 },
      { value: "After Effects", label: "After Effects", count: 1 },
    ],
  },
];

describe("AllGalleryClient", () => {
  const defaultProps = {
    initialItems: mockPortfolioItems,
    searchFilters: mockSearchFilters,
  };

  it("should render all portfolio items", () => {
    render(<AllGalleryClient {...defaultProps} />);

    expect(screen.getByText("React Project")).toBeInTheDocument();
    expect(screen.getByText("Video Project")).toBeInTheDocument();
    expect(screen.getByText("Unity Game")).toBeInTheDocument();
  });

  it("should render page title and description", () => {
    render(<AllGalleryClient {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "All Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/全ての作品を時系列・カテゴリ・技術で絞り込み表示/),
    ).toBeInTheDocument();
  });

  it("should filter items by category", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    const categorySelect = screen.getByDisplayValue("All Categories");
    await user.selectOptions(categorySelect, "develop");

    // Should show only develop category items
    await waitFor(() => {
      expect(screen.getByText("React Project")).toBeInTheDocument();
      expect(screen.getByText("Unity Game")).toBeInTheDocument();
      expect(screen.queryByText("Video Project")).not.toBeInTheDocument();
    });
  });

  it("should filter items by technology", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    const technologySelect = screen.getByDisplayValue("All Technologies");
    await user.selectOptions(technologySelect, "React");

    // Should show only React project
    await waitFor(() => {
      expect(screen.getByText("React Project")).toBeInTheDocument();
      expect(screen.queryByText("Unity Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Video Project")).not.toBeInTheDocument();
    });
  });

  it("should show empty state when no items match filters", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    const yearSelect = screen.getByDisplayValue("All Years");
    await user.selectOptions(yearSelect, "2023");

    await waitFor(() => {
      expect(
        screen.getByText("No items match the current filters."),
      ).toBeInTheDocument();
    });
  });

  it("should render header without navigation link", () => {
    render(<AllGalleryClient {...defaultProps} />);

    // Breadcrumbs are now handled by the parent component
    expect(screen.getByText("All Projects")).toBeInTheDocument();
    expect(screen.queryByText("← Portfolio に戻る")).not.toBeInTheDocument();
  });

  it("should render portfolio items as links", () => {
    render(<AllGalleryClient {...defaultProps} />);

    const reactProjectLink = screen.getByText("React Project").closest("a");
    expect(reactProjectLink).toHaveAttribute("href", "/portfolio/item-1");

    const videoProjectLink = screen.getByText("Video Project").closest("a");
    expect(videoProjectLink).toHaveAttribute("href", "/portfolio/item-2");

    const unityGameLink = screen.getByText("Unity Game").closest("a");
    expect(unityGameLink).toHaveAttribute("href", "/portfolio/item-3");
  });
});
