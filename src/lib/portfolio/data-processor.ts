/**
 * Enhanced Portfolio Data Processing Pipeline
 * Task 1.3: 拡張データプロセッサーの実装
 */

import { ContentItem, EnhancedContentItem } from "@/types";
import {
  isValidPortfolioCategory,
  PORTFOLIO_CATEGORIES,
  PortfolioCategory,
  SearchIndex,
} from "@/types/content";
import { EnhancedCategoryType } from "@/types/enhanced-content";
import { PortfolioContentItem, PortfolioStats } from "@/types/portfolio";
import { testLogger } from "../utils/test-logger";
import {
  MigrationErrorHandler,
  mixedDataFormatProcessor,
} from "./data-migration";
import { portfolioDateManager } from "./date-management";
// Remove circular import - DataIntegrityIssue is defined in this file

// Re-export types for backward compatibility
export type { PortfolioContentItem, PortfolioStats };

// Data validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Data processing configuration
export interface DataProcessingConfig {
  enableDataIntegrityCheck: boolean;
  enablePerformanceOptimization: boolean;
  enableFallbackMode: boolean;
  maxRetryAttempts: number;
  cacheEnabled: boolean;
}

// Data integrity check result
export interface DataIntegrityResult {
  isValid: boolean;
  issues: DataIntegrityIssue[];
  fixedIssues: DataIntegrityIssue[];
}
export interface DataIntegrityIssue {
  type:
    | "missing_field"
    | "invalid_format"
    | "broken_reference"
    | "duplicate_id";
  itemId: string;
  field?: string;
  message: string;
  severity: "error" | "warning" | "info";
  autoFixable: boolean;
}

// Enhanced processing result
export interface ProcessingResult {
  items: PortfolioContentItem[];
  stats: ProcessingStats;
  integrityResult: DataIntegrityResult;
}

export interface ProcessingStats {
  totalItems: number;
  migratedItems: number;
  validatedItems: number;
  enrichedItems: number;
  processingTime: number;
  errors: number;
  warnings: number;
}

/**
 * Main Portfolio Data Processor Class
 */
export class PortfolioDataProcessor {
  protected readonly TECHNOLOGY_KEYWORDS = [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Unity",
    "C#",
    "After Effects",
    "Photoshop",
    "Illustrator",
    "Figma",
    "Three.js",
    "WebGL",
    "HTML",
    "CSS",
    "Tailwind",
    "SCSS",
    "Vue.js",
    "Angular",
    "Python",
    "Java",
    "PHP",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
    "Vercel",
  ];
  /**
   * Main processing pipeline - Enhanced to handle mixed data formats
   */
  async processRawData(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<PortfolioContentItem[]> {
    try {
      testLogger.log(`Processing ${rawData.length} portfolio items...`);

      // First, handle data migration for mixed formats
      const migratedData = await this.processMixedFormats(rawData);

      // Then process with existing pipeline
      const normalized = await this.normalizeData(migratedData);
      const validated = await this.validateData(normalized);
      const enriched = await this.enrichData(validated);

      testLogger.log(
        `Successfully processed ${enriched.length} portfolio items`,
      );
      return enriched;
    } catch (error) {
      testLogger.error("Error in portfolio data processing pipeline:", error);
      throw new Error(
        `Data processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Process mixed data formats (old ContentItem and new EnhancedContentItem)
   */
  protected async processMixedFormats(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<ContentItem[]> {
    try {
      // Use the migration system to handle mixed formats
      const enhancedItems =
        await mixedDataFormatProcessor.processMixedData(rawData);

      // Convert enhanced items back to ContentItem format for existing pipeline
      // This maintains backward compatibility while supporting enhanced features
      return enhancedItems.map((item) =>
        this.convertEnhancedToContentItem(item),
      );
    } catch (error) {
      testLogger.error("Error processing mixed data formats:", error);
      throw error;
    }
  } /**

   * Convert EnhancedContentItem back to ContentItem for backward compatibility
   */
  protected convertEnhancedToContentItem(
    enhancedItem: EnhancedContentItem,
  ): ContentItem {
    // Use the first category as the primary category for backward compatibility
    const primaryCategory = enhancedItem.categories[0] || "develop";

    return {
      ...enhancedItem,
      category: primaryCategory,
      // Use processed images as the main images array
      images: enhancedItem.processedImages || enhancedItem.images || [],
      // Use markdown content if available, otherwise keep existing content
      content: enhancedItem.markdownContent || enhancedItem.content,
    };
  }

  /**
   * Normalize raw data to PortfolioContentItem format
   */
  protected async normalizeData(
    data: ContentItem[],
  ): Promise<PortfolioContentItem[]> {
    return data.map((item) => {
      // Normalize category to standard categories
      const normalizedCategory = this.normalizeCategory(item.category);

      const normalized: PortfolioContentItem = {
        ...item,
        category: normalizedCategory,
        // Ensure required fields
        description: item.description || `${item.title}の作品詳細`,
        thumbnail: this.normalizeImagePath(
          item.thumbnail ||
            item.images?.[0] ||
            "/images/portfolio/default-thumb.jpg",
        ),
        technologies: this.extractTechnologies(
          Array.isArray(item.tags) ? item.tags : [],
        ),

        // Calculate display properties
        aspectRatio: this.calculateAspectRatio(item),
        gridSize: this.determineGridSize(
          normalizedCategory,
          item.images,
          item.priority,
        ),

        // Set project type based on category and tags
        projectType: this.determineProjectType(
          normalizedCategory,
          Array.isArray(item.tags) ? item.tags : [],
        ),
        videoType: this.determineVideoType(
          normalizedCategory,
          Array.isArray(item.tags) ? item.tags : [],
        ),
        experimentType: this.determineExperimentType(
          normalizedCategory,
          Array.isArray(item.tags) ? item.tags : [],
        ),

        // Initialize SEO data structure
        seo: {
          title: item.title,
          description: item.description,
          keywords: Array.isArray(item.tags) ? item.tags : [],
          ogImage: item.thumbnail || "/images/portfolio/default-og.jpg",
          twitterImage:
            item.thumbnail || "/images/portfolio/default-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
      };

      return normalized;
    });
  } /**

   * Normalize category to standard portfolio categories
   */
  protected normalizeCategory(category: string): PortfolioCategory {
    const categoryLower = category?.toLowerCase() || "";

    // First check if it's already a valid portfolio category
    if (isValidPortfolioCategory(category)) {
      return category;
    }

    // Map various category names to standard categories
    const categoryMappings: Record<string, PortfolioCategory> = {
      // Development categories
      develop: PORTFOLIO_CATEGORIES.DEVELOP,
      development: PORTFOLIO_CATEGORIES.DEVELOP,
      programming: PORTFOLIO_CATEGORIES.DEVELOP,
      coding: PORTFOLIO_CATEGORIES.DEVELOP,
      web: PORTFOLIO_CATEGORIES.DEVELOP,
      app: PORTFOLIO_CATEGORIES.DEVELOP,
      software: PORTFOLIO_CATEGORIES.DEVELOP,
      game: PORTFOLIO_CATEGORIES.DEVELOP,
      unity: PORTFOLIO_CATEGORIES.DEVELOP,

      // Video categories
      video: PORTFOLIO_CATEGORIES.VIDEO,
      aftereffects: PORTFOLIO_CATEGORIES.VIDEO,
      "after effects": PORTFOLIO_CATEGORIES.VIDEO,
      motion: PORTFOLIO_CATEGORIES.VIDEO,
      animation: PORTFOLIO_CATEGORIES.VIDEO,
      movie: PORTFOLIO_CATEGORIES.VIDEO,
      film: PORTFOLIO_CATEGORIES.VIDEO,

      // Design categories
      design: PORTFOLIO_CATEGORIES.DESIGN,
      graphic: PORTFOLIO_CATEGORIES.DESIGN,
      ui: PORTFOLIO_CATEGORIES.DESIGN,
      ux: PORTFOLIO_CATEGORIES.DESIGN,
      branding: PORTFOLIO_CATEGORIES.DESIGN,
      logo: PORTFOLIO_CATEGORIES.DESIGN,
      visual: PORTFOLIO_CATEGORIES.DESIGN,
      identity: PORTFOLIO_CATEGORIES.DESIGN,
    };

    // Check for exact matches first
    if (categoryMappings[categoryLower]) {
      return categoryMappings[categoryLower];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(categoryMappings)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return value;
      }
    }

    // Default to 'develop' if no match found
    testLogger.warn(
      `Unknown category "${category}", defaulting to "${PORTFOLIO_CATEGORIES.DEVELOP}"`,
    );
    return PORTFOLIO_CATEGORIES.DEVELOP;
  }
  /**
   * Extract technology tags from general tags
   */
  protected extractTechnologies(tags: string[]): string[] {
    // Ensure tags is an array
    const safeTags = Array.isArray(tags) ? tags : [];

    return safeTags.filter((tag) =>
      this.TECHNOLOGY_KEYWORDS.some((tech) =>
        tag.toLowerCase().includes(tech.toLowerCase()),
      ),
    );
  }

  /**
   * Calculate aspect ratio from content item
   */
  protected calculateAspectRatio(item: ContentItem): number {
    // If aspect ratio is already provided, use it
    if (item.aspectRatio) {
      return item.aspectRatio;
    }

    // Default aspect ratios based on category
    switch (item.category?.toLowerCase()) {
      case "video":
        return 16 / 9; // Standard video aspect ratio
      case "design":
        return 4 / 3; // Common design aspect ratio
      case "develop":
        return 16 / 10; // Common web development aspect ratio
      default:
        return 1; // Square fallback
    }
  }

  /**
   * Determine grid size based on category, content, and priority
   */
  protected determineGridSize(
    category: string,
    images?: string[],
    priority: number = 50,
  ): "1x1" | "1x2" | "2x1" | "2x2" | "1x3" {
    const imageCount = images?.length || 0;

    // High priority items get larger sizes
    if (priority >= 80) {
      const largeSizes: ("2x2" | "1x3")[] = ["2x2", "1x3"];
      return largeSizes[Math.floor(Math.random() * largeSizes.length)];
    }

    // Medium priority items
    if (priority >= 60) {
      const mediumSizes: ("1x2" | "2x1")[] = ["1x2", "2x1"];
      return mediumSizes[Math.floor(Math.random() * mediumSizes.length)];
    }

    // Category-based sizing for lower priority items
    switch (category?.toLowerCase()) {
      case "video":
        return imageCount > 2 ? "1x2" : "1x1";
      case "design":
        return imageCount > 3 ? "1x2" : "1x1";
      case "develop":
        return "1x1";
      default:
        return "1x1";
    }
  } /*
   *
   * Determine project type for development projects
   */
  protected determineProjectType(
    category: string,
    tags: string[],
  ): "web" | "game" | "tool" | "plugin" | undefined {
    if (category?.toLowerCase() !== "develop") return undefined;

    const tagString = tags.join(" ").toLowerCase();

    if (tagString.includes("unity") || tagString.includes("game"))
      return "game";
    if (tagString.includes("plugin") || tagString.includes("extension"))
      return "plugin";
    if (tagString.includes("tool") || tagString.includes("cli")) return "tool";
    return "web";
  }

  /**
   * Determine video type for video projects
   */
  protected determineVideoType(
    category: string,
    tags: string[],
  ): "mv" | "lyric" | "animation" | "promotion" | undefined {
    if (!category?.toLowerCase().includes("video")) return undefined;

    const tagString = tags.join(" ").toLowerCase();

    if (tagString.includes("mv") || tagString.includes("music video"))
      return "mv";
    if (tagString.includes("lyric")) return "lyric";
    if (tagString.includes("animation")) return "animation";
    return "promotion";
  }

  /**
   * Determine experiment type for playground projects
   */
  protected determineExperimentType(
    category: string,
    tags: string[],
  ): "design" | "webgl" | undefined {
    const tagString = tags.join(" ").toLowerCase();

    if (tagString.includes("webgl") || tagString.includes("three.js"))
      return "webgl";
    if (tagString.includes("design") || tagString.includes("css"))
      return "design";
    return undefined;
  }

  /**
   * Validate processed data
   */
  protected async validateData(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    const validItems: PortfolioContentItem[] = [];

    for (const item of data) {
      const validation = this.validateItem(item);

      if (validation.isValid) {
        validItems.push(item);
      } else {
        testLogger.warn(
          `Invalid portfolio item: ${item.id}`,
          validation.errors,
        );

        // Log validation errors but continue processing
        validation.errors.forEach((error) => {
          if (error.severity === "error") {
            testLogger.error(
              `Validation error for ${item.id}.${error.field}: ${error.message}`,
            );
          }
        });
      }
    }

    return validItems;
  } /**
   
* Validate individual portfolio item
   */
  protected validateItem(item: PortfolioContentItem): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required field validation
    if (!item.id) {
      errors.push({
        field: "id",
        message: "ID is required",
        severity: "error",
      });
    }

    if (!item.title) {
      errors.push({
        field: "title",
        message: "Title is required",
        severity: "error",
      });
    }

    if (!item.description) {
      errors.push({
        field: "description",
        message: "Description is required",
        severity: "error",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Enrich data with additional computed fields
   */
  protected async enrichData(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    return Promise.all(
      data.map(async (item) => ({
        ...item,
        seo: await this.generateSEOData(item),
        searchIndex: this.generateSearchIndex(item),
        relatedItems: await this.findRelatedItems(item, data),
      })),
    );
  }

  /**
   * Generate SEO metadata for portfolio item
   */
  protected async generateSEOData(
    item: PortfolioContentItem,
  ): Promise<PortfolioContentItem["seo"]> {
    const baseTitle = `${item.title} - samuido | ポートフォリオ`;
    const baseDescription = item.description;
    const keywords = [
      ...item.tags,
      ...item.technologies,
      "ポートフォリオ",
      "作品集",
      "samuido",
    ];

    return {
      title: baseTitle,
      description: baseDescription,
      keywords,
      ogImage: item.thumbnail || "/images/portfolio/default-og.jpg",
      twitterImage: item.thumbnail || "/images/portfolio/default-twitter.jpg",
      canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
      structuredData: this.generateStructuredData(item),
    };
  } /*
   *
   * Generate structured data (JSON-LD) for SEO
   */
  protected generateStructuredData(item: PortfolioContentItem): object {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      description: item.description,
      url: `https://yusuke-kim.com/portfolio/${item.id}`,
      creator: {
        "@type": "Person",
        name: "木村友亮",
        alternateName: "samuido",
      },
      dateCreated: item.createdAt,
      dateModified: item.updatedAt || item.createdAt,
      keywords: item.tags.join(", "),
    };

    // Add category-specific structured data
    switch (item.category) {
      case "develop":
        return {
          ...baseStructuredData,
          "@type": "SoftwareApplication",
          applicationCategory: "WebApplication",
          programmingLanguage: item.technologies,
        };

      case "video":
        return {
          ...baseStructuredData,
          "@type": "VideoObject",
          genre: item.videoType || "Video Production",
          duration: item.duration ? `PT${item.duration}S` : undefined,
        };

      default:
        return baseStructuredData;
    }
  }

  /**
   * Generate search index for portfolio item
   */
  protected generateSearchIndex(item: PortfolioContentItem): SearchIndex {
    const searchableContent = [
      item.title,
      item.description,
      item.content || "",
      ...item.tags,
      ...item.technologies,
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      content: item.content || "",
      tags: item.tags,
      category: item.category,
      searchableContent,
    };
  } /**
   *
 Find related portfolio items based on tags and category
   */
  protected async findRelatedItems(
    item: PortfolioContentItem,
    allItems: PortfolioContentItem[],
  ): Promise<string[]> {
    const related = allItems
      .filter((other) => other.id !== item.id)
      .map((other) => ({
        id: other.id,
        score: this.calculateSimilarityScore(item, other),
      }))
      .filter(({ score }) => score > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 related items
      .map(({ id }) => id);

    return related;
  }

  /**
   * Calculate similarity score between two portfolio items
   */
  protected calculateSimilarityScore(
    item1: PortfolioContentItem,
    item2: PortfolioContentItem,
  ): number {
    let score = 0;

    // Category match
    if (item1.category === item2.category) {
      score += 0.4;
    }

    // Technology overlap
    const tech1 = new Set(item1.technologies);
    const tech2 = new Set(item2.technologies);
    const techIntersection = new Set([...tech1].filter((x) => tech2.has(x)));
    const techUnion = new Set([...tech1, ...tech2]);

    if (techUnion.size > 0) {
      score += (techIntersection.size / techUnion.size) * 0.4;
    }

    // Tag overlap
    const tags1 = new Set(item1.tags);
    const tags2 = new Set(item2.tags);
    const tagIntersection = new Set([...tags1].filter((x) => tags2.has(x)));
    const tagUnion = new Set([...tags1, ...tags2]);

    if (tagUnion.size > 0) {
      score += (tagIntersection.size / tagUnion.size) * 0.2;
    }

    return score;
  }

  /**
   * Normalize image path for consistent handling
   */
  protected normalizeImagePath(imagePath: string | undefined): string {
    if (!imagePath) {
      return "/images/portfolio/placeholder-image.svg";
    }

    // Handle absolute URLs (YouTube thumbnails, etc.)
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Ensure local paths start with /
    if (!imagePath.startsWith("/")) {
      return `/${imagePath}`;
    }

    return imagePath;
  }

  /**
   * Generate portfolio statistics
   */
  async generatePortfolioStats(
    items: PortfolioContentItem[],
  ): Promise<PortfolioStats> {
    const categoryCounts: Record<string, number> = {};
    const technologyCounts: Record<string, number> = {};

    items.forEach((item) => {
      // Count categories
      if (item.category) {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      }

      // Count technologies
      item.technologies.forEach((tech) => {
        technologyCounts[tech] = (technologyCounts[tech] || 0) + 1;
      });
    });

    // Find latest update
    const latestUpdate = items.reduce((latest, item) => {
      const itemDate = new Date(item.updatedAt || item.createdAt);
      return itemDate > latest ? itemDate : latest;
    }, new Date(0));

    return {
      totalProjects: items.length,
      categoryCounts,
      technologyCounts,
      lastUpdate: latestUpdate,
    };
  }
}
/**
 * Enhanced Portfolio Data Processor Class
 * Implements advanced data processing with automatic format detection,
 * integrity checking, error handling, and performance optimization
 */
export class EnhancedPortfolioDataProcessor extends PortfolioDataProcessor {
  private config: DataProcessingConfig;
  private errorHandler: MigrationErrorHandler;
  private processingCache = new Map<string, PortfolioContentItem>();

  constructor(config: Partial<DataProcessingConfig> = {}) {
    super();
    this.config = {
      enableDataIntegrityCheck: true,
      enablePerformanceOptimization: true,
      enableFallbackMode: true,
      maxRetryAttempts: 3,
      cacheEnabled: true,
      ...config,
    };
    this.errorHandler = new MigrationErrorHandler();
  }

  /**
   * Enhanced main processing pipeline with comprehensive error handling and optimization
   */
  async processRawData(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<PortfolioContentItem[]> {
    const startTime = Date.now();
    const stats: ProcessingStats = {
      totalItems: rawData.length,
      migratedItems: 0,
      validatedItems: 0,
      enrichedItems: 0,
      processingTime: 0,
      errors: 0,
      warnings: 0,
    };

    try {
      testLogger.log(
        `Starting enhanced processing of ${rawData.length} portfolio items...`,
      );

      // Step 1: Automatic format detection and migration
      const { migratedData, migrationStats } =
        await this.processMixedFormatsEnhanced(rawData);
      stats.migratedItems = migrationStats.migratedCount;
      stats.errors += migrationStats.errors;
      stats.warnings += migrationStats.warnings;

      // Step 2: Data integrity check
      let integrityResult: DataIntegrityResult = {
        isValid: true,
        issues: [],
        fixedIssues: [],
      };
      if (this.config.enableDataIntegrityCheck) {
        integrityResult = await this.performDataIntegrityCheck(migratedData);
        stats.errors += integrityResult.issues.filter(
          (i) => i.severity === "error",
        ).length;
        stats.warnings += integrityResult.issues.filter(
          (i) => i.severity === "warning",
        ).length;
      }

      // Step 3: Enhanced data processing pipeline
      const normalized = await this.normalizeDataEnhanced(migratedData);
      const validated = await this.validateDataEnhanced(normalized);
      stats.validatedItems = validated.length;

      const enriched = await this.enrichDataEnhanced(validated);
      stats.enrichedItems = enriched.length;

      // Step 4: Performance optimization
      const optimized = this.config.enablePerformanceOptimization
        ? await this.optimizeProcessedData(enriched)
        : enriched;

      stats.processingTime = Date.now() - startTime;

      testLogger.log(
        `Enhanced processing completed: ${optimized.length} items processed in ${stats.processingTime}ms`,
      );
      testLogger.log(
        `Migration stats: ${stats.migratedItems} migrated, ${stats.errors} errors, ${stats.warnings} warnings`,
      );

      return optimized;
    } catch (error) {
      stats.processingTime = Date.now() - startTime;
      stats.errors++;

      testLogger.error(
        "Error in enhanced portfolio data processing pipeline:",
        error,
      );

      // Fallback mode
      if (this.config.enableFallbackMode) {
        testLogger.log("Attempting fallback processing...");
        return await this.fallbackProcessing(rawData);
      }

      throw new Error(
        `Enhanced data processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  /**
   * Enhanced processing result with detailed statistics
   */
  async processRawDataWithStats(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const stats: ProcessingStats = {
      totalItems: rawData.length,
      migratedItems: 0,
      validatedItems: 0,
      enrichedItems: 0,
      processingTime: 0,
      errors: 0,
      warnings: 0,
    };

    try {
      const items = await this.processRawData(rawData);
      stats.processingTime = Date.now() - startTime;

      const integrityResult = this.config.enableDataIntegrityCheck
        ? await this.performDataIntegrityCheck(
            rawData.map((item) =>
              this.isEnhancedContentItem(item)
                ? item
                : this.convertToEnhanced(item as ContentItem),
            ),
          )
        : { isValid: true, issues: [], fixedIssues: [] };

      return {
        items,
        stats,
        integrityResult,
      };
    } catch (error) {
      stats.processingTime = Date.now() - startTime;
      stats.errors++;
      throw error;
    }
  }

  /**
   * Enhanced mixed format processing with detailed statistics
   */
  private async processMixedFormatsEnhanced(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<{
    migratedData: EnhancedContentItem[];
    migrationStats: { migratedCount: number; errors: number; warnings: number };
  }> {
    try {
      let migratedCount = 0;
      const errors = 0;
      const warnings = 0;

      // Use the migration system to handle mixed formats
      const enhancedItems =
        await mixedDataFormatProcessor.processMixedData(rawData);

      // Count migration statistics
      for (let i = 0; i < rawData.length; i++) {
        const originalItem = rawData[i];
        if (!this.isEnhancedContentItem(originalItem)) {
          migratedCount++;
        }
      }

      testLogger.log(
        `Mixed format processing: ${migratedCount} items migrated`,
      );

      return {
        migratedData: enhancedItems,
        migrationStats: { migratedCount, errors, warnings },
      };
    } catch (error) {
      testLogger.error("Error in enhanced mixed format processing:", error);
      throw error;
    }
  } /**

   * Perform comprehensive data integrity check
   */
  private async performDataIntegrityCheck(
    items: EnhancedContentItem[],
  ): Promise<DataIntegrityResult> {
    const issues: DataIntegrityIssue[] = [];
    const fixedIssues: DataIntegrityIssue[] = [];

    testLogger.log("Performing data integrity check...");

    // Check for duplicate IDs
    const idMap = new Map<string, number>();
    items.forEach((item, index) => {
      if (idMap.has(item.id)) {
        issues.push({
          type: "duplicate_id",
          itemId: item.id,
          message: `Duplicate ID found at indices ${idMap.get(item.id)} and ${index}`,
          severity: "error",
          autoFixable: false,
        });
      } else {
        idMap.set(item.id, index);
      }
    });

    // Check for missing required fields
    items.forEach((item) => {
      if (!item.title) {
        issues.push({
          type: "missing_field",
          itemId: item.id,
          field: "title",
          message: "Title is required",
          severity: "error",
          autoFixable: false,
        });
      }

      if (!item.categories || item.categories.length === 0) {
        issues.push({
          type: "missing_field",
          itemId: item.id,
          field: "categories",
          message: "At least one category is required",
          severity: "error",
          autoFixable: true,
        });
      }
    });

    // Auto-fix fixable issues
    const autoFixableIssues = issues.filter((issue) => issue.autoFixable);
    for (const issue of autoFixableIssues) {
      try {
        await this.autoFixIssue(items, issue);
        fixedIssues.push(issue);
      } catch (error) {
        testLogger.warn(
          `Failed to auto-fix issue for ${issue.itemId}: ${error}`,
        );
      }
    }

    const remainingIssues = issues.filter(
      (issue) => !fixedIssues.includes(issue),
    );

    return {
      isValid:
        remainingIssues.filter((i) => i.severity === "error").length === 0,
      issues: remainingIssues,
      fixedIssues,
    };
  }

  /**
   * Auto-fix data integrity issues where possible
   */
  private async autoFixIssue(
    items: EnhancedContentItem[],
    issue: DataIntegrityIssue,
  ): Promise<void> {
    const item = items.find((i) => i.id === issue.itemId);
    if (!item) return;

    switch (issue.type) {
      case "missing_field":
        if (
          issue.field === "categories" &&
          (!item.categories || item.categories.length === 0)
        ) {
          item.categories = ["other"];
          testLogger.log(`Auto-fixed missing categories for ${issue.itemId}`);
        }
        break;
    }
  }
  /**
   * Enhanced data normalization with better error handling
   */
  private async normalizeDataEnhanced(
    data: EnhancedContentItem[],
  ): Promise<PortfolioContentItem[]> {
    const normalized: PortfolioContentItem[] = [];

    for (const item of data) {
      try {
        const normalizedItem = await this.normalizeEnhancedItem(item);
        normalized.push(normalizedItem);
      } catch (error) {
        testLogger.error(`Failed to normalize item ${item.id}:`, error);

        if (this.config.enableFallbackMode) {
          try {
            const fallbackItem = await this.fallbackNormalizeItem(item);
            normalized.push(fallbackItem);
            testLogger.log(`Fallback normalization successful for ${item.id}`);
          } catch (fallbackError) {
            testLogger.error(
              `Fallback normalization also failed for ${item.id}:`,
              fallbackError,
            );
          }
        }
      }
    }

    return normalized;
  }

  /**
   * Normalize enhanced content item to portfolio content item
   */
  private async normalizeEnhancedItem(
    item: EnhancedContentItem,
  ): Promise<PortfolioContentItem> {
    // Use the first category as the primary category for backward compatibility
    const primaryCategory = item.categories[0] || "develop";
    const normalizedCategory = this.normalizeCategory(primaryCategory);

    // Use processed images as the main images array, fallback to original images
    const images = item.processedImages?.length
      ? item.processedImages.map((img) => this.normalizeImagePath(img))
      : (item.originalImages || item.images || []).map((img) =>
          this.normalizeImagePath(img),
        );

    const normalized: PortfolioContentItem = {
      ...item,
      category: normalizedCategory,
      images,

      // Ensure required fields
      description: item.description || `${item.title}の作品詳細`,
      thumbnail: this.normalizeImagePath(
        item.thumbnail || images[0] || "/images/portfolio/default-thumb.jpg",
      ),
      technologies: this.extractTechnologies(
        Array.isArray(item.tags) ? item.tags : [],
      ),

      // Calculate display properties
      aspectRatio: this.calculateAspectRatio(item as ContentItem),
      gridSize: this.determineGridSize(
        normalizedCategory,
        images,
        item.priority,
      ),

      // Set project type based on category and tags
      projectType: this.determineProjectType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),
      videoType: this.determineVideoType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),
      experimentType: this.determineExperimentType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),

      // Initialize SEO data structure
      seo: {
        title: item.title,
        description: item.description,
        keywords: Array.isArray(item.tags) ? item.tags : [],
        ogImage: item.thumbnail || "/images/portfolio/default-og.jpg",
        twitterImage: item.thumbnail || "/images/portfolio/default-twitter.jpg",
        canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
        structuredData: {},
      },
    };

    return normalized;
  } /**
  
 * Fallback normalization for items that fail normal processing
   */
  private async fallbackNormalizeItem(
    item: EnhancedContentItem,
  ): Promise<PortfolioContentItem> {
    testLogger.log(`Applying fallback normalization for ${item.id}`);

    // Convert to basic ContentItem first
    const basicItem = this.convertEnhancedToContentItem(item);

    // Use the original normalization method
    const normalized = await this.normalizeData([basicItem]);
    return normalized[0];
  }

  /**
   * Enhanced data validation with detailed error reporting
   */
  private async validateDataEnhanced(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    const validItems: PortfolioContentItem[] = [];

    for (const item of data) {
      const validation = this.validateItem(item);

      if (validation.isValid) {
        validItems.push(item);
      } else {
        testLogger.warn(`Validation failed for ${item.id}:`, validation.errors);

        // In fallback mode, try to fix validation issues
        if (this.config.enableFallbackMode) {
          const fixedItem = this.attemptValidationFix(item, validation);
          if (fixedItem) {
            validItems.push(fixedItem);
            testLogger.log(`Validation fix applied for ${item.id}`);
          }
        }
      }
    }

    return validItems;
  }

  /**
   * Attempt to fix validation issues automatically
   */
  private attemptValidationFix(
    item: PortfolioContentItem,
    validation: ValidationResult,
  ): PortfolioContentItem | null {
    const fixedItem = { ...item };
    let hasFixableErrors = false;

    validation.errors.forEach((error) => {
      switch (error.field) {
        case "description":
          if (!fixedItem.description) {
            fixedItem.description = `${fixedItem.title}の作品詳細`;
            hasFixableErrors = true;
          }
          break;
        case "thumbnail":
          if (!fixedItem.thumbnail) {
            fixedItem.thumbnail =
              fixedItem.images?.[0] || "/images/portfolio/default-thumb.jpg";
            hasFixableErrors = true;
          }
          break;
      }
    });

    return hasFixableErrors ? fixedItem : null;
  }
  /**
   * Enhanced data enrichment with performance optimization
   */
  private async enrichDataEnhanced(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    const enriched: PortfolioContentItem[] = [];

    // Process items in batches for better performance
    const batchSize = 10;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const enrichedBatch = await Promise.all(
        batch.map(async (item) => {
          try {
            return await this.enrichSingleItem(item, data);
          } catch (error) {
            testLogger.error(`Failed to enrich item ${item.id}:`, error);
            return item; // Return original item if enrichment fails
          }
        }),
      );

      enriched.push(...enrichedBatch);
    }

    return enriched;
  }

  /**
   * Enrich a single item with additional computed fields
   */
  private async enrichSingleItem(
    item: PortfolioContentItem,
    allItems: PortfolioContentItem[],
  ): Promise<PortfolioContentItem> {
    // Use cache if enabled
    const cacheKey = `enriched_${item.id}_${item.updatedAt || item.createdAt}`;
    if (this.config.cacheEnabled && this.processingCache.has(cacheKey)) {
      return this.processingCache.get(cacheKey)!;
    }

    const enrichedItem = {
      ...item,
      seo: await this.generateSEOData(item),
      searchIndex: this.generateSearchIndex(item),
      relatedItems: await this.findRelatedItems(item, allItems),
    };

    // Cache the result
    if (this.config.cacheEnabled) {
      this.processingCache.set(cacheKey, enrichedItem);
    }

    return enrichedItem;
  }

  /**
   * Optimize processed data for performance
   */
  private async optimizeProcessedData(
    data: PortfolioContentItem[],
  ): Promise<PortfolioContentItem[]> {
    testLogger.log("Applying performance optimizations...");

    // Sort by priority and date for better rendering performance
    const optimized = data.sort((a, b) => {
      // First sort by priority (higher first)
      if (a.priority !== b.priority) {
        return (b.priority || 50) - (a.priority || 50);
      }

      // Then sort by date (newer first)
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Pre-calculate expensive operations
    optimized.forEach((item) => {
      // Pre-calculate search score for better search performance
      if (item.searchIndex) {
        item.searchIndex.searchScore = this.calculateSearchScore(item);
      }
    });

    testLogger.log(
      `Performance optimization completed for ${optimized.length} items`,
    );
    return optimized;
  } /**

   * Calculate search score for an item
   */
  private calculateSearchScore(item: PortfolioContentItem): number {
    let score = 0;

    // Base score from priority
    score += (item.priority || 50) * 0.4;

    // Bonus for having images
    if (item.images && item.images.length > 0) {
      score += 10;
    }

    // Bonus for having detailed content
    if (item.content && item.content.length > 100) {
      score += 15;
    }

    // Bonus for having technologies
    if (item.technologies && item.technologies.length > 0) {
      score += item.technologies.length * 2;
    }

    // Recency bonus
    const daysSinceCreation =
      (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) {
      score += 20;
    } else if (daysSinceCreation < 90) {
      score += 10;
    }

    return Math.round(score);
  }

  /**
   * Fallback processing when main pipeline fails
   */
  private async fallbackProcessing(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<PortfolioContentItem[]> {
    testLogger.log("Executing fallback processing pipeline...");

    try {
      // Convert all items to basic ContentItem format
      const basicItems: ContentItem[] = rawData.map((item) => {
        if (this.isEnhancedContentItem(item)) {
          return this.convertEnhancedToContentItem(item);
        }
        return item as ContentItem;
      });

      // Use the original processing pipeline
      const normalized = await this.normalizeData(basicItems);
      const validated = await this.validateData(normalized);
      const enriched = await this.enrichData(validated);

      testLogger.log(
        `Fallback processing completed: ${enriched.length} items processed`,
      );
      return enriched;
    } catch (error) {
      testLogger.error("Fallback processing also failed:", error);

      // Last resort: return minimal valid items
      return this.createMinimalValidItems(rawData);
    }
  } /**
 
  * Create minimal valid items as last resort
   */
  private createMinimalValidItems(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): PortfolioContentItem[] {
    testLogger.log("Creating minimal valid items as last resort...");

    return rawData
      .filter((item) => item.id && item.title) // Only items with basic required fields
      .map((item) => ({
        ...item,
        category: "develop",
        description: item.description || `${item.title}の作品詳細`,
        thumbnail: item.thumbnail || "/images/portfolio/default-thumb.jpg",
        images: item.images || [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        technologies: [],
        aspectRatio: 1,
        gridSize: "1x1" as const,
        seo: {
          title: item.title,
          description: item.description || "",
          keywords: Array.isArray(item.tags) ? item.tags : [],
          ogImage: "/images/portfolio/default-og.jpg",
          twitterImage: "/images/portfolio/default-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
        searchIndex: {
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description || "",
          content: item.content || "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          category: "develop",
          searchableContent:
            `${item.title} ${item.description || ""}`.toLowerCase(),
        },
        relatedItems: [],
      })) as PortfolioContentItem[];
  }

  /**
   * Type guard to check if item is EnhancedContentItem
   */
  private isEnhancedContentItem(
    item: ContentItem | EnhancedContentItem,
  ): item is EnhancedContentItem {
    return (
      "categories" in item &&
      Array.isArray((item as EnhancedContentItem).categories)
    );
  }

  /**
   * Clear processing cache
   */
  clearCache(): void {
    this.processingCache.clear();
    testLogger.log("Processing cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.processingCache.size,
      keys: Array.from(this.processingCache.keys()),
    };
  }
  /**
   * Enhanced item normalization with date management integration
   */
  private async normalizeEnhancedItemWithDateManagement(
    item: EnhancedContentItem,
  ): Promise<PortfolioContentItem> {
    // Get effective date using date management system
    const effectiveDate = portfolioDateManager.getEffectiveDate(item);

    // Use the first category as the primary category for backward compatibility
    const primaryCategory = item.categories[0] || "develop";
    const normalizedCategory = this.normalizeCategory(primaryCategory);

    // Use processed images as the main images array, fallback to original images
    const images =
      item.processedImages || item.originalImages || item.images || [];

    const normalized: PortfolioContentItem = {
      ...item,
      category: normalizedCategory,
      images,

      // Date management integration
      createdAt: effectiveDate.toISOString(),

      // Ensure required fields
      description: item.description || `${item.title}の作品詳細`,
      thumbnail:
        item.thumbnail || images[0] || "/images/portfolio/default-thumb.jpg",
      technologies: this.extractTechnologies(
        Array.isArray(item.tags) ? item.tags : [],
      ),

      // Calculate display properties
      aspectRatio: this.calculateAspectRatio({
        ...item,
        category: primaryCategory,
      } as ContentItem),
      gridSize: this.determineGridSize(
        normalizedCategory,
        images,
        item.priority,
      ),

      // Set project type based on category and tags
      projectType: this.determineProjectType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),
      videoType: this.determineVideoType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),
      experimentType: this.determineExperimentType(
        normalizedCategory,
        Array.isArray(item.tags) ? item.tags : [],
      ),

      // Initialize SEO data structure with effective date
      seo: {
        title: item.title,
        description: item.description,
        keywords: Array.isArray(item.tags) ? item.tags : [],
        ogImage: item.thumbnail || "/images/portfolio/default-og.jpg",
        twitterImage: item.thumbnail || "/images/portfolio/default-twitter.jpg",
        canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
        structuredData: {},
      },
    };

    return normalized;
  }

  /**
   * Update manual date for a portfolio item
   */
  async updateItemManualDate(itemId: string, date: string): Promise<void> {
    try {
      await portfolioDateManager.setManualDate(itemId, date);
      testLogger.log(`Manual date updated for item ${itemId}: ${date}`);
    } catch (error) {
      testLogger.error(
        `Failed to update manual date for item ${itemId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get effective date for a portfolio item
   */
  getItemEffectiveDate(item: EnhancedContentItem): Date {
    return portfolioDateManager.getEffectiveDate(item);
  }

  /**
   * Get date statistics for all portfolio items
   */
  async getDateStatistics(): Promise<{
    totalManualDates: number;
    oldestManualDate?: string;
    newestManualDate?: string;
    recentlyUpdated: Array<{ itemId: string; date: string }>;
  }> {
    return await portfolioDateManager.getDateStats();
  }

  /**
   * Bulk update manual dates for multiple items
   */
  async bulkUpdateManualDates(dates: Record<string, string>): Promise<void> {
    try {
      await portfolioDateManager.bulkSetManualDates(dates);
      testLogger.log(
        `Bulk updated manual dates for ${Object.keys(dates).length} items`,
      );
    } catch (error) {
      testLogger.error("Failed to bulk update manual dates:", error);
      throw error;
    }
  }

  /**
   * Format date for display in various formats
   */
  formatDateForDisplay(
    date: string,
    format: "iso" | "display" | "short" | "long" = "display",
  ): string {
    return portfolioDateManager.convertDateFormat(date, format);
  }

  /**
   * Validate date format
   */
  validateDateFormat(date: string): boolean {
    return portfolioDateManager.validateDate(date);
  }

  /**
   * Parse and format date from various input formats
   */
  parseAndFormatDate(dateInput: string | Date): string {
    return portfolioDateManager.parseAndFormatDate(dateInput);
  }

  /**
   * Enhanced data processing with date management integration
   */
  async processRawDataWithDateManagement(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<PortfolioContentItem[]> {
    const startTime = Date.now();

    try {
      testLogger.log(
        `Processing ${rawData.length} portfolio items with date management...`,
      );

      // First, handle data migration for mixed formats
      const migratedData = await this.processMixedFormats(rawData);

      // Process with date management integration
      const normalized = await Promise.all(
        migratedData.map(async (item) => {
          const enhancedItem = this.convertToEnhanced(item);
          return await this.normalizeEnhancedItemWithDateManagement(
            enhancedItem,
          );
        }),
      );

      const validated = await this.validateData(normalized);
      const enriched = await this.enrichData(validated);

      const processingTime = Date.now() - startTime;
      testLogger.log(
        `Successfully processed ${enriched.length} portfolio items with date management in ${processingTime}ms`,
      );

      return enriched;
    } catch (error) {
      testLogger.error(
        "Error in portfolio data processing with date management:",
        error,
      );
      throw new Error(
        `Data processing with date management failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Convert ContentItem to EnhancedContentItem for date management
   */
  private convertToEnhanced(item: ContentItem): EnhancedContentItem {
    return {
      ...item,
      category: item.category, // Keep original category for compatibility
      categories: item.category
        ? [item.category as EnhancedCategoryType]
        : ["develop"],
      isOtherCategory: item.category === "other",
      useManualDate: false,
      processedImages: item.images,
      originalImages: [],
    };
  }
}

// Export singleton instances
export const portfolioDataProcessor = new PortfolioDataProcessor();
export const enhancedPortfolioDataProcessor =
  new EnhancedPortfolioDataProcessor();

// For backward compatibility, also export the enhanced processor as the main processor
export const dataProcessor = enhancedPortfolioDataProcessor;
