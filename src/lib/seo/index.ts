/**
 * Comprehensive SEO Utilities
 * Centralized exports for all SEO-related functionality
 */

// Canonical URLs
export {
	type CanonicalConfig,
	extractPathFromCanonical,
	generateAboutCanonicalUrl,
	generateAlternateUrls,
	generateCanonicalUrl,
	generateContentCanonicalUrl,
	generateGalleryCanonicalUrl,
	generateToolCanonicalUrl,
	generateWorkshopCanonicalUrl,
	validateCanonicalUrl,
} from "./canonical";

// Metadata Generation
export {
	generateAboutMetadata,
	generateAdminMetadata,
	generateBaseMetadata,
	generateBlogMetadata,
	generateContactMetadata,
	generateErrorMetadata,
	generateGalleryMetadata,
	generatePluginMetadata,
	generatePortfolioMetadata,
	generateSearchMetadata,
	generateToolMetadata,
	type SEOConfig,
} from "./metadata";

// Sitemap Generation
export {
	convertToMetadataRoute,
	generateCompleteSitemap,
	generateContentSitemapEntries,
	generateDynamicSitemapEntries,
	generateSitemapIndex,
	type SitemapConfig,
	type SitemapEntry,
	staticRoutes,
} from "./sitemap-generator";
// Structured Data
export {
	generateArticleStructuredData,
	generateBreadcrumbStructuredData,
	generateCollectionPageStructuredData,
	generateContactPageStructuredData,
	generateCreativeWorkStructuredData,
	generateFAQStructuredData,
	generatePersonStructuredData,
	generateSearchResultsPageStructuredData,
	generateSoftwareApplicationStructuredData,
	generateWebApplicationStructuredData,
	generateWebSiteStructuredData,
	type StructuredDataConfig,
} from "./structured-data";

// SEO Validation
export {
	generateSEOReport,
	type SEOValidationConfig,
	type SEOValidationResult,
	validateDescription,
	validateKeywords,
	validateMetadata,
	validateOpenGraph,
	validateStructuredData,
	validateTitle,
	validateTwitterCard,
} from "./validation";

// Common SEO constants and configurations
export const SEO_CONSTANTS = {
	SITE_NAME: "samuido",
	BASE_URL: "https://yusuke-kim.com",
	DEFAULT_TITLE: "samuidoのサイトルート",
	DEFAULT_DESCRIPTION:
		"フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました",
	DEFAULT_KEYWORDS: [
		"ポートフォリオ",
		"Webデザイン",
		"フロントエンド開発",
		"ツール",
		"プラグイン",
		"ブログ",
		"samuido",
		"木村友亮",
	],
	AUTHOR: {
		name: "samuido",
		realName: "木村友亮",
		twitter: "@361do_sleep",
		email: "rebuild.up.up@gmail.com",
		url: "https://yusuke-kim.com/about",
	},
	IMAGES: {
		ogImage: "/images/og-image.png",
		twitterImage: "/images/twitter-image.jpg",
		favicon: "/favicon.ico",
		logo: "/images/logo.png",
	},
	SOCIAL_LINKS: [
		"https://twitter.com/361do_sleep",
		"https://github.com/samuido",
		"https://www.youtube.com/@361do_design",
	],
} as const;

// Default configurations
export const DEFAULT_SEO_CONFIG = {
	baseUrl: SEO_CONSTANTS.BASE_URL,
	siteName: SEO_CONSTANTS.SITE_NAME,
	defaultTitle: SEO_CONSTANTS.DEFAULT_TITLE,
	defaultDescription: SEO_CONSTANTS.DEFAULT_DESCRIPTION,
	defaultKeywords: SEO_CONSTANTS.DEFAULT_KEYWORDS,
	author: {
		name: SEO_CONSTANTS.AUTHOR.name,
		twitter: SEO_CONSTANTS.AUTHOR.twitter,
	},
	images: SEO_CONSTANTS.IMAGES,
};

export const DEFAULT_STRUCTURED_DATA_CONFIG = {
	baseUrl: SEO_CONSTANTS.BASE_URL,
	siteName: SEO_CONSTANTS.SITE_NAME,
	author: {
		name: SEO_CONSTANTS.AUTHOR.realName,
		jobTitle: "Webデザイナー・開発者",
		url: SEO_CONSTANTS.AUTHOR.url,
		sameAs: SEO_CONSTANTS.SOCIAL_LINKS,
	},
	organization: {
		name: SEO_CONSTANTS.SITE_NAME,
		url: SEO_CONSTANTS.BASE_URL,
		logo: `${SEO_CONSTANTS.BASE_URL}${SEO_CONSTANTS.IMAGES.logo}`,
	},
};

export const DEFAULT_CANONICAL_CONFIG = {
	baseUrl: SEO_CONSTANTS.BASE_URL,
	trailingSlash: false,
	forceHttps: true,
};

export const DEFAULT_SITEMAP_CONFIG = {
	baseUrl: SEO_CONSTANTS.BASE_URL,
	defaultChangeFreq: "monthly" as const,
	defaultPriority: 0.5,
};

export const DEFAULT_VALIDATION_CONFIG = {
	maxTitleLength: 60,
	maxDescriptionLength: 160,
	minDescriptionLength: 120,
	maxKeywords: 10,
	requiredOGProperties: ["title", "description", "type", "url", "images"],
	requiredTwitterProperties: ["card", "title", "description", "images"],
};
