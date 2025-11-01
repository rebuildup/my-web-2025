/**
 * Enhanced Content Types for Portfolio Content Data Enhancement
 * Based on portfolio-content-data-enhancement design specifications
 */

import type { CategoryType, ContentItem } from "./content";
import type { PortfolioContentItem } from "./portfolio";

// Enhanced category type with "other" category added
export type EnhancedCategoryType =
	| "develop"
	| "video"
	| "design"
	| "video&design"
	| "other";

// Enhanced ContentItem with multiple categories and additional features
export interface EnhancedContentItem extends Omit<ContentItem, "category"> {
	// Multiple categories support (replacing single category)
	categories: EnhancedCategoryType[];

	// Other category support
	isOtherCategory?: boolean;

	// Manual date management
	manualDate?: string; // ISO 8601 format
	useManualDate?: boolean;
	effectiveDate?: string; // Computed effective date

	// Enhanced image management
	originalImages?: string[]; // Non-processed images
	processedImages?: string[]; // Processed images (replaces images)

	// Markdown file management
	markdownPath?: string; // Path to .md file
	markdownContent?: string; // Cached markdown content

	// Download-specific fields
	downloadUrl?: string;
	fileSize?: string;
	fileFormat?: string;

	// SEO fields
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string;

	// Backward compatibility
	category?: CategoryType; // Keep for migration compatibility
}

// Tag management system types
export interface TagInfo {
	name: string;
	count: number; // Usage count
	createdAt: string; // ISO 8601
	lastUsed: string; // ISO 8601
}

export interface TagManagementSystem {
	getAllTags(): Promise<TagInfo[]>;
	createTag(name: string): Promise<TagInfo>;
	updateTagUsage(name: string): Promise<void>;
	deleteTag(name: string): Promise<boolean>;
	searchTags(query: string): Promise<TagInfo[]>;
}

// Date management system types
export interface DateManagementSystem {
	setManualDate(itemId: string, date: string): Promise<void>;
	getEffectiveDate(item: EnhancedContentItem): Date;
	validateDate(date: string): boolean;
	formatDateForDisplay(date: string): string;
	formatDateForStorage(date: Date): string;
}

export interface DatePickerProps {
	value?: string;
	onChange: (date: string) => void;
	useManualDate: boolean;
	onToggleManualDate: (use: boolean) => void;
	placeholder?: string;
}

// Enhanced file upload system types
export interface EnhancedFileUploadOptions {
	skipProcessing?: boolean; // Skip image processing
	preserveOriginal?: boolean; // Keep original file
	generateVariants?: boolean; // Generate multiple sizes
	customProcessing?: {
		watermark?: boolean;
		resize?: { width: number; height: number };
		format?: "webp" | "jpeg" | "png";
	};
}

export interface FileUploadResult {
	originalUrl?: string; // Non-processed file URL
	processedUrl?: string; // Processed file URL
	thumbnailUrl?: string; // Thumbnail URL
	variants?: { [key: string]: string }; // Various sizes
	metadata: FileMetadata;
	error?: string; // Error message if upload failed
	isDuplicate?: boolean; // True if file is a duplicate
}

export interface FileMetadata {
	fileName: string;
	fileSize: number;
	mimeType: string;
	width?: number;
	height?: number;
	uploadedAt: string; // ISO 8601
}

export interface EnhancedFileUploadSectionProps {
	images: string[];
	originalImages?: string[];
	thumbnail?: string;
	onImagesChange: (images: string[]) => void;
	onOriginalImagesChange: (images: string[]) => void;
	onThumbnailChange: (thumbnail: string | undefined) => void;
	uploadOptions: EnhancedFileUploadOptions;
	onUploadOptionsChange: (options: EnhancedFileUploadOptions) => void;
}

// Markdown file management system types
export interface MarkdownFileManager {
	createMarkdownFile(itemId: string, content: string): Promise<string>; // Returns file path
	updateMarkdownFile(filePath: string, content: string): Promise<void>;
	readMarkdownFile(filePath: string): Promise<string>;
	deleteMarkdownFile(filePath: string): Promise<void>;
	getMarkdownFilePath(itemId: string): string;
	validateMarkdownPath(path: string): boolean;
}

export interface MarkdownEditorProps {
	content: string;
	filePath?: string;
	onChange: (content: string) => void;
	onSave?: (content: string, filePath: string) => Promise<void>;
	preview?: boolean;
	toolbar?: boolean;
	embedSupport?: boolean;
	mediaData?: {
		images: string[];
		videos: Array<{
			type: string;
			url: string;
			title?: string;
			description?: string;
			thumbnail?: string;
		}>;
		externalLinks: Array<{
			type: string;
			url: string;
			title: string;
			description?: string;
		}>;
	};
	onValidationErrors?: (
		errors: Array<{
			line: number;
			column: number;
			type: "INVALID_INDEX" | "MISSING_MEDIA" | "MALFORMED_SYNTAX";
			message: string;
			suggestion?: string;
		}>,
	) => void;
}

// Enhanced UI component types
export interface MultiCategorySelectorProps {
	selectedCategories: EnhancedCategoryType[];
	onChange: (categories: EnhancedCategoryType[]) => void;
	availableCategories: EnhancedCategoryType[];
	maxSelections?: number;
	showOtherOption?: boolean;
}

export interface TagManagementUIProps {
	selectedTags: string[];
	onChange: (tags: string[]) => void;
	tagManager: TagManagementSystem;
	allowNewTags?: boolean;
	maxTags?: number;
}

export interface EnhancedDataManagerProps {
	item?: EnhancedContentItem;
	onSave: (item: EnhancedContentItem) => Promise<void>;
	onCancel: () => void;
	mode: "create" | "edit";
	tagManager: TagManagementSystem;
	markdownManager: MarkdownFileManager;
	dateManager: DateManagementSystem;
}

// Enhanced gallery filtering types
export interface EnhancedGalleryFilterProps {
	items: EnhancedContentItem[];
	targetCategories: EnhancedCategoryType[]; // Target categories to display
	includeOther?: boolean; // Include "other" category
	onFilteredItemsChange: (items: EnhancedContentItem[]) => void;
}

export interface VideoDesignGalleryProps {
	items: (PortfolioContentItem | EnhancedContentItem)[];
	showVideoItems?: boolean; // Show video category
	showDesignItems?: boolean; // Show design category
	showVideoDesignItems?: boolean; // Show video&design category
	deduplication?: boolean; // Remove duplicates
	enableCaching?: boolean; // Enable performance caching
	onError?: (error: Error) => void; // Error callback
}

// Data migration types
export interface DataMigrationHandler {
	migrateContentItem(oldItem: ContentItem): EnhancedContentItem;
	validateMigratedData(item: EnhancedContentItem): ValidationResult;
	createBackup(items: ContentItem[]): Promise<string>; // Backup file path
	rollbackMigration(backupPath: string): Promise<void>;
}

export interface MigrationError {
	type: "validation" | "file_creation" | "data_corruption";
	itemId: string;
	message: string;
	originalData: unknown;
	suggestedFix?: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	field: string;
	message: string;
	code: string;
}

export interface ValidationWarning {
	field: string;
	message: string;
	code: string;
}

// File operation error types
export interface FileOperationError {
	operation: "upload" | "read" | "write" | "delete";
	filePath: string;
	error: Error;
	retryable: boolean;
}

// Enhanced category constants and helpers
export const ENHANCED_PORTFOLIO_CATEGORIES = {
	DEVELOP: "develop" as const,
	VIDEO: "video" as const,
	DESIGN: "design" as const,
	VIDEO_DESIGN: "video&design" as const,
	OTHER: "other" as const,
} as const;

export const ENHANCED_PORTFOLIO_CATEGORY_LABELS = {
	[ENHANCED_PORTFOLIO_CATEGORIES.DEVELOP]: "Development",
	[ENHANCED_PORTFOLIO_CATEGORIES.VIDEO]: "Video",
	[ENHANCED_PORTFOLIO_CATEGORIES.DESIGN]: "Design",
	[ENHANCED_PORTFOLIO_CATEGORIES.VIDEO_DESIGN]: "Video & Design",
	[ENHANCED_PORTFOLIO_CATEGORIES.OTHER]: "Other",
} as const;

// Helper function to check if a category is a valid enhanced portfolio category
export const isValidEnhancedPortfolioCategory = (
	category: string,
): category is EnhancedCategoryType => {
	return Object.values(ENHANCED_PORTFOLIO_CATEGORIES).includes(
		category as EnhancedCategoryType,
	);
};

// Helper function to get enhanced portfolio category options for forms
export const getEnhancedPortfolioCategoryOptions = () => {
	return Object.entries(ENHANCED_PORTFOLIO_CATEGORY_LABELS).map(
		([value, label]) => ({
			value,
			label,
		}),
	);
};

// Helper function to check if an item has "other" category
export const hasOtherCategory = (item: EnhancedContentItem): boolean => {
	return item.isOtherCategory === true || item.categories.includes("other");
};

// Helper function to check if an item should be excluded from specific galleries
export const shouldExcludeFromGallery = (
	item: EnhancedContentItem,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_galleryType: "develop" | "video" | "design" | "video&design",
): boolean => {
	return hasOtherCategory(item);
};

// Helper function to get effective date (for enhanced content items only)
// Note: Use the flexible getEffectiveDate from @/types for general use
export const getEnhancedEffectiveDate = (item: EnhancedContentItem): Date => {
	// Always prioritize manual date if available, regardless of useManualDate flag
	if (item.manualDate) {
		return new Date(item.manualDate);
	}
	return new Date(item.createdAt);
};

// Helper function to migrate single category to multiple categories
export const migrateCategoryToCategories = (
	category: CategoryType,
): EnhancedCategoryType[] => {
	if (
		typeof category === "string" &&
		isValidEnhancedPortfolioCategory(category)
	) {
		return [category];
	}
	// Default to "other" if category is not recognized
	return ["other"];
};

// Type guard to check if an item is EnhancedContentItem
export const isEnhancedContentItem = (
	item: ContentItem | EnhancedContentItem,
): item is EnhancedContentItem => {
	return (
		"categories" in item &&
		Array.isArray((item as EnhancedContentItem).categories)
	);
};
