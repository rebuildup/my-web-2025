/**
 * Error Handling Utilities
 * Based on documents/01_global.md specifications
 */

export interface AppError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
	timestamp: string;
	stack?: string;
}

export interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
	errorInfo?: Record<string, unknown>;
}

// Custom error classes
export class ContentError extends Error {
	constructor(
		message: string,
		public code: string,
		public details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "ContentError";
	}
}

export class ValidationError extends Error {
	constructor(
		message: string,
		public field: string,
		public value?: unknown,
	) {
		super(message);
		this.name = "ValidationError";
	}
}

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export class FileError extends Error {
	constructor(
		message: string,
		public fileName: string,
		public fileSize?: number,
	) {
		super(message);
		this.name = "FileError";
	}
}

export class SearchError extends Error {
	constructor(
		message: string,
		public query: string,
		public filters?: Record<string, unknown>,
	) {
		super(message);
		this.name = "SearchError";
	}
}

// Error handler utilities
export const errorHandler = {
	/**
	 * Handle API errors
	 */
	handleApiError: (error: unknown): AppError => {
		if (error instanceof ContentError) {
			return {
				code: error.code,
				message: error.message,
				details: error.details,
				timestamp: new Date().toISOString(),
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			};
		}

		if (error instanceof ValidationError) {
			return {
				code: "VALIDATION_ERROR",
				message: error.message,
				details: { field: error.field, value: error.value },
				timestamp: new Date().toISOString(),
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			};
		}

		if (error instanceof ApiError) {
			return {
				code: error.code || "API_ERROR",
				message: error.message,
				details: { status: error.status },
				timestamp: new Date().toISOString(),
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			};
		}

		if (error instanceof FileError) {
			return {
				code: "FILE_ERROR",
				message: error.message,
				details: { fileName: error.fileName, fileSize: error.fileSize },
				timestamp: new Date().toISOString(),
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			};
		}

		if (error instanceof SearchError) {
			return {
				code: "SEARCH_ERROR",
				message: error.message,
				details: { query: error.query, filters: error.filters },
				timestamp: new Date().toISOString(),
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			};
		}

		// Generic error handling
		const genericError = error as Error;
		return {
			code: "UNKNOWN_ERROR",
			message: genericError.message || "An unexpected error occurred",
			details: { originalError: String(error) },
			timestamp: new Date().toISOString(),
			stack:
				process.env.NODE_ENV === "development" ? genericError.stack : undefined,
		};
	},

	/**
	 * Log error with appropriate level
	 */
	logError: (
		error: AppError,
		level: "error" | "warn" | "info" = "error",
	): void => {
		const logData = {
			...error,
			environment: process.env.NODE_ENV,
			userAgent:
				typeof window !== "undefined" ? window.navigator.userAgent : undefined,
			url: typeof window !== "undefined" ? window.location.href : undefined,
		};

		switch (level) {
			case "error":
				console.error("Application Error:", logData);
				break;
			case "warn":
				console.warn("Application Warning:", logData);
				break;
			case "info":
				console.info("Application Info:", logData);
				break;
		}

		// In production, send to error tracking service (e.g., Sentry)
		if (process.env.NODE_ENV === "production") {
			// TODO: Integrate with error tracking service
			// Sentry.captureException(error);
		}
	},

	/**
	 * Create user-friendly error message
	 */
	createUserFriendlyMessage: (error: AppError): string => {
		const userFriendlyMessages: Record<string, string> = {
			CONTENT_NOT_FOUND: "The requested content could not be found.",
			VALIDATION_ERROR: "Please check your input and try again.",
			FILE_TOO_LARGE: "The file you're trying to upload is too large.",
			INVALID_FILE_TYPE:
				"The file type you're trying to upload is not supported.",
			NETWORK_ERROR: "Please check your internet connection and try again.",
			SEARCH_ERROR:
				"Search is temporarily unavailable. Please try again later.",
			RATE_LIMIT_EXCEEDED:
				"Too many requests. Please wait a moment and try again.",
			UNAUTHORIZED: "You don't have permission to perform this action.",
			SERVER_ERROR: "Something went wrong on our end. Please try again later.",
		};

		return (
			userFriendlyMessages[error.code] ||
			"An unexpected error occurred. Please try again."
		);
	},

	/**
	 * Handle async errors with retry logic
	 */
	withRetry: async <T>(
		operation: () => Promise<T>,
		maxRetries: number = 3,
		delay: number = 1000,
	): Promise<T> => {
		let lastError: Error;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error as Error;

				if (attempt === maxRetries) {
					throw lastError;
				}

				// Exponential backoff
				const waitTime = delay * 2 ** (attempt - 1);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}
		}

		throw lastError!;
	},

	/**
	 * Safe async operation wrapper
	 */
	safeAsync: async <T>(
		operation: () => Promise<T>,
		fallback?: T,
	): Promise<{ data?: T; error?: AppError }> => {
		try {
			const data = await operation();
			return { data };
		} catch (error) {
			const appError = errorHandler.handleApiError(error);
			errorHandler.logError(appError);

			return {
				error: appError,
				data: fallback,
			};
		}
	},
};

// Error boundary utilities for React components
export const errorBoundaryUtils = {
	/**
	 * Create error boundary state
	 */
	createErrorBoundaryState: (): ErrorBoundaryState => ({
		hasError: false,
	}),

	/**
	 * Handle error boundary error
	 */
	handleErrorBoundaryError: (
		error: Error,
		errorInfo: Record<string, unknown>,
	): ErrorBoundaryState => {
		const appError = errorHandler.handleApiError(error);
		errorHandler.logError(appError);

		return {
			hasError: true,
			error,
			errorInfo,
		};
	},

	/**
	 * Reset error boundary state
	 */
	resetErrorBoundaryState: (): ErrorBoundaryState => ({
		hasError: false,
	}),
};

// Fallback strategies
export const fallbackStrategies = {
	/**
	 * Content loading fallback
	 */
	contentLoadingFallback: {
		title: "Content Unavailable",
		description:
			"This content is temporarily unavailable. Please try again later.",
		thumbnail: "/images/placeholder.jpg",
		tags: [],
		category: "unknown",
	},

	/**
	 * Search fallback when search index is unavailable
	 */
	searchFallback: (query: string) => ({
		results: [],
		message: `Search for "${query}" is temporarily unavailable. Please try again later.`,
		suggestions: [
			"Try a different search term",
			"Check your spelling",
			"Try again in a few minutes",
		],
	}),

	/**
	 * Image loading fallback
	 */
	imageLoadingFallback: {
		src: "/images/placeholder.jpg",
		alt: "Image unavailable",
		width: 400,
		height: 300,
	},

	/**
	 * API response fallback
	 */
	apiResponseFallback: {
		success: false,
		message: "Service temporarily unavailable",
		data: null,
	},
};

// Recovery options
export const recoveryOptions = {
	/**
	 * Provide recovery actions for different error types
	 */
	getRecoveryActions: (
		error: AppError,
	): Array<{
		label: string;
		action: () => void;
	}> => {
		const actions: Array<{ label: string; action: () => void }> = [];

		switch (error.code) {
			case "NETWORK_ERROR":
				actions.push({
					label: "Retry",
					action: () => window.location.reload(),
				});
				break;

			case "CONTENT_NOT_FOUND":
				actions.push({
					label: "Go Home",
					action: () => (window.location.href = "/"),
				});
				actions.push({
					label: "Search",
					action: () => (window.location.href = "/search"),
				});
				break;

			case "VALIDATION_ERROR":
				actions.push({
					label: "Try Again",
					action: () => window.history.back(),
				});
				break;

			case "UNAUTHORIZED":
				actions.push({
					label: "Go Home",
					action: () => (window.location.href = "/"),
				});
				break;

			default:
				actions.push({
					label: "Refresh Page",
					action: () => window.location.reload(),
				});
				actions.push({
					label: "Go Home",
					action: () => (window.location.href = "/"),
				});
		}

		return actions;
	},

	/**
	 * Auto-recovery for certain error types
	 */
	attemptAutoRecovery: async (error: AppError): Promise<boolean> => {
		switch (error.code) {
			case "NETWORK_ERROR":
				// Wait and retry
				await new Promise((resolve) => setTimeout(resolve, 2000));
				try {
					// Test network connectivity
					await fetch("/api/health", { method: "HEAD" });
					return true;
				} catch {
					return false;
				}

			case "CACHE_ERROR":
				// Clear cache and retry
				if (typeof window !== "undefined") {
					localStorage.clear();
					sessionStorage.clear();
				}
				return true;

			default:
				return false;
		}
	},
};

// Error reporting utilities
export const errorReporting = {
	/**
	 * Report error to external service
	 */
	reportError: async (error: AppError): Promise<void> => {
		if (process.env.NODE_ENV === "production") {
			try {
				// In production, send to error tracking service
				await fetch("/api/errors", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(error),
				});
			} catch (reportingError) {
				console.error("Failed to report error:", reportingError);
			}
		}
	},

	/**
	 * Collect error context
	 */
	collectErrorContext: (): Record<string, unknown> => {
		const context: Record<string, unknown> = {
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV,
		};

		if (typeof window !== "undefined") {
			context.userAgent = window.navigator.userAgent;
			context.url = window.location.href;
			context.viewport = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
			context.localStorage = Object.keys(localStorage).length;
			context.sessionStorage = Object.keys(sessionStorage).length;
		}

		return context;
	},
};
