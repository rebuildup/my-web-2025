/**
 * @jest-environment node
 */

import { promises as fs } from "fs";
import {
  cleanupOldBackups,
  createFileBackup,
  deleteBackupVersion,
  exportBackupData,
  FileVersion,
  getBackupStats,
  getFileVersions,
  importBackupData,
  restoreFileFromBackup,
} from "../file-backup";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    copyFile: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
  },
}));

// Mock crypto.subtle
const mockCrypto = {
  subtle: {
    digest: jest.fn(),
  },
};

Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

const mockFs = fs as jest.Mocked<typeof fs>;

beforeEach(() => {
  jest.clearAllMocks();

  // Mock crypto.subtle.digest
  mockCrypto.subtle.digest.mockResolvedValue(
    new ArrayBuffer(32), // SHA-256 produces 32 bytes
  );
});

describe("File Backup System", () => {
  const testFilePath = "/test/file.txt";
  const testFileContent = "test content";
  const testFileStats = { size: testFileContent.length };

  beforeEach(() => {
    // Setup default mocks
    mockFs.access.mockRejectedValue(new Error("Directory does not exist"));
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.readFile.mockImplementation((path) => {
      if (path.toString().includes("manifest.json")) {
        return Promise.resolve(
          JSON.stringify({
            versions: [],
            lastBackup: new Date().toISOString(),
            totalSize: 0,
          }),
        );
      }
      return Promise.resolve(Buffer.from(testFileContent));
    });
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.copyFile.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue(testFileStats as import("fs").Stats);
    mockFs.unlink.mockResolvedValue(undefined);
  });

  describe("createFileBackup", () => {
    it("should create a backup of a file", async () => {
      const version = await createFileBackup(testFilePath);

      expect(version).toHaveProperty("id");
      expect(version).toHaveProperty("originalPath", testFilePath);
      expect(version).toHaveProperty("backupPath");
      expect(version).toHaveProperty("timestamp");
      expect(version).toHaveProperty("size", testFileContent.length);
      expect(version).toHaveProperty("hash");

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.copyFile).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should include metadata when provided", async () => {
      const metadata = { author: "test", version: "1.0" };
      const version = await createFileBackup(testFilePath, metadata);

      expect(version.metadata).toEqual(metadata);
    });

    it("should limit versions to 10 per file", async () => {
      // Mock manifest with 10 existing versions
      const existingVersions: FileVersion[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `version-${i}`,
          originalPath: testFilePath,
          backupPath: `/backup/file-${i}.txt`,
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          size: 100,
          hash: `hash-${i}`,
        }),
      );

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: existingVersions,
              lastBackup: new Date().toISOString(),
              totalSize: 1000,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await createFileBackup(testFilePath);

      // Should delete old versions
      expect(mockFs.unlink).toHaveBeenCalled();
    });

    it("should handle backup directory creation", async () => {
      mockFs.access.mockRejectedValue(new Error("Directory does not exist"));

      await createFileBackup(testFilePath);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("backups"),
        { recursive: true },
      );
    });
  });

  describe("restoreFileFromBackup", () => {
    it("should restore a file from backup", async () => {
      const version: FileVersion = {
        id: "test-version",
        originalPath: testFilePath,
        backupPath: "/backup/file.txt",
        timestamp: new Date().toISOString(),
        size: 100,
        hash: "test-hash",
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [version],
              lastBackup: new Date().toISOString(),
              totalSize: 100,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await restoreFileFromBackup("test-version");

      expect(mockFs.copyFile).toHaveBeenCalledWith(
        version.backupPath,
        version.originalPath,
      );
    });

    it("should restore to custom target path", async () => {
      const version: FileVersion = {
        id: "test-version",
        originalPath: testFilePath,
        backupPath: "/backup/file.txt",
        timestamp: new Date().toISOString(),
        size: 100,
        hash: "test-hash",
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [version],
              lastBackup: new Date().toISOString(),
              totalSize: 100,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      const customPath = "/custom/path.txt";
      await restoreFileFromBackup("test-version", customPath);

      expect(mockFs.copyFile).toHaveBeenCalledWith(
        version.backupPath,
        customPath,
      );
    });

    it("should throw error for non-existent version", async () => {
      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [],
              lastBackup: new Date().toISOString(),
              totalSize: 0,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await expect(restoreFileFromBackup("non-existent")).rejects.toThrow(
        "Backup version non-existent not found",
      );
    });
  });

  describe("getFileVersions", () => {
    it("should return versions for a specific file", async () => {
      const versions: FileVersion[] = [
        {
          id: "version-1",
          originalPath: testFilePath,
          backupPath: "/backup/file-1.txt",
          timestamp: new Date().toISOString(),
          size: 100,
          hash: "hash-1",
        },
        {
          id: "version-2",
          originalPath: "/other/file.txt",
          backupPath: "/backup/other-1.txt",
          timestamp: new Date().toISOString(),
          size: 200,
          hash: "hash-2",
        },
      ];

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions,
              lastBackup: new Date().toISOString(),
              totalSize: 300,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      const fileVersions = await getFileVersions(testFilePath);

      expect(fileVersions).toHaveLength(1);
      expect(fileVersions[0].originalPath).toBe(testFilePath);
    });

    it("should return versions sorted by timestamp (newest first)", async () => {
      const now = Date.now();
      const versions: FileVersion[] = [
        {
          id: "version-1",
          originalPath: testFilePath,
          backupPath: "/backup/file-1.txt",
          timestamp: new Date(now - 2000).toISOString(),
          size: 100,
          hash: "hash-1",
        },
        {
          id: "version-2",
          originalPath: testFilePath,
          backupPath: "/backup/file-2.txt",
          timestamp: new Date(now - 1000).toISOString(),
          size: 100,
          hash: "hash-2",
        },
      ];

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions,
              lastBackup: new Date().toISOString(),
              totalSize: 200,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      const fileVersions = await getFileVersions(testFilePath);

      expect(fileVersions[0].id).toBe("version-2"); // Newer version first
      expect(fileVersions[1].id).toBe("version-1");
    });
  });

  describe("deleteBackupVersion", () => {
    it("should delete a backup version", async () => {
      const version: FileVersion = {
        id: "test-version",
        originalPath: testFilePath,
        backupPath: "/backup/file.txt",
        timestamp: new Date().toISOString(),
        size: 100,
        hash: "test-hash",
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [version],
              lastBackup: new Date().toISOString(),
              totalSize: 100,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await deleteBackupVersion("test-version");

      expect(mockFs.unlink).toHaveBeenCalledWith(version.backupPath);
      expect(mockFs.writeFile).toHaveBeenCalled(); // Manifest update
    });

    it("should throw error for non-existent version", async () => {
      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [],
              lastBackup: new Date().toISOString(),
              totalSize: 0,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await expect(deleteBackupVersion("non-existent")).rejects.toThrow(
        "Backup version non-existent not found",
      );
    });
  });

  describe("cleanupOldBackups", () => {
    it("should clean up old backups based on age", async () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

      const versions: FileVersion[] = [
        {
          id: "old-version",
          originalPath: testFilePath,
          backupPath: "/backup/old.txt",
          timestamp: oldDate.toISOString(),
          size: 100,
          hash: "old-hash",
        },
        {
          id: "recent-version",
          originalPath: testFilePath,
          backupPath: "/backup/recent.txt",
          timestamp: recentDate.toISOString(),
          size: 100,
          hash: "recent-hash",
        },
      ];

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions,
              lastBackup: new Date().toISOString(),
              totalSize: 200,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await cleanupOldBackups({ maxAge: 30, keepMinimum: 1 });

      // Should delete old version but keep recent one
      expect(mockFs.unlink).toHaveBeenCalledWith("/backup/old.txt");
    });

    it("should respect minimum versions to keep", async () => {
      const versions: FileVersion[] = Array.from({ length: 5 }, (_, i) => ({
        id: `version-${i}`,
        originalPath: testFilePath,
        backupPath: `/backup/file-${i}.txt`,
        timestamp: new Date(
          Date.now() - (i + 40) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        size: 100,
        hash: `hash-${i}`,
      }));

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions,
              lastBackup: new Date().toISOString(),
              totalSize: 500,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      await cleanupOldBackups({ maxAge: 30, keepMinimum: 3 });

      // Should keep at least 3 versions
      expect(mockFs.unlink).toHaveBeenCalledTimes(2);
    });
  });

  describe("getBackupStats", () => {
    it("should return backup statistics", async () => {
      const versions: FileVersion[] = [
        {
          id: "version-1",
          originalPath: testFilePath,
          backupPath: "/backup/file-1.txt",
          timestamp: "2023-01-01T00:00:00.000Z",
          size: 100,
          hash: "hash-1",
        },
        {
          id: "version-2",
          originalPath: "/other/file.txt",
          backupPath: "/backup/other-1.txt",
          timestamp: "2023-01-02T00:00:00.000Z",
          size: 200,
          hash: "hash-2",
        },
      ];

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions,
              lastBackup: new Date().toISOString(),
              totalSize: 300,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      const stats = await getBackupStats();

      expect(stats.totalVersions).toBe(2);
      expect(stats.totalSize).toBe(300);
      expect(stats.fileCount).toBe(2);
      expect(stats.oldestBackup).toBe("2023-01-01T00:00:00.000Z");
      expect(stats.newestBackup).toBe("2023-01-02T00:00:00.000Z");
    });
  });

  describe("exportBackupData", () => {
    it("should export backup data", async () => {
      const version: FileVersion = {
        id: "test-version",
        originalPath: testFilePath,
        backupPath: "/backup/file.txt",
        timestamp: new Date().toISOString(),
        size: 100,
        hash: "test-hash",
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [version],
              lastBackup: new Date().toISOString(),
              totalSize: 100,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      const exportData = await exportBackupData();

      expect(exportData.manifest.versions).toHaveLength(1);
      expect(exportData.files).toHaveLength(1);
      expect(exportData.files[0].path).toBe(version.backupPath);
    });
  });

  describe("importBackupData", () => {
    it("should import backup data", async () => {
      const importData = {
        manifest: {
          versions: [
            {
              id: "imported-version",
              originalPath: testFilePath,
              backupPath: "/backup/imported.txt",
              timestamp: new Date().toISOString(),
              size: 100,
              hash: "imported-hash",
            },
          ],
          lastBackup: new Date().toISOString(),
          totalSize: 100,
        },
        files: [
          {
            path: "/backup/imported.txt",
            data: Buffer.from("imported content"),
          },
        ],
      };

      await importBackupData(importData);

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("imported.txt"),
        importData.files[0].data,
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("manifest.json"),
        expect.any(String),
      );
    });
  });

  describe("Error handling", () => {
    it("should handle file system errors gracefully", async () => {
      mockFs.copyFile.mockRejectedValue(new Error("File system error"));

      await expect(createFileBackup(testFilePath)).rejects.toThrow();
    });

    it("should handle missing manifest file", async () => {
      // Mock readFile to reject only for manifest file, but succeed for others
      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.reject(new Error("File not found"));
        }
        return Promise.resolve(Buffer.from("test content"));
      });

      // Should create new manifest
      const version = await createFileBackup(testFilePath);
      expect(version).toBeDefined();
    });

    it("should handle cleanup errors gracefully", async () => {
      const version: FileVersion = {
        id: "test-version",
        originalPath: testFilePath,
        backupPath: "/backup/file.txt",
        timestamp: new Date().toISOString(),
        size: 100,
        hash: "test-hash",
      };

      mockFs.readFile.mockImplementation((path) => {
        if (path.toString().includes("manifest.json")) {
          return Promise.resolve(
            JSON.stringify({
              versions: [version],
              lastBackup: new Date().toISOString(),
              totalSize: 100,
            }),
          );
        }
        return Promise.resolve(Buffer.from(testFileContent));
      });

      mockFs.unlink.mockRejectedValue(new Error("Cannot delete file"));

      // Should not throw, just log warning
      await expect(deleteBackupVersion("test-version")).resolves.not.toThrow();
    });
  });
});
