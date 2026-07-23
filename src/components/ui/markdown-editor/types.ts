// Types for media data and embed resolution

export interface MediaData {
	images: string[];
	videos: Array<{
		type: string;
		url: string;
		title: string;
		description?: string;
		thumbnail?: string;
	}>;
	externalLinks: Array<{
		type: string;
		url: string;
		title: string;
		description?: string;
	}>;
}

export interface EmbedValidationError {
	line: number;
	column: number;
	type: "INVALID_INDEX" | "MISSING_MEDIA" | "MALFORMED_SYNTAX";
	message: string;
	suggestion?: string;
}

export interface EnhancedMarkdownEditorProps {
	content: string;
	filePath?: string;
	onChange: (content: string) => void;
	onSave?: (content: string, filePath: string) => Promise<void>;
	preview?: boolean;
	toolbar?: boolean;
	mediaData?: MediaData;
	embedSupport?: boolean;
}

export type SaveStatus = "idle" | "saving" | "success" | "error";
