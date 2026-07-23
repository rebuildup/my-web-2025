import { clientMarkdownService } from "@/lib/markdown/client-service";
import type { EnhancedCategoryType, EnhancedContentItem, EnhancedFileUploadOptions } from "@/types";
import { isEnhancedContentItem } from "@/types";
import { useEffect, useState } from "react";
import type { ActiveTab, EnhancedInputChangeHandler, FormData, InputChangeHandler } from "./data-manager-form.types";
import { prepareDataToSave, validateFormData } from "./data-manager-form.utils";

const defaultUploadOptions: EnhancedFileUploadOptions = { skipProcessing: false, preserveOriginal: true, generateVariants: false, customProcessing: { resize: { width: 1920, height: 1080 }, format: "jpeg", watermark: false } };

export function useDataManagerForm(item: FormData, enhanced: boolean, onSave: (item: FormData) => void) {
	const [isClient, setIsClient] = useState(false);
	const [formData, setFormData] = useState<FormData>(item);
	const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
	const [useManualDate, setUseManualDate] = useState(false);
	const [uploadOptions, setUploadOptions] = useState(defaultUploadOptions);
	const [markdownFilePath, setMarkdownFilePath] = useState<string | undefined>(enhanced ? (item as EnhancedContentItem).markdownPath : undefined);
	const [markdownContent, setMarkdownContent] = useState(formData.content || "");
	const [needsMarkdownMigration, setNeedsMarkdownMigration] = useState(enhanced && !!(formData.content && !markdownFilePath));
	const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
	const [markdownLoadError, setMarkdownLoadError] = useState<string | null>(null);
	const [, setCategoryChangeImpact] = useState<{ show: boolean; oldCategories: EnhancedCategoryType[]; newCategories: EnhancedCategoryType[]; impacts: string[] }>({ show: false, oldCategories: [], newCategories: [], impacts: [] });

	useEffect(() => {
		setIsClient(true); setFormData(item);
		const path = enhanced ? (item as EnhancedContentItem).markdownPath : undefined;
		setMarkdownFilePath(path); setNeedsMarkdownMigration(enhanced && !!(item.content && !path)); setMarkdownLoadError(null);
		if (enhanced && isEnhancedContentItem(item)) { const use = item.useManualDate || false; setUseManualDate(use); console.log("Date management state updated:", { useManualDate: use, manualDate: item.manualDate, itemId: item.id }); } else setUseManualDate(false);
		const controller = new AbortController();
		const load = async () => {
			if (!enhanced || !path) { console.log("Markdownパスなし、item.contentを使用:", item.content?.length || 0, "文字"); setMarkdownContent(item.content || ""); return; }
			setIsLoadingMarkdown(true); console.log("=== Markdownファイル読み込み開始 ==="); console.log("読み込み対象パス:", path);
			const existsResponse = await fetch(`/api/markdown?action=fileExists&filePath=${encodeURIComponent(path)}`, { signal: controller.signal }).catch((error) => { if ((error as Error).name !== "AbortError") console.warn("ファイル存在確認でエラーが発生しました:", error); return null; });
			if (controller.signal.aborted) return;
			if (existsResponse?.ok) { const data = await existsResponse.json().catch(() => null); console.log("ファイル存在確認結果:", data); if (!data || data.exists === false) { console.warn(`Markdownファイルが存在しません: ${path}`); setMarkdownFilePath(undefined); setMarkdownContent(item.content || ""); setMarkdownLoadError(null); setIsLoadingMarkdown(false); return; } } else console.warn("ファイル存在確認に失敗しましたが、読み込みを続行します");
			const response = await fetch(`/api/markdown?action=getMarkdownContent&filePath=${encodeURIComponent(path)}`, { signal: controller.signal }).catch((error) => { if ((error as Error).name !== "AbortError") console.error("Markdownコンテンツ取得でエラー:", error); return null; });
			if (controller.signal.aborted) return;
			if (response?.ok) { const data = await response.json().catch(() => null); if (data?.content !== undefined) { console.log("Markdownコンテンツ取得成功:", data.content?.length || 0, "文字"); setMarkdownContent(data.content); setMarkdownLoadError(null); setIsLoadingMarkdown(false); return; } console.warn("APIレスポンスにコンテンツが含まれていません"); }
			else if (response) { const data = await response.json().catch(() => ({})); console.error(`Markdown API エラー: ${response.status} - ${data.error || "不明なエラー"}`); }
			if (!controller.signal.aborted) { setMarkdownLoadError("Markdownファイルの読み込みに失敗しました"); console.log("Markdownファイル読み込み失敗、item.contentを使用:", item.content?.length || 0, "文字"); setMarkdownContent(item.content || ""); setIsLoadingMarkdown(false); }
		};
		load(); return () => controller.abort();
	}, [item, enhanced]);

	const handleInputChange: InputChangeHandler = (field, value) => setFormData((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
	const handleEnhancedInputChange: EnhancedInputChangeHandler = (field, value) => setFormData((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
	const analyzeCategoryChangeImpact = (oldCategories: EnhancedCategoryType[], newCategories: EnhancedCategoryType[]) => {
		const impacts: string[] = []; const removed = oldCategories.filter((cat) => !newCategories.includes(cat)); const added = newCategories.filter((cat) => !oldCategories.includes(cat)); const label = (cat: string) => cat === "video&design" ? "Video & Design" : cat.charAt(0).toUpperCase() + cat.slice(1);
		if (removed.length) impacts.push(`Will be removed from: ${removed.map(label).join(", ")} galleries`); if (added.length) impacts.push(`Will be added to: ${added.map(label).join(", ")} galleries`);
		if (!oldCategories.includes("other") && newCategories.includes("other")) impacts.push("⚠ Will only appear in 'All' gallery due to 'Other' category"); else if (oldCategories.includes("other") && !newCategories.includes("other")) impacts.push("✓ Will now appear in specific category galleries"); if (!newCategories.length) impacts.push("⚠ No categories selected - item may not be visible in galleries"); return impacts;
	};
	const handleCategoriesChange = (categories: EnhancedCategoryType[]) => { if (enhanced && isEnhancedContentItem(formData)) { const oldCategories = formData.categories || []; if (oldCategories.length && JSON.stringify(oldCategories.sort()) !== JSON.stringify(categories.sort())) { const impacts = analyzeCategoryChangeImpact(oldCategories, categories); if (impacts.length) setCategoryChangeImpact({ show: true, oldCategories, newCategories: categories, impacts }); } handleEnhancedInputChange("categories", categories); handleEnhancedInputChange("isOtherCategory", categories.includes("other")); } };
	const handleDateChange = (date: string) => { console.log("=== handleDateChange called ===", { date, useManualDate, enhanced }); if (enhanced) { const updatedData = { ...(formData as EnhancedContentItem), manualDate: date || new Date().toISOString(), useManualDate, updatedAt: new Date().toISOString() }; setFormData(updatedData); console.log("Date changed - updated formData:", { date, useManualDate, updatedManualDate: updatedData.manualDate, updatedUseManualDate: updatedData.useManualDate }); } };
	const handleToggleManualDate = (use: boolean) => { console.log("=== handleToggleManualDate called ===", { use, enhanced }); setUseManualDate(use); if (enhanced) { const current = formData as EnhancedContentItem; const updatedData = { ...current, useManualDate: use, updatedAt: new Date().toISOString(), manualDate: current.manualDate || new Date().toISOString() }; setFormData(updatedData); console.log("Manual date toggle - updated formData:", { use, previousManualDate: current.manualDate, updatedUseManualDate: updatedData.useManualDate, updatedManualDate: updatedData.manualDate }); } };
	const createMarkdownFile = async (content: string) => { if (!enhanced) return null; const filePath = await clientMarkdownService.generateFilePath(formData.id, formData.type).catch((error) => { console.error("Failed to create markdown file:", error); return null; }); if (!filePath) return null; const created = await clientMarkdownService.createMarkdownFile(formData.id, formData.type, content).catch((error) => { console.error("Failed to create markdown file:", error); return null; }); return created ? filePath : null; };
	const updateMarkdownFile = async (filePath: string, content: string) => { if (!enhanced) return false; return Boolean(await clientMarkdownService.updateMarkdownFile(filePath, content).catch((error) => { console.error("Failed to update markdown file:", error); return null; })); };
	const handleMarkdownSave = async (content: string, filePath: string) => { if (!enhanced) return; if (filePath && await clientMarkdownService.fileExists(filePath).catch(() => false)) { await updateMarkdownFile(filePath, content); return; } const path = await createMarkdownFile(content); if (path) { setMarkdownFilePath(path); handleEnhancedInputChange("markdownPath", path); } };
	const migrateContentToMarkdown = async () => { if (!enhanced || !formData.content || markdownFilePath) return; const path = await createMarkdownFile(formData.content); if (!path) { console.error("Failed to migrate content to markdown"); alert("コンテンツのMarkdownファイルへの移行に失敗しました.もう一度お試しください."); return; } setMarkdownFilePath(path); handleEnhancedInputChange("markdownPath", path); setNeedsMarkdownMigration(false); handleInputChange("content", ""); };
	const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); console.log("=== Form submission started ==="); console.log("Original form data:", JSON.stringify(formData, null, 2)); console.log("Thumbnail in formData:", formData.thumbnail); console.log("Images in formData:", formData.images);
		let savePath = markdownFilePath;
		if (enhanced && markdownContent) { if (savePath) { if (!await updateMarkdownFile(savePath, markdownContent)) { alert("Markdownファイルの保存に失敗しました.もう一度お試しください."); return; } } else { savePath = await createMarkdownFile(markdownContent) || undefined; if (!savePath) { alert("Markdownファイルの保存に失敗しました.もう一度お試しください."); return; } setMarkdownFilePath(savePath); handleEnhancedInputChange("markdownPath", savePath); } }
		if (!validateFormData(formData, enhanced)) return; const dataToSave = prepareDataToSave(formData, enhanced, markdownFilePath, markdownContent, useManualDate); console.log("Data to save:", JSON.stringify(dataToSave, null, 2)); console.log("Thumbnail in dataToSave:", dataToSave.thumbnail); console.log("Images in dataToSave:", dataToSave.images); console.log("Calling onSave..."); onSave(dataToSave);
	};
	return { isClient, formData, activeTab, setActiveTab, useManualDate, uploadOptions, setUploadOptions, markdownFilePath, markdownContent, needsMarkdownMigration, setNeedsMarkdownMigration, isLoadingMarkdown, markdownLoadError, handleInputChange, handleEnhancedInputChange, handleCategoriesChange, handleTagsChange: (tags: string[]) => handleInputChange("tags", tags), handleMarkdownContentChange: (content: string) => { setMarkdownContent(content); handleInputChange("content", content); }, handleMarkdownSave, migrateContentToMarkdown, handleDateChange, handleToggleManualDate, handleSubmit };
}
