import type { MetadataRoute } from "next";
import { generateCompleteSitemap } from "@/lib/seo/sitemap-generator";

/**
 * Enhanced sitemap generation using comprehensive SEO utilities
 * Generates XML sitemap with proper priorities and frequencies for all content types
 *
 * Revalidation: The sitemap is regenerated every hour (3600 seconds) to ensure
 * it stays up-to-date with new content. This balances freshness with performance.
 */
export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return await generateCompleteSitemap({
		baseUrl: "https://yusuke-kim.com",
		defaultChangeFreq: "monthly",
		defaultPriority: 0.5,
	});
}
