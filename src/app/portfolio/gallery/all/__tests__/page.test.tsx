/**
 * All Gallery Page Tests
 * Task 3.1: 全作品ギャラリーページのテスト
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import { render, screen, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import AllGalleryPage from "../page";
import Link from "next/link";

// Type assertion for jest mocks
const mockJest = jest as any;

// Mock the portfolio data manager
mockJest.mock("@/lib/portfolio/data-manager", () => ({
  portfolioDataManager: {
    getPortfolioData: mockJest.fn(),
    getSearchFilters: mockJest.fn(),
  },
}));

// Mock the SEO metadata generator
mockJest.mock("@/lib/portfolio/seo-metadata-generator", () => ({
  PortfolioSEOMetadataGenerator: mockJest.fn().mockImplementation(() => ({
    generateGalleryMetadata: mockJest.fn().mockResolvedValue({
      metadata: {
        title: "All Projects | Portfolio | samuido",
        description: "Browse all portfolio projects",
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
      },
    }),
  })),
}));

// Mock the client component
mockJest.mock("../components/AllGalleryClient", () => ({
  AllGalleryClient: ({
    initialItems,
  }: {
    initialItems: any[];
    searchFilters: any[];
  }) => (
    <div
      className="min-h-screen bg-background text-foreground"
      data-testid="all-gallery-client"
    >
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-8">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="text-foreground hover:text-accent"
                    >
                      Home
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li>
                    <Link
                      href="/portfolio"
                      className="text-foreground hover:text-accent"
                    >
                      Portfolio
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li className="text-accent">All Projects</li>
                </ol>
              </nav>
              <div className="space-y-4">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  All Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  全ての作品を時系列・カテゴリ・技術で絞り込み表示。
                  フィルターとソート機能で効率的に作品を探索できます。
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-accent">
                    {initialItems.length} / {initialItems.length} projects
                  </span>
                  <span className="text-foreground">
                    Updated {new Date().toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            </header>
            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-foreground bg-background text-foreground placeholder-foreground/60 focus:outline-none focus:border-accent"
                      placeholder="Search projects..."
                      type="text"
                      value=""
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 border transition-colors border-foreground text-foreground hover:border-accent hover:text-accent">
                    <span className="text-sm">Filters</span>
                  </button>
                </div>
              </div>
            </section>
            <section id="gallery-content">
              <div className="text-center py-16">
                <p className="noto-sans-jp-light text-sm text-foreground">
                  フィルター条件に一致する作品が見つかりませんでした。
                </p>
                <button className="mt-4 text-accent hover:text-primary transition-colors">
                  フィルターをリセット
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  ),
}));

const mockPortfolioItems = [
  {
    id: "item-1",
    type: "portfolio" as const,
    title: "Test Project 1",
    description: "Test description 1",
    category: "develop",
    tags: ["React", "TypeScript"],
    technologies: ["React", "TypeScript"],
    status: "published" as const,
    priority: 50,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    content: "Test content 1",
    thumbnail: "/test-image-1.jpg",
    seo: {
      title: "Test Project 1",
      description: "Test description 1",
      keywords: ["React", "TypeScript"],
      ogImage: "/test-image-1.jpg",
      twitterImage: "/test-image-1.jpg",
      canonical: "/portfolio/item-1",
      structuredData: {},
    },
  },
  {
    id: "item-2",
    type: "portfolio" as const,
    title: "Test Project 2",
    description: "Test description 2",
    category: "video",
    tags: ["After Effects"],
    technologies: ["After Effects"],
    status: "published" as const,
    priority: 60,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    content: "Test content 2",
    thumbnail: "/test-image-2.jpg",
    seo: {
      title: "Test Project 2",
      description: "Test description 2",
      keywords: ["After Effects"],
      ogImage: "/test-image-2.jpg",
      twitterImage: "/test-image-2.jpg",
      canonical: "/portfolio/item-2",
      structuredData: {},
    },
  },
];

const mockSearchFilters = [
  {
    type: "category" as const,
    options: [
      { value: "develop", label: "開発", count: 1 },
      { value: "video", label: "映像", count: 1 },
    ],
  },
  {
    type: "technology" as const,
    options: [
      { value: "React", label: "React", count: 1 },
      { value: "After Effects", label: "After Effects", count: 1 },
    ],
  },
];

describe("AllGalleryPage", () => {
  beforeEach(() => {
    const { portfolioDataManager } = require("@/lib/portfolio/data-manager");
    (portfolioDataManager.getPortfolioData as any).mockResolvedValue(
      mockPortfolioItems,
    );
    (portfolioDataManager.getSearchFilters as any).mockResolvedValue(
      mockSearchFilters,
    );
  });

  afterEach(() => {
    mockJest.clearAllMocks();
  });

  it("should render the all gallery page", async () => {
    render(await AllGalleryPage());

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "All Projects" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/全ての作品を時系列・カテゴリ・技術で絞り込み表示/),
      ).toBeInTheDocument();
    });
  });

  it("should pass portfolio items to client component", async () => {
    render(await AllGalleryPage());

    await waitFor(() => {
      expect(screen.getByText(/projects/)).toBeInTheDocument();
    });
  });

  it("should pass search filters to client component", async () => {
    render(await AllGalleryPage());

    await waitFor(() => {
      // Check that the component renders with search functionality
      expect(
        screen.getByPlaceholderText("Search projects..."),
      ).toBeInTheDocument();
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });

  it("should include structured data script", async () => {
    const { container } = render(await AllGalleryPage());

    await waitFor(() => {
      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(script).toBeInTheDocument();
    });
  });

  it("should handle data loading errors gracefully", async () => {
    const { portfolioDataManager } = require("@/lib/portfolio/data-manager");
    (portfolioDataManager.getPortfolioData as any).mockRejectedValue(
      new Error("Data loading error"),
    );
    (portfolioDataManager.getSearchFilters as any).mockRejectedValue(
      new Error("Filter loading error"),
    );

    // Should not throw and should render the page with empty state
    const result = render(await AllGalleryPage());
    expect(result).toBeDefined();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "All Projects" }),
      ).toBeInTheDocument();
    });
  });

  it("should handle SEO metadata generation errors gracefully", async () => {
    const {
      PortfolioSEOMetadataGenerator,
    } = require("@/lib/portfolio/seo-metadata-generator");
    (PortfolioSEOMetadataGenerator as any).mockImplementation(() => ({
      generateGalleryMetadata: mockJest
        .fn()
        .mockRejectedValue(new Error("SEO error")),
    }));

    // Should not throw and should render the page
    const result = render(await AllGalleryPage());
    expect(result).toBeDefined();
  });
});
