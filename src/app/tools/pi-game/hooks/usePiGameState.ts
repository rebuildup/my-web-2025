"use client";

import { useCallback, useState } from "react";
import { getPiDigit } from "../utils/piDigits";

export function usePiGameState() {
	const [currentPosition, setCurrentPosition] = useState(-1);
	const [inputSequence, setInputSequence] = useState("3");
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
	const [highlightThree, setHighlightThree] = useState(false);

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

	const getCorrectSequenceWithError = () => {
		if (!isGameOver || !correctAnswer) return inputSequence;

		let correctSequence = "3.";
		for (let i = 0; i < currentPosition; i++) {
			correctSequence += getPiDigit(i);
		}
		return correctSequence + correctAnswer;
	};

	return {
		currentPosition,
		inputSequence,
		isGameStarted,
		isGameOver,
		correctAnswer,
		highlightThree,
		handleInput,
		getCorrectSequenceWithError,
	};
}
