import { render, screen } from "@testing-library/react";
import React from "react";
import WorkshopAnalyticsPage, { metadata } from "../page";

// Mock the Breadcrumbs component
jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({
    items,
  }: {
    items: Array<{ label: string; href?: string; isCurrent?: boolean }>;
  }) => (
    <nav data-testid="breadcrumbs">
      {items.map(
        (
          item: { label: string; href?: string; isCurrent?: boolean },
          index: number,
        ) => (
          <span key={index} data-testid="breadcrumb-item">
            {item.isCurrent ? item.label : <a href={item.href}>{item.label}</a>}
          </span>
        ),
      )}
    </nav>
  ),
}));

// Mock the AnalyticsDashboard component
jest.mock("../../components/AnalyticsDashboard", () => {
  return function AnalyticsDashboard() {
    return (
      <div data-testid="analytics-dashboard">Analytics Dashboard Content</div>
    );
  };
});

// Mock Next.js Link
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("WorkshopAnalyticsPage", () => {
  describe("metadata", () => {
    it("should have correct metadata", () => {
      expect(metadata.title).toBe("Workshop Analytics - samuido");
      expect(metadata.description).toBe(
        "Workshop content analytics and performance metrics",
      );
    });
  });

  describe("component rendering", () => {
    it("should render main layout structure", () => {
      render(<WorkshopAnalyticsPage />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("py-10");
    });

    it("should render breadcrumbs", () => {
      render(<WorkshopAnalyticsPage />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();

      const breadcrumbItems = screen.getAllByTestId("breadcrumb-item");
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems[0]).toHaveTextContent("Home");
      expect(breadcrumbItems[1]).toHaveTextContent("Workshop");
      expect(breadcrumbItems[2]).toHaveTextContent("Analytics");
    });

    it("should render page header", () => {
      render(<WorkshopAnalyticsPage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Workshop Analytics",
      );
      expect(
        screen.getByText(/ワークショップコンテンツのパフォーマンス分析/),
      ).toBeInTheDocument();
    });

    it("should render analytics dashboard", () => {
      render(<WorkshopAnalyticsPage />);

      expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Analytics Dashboard Content"),
      ).toBeInTheDocument();
    });

    it("should render navigation links", () => {
      render(<WorkshopAnalyticsPage />);

      const workshopLink = screen.getByRole("link", { name: /← Workshop/ });
      const homeLink = screen.getByRole("link", { name: /← Home/ });

      expect(workshopLink).toBeInTheDocument();
      expect(workshopLink).toHaveAttribute("href", "/workshop");

      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("styling and layout", () => {
    it("should have correct container classes", () => {
      render(<WorkshopAnalyticsPage />);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });

    it("should have proper spacing classes", () => {
      render(<WorkshopAnalyticsPage />);

      const mainContent = screen.getByRole("main").querySelector(".space-y-10");
      expect(mainContent).toBeInTheDocument();
    });

    it("should have correct header styling", () => {
      render(<WorkshopAnalyticsPage />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass(
        "neue-haas-grotesk-display",
        "text-4xl",
        "text-primary",
      );
    });

    it("should have correct description styling", () => {
      render(<WorkshopAnalyticsPage />);

      const description = screen.getByText(
        /ワークショップコンテンツのパフォーマンス分析/,
      );
      expect(description).toHaveClass(
        "noto-sans-jp-light",
        "text-sm",
        "max-w",
        "leading-loose",
      );
    });
  });

  describe("navigation", () => {
    it("should have proper navigation structure", () => {
      render(<WorkshopAnalyticsPage />);

      const navigation = screen.getByRole("navigation", {
        name: "Site navigation",
      });
      expect(navigation).toBeInTheDocument();
    });

    it("should have grid layout for navigation links", () => {
      render(<WorkshopAnalyticsPage />);

      const navigation = screen.getByRole("navigation", {
        name: "Site navigation",
      });
      const gridContainer = navigation.querySelector(".grid-system");
      expect(gridContainer).toHaveClass(
        "grid-1",
        "xs:grid-2",
        "sm:grid-2",
        "gap-6",
      );
    });

    it("should have proper link styling", () => {
      render(<WorkshopAnalyticsPage />);

      const workshopLink = screen.getByRole("link", { name: /← Workshop/ });
      expect(workshopLink).toHaveClass(
        "border",
        "border-foreground",
        "text-center",
        "p-4",
        "flex",
        "items-center",
        "justify-center",
      );
    });

    it("should have focus styles for accessibility", () => {
      render(<WorkshopAnalyticsPage />);

      const workshopLink = screen.getByRole("link", { name: /← Workshop/ });
      expect(workshopLink).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-foreground",
        "focus:ring-offset-2",
        "focus:ring-offset-background",
      );
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<WorkshopAnalyticsPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Workshop Analytics");
    });

    it("should have proper navigation labels", () => {
      render(<WorkshopAnalyticsPage />);

      expect(
        screen.getByRole("navigation", { name: "Site navigation" }),
      ).toBeInTheDocument();
    });

    it("should have proper link text", () => {
      render(<WorkshopAnalyticsPage />);

      expect(
        screen.getByRole("link", { name: /← Workshop/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /← Home/ })).toBeInTheDocument();
    });
  });

  describe("responsive design", () => {
    it("should have responsive grid classes", () => {
      render(<WorkshopAnalyticsPage />);

      const navigation = screen.getByRole("navigation", {
        name: "Site navigation",
      });
      const gridContainer = navigation.querySelector(".grid-system");
      expect(gridContainer).toHaveClass("xs:grid-2", "sm:grid-2");
    });

    it("should have proper container system", () => {
      render(<WorkshopAnalyticsPage />);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });
  });

  describe("content structure", () => {
    it("should have proper content hierarchy", () => {
      render(<WorkshopAnalyticsPage />);

      const main = screen.getByRole("main");
      expect(main.querySelector("header")).toBeInTheDocument();
      expect(main.querySelector("nav")).toBeInTheDocument();
    });

    it("should have proper spacing between sections", () => {
      render(<WorkshopAnalyticsPage />);

      const contentContainer = screen
        .getByRole("main")
        .querySelector(".space-y-10");
      expect(contentContainer).toBeInTheDocument();
    });
  });
});
