/**
 * Portfolio System Type Definitions
 *
 * This file contains comprehensive type definitions for the portfolio system,
 * including data models, configuration interfaces, and utility types.
 *
 * @fileoverview Portfolio type definitions for the complete portfolio implementation
 * @version 2.0.0
 * @author Portfolio System Team
 * @since 2025-01-01
 *
 * Key Features:
 * - Extended ContentItem for portfolio-specific features
 * - Gallery-specific filter and display options
 * - WebGL playground experiment types
 * - Device capability detection interfaces
 * - SEO and search optimization types
 * - Performance monitoring interfaces
 *
 * Usage:
 * ```typescript
 * import { PortfolioContentItem, GalleryType } from '@/types/portfolio';
 *
 * const portfolioItem: PortfolioContentItem = {
 *   // ... portfolio item data
 * };
 * ```
 */

import type { ContentItem, ExternalLink } from "./content";

/**
 * Extended ContentItem interface for portfolio-specific features
 *
 * This interface extends the base ContentItem with portfolio-specific properties
 * including gallery display options, project metadata, and SEO enhancements.
 *
 * @interface PortfolioContentItem
 * @extends ContentItem
 *
 * @example
 * ```typescript
 * const portfolioItem: PortfolioContentItem = {
 *   id: 'project-1',
 *   title: 'My Project',
 *   description: 'Project description',
 *   thumbnail: '/images/project-1-thumb.jpg',
 *   technologies: ['React', 'TypeScript'],
 *   projectType: 'web',
 *   seo: {
 *     title: 'My Project - Portfolio',
 *     description: 'Detailed project description',
 *     keywords: ['react', 'typescript', 'web'],
 *     // ... other SEO fields
 *   }
 * };
 * ```
 */
export interface PortfolioContentItem extends ContentItem {
	/**
	 * Gallery Display Properties
	 * These properties control how the item appears in various gallery layouts
	 */

	/** Thumbnail image URL for gallery display */
	thumbnail: string;

	/** Aspect ratio for responsive image display (width/height) */
	aspectRatio?: number;

	/** Grid size for video&design gallery layout */
	gridSize?: "1x1" | "1x2" | "2x1" | "2x2" | "1x3";

	/**
	 * Development Project Properties
	 * Specific to development/programming projects
	 */

	/** Link to source code repository (GitHub, GitLab, etc.) */
	repository?: ExternalLink;

	/** Array of technologies used in the project */
	technologies: string[];

	/** Type of development project */
	projectType?: "web" | "game" | "tool" | "plugin";

	/**
	 * Video Project Properties
	 * Specific to video/motion graphics projects
	 */

	/** Type of video content */
	videoType?: "mv" | "lyric" | "animation" | "promotion";

	/** Client name for commissioned work */
	client?: string;

	/** Video duration in seconds */
	duration?: number;

	/**
	 * Playground Properties
	 * For interactive experiments and demonstrations
	 */

	/** Whether the item includes interactive elements */
	interactive?: boolean;

	/** Type of playground experiment */
	experimentType?: "design" | "webgl";

	/** Performance requirements level */
	performanceLevel?: "low" | "medium" | "high";

	/**
	 * Enhanced SEO and Metadata
	 */

	/** Comprehensive SEO metadata for the portfolio item */
	seo: PortfolioSEOData;

	/**
	 * Search and Discovery
	 */

	/** Search index data for full-text search */
	searchIndex?: import("./content").SearchIndex;

	/** Array of related portfolio item IDs for recommendations */
	relatedItems?: string[];
}

/**
 * SEO metadata specifically for portfolio items
 *
 * Contains all necessary SEO information for optimal search engine visibility
 * and social media sharing.
 *
 * @interface PortfolioSEOData
 *
 * @example
 * ```typescript
 * const seoData: PortfolioSEOData = {
 *   title: 'Project Name - Portfolio | Your Name',
 *   description: 'Detailed description of the project for search engines',
 *   keywords: ['react', 'typescript', 'web development'],
 *   ogImage: '/images/project-og.jpg',
 *   twitterImage: '/images/project-twitter.jpg',
 *   canonical: 'https://yoursite.com/portfolio/project-name',
 *   structuredData: {
 *     '@context': 'https://schema.org',
 *     '@type': 'CreativeWork',
 *     // ... structured data
 *   }
 * };
 * ```
 */
export interface PortfolioSEOData {
	/** Page title for search engines and browser tabs */
	title: string;

	/** Meta description for search engine results */
	description: string;

	/** Array of relevant keywords for SEO */
	keywords: string[];

	/** Open Graph image URL for social media sharing */
	ogImage: string;

	/** Twitter Card image URL */
	twitterImage: string;

	/** Canonical URL to prevent duplicate content issues */
	canonical: string;

	/** JSON-LD structured data for rich snippets */
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
