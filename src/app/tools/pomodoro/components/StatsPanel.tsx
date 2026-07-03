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
	const toDate = (value: Date | string) =>
		value instanceof Date ? value : new Date(value);

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
			(session) => toDate(session.completedAt).toDateString() === today,
		).length;
	};

	const getThisWeekSessions = () => {
		const now = new Date();
		const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
		weekStart.setHours(0, 0, 0, 0);

		return sessions.filter(
			(session) => toDate(session.completedAt) >= weekStart,
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
				return "/20 ";
			case "shortBreak":
				return "bg-accent/20 text-accent";
			case "longBreak":
				return " ";
			default:
				return "/20 ";
		}
	};

	return (
		<div className="rounded-xl /75  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold ">統計情報</h3>
				<button
					type="button"
					onClick={onClose}
					className=" hover: transition-colors"
					aria-label="統計を閉じる"
				>
					<X size={20} />
				</button>
			</div>

			<div className="space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-2 gap-4">
					<div className="rounded-lg /5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Target className="" size={20} />
							<span className="text-sm font-medium">完了ポモドーロ</span>
						</div>
						<div className="text-2xl font-bold ">
							{stats.completedPomodoros}
						</div>
					</div>

					<div className="rounded-lg /5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Clock className="text-accent" size={20} />
							<span className="text-sm font-medium">総作業時間</span>
						</div>
						<div className="text-2xl font-bold text-accent">
							{formatTime(stats.totalWorkTime)}
						</div>
					</div>

					<div className="rounded-lg /5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Zap className="" size={20} />
							<span className="text-sm font-medium">現在の連続記録</span>
						</div>
						<div className="text-2xl font-bold ">
							{stats.currentStreak}
						</div>
					</div>

					<div className="rounded-lg /5 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Calendar className="" size={20} />
							<span className="text-sm font-medium">今日のセッション</span>
						</div>
						<div className="text-2xl font-bold ">
							{getTodaysSessions()}
						</div>
					</div>
				</div>

				{/* Detailed Stats */}
				<div className="space-y-4">
					<h4 className="font-medium ">詳細統計</h4>

					<div className="grid grid-2 gap-4 text-sm">
						<div className="flex justify-between">
							<span className="">総セッション数:</span>
							<span className="font-medium">{stats.totalSessions}</span>
						</div>
						<div className="flex justify-between">
							<span className="">総休憩時間:</span>
							<span className="font-medium">
								{formatTime(stats.totalBreakTime)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="">最長連続記録:</span>
							<span className="font-medium">{stats.longestStreak}</span>
						</div>
						<div className="flex justify-between">
							<span className="">今週のセッション:</span>
							<span className="font-medium">{getThisWeekSessions()}</span>
						</div>
					</div>
				</div>

				{/* Recent Sessions */}
				<div className="space-y-4">
					<h4 className="font-medium ">最近のセッション</h4>

					<div className="space-y-2 max-h-64 overflow-y-auto">
						{getRecentSessions().length > 0 ? (
							getRecentSessions().map((session) => (
								<div
									key={session.id}
									className="flex items-center justify-between p-3 rounded-lg /5"
								>
									<div className="flex items-center gap-3">
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.type)}`}
										>
											{getSessionTypeLabel(session.type)}
										</span>
										<span className="text-sm ">
											{formatTime(session.duration)}
										</span>
									</div>
									<div className="text-xs ">
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
							<div className="text-center /70 py-8">
								まだセッションがありません
							</div>
						)}
					</div>
				</div>

				{/* Productivity Insights */}
				{stats.completedPomodoros > 0 && (
					<div className="space-y-4">
						<h4 className="font-medium ">生産性の洞察</h4>

						<div className="rounded-lg /5 p-4">
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="">平均セッション時間:</span>
									<span className="font-medium">
										{formatTime(
											Math.round(
												stats.totalWorkTime / stats.completedPomodoros,
											),
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="">作業効率:</span>
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
									<span className="">1日平均ポモドーロ:</span>
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
				<div className="pt-4  /20">
					<button
						type="button"
						onClick={() => {
							if (
								confirm(
									"統計データをリセットしますか？この操作は元に戻せません.",
								)
							) {
								// This would need to be implemented in the parent component
								console.log("Reset stats requested");
							}
						}}
						className="w-full px-4 py-2    rounded  transition-colors text-sm"
					>
						統計データをリセット
					</button>
				</div>
			</div>
		</div>
	);
}
