export interface ExpressionParameter {
	name: string;
	type: "number" | "select" | "boolean" | "string";
	defaultValue: string | number | boolean;
	min?: number;
	max?: number;
	step?: number;
	options?: string[];
	description: string;
	unit?: string;
}

export interface AEExpression {
	id: string;
	category: "animation" | "effect" | "transform" | "utility";
	name: string;
	description: string;
	template: string;
	parameters: ExpressionParameter[];
	example: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	isFavorite?: boolean;
	usageCount?: number;
	documentation?: string;
	tags?: string[];
	version?: string;
	author?: string;
	lastUpdated?: string;
	relatedExpressions?: string[];
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

export interface SavedExpression {
	id: string;
	name: string;
	code: string;
	parameters: Record<string, string | number | boolean>;
	createdAt: string;
	lastModified: string;
}

export type ExportFormat = "jsx" | "txt" | "json";
export type ParameterValue = string | number | boolean;
