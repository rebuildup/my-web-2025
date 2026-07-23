import type { EmbedValidationError, MediaData } from "./types";

/**
 * Validate embed syntax in the markdown content.
 * Returns an array of validation errors describing any issues found.
 */
export function validateEmbedSyntax(
	content: string,
	embedSupport: boolean,
	mediaData: MediaData | undefined,
): EmbedValidationError[] {
	if (!embedSupport || !mediaData) return [];

	const errors: EmbedValidationError[] = [];
	const lines = content.split("\n");

	// Regex patterns for embed syntax
	const imagePattern = /!\[image:(\d+)(?:\s+"([^"]*)")?\]/g;
	const videoPattern = /!\[video:(\d+)(?:\s+"([^"]*)")?\]/g;
	const linkPattern = /\[link:(\d+)(?:\s+"([^"]*)")?\]/g;

	lines.forEach((line, lineIndex) => {
		// Validate image embeds
		let match;
		while ((match = imagePattern.exec(line)) !== null) {
			const index = parseInt(match[1], 10);
			if (index >= mediaData.images.length) {
				errors.push({
					line: lineIndex + 1,
					column: match.index + 1,
					type: "INVALID_INDEX",
					message: `Image index ${index} is out of range. Available images: 0-${mediaData.images.length - 1}`,
					suggestion: `Use an index between 0 and ${mediaData.images.length - 1}`,
				});
			}
		}

		// Validate video embeds
		while ((match = videoPattern.exec(line)) !== null) {
			const index = parseInt(match[1], 10);
			if (index >= mediaData.videos.length) {
				errors.push({
					line: lineIndex + 1,
					column: match.index + 1,
					type: "INVALID_INDEX",
					message: `Video index ${index} is out of range. Available videos: 0-${mediaData.videos.length - 1}`,
					suggestion: `Use an index between 0 and ${mediaData.videos.length - 1}`,
				});
			}
		}

		// Validate link embeds
		while ((match = linkPattern.exec(line)) !== null) {
			const index = parseInt(match[1], 10);
			if (index >= mediaData.externalLinks.length) {
				errors.push({
					line: lineIndex + 1,
					column: match.index + 1,
					type: "INVALID_INDEX",
					message: `Link index ${index} is out of range. Available links: 0-${mediaData.externalLinks.length - 1}`,
					suggestion: `Use an index between 0 and ${mediaData.externalLinks.length - 1}`,
				});
			}
		}

		// Check for malformed syntax
		const malformedPatterns = [
			/!\[image:\D/g, // Non-numeric image index
			/!\[video:\D/g, // Non-numeric video index
			/\[link:\D/g, // Non-numeric link index
		];

		malformedPatterns.forEach((pattern) => {
			while ((match = pattern.exec(line)) !== null) {
				errors.push({
					line: lineIndex + 1,
					column: match.index + 1,
					type: "MALFORMED_SYNTAX",
					message: "Embed syntax requires a numeric index",
					suggestion: "Use format like ![image:0] or [link:1]",
				});
			}
		});
	});

	return errors;
}
