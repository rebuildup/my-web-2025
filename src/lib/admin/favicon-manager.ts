/**
 * Favicon Management System
 * Handles favicon.ico, favicon.png, and favicon.svg management
 * Task 9.3.1 - Create favicon management system
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { ADMIN_CONSTANTS, AdminError, adminUtils } from "./utils";

// Favicon configuration
const FAVICON_CONFIG = {
	FAVICONS_DIR: path.join(process.cwd(), ADMIN_CONSTANTS.DIRECTORIES.FAVICONS),
	SUPPORTED_FORMATS: {
		ico: {
			extension: ".ico",
			contentType: "image/x-icon",
			sizes: [16, 32, 48],
		},
		png: {
			extension: ".png",
			contentType: "image/png",
			sizes: [16, 32, 192, 512],
		},
		svg: { extension: ".svg", contentType: "image/svg+xml", sizes: ["any"] },
	},
	MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB
	REQUIRED_FILES: ["favicon.ico", "favicon.png", "favicon.svg"],
} as const;

export interface FaviconInfo {
	fileName: string;
	filePath: string;
	url: string;
	format: "ico" | "png" | "svg";
	fileSize: number;
	contentType: string;
	lastModified: string;
	isActive: boolean;
}

export interface FaviconProcessingResult {
	success: boolean;
	faviconInfo?: FaviconInfo;
	errors: string[];
	warnings: string[];
}

export interface FaviconStatus {
	hasAllRequired: boolean;
	missingFiles: string[];
	activeFiles: FaviconInfo[];
	totalSize: number;
}

/**
 * Favicon Manager
 */
export class FaviconManager {
	private static instance: FaviconManager;

	private constructor() {}

	public static getInstance(): FaviconManager {
		if (!FaviconManager.instance) {
			FaviconManager.instance = new FaviconManager();
		}
		return FaviconManager.instance;
	}

	/**
	 * Upload and replace favicon
	 */
	async uploadFavicon(
		file: File | Buffer,
		format: "ico" | "png" | "svg",
	): Promise<FaviconProcessingResult> {
		const result: FaviconProcessingResult = {
			success: false,
			errors: [],
			warnings: [],
		};

		try {
			// Validate admin access
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				throw new AdminError(
					validation.error || "Admin access denied",
					"ACCESS_DENIED",
					403,
				);
			}

			// Validate file
			await this.validateFaviconFile(file, format);

			// Ensure favicon directory exists
			await fs.mkdir(FAVICON_CONFIG.FAVICONS_DIR, { recursive: true });

			// Generate filename
			const fileName = `favicon.${format}`;
			const filePath = path.join(FAVICON_CONFIG.FAVICONS_DIR, fileName);

			// Backup existing file if it exists
			await this.backupExistingFavicon(filePath);

			// Save new file
			let fileBuffer: Buffer;
			if (file instanceof Buffer) {
				fileBuffer = file;
			} else {
				fileBuffer = Buffer.from(await (file as File).arrayBuffer());
			}

			await fs.writeFile(filePath, fileBuffer);

			// Create favicon info
			const faviconInfo: FaviconInfo = {
				fileName,
				filePath,
				url: `/favicons/${fileName}`,
				format,
				fileSize: fileBuffer.length,
				contentType: FAVICON_CONFIG.SUPPORTED_FORMATS[format].contentType,
				lastModified: new Date().toISOString(),
				isActive: true,
			};

			result.success = true;
			result.faviconInfo = faviconInfo;

			adminUtils.logAdminAction("Favicon uploaded", {
				format,
				fileName,
				fileSize: fileBuffer.length,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			result.errors.push(errorMessage);
			adminUtils.logAdminAction("Favicon upload failed", {
				format,
				error: errorMessage,
			});
		}

		return result;
	}

	/**
	 * Get favicon status
	 */
	async getFaviconStatus(): Promise<FaviconStatus> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				throw new AdminError(
					validation.error || "Admin access denied",
					"ACCESS_DENIED",
					403,
				);
			}

			const activeFiles: FaviconInfo[] = [];
			const missingFiles: string[] = [];
			let totalSize = 0;

			for (const requiredFile of FAVICON_CONFIG.REQUIRED_FILES) {
				const filePath = path.join(FAVICON_CONFIG.FAVICONS_DIR, requiredFile);

				try {
					const stats = await fs.stat(filePath);
					const format = path.extname(requiredFile).substring(1) as
						| "ico"
						| "png"
						| "svg";

					const faviconInfo: FaviconInfo = {
						fileName: requiredFile,
						filePath,
						url: `/favicons/${requiredFile}`,
						format,
						fileSize: stats.size,
						contentType: FAVICON_CONFIG.SUPPORTED_FORMATS[format].contentType,
						lastModified: stats.mtime.toISOString(),
						isActive: true,
					};

					activeFiles.push(faviconInfo);
					totalSize += stats.size;
				} catch {
					missingFiles.push(requiredFile);
				}
			}

			return {
				hasAllRequired: missingFiles.length === 0,
				missingFiles,
				activeFiles,
				totalSize,
			};
		} catch (error) {
			adminUtils.logAdminAction("Favicon status check failed", {
				error: error instanceof Error ? error.message : "Unknown error",
			});

			return {
				hasAllRequired: false,
				missingFiles: [...FAVICON_CONFIG.REQUIRED_FILES],
				activeFiles: [],
				totalSize: 0,
			};
		}
	}

	/**
	 * Generate favicon manifest for HTML head
	 */
	async generateFaviconManifest(): Promise<string[]> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				return [];
			}

			const status = await this.getFaviconStatus();
			const manifestLines: string[] = [];

			for (const favicon of status.activeFiles) {
				switch (favicon.format) {
					case "ico":
						manifestLines.push(
							`<link rel="icon" type="${favicon.contentType}" href="${favicon.url}" sizes="16x16 32x32 48x48">`,
						);
						break;
					case "png":
						manifestLines.push(
							`<link rel="icon" type="${favicon.contentType}" href="${favicon.url}" sizes="32x32">`,
						);
						manifestLines.push(
							`<link rel="apple-touch-icon" href="${favicon.url}">`,
						);
						break;
					case "svg":
						manifestLines.push(
							`<link rel="icon" type="${favicon.contentType}" href="${favicon.url}">`,
						);
						break;
				}
			}

			return manifestLines;
		} catch (error) {
			adminUtils.logAdminAction("Favicon manifest generation failed", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return [];
		}
	}

	/**
	 * Delete favicon
	 */
	async deleteFavicon(format: "ico" | "png" | "svg"): Promise<boolean> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				throw new AdminError(
					validation.error || "Admin access denied",
					"ACCESS_DENIED",
					403,
				);
			}

			const fileName = `favicon.${format}`;
			const filePath = path.join(FAVICON_CONFIG.FAVICONS_DIR, fileName);

			// Backup before deletion
			await this.backupExistingFavicon(filePath);

			// Delete file
			await fs.unlink(filePath);

			adminUtils.logAdminAction("Favicon deleted", { format, fileName });
			return true;
		} catch (error) {
			adminUtils.logAdminAction("Favicon deletion failed", {
				format,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Restore favicon from backup
	 */
	async restoreFavicon(
		format: "ico" | "png" | "svg",
		backupTimestamp: string,
	): Promise<boolean> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				throw new AdminError(
					validation.error || "Admin access denied",
					"ACCESS_DENIED",
					403,
				);
			}

			const fileName = `favicon.${format}`;
			const filePath = path.join(FAVICON_CONFIG.FAVICONS_DIR, fileName);
			const backupPath = path.join(
				FAVICON_CONFIG.FAVICONS_DIR,
				"backups",
				`${fileName}.${backupTimestamp}.backup`,
			);

			// Check if backup exists
			await fs.access(backupPath);

			// Backup current file if it exists
			try {
				await this.backupExistingFavicon(filePath);
			} catch {
				// Current file might not exist, continue
			}

			// Restore from backup
			await fs.copyFile(backupPath, filePath);

			adminUtils.logAdminAction("Favicon restored", {
				format,
				backupTimestamp,
			});
			return true;
		} catch (error) {
			adminUtils.logAdminAction("Favicon restoration failed", {
				format,
				backupTimestamp,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * List favicon backups
	 */
	async listFaviconBackups(): Promise<
		Array<{ format: string; timestamp: string; fileName: string }>
	> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				return [];
			}

			const backupDir = path.join(FAVICON_CONFIG.FAVICONS_DIR, "backups");

			try {
				const files = await fs.readdir(backupDir);
				const backups = files
					.filter((file) => file.endsWith(".backup"))
					.map((file) => {
						const parts = file.split(".");
						const format = parts[1]; // favicon.ico.timestamp.backup -> ico
						const timestamp = parts[2];
						return { format, timestamp, fileName: file };
					})
					.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

				return backups;
			} catch {
				return [];
			}
		} catch (error) {
			adminUtils.logAdminAction("Favicon backup listing failed", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return [];
		}
	}

	/**
	 * Validate favicon file
	 */
	private async validateFaviconFile(
		file: File | Buffer,
		format: "ico" | "png" | "svg",
	): Promise<void> {
		const fileSize = file instanceof Buffer ? file.length : (file as File).size;

		if (fileSize > FAVICON_CONFIG.MAX_FILE_SIZE) {
			throw new AdminError(
				`File size too large. Maximum size: ${FAVICON_CONFIG.MAX_FILE_SIZE / 1024}KB`,
				"FILE_TOO_LARGE",
				400,
			);
		}

		if (!FAVICON_CONFIG.SUPPORTED_FORMATS[format]) {
			throw new AdminError(
				`Unsupported format: ${format}. Supported formats: ${Object.keys(FAVICON_CONFIG.SUPPORTED_FORMATS).join(", ")}`,
				"INVALID_FORMAT",
				400,
			);
		}

		// Additional format-specific validation could be added here
		// For example, checking file headers to ensure the file is actually the claimed format
	}

	/**
	 * Backup existing favicon
	 */
	private async backupExistingFavicon(filePath: string): Promise<void> {
		try {
			// Check if file exists
			await fs.access(filePath);

			// Create backup directory
			const backupDir = path.join(FAVICON_CONFIG.FAVICONS_DIR, "backups");
			await fs.mkdir(backupDir, { recursive: true });

			// Create backup filename with timestamp
			const fileName = path.basename(filePath);
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const backupPath = path.join(
				backupDir,
				`${fileName}.${timestamp}.backup`,
			);

			// Copy file to backup
			await fs.copyFile(filePath, backupPath);

			adminUtils.logAdminAction("Favicon backed up", { fileName, backupPath });
		} catch (error) {
			// File might not exist, which is fine
			if (
				error instanceof Error &&
				"code" in error &&
				error.code !== "ENOENT"
			) {
				adminUtils.logAdminAction("Favicon backup warning", {
					filePath,
					error: error.message,
				});
			}
		}
	}

	/**
	 * Clean old backups (keep only last 10)
	 */
	async cleanOldBackups(): Promise<number> {
		try {
			const validation = adminUtils.validateAdminRequest();
			if (!validation.valid) {
				return 0;
			}

			const backupDir = path.join(FAVICON_CONFIG.FAVICONS_DIR, "backups");
			const files = await fs.readdir(backupDir);

			const backupFiles = files
				.filter((file) => file.endsWith(".backup"))
				.map((file) => ({
					name: file,
					path: path.join(backupDir, file),
					timestamp: file.split(".")[2], // Extract timestamp from filename
				}))
				.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

			// Keep only the 10 most recent backups
			const filesToDelete = backupFiles.slice(10);
			let deletedCount = 0;

			for (const file of filesToDelete) {
				try {
					await fs.unlink(file.path);
					deletedCount++;
				} catch (error) {
					adminUtils.logAdminAction("Backup cleanup warning", {
						fileName: file.name,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			if (deletedCount > 0) {
				adminUtils.logAdminAction("Old favicon backups cleaned", {
					deletedCount,
				});
			}

			return deletedCount;
		} catch (error) {
			adminUtils.logAdminAction("Favicon backup cleanup failed", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return 0;
		}
	}
}

// Export singleton instance
export const faviconManager = FaviconManager.getInstance();
