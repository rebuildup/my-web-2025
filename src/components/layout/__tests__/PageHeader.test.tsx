/**
 * PageHeader Component Tests
 * Tests for page header with breadcrumbs and title functionality
 */

import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PageHeader } from "../PageHeader";

// Mock the Breadcrumbs component
jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({ items }: { items: BreadcrumbItem[] }) => (
    <nav data-testid="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} data-testid={`breadcrumb-${index}`}>
          {item.label}
        </span>
      ))}
    </nav>
  ),
}));

describe("PageHeader", () => {
  describe("Basic rendering", () => {
    it("should render without props", () => {
      render(<PageHeader />);

      // Should render the container div
      const container = document.querySelector(".container");
      expect(container).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<PageHeader className="custom-class" />);

      const container = document.querySelector(".container");
      expect(container).toHaveClass("custom-class");
    });

    it("should apply default container classes", () => {
      render(<PageHeader />);

      const container = document.querySelector(".container");
      expect(container).toHaveClass("mx-auto", "px-4", "py-4");
    });
  });

  describe("Title rendering", () => {
    it("should render title when provided", () => {
      render(<PageHeader title="Test Page Title" />);

      expect(screen.getByText("Test Page Title")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should not render title section when title is not provided", () => {
      render(<PageHeader />);

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("should apply correct title styling", () => {
      render(<PageHeader title="Styled Title" />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveClass(
        "text-3xl",
        "font-bold",
        "text-foreground",
        "mb-2",
      );
    });

    it("should render empty title gracefully", () => {
      render(<PageHeader title="" />);

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("Description rendering", () => {
    it("should render description when provided with title", () => {
      render(
        <PageHeader
          title="Test Title"
          description="Test description content"
        />,
      );

      expect(screen.getByText("Test description content")).toBeInTheDocument();
    });

    it("should not render description without title", () => {
      render(<PageHeader description="Test description" />);

      expect(screen.queryByText("Test description")).not.toBeInTheDocument();
    });

    it("should apply correct description styling", () => {
      render(<PageHeader title="Title" description="Description" />);

      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-muted-foreground");
      expect(description.tagName).toBe("P");
    });

    it("should render empty description gracefully", () => {
      render(<PageHeader title="Title" description="" />);

      // Empty description should not render
      const paragraphs = document.querySelectorAll("p");
      expect(paragraphs).toHaveLength(0);
    });

    it("should render multiline description", () => {
      const multilineDescription = "Line 1\nLine 2\nLine 3";
      render(<PageHeader title="Title" description={multilineDescription} />);

      // Use a more flexible matcher for multiline text
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === multilineDescription;
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Breadcrumbs rendering", () => {
    const mockBreadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category" },
      { label: "Current Page" },
    ];

    it("should render breadcrumbs when provided", () => {
      render(<PageHeader breadcrumbs={mockBreadcrumbs} />);

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
      expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Category");
      expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
        "Current Page",
      );
    });

    it("should not render breadcrumbs when not provided", () => {
      render(<PageHeader />);

      expect(screen.queryByTestId("breadcrumbs")).not.toBeInTheDocument();
    });

    it("should not render breadcrumbs when empty array provided", () => {
      render(<PageHeader breadcrumbs={[]} />);

      expect(screen.queryByTestId("breadcrumbs")).not.toBeInTheDocument();
    });

    it("should render single breadcrumb item", () => {
      const singleBreadcrumb: BreadcrumbItem[] = [
        { label: "Single Item", href: "/single" },
      ];

      render(<PageHeader breadcrumbs={singleBreadcrumb} />);

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent(
        "Single Item",
      );
    });

    it("should handle breadcrumbs with special characters", () => {
      const specialBreadcrumbs: BreadcrumbItem[] = [
        { label: "Home & Garden", href: "/home-garden" },
        { label: "Tools & Equipment", href: "/tools" },
        { label: "Current: Special Item!" },
      ];

      render(<PageHeader breadcrumbs={specialBreadcrumbs} />);

      expect(screen.getByText("Home & Garden")).toBeInTheDocument();
      expect(screen.getByText("Tools & Equipment")).toBeInTheDocument();
      expect(screen.getByText("Current: Special Item!")).toBeInTheDocument();
    });
  });

  describe("Combined rendering", () => {
    it("should render all elements together", () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Current" },
      ];

      render(
        <PageHeader
          title="Complete Page"
          description="This page has everything"
          breadcrumbs={breadcrumbs}
          className="custom-header"
        />,
      );

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByText("Complete Page")).toBeInTheDocument();
      expect(screen.getByText("This page has everything")).toBeInTheDocument();

      const container = document.querySelector(".container");
      expect(container).toHaveClass("custom-header");
    });

    it("should render breadcrumbs above title", () => {
      const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

      render(<PageHeader title="Page Title" breadcrumbs={breadcrumbs} />);

      const breadcrumbsElement = screen.getByTestId("breadcrumbs");
      const titleElement = screen.getByRole("heading");

      // Check DOM order - breadcrumbs should come before title
      expect(breadcrumbsElement.compareDocumentPosition(titleElement)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it("should render title above description", () => {
      render(<PageHeader title="Page Title" description="Page description" />);

      const titleElement = screen.getByRole("heading");
      const descriptionElement = screen.getByText("Page description");

      // Check DOM order - title should come before description
      expect(titleElement.compareDocumentPosition(descriptionElement)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<PageHeader title="Main Page Title" />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Main Page Title");
    });

    it("should have accessible breadcrumb navigation", () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Current" },
      ];

      render(<PageHeader breadcrumbs={breadcrumbs} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should support screen readers with proper semantic structure", () => {
      render(
        <PageHeader
          title="Accessible Title"
          description="Accessible description"
        />,
      );

      const heading = screen.getByRole("heading");
      expect(heading.tagName).toBe("H1");

      const description = screen.getByText("Accessible description");
      expect(description.tagName).toBe("P");
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined props gracefully", () => {
      render(
        <PageHeader
          title={undefined}
          description={undefined}
          breadcrumbs={undefined}
          className={undefined}
        />,
      );

      expect(document.querySelector(".container")).toBeInTheDocument();
    });

    it("should handle null values gracefully", () => {
      render(
        <PageHeader
          title={null as unknown as string}
          description={null as unknown as string}
          breadcrumbs={null as unknown as BreadcrumbItem[]}
        />,
      );

      expect(document.querySelector(".container")).toBeInTheDocument();
    });

    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);

      render(<PageHeader title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very long descriptions", () => {
      const longDescription = "B".repeat(500);

      render(<PageHeader title="Title" description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("should handle special HTML characters in title", () => {
      const specialTitle =
        '<script>alert("xss")</script> & "quotes" & \'apostrophes\'';

      render(<PageHeader title={specialTitle} />);

      // Should render as text, not execute as HTML
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it("should handle special HTML characters in description", () => {
      const specialDescription = "<div>HTML content</div> & special chars";

      render(<PageHeader title="Title" description={specialDescription} />);

      // Should render as text, not execute as HTML
      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });
  });

  describe("CSS classes and styling", () => {
    it("should merge custom className with default classes", () => {
      render(<PageHeader className="custom-class another-class" />);

      const container = document.querySelector(".container");
      expect(container).toHaveClass(
        "container",
        "mx-auto",
        "px-4",
        "py-4",
        "custom-class",
        "another-class",
      );
    });

    it("should handle empty className", () => {
      render(<PageHeader className="" />);

      const container = document.querySelector(".container");
      expect(container).toHaveClass("container", "mx-auto", "px-4", "py-4");
    });

    it("should apply title wrapper styling", () => {
      render(<PageHeader title="Test Title" />);

      const titleWrapper = screen.getByRole("heading").parentElement;
      expect(titleWrapper).toHaveClass("mb-4");
    });
  });

  describe("Component structure", () => {
    it("should have correct DOM structure with all elements", () => {
      const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

      render(
        <PageHeader
          title="Test Title"
          description="Test Description"
          breadcrumbs={breadcrumbs}
          className="test-class"
        />,
      );

      const container = document.querySelector(".container.test-class");
      expect(container).toBeInTheDocument();

      const nav = container?.querySelector("nav");
      expect(nav).toBeInTheDocument();

      const titleWrapper = container?.querySelector(".mb-4");
      expect(titleWrapper).toBeInTheDocument();

      const heading = titleWrapper?.querySelector("h1");
      expect(heading).toBeInTheDocument();

      const paragraph = titleWrapper?.querySelector("p");
      expect(paragraph).toBeInTheDocument();
    });

    it("should have minimal DOM structure with no optional elements", () => {
      render(<PageHeader />);

      const container = document.querySelector(".container");
      expect(container).toBeInTheDocument();

      // Should not have nav or title wrapper
      expect(container?.querySelector("nav")).not.toBeInTheDocument();
      expect(container?.querySelector(".mb-4")).not.toBeInTheDocument();
    });
  });
});
