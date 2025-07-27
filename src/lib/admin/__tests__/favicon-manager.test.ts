/**
 * Favicon Manager Tests
 * Task 9.3.1 - Favicon management tests
 */

import { faviconManager } from "../favicon-manager";
import { adminUtils } from "../utils";

// Mock dependencies
jest.mock("../utils", () => ({
  adminUtils: {
    validateAdminRequest: jest.fn(),
    logAdminAction: jest.fn(),
  },
  AdminError: class AdminError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AdminError";
    }
  },
  ADMIN_CONSTANTS: {
    DIRECTORIES: {
      FAVICONS: "public/favicons",
    },
  },
}));

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    copyFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

// Mock File constructor for Node.js environment
global.File = class File {
  constructor(
    public content: string[],
    public name: string,
    public options: { type: string },
  ) {}
  get size() {
    return this.content.join("").length;
  }
  get type() {
    return this.options.type;
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
} as unknown as typeof File;

describe("FaviconManager", () => {
  const mockFile = new File(["favicon content"], "favicon.ico", {
    type: "image/x-icon",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
      valid: true,
    });
  });

  describe("uploadFavicon", () => {
    it("should upload favicon successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.mkdir.mockResolvedValue(undefined);
      fs.access.mockRejectedValue(new Error("File not found")); // No existing file
      fs.writeFile.mockResolvedValue(undefined);

      const result = await faviconManager.uploadFavicon(mockFile, "ico");

      expect(result.success).toBe(true);
      expect(result.faviconInfo).toBeDefined();
      expect(result.faviconInfo?.format).toBe("ico");
      expect(result.faviconInfo?.fileName).toBe("favicon.ico");
      expect(result.errors).toHaveLength(0);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Favicon uploaded",
        expect.any(Object),
      );
    });

    it("should fail when admin access is denied", async () => {
      (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
        valid: false,
        error: "Access denied",
      });

      const result = await faviconManager.uploadFavicon(mockFile, "ico");

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Access denied");
    });

    it("should validate file size", async () => {
      // Create a mock file that's too large
      const largeContent = new Array(2 * 1024 * 1024).fill("a").join(""); // 2MB
      const largeFile = new File([largeContent], "favicon.ico", {
        type: "image/x-icon",
      });

      const result = await faviconManager.uploadFavicon(largeFile, "ico");

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) => error.includes("File size too large")),
      ).toBe(true);
    });

    it("should validate format", async () => {
      const result = await faviconManager.uploadFavicon(
        mockFile,
        "invalid" as never,
      );

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Unsupported format")),
      ).toBe(true);
    });
  });

  describe("getFaviconStatus", () => {
    it("should return status with all required files present", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockStats = {
        size: 1024,
        mtime: new Date("2025-01-27T00:00:00.000Z"),
      };
      fs.stat.mockResolvedValue(mockStats);

      const result = await faviconManager.getFaviconStatus();

      expect(result.hasAllRequired).toBe(true);
      expect(result.missingFiles).toHaveLength(0);
      expect(result.activeFiles).toHaveLength(3); // ico, png, svg
      expect(result.totalSize).toBe(3072); // 3 * 1024
    });

    it("should return status with missing files", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.stat.mockRejectedValue(new Error("File not found"));

      const result = await faviconManager.getFaviconStatus();

      expect(result.hasAllRequired).toBe(false);
      expect(result.missingFiles).toHaveLength(3);
      expect(result.activeFiles).toHaveLength(0);
      expect(result.totalSize).toBe(0);
    });
  });

  describe("generateFaviconManifest", () => {
    it("should generate favicon manifest HTML", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockStats = {
        size: 1024,
        mtime: new Date("2025-01-27T00:00:00.000Z"),
      };
      fs.stat.mockResolvedValue(mockStats);

      const result = await faviconManager.generateFaviconManifest();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((line) => line.includes('rel="icon"'))).toBe(true);
      expect(result.some((line) => line.includes("favicon.ico"))).toBe(true);
      expect(result.some((line) => line.includes("favicon.png"))).toBe(true);
      expect(result.some((line) => line.includes("favicon.svg"))).toBe(true);
    });
  });

  describe("deleteFavicon", () => {
    it("should delete favicon successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.access.mockResolvedValue(undefined); // File exists
      fs.mkdir.mockResolvedValue(undefined);
      fs.copyFile.mockResolvedValue(undefined); // Backup
      fs.unlink.mockResolvedValue(undefined);

      const result = await faviconManager.deleteFavicon("ico");

      expect(result).toBe(true);
      expect(fs.unlink).toHaveBeenCalled();
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Favicon deleted",
        expect.any(Object),
      );
    });

    it("should fail when admin access is denied", async () => {
      (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
        valid: false,
        error: "Access denied",
      });

      const result = await faviconManager.deleteFavicon("ico");

      expect(result).toBe(false);
    });
  });

  describe("restoreFavicon", () => {
    it("should restore favicon from backup successfully", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.access.mockResolvedValue(undefined); // Backup exists
      fs.mkdir.mockResolvedValue(undefined);
      fs.copyFile.mockResolvedValue(undefined);

      const result = await faviconManager.restoreFavicon(
        "ico",
        "2025-01-27T00-00-00-000Z",
      );

      expect(result).toBe(true);
      expect(fs.copyFile).toHaveBeenCalled();
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Favicon restored",
        expect.any(Object),
      );
    });

    it("should fail when backup doesn't exist", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.access.mockRejectedValue(new Error("File not found"));

      const result = await faviconManager.restoreFavicon("ico", "nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("listFaviconBackups", () => {
    it("should list favicon backups", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockFiles = [
        "favicon.ico.2025-01-27T00-00-00-000Z.backup",
        "favicon.png.2025-01-26T00-00-00-000Z.backup",
        "favicon.svg.2025-01-25T00-00-00-000Z.backup",
        "other-file.txt", // Should be filtered out
      ];
      fs.readdir.mockResolvedValue(mockFiles);

      const result = await faviconManager.listFaviconBackups();

      expect(result).toHaveLength(3);
      expect(result[0].format).toBe("ico");
      expect(result[0].timestamp).toBe("2025-01-27T00-00-00-000Z");
      expect(result[1].format).toBe("png");
      expect(result[2].format).toBe("svg");
    });

    it("should return empty array when no backups exist", async () => {
      const fs = jest.requireMock("fs").promises;
      fs.readdir.mockRejectedValue(new Error("Directory not found"));

      const result = await faviconManager.listFaviconBackups();

      expect(result).toEqual([]);
    });
  });

  describe("cleanOldBackups", () => {
    it("should clean old backups keeping only 10 most recent", async () => {
      const fs = jest.requireMock("fs").promises;
      // Create 15 mock backup files
      const mockFiles = Array.from({ length: 15 }, (_, i) => {
        const timestamp = new Date(2025, 0, i + 1)
          .toISOString()
          .replace(/[:.]/g, "-");
        return `favicon.ico.${timestamp}.backup`;
      });
      fs.readdir.mockResolvedValue(mockFiles);
      fs.unlink.mockResolvedValue(undefined);

      const result = await faviconManager.cleanOldBackups();

      expect(result).toBe(5); // Should delete 5 oldest files
      expect(fs.unlink).toHaveBeenCalledTimes(5);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Old favicon backups cleaned",
        expect.any(Object),
      );
    });

    it("should not delete anything when less than 10 backups exist", async () => {
      const fs = jest.requireMock("fs").promises;
      const mockFiles = [
        "favicon.ico.2025-01-27T00-00-00-000Z.backup",
        "favicon.png.2025-01-26T00-00-00-000Z.backup",
      ];
      fs.readdir.mockResolvedValue(mockFiles);

      const result = await faviconManager.cleanOldBackups();

      expect(result).toBe(0);
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
});
