"use client";

interface PaletteActionsProps {
	onGenerate: () => void;
	onSave: () => void;
}

export function PaletteActions({ onGenerate, onSave }: PaletteActionsProps) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "8px",
			}}
		>
			<button
				type="button"
				onClick={onGenerate}
				style={{
					padding: "4px 8px",
					cursor: "pointer",
					fontSize: "13px",
				}}
			>
				Generate Colors
			</button>
			<button
				type="button"
				onClick={onSave}
				style={{
					padding: "4px 8px",
					cursor: "pointer",
					fontSize: "13px",
				}}
			>
				Save Palette
			</button>
		</div>
	);
}
