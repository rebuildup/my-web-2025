// src/lib/prerender.ts
/**
 * Utilities to help with pre-rendering and static site generation
 */

// All page routes that should be pre-rendered
export const PRERENDERED_ROUTES = [
  "/",
  "/about",
  "/about/real-name",
  "/portfolio",
  "/portfolio/video",
  "/workshop",
  "/workshop/interactive",
  "/tools",
  "/tools/calculator",
  "/privacy-policy",
  "/search",
  "/404",
];

/**
 * Utility for generating static paths for getStaticPaths in Next.js
 * @returns StaticPaths object compatible with Next.js getStaticPaths
 */
export function generateStaticPaths() {
  return {
    paths: PRERENDERED_ROUTES.map((route) => ({
      params: {
        // Extract slug parameters from routes like '/about/[slug]'
        slug: route
          .split("/")
          .filter(
            (segment) =>
              segment && !segment.includes("[") && !segment.includes("]")
          ),
      },
    })),
    fallback: false, // 404 for any routes not in paths
  };
}

/**
 * Utility for generating a sitemap array from prerendered routes
 * @param baseUrl - The base URL of the website
 * @returns Array of sitemap entries with loc, lastmod, and priority
 */
export function generateSitemapData(baseUrl: string) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return PRERENDERED_ROUTES.map((route) => {
    // Skip 404 page from sitemap
    if (route === "/404") return null;

    // Calculate priority based on route depth
    const segments = route.split("/").filter(Boolean);
    const priority =
      segments.length === 0
        ? 1.0 // Homepage
        : Math.max(0.1, 1.0 - segments.length * 0.2); // Lower priority for deeper pages

    return {
      loc: `${baseUrl}${route === "/" ? "" : route}/`,
      lastmod: today,
      changefreq: segments.length === 0 ? "weekly" : "monthly",
      priority: priority.toFixed(1),
    };
  }).filter(Boolean); // Remove null entries (404 page)
}

/**
 * Helper function to ensure proper links for static export
 * @param href - The href attribute for the link
 * @returns The properly formatted href for static export
 */
export function staticPath(href: string): string {
  // If it's an external link, return as is
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  // Remove trailing slash if it exists
  const withoutTrailingSlash = href.endsWith("/") ? href.slice(0, -1) : href;

  // Add trailing slash for internal links (for Apache compatibility)
  return withoutTrailingSlash === "" ? "/" : `${withoutTrailingSlash}/`;
}

/**
 * Helper function to create canonical URLs for SEO
 * @param path - The relative path
 * @param baseUrl - The base URL of the website
 * @returns The full canonical URL
 */
export function createCanonicalUrl(path: string, baseUrl: string): string {
  const normalizedPath = path === "/" ? "" : path;
  return `${baseUrl}${normalizedPath}${normalizedPath ? "/" : ""}`;
}
