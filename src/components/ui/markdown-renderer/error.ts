/**
 * Error types for the Markdown renderer. Kept in a separate file so Fast
 * Refresh on `MarkdownRenderer.tsx` does not have to re-evaluate non-component
 * exports.
 */

export class MarkdownRendererErrorClass extends Error {
	constructor(
		message: string,
		public readonly code: "FILE_NOT_FOUND" | "FETCH_ERROR" | "PARSE_ERROR",
		public readonly filePath: string,
	) {
		super(message);
		this.name = "MarkdownFileError";
	}
}
