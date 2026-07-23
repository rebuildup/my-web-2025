"use client";

import { useEffect } from "react";

export function useKeyboardInput(onInput: (digit: string) => void) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const digit = event.key;
			if (
				/^[0-9]$/.test(digit) ||
				digit === "." ||
				event.code === "NumpadDecimal"
			) {
				event.preventDefault();
				onInput(digit === "." || event.code === "NumpadDecimal" ? "." : digit);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onInput]);
}
