/**
 * Validation Utilities
 * Based on documents/01_global.md specifications
 */

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface FieldValidationResult {
	isValid: boolean;
	error?: string;
}

// Core validators from documents/01_global.md
export const validators = {
	/**
	 * Email validation
	 */
	email: (value: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value);
	},

	/**
	 * Required field validation
	 */
	required: (value: unknown): boolean => {
		return value !== null && value !== undefined && value !== "";
	},

	/**
	 * Minimum length validation
	 */
	minLength: (value: string, min: number): boolean => {
		return typeof value === "string" && value.length >= min;
	},

	/**
	 * Maximum length validation
	 */
	maxLength: (value: string, max: number): boolean => {
		return typeof value === "string" && value.length <= max;
	},

	/**
	 * URL validation
	 */
	url: (value: string): boolean => {
		try {
			new URL(value);
			return true;
		} catch {
			return false;
		}
	},

	/**
	 * File type validation
	 */
	fileType: (file: File, allowedTypes: string[]): boolean => {
		return allowedTypes.includes(file.type);
	},

	/**
	 * File size validation (in bytes)
	 */
	fileSize: (file: File, maxSize: number): boolean => {
		return file.size <= maxSize;
	},

	/**
	 * Pattern validation (regex)
	 */
	pattern: (value: string, pattern: RegExp): boolean => {
		return pattern.test(value);
	},

	/**
	 * Number validation
	 */
	number: (value: unknown): boolean => {
		return !Number.isNaN(Number(value)) && Number.isFinite(Number(value));
	},

	/**
	 * Integer validation
	 */
	integer: (value: unknown): boolean => {
		return Number.isInteger(Number(value));
	},

	/**
	 * Range validation for numbers
	 */
	range: (value: number, min: number, max: number): boolean => {
		return value >= min && value <= max;
	},

	/**
	 * Japanese text validation (contains hiragana, katakana, or kanji)
	 */
	japanese: (value: string): boolean => {
		const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
		return japaneseRegex.test(value);
	},

	/**
	 * Phone number validation (basic)
	 */
	phone: (value: string): boolean => {
		const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
		return phoneRegex.test(value.replace(/[\s\-()]/g, ""));
	},

	/**
	 * Date validation (ISO 8601 format)
	 */
	date: (value: string): boolean => {
		const date = new Date(value);
		return date instanceof Date && !Number.isNaN(date.getTime());
	},

	/**
	 * Color hex validation
	 */
	hexColor: (value: string): boolean => {
		const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		return hexRegex.test(value);
	},

	/**
	 * Slug validation (URL-friendly string)
	 */
	slug: (value: string): boolean => {
		const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
		return slugRegex.test(value);
	},
};

// Form validation utilities
export const formValidation = {
	/**
	 * Validate a single field
	 */
	validateField: (
		value: unknown,
		rules: Array<{
			type: keyof typeof validators | "custom";
			value?: unknown;
			message: string;
			customValidator?: (value: unknown) => boolean;
		}>,
	): FieldValidationResult => {
		for (const rule of rules) {
			let isValid = false;

			switch (rule.type) {
				case "required":
					isValid = validators.required(value);
					break;
				case "email":
					isValid = validators.email(value as string);
					break;
				case "minLength":
					isValid = validators.minLength(value as string, rule.value as number);
					break;
				case "maxLength":
					isValid = validators.maxLength(value as string, rule.value as number);
					break;
				case "url":
					isValid = validators.url(value as string);
					break;
				case "pattern":
					isValid = validators.pattern(value as string, rule.value as RegExp);
					break;
				case "number":
					isValid = validators.number(value);
					break;
				case "integer":
					isValid = validators.integer(value);
					break;
				case "range":
					isValid = validators.range(
						value as number,
						(rule.value as { min: number; max: number }).min,
						(rule.value as { min: number; max: number }).max,
					);
					break;
				case "japanese":
					isValid = validators.japanese(value as string);
					break;
				case "phone":
					isValid = validators.phone(value as string);
					break;
				case "date":
					isValid = validators.date(value as string);
					break;
				case "hexColor":
					isValid = validators.hexColor(value as string);
					break;
				case "slug":
					isValid = validators.slug(value as string);
					break;
				case "custom":
					isValid = rule.customValidator ? rule.customValidator(value) : true;
					break;
				default:
					isValid = true;
			}

			if (!isValid) {
				return {
					isValid: false,
					error: rule.message,
				};
			}
		}

		return { isValid: true };
	},

	/**
	 * Validate entire form
	 */
	validateForm: (
		data: Record<string, unknown>,
		schema: Record<
			string,
			Array<{
				type: keyof typeof validators | "custom";
				value?: unknown;
				message: string;
				customValidator?: (value: unknown) => boolean;
			}>
		>,
	): ValidationResult => {
		const errors: string[] = [];

		for (const [fieldName, rules] of Object.entries(schema)) {
			const fieldValue = data[fieldName];
			const fieldResult = formValidation.validateField(fieldValue, rules);

			if (!fieldResult.isValid && fieldResult.error) {
				errors.push(`${fieldName}: ${fieldResult.error}`);
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	},
};

// Content validation utilities
export const contentValidation = {
	/**
	 * Validate ContentItem structure
	 */
	validateContentItem: (item: unknown): ValidationResult => {
		const errors: string[] = [];

		if (!item || typeof item !== "object") {
			errors.push("Item must be an object");
			return { isValid: false, errors };
		}

		const contentItem = item as Record<string, unknown>;

		// Required fields
		if (!validators.required(contentItem.id)) {
			errors.push("ID is required");
		}

		if (!validators.required(contentItem.type)) {
			errors.push("Type is required");
		}

		if (!validators.required(contentItem.title)) {
			errors.push("Title is required");
		}

		if (!validators.required(contentItem.description)) {
			errors.push("Description is required");
		}

		if (!validators.required(contentItem.category)) {
			errors.push("Category is required");
		}

		if (!Array.isArray(contentItem.tags)) {
			errors.push("Tags must be an array");
		}

		// Status validation
		const validStatuses = ["published", "draft", "archived", "scheduled"];
		if (!validStatuses.includes(contentItem.status as string)) {
			errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
		}

		// Priority validation
		if (
			!validators.number(contentItem.priority) ||
			!validators.range(contentItem.priority as number, 0, 100)
		) {
			errors.push("Priority must be a number between 0 and 100");
		}

		// Date validation
		if (!validators.date(contentItem.createdAt as string)) {
			errors.push("CreatedAt must be a valid ISO 8601 date");
		}

		if (
			contentItem.updatedAt &&
			!validators.date(contentItem.updatedAt as string)
		) {
			errors.push("UpdatedAt must be a valid ISO 8601 date");
		}

		if (
			contentItem.publishedAt &&
			!validators.date(contentItem.publishedAt as string)
		) {
			errors.push("PublishedAt must be a valid ISO 8601 date");
		}

		// URL validations
		if (
			contentItem.thumbnail &&
			!validators.url(contentItem.thumbnail as string)
		) {
			errors.push("Thumbnail must be a valid URL");
		}

		if (contentItem.images && Array.isArray(contentItem.images)) {
			(contentItem.images as string[]).forEach(
				(image: string, index: number) => {
					if (!validators.url(image)) {
						errors.push(`Image at index ${index} must be a valid URL`);
					}
				},
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	},

	/**
	 * Validate file upload
	 */
	validateFileUpload: (
		file: File,
		options: {
			allowedTypes?: string[];
			maxSize?: number; // in bytes
			minSize?: number; // in bytes
		} = {},
	): ValidationResult => {
		const errors: string[] = [];
		const {
			allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
			maxSize = 10 * 1024 * 1024, // 10MB default
			minSize = 0,
		} = options;

		if (!validators.fileType(file, allowedTypes)) {
			errors.push(
				`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
			);
		}

		if (!validators.fileSize(file, maxSize)) {
			errors.push(
				`File size ${file.size} bytes exceeds maximum ${maxSize} bytes`,
			);
		}

		if (file.size < minSize) {
			errors.push(
				`File size ${file.size} bytes is below minimum ${minSize} bytes`,
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	},
};

// Contact form validation (with Japanese spam protection)
export const contactFormValidation = {
	/**
	 * Validate contact form with Japanese spam protection
	 */
	validateContactForm: (data: {
		name: string;
		email: string;
		subject: string;
		message: string;
		type?: "technical" | "design";
		recaptchaToken?: string;
	}): ValidationResult => {
		const errors: string[] = [];

		// Basic validation
		if (!validators.required(data.name)) {
			errors.push("Name is required");
		} else if (!validators.minLength(data.name, 2)) {
			errors.push("Name must be at least 2 characters");
		} else if (!validators.maxLength(data.name, 100)) {
			errors.push("Name must be less than 100 characters");
		}

		if (!validators.required(data.email)) {
			errors.push("Email is required");
		} else if (!validators.email(data.email)) {
			errors.push("Email must be valid");
		}

		if (!validators.required(data.subject)) {
			errors.push("Subject is required");
		} else if (!validators.minLength(data.subject, 5)) {
			errors.push("Subject must be at least 5 characters");
		} else if (!validators.maxLength(data.subject, 200)) {
			errors.push("Subject must be less than 200 characters");
		}

		if (!validators.required(data.message)) {
			errors.push("Message is required");
		} else if (!validators.minLength(data.message, 10)) {
			errors.push("Message must be at least 10 characters");
		} else if (!validators.maxLength(data.message, 5000)) {
			errors.push("Message must be less than 5000 characters");
		}

		// Type validation
		if (data.type && !["technical", "design"].includes(data.type)) {
			errors.push("Type must be either 'technical' or 'design'");
		}

		// Japanese spam protection
		const spamIndicators = [
			// Common spam patterns
			/viagra|cialis|pharmacy|casino|poker|loan|mortgage/i,
			// Excessive links
			/(https?:\/\/[^\s]+.*){3,}/i,
			// Excessive repetition
			/(.)\1{10,}/i,
			// All caps (more than 50% of message)
			/^[A-Z\s]{20,}$/,
		];

		const fullText = `${data.name} ${data.subject} ${data.message}`;
		for (const pattern of spamIndicators) {
			if (pattern.test(fullText)) {
				errors.push("Message appears to be spam");
				break;
			}
		}

		// reCAPTCHA validation (token presence check)
		if (!data.recaptchaToken) {
			errors.push("reCAPTCHA verification is required");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	},
};

// Sanitization utilities
export const sanitization = {
	/**
	 * Sanitize HTML content
	 */
	sanitizeHtml: (html: string): string => {
		// Basic HTML sanitization (in production, use DOMPurify)
		return html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
			.replace(/javascript:/gi, "")
			.replace(/on\w+\s*=/gi, "");
	},

	/**
	 * Sanitize text input
	 */
	sanitizeText: (text: string): string => {
		return text
			.trim()
			.replace(/[<>]/g, "")
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#x27;");
	},

	/**
	 * Sanitize filename
	 */
	sanitizeFilename: (filename: string): string => {
		return filename
			.replace(/[^a-zA-Z0-9.-]/g, "_")
			.replace(/_{2,}/g, "_")
			.replace(/^_|_$/g, "");
	},

	/**
	 * Sanitize URL
	 */
	sanitizeUrl: (url: string): string => {
		try {
			const parsedUrl = new URL(url);
			// Only allow http and https protocols
			if (!["http:", "https:"].includes(parsedUrl.protocol)) {
				return "";
			}
			return parsedUrl.toString();
		} catch {
			return "";
		}
	},
};
