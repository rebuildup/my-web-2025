import { DatePicker } from "@/components/ui/DatePicker";
import { clientDateManager } from "@/lib/portfolio/client-date-manager";
import type { EnhancedContentItem } from "@/types";
import type { FormData } from "./data-manager-form.types";

interface DateFieldsProps { formData: FormData; enhanced: boolean; useManualDate: boolean; handleDateChange: (date: string) => void; handleToggleManualDate: (use: boolean) => void; }
const formatDate = (value: string) => new Date(value).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

export function DateFields({ formData, enhanced, useManualDate, handleDateChange, handleToggleManualDate }: DateFieldsProps) {
	const enhancedData = formData as EnhancedContentItem;
	return <div className="space-y-6">
		<div className="  p-4 rounded-lg"><h3 className="neue-haas-grotesk-display text-xl leading-snug mb-4">日付管理</h3><p className="noto-sans-jp-light text-xs pb-2  mb-4">このコンテンツアイテムの日付管理方法を制御します.自動日付管理（作成・更新時刻に基づく）または手動日付設定を選択できます.</p><DatePicker value={enhancedData.manualDate} onChange={handleDateChange} useManualDate={useManualDate} onToggleManualDate={handleToggleManualDate} placeholder="日付を選択してください..." /></div>
		<div className="  p-4 rounded-lg"><h4 className="noto-sans-jp-regular text-sm font-medium mb-2">現在の日付情報</h4><div className="space-y-2 text-sm "><div><span className="font-medium">作成日:</span> {formatDate(formData.createdAt)}</div><div><span className="font-medium">最終更新:</span> {formatDate(formData.updatedAt || formData.createdAt)}</div>{enhanced && enhancedData.manualDate && <div><span className="font-medium">手動設定日:</span> {formatDate(enhancedData.manualDate)}</div>}<div><span className="font-medium">有効日付:</span> {enhanced ? clientDateManager.getEffectiveDate(enhancedData).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }) : formatDate(formData.createdAt)}</div></div></div>
		<div className="  p-4 rounded-lg"><h4 className="noto-sans-jp-regular text-sm font-medium mb-2">Date History</h4><p className="noto-sans-jp-light text-xs ">Date changes are automatically tracked. The effective date will be used for sorting and display purposes throughout the application.</p></div>
	</div>;
}
