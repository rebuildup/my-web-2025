"use client";

interface PiGameDisplayProps {
	isFullscreen: boolean;
	isGameStarted: boolean;
	isGameOver: boolean;
	inputSequence: string;
	currentPosition: number;
	getCorrectSequenceWithError: () => string;
}

export function PiGameDisplay({
	isFullscreen,
	isGameStarted,
	isGameOver,
	inputSequence,
	currentPosition,
	getCorrectSequenceWithError,
}: PiGameDisplayProps) {
	return (
		<div style={{ display: "flex", justifyContent: "center" }}>
			<div
				style={{
					height: isFullscreen ? 160 : 120,
					width: isFullscreen ? 480 : 360,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					border: "1px solid #ccc",
					borderRadius: 4,
				}}
			>
				<div
					style={{
						fontFamily: "monospace",
						fontSize: isFullscreen ? 40 : 28,
						textAlign: "center",
						overflow: "hidden",
						paddingLeft: 16,
						paddingRight: 16,
					}}
				>
					{!isGameStarted ? (
						<span style={{ color: "#0066cc" }}>3 to Start</span>
					) : isGameOver ? (
						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<div
								style={{ fontSize: isFullscreen ? 18 : 14, color: "#0066cc" }}
							>
								結果 : {currentPosition >= 0 ? currentPosition + 1 : 0}桁
							</div>
							<div style={{ whiteSpace: "nowrap" }}>
								{(() => {
									const sequence = getCorrectSequenceWithError();
									const startIndex =
										sequence.length > 12 ? sequence.length - 12 : 0;
									const visible = sequence.slice(startIndex).split("");
									return visible.map((char, index, array) => {
										const isLastChar = index === array.length - 1;
										const absIndex = startIndex + index;
										return (
											<span
												key={absIndex}
												style={{
													color: isLastChar ? "#cc0000" : "#000",
													fontWeight: isLastChar ? 700 : 400,
												}}
											>
												{char}
											</span>
										);
									});
								})()}
							</div>
							<div
								style={{ fontSize: isFullscreen ? 18 : 14, color: "#0066cc" }}
							>
								3 to Retry
							</div>
						</div>
					) : (
						<div style={{ whiteSpace: "nowrap" }}>
							{inputSequence.length > 12
								? inputSequence.slice(-12)
								: inputSequence}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
