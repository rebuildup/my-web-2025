/**
 * Portfolio Data Processing Pipeline
 * Task 1.2: データ処理パイプラインの構築
 */

import { ContentItem, SearchIndex } from "@/types/content";
import { testLogger } from "../utils/test-logger";

// Extended Portfolio Content Item type
export interface PortfolioContentItem extends ContentItem {
  // Gallery display properties
  thumbnail: string;
  aspectRatio?: number;
  gridSize?: "1x1" | "1x2" | "2x1" | "2x2" | "1x3";

  // Development project properties
  repository?: {
    type: "github" | "gitlab" | "bitbucket";
    url: string;
    title: string;
    description?: string;
  };
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
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterImage: string;
    canonical: string;
    structuredData: object;
  };

  // Search index data
  searchIndex?: SearchIndex;
  relatedItems?: string[]; // IDs of related portfolio items
}

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

// Portfolio statistics
export interface PortfolioStats {
  totalProjects: number;
  categoryCounts: Record<string, number>;
  technologyCounts: Record<string, number>;
  lastUpdate: Date;
}

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
      const normalized: PortfolioContentItem = {
        ...item,
        // Ensure required fields
        thumbnail:
          item.thumbnail ||
          item.images?.[0] ||
          "/images/portfolio/default-thumb.jpg",
        technologies: this.extractTechnologies(item.tags || []),

        // Calculate display properties
        aspectRatio: this.calculateAspectRatio(),
        gridSize: this.determineGridSize(item.category, item.images),

        // Set project type based on category and tags
        projectType: this.determineProjectType(item.category, item.tags || []),
        videoType: this.determineVideoType(item.category, item.tags || []),
        experimentType: this.determineExperimentType(
          item.category,
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
   * Calculate aspect ratio from image URL (placeholder implementation)
   */
  private calculateAspectRatio(): number {
    // Default aspect ratio - in real implementation, this would analyze the image
    return 16 / 9;
  }

  /**
   * Determine grid size based on category and content
   */
  private determineGridSize(
    category: string,
    images?: string[],
  ): "1x1" | "1x2" | "2x1" | "2x2" | "1x3" {
    const imageCount = images?.length || 0;

    switch (category?.toLowerCase()) {
      case "video":
        return imageCount > 2 ? "2x2" : "1x2";
      case "design":
        return imageCount > 3 ? "1x3" : "1x2";
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
