"use client";

import type { InputType } from "./qr-code.utils";

interface QRInputSettingsProps {
	inputType: InputType;
	onInputTypeChange: (type: InputType) => void;
	inputText: string;
	onInputTextChange: (text: string) => void;
	isBulkMode: boolean;
	onBulkModeChange: (bulk: boolean) => void;
}

export default function QRInputSettings({
	inputType,
	onInputTypeChange,
	inputText,
	onInputTextChange,
	isBulkMode,
	onBulkModeChange,
}: QRInputSettingsProps) {
	return (
		<fieldset
			style={{
				border: "1px solid #ccc",
				padding: "15px",
				marginBottom: "20px",
			}}
		>
			<legend>Input Settings</legend>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "100px 1fr",
					gap: "10px",
				}}
			>
				<label htmlFor="inputType" style={{ alignSelf: "center" }}>
					Type:
				</label>
				<select
					id="inputType"
					value={inputType}
					onChange={(e) => onInputTypeChange(e.target.value as InputType)}
				>
					<option value="url">URL</option>
					<option value="text">Text</option>
					<option value="email">Email</option>
					<option value="phone">Phone</option>
					<option value="wifi">WiFi</option>
				</select>

				<label style={{ alignSelf: "center" }}>Mode:</label>
				<div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							cursor: "pointer",
						}}
					>
						<input
							type="radio"
							checked={!isBulkMode}
							onChange={() => onBulkModeChange(false)}
						/>
						Single
					</label>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							cursor: "pointer",
						}}
					>
						<input
							type="radio"
							checked={isBulkMode}
							onChange={() => onBulkModeChange(true)}
						/>
						Bulk
					</label>
				</div>

				<label
					htmlFor="inputText"
					style={{
						alignSelf: isBulkMode ? "start" : "center",
						marginTop: isBulkMode ? "4px" : "0",
					}}
				>
					Content:
				</label>
				{isBulkMode ? (
					<textarea
						id="inputText"
						value={inputText}
						onChange={(e) => onInputTextChange(e.target.value)}
						placeholder="Enter content here (1 line = 1 QR)..."
						rows={4}
						style={{
							padding: "4px",
							width: "100%",
							boxSizing: "border-box",
							resize: "vertical",
						}}
					/>
				) : (
					<input
						id="inputText"
						type="text"
						value={inputText}
						onChange={(e) => onInputTextChange(e.target.value)}
						placeholder="Enter content here..."
						style={{
							padding: "2px 4px",
							width: "100%",
							boxSizing: "border-box",
						}}
					/>
				)}
			</div>
		</fieldset>
	);
}
