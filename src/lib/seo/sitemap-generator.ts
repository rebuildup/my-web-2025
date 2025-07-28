/**
 * Enhanced Sitemap Generator
 * Generates comprehensive XML sitemaps with proper priorities and frequencies
 */

import { MetadataRoute } from "next";
import { ContentItem } from "@/types/content";

export interface SitemapConfig {
  baseUrl: string;
  defaultChangeFreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  defaultPriority: number;
}

const defaultConfig: SitemapConfig = {
  baseUrl: "https://yusuke-kim.com",
  defaultChangeFreq: "monthly",
  defaultPriority: 0.5,
};

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

/**
 * Static routes configuration with SEO-optimized priorities and frequencies
 */
export const staticRoutes: SitemapEntry[] = [
  // Home page - highest priority, updated weekly
  {
    url: "",
    priority: 1.0,
    changeFrequency: "weekly",
  },

  // Main section pages - high priority
  {
    url: "/about",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    url: "/portfolio",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    url: "/workshop",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    url: "/tools",
    priority: 0.8,
    changeFrequency: "monthly",
  },

  // About subsections
  {
    url: "/about/profile/real",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/about/profile/handle",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/about/profile/AI",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    url: "/about/card/real",
    priority: 0.5,
    changeFrequency: "yearly",
  },
  {
    url: "/about/card/handle",
    priority: 0.5,
    changeFrequency: "yearly",
  },
  {
    url: "/about/commission/develop",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/about/commission/video",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/about/commission/estimate",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/about/links",
    priority: 0.6,
    changeFrequency: "monthly",
  },

  // Portfolio galleries - high priority for SEO
  {
    url: "/portfolio/gallery/all",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    url: "/portfolio/gallery/develop",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    url: "/portfolio/gallery/video",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    url: "/portfolio/gallery/video&design",
    priority: 0.8,
    changeFrequency: "weekly",
  },

  // Portfolio detail pages
  {
    url: "/portfolio/detail/develop",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/portfolio/detail/video",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/portfolio/detail/video&design",
    priority: 0.7,
    changeFrequency: "monthly",
  },

  // Portfolio playground
  {
    url: "/portfolio/playground/design",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    url: "/portfolio/playground/WebGL",
    priority: 0.6,
    changeFrequency: "monthly",
  },

  // Workshop sections
  {
    url: "/workshop/blog",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    url: "/workshop/plugins",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    url: "/workshop/downloads",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    url: "/workshop/analytics",
    priority: 0.5,
    changeFrequency: "monthly",
  },

  // Tools - high priority for user engagement
  {
    url: "/tools/color-palette",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/qr-generator",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/text-counter",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/svg2tsx",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/sequential-png-preview",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/pomodoro",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/pi-game",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/business-mail-block",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/ae-expression",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: "/tools/ProtoType",
    priority: 0.6,
    changeFrequency: "monthly",
  },

  // Global pages
  {
    url: "/contact",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: "/search",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    url: "/privacy-policy",
    priority: 0.3,
    changeFrequency: "yearly",
  },
];

/**
 * XML-safe URL encoding
 */
function encodeXmlUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate sitemap entries for content items
 */
export function generateContentSitemapEntries(
  items: ContentItem[],
  pathPrefix: string,
  config: SitemapConfig = defaultConfig,
): SitemapEntry[] {
  return items
    .filter((item) => item.status === "published")
    .map((item) => {
      // Determine priority based on content type and stats
      let priority = config.defaultPriority;
      let changeFrequency: SitemapEntry["changeFrequency"] =
        config.defaultChangeFreq;

      if (item.type === "portfolio") {
        priority = 0.7;
        changeFrequency = "monthly";
      } else if (item.type === "blog") {
        priority = 0.6;
        changeFrequency = "weekly";
      } else if (item.type === "plugin") {
        priority = 0.6;
        changeFrequency = "monthly";
      } else if (item.type === "tool") {
        priority = 0.8;
        changeFrequency = "monthly";
      }

      // Boost priority for popular content
      if (item.stats?.views && item.stats.views > 1000) {
        priority = Math.min(priority + 0.1, 1.0);
      }

      // More frequent updates for recently modified content
      const lastModified = new Date(item.updatedAt || item.createdAt);
      const daysSinceUpdate =
        (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 7) {
        changeFrequency = "weekly";
      } else if (daysSinceUpdate < 30) {
        changeFrequency = config.defaultChangeFreq;
      }

      return {
        url: `${pathPrefix}/${item.id}`,
        lastModified,
        changeFrequency,
        priority,
      };
    });
}

/**
 * Fetch content from API with error handling
 */
async function fetchContentSafely(
  endpoint: string,
  config: SitemapConfig = defaultConfig,
): Promise<ContentItem[]> {
  try {
    // Use config.baseUrl if available, otherwise fallback to environment or localhost
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      config.baseUrl ||
      "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/content/${endpoint}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${endpoint}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.success && data.data ? data.data : [];
  } catch (error) {
    console.warn(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

/**
 * Generate dynamic sitemap entries
 */
export async function generateDynamicSitemapEntries(
  config: SitemapConfig = defaultConfig,
): Promise<SitemapEntry[]> {
  const dynamicEntries: SitemapEntry[] = [];

  // Skip dynamic content during build if no base URL is set
  if (
    !process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NODE_ENV === "production"
  ) {
    console.log("Skipping dynamic content fetch during build");
    return [];
  }

  try {
    // Fetch all content types in parallel
    const [portfolioItems, blogItems, pluginItems, downloadItems] =
      await Promise.all([
        fetchContentSafely("portfolio", config),
        fetchContentSafely("blog", config),
        fetchContentSafely("plugin", config),
        fetchContentSafely("download", config),
      ]);

    // Generate entries for each content type
    dynamicEntries.push(
      ...generateContentSitemapEntries(portfolioItems, "/portfolio", config),
      ...generateContentSitemapEntries(blogItems, "/workshop/blog", config),
      ...generateContentSitemapEntries(
        pluginItems,
        "/workshop/plugins",
        config,
      ),
      ...generateContentSitemapEntries(
        downloadItems,
        "/workshop/downloads",
        config,
      ),
    );

    // Add portfolio-specific sitemap entries using SEO integration
    try {
      const { portfolioDataManager } = await import(
        "@/lib/portfolio/data-manager"
      );
      const { SEOIntegration } = await import(
        "@/lib/portfolio/integrations/seo-integration"
      );

      const seoIntegration = new SEOIntegration(
        portfolioDataManager,
        config.baseUrl,
      );
      const portfolioSitemapEntries =
        await seoIntegration.generatePortfolioSitemapEntries();

      dynamicEntries.push(...portfolioSitemapEntries);
    } catch (portfolioError) {
      console.warn(
        "Error generating portfolio sitemap entries:",
        portfolioError,
      );
    }
  } catch (error) {
    console.warn("Error generating dynamic sitemap entries:", error);
  }

  return dynamicEntries;
}

/**
 * Convert sitemap entries to Next.js MetadataRoute.Sitemap format
 */
export function convertToMetadataRoute(
  entries: SitemapEntry[],
  config: SitemapConfig = defaultConfig,
): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: encodeXmlUrl(`${config.baseUrl}${entry.url}`),
    lastModified: entry.lastModified || new Date(),
    changeFrequency: entry.changeFrequency || config.defaultChangeFreq,
    priority: entry.priority || config.defaultPriority,
  }));
}

/**
 * Generate complete sitemap
 */
export async function generateCompleteSitemap(
  config: SitemapConfig = defaultConfig,
): Promise<MetadataRoute.Sitemap> {
  // Get static routes
  const staticEntries = convertToMetadataRoute(staticRoutes, config);

  // Get dynamic routes
  const dynamicEntries = await generateDynamicSitemapEntries(config);
  const dynamicSitemapEntries = convertToMetadataRoute(dynamicEntries, config);

  // Combine and sort by priority (highest first)
  const allEntries = [...staticEntries, ...dynamicSitemapEntries];

  return allEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Generate sitemap index for large sites (future use)
 */
export function generateSitemapIndex(
  sitemaps: Array<{ url: string; lastModified?: Date }>,
  config: SitemapConfig = defaultConfig,
): string {
  const sitemapEntries = sitemaps
    .map(
      (sitemap) => `
    <sitemap>
      <loc>${encodeXmlUrl(`${config.baseUrl}${sitemap.url}`)}</loc>
      ${sitemap.lastModified ? `<lastmod>${sitemap.lastModified.toISOString()}</lastmod>` : ""}
    </sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`;
}
