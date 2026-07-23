"use client";

import type { PomodoroSettings } from "../../types";
import { ElasticSlider } from "../ElasticSlider";

export const YoutubeTab = ({
	theme,
	settings,
	highlightColor,
	onUpdateSettings,
}: {
	theme: string;
	settings: PomodoroSettings;
	highlightColor: string;
	onUpdateSettings: (updates: Partial<PomodoroSettings>) => void;
}) => {
	return (
		<div className="space-y-6">
			<div>
				<h3
					className={`text-lg font-semibold mb-2 ${theme === "dark" ? "" : ""}`}
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
						<span className="text-sm">休憩が始まったら自動で一時停止する</span>
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
							onChange={(v) => onUpdateSettings({ youtubeDefaultVolume: v })}
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
	);
};
