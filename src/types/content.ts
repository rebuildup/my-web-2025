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
  | "download";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  category: string;
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
  content?: string; // Markdown or HTML
  contentPath?: string; // Markdown path
  stats?: ContentStats;
  seo?: SEOData;
  customFields?: Record<string, unknown>;
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
