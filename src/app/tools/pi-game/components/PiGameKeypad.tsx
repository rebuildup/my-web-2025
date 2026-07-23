"use client";

import type React from "react";

interface PiGameKeypadProps {
	isFullscreen: boolean;
	highlightThree: boolean;
	onInput: (digit: string) => void;
}

export function PiGameKeypad({
	isFullscreen,
	highlightThree,
	onInput,
}: PiGameKeypadProps) {
	const KEY_STYLE: React.CSSProperties = {
		width: isFullscreen ? 160 : 120,
		height: isFullscreen ? 160 : 120,
		fontSize: isFullscreen ? 28 : 20,
		fontFamily: "inherit",
		cursor: "pointer",
	};

	return (
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
					onClick={() => onInput("7")}
					style={KEY_STYLE}
					aria-label="7"
				>
					7
				</button>
				<button
					type="button"
					onClick={() => onInput("8")}
					style={KEY_STYLE}
					aria-label="8"
				>
					8
				</button>
				<button
					type="button"
					onClick={() => onInput("9")}
					style={KEY_STYLE}
					aria-label="9"
				>
					9
				</button>

				{/* Row 2: 4, 5, 6 */}
				<button
					type="button"
					onClick={() => onInput("4")}
					style={KEY_STYLE}
					aria-label="4"
				>
					4
				</button>
				<button
					type="button"
					onClick={() => onInput("5")}
					style={KEY_STYLE}
					aria-label="5"
				>
					5
				</button>
				<button
					type="button"
					onClick={() => onInput("6")}
					style={KEY_STYLE}
					aria-label="6"
				>
					6
				</button>

				{/* Row 3: 1, 2, 3 */}
				<button
					type="button"
					onClick={() => onInput("1")}
					style={KEY_STYLE}
					aria-label="1"
				>
					1
				</button>
				<button
					type="button"
					onClick={() => onInput("2")}
					style={KEY_STYLE}
					aria-label="2"
				>
					2
				</button>
				<button
					type="button"
					onClick={() => onInput("3")}
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
					onClick={() => onInput("0")}
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
					onClick={() => onInput(".")}
					style={KEY_STYLE}
					aria-label="小数点"
				>
					.
				</button>
			</div>
		</div>
	);
}
