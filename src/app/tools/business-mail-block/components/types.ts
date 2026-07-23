// Types for mail blocks

export interface MailBlock {
	id: string;
	category: "greeting" | "body" | "closing" | "signature";
	title: string;
	content: string;
	variables?: string[];
	isFavorite?: boolean;
	usageCount?: number;
	isCustom?: boolean;
	tags?: string[];
	formality?: "formal" | "casual" | "neutral";
}

export interface ComposedBlock extends MailBlock {
	customContent?: string;
	variableValues?: Record<string, string>;
}

export interface MailTemplate {
	id: string;
	name: string;
	description: string;
	blocks: ComposedBlock[];
	variables: Record<string, string>;
	category: "business" | "inquiry" | "follow-up" | "apology" | "custom";
	isBuiltIn: boolean;
	createdAt: string;
	lastUsed?: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	suggestions: string[];
}
