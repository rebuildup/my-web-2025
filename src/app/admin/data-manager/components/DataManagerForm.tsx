"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { MultiCategorySelector } from "@/components/ui/MultiCategorySelector";
import { Select } from "@/components/ui/Select";
import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { clientMarkdownService } from "@/lib/markdown/client-service";
import { clientDateManager } from "@/lib/portfolio/client-date-manager";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";
import {
	EnhancedCategoryType,
	EnhancedContentItem,
	EnhancedFileUploadOptions,
	isEnhancedContentItem,
	isValidEnhancedPortfolioCategory,
} from "@/types";
import {
	ContentItem,
	getPortfolioCategoryOptions,
	isValidPortfolioCategory,
} from "@/types/content";
import { useEffect, useState } from "react";
import { DownloadInfoSection } from "./DownloadInfoSection";
import { EnhancedFileUploadSection } from "./EnhancedFileUploadSection";
import { ExternalLinksSection } from "./ExternalLinksSection";
import { FileUploadSection } from "./FileUploadSection";
import { MediaEmbedSection } from "./MediaEmbedSection";
import { SEOSection } from "./SEOSection";

interface DataManagerFormProps {
	item: ContentItem | EnhancedContentItem;
	onSave: (item: ContentItem | EnhancedContentItem) => void;
	onCancel: () => void;
	isLoading: boolean;
	saveStatus?: "idle" | "saving" | "success" | "error";
	enhanced?: boolean;
}

type ActiveTab = "basic" | "media" | "links" | "download" | "seo" | "dates";
type FormData = ContentItem | EnhancedContentItem;
type InputChangeHandler = (field: keyof FormData, value: unknown) => void;
type EnhancedInputChangeHandler = (
	field: keyof EnhancedContentItem,
	value: unknown,
) => void;

interface FormHeaderProps {
	activeTab: ActiveTab;
	setActiveTab: (tab: ActiveTab) => void;
	formData: FormData;
	enhanced: boolean;
	activeTabStyle: string;
	tabStyle: string;
}

function FormHeader({
	activeTab,
	setActiveTab,
	formData,
	enhanced,
	activeTabStyle,
	tabStyle,
}: FormHeaderProps) {
	const tabClassName = (tab: ActiveTab) =>
		activeTab === tab ? activeTabStyle : tabStyle;

	return (
		<div className="flex flex-wrap gap-2   pb-4">
			<button
				type="button"
				onClick={() => setActiveTab("basic")}
				className={tabClassName("basic")}
			>
				基本情報
			</button>
			<button
				type="button"
				onClick={() => setActiveTab("media")}
				className={tabClassName("media")}
			>
				メディア
			</button>
			<button
				type="button"
				onClick={() => setActiveTab("links")}
				className={tabClassName("links")}
			>
				リンク
			</button>
			{formData.type === "download" && (
				<button
					type="button"
					onClick={() => setActiveTab("download")}
					className={tabClassName("download")}
				>
					ダウンロード
				</button>
			)}
			<button
				type="button"
				onClick={() => setActiveTab("seo")}
				className={tabClassName("seo")}
			>
				SEO設定
			</button>
			{enhanced && (
				<button
					type="button"
					onClick={() => setActiveTab("dates")}
					className={tabClassName("dates")}
				>
					日付管理
				</button>
			)}
		</div>
	);
}

interface TitleDescriptionFieldsProps {
	formData: FormData;
	inputStyle: string;
	labelStyle: string;
	handleInputChange: InputChangeHandler;
}

function TitleDescriptionFields({
	formData,
	inputStyle,
	labelStyle,
	handleInputChange,
}: TitleDescriptionFieldsProps) {
	return (
		<>
			<div>
				<label className={labelStyle}>タイトル *</label>
				<input
					type="text"
					value={formData.title}
					onChange={(e) => handleInputChange("title", e.target.value)}
					className={inputStyle}
					placeholder="コンテンツのタイトルを入力してください"
				/>
			</div>

			<div>
				<label className={labelStyle}>説明</label>
				<textarea
					value={formData.description}
					onChange={(e) => handleInputChange("description", e.target.value)}
					className={`${inputStyle} h-24 resize-vertical`}
					rows={3}
					placeholder="コンテンツの説明を入力してください"
				/>
			</div>
		</>
	);
}

interface CategoryStatusFieldsProps {
	formData: FormData;
	enhanced: boolean;
	inputStyle: string;
	labelStyle: string;
	handleInputChange: InputChangeHandler;
	handleCategoriesChange: (categories: EnhancedCategoryType[]) => void;
}

function CategoryStatusFields({
	formData,
	enhanced,
	inputStyle,
	labelStyle,
	handleInputChange,
	handleCategoriesChange,
}: CategoryStatusFieldsProps) {
	return (
		<div className="space-y-4">
			<div>
				{formData.type === "portfolio" && enhanced ? (
					<MultiCategorySelector
						selectedCategories={
							isEnhancedContentItem(formData)
								? formData.categories || []
								: formData.category
									? [formData.category as EnhancedCategoryType]
									: []
						}
						onChange={handleCategoriesChange}
						availableCategories={["develop", "video", "design"]}
						maxSelections={3}
						showOtherOption={true}
					/>
				) : formData.type === "portfolio" ? (
					<div>
						<label className={labelStyle}>カテゴリ</label>
						<Select
							value={formData.category || ""}
							onChange={(value) => handleInputChange("category", value)}
							options={getPortfolioCategoryOptions()}
							placeholder="カテゴリを選択してください"
							variant="admin"
						/>
					</div>
				) : (
					<div>
						<label className={labelStyle}>カテゴリ</label>
						<input
							type="text"
							value={formData.category}
							onChange={(e) =>
								handleInputChange("category", e.target.value)
							}
							className={inputStyle}
							placeholder="カテゴリを入力してください"
						/>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className={labelStyle}>ステータス</label>
					<Select
						value={formData.status}
						onChange={(value) => handleInputChange("status", value)}
						options={[
							{ value: "draft", label: "下書き" },
							{ value: "published", label: "公開済み" },
							{ value: "archived", label: "アーカイブ" },
							{ value: "scheduled", label: "予約投稿" },
						]}
						variant="admin"
					/>
				</div>
			</div>
		</div>
	);
}

interface GalleryVisibilitySummaryProps {
	formData: FormData;
	enhanced: boolean;
}

function GalleryVisibilitySummary({
	formData,
	enhanced,
}: GalleryVisibilitySummaryProps) {
	if (
		!(
			enhanced &&
			formData.type === "portfolio" &&
			isEnhancedContentItem(formData) &&
			formData.categories &&
			formData.categories.length > 0
		)
	) {
		return null;
	}

	return (
		<div className="  rounded-lg p-4">
			<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
				Gallery Visibility Summary
			</h4>
			<div className="space-y-2 text-sm">
				<div className="flex items-center gap-2">
					<span className="w-2 h-2  rounded-full"></span>
					<span className="font-medium ">Will appear in:</span>
					<span className="">
						{formData.categories.includes("other") ||
						formData.categories.length === 0
							? "All gallery only"
							: `All, ${formData.categories
									.filter((cat) => cat !== "other")
									.map((cat) =>
										cat === "develop"
											? "Development"
											: cat === "video"
												? "Video"
												: cat === "design"
													? "Design"
													: cat.charAt(0).toUpperCase() +
														cat.slice(1),
									)
									.join(", ")} galleries`}
					</span>
				</div>

				{formData.categories.includes("other") &&
					formData.categories.length > 1 && (
						<div className="flex items-center gap-2">
							<span className="w-2 h-2  rounded-full"></span>
							<span className=" text-xs">
								Note: Other category overrides specific categories - item
								will only appear in All gallery
							</span>
						</div>
					)}

				{formData.categories.length > 2 && (
					<div className="flex items-center gap-2">
						<span className="w-2 h-2  rounded-full"></span>
						<span className=" text-xs">
							Multiple categories selected - item may appear in multiple
							galleries
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

interface TagsFieldProps {
	formData: FormData;
	handleTagsChange: (tags: string[]) => void;
}

function TagsField({ formData, handleTagsChange }: TagsFieldProps) {
	return (
		<div>
			<label className="block noto-sans-jp-regular text-sm font-medium mb-1">
				タグ
			</label>
			<div className="space-y-2">
				<TagManagementUI
					selectedTags={formData.tags || []}
					onChange={handleTagsChange}
					tagManager={clientTagManager}
					allowNewTags={true}
					maxTags={15}
					placeholder="既存のタグを検索するか、新しいタグを作成してください..."
					className="mt-1"
				/>
				<div className="flex items-center justify-between text-xs ">
					<span>
						{formData.tags && formData.tags.length > 0
							? `${formData.tags.length}個のタグが選択されています`
							: "タグが選択されていません"}
					</span>
					<span className="">最大15個</span>
				</div>
				<div className="text-xs   p-3 rounded ">
					<div className="flex items-start gap-2">
						<span className=" mt-0.5">💡</span>
						<div>
							<strong>Tag Tips:</strong> Type to search existing tags or
							create new ones. Tags help categorize content and improve
							searchability. Use descriptive terms like &quot;react&quot;,
							&quot;design&quot;, &quot;video&quot;, etc.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

interface PriorityFieldProps {
	formData: FormData;
	inputStyle: string;
	labelStyle: string;
	handleInputChange: InputChangeHandler;
}

function PriorityField({
	formData,
	inputStyle,
	labelStyle,
	handleInputChange,
}: PriorityFieldProps) {
	return (
		<div>
			<label className={labelStyle} htmlFor="priority-input">
				Priority (0-100)
			</label>
			<input
				id="priority-input"
				type="number"
				min="0"
				max="100"
				value={formData.priority}
				onChange={(e) =>
					handleInputChange("priority", parseInt(e.target.value))
				}
				className={inputStyle}
			/>
		</div>
	);
}

interface MarkdownMigrationNoticeProps {
	enhanced: boolean;
	needsMarkdownMigration: boolean;
	migrateContentToMarkdown: () => Promise<void>;
	setNeedsMarkdownMigration: (value: boolean) => void;
}

function MarkdownMigrationNotice({
	enhanced,
	needsMarkdownMigration,
	migrateContentToMarkdown,
	setNeedsMarkdownMigration,
}: MarkdownMigrationNoticeProps) {
	if (!enhanced || !needsMarkdownMigration) {
		return null;
	}

	return (
		<div className="   rounded-lg p-4">
			<div className="flex items-start gap-3">
				<div className="w-6 h-6  rounded-full flex items-center justify-center shrink-0 mt-0.5">
					<span className=" text-sm">📝</span>
				</div>
				<div className="flex-1">
					<h4 className="text-sm font-medium  mb-2">
						Migrate to Markdown File System
					</h4>
					<p className="text-sm  mb-3">
						This content is currently stored as text. Migrate it to a
						markdown file to enable enhanced features like embed syntax
						and better content management.
					</p>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={migrateContentToMarkdown}
							className="px-3 py-1 text-sm"
						>
							Migrate to Markdown File
						</button>
						<button
							type="button"
							onClick={() => setNeedsMarkdownMigration(false)}
							className="px-3 py-1 text-sm"
						>
							Keep as Text
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

interface MarkdownEditorFieldProps {
	formData: FormData;
	enhanced: boolean;
	inputStyle: string;
	markdownFilePath: string | undefined;
	markdownContent: string;
	needsMarkdownMigration: boolean;
	isLoadingMarkdown: boolean;
	markdownLoadError: string | null;
	handleInputChange: InputChangeHandler;
	handleMarkdownContentChange: (content: string) => void;
	handleMarkdownSave: (
		content: string,
		filePath: string,
	) => Promise<void>;
	migrateContentToMarkdown: () => Promise<void>;
}

function MarkdownEditorField({
	formData,
	enhanced,
	inputStyle,
	markdownFilePath,
	markdownContent,
	needsMarkdownMigration,
	isLoadingMarkdown,
	markdownLoadError,
	handleInputChange,
	handleMarkdownContentChange,
	handleMarkdownSave,
	migrateContentToMarkdown,
}: MarkdownEditorFieldProps) {
	return (
		<div>
			<label className="block noto-sans-jp-regular text-sm font-medium mb-1">
				Content (Markdown)
			</label>
			{enhanced ? (
				isLoadingMarkdown ? (
					<div className=" rounded-lg p-8 text-center">
						<div className="flex items-center justify-center gap-2">
							<div className="w-4 h-4  border-t-transparent rounded-full animate-spin"></div>
							<span className="text-sm ">Loading markdown content...</span>
						</div>
					</div>
				) : (
					<div>
						<div className="mb-2 text-xs   p-2   rounded">
							<div>Debug: Content length: {markdownContent.length}</div>
							<div>FilePath: {markdownFilePath || "none"}</div>
							<div>
								Content preview:{" "}
								{markdownContent.substring(0, 100) || "empty"}
							</div>
							<div>Loading: {isLoadingMarkdown ? "true" : "false"}</div>
							<div>Error: {markdownLoadError || "none"}</div>
						</div>
						<MarkdownEditor
							content={markdownContent}
							filePath={markdownFilePath}
							onChange={handleMarkdownContentChange}
							onSave={handleMarkdownSave}
							preview={true}
							toolbar={true}
							embedSupport={true}
							mediaData={{
								images: formData.images || [],
								videos: (formData.videos || []).map((video) => ({
									...video,
									title: video.title || `Video ${video.url}`,
								})),
								externalLinks: formData.externalLinks || [],
							}}
						/>
					</div>
				)
			) : (
				<textarea
					value={formData.content || ""}
					onChange={(e) => handleInputChange("content", e.target.value)}
					className={`${inputStyle} h-96 resize-vertical font-mono`}
					rows={20}
					placeholder="Markdownコンテンツを入力してください..."
				/>
			)}

			{enhanced && (
				<div className="mt-2 space-y-2">
					<div className="text-xs  space-y-1">
						<div className="flex items-center gap-2">
							{markdownLoadError ? (
								<>
									<span className="w-2 h-2  rounded-full"></span>
									<span className="">
										Error loading markdown: {markdownLoadError}
									</span>
								</>
							) : markdownFilePath ? (
								<>
									<span className="w-2 h-2  rounded-full"></span>
									<span>
										Markdown file: {markdownFilePath.split("/").pop()}
									</span>
								</>
							) : (
								<>
									<span className="w-2 h-2  rounded-full"></span>
									<span>
										Content stored as text (consider migrating to markdown
										file)
									</span>
								</>
							)}
						</div>
						<div className="">
							Content length: {markdownContent.length} characters
							{isLoadingMarkdown && " (Loading...)"}
						</div>
					</div>

					{needsMarkdownMigration && (
						<div className="   rounded p-3">
							<div className="flex items-start gap-2">
								<span className=" mt-0.5">💡</span>
								<div className="flex-1">
									<p className="text-sm  mb-2">
										This item has content stored as text. Migrate it to a
										markdown file for better organization and features.
									</p>
									<button
										type="button"
										onClick={migrateContentToMarkdown}
										className="px-3 py-1 text-sm"
									>
										Migrate to Markdown File
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

interface BasicFieldsProps {
	formData: FormData;
	enhanced: boolean;
	inputStyle: string;
	labelStyle: string;
	markdownFilePath: string | undefined;
	markdownContent: string;
	needsMarkdownMigration: boolean;
	isLoadingMarkdown: boolean;
	markdownLoadError: string | null;
	handleInputChange: InputChangeHandler;
	handleCategoriesChange: (categories: EnhancedCategoryType[]) => void;
	handleTagsChange: (tags: string[]) => void;
	handleMarkdownContentChange: (content: string) => void;
	handleMarkdownSave: (
		content: string,
		filePath: string,
	) => Promise<void>;
	migrateContentToMarkdown: () => Promise<void>;
	setNeedsMarkdownMigration: (value: boolean) => void;
}

function BasicFields(props: BasicFieldsProps) {
	const {
		formData,
		enhanced,
		inputStyle,
		labelStyle,
		markdownFilePath,
		markdownContent,
		needsMarkdownMigration,
		isLoadingMarkdown,
		markdownLoadError,
		handleInputChange,
		handleCategoriesChange,
		handleTagsChange,
		handleMarkdownContentChange,
		handleMarkdownSave,
		migrateContentToMarkdown,
		setNeedsMarkdownMigration,
	} = props;
	return (
		<div className="space-y-4">
			<TitleDescriptionFields
				formData={formData}
				inputStyle={inputStyle}
				labelStyle={labelStyle}
				handleInputChange={handleInputChange}
			/>
			<CategoryStatusFields
				formData={formData}
				enhanced={enhanced}
				inputStyle={inputStyle}
				labelStyle={labelStyle}
				handleInputChange={handleInputChange}
				handleCategoriesChange={handleCategoriesChange}
			/>
			<GalleryVisibilitySummary formData={formData} enhanced={enhanced} />
			<TagsField formData={formData} handleTagsChange={handleTagsChange} />
			<PriorityField
				formData={formData}
				inputStyle={inputStyle}
				labelStyle={labelStyle}
				handleInputChange={handleInputChange}
			/>
			<MarkdownMigrationNotice
				enhanced={enhanced}
				needsMarkdownMigration={needsMarkdownMigration}
				migrateContentToMarkdown={migrateContentToMarkdown}
				setNeedsMarkdownMigration={setNeedsMarkdownMigration}
			/>
			<MarkdownEditorField
				formData={formData}
				enhanced={enhanced}
				inputStyle={inputStyle}
				markdownFilePath={markdownFilePath}
				markdownContent={markdownContent}
				needsMarkdownMigration={needsMarkdownMigration}
				isLoadingMarkdown={isLoadingMarkdown}
				markdownLoadError={markdownLoadError}
				handleInputChange={handleInputChange}
				handleMarkdownContentChange={handleMarkdownContentChange}
				handleMarkdownSave={handleMarkdownSave}
				migrateContentToMarkdown={migrateContentToMarkdown}
			/>
		</div>
	);
}

function BasicFieldsLegacy({
	formData,
	enhanced,
	inputStyle,
	labelStyle,
	markdownFilePath,
	markdownContent,
	needsMarkdownMigration,
	isLoadingMarkdown,
	markdownLoadError,
	handleInputChange,
	handleCategoriesChange,
	handleTagsChange,
	handleMarkdownContentChange,
	handleMarkdownSave,
	migrateContentToMarkdown,
	setNeedsMarkdownMigration,
}: BasicFieldsProps) {
	return (
		<div className="space-y-4">
			<div>
				<label className={labelStyle}>タイトル *</label>
				<input
					type="text"
					value={formData.title}
					onChange={(e) => handleInputChange("title", e.target.value)}
					className={inputStyle}
					placeholder="コンテンツのタイトルを入力してください"
				/>
			</div>

			<div>
				<label className={labelStyle}>説明</label>
				<textarea
					value={formData.description}
					onChange={(e) => handleInputChange("description", e.target.value)}
					className={`${inputStyle} h-24 resize-vertical`}
					rows={3}
					placeholder="コンテンツの説明を入力してください"
				/>
			</div>

			<div className="space-y-4">
				<div>
					{formData.type === "portfolio" && enhanced ? (
						<MultiCategorySelector
							selectedCategories={
								isEnhancedContentItem(formData)
									? formData.categories || []
									: formData.category
										? [formData.category as EnhancedCategoryType]
										: []
							}
							onChange={handleCategoriesChange}
							availableCategories={["develop", "video", "design"]}
							maxSelections={3}
							showOtherOption={true}
						/>
					) : formData.type === "portfolio" ? (
						<div>
							<label className={labelStyle}>カテゴリ</label>
							<Select
								value={formData.category || ""}
								onChange={(value) => handleInputChange("category", value)}
								options={getPortfolioCategoryOptions()}
								placeholder="カテゴリを選択してください"
								variant="admin"
							/>
						</div>
					) : (
						<div>
							<label className={labelStyle}>カテゴリ</label>
							<input
								type="text"
								value={formData.category}
								onChange={(e) =>
									handleInputChange("category", e.target.value)
								}
								className={inputStyle}
								placeholder="カテゴリを入力してください"
							/>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className={labelStyle}>ステータス</label>
						<Select
							value={formData.status}
							onChange={(value) => handleInputChange("status", value)}
							options={[
								{ value: "draft", label: "下書き" },
								{ value: "published", label: "公開済み" },
								{ value: "archived", label: "アーカイブ" },
								{ value: "scheduled", label: "予約投稿" },
							]}
							variant="admin"
						/>
					</div>
				</div>
			</div>

			{enhanced &&
				formData.type === "portfolio" &&
				isEnhancedContentItem(formData) &&
				formData.categories &&
				formData.categories.length > 0 && (
					<div className="  rounded-lg p-4">
						<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
							Gallery Visibility Summary
						</h4>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<span className="w-2 h-2  rounded-full"></span>
								<span className="font-medium ">Will appear in:</span>
								<span className="">
									{formData.categories.includes("other") ||
									formData.categories.length === 0
										? "All gallery only"
										: `All, ${formData.categories
												.filter((cat) => cat !== "other")
												.map((cat) =>
													cat === "develop"
														? "Development"
														: cat === "video"
															? "Video"
															: cat === "design"
																? "Design"
																: cat.charAt(0).toUpperCase() +
																	cat.slice(1),
												)
												.join(", ")} galleries`}
								</span>
							</div>

							{formData.categories.includes("other") &&
								formData.categories.length > 1 && (
									<div className="flex items-center gap-2">
										<span className="w-2 h-2  rounded-full"></span>
										<span className=" text-xs">
											Note: Other category overrides specific categories - item
											will only appear in All gallery
										</span>
									</div>
								)}

							{formData.categories.length > 2 && (
								<div className="flex items-center gap-2">
									<span className="w-2 h-2  rounded-full"></span>
									<span className=" text-xs">
										Multiple categories selected - item may appear in multiple
										galleries
									</span>
								</div>
							)}
						</div>
					</div>
				)}

			<div>
				<label className={labelStyle}>タグ</label>
				<div className="space-y-2">
					<TagManagementUI
						selectedTags={formData.tags || []}
						onChange={handleTagsChange}
						tagManager={clientTagManager}
						allowNewTags={true}
						maxTags={15}
						placeholder="既存のタグを検索するか、新しいタグを作成してください..."
						className="mt-1"
					/>
					<div className="flex items-center justify-between text-xs ">
						<span>
							{formData.tags && formData.tags.length > 0
								? `${formData.tags.length}個のタグが選択されています`
								: "タグが選択されていません"}
						</span>
						<span className="">最大15個</span>
					</div>
					<div className="text-xs   p-3 rounded ">
						<div className="flex items-start gap-2">
							<span className=" mt-0.5">💡</span>
							<div>
								<strong>Tag Tips:</strong> Type to search existing tags or
								create new ones. Tags help categorize content and improve
								searchability. Use descriptive terms like &quot;react&quot;,
								&quot;design&quot;, &quot;video&quot;, etc.
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>
				<label className={labelStyle} htmlFor="priority-input">
					Priority (0-100)
				</label>
				<input
					id="priority-input"
					type="number"
					min="0"
					max="100"
					value={formData.priority}
					onChange={(e) =>
						handleInputChange("priority", parseInt(e.target.value))
					}
					className={inputStyle}
				/>
			</div>

			{enhanced && needsMarkdownMigration && (
				<div className="   rounded-lg p-4">
					<div className="flex items-start gap-3">
						<div className="w-6 h-6  rounded-full flex items-center justify-center shrink-0 mt-0.5">
							<span className=" text-sm">📝</span>
						</div>
						<div className="flex-1">
							<h4 className="text-sm font-medium  mb-2">
								Migrate to Markdown File System
							</h4>
							<p className="text-sm  mb-3">
								This content is currently stored as text. Migrate it to a
								markdown file to enable enhanced features like embed syntax
								and better content management.
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={migrateContentToMarkdown}
									className="px-3 py-1 text-sm"
								>
									Migrate to Markdown File
								</button>
								<button
									type="button"
									onClick={() => setNeedsMarkdownMigration(false)}
									className="px-3 py-1 text-sm"
								>
									Keep as Text
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div>
				<label className={labelStyle}>Content (Markdown)</label>
				{enhanced ? (
					isLoadingMarkdown ? (
						<div className=" rounded-lg p-8 text-center">
							<div className="flex items-center justify-center gap-2">
								<div className="w-4 h-4  border-t-transparent rounded-full animate-spin"></div>
								<span className="text-sm ">Loading markdown content...</span>
							</div>
						</div>
					) : (
						<div>
							<div className="mb-2 text-xs   p-2   rounded">
								<div>Debug: Content length: {markdownContent.length}</div>
								<div>FilePath: {markdownFilePath || "none"}</div>
								<div>
									Content preview: {" "}
									{markdownContent.substring(0, 100) || "empty"}
								</div>
								<div>Loading: {isLoadingMarkdown ? "true" : "false"}</div>
								<div>Error: {markdownLoadError || "none"}</div>
							</div>
							<MarkdownEditor
								content={markdownContent}
								filePath={markdownFilePath}
								onChange={handleMarkdownContentChange}
								onSave={handleMarkdownSave}
								preview={true}
								toolbar={true}
								embedSupport={true}
								mediaData={{
									images: formData.images || [],
									videos: (formData.videos || []).map((video) => ({
										...video,
										title: video.title || `Video ${video.url}`,
									})),
									externalLinks: formData.externalLinks || [],
								}}
							/>
						</div>
					)
				) : (
					<textarea
						value={formData.content || ""}
						onChange={(e) => handleInputChange("content", e.target.value)}
						className={`${inputStyle} h-96 resize-vertical font-mono`}
						rows={20}
						placeholder="Markdownコンテンツを入力してください..."
					/>
				)}

				{enhanced && (
					<div className="mt-2 space-y-2">
						<div className="text-xs  space-y-1">
							<div className="flex items-center gap-2">
								{markdownLoadError ? (
									<>
										<span className="w-2 h-2  rounded-full"></span>
										<span className="">
											Error loading markdown: {markdownLoadError}
										</span>
									</>
								) : markdownFilePath ? (
									<>
										<span className="w-2 h-2  rounded-full"></span>
										<span>
											Markdown file: {markdownFilePath.split("/").pop()}
										</span>
									</>
								) : (
									<>
										<span className="w-2 h-2  rounded-full"></span>
										<span>
											Content stored as text (consider migrating to markdown
											file)
										</span>
									</>
								)}
							</div>
							<div className="">
								Content length: {markdownContent.length} characters
								{isLoadingMarkdown && " (Loading...)"}
							</div>
						</div>

						{needsMarkdownMigration && (
							<div className="   rounded p-3">
								<div className="flex items-start gap-2">
									<span className=" mt-0.5">💡</span>
									<div className="flex-1">
										<p className="text-sm  mb-2">
											This item has content stored as text. Migrate it to a
											markdown file for better organization and features.
										</p>
										<button
											type="button"
											onClick={migrateContentToMarkdown}
											className="px-3 py-1 text-sm"
										>
											Migrate to Markdown File
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

interface MediaFieldsProps {
	formData: FormData;
	enhanced: boolean;
	uploadOptions: EnhancedFileUploadOptions;
	setUploadOptions: (options: EnhancedFileUploadOptions) => void;
	handleInputChange: InputChangeHandler;
	handleEnhancedInputChange: EnhancedInputChangeHandler;
}

function MediaFields({
	formData,
	enhanced,
	uploadOptions,
	setUploadOptions,
	handleInputChange,
	handleEnhancedInputChange,
}: MediaFieldsProps) {
	return (
		<div className="space-y-6">
			{enhanced ? (
				<EnhancedFileUploadSection
					images={formData.images || []}
					originalImages={
						(formData as EnhancedContentItem).originalImages || []
					}
					thumbnail={formData.thumbnail}
					onImagesChange={(images) => handleInputChange("images", images)}
					onOriginalImagesChange={(originalImages) =>
						handleEnhancedInputChange("originalImages", originalImages)
					}
					onThumbnailChange={(thumbnail) =>
						handleInputChange("thumbnail", thumbnail)
					}
					uploadOptions={uploadOptions}
					onUploadOptionsChange={setUploadOptions}
				/>
			) : (
				<FileUploadSection
					images={formData.images || []}
					thumbnail={formData.thumbnail}
					onImagesChange={(images) => handleInputChange("images", images)}
					onThumbnailChange={(thumbnail) =>
						handleInputChange("thumbnail", thumbnail)
					}
				/>
			)}
			<MediaEmbedSection
				videos={formData.videos || []}
				onVideosChange={(videos) => handleInputChange("videos", videos)}
			/>
		</div>
	);
}

interface DateFieldsProps {
	formData: FormData;
	enhanced: boolean;
	useManualDate: boolean;
	handleDateChange: (date: string) => void;
	handleToggleManualDate: (use: boolean) => void;
}

function DateFields({
	formData,
	enhanced,
	useManualDate,
	handleDateChange,
	handleToggleManualDate,
}: DateFieldsProps) {
	return (
		<div className="space-y-6">
			<div className="  p-4 rounded-lg">
				<h3 className="neue-haas-grotesk-display text-xl leading-snug mb-4">
					日付管理
				</h3>
				<p className="noto-sans-jp-light text-xs pb-2  mb-4">
					このコンテンツアイテムの日付管理方法を制御します.自動日付管理（作成・更新時刻に基づく）または手動日付設定を選択できます.
				</p>
				<DatePicker
					value={(formData as EnhancedContentItem).manualDate}
					onChange={handleDateChange}
					useManualDate={useManualDate}
					onToggleManualDate={handleToggleManualDate}
					placeholder="日付を選択してください..."
				/>
			</div>

			<div className="  p-4 rounded-lg">
				<h4 className="noto-sans-jp-regular text-sm font-medium mb-2">
					現在の日付情報
				</h4>
				<div className="space-y-2 text-sm ">
					<div>
						<span className="font-medium">作成日:</span>{" "}
						{new Date(formData.createdAt).toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "long",
							day: "numeric",
							weekday: "short",
						})}
					</div>
					<div>
						<span className="font-medium">最終更新:</span>{" "}
						{new Date(
							formData.updatedAt || formData.createdAt,
						).toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "long",
							day: "numeric",
							weekday: "short",
						})}
					</div>
					{enhanced && (formData as EnhancedContentItem).manualDate && (
						<div>
							<span className="font-medium">手動設定日:</span>{" "}
							{new Date(
								(formData as EnhancedContentItem).manualDate!,
							).toLocaleDateString("ja-JP", {
								year: "numeric",
								month: "long",
								day: "numeric",
								weekday: "short",
							})}
						</div>
					)}
					<div>
						<span className="font-medium">有効日付:</span>{" "}
						{enhanced
							? clientDateManager
									.getEffectiveDate(formData as EnhancedContentItem)
									.toLocaleDateString("ja-JP", {
										year: "numeric",
										month: "long",
										day: "numeric",
										weekday: "short",
									})
							: new Date(formData.createdAt).toLocaleDateString("ja-JP", {
									year: "numeric",
									month: "long",
									day: "numeric",
									weekday: "short",
								})}
					</div>
				</div>
			</div>

			<div className="  p-4 rounded-lg">
				<h4 className="noto-sans-jp-regular text-sm font-medium mb-2">
					Date History
				</h4>
				<p className="noto-sans-jp-light text-xs ">
					Date changes are automatically tracked. The effective date will be
					used for sorting and display purposes throughout the application.
				</p>
			</div>
		</div>
	);
}

interface FieldGroupsProps {
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

function FieldGroups(props: FieldGroupsProps) {
	const { activeTab, formData, enhanced, handleInputChange } = props;

	return (
		<>
			{activeTab === "basic" && <BasicFields {...props} />}
			{activeTab === "media" && <MediaFields {...props} />}
			{activeTab === "links" && (
				<ExternalLinksSection
					links={formData.externalLinks || []}
					onLinksChange={(links) =>
						handleInputChange("externalLinks", links)
					}
				/>
			)}
			{activeTab === "download" && formData.type === "download" && (
				<DownloadInfoSection
					downloadInfo={formData.downloadInfo}
					onDownloadInfoChange={(downloadInfo) =>
						handleInputChange("downloadInfo", downloadInfo)
					}
				/>
			)}
			{activeTab === "seo" && (
				<SEOSection
					seo={formData.seo}
					onSEOChange={(seo) => handleInputChange("seo", seo)}
					title={formData.title}
					category={
						isEnhancedContentItem(formData)
							? formData.categories?.[0]
							: formData.category
					}
					tags={formData.tags}
					thumbnail={formData.thumbnail || formData.images?.[0]}
				/>
			)}
			{activeTab === "dates" && enhanced && <DateFields {...props} />}
		</>
	);
}

interface ActionPanelProps {
	onCancel: () => void;
	isLoading: boolean;
	isClient: boolean;
	saveStatus: "idle" | "saving" | "success" | "error";
	buttonStyle: string;
}

function ActionPanel({
	onCancel,
	isLoading,
	isClient,
	saveStatus,
	buttonStyle,
}: ActionPanelProps) {
	return (
		<div className="flex justify-end gap-4 pt-6  ">
			<button
				type="button"
				onClick={onCancel}
				className={buttonStyle}
				disabled={isLoading}
			>
				{isClient ? "キャンセル" : "Cancel"}
			</button>
			<button
				type="submit"
				className={`${buttonStyle} ${saveStatus === "success" ? " " : ""} ${saveStatus === "error" ? " " : ""}`}
				disabled={isLoading}
			>
				{saveStatus === "saving" && (isClient ? "保存中..." : "Saving...")}
				{saveStatus === "success" && (isClient ? "✓ 保存完了" : "✓ Saved")}
				{saveStatus === "error" && (isClient ? "✗ エラー" : "✗ Error")}
				{saveStatus === "idle" &&
					(isLoading
						? isClient
							? "保存中..."
							: "Saving..."
						: isClient
							? "保存"
							: "Save")}
			</button>
		</div>
	);
}

interface FormFooterProps {
	children: React.ReactNode;
}

function FormFooter({ children }: FormFooterProps) {
	return <>{children}</>;
}

export function DataManagerForm({
	item,
	onSave,
	onCancel,
	isLoading,
	saveStatus = "idle",
	enhanced = false,
}: DataManagerFormProps) {
	const [isClient, setIsClient] = useState(false);
	const [formData, setFormData] = useState<FormData>(item);
	const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
	const [useManualDate, setUseManualDate] = useState<boolean>(false);
	const [uploadOptions, setUploadOptions] = useState<EnhancedFileUploadOptions>({
		skipProcessing: false,
		preserveOriginal: true,
		generateVariants: false,
		customProcessing: {
			resize: { width: 1920, height: 1080 },
			format: "jpeg",
			watermark: false,
		},
	});
	const [markdownFilePath, setMarkdownFilePath] = useState<string | undefined>(
		enhanced ? (item as EnhancedContentItem).markdownPath : undefined,
	);
	const [markdownContent, setMarkdownContent] = useState<string>(
		formData.content || "",
	);
	const [needsMarkdownMigration, setNeedsMarkdownMigration] = useState<boolean>(
		enhanced && !!(formData.content && !markdownFilePath),
	);
	const [isLoadingMarkdown, setIsLoadingMarkdown] = useState<boolean>(false);
	const [markdownLoadError, setMarkdownLoadError] = useState<string | null>(null);
	const [, setCategoryChangeImpact] = useState<{
		show: boolean;
		oldCategories: EnhancedCategoryType[];
		newCategories: EnhancedCategoryType[];
		impacts: string[];
	}>({ show: false, oldCategories: [], newCategories: [], impacts: [] });

	useEffect(() => {
		setIsClient(true);
		setFormData(item);
		setMarkdownFilePath(
			enhanced ? (item as EnhancedContentItem).markdownPath : undefined,
		);
		setNeedsMarkdownMigration(
			enhanced && !!(item.content && !(item as EnhancedContentItem).markdownPath),
		);
		setMarkdownLoadError(null);

		if (enhanced && isEnhancedContentItem(item)) {
			const enhancedItem = item as EnhancedContentItem;
			const shouldUseManual = enhancedItem.useManualDate || false;
			setUseManualDate(shouldUseManual);
			console.log("Date management state updated:", {
				useManualDate: shouldUseManual,
				manualDate: enhancedItem.manualDate,
				itemId: enhancedItem.id,
			});
		} else {
			setUseManualDate(false);
		}

		const controller = new AbortController();
		const loadMarkdownContent = async () => {
			if (enhanced && (item as EnhancedContentItem).markdownPath) {
				setIsLoadingMarkdown(true);
				const markdownPath = (item as EnhancedContentItem).markdownPath!;
				console.log("=== Markdownファイル読み込み開始 ===");
				console.log("読み込み対象パス:", markdownPath);

				const existsResponse = await fetch(
					`/api/markdown?action=fileExists&filePath=${encodeURIComponent(markdownPath)}`,
					{ signal: controller.signal },
				).catch((error) => {
					if ((error as Error).name === "AbortError") return null;
					console.warn("ファイル存在確認でエラーが発生しました:", error);
					return null;
				});

				if (controller.signal.aborted) return;
				if (existsResponse && existsResponse.ok) {
					const existsData = await existsResponse.json().catch(() => null);
					console.log("ファイル存在確認結果:", existsData);
					if (!existsData || existsData.exists === false) {
						console.warn(`Markdownファイルが存在しません: ${markdownPath}`);
						setMarkdownFilePath(undefined);
						setMarkdownContent(item.content || "");
						setMarkdownLoadError(null);
						setIsLoadingMarkdown(false);
						return;
					}
				} else {
					console.warn("ファイル存在確認に失敗しましたが、読み込みを続行します");
				}

				const contentResponse = await fetch(
					`/api/markdown?action=getMarkdownContent&filePath=${encodeURIComponent(markdownPath)}`,
					{ signal: controller.signal },
				).catch((error) => {
					if ((error as Error).name === "AbortError") return null;
					console.error("Markdownコンテンツ取得でエラー:", error);
					return null;
				});

				if (controller.signal.aborted) return;
				if (contentResponse && contentResponse.ok) {
					const contentData = await contentResponse.json().catch(() => null);
					if (contentData && contentData.content !== undefined) {
						console.log(
							"Markdownコンテンツ取得成功:",
							contentData.content?.length || 0,
							"文字",
						);
						setMarkdownContent(contentData.content);
						setMarkdownLoadError(null);
						setIsLoadingMarkdown(false);
						return;
					}
					console.warn("APIレスポンスにコンテンツが含まれていません");
				} else if (contentResponse) {
					const errorData = await contentResponse.json().catch(() => ({}));
					console.error(
						`Markdown API エラー: ${contentResponse.status} - ${errorData.error || "不明なエラー"}`,
					);
				}

				if (controller.signal.aborted) return;
				setMarkdownLoadError("Markdownファイルの読み込みに失敗しました");
				console.log(
					"Markdownファイル読み込み失敗、item.contentを使用:",
					item.content?.length || 0,
					"文字",
				);
				setMarkdownContent(item.content || "");
				setIsLoadingMarkdown(false);
			} else {
				console.log(
					"Markdownパスなし、item.contentを使用:",
					item.content?.length || 0,
					"文字",
				);
				setMarkdownContent(item.content || "");
			}
		};

		loadMarkdownContent();
		return () => controller.abort();
	}, [item, enhanced]);

	const handleInputChange: InputChangeHandler = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
			updatedAt: new Date().toISOString(),
		}));
	};

	const handleEnhancedInputChange: EnhancedInputChangeHandler = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
			updatedAt: new Date().toISOString(),
		}));
	};

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
			impacts.push("⚠ Will only appear in 'All' gallery due to 'Other' category");
		} else if (hadOther && !hasOther) {
			impacts.push("✓ Will now appear in specific category galleries");
		}
		if (newCategories.length === 0) {
			impacts.push("⚠ No categories selected - item may not be visible in galleries");
		}
		return impacts;
	};

	const handleCategoriesChange = (categories: EnhancedCategoryType[]) => {
		if (enhanced && isEnhancedContentItem(formData)) {
			const oldCategories = formData.categories || [];
			if (
				oldCategories.length > 0 &&
				JSON.stringify(oldCategories.sort()) !== JSON.stringify(categories.sort())
			) {
				const impacts = analyzeCategoryChangeImpact(oldCategories, categories);
				if (impacts.length > 0) {
					setCategoryChangeImpact({
						show: true,
						oldCategories,
						newCategories: categories,
						impacts,
					});
				}
			}
			handleEnhancedInputChange("categories", categories);
			handleEnhancedInputChange("isOtherCategory", categories.includes("other"));
		}
	};

	const handleDateChange = (date: string) => {
		console.log("=== handleDateChange called ===", { date, useManualDate, enhanced });
		if (enhanced) {
			const enhancedItem = formData as EnhancedContentItem;
			const updatedData = {
				...enhancedItem,
				manualDate: date || new Date().toISOString(),
				useManualDate: useManualDate,
				updatedAt: new Date().toISOString(),
			};
			setFormData(updatedData);
			console.log("Date changed - updated formData:", {
				date,
				useManualDate,
				updatedManualDate: updatedData.manualDate,
				updatedUseManualDate: updatedData.useManualDate,
			});
		}
	};

	const handleToggleManualDate = (use: boolean) => {
		console.log("=== handleToggleManualDate called ===", { use, enhanced });
		setUseManualDate(use);
		if (enhanced) {
			const enhancedItem = formData as EnhancedContentItem;
			const currentDate = new Date().toISOString();
			const updatedData = {
				...enhancedItem,
				useManualDate: use,
				updatedAt: new Date().toISOString(),
				manualDate: enhancedItem.manualDate || currentDate,
			};
			setFormData(updatedData);
			console.log("Manual date toggle - updated formData:", {
				use,
				previousManualDate: enhancedItem.manualDate,
				updatedUseManualDate: updatedData.useManualDate,
				updatedManualDate: updatedData.manualDate,
			});
		}
	};

	const handleTagsChange = (tags: string[]) => handleInputChange("tags", tags);

	const createMarkdownFile = async (content: string): Promise<string | null> => {
		if (!enhanced) return null;
		const filePath = await clientMarkdownService
			.generateFilePath(formData.id, formData.type)
			.catch((error) => {
				console.error("Failed to create markdown file:", error);
				return null;
			});
		if (!filePath) return null;
		const created = await clientMarkdownService
			.createMarkdownFile(formData.id, formData.type, content)
			.catch((error) => {
				console.error("Failed to create markdown file:", error);
				return null;
			});
		return created ? filePath : null;
	};

	const updateMarkdownFile = async (
		filePath: string,
		content: string,
	): Promise<boolean> => {
		if (!enhanced) return false;
		const updated = await clientMarkdownService
			.updateMarkdownFile(filePath, content)
			.catch((error) => {
				console.error("Failed to update markdown file:", error);
				return null;
			});
		return Boolean(updated);
	};

	const handleMarkdownContentChange = (content: string) => {
		setMarkdownContent(content);
		handleInputChange("content", content);
	};

	const handleMarkdownSave = async (content: string, filePath: string) => {
		if (!enhanced) return;
		if (filePath) {
			const exists = await clientMarkdownService.fileExists(filePath).catch(() => false);
			if (exists) {
				await updateMarkdownFile(filePath, content);
				return;
			}
		}
		const newFilePath = await createMarkdownFile(content);
		if (newFilePath) {
			setMarkdownFilePath(newFilePath);
			handleEnhancedInputChange("markdownPath", newFilePath);
		}
	};

	const migrateContentToMarkdown = async () => {
		if (!enhanced || !formData.content || markdownFilePath) return;
		const newFilePath = await createMarkdownFile(formData.content);
		if (!newFilePath) {
			console.error("Failed to migrate content to markdown");
			alert("コンテンツのMarkdownファイルへの移行に失敗しました.もう一度お試しください.");
			return;
		}
		setMarkdownFilePath(newFilePath);
		handleEnhancedInputChange("markdownPath", newFilePath);
		setNeedsMarkdownMigration(false);
		handleInputChange("content", "");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("=== Form submission started ===");
		console.log("Original form data:", JSON.stringify(formData, null, 2));
		console.log("Thumbnail in formData:", formData.thumbnail);
		console.log("Images in formData:", formData.images);

		if (enhanced && markdownContent) {
			if (markdownFilePath) {
				const ok = await updateMarkdownFile(markdownFilePath, markdownContent);
				if (!ok) {
					alert("Markdownファイルの保存に失敗しました.もう一度お試しください.");
					return;
				}
			} else {
				const newFilePath = await createMarkdownFile(markdownContent);
				if (!newFilePath) {
					alert("Markdownファイルの保存に失敗しました.もう一度お試しください.");
					return;
				}
				setMarkdownFilePath(newFilePath);
				handleEnhancedInputChange("markdownPath", newFilePath);
			}
		}

		if (!formData.title.trim()) {
			console.error("Validation failed: Title is required");
			alert("タイトルは必須項目です");
			return;
		}
		if (formData.type === "portfolio") {
			if (enhanced && isEnhancedContentItem(formData)) {
				if (!formData.categories || formData.categories.length === 0) {
					console.error("Validation failed: At least one category is required");
					alert("ポートフォリオアイテムには少なくとも1つのカテゴリを選択してください");
					return;
				}
				const invalidCategories = formData.categories.filter(
					(cat) => !isValidEnhancedPortfolioCategory(cat),
				);
				if (invalidCategories.length > 0) {
					console.error("Validation failed: Invalid categories:", invalidCategories);
					alert(`無効なカテゴリが選択されています: ${invalidCategories.join(", ")}`);
					return;
				}
				const hasOther = formData.categories.includes("other");
				const hasSpecificCategories = formData.categories.some(
					(cat) => cat !== "other",
				);
				if (hasOther && hasSpecificCategories) {
					const shouldContinue = confirm(
						"警告: 「その他」カテゴリと特定のカテゴリの両方が選択されています." +
							"「その他」カテゴリを含むアイテムは、他のカテゴリに関係なく「すべて」ギャラリーにのみ表示されます." +
							"続行しますか？",
					);
					if (!shouldContinue) return;
				}
				if (formData.categories.length > 3) {
					console.error("Validation failed: Too many categories selected");
					alert("カテゴリは最大3つまで選択できます");
					return;
				}
			} else {
				if (!formData.category) {
					console.error("Validation failed: Portfolio category is required");
					alert("ポートフォリオアイテムにはカテゴリを選択してください");
					return;
				}
				if (!isValidPortfolioCategory(formData.category)) {
					console.error("Validation failed: Invalid portfolio category");
					alert("有効なポートフォリオカテゴリを選択してください");
					return;
				}
			}
		}

		const validExternalLinks = (formData.externalLinks || []).filter(
			(link) => link.url.trim() && link.title.trim(),
		);
		const dataToSave = {
			...formData,
			title: formData.title.trim(),
			description: formData.description || "",
			tags: formData.tags || [],
			videos: formData.videos || [],
			images: formData.images || [],
			externalLinks: validExternalLinks,
			updatedAt: new Date().toISOString(),
			thumbnail:
				formData.thumbnail ||
				(formData.images && formData.images.length > 0
					? formData.images[0]
					: undefined),
			...(enhanced && {
				markdownPath: markdownFilePath,
				content: markdownFilePath ? "" : markdownContent,
			}),
			...(enhanced && isEnhancedContentItem(formData)
				? {
						categories: formData.categories || [],
						isOtherCategory: formData.categories?.includes("other") || false,
						category: formData.categories?.[0] || "",
						useManualDate: useManualDate,
						manualDate: formData.manualDate || new Date().toISOString(),
					}
				: { category: formData.category || "" }),
		};

		console.log("=== DEBUG: Save data preparation ===");
		console.log("useManualDate state:", useManualDate);
		console.log("formData.useManualDate:", (formData as EnhancedContentItem).useManualDate);
		console.log("formData.manualDate:", (formData as EnhancedContentItem).manualDate);
		console.log("enhanced:", enhanced);
		console.log("isEnhancedContentItem(formData):", isEnhancedContentItem(formData));
		if (enhanced && isEnhancedContentItem(formData)) {
			console.log("=== Date Management Fields in dataToSave ===");
			console.log("useManualDate (from state):", useManualDate);
			console.log(
				"manualDate (from formData):",
				"manualDate" in formData ? formData.manualDate : "N/A",
			);
			console.log(
				"manualDate (computed):",
				useManualDate && "manualDate" in formData
					? formData.manualDate
					: new Date().toISOString(),
			);
			console.log(
				"Final useManualDate in dataToSave:",
				"useManualDate" in dataToSave ? dataToSave.useManualDate : "N/A",
			);
			console.log(
				"Final manualDate in dataToSave:",
				"manualDate" in dataToSave ? dataToSave.manualDate : "N/A",
			);
		}
		console.log("Data to save:", JSON.stringify(dataToSave, null, 2));
		console.log("Thumbnail in dataToSave:", dataToSave.thumbnail);
		console.log("Images in dataToSave:", dataToSave.images);
		console.log("Calling onSave...");
		onSave(dataToSave);
	};

	const inputStyle =
		"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
	const labelStyle = "block noto-sans-jp-regular text-sm font-medium mb-1";
	const buttonStyle =
		" px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";
	const activeTabStyle =
		" px-4 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
	const tabStyle =
		" px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<FormHeader
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				formData={formData}
				enhanced={enhanced}
				activeTabStyle={activeTabStyle}
				tabStyle={tabStyle}
			/>
			<FieldGroups
				activeTab={activeTab}
				formData={formData}
				enhanced={enhanced}
				inputStyle={inputStyle}
				labelStyle={labelStyle}
				uploadOptions={uploadOptions}
				markdownFilePath={markdownFilePath}
				markdownContent={markdownContent}
				needsMarkdownMigration={needsMarkdownMigration}
				isLoadingMarkdown={isLoadingMarkdown}
				markdownLoadError={markdownLoadError}
				useManualDate={useManualDate}
				setUploadOptions={setUploadOptions}
				setNeedsMarkdownMigration={setNeedsMarkdownMigration}
				handleInputChange={handleInputChange}
				handleEnhancedInputChange={handleEnhancedInputChange}
				handleCategoriesChange={handleCategoriesChange}
				handleTagsChange={handleTagsChange}
				handleMarkdownContentChange={handleMarkdownContentChange}
				handleMarkdownSave={handleMarkdownSave}
				migrateContentToMarkdown={migrateContentToMarkdown}
				handleDateChange={handleDateChange}
				handleToggleManualDate={handleToggleManualDate}
			/>
			<FormFooter>
				<ActionPanel
					onCancel={onCancel}
					isLoading={isLoading}
					isClient={isClient}
					saveStatus={saveStatus}
					buttonStyle={buttonStyle}
				/>
			</FormFooter>
		</form>
	);
}
