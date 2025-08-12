import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioInsights from "../PortfolioInsights";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("PortfolioInsights", () => {
  const mockAnalyticsData = {
    overview: {
      totalContent: 50,
      totalViews: 1250,
      totalDownloads: 320,
      totalSearches: 180,
      lastUpdated: "2023-12-01T10:00:00.000Z",
    },
    content: {
      byType: {
        portfolio: 25,
        download: 15,
        blog: 10,
      },
      byStatus: {
        published: 40,
        draft: 8,
        archived: 2,
      },
    },
    engagement: {
      topContent: [
        { id: "portfolio-web-design", views: 150 },
        { id: "portfolio-mobile-app", views: 120 },
        { id: "blog-tutorial", views: 100 },
      ],
      topDownloads: [
        { id: "portfolio-ui-kit", downloads: 80 },
        { id: "portfolio-icons", downloads: 65 },
        { id: "download-template", downloads: 45 },
      ],
      topQueries: [
        { query: "portfolio design", count: 25 },
        { query: "work samples", count: 20 },
        { query: "project showcase", count: 15 },
      ],
    },
    performance: {
      averageViewsPerContent: 25.0,
      averageDownloadsPerContent: 6.4,
      searchToViewRatio: 0.144,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalyticsData),
    });
  });

  it("should render loading state initially", () => {
    render(<PortfolioInsights />);

    expect(screen.getByText("インサイトを生成中...")).toBeInTheDocument();
  });

  it("should render insights after loading", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオインサイト")).toBeInTheDocument();
      expect(screen.getByText("過去 30d")).toBeInTheDocument();
    });
  });

  it("should generate portfolio view insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオ閲覧数")).toBeInTheDocument();
      expect(screen.getByText("270")).toBeInTheDocument(); // 150 + 120 from portfolio items
      expect(
        screen.getByText("過去30dのポートフォリオ全体の閲覧数"),
      ).toBeInTheDocument();
    });
  });

  it("should generate top performer insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("トップパフォーマー")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(
        screen.getByText(/「web design」が最も閲覧された作品です/),
      ).toBeInTheDocument();
    });
  });

  it("should generate download insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオDL数")).toBeInTheDocument();
      expect(screen.getByText("145")).toBeInTheDocument(); // 80 + 65 from portfolio items
      expect(
        screen.getByText("過去30dのポートフォリオからのダウンロード数"),
      ).toBeInTheDocument();
    });
  });

  it("should generate engagement rate insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("エンゲージメント率")).toBeInTheDocument();
      expect(screen.getAllByText("25")).toHaveLength(2);
      expect(
        screen.getByText("ポートフォリオ項目あたりの平均閲覧数"),
      ).toBeInTheDocument();
    });
  });

  it("should generate search interest insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("検索関心度")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument(); // 25 + 20 + 15 from portfolio-related queries
      expect(
        screen.getByText("過去30dのポートフォリオ関連検索数"),
      ).toBeInTheDocument();
    });
  });

  it("should generate portfolio count insights", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオ項目数")).toBeInTheDocument();
      expect(screen.getAllByText("25")).toHaveLength(2);
      expect(
        screen.getByText("公開済みポートフォリオ項目の総数"),
      ).toBeInTheDocument();
    });
  });

  it("should display trend icons correctly", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      // Should have trend icons (up, down, or stable) by looking for SVG elements
      const svgElements = document.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  it("should display recommended actions", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("💡 おすすめアクション")).toBeInTheDocument();
      expect(
        screen.getByText("• 人気作品をSNSでシェアしてさらなる露出を"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "• ダウンロード可能なコンテンツを増やしてエンゲージメント向上",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("• 検索されやすいキーワードで作品説明を最適化"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("• 人気カテゴリでより多くのコンテンツ制作を検討"),
      ).toBeInTheDocument();
    });
  });

  it("should handle different timeframes", async () => {
    const { rerender } = render(<PortfolioInsights timeframe="7d" />);

    await waitFor(() => {
      expect(screen.getByText("過去 7d")).toBeInTheDocument();
    });

    rerender(<PortfolioInsights timeframe="90d" />);

    await waitFor(() => {
      expect(screen.getByText("過去 90d")).toBeInTheDocument();
    });
  });

  it("should handle fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(
        screen.getByText("インサイトの読み込みに失敗しました"),
      ).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should handle HTTP error response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(
        screen.getByText("インサイトの読み込みに失敗しました"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Failed to fetch analytics data"),
      ).toBeInTheDocument();
    });
  });

  it("should show empty state when no insights are generated", async () => {
    const emptyData = {
      ...mockAnalyticsData,
      engagement: {
        topContent: [],
        topDownloads: [],
        topQueries: [],
      },
      content: {
        byType: {},
        byStatus: {},
      },
      performance: null,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyData),
    });

    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("インサイトがありません")).toBeInTheDocument();
      expect(
        screen.getByText(
          "ポートフォリオのエンゲージメントが増えるとインサイトが表示されます",
        ),
      ).toBeInTheDocument();
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <PortfolioInsights className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should fetch analytics with detailed parameter", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/stats/analytics?detailed=true",
      );
    });
  });

  it("should handle content-specific insights when contentId is provided", async () => {
    render(<PortfolioInsights contentId="web-design" />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオインサイト")).toBeInTheDocument();
    });
  });

  it("should display correct metric icons", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      // Check for various metric icons by looking for SVG elements
      const svgElements = document.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  it("should show percentage changes with correct formatting", async () => {
    render(<PortfolioInsights />);

    await waitFor(() => {
      // Should show percentage changes (simulated random values)
      const percentageElements = screen.getAllByText(/%$/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });
  });

  it("should handle missing performance data gracefully", async () => {
    const dataWithoutPerformance = {
      ...mockAnalyticsData,
      performance: undefined,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithoutPerformance),
    });

    render(<PortfolioInsights />);

    await waitFor(() => {
      expect(screen.getByText("ポートフォリオインサイト")).toBeInTheDocument();
      // Should still show other insights even without performance data
      expect(screen.getByText("ポートフォリオ閲覧数")).toBeInTheDocument();
    });
  });

  it("should filter portfolio-related search queries correctly", async () => {
    const dataWithMixedQueries = {
      ...mockAnalyticsData,
      engagement: {
        ...mockAnalyticsData.engagement,
        topQueries: [
          { query: "portfolio design", count: 25 },
          { query: "random query", count: 30 },
          { query: "work samples", count: 20 },
          { query: "project showcase", count: 15 },
          { query: "unrelated search", count: 10 },
        ],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithMixedQueries),
    });

    render(<PortfolioInsights />);

    await waitFor(() => {
      // Should only count portfolio-related queries: 25 + 20 + 15 = 60
      expect(screen.getByText("60")).toBeInTheDocument();
    });
  });
});
