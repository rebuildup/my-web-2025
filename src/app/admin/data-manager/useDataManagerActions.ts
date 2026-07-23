"use client";

import { ContentItem, ContentType } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";
import { useCallback, useRef, useState } from "react";

export type ManagedContentItem = ContentItem | EnhancedContentItem;
export type PreviewMode = "form" | "preview";
export type SaveStatus = "idle" | "saving" | "success" | "error";

export const CardStyle =
	"  block p-4 space-y-4   focus: focus:ring-offset-2 focus:ring-offset-base";
export const Card_title = "neue-haas-grotesk-display text-xl leading-snug";
export const ButtonStyle =
	" px-4 py-2 text-sm hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";
export const ActiveButtonStyle =
	" px-4 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";

export interface UseDataManagerActions {
	isClient: boolean;
	setIsClient: (value: boolean) => void;
	selectedContentType: ContentType;
	setSelectedContentType: (type: ContentType) => void;
	contentItems: ContentItem[];
	selectedItem: ManagedContentItem | null;
	isLoading: boolean;
	previewMode: PreviewMode;
	setPreviewMode: (mode: PreviewMode) => void;
	saveStatus: SaveStatus;
	loadContentItems: (type: ContentType, forceRefresh?: boolean) => Promise<void>;
	handleSaveItem: (item: ManagedContentItem) => Promise<void>;
	handleFixThumbnails: () => Promise<void>;
	handleCreateNew: () => void;
	handleDeleteItem: (id: string) => Promise<void>;
	handleEditItem: (item: ManagedContentItem) => void;
	handleCancel: () => void;
}

export function useDataManagerActions(): UseDataManagerActions {
	const [isClient, setIsClient] = useState(false);
	const idSeedRef = useRef(1);
	const nextSeed = useCallback(() => {
		idSeedRef.current += 1;
		return idSeedRef.current;
	}, []);

	const [selectedContentType, setSelectedContentType] =
		useState<ContentType>("portfolio");
	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<ManagedContentItem | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [previewMode, setPreviewMode] = useState<PreviewMode>("form");
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

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

	const handleEditItem = (item: ManagedContentItem) => {
		setSelectedItem(item);
		setPreviewMode("form");
	};

	const handleSaveItem = async (item: ManagedContentItem) => {
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

	return {
		isClient,
		setIsClient,
		selectedContentType,
		setSelectedContentType,
		contentItems,
		selectedItem,
		isLoading,
		previewMode,
		setPreviewMode,
		saveStatus,
		loadContentItems,
		handleSaveItem,
		handleFixThumbnails,
		handleCreateNew,
		handleDeleteItem,
		handleEditItem,
		handleCancel,
	};
}
