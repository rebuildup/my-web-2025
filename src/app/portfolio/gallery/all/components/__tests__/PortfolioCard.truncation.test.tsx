/**
 * PortfolioCard Text Truncation Tests
 * Tests for the text truncation system implementation
 */

import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { render, screen } from "@testing-library/react";
import { PortfolioCard } from "../PortfolioCard";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({
    alt,
    ...props
  }: {
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  };
});

describe("PortfolioCard Text Truncation", () => {
  const mockItem: PortfolioContentItem = {
    id: "test-1",
    title: "Test Portfolio Item",
    description:
      "This is a very long description that should be truncated to exactly two lines when displayed in the portfolio card component to ensure consistent layout across all cards",
    category: "develop",
    technologies: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind",
      "Jest",
      "Extra Tag",
    ],
    thumbnail: "/test-thumbnail.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    priority: 80,
    status: "published",
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("should apply text-truncate-2-lines class to description", () => {
    render(<PortfolioCard item={mockItem} onClick={mockOnClick} />);

    const description = screen.getByText(/This is a very long description/);
    expect(description).toHaveClass("text-truncate-2-lines");
  });

  it("should apply tags-container class to technologies wrapper", () => {
    const { container } = render(
      <PortfolioCard item={mockItem} onClick={mockOnClick} />,
    );

    const tagsContainer = container.querySelector(".tags-container");
    expect(tagsContainer).toBeInTheDocument();
  });

  it("should display +N format for tag overflow", () => {
    render(<PortfolioCard item={mockItem} onClick={mockOnClick} />);

    // Should show first 3 tags
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    // Should show +3 for remaining tags (Tailwind, Jest, Extra Tag)
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("should apply tag-overflow-indicator class to +N element", () => {
    render(<PortfolioCard item={mockItem} onClick={mockOnClick} />);

    const overflowIndicator = screen.getByText("+3");
    expect(overflowIndicator).toHaveClass("tag-overflow-indicator");
  });

  it("should not show overflow indicator when tags are 3 or fewer", () => {
    const itemWithFewTags: PortfolioContentItem = {
      ...mockItem,
      technologies: ["React", "TypeScript"],
    };

    render(<PortfolioCard item={itemWithFewTags} onClick={mockOnClick} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("should handle items with no technologies/tags", () => {
    const itemWithNoTags: PortfolioContentItem = {
      ...mockItem,
      technologies: [],
    };

    render(<PortfolioCard item={itemWithNoTags} onClick={mockOnClick} />);

    const tagsContainer = document.querySelector(".tags-container");
    expect(tagsContainer).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("should maintain consistent layout with truncation classes", () => {
    const { container } = render(
      <PortfolioCard item={mockItem} onClick={mockOnClick} />,
    );

    // Check that both truncation utilities are applied
    const description = container.querySelector(".text-truncate-2-lines");
    const tagsContainer = container.querySelector(".tags-container");

    expect(description).toBeInTheDocument();
    expect(tagsContainer).toBeInTheDocument();
  });
});
