/**
 * File Backup and Versioning System
 * Handles file versioning, backup creation, and restoration
 */

import { promises as fs } from "fs";
import path from "path";

export interface FileVersion {
  id: string;
  originalPath: string;
  backupPath: string;
  timestamp: string;
  size: number;
  hash: string;
  metadata?: Record<string, unknown>;
}

export interface BackupManifest {
  versions: FileVersion[];
  lastBackup: string;
  totalSize: number;
}

// Backup directory structure
const BACKUP_BASE_DIR = path.join(process.cwd(), "backups");
const MANIFEST_FILE = path.join(BACKUP_BASE_DIR, "manifest.json");

/**
 * Ensure backup directory exists
 */
async function ensureBackupDirectory(): Promise<void> {
  try {
    await fs.access(BACKUP_BASE_DIR);
  } catch {
    await fs.mkdir(BACKUP_BASE_DIR, { recursive: true });
  }
}

/**
 * Load backup manifest
 */
async function loadManifest(): Promise<BackupManifest> {
  try {
    const manifestData = await fs.readFile(MANIFEST_FILE, "utf-8");
    return JSON.parse(manifestData);
  } catch {
    return {
      versions: [],
      lastBackup: new Date().toISOString(),
      totalSize: 0,
    };
  }
}

/**
 * Save backup manifest
 */
async function saveManifest(manifest: BackupManifest): Promise<void> {
  await ensureBackupDirectory();
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

/**
 * Calculate file hash
 */
async function calculateFileHash(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create backup of a file
 */
export async function createFileBackup(
  filePath: string,
  metadata?: Record<string, unknown>,
): Promise<FileVersion> {
  await ensureBackupDirectory();

  const manifest = await loadManifest();
  const timestamp = new Date().toISOString();
  const fileStats = await fs.stat(filePath);
  const hash = await calculateFileHash(filePath);

  // Generate backup filename
  const originalName = path.basename(filePath);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  const backupFilename = `${baseName}-${timestamp.replace(/[:.]/g, "-")}${extension}`;
  const backupPath = path.join(BACKUP_BASE_DIR, backupFilename);

  // Copy file to backup location
  await fs.copyFile(filePath, backupPath);

  // Create version record
  const version: FileVersion = {
    id: `${hash}-${timestamp}`,
    originalPath: filePath,
    backupPath,
    timestamp,
    size: fileStats.size,
    hash,
    metadata,
  };

  // Update manifest
  manifest.versions.push(version);
  manifest.lastBackup = timestamp;
  manifest.totalSize += fileStats.size;

  // Keep only last 10 versions per file to manage storage
  const fileVersions = manifest.versions.filter(
    (v) => v.originalPath === filePath,
  );
  if (fileVersions.length > 10) {
    const oldVersions = fileVersions.slice(0, -10);
    for (const oldVersion of oldVersions) {
      try {
        await fs.unlink(oldVersion.backupPath);
        manifest.totalSize -= oldVersion.size;
      } catch (error) {
        console.warn(
          `Failed to delete old backup: ${oldVersion.backupPath}`,
          error,
        );
      }
    }
    manifest.versions = manifest.versions.filter(
      (v) => v.originalPath !== filePath || !oldVersions.includes(v),
    );
  }

  await saveManifest(manifest);
  return version;
}

/**
 * Restore file from backup
 */
export async function restoreFileFromBackup(
  versionId: string,
  targetPath?: string,
): Promise<void> {
  const manifest = await loadManifest();
  const version = manifest.versions.find((v) => v.id === versionId);

  if (!version) {
    throw new Error(`Backup version ${versionId} not found`);
  }

  const restorePath = targetPath || version.originalPath;

  // Create backup of current file before restoring
  if (await fileExists(restorePath)) {
    await createFileBackup(restorePath, {
      restoredFrom: versionId,
      restoredAt: new Date().toISOString(),
    });
  }

  // Restore from backup
  await fs.copyFile(version.backupPath, restorePath);
}

/**
 * List all versions of a file
 */
export async function getFileVersions(
  filePath: string,
): Promise<FileVersion[]> {
  const manifest = await loadManifest();
  return manifest.versions
    .filter((v) => v.originalPath === filePath)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}

/**
 * Delete backup version
 */
export async function deleteBackupVersion(versionId: string): Promise<void> {
  const manifest = await loadManifest();
  const versionIndex = manifest.versions.findIndex((v) => v.id === versionId);

  if (versionIndex === -1) {
    throw new Error(`Backup version ${versionId} not found`);
  }

  const version = manifest.versions[versionIndex];

  // Delete backup file
  try {
    await fs.unlink(version.backupPath);
  } catch (error) {
    console.warn(`Failed to delete backup file: ${version.backupPath}`, error);
  }

  // Update manifest
  manifest.versions.splice(versionIndex, 1);
  manifest.totalSize -= version.size;

  await saveManifest(manifest);
}

/**
 * Clean up old backups based on age or size
 */
export async function cleanupOldBackups(
  options: {
    maxAge?: number; // days
    maxSize?: number; // bytes
    keepMinimum?: number; // minimum versions to keep per file
  } = {},
): Promise<void> {
  const {
    maxAge = 30,
    maxSize = 1024 * 1024 * 1024,
    keepMinimum = 3,
  } = options;
  const manifest = await loadManifest();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  // Group versions by file
  const versionsByFile = new Map<string, FileVersion[]>();
  for (const version of manifest.versions) {
    if (!versionsByFile.has(version.originalPath)) {
      versionsByFile.set(version.originalPath, []);
    }
    versionsByFile.get(version.originalPath)!.push(version);
  }

  const versionsToDelete: FileVersion[] = [];

  // Check each file's versions
  for (const [, versions] of versionsByFile) {
    const sortedVersions = versions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Keep minimum number of recent versions
    const versionsToCheck = sortedVersions.slice(keepMinimum);

    for (const version of versionsToCheck) {
      const versionDate = new Date(version.timestamp);

      // Delete if too old
      if (versionDate < cutoffDate) {
        versionsToDelete.push(version);
      }
    }
  }

  // If still over size limit, delete oldest versions
  let currentSize = manifest.totalSize;
  if (currentSize > maxSize) {
    const allVersions = manifest.versions
      .filter((v) => !versionsToDelete.includes(v))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    for (const version of allVersions) {
      if (currentSize <= maxSize) break;

      // Don't delete if it would leave a file with less than minimum versions
      const fileVersions = versionsByFile.get(version.originalPath) || [];
      const remainingVersions = fileVersions.filter(
        (v) => !versionsToDelete.includes(v) && v !== version,
      );

      if (remainingVersions.length >= keepMinimum) {
        versionsToDelete.push(version);
        currentSize -= version.size;
      }
    }
  }

  // Delete selected versions
  for (const version of versionsToDelete) {
    try {
      await deleteBackupVersion(version.id);
    } catch (error) {
      console.warn(`Failed to delete backup version ${version.id}:`, error);
    }
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<{
  totalVersions: number;
  totalSize: number;
  fileCount: number;
  oldestBackup: string;
  newestBackup: string;
}> {
  const manifest = await loadManifest();

  const uniqueFiles = new Set(manifest.versions.map((v) => v.originalPath));
  const timestamps = manifest.versions.map((v) => v.timestamp).sort();

  return {
    totalVersions: manifest.versions.length,
    totalSize: manifest.totalSize,
    fileCount: uniqueFiles.size,
    oldestBackup: timestamps[0] || "",
    newestBackup: timestamps[timestamps.length - 1] || "",
  };
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Export backup data
 */
export async function exportBackupData(): Promise<{
  manifest: BackupManifest;
  files: Array<{ path: string; data: Buffer }>;
}> {
  const manifest = await loadManifest();
  const files: Array<{ path: string; data: Buffer }> = [];

  for (const version of manifest.versions) {
    try {
      const data = await fs.readFile(version.backupPath);
      files.push({
        path: version.backupPath,
        data,
      });
    } catch (error) {
      console.warn(`Failed to read backup file: ${version.backupPath}`, error);
    }
  }

  return { manifest, files };
}

/**
 * Import backup data
 */
export async function importBackupData(data: {
  manifest: BackupManifest;
  files: Array<{ path: string; data: Buffer }>;
}): Promise<void> {
  await ensureBackupDirectory();

  // Write backup files
  for (const file of data.files) {
    const targetPath = path.join(BACKUP_BASE_DIR, path.basename(file.path));
    await fs.writeFile(targetPath, file.data);
  }

  // Update manifest paths to new location
  const updatedManifest = {
    ...data.manifest,
    versions: data.manifest.versions.map((version) => ({
      ...version,
      backupPath: path.join(BACKUP_BASE_DIR, path.basename(version.backupPath)),
    })),
  };

  await saveManifest(updatedManifest);
}
