"use client";

import type { GameStats, ScoreRecord } from "../types";

interface StatsPanelProps {
	stats: GameStats;
	scoreHistory: ScoreRecord[];
	onClose: () => void;
}

export default function StatsPanel({
	stats,
	scoreHistory,
	onClose,
}: StatsPanelProps) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDifficultyLabel = (difficulty: string) => {
		switch (difficulty) {
			case "easy":
				return "簡単";
			case "normal":
				return "普通";
			case "hard":
				return "難しい";
			default:
				return difficulty;
		}
	};

	const recentScores = scoreHistory
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 10);

	return (
		<div className="fixed inset-0 bg-base bg-opacity-95 flex items-center justify-center p-4 z-50">
			<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6 space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="neue-haas-grotesk-display text-2xl text-main">
							統計情報
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

					{/* Overall Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="text-center">
							<div className="neue-haas-grotesk-display text-2xl text-main">
								{stats.bestScore}
							</div>
							<div className="noto-sans-jp-light text-xs text-accent">
								最高記録
							</div>
						</div>
						<div className="text-center">
							<div className="neue-haas-grotesk-display text-2xl text-accent">
								{stats.totalGames}
							</div>
							<div className="noto-sans-jp-light text-xs text-accent">
								総ゲーム数
							</div>
						</div>
						<div className="text-center">
							<div className="neue-haas-grotesk-display text-2xl text-main">
								{stats.averageScore.toFixed(1)}
							</div>
							<div className="noto-sans-jp-light text-xs text-accent">
								平均スコア
							</div>
						</div>
					</div>

					{/* Recent Scores */}
					<div>
						<h3 className="neue-haas-grotesk-display text-lg text-main mb-4">
							最近のスコア
						</h3>
						{recentScores.length > 0 ? (
							<div className="space-y-2">
								{recentScores.map((record, index) => (
									<div
										key={index}
										className="rounded-lg bg-main/10 p-3 flex justify-between items-center"
									>
										<div className="flex items-center space-x-4">
											<div className="neue-haas-grotesk-display text-lg text-main">
												{record.score}桁
											</div>
											<div className="text-sm text-accent">
												{getDifficultyLabel(record.difficulty)}
											</div>
										</div>
										<div className="text-right text-sm text-accent">
											<div>{formatDate(record.date)}</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center text-accent py-8">
								<div className="noto-sans-jp-light text-sm">
									まだゲームをプレイしていません
								</div>
							</div>
						)}
					</div>

					{/* Learning Progress */}
					<div>
						<h3 className="neue-haas-grotesk-display text-lg text-main mb-4">
							学習の進歩
						</h3>
						<div className="rounded-lg bg-main/10 p-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-accent">円周率の知識</span>
									<span className="text-main">{stats.bestScore}桁まで記憶</span>
								</div>
								<div className="w-full bg-accent bg-opacity-20 h-2">
									<div
										className="bg-main h-2 transition-all duration-300"
										style={{
											width: `${Math.min((stats.bestScore / 100) * 100, 100)}%`,
										}}
									/>
								</div>
								<div className="text-xs text-accent text-center">
									目標: 100桁
								</div>
							</div>
						</div>
					</div>

					{/* Pi Facts */}
					<div>
						<h3 className="neue-haas-grotesk-display text-lg text-main mb-4">
							円周率について
						</h3>
						<div className="rounded-lg bg-main/10 p-4 space-y-2">
							<div className="noto-sans-jp-light text-sm text-main">
								• 円周率πは円の円周と直径の比率を表す無理数です
							</div>
							<div className="noto-sans-jp-light text-sm text-main">
								• 小数点以下の桁数は無限に続きます
							</div>
							<div className="noto-sans-jp-light text-sm text-main">
								• 現在の世界記録は70,000桁以上の暗記です
							</div>
							<div className="noto-sans-jp-light text-sm text-main">
								• 3月14日は「円周率の日」として知られています
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
