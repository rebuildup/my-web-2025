/**
 * Content Management Types
 * Based on documents/01_global.md specifications
 */

export type ContentType =
  | "portfolio"
  | "plugin"
  | "blog"
  | "profile"
  | "page"
  | "tool"
  | "asset"
  | "download"
  | "other";

// Portfolio specific category types
export type PortfolioCategory = "develop" | "video" | "design";

// General category type that can be extended for different content types
export type CategoryType = PortfolioCategory | string;

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  category: CategoryType;
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  priority: number; // 0-100
  createdAt: string; // ISO 8601
  updatedAt?: string;
  publishedAt?: string;

  thumbnail?: string;
  images?: string[];
  videos?: MediaEmbed[];
  externalLinks?: ExternalLink[];
  downloadInfo?: DownloadInfo;
  content?: string; // Markdown or HTML - kept for backward compatibility
  contentPath?: string; // Legacy field - kept for backward compatibility
  markdownPath?: string; // New markdown file path
  markdownMigrated?: boolean; // Migration completion flag
  stats?: ContentStats;
  seo?: SEOData;
  customFields?: Record<string, unknown>;
  aspectRatio?: number; // For grid layout calculations
}

// Enhanced content item interface for markdown system
export interface MarkdownContentItem extends ContentItem {
  markdownPath?: string; // Path to markdown file
  markdownMigrated?: boolean; // Migration completion flag
}

// Markdown file metadata for tracking and integrity
export interface MarkdownFileMetadata {
  id: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  checksum: string; // File integrity check
}

// Embed resolution mapping for markdown content
export interface EmbedResolutionMap {
  images: Map<number, string>; // index -> URL
  videos: Map<number, MediaEmbed>; // index -> video data
  links: Map<number, ExternalLink>; // index -> link data
}

// Media data structure for embed resolution
export interface MediaData {
  images: string[];
  videos: MediaEmbed[];
  externalLinks: ExternalLink[];
}

// Embed reference structure for parsing
export interface EmbedReference {
  type: "image" | "video" | "link";
  index: number;
  altText?: string;
  customText?: string;
}

// Validation result for embed syntax
export interface ValidationResult {
  isValid: boolean;
  errors: EmbedError[];
  warnings?: string[];
}

// Embed error types for validation
export interface EmbedError {
  type: "INVALID_INDEX" | "MISSING_MEDIA" | "MALFORMED_SYNTAX";
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface MediaEmbed {
  type: "youtube" | "vimeo" | "code" | "social" | "iframe";
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ImageItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ExternalLink {
  type: "github" | "demo" | "booth" | "website" | "other";
  url: string;
  title: string;
  description?: string;
}

export interface DownloadInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  price?: number;
  version?: string;
  downloadCount: number;
  lastDownloaded?: string;
}

export interface ContentStats {
  views: number;
  downloads?: number;
  likes?: number;
  shares?: number;
  lastViewed?: string;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

// Search functionality types
export interface SearchIndex {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  searchableContent: string; // title + description + content + tags
  searchScore?: number; // Optional search score for performance optimization
}

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  url: string;
  score: number;
  highlights: string[];
}

export interface SearchOptions {
  type?: ContentType;
  category?: string;
  limit?: number;
  includeContent?: boolean; // markdownファイルの内容も検索対象に含める
}

// Statistics types
export interface StatData {
  downloads: Record<string, number>;
  views: Record<string, number>;
  searches: Record<string, number>;
  lastUpdated: string;
}

// Portfolio category constants and helpers
export const PORTFOLIO_CATEGORIES = {
  DEVELOP: "develop" as const,
  VIDEO: "video" as const,
  DESIGN: "design" as const,
} as const;

export const PORTFOLIO_CATEGORY_LABELS = {
  [PORTFOLIO_CATEGORIES.DEVELOP]: "Development",
  [PORTFOLIO_CATEGORIES.VIDEO]: "Video",
  [PORTFOLIO_CATEGORIES.DESIGN]: "Design",
} as const;

// Helper function to check if a category is a valid portfolio category
export const isValidPortfolioCategory = (
  category: string,
): category is PortfolioCategory => {
  return Object.values(PORTFOLIO_CATEGORIES).includes(
    category as PortfolioCategory,
  );
};

// Helper function to get portfolio category options for forms
export const getPortfolioCategoryOptions = () => {
  return Object.entries(PORTFOLIO_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};
