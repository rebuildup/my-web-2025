"use client";

import type { Dispatch, SetStateAction } from "react";
import type { ColorInfo } from "@/lib/utils/color";
import type { ColorPaletteSettings } from "./color-palette-types";
import { exportPalette } from "./color-palette-utils";

interface PaletteExportProps {
	settings: ColorPaletteSettings;
	generatedColors: ColorInfo[];
	setSettings: Dispatch<SetStateAction<ColorPaletteSettings>>;
	onCopy: (text: string) => void;
}

export function PaletteExport({
	settings,
	generatedColors,
	setSettings,
	onCopy,
}: PaletteExportProps) {
	const exportText = exportPalette(
		settings.exportFormat,
		settings.generationAlgorithm,
		generatedColors,
	);

	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
			<legend>Export</legend>
			<div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
				<select
					style={{
						flex: 1,
						padding: "4px 8px",
						fontSize: "13px",
					}}
					value={settings.exportFormat}
					onChange={(e) =>
						setSettings((prev) => ({
							...prev,
							exportFormat: e.target
								.value as ColorPaletteSettings["exportFormat"],
						}))
					}
					aria-label="エクスポート形式"
				>
					<option value="css">CSS Variables</option>
					<option value="tailwind">Tailwind Config</option>
					<option value="json">JSON</option>
				</select>
				<button
					type="button"
					style={{
						padding: "4px 8px",
						cursor: "pointer",
						fontSize: "13px",
					}}
					onClick={() => onCopy(exportText)}
				>
					Copy
				</button>
			</div>
			<textarea
				readOnly
				style={{
					width: "100%",
					height: "100px",
					fontFamily: "monospace",
					fontSize: "11px",
					padding: "4px 8px",
					boxSizing: "border-box",
					border: "1px solid #eee",
				}}
				value={exportText}
				aria-label="エクスポート出力"
			/>
		</fieldset>
	);
}
