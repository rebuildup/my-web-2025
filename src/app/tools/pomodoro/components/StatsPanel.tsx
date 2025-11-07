"use client";

import { Calendar, Clock, Target, X, Zap } from "lucide-react";
import type { PomodoroSession, PomodoroStats } from "../types";

interface StatsPanelProps {
	stats: PomodoroStats;
	sessions: PomodoroSession[];
	onClose: () => void;
}

export default function StatsPanel({
	stats,
	sessions,
	onClose,
}: StatsPanelProps) {
	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}時間${minutes}分`;
		}
		return `${minutes}分`;
	};

	const getTodaysSessions = () => {
		const today = new Date().toDateString();
		return sessions.filter(
			(session) => session.completedAt.toDateString() === today,
		).length;
	};

	const getThisWeekSessions = () => {
		const now = new Date();
		const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
		weekStart.setHours(0, 0, 0, 0);

		return sessions.filter(
			(session) => new Date(session.completedAt) >= weekStart,
		).length;
	};

	const getRecentSessions = () => {
		return sessions
			.slice(-10)
			.reverse()
			.map((session) => ({
				...session,
				completedAt: new Date(session.completedAt),
			}));
	};

	const getSessionTypeLabel = (type: string) => {
		switch (type) {
			case "work":
				return "作業";
			case "shortBreak":
				return "短い休憩";
			case "longBreak":
				return "長い休憩";
			default:
				return type;
		}
	};

	const getSessionTypeColor = (type: string) => {
		switch (type) {
			case "work":
				return "bg-main/20 text-main";
			case "shortBreak":
				return "bg-accent/20 text-accent";
			case "longBreak":
				return "bg-green-500/20 text-green-700";
			default:
				return "bg-main/20 text-main";
		}
	};

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-main">統計情報</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-main hover:text-main transition-colors"
					aria-label="統計を閉じる"
				>
					<X size={20} />
				</button>
			</div>

			<div className="space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-2 gap-4">
					<div className="rounded-lg bg-main/5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Target className="text-main" size={20} />
							<span className="text-sm font-medium">完了ポモドーロ</span>
						</div>
						<div className="text-2xl font-bold text-main">
							{stats.completedPomodoros}
						</div>
					</div>

					<div className="rounded-lg bg-main/5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Clock className="text-accent" size={20} />
							<span className="text-sm font-medium">総作業時間</span>
						</div>
						<div className="text-2xl font-bold text-accent">
							{formatTime(stats.totalWorkTime)}
						</div>
					</div>

					<div className="rounded-lg bg-main/5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Zap className="text-green-600" size={20} />
							<span className="text-sm font-medium">現在の連続記録</span>
						</div>
						<div className="text-2xl font-bold text-green-600">
							{stats.currentStreak}
						</div>
					</div>

					<div className="rounded-lg bg-main/5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Calendar className="text-purple-600" size={20} />
							<span className="text-sm font-medium">今日のセッション</span>
						</div>
						<div className="text-2xl font-bold text-purple-600">
							{getTodaysSessions()}
						</div>
					</div>
				</div>

				{/* Detailed Stats */}
				<div className="space-y-4">
					<h4 className="font-medium text-main">詳細統計</h4>

					<div className="grid grid-2 gap-4 text-sm">
						<div className="flex justify-between">
							<span className="text-main">総セッション数:</span>
							<span className="font-medium">{stats.totalSessions}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-main">総休憩時間:</span>
							<span className="font-medium">
								{formatTime(stats.totalBreakTime)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-main">最長連続記録:</span>
							<span className="font-medium">{stats.longestStreak}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-main">今週のセッション:</span>
							<span className="font-medium">{getThisWeekSessions()}</span>
						</div>
					</div>
				</div>

				{/* Recent Sessions */}
				<div className="space-y-4">
					<h4 className="font-medium text-main">最近のセッション</h4>

					<div className="space-y-2 max-h-64 overflow-y-auto">
						{getRecentSessions().length > 0 ? (
							getRecentSessions().map((session) => (
								<div
									key={session.id}
									className="flex items-center justify-between p-3 rounded-lg bg-main/5"
								>
									<div className="flex items-center gap-3">
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.type)}`}
										>
											{getSessionTypeLabel(session.type)}
										</span>
										<span className="text-sm text-main">
											{formatTime(session.duration)}
										</span>
									</div>
									<div className="text-xs text-main">
										{session.completedAt.toLocaleString("ja-JP", {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
							))
						) : (
							<div className="text-center text-main/70 py-8">
								まだセッションがありません
							</div>
						)}
					</div>
				</div>

				{/* Productivity Insights */}
				{stats.completedPomodoros > 0 && (
					<div className="space-y-4">
						<h4 className="font-medium text-main">生産性の洞察</h4>

						<div className="rounded-lg bg-main/5 p-4">
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-main">平均セッション時間:</span>
									<span className="font-medium">
										{formatTime(
											Math.round(
												stats.totalWorkTime / stats.completedPomodoros,
											),
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-main">作業効率:</span>
									<span className="font-medium">
										{Math.round(
											(stats.totalWorkTime /
												(stats.totalWorkTime + stats.totalBreakTime)) *
												100,
										)}
										%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-main">1日平均ポモドーロ:</span>
									<span className="font-medium">
										{Math.round(
											stats.completedPomodoros /
												Math.max(1, Math.ceil(sessions.length / 10)),
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Reset Stats */}
				<div className="pt-4 border-t border-main/20">
					<button
						type="button"
						onClick={() => {
							if (
								confirm(
									"統計データをリセットしますか？この操作は元に戻せません。",
								)
							) {
								// This would need to be implemented in the parent component
								console.log("Reset stats requested");
							}
						}}
						className="w-full px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
					>
						統計データをリセット
					</button>
				</div>
			</div>
		</div>
	);
}
