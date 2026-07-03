"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { Select } from "@/components/ui/Select";
import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { clientDateManager } from "@/lib/portfolio/client-date-manager";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";

import { MultiCategorySelector } from "@/components/ui/MultiCategorySelector";
import { clientMarkdownService } from "@/lib/markdown/client-service";
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
	enhanced?: boolean; // Flag to enable enhanced features
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
	const [formData, setFormData] = useState<ContentItem | EnhancedContentItem>(
		item,
	);
	const [activeTab, setActiveTab] = useState<
		"basic" | "media" | "links" | "download" | "seo" | "dates"
	>("basic");

	// Date management state for enhanced mode
	const [useManualDate, setUseManualDate] = useState<boolean>(false);

	// Enhanced file upload options state
	const [uploadOptions, setUploadOptions] = useState<EnhancedFileUploadOptions>(
		{
			skipProcessing: false,
			preserveOriginal: true,
			generateVariants: false,
			customProcessing: {
				resize: { width: 1920, height: 1080 },
				format: "jpeg",
				watermark: false,
			},
		},
	);

	// Markdown editor state
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
	const [markdownLoadError, setMarkdownLoadError] = useState<string | null>(
		null,
	);

	// Category change impact state
	const [, setCategoryChangeImpact] = useState<{
		show: boolean;
		oldCategories: EnhancedCategoryType[];
		newCategories: EnhancedCategoryType[];
		impacts: string[];
	}>({
		show: false,
		oldCategories: [],
		newCategories: [],
		impacts: [],
	});

	useEffect(() => {
		setIsClient(true);
		setFormData(item);
		setMarkdownFilePath(
			enhanced ? (item as EnhancedContentItem).markdownPath : undefined,
		);
		setNeedsMarkdownMigration(
			enhanced &&
				!!(item.content && !(item as EnhancedContentItem).markdownPath),
		);
		setMarkdownLoadError(null);

		// 日付管理の状態を更新
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

		// Load markdown content if markdownPath exists
		const loadMarkdownContent = async () => {
			if (enhanced && (item as EnhancedContentItem).markdownPath) {
				setIsLoadingMarkdown(true);
			const markdownPath = (item as EnhancedContentItem).markdownPath!;
			console.log("=== Markdownファイル読み込み開始 ===");
			console.log("読み込み対象パス:", markdownPath);

			const existsResponse = await fetch(
				`/api/markdown?action=fileExists&filePath=${encodeURIComponent(markdownPath)}`,
			).catch((error) => {
				console.warn("ファイル存在確認でエラーが発生しました:", error);
				return null;
			});

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
			).catch((error) => {
				console.error("Markdownコンテンツ取得でエラー:", error);
				return null;
			});

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

			setMarkdownLoadError("Markdownファイルの読み込みに失敗しました");
			console.log(
				"Markdownファイル読み込み失敗、item.contentを使用:",
				item.content?.length || 0,
				"文字",
			);
			setMarkdownContent(item.content || "");
			setIsLoadingMarkdown(false);
			} else {
				// 拡張モードでない場合、またはmarkdownPathがない場合はitem.contentを使用
				console.log(
					"Markdownパスなし、item.contentを使用:",
					item.content?.length || 0,
					"文字",
				);
				setMarkdownContent(item.content || "");
			}
		};

		loadMarkdownContent();
	}, [item, enhanced]);

	const handleInputChange = (
		field: keyof (ContentItem | EnhancedContentItem),
		value: unknown,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
			updatedAt: new Date().toISOString(),
		}));
	};

	const handleEnhancedInputChange = (
		field: keyof EnhancedContentItem,
		value: unknown,
	) => {
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

		// Check if item will be removed from galleries
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

		// Check for "other" category special behavior
		const hadOther = oldCategories.includes("other");
		const hasOther = newCategories.includes("other");

		if (!hadOther && hasOther) {
			impacts.push(
				"⚠ Will only appear in 'All' gallery due to 'Other' category",
			);
		} else if (hadOther && !hasOther) {
			impacts.push("✓ Will now appear in specific category galleries");
		}

		// Check for potential visibility issues
		if (newCategories.length === 0) {
			impacts.push(
				"⚠ No categories selected - item may not be visible in galleries",
			);
		}

		return impacts;
	};

	const handleCategoriesChange = (categories: EnhancedCategoryType[]) => {
		if (enhanced && isEnhancedContentItem(formData)) {
			const oldCategories = formData.categories || [];

			// Show impact analysis if there are significant changes
			if (
				oldCategories.length > 0 &&
				JSON.stringify(oldCategories.sort()) !==
					JSON.stringify(categories.sort())
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
			handleEnhancedInputChange(
				"isOtherCategory",
				categories.includes("other"),
			);
		}
	};

	// Data migration helpers

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const checkIfNeedsMigration = (
		item: ContentItem | EnhancedContentItem,
	): boolean => {
		if (!enhanced) return false;

		// Check if item has old single category format
		if (!isEnhancedContentItem(item) && item.category) {
			return true;
		}

		// Check if enhanced item has incomplete migration
		if (isEnhancedContentItem(item)) {
			return !item.categories || item.categories.length === 0;
		}

		return false;
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const migrateItemData = () => {
		if (!enhanced || isEnhancedContentItem(formData)) return;

		const legacyItem = formData as ContentItem;
		const migratedCategories: EnhancedCategoryType[] = [];

		if (
			legacyItem.category &&
			isValidEnhancedPortfolioCategory(legacyItem.category)
		) {
			migratedCategories.push(legacyItem.category as EnhancedCategoryType);
		} else if (legacyItem.category) {
			// Unknown category, migrate to "other"
			migratedCategories.push("other");
		}

		const enhancedData: EnhancedContentItem = {
			...legacyItem,
			categories: migratedCategories,
			isOtherCategory: migratedCategories.includes("other"),
			useManualDate: false,
			originalImages: [],
			processedImages: legacyItem.images || [],
		};

		setFormData(enhancedData);
	};

	const handleDateChange = (date: string) => {
		console.log("=== handleDateChange called ===", {
			date,
			useManualDate,
			enhanced,
		});
		if (enhanced) {
			const enhancedItem = formData as EnhancedContentItem;
			const updatedData = {
				...enhancedItem,
				manualDate: date || new Date().toISOString(), // 空の場合は現在の日付を使用
				useManualDate: useManualDate, // 現在のuseManualDate状態を保持
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
				// Manualモードに切り替える場合は現在の日付を設定、Autoモードでも日付を設定
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

	const handleTagsChange = (tags: string[]) => {
		handleInputChange("tags", tags);
	};

	// Markdown file operations
	const createMarkdownFile = async (
		content: string,
	): Promise<string | null> => {
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
		if (!created) return null;

		return filePath;
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
		// Also update the form data content for backward compatibility
		handleInputChange("content", content);
	};

	const handleMarkdownSave = async (
		content: string,
		filePath: string,
	): Promise<void> => {
		if (!enhanced) return;

		if (filePath) {
			const exists = await clientMarkdownService
				.fileExists(filePath)
				.catch(() => false);
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
			alert(
				"コンテンツのMarkdownファイルへの移行に失敗しました.もう一度お試しください.",
			);
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

		// Handle markdown file operations if enhanced mode is enabled
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

		// Basic validation
		if (!formData.title.trim()) {
			console.error("Validation failed: Title is required");
			alert("タイトルは必須項目です");
			return;
		}

		// Portfolio category validation
		if (formData.type === "portfolio") {
			if (enhanced && isEnhancedContentItem(formData)) {
				// Enhanced mode: Validate multiple categories
				if (!formData.categories || formData.categories.length === 0) {
					console.error("Validation failed: At least one category is required");
					alert(
						"ポートフォリオアイテムには少なくとも1つのカテゴリを選択してください",
					);
					return;
				}

				// Validate each category
				const invalidCategories = formData.categories.filter(
					(cat) => !isValidEnhancedPortfolioCategory(cat),
				);
				if (invalidCategories.length > 0) {
					console.error(
						"Validation failed: Invalid categories:",
						invalidCategories,
					);
					alert(
						`無効なカテゴリが選択されています: ${invalidCategories.join(", ")}`,
					);
					return;
				}

				// Check for conflicting categories
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
					if (!shouldContinue) {
						return;
					}
				}

				// Check for maximum categories
				if (formData.categories.length > 3) {
					console.error("Validation failed: Too many categories selected");
					alert("カテゴリは最大3つまで選択できます");
					return;
				}
			} else {
				// Legacy mode: Validate single category
				if (!formData.category) {
					console.error("Validation failed: Portfolio category is required");
					alert("ポートフォリオアイテムにはカテゴリを選択してください");
					return;
				}

				if (formData.category && !isValidPortfolioCategory(formData.category)) {
					console.error("Validation failed: Invalid portfolio category");
					alert("有効なポートフォリオカテゴリを選択してください");
					return;
				}
			}
		}

		// Filter out empty external links
		const validExternalLinks = (formData.externalLinks || []).filter(
			(link) => link.url.trim() && link.title.trim(),
		);

		// Ensure required fields are set
		const dataToSave = {
			...formData,
			title: formData.title.trim(),
			description: formData.description || "",
			tags: formData.tags || [],
			videos: formData.videos || [],
			images: formData.images || [],
			externalLinks: validExternalLinks,
			updatedAt: new Date().toISOString(),
			// Ensure thumbnail is set if images exist but no thumbnail is set
			thumbnail:
				formData.thumbnail ||
				(formData.images && formData.images.length > 0
					? formData.images[0]
					: undefined),
			// Include markdown file path for enhanced mode
			...(enhanced && {
				markdownPath: markdownFilePath,
				// Clear content field if we have a markdown file
				content: markdownFilePath ? "" : markdownContent,
			}),
			// Handle category/categories based on mode
			...(enhanced && isEnhancedContentItem(formData)
				? {
						// Enhanced mode: Use categories array
						categories: formData.categories || [],
						isOtherCategory: formData.categories?.includes("other") || false,
						// Keep legacy category for backward compatibility
						category: formData.categories?.[0] || "",
						// Include date management fields
						useManualDate: useManualDate,
						manualDate: formData.manualDate || new Date().toISOString(),
					}
				: {
						// Legacy mode: Use single category
						category: formData.category || "",
					}),
		};

		console.log("=== DEBUG: Save data preparation ===");
		console.log("useManualDate state:", useManualDate);
		console.log(
			"formData.useManualDate:",
			(formData as EnhancedContentItem).useManualDate,
		);
		console.log(
			"formData.manualDate:",
			(formData as EnhancedContentItem).manualDate,
		);
		console.log("enhanced:", enhanced);
		console.log(
			"isEnhancedContentItem(formData):",
			isEnhancedContentItem(formData),
		);
		// 日付管理フィールドの詳細ログ
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
		"w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base";

	const labelStyle =
		"block noto-sans-jp-regular text-sm font-medium mb-1";
	const buttonStyle =
		"border px-4 py-2 text-sm hover: hover: transition-colors focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base";
	const activeTabStyle =
		"border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base";
	const tabStyle =
		"border px-4 py-2 text-sm hover: hover: transition-colors focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base";

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Tab Navigation */}
			<div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
				<button
					type="button"
					onClick={() => setActiveTab("basic")}
					className={activeTab === "basic" ? activeTabStyle : tabStyle}
				>
					基本情報
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("media")}
					className={activeTab === "media" ? activeTabStyle : tabStyle}
				>
					メディア
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("links")}
					className={activeTab === "links" ? activeTabStyle : tabStyle}
				>
					リンク
				</button>
				{formData.type === "download" && (
					<button
						type="button"
						onClick={() => setActiveTab("download")}
						className={activeTab === "download" ? activeTabStyle : tabStyle}
					>
						ダウンロード
					</button>
				)}
				<button
					type="button"
					onClick={() => setActiveTab("seo")}
					className={activeTab === "seo" ? activeTabStyle : tabStyle}
				>
					SEO設定
				</button>
				{enhanced && (
					<button
						type="button"
						onClick={() => setActiveTab("dates")}
						className={activeTab === "dates" ? activeTabStyle : tabStyle}
					>
						日付管理
					</button>
				)}
			</div>

			{/* Tab Content */}
			{activeTab === "basic" && (
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
								// Enhanced mode: Multiple category selection
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
								// Legacy mode: Single category selection
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
								// Non-portfolio items: Text input
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

					{/* Category Validation Summary */}
					{enhanced &&
						formData.type === "portfolio" &&
						isEnhancedContentItem(formData) &&
						formData.categories &&
						formData.categories.length > 0 && (
							<div className=" border rounded-lg p-4">
								<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
									Gallery Visibility Summary
								</h4>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-green-500 rounded-full"></span>
										<span className="font-medium ">
											Will appear in:
										</span>
										<span className="text-gray-400">
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
												<span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
												<span className="text-yellow-700 text-xs">
													Note: Other category overrides specific categories -
													item will only appear in All gallery
												</span>
											</div>
										)}

									{formData.categories.length > 2 && (
										<div className="flex items-center gap-2">
											<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
											<span className="text-blue-700 text-xs">
												Multiple categories selected - item may appear in
												multiple galleries
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
							<div className="flex items-center justify-between text-xs text-gray-500">
								<span>
									{formData.tags && formData.tags.length > 0
										? `${formData.tags.length}個のタグが選択されています`
										: "タグが選択されていません"}
								</span>
								<span className="text-gray-400">最大15個</span>
							</div>
							<div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
								<div className="flex items-start gap-2">
									<span className="text-blue-600 mt-0.5">💡</span>
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
						<label className={labelStyle}>Priority (0-100)</label>
						<input
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

					{/* Markdown Migration Helper */}
					{enhanced && needsMarkdownMigration && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-white text-sm">📝</span>
								</div>
								<div className="flex-1">
									<h4 className="text-sm font-medium text-blue-900 mb-2">
										Migrate to Markdown File System
									</h4>
									<p className="text-sm text-blue-800 mb-3">
										This content is currently stored as text. Migrate it to a
										markdown file to enable enhanced features like embed syntax
										and better content management.
									</p>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={migrateContentToMarkdown}
											className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
										>
											Migrate to Markdown File
										</button>
										<button
											type="button"
											onClick={() => setNeedsMarkdownMigration(false)}
											className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
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
								<div className="border rounded-lg p-8 text-center">
									<div className="flex items-center justify-center gap-2">
										<div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
										<span className="text-sm text-gray-600">
											Loading markdown content...
										</span>
									</div>
								</div>
							) : (
								<div>
									<div className="mb-2 text-xs text-gray-500 bg-yellow-50 p-2 border border-yellow-200 rounded">
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

						{/* Markdown File Status and Migration */}
						{enhanced && (
							<div className="mt-2 space-y-2">
								<div className="text-xs text-gray-500 space-y-1">
									<div className="flex items-center gap-2">
										{markdownLoadError ? (
											<>
												<span className="w-2 h-2 bg-red-500 rounded-full"></span>
												<span className="text-red-600">
													Error loading markdown: {markdownLoadError}
												</span>
											</>
										) : markdownFilePath ? (
											<>
												<span className="w-2 h-2 bg-green-500 rounded-full"></span>
												<span>
													Markdown file: {markdownFilePath.split("/").pop()}
												</span>
											</>
										) : (
											<>
												<span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
												<span>
													Content stored as text (consider migrating to markdown
													file)
												</span>
											</>
										)}
									</div>
									<div className="text-gray-400">
										Content length: {markdownContent.length} characters
										{isLoadingMarkdown && " (Loading...)"}
									</div>
								</div>

								{/* Migration Helper */}
								{needsMarkdownMigration && (
									<div className="bg-blue-50 border border-blue-200 rounded p-3">
										<div className="flex items-start gap-2">
											<span className="text-blue-600 mt-0.5">💡</span>
											<div className="flex-1">
												<p className="text-sm text-blue-800 mb-2">
													This item has content stored as text. Migrate it to a
													markdown file for better organization and features.
												</p>
												<button
													type="button"
													onClick={migrateContentToMarkdown}
													className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
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
			)}

			{activeTab === "media" && (
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
			)}

			{activeTab === "links" && (
				<ExternalLinksSection
					links={formData.externalLinks || []}
					onLinksChange={(links) => handleInputChange("externalLinks", links)}
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

			{activeTab === "dates" && enhanced && (
				<div className="space-y-6">
					<div className=" border p-4 rounded-lg">
						<h3 className="neue-haas-grotesk-display text-xl leading-snug mb-4">
							日付管理
						</h3>
						<p className="noto-sans-jp-light text-xs pb-2 text-gray-400 mb-4">
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

					<div className=" border p-4 rounded-lg">
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

					<div className=" border p-4 rounded-lg">
						<h4 className="noto-sans-jp-regular text-sm font-medium mb-2">
							Date History
						</h4>
						<p className="noto-sans-jp-light text-xs text-gray-400">
							Date changes are automatically tracked. The effective date will be
							used for sorting and display purposes throughout the application.
						</p>
					</div>
				</div>
			)}

			{/* Form Actions */}
			<div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
					className={`${buttonStyle} hover:bg-gray-700 ${
						saveStatus === "success" ? "bg-green-600 border-green-600" : ""
					} ${saveStatus === "error" ? "bg-red-600 border-red-600" : ""}`}
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
		</form>
	);
}
