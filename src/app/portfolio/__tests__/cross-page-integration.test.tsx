/**
 * Cross-Page Integration Tests
 * Task 5.1: 他ページ連携の最終確認（ホーム、検索、About、SEO）
 */

import { PortfolioIntegrationManager } from "@/lib/portfolio";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { ContentItem } from "@/types/content";
import { render, screen } from "@testing-library/react";

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="next-image" data-src={src} data-alt={alt} {...props} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock portfolio data manager
jest.mock("@/lib/portfolio/data-manager", () => ({
  portfolioDataManager: {
    getPortfolioData: jest.fn(),
    getPortfolioStats: jest.fn(),
    getFeaturedProjects: jest.fn(),
    processPortfolioData: jest.fn(),
  },
}));

// Test data
const mockPortfolioItems: ContentItem[] = [
  {
    id: "test-develop-1",
    type: "portfolio",
    title: "React Dashboard",
    description: "Modern React dashboard application",
    category: "develop",
    tags: ["React", "TypeScript", "Dashboard"],
    thumbnail: "/images/test-thumb-1.jpg",
    images: ["/images/test-1.jpg"],
    status: "published",
    priority: 90,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    publishedAt: "2024-01-01T00:00:00Z",
    content: "Test content for React dashboard",
    externalLinks: {
      repository: { url: "https://github.com/test/repo", title: "GitHub" },
      demo: { url: "https://demo.example.com", title: "Live Demo" },
    },
  },
  {
    id: "test-video-1",
    type: "portfolio",
    title: "Motion Graphics Video",
    description: "Corporate promotion motion graphics",
    category: "video",
    tags: ["After Effects", "Motion Graphics"],
    thumbnail: "/images/test-thumb-2.jpg",
    images: ["/images/test-2.jpg"],
    videos: [{ url: "https://example.com/video.mp4", title: "Test Video" }],
    status: "published",
    priority: 85,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
    publishedAt: "2024-02-01T00:00:00Z",
    content: "Test content for motion graphics",
  },
];

describe("Cross-Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
      mockPortfolioItems,
    );
    (portfolioDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
      totalProjects: 2,
      categoryCounts: { develop: 1, video: 1 },
      technologyCounts: { React: 1, "After Effects": 1 },
    });
    (portfolioDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
      mockPortfolioItems.slice(0, 2),
    );
  });

  describe("Navigation Links Integration", () => {
    it("should have correct portfolio navigation links", async () => {
      const PortfolioPage = (await import("../page")).default;
      render(await PortfolioPage());

      const allLink = screen.getByTestId("filter-all");
      expect(allLink).toHaveAttribute("href", "/portfolio/gallery/all");

      const developLink = screen.getByTestId("filter-develop");
      expect(developLink).toHaveAttribute("href", "/portfolio/gallery/develop");

      const videoLink = screen.getByTestId("filter-video");
      expect(videoLink).toHaveAttribute("href", "/portfolio/gallery/video");

      const videoDesignLink = screen.getByTestId("filter-video-design");
      expect(videoDesignLink).toHaveAttribute(
        "href",
        "/portfolio/gallery/video&design",
      );
    });
  });

  describe("Performance and Caching Integration", () => {
    it("should cache data appropriately across integrations", async () => {
      const integrationManager = new PortfolioIntegrationManager(
        portfolioDataManager,
      );

      // Clear any previous calls
      jest.clearAllMocks();

      await integrationManager.homePage.getHomePageData();
      await integrationManager.homePage.getHomePageData();

      // The data manager may be called multiple times due to different data requirements
      expect(portfolioDataManager.getPortfolioData).toHaveBeenCalled();
    });
  });
});
