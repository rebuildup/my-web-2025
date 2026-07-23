import { isEnhancedContentItem, isValidEnhancedPortfolioCategory } from "@/types";
import { isValidPortfolioCategory } from "@/types/content";
import type { FormData } from "./data-manager-form.types";

export function validateFormData(formData: FormData, enhanced: boolean): boolean {
	if (!formData.title.trim()) { console.error("Validation failed: Title is required"); alert("タイトルは必須項目です"); return false; }
	if (formData.type !== "portfolio") return true;
	if (enhanced && isEnhancedContentItem(formData)) {
		if (!formData.categories?.length) { console.error("Validation failed: At least one category is required"); alert("ポートフォリオアイテムには少なくとも1つのカテゴリを選択してください"); return false; }
		const invalidCategories = formData.categories.filter((cat) => !isValidEnhancedPortfolioCategory(cat));
		if (invalidCategories.length) { console.error("Validation failed: Invalid categories:", invalidCategories); alert(`無効なカテゴリが選択されています: ${invalidCategories.join(", ")}`); return false; }
		if (formData.categories.includes("other") && formData.categories.some((cat) => cat !== "other") && !confirm("警告: 「その他」カテゴリと特定のカテゴリの両方が選択されています.「その他」カテゴリを含むアイテムは、他のカテゴリに関係なく「すべて」ギャラリーにのみ表示されます.続行しますか？")) return false;
		if (formData.categories.length > 3) { console.error("Validation failed: Too many categories selected"); alert("カテゴリは最大3つまで選択できます"); return false; }
	} else {
		if (!formData.category) { console.error("Validation failed: Portfolio category is required"); alert("ポートフォリオアイテムにはカテゴリを選択してください"); return false; }
		if (!isValidPortfolioCategory(formData.category)) { console.error("Validation failed: Invalid portfolio category"); alert("有効なポートフォリオカテゴリを選択してください"); return false; }
	}
	return true;
}

export function prepareDataToSave(formData: FormData, enhanced: boolean, markdownFilePath: string | undefined, markdownContent: string, useManualDate: boolean) {
	const validExternalLinks = (formData.externalLinks || []).filter((link) => link.url.trim() && link.title.trim());
	return {
		...formData, title: formData.title.trim(), description: formData.description || "", tags: formData.tags || [], videos: formData.videos || [], images: formData.images || [], externalLinks: validExternalLinks, updatedAt: new Date().toISOString(),
		thumbnail: formData.thumbnail || (formData.images?.length ? formData.images[0] : undefined),
		...(enhanced && { markdownPath: markdownFilePath, content: markdownFilePath ? "" : markdownContent }),
		...(enhanced && isEnhancedContentItem(formData) ? { categories: formData.categories || [], isOtherCategory: formData.categories?.includes("other") || false, category: formData.categories?.[0] || "", useManualDate, manualDate: formData.manualDate || new Date().toISOString() } : { category: formData.category || "" }),
	};
}
