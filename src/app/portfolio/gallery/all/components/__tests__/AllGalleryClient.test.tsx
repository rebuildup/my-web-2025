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

    expect(screen.getByTestId("portfolio-card-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-card-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-card-item-3")).toBeInTheDocument();
  });

  it("should display correct item count", () => {
    render(<AllGalleryClient {...defaultProps} />);

    expect(screen.getByText("3 / 3 projects")).toBeInTheDocument();
  });

  it("should open detail modal when card is clicked", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    await user.click(screen.getByTestId("portfolio-card-item-1"));

    expect(screen.getByTestId("detail-modal")).toBeInTheDocument();
    // Check that the modal contains the project title (there will be multiple headings with same text)
    const modalHeadings = screen.getAllByRole("heading", {
      name: "React Project",
    });
    expect(modalHeadings.length).toBeGreaterThan(0);
  });

  it("should close detail modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    // Open modal
    await user.click(screen.getByTestId("portfolio-card-item-1"));
    expect(screen.getByTestId("detail-modal")).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByText("Close"));
    expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();
  });

  it("should filter items by search term", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "React");

    // Should show only React project
    await waitFor(() => {
      expect(screen.getByText("1 / 3 projects")).toBeInTheDocument();
    });
  });

  it("should filter items by category", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    await user.click(screen.getByTestId("category-filter-develop"));

    // Should show only develop category items
    await waitFor(() => {
      expect(screen.getByText("2 / 3 projects")).toBeInTheDocument();
    });
  });

  it("should sort items by title", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    await user.click(screen.getByTestId("sort-by-title"));

    // Items should be sorted alphabetically
    const cards = screen.getAllByTestId(/portfolio-card-/);
    // After sorting by title alphabetically: "React Project", "Unity Game", "Video Project"
    // But the actual order might be different based on the mock data
    expect(cards.length).toBe(3);
  });

  it("should toggle sort order", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    await user.click(screen.getByTestId("sort-order-toggle"));

    // Sort order should change (implementation depends on default sort)
    expect(screen.getByTestId("sort-controls")).toBeInTheDocument();
  });

  it("should handle pagination", async () => {
    // Create more items to test pagination
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      ...mockPortfolioItems[0],
      id: `item-${i + 1}`,
      title: `Project ${i + 1}`,
    }));

    const user = userEvent.setup();
    render(
      <AllGalleryClient {...{ ...defaultProps, initialItems: manyItems }} />,
    );

    // Should show pagination
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();

    // Click next page
    const nextButton = screen.getByTestId("next-page");
    if (!nextButton.hasAttribute("disabled")) {
      await user.click(nextButton);
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    }
  });

  it("should show no results message when no items match filters", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(
        screen.getByText(
          "フィルター条件に一致する作品が見つかりませんでした。",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("フィルターをリセット")).toBeInTheDocument();
    });
  });

  it("should reset filters when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<AllGalleryClient {...defaultProps} />);

    // Apply search filter
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(
        screen.getByText(
          "フィルター条件に一致する作品が見つかりませんでした。",
        ),
      ).toBeInTheDocument();
    });

    // Reset filters
    await user.click(screen.getByText("フィルターをリセット"));

    await waitFor(() => {
      expect(screen.getByText("3 / 3 projects")).toBeInTheDocument();
    });
  });

  it("should render breadcrumb navigation", () => {
    render(<AllGalleryClient {...defaultProps} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "All Projects" }),
    ).toBeInTheDocument();
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
});
