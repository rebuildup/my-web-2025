"use client";

import type { EnhancedContentItem } from "@/types";
import type { ContentItem } from "@/types/content";
import { ActionPanel } from "./ActionPanel";
import { FieldGroups } from "./FieldGroups";
import { FormHeader } from "./FormHeader";
import { useDataManagerForm } from "./useDataManagerForm";

interface DataManagerFormProps {
	item: ContentItem | EnhancedContentItem;
	onSave: (item: ContentItem | EnhancedContentItem) => void;
	onCancel: () => void;
	isLoading: boolean;
	saveStatus?: "idle" | "saving" | "success" | "error";
	enhanced?: boolean;
}

const inputStyle = "w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
const labelStyle = "block noto-sans-jp-regular text-sm font-medium mb-1";
const buttonStyle = " px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";
const activeTabStyle = " px-4 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
const tabStyle = " px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";

export function DataManagerForm({ item, onSave, onCancel, isLoading, saveStatus = "idle", enhanced = false }: DataManagerFormProps) {
	const form = useDataManagerForm(item, enhanced, onSave);
	return (
		<form onSubmit={form.handleSubmit} className="space-y-6">
			<FormHeader activeTab={form.activeTab} setActiveTab={form.setActiveTab} formData={form.formData} enhanced={enhanced} activeTabStyle={activeTabStyle} tabStyle={tabStyle} />
			<FieldGroups
				activeTab={form.activeTab} formData={form.formData} enhanced={enhanced} inputStyle={inputStyle} labelStyle={labelStyle}
				uploadOptions={form.uploadOptions} markdownFilePath={form.markdownFilePath} markdownContent={form.markdownContent}
				needsMarkdownMigration={form.needsMarkdownMigration} isLoadingMarkdown={form.isLoadingMarkdown} markdownLoadError={form.markdownLoadError}
				useManualDate={form.useManualDate} setUploadOptions={form.setUploadOptions} setNeedsMarkdownMigration={form.setNeedsMarkdownMigration}
				handleInputChange={form.handleInputChange} handleEnhancedInputChange={form.handleEnhancedInputChange}
				handleCategoriesChange={form.handleCategoriesChange} handleTagsChange={form.handleTagsChange}
				handleMarkdownContentChange={form.handleMarkdownContentChange} handleMarkdownSave={form.handleMarkdownSave}
				migrateContentToMarkdown={form.migrateContentToMarkdown} handleDateChange={form.handleDateChange} handleToggleManualDate={form.handleToggleManualDate}
			/>
			<ActionPanel onCancel={onCancel} isLoading={isLoading} isClient={form.isClient} saveStatus={saveStatus} buttonStyle={buttonStyle} />
		</form>
	);
}
