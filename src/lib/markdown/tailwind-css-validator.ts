/**
 * Tailwind CSS Class Validator and Suggestion Engine
 * Validates and suggests Tailwind CSS classes for embed syntax
 * Based on markdown-content-system design specifications
 */

// Supported Tailwind CSS classes for different embed types
export interface TailwindClassSupport {
	imageClasses: {
		sizing: string[];
		spacing: string[];
		borders: string[];
		shadows: string[];
		responsive: string[];
	};
	videoClasses: {
		sizing: string[];
		spacing: string[];
		borders: string[];
		shadows: string[];
		responsive: string[];
	};
	linkClasses: {
		colors: string[];
		spacing: string[];
		borders: string[];
		typography: string[];
		states: string[];
	};
	iframeClasses: {
		sizing: string[];
		borders: string[];
		shadows: string[];
		responsive: string[];
	};
}

// Predefined safe Tailwind CSS classes
export const TAILWIND_CLASS_SUPPORT: TailwindClassSupport = {
	imageClasses: {
		sizing: [
			"w-full",
			"w-1/2",
			"w-1/3",
			"w-1/4",
			"w-2/3",
			"w-3/4",
			"h-auto",
			"h-32",
			"h-48",
			"h-64",
			"h-96",
			"max-w-full",
			"max-w-sm",
			"max-w-md",
			"max-w-lg",
			"max-w-xl",
			"aspect-square",
			"aspect-video",
			"aspect-[4/3]",
			"aspect-[3/2]",
		],
		spacing: [
			"p-2",
			"p-4",
			"p-6",
			"p-8",
			"m-2",
			"m-4",
			"m-6",
			"m-8",
			"mx-auto",
			"my-2",
			"my-4",
			"my-6",
			"my-8",
			"mt-2",
			"mt-4",
			"mt-6",
			"mt-8",
			"mb-2",
			"mb-4",
			"mb-6",
			"mb-8",
		],
		borders: [
			"rounded",
			"rounded-sm",
			"rounded-md",
			"rounded-lg",
			"rounded-xl",
			"rounded-2xl",
			"rounded-full",
			"border",
			"border-2",
			"border-4",
			"border-gray-200",
			"border-gray-300",
			"border-gray-400",
			"border-blue-200",
			"border-blue-300",
			"border-blue-400",
		],
		shadows: [
			"shadow",
			"shadow-sm",
			"shadow-md",
			"shadow-lg",
			"shadow-xl",
			"shadow-2xl",
			"drop-shadow",
			"drop-shadow-sm",
			"drop-shadow-md",
			"drop-shadow-lg",
		],
		responsive: [
			"sm:w-1/2",
			"sm:w-1/3",
			"sm:w-1/4",
			"md:w-1/2",
			"md:w-1/3",
			"md:w-1/4",
			"lg:w-1/2",
			"lg:w-1/3",
			"lg:w-1/4",
			"lg:w-1/5",
			"xl:w-1/2",
			"xl:w-1/3",
			"xl:w-1/4",
			"xl:w-1/5",
			"xl:w-1/6",
		],
	},
	videoClasses: {
		sizing: [
			"w-full",
			"w-4/5",
			"w-3/4",
			"w-2/3",
			"w-1/2",
			"h-64",
			"h-80",
			"h-96",
			"h-[400px]",
			"h-[500px]",
			"aspect-video",
			"aspect-square",
			"aspect-[4/3]",
			"aspect-[16/10]",
		],
		spacing: [
			"p-2",
			"p-4",
			"p-6",
			"p-8",
			"m-2",
			"m-4",
			"m-6",
			"m-8",
			"mx-auto",
			"my-4",
			"my-6",
			"my-8",
		],
		borders: [
			"rounded",
			"rounded-md",
			"rounded-lg",
			"rounded-xl",
			"border",
			"border-2",
			"border-gray-200",
			"border-gray-300",
		],
		shadows: [
			"shadow",
			"shadow-md",
			"shadow-lg",
			"shadow-xl",
			"drop-shadow-md",
			"drop-shadow-lg",
		],
		responsive: [
			"sm:h-48",
			"sm:h-64",
			"sm:aspect-video",
			"md:h-64",
			"md:h-80",
			"md:h-96",
			"lg:h-80",
			"lg:h-96",
			"lg:h-[500px]",
		],
	},
	linkClasses: {
		colors: [
			"text-blue-500",
			"text-blue-600",
			"text-blue-700",
			"text-green-500",
			"text-green-600",
			"text-green-700",
			"text-purple-500",
			"text-purple-600",
			"text-purple-700",
			"bg-blue-500",
			"bg-blue-600",
			"bg-green-500",
			"bg-green-600",
			"bg-purple-500",
			"bg-purple-600",
			"bg-gray-100",
			"bg-gray-200",
		],
		spacing: [
			"px-2",
			"px-3",
			"px-4",
			"px-6",
			"py-1",
			"py-2",
			"py-3",
			"mx-1",
			"mx-2",
			"my-1",
			"my-2",
		],
		borders: [
			"rounded",
			"rounded-md",
			"rounded-lg",
			"rounded-full",
			"border",
			"border-2",
			"border-blue-500",
			"border-green-500",
			"border-purple-500",
		],
		typography: [
			"text-xs",
			"text-sm",
			"text-base",
			"text-lg",
			"font-normal",
			"font-medium",
			"font-semibold",
			"font-bold",
			"underline",
			"no-underline",
		],
		states: [
			"hover:bg-blue-600",
			"hover:bg-green-600",
			"hover:bg-purple-600",
			"hover:text-white",
			"hover:text-blue-700",
			"hover:text-green-700",
			"hover:underline",
			"hover:no-underline",
			"focus:outline-none",
			"focus:ring-2",
			"focus:ring-blue-500",
			"transition-colors",
			"transition-all",
			"duration-200",
			"duration-300",
		],
	},
	iframeClasses: {
		sizing: [
			"w-full",
			"w-4/5",
			"w-3/4",
			"w-2/3",
			"h-64",
			"h-80",
			"h-96",
			"h-[400px]",
			"h-[500px]",
			"h-[600px]",
			"aspect-video",
			"aspect-square",
			"aspect-[4/3]",
		],
		borders: [
			"rounded",
			"rounded-md",
			"rounded-lg",
			"rounded-xl",
			"border-0",
			"border",
			"border-2",
			"border-gray-200",
			"border-gray-300",
		],
		shadows: ["shadow", "shadow-md", "shadow-lg", "shadow-xl"],
		responsive: [
			"sm:h-48",
			"sm:h-64",
			"md:h-64",
			"md:h-80",
			"md:h-96",
			"lg:h-80",
			"lg:h-96",
			"lg:h-[500px]",
		],
	},
};

// Class validation result
export interface ClassValidationResult {
	valid: string[];
	invalid: string[];
	suggestions: string[];
}

// Class suggestion engine interface
export interface ClassSuggestionEngine {
	getCommonClasses(embedType: "image" | "video" | "link" | "iframe"): string[];
	getResponsiveClasses(
		embedType: "image" | "video" | "link" | "iframe",
	): string[];
	validateClasses(classes: string[]): ClassValidationResult;
	suggestAlternatives(invalidClass: string): string[];
}

// Implementation of class suggestion engine
export class TailwindClassSuggestionEngine implements ClassSuggestionEngine {
	private getAllValidClasses(): string[] {
		const allClasses: string[] = [];

		Object.values(TAILWIND_CLASS_SUPPORT).forEach((embedType) => {
			Object.values(embedType).forEach((classArray) => {
				allClasses.push(...(classArray as string[]));
			});
		});

		return [...new Set(allClasses)]; // Remove duplicates
	}

	getCommonClasses(embedType: "image" | "video" | "link" | "iframe"): string[] {
		const classMap = {
			image: [
				...TAILWIND_CLASS_SUPPORT.imageClasses.sizing.slice(0, 5),
				...TAILWIND_CLASS_SUPPORT.imageClasses.borders.slice(0, 3),
				...TAILWIND_CLASS_SUPPORT.imageClasses.shadows.slice(0, 3),
			],
			video: [
				...TAILWIND_CLASS_SUPPORT.videoClasses.sizing.slice(0, 5),
				...TAILWIND_CLASS_SUPPORT.videoClasses.borders.slice(0, 3),
				...TAILWIND_CLASS_SUPPORT.videoClasses.shadows.slice(0, 3),
			],
			link: [
				...TAILWIND_CLASS_SUPPORT.linkClasses.colors.slice(0, 5),
				...TAILWIND_CLASS_SUPPORT.linkClasses.spacing.slice(0, 4),
				...TAILWIND_CLASS_SUPPORT.linkClasses.typography.slice(0, 4),
			],
			iframe: [
				...TAILWIND_CLASS_SUPPORT.iframeClasses.sizing.slice(0, 5),
				...TAILWIND_CLASS_SUPPORT.iframeClasses.borders.slice(0, 3),
				...TAILWIND_CLASS_SUPPORT.iframeClasses.shadows.slice(0, 3),
			],
		};

		return classMap[embedType] || [];
	}

	getResponsiveClasses(
		embedType: "image" | "video" | "link" | "iframe",
	): string[] {
		const responsiveMap = {
			image: TAILWIND_CLASS_SUPPORT.imageClasses.responsive,
			video: TAILWIND_CLASS_SUPPORT.videoClasses.responsive,
			link: [], // Links typically don't need responsive classes
			iframe: TAILWIND_CLASS_SUPPORT.iframeClasses.responsive,
		};

		return responsiveMap[embedType] || [];
	}

	validateClasses(classes: string[]): ClassValidationResult {
		const validClasses = this.getAllValidClasses();
		const valid: string[] = [];
		const invalid: string[] = [];
		const suggestions: string[] = [];

		classes.forEach((className) => {
			const trimmedClass = className.trim();
			if (validClasses.includes(trimmedClass)) {
				valid.push(trimmedClass);
			} else {
				invalid.push(trimmedClass);
				const alternatives = this.suggestAlternatives(trimmedClass);
				suggestions.push(...alternatives);
			}
		});

		return {
			valid,
			invalid,
			suggestions: [...new Set(suggestions)], // Remove duplicates
		};
	}

	suggestAlternatives(invalidClass: string): string[] {
		const validClasses = this.getAllValidClasses();
		const suggestions: string[] = [];

		// Simple fuzzy matching based on common patterns
		const patterns = [
			{
				pattern: /^w-/,
				alternatives: validClasses.filter((c) => c.startsWith("w-")),
			},
			{
				pattern: /^h-/,
				alternatives: validClasses.filter((c) => c.startsWith("h-")),
			},
			{
				pattern: /^p-/,
				alternatives: validClasses.filter((c) => c.startsWith("p-")),
			},
			{
				pattern: /^m-/,
				alternatives: validClasses.filter((c) => c.startsWith("m-")),
			},
			{
				pattern: /^text-/,
				alternatives: validClasses.filter((c) => c.startsWith("text-")),
			},
			{
				pattern: /^bg-/,
				alternatives: validClasses.filter((c) => c.startsWith("bg-")),
			},
			{
				pattern: /^border/,
				alternatives: validClasses.filter((c) => c.startsWith("border")),
			},
			{
				pattern: /^rounded/,
				alternatives: validClasses.filter((c) => c.startsWith("rounded")),
			},
			{
				pattern: /^shadow/,
				alternatives: validClasses.filter((c) => c.startsWith("shadow")),
			},
			{
				pattern: /^aspect-/,
				alternatives: validClasses.filter((c) => c.startsWith("aspect-")),
			},
		];

		for (const { pattern, alternatives } of patterns) {
			if (pattern.test(invalidClass)) {
				suggestions.push(...alternatives.slice(0, 3)); // Limit to 3 suggestions per pattern
				break;
			}
		}

		// If no pattern matches, suggest some common classes
		if (suggestions.length === 0) {
			suggestions.push("w-full", "rounded-lg", "shadow-md");
		}

		return suggestions.slice(0, 5); // Limit total suggestions
	}
}

// Embed syntax parser with Tailwind support
export interface EmbedSyntaxParser {
	parseImageEmbed(match: string): {
		index: number;
		altText?: string;
		classes?: string[];
	};
	parseVideoEmbed(match: string): {
		index: number;
		title?: string;
		classes?: string[];
	};
	parseLinkEmbed(match: string): {
		index: number;
		customText?: string;
		classes?: string[];
	};
	parseIframeEmbed(match: string): {
		src: string;
		title?: string;
		classes?: string[];
		attributes: Record<string, string>;
	};
}

// Implementation of embed syntax parser
export class EnhancedEmbedSyntaxParser implements EmbedSyntaxParser {
	private classSuggestionEngine: ClassSuggestionEngine;

	constructor(classSuggestionEngine?: ClassSuggestionEngine) {
		this.classSuggestionEngine =
			classSuggestionEngine || new TailwindClassSuggestionEngine();
	}

	parseImageEmbed(match: string): {
		index: number;
		altText?: string;
		classes?: string[];
	} {
		const imagePattern =
			/!\[image:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/;
		const matches = match.match(imagePattern);

		if (!matches) {
			throw new Error(`Invalid image embed syntax: ${match}`);
		}

		const index = parseInt(matches[1], 10);
		const altText = matches[2] || undefined;
		const classString = matches[3] || undefined;
		const classes = classString
			? classString.split(/\s+/).filter((c: string) => c.length > 0)
			: undefined;

		return { index, altText, classes };
	}

	parseVideoEmbed(match: string): {
		index: number;
		title?: string;
		classes?: string[];
	} {
		const videoPattern =
			/!\[video:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/;
		const matches = match.match(videoPattern);

		if (!matches) {
			throw new Error(`Invalid video embed syntax: ${match}`);
		}

		const index = parseInt(matches[1], 10);
		const title = matches[2] || undefined;
		const classString = matches[3] || undefined;
		const classes = classString
			? classString.split(/\s+/).filter((c: string) => c.length > 0)
			: undefined;

		return { index, title, classes };
	}

	parseLinkEmbed(match: string): {
		index: number;
		customText?: string;
		classes?: string[];
	} {
		const linkPattern =
			/\[link:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/;
		const matches = match.match(linkPattern);

		if (!matches) {
			throw new Error(`Invalid link embed syntax: ${match}`);
		}

		const index = parseInt(matches[1], 10);
		const customText = matches[2] || undefined;
		const classString = matches[3] || undefined;
		const classes = classString
			? classString.split(/\s+/).filter((c: string) => c.length > 0)
			: undefined;

		return { index, customText, classes };
	}

	parseIframeEmbed(match: string): {
		src: string;
		title?: string;
		classes?: string[];
		attributes: Record<string, string>;
	} {
		const iframePattern = /<iframe([^>]*)>(.*?)<\/iframe>/i;
		const matches = match.match(iframePattern);

		if (!matches) {
			throw new Error(`Invalid iframe embed syntax: ${match}`);
		}

		const attributesString = matches[1];
		const attributes: Record<string, string> = {};
		let src = "";
		let title: string | undefined;
		let classes: string[] | undefined;

		// Parse attributes
		const attrPattern = /(\w+)=["']([^"']*)["']/g;
		let attrMatch;
		while ((attrMatch = attrPattern.exec(attributesString)) !== null) {
			const [, attrName, attrValue] = attrMatch;
			attributes[attrName] = attrValue;

			if (attrName === "src") {
				src = attrValue;
			} else if (attrName === "title") {
				title = attrValue;
			} else if (attrName === "class") {
				classes = attrValue.split(/\s+/).filter((c: string) => c.length > 0);
			}
		}

		if (!src) {
			throw new Error(`Iframe embed missing src attribute: ${match}`);
		}

		return { src, title, classes, attributes };
	}
}

// Factory functions
export const createClassSuggestionEngine = (): ClassSuggestionEngine => {
	return new TailwindClassSuggestionEngine();
};

export const createEmbedSyntaxParser = (
	classSuggestionEngine?: ClassSuggestionEngine,
): EmbedSyntaxParser => {
	return new EnhancedEmbedSyntaxParser(classSuggestionEngine);
};

// Default exports
export default TailwindClassSuggestionEngine;
