/**
 * Upload Progress Manager
 * Manages upload progress tracking for enhanced file uploads
 */

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  startTime: number;
  endTime?: number;
  fileSize: number;
  uploadedBytes: number;
}

export class UploadProgressManager {
  private static instance: UploadProgressManager;
  private progressMap = new Map<string, UploadProgress>();
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Clean up completed/errored uploads every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  static getInstance(): UploadProgressManager {
    if (!UploadProgressManager.instance) {
      UploadProgressManager.instance = new UploadProgressManager();
    }
    return UploadProgressManager.instance;
  }

  /**
   * Create a new upload progress entry
   */
  createProgress(filename: string, fileSize: number): string {
    const id = this.generateId();
    const progress: UploadProgress = {
      id,
      filename,
      progress: 0,
      status: "uploading",
      startTime: Date.now(),
      fileSize,
      uploadedBytes: 0,
    };

    this.progressMap.set(id, progress);
    return id;
  }

  /**
   * Update upload progress
   */
  updateProgress(
    id: string,
    updates: Partial<Omit<UploadProgress, "id" | "startTime">>,
  ): boolean {
    const progress = this.progressMap.get(id);
    if (!progress) {
      return false;
    }

    Object.assign(progress, updates);

    // Set end time when complete or error
    if (
      (updates.status === "complete" || updates.status === "error") &&
      !progress.endTime
    ) {
      progress.endTime = Date.now();
    }

    this.progressMap.set(id, progress);
    return true;
  }

  /**
   * Get upload progress by ID
   */
  getProgress(id: string): UploadProgress | null {
    return this.progressMap.get(id) || null;
  }

  /**
   * Get all upload progress entries
   */
  getAllProgress(): UploadProgress[] {
    return Array.from(this.progressMap.values());
  }

  /**
   * Get active uploads (uploading or processing)
   */
  getActiveUploads(): UploadProgress[] {
    return Array.from(this.progressMap.values()).filter(
      (progress) =>
        progress.status === "uploading" || progress.status === "processing",
    );
  }

  /**
   * Remove upload progress entry
   */
  removeProgress(id: string): boolean {
    return this.progressMap.delete(id);
  }

  /**
   * Clear all progress entries
   */
  clearAll(): void {
    this.progressMap.clear();
  }

  /**
   * Clean up old completed/errored uploads
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [id, progress] of this.progressMap.entries()) {
      if (
        progress.endTime &&
        now - progress.endTime > maxAge &&
        (progress.status === "complete" || progress.status === "error")
      ) {
        this.progressMap.delete(id);
      }
    }
  }

  /**
   * Generate unique ID for upload progress
   */
  private generateId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Calculate upload speed (bytes per second)
   */
  getUploadSpeed(id: string): number {
    const progress = this.progressMap.get(id);
    if (!progress || progress.uploadedBytes === 0) {
      return 0;
    }

    const elapsed = (progress.endTime || Date.now()) - progress.startTime;
    if (elapsed === 0) {
      return 0;
    }

    return (progress.uploadedBytes / elapsed) * 1000; // bytes per second
  }

  /**
   * Get estimated time remaining (in milliseconds)
   */
  getEstimatedTimeRemaining(id: string): number {
    const progress = this.progressMap.get(id);
    if (!progress || progress.status !== "uploading") {
      return 0;
    }

    const speed = this.getUploadSpeed(id);
    if (speed === 0) {
      return 0;
    }

    const remainingBytes = progress.fileSize - progress.uploadedBytes;
    return (remainingBytes / speed) * 1000; // milliseconds
  }

  /**
   * Get upload statistics
   */
  getStatistics(): {
    total: number;
    active: number;
    completed: number;
    failed: number;
    totalBytes: number;
    uploadedBytes: number;
  } {
    const all = this.getAllProgress();
    const active = all.filter(
      (p) => p.status === "uploading" || p.status === "processing",
    );
    const completed = all.filter((p) => p.status === "complete");
    const failed = all.filter((p) => p.status === "error");

    const totalBytes = all.reduce((sum, p) => sum + p.fileSize, 0);
    const uploadedBytes = all.reduce((sum, p) => sum + p.uploadedBytes, 0);

    return {
      total: all.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      totalBytes,
      uploadedBytes,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.progressMap.clear();
  }
}
