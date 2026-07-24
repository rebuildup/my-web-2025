"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorInfo } from "@/lib/utils/color";
import { RawDOMContainer } from "../../components/RawDOMContainer";
import { ColorPaletteControls } from "./ColorPaletteControls";
import {
	type ColorRangePresetName,
	colorRangePresets,
	defaultSettings,
} from "./color-palette-constants";
import type { ColorPaletteSettings, SavedPalette } from "./color-palette-types";
import { generatePaletteColors } from "./color-palette-utils";
import { GeneratedPalette } from "./GeneratedPalette";
import { PaletteActions } from "./PaletteActions";
import { PaletteExport } from "./PaletteExport";
import { SavedPalettes } from "./SavedPalettes";

export default function ColorPaletteGenerator() {
	const [settings, setSettings] =
		useState<ColorPaletteSettings>(defaultSettings);
	const [generatedColors, setGeneratedColors] = useState<ColorInfo[]>([]);
	const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
	const [notification, setNotification] = useState("");

	const paletteIdRef = useRef(1);

	const showNotification = useCallback((message: string) => {
		setNotification(message);
		setTimeout(() => setNotification(""), 3000);
	}, []);

	const savePalette = useCallback(
		async (customName?: string) => {
			if (generatedColors.length === 0) {
				return;
			}

			const name = customName || `Palette ${savedPalettes.length + 1}`;
			const newPalette: SavedPalette = {
				id: `palette-${paletteIdRef.current++}`,
				name,
				colors: generatedColors,
				createdAt: new Date().toISOString(),
				tags: [settings.generationAlgorithm],
			};

			setSavedPalettes((prev) => [newPalette, ...prev]);
			showNotification(`パレット "${name}" を保存しました`);
		},
		[
			generatedColors,
			savedPalettes.length,
			settings.generationAlgorithm,
			showNotification,
		],
	);

	const generateColors = useCallback(async () => {
		const colors = generatePaletteColors(settings);

		setGeneratedColors(colors);
		if (settings.autoSave && colors.length > 0) {
			await savePalette(`Auto-saved ${new Date().toLocaleTimeString()}`);
		}
		showNotification(`${colors.length}色のパレットを生成しました`);
	}, [settings, savePalette, showNotification]);

	const applyPreset = (preset: ColorRangePresetName) => {
		const range = colorRangePresets[preset];
		setSettings((prev) => ({
			...prev,
			hueRange: { min: range.hMin, max: range.hMax },
			saturationRange: { min: range.sMin, max: range.sMax },
			valueRange: { min: range.vMin, max: range.vMax },
		}));
		showNotification(`${preset}プリセットを適用しました`);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			showNotification("コピーしました");
		} catch {
			showNotification("コピー失敗");
		}
	};

	useEffect(() => {
		const saved = localStorage.getItem("color-palettes-v2");
		if (saved) {
			try {
				setSavedPalettes(JSON.parse(saved));
			} catch (error) {
				console.error(error);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("color-palettes-v2", JSON.stringify(savedPalettes));
	}, [savedPalettes]);

	return (
		<RawDOMContainer
			title="Color Palette Generator"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Color Palette Generator" },
			]}
		>
			<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
				<div
					style={{
						flex: "1 1 360px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					<ColorPaletteControls
						settings={settings}
						setSettings={setSettings}
						onApplyPreset={applyPreset}
					/>
					<SavedPalettes
						savedPalettes={savedPalettes}
						onLoad={(colors) => setGeneratedColors(colors)}
						onDelete={(id) =>
							setSavedPalettes((prev) =>
								prev.filter((saved) => saved.id !== id),
							)
						}
					/>
				</div>

				<div
					style={{
						flex: "1 1 360px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					<PaletteActions
						onGenerate={generateColors}
						onSave={() => savePalette()}
					/>
					<GeneratedPalette
						generatedColors={generatedColors}
						notification={notification}
						onCopy={copyToClipboard}
					/>
					<PaletteExport
						settings={settings}
						generatedColors={generatedColors}
						setSettings={setSettings}
						onCopy={copyToClipboard}
					/>
				</div>
			</div>
		</RawDOMContainer>
	);
}
