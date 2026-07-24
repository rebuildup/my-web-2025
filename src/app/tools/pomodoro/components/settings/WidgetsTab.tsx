"use client";

import type { PomodoroSettings } from "../../types";
import { STICKY_NOTE_SIZE } from "../../utils/pomodoro-constants";
import { ElasticSlider } from "../ElasticSlider";

export const WidgetsTab = ({
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
						onChange={(v) => onUpdateSettings({ youtubeWidgetWidth: v })}
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
	);
};
