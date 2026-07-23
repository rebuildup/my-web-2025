/**
 * Markdown content fetcher used by MarkdownRenderer.
 *
 * Pulls a remote markdown file (or accepts an inline string) and normalizes
 * the result. Throws a `MarkdownError` on any failure with file context so
 * the caller can render a useful error boundary.
 */

import {
	MarkdownError,
	MarkdownErrorType,
	markdownErrorHandler,
} from "@/lib/markdown/client";

export const fetchMarkdownContent = async (
	path: string,
	enableIntegrityCheck: boolean,
): Promise<string> => {
	try {
		// Ensure the path starts with / for absolute paths
		const normalizedPath: string = path.startsWith("/") ? path : `/${path}`;

		console.log(`[MarkdownRenderer] Fetching markdown file: ${normalizedPath}`);

		const response = await fetch(normalizedPath, {
			cache: "no-store", // Disable caching for development
		});

		console.log(
			`[MarkdownRenderer] Response status: ${response.status}, ok: ${response.ok}`,
		);

		if (!response.ok) {
			if (response.status === 404) {
				console.error(`[MarkdownRenderer] File not found: ${normalizedPath}`);
				const fileNotFoundError = new MarkdownError(
					MarkdownErrorType.FILE_NOT_FOUND,
					`Markdown file not found: ${normalizedPath}`,
					{ filePath: normalizedPath, status: response.status },
					"Check if the file path is correct and the file exists",
				);
				return Promise.reject(fileNotFoundError);
			}
			console.error(
				`[MarkdownRenderer] Fetch failed: ${response.status} ${response.statusText}`,
			);
			const fetchError = new MarkdownError(
				MarkdownErrorType.PERMISSION_DENIED,
				`Failed to fetch markdown file: ${response.statusText}`,
				{ filePath: normalizedPath, status: response.status },
				"Check file permissions and server configuration",
			);
			return Promise.reject(fetchError);
		}

		const fetchedContent = await response.text();

		console.log(`[MarkdownRenderer] Content length: ${fetchedContent.length}`);
		console.log(
			`[MarkdownRenderer] Content preview: ${fetchedContent.substring(0, 100)}...`,
		);

		// Check if content is empty or just whitespace
		if (!fetchedContent) {
			console.info(`Markdown file is empty: ${normalizedPath}`);
			return ""; // Return empty string for empty files
		}
		if (fetchedContent.trim().length === 0) {
			console.info(`Markdown file is empty: ${normalizedPath}`);
			return ""; // Return empty string for empty files
		}

		// Note: File integrity check is not available in client components
		// This feature requires server-side processing
		if (enableIntegrityCheck) {
			console.warn(
				"File integrity check is not available in client components",
			);
		}

		return fetchedContent;
	} catch (error) {
		console.error(`[MarkdownRenderer] Error fetching ${path}:`, error);
		if (error instanceof MarkdownError) {
			return Promise.reject(error);
		}
		const handledError = markdownErrorHandler.handleFileError(error, path);
		return Promise.reject(handledError);
	}
};
