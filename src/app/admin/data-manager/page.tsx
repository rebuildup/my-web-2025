"use client";

import { ContentItem, ContentType } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContentList } from "./components/ContentList";
import { DataManagerForm } from "./components/DataManagerForm";
import { PreviewPanel } from "./components/PreviewPanel";

export default function DataManagerPage() {
	const router = useRouter();
	const [isClient, setIsClient] = useState(false);
	const idSeedRef = useRef(1);
	const nextSeed = useCallback(() => {
		idSeedRef.current += 1;
		return idSeedRef.current;
	}, []);

	// Check development environment on client side
	useEffect(() => {
		setIsClient(true);
		if (
			process.env.NODE_ENV !== "development" &&
			process.env.NODE_ENV !== "test"
		) {
			router.push("/");
		}
	}, [router]);

	const [selectedContentType, setSelectedContentType] =
		useState<ContentType>("portfolio");
	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<
		ContentItem | EnhancedContentItem | null
	>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [previewMode, setPreviewMode] = useState<"form" | "preview">("form");
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saving" | "success" | "error"
	>("idle");

	const loadContentItems = useCallback(
		async (type: ContentType, forceRefresh = false) => {
			setIsLoading(true);
			const timestamp = nextSeed();
			const response = await fetch(
				`/api/content/by-type/${type}?limit=100&_t=${timestamp}&status=all${forceRefresh ? "&refresh=true" : ""}`,
				{
					cache: "no-store",
					headers: {
						"Cache-Control": "no-cache",
						Pragma: "no-cache",
					},
				},
			).catch((error) => {
				console.error("Error loading content items:", error);
				return null;
			});
			if (!response) {
				setContentItems([]);
				setIsLoading(false);
				return;
			}
			console.log(`Response status: ${response.status}`);

			if (response.ok) {
				const result = await response.json();
				console.log(`Loaded content:`, result);
				const items = result.data || [];
				console.log(`Setting ${items.length} items`);
				setContentItems(items);
			} else {
				console.error("Failed to load content items", response.status);
				setContentItems([]);
			}
			setIsLoading(false);
		},
		[nextSeed],
	);

	// Load content items for selected type
	useEffect(() => {
		loadContentItems(selectedContentType);
	}, [selectedContentType, loadContentItems]);

	const handleCreateNew = () => {
		// Create enhanced content item for portfolio type
		if (selectedContentType === "portfolio") {
			const newItem: EnhancedContentItem = {
				id: `${selectedContentType}-${nextSeed()}`,
				type: selectedContentType,
				title: "",
				description: "",
				content: "",
				categories: ["develop"], // Default to "develop" category instead of "other"
				tags: [],
				status: "published",
				priority: 50,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				isOtherCategory: false,
				useManualDate: false,
				manualDate: undefined,
				originalImages: [],
				processedImages: [],
				images: [],
				videos: [],
				externalLinks: [],
			};
			setSelectedItem(newItem);
		} else {
			// Use legacy format for non-portfolio items
			const newItem: ContentItem = {
				id: `${selectedContentType}-${nextSeed()}`,
				type: selectedContentType,
				title: "",
				description: "",
				content: "",
				category: "",
				tags: [],
				status: "published",
				priority: 50,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				images: [],
				videos: [],
				externalLinks: [],
			};
			setSelectedItem(newItem);
		}
		setPreviewMode("form");
	};

	const handleEditItem = (item: ContentItem | EnhancedContentItem) => {
		setSelectedItem(item);
		setPreviewMode("form");
	};

	const handleSaveItem = async (item: ContentItem | EnhancedContentItem) => {
		setIsLoading(true);
		setSaveStatus("saving");

		console.log("=== Saving item ===");
		console.log("Item data:", JSON.stringify(item, null, 2));

		const response = await fetch(`/api/admin/content`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(item),
		}).catch((error) => {
			console.error("Error saving item:", error);
			setSaveStatus("error");
			alert(
				`Error saving item: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			setTimeout(() => setSaveStatus("idle"), 3000);
			setIsLoading(false);
			return null;
		});
		if (!response) return;

		console.log("Response status:", response.status);
		console.log(
			"Response headers:",
			Object.fromEntries(response.headers.entries()),
		);

		const result = await response.json();
		console.log("Save response:", JSON.stringify(result, null, 2));

		if (!response.ok) {
			console.error("Failed to save item:", result);
			setSaveStatus("error");
			alert(
				`Failed to save item: ${result.error || "Unknown error"}\nDetails: ${result.details || "No details"}`,
			);
			setTimeout(() => setSaveStatus("idle"), 3000);
			setIsLoading(false);
			return;
		}

		setSaveStatus("success");

		if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
			console.log("Updating tag usage for tags:", item.tags);
			await Promise.all(
				item.tags.map(async (tag) => {
					if (typeof tag === "string" && tag.trim()) {
						const tagResponse = await fetch(
							`/api/admin/tags/${encodeURIComponent(tag)}`,
							{ method: "PUT" },
						).catch(() => null);
						if (!tagResponse || !tagResponse.ok) {
							console.warn(`Failed to update usage for tag: ${tag}`);
						}
					}
				}),
			);
		}

		const savedItem = result.data || item;
		setSelectedItem(savedItem);
		console.log("Reloading content items...");
		await loadContentItems(selectedContentType, true);
		setSelectedItem(savedItem);

		if (selectedContentType === "portfolio") {
			console.log("Portfolio item saved - gallery cache should be invalidated");
		}

		setTimeout(() => setSaveStatus("idle"), 3000);
		setIsLoading(false);
	};

	const handleDeleteItem = async (id: string) => {
		if (
			!confirm(
				isClient
					? "このアイテムを削除してもよろしいですか？"
					: "Are you sure you want to delete this item?",
			)
		) {
			return;
		}

		setIsLoading(true);
		const response = await fetch(
			`/api/admin/content?id=${id}&type=${selectedContentType}`,
			{
				method: "DELETE",
			},
		).catch((error) => {
			console.error("Error deleting item:", error);
			setIsLoading(false);
			return null;
		});
		if (!response) return;

		if (response.ok) {
			await loadContentItems(selectedContentType);
			if (selectedItem?.id === id) {
				setSelectedItem(null);
			}
		} else {
			console.error("Failed to delete item");
		}
		setIsLoading(false);
	};

	const handleCancel = () => {
		setSelectedItem(null);
		setPreviewMode("form");
	};

	const handleFixThumbnails = async () => {
		if (
			!confirm(
				isClient
					? "サムネイルが設定されていないポートフォリオアイテムを自動修復しますか？\n（各アイテムの最初の画像がサムネイルに設定されます）"
					: "Fix missing thumbnails for portfolio items?\n(First image will be set as thumbnail for each item)",
			)
		) {
			return;
		}

		setIsLoading(true);
		console.log("Fixing thumbnails...");
		const response = await fetch("/api/admin/fix-thumbnails", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((error) => {
			console.error("Error fixing thumbnails:", error);
			alert(
				isClient
					? `エラーが発生しました: ${error instanceof Error ? error.message : "Unknown error"}`
					: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			setIsLoading(false);
			return null;
		});
		if (!response) return;

		const result = await response.json();
		console.log("Fix thumbnails result:", result);

		if (response.ok) {
			alert(
				isClient
					? `✓ ${result.fixedItems?.length || 0}個のアイテムのサムネイルを修復しました`
					: `✓ Fixed thumbnails for ${result.fixedItems?.length || 0} items`,
			);
			await loadContentItems(selectedContentType, true);
		} else {
			console.error("Failed to fix thumbnails:", result);
			alert(
				isClient
					? `サムネイル修復に失敗しました: ${result.error}`
					: `Failed to fix thumbnails: ${result.error}`,
			);
		}
		setIsLoading(false);
	};

	// Design system classes matching root page
	const CardStyle =
		"  block p-4 space-y-4   focus: focus:ring-offset-2 focus:ring-offset-base";
	const Card_title =
		"neue-haas-grotesk-display text-xl leading-snug";

	const ButtonStyle =
		" px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";
	const ActiveButtonStyle =
		" px-4 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";

	return (
		<div className="min-h-dvh ">
			<main className="py-10">
				<div className="container-system">
					<div className="space-y-8">
						{/* Header */}
						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl ">
								Data Manager
							</h1>
							<p className="noto-sans-jp-light text-sm max-w-2xl leading-loose">
								コンテンツデータの作成・編集・管理を行います.
								<br />
								動画、画像、埋め込み要素、Markdownファイルなどを統合管理できます.
							</p>
						</header>

						{/* Content Type Selector */}
						<section className="space-y-4">
							<h2 className={Card_title}>Content Type</h2>
							<div className="flex flex-wrap gap-2">
								{(
									[
										"portfolio",
										"blog",
										"plugin",
										"download",
										"tool",
										"profile",
									] as ContentType[]
								).map((type) => (
									<button type="button"
										key={type}
										onClick={() => setSelectedContentType(type)}
										className={
											selectedContentType === type
												? ActiveButtonStyle
												: ButtonStyle
										}
										disabled={isLoading}
									>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</button>
								))}
							</div>
						</section>

						{/* Main Content Area */}
						<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
							{/* Content List */}
							<div className="lg:col-span-2">
								<div className={CardStyle}>
									<div className="flex justify-between items-center">
										<h3 className={Card_title}>
											{selectedContentType.charAt(0).toUpperCase() +
												selectedContentType.slice(1)}{" "}
											Items
										</h3>
										<div className="flex gap-2">
											{selectedContentType === "portfolio" && (
												<button type="button"
													onClick={handleFixThumbnails}
													className={ButtonStyle}
													disabled={isLoading}
													title="Fix missing thumbnails for portfolio items"
												>
													{isClient ? "🔧 サムネイル修復" : "🔧 Fix Thumbnails"}
												</button>
											)}
											<button type="button"
												onClick={handleCreateNew}
												className={ButtonStyle}
												disabled={isLoading}
											>
												{isClient ? "+ 新規作成" : "+ New"}
											</button>
										</div>
									</div>

									<ContentList
										items={contentItems}
										selectedItem={selectedItem}
										onSelectItem={handleEditItem}
										onDeleteItem={handleDeleteItem}
										isLoading={isLoading}
									/>
								</div>
							</div>

							{/* Form/Preview Area */}
							<div className="lg:col-span-3">
								{selectedItem ? (
									<div className="space-y-4">
										{/* Form/Preview Toggle and Status */}
										<div className="flex justify-between items-center">
											<div className="flex gap-2">
												<button type="button"
													onClick={() => setPreviewMode("form")}
													className={
														previewMode === "form"
															? ActiveButtonStyle
															: ButtonStyle
													}
												>
													{isClient ? "編集フォーム" : "Edit Form"}
												</button>
												<button type="button"
													onClick={() => setPreviewMode("preview")}
													className={
														previewMode === "preview"
															? ActiveButtonStyle
															: ButtonStyle
													}
												>
													{isClient ? "プレビュー" : "Preview"}
												</button>
											</div>

											{/* Save Status */}
											{saveStatus !== "idle" && (
												<div className="flex items-center gap-2">
													{saveStatus === "saving" && (
														<span className=" text-sm">
															{isClient ? "保存中..." : "Saving..."}
														</span>
													)}
													{saveStatus === "success" && (
														<span className=" text-sm">
															{isClient ? "✓ 保存完了" : "✓ Saved"}
														</span>
													)}
													{saveStatus === "error" && (
														<span className=" text-sm">
															{isClient ? "✗ エラー" : "✗ Error"}
														</span>
													)}
												</div>
											)}
										</div>

										{/* Content */}
										<div className={CardStyle}>
											{previewMode === "form" ? (
												<DataManagerForm
													item={selectedItem}
													onSave={handleSaveItem}
													onCancel={handleCancel}
													isLoading={isLoading}
													saveStatus={saveStatus}
													enhanced={true} // Enable enhanced features
												/>
											) : (
												<PreviewPanel
													item={selectedItem}
													onEdit={() => setPreviewMode("form")}
												/>
											)}
										</div>
									</div>
								) : (
									<div className={CardStyle}>
										<div className="text-center py-12">
											<p className="noto-sans-jp-light text-sm ">
												{isClient
													? "編集するアイテムを選択するか、新しいアイテムを作成してください"
													: "Select an item to edit or create a new one"}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Loading Overlay */}
						{isLoading && (
							<div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
								<div className="  p-6 rounded">
									<p className="noto-sans-jp-regular text-sm">
										{isClient ? "処理中..." : "Processing..."}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
