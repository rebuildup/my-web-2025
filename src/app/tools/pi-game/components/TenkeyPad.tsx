"use client";

import { useCallback, useEffect } from "react";

interface TenkeyPadProps {
	onInput: (digit: string) => void;
	disabled?: boolean;
}

export default function TenkeyPad({
	onInput,
	disabled = false,
}: TenkeyPadProps) {
	const handleKeyPress = useCallback(
		(digit: string) => {
			if (!disabled) {
				onInput(digit);
			}
		},
		[onInput, disabled],
	);

	// Handle keyboard input
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (disabled) return;

			const digit = event.key;
			if (/^[0-9]$/.test(digit)) {
				event.preventDefault();
				handleKeyPress(digit);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyPress, disabled]);

	const buttonClass = `
    rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] aspect-square flex items-center justify-center text-2xl neue-haas-grotesk-display
    focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base
    transition-colors duration-150 min-h-16
    ${
			disabled
				? "opacity-50 cursor-not-allowed"
				: "hover:bg-main hover:text-base active:bg-main active:text-base"
		}
  `;

	return (
		<div className="max-w-md mx-auto">
			<div className="grid grid-cols-3 gap-2">
				{/* Row 1: 7, 8, 9 */}
				<button
					type="button"
					onClick={() => handleKeyPress("7")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字7"
				>
					7
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("8")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字8"
				>
					8
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("9")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字9"
				>
					9
				</button>

				{/* Row 2: 4, 5, 6 */}
				<button
					type="button"
					onClick={() => handleKeyPress("4")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字4"
				>
					4
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("5")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字5"
				>
					5
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("6")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字6"
				>
					6
				</button>

				{/* Row 3: 1, 2, 3 */}
				<button
					type="button"
					onClick={() => handleKeyPress("1")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字1"
				>
					1
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("2")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字2"
				>
					2
				</button>
				<button
					type="button"
					onClick={() => handleKeyPress("3")}
					disabled={disabled}
					className={buttonClass}
					aria-label="数字3"
				>
					3
				</button>

				{/* Row 4: 0 (spans 3 columns) */}
				<button
					type="button"
					onClick={() => handleKeyPress("0")}
					disabled={disabled}
					className={`${buttonClass} col-span-3 aspect-auto`}
					aria-label="数字0"
				>
					0
				</button>
			</div>

			<div className="mt-4 text-center">
				<p className="noto-sans-jp-light text-xs text-accent">
					キーボードの数字キーでも入力できます
				</p>
			</div>
		</div>
	);
}
