/**
 * Portfolio Card Component Tests
 * Task 3.1: ポートフォリオカードコンポーネントのテスト
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioCard } from "../PortfolioCard";

// Mock Next.js Image component
jest.mock("next/image", () => {
  const MockImage = ({
    src,
    alt,
    unoptimized,
    ...props
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
    [key: string]: any;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

const mockPortfolioItem = {
  id: "test-item",
  type: "portfolio" as const,
  title: "Test Project",
  description:
    "This is a test project description that might be quite long to test line clamping functionality",
  category: "develop",
  tags: ["React", "TypeScript", "Next.js", "TailwindCSS"],
  technologies: ["React", "TypeScript", "Next.js"],
  status: "published" as const,
  priority: 75,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-20T14:45:00.000Z",
  content: "Detailed project content",
  thumbnail: "/test-thumbnail.jpg",
  seo: {
    title: "Test Project",
    description:
      "This is a test project description that might be quite long to test line clamping functionality",
    keywords: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    ogImage: "/test-thumbnail.jpg",
    twitterImage: "/test-thumbnail.jpg",
    canonical: "/portfolio/test-item",
    structuredData: {},
  },
};

describe("PortfolioCard", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("should render portfolio item information", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a test project description that might be quite long to test line clamping functionality",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("develop")).toBeInTheDocument();
  });

  it("should render thumbnail image", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const image = screen.getByAltText("Test Project");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-thumbnail.jpg");
  });

  it("should render technologies/tags with limit", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    // Should show first 3 technologies
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    // The implementation shows all 3 technologies without +1 since there are exactly 3
    // If there were more than 3, it would show +N
  });

  it("should render creation date", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    // Date should be formatted in Japanese locale
    expect(screen.getByText("2024/1/15")).toBeInTheDocument();
  });

  it("should show featured badge for high priority items", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("should not show featured badge for normal priority items", () => {
    const normalPriorityItem = { ...mockPortfolioItem, priority: 50 };
    render(<PortfolioCard item={normalPriorityItem} onClick={mockOnClick} />);

    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("should call onClick when card is clicked", async () => {
    const user = userEvent.setup();
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when Enter key is pressed", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when Space key is pressed", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: " " });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick for other keys", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Tab" });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("should handle missing thumbnail gracefully", () => {
    const itemWithoutThumbnail = { ...mockPortfolioItem, thumbnail: "" };
    render(<PortfolioCard item={itemWithoutThumbnail} onClick={mockOnClick} />);

    // Should show title as fallback in the thumbnail area
    expect(
      screen.getByRole("heading", { name: "Test Project" }),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("Test Project")).not.toBeInTheDocument();
  });

  it("should handle image loading error", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const image = screen.getByAltText("Test Project");
    fireEvent.error(image);

    // Should show fallback content
    expect(
      screen.getByRole("heading", { name: "Test Project" }),
    ).toBeInTheDocument();
  });

  it("should handle empty technologies/tags array", () => {
    const itemWithoutTags = {
      ...mockPortfolioItem,
      technologies: [],
      tags: [],
    };
    render(<PortfolioCard item={itemWithoutTags} onClick={mockOnClick} />);

    // Should not show any technology tags
    expect(screen.queryByText("React")).not.toBeInTheDocument();
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("aria-label", "View details for Test Project");
    expect(card).toHaveAttribute("tabIndex", "0");
  });

  it("should apply hover styles", () => {
    render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    expect(card).toHaveClass("hover:border-accent");
    expect(card).toHaveClass("group");
  });
});
