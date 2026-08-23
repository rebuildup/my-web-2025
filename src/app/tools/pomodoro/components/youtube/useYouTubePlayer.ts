"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
	// Note: `settings.loop` is NOT mirrored from the `loopEnabled` prop.
	// Per uhyo 過激派 P4, mirroring props to state in a useEffect is
	// disallowed. We use `loopEnabled` directly when needed (see
	// createYouTubePlayerOptions and the onStateChange handler), and
	// `settings` only carries genuinely local UI state (isMinimized).

	const source = useMemo(() => parseYouTubeUrl(url), [url]);

	const [playbackState, setPlaybackState] =
		useState<YouTubePlaybackState>("idle");
	const [player, setPlayer] = useState<any>(null);
	// Tracks the active YT.Player instance for unmount cleanup so we can
	// destroy it even if the component unmounts outside a deps change of
	// the Initialize effect (e.g. when settings.loop or source drives
	// re-creation through the effect below).
	const playerRef = useRef<any>(null);
	const [isApiReady, setIsApiReady] = useState(false);
	const [inputUrl, setInputUrl] = useState(url);
	const [error, setError] = useState<string | null>(null);
	const [volume, setVolume] = useState(defaultVolume);
	const [isMuted, setIsMuted] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	// Stable id per mount — replaces a mount-only useEffect that called
	// setUniqueId once. useMemo with empty deps runs once at mount.
	// Math.random here is fine: we only need uniqueness across
	// simultaneous YT.Player instances on the page.
	const stableUniqueId = useMemo(
		() => `youtube-player-${Math.random().toString(36).slice(2, 11)}`,
		[],
	);

	// Sync defaultVolume into the live player when the prop changes.
	// Per uhyo 過激派 P4, we do NOT mirror defaultVolume into local
	// `volume` state (that would be a value-reaction effect). Instead we
	// track a ref and apply via the imperative YT.Player API. `volume`
	// state remains the user-controlled value (set by handleVolumeChange).
	const defaultVolumeRef = useRef(defaultVolume);
	defaultVolumeRef.current = defaultVolume;

	useEffect(() => {
		if (player?.setVolume) {
			player.setVolume(defaultVolumeRef.current);
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
				stableUniqueId,
				createYouTubePlayerOptions({
					source,
					loop: loopEnabled,
					onReady: (event: any) => {
						event.target.setVolume(volume);
						setPlaybackState("idle");
					},
					onStateChange: (event: any) => {
						// -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
						if (event.data === 1) setPlaybackState("playing");
						if (event.data === 2) setPlaybackState("paused");
						if (event.data === 0 && loopEnabled) {
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
			playerRef.current = newPlayer;
			setPlayer(newPlayer);

			// Cleanup: destroy the player when this effect's lifetime ends
			// (component unmount or deps change before the next re-init).
			// Without this, the YT.Player instance plus its iframe and
			// listeners are leaked on unmount.
			return () => {
				try {
					newPlayer.destroy();
				} catch {
					// Player may already be destroyed or in an invalid state
					// (e.g. partial init if component unmounted mid-construction).
				}
				if (playerRef.current === newPlayer) {
					playerRef.current = null;
				}
			};
		}
	}, [isApiReady, source, player, stableUniqueId, volume]);

	// Handle Source Change
	const handleSaveUrl = () => {
		const newSource = parseYouTubeUrl(inputUrl);
		if (newSource) {
			onUrlChange(inputUrl);
			setError(null);
			if (player) {
				try {
					player.destroy();
				} catch {
					// Player may already be destroyed
				}
				playerRef.current = null;
				setPlayer(null); // Will trigger re-initialization
			}
		} else {
			setError("無効なURL形式です.");
		}
	};

	// Recreate player when loop setting changes to apply IFrame params
	useEffect(() => {
		if (player) {
			try {
				player.destroy();
			} catch {
				// Player may already be destroyed
			}
			playerRef.current = null;
			setPlayer(null);
		}
	}, [loopEnabled, source]);

	// Unmount-only cleanup: guarantees the active YT.Player is destroyed
	// even if the component unmounts in a state where the Initialize
	// effect's cleanup did not run (e.g. player state set but deps did
	// not change since the last run). Uses playerRef as the source of
	// truth so it always observes the latest instance.
	useEffect(() => {
		return () => {
			if (playerRef.current) {
				try {
					playerRef.current.destroy();
				} catch {
					// Player may already be destroyed or in an invalid state
				}
				playerRef.current = null;
			}
		};
	}, []);

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
		uniqueId: stableUniqueId,
		volume,
	};
}
