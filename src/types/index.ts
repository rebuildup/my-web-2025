/**
 * Central Type Exports
 * Extensible architecture for easy addition of new content types
 * Based on documents/01_global.md specifications
 */

// Content Management Types
export type {
	ContentItem,
	ContentStats,
	ContentType,
	DownloadInfo,
	EmbedError,
	EmbedReference,
	EmbedResolutionMap,
	ExternalLink,
	MarkdownContentItem,
	MarkdownFileMetadata,
	MediaData,
	MediaEmbed,
	SEOData,
	SearchIndex,
	SearchOptions,
	SearchResult,
	StatData,
} from "./content";
// Enhanced Content Types for Portfolio Content Data Enhancement
export type {
	DataMigrationHandler,
	DateManagementSystem,
	DatePickerProps,
	EnhancedCategoryType,
	EnhancedContentItem,
	EnhancedDataManagerProps,
	EnhancedFileUploadOptions,
	EnhancedFileUploadSectionProps,
	EnhancedGalleryFilterProps,
	FileMetadata,
	FileOperationError,
	FileUploadResult,
	MarkdownEditorProps,
	MarkdownFileManager,
	MigrationError,
	MultiCategorySelectorProps,
	TagInfo,
	TagManagementSystem,
	TagManagementUIProps,
	VideoDesignGalleryProps,
} from "./enhanced-content";
// Enhanced Content Helper Functions
export {
	ENHANCED_PORTFOLIO_CATEGORIES as ENHANCED_CATEGORIES,
	ENHANCED_PORTFOLIO_CATEGORY_LABELS as ENHANCED_CATEGORY_LABELS,
	getEnhancedPortfolioCategoryOptions,
	hasOtherCategory,
	isEnhancedContentItem as isEnhancedContentItemHelper,
	isValidEnhancedPortfolioCategory,
	migrateCategoryToCategories,
	shouldExcludeFromGallery,
} from "./enhanced-content";
// Portfolio-specific Types
export type {
	CategoryStats,
	DevelopFilterOptions,
	DeviceCapabilities,
	ExperimentItem,
	FilterOptions,
	GalleryItem,
	GalleryType,
	GridConfig,
	PortfolioContentItem,
	PortfolioSEOData,
	PortfolioSearchIndex,
	PortfolioStats,
	ValidationError,
	ValidationResult,
	ValidationWarning,
	VideoFilterOptions,
	WebGLExperiment,
} from "./portfolio";

// Flexible getEffectiveDate function that works with both ContentItem and EnhancedContentItem
export const getEffectiveDate = (
	item: ContentItem | EnhancedContentItem,
): Date => {
	// Check if it's an enhanced content item with manual date
	if (isEnhancedContentItem(item) && (item as EnhancedContentItem).manualDate) {
		const md = (item as EnhancedContentItem).manualDate;
		return new Date(md as string);
	}
	// Fall back to creation date for all items
	return new Date(item.createdAt);
};

// API Types
export type {
	AdminContentRequest,
	AdminUploadRequest,
	AdminUploadResponse,
	ApiResponse,
	AppError,
	ContactApiResponse,
	ContactFormData,
	ContentApiParams,
	PaginationInfo,
	SearchApiRequest,
	SearchApiResponse,
	StatsResponse,
	StatsUpdateRequest,
} from "./api";

// Form Configuration Types
export type {
	FieldValidation,
	FormConfig,
	FormField,
	FormFieldOption,
	FormFieldType,
	SubmitConfig,
	ValidationRule,
} from "./form-config";

// Navigation Types
export type {
	GridConfig as NavigationGridConfig,
	NavigationItem,
	PageConfig,
} from "./navigation";
// Site Configuration Types
export type {
	AuthorInfo,
	FeatureConfig,
	GlobalSEOConfig,
	IntegrationConfig,
	SiteConfig,
	SocialLink,
	ThemeConfig,
} from "./site-config";

// Utility Types
export type {
	CacheItem,
	CacheManager,
	ColorInfo,
	ColorPalette,
	FileUploadConfig,
	GridSystemConfig,
	ImageOptimizationConfig,
	LazyComponentConfig,
	MemoryOptimization,
	ProcessedFile,
	ToolConfig,
	ValidationResult as UtilsValidationResult,
	Validators,
} from "./utils";

// Import types for type guards
import type { ContentItem, ContentType } from "./content";
import type {
	EnhancedCategoryType,
	EnhancedContentItem,
} from "./enhanced-content";
import type { FormFieldType } from "./form-config";

// Type Guards for Content Types
export const isContentType = (value: string): value is ContentType => {
	return [
		"portfolio",
		"plugin",
		"blog",
		"profile",
		"page",
		"tool",
		"asset",
		"download",
		"other",
	].includes(value);
};

export const isFormFieldType = (value: string): value is FormFieldType => {
	return [
		"text",
		"email",
		"textarea",
		"select",
		"checkbox",
		"radio",
		"file",
		"calculator",
	].includes(value);
};

// Utility functions for type checking
export const validateContentItem = (item: unknown): item is ContentItem => {
	return (
		typeof item === "object" &&
		item !== null &&
		typeof (item as ContentItem).id === "string" &&
		isContentType((item as ContentItem).type) &&
		typeof (item as ContentItem).title === "string" &&
		typeof (item as ContentItem).description === "string" &&
		typeof (item as ContentItem).category === "string" &&
		Array.isArray((item as ContentItem).tags) &&
		["published", "draft", "archived", "scheduled"].includes(
			(item as ContentItem).status,
		) &&
		typeof (item as ContentItem).priority === "number" &&
		typeof (item as ContentItem).createdAt === "string"
	);
};

// Import markdown types for validation
import type { MarkdownContentItem } from "./content";

// Markdown content item validation
export const validateMarkdownContentItem = (
	item: unknown,
): item is MarkdownContentItem => {
	return (
		validateContentItem(item) &&
		(typeof (item as MarkdownContentItem).markdownPath === "string" ||
			(item as MarkdownContentItem).markdownPath === undefined) &&
		(typeof (item as MarkdownContentItem).markdownMigrated === "boolean" ||
			(item as MarkdownContentItem).markdownMigrated === undefined)
	);
};

// Type guard to check if an item has markdown support
export const isMarkdownContentItem = (
	item: ContentItem,
): item is MarkdownContentItem => {
	return "markdownPath" in item || "markdownMigrated" in item;
};

// Enhanced content type guards and utilities
export const isEnhancedCategoryType = (
	value: string,
): value is EnhancedCategoryType => {
	return ["develop", "video", "design", "video&design", "other"].includes(
		value,
	);
};

export const validateEnhancedContentItem = (
	item: unknown,
): item is EnhancedContentItem => {
	return (
		typeof item === "object" &&
		item !== null &&
		typeof (item as EnhancedContentItem).id === "string" &&
		isContentType((item as EnhancedContentItem).type) &&
		typeof (item as EnhancedContentItem).title === "string" &&
		typeof (item as EnhancedContentItem).description === "string" &&
		Array.isArray((item as EnhancedContentItem).categories) &&
		(item as EnhancedContentItem).categories.every((cat) =>
			isEnhancedCategoryType(cat),
		) &&
		Array.isArray((item as EnhancedContentItem).tags) &&
		["published", "draft", "archived", "scheduled"].includes(
			(item as EnhancedContentItem).status,
		) &&
		typeof (item as EnhancedContentItem).priority === "number" &&
		typeof (item as EnhancedContentItem).createdAt === "string"
	);
};

export const isEnhancedContentItem = (
	item: ContentItem | EnhancedContentItem,
): item is EnhancedContentItem => {
	return (
		"categories" in item &&
		Array.isArray((item as EnhancedContentItem).categories)
	);
};

// Constants for easy reference
export const CONTENT_TYPES = [
	"portfolio",
	"plugin",
	"blog",
	"profile",
	"page",
	"tool",
	"asset",
	"download",
] as const;

export const FORM_FIELD_TYPES = [
	"text",
	"email",
	"textarea",
	"select",
	"checkbox",
	"radio",
	"file",
	"calculator",
] as const;

export const CONTENT_STATUS_OPTIONS = [
	"published",
	"draft",
	"archived",
	"scheduled",
] as const;

export const ENHANCED_PORTFOLIO_CATEGORIES = [
	"develop",
	"video",
	"design",
	"video&design",
	"other",
] as const;

// Export ContentError class for convenience
export { ContentError } from "./api";
