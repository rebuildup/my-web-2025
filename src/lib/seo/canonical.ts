/**
 * Canonical URL Management
 * Ensures proper canonical URL structure across all pages
 */

export interface CanonicalConfig {
	baseUrl: string;
	trailingSlash: boolean;
	forceHttps: boolean;
}

const defaultConfig: CanonicalConfig = {
	baseUrl: "https://yusuke-kim.com",
	trailingSlash: false,
	forceHttps: true,
};

/**
 * Generate canonical URL for any path
 */
export function generateCanonicalUrl(
	path: string,
	config: CanonicalConfig = defaultConfig,
): string {
	// Normalize path
	let normalizedPath = path.startsWith("/") ? path : `/${path}`;

	// Remove trailing slash unless it's the root path
	if (normalizedPath !== "/" && normalizedPath.endsWith("/")) {
		normalizedPath = normalizedPath.slice(0, -1);
	}

	// Add trailing slash if configured
	if (
		config.trailingSlash &&
		normalizedPath !== "/" &&
		!normalizedPath.endsWith("/")
	) {
		normalizedPath += "/";
	}

	// Ensure HTTPS if configured
	let baseUrl = config.baseUrl;
	if (config.forceHttps && baseUrl.startsWith("http://")) {
		baseUrl = baseUrl.replace("http://", "https://");
	}

	return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate canonical URLs for content items
 */
export function generateContentCanonicalUrl(
	contentType: "portfolio" | "blog" | "plugin" | "download" | "tool",
	contentId: string,
	config: CanonicalConfig = defaultConfig,
): string {
	const pathMappings = {
		portfolio: `/portfolio/${contentId}`,
		blog: `/workshop/blog/${contentId}`,
		plugin: `/workshop/plugins/${contentId}`,
		download: `/workshop/downloads/${contentId}`,
		tool: `/tools/${contentId}`,
	};

	return generateCanonicalUrl(pathMappings[contentType], config);
}

/**
 * Generate canonical URLs for gallery pages
 */
export function generateGalleryCanonicalUrl(
	category: "all" | "develop" | "video" | "video&design",
	config: CanonicalConfig = defaultConfig,
): string {
	return generateCanonicalUrl(`/portfolio/gallery/${category}`, config);
}

/**
 * Generate canonical URLs for about pages
 */
export function generateAboutCanonicalUrl(
	section: "main" | "profile" | "commission" | "links",
	subsection?: string,
	config: CanonicalConfig = defaultConfig,
): string {
	let path = "/about";

	if (section !== "main") {
		path += `/${section}`;
		if (subsection) {
			path += `/${subsection}`;
		}
	}

	return generateCanonicalUrl(path, config);
}

/**
 * Generate canonical URLs for workshop pages
 */
export function generateWorkshopCanonicalUrl(
	section: "main" | "blog" | "plugins" | "downloads" | "analytics",
	config: CanonicalConfig = defaultConfig,
): string {
	const path = section === "main" ? "/workshop" : `/workshop/${section}`;
	return generateCanonicalUrl(path, config);
}

/**
 * Generate canonical URLs for tool pages
 */
export function generateToolCanonicalUrl(
	toolName?: string,
	config: CanonicalConfig = defaultConfig,
): string {
	const path = toolName ? `/tools/${toolName}` : "/tools";
	return generateCanonicalUrl(path, config);
}

/**
 * Validate canonical URL format
 */
export function validateCanonicalUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);

		// Must be HTTPS
		if (parsedUrl.protocol !== "https:") {
			return false;
		}

		// Must have valid hostname
		if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
			return false;
		}

		// Should not have query parameters or fragments for canonical URLs
		if (parsedUrl.search || parsedUrl.hash) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Extract path from canonical URL
 */
export function extractPathFromCanonical(
	canonicalUrl: string,
	config: CanonicalConfig = defaultConfig,
): string {
	try {
		const url = new URL(canonicalUrl);
		const baseUrlObj = new URL(config.baseUrl);

		// Ensure it's from the same domain
		if (url.hostname !== baseUrlObj.hostname) {
			throw new Error("Canonical URL is from different domain");
		}

		return url.pathname;
	} catch {
		return "/";
	}
}

/**
 * Generate alternate URLs for different languages (future use)
 */
export function generateAlternateUrls(
	path: string,
	languages: string[] = ["ja"],
	config: CanonicalConfig = defaultConfig,
): Record<string, string> {
	const alternates: Record<string, string> = {};

	languages.forEach((lang) => {
		if (lang === "ja") {
			// Japanese is the default language
			alternates[lang] = generateCanonicalUrl(path, config);
		} else {
			// Future: add language prefix for other languages
			alternates[lang] = generateCanonicalUrl(`/${lang}${path}`, config);
		}
	});

	return alternates;
}
