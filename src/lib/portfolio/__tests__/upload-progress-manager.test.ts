/**
 * Upload Progress Manager Tests
 * Tests for the upload progress tracking functionality
 */

import { UploadProgressManager } from "../upload-progress-manager";

describe("UploadProgressManager", () => {
  let manager: UploadProgressManager;

  beforeEach(() => {
    // Reset singleton instance for each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (UploadProgressManager as any).instance = undefined;
    manager = UploadProgressManager.getInstance();
    manager.clearAll();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = UploadProgressManager.getInstance();
      const instance2 = UploadProgressManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Progress Creation", () => {
    it("should create new upload progress", () => {
      const id = manager.createProgress("test.jpg", 1024);

      expect(id).toBeDefined();
      expect(id).toMatch(/^upload_\d+_[a-z0-9]+$/);

      const progress = manager.getProgress(id);
      expect(progress).toMatchObject({
        id,
        filename: "test.jpg",
        progress: 0,
        status: "uploading",
        fileSize: 1024,
        uploadedBytes: 0,
      });
      expect(progress?.startTime).toBeDefined();
    });

    it("should generate unique IDs", () => {
      const id1 = manager.createProgress("test1.jpg", 1024);
      const id2 = manager.createProgress("test2.jpg", 2048);

      expect(id1).not.toBe(id2);
    });
  });

  describe("Progress Updates", () => {
    it("should update existing progress", () => {
      const id = manager.createProgress("test.jpg", 1024);

      const updated = manager.updateProgress(id, {
        progress: 50,
        uploadedBytes: 512,
        status: "processing",
      });

      expect(updated).toBe(true);

      const progress = manager.getProgress(id);
      expect(progress).toMatchObject({
        progress: 50,
        uploadedBytes: 512,
        status: "processing",
      });
    });

    it("should set end time when status is complete", () => {
      const id = manager.createProgress("test.jpg", 1024);

      manager.updateProgress(id, {
        progress: 100,
        status: "complete",
      });

      const progress = manager.getProgress(id);
      expect(progress?.endTime).toBeDefined();
    });

    it("should set end time when status is error", () => {
      const id = manager.createProgress("test.jpg", 1024);

      manager.updateProgress(id, {
        status: "error",
        error: "Upload failed",
      });

      const progress = manager.getProgress(id);
      expect(progress?.endTime).toBeDefined();
      expect(progress?.error).toBe("Upload failed");
    });

    it("should return false for non-existent progress", () => {
      const updated = manager.updateProgress("nonexistent", {
        progress: 50,
      });

      expect(updated).toBe(false);
    });
  });

  describe("Progress Retrieval", () => {
    it("should get progress by ID", () => {
      const id = manager.createProgress("test.jpg", 1024);
      const progress = manager.getProgress(id);

      expect(progress).toBeDefined();
      expect(progress?.id).toBe(id);
    });

    it("should return null for non-existent progress", () => {
      const progress = manager.getProgress("nonexistent");
      expect(progress).toBeNull();
    });

    it("should get all progress entries", () => {
      const id1 = manager.createProgress("test1.jpg", 1024);
      const id2 = manager.createProgress("test2.jpg", 2048);

      const allProgress = manager.getAllProgress();
      expect(allProgress).toHaveLength(2);
      expect(allProgress.map((p) => p.id)).toContain(id1);
      expect(allProgress.map((p) => p.id)).toContain(id2);
    });

    it("should get only active uploads", () => {
      const id1 = manager.createProgress("test1.jpg", 1024);
      const id2 = manager.createProgress("test2.jpg", 2048);
      const id3 = manager.createProgress("test3.jpg", 4096);

      manager.updateProgress(id1, { status: "complete" });
      manager.updateProgress(id2, { status: "uploading" });
      manager.updateProgress(id3, { status: "processing" });

      const activeUploads = manager.getActiveUploads();
      expect(activeUploads).toHaveLength(2);
      expect(activeUploads.map((p) => p.id)).toContain(id2);
      expect(activeUploads.map((p) => p.id)).toContain(id3);
      expect(activeUploads.map((p) => p.id)).not.toContain(id1);
    });
  });

  describe("Progress Removal", () => {
    it("should remove progress by ID", () => {
      const id = manager.createProgress("test.jpg", 1024);

      const removed = manager.removeProgress(id);
      expect(removed).toBe(true);

      const progress = manager.getProgress(id);
      expect(progress).toBeNull();
    });

    it("should return false for non-existent progress", () => {
      const removed = manager.removeProgress("nonexistent");
      expect(removed).toBe(false);
    });

    it("should clear all progress", () => {
      manager.createProgress("test1.jpg", 1024);
      manager.createProgress("test2.jpg", 2048);

      manager.clearAll();

      const allProgress = manager.getAllProgress();
      expect(allProgress).toHaveLength(0);
    });
  });

  describe("Upload Speed Calculation", () => {
    it("should calculate upload speed", () => {
      const id = manager.createProgress("test.jpg", 1024);

      // Simulate some time passing and bytes uploaded
      const startTime = Date.now() - 1000; // 1 second ago
      manager.updateProgress(id, {
        uploadedBytes: 512,
      });

      // Mock the start time
      const progress = manager.getProgress(id);
      if (progress) {
        progress.startTime = startTime;
      }

      const speed = manager.getUploadSpeed(id);
      expect(speed).toBeGreaterThan(0);
    });

    it("should return 0 for no uploaded bytes", () => {
      const id = manager.createProgress("test.jpg", 1024);
      const speed = manager.getUploadSpeed(id);
      expect(speed).toBe(0);
    });

    it("should return 0 for non-existent progress", () => {
      const speed = manager.getUploadSpeed("nonexistent");
      expect(speed).toBe(0);
    });
  });

  describe("Time Estimation", () => {
    it("should estimate time remaining", () => {
      const id = manager.createProgress("test.jpg", 1024);

      // Mock progress data
      const startTime = Date.now() - 1000; // 1 second ago
      manager.updateProgress(id, {
        uploadedBytes: 512,
        status: "uploading",
      });

      const progress = manager.getProgress(id);
      if (progress) {
        progress.startTime = startTime;
      }

      const timeRemaining = manager.getEstimatedTimeRemaining(id);
      expect(timeRemaining).toBeGreaterThan(0);
    });

    it("should return 0 for completed uploads", () => {
      const id = manager.createProgress("test.jpg", 1024);
      manager.updateProgress(id, { status: "complete" });

      const timeRemaining = manager.getEstimatedTimeRemaining(id);
      expect(timeRemaining).toBe(0);
    });

    it("should return 0 for non-existent progress", () => {
      const timeRemaining = manager.getEstimatedTimeRemaining("nonexistent");
      expect(timeRemaining).toBe(0);
    });
  });

  describe("Statistics", () => {
    it("should calculate upload statistics", () => {
      const id1 = manager.createProgress("test1.jpg", 1024);
      const id2 = manager.createProgress("test2.jpg", 2048);
      const id3 = manager.createProgress("test3.jpg", 4096);

      manager.updateProgress(id1, {
        status: "complete",
        uploadedBytes: 1024,
      });
      manager.updateProgress(id2, {
        status: "uploading",
        uploadedBytes: 1024,
      });
      manager.updateProgress(id3, {
        status: "error",
        uploadedBytes: 0,
      });

      const stats = manager.getStatistics();
      expect(stats).toEqual({
        total: 3,
        active: 1,
        completed: 1,
        failed: 1,
        totalBytes: 7168, // 1024 + 2048 + 4096
        uploadedBytes: 2048, // 1024 + 1024 + 0
      });
    });

    it("should return zero statistics for empty manager", () => {
      const stats = manager.getStatistics();
      expect(stats).toEqual({
        total: 0,
        active: 0,
        completed: 0,
        failed: 0,
        totalBytes: 0,
        uploadedBytes: 0,
      });
    });
  });

  describe("Cleanup", () => {
    it("should clean up old completed uploads", (done) => {
      const id1 = manager.createProgress("test1.jpg", 1024);
      const id2 = manager.createProgress("test2.jpg", 2048);

      // Mark as completed with old end time
      manager.updateProgress(id1, { status: "complete" });
      manager.updateProgress(id2, { status: "uploading" });

      const progress1 = manager.getProgress(id1);
      if (progress1) {
        progress1.endTime = Date.now() - 31 * 60 * 1000; // 31 minutes ago
      }

      // Trigger cleanup manually (normally done by interval)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (manager as any).cleanup();

      // Check that old completed upload was removed
      setTimeout(() => {
        expect(manager.getProgress(id1)).toBeNull();
        expect(manager.getProgress(id2)).toBeDefined();
        done();
      }, 100);
    });
  });
});
