import { render, screen, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import PortfolioAnalytics from "../components/PortfolioAnalytics";

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("Portfolio Analytics Components", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("PortfolioAnalytics", () => {
    it("renders single item stats correctly", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ viewCount: 150 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ downloadCount: 25 }),
        } as Response);

      render(<PortfolioAnalytics contentId="test-portfolio" />);

      await waitFor(() => {
        expect(screen.getByText("150 views")).toBeInTheDocument();
        expect(screen.getByText("25 downloads")).toBeInTheDocument();
      });
    });

    it("handles API errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("API Error"));

      render(<PortfolioAnalytics contentId="test-portfolio" />);

      await waitFor(() => {
        expect(
          screen.getByText("統計データが利用できません"),
        ).toBeInTheDocument();
      });
    });
  });
});
