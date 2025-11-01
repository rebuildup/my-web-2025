/**
 * Form Configuration Types
 * Based on documents/01_global.md specifications
 */

export interface FormConfig {
	id: string;
	name: string;
	description?: string;
	fields: FormField[];
	validation: ValidationRule[];
	submitConfig: SubmitConfig;
	successMessage?: string;
	errorMessage?: string;
}

export interface FormField {
	id: string;
	type: FormFieldType;
	label: string;
	placeholder?: string;
	required: boolean;
	validation?: FieldValidation[];
	options?: FormFieldOption[];
	defaultValue?: string | number | boolean;
}

export type FormFieldType =
	| "text"
	| "email"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio"
	| "file"
	| "calculator";

export interface FormFieldOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface FieldValidation {
	type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "custom";
	value?: string | number;
	message: string;
}

export interface ValidationRule {
	fieldId: string;
	rules: FieldValidation[];
}

export interface SubmitConfig {
	method: "POST";
	action: string;
	headers?: Record<string, string>;
	body?: Record<string, unknown>;
}
