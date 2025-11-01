/**
 * SEO Validation Utilities
 * Validates SEO elements for compliance and best practices
 */

import type { Metadata } from "next";

export interface SEOValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	score: number; // 0-100
}

export interface SEOValidationConfig {
	maxTitleLength: number;
	maxDescriptionLength: number;
	minDescriptionLength: number;
	maxKeywords: number;
	requiredOGProperties: string[];
	requiredTwitterProperties: string[];
}

const defaultValidationConfig: SEOValidationConfig = {
	maxTitleLength: 60,
	maxDescriptionLength: 160,
	minDescriptionLength: 120,
	maxKeywords: 10,
	requiredOGProperties: ["title", "description", "type", "url", "images"],
	requiredTwitterProperties: ["card", "title", "description", "images"],
};

/**
 * Validate page title
 */
export function validateTitle(
	title: string | null | undefined,
	config: SEOValidationConfig = defaultValidationConfig,
): { isValid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!title) {
		errors.push("Title is required");
		return { isValid: false, errors, warnings };
	}

	if (typeof title !== "string") {
		errors.push("Title must be a string");
		return { isValid: false, errors, warnings };
	}

	if (title.length === 0) {
		errors.push("Title cannot be empty");
	}

	if (title.length > config.maxTitleLength) {
		warnings.push(
			`Title is too long (${title.length} chars, max ${config.maxTitleLength})`,
		);
	}

	if (title.length < 10) {
		warnings.push("Title is too short (minimum 10 characters recommended)");
	}

	// Check for duplicate words
	const words = title.toLowerCase().split(/\s+/);
	const duplicateWords = words.filter(
		(word, index) => words.indexOf(word) !== index,
	);
	if (duplicateWords.length > 0) {
		warnings.push(
			`Title contains duplicate words: ${duplicateWords.join(", ")}`,
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate meta description
 */
export function validateDescription(
	description: string | null | undefined,
	config: SEOValidationConfig = defaultValidationConfig,
): { isValid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!description) {
		errors.push("Description is required");
		return { isValid: false, errors, warnings };
	}

	if (typeof description !== "string") {
		errors.push("Description must be a string");
		return { isValid: false, errors, warnings };
	}

	if (description.length === 0) {
		errors.push("Description cannot be empty");
	}

	if (description.length > config.maxDescriptionLength) {
		warnings.push(
			`Description is too long (${description.length} chars, max ${config.maxDescriptionLength})`,
		);
	}

	if (description.length < config.minDescriptionLength) {
		warnings.push(
			`Description is too short (${description.length} chars, min ${config.minDescriptionLength} recommended)`,
		);
	}

	// Check for action words
	const actionWords = [
		"learn",
		"discover",
		"explore",
		"find",
		"get",
		"create",
		"build",
	];
	const hasActionWord = actionWords.some((word) =>
		description.toLowerCase().includes(word),
	);
	if (!hasActionWord) {
		warnings.push(
			"Description should include action words to encourage clicks",
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate keywords
 */
export function validateKeywords(
	keywords: string[] | string | null | undefined,
	config: SEOValidationConfig = defaultValidationConfig,
): { isValid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!keywords) {
		warnings.push("Keywords are recommended for better SEO");
		return { isValid: true, errors, warnings };
	}

	let keywordArray: string[] = [];
	if (typeof keywords === "string") {
		keywordArray = keywords.split(",").map((k) => k.trim());
	} else if (Array.isArray(keywords)) {
		keywordArray = keywords;
	} else {
		errors.push("Keywords must be an array or comma-separated string");
		return { isValid: false, errors, warnings };
	}

	if (keywordArray.length > config.maxKeywords) {
		warnings.push(
			`Too many keywords (${keywordArray.length}, max ${config.maxKeywords} recommended)`,
		);
	}

	// Check for duplicate keywords
	const duplicates = keywordArray.filter(
		(keyword, index) => keywordArray.indexOf(keyword) !== index,
	);
	if (duplicates.length > 0) {
		warnings.push(`Duplicate keywords found: ${duplicates.join(", ")}`);
	}

	// Check for overly long keywords
	const longKeywords = keywordArray.filter((keyword) => keyword.length > 30);
	if (longKeywords.length > 0) {
		warnings.push(`Long keywords found: ${longKeywords.join(", ")}`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate Open Graph metadata
 */
export function validateOpenGraph(
	openGraph: Metadata["openGraph"],
	config: SEOValidationConfig = defaultValidationConfig,
): { isValid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!openGraph) {
		errors.push("Open Graph metadata is required");
		return { isValid: false, errors, warnings };
	}

	// Check required properties
	config.requiredOGProperties.forEach((prop) => {
		if (!(prop in openGraph) || !openGraph[prop as keyof typeof openGraph]) {
			errors.push(`Open Graph ${prop} is required`);
		}
	});

	// Validate images
	if (openGraph.images) {
		const images = Array.isArray(openGraph.images)
			? openGraph.images
			: [openGraph.images];

		images.forEach((image, index) => {
			if (typeof image === "string") {
				if (!image.startsWith("http")) {
					warnings.push(`OG image ${index + 1} should be an absolute URL`);
				}
			} else if (typeof image === "object" && image !== null) {
				const imgObj = image as {
					url?: string;
					width?: number;
					height?: number;
				};
				if (!imgObj.url) {
					errors.push(`OG image ${index + 1} must have a URL`);
				}
				if (!imgObj.width || !imgObj.height) {
					warnings.push(`OG image ${index + 1} should have width and height`);
				}
				if (imgObj.width && imgObj.height) {
					const ratio = imgObj.width / imgObj.height;
					if (ratio < 1.9 || ratio > 2.1) {
						warnings.push(
							`OG image ${index + 1} should have 1.91:1 aspect ratio (1200x630 recommended)`,
						);
					}
				}
			}
		});
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate Twitter Card metadata
 */
export function validateTwitterCard(
	twitter: Metadata["twitter"],
	config: SEOValidationConfig = defaultValidationConfig,
): { isValid: boolean; errors: string[]; warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!twitter) {
		errors.push("Twitter Card metadata is required");
		return { isValid: false, errors, warnings };
	}

	// Check required properties
	config.requiredTwitterProperties.forEach((prop) => {
		if (!(prop in twitter) || !twitter[prop as keyof typeof twitter]) {
			errors.push(`Twitter ${prop} is required`);
		}
	});

	// Validate card type
	const twitterCard = (twitter as { card?: string }).card;
	if (
		twitterCard &&
		!["summary", "summary_large_image", "app", "player"].includes(twitterCard)
	) {
		errors.push("Invalid Twitter card type");
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate complete metadata object
 */
export function validateMetadata(
	metadata: Metadata,
	config: SEOValidationConfig = defaultValidationConfig,
): SEOValidationResult {
	const allErrors: string[] = [];
	const allWarnings: string[] = [];

	// Validate title
	const titleValidation = validateTitle(metadata.title as string, config);
	allErrors.push(...titleValidation.errors);
	allWarnings.push(...titleValidation.warnings);

	// Validate description
	const descValidation = validateDescription(metadata.description, config);
	allErrors.push(...descValidation.errors);
	allWarnings.push(...descValidation.warnings);

	// Validate keywords
	const keywordsValidation = validateKeywords(metadata.keywords, config);
	allErrors.push(...keywordsValidation.errors);
	allWarnings.push(...keywordsValidation.warnings);

	// Validate Open Graph
	const ogValidation = validateOpenGraph(metadata.openGraph, config);
	allErrors.push(...ogValidation.errors);
	allWarnings.push(...ogValidation.warnings);

	// Validate Twitter Card
	const twitterValidation = validateTwitterCard(metadata.twitter, config);
	allErrors.push(...twitterValidation.errors);
	allWarnings.push(...twitterValidation.warnings);

	// Calculate score
	let score = 100;
	score -= allErrors.length * 10; // Each error reduces score by 10
	score -= allWarnings.length * 2; // Each warning reduces score by 2
	score = Math.max(0, score); // Minimum score is 0

	return {
		isValid: allErrors.length === 0,
		errors: allErrors,
		warnings: allWarnings,
		score,
	};
}

/**
 * Validate structured data
 */
export function validateStructuredData(
	structuredData: Record<string, unknown>,
): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!structuredData) {
		errors.push("Structured data is required");
		return { isValid: false, errors, warnings };
	}

	// Check for required Schema.org properties
	if (!structuredData["@context"]) {
		errors.push("@context is required in structured data");
	} else if (structuredData["@context"] !== "https://schema.org") {
		warnings.push("@context should be https://schema.org");
	}

	if (!structuredData["@type"]) {
		errors.push("@type is required in structured data");
	}

	if (!structuredData.name && !structuredData.headline) {
		warnings.push("name or headline is recommended in structured data");
	}

	if (!structuredData.description) {
		warnings.push("description is recommended in structured data");
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Generate SEO report
 */
export function generateSEOReport(
	metadata: Metadata,
	structuredData?: Record<string, unknown>,
	config: SEOValidationConfig = defaultValidationConfig,
): {
	overall: SEOValidationResult;
	details: {
		title: ReturnType<typeof validateTitle>;
		description: ReturnType<typeof validateDescription>;
		keywords: ReturnType<typeof validateKeywords>;
		openGraph: ReturnType<typeof validateOpenGraph>;
		twitter: ReturnType<typeof validateTwitterCard>;
		structuredData?: ReturnType<typeof validateStructuredData>;
	};
} {
	const overall = validateMetadata(metadata, config);

	const details = {
		title: validateTitle(metadata.title as string, config),
		description: validateDescription(metadata.description, config),
		keywords: validateKeywords(metadata.keywords, config),
		openGraph: validateOpenGraph(metadata.openGraph, config),
		twitter: validateTwitterCard(metadata.twitter, config),
		structuredData: structuredData
			? validateStructuredData(structuredData)
			: undefined,
	};

	return { overall, details };
}
