"use client";

import type { Dispatch, SetStateAction } from "react";
import { presets } from "./presets";
import {
	BlankStyleSection,
	ButtonStyleSection,
	ColorSettingsSection,
	NavTabStyleSection,
	TextSizeSection,
} from "./StyleSections";
import type { StyleSettings } from "./types";

type Props = {
	settings: StyleSettings;
	setSettings: Dispatch<SetStateAction<StyleSettings>>;
};

const headerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	flexWrap: "wrap",
	gap: 8,
} as const;

const titleStyle = {
	fontWeight: 700,
	fontSize: 20,
	margin: 0,
} as const;

export function StyleSettingsPanel({ settings, setSettings }: Props) {
	const selectedPreset =
		Object.keys(presets).find(
			(key) => JSON.stringify(presets[key]) === JSON.stringify(settings),
		) ?? "custom";

	return (
		<fieldset
			style={{
				border: "1px solid #ccc",
				padding: 16,
				marginTop: 16,
			}}
		>
			<legend>スタイル設定</legend>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div style={headerStyle}>
					<h2 style={titleStyle}>スタイル設定</h2>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<label style={{ fontSize: 14 }}>プリセット:</label>
						<select
							value={selectedPreset}
							onChange={(event) => {
								const presetName = event.target.value;
								if (presetName !== "custom" && presets[presetName]) {
									setSettings(presets[presetName]);
								}
							}}
							style={{
								padding: "4px 8px",
								fontSize: 14,
								minWidth: 140,
							}}
							aria-label="プリセット"
						>
							{Object.keys(presets).map((key) => (
								<option key={key} value={key}>
									{key === "default"
										? "デフォルト"
										: key === "modern"
											? "モダン"
											: key === "warm"
												? "ウォーム"
												: key === "minimal"
													? "ミニマル"
													: key}
								</option>
							))}
							<option value="custom">カスタム</option>
						</select>
					</div>
				</div>

				<hr style={{ border: "none", borderTop: "1px solid #eee" }} />
				<ColorSettingsSection settings={settings} setSettings={setSettings} />
				<TextSizeSection settings={settings} setSettings={setSettings} />
				<ButtonStyleSection settings={settings} setSettings={setSettings} />
				<BlankStyleSection settings={settings} setSettings={setSettings} />
				<NavTabStyleSection settings={settings} setSettings={setSettings} />
			</div>
		</fieldset>
	);
}
