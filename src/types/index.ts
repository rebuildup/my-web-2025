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
  ExternalLink,
  MediaEmbed,
  SearchIndex,
  SearchOptions,
  SearchResult,
  SEOData,
  StatData,
} from "./content";

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
  PortfolioSearchIndex,
  PortfolioSEOData,
  PortfolioStats,
  ValidationError,
  ValidationResult,
  ValidationWarning,
  VideoFilterOptions,
  WebGLExperiment,
} from "./portfolio";

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
  getEffectiveDate,
  getEnhancedPortfolioCategoryOptions,
  hasOtherCategory,
  isEnhancedContentItem as isEnhancedContentItemHelper,
  isValidEnhancedPortfolioCategory,
  migrateCategoryToCategories,
  shouldExcludeFromGallery,
} from "./enhanced-content";

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
import { EnhancedCategoryType, EnhancedContentItem } from "./enhanced-content";
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
