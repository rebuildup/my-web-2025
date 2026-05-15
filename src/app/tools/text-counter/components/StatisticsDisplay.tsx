"use client";

import type { CountSettings, DisplaySettings, TextStats } from "../types";
import CharacterTypeChart from "./CharacterTypeChart";

interface StatisticsDisplayProps {
	stats: TextStats;
	displaySettings: DisplaySettings;
	settings: CountSettings;
	onSettingsChange?: (settings: CountSettings) => void;
}

export default function StatisticsDisplay({
	stats,
	displaySettings,
	settings,
	onSettingsChange,
}: StatisticsDisplayProps) {
	const updateSetting = (key: keyof CountSettings, value: number) => {
		if (onSettingsChange) {
			onSettingsChange({ ...settings, [key]: value });
		}
	};

	const _hasLimits = settings.targetLength > 0 || settings.maxLength > 0;
	// Define the max value for the bar's scale
	const scaleMax = Math.max(
		settings.maxLength || 0,
		settings.targetLength || 0,
		settings.minLength || 0,
		stats.totalCharacters,
		1, // Avoid division by zero
	);

	const progressPercent = Math.min(
		100,
		(stats.totalCharacters / scaleMax) * 100,
	);

	const getStatusColor = () => {
		if (settings.maxLength > 0 && stats.totalCharacters > settings.maxLength)
			return "bg-red-500";
		if (
			settings.targetLength > 0 &&
			stats.totalCharacters >= settings.targetLength
		)
			return "bg-accent";
		if (settings.minLength > 0 && stats.totalCharacters >= settings.minLength)
			return "bg-green-500";
		return "bg-blue-400";
	};

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold text-main">統計情報</h2>

			<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6 space-y-6">
				<div className="flex flex-wrap items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<label htmlFor="min-length" className="text-main/80">
							下限:
						</label>
						<input
							id="min-length"
							type="number"
							min="0"
							className="w-20 bg-main/10 rounded px-2 py-1 text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
							value={settings.minLength || 0}
							onChange={(e) =>
								updateSetting("minLength", parseInt(e.target.value) || 0)
							}
							disabled={!onSettingsChange}
						/>
					</div>
					<div className="flex items-center gap-2">
						<label htmlFor="target-length" className="text-main/80">
							目標:
						</label>
						<input
							id="target-length"
							type="number"
							min="0"
							className="w-20 bg-main/10 rounded px-2 py-1 text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
							value={settings.targetLength || 0}
							onChange={(e) =>
								updateSetting("targetLength", parseInt(e.target.value) || 0)
							}
							disabled={!onSettingsChange}
						/>
					</div>
					<div className="flex items-center gap-2">
						<label htmlFor="max-length" className="text-main/80">
							上限:
						</label>
						<input
							id="max-length"
							type="number"
							min="0"
							className="w-20 bg-main/10 rounded px-2 py-1 text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent"
							value={settings.maxLength || 0}
							onChange={(e) =>
								updateSetting("maxLength", parseInt(e.target.value) || 0)
							}
							disabled={!onSettingsChange}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm font-medium text-main">
						<span>0</span>
						<span>{scaleMax.toLocaleString()} 文字</span>
					</div>
					<div className="relative w-full h-4 bg-main/10 rounded-full overflow-hidden">
						{/* Progress Bar */}
						<div
							className={`h-full transition-all duration-300 ease-out ${getStatusColor()}`}
							style={{ width: `${progressPercent}%` }}
						></div>

						{/* Min Marker */}
						{settings.minLength > 0 && settings.minLength <= scaleMax && (
							<div
								className="absolute top-0 bottom-0 w-0.5 bg-main/30 z-10"
								style={{ left: `${(settings.minLength / scaleMax) * 100}%` }}
								title={`下限: ${settings.minLength}`}
							></div>
						)}
						{/* Target Marker */}
						{settings.targetLength > 0 && settings.targetLength <= scaleMax && (
							<div
								className="absolute top-0 bottom-0 w-1 bg-main/50 z-10"
								style={{ left: `${(settings.targetLength / scaleMax) * 100}%` }}
								title={`目標: ${settings.targetLength}`}
							></div>
						)}
						{/* Max Marker */}
						{settings.maxLength > 0 && settings.maxLength <= scaleMax && (
							<div
								className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10"
								style={{ left: `${(settings.maxLength / scaleMax) * 100}%` }}
								title={`上限: ${settings.maxLength}`}
							></div>
						)}
					</div>
					<div className="text-right text-sm font-bold text-main">
						現在: {stats.totalCharacters.toLocaleString()} 文字
					</div>
				</div>
			</div>

			{displaySettings.showBasicStats && (
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
					<h3 className="font-medium text-main">基本統計</h3>
					<div className="grid grid-cols-2 gap-4">
						<StatItem label="総文字数" value={stats.totalCharacters} />
						<StatItem
							label="スペース除く"
							value={stats.charactersWithoutSpaces}
						/>
						<StatItem
							label="改行除く"
							value={stats.charactersWithoutNewlines}
						/>
						<StatItem
							label="空白除く"
							value={stats.charactersWithoutWhitespace}
						/>
						<StatItem
							label="400字詰め原稿用紙"
							value={`${stats.manuscriptPages400} 枚`}
						/>
						<StatItem
							label="バイト数 (UTF-8)"
							value={`${stats.byteSizeUTF8.toLocaleString()} B`}
						/>
					</div>
				</div>
			)}

			{displaySettings.showStructureStats && (
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
					<h3 className="font-medium text-main">構造統計</h3>
					<div className="grid grid-cols-2 gap-4">
						<StatItem label="単語数" value={stats.wordCount} />
						<StatItem label="行数" value={stats.lineCount} />
						<StatItem label="段落数" value={stats.paragraphCount} />
						<StatItem label="文数" value={stats.sentenceCount} />
					</div>
				</div>
			)}

			{displaySettings.showCharacterTypes && (
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
					<h3 className="font-medium text-main">文字種別</h3>
					<div className="grid grid-cols-2 gap-4">
						<StatItem label="ひらがな" value={stats.characterTypes.hiragana} />
						<StatItem label="カタカナ" value={stats.characterTypes.katakana} />
						<StatItem label="漢字" value={stats.characterTypes.kanji} />
						<StatItem
							label="英数字"
							value={stats.characterTypes.alphanumeric}
						/>
						<StatItem label="記号" value={stats.characterTypes.symbols} />
						{settings.checkHalfKana && (
							<StatItem label="半角カナ" value={stats.halfKanaCount} />
						)}
					</div>

					{displaySettings.showGraphs && (
						<div className="mt-4">
							<CharacterTypeChart stats={stats} />
						</div>
					)}
				</div>
			)}

			{displaySettings.showDetailedStats && (
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
					<h3 className="font-medium text-main">詳細統計</h3>
					<div className="space-y-2">
						<StatItem
							label="平均行文字数"
							value={stats.averageCharactersPerLine.toFixed(1)}
						/>
						<StatItem label="最長行文字数" value={stats.longestLineLength} />
						<StatItem
							label="文字密度"
							value={`${stats.characterDensity.toFixed(1)}%`}
						/>
						<StatItem
							label="平均行単語数"
							value={stats.averageWordsPerLine.toFixed(1)}
						/>
						{settings.specificString && (
							<StatItem
								label={`「${settings.specificString}」出現数`}
								value={stats.specificStringCount}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

interface StatItemProps {
	label: string;
	value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
	return (
		<div className="flex justify-between items-center py-1">
			<span className="text-sm text-main">{label}</span>
			<span className="font-mono text-sm font-medium text-main">
				{typeof value === "number" ? value.toLocaleString() : value}
			</span>
		</div>
	);
}
