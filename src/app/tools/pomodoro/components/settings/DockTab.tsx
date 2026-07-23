"use client";

import {
	BarChart2,
	Image as ImageIcon,
	Moon,
	Music,
	StickyNote,
	Sun,
	Timer,
} from "lucide-react";
import type { DockVisibilityKey } from "./types";

export const DockTab = ({
	theme,
	dockVisibility,
	onUpdateDockVisibility,
}: {
	theme: string;
	dockVisibility: Record<DockVisibilityKey, boolean>;
	onUpdateDockVisibility: (key: DockVisibilityKey, visible: boolean) => void;
}) => {
	const dockItems: Array<{
		key: DockVisibilityKey;
		icon: React.ComponentType<{ size?: number; className?: string }>;
		name: string;
	}> = [
		{ key: "note", icon: StickyNote, name: "メモ" },
		{ key: "image", icon: ImageIcon, name: "画像" },
		{ key: "music", icon: Music, name: "YouTube" },
		{ key: "timer", icon: Timer, name: "タイマー" },
		{ key: "stats", icon: BarChart2, name: "統計" },
		{
			key: "theme",
			icon: theme === "dark" ? Sun : Moon,
			name: "テーマ",
		},
	];

	return (
		<div className="space-y-6">
			<h3 className={`text-lg font-semibold ${theme === "dark" ? "" : ""}`}>
				ドックとウィジェット設定
			</h3>

			<div className="space-y-2">
				<p className={`text-sm ${theme === "dark" ? "" : ""}`}>
					ドックに表示する項目を選択します.
				</p>
				{dockItems.map(({ key, icon: Icon, name }) => (
					<label
						key={key}
						className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
							theme === "dark" ? " " : " "
						} ${theme === "dark" ? "" : ""}`}
					>
						<Icon
							size={16}
							className={`shrink-0 ${theme === "dark" ? "" : ""} ${
								dockVisibility[key] ? "" : ""
							}`}
						/>
						<span className={`flex-1 text-sm ${theme === "dark" ? "" : ""}`}>
							{name}
						</span>
						<input
							type="checkbox"
							checked={dockVisibility[key]}
							onChange={(e) => onUpdateDockVisibility(key, e.target.checked)}
							className="w-4 h-4 shrink-0 cursor-pointer"
						/>
					</label>
				))}
			</div>
		</div>
	);
};
