/**
 * Portfolio-specific types extending the base ContentItem
 * Based on portfolio-complete-implementation design specifications
 */

import type { ContentItem, ExternalLink } from "./content";

// Extended ContentItem for portfolio-specific features
export interface PortfolioContentItem extends ContentItem {
  // Gallery display properties
  thumbnail: string;
  aspectRatio?: number;
  gridSize?: "1x1" | "1x2" | "2x1" | "2x2" | "1x3";

  // Development project properties
  repository?: ExternalLink;
  technologies: string[];
  projectType?: "web" | "game" | "tool" | "plugin";

  // Video project properties
  videoType?: "mv" | "lyric" | "animation" | "promotion";
  client?: string;
  duration?: number;

  // Playground properties
  interactive?: boolean;
  experimentType?: "design" | "webgl";
  performanceLevel?: "low" | "medium" | "high";

  // Enhanced SEO metadata
  seo: PortfolioSEOData;
}

export interface PortfolioSEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterImage: string;
  canonical: string;
  structuredData: object;
}

// Filter options for different gallery types
export interface FilterOptions {
  category?: string;
  tags?: string[];
  year?: number;
  sortBy: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder: "asc" | "desc";
}

export interface DevelopFilterOptions extends FilterOptions {
  technologies?: string[];
  projectType?: "web" | "game" | "tool" | "plugin";
}

export interface VideoFilterOptions extends FilterOptions {
  videoType?: "mv" | "lyric" | "animation" | "promotion";
  client?: string;
}

// Grid configuration for video&design gallery
export interface GridConfig {
  columns: number;
  aspectRatio: number;
  dynamicSizing: boolean;
}

// Experiment items for playground
export interface ExperimentItem {
  id: string;
  title: string;
  description: string;
  technology: string[];
  interactive: boolean;
  component: React.ComponentType;
}

export interface WebGLExperiment extends ExperimentItem {
  webglType: "3d" | "shader" | "particle" | "effect";
  performanceLevel: "low" | "medium" | "high";
}

// Device capabilities for WebGL optimization
export interface DeviceCapabilities {
  webglSupport: boolean;
  performanceLevel: "low" | "medium" | "high";
  touchSupport: boolean;
}

// Validation result
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

// Gallery item for transformed data
export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  aspectRatio?: number;
  gridSize?: string;
  technologies?: string[];
  videoType?: string;
  client?: string;
  interactive?: boolean;
  url: string;
}

export type GalleryType = "all" | "develop" | "video" | "video&design";

// Statistics for portfolio
export interface PortfolioStats {
  totalProjects: number;
  categoryCounts: Record<string, number>;
  technologyCounts: Record<string, number>;
  lastUpdate: Date;
}

// Category statistics
export interface CategoryStats {
  all: number;
  develop: number;
  video: number;
  "video&design": number;
}

// Search index for portfolio items
export interface PortfolioSearchIndex {
  id: string;
  type: "portfolio";
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  technologies: string[];
  searchableText: string;
  url: string;
  thumbnail: string;
}
