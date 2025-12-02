"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { PomodoroSettings } from "../types";
import { DEFAULT_HIGHLIGHT_COLOR } from "../types";
import { ElasticSlider } from "./ElasticSlider";

interface SettingsPanelProps {
	settings: PomodoroSettings;
	onSettingsChange: (settings: PomodoroSettings) => void;
	onClose: () => void;
}

export default function SettingsPanel({
	settings,
	onSettingsChange,
	onClose,
}: SettingsPanelProps) {
	const tabs: Array<{
		key: "time" | "youtube" | "notification" | "display";
		label: string;
	}> = [
		{ key: "time", label: "時間" },
		{ key: "youtube", label: "YouTube" },
		{ key: "notification", label: "通知" },
		{ key: "display", label: "表示" },
	];
	const [activeTab, setActiveTab] = useState<
		"time" | "youtube" | "notification" | "display"
	>("time");

	const updateSetting = <K extends keyof PomodoroSettings>(
		key: K,
		value: PomodoroSettings[K],
	) => {
		onSettingsChange({ ...settings, [key]: value });
	};

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6 select-text">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-main">タイマー設定</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-main hover:text-main transition-colors"
					aria-label="設定を閉じる"
				>
					<X size={20} />
				</button>
			</div>

			<div className="space-y-6">
				{/* Tab Buttons */}
				<div className="flex gap-2 flex-wrap border-b border-main/10 pb-2">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`px-4 py-2 text-sm rounded-lg transition-colors ${
								activeTab === tab.key
									? "bg-main/20 text-main font-semibold"
									: "bg-transparent text-main/60 hover:text-main"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Time Settings */}
				{activeTab === "time" && (
					<div className="space-y-4">
						<h4 className="font-medium text-main">時間設定</h4>

						<div className="grid grid-2 gap-4">
							<ElasticSlider
								min={15}
								max={60}
								step={5}
								value={settings.workDuration}
								onChange={(v) => updateSetting("workDuration", v)}
								accentColor={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
								label="作業時間"
								valueLabel={`${settings.workDuration}分`}
							/>
							<ElasticSlider
								min={1}
								max={10}
								step={1}
								value={settings.shortBreakDuration}
								onChange={(v) => updateSetting("shortBreakDuration", v)}
								accentColor={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
								label="短い休憩"
								valueLabel={`${settings.shortBreakDuration}分`}
							/>
							<ElasticSlider
								min={10}
								max={30}
								step={5}
								value={settings.longBreakDuration}
								onChange={(v) => updateSetting("longBreakDuration", v)}
								accentColor={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
								label="長い休憩"
								valueLabel={`${settings.longBreakDuration}分`}
							/>
							<ElasticSlider
								min={2}
								max={8}
								step={1}
								value={settings.sessionsUntilLongBreak}
								onChange={(v) => updateSetting("sessionsUntilLongBreak", v)}
								accentColor={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
								label="長い休憩までのセット数"
								valueLabel={`${settings.sessionsUntilLongBreak}セット`}
							/>
						</div>
					</div>
				)}

				{/* YouTube Settings */}
				{activeTab === "youtube" && (
					<div className="space-y-4">
						<h4 className="font-medium text-main">YouTubeプレイヤー設定</h4>
						<div className="space-y-3">
							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={settings.autoPlayOnFocusSession ?? true}
									onChange={(e) =>
										updateSetting("autoPlayOnFocusSession", e.target.checked)
									}
									className="w-4 h-4"
								/>
								<span className="text-sm">集中開始時に自動再生</span>
							</label>

							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={settings.pauseOnBreak ?? true}
									onChange={(e) =>
										updateSetting("pauseOnBreak", e.target.checked)
									}
									className="w-4 h-4"
								/>
								<span className="text-sm">休憩中は一時停止</span>
							</label>

							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={settings.youtubeLoop ?? false}
									onChange={(e) =>
										updateSetting("youtubeLoop", e.target.checked)
									}
									className="w-4 h-4"
								/>
								<span className="text-sm">ループ再生を有効にする</span>
							</label>

							<ElasticSlider
								min={0}
								max={100}
								value={settings.youtubeDefaultVolume ?? 30}
								onChange={(v) => updateSetting("youtubeDefaultVolume", v)}
								accentColor={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
								label="デフォルト音量"
								valueLabel={`${settings.youtubeDefaultVolume ?? 30}%`}
							/>
						</div>
					</div>
				)}

				{/* Notification Settings */}
				{activeTab === "notification" && (
					<div className="space-y-4">
						<h4 className="font-medium text-main">通知設定</h4>
						<div className="space-y-3">
							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={settings.notificationSound}
									onChange={(e) =>
										updateSetting("notificationSound", e.target.checked)
									}
									className="w-4 h-4"
								/>
								<span className="text-sm">通知音を有効</span>
							</label>

							{settings.notificationSound && (
								<ElasticSlider
									min={0}
									max={100}
									step={10}
									value={settings.notificationVolume}
									onChange={(v) => updateSetting("notificationVolume", v)}
									accentColor={
										settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR
									}
									label="通知音量"
									valueLabel={`${settings.notificationVolume}%`}
								/>
							)}

							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={settings.vibration}
									onChange={(e) => updateSetting("vibration", e.target.checked)}
									className="w-4 h-4"
								/>
								<span className="text-sm">振動通知（モバイル）</span>
							</label>
						</div>
					</div>
				)}

				{/* Theme Settings */}
				{activeTab === "display" && (
					<div className="space-y-4">
						<h4 className="font-medium text-main">表示設定</h4>
						<div>
							<label className="block text-sm font-medium mb-2">テーマ</label>
							<select
								value={settings.theme}
								onChange={(e) =>
									updateSetting("theme", e.target.value as "light" | "dark")
								}
								className="w-full p-2 rounded-lg bg-main/10"
							>
								<option value="light">ライト</option>
								<option value="dark">ダーク</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">
								ハイライトカラー
							</label>
							<div className="flex items-center gap-3">
								<input
									type="color"
									value={settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
									onChange={(e) =>
										updateSetting("highlightColor", e.target.value)
									}
									className="w-12 h-10 rounded border border-main/20 bg-transparent cursor-pointer"
								/>
								<div className="flex gap-2">
									{["#3b82f6", "#06b6d4", "#ec4899", "#f97316", "#22c55e"].map(
										(color) => (
											<button
												key={color}
												type="button"
												onClick={() => updateSetting("highlightColor", color)}
												className={`w-8 h-8 rounded-full border ${
													settings.highlightColor === color
														? "border-main"
														: "border-transparent"
												}`}
												style={{ backgroundColor: color }}
												aria-label={`ハイライトカラー ${color}`}
											/>
										),
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Reset Button */}
				<div className="pt-4 border-t border-main/20">
					<button
						type="button"
						onClick={() => {
							const defaultSettings = {
								workDuration: 25,
								shortBreakDuration: 5,
								longBreakDuration: 15,
								sessionsUntilLongBreak: 4,
								notificationSound: true,
								notificationVolume: 50,
								vibration: true,
								theme: "light" as const,
								autoPlayOnFocusSession: true,
								pauseOnBreak: true,
								youtubeDefaultVolume: 30,
								youtubeLoop: false,
								highlightColor: DEFAULT_HIGHLIGHT_COLOR,
							};
							onSettingsChange(defaultSettings);
						}}
						className="w-full px-4 py-2 rounded-lg bg-main/10 hover:bg-main/20 transition-colors text-sm"
					>
						設定をリセット
					</button>
				</div>
			</div>
		</div>
	);
}
