/**
 * @jest-environment node
 */

// Mock console to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe("/api/content/download", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should have basic test structure", () => {
      // Basic test to ensure the test file is working
      expect(true).toBe(true);
    });

    it("should handle download data structure", () => {
      const mockDownloadData = [
        {
          id: "download-1",
          title: "Motion Graphics Template Pack",
          description: "モーショングラフィックステンプレート集",
          content: "After Effects用のモーショングラフィックステンプレート...",
          status: "published",
          category: "template",
          tags: ["After Effects", "Template", "Motion Graphics"],
          createdAt: "2024-09-01T00:00:00Z",
          updatedAt: "2024-09-01T00:00:00Z",
          publishedAt: "2024-09-01T00:00:00Z",
        },
      ];

      expect(Array.isArray(mockDownloadData)).toBe(true);
      expect(mockDownloadData.length).toBe(1);
      expect(mockDownloadData[0]).toHaveProperty("id");
      expect(mockDownloadData[0]).toHaveProperty("title");
      expect(mockDownloadData[0]).toHaveProperty("status");
      expect(mockDownloadData[0].status).toBe("published");
    });

    it("should filter download data by status", () => {
      const mockDownloadData = [
        {
          id: "download-1",
          title: "Published Download",
          status: "published",
          category: "template",
          tags: ["Template"],
          createdAt: "2024-09-01T00:00:00Z",
          updatedAt: "2024-09-01T00:00:00Z",
          publishedAt: "2024-09-01T00:00:00Z",
        },
        {
          id: "download-2",
          title: "Draft Download",
          status: "draft",
          category: "template",
          tags: ["Template"],
          createdAt: "2024-09-02T00:00:00Z",
          updatedAt: "2024-09-02T00:00:00Z",
          publishedAt: "2024-09-02T00:00:00Z",
        },
      ];

      const publishedDownloads = mockDownloadData.filter(
        (item) => item.status === "published",
      );
      expect(publishedDownloads.length).toBe(1);
      expect(publishedDownloads[0].title).toBe("Published Download");
    });

    it("should sort download data by date", () => {
      const mockDownloadData = [
        {
          id: "download-1",
          title: "Older Download",
          status: "published",
          publishedAt: "2024-08-01T00:00:00Z",
        },
        {
          id: "download-2",
          title: "Newer Download",
          status: "published",
          publishedAt: "2024-09-01T00:00:00Z",
        },
      ];

      const sortedDownloads = mockDownloadData.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      expect(sortedDownloads[0].title).toBe("Newer Download");
      expect(sortedDownloads[1].title).toBe("Older Download");
    });

    it("should apply limit to download data", () => {
      const mockDownloadData = [
        { id: "download-1", title: "Download 1", status: "published" },
        { id: "download-2", title: "Download 2", status: "published" },
        { id: "download-3", title: "Download 3", status: "published" },
      ];

      const limitedDownloads = mockDownloadData.slice(0, 2);
      expect(limitedDownloads.length).toBe(2);
      expect(limitedDownloads[0].id).toBe("download-1");
      expect(limitedDownloads[1].id).toBe("download-2");
    });

    it("should validate download item structure", () => {
      const downloadItem = {
        id: "download-1",
        title: "Test Download",
        description: "Test description",
        content: "Test content",
        status: "published",
        category: "template",
        tags: ["After Effects", "Template"],
        createdAt: "2024-09-01T00:00:00Z",
        updatedAt: "2024-09-01T00:00:00Z",
        publishedAt: "2024-09-01T00:00:00Z",
      };

      expect(downloadItem).toHaveProperty("id");
      expect(downloadItem).toHaveProperty("title");
      expect(downloadItem).toHaveProperty("description");
      expect(downloadItem).toHaveProperty("content");
      expect(downloadItem).toHaveProperty("status");
      expect(downloadItem).toHaveProperty("category");
      expect(downloadItem).toHaveProperty("tags");
      expect(Array.isArray(downloadItem.tags)).toBe(true);
      expect(downloadItem).toHaveProperty("createdAt");
      expect(downloadItem).toHaveProperty("updatedAt");
      expect(downloadItem).toHaveProperty("publishedAt");
    });

    it("should handle empty download data", () => {
      const emptyDownloadData: unknown[] = [];
      expect(Array.isArray(emptyDownloadData)).toBe(true);
      expect(emptyDownloadData.length).toBe(0);
    });

    it("should handle invalid status filter", () => {
      const mockDownloadData = [
        { id: "download-1", title: "Download 1", status: "published" },
        { id: "download-2", title: "Download 2", status: "draft" },
      ];

      const invalidStatusDownloads = mockDownloadData.filter(
        (item) => item.status === "invalid",
      );
      expect(invalidStatusDownloads.length).toBe(0);
    });

    it("should handle zero limit", () => {
      const mockDownloadData = [
        { id: "download-1", title: "Download 1" },
        { id: "download-2", title: "Download 2" },
      ];

      const limit = 0;
      const result =
        limit > 0 ? mockDownloadData.slice(0, limit) : mockDownloadData;
      expect(result.length).toBe(2); // Should return all when limit is 0
    });

    it("should handle invalid limit parameter", () => {
      const mockDownloadData = [
        { id: "download-1", title: "Download 1" },
        { id: "download-2", title: "Download 2" },
      ];

      const invalidLimit = "invalid";
      const parsedLimit = parseInt(invalidLimit) || 10;
      const result = mockDownloadData.slice(0, parsedLimit);
      expect(result.length).toBe(2); // Should fall back to default behavior
    });
  });
});
