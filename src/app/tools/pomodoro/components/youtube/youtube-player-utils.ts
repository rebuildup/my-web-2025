import type { YouTubeSource } from "./types";

interface YouTubePlayerOptionsParams {
	source: YouTubeSource;
	loop: boolean;
	onReady: (event: any) => void;
	onStateChange: (event: any) => void;
	onError: (event: any) => void;
}

export function loadYouTubeIframeApi(onReady: () => void) {
	if (!(window as any).YT) {
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		(window as any).onYouTubeIframeAPIReady = onReady;
	} else {
		onReady();
	}
}

export function createYouTubePlayerOptions({
	source,
	loop,
	onReady,
	onStateChange,
	onError,
}: YouTubePlayerOptionsParams) {
	return {
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
					: loop && source.videoId
						? source.videoId
						: undefined,
			index: source.index,
			autoplay: 0,
			controls: 1,
			modestbranding: 1,
			rel: 0,
			loop: loop ? 1 : 0,
		},
		events: {
			onReady,
			onStateChange,
			onError,
		},
	};
}

export function getYouTubePlayerErrorMessage(errorCode: number) {
	if (errorCode === 150 || errorCode === 101) {
		return "この動画は埋め込み再生が許可されていません.";
	}

	return "再生エラーが発生しました.";
}
