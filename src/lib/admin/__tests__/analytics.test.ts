import {
  getSiteStatistics,
  getContentMetrics,
  getSystemHealth,
  getAuditLogs,
  logAdminAction,
  createBackup,
} from "../analytics";
import fs from "fs";

// Mock fs module
jest.mock("fs");
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock process
const mockProcess = {
  version: "v18.17.0",
  env: { NODE_ENV: "development" },
  uptime: jest.fn(() => 3600),
  memoryUsage: jest.fn(() => ({
    rss: 50000000,
    heapTotal: 30000000,
    heapUsed: 20000000,
    external: 5000000,
    arrayBuffers: 1000000,
  })),
  cwd: jest.fn(() => "/test"),
};

Object.defineProperty(global, "process", {
  value: mockProcess,
});

describe("Analytics Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("{}");
    mockFs.readdirSync.mockReturnValue([]);
  });

  describe("getSiteStatistics", () => {
    it("should return comprehensive site statistics", async () => {
      // Mock content data
      mockFs.readFileSync.mockImplementation((filePath) => {
        const path = String(filePath);
        if (path.includes("portfolio.json")) {
          return JSON.stringify([
            {
              id: "portfolio-1",
              type: "portfolio",
              title: "Test Portfolio",
              status: "published",
              updatedAt: new Date().toISOString(),
            },
          ]);
        }
        if (path.includes("blog.json")) {
          return JSON.stringify([
            {
              id: "blog-1",
              type: "blog",
              title: "Test Blog",
              status: "published",
            },
          ]);
        }
        if (path.includes("performance.json")) {
          return JSON.stringify({
            lastBuildTime: "2025-01-27T02:26:00.000Z",
            cacheHitRate: 0.85,
            averageLoadTime: 1.2,
          });
        }
        return "{}";
      });

      // Mock directory reading
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        { name: "test.jpg", isDirectory: () => false },
      ]);
      mockFs.statSync.mockReturnValue({ size: 1024 } as fs.Stats);

      const statistics = await getSiteStatistics();

      expect(statistics).toHaveProperty("content");
      expect(statistics).toHaveProperty("files");
      expect(statistics).toHaveProperty("performance");
      expect(statistics).toHaveProperty("system");
      expect(statistics.content.total).toBeGreaterThan(0);
      expect(statistics.system.nodeVersion).toBe("v18.17.0");
    });

    it("should handle missing data files gracefully", async () => {
      mockFs.existsSync.mockReturnValue(false);

      const statistics = await getSiteStatistics();

      expect(statistics.content.total).toBe(0);
      expect(statistics.files.totalSize).toBe(0);
    });
  });

  describe("getContentMetrics", () => {
    it("should return content performance metrics", async () => {
      mockFs.readFileSync.mockImplementation((filePath) => {
        const path = String(filePath);
        if (path.includes("view-stats.json")) {
          return JSON.stringify({
            "portfolio-1": 125,
            "blog-1": 234,
          });
        }
        if (path.includes("download-stats.json")) {
          return JSON.stringify({
            "plugin-1": 23,
          });
        }
        if (path.includes("portfolio.json")) {
          return JSON.stringify([
            {
              id: "portfolio-1",
              type: "portfolio",
              title: "Test Portfolio",
            },
          ]);
        }
        return "[]";
      });

      const metrics = await getContentMetrics();

      expect(Array.isArray(metrics)).toBe(true);
      if (metrics.length > 0) {
        expect(metrics[0]).toHaveProperty("id");
        expect(metrics[0]).toHaveProperty("title");
        expect(metrics[0]).toHaveProperty("views");
      }
    });

    it("should handle missing stats files", async () => {
      mockFs.existsSync.mockReturnValue(false);

      const metrics = await getContentMetrics();

      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe("getSystemHealth", () => {
    it("should return system health status", async () => {
      mockFs.accessSync.mockImplementation(() => {
        // Mock successful access
      });

      const health = await getSystemHealth();

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("checks");
      expect(health).toHaveProperty("alerts");
      expect(Array.isArray(health.checks)).toBe(true);
      expect(Array.isArray(health.alerts)).toBe(true);
    });

    it("should detect file system errors", async () => {
      mockFs.accessSync.mockImplementation(() => {
        throw new Error("Access denied");
      });

      const health = await getSystemHealth();

      expect(health.status).toBe("error");
      expect(health.checks.some((check) => check.status === "fail")).toBe(true);
      expect(health.alerts.length).toBeGreaterThan(0);
    });
  });

  describe("logAdminAction", () => {
    it("should log admin actions", async () => {
      mockFs.writeFileSync.mockImplementation(() => undefined);
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.readFileSync.mockReturnValue("[]");

      await logAdminAction("test_action", "test_resource", { key: "value" });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle logging errors gracefully", async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error("Write error");
      });

      // Should not throw
      await expect(
        logAdminAction("test_action", "test_resource"),
      ).resolves.toBeUndefined();
    });
  });

  describe("getAuditLogs", () => {
    it("should return audit logs", async () => {
      const mockLogs = [
        {
          id: "test-1",
          action: "test_action",
          resource: "test_resource",
          details: {},
          timestamp: new Date().toISOString(),
        },
      ];

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockLogs));

      const logs = await getAuditLogs();

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(1);
      expect(logs[0]).toHaveProperty("action");
    });

    it("should handle missing log file", async () => {
      mockFs.existsSync.mockReturnValue(false);

      const logs = await getAuditLogs();

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });
  });

  describe("createBackup", () => {
    it("should create backup successfully", async () => {
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);
      mockFs.copyFileSync.mockImplementation(() => undefined);
      mockFs.readdirSync.mockReturnValue([]);

      const backupPath = await createBackup();

      expect(typeof backupPath).toBe("string");
      expect(backupPath).toContain("backup-");
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle backup errors", async () => {
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error("Mkdir error");
      });

      await expect(createBackup()).rejects.toThrow("Failed to create backup");
    });
  });
});
