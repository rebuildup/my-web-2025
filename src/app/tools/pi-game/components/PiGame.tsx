"use client";

import { useFullscreen } from "../hooks/useFullscreen";
import { useKeyboardInput } from "../hooks/useKeyboardInput";
import { usePiGameState } from "../hooks/usePiGameState";
import { FullscreenButton } from "./FullscreenButton";
import { PiGameDisplay } from "./PiGameDisplay";
import { PiGameKeypad } from "./PiGameKeypad";

export default function PiGame() {
	const { isFullscreen, toggleFullscreen } = useFullscreen();
	const {
		currentPosition,
		inputSequence,
		isGameStarted,
		isGameOver,
		highlightThree,
		handleInput,
		getCorrectSequenceWithError,
	} = usePiGameState();

	useKeyboardInput(handleInput);

	return (
		<div
			className="flex flex-col items-center justify-start px-4"
			style={{
				paddingTop: isFullscreen ? 64 : 32,
				gap: isFullscreen ? 20 : 12,
				minHeight: isFullscreen ? "100dvh" : undefined,
				backgroundColor: isFullscreen ? "#fff" : undefined,
			}}
		>
			<FullscreenButton
				isFullscreen={isFullscreen}
				onToggle={toggleFullscreen}
			/>
			<PiGameDisplay
				isFullscreen={isFullscreen}
				isGameStarted={isGameStarted}
				isGameOver={isGameOver}
				inputSequence={inputSequence}
				currentPosition={currentPosition}
				getCorrectSequenceWithError={getCorrectSequenceWithError}
			/>
			<PiGameKeypad
				isFullscreen={isFullscreen}
				highlightThree={highlightThree}
				onInput={handleInput}
			/>
		</div>
	);
}
