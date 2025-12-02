import {
	Maximize2,
	Minimize2,
	Pause,
	Play,
	Save,
	Settings,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
	DEFAULT_YOUTUBE_SETTINGS,
	YouTubePlaybackState,
	YouTubeSettings,
} from "./types";
import { parseYouTubeUrl } from "./utils";
import { ElasticSlider } from "../ElasticSlider";

declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		YT: any;
	}
}

interface YouTubePlayerProps {
	pomodoroState: {
		isActive: boolean;
		sessionType: "work" | "shortBreak" | "longBreak";
	};
	theme: "light" | "dark";
	url: string;
	onUrlChange: (url: string) => void;
	onToggleMinimize?: (isMinimized: boolean) => void;
	autoPlayOnFocusSession: boolean;
	pauseOnBreak: boolean;
	defaultVolume: number;
	loopEnabled: boolean;
}

export default function YouTubePlayer({
	pomodoroState,
	theme,
	url,
	onUrlChange,
	onToggleMinimize,
	autoPlayOnFocusSession,
	pauseOnBreak,
	defaultVolume,
	loopEnabled,
}: YouTubePlayerProps) {
	const [settings, setSettings] = useState<YouTubeSettings>(
		DEFAULT_YOUTUBE_SETTINGS,
	);

	useEffect(() => {
		setSettings((prev) => ({ ...prev, loop: loopEnabled }));
	}, [loopEnabled]);

	const source = useMemo(() => parseYouTubeUrl(url), [url]);

	const [playbackState, setPlaybackState] =
		useState<YouTubePlaybackState>("idle");
	const [player, setPlayer] = useState<any>(null);
	const [isApiReady, setIsApiReady] = useState(false);
	const [inputUrl, setInputUrl] = useState(url);
	const [error, setError] = useState<string | null>(null);
	const [volume, setVolume] = useState(defaultVolume);
	const [isMuted, setIsMuted] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	const [uniqueId, setUniqueId] = useState("");

	useEffect(() => {
		setUniqueId(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);
	}, []);

	// Update volume when defaultVolume changes
	useEffect(() => {
		setVolume(defaultVolume);
		if (player && player.setVolume) {
			player.setVolume(defaultVolume);
		}
	}, [defaultVolume, player]);

	// Load IFrame API
	useEffect(() => {
		if (!window.YT) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = () => {
				setIsApiReady(true);
			};
		} else {
			setIsApiReady(true);
		}
	}, []);

	// Initialize Player
	useEffect(() => {
		if (isApiReady && source && !player) {
			const newPlayer = new window.YT.Player(uniqueId, {
				height: "100%",
				width: "100%",
				videoId:
					source.type === "video" || source.type === "mixed"
						? source.videoId
						: undefined,
				playerVars: {
					listType:
						source.type === "playlist" || source.type === "mixed"
							? "playlist"
							: undefined,
					list:
						source.type === "playlist" || source.type === "mixed"
							? source.playlistId
							: settings.loop && source.videoId
								? source.videoId
								: undefined,
					index: source.index,
					autoplay: 0,
					controls: 1,
					modestbranding: 1,
					rel: 0,
					loop: settings.loop ? 1 : 0,
				},
				events: {
					onReady: (event: any) => {
						event.target.setVolume(volume);
						setPlaybackState("idle");
					},
					onStateChange: (event: any) => {
						// -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
						if (event.data === 1) setPlaybackState("playing");
						if (event.data === 2) setPlaybackState("paused");
						if (event.data === 0 && settings.loop) {
							event.target.playVideo();
						}
					},
					onError: (event: any) => {
						setPlaybackState("error");
						console.error("YouTube Player Error:", event.data);
						let msg = "再生エラーが発生しました。";
						if (event.data === 150 || event.data === 101) {
							msg = "この動画は埋め込み再生が許可されていません。";
						}
						setError(msg);
					},
				},
			});
			setPlayer(newPlayer);
		}
	}, [isApiReady, source, player, uniqueId, volume]);

	// Handle Source Change
	const handleSaveUrl = () => {
		const newSource = parseYouTubeUrl(inputUrl);
		if (newSource) {
			onUrlChange(inputUrl);
			setError(null);
			if (player) {
				player.destroy();
				setPlayer(null); // Will trigger re-initialization
			}
		} else {
			setError("無効なURL形式です。");
		}
	};

	// Recreate player when loop setting changes to apply IFrame params
	useEffect(() => {
		if (player) {
			player.destroy();
			setPlayer(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings.loop, source?.videoId, source?.playlistId]);

	// Pomodoro Integration
	useEffect(() => {
		if (!player || !player.playVideo) return;

		if (pomodoroState.isActive && pomodoroState.sessionType === "work") {
			if (autoPlayOnFocusSession) {
				player.playVideo();
			}
		} else if (
			pomodoroState.isActive &&
			(pomodoroState.sessionType === "shortBreak" ||
				pomodoroState.sessionType === "longBreak")
		) {
			if (pauseOnBreak) {
				player.pauseVideo();
			}
		}
	}, [
		pomodoroState.isActive,
		pomodoroState.sessionType,
		autoPlayOnFocusSession,
		pauseOnBreak,
	]);

	// Volume Control
	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVol = parseInt(e.target.value);
		setVolume(newVol);
		// setSettings({ ...settings, defaultVolume: newVol }); // Removed local setting update
		if (player && player.setVolume) {
			player.setVolume(newVol);
		}
	};

	const toggleMute = () => {
		if (player && player.isMuted) {
			if (player.isMuted()) {
				player.unMute();
				setIsMuted(false);
			} else {
				player.mute();
				setIsMuted(true);
			}
		}
	};

	const togglePlay = () => {
		if (player && player.getPlayerState) {
			const state = player.getPlayerState();
			if (state === 1) {
				player.pauseVideo();
			} else {
				player.playVideo();
			}
		}
	};

	const handleNext = () => {
		if (player && player.nextVideo) {
			player.nextVideo();
		}
	};

	const handlePrevious = () => {
		if (player && player.previousVideo) {
			player.previousVideo();
		}
	};

	const isMinimized = settings.isMinimized;
	const isPlaylist = source?.type === "playlist" || source?.type === "mixed";

	return (
		<div
			className={`flex flex-col w-full h-full overflow-hidden ${
				theme === "dark" ? "text-white" : "text-gray-900"
			}`}
		>
			{/* Header */}
			<div
				className={`flex items-center justify-between p-2 border-b ${
					theme === "dark" ? "border-white/10" : "border-black/5"
				}`}
			>
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold uppercase tracking-wider opacity-70">
						YouTube Player
					</span>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={() => {
							const newState = !isMinimized;
							setSettings({ ...settings, isMinimized: newState });
							onToggleMinimize?.(newState);
						}}
						className="p-1.5 rounded hover:bg-gray-500/20 transition-colors"
					>
						{isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
					</button>
					<button
						onClick={() => setShowSettings(!showSettings)}
						className={`p-1.5 rounded hover:bg-gray-500/20 transition-colors ${showSettings ? "bg-gray-500/20" : ""}`}
					>
						<Settings size={14} />
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 relative bg-black">
				{!source ? (
					<div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs p-4 text-center">
						URLを設定してください
					</div>
				) : uniqueId ? (
					<div id={uniqueId} className="w-full h-full" />
				) : null}
				{error && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 text-xs p-4 text-center z-10">
						{error}
					</div>
				)}
			</div>

			{/* Controls */}
			{!isMinimized && (
				<div className="p-3 space-y-3 bg-transparent">
					{/* Playback Controls */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{isPlaylist && (
								<button
									onClick={handlePrevious}
									className={`p-2 rounded-full ${
										theme === "dark"
											? "hover:bg-gray-800 text-gray-300"
											: "hover:bg-gray-200 text-gray-700"
									}`}
								>
									<SkipBack size={16} fill="currentColor" />
								</button>
							)}
							<button
								onClick={togglePlay}
								className={`p-2 rounded-full ${
									theme === "dark"
										? "bg-white text-black hover:bg-gray-200"
										: "bg-black text-white hover:bg-gray-800"
								}`}
							>
								{playbackState === "playing" ? (
									<Pause size={16} fill="currentColor" />
								) : (
									<Play size={16} fill="currentColor" />
								)}
							</button>
							{isPlaylist && (
								<button
									onClick={handleNext}
									className={`p-2 rounded-full ${
										theme === "dark"
											? "hover:bg-gray-800 text-gray-300"
											: "hover:bg-gray-200 text-gray-700"
									}`}
								>
									<SkipForward size={16} fill="currentColor" />
								</button>
							)}
						</div>

						<div className="flex items-center gap-2 flex-1 mx-4">
							<button
								onClick={toggleMute}
								className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								{isMuted || volume === 0 ? (
									<VolumeX size={16} />
								) : (
									<Volume2 size={16} />
								)}
							</button>
							<div className="flex-1">
								<ElasticSlider
									min={0}
									max={100}
									value={volume}
									onChange={(v) =>
										handleVolumeChange({
											target: { value: String(v) },
										} as React.ChangeEvent<HTMLInputElement>)
									}
									accentColor="#3b82f6"
									ariaLabel="YouTube volume"
								/>
							</div>
						</div>
					</div>

					{/* Settings / URL Input */}
					{showSettings && (
						<div
							className={`pt-3 border-t space-y-3 ${
								theme === "dark" ? "border-white/10" : "border-black/5"
							}`}
						>
							<div className="flex gap-2">
								<input
									type="text"
									value={inputUrl}
									onChange={(e) => setInputUrl(e.target.value)}
									placeholder="YouTube URL..."
									className={`flex-1 px-2 py-1.5 text-xs rounded border bg-transparent outline-none ${
										theme === "dark"
											? "border-white/20 focus:border-white/50"
											: "border-black/20 focus:border-black/50"
									}`}
								/>
								<button
									onClick={handleSaveUrl}
									className={`p-1.5 rounded border ${
										theme === "dark"
											? "border-white/20 hover:bg-white/10"
											: "border-black/20 hover:bg-black/5"
									}`}
								>
									<Save size={14} />
								</button>
							</div>

						</div>
					)}
				</div>
			)}
		</div>
	);
}
