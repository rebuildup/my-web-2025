import { fireEvent, render, screen } from "@testing-library/react";
import WorkshopBlogPage from "../page";

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

describe("WorkshopBlogPage", () => {
  describe("component rendering", () => {
    it("should render main layout structure", () => {
      render(<WorkshopBlogPage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute("id", "main-content");
      expect(main).toHaveAttribute("role", "main");
      expect(main).toHaveAttribute("tabIndex", "-1");
    });

    it("should render breadcrumbs", () => {
      render(<WorkshopBlogPage />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();

      const breadcrumbItems = screen.getAllByTestId("breadcrumb-item");
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems[0]).toHaveTextContent("Home");
      expect(breadcrumbItems[1]).toHaveTextContent("Workshop");
      expect(breadcrumbItems[2]).toHaveTextContent("Blog");
    });

    it("should render page header", () => {
      render(<WorkshopBlogPage />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Blog",
      );
      expect(
        screen.getByText(/技術記事・チュートリアル・解説記事を公開しています/),
      ).toBeInTheDocument();
    });

    it("should render back to workshop link", () => {
      render(<WorkshopBlogPage />);

      const backLink = screen.getByRole("link", { name: /← Workshop に戻る/ });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/workshop");
    });

    it("should render search input", () => {
      render(<WorkshopBlogPage />);

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "記事を検索...");
    });

    it("should render latest posts section", () => {
      render(<WorkshopBlogPage />);

      expect(
        screen.getByRole("heading", { level: 2, name: "Latest Posts" }),
      ).toBeInTheDocument();
    });
  });

  describe("blog posts", () => {
    it("should render all blog posts", () => {
      render(<WorkshopBlogPage />);

      const blogPosts = screen.getAllByTestId("blog-post");
      expect(blogPosts).toHaveLength(3);
    });

    it("should render blog post titles", () => {
      render(<WorkshopBlogPage />);

      expect(screen.getByText("React Hooks の使い方")).toBeInTheDocument();
      expect(screen.getByText("Next.js 15 の新機能")).toBeInTheDocument();
      expect(screen.getByText("TypeScript 実践ガイド")).toBeInTheDocument();
    });

    it("should render blog post descriptions", () => {
      render(<WorkshopBlogPage />);

      expect(
        screen.getByText(
          "React Hooksの基本的な使い方と実践的な例を紹介します。",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Next.js 15で追加された新機能について詳しく解説します。",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("TypeScriptを使った実践的な開発手法を学びます。"),
      ).toBeInTheDocument();
    });

    it("should render blog post dates", () => {
      render(<WorkshopBlogPage />);

      expect(screen.getByText("2025/1/15")).toBeInTheDocument();
      expect(screen.getByText("2025/1/10")).toBeInTheDocument();
      expect(screen.getByText("2025/1/5")).toBeInTheDocument();
    });

    it("should have correct blog post links", () => {
      render(<WorkshopBlogPage />);

      const blogPosts = screen.getAllByTestId("blog-post");
      expect(blogPosts[0]).toHaveAttribute("href", "/workshop/blog/post-1");
      expect(blogPosts[1]).toHaveAttribute("href", "/workshop/blog/post-2");
      expect(blogPosts[2]).toHaveAttribute("href", "/workshop/blog/post-3");
    });
  });

  describe("search functionality", () => {
    it("should have search input with correct attributes", () => {
      render(<WorkshopBlogPage />);

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toHaveAttribute("type", "text");
      expect(searchInput).toHaveAttribute("placeholder", "記事を検索...");
    });

    it("should handle search input changes", () => {
      render(<WorkshopBlogPage />);

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "React" } });

      expect(searchInput).toHaveValue("React");
    });

    it("should have proper search input styling", () => {
      render(<WorkshopBlogPage />);

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toHaveClass(
        "w-full",
        "p-3",
        "bg-background",
        "border",
        "border-foreground",
        "text-foreground",
      );
    });
  });

  describe("styling and layout", () => {
    it("should have correct container classes", () => {
      render(<WorkshopBlogPage />);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });

    it("should have proper spacing classes", () => {
      render(<WorkshopBlogPage />);

      const mainContent = screen.getByRole("main").querySelector(".space-y-10");
      expect(mainContent).toBeInTheDocument();
    });

    it("should have correct header styling", () => {
      render(<WorkshopBlogPage />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass(
        "neue-haas-grotesk-display",
        "text-6xl",
        "text-primary",
      );
    });

    it("should have correct blog post card styling", () => {
      render(<WorkshopBlogPage />);

      const blogPost = screen.getAllByTestId("blog-post")[0];
      expect(blogPost).toHaveClass(
        "bg-base",
        "border",
        "border-foreground",
        "block",
        "p-4",
        "space-y-4",
      );
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<WorkshopBlogPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      const h2 = screen.getByRole("heading", { level: 2 });

      expect(h1).toHaveTextContent("Blog");
      expect(h2).toHaveTextContent("Latest Posts");
    });

    it("should have proper main content attributes", () => {
      render(<WorkshopBlogPage />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "main-content");
      expect(main).toHaveAttribute("role", "main");
      expect(main).toHaveAttribute("tabIndex", "-1");
    });

    it("should have focus styles for interactive elements", () => {
      render(<WorkshopBlogPage />);

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-accent",
      );
    });

    it("should have proper link focus styles", () => {
      render(<WorkshopBlogPage />);

      const backLink = screen.getByRole("link", { name: /← Workshop に戻る/ });
      expect(backLink).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-accent",
        "focus:ring-offset-2",
        "focus:ring-offset-background",
      );
    });
  });

  describe("responsive design", () => {
    it("should have proper container system", () => {
      render(<WorkshopBlogPage />);

      const container = screen
        .getByRole("main")
        .querySelector(".container-system");
      expect(container).toBeInTheDocument();
    });

    it("should have responsive text classes", () => {
      render(<WorkshopBlogPage />);

      const description = screen.getByText(
        /技術記事・チュートリアル・解説記事を公開しています/,
      );
      expect(description).toHaveClass(
        "noto-sans-jp-light",
        "text-sm",
        "max-w",
        "leading-loose",
      );
    });
  });

  describe("content structure", () => {
    it("should have proper section structure", () => {
      render(<WorkshopBlogPage />);

      const main = screen.getByRole("main");
      expect(main.querySelector("header")).toBeInTheDocument();
      expect(main.querySelectorAll("section")).toHaveLength(2);
    });

    it("should have proper spacing between sections", () => {
      render(<WorkshopBlogPage />);

      const contentContainer = screen
        .getByRole("main")
        .querySelector(".space-y-10");
      expect(contentContainer).toBeInTheDocument();
    });

    it("should have proper blog posts container", () => {
      render(<WorkshopBlogPage />);

      const blogPostsContainer = screen.getByRole("heading", {
        level: 2,
      }).parentElement;
      expect(
        blogPostsContainer?.querySelector(".space-y-6"),
      ).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("should format dates correctly", () => {
      render(<WorkshopBlogPage />);

      // Check that dates are formatted in Japanese locale
      const dates = screen.getAllByText(/2025\/1\/\d+/);
      expect(dates).toHaveLength(3);
    });

    it("should display dates as time elements", () => {
      render(<WorkshopBlogPage />);

      const timeElements = screen.getAllByRole("time");
      expect(timeElements).toHaveLength(3);
    });
  });
});
