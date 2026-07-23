import type { ActiveTab, FormData } from "./data-manager-form.types";

interface FormHeaderProps {
	activeTab: ActiveTab;
	setActiveTab: (tab: ActiveTab) => void;
	formData: FormData;
	enhanced: boolean;
	activeTabStyle: string;
	tabStyle: string;
}

export function FormHeader({ activeTab, setActiveTab, formData, enhanced, activeTabStyle, tabStyle }: FormHeaderProps) {
	const tabClassName = (tab: ActiveTab) => activeTab === tab ? activeTabStyle : tabStyle;
	return (
		<div className="flex flex-wrap gap-2   pb-4">
			<button type="button" onClick={() => setActiveTab("basic")} className={tabClassName("basic")}>基本情報</button>
			<button type="button" onClick={() => setActiveTab("media")} className={tabClassName("media")}>メディア</button>
			<button type="button" onClick={() => setActiveTab("links")} className={tabClassName("links")}>リンク</button>
			{formData.type === "download" && <button type="button" onClick={() => setActiveTab("download")} className={tabClassName("download")}>ダウンロード</button>}
			<button type="button" onClick={() => setActiveTab("seo")} className={tabClassName("seo")}>SEO設定</button>
			{enhanced && <button type="button" onClick={() => setActiveTab("dates")} className={tabClassName("dates")}>日付管理</button>}
		</div>
	);
}
