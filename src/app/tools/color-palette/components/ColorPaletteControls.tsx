"use client";

import type { Dispatch, SetStateAction } from "react";
import {
	type ColorRangePresetName,
	colorRangePresets,
	generationAlgorithms,
} from "./color-palette-constants";
import type { ColorPaletteSettings } from "./color-palette-types";

interface ColorPaletteControlsProps {
	settings: ColorPaletteSettings;
	setSettings: Dispatch<SetStateAction<ColorPaletteSettings>>;
	onApplyPreset: (preset: ColorRangePresetName) => void;
}

export function ColorPaletteControls({
	settings,
	setSettings,
	onApplyPreset,
}: ColorPaletteControlsProps) {
	return (
		<>
			<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
				<legend>Algorithm & Limits</legend>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "80px 1fr",
						gap: "8px",
						alignItems: "center",
					}}
				>
					<label htmlFor="algo-select" style={{ whiteSpace: "nowrap" }}>
						Algorithm:
					</label>
					<select
						id="algo-select"
						style={{
							width: "100%",
							padding: "4px 8px",
							fontSize: "13px",
							boxSizing: "border-box",
						}}
						value={settings.generationAlgorithm}
						onChange={(e) =>
							setSettings((prev) => ({
								...prev,
								generationAlgorithm: e.target
									.value as ColorPaletteSettings["generationAlgorithm"],
							}))
						}
					>
						{Object.entries(generationAlgorithms).map(([key, value]) => (
							<option key={key} value={key}>
								{value}
							</option>
						))}
					</select>
					<label htmlFor="count-input" style={{ whiteSpace: "nowrap" }}>
						Count:
					</label>
					<input
						id="count-input"
						type="number"
						min="1"
						max="20"
						style={{
							width: "100%",
							padding: "4px 8px",
							fontSize: "13px",
							boxSizing: "border-box",
						}}
						value={settings.colorCount}
						onChange={(e) =>
							setSettings((prev) => ({
								...prev,
								colorCount: Number(e.target.value),
							}))
						}
					/>
					<label htmlFor="sort-select" style={{ whiteSpace: "nowrap" }}>
						Sort By:
					</label>
					<select
						id="sort-select"
						style={{
							width: "100%",
							padding: "4px 8px",
							fontSize: "13px",
							boxSizing: "border-box",
						}}
						value={settings.sortBy}
						onChange={(e) =>
							setSettings((prev) => ({
								...prev,
								sortBy: e.target.value as ColorPaletteSettings["sortBy"],
							}))
						}
					>
						<option value="none">None</option>
						<option value="hue">Hue</option>
						<option value="lightness">Lightness</option>
						<option value="saturation">Saturation</option>
					</select>
				</div>
			</fieldset>

			<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
				<legend>Color Range</legend>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: "4px",
								fontSize: "12px",
							}}
						>
							<span>Hue:</span>
							<span>
								{settings.hueRange.min} - {settings.hueRange.max}
							</span>
						</div>
						<div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
							<input
								type="range"
								min="0"
								max="360"
								value={settings.hueRange.min}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										hueRange: {
											...prev.hueRange,
											min: Number(e.target.value),
										},
									}))
								}
								style={{ flex: 1 }}
								aria-label="色相の最小値"
							/>
							<input
								type="range"
								min="0"
								max="360"
								value={settings.hueRange.max}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										hueRange: {
											...prev.hueRange,
											max: Number(e.target.value),
										},
									}))
								}
								style={{ flex: 1 }}
								aria-label="色相の最大値"
							/>
						</div>
					</div>
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: "4px",
								fontSize: "12px",
							}}
						>
							<span>Sat:</span>
							<span>
								{settings.saturationRange.min} - {settings.saturationRange.max}
							</span>
						</div>
						<div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
							<input
								type="range"
								min="0"
								max="100"
								value={settings.saturationRange.min}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										saturationRange: {
											...prev.saturationRange,
											min: Number(e.target.value),
										},
									}))
								}
								style={{ flex: 1 }}
								aria-label="彩度の最小値"
							/>
							<input
								type="range"
								min="0"
								max="100"
								value={settings.saturationRange.max}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										saturationRange: {
											...prev.saturationRange,
											max: Number(e.target.value),
										},
									}))
								}
								style={{ flex: 1 }}
								aria-label="彩度の最大値"
							/>
						</div>
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(5, 1fr)",
							gap: "4px",
						}}
					>
						{Object.keys(colorRangePresets).map((preset) => (
							<button
								key={preset}
								type="button"
								style={{
									padding: "4px 8px",
									cursor: "pointer",
									fontSize: "12px",
									textAlign: "center",
								}}
								onClick={() => onApplyPreset(preset as ColorRangePresetName)}
							>
								{preset}
							</button>
						))}
					</div>
				</div>
			</fieldset>
		</>
	);
}
