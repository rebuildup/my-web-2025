"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { MultiCategorySelector } from "@/components/ui/MultiCategorySelector";
import { Select } from "@/components/ui/Select";
import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { useEnhancedDataManager } from "@/hooks/useEnhancedDataManager";
import {
	useBatchUpdates,
	useLazyLoad,
	usePerformanceMonitor,
} from "@/hooks/usePerformanceOptimization";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";
import type { EnhancedCategoryType, EnhancedContentItem } from "@/types";
import type { ContentItem } from "@/types/content";

interface EnhancedDataManagerProps {
	item?: ContentItem | EnhancedContentItem;
	onSave: (item: EnhancedContentItem) => Promise<void>;
	onCancel: () => void;
	mode: "create" | "edit";
	isLoading?: boolean;
	saveStatus?: "idle" | "saving" | "success" | "error";
	enableAutoSave?: boolean;
	autoSaveInterval?: number;
}

interface TabConfig {
	id: string;
	label: string;
	icon: string;
	description: string;
	visible: boolean;
}

export const EnhancedDataManager = memo(function EnhancedDataManager({
	item,
	onSave,
	onCancel,
	mode,
	isLoading = false,
	saveStatus = "idle",
	enableAutoSave = true,
	autoSaveInterval = 30000,
}: EnhancedDataManagerProps) {
	// Performance monitoring
	const { startRenderTiming, endRenderTiming } = usePerformanceMonitor(
		"EnhancedDataManager",
	);

	// Start render timing
	startRenderTiming();

	// Enhanced state management with auto-save
	const {
		formData,
		validationErrors,
		hasUnsavedChanges,
		// isDirty,
		isAutoSaving,
		lastSaved,
		// changeHistory,
		canUndo,
		canRedo,
		updateField,
		validateForm,
		undo,
		redo,
		resetChanges,
		markSaved,
		// addHistoryEntry,
	} = useEnhancedDataManager(
		item,
		mode,
		autoSaveInterval,
		enableAutoSave ? onSave : undefined,
	);

	// Performance optimization hooks (commented out for now)
	// const debouncedTitle = useDebounce(formData.title, 300);
	// const debouncedDescription = useDebounce(formData.description, 300);

	// Batch updates for form fields
	const [, setBatchedFormData] = useBatchUpdates(formData, 16);

	// Tab management
	const [activeTab, setActiveTab] = useState<string>("basic");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Enhanced features state (commented out for now)
	// const [uploadOptions, setUploadOptions] = useState<EnhancedFileUploadOptions>(
	//   {
	//     skipProcessing: false,
	//     preserveOriginal: true,
	//     generateVariants: false,
	//     customProcessing: {
	//       resize: { width: 1920, height: 1080 },
	//       format: "jpeg",
	//       watermark: false,
	//     },
	//   }
	// );

	// Tab configuration
	const tabs: TabConfig[] = useMemo(
		() => [
			{
				id: "basic",
				label: "Basic Info",
				icon: "📝",
				description: "Title, description, categories, and tags",
				visible: true,
			},
			{
				id: "content",
				label: "Content",
				icon: "📄",
				description: "Markdown content and rich text editing",
				visible: true,
			},
			{
				id: "media",
				label: "Media",
				icon: "🖼️",
				description: "Images, videos, and file uploads",
				visible: true,
			},
			{
				id: "links",
				label: "Links",
				icon: "🔗",
				description: "External links and references",
				visible: true,
			},
			{
				id: "dates",
				label: "Dates",
				icon: "📅",
				description: "Date management and scheduling",
				visible: true,
			},
			{
				id: "download",
				label: "Download",
				icon: "⬇️",
				description: "Download information and files",
				visible: formData.type === "download",
			},
			{
				id: "seo",
				label: "SEO",
				icon: "🔍",
				description: "Search engine optimization settings",
				visible: true,
			},
			{
				id: "advanced",
				label: "Advanced",
				icon: "⚙️",
				description: "Advanced settings and metadata",
				visible: true,
			},
		],
		[formData.type],
	);

	// Memoized visible tabs for performance
	const visibleTabs = useMemo(() => tabs.filter((tab) => tab.visible), [tabs]);

	// Lazy loading for heavy tabs
	const { elementRef: mediaTabRef, isVisible: isMediaTabVisible } = useLazyLoad(
		{
			threshold: 0.1,
			triggerOnce: false,
		},
	);

	const { elementRef: contentTabRef, isVisible: isContentTabVisible } =
		useLazyLoad({
			threshold: 0.1,
			triggerOnce: false,
		});

	// Save handler
	const handleSave = useCallback(async () => {
		if (!validateForm()) {
			return;
		}

		try {
			await onSave(formData);
			markSaved();
		} catch (error) {
			console.error("Failed to save item:", error);
		}
	}, [validateForm, onSave, formData, markSaved]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey) {
				switch (event.key) {
					case "z":
						if (event.shiftKey) {
							event.preventDefault();
							redo();
						} else {
							event.preventDefault();
							undo();
						}
						break;
					case "y":
						event.preventDefault();
						redo();
						break;
					case "s":
						event.preventDefault();
						handleSave();
						break;
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [undo, redo, handleSave]);

	// Throttled field update handler for performance
	const throttledUpdateField = useCallback(
		<K extends keyof EnhancedContentItem>(
			field: K,
			value: EnhancedContentItem[K],
		) => {
			// Simple throttling implementation
			const now = Date.now();
			const key = `${String(field)}_throttle`;
			const lastCall = (window as unknown as Record<string, number>)[key] || 0;

			if (now - lastCall >= 100) {
				(window as unknown as Record<string, number>)[key] = now;
				updateField(field, value);
			}
		},
		[updateField],
	);

	// Form field update handler with history tracking and performance optimization
	const handleFieldChange = useCallback(
		<K extends keyof EnhancedContentItem>(
			field: K,
			value: EnhancedContentItem[K],
		) => {
			// Use throttled updates for frequently changing fields
			if (field === "title" || field === "description" || field === "content") {
				throttledUpdateField(field, value);
			} else {
				updateField(field, value);
			}

			// Update batched form data for immediate UI feedback
			setBatchedFormData((prev) => ({ ...prev, [field]: value }));
		},
		[updateField, throttledUpdateField, setBatchedFormData],
	);

	// Category change with impact analysis
	const handleCategoriesChange = (categories: EnhancedCategoryType[]) => {
		const oldCategories = formData.categories || [];

		// Analyze impact if there are significant changes
		if (
			oldCategories.length > 0 &&
			JSON.stringify(oldCategories.sort()) !== JSON.stringify(categories.sort())
		) {
			// Show impact notification (could be enhanced with a modal)
			console.log("Category change impact:", {
				old: oldCategories,
				new: categories,
				impact: analyzeCategoryChangeImpact(oldCategories, categories),
			});
		}

		handleFieldChange("categories", categories);
		handleFieldChange("isOtherCategory", categories.includes("other"));
	};

	// Category change impact analysis
	const analyzeCategoryChangeImpact = (
		oldCategories: EnhancedCategoryType[],
		newCategories: EnhancedCategoryType[],
	): string[] => {
		const impacts: string[] = [];

		const removedCategories = oldCategories.filter(
			(cat) => !newCategories.includes(cat),
		);
		const addedCategories = newCategories.filter(
			(cat) => !oldCategories.includes(cat),
		);

		if (removedCategories.length > 0) {
			impacts.push(
				`Will be removed from: ${removedCategories
					.map((cat) =>
						cat === "video&design"
							? "Video & Design"
							: cat.charAt(0).toUpperCase() + cat.slice(1),
					)
					.join(", ")} galleries`,
			);
		}

		if (addedCategories.length > 0) {
			impacts.push(
				`Will be added to: ${addedCategories
					.map((cat) =>
						cat === "video&design"
							? "Video & Design"
							: cat.charAt(0).toUpperCase() + cat.slice(1),
					)
					.join(", ")} galleries`,
			);
		}

		const hadOther = oldCategories.includes("other");
		const hasOther = newCategories.includes("other");

		if (!hadOther && hasOther) {
			impacts.push(
				"⚠ Will only appear in 'All' gallery due to 'Other' category",
			);
		} else if (hadOther && !hasOther) {
			impacts.push("✓ Will now appear in specific category galleries");
		}

		if (newCategories.length === 0) {
			impacts.push("⚠ Item will not appear in any category galleries");
		}

		return impacts;
	};

	// Cancel handler with unsaved changes warning
	const handleCancel = () => {
		if (hasUnsavedChanges) {
			const confirmed = window.confirm(
				"You have unsaved changes. Are you sure you want to cancel?",
			);
			if (!confirmed) return;
		}
		onCancel();
	};

	// Render tab content based on active tab
	const renderTabContent = () => {
		switch (activeTab) {
			case "basic":
				return renderBasicTab();
			case "content":
				return isContentTabVisible ? (
					renderContentTab()
				) : (
					<div>Loading content...</div>
				);
			case "media":
				return isMediaTabVisible ? (
					renderMediaTab()
				) : (
					<div>Loading media...</div>
				);
			case "links":
				return renderLinksTab();
			case "dates":
				return renderDatesTab();
			case "download":
				return renderDownloadTab();
			case "seo":
				return renderSeoTab();
			case "advanced":
				return renderAdvancedTab();
			default:
				return renderBasicTab();
		}
	};

	// Basic info tab
	const renderBasicTab = () => (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Title *
					</label>
					<input
						type="text"
						value={formData.title}
						onChange={(e) => handleFieldChange("title", e.target.value)}
						className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
							validationErrors.title ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Enter item title"
					/>
					{validationErrors.title && (
						<p className="text-red-500 text-sm mt-1">
							{validationErrors.title}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type
					</label>
					<Select
						value={formData.type}
						onChange={(value) =>
							handleFieldChange("type", value as "portfolio" | "download")
						}
						options={[
							{ value: "portfolio", label: "Portfolio" },
							{ value: "download", label: "Download" },
						]}
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Description *
				</label>
				<textarea
					value={formData.description}
					onChange={(e) => handleFieldChange("description", e.target.value)}
					rows={3}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						validationErrors.description ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="Enter item description"
				/>
				{validationErrors.description && (
					<p className="text-red-500 text-sm mt-1">
						{validationErrors.description}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Categories *
				</label>
				<MultiCategorySelector
					selectedCategories={formData.categories}
					onChange={handleCategoriesChange}
					availableCategories={[
						"develop",
						"video",
						"design",
						"video&design",
						"other",
					]}
					showOtherOption={true}
				/>
				{validationErrors.categories && (
					<p className="text-red-500 text-sm mt-1">
						{validationErrors.categories}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Tags
				</label>
				<TagManagementUI
					selectedTags={formData.tags}
					onChange={(tags) => handleFieldChange("tags", tags)}
					tagManager={clientTagManager}
					allowNewTags={true}
					maxTags={10}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Status
					</label>
					<Select
						value={formData.status}
						onChange={(value) =>
							handleFieldChange(
								"status",
								value as "draft" | "published" | "archived",
							)
						}
						options={[
							{ value: "draft", label: "Draft" },
							{ value: "published", label: "Published" },
							{ value: "archived", label: "Archived" },
						]}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Priority
					</label>
					<input
						type="number"
						min="0"
						max="100"
						value={formData.priority}
						onChange={(e) =>
							handleFieldChange("priority", parseInt(e.target.value, 10) || 0)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>
		</div>
	);

	// Content tab
	const renderContentTab = () => (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Content
				</label>
				<MarkdownEditor
					content={formData.content || ""}
					onChange={(content) => handleFieldChange("content", content)}
					preview={true}
					toolbar={true}
				/>
			</div>
		</div>
	);

	// Media tab
	const renderMediaTab = () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Image Management
				</h3>
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
					<div className="text-center">
						<p className="text-gray-500 mb-4">
							Enhanced file upload functionality will be implemented here
						</p>
						<p className="text-sm text-gray-400">
							Features: Original/Processed separation, Skip processing option,
							Multiple variants
						</p>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Video Management
				</h3>
				<div className="space-y-3">
					{formData.videos?.map((video, index) => {
						const videoKey = video.url ?? video.title ?? `video-${index}`;
						return (
							<div key={videoKey} className="flex items-center space-x-3">
								<input
									type="text"
									value={video.url || ""}
									onChange={(e) => {
										const newVideos = [...(formData.videos || [])];
										newVideos[index] = { ...video, url: e.target.value };
										handleFieldChange("videos", newVideos);
									}}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Video URL"
								/>
								<button
									type="button"
									onClick={() => {
										const newVideos = formData.videos?.filter(
											(_, i) => i !== index,
										);
										handleFieldChange("videos", newVideos || []);
									}}
									className="px-3 py-2 text-red-600 hover:text-red-800"
								>
									Remove
								</button>
							</div>
						);
					})}
					<button
						type="button"
						onClick={() => {
							const newVideos = [
								...(formData.videos || []),
								{ url: "", type: "youtube" as const, title: "" },
							];
							handleFieldChange("videos", newVideos);
						}}
						className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
					>
						Add Video
					</button>
				</div>
			</div>
		</div>
	);

	// Links tab
	const renderLinksTab = () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					External Links
				</h3>
				<div className="space-y-3">
					{formData.externalLinks?.map((link, index) => {
						const linkKey = link.url ?? link.title ?? `link-${index}`;
						return (
							<div
								key={linkKey}
								className="grid grid-cols-1 md:grid-cols-2 gap-3"
							>
								<input
									type="text"
									value={link.title || ""}
									onChange={(e) => {
										const newLinks = [...(formData.externalLinks || [])];
										newLinks[index] = {
											...newLinks[index],
											title: e.target.value,
										};
										handleFieldChange("externalLinks", newLinks);
									}}
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Link title"
								/>
								<div className="flex space-x-2">
									<input
										type="url"
										value={link.url || ""}
										onChange={(e) => {
											const newLinks = [...(formData.externalLinks || [])];
											newLinks[index] = {
												...newLinks[index],
												url: e.target.value,
											};
											handleFieldChange("externalLinks", newLinks);
										}}
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="https://..."
									/>
									<button
										type="button"
										onClick={() => {
											const newLinks = formData.externalLinks?.filter(
												(_, i) => i !== index,
											);
											handleFieldChange("externalLinks", newLinks || []);
										}}
										className="px-3 py-2 text-red-600 hover:text-red-800"
									>
										Remove
									</button>
								</div>
							</div>
						);
					})}
					<button
						type="button"
						onClick={() => {
							const newLinks = [
								...(formData.externalLinks || []),
								{ title: "", url: "", type: "website" as const },
							];
							handleFieldChange("externalLinks", newLinks);
						}}
						className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
					>
						Add Link
					</button>
				</div>
			</div>
		</div>
	);

	// Dates tab
	const renderDatesTab = () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Date Management
				</h3>
				<DatePicker
					value={formData.manualDate}
					onChange={(date) => handleFieldChange("manualDate", date)}
					useManualDate={formData.useManualDate || false}
					onToggleManualDate={(use) => handleFieldChange("useManualDate", use)}
					placeholder="Select date"
				/>
			</div>

			<div className="bg-gray-50 p-4 rounded-lg">
				<h4 className="font-medium text-gray-900 mb-2">Date Information</h4>
				<div className="space-y-2 text-sm text-gray-600">
					<p>
						<strong>Created:</strong>{" "}
						{new Date(formData.createdAt).toLocaleString()}
					</p>
					<p>
						<strong>Updated:</strong>{" "}
						{new Date(
							formData.updatedAt || formData.createdAt,
						).toLocaleString()}
					</p>
					<p>
						<strong>Effective Date:</strong>{" "}
						{formData.useManualDate && formData.manualDate
							? new Date(formData.manualDate).toLocaleString()
							: new Date(formData.createdAt).toLocaleString()}
					</p>
				</div>
			</div>
		</div>
	);

	// Download tab
	const renderDownloadTab = () => (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Download URL *
				</label>
				<input
					type="url"
					value={formData.downloadUrl || ""}
					onChange={(e) => handleFieldChange("downloadUrl", e.target.value)}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						validationErrors.downloadUrl ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="https://..."
				/>
				{validationErrors.downloadUrl && (
					<p className="text-red-500 text-sm mt-1">
						{validationErrors.downloadUrl}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					File Size
				</label>
				<input
					type="text"
					value={formData.fileSize || ""}
					onChange={(e) => handleFieldChange("fileSize", e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g., 2.5 MB"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					File Format
				</label>
				<input
					type="text"
					value={formData.fileFormat || ""}
					onChange={(e) => handleFieldChange("fileFormat", e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g., PDF, ZIP, etc."
				/>
			</div>
		</div>
	);

	// SEO tab
	const renderSeoTab = () => (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					SEO Title
				</label>
				<input
					type="text"
					value={formData.seoTitle || ""}
					onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="SEO optimized title"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					SEO Description
				</label>
				<textarea
					value={formData.seoDescription || ""}
					onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
					rows={3}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="SEO meta description"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					SEO Keywords
				</label>
				<input
					type="text"
					value={formData.seoKeywords || ""}
					onChange={(e) => handleFieldChange("seoKeywords", e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="keyword1, keyword2, keyword3"
				/>
			</div>
		</div>
	);

	// Advanced tab
	const renderAdvancedTab = () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Advanced Settings
				</h3>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Custom ID
						</label>
						<input
							type="text"
							value={formData.id}
							onChange={(e) => handleFieldChange("id", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Custom identifier"
							disabled={mode === "edit"}
						/>
						{mode === "edit" && (
							<p className="text-sm text-gray-500 mt-1">
								ID cannot be changed after creation
							</p>
						)}
					</div>

					<div>
						<label className="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={formData.isOtherCategory || false}
								onChange={(e) =>
									handleFieldChange("isOtherCategory", e.target.checked)
								}
								className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span className="text-sm font-medium text-gray-700">
								Other Category Item
							</span>
						</label>
						<p className="text-sm text-gray-500 mt-1">
							Items marked as &quot;Other&quot; will only appear in the All
							gallery
						</p>
					</div>
				</div>
			</div>

			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<h4 className="font-medium text-yellow-800 mb-2">
					⚠ Advanced Features
				</h4>
				<p className="text-sm text-yellow-700">
					These settings affect how the item appears across the portfolio.
					Changes may impact SEO and user experience.
				</p>
			</div>
		</div>
	);

	return (
		<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
			{/* Header */}
			<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							{mode === "create" ? "Create New Item" : "Edit Item"}
						</h2>
						<p className="text-sm text-gray-600 mt-1">
							{mode === "create"
								? "Add a new item to your portfolio"
								: `Editing: ${formData.title || "Untitled"}`}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						{/* History Controls */}
						<div className="flex items-center space-x-1 mr-4">
							<button
								type="button"
								onClick={undo}
								disabled={!canUndo}
								className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								title="Undo (Ctrl+Z)"
							>
								↶
							</button>
							<button
								type="button"
								onClick={redo}
								disabled={!canRedo}
								className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								title="Redo (Ctrl+Y)"
							>
								↷
							</button>
							<button
								type="button"
								onClick={resetChanges}
								disabled={!hasUnsavedChanges}
								className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
								title="Reset all changes"
							>
								⟲
							</button>
						</div>

						{/* Status Indicators */}
						{isAutoSaving && (
							<span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center">
								<span className="animate-spin mr-1">⟳</span>
								Auto-saving...
							</span>
						)}
						{hasUnsavedChanges && !isAutoSaving && (
							<span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
								Unsaved changes
							</span>
						)}
						{saveStatus === "saving" && (
							<span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
								Saving...
							</span>
						)}
						{saveStatus === "success" && (
							<span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
								Saved
							</span>
						)}
						{saveStatus === "error" && (
							<span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
								Save failed
							</span>
						)}
						{lastSaved && !hasUnsavedChanges && (
							<span className="text-xs text-gray-500">
								Last saved: {lastSaved.toLocaleTimeString()}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Mobile tab menu toggle */}
			<div className="md:hidden bg-white border-b border-gray-200 px-6 py-3">
				<button
					type="button"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="flex items-center justify-between w-full text-left"
				>
					<span className="font-medium text-gray-900">
						{visibleTabs.find((tab) => tab.id === activeTab)?.label}
					</span>
					<span className="text-gray-500">{isMobileMenuOpen ? "▲" : "▼"}</span>
				</button>
			</div>

			<div className="flex flex-col md:flex-row">
				{/* Tab Navigation */}
				<div
					className={`md:w-64 bg-gray-50 border-r border-gray-200 ${
						isMobileMenuOpen ? "block" : "hidden md:block"
					}`}
				>
					<nav className="p-4 space-y-1">
						{visibleTabs.map((tab) => (
							<button
								type="button"
								key={tab.id}
								onClick={() => {
									setActiveTab(tab.id);
									setIsMobileMenuOpen(false);
								}}
								className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									activeTab === tab.id
										? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
								}`}
							>
								<div className="flex items-center space-x-3">
									<span className="text-lg">{tab.icon}</span>
									<div>
										<div className="font-medium">{tab.label}</div>
										<div className="text-xs text-gray-500 mt-1">
											{tab.description}
										</div>
									</div>
								</div>
							</button>
						))}
					</nav>
				</div>

				{/* Tab Content */}
				<div className="flex-1 p-6">
					<div className="max-w-4xl">
						<div
							ref={
								activeTab === "content"
									? (contentTabRef as React.RefObject<HTMLDivElement>)
									: activeTab === "media"
										? (mediaTabRef as React.RefObject<HTMLDivElement>)
										: undefined
							}
						>
							{renderTabContent()}
						</div>
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-500">
						{Object.keys(validationErrors).length > 0 && (
							<span className="text-red-600">
								Please fix {Object.keys(validationErrors).length} validation
								error(s)
							</span>
						)}
					</div>
					<div className="flex items-center space-x-3">
						<button
							type="button"
							onClick={handleCancel}
							disabled={isLoading}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={isLoading || Object.keys(validationErrors).length > 0}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
						>
							{isLoading ? "Saving..." : mode === "create" ? "Create" : "Save"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// End render timing
	endRenderTiming();
});
