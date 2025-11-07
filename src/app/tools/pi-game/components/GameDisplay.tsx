"use client";

import type { GameState } from "../types";

interface PiContext {
	before: string;
	current: string;
	after: string;
	formatted: string;
}

interface GameDisplayProps {
	gameState: GameState;
	piContext: PiContext;
	showCorrectAnswer: string | null;
}

export default function GameDisplay({
	gameState,
	piContext,
	showCorrectAnswer,
}: GameDisplayProps) {
	return (
		<div className="space-y-6">
			{/* Score and Status */}
			<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6 text-center">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<div className="neue-haas-grotesk-display text-3xl text-main">
							{gameState.score}
						</div>
						<div className="noto-sans-jp-light text-sm text-accent">桁数</div>
					</div>
					<div>
						<div className="neue-haas-grotesk-display text-3xl text-accent">
							{gameState.mistakes}
						</div>
						<div className="noto-sans-jp-light text-sm text-accent">ミス</div>
					</div>
				</div>
			</div>

			{/* Pi Display */}
			<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6">
				<div className="text-center space-y-4">
					<h3 className="neue-haas-grotesk-display text-xl text-main">
						円周率 π
					</h3>

					{/* Current position indicator */}
					<div className="text-sm text-accent">
						位置: {gameState.currentPosition + 1}桁目
					</div>

					{/* Pi sequence display */}
					<div className="font-mono text-lg leading-relaxed break-all">
						<span className="text-main">3.</span>
						<span className="text-accent">{piContext.before}</span>
						<span className="bg-main text-base px-1 font-bold">
							{piContext.current}
						</span>
						<span className="text-accent opacity-50">{piContext.after}</span>
					</div>

					{/* Show correct answer when mistake is made */}
					{showCorrectAnswer && (
						<div className="text-center bg-accent text-main p-4">
							<div className="text-sm mb-2">正解は:</div>
							<div className="neue-haas-grotesk-display text-4xl font-bold">
								{showCorrectAnswer}
							</div>
						</div>
					)}

					{/* Game status messages */}
					{gameState.isGameOver && (
						<div className="bg-accent text-main p-4 text-center">
							<div className="neue-haas-grotesk-display text-xl mb-2">
								ゲーム終了！
							</div>
							<div className="noto-sans-jp-light text-sm">
								{gameState.score}桁まで正解しました
							</div>
						</div>
					)}

					{!gameState.isGameActive && !gameState.isGameOver && (
						<div className="text-center text-accent">
							<div className="noto-sans-jp-light text-sm">ゲーム準備中...</div>
						</div>
					)}
				</div>
			</div>

			{/* Last input feedback */}
			{gameState.inputValue && (
				<div className="text-center">
					<div className="text-sm text-accent mb-1">入力した数字:</div>
					<div
						className={`neue-haas-grotesk-display text-2xl font-bold ${
							showCorrectAnswer ? "text-red-500" : "text-green-500"
						}`}
					>
						{gameState.inputValue}
					</div>
				</div>
			)}
		</div>
	);
}
