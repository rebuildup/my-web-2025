import { MetadataRoute } from "next";
import { generateCompleteSitemap } from "@/lib/seo/sitemap-generator";

/**
 * Enhanced sitemap generation using comprehensive SEO utilities
 * Generates XML sitemap with proper priorities and frequencies for all content types
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await generateCompleteSitemap({
    baseUrl: "https://yusuke-kim.com",
    defaultChangeFreq: "monthly",
    defaultPriority: 0.5,
  });
}
