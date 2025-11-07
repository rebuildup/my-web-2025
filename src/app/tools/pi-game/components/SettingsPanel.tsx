"use client";

import type { GameSettings } from "../types";

interface SettingsPanelProps {
	settings: GameSettings;
	onSettingsChange: (settings: GameSettings) => void;
	onClose: () => void;
}

export default function SettingsPanel({
	settings,
	onSettingsChange,
	onClose,
}: SettingsPanelProps) {
	const handleSettingChange = (key: keyof GameSettings, value: unknown) => {
		onSettingsChange({
			...settings,
			[key]: value,
		});
	};

	return (
		<div className="fixed inset-0 bg-base bg-opacity-95 flex items-center justify-center p-4 z-50">
			<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] max-w-md w-full">
				<div className="p-6 space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="neue-haas-grotesk-display text-2xl text-main">
							設定
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="text-accent hover:text-main text-2xl focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
							aria-label="閉じる"
						>
							×
						</button>
					</div>

					<div className="space-y-4">
						{/* Play Sound */}
						<div className="flex items-center justify-between">
							<label
								htmlFor="playSound"
								className="noto-sans-jp-light text-sm text-main"
							>
								効果音
							</label>
							<input
								id="playSound"
								type="checkbox"
								checked={settings.playSound}
								onChange={(e) =>
									handleSettingChange("playSound", e.target.checked)
								}
								className="w-4 h-4 text-main rounded bg-main/10 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							/>
						</div>
					</div>

					{/* Game Rules */}
					<div className="rounded-lg bg-main/10 p-4">
						<h3 className="neue-haas-grotesk-display text-sm text-main mb-2">
							ゲームルール
						</h3>
						<div className="space-y-1 text-xs text-accent">
							<div>• 円周率の桁を順番に入力します</div>
							<div>• 1回でもミスするとゲーム終了です</div>
							<div>• ミスした時に正解が表示されます</div>
						</div>
					</div>

					{/* Reset Data */}
					<div className="border-t border-main/20 pt-4">
						<button
							type="button"
							onClick={() => {
								if (
									confirm(
										"統計データとスコア履歴をリセットしますか？この操作は取り消せません。",
									)
								) {
									localStorage.removeItem("pi-game-stats");
									localStorage.removeItem("pi-game-history");
									window.location.reload();
								}
							}}
							className="w-full bg-accent text-main p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
						>
							データをリセット
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
