import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminAnalyticsPage from "../page";

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("AdminAnalyticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAnalyticsData = {
    statistics: {
      content: {
        total: 25,
        byType: { portfolio: 10, blog: 8, plugin: 5, tool: 2 },
        byStatus: { published: 20, draft: 3, archived: 2 },
        recentlyUpdated: [
          {
            id: "test-1",
            type: "portfolio",
            title: "Test Portfolio",
            status: "published",
            updatedAt: "2025-01-26T10:00:00.000Z",
          },
        ],
      },
      files: {
        totalSize: 52428800, // 50MB
        imageCount: 45,
        videoCount: 12,
        downloadCount: 8,
      },
      performance: {
        lastBuildTime: "2025-01-27T02:26:00.000Z",
        cacheHitRate: 0.85,
        averageLoadTime: 1.2,
      },
      system: {
        nodeVersion: "v18.17.0",
        environment: "development",
        uptime: 7200, // 2 hours
        memoryUsage: {
          rss: 50000000,
          heapTotal: 30000000,
          heapUsed: 20000000,
          external: 5000000,
          arrayBuffers: 1000000,
        },
        timestamp: "2025-01-27T02:26:00.000Z",
      },
    },
    metrics: [
      {
        id: "portfolio-1",
        title: "Amazing Portfolio Project",
        type: "portfolio",
        views: 345,
        downloads: 23,
        performance: { loadTime: 1.1 },
      },
      {
        id: "blog-1",
        title: "How to Build Great UIs",
        type: "blog",
        views: 234,
        performance: { loadTime: 0.8 },
      },
    ],
    health: {
      status: "healthy" as const,
      checks: [
        {
          name: "File System Access",
          status: "pass" as const,
          message: "Public directory is accessible",
          timestamp: "2025-01-27T02:26:00.000Z",
        },
        {
          name: "Memory Usage",
          status: "pass" as const,
          message: "Memory usage: 66.7%",
          timestamp: "2025-01-27T02:26:00.000Z",
        },
      ],
      alerts: [],
    },
    logs: [
      {
        id: "log-1",
        action: "backup_created",
        resource: "system",
        details: { backupPath: "/test/backup" },
        timestamp: "2025-01-27T02:00:00.000Z",
        ip: "localhost",
        userAgent: "test-agent",
      },
    ],
  };

  it("should render loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminAnalyticsPage />);

    expect(screen.getByText("Loading analytics data...")).toBeInTheDocument();
    expect(screen.getByText("Analytics & Monitoring")).toBeInTheDocument();
  });

  it("should render analytics data successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
    });

    // Check system health
    expect(screen.getByText("Overall Status: HEALTHY")).toBeInTheDocument();

    // Check site statistics
    expect(screen.getByText("Site Statistics")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument(); // Total content
    expect(screen.getByText("50 MB")).toBeInTheDocument(); // File size

    // Check content performance
    expect(screen.getByText("Content Performance")).toBeInTheDocument();
    expect(screen.getByText("Amazing Portfolio Project")).toBeInTheDocument();
    expect(screen.getByText("345 views")).toBeInTheDocument();

    // Check recent activity
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Test Portfolio")).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API Error"));

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });

    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should handle HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch analytics data/),
      ).toBeInTheDocument();
    });
  });

  it("should refresh data when refresh button is clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
    });

    const refreshButton = screen.getByText("Refresh Data");
    fireEvent.click(refreshButton);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should create backup when backup button is clicked", async () => {
    // Initial data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    // Backup request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Backup created successfully",
        backupPath: "/test/backup-123",
      }),
    } as Response);

    // Refresh data after backup
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
    });

    const backupButton = screen.getByText("Create Backup");
    fireEvent.click(backupButton);

    expect(screen.getByText("Creating Backup...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Backup created successfully/),
      ).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/admin/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "backup" }),
    });
  });

  it("should handle backup errors", async () => {
    // Initial data fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    // Backup request fails
    mockFetch.mockRejectedValueOnce(new Error("Backup failed"));

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
    });

    const backupButton = screen.getByText("Create Backup");
    fireEvent.click(backupButton);

    await waitFor(() => {
      expect(screen.getByText(/Error: Backup failed/)).toBeInTheDocument();
    });
  });

  it("should display system health warnings", async () => {
    const warningData = {
      ...mockAnalyticsData,
      health: {
        status: "warning" as const,
        checks: [
          {
            name: "Memory Usage",
            status: "warning" as const,
            message: "Moderate memory usage: 75%",
            timestamp: "2025-01-27T02:26:00.000Z",
          },
        ],
        alerts: [
          {
            level: "warning" as const,
            message: "High memory usage detected",
            timestamp: "2025-01-27T02:26:00.000Z",
          },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => warningData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Overall Status: WARNING")).toBeInTheDocument();
    });

    expect(screen.getByText("Active Alerts")).toBeInTheDocument();
    expect(screen.getByText("High memory usage detected")).toBeInTheDocument();
  });

  it("should format bytes correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("50 MB")).toBeInTheDocument(); // 52428800 bytes = 50 MB
    });
  });

  it("should format uptime correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("2h 0m 0s")).toBeInTheDocument(); // 7200 seconds = 2 hours
    });
  });

  it("should display navigation links", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalyticsData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Data Manager →")).toBeInTheDocument();
    });
  });

  it("should handle empty data gracefully", async () => {
    const emptyData = {
      statistics: {
        content: { total: 0, byType: {}, byStatus: {}, recentlyUpdated: [] },
        files: { totalSize: 0, imageCount: 0, videoCount: 0, downloadCount: 0 },
        performance: {},
        system: {
          nodeVersion: "v18.17.0",
          environment: "development",
          uptime: 0,
          memoryUsage: {
            rss: 0,
            heapTotal: 0,
            heapUsed: 0,
            external: 0,
            arrayBuffers: 0,
          },
          timestamp: "2025-01-27T02:26:00.000Z",
        },
      },
      metrics: [],
      health: { status: "healthy" as const, checks: [], alerts: [] },
      logs: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyData,
    } as Response);

    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Health")).toBeInTheDocument();
    });

    expect(screen.getAllByText("0")).toHaveLength(4); // Multiple zeros for different stats
    expect(screen.getByText("0 Bytes")).toBeInTheDocument(); // File size
  });
});
