/**
 * Enhanced Data Processing Pipeline
 * Integrates all enhanced features for portfolio content data processing
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
	ContentItem,
	DataMigrationHandler,
	DateManagementSystem,
	EnhancedContentItem,
	FileOperationError,
	MarkdownFileManager,
	MigrationError,
	TagManagementSystem,
} from "@/types";
import {
	getEffectiveDate,
	isEnhancedContentItem,
	migrateCategoryToCategories,
} from "@/types";
import { enhancedDataCache } from "../cache/EnhancedCacheManager";

// Performance monitoring interface
export interface PerformanceMetrics {
	startTime: number;
	endTime?: number;
	duration?: number;
	itemsProcessed: number;
	errorsCount: number;
	warningsCount: number;
	cacheHits: number;
	cacheMisses: number;
	memoryUsage?: {
		heapUsed: number;
		heapTotal: number;
		external: number;
	};
}

// Pipeline configuration
export interface PipelineConfig {
	enableLogging: boolean;
	enableMonitoring: boolean;
	enableCaching: boolean;
	maxConcurrentOperations: number;
	errorThreshold: number;
	retryAttempts: number;
	timeoutMs: number;
}

// Pipeline result
export interface PipelineResult<T> {
	data: T[];
	metrics: PerformanceMetrics;
	errors: MigrationError[];
	warnings: string[];
	success: boolean;
}

// Error handling strategy
export interface ErrorHandlingStrategy {
	onMigrationError: (error: MigrationError) => void;
	onFileOperationError: (error: FileOperationError) => void;
	onValidationError: (error: Error, item: unknown) => void;
	onPerformanceWarning: (message: string, metrics: PerformanceMetrics) => void;
}

/**
 * Enhanced Data Processing Pipeline
 * Integrates all portfolio content enhancement features
 */
export class EnhancedDataProcessingPipeline {
	private config: PipelineConfig;
	private errorHandler: ErrorHandlingStrategy;
	private tagManager?: TagManagementSystem;
	private markdownManager?: MarkdownFileManager;
	private dateManager?: DateManagementSystem;
	private migrationHandler?: DataMigrationHandler;

	constructor(
		config: Partial<PipelineConfig> = {},
		errorHandler?: Partial<ErrorHandlingStrategy>,
	) {
		this.config = {
			enableLogging: true,
			enableMonitoring: true,
			enableCaching: true,
			maxConcurrentOperations: 10,
			errorThreshold: 0.1, // 10% error threshold
			retryAttempts: 3,
			timeoutMs: 30000, // 30 seconds
			...config,
		};

		this.errorHandler = {
			onMigrationError: (error) => this.logError("Migration Error", error),
			onFileOperationError: (error) =>
				this.logError("File Operation Error", error),
			onValidationError: (error, item) =>
				this.logError("Validation Error", { error, item }),
			onPerformanceWarning: (message, metrics) =>
				this.logWarning("Performance Warning", { message, metrics }),
			...errorHandler,
		};
	}

	/**
	 * Set system dependencies
	 */
	setDependencies(dependencies: {
		tagManager?: TagManagementSystem;
		markdownManager?: MarkdownFileManager;
		dateManager?: DateManagementSystem;
		migrationHandler?: DataMigrationHandler;
	}) {
		this.tagManager = dependencies.tagManager;
		this.markdownManager = dependencies.markdownManager;
		this.dateManager = dependencies.dateManager;
		this.migrationHandler = dependencies.migrationHandler;
	}

	/**
	 * Process raw content data through the enhanced pipeline
	 */
	async processContentData(
		rawData: (ContentItem | EnhancedContentItem)[],
		options: {
			enableMigration?: boolean;
			enableMarkdownLoading?: boolean;
			enableTagUpdates?: boolean;
			enableDateCalculation?: boolean;
			enableValidation?: boolean;
		} = {},
	): Promise<PipelineResult<EnhancedContentItem>> {
		const metrics: PerformanceMetrics = {
			startTime: Date.now(),
			itemsProcessed: 0,
			errorsCount: 0,
			warningsCount: 0,
			cacheHits: 0,
			cacheMisses: 0,
		};

		const errors: MigrationError[] = [];
		const warnings: string[] = [];

		try {
			this.log("Starting enhanced data processing pipeline", {
				itemCount: rawData.length,
				options,
			});

			// Step 1: Data Migration
			let processedData: EnhancedContentItem[] = [];
			if (options.enableMigration !== false) {
				processedData = await this.performDataMigration(
					rawData,
					metrics,
					errors,
				);
			} else {
				processedData = rawData.filter(
					isEnhancedContentItem,
				) as EnhancedContentItem[];
			}

			// Step 2: Enhanced Processing
			const enhancedData = await this.performEnhancedProcessing(
				processedData,
				options,
				metrics,
				errors,
			);

			// Step 3: Validation
			if (options.enableValidation !== false) {
				await this.performValidation(enhancedData, metrics, errors, warnings);
			}

			// Step 4: Performance Analysis
			this.analyzePerformance(metrics, warnings);

			metrics.endTime = Date.now();
			metrics.duration = metrics.endTime - metrics.startTime;
			metrics.itemsProcessed = enhancedData.length;

			const success =
				errors.length === 0 ||
				errors.length / rawData.length < this.config.errorThreshold;

			this.log("Pipeline processing completed", {
				success,
				duration: metrics.duration,
				itemsProcessed: metrics.itemsProcessed,
				errorsCount: errors.length,
				warningsCount: warnings.length,
			});

			return {
				data: enhancedData,
				metrics,
				errors,
				warnings,
				success,
			};
		} catch (error) {
			metrics.endTime = Date.now();
			metrics.duration = metrics.endTime - metrics.startTime;
			metrics.errorsCount++;

			this.logError("Pipeline processing failed", error);

			return {
				data: [],
				metrics,
				errors: [
					...errors,
					{
						type: "data_corruption",
						itemId: "pipeline",
						message:
							error instanceof Error ? error.message : "Unknown pipeline error",
						originalData: rawData,
					},
				],
				warnings,
				success: false,
			};
		}
	}

	/**
	 * Perform data migration from legacy to enhanced format
	 */
	private async performDataMigration(
		rawData: (ContentItem | EnhancedContentItem)[],
		metrics: PerformanceMetrics,
		errors: MigrationError[],
	): Promise<EnhancedContentItem[]> {
		this.log("Starting data migration phase");

		const migrated: EnhancedContentItem[] = [];

		for (const item of rawData) {
			try {
				if (isEnhancedContentItem(item)) {
					migrated.push(item);
				} else {
					// Migrate legacy item
					const migratedItem = this.migrateLegacyItem(item);
					migrated.push(migratedItem);
				}
			} catch (error) {
				const migrationError: MigrationError = {
					type: "validation",
					itemId: item.id || "unknown",
					message: error instanceof Error ? error.message : "Migration failed",
					originalData: item,
				};
				errors.push(migrationError);
				this.errorHandler.onMigrationError(migrationError);
				metrics.errorsCount++;
			}
		}

		this.log("Data migration completed", {
			totalItems: rawData.length,
			migratedItems: migrated.length,
			errors: errors.length,
		});

		return migrated;
	}

	/**
	 * Perform enhanced processing (markdown loading, tag updates, etc.)
	 */
	private async performEnhancedProcessing(
		data: EnhancedContentItem[],
		options: {
			enableMarkdownLoading?: boolean;
			enableTagUpdates?: boolean;
			enableDateCalculation?: boolean;
		},
		metrics: PerformanceMetrics,
		errors: MigrationError[],
	): Promise<EnhancedContentItem[]> {
		this.log("Starting enhanced processing phase");

		const processed: EnhancedContentItem[] = [];

		// Process items with concurrency control
		const processItem = async (
			item: EnhancedContentItem,
		): Promise<EnhancedContentItem> => {
			try {
				let processedItem = { ...item };

				// Load markdown content
				if (options.enableMarkdownLoading !== false && this.markdownManager) {
					processedItem = await this.loadMarkdownContent(
						processedItem,
						metrics,
					);
				}

				// Update tag usage
				if (options.enableTagUpdates !== false && this.tagManager) {
					await this.updateTagUsage(processedItem, metrics);
				}

				// Calculate effective date
				if (options.enableDateCalculation !== false && this.dateManager) {
					processedItem = this.calculateEffectiveDate(processedItem);
				}

				return processedItem;
			} catch (error) {
				const migrationError: MigrationError = {
					type: "file_creation",
					itemId: item.id,
					message:
						error instanceof Error
							? error.message
							: "Enhanced processing failed",
					originalData: item,
				};
				errors.push(migrationError);
				this.errorHandler.onMigrationError(migrationError);
				metrics.errorsCount++;
				return item; // Return original item on error
			}
		};

		// Process items in batches
		const batchSize = this.config.maxConcurrentOperations;
		for (let i = 0; i < data.length; i += batchSize) {
			const batch = data.slice(i, i + batchSize);
			const processedBatch = await Promise.all(batch.map(processItem));
			processed.push(...processedBatch);
		}

		this.log("Enhanced processing completed", {
			processedItems: processed.length,
			errors: errors.length,
		});

		return processed;
	}

	/**
	 * Perform validation on processed data
	 */
	private async performValidation(
		data: EnhancedContentItem[],
		metrics: PerformanceMetrics,
		_errors: MigrationError[],
		warnings: string[],
	): Promise<void> {
		this.log("Starting validation phase");

		for (const item of data) {
			try {
				// Validate required fields
				if (
					!item.id ||
					!item.title ||
					!item.categories ||
					item.categories.length === 0
				) {
					warnings.push(`Item ${item.id} missing required fields`);
					metrics.warningsCount++;
				}

				// Validate categories
				if (
					item.categories.some(
						(cat) =>
							!["develop", "video", "design", "video&design", "other"].includes(
								cat,
							),
					)
				) {
					warnings.push(`Item ${item.id} has invalid categories`);
					metrics.warningsCount++;
				}

				// Validate dates
				if (item.useManualDate && item.manualDate) {
					const date = new Date(item.manualDate);
					if (Number.isNaN(date.getTime())) {
						warnings.push(`Item ${item.id} has invalid manual date`);
						metrics.warningsCount++;
					}
				}

				// Validate markdown path
				if (item.markdownPath && !item.markdownPath.endsWith(".md")) {
					warnings.push(`Item ${item.id} has invalid markdown path`);
					metrics.warningsCount++;
				}
			} catch (error) {
				this.errorHandler.onValidationError(error as Error, item);
				metrics.errorsCount++;
			}
		}

		this.log("Validation completed", {
			validatedItems: data.length,
			warnings: warnings.length,
		});
	}

	/**
	 * Analyze performance and generate warnings
	 */
	private analyzePerformance(
		metrics: PerformanceMetrics,
		warnings: string[],
	): void {
		if (this.config.enableMonitoring) {
			// Memory usage analysis
			const memUsage = process.memoryUsage();
			metrics.memoryUsage = {
				heapUsed: memUsage.heapUsed,
				heapTotal: memUsage.heapTotal,
				external: memUsage.external,
			};

			// Performance warnings
			if (metrics.duration && metrics.duration > this.config.timeoutMs * 0.8) {
				const warning = `Processing time approaching timeout: ${metrics.duration}ms`;
				warnings.push(warning);
				this.errorHandler.onPerformanceWarning(warning, metrics);
			}

			if (memUsage.heapUsed > 500 * 1024 * 1024) {
				// 500MB
				const warning = `High memory usage detected: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`;
				warnings.push(warning);
				this.errorHandler.onPerformanceWarning(warning, metrics);
			}

			if (metrics.errorsCount > metrics.itemsProcessed * 0.05) {
				// 5% error rate
				const warning = `High error rate detected: ${metrics.errorsCount}/${metrics.itemsProcessed}`;
				warnings.push(warning);
				this.errorHandler.onPerformanceWarning(warning, metrics);
			}
		}
	}

	/**
	 * Migrate legacy content item to enhanced format
	 */
	private migrateLegacyItem(item: ContentItem): EnhancedContentItem {
		return {
			...item,
			categories: item.category
				? migrateCategoryToCategories(item.category as string)
				: ["other"],
			isOtherCategory: item.category === "other",
			useManualDate: false,
			effectiveDate: item.createdAt,
			processedImages: item.images || [],
			originalImages: [],
		};
	}

	/**
	 * Load markdown content for an item with caching
	 */
	private async loadMarkdownContent(
		item: EnhancedContentItem,
		metrics: PerformanceMetrics,
	): Promise<EnhancedContentItem> {
		if (!item.markdownPath || item.markdownContent) {
			return item;
		}

		try {
			// Try to get from cache first
			const cachedContent = await enhancedDataCache.getMarkdownContent(
				item.markdownPath,
			);

			if (cachedContent !== null) {
				metrics.cacheHits++;
				return { ...item, markdownContent: cachedContent };
			}

			// Cache miss - load from file
			const markdownPath = path.join(process.cwd(), item.markdownPath);
			const markdownContent = await fs.readFile(markdownPath, "utf-8");

			// Cache the content
			enhancedDataCache.setMarkdownContent(item.markdownPath, markdownContent);
			metrics.cacheMisses++;

			return { ...item, markdownContent };
		} catch (error) {
			this.logWarning(`Failed to load markdown for ${item.id}`, error);
			metrics.warningsCount++;
			return item;
		}
	}

	/**
	 * Update tag usage counts
	 */
	private async updateTagUsage(
		item: EnhancedContentItem,
		metrics: PerformanceMetrics,
	): Promise<void> {
		if (!this.tagManager || !item.tags || item.tags.length === 0) {
			return;
		}

		try {
			await Promise.all(
				item.tags.map((tag) => this.tagManager?.updateTagUsage(tag)),
			);
		} catch (error) {
			this.logWarning(`Failed to update tag usage for ${item.id}`, error);
			metrics.warningsCount++;
		}
	}

	/**
	 * Calculate effective date for an item
	 */
	private calculateEffectiveDate(
		item: EnhancedContentItem,
	): EnhancedContentItem {
		if (!this.dateManager) {
			return item;
		}

		try {
			const effectiveDate = getEffectiveDate(item);
			return {
				...item,
				effectiveDate: effectiveDate.toISOString(),
			};
		} catch (error) {
			this.logWarning(
				`Failed to calculate effective date for ${item.id}`,
				error,
			);
			return item;
		}
	}

	/**
	 * Cache management methods
	 */
	async getCachedPortfolioData(
		category?: string,
	): Promise<EnhancedContentItem[] | null> {
		if (!this.config.enableCaching) {
			return null;
		}

		const cached = enhancedDataCache.getPortfolioItems(category) as
			| EnhancedContentItem[]
			| null;
		return cached;
	}

	setCachedPortfolioData(
		items: EnhancedContentItem[],
		category?: string,
	): void {
		if (this.config.enableCaching) {
			enhancedDataCache.setPortfolioItems(items, category);
		}
	}

	invalidateCache(
		options: {
			markdown?: boolean;
			tags?: boolean;
			images?: boolean;
			portfolio?: boolean;
			specific?: { type: "markdown" | "image"; path: string };
		} = {},
	): void {
		if (options.markdown) {
			enhancedDataCache.invalidateMarkdownCache();
		}
		if (options.tags) {
			enhancedDataCache.invalidateTagCache();
		}
		if (options.images) {
			enhancedDataCache.invalidateImageCache();
		}
		if (options.portfolio) {
			enhancedDataCache.invalidatePortfolioCache();
		}
		if (options.specific) {
			if (options.specific.type === "markdown") {
				enhancedDataCache.invalidateMarkdownCache(options.specific.path);
			} else if (options.specific.type === "image") {
				enhancedDataCache.invalidateImageCache(options.specific.path);
			}
		}

		this.log("Cache invalidated", options);
	}

	async preloadCache(items: EnhancedContentItem[]): Promise<void> {
		if (!this.config.enableCaching) {
			return;
		}

		try {
			// Preload common data
			await enhancedDataCache.preloadCommonData();

			// Warm cache with specific items
			const itemsToWarm = items.map((item) => ({
				id: item.id,
				markdownPath: item.markdownPath,
			}));

			await enhancedDataCache.warmCache(itemsToWarm);

			this.log("Cache preloaded successfully", { itemCount: items.length });
		} catch (error) {
			this.logWarning("Failed to preload cache", error);
		}
	}

	getCacheStats(): ReturnType<typeof enhancedDataCache.getCacheStats> {
		return enhancedDataCache.getCacheStats();
	}

	/**
	 * Process content data with caching support
	 */
	async processContentDataWithCache(
		rawData: (ContentItem | EnhancedContentItem)[],
		options: {
			enableMigration?: boolean;
			enableMarkdownLoading?: boolean;
			enableTagUpdates?: boolean;
			enableDateCalculation?: boolean;
			enableValidation?: boolean;
			category?: string;
			useCache?: boolean;
		} = {},
	): Promise<PipelineResult<EnhancedContentItem>> {
		// Try to get from cache first
		if (options.useCache !== false && this.config.enableCaching) {
			const cached = await this.getCachedPortfolioData(options.category);
			if (cached && cached.length > 0) {
				this.log("Returning cached portfolio data", {
					itemCount: cached.length,
					category: options.category,
				});

				return {
					data: cached,
					metrics: {
						startTime: Date.now(),
						endTime: Date.now(),
						duration: 0,
						itemsProcessed: cached.length,
						errorsCount: 0,
						warningsCount: 0,
						cacheHits: cached.length,
						cacheMisses: 0,
					},
					errors: [],
					warnings: [],
					success: true,
				};
			}
		}

		// Process data normally
		const result = await this.processContentData(rawData, options);

		// Cache the result if successful
		if (result.success && this.config.enableCaching) {
			this.setCachedPortfolioData(result.data, options.category);
		}

		return result;
	}

	/**
	 * Logging utilities
	 */
	private log(message: string, data?: unknown): void {
		if (this.config.enableLogging) {
			console.log(`[EnhancedDataPipeline] ${message}`, data || "");
		}
	}

	private logWarning(message: string, data?: unknown): void {
		if (this.config.enableLogging) {
			console.warn(`[EnhancedDataPipeline] WARNING: ${message}`, data || "");
		}
	}

	private logError(message: string, data?: unknown): void {
		if (this.config.enableLogging) {
			console.error(`[EnhancedDataPipeline] ERROR: ${message}`, data || "");
		}
	}
}

/**
 * Default pipeline instance with standard configuration
 */
export const createDefaultPipeline = (): EnhancedDataProcessingPipeline => {
	return new EnhancedDataProcessingPipeline({
		enableLogging: process.env.NODE_ENV === "development",
		enableMonitoring: true,
		enableCaching: true,
		maxConcurrentOperations: 5,
		errorThreshold: 0.1,
		retryAttempts: 3,
		timeoutMs: 30000,
	});
};

/**
 * Production pipeline instance with optimized configuration
 */
export const createProductionPipeline = (): EnhancedDataProcessingPipeline => {
	return new EnhancedDataProcessingPipeline({
		enableLogging: false,
		enableMonitoring: true,
		enableCaching: true,
		maxConcurrentOperations: 10,
		errorThreshold: 0.05,
		retryAttempts: 2,
		timeoutMs: 15000,
	});
};
