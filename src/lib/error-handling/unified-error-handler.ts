/**
 * Unified Error Handling System
 * Provides centralized error handling for all portfolio content operations
 */

import type {
	FileOperationError,
	MigrationError,
	ValidationError,
} from "@/types";

// Error categories
export enum ErrorCategory {
	MIGRATION = "migration",
	FILE_OPERATION = "file_operation",
	VALIDATION = "validation",
	NETWORK = "network",
	AUTHENTICATION = "authentication",
	PERMISSION = "permission",
	SYSTEM = "system",
	USER_INPUT = "user_input",
}

// Error severity levels
export enum ErrorSeverity {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
}

// Enhanced error interface
export interface EnhancedError {
	id: string;
	category: ErrorCategory;
	severity: ErrorSeverity;
	message: string;
	originalError?: Error;
	context?: Record<string, unknown>;
	timestamp: number;
	stackTrace?: string;
	userMessage?: string;
	suggestedAction?: string;
	retryable: boolean;
	retryCount?: number;
	maxRetries?: number;
}

// Error handling strategy
export interface ErrorHandlingStrategy {
	shouldRetry: (error: EnhancedError) => boolean;
	getRetryDelay: (retryCount: number) => number;
	shouldEscalate: (error: EnhancedError) => boolean;
	getRecoveryAction: (error: EnhancedError) => RecoveryAction | null;
}

// Recovery actions
export enum RecoveryActionType {
	RETRY = "retry",
	FALLBACK = "fallback",
	SKIP = "skip",
	ABORT = "abort",
	USER_INTERVENTION = "user_intervention",
}

export interface RecoveryAction {
	type: RecoveryActionType;
	description: string;
	execute?: () => Promise<unknown>;
	fallbackValue?: unknown;
}

// Error handler configuration
export interface ErrorHandlerConfig {
	enableLogging: boolean;
	enableRetry: boolean;
	enableRecovery: boolean;
	maxRetries: number;
	retryDelay: number;
	escalationThreshold: number;
	logLevel: "error" | "warn" | "info" | "debug";
}

/**
 * Unified Error Handler
 * Centralized error handling with retry, recovery, and escalation
 */
export class UnifiedErrorHandler {
	private config: ErrorHandlerConfig;
	private strategy: ErrorHandlingStrategy;
	private errorHistory: EnhancedError[] = [];
	private errorCallbacks: Map<
		ErrorCategory,
		((error: EnhancedError) => void)[]
	> = new Map();

	constructor(
		config: Partial<ErrorHandlerConfig> = {},
		strategy?: Partial<ErrorHandlingStrategy>,
	) {
		this.config = {
			enableLogging: true,
			enableRetry: true,
			enableRecovery: true,
			maxRetries: 3,
			retryDelay: 1000,
			escalationThreshold: 5,
			logLevel: "error",
			...config,
		};

		this.strategy = {
			shouldRetry: (error) => this.defaultShouldRetry(error),
			getRetryDelay: (retryCount) => this.defaultGetRetryDelay(retryCount),
			shouldEscalate: (error) => this.defaultShouldEscalate(error),
			getRecoveryAction: (error) => this.defaultGetRecoveryAction(error),
			...strategy,
		};
	}

	/**
	 * Handle an error with full processing pipeline
	 */
	async handleError(
		error: Error | EnhancedError,
		context?: Record<string, unknown>,
	): Promise<RecoveryAction | null> {
		const enhancedError = this.enhanceError(error, context);

		// Log the error
		if (this.config.enableLogging) {
			this.logError(enhancedError);
		}

		// Store in history
		this.errorHistory.push(enhancedError);
		this.cleanupErrorHistory();

		// Notify callbacks
		this.notifyCallbacks(enhancedError);

		// Determine recovery action
		let recoveryAction: RecoveryAction | null = null;

		if (this.config.enableRecovery) {
			recoveryAction = this.strategy.getRecoveryAction(enhancedError);
		}

		// Check for escalation
		if (this.strategy.shouldEscalate(enhancedError)) {
			await this.escalateError(enhancedError);
		}

		return recoveryAction;
	}

	/**
	 * Handle migration errors
	 */
	async handleMigrationError(
		migrationError: MigrationError,
		context?: Record<string, unknown>,
	): Promise<RecoveryAction | null> {
		const enhancedError: EnhancedError = {
			id: `migration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			category: ErrorCategory.MIGRATION,
			severity: this.getMigrationErrorSeverity(migrationError),
			message: migrationError.message,
			context: { ...context, originalData: migrationError.originalData },
			timestamp: Date.now(),
			userMessage: this.getMigrationUserMessage(migrationError),
			suggestedAction: migrationError.suggestedFix,
			retryable: migrationError.type !== "data_corruption",
			retryCount: 0,
			maxRetries: this.config.maxRetries,
		};

		return await this.handleError(enhancedError, context);
	}

	/**
	 * Handle file operation errors
	 */
	async handleFileOperationError(
		fileError: FileOperationError,
		context?: Record<string, unknown>,
	): Promise<RecoveryAction | null> {
		const enhancedError: EnhancedError = {
			id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			category: ErrorCategory.FILE_OPERATION,
			severity: fileError.retryable ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH,
			message: `File operation '${fileError.operation}' failed: ${fileError.error.message}`,
			originalError: fileError.error,
			context: {
				...context,
				filePath: fileError.filePath,
				operation: fileError.operation,
			},
			timestamp: Date.now(),
			stackTrace: fileError.error.stack,
			userMessage: this.getFileOperationUserMessage(fileError),
			retryable: fileError.retryable,
			retryCount: 0,
			maxRetries: this.config.maxRetries,
		};

		return await this.handleError(enhancedError, context);
	}

	/**
	 * Handle validation errors
	 */
	async handleValidationError(
		validationError: ValidationError,
		context?: Record<string, unknown>,
	): Promise<RecoveryAction | null> {
		const enhancedError: EnhancedError = {
			id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			category: ErrorCategory.VALIDATION,
			severity: ErrorSeverity.MEDIUM,
			message: `Validation failed for field '${validationError.field}': ${validationError.message}`,
			context: {
				...context,
				field: validationError.field,
				code: validationError.code,
			},
			timestamp: Date.now(),
			userMessage: `Please check the ${validationError.field} field: ${validationError.message}`,
			retryable: false,
			retryCount: 0,
		};

		return await this.handleError(enhancedError, context);
	}

	/**
	 * Execute operation with error handling and retry
	 */
	async executeWithRetry<T>(
		operation: () => Promise<T>,
		context?: Record<string, unknown>,
		maxRetries?: number,
	): Promise<T> {
		const retries = maxRetries || this.config.maxRetries;
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error as Error;

				const enhancedError = this.enhanceError(error as Error, {
					...context,
					attempt: attempt + 1,
					maxRetries: retries,
				});

				// Don't retry on last attempt
				if (attempt === retries) {
					break;
				}

				// Check if should retry
				if (!this.strategy.shouldRetry(enhancedError)) {
					break;
				}

				// Wait before retry
				const delay = this.strategy.getRetryDelay(attempt);
				await this.delay(delay);

				this.log(
					`Retrying operation (attempt ${attempt + 2}/${retries + 1})`,
					"info",
				);
			}
		}

		// All retries failed, handle the error
		const recoveryAction = await this.handleError(lastError!, context);

		if (
			recoveryAction?.type === RecoveryActionType.FALLBACK &&
			recoveryAction.fallbackValue !== undefined
		) {
			return recoveryAction.fallbackValue as T;
		}

		throw lastError;
	}

	/**
	 * Register error callback for specific category
	 */
	onError(
		category: ErrorCategory,
		callback: (error: EnhancedError) => void,
	): void {
		if (!this.errorCallbacks.has(category)) {
			this.errorCallbacks.set(category, []);
		}
		this.errorCallbacks.get(category)?.push(callback);
	}

	/**
	 * Get error statistics
	 */
	getErrorStatistics(timeRange: number = 60 * 60 * 1000): {
		totalErrors: number;
		errorsByCategory: Record<ErrorCategory, number>;
		errorsBySeverity: Record<ErrorSeverity, number>;
		retryableErrors: number;
		escalatedErrors: number;
	} {
		const cutoff = Date.now() - timeRange;
		const recentErrors = this.errorHistory.filter((e) => e.timestamp >= cutoff);

		const stats = {
			totalErrors: recentErrors.length,
			errorsByCategory: {} as Record<ErrorCategory, number>,
			errorsBySeverity: {} as Record<ErrorSeverity, number>,
			retryableErrors: recentErrors.filter((e) => e.retryable).length,
			escalatedErrors: recentErrors.filter(
				(e) => e.severity === ErrorSeverity.CRITICAL,
			).length,
		};

		// Count by category
		Object.values(ErrorCategory).forEach((category) => {
			stats.errorsByCategory[category] = recentErrors.filter(
				(e) => e.category === category,
			).length;
		});

		// Count by severity
		Object.values(ErrorSeverity).forEach((severity) => {
			stats.errorsBySeverity[severity] = recentErrors.filter(
				(e) => e.severity === severity,
			).length;
		});

		return stats;
	}

	/**
	 * Clear error history
	 */
	clearErrorHistory(): void {
		this.errorHistory = [];
	}

	/**
	 * Enhance a basic error with additional information
	 */
	private enhanceError(
		error: Error | EnhancedError,
		context?: Record<string, unknown>,
	): EnhancedError {
		if ("category" in error && "severity" in error) {
			return error as EnhancedError;
		}

		const basicError = error as Error;
		return {
			id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			category: this.categorizeError(basicError),
			severity: this.assessSeverity(basicError),
			message: basicError.message,
			originalError: basicError,
			context,
			timestamp: Date.now(),
			stackTrace: basicError.stack,
			retryable: this.isRetryable(basicError),
			retryCount: 0,
			maxRetries: this.config.maxRetries,
		};
	}

	/**
	 * Default retry strategy
	 */
	private defaultShouldRetry(error: EnhancedError): boolean {
		if (!this.config.enableRetry || !error.retryable) {
			return false;
		}

		if (error.retryCount !== undefined && error.maxRetries !== undefined) {
			return error.retryCount < error.maxRetries;
		}

		return (
			error.retryCount === undefined ||
			error.retryCount < this.config.maxRetries
		);
	}

	/**
	 * Default retry delay calculation (exponential backoff)
	 */
	private defaultGetRetryDelay(retryCount: number): number {
		return this.config.retryDelay * 2 ** retryCount;
	}

	/**
	 * Default escalation strategy
	 */
	private defaultShouldEscalate(error: EnhancedError): boolean {
		return (
			error.severity === ErrorSeverity.CRITICAL ||
			(error.retryCount !== undefined &&
				error.retryCount >= this.config.escalationThreshold)
		);
	}

	/**
	 * Default recovery action strategy
	 */
	private defaultGetRecoveryAction(
		error: EnhancedError,
	): RecoveryAction | null {
		switch (error.category) {
			case ErrorCategory.FILE_OPERATION:
				if (error.context?.operation === "read") {
					return {
						type: RecoveryActionType.FALLBACK,
						description: "Use cached or default content",
						fallbackValue: null,
					};
				}
				break;

			case ErrorCategory.MIGRATION:
				return {
					type: RecoveryActionType.SKIP,
					description: "Skip problematic item and continue processing",
				};

			case ErrorCategory.VALIDATION:
				return {
					type: RecoveryActionType.USER_INTERVENTION,
					description: "User input required to fix validation errors",
				};

			default:
				if (error.retryable) {
					return {
						type: RecoveryActionType.RETRY,
						description: "Retry the operation",
					};
				}
		}

		return null;
	}

	/**
	 * Categorize error based on error type and message
	 */
	private categorizeError(error: Error): ErrorCategory {
		const message = error.message.toLowerCase();

		if (
			message.includes("file") ||
			message.includes("path") ||
			message.includes("enoent")
		) {
			return ErrorCategory.FILE_OPERATION;
		}

		if (
			message.includes("network") ||
			message.includes("fetch") ||
			message.includes("timeout")
		) {
			return ErrorCategory.NETWORK;
		}

		if (message.includes("permission") || message.includes("access")) {
			return ErrorCategory.PERMISSION;
		}

		if (message.includes("validation") || message.includes("invalid")) {
			return ErrorCategory.VALIDATION;
		}

		return ErrorCategory.SYSTEM;
	}

	/**
	 * Assess error severity
	 */
	private assessSeverity(error: Error): ErrorSeverity {
		const message = error.message.toLowerCase();

		if (message.includes("critical") || message.includes("fatal")) {
			return ErrorSeverity.CRITICAL;
		}

		if (message.includes("corruption") || message.includes("security")) {
			return ErrorSeverity.HIGH;
		}

		if (message.includes("warning") || message.includes("deprecated")) {
			return ErrorSeverity.LOW;
		}

		return ErrorSeverity.MEDIUM;
	}

	/**
	 * Check if error is retryable
	 */
	private isRetryable(error: Error): boolean {
		const message = error.message.toLowerCase();

		// Non-retryable conditions
		if (
			message.includes("syntax") ||
			message.includes("invalid") ||
			message.includes("permission") ||
			message.includes("authentication")
		) {
			return false;
		}

		// Retryable conditions
		if (
			message.includes("timeout") ||
			message.includes("network") ||
			message.includes("temporary") ||
			message.includes("busy")
		) {
			return true;
		}

		return false;
	}

	/**
	 * Get user-friendly message for migration errors
	 */
	private getMigrationUserMessage(error: MigrationError): string {
		switch (error.type) {
			case "validation":
				return "Some content data couldn't be validated. Please check the data format.";
			case "file_creation":
				return "Failed to create necessary files. Please check file permissions.";
			case "data_corruption":
				return "Data corruption detected. Please restore from backup.";
			default:
				return "An error occurred during data migration.";
		}
	}

	/**
	 * Get user-friendly message for file operation errors
	 */
	private getFileOperationUserMessage(error: FileOperationError): string {
		switch (error.operation) {
			case "read":
				return "Failed to read file. The file may not exist or be inaccessible.";
			case "write":
				return "Failed to save file. Please check file permissions and disk space.";
			case "delete":
				return "Failed to delete file. The file may be in use or protected.";
			case "upload":
				return "Failed to upload file. Please check file size and format.";
			default:
				return "A file operation failed. Please try again.";
		}
	}

	/**
	 * Get migration error severity
	 */
	private getMigrationErrorSeverity(error: MigrationError): ErrorSeverity {
		switch (error.type) {
			case "data_corruption":
				return ErrorSeverity.CRITICAL;
			case "file_creation":
				return ErrorSeverity.HIGH;
			case "validation":
				return ErrorSeverity.MEDIUM;
			default:
				return ErrorSeverity.MEDIUM;
		}
	}

	/**
	 * Notify registered callbacks
	 */
	private notifyCallbacks(error: EnhancedError): void {
		const callbacks = this.errorCallbacks.get(error.category);
		if (callbacks) {
			callbacks.forEach((callback) => {
				try {
					callback(error);
				} catch (callbackError) {
					console.error("Error in error callback:", callbackError);
				}
			});
		}
	}

	/**
	 * Escalate error to higher level systems
	 */
	private async escalateError(error: EnhancedError): Promise<void> {
		// In a real system, this would send alerts to monitoring systems,
		// notify administrators, etc.
		console.error("ESCALATED ERROR:", {
			id: error.id,
			category: error.category,
			severity: error.severity,
			message: error.message,
			context: error.context,
		});
	}

	/**
	 * Log error with appropriate level
	 */
	private logError(error: EnhancedError): void {
		const logData = {
			id: error.id,
			category: error.category,
			severity: error.severity,
			message: error.message,
			context: error.context,
			retryable: error.retryable,
		};

		switch (error.severity) {
			case ErrorSeverity.CRITICAL:
				console.error("[UnifiedErrorHandler] CRITICAL:", logData);
				break;
			case ErrorSeverity.HIGH:
				console.error("[UnifiedErrorHandler] HIGH:", logData);
				break;
			case ErrorSeverity.MEDIUM:
				console.warn("[UnifiedErrorHandler] MEDIUM:", logData);
				break;
			case ErrorSeverity.LOW:
				console.info("[UnifiedErrorHandler] LOW:", logData);
				break;
		}
	}

	/**
	 * Generic logging method
	 */
	private log(
		message: string,
		level: "error" | "warn" | "info" | "debug" = "info",
	): void {
		if (this.config.enableLogging) {
			console[level](`[UnifiedErrorHandler] ${message}`);
		}
	}

	/**
	 * Clean up old error history
	 */
	private cleanupErrorHistory(): void {
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours
		const cutoff = Date.now() - maxAge;
		this.errorHistory = this.errorHistory.filter((e) => e.timestamp >= cutoff);
	}

	/**
	 * Utility delay function
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

/**
 * Global error handler instance
 */
export const unifiedErrorHandler = new UnifiedErrorHandler();

/**
 * Convenience function to wrap operations with error handling
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	context?: Record<string, unknown>,
	errorHandler: UnifiedErrorHandler = unifiedErrorHandler,
): Promise<T> {
	return errorHandler.executeWithRetry(operation, context);
}
