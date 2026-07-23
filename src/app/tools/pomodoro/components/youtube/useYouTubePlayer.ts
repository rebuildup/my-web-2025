"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	DEFAULT_YOUTUBE_SETTINGS,
	type YouTubePlaybackState,
	type YouTubeSettings,
} from "./types";
import { parseYouTubeUrl } from "./utils";
import type { YouTubePlayerProps } from "./YouTubePlayer.types";
import {
	createYouTubePlayerOptions,
	getYouTubePlayerErrorMessage,
	loadYouTubeIframeApi,
} from "./youtube-player-utils";

export function useYouTubePlayer({
	pomodoroState,
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
		loadYouTubeIframeApi(() => setIsApiReady(true));
	}, []);

	// Initialize Player
	useEffect(() => {
		if (isApiReady && source && !player) {
			const newPlayer = new (window as any).YT.Player(
				uniqueId,
				createYouTubePlayerOptions({
					source,
					loop: settings.loop,
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
						setError(getYouTubePlayerErrorMessage(event.data));
					},
				}),
			);
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
			setError("無効なURL形式です.");
		}
	};

	// Recreate player when loop setting changes to apply IFrame params
	useEffect(() => {
		if (player) {
			player.destroy();
			setPlayer(null);
		}
	}, [settings.loop, source]);

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

	const toggleMinimize = () => {
		const newState = !settings.isMinimized;
		setSettings({ ...settings, isMinimized: newState });
		onToggleMinimize?.(newState);
	};

	const toggleSettings = () => setShowSettings(!showSettings);

	return {
		error,
		handleNext,
		handlePrevious,
		handleSaveUrl,
		handleVolumeChange,
		inputUrl,
		isMinimized: settings.isMinimized,
		isMuted,
		isPlaylist: source?.type === "playlist" || source?.type === "mixed",
		playbackState,
		player,
		setInputUrl,
		showSettings,
		source,
		toggleMinimize,
		toggleMute,
		togglePlay,
		toggleSettings,
		uniqueId,
		volume,
	};
}
