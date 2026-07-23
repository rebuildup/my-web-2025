import { YouTubePlayerContent } from "./YouTubePlayerContent";
import { YouTubePlayerControls } from "./YouTubePlayerControls";
import { YouTubePlayerHeader } from "./YouTubePlayerHeader";
import type { YouTubePlayerProps } from "./YouTubePlayer.types";
import { useYouTubePlayer } from "./useYouTubePlayer";

export default function YouTubePlayer(props: YouTubePlayerProps) {
	const { theme } = props;
	const {
		error,
		handleNext,
		handlePrevious,
		handleSaveUrl,
		handleVolumeChange,
		inputUrl,
		isMinimized,
		isMuted,
		isPlaylist,
		playbackState,
		setInputUrl,
		setSettings,
		setShowSettings,
		showSettings,
		source,
		toggleMinimize,
		toggleMute,
		togglePlay,
		toggleSettings,
		uniqueId,
		volume,
	} = useYouTubePlayer(props);

	return (
		<div
			className={`flex flex-col w-full h-full overflow-hidden ${
				theme === "dark" ? "" : ""
			}`}
		>
			<YouTubePlayerHeader
				theme={theme}
				isMinimized={isMinimized}
				showSettings={showSettings}
				onToggleMinimize={toggleMinimize}
				onToggleSettings={toggleSettings}
			/>

			<YouTubePlayerContent
				hasSource={Boolean(source)}
				uniqueId={uniqueId}
				error={error}
			/>

			<YouTubePlayerControls
				theme={theme}
				isMinimized={isMinimized}
				isPlaylist={isPlaylist}
				playbackState={playbackState}
				isMuted={isMuted}
				volume={volume}
				inputUrl={inputUrl}
				showSettings={showSettings}
				onPrevious={handlePrevious}
				onTogglePlay={togglePlay}
				onNext={handleNext}
				onToggleMute={toggleMute}
				onVolumeChange={handleVolumeChange}
				onInputUrlChange={setInputUrl}
				onSaveUrl={handleSaveUrl}
			/>
		</div>
	);
}
