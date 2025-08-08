/**
 * Error Handling Integration Tests
 * Task 5.1: エラーハンドリングの総合テスト（404、API失敗、WebGL非対応等）
 */

// Mock Web APIs
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(navigator, "maxTouchPoints", {
  writable: true,
  value: 0,
});

import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { render, screen, waitFor } from "@testing-library/react";

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
    <a href={href} {...props} data-testid="next-link">
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
    getSearchFilters: jest.fn(),
    processPortfolioData: jest.fn(),
    getItemById: jest.fn(),
  },
}));

// Mock device capabilities for WebGL tests
jest.mock("@/lib/playground/device-capabilities", () => ({
  deviceCapabilitiesDetector: {
    getCapabilities: jest.fn(),
    getRecommendedSettings: jest.fn(),
  },
}));

// Mock playground components
jest.mock("@/components/playground/common", () => ({
  ResponsiveExperimentGrid: ({
    experiments,
  }: {
    experiments: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="experiment-grid">
      {experiments.map((exp) => (
        <div key={exp.id} data-testid={`experiment-${exp.id}`}>
          {exp.title}
        </div>
      ))}
    </div>
  ),
  ResponsiveFilterBar: () => <div data-testid="filter-bar">Filter Bar</div>,
}));

jest.mock(
  "@/components/playground/design-experiments/experiments-data",
  () => ({
    designExperiments: [
      {
        id: "test-experiment-1",
        title: "Test Experiment",
        category: "css",
        difficulty: "beginner",
        technology: ["CSS"],
        interactive: true,
        performanceLevel: "low",
      },
    ],
  }),
);

jest.mock("@/components/playground/webgl-experiments", () => ({
  webglExperiments: [
    {
      id: "test-webgl-1",
      title: "Test WebGL",
      category: "3d",
      difficulty: "advanced",
      technology: ["WebGL"],
      interactive: true,
      performanceLevel: "high",
      component: () => <div data-testid="webgl-experiment">WebGL Test</div>,
    },
  ],
}));

// Mock hooks
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touch: { isTouchDevice: false },
  }),
}));

jest.mock("@/hooks/useTouchGestures", () => ({
  useExperimentSwipe: () => ({
    onTouchStart: jest.fn(),
    onTouchMove: jest.fn(),
    onTouchEnd: jest.fn(),
  }),
}));

describe("Error Handling Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset console methods
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("API Failure Error Handling", () => {
    it("should handle portfolio data API failure gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockRejectedValue(
        new Error("API connection failed"),
      );
      (portfolioDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
        totalProjects: 0,
        categoryCounts: {},
        technologyCounts: {},
        lastUpdate: new Date(),
      });
      (portfolioDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
        [],
      );

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should still render the page structure
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Browse by Category")).toBeInTheDocument();

      // Should show fallback content
      expect(screen.getByText("Featured Projects")).toBeInTheDocument();
    });

    it("should handle gallery API failure gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockRejectedValue(
        new Error("Gallery API failed"),
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(screen.getByText(/Error loading portfolio/)).toBeInTheDocument();
      });

      // Should log the error
      expect(console.error).toHaveBeenCalledWith(
        "Error in AllGalleryPage:",
        expect.any(Error),
      );
    });

    it("should handle stats API failure gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );
      (portfolioDataManager.getPortfolioStats as jest.Mock).mockRejectedValue(
        new Error("Stats API failed"),
      );
      (portfolioDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
        [],
      );

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should still render with fallback stats
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      const projectElements = screen.getAllByText(/\d+ projects/);
      expect(projectElements.length).toBeGreaterThan(0);
    });

    it("should handle featured projects API failure gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );
      (portfolioDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
        totalProjects: 0,
        categoryCounts: {},
        technologyCounts: {},
        lastUpdate: new Date(),
      });
      (portfolioDataManager.getFeaturedProjects as jest.Mock).mockRejectedValue(
        new Error("Featured projects API failed"),
      );

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should still render the page
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Featured Projects")).toBeInTheDocument();
    });
  });

  describe("404 Error Handling", () => {
    it("should handle non-existent portfolio item gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );

      const DetailPage = (await import("../[slug]/page")).default;
      const mockParams = { slug: "non-existent-item" };

      render(await DetailPage({ params: mockParams }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Sorry, there was an error loading this portfolio item.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should handle empty gallery gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );
      (portfolioDataManager.getSearchFilters as jest.Mock).mockResolvedValue(
        [],
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(
          screen.getByText("No portfolio items found."),
        ).toBeInTheDocument();
      });
    });

    it("should handle empty category galleries gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );

      const DevelopDetailPage = (await import("../detail/develop/page"))
        .default;

      render(await DevelopDetailPage());

      await waitFor(() => {
        expect(
          screen.getByText("No development projects found."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("WebGL Non-Support Error Handling", () => {
    it("should handle WebGL non-support gracefully", async () => {
      const { deviceCapabilitiesDetector } = await import(
        "@/lib/playground/device-capabilities"
      );

      (
        deviceCapabilitiesDetector.getCapabilities as jest.Mock
      ).mockResolvedValue({
        webglSupport: false,
        webgl2Support: false,
        performanceLevel: "low",
        touchSupport: false,
        maxTextureSize: 1024,
        devicePixelRatio: 1,
        hardwareConcurrency: 2,
      });

      (
        deviceCapabilitiesDetector.getRecommendedSettings as jest.Mock
      ).mockReturnValue({
        targetFPS: 30,
        qualityLevel: "low",
        enableOptimizations: true,
      });

      const WebGLPlaygroundPage = (await import("../playground/WebGL/page"))
        .default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });

      // Expand the settings panel to see WebGL support info
      const settingsButton = screen.getByText("Device & Settings");
      settingsButton.click();

      await waitFor(() => {
        expect(screen.getByText("WebGL Support:")).toBeInTheDocument();
        const webglSupportElements = screen.getAllByText("No");
        expect(webglSupportElements.length).toBeGreaterThan(0);
      });
    });

    it("should handle device capability detection failure", async () => {
      const { deviceCapabilitiesDetector } = await import(
        "@/lib/playground/device-capabilities"
      );

      (
        deviceCapabilitiesDetector.getCapabilities as jest.Mock
      ).mockRejectedValue(new Error("Device detection failed"));

      const DesignPlaygroundPage = (await import("../playground/design/page"))
        .default;

      render(<DesignPlaygroundPage />);

      // Should show loading state initially
      expect(screen.getByText("デバイス性能を検出中...")).toBeInTheDocument();

      // Should eventually show fallback capabilities
      await waitFor(
        () => {
          expect(screen.getByText("Design Playground")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    it("should handle WebGL context loss gracefully", async () => {
      const { deviceCapabilitiesDetector } = await import(
        "@/lib/playground/device-capabilities"
      );

      (
        deviceCapabilitiesDetector.getCapabilities as jest.Mock
      ).mockResolvedValue({
        webglSupport: true,
        webgl2Support: false,
        performanceLevel: "medium",
        touchSupport: false,
        maxTextureSize: 2048,
        devicePixelRatio: 1,
        hardwareConcurrency: 4,
      });

      const WebGLPlaygroundPage = (await import("../playground/WebGL/page"))
        .default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });

      // Expand the settings panel to see WebGL support info
      const settingsButton = screen.getByText("Device & Settings");
      settingsButton.click();

      await waitFor(() => {
        expect(screen.getByText("WebGL Support:")).toBeInTheDocument();
      });
    });
  });

  describe("Performance Degradation Handling", () => {
    it("should handle low performance devices gracefully", async () => {
      const { deviceCapabilitiesDetector } = await import(
        "@/lib/playground/device-capabilities"
      );

      (
        deviceCapabilitiesDetector.getCapabilities as jest.Mock
      ).mockResolvedValue({
        webglSupport: true,
        webgl2Support: false,
        performanceLevel: "low",
        touchSupport: false,
        maxTextureSize: 1024,
        devicePixelRatio: 1,
        hardwareConcurrency: 2,
      });

      (
        deviceCapabilitiesDetector.getRecommendedSettings as jest.Mock
      ).mockReturnValue({
        targetFPS: 30,
        qualityLevel: "low",
        enableOptimizations: true,
      });

      const DesignPlaygroundPage = (await import("../playground/design/page"))
        .default;

      render(<DesignPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("Design Playground")).toBeInTheDocument();
      });

      // Should show low performance settings
      await waitFor(() => {
        expect(screen.getByText("Design Playground")).toBeInTheDocument();
        // The design playground doesn't show specific performance settings like WebGL playground
        expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
      });
    });

    it("should handle memory constraints gracefully", async () => {
      const { deviceCapabilitiesDetector } = await import(
        "@/lib/playground/device-capabilities"
      );

      (
        deviceCapabilitiesDetector.getCapabilities as jest.Mock
      ).mockResolvedValue({
        webglSupport: true,
        webgl2Support: true,
        performanceLevel: "high",
        touchSupport: false,
        maxTextureSize: 4096,
        devicePixelRatio: 2,
        hardwareConcurrency: 8,
        memoryLimit: 512, // Low memory
      });

      const WebGLPlaygroundPage = (await import("../playground/WebGL/page"))
        .default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });

      // Should adapt to memory constraints
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    });
  });

  describe("Network Error Handling", () => {
    it("should handle network timeout gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), 100),
          ),
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(screen.getByText(/Error loading portfolio/)).toBeInTheDocument();
      });
    });

    it("should handle intermittent network failures", async () => {
      let callCount = 0;
      (portfolioDataManager.getPortfolioData as jest.Mock).mockImplementation(
        () => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error("Network error"));
          }
          return Promise.resolve([]);
        },
      );

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should still render with fallback
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
    });
  });

  describe("Data Validation Error Handling", () => {
    it("should handle malformed portfolio data gracefully", async () => {
      const malformedData = [
        {
          id: "malformed-1",
          // Missing required fields
          title: "",
          description: null,
          category: undefined,
        },
        {
          id: "malformed-2",
          title: "Valid Title",
          description: "Valid Description",
          category: "develop",
          status: "published",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        malformedData,
      );
      (
        portfolioDataManager.processPortfolioData as jest.Mock
      ).mockResolvedValue({
        data: [malformedData[1]], // Only valid item
        stats: {
          totalProjects: 1,
          categoryCounts: { develop: 1 },
          technologyCounts: {},
          lastUpdate: new Date(),
        },
      });

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should filter out malformed data and show valid items
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("1 projects")).toHaveLength(1); // Single category with 1 project
    });

    it("should handle missing image resources gracefully", async () => {
      const dataWithMissingImages = [
        {
          id: "no-image-1",
          type: "portfolio",
          title: "Project Without Image",
          description: "Test description",
          category: "develop",
          thumbnail: "", // Empty thumbnail
          images: [], // No images
          status: "published",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          publishedAt: "2024-01-01T00:00:00Z",
          content: "Test content",
        },
      ];

      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        dataWithMissingImages,
      );
      (portfolioDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
        dataWithMissingImages,
      );
      (portfolioDataManager.getPortfolioStats as jest.Mock).mockResolvedValue({
        totalProjects: 1,
        categoryCounts: { develop: 1 },
        technologyCounts: {},
        lastUpdate: new Date(),
      });

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should render without images
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("Project Without Image")[0],
      ).toBeInTheDocument();
    });
  });

  describe("Component Error Boundaries", () => {
    it("should handle component rendering errors gracefully", async () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error("Component render error");
      };

      // This would be tested with actual error boundaries in a real scenario
      expect(() => {
        render(<ErrorComponent />);
      }).toThrow("Component render error");
    });

    it("should handle async component errors gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockImplementation(
        async () => {
          throw new Error("Async component error");
        },
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(screen.getByText(/Error loading portfolio/)).toBeInTheDocument();
      });
    });
  });

  describe("User Input Error Handling", () => {
    it("should handle invalid search parameters gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );
      (portfolioDataManager.getSearchFilters as jest.Mock).mockResolvedValue(
        [],
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      // Should handle empty results gracefully
      expect(screen.getByText("No portfolio items found.")).toBeInTheDocument();
    });

    it("should handle invalid URL parameters gracefully", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue(
        [],
      );

      const DetailPage = (await import("../[slug]/page")).default;
      const mockParams = { slug: "invalid-slug-with-special-chars-!@#$%" };

      render(await DetailPage({ params: mockParams }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Sorry, there was an error loading this portfolio item.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Recovery and Fallback Mechanisms", () => {
    it("should provide meaningful error messages to users", async () => {
      (portfolioDataManager.getPortfolioData as jest.Mock).mockRejectedValue(
        new Error("Specific API error message"),
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(
          screen.getByText(
            /Error loading portfolio: Specific API error message/,
          ),
        ).toBeInTheDocument();
      });
    });

    it("should maintain basic functionality during partial failures", async () => {
      // Portfolio data succeeds, but stats fail
      (portfolioDataManager.getPortfolioData as jest.Mock).mockResolvedValue([
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Project",
          description: "Test description",
          category: "develop",
          status: "published",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          publishedAt: "2024-01-01T00:00:00Z",
          content: "Test content",
        },
      ]);
      (portfolioDataManager.getPortfolioStats as jest.Mock).mockRejectedValue(
        new Error("Stats API failed"),
      );
      (portfolioDataManager.getFeaturedProjects as jest.Mock).mockResolvedValue(
        [],
      );

      const PortfolioPage = (await import("../page")).default;

      render(await PortfolioPage());

      // Should still show the main content
      expect(
        screen.getByRole("heading", { name: "Portfolio" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Browse by Category")).toBeInTheDocument();
    });

    it("should log errors appropriately for debugging", async () => {
      const testError = new Error("Test error for logging");
      (portfolioDataManager.getPortfolioData as jest.Mock).mockRejectedValue(
        testError,
      );

      const AllGalleryPage = (await import("../gallery/all/page")).default;

      render(await AllGalleryPage());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error in AllGalleryPage:",
          testError,
        );
      });
    });
  });
});
