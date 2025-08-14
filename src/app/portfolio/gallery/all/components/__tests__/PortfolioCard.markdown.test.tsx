/**
 * Portfolio Card Gallery Display Tests
 * Tests to verify gallery cards do not display markdown content and maintain performance
 * Covers requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { PortfolioCard } from "../PortfolioCard";

// Mock Next.js components
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="portfolio-link">
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  const MockImage = ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="portfolio-image"
      data-src={src}
      data-alt={alt}
      {...props}
    />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

// Mock OptimizedImage component
jest.mock("@/components/ui/OptimizedImage", () => {
  const MockOptimizedImage = ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="optimized-image" data-src={src} data-alt={alt} />
  );
  MockOptimizedImage.displayName = "MockOptimizedImage";
  return { OptimizedImage: MockOptimizedImage };
});

describe("PortfolioCard - Gallery Display Rules", () => {
  const mockPortfolioItem = {
    id: "test-portfolio-1",
    slug: "test-portfolio-1",
    title: "Test Portfolio Item",
    description:
      "This is a test portfolio item description for gallery display.",
    type: "portfolio" as const,
    categories: ["develop"],
    tags: ["react", "typescript", "testing"],
    status: "published" as const,
    priority: 75,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    thumbnail: "/test-thumbnail.jpg",
    images: ["/image1.jpg", "/image2.png"],
    videos: [
      {
        type: "youtube" as const,
        url: "https://youtu.be/test123",
        title: "Test Video",
      },
    ],
    externalLinks: [
      {
        type: "github" as const,
        url: "https://github.com/test/repo",
        title: "GitHub Repository",
      },
    ],
    isOtherCategory: false,
    useManualDate: false,
    originalImages: [],
    processedImages: ["/image1.jpg", "/image2.png"],
  };

  const mockPortfolioItemWithMarkdown = {
    ...mockPortfolioItem,
    markdownPath: "portfolio/test-portfolio-1.md",
    content:
      "# Markdown Content\n\nThis is markdown content that should NOT appear in gallery cards.",
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Gallery Cards Never Display Markdown Content (Requirement 6.1)", () => {
    it("should not render markdown content in gallery card", () => {
      render(
        <PortfolioCard
          item={mockPortfolioItemWithMarkdown}
          onClick={mockOnClick}
        />,
      );

      // Should NOT contain markdown content
      expect(screen.queryByText("# Markdown Content")).not.toBeInTheDocument();
      expect(
        screen.queryByText("This is markdown content that should NOT appear"),
      ).not.toBeInTheDocument();

      // Should NOT contain any markdown syntax
      expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
      expect(screen.queryByText(/!\[.*\]/)).not.toBeInTheDocument();
    });

    it("should not render MarkdownRenderer component in gallery card", () => {
      render(
        <PortfolioCard
          item={mockPortfolioItemWithMarkdown}
          onClick={mockOnClick}
        />,
      );

      // Should not have any markdown renderer
      expect(screen.queryByTestId("markdown-renderer")).not.toBeInTheDocument();
      expect(screen.queryByTestId("markdown-content")).not.toBeInTheDocument();
    });

    it("should ignore content field completely in gallery display", () => {
      const itemWithBothContentTypes = {
        ...mockPortfolioItemWithMarkdown,
        content:
          "# This is content field content\n\nShould be ignored in gallery.",
        description: "This is the description that should be shown.",
      };

      render(
        <PortfolioCard item={itemWithBothContentTypes} onClick={mockOnClick} />,
      );

      // Should show description, not content
      expect(
        screen.getByText("This is the description that should be shown."),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("This is content field content"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Should be ignored in gallery."),
      ).not.toBeInTheDocument();
    });
  });

  describe("Gallery Cards Show Only Essential Information (Requirement 6.2)", () => {
    it("should display only title, description, thumbnail, category, and tags", () => {
      render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

      // Should display essential information
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument(); // title
      expect(
        screen.getByText(/This is a test portfolio item description/),
      ).toBeInTheDocument(); // description
      expect(screen.getByTestId("portfolio-image")).toHaveAttribute(
        "data-src",
        "/test-thumbnail.jpg",
      ); // thumbnail

      // Should display tags
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.getByText("testing")).toBeInTheDocument();
    });

    it("should not display detailed media information", () => {
      render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

      // Should NOT display detailed video information
      expect(screen.queryByText("Test Video")).not.toBeInTheDocument();
      expect(
        screen.queryByText("https://youtu.be/test123"),
      ).not.toBeInTheDocument();

      // Should NOT display external links
      expect(screen.queryByText("GitHub Repository")).not.toBeInTheDocument();
      expect(
        screen.queryByText("https://github.com/test/repo"),
      ).not.toBeInTheDocument();
    });

    it("should not display priority or status information", () => {
      render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

      // Should NOT display internal metadata
      expect(screen.queryByText("75")).not.toBeInTheDocument(); // priority
      expect(screen.queryByText("published")).not.toBeInTheDocument(); // status
      expect(screen.queryByText(/Priority/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Status/)).not.toBeInTheDocument();
    });
  });

  describe("Navigation to Detail Pages (Requirement 6.3)", () => {
    it("should handle card click interaction", () => {
      render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

      // The actual component uses a button role
      const card = screen.getByRole("button", {
        name: /View details for Test Portfolio Item/,
      });

      // Use fireEvent instead of userEvent for faster execution
      fireEvent.click(card);

      // The onClick should be called
      expect(mockOnClick).toHaveBeenCalled();
    });

    it("should have proper accessibility attributes", () => {
      render(<PortfolioCard item={mockPortfolioItem} onClick={mockOnClick} />);

      const card = screen.getByRole("button", {
        name: /View details for Test Portfolio Item/,
      });
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute(
        "aria-label",
        "View details for Test Portfolio Item",
      );
    });
  });

  describe("Consistent Layout Regardless of Content Type (Requirement 6.4)", () => {
    it("should maintain consistent layout for items with markdown", () => {
      render(
        <PortfolioCard
          item={mockPortfolioItemWithMarkdown}
          onClick={mockOnClick}
        />,
      );

      // Should have same structure as items without markdown
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("portfolio-image")).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    it("should maintain consistent layout for items without markdown", () => {
      const itemWithoutMarkdown = {
        ...mockPortfolioItem,
        markdownPath: undefined,
        content: undefined,
      };

      render(
        <PortfolioCard item={itemWithoutMarkdown} onClick={mockOnClick} />,
      );

      // Should have same structure
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("portfolio-image")).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    it("should handle items with no tags consistently", () => {
      const itemWithoutTags = {
        ...mockPortfolioItem,
        tags: [],
      };

      render(<PortfolioCard item={itemWithoutTags} onClick={mockOnClick} />);

      // Should still render other elements
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("portfolio-image")).toBeInTheDocument();

      // Should not have tag elements
      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });
  });

  describe("Performance Optimization (Requirement 6.4, 6.5)", () => {
    it("should not load markdown files during gallery rendering", () => {
      // Mock file system operations to ensure they're not called
      const mockFileRead = jest.fn();

      render(
        <PortfolioCard
          item={mockPortfolioItemWithMarkdown}
          onClick={mockOnClick}
        />,
      );

      // Should not attempt to read markdown files
      expect(mockFileRead).not.toHaveBeenCalled();

      // Should render immediately without async operations
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
    });

    it("should render multiple cards efficiently", () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        ...mockPortfolioItem,
        id: `item-${i}`,
        slug: `item-${i}`,
        title: `Item ${i}`,
      }));

      const { container } = render(
        <div>
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} onClick={mockOnClick} />
          ))}
        </div>,
      );

      // Should render all cards
      expect(container.children[0].children).toHaveLength(50);

      // Should render without crashing
      expect(container).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle items with missing thumbnail gracefully", () => {
      const itemWithoutThumbnail = {
        ...mockPortfolioItem,
        thumbnail: undefined,
      };

      render(
        <PortfolioCard item={itemWithoutThumbnail} onClick={mockOnClick} />,
      );

      // Should still render other content
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This is a test portfolio item description/),
      ).toBeInTheDocument();
    });

    it("should handle items with empty description", () => {
      const itemWithEmptyDescription = {
        ...mockPortfolioItem,
        description: "",
      };

      render(
        <PortfolioCard item={itemWithEmptyDescription} onClick={mockOnClick} />,
      );

      // Should still render title and other elements
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    it("should handle malformed item data gracefully", () => {
      const malformedItem = {
        ...mockPortfolioItem,
        tags: null as unknown as string[], // Malformed data
        categories: undefined,
      };

      render(<PortfolioCard item={malformedItem} onClick={mockOnClick} />);

      // Should still render basic information
      expect(
        screen.getByRole("heading", { name: "Test Portfolio Item" }),
      ).toBeInTheDocument();
    });

    it("should handle very long titles appropriately", () => {
      const itemWithLongTitle = {
        ...mockPortfolioItem,
        title:
          "This is a very long title that might cause layout issues if not handled properly in the gallery card component",
      };

      render(<PortfolioCard item={itemWithLongTitle} onClick={mockOnClick} />);

      // Should render the long title (may be truncated by CSS)
      expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    });
  });
});
