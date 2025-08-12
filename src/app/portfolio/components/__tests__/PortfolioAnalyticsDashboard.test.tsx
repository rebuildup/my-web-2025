import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioAnalyticsDashboard from "../PortfolioAnalyticsDashboard";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("PortfolioAnalyticsDashboard", () => {
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
        { query: "web design", count: 25 },
        { query: "ui kit", count: 20 },
        { query: "portfolio", count: 15 },
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
    render(<PortfolioAnalyticsDashboard />);

    expect(screen.getByText("分析データを読み込み中...")).toBeInTheDocument();
  });

  it("should render analytics data after loading", async () => {
    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("総閲覧数")).toBeInTheDocument();
      expect(screen.getByText("1,250")).toBeInTheDocument();
      expect(screen.getByText("ダウンロード数")).toBeInTheDocument();
      expect(screen.getByText("320")).toBeInTheDocument();
      expect(screen.getByText("ポートフォリオ項目")).toBeInTheDocument();
      expect(screen.getAllByText("25")[0]).toBeInTheDocument();
      expect(screen.getByText("検索数")).toBeInTheDocument();
      expect(screen.getByText("180")).toBeInTheDocument();
    });
  });

  it("should render detailed performance metrics when detailed prop is true", async () => {
    render(<PortfolioAnalyticsDashboard detailed={true} />);

    await waitFor(() => {
      expect(screen.getByText("平均閲覧数/項目")).toBeInTheDocument();
      expect(screen.getByText("25.0")).toBeInTheDocument();
      expect(screen.getByText("平均DL数/項目")).toBeInTheDocument();
      expect(screen.getByText("6.4")).toBeInTheDocument();
      expect(screen.getByText("検索/閲覧比率")).toBeInTheDocument();
      expect(screen.getByText("14.4%")).toBeInTheDocument();
    });
  });

  it("should not render performance metrics when detailed prop is false", async () => {
    render(<PortfolioAnalyticsDashboard detailed={false} />);

    await waitFor(() => {
      expect(screen.queryByText("平均閲覧数/項目")).not.toBeInTheDocument();
      expect(screen.queryByText("平均DL数/項目")).not.toBeInTheDocument();
      expect(screen.queryByText("検索/閲覧比率")).not.toBeInTheDocument();
    });
  });

  it("should render top portfolio content", async () => {
    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("人気作品 (閲覧数)")).toBeInTheDocument();
      expect(screen.getAllByText("web design")[0]).toBeInTheDocument();
      expect(screen.getAllByText("mobile app")[0]).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("120")).toBeInTheDocument();
    });
  });

  it("should render top portfolio downloads", async () => {
    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("人気作品 (ダウンロード数)")).toBeInTheDocument();
      expect(screen.getAllByText("ui kit")[0]).toBeInTheDocument();
      expect(screen.getAllByText("icons")[0]).toBeInTheDocument();
      expect(screen.getByText("80")).toBeInTheDocument();
      expect(screen.getByText("65")).toBeInTheDocument();
    });
  });

  it("should render popular search queries", async () => {
    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("人気検索キーワード")).toBeInTheDocument();
      expect(screen.getAllByText("web design")).toHaveLength(2);
      expect(screen.getAllByText("ui kit")).toHaveLength(2);
      expect(screen.getByText("portfolio")).toBeInTheDocument();
      expect(screen.getAllByText("25")).toHaveLength(2);
      expect(screen.getAllByText("20")).toHaveLength(1);
      expect(screen.getAllByText("15")).toHaveLength(1);
    });
  });

  it("should render last updated timestamp", async () => {
    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/最終更新:/)).toBeInTheDocument();
      expect(screen.getByText(/2023\/12\/1/)).toBeInTheDocument();
    });
  });

  it("should handle fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("分析データの読み込みに失敗しました"),
      ).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should handle HTTP error response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("分析データの読み込みに失敗しました"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Failed to fetch analytics data"),
      ).toBeInTheDocument();
    });
  });

  it("should show empty state when no portfolio content exists", async () => {
    const emptyData = {
      ...mockAnalyticsData,
      engagement: {
        topContent: [],
        topDownloads: [],
        topQueries: [],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyData),
    });

    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("まだ閲覧データがありません"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("まだダウンロードデータがありません"),
      ).toBeInTheDocument();
    });
  });

  it("should not render search queries section when no queries exist", async () => {
    const noQueriesData = {
      ...mockAnalyticsData,
      engagement: {
        ...mockAnalyticsData.engagement,
        topQueries: [],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(noQueriesData),
    });

    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText("人気検索キーワード")).not.toBeInTheDocument();
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <PortfolioAnalyticsDashboard className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should fetch analytics with correct parameters", async () => {
    render(<PortfolioAnalyticsDashboard detailed={true} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/stats/analytics?detailed=true",
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );
    });
  });

  it("should set up refresh interval", async () => {
    jest.useFakeTimers();

    render(<PortfolioAnalyticsDashboard />);

    // Initial call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Fast forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);

    // Should have been called again
    expect(mockFetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it("should filter portfolio items correctly", async () => {
    const mixedData = {
      ...mockAnalyticsData,
      engagement: {
        topContent: [
          { id: "portfolio-web-design", views: 150 },
          { id: "blog-tutorial", views: 120 },
          { id: "portfolio-mobile-app", views: 100 },
        ],
        topDownloads: [
          { id: "portfolio-ui-kit", downloads: 80 },
          { id: "download-template", downloads: 65 },
          { id: "portfolio-icons", downloads: 45 },
        ],
        topQueries: [],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mixedData),
    });

    render(<PortfolioAnalyticsDashboard />);

    await waitFor(() => {
      // Should show portfolio items
      expect(screen.getByText("web design")).toBeInTheDocument();
      expect(screen.getByText("mobile app")).toBeInTheDocument();
      expect(screen.getByText("ui kit")).toBeInTheDocument();
      expect(screen.getByText("icons")).toBeInTheDocument();

      // Should not show non-portfolio items
      expect(screen.queryByText("tutorial")).not.toBeInTheDocument();
      expect(screen.queryByText("template")).not.toBeInTheDocument();
    });
  });
});
