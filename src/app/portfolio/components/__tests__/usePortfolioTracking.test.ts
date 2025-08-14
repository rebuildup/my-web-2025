import { jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import {
  usePortfolioDetailTracking,
  usePortfolioGalleryTracking,
  usePortfolioItemTracking,
  usePortfolioTracking,
} from "../usePortfolioTracking";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console methods
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

describe("usePortfolioTracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("usePortfolioTracking", () => {
    it("should track view automatically when trackViews is true", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      // Fast forward past debounce time
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining('"id":"portfolio-test-content"'),
        });
      });
    });

    it("should not track view when trackViews is false", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: false,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it("should not track view when contentId is empty", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it("should use custom debounce time", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
          debounceMs: 5000,
        }),
      );

      // Should not track yet
      jest.advanceTimersByTime(2000);
      expect(mockFetch).not.toHaveBeenCalled();

      // Should track after custom debounce time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("should use custom content type", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          contentType: "portfolio-gallery",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining(
            '"id":"portfolio-gallery-test-content"',
          ),
        });
      });
    });

    it("should track view only once", async () => {
      const { rerender } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Rerender should not trigger another tracking call
      rerender();
      jest.advanceTimersByTime(2000);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle view tracking error gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("should handle HTTP error response for view tracking", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("should return trackDownload function", () => {
      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
        }),
      );

      expect(typeof result.current.trackDownload).toBe("function");
    });

    it("should track download when trackDownloads is true", async () => {
      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackDownloads: true,
        }),
      );

      const success = await result.current.trackDownload(
        "test-file.pdf",
        "pdf",
      );

      expect(mockFetch).toHaveBeenCalledWith("/api/stats/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining('"id":"portfolio-test-content"'),
      });

      expect(success).toBe(true);
    });

    it("should not track download when trackDownloads is false", async () => {
      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackDownloads: false,
        }),
      );

      const success = await result.current.trackDownload(
        "test-file.pdf",
        "pdf",
      );

      expect(mockFetch).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it("should handle download tracking error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackDownloads: true,
        }),
      );

      const success = await result.current.trackDownload(
        "test-file.pdf",
        "pdf",
      );

      expect(mockFetch).toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it("should return hasTrackedView status", async () => {
      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      expect(result.current.hasTrackedView).toBe(false);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(result.current.hasTrackedView).toBe(true);
      });
    });

    it("should cleanup timeout on unmount", () => {
      const { unmount } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("usePortfolioGalleryTracking", () => {
    it("should use correct content type and settings", async () => {
      renderHook(() => usePortfolioGalleryTracking("develop"));

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining('"id":"portfolio-gallery-develop"'),
        });
      });
    });
  });

  describe("usePortfolioDetailTracking", () => {
    it("should use correct content type and enable both tracking types", async () => {
      const { result } = renderHook(() =>
        usePortfolioDetailTracking("item-123"),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining('"id":"portfolio-detail-item-123"'),
        });
      });

      // Should also be able to track downloads
      const success = await result.current.trackDownload("file.zip", "zip");
      expect(success).toBe(true);
    });
  });

  describe("usePortfolioItemTracking", () => {
    it("should use correct content type and enable both tracking types", async () => {
      const { result } = renderHook(() => usePortfolioItemTracking("item-456"));

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining('"id":"portfolio-item-456"'),
        });
      });

      // Should also be able to track downloads
      const success = await result.current.trackDownload("asset.png", "png");
      expect(success).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle successful download tracking with response data", async () => {
      const responseData = { downloadId: "123", success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackDownloads: true,
        }),
      );

      await result.current.trackDownload("test.pdf", "pdf");

      expect(mockFetch).toHaveBeenCalled();
    });

    it("should handle download tracking without file details", async () => {
      const { result } = renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackDownloads: true,
        }),
      );

      await result.current.trackDownload();

      expect(mockFetch).toHaveBeenCalledWith("/api/stats/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining('"id":"portfolio-test-content"'),
      });
    });

    it("should log successful view tracking", async () => {
      renderHook(() =>
        usePortfolioTracking({
          contentId: "test-content",
          trackViews: true,
        }),
      );

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });
});
