import { render, screen, waitFor } from "@testing-library/react";
import PortfolioAnalytics from "../PortfolioAnalytics";

describe("PortfolioAnalytics", () => {
  beforeEach(() => {
    // @ts-expect-error - Mocking global fetch for testing
    global.fetch = jest.fn();
  });

  it("shows loading and then single item stats", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith("/api/stats/view")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ viewCount: 123 }),
        });
      }
      if (url.startsWith("/api/stats/download")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ downloadCount: 45 }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<PortfolioAnalytics contentId="portfolio-1" />);
    expect(screen.getByText(/統計データを読み込み中/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/123 views/i)).toBeInTheDocument();
    });
  });

  it("shows summary when requested", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            totalViews: 10,
            mostViewed: [{ id: "portfolio-abc", views: 5 }],
          }),
      }) // /api/stats/view
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            totalDownloads: 3,
            mostDownloaded: [{ id: "portfolio-xyz", downloads: 2 }],
          }),
      }); // /api/stats/download

    render(<PortfolioAnalytics showSummary />);
    await waitFor(() => {
      expect(screen.getByText(/総閲覧数/i)).toBeInTheDocument();
    });
  });
});
