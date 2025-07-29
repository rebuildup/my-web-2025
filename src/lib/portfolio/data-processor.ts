/**
 * Portfolio Data Processing Pipeline
 * Task 1.2: データ処理パイプラインの構築
 */

import {
  ContentItem,
  SearchIndex,
  PortfolioCategory,
  PORTFOLIO_CATEGORIES,
  isValidPortfolioCategory,
} from "@/types/content";
import { PortfolioContentItem, PortfolioStats } from "@/types/portfolio";
import { testLogger } from "../utils/test-logger";

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

// Portfolio statistics interface is now imported from @/types/portfolio

/**
 * Main Portfolio Data Processor Class
 */
export class PortfolioDataProcessor {
  private readonly TECHNOLOGY_KEYWORDS = [
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
   * Main processing pipeline
   */
  async processRawData(
    rawData: ContentItem[],
  ): Promise<PortfolioContentItem[]> {
    try {
      testLogger.log(`Processing ${rawData.length} portfolio items...`);

      const normalized = await this.normalizeData(rawData);
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
   * Normalize raw data to PortfolioContentItem format
   */
  private async normalizeData(
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
        thumbnail:
          item.thumbnail ||
          item.images?.[0] ||
          "/images/portfolio/default-thumb.jpg",
        technologies: this.extractTechnologies(item.tags || []),

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
          item.tags || [],
        ),
        videoType: this.determineVideoType(normalizedCategory, item.tags || []),
        experimentType: this.determineExperimentType(
          normalizedCategory,
          item.tags || [],
        ),

        // Initialize SEO data structure
        seo: {
          title: item.title,
          description: item.description,
          keywords: item.tags || [],
          ogImage: item.thumbnail || "/images/portfolio/default-og.jpg",
          twitterImage:
            item.thumbnail || "/images/portfolio/default-twitter.jpg",
          canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
          structuredData: {},
        },
      };

      return normalized;
    });
  }

  /**
   * Normalize category to standard portfolio categories
   */
  private normalizeCategory(category: string): PortfolioCategory {
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
  private extractTechnologies(tags: string[]): string[] {
    return tags.filter((tag) =>
      this.TECHNOLOGY_KEYWORDS.some((tech) =>
        tag.toLowerCase().includes(tech.toLowerCase()),
      ),
    );
  }

  /**
   * Calculate aspect ratio from content item
   */
  private calculateAspectRatio(item: ContentItem): number {
    // If aspect ratio is already provided, use it
    if (item.aspectRatio) {
      return item.aspectRatio;
    }

    // Try to extract from first image if available
    // For now, we'll use default aspect ratios based on category
    // In the future, this could be enhanced to analyze actual image dimensions

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
  private determineGridSize(
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
  }

  /**
   * Determine project type for development projects
   */
  private determineProjectType(
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
  private determineVideoType(
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
  private determineExperimentType(
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
  private async validateData(
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
  }

  /**
   * Validate individual portfolio item
   */
  private validateItem(item: PortfolioContentItem): ValidationResult {
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

    // Category validation
    const validCategories = [
      "develop",
      "video",
      "design",
      "video&design",
      "playground",
    ];
    if (item.category && !validCategories.includes(item.category)) {
      warnings.push({
        field: "category",
        message: `Unknown category: ${item.category}`,
        suggestion: `Use one of: ${validCategories.join(", ")}`,
      });
    }

    // Technology validation for development projects
    if (item.category === "develop" && item.technologies.length === 0) {
      warnings.push({
        field: "technologies",
        message: "Development projects should have technology tags",
        suggestion: "Add relevant technology tags",
      });
    }

    // Image validation
    if (!item.thumbnail) {
      warnings.push({
        field: "thumbnail",
        message: "No thumbnail specified, using default",
        suggestion: "Add a thumbnail image for better display",
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
  private async enrichData(
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
  private async generateSEOData(
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
  }

  /**
   * Generate structured data (JSON-LD) for SEO
   */
  private generateStructuredData(item: PortfolioContentItem): object {
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
  private generateSearchIndex(item: PortfolioContentItem): SearchIndex {
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
  }

  /**
   * Find related portfolio items based on tags and category
   */
  private async findRelatedItems(
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
  private calculateSimilarityScore(
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

// Export singleton instance
export const portfolioDataProcessor = new PortfolioDataProcessor();
