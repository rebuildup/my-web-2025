"use client";

import {
	BarChart2,
	Image as ImageIcon,
	Moon,
	Music,
	StickyNote,
	Sun,
	Timer,
	X,
} from "lucide-react";
import type { PomodoroSettings } from "../../types";
import type { ScheduleStep } from "../../utils/pomodoro-constants";
import { STICKY_NOTE_SIZE } from "../../utils/pomodoro-constants";
import { ElasticSlider } from "../ElasticSlider";

export type SettingsTab = "workflow" | "dock" | "widgets" | "youtube";

type DockVisibilityKey =
	| "note"
	| "image"
	| "music"
	| "timer"
	| "stats"
	| "theme"
	| "settings";

export const SettingsPanel = ({
	theme,
	settings,
	settingsTab,
	customSchedule,
	dockVisibility,
	highlightColor,
	onTabChange,
	onClose,
	onUpdateSchedule,
	onAddStep,
	onRemoveStep,
	onUpdateDockVisibility,
	onUpdateSettings,
	nextId,
}: {
	theme: string;
	settings: PomodoroSettings;
	settingsTab: SettingsTab;
	customSchedule: ScheduleStep[];
	dockVisibility: Record<DockVisibilityKey, boolean>;
	highlightColor: string;
	onTabChange: (tab: SettingsTab) => void;
	onClose: () => void;
	onUpdateSchedule: (index: number, updates: Partial<ScheduleStep>) => void;
	onAddStep: () => void;
	onRemoveStep: (index: number) => void;
	onUpdateDockVisibility: (key: DockVisibilityKey, visible: boolean) => void;
	onUpdateSettings: (updates: Partial<PomodoroSettings>) => void;
	nextId: () => number;
}) => {
	const tabs: Array<{ key: SettingsTab; label: string }> = [
		{ key: "workflow", label: "ワークフロー" },
		{ key: "dock", label: "ドック" },
		{ key: "widgets", label: "ウィジェット" },
		{ key: "youtube", label: "YouTube" },
	];

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
		<div className="fixed inset-0 z-2147483647 flex items-center justify-center pointer-events-auto">
			{/* Overlay */}
			<div className="absolute inset-0  " onClick={onClose} />
			{/* Panel */}
			<div
				className={`relative z-10 rounded-2xl border   max-w-6xl w-full mx-4 h-[calc(100vh-2rem)] md:h-[600px] overflow-hidden flex flex-col md:flex-row ${
					theme === "dark" ? "bg-[#1a1a1a]/95 " : " "
				}`}
			>
				{/* Tabs - Top on mobile, Left on desktop */}
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

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:">
					{settingsTab === "workflow" && (
						<div>
							<h3
								className={`text-lg font-semibold mb-4 ${
									theme === "dark" ? "" : ""
								}`}
							>
								ワークフローの編集
							</h3>
							<div className="space-y-2">
								{customSchedule.map((step, index) => (
									<div
										key={step.id}
										className={`flex items-center gap-2 p-2 rounded border ${
											theme === "dark" ? " " : " "
										}`}
									>
										<input
											type="text"
											value={step.label}
											onChange={(e) =>
												onUpdateSchedule(index, { label: e.target.value })
											}
											className={`flex-1 px-2 py-1.5 border text-sm ${theme === "dark" ? " " : " "}`}
											placeholder="ラベル"
											aria-label="ステップラベル"
										/>
										<input
											type="number"
											min="1"
											value={step.duration}
											onChange={(e) =>
												onUpdateSchedule(index, {
													duration: parseInt(e.target.value) || 1,
												})
											}
											className={`w-16 px-2 py-1.5 border text-sm ${theme === "dark" ? " " : " "}`}
											aria-label="分数"
										/>
										<span className={`text-xs ${theme === "dark" ? "" : ""}`}>
											分
										</span>
										<select
											value={step.type}
											onChange={(e) =>
												onUpdateSchedule(index, {
													type: e.target.value as "focus" | "break",
												})
											}
											aria-label="ステップ種別"
											className={`px-2 py-1.5 border text-sm appearance-none cursor-pointer ${theme === "dark" ? " " : " "}`}
											style={{
												backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${theme === "dark" ? "white" : "black"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
												backgroundRepeat: "no-repeat",
												backgroundPosition: "right 0.5rem center",
												paddingRight: "2rem",
											}}
										>
											<option value="focus">作業</option>
											<option value="break">休憩</option>
										</select>
										<button
											onClick={() => onRemoveStep(index)}
											className="p-1 shrink-0"
											aria-label="ステップを削除"
										>
											<X size={14} />
										</button>
									</div>
								))}
								<button
									onClick={onAddStep}
									className={`w-full py-3 border ${theme === "dark" ? " " : " "}`}
								>
									+ ステップを追加
								</button>
							</div>
						</div>
					)}

					{settingsTab === "dock" && (
						<div className="space-y-6">
							<h3
								className={`text-lg font-semibold ${
									theme === "dark" ? "" : ""
								}`}
							>
								ドックとウィジェット設定
							</h3>

							{/* Dock visibility */}
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
										<span
											className={`flex-1 text-sm ${theme === "dark" ? "" : ""}`}
										>
											{name}
										</span>
										<input
											type="checkbox"
											checked={dockVisibility[key]}
											onChange={(e) =>
												onUpdateDockVisibility(key, e.target.checked)
											}
											className="w-4 h-4 shrink-0 cursor-pointer"
										/>
									</label>
								))}
							</div>
						</div>
					)}

					{settingsTab === "widgets" && (
						<div className="space-y-6">
							<div>
								<h3
									className={`text-lg font-semibold mb-2 ${
										theme === "dark" ? "" : ""
									}`}
								>
									ウィジェットサイズ
								</h3>
								<p className={`text-sm mb-4 ${theme === "dark" ? "" : ""}`}>
									新しく追加するウィジェットの基本サイズを調整します.
								</p>
								<div className="space-y-4">
									<ElasticSlider
										min={160}
										max={360}
										step={10}
										value={settings.stickyWidgetSize ?? STICKY_NOTE_SIZE}
										onChange={(v) => onUpdateSettings({ stickyWidgetSize: v })}
										accentColor={highlightColor}
										label={
											<span className="block text-xs font-medium ">
												メモ / 画像 / タイマー / 統計
											</span>
										}
										valueLabel={`${settings.stickyWidgetSize ?? STICKY_NOTE_SIZE}px`}
									/>
									<ElasticSlider
										min={320}
										max={640}
										step={20}
										value={settings.youtubeWidgetWidth ?? 400}
										onChange={(v) =>
											onUpdateSettings({ youtubeWidgetWidth: v })
										}
										accentColor={highlightColor}
										label={
											<span className="block text-xs font-medium ">
												YouTubeウィジェットの幅
											</span>
										}
										valueLabel={`${settings.youtubeWidgetWidth ?? 400}px`}
									/>
								</div>
							</div>
						</div>
					)}

					{settingsTab === "youtube" && (
						<div className="space-y-6">
							<div>
								<h3
									className={`text-lg font-semibold mb-2 ${
										theme === "dark" ? "" : ""
									}`}
								>
									YouTubeプレイヤー設定
								</h3>
								<p className={`text-sm mb-4 ${theme === "dark" ? "" : ""}`}>
									全てのYouTubeウィジェットで共有する再生動作とデフォルト値です.
								</p>
								<div className="space-y-3">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={settings.autoPlayOnFocusSession ?? true}
											onChange={(e) =>
												onUpdateSettings({
													autoPlayOnFocusSession: e.target.checked,
												})
											}
											className="w-4 h-4"
										/>
										<span className="text-sm">集中開始時に自動再生する</span>
									</label>

									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={settings.pauseOnBreak ?? true}
											onChange={(e) =>
												onUpdateSettings({ pauseOnBreak: e.target.checked })
											}
											className="w-4 h-4"
										/>
										<span className="text-sm">
											休憩が始まったら自動で一時停止する
										</span>
									</label>

									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={settings.youtubeLoop ?? false}
											onChange={(e) =>
												onUpdateSettings({ youtubeLoop: e.target.checked })
											}
											className="w-4 h-4"
										/>
										<span className="text-sm">ループ再生を有効にする</span>
									</label>

									<div className="pt-2">
										<ElasticSlider
											min={0}
											max={100}
											value={settings.youtubeDefaultVolume ?? 30}
											onChange={(v) =>
												onUpdateSettings({ youtubeDefaultVolume: v })
											}
											accentColor={highlightColor}
											label={
												<span className="block text-xs font-medium ">
													デフォルト音量
												</span>
											}
											valueLabel={`${settings.youtubeDefaultVolume ?? 30}%`}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
