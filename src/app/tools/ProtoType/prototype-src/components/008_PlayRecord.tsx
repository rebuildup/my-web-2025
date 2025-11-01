import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { gameData } from "../gamesets/002_gameConfig";
import { loadFromCache, saveToCache } from "../gamesets/020_cacheControl";
import "../styles/008_playrecord.css";

interface GameSession {
	id: string;
	date: number;
	gameMode: string;
	score: number;
	wpm: number;
	accuracy: number;
	maxCombo: number;
	totalHits: number;
	misses: number;
	duration: number;
	missedKeys: string[];
}

interface Statistics {
	totalGames: number;
	totalPlayTime: number;
	averageWPM: number;
	maxWPM: number;
	averageAccuracy: number;
	bestScore: number;
	totalKeystrokes: number;
	favoriteGameMode: string;
	improvementTrend: number;
	weakKeys: { [key: string]: number };
}

const PlayRecord: React.FC = () => {
	const [sessions, setSessions] = useState<GameSession[]>([]);
	const [statistics, setStatistics] = useState<Statistics | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState<
		"week" | "month" | "all"
	>("week");
	const [selectedGameMode, setSelectedGameMode] = useState<string>("all");

	const loadGameSessions = useCallback(() => {
		const savedSessions = loadFromCache<GameSession[]>("gameSessions", []);
		setSessions(savedSessions);
	}, []);

	const saveGameSession = (session: GameSession) => {
		const updatedSessions = [session, ...sessions].slice(0, 1000); // Keep last 1000 sessions
		setSessions(updatedSessions);
		saveToCache("gameSessions", updatedSessions);
	};

	const calculateStatistics = useCallback(() => {
		const now = Date.now();
		const periodMs =
			selectedPeriod === "week"
				? 7 * 24 * 60 * 60 * 1000
				: selectedPeriod === "month"
					? 30 * 24 * 60 * 60 * 1000
					: Infinity;

		const filteredSessions = sessions.filter((session) => {
			const withinPeriod = now - session.date <= periodMs;
			const matchesMode =
				selectedGameMode === "all" || session.gameMode === selectedGameMode;
			return withinPeriod && matchesMode;
		});

		if (filteredSessions.length === 0) {
			setStatistics(null);
			return;
		}

		const totalPlayTime = filteredSessions.reduce(
			(sum, s) => sum + s.duration,
			0,
		);
		const totalKeystrokes = filteredSessions.reduce(
			(sum, s) => sum + s.totalHits,
			0,
		);
		const averageWPM =
			filteredSessions.reduce((sum, s) => sum + s.wpm, 0) /
			filteredSessions.length;
		const maxWPM = Math.max(...filteredSessions.map((s) => s.wpm));
		const averageAccuracy =
			filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) /
			filteredSessions.length;
		const bestScore = Math.max(...filteredSessions.map((s) => s.score));

		// Calculate favorite game mode
		const modeCounts: { [key: string]: number } = {};
		filteredSessions.forEach((s) => {
			modeCounts[s.gameMode] = (modeCounts[s.gameMode] || 0) + 1;
		});
		const favoriteGameMode = Object.keys(modeCounts).reduce(
			(a, b) => (modeCounts[a] > modeCounts[b] ? a : b),
			"nomal",
		);

		// Calculate improvement trend (WPM improvement over time)
		const recentSessions = filteredSessions.slice(0, 10);
		const olderSessions = filteredSessions.slice(-10);
		const recentAvgWPM =
			recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length;
		const olderAvgWPM =
			olderSessions.reduce((sum, s) => sum + s.wpm, 0) / olderSessions.length;
		const improvementTrend = recentAvgWPM - olderAvgWPM;

		// Calculate weak keys
		const weakKeys: { [key: string]: number } = {};
		filteredSessions.forEach((session) => {
			session.missedKeys.forEach((key) => {
				weakKeys[key] = (weakKeys[key] || 0) + 1;
			});
		});

		setStatistics({
			totalGames: filteredSessions.length,
			totalPlayTime,
			averageWPM,
			maxWPM,
			averageAccuracy,
			bestScore,
			totalKeystrokes,
			favoriteGameMode,
			improvementTrend,
			weakKeys,
		});
	}, [sessions, selectedGameMode, selectedPeriod]);

	useEffect(() => {
		loadGameSessions();
	}, [loadGameSessions]);

	useEffect(() => {
		if (sessions.length > 0) {
			calculateStatistics();
		}
	}, [sessions, calculateStatistics]);

	const formatTime = (ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}時間${minutes % 60}分`;
		} else if (minutes > 0) {
			return `${minutes}分${seconds % 60}秒`;
		} else {
			return `${seconds}秒`;
		}
	};

	const formatDate = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getGameModeLabel = (mode: string): string => {
		const labels: { [key: string]: string } = {
			nomal: "スタンダード",
			focus: "集中モード",
			exact: "正確性重視",
			long: "長文モード",
			number: "数値入力",
			speed: "スピード重視",
			endless: "エンドレス",
		};
		return labels[mode] || mode;
	};

	const exportData = () => {
		const dataStr = JSON.stringify({ sessions, statistics }, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `prototype-stats-${new Date().toISOString().split("T")[0]}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	// Save current game session when component mounts and game data is available
	useEffect(() => {
		if (gameData.EndTime > gameData.StartTime && gameData.total_hit_cnt > 0) {
			const session: GameSession = {
				id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				date: gameData.EndTime,
				gameMode: gameData.GameMode,
				score: gameData.Score,
				wpm:
					((gameData.total_hit_cnt - gameData.Miss) /
						((gameData.EndTime - gameData.StartTime) / 1000)) *
					60,
				accuracy:
					((gameData.total_hit_cnt - gameData.Miss) / gameData.total_hit_cnt) *
					100,
				maxCombo: gameData.max_combo,
				totalHits: gameData.total_hit_cnt,
				misses: gameData.Miss,
				duration: gameData.EndTime - gameData.StartTime,
				missedKeys: [...gameData.missKeys],
			};

			// Only save if this is a new session (not already saved)
			const lastSession = sessions[0];
			if (!lastSession || lastSession.date !== session.date) {
				saveGameSession(session);
			}
		}
	}, [sessions, saveGameSession]);

	return (
		<div className="play-record-container" style={{ zIndex: 1 }}>
			<div className="record-header">
				<h2>プレイ記録</h2>
				<div className="record-controls">
					<select
						value={selectedPeriod}
						onChange={(e) =>
							setSelectedPeriod(e.target.value as "week" | "month" | "all")
						}
						className="period-selector"
					>
						<option value="week">過去1週間</option>
						<option value="month">過去1ヶ月</option>
						<option value="all">全期間</option>
					</select>
					<select
						value={selectedGameMode}
						onChange={(e) => setSelectedGameMode(e.target.value)}
						className="mode-selector"
					>
						<option value="all">全モード</option>
						<option value="nomal">スタンダード</option>
						<option value="focus">集中モード</option>
						<option value="exact">正確性重視</option>
						<option value="long">長文モード</option>
						<option value="number">数値入力</option>
						<option value="speed">スピード重視</option>
						<option value="endless">エンドレス</option>
					</select>
					<button type="button" onClick={exportData} className="export-btn">
						データ出力
					</button>
				</div>
			</div>

			{statistics && (
				<div className="statistics-grid">
					<div className="stat-card">
						<h3>総ゲーム数</h3>
						<div className="stat-value">{statistics.totalGames}</div>
					</div>
					<div className="stat-card">
						<h3>総プレイ時間</h3>
						<div className="stat-value">
							{formatTime(statistics.totalPlayTime)}
						</div>
					</div>
					<div className="stat-card">
						<h3>平均WPM</h3>
						<div className="stat-value">{statistics.averageWPM.toFixed(1)}</div>
					</div>
					<div className="stat-card">
						<h3>最高WPM</h3>
						<div className="stat-value">{statistics.maxWPM.toFixed(1)}</div>
					</div>
					<div className="stat-card">
						<h3>平均正確率</h3>
						<div className="stat-value">
							{statistics.averageAccuracy.toFixed(1)}%
						</div>
					</div>
					<div className="stat-card">
						<h3>最高スコア</h3>
						<div className="stat-value">{statistics.bestScore.toFixed(0)}</div>
					</div>
					<div className="stat-card">
						<h3>総キー入力数</h3>
						<div className="stat-value">
							{statistics.totalKeystrokes.toLocaleString()}
						</div>
					</div>
					<div className="stat-card">
						<h3>お気に入りモード</h3>
						<div className="stat-value">
							{getGameModeLabel(statistics.favoriteGameMode)}
						</div>
					</div>
					<div className="stat-card">
						<h3>WPM向上度</h3>
						<div
							className={`stat-value ${statistics.improvementTrend >= 0 ? "positive" : "negative"}`}
						>
							{statistics.improvementTrend >= 0 ? "+" : ""}
							{statistics.improvementTrend.toFixed(1)}
						</div>
					</div>
				</div>
			)}

			{Object.keys(statistics?.weakKeys || {}).length > 0 && (
				<div className="weak-keys-section">
					<h3>苦手なキー</h3>
					<div className="weak-keys-grid">
						{Object.entries(statistics?.weakKeys ?? {})
							.sort(([, a], [, b]) => b - a)
							.slice(0, 10)
							.map(([key, count]) => (
								<div key={key} className="weak-key-item">
									<span className="key">{key}</span>
									<span className="count">{count}回</span>
								</div>
							))}
					</div>
				</div>
			)}

			<div className="sessions-section">
				<h3>最近のセッション</h3>
				<div className="sessions-list">
					{sessions.slice(0, 20).map((session) => (
						<div key={session.id} className="session-item">
							<div className="session-date">{formatDate(session.date)}</div>
							<div className="session-mode">
								{getGameModeLabel(session.gameMode)}
							</div>
							<div className="session-stats">
								<span>WPM: {session.wpm.toFixed(1)}</span>
								<span>正確率: {session.accuracy.toFixed(1)}%</span>
								<span>スコア: {session.score.toFixed(0)}</span>
								<span>時間: {formatTime(session.duration)}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PlayRecord;
