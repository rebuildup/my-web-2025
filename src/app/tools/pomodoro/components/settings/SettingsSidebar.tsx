"use client";

import { X } from "lucide-react";
import type { SettingsTab } from "./types";

export const SettingsSidebar = ({
	theme,
	settingsTab,
	onTabChange,
	onClose,
}: {
	theme: string;
	settingsTab: SettingsTab;
	onTabChange: (tab: SettingsTab) => void;
	onClose: () => void;
}) => {
	const tabs: Array<{ key: SettingsTab; label: string }> = [
		{ key: "workflow", label: "ワークフロー" },
		{ key: "dock", label: "ドック" },
		{ key: "widgets", label: "ウィジェット" },
		{ key: "youtube", label: "YouTube" },
	];

	return (
		<div
			className={`md:w-64    flex flex-row md:flex-col shrink-0 ${
				theme === "dark" ? "" : ""
			}`}
		>
			<div
				className={`flex items-center justify-between p-4   shrink-0 ${
					theme === "dark" ? "" : ""
				}`}
			>
				<h2 className={`text-xl font-bold ${theme === "dark" ? "" : ""}`}>
					設定
				</h2>
				<button
					onClick={onClose}
					className={`p-2 ${theme === "dark" ? " " : " "}`}
					aria-label="設定パネルを閉じる"
				>
					<X size={20} />
				</button>
			</div>
			<div className="flex flex-row md:flex-col flex-1 overflow-x-auto md:overflow-y-auto p-2 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => onTabChange(tab.key)}
						className={`whitespace-nowrap text-left px-4 py-3 md:w-full ${settingsTab === tab.key ? (theme === "dark" ? " " : " ") : theme === "dark" ? " " : " "} ${tab.key === "workflow" ? "md:mb-1" : ""}`}
					>
						{tab.label}
					</button>
				))}
			</div>
		</div>
	);
};
