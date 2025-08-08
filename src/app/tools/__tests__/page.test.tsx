import { render, screen } from "@testing-library/react";
import React from "react";
import ToolsPage, { metadata } from "../page";

// Mock Next.js components
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock Breadcrumbs component
jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({
    items,
  }: {
    items: Array<{ label: string; href?: string; isCurrent?: boolean }>;
  }) => (
    <nav data-testid="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} data-testid={`breadcrumb-${index}`}>
          {item.label}
        </span>
      ))}
    </nav>
  ),
}));

// Mock AccessibilityTestingComponent
jest.mock("../components/AccessibilityTester", () => ({
  AccessibilityTestingComponent: ({
    targetSelector,
    autoRun,
    showResults,
  }: {
    targetSelector: string;
    autoRun: boolean;
    showResults: boolean;
  }) => (
    <div
      data-testid="accessibility-tester"
      data-target={targetSelector}
      data-auto-run={autoRun}
      data-show-results={showResults}
    >
      Accessibility Tester
    </div>
  ),
}));

describe("ToolsPage", () => {
  beforeEach(() => {
    // Reset NODE_ENV for each test
    delete (process.env as { NODE_ENV?: string }).NODE_ENV;
  });

  it("renders the main heading", () => {
    render(<ToolsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tools" }),
    ).toBeInTheDocument();
  });

  it("renders the page description", () => {
    render(<ToolsPage />);

    expect(
      screen.getByText(/実用的なWebツールのコレクション/),
    ).toBeInTheDocument();
    expect(screen.getByText(/すべて無償で提供しています/)).toBeInTheDocument();
  });

  it("renders breadcrumbs navigation", () => {
    render(<ToolsPage />);

    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
  });

  it("renders statistics section", () => {
    render(<ToolsPage />);

    expect(screen.getByText("10")).toBeInTheDocument(); // Total tools
    expect(screen.getByText("9")).toBeInTheDocument(); // Categories (excluding "all")
    expect(screen.getByText("100%")).toBeInTheDocument(); // Free provision
    expect(screen.getByText("WCAG")).toBeInTheDocument(); // WCAG compliance

    expect(screen.getByText("利用可能ツール")).toBeInTheDocument();
    expect(screen.getByText("カテゴリ")).toBeInTheDocument();
    expect(screen.getByText("無償提供")).toBeInTheDocument();
    expect(screen.getByText("AA準拠")).toBeInTheDocument();
  });

  it("renders all tool categories", () => {
    render(<ToolsPage />);

    expect(screen.getByText("All Tools")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Utility")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Game")).toBeInTheDocument();
  });

  it("renders all available tools", () => {
    render(<ToolsPage />);

    // Check for specific tools
    expect(screen.getByText("Color Palette Generator")).toBeInTheDocument();
    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.getByText("Text Counter")).toBeInTheDocument();
    expect(screen.getByText("SVG to TSX Converter")).toBeInTheDocument();
    expect(screen.getByText("Sequential PNG Preview")).toBeInTheDocument();
    expect(screen.getByText("Pomodoro Timer")).toBeInTheDocument();
    expect(screen.getByText("Pi Memory Game")).toBeInTheDocument();
    expect(screen.getByText("Business Mail Builder")).toBeInTheDocument();
    expect(
      screen.getByText("After Effects Expression Helper"),
    ).toBeInTheDocument();
    expect(screen.getByText("ProtoType Typing Game")).toBeInTheDocument();
  });

  it("renders tool links with correct hrefs", () => {
    render(<ToolsPage />);

    expect(
      screen.getByRole("link", { name: /カラーパレット生成ツール/ }),
    ).toHaveAttribute("href", "/tools/color-palette");
    expect(
      screen.getByRole("link", { name: /QRコード生成ツール/ }),
    ).toHaveAttribute("href", "/tools/qr-generator");
    expect(
      screen.getByRole("link", { name: /テキストカウンター/ }),
    ).toHaveAttribute("href", "/tools/text-counter");
  });

  it("displays keyboard shortcuts for tools", () => {
    render(<ToolsPage />);

    // Check for keyboard shortcut indicators
    expect(screen.getByText("C")).toBeInTheDocument(); // Color Palette
    expect(screen.getByText("Q")).toBeInTheDocument(); // QR Generator
    expect(screen.getByText("T")).toBeInTheDocument(); // Text Counter
    expect(screen.getByText("S")).toBeInTheDocument(); // SVG to TSX
  });

  it("renders accessibility features section", () => {
    render(<ToolsPage />);

    expect(screen.getByText("Accessibility Features")).toBeInTheDocument();
    expect(screen.getByText("Keyboard Navigation")).toBeInTheDocument();
    expect(screen.getByText("Screen Reader Support")).toBeInTheDocument();
    expect(screen.getByText("WCAG 2.1 AA Compliance")).toBeInTheDocument();
  });

  it("renders usage instructions section", () => {
    render(<ToolsPage />);

    expect(screen.getByText("How to Use")).toBeInTheDocument();
    expect(screen.getByText("ツールを選択")).toBeInTheDocument();
    expect(screen.getByText("オフライン使用可能")).toBeInTheDocument();
    expect(screen.getByText("無償・無制限利用")).toBeInTheDocument();
  });

  it("renders site navigation links", () => {
    render(<ToolsPage />);

    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/search",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("link", { name: "← Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("includes structured data JSON-LD", () => {
    render(<ToolsPage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript).toBeInTheDocument();

    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );
    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(structuredData["@type"]).toBe("WebSite");
    expect(structuredData.name).toBe("samuido Tools");
    expect(structuredData.mainEntity.numberOfItems).toBe(10);
  });

  it("includes accessibility tester in development mode", () => {
    process.env.NODE_ENV = "development";

    render(<ToolsPage />);

    expect(screen.getByTestId("accessibility-tester")).toBeInTheDocument();
    expect(screen.getByTestId("accessibility-tester")).toHaveAttribute(
      "data-target",
      "main",
    );
    expect(screen.getByTestId("accessibility-tester")).toHaveAttribute(
      "data-auto-run",
      "false",
    );
    expect(screen.getByTestId("accessibility-tester")).toHaveAttribute(
      "data-show-results",
      "false",
    );
  });

  it("does not include accessibility tester in production mode", () => {
    process.env.NODE_ENV = "production";

    render(<ToolsPage />);

    expect(
      screen.queryByTestId("accessibility-tester"),
    ).not.toBeInTheDocument();
  });

  it("has proper semantic HTML structure", () => {
    render(<ToolsPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("main")).toHaveAttribute("tabIndex", "-1");

    // Check for proper heading hierarchy
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5); // Stats, Categories, Available Tools, Accessibility Features, How to Use
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(16); // Tool titles + accessibility feature titles + usage instruction titles
  });

  it("has proper ARIA labels and accessibility attributes", () => {
    render(<ToolsPage />);

    // Check for ARIA labels on tool links
    const colorPaletteLink = screen.getByRole("link", {
      name: /カラーパレット生成ツール/,
    });
    expect(colorPaletteLink).toHaveAttribute(
      "aria-label",
      "カラーパレット生成ツール - デザイナー向け色彩ツール",
    );

    // Check for keyboard shortcut data attributes
    expect(colorPaletteLink).toHaveAttribute("data-keyboard-shortcut", "C");

    // Check for section headings with proper IDs
    expect(screen.getByText("統計情報")).toHaveAttribute("id", "stats-heading");
    expect(screen.getByText("Categories")).toHaveAttribute(
      "id",
      "categories-heading",
    );
    expect(screen.getByText("Available Tools")).toHaveAttribute(
      "id",
      "tools-heading",
    );
  });

  it("displays tool categories with correct counts", () => {
    render(<ToolsPage />);

    // Check category counts
    expect(screen.getByText("10 tools")).toBeInTheDocument(); // All Tools
    expect(screen.getAllByText("1 tools")).toHaveLength(8); // Multiple categories with 1 tool each
    expect(screen.getByText("2 tools")).toBeInTheDocument(); // Game (2 tools)
  });

  it("has responsive grid classes", () => {
    render(<ToolsPage />);

    const toolsGrid = screen
      .getByRole("heading", { name: "Available Tools" })
      .closest("section")
      ?.querySelector(".grid-system");
    expect(toolsGrid).toHaveClass("grid-1", "xs:grid-2", "sm:grid-3");

    const statsGrid = screen
      .getByRole("heading", { name: "統計情報" })
      .closest("section")
      ?.querySelector(".grid-system");
    expect(statsGrid).toHaveClass("grid-2", "xs:grid-2", "sm:grid-4");
  });
});

describe("ToolsPage Metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("Tools - samuido | 実用的なWebツール集");
    expect(metadata.description).toContain("カラーパレット生成、QRコード作成");
    expect(metadata.keywords).toContain("Webツール");
    expect(metadata.robots).toBe("index, follow");
    expect(metadata.canonical).toBe("https://yusuke-kim.com/tools");
  });

  it("includes proper OpenGraph metadata", () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe(
      "Tools - samuido | 実用的なWebツール集",
    );
    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.url).toBe("https://yusuke-kim.com/tools");
    expect(metadata.openGraph?.siteName).toBe("samuido");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
  });

  it("includes proper Twitter metadata", () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.creator).toBe("@361do_sleep");
  });
});
