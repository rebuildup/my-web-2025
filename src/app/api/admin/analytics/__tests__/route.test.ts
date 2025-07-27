/**
 * @jest-environment node
 */
import { GET, POST } from "../route";
import { NextRequest } from "next/server";
import * as analytics from "@/lib/admin/analytics";

// Mock the analytics module
jest.mock("@/lib/admin/analytics");
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

// Mock process.env
const originalEnv = process.env;

describe("/api/admin/analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: "development" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("GET", () => {
    it("should return statistics data in development", async () => {
      const mockStats = {
        content: { total: 10, byType: {}, byStatus: {}, recentlyUpdated: [] },
        files: {
          totalSize: 1024,
          imageCount: 5,
          videoCount: 2,
          downloadCount: 3,
        },
        performance: { lastBuildTime: "2025-01-27T02:26:00.000Z" },
        system: {
          nodeVersion: "v18.17.0",
          environment: "development",
          uptime: 3600,
          memoryUsage: {} as NodeJS.MemoryUsage,
          timestamp: "2025-01-27T02:26:00.000Z",
        },
      };

      mockAnalytics.getSiteStatistics.mockResolvedValue(mockStats);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics?type=statistics",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockStats);
      expect(mockAnalytics.getSiteStatistics).toHaveBeenCalled();
    });

    it("should return metrics data", async () => {
      const mockMetrics = [
        {
          id: "test-1",
          title: "Test Content",
          type: "portfolio",
          views: 100,
          performance: {},
        },
      ];

      mockAnalytics.getContentMetrics.mockResolvedValue(mockMetrics);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics?type=metrics",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockMetrics);
      expect(mockAnalytics.getContentMetrics).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockAnalytics.getSiteStatistics.mockRejectedValue(
        new Error("Test error"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics?type=statistics",
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to retrieve analytics data");
    });
  });

  describe("POST", () => {
    it("should create backup successfully", async () => {
      const mockBackupPath = "/test/backups/backup-2025-01-27";
      mockAnalytics.createBackup.mockResolvedValue(mockBackupPath);
      mockAnalytics.logAdminAction.mockResolvedValue();

      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics",
        {
          method: "POST",
          body: JSON.stringify({ action: "backup" }),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.backupPath).toBe(mockBackupPath);
      expect(mockAnalytics.createBackup).toHaveBeenCalled();
    });

    it("should handle unknown actions", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/analytics",
        {
          method: "POST",
          body: JSON.stringify({ action: "unknown" }),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Unknown action");
    });
  });
});
