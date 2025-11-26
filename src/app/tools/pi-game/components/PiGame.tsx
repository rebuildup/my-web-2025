"use client";

import { useCallback, useEffect, useState } from "react";
import { getPiDigit } from "../utils/piDigits";

export default function PiGame() {
	// サイズ定数（1.5倍）
	const KEY_SIZE = "w-30 h-30"; // キーのサイズ（120px x 120px）
	const GAP_SIZE = "gap-2"; // キー間の余白
	const DISPLAY_HEIGHT = "h-30"; // 入力枠の高さ（キーと同じ）

	// キーの共通スタイル
	const KEY_BASE_STYLE = `${KEY_SIZE} rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-2xl neue-haas-grotesk-display cursor-pointer select-none transition-all duration-150 hover:bg-main/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] active:bg-main/30 active:text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base`;
	const KEY_ZERO_STYLE = `col-span-2 h-30 w-[calc(2*7.5rem+0.5rem)] rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-2xl neue-haas-grotesk-display cursor-pointer select-none transition-all duration-150 hover:bg-main/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] active:bg-main/30 active:text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base`;

	const [currentPosition, setCurrentPosition] = useState(-1); // -1: 小数点待ち, 0以上: 小数点以下の桁
	const [inputSequence, setInputSequence] = useState("3");
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
	const [highlightThree, setHighlightThree] = useState(false);

	const handleInput = useCallback(
		(digit: string) => {
			if (isGameOver) {
				// リトライ処理（3のみ受け付け）- 3を入力済みの状態で次のゲーム開始
				if (digit === "3") {
					setCurrentPosition(-1);
					setInputSequence("3");
					setIsGameStarted(true); // 直接ゲーム開始状態に
					setIsGameOver(false);
					setCorrectAnswer(null);
					setHighlightThree(false);
				}
				return;
			}

			if (!isGameStarted) {
				// ゲーム開始（3のみ受け付け）
				if (digit === "3") {
					setIsGameStarted(true);
					setInputSequence("3");
				}
				return;
			}

			// 小数点の処理
			if (currentPosition === -1) {
				if (digit === ".") {
					setCurrentPosition(0);
					setInputSequence((prev) => `${prev}.`);
				} else {
					// 小数点以外は間違い
					setCorrectAnswer(".");
					setIsGameOver(true);
					setHighlightThree(true);
				}
				return;
			}

			const correctDigit = getPiDigit(currentPosition);

			if (digit === correctDigit) {
				// 正解
				setCurrentPosition((prev) => prev + 1);
				setInputSequence((prev) => prev + digit);
			} else {
				// 間違い
				setCorrectAnswer(correctDigit);
				setIsGameOver(true);
				setHighlightThree(true);
			}
		},
		[currentPosition, isGameStarted, isGameOver],
	);

	// キーボード入力の処理
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const digit = event.key;
			// 数字キーまたはテンキーの小数点を検出
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

	// ミス時の表示用の正しいシーケンスを生成
	const getCorrectSequenceWithError = () => {
		if (!isGameOver || !correctAnswer) return inputSequence;

		// 現在の位置までの正しいシーケンスを生成
		let correctSequence = "3.";
		for (let i = 0; i < currentPosition; i++) {
			correctSequence += getPiDigit(i);
		}
		return correctSequence + correctAnswer;
	};

	return (
		<div className="flex flex-col items-center justify-start pt-8 p-4 space-y-3">
			{/* 数字表示エリア - キーと同じ高さ、テンキーと同じ横幅 */}
			<div className="flex justify-center">
				<div
					className={`${DISPLAY_HEIGHT} w-[calc(3*7.5rem+2*0.5rem)] rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center`}
				>
					<div className="font-mono text-3xl text-center overflow-hidden px-4">
						{!isGameStarted ? (
							<span className="text-accent">3 to Start</span>
						) : isGameOver ? (
							<div className="space-y-1">
								<div className="text-sm text-accent">
									結果 : {currentPosition >= 0 ? currentPosition + 1 : 0}桁
								</div>
								<div className="whitespace-nowrap">
									{(() => {
										const sequence = getCorrectSequenceWithError();
										return sequence.length > 12
											? sequence.slice(-12)
											: sequence;
									})()
										.split("")
										.map((char, index, array) => {
											const isLastChar = index === array.length - 1;
											return (
												<span
													key={index}
													className={isLastChar ? "text-red-500 font-bold" : ""}
												>
													{char}
												</span>
											);
										})}
								</div>
								<div className="text-sm text-accent">3 to Retry</div>
							</div>
						) : (
							<div className="whitespace-nowrap">
								{inputSequence.length > 12
									? inputSequence.slice(-12)
									: inputSequence}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* テンキー */}
			<div className="flex justify-center">
				<div className={`grid grid-cols-3 ${GAP_SIZE}`}>
					{/* Row 1: 7, 8, 9 */}
					<button
						type="button"
						onClick={() => handleInput("7")}
						className={KEY_BASE_STYLE}
					>
						7
					</button>
					<button
						type="button"
						onClick={() => handleInput("8")}
						className={KEY_BASE_STYLE}
					>
						8
					</button>
					<button
						type="button"
						onClick={() => handleInput("9")}
						className={KEY_BASE_STYLE}
					>
						9
					</button>

					{/* Row 2: 4, 5, 6 */}
					<button
						type="button"
						onClick={() => handleInput("4")}
						className={KEY_BASE_STYLE}
					>
						4
					</button>
					<button
						type="button"
						onClick={() => handleInput("5")}
						className={KEY_BASE_STYLE}
					>
						5
					</button>
					<button
						type="button"
						onClick={() => handleInput("6")}
						className={KEY_BASE_STYLE}
					>
						6
					</button>

					{/* Row 3: 1, 2, 3 */}
					<button
						type="button"
						onClick={() => handleInput("1")}
						className={KEY_BASE_STYLE}
					>
						1
					</button>
					<button
						type="button"
						onClick={() => handleInput("2")}
						className={KEY_BASE_STYLE}
					>
						2
					</button>
					<button
						type="button"
						onClick={() => handleInput("3")}
						className={`${KEY_SIZE} rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-2xl neue-haas-grotesk-display cursor-pointer select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base ${
							highlightThree
								? "bg-main/30 text-main hover:bg-main/40 hover:text-main active:bg-main/50 active:text-main"
								: "bg-base/75 hover:bg-main/20 hover:text-main active:bg-main/30 active:text-main"
						}`}
					>
						3
					</button>

					{/* Row 4: 0 (2倍幅、同じ高さ) と . */}
					<button
						type="button"
						onClick={() => handleInput("0")}
						className={KEY_ZERO_STYLE}
					>
						0
					</button>
					<button
						type="button"
						onClick={() => handleInput(".")}
						className={KEY_BASE_STYLE}
					>
						.
					</button>
				</div>
			</div>
		</div>
	);
}
