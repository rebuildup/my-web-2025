"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validateEmbedSyntax } from "./markdown-editor/embed-validator";
import { resolveEmbedReferences } from "./markdown-editor/embed-resolver";
import { MarkdownEditorPreview } from "./markdown-editor/MarkdownEditorPreview";
import { MarkdownEditorStatusBar } from "./markdown-editor/MarkdownEditorStatusBar";
import { MarkdownEditorTextArea } from "./markdown-editor/MarkdownEditorTextArea";
import { MarkdownEditorToolbar } from "./markdown-editor/MarkdownEditorToolbar";
import { renderMarkdownPreview } from "./markdown-editor/markdown-preview";
import type {
	EmbedValidationError,
	EnhancedMarkdownEditorProps,
	SaveStatus,
} from "./markdown-editor/types";
import { ValidationErrorsPanel } from "./markdown-editor/ValidationErrorsPanel";

// Re-export types so existing imports of `MarkdownEditor` types continue to work.
export type {
	EmbedValidationError,
	EnhancedMarkdownEditorProps,
	MediaData,
	SaveStatus,
} from "./markdown-editor/types";

/**
 * Enhanced MarkdownEditor Component
 * A comprehensive markdown editor with embed syntax support, real-time preview,
 * toolbar with embed helpers, and syntax validation
 */
export function MarkdownEditor({
	content,
	filePath,
	onChange,
	onSave,
	preview = true,
	toolbar = true,
	mediaData,
	embedSupport = true,
}: EnhancedMarkdownEditorProps) {
	const [editorContent, setEditorContent] = useState(content);
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<
		EmbedValidationError[]
	>([]);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Update editor content when prop changes
	useEffect(() => {
		console.log(
			"MarkdownEditor: content prop changed:",
			content?.length || 0,
			"characters",
		);
		console.log(
			"MarkdownEditor: content preview:",
			content?.substring(0, 100) || "empty",
		);
		setEditorContent(content);
	}, [content]);

	// Handle content change
	const handleContentChange = useCallback(
		(newContent: string) => {
			setEditorContent(newContent);
			onChange(newContent);
			setError(null);

			// Validate embed syntax if enabled
			if (embedSupport) {
				setValidationErrors(
					validateEmbedSyntax(newContent, embedSupport, mediaData),
				);
			}
		},
		[onChange, embedSupport, mediaData],
	);

	// Handle save operation
	const handleSave = useCallback(async () => {
		if (!filePath || !onSave) return;

		setIsSaving(true);
		setSaveStatus("saving");
		setError(null);

		try {
			await onSave(editorContent, filePath);
			setSaveStatus("success");
			setTimeout(() => setSaveStatus("idle"), 2000);
			setIsSaving(false);
		} catch (err) {
			let errorMessage = "Failed to save file";
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			setError(errorMessage);
			setSaveStatus("error");
			setTimeout(() => setSaveStatus("idle"), 3000);
			setIsSaving(false);
		}
	}, [editorContent, filePath, onSave]);

	// Handle keyboard shortcuts - simplified to only save
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key) {
					case "s":
						e.preventDefault();
						handleSave();
						break;
				}
			}
		},
		[handleSave],
	);

	// Resolve embed references for preview
	const resolvedContent = resolveEmbedReferences(
		editorContent,
		embedSupport,
		mediaData,
	);
	const previewHtml = renderMarkdownPreview(resolvedContent);

	return (
		<div className=" rounded-lg overflow-hidden ">
			<MarkdownEditorToolbar
				preview={preview}
				toolbar={toolbar}
				isPreviewMode={isPreviewMode}
				isSaving={isSaving}
				saveStatus={saveStatus}
				canSave={typeof onSave === "function" && Boolean(filePath)}
				onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
				onSave={handleSave}
			/>

			{embedSupport && <ValidationErrorsPanel errors={validationErrors} />}

			{/* Editor/Preview Area */}
			<div className="relative">
				{isPreviewMode && preview ? (
					<MarkdownEditorPreview html={previewHtml} />
				) : (
					<MarkdownEditorTextArea
						textareaRef={textareaRef}
						value={editorContent}
						onChange={handleContentChange}
						onKeyDown={handleKeyDown}
					/>
				)}
			</div>

			<MarkdownEditorStatusBar
				content={editorContent}
				validationErrorCount={validationErrors.length}
				embedSupport={embedSupport}
				error={error}
				filePath={filePath}
			/>
		</div>
	);
}
