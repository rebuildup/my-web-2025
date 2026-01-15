/**
 * Comprehensive Structured Data Generator
 * Implements JSON-LD structured data for all content types
 * Based on Schema.org specifications
 */

import type { ContentItem } from "@/types/content";

export interface StructuredDataConfig {
	baseUrl: string;
	siteName: string;
	author: {
		name: string;
		jobTitle: string;
		url: string;
		sameAs: string[];
	};
	organization: {
		name: string;
		url: string;
		logo: string;
	};
}

const defaultConfig: StructuredDataConfig = {
	baseUrl: "https://yusuke-kim.com",
	siteName: "samuido",
	author: {
		name: "木村友亮",
		jobTitle: "Webデザイナー・開発者",
		url: "https://yusuke-kim.com/about",
		sameAs: [
			"https://twitter.com/361do_sleep",
			"https://github.com/samuido",
			"https://www.youtube.com/@361do_design",
		],
	},
	organization: {
		name: "samuido",
		url: "https://yusuke-kim.com",
		logo: "https://yusuke-kim.com/images/logo.png",
	},
};

/**
 * Generate WebSite structured data for the main site
 */
export function generateWebSiteStructuredData(
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: config.siteName,
		description: "フロントエンドエンジニアsamuidoの個人サイト",
		url: config.baseUrl,
		author: {
			"@type": "Person",
			name: config.author.name,
			jobTitle: config.author.jobTitle,
			url: config.author.url,
			sameAs: config.author.sameAs,
		},
		publisher: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
			logo: {
				"@type": "ImageObject",
				url: config.organization.logo,
			},
		},
		potentialAction: {
			"@type": "SearchAction",
			target: `${config.baseUrl}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
	};
}

/**
 * Generate Person structured data for profile pages
 */
export function generatePersonStructuredData(
	profileData: {
		name: string;
		jobTitle: string;
		description: string;
		image?: string;
		birthDate?: string;
		nationality?: string;
		skills?: string[];
		awards?: string[];
	},
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: profileData.name,
		jobTitle: profileData.jobTitle,
		description: profileData.description,
		url: config.author.url,
		sameAs: config.author.sameAs,
		image: profileData.image
			? profileData.image.startsWith("http")
				? profileData.image
				: `${config.baseUrl}${profileData.image}`
			: `${config.baseUrl}/images/profile/main.jpg`,
		birthDate: profileData.birthDate,
		nationality: profileData.nationality,
		knowsAbout: profileData.skills,
		award: profileData.awards,
		worksFor: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
		},
	};
}

/**
 * Generate CreativeWork structured data for portfolio items
 */
export function generateCreativeWorkStructuredData(
	item: ContentItem,
	config: StructuredDataConfig = defaultConfig,
) {
	const baseStructuredData = {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		name: item.title,
		description: item.description,
		url: `${config.baseUrl}/portfolio/${item.id}`,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		dateCreated: item.createdAt,
		dateModified: item.updatedAt || item.createdAt,
		datePublished: item.publishedAt || item.createdAt,
		keywords: item.tags.join(", "),
		genre: item.category,
		image: item.thumbnail
			? item.thumbnail.startsWith("http")
				? item.thumbnail
				: `${config.baseUrl}${item.thumbnail}`
			: `${config.baseUrl}/images/og-image.png`,
	};

	// Add specific properties based on category
	if (item.category === "develop") {
		return {
			...baseStructuredData,
			"@type": "SoftwareApplication",
			applicationCategory: "WebApplication",
			operatingSystem: "Web Browser",
			programmingLanguage: item.tags.filter((tag) =>
				["JavaScript", "TypeScript", "React", "Next.js", "CSS"].includes(tag),
			),
		};
	}

	if (item.category === "video" || item.category === "video&design") {
		return {
			...baseStructuredData,
			"@type": "VideoObject",
			duration: item.videos?.[0]?.duration
				? `PT${item.videos[0].duration}S`
				: undefined,
			thumbnailUrl: item.thumbnail
				? `${config.baseUrl}${item.thumbnail}`
				: undefined,
			uploadDate: item.publishedAt || item.createdAt,
		};
	}

	return baseStructuredData;
}

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleStructuredData(
	item: ContentItem,
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: item.title,
		description: item.description,
		url: `${config.baseUrl}/workshop/blog/${item.id}`,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		publisher: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
			logo: {
				"@type": "ImageObject",
				url: config.organization.logo,
			},
		},
		datePublished: item.publishedAt || item.createdAt,
		dateModified: item.updatedAt || item.createdAt,
		image: item.thumbnail
			? item.thumbnail.startsWith("http")
				? item.thumbnail
				: `${config.baseUrl}${item.thumbnail}`
			: `${config.baseUrl}/images/og-image.png`,
		keywords: item.tags.join(", "),
		articleSection: item.category,
		wordCount: item.content?.length || 0,
	};
}

/**
 * Generate SoftwareApplication structured data for plugins
 */
export function generateSoftwareApplicationStructuredData(
	item: ContentItem,
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: item.title,
		description: item.description,
		url: `${config.baseUrl}/workshop/plugins/${item.id}`,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		publisher: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
		},
		datePublished: item.publishedAt || item.createdAt,
		dateModified: item.updatedAt || item.createdAt,
		applicationCategory: "MultimediaApplication",
		operatingSystem:
			item.category === "aftereffects" ? "Windows, macOS" : "Any",
		softwareVersion: item.downloadInfo?.version || "1.0.0",
		downloadUrl: item.downloadInfo
			? `${config.baseUrl}/api/download/${item.id}`
			: undefined,
		fileSize: item.downloadInfo?.fileSize
			? `${item.downloadInfo.fileSize} bytes`
			: undefined,
		image: item.thumbnail
			? item.thumbnail.startsWith("http")
				? item.thumbnail
				: `${config.baseUrl}${item.thumbnail}`
			: `${config.baseUrl}/images/og-image.png`,
		keywords: item.tags.join(", "),
	};
}

/**
 * Generate WebApplication structured data for tools
 */
export function generateWebApplicationStructuredData(
	toolData: {
		name: string;
		description: string;
		url: string;
		category: string;
		features: string[];
	},
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: toolData.name,
		description: toolData.description,
		url: toolData.url,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		publisher: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
		},
		applicationCategory: "UtilityApplication",
		operatingSystem: "Web Browser",
		browserRequirements: "Modern web browser with JavaScript enabled",
		featureList: toolData.features,
		isAccessibleForFree: true,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "JPY",
			availability: "https://schema.org/InStock",
		},
		image: `${config.baseUrl}/images/tools/${toolData.category}.jpg`,
	};
}

/**
 * Generate BreadcrumbList structured data for navigation
 */
export function generateBreadcrumbStructuredData(
	breadcrumbs: Array<{ name: string; url: string }>,
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${config.baseUrl}${crumb.url}`,
		})),
	};
}

/**
 * Generate CollectionPage structured data for gallery pages
 */
export function generateCollectionPageStructuredData(
	pageData: {
		name: string;
		description: string;
		url: string;
		items: ContentItem[];
	},
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: pageData.name,
		description: pageData.description,
		url: `${config.baseUrl}${pageData.url}`,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: pageData.items.length,
			itemListElement: pageData.items.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${config.baseUrl}/portfolio/${item.id}`,
				name: item.title,
				description: item.description,
				image: item.thumbnail
					? item.thumbnail.startsWith("http")
						? item.thumbnail
						: `${config.baseUrl}${item.thumbnail}`
					: `${config.baseUrl}/images/og-image.png`,
			})),
		},
	};
}

/**
 * Generate FAQ structured data for help pages
 */
export function generateFAQStructuredData(
	faqs: Array<{ question: string; answer: string }>,
) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
}

/**
 * Generate ContactPage structured data
 */
export function generateContactPageStructuredData(
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "ContactPage",
		name: "Contact - samuido",
		description: "samuidoへのお問い合わせページ",
		url: `${config.baseUrl}/contact`,
		author: {
			"@type": "Person",
			name: config.author.name,
			url: config.author.url,
		},
		mainEntity: {
			"@type": "Organization",
			name: config.organization.name,
			url: config.organization.url,
			contactPoint: [
				{
					"@type": "ContactPoint",
					contactType: "Technical Support",
					email: "rebuild.up.up@gmail.com",
					availableLanguage: ["Japanese", "English"],
				},
				{
					"@type": "ContactPoint",
					contactType: "Creative Services",
					email: "361do.sleep@gmail.com",
					availableLanguage: ["Japanese"],
				},
			],
		},
	};
}

/**
 * Generate SearchResultsPage structured data
 */
export function generateSearchResultsPageStructuredData(
	query: string,
	results: Array<{ title: string; description: string; url: string }>,
	config: StructuredDataConfig = defaultConfig,
) {
	return {
		"@context": "https://schema.org",
		"@type": "SearchResultsPage",
		name: `Search Results for "${query}"`,
		description: `Search results for "${query}" on samuido website`,
		url: `${config.baseUrl}/search?q=${encodeURIComponent(query)}`,
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: results.length,
			itemListElement: results.map((result, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: result.url,
				name: result.title,
				description: result.description,
			})),
		},
	};
}
