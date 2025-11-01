import fs from "node:fs";
import path from "node:path";
import type { ContentItem } from "@/types/content";

export interface SiteStatistics {
	content: {
		total: number;
		byType: Record<string, number>;
		byStatus: Record<string, number>;
		recentlyUpdated: ContentItem[];
	};
	files: {
		totalSize: number;
		imageCount: number;
		videoCount: number;
		downloadCount: number;
	};
	performance: {
		lastBuildTime?: string;
		cacheHitRate?: number;
		averageLoadTime?: number;
	};
	system: {
		nodeVersion: string;
		environment: string;
		uptime: number;
		memoryUsage: NodeJS.MemoryUsage;
		timestamp: string;
	};
}

export interface ContentMetrics {
	id: string;
	title: string;
	type: string;
	views: number;
	downloads?: number;
	lastViewed?: string;
	performance: {
		loadTime?: number;
		errorRate?: number;
	};
}

export interface SystemHealth {
	status: "healthy" | "warning" | "error";
	checks: {
		name: string;
		status: "pass" | "fail" | "warning";
		message: string;
		timestamp: string;
	}[];
	alerts: {
		level: "info" | "warning" | "error";
		message: string;
		timestamp: string;
		resolved?: boolean;
	}[];
}

export interface AuditLog {
	id: string;
	action: string;
	resource: string;
	details: Record<string, unknown>;
	timestamp: string;
	ip?: string;
	userAgent?: string;
}

/**
 * Get comprehensive site statistics
 */
export async function getSiteStatistics(): Promise<SiteStatistics> {
	try {
		// Load content data
		const contentStats = await getContentStatistics();
		const fileStats = await getFileStatistics();
		const performanceStats = await getPerformanceStatistics();
		const systemStats = getSystemStatistics();

		return {
			content: contentStats,
			files: fileStats,
			performance: performanceStats,
			system: systemStats,
		};
	} catch (error) {
		console.error("Error getting site statistics:", error);
		throw new Error("Failed to retrieve site statistics");
	}
}

/**
 * Get content statistics from JSON files
 */
async function getContentStatistics() {
	const dataDir = path.join(process.cwd(), "public", "data");
	const contentTypes = ["portfolio", "blog", "plugin", "download", "tool"];

	let total = 0;
	const byType: Record<string, number> = {};
	const byStatus: Record<string, number> = {};
	const recentlyUpdated: ContentItem[] = [];

	for (const type of contentTypes) {
		try {
			const filePath = path.join(dataDir, `${type}.json`);
			if (fs.existsSync(filePath)) {
				const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
				const items = Array.isArray(data) ? data : data.items || [];

				byType[type] = items.length;
				total += items.length;

				// Count by status
				items.forEach((item: ContentItem) => {
					const status = item.status || "published";
					byStatus[status] = (byStatus[status] || 0) + 1;

					// Add to recently updated if within last 7 days
					if (item.updatedAt) {
						const updatedDate = new Date(item.updatedAt);
						const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
						if (updatedDate > weekAgo) {
							recentlyUpdated.push(item);
						}
					}
				});
			}
		} catch (error) {
			console.warn(`Error reading ${type}.json:`, error);
			byType[type] = 0;
		}
	}

	// Sort recently updated by date
	recentlyUpdated.sort(
		(a, b) =>
			new Date(b.updatedAt || 0).getTime() -
			new Date(a.updatedAt || 0).getTime(),
	);

	return {
		total,
		byType,
		byStatus,
		recentlyUpdated: recentlyUpdated.slice(0, 10), // Top 10 recent
	};
}

/**
 * Get file system statistics
 */
async function getFileStatistics() {
	const publicDir = path.join(process.cwd(), "public");

	let totalSize = 0;
	let imageCount = 0;
	let videoCount = 0;
	let downloadCount = 0;

	const countFiles = (dir: string, extensions: string[]) => {
		let count = 0;
		let size = 0;

		try {
			if (fs.existsSync(dir)) {
				const files = fs.readdirSync(dir, { withFileTypes: true });

				for (const file of files) {
					const filePath = path.join(dir, file.name);

					if (file.isDirectory()) {
						const subResult = countFiles(filePath, extensions);
						count += subResult.count;
						size += subResult.size;
					} else if (
						extensions.some((ext) => file.name.toLowerCase().endsWith(ext))
					) {
						count++;
						try {
							const stats = fs.statSync(filePath);
							size += stats.size;
						} catch (error) {
							console.warn(`Error getting file stats for ${filePath}:`, error);
						}
					}
				}
			}
		} catch (error) {
			console.warn(`Error reading directory ${dir}:`, error);
		}

		return { count, size };
	};

	// Count images
	const imageResult = countFiles(path.join(publicDir, "images"), [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".svg",
	]);
	imageCount = imageResult.count;
	totalSize += imageResult.size;

	// Count videos
	const videoResult = countFiles(path.join(publicDir, "videos"), [
		".mp4",
		".webm",
		".mov",
		".avi",
	]);
	videoCount = videoResult.count;
	totalSize += videoResult.size;

	// Count downloads
	const downloadResult = countFiles(path.join(publicDir, "downloads"), [
		".zip",
		".pdf",
		".doc",
		".docx",
		".txt",
	]);
	downloadCount = downloadResult.count;
	totalSize += downloadResult.size;

	return {
		totalSize,
		imageCount,
		videoCount,
		downloadCount,
	};
}

/**
 * Get performance statistics
 */
async function getPerformanceStatistics() {
	// In a real implementation, this would read from performance logs
	// For now, return mock data or read from cache files

	const cacheDir = path.join(process.cwd(), "public", "data", "cache");
	let performanceData = {
		lastBuildTime: undefined as string | undefined,
		cacheHitRate: undefined as number | undefined,
		averageLoadTime: undefined as number | undefined,
	};

	try {
		const perfFile = path.join(cacheDir, "performance.json");
		if (fs.existsSync(perfFile)) {
			const data = JSON.parse(fs.readFileSync(perfFile, "utf-8"));
			performanceData = { ...performanceData, ...data };
		}
	} catch (error) {
		console.warn("Error reading performance data:", error);
	}

	return performanceData;
}

/**
 * Get system statistics
 */
function getSystemStatistics() {
	return {
		nodeVersion: process.version,
		environment: process.env.NODE_ENV || "unknown",
		uptime: process.uptime(),
		memoryUsage: process.memoryUsage(),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get content performance metrics
 */
export async function getContentMetrics(): Promise<ContentMetrics[]> {
	try {
		const statsDir = path.join(process.cwd(), "public", "data", "stats");
		const viewStatsFile = path.join(statsDir, "view-stats.json");
		const downloadStatsFile = path.join(statsDir, "download-stats.json");

		let viewStats = {};
		let downloadStats = {};

		if (fs.existsSync(viewStatsFile)) {
			viewStats = JSON.parse(fs.readFileSync(viewStatsFile, "utf-8"));
		}

		if (fs.existsSync(downloadStatsFile)) {
			downloadStats = JSON.parse(fs.readFileSync(downloadStatsFile, "utf-8"));
		}

		const metrics: ContentMetrics[] = [];

		// Process each content type
		const dataDir = path.join(process.cwd(), "public", "data");
		const contentTypes = ["portfolio", "blog", "plugin", "download"];

		for (const type of contentTypes) {
			try {
				const filePath = path.join(dataDir, `${type}.json`);
				if (fs.existsSync(filePath)) {
					const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
					const items = Array.isArray(data) ? data : data.items || [];

					items.forEach((item: ContentItem) => {
						const views = (viewStats as Record<string, number>)[item.id] || 0;
						const downloads =
							(downloadStats as Record<string, number>)[item.id] || undefined;

						metrics.push({
							id: item.id,
							title: item.title,
							type: item.type,
							views,
							downloads,
							lastViewed: undefined, // Would be tracked in real implementation
							performance: {
								loadTime: undefined, // Would be measured in real implementation
								errorRate: undefined,
							},
						});
					});
				}
			} catch {
				console.warn(`Error processing metrics for ${type}`);
			}
		}

		// Sort by views descending
		return metrics.sort((a, b) => b.views - a.views);
	} catch {
		console.error("Error getting content metrics");
		return [];
	}
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
	const checks = [];
	const alerts = [];
	let overallStatus: "healthy" | "warning" | "error" = "healthy";

	// Check file system
	try {
		const publicDir = path.join(process.cwd(), "public");
		fs.accessSync(publicDir, fs.constants.R_OK | fs.constants.W_OK);
		checks.push({
			name: "File System Access",
			status: "pass" as const,
			message: "Public directory is accessible",
			timestamp: new Date().toISOString(),
		});
	} catch {
		checks.push({
			name: "File System Access",
			status: "fail" as const,
			message: "Cannot access public directory",
			timestamp: new Date().toISOString(),
		});
		overallStatus = "error";
		alerts.push({
			level: "error" as const,
			message: "File system access error",
			timestamp: new Date().toISOString(),
		});
	}

	// Check memory usage
	const memUsage = process.memoryUsage();
	const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

	if (memUsagePercent > 90) {
		checks.push({
			name: "Memory Usage",
			status: "fail" as const,
			message: `High memory usage: ${memUsagePercent.toFixed(1)}%`,
			timestamp: new Date().toISOString(),
		});
		overallStatus = "error";
		alerts.push({
			level: "error" as const,
			message: "High memory usage detected",
			timestamp: new Date().toISOString(),
		});
	} else if (memUsagePercent > 70) {
		checks.push({
			name: "Memory Usage",
			status: "warning" as const,
			message: `Moderate memory usage: ${memUsagePercent.toFixed(1)}%`,
			timestamp: new Date().toISOString(),
		});
		if (overallStatus === "healthy") overallStatus = "warning";
		alerts.push({
			level: "warning" as const,
			message: "Moderate memory usage",
			timestamp: new Date().toISOString(),
		});
	} else {
		checks.push({
			name: "Memory Usage",
			status: "pass" as const,
			message: `Memory usage: ${memUsagePercent.toFixed(1)}%`,
			timestamp: new Date().toISOString(),
		});
	}

	// Check data files
	const dataDir = path.join(process.cwd(), "public", "data");
	const requiredFiles = ["portfolio.json", "blog.json", "plugin.json"];

	for (const file of requiredFiles) {
		const filePath = path.join(dataDir, file);
		try {
			fs.accessSync(filePath, fs.constants.R_OK);
			JSON.parse(fs.readFileSync(filePath, "utf-8")); // Validate JSON
			checks.push({
				name: `Data File: ${file}`,
				status: "pass" as const,
				message: "File exists and is valid JSON",
				timestamp: new Date().toISOString(),
			});
		} catch {
			checks.push({
				name: `Data File: ${file}`,
				status: "fail" as const,
				message: "File missing or invalid JSON",
				timestamp: new Date().toISOString(),
			});
			if (overallStatus !== "error") overallStatus = "warning";
			alerts.push({
				level: "warning" as const,
				message: `Data file issue: ${file}`,
				timestamp: new Date().toISOString(),
			});
		}
	}

	return {
		status: overallStatus,
		checks,
		alerts,
	};
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
	action: string,
	resource: string,
	details: Record<string, unknown> = {},
	request?: Request,
): Promise<void> {
	try {
		const logEntry: AuditLog = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			action,
			resource,
			details,
			timestamp: new Date().toISOString(),
			ip: request?.headers.get("x-forwarded-for") || "localhost",
			userAgent: request?.headers.get("user-agent") || "unknown",
		};

		const logsDir = path.join(process.cwd(), "public", "data", "logs");
		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir, { recursive: true });
		}

		const logFile = path.join(logsDir, "audit.json");
		let logs: AuditLog[] = [];

		if (fs.existsSync(logFile)) {
			try {
				logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
			} catch (error) {
				console.warn("Error reading audit log:", error);
				logs = [];
			}
		}

		logs.push(logEntry);

		// Keep only last 1000 entries
		if (logs.length > 1000) {
			logs = logs.slice(-1000);
		}

		fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
	} catch (error) {
		console.error("Error logging admin action:", error);
	}
}

/**
 * Get audit logs
 */
export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
	try {
		const logFile = path.join(
			process.cwd(),
			"public",
			"data",
			"logs",
			"audit.json",
		);

		if (!fs.existsSync(logFile)) {
			return [];
		}

		const logs: AuditLog[] = JSON.parse(fs.readFileSync(logFile, "utf-8"));
		return logs.slice(-limit).reverse(); // Most recent first
	} catch {
		console.error("Error reading audit logs");
		return [];
	}
}

/**
 * Create backup of all data
 */
export async function createBackup(): Promise<string> {
	try {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupDir = path.join(process.cwd(), "backups");
		const backupPath = path.join(backupDir, `backup-${timestamp}`);

		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		fs.mkdirSync(backupPath, { recursive: true });

		// Copy data directory
		const dataDir = path.join(process.cwd(), "public", "data");
		const backupDataDir = path.join(backupPath, "data");

		if (fs.existsSync(dataDir)) {
			await copyDirectory(dataDir, backupDataDir);
		}

		// Copy public assets
		const publicDir = path.join(process.cwd(), "public");
		const backupPublicDir = path.join(backupPath, "public");

		const assetDirs = ["images", "videos", "downloads"];
		for (const dir of assetDirs) {
			const srcDir = path.join(publicDir, dir);
			const destDir = path.join(backupPublicDir, dir);

			if (fs.existsSync(srcDir)) {
				await copyDirectory(srcDir, destDir);
			}
		}

		// Create backup manifest
		const manifest = {
			timestamp: new Date().toISOString(),
			version: "1.0.0",
			contents: ["data", "public/images", "public/videos", "public/downloads"],
		};

		fs.writeFileSync(
			path.join(backupPath, "manifest.json"),
			JSON.stringify(manifest, null, 2),
		);

		await logAdminAction("backup", "system", { backupPath });

		return backupPath;
	} catch (error) {
		console.error("Error creating backup:", error);
		throw new Error("Failed to create backup");
	}
}

/**
 * Utility function to copy directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}
