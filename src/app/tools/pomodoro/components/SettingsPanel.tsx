"use client";

import { X } from "lucide-react";
import type { PomodoroSettings } from "../types";

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
				{/* Time Settings */}
				<div className="space-y-4">
					<h4 className="font-medium text-main">時間設定</h4>

					<div className="grid grid-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								作業時間: {settings.workDuration}分
							</label>
							<input
								type="range"
								min="15"
								max="60"
								step="5"
								value={settings.workDuration}
								onChange={(e) =>
									updateSetting("workDuration", parseInt(e.target.value, 10))
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-main mt-1">
								<span>15分</span>
								<span>60分</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								短い休憩: {settings.shortBreakDuration}分
							</label>
							<input
								type="range"
								min="1"
								max="10"
								step="1"
								value={settings.shortBreakDuration}
								onChange={(e) =>
									updateSetting(
										"shortBreakDuration",
										parseInt(e.target.value, 10),
									)
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-main mt-1">
								<span>1分</span>
								<span>10分</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								長い休憩: {settings.longBreakDuration}分
							</label>
							<input
								type="range"
								min="10"
								max="30"
								step="5"
								value={settings.longBreakDuration}
								onChange={(e) =>
									updateSetting(
										"longBreakDuration",
										parseInt(e.target.value, 10),
									)
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-main mt-1">
								<span>10分</span>
								<span>30分</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								長い休憩までのセット数: {settings.sessionsUntilLongBreak}
							</label>
							<input
								type="range"
								min="2"
								max="8"
								step="1"
								value={settings.sessionsUntilLongBreak}
								onChange={(e) =>
									updateSetting(
										"sessionsUntilLongBreak",
										parseInt(e.target.value, 10),
									)
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-main mt-1">
								<span>2セット</span>
								<span>8セット</span>
							</div>
						</div>
					</div>
				</div>

				{/* YouTube Player Settings */}
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

						<div>
							<label className="block text-sm font-medium mb-2">
								デフォルト音量: {settings.youtubeDefaultVolume ?? 30}%
							</label>
							<input
								type="range"
								min="0"
								max="100"
								value={settings.youtubeDefaultVolume ?? 30}
								onChange={(e) =>
									updateSetting(
										"youtubeDefaultVolume",
										parseInt(e.target.value, 10),
									)
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-main mt-1">
								<span>0%</span>
								<span>100%</span>
							</div>
						</div>
					</div>
				</div>

				{/* Notification Settings */}
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
							<div>
								<label className="block text-sm font-medium mb-2">
									音量: {settings.notificationVolume}%
								</label>
								<input
									type="range"
									min="0"
									max="100"
									step="10"
									value={settings.notificationVolume}
									onChange={(e) =>
										updateSetting(
											"notificationVolume",
											parseInt(e.target.value, 10),
										)
									}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-main mt-1">
									<span>0%</span>
									<span>100%</span>
								</div>
							</div>
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

				{/* Theme Settings */}
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
				</div>

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
