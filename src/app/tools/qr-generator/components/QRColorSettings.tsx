"use client";

interface QRColorSettingsProps {
	foregroundColor: string;
	onForegroundColorChange: (color: string) => void;
	backgroundColor: string;
	onBackgroundColorChange: (color: string) => void;
}

export default function QRColorSettings({
	foregroundColor,
	onForegroundColorChange,
	backgroundColor,
	onBackgroundColorChange,
}: QRColorSettingsProps) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>Colors</legend>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "100px 1fr",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<label htmlFor="fgColor">Foreground:</label>
				<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
					<input
						id="fgColor"
						type="color"
						value={foregroundColor}
						onChange={(e) => onForegroundColorChange(e.target.value)}
					/>
					<input
						type="text"
						value={foregroundColor}
						onChange={(e) => onForegroundColorChange(e.target.value)}
						style={{ flex: 1, padding: "2px 4px" }}
						aria-label="Foreground"
					/>
				</div>

				<label htmlFor="bgColor">Background:</label>
				<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
					<input
						id="bgColor"
						type="color"
						value={backgroundColor}
						onChange={(e) => onBackgroundColorChange(e.target.value)}
					/>
					<input
						type="text"
						value={backgroundColor}
						onChange={(e) => onBackgroundColorChange(e.target.value)}
						style={{ flex: 1, padding: "2px 4px" }}
						aria-label="Background"
					/>
				</div>
			</div>
		</fieldset>
	);
}
