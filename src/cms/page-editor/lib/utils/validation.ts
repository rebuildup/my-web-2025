import { z } from "zod";

// Uppercase letters are intentional: writers chose them, so we keep them.
const slugRegex = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export const slugSchema = z
	.string()
	.min(1, "Slug is required")
	.max(120, "Slug must be 120 characters or fewer")
	.regex(slugRegex, "Use letters, numbers, and hyphens only");

const _titleSchema = z
	.string()
	.min(1, "Title is required")
	.max(180, "Title must be 180 characters or fewer");

function _validateSlug(slug: string) {
	return slugSchema.safeParse(slug);
}

export function normalizeSlug(slug: string) {
	return slug
		.trim()
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
