"use client";

import { Maximize2, Minimize2, Settings } from "lucide-react";

interface YouTubePlayerHeaderProps {
	theme: "light" | "dark";
	isMinimized: boolean;
	showSettings: boolean;
	onToggleMinimize: () => void;
	onToggleSettings: () => void;
}

export function YouTubePlayerHeader({
	theme,
	isMinimized,
	showSettings,
	onToggleMinimize,
	onToggleSettings,
}: YouTubePlayerHeaderProps) {
	return (
		<div
			className={`flex items-center justify-between p-2  ${
				theme === "dark" ? "" : ""
			}`}
		>
			<div className="flex items-center gap-2">
				<span className="text-xs font-bold uppercase tracking-wider ">
					YouTube Player
				</span>
			</div>
			<div className="flex items-center gap-1">
				<button
					onClick={onToggleMinimize}
					className="p-1.5"
					aria-label={isMinimized ? "最大化" : "最小化"}
				>
					{isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
				</button>
				<button
					onClick={onToggleSettings}
					className={`p-1.5 ${showSettings ? "" : ""}`}
					aria-label="設定"
				>
					<Settings size={14} />
				</button>
			</div>
		</div>
	);
}
