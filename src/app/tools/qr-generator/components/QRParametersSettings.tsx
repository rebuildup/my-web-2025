"use client";

import type { ErrorLevel } from "./qr-code.utils";

interface QRParametersSettingsProps {
	size: number;
	onSizeChange: (size: number) => void;
	margin: number;
	onMarginChange: (margin: number) => void;
	errorLevel: ErrorLevel;
	onErrorLevelChange: (level: ErrorLevel) => void;
}

export default function QRParametersSettings({
	size,
	onSizeChange,
	margin,
	onMarginChange,
	errorLevel,
	onErrorLevelChange,
}: QRParametersSettingsProps) {
	return (
		<fieldset
			style={{
				border: "1px solid #ccc",
				padding: "15px",
				marginBottom: "20px",
			}}
		>
			<legend>QR Parameters</legend>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "100px 1fr",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<label htmlFor="sizeRange">Size:</label>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<input
						id="sizeRange"
						type="range"
						min="128"
						max="1024"
						step="32"
						value={size}
						onChange={(e) => onSizeChange(Number(e.target.value))}
						style={{ flex: 1 }}
					/>
					<span style={{ width: "50px", textAlign: "right" }}>{size}px</span>
				</div>

				<label htmlFor="marginRange">Margin:</label>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<input
						id="marginRange"
						type="range"
						min="0"
						max="10"
						step="1"
						value={margin}
						onChange={(e) => onMarginChange(Number(e.target.value))}
						style={{ flex: 1 }}
					/>
					<span style={{ width: "50px", textAlign: "right" }}>{margin}</span>
				</div>

				<label htmlFor="errorLevel">Error Corr:</label>
				<select
					id="errorLevel"
					value={errorLevel}
					onChange={(e) => onErrorLevelChange(e.target.value as ErrorLevel)}
				>
					<option value="L">Low (7%)</option>
					<option value="M">Medium (15%)</option>
					<option value="Q">Quartile (25%)</option>
					<option value="H">High (30%)</option>
				</select>
			</div>
		</fieldset>
	);
}
