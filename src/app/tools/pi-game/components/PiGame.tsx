"use client";

import { useCallback, useEffect, useState } from "react";
import { getPiDigit } from "../utils/piDigits";

export default function PiGame() {
	const [currentPosition, setCurrentPosition] = useState(-1);
	const [inputSequence, setInputSequence] = useState("3");
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
	const [highlightThree, setHighlightThree] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const onFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", onFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", onFullscreenChange);
	}, []);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}, []);

	const handleInput = useCallback(
		(digit: string) => {
			if (isGameOver) {
				if (digit === "3") {
					setCurrentPosition(-1);
					setInputSequence("3");
					setIsGameStarted(true);
					setIsGameOver(false);
					setCorrectAnswer(null);
					setHighlightThree(false);
				}
				return;
			}

			if (!isGameStarted) {
				if (digit === "3") {
					setIsGameStarted(true);
					setInputSequence("3");
				}
				return;
			}

			if (currentPosition === -1) {
				if (digit === ".") {
					setCurrentPosition(0);
					setInputSequence((prev) => `${prev}.`);
				} else {
					setCorrectAnswer(".");
					setIsGameOver(true);
					setHighlightThree(true);
				}
				return;
			}

			const correctDigit = getPiDigit(currentPosition);

			if (digit === correctDigit) {
				setCurrentPosition((prev) => prev + 1);
				setInputSequence((prev) => prev + digit);
			} else {
				setCorrectAnswer(correctDigit);
				setIsGameOver(true);
				setHighlightThree(true);
			}
		},
		[currentPosition, isGameStarted, isGameOver],
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const digit = event.key;
			if (
				/^[0-9]$/.test(digit) ||
				digit === "." ||
				event.code === "NumpadDecimal"
			) {
				event.preventDefault();
				handleInput(
					digit === "." || event.code === "NumpadDecimal" ? "." : digit,
				);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleInput]);

	const getCorrectSequenceWithError = () => {
		if (!isGameOver || !correctAnswer) return inputSequence;

		let correctSequence = "3.";
		for (let i = 0; i < currentPosition; i++) {
			correctSequence += getPiDigit(i);
		}
		return correctSequence + correctAnswer;
	};

	const KEY_STYLE: React.CSSProperties = {
		width: isFullscreen ? 160 : 120,
		height: isFullscreen ? 160 : 120,
		fontSize: isFullscreen ? 28 : 20,
		fontFamily: "inherit",
		cursor: "pointer",
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "flex-start",
				paddingTop: isFullscreen ? 64 : 32,
				paddingLeft: 16,
				paddingRight: 16,
				gap: isFullscreen ? 20 : 12,
				minHeight: isFullscreen ? "100vh" : undefined,
				backgroundColor: isFullscreen ? "#fff" : undefined,
			}}
		>
			{/* 全画面ボタン */}
			<button
				type="button"
				onClick={toggleFullscreen}
				style={{
					position: isFullscreen ? "fixed" : "relative",
					top: isFullscreen ? 16 : undefined,
					right: isFullscreen ? 16 : undefined,
					zIndex: isFullscreen ? 10 : undefined,
					padding: "8px 16px",
					fontSize: 14,
					fontFamily: "inherit",
					cursor: "pointer",
					border: "1px solid #ccc",
					borderRadius: 4,
					backgroundColor: "#f5f5f5",
					alignSelf: "flex-end",
				}}
			>
				{isFullscreen ? "終了" : "全画面"}
			</button>
			{/* 数字表示エリア */}
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
										const visible = sequence
											.slice(startIndex)
											.split("");
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

			{/* テンキー */}
			<div style={{ display: "flex", justifyContent: "center" }}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: isFullscreen ? 12 : 8,
					}}
				>
					{/* Row 1: 7, 8, 9 */}
					<button
						type="button"
						onClick={() => handleInput("7")}
						style={KEY_STYLE}
						aria-label="7"
					>
						7
					</button>
					<button
						type="button"
						onClick={() => handleInput("8")}
						style={KEY_STYLE}
						aria-label="8"
					>
						8
					</button>
					<button
						type="button"
						onClick={() => handleInput("9")}
						style={KEY_STYLE}
						aria-label="9"
					>
						9
					</button>

					{/* Row 2: 4, 5, 6 */}
					<button
						type="button"
						onClick={() => handleInput("4")}
						style={KEY_STYLE}
						aria-label="4"
					>
						4
					</button>
					<button
						type="button"
						onClick={() => handleInput("5")}
						style={KEY_STYLE}
						aria-label="5"
					>
						5
					</button>
					<button
						type="button"
						onClick={() => handleInput("6")}
						style={KEY_STYLE}
						aria-label="6"
					>
						6
					</button>

					{/* Row 3: 1, 2, 3 */}
					<button
						type="button"
						onClick={() => handleInput("1")}
						style={KEY_STYLE}
						aria-label="1"
					>
						1
					</button>
					<button
						type="button"
						onClick={() => handleInput("2")}
						style={KEY_STYLE}
						aria-label="2"
					>
						2
					</button>
					<button
						type="button"
						onClick={() => handleInput("3")}
						style={{
							...KEY_STYLE,
							backgroundColor: highlightThree ? "#e0e0ff" : undefined,
							color: highlightThree ? "#0066cc" : undefined,
						}}
						aria-label="3"
					>
						3
					</button>

					{/* Row 4: 0 (2倍幅) と . */}
					<button
						type="button"
						onClick={() => handleInput("0")}
						style={{
							...KEY_STYLE,
							width: isFullscreen ? 332 : 248,
							gridColumn: "span 2",
						}}
						aria-label="0"
					>
						0
					</button>
					<button
						type="button"
						onClick={() => handleInput(".")}
						style={KEY_STYLE}
						aria-label="小数点"
					>
						.
					</button>
				</div>
			</div>
		</div>
	);
}
