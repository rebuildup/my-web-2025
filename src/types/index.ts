/**
 * Central Type Exports
 * Extensible architecture for easy addition of new content types
 * Based on documents/01_global.md specifications
 */

// Content Management Types
export type {
  ContentItem,
  ContentType,
  MediaEmbed,
  ExternalLink,
  DownloadInfo,
  ContentStats,
  SEOData,
  SearchIndex,
  SearchResult,
  SearchOptions,
  StatData,
} from "./content";

// Site Configuration Types
export type {
  SiteConfig,
  AuthorInfo,
  SocialLink,
  ThemeConfig,
  FeatureConfig,
  IntegrationConfig,
  GlobalSEOConfig,
} from "./site-config";

// Form Configuration Types
export type {
  FormConfig,
  FormField,
  FormFieldType,
  FormFieldOption,
  FieldValidation,
  ValidationRule,
  SubmitConfig,
} from "./form-config";

// Navigation Types
export type { NavigationItem, PageConfig, GridConfig } from "./navigation";

// API Types
export type {
  ApiResponse,
  PaginationInfo,
  ContentApiParams,
  SearchApiRequest,
  SearchApiResponse,
  StatsUpdateRequest,
  StatsResponse,
  ContactFormData,
  ContactApiResponse,
  AdminContentRequest,
  AdminUploadRequest,
  AdminUploadResponse,
  AppError,
} from "./api";

// Utility Types
export type {
  LazyComponentConfig,
  ImageOptimizationConfig,
  CacheItem,
  CacheManager,
  MemoryOptimization,
  ValidationResult,
  Validators,
  FileUploadConfig,
  ProcessedFile,
  ColorPalette,
  ColorInfo,
  ToolConfig,
  GridSystemConfig,
} from "./utils";

// Import types for type guards
import type { FormFieldType } from "./form-config";
import type { ContentType, ContentItem } from "./content";

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

// Export ContentError class for convenience
export { ContentError } from "./api";
