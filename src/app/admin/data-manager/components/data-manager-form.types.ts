import type {
	EnhancedCategoryType,
	EnhancedContentItem,
	EnhancedFileUploadOptions,
} from "@/types";
import type { ContentItem } from "@/types/content";

export type ActiveTab = "basic" | "media" | "links" | "download" | "seo" | "dates";
export type FormData = ContentItem | EnhancedContentItem;
export type InputChangeHandler = (field: keyof FormData, value: unknown) => void;
export type EnhancedInputChangeHandler = (
	field: keyof EnhancedContentItem,
	value: unknown,
) => void;

export interface FieldGroupsProps {
	activeTab: ActiveTab;
	formData: FormData;
	enhanced: boolean;
	inputStyle: string;
	labelStyle: string;
	uploadOptions: EnhancedFileUploadOptions;
	markdownFilePath: string | undefined;
	markdownContent: string;
	needsMarkdownMigration: boolean;
	isLoadingMarkdown: boolean;
	markdownLoadError: string | null;
	useManualDate: boolean;
	setUploadOptions: (options: EnhancedFileUploadOptions) => void;
	setNeedsMarkdownMigration: (value: boolean) => void;
	handleInputChange: InputChangeHandler;
	handleEnhancedInputChange: EnhancedInputChangeHandler;
	handleCategoriesChange: (categories: EnhancedCategoryType[]) => void;
	handleTagsChange: (tags: string[]) => void;
	handleMarkdownContentChange: (content: string) => void;
	handleMarkdownSave: (content: string, filePath: string) => Promise<void>;
	migrateContentToMarkdown: () => Promise<void>;
	handleDateChange: (date: string) => void;
	handleToggleManualDate: (use: boolean) => void;
}
