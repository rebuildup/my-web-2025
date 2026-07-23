"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ColorInfo,
	generateColorHarmony,
	generateGoldenRatioColors,
	generatePerceptuallyUniformColors,
	getAccessibilityInfo,
	hsvToRgb,
	randomInRange,
	rgbToHex,
	rgbToHsl,
	sortColorsByHue,
	sortColorsByLightness,
	sortColorsBySaturation,
} from "@/lib/utils/color";
import { RawDOMContainer } from "../../components/RawDOMContainer";

interface SavedPalette {
	id: string;
	name: string;
	colors: ColorInfo[];
	createdAt: string;
	tags: string[];
}

const colorRangePresets = {
	warm: { hMin: 0, hMax: 60, sMin: 50, sMax: 100, vMin: 40, vMax: 80 },
	cool: { hMin: 180, hMax: 240, sMin: 50, sMax: 100, vMin: 40, vMax: 80 },
	pastel: { hMin: 0, hMax: 360, sMin: 20, sMax: 60, vMin: 70, vMax: 90 },
	monochrome: { hMin: 0, hMax: 0, sMin: 0, sMax: 0, vMin: 10, vMax: 90 },
	vibrant: { hMin: 0, hMax: 360, sMin: 70, sMax: 100, vMin: 70, vMax: 100 },
	earth: { hMin: 20, hMax: 60, sMin: 30, sMax: 80, vMin: 30, vMax: 70 },
	ocean: { hMin: 180, hMax: 220, sMin: 40, sMax: 90, vMin: 30, vMax: 80 },
	sunset: { hMin: 300, hMax: 60, sMin: 60, sMax: 100, vMin: 50, vMax: 90 },
	forest: { hMin: 80, hMax: 140, sMin: 40, sMax: 80, vMin: 20, vMax: 60 },
	neon: { hMin: 0, hMax: 360, sMin: 90, sMax: 100, vMin: 80, vMax: 100 },
} as const;

const generationAlgorithms = {
	random: "Random HSV",
	golden: "Golden Ratio",
	perceptual: "Perceptually Uniform",
	harmony: "Color Harmony",
} as const;

interface ColorPaletteSettings {
	colorCount: number;
	hueRange: { min: number; max: number };
	saturationRange: { min: number; max: number };
	valueRange: { min: number; max: number };
	exportFormat: "css" | "tailwind" | "json";
	generationAlgorithm: keyof typeof generationAlgorithms;
	sortBy: "none" | "hue" | "lightness" | "saturation";
	autoSave: boolean;
}

const defaultSettings: ColorPaletteSettings = {
	colorCount: 5,
	hueRange: { min: 0, max: 360 },
	saturationRange: { min: 50, max: 100 },
	valueRange: { min: 50, max: 90 },
	exportFormat: "css",
	generationAlgorithm: "random",
	sortBy: "none",
	autoSave: false,
};

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

	const generateRandomColors = useCallback((): ColorInfo[] => {
		const colors: ColorInfo[] = [];
		const usedColors = new Set<string>();

		while (colors.length < settings.colorCount) {
			const h = randomInRange(settings.hueRange.min, settings.hueRange.max);
			const s = randomInRange(
				settings.saturationRange.min,
				settings.saturationRange.max,
			);
			const v = randomInRange(settings.valueRange.min, settings.valueRange.max);

			const rgb = hsvToRgb(h, s, v);
			const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

			if (!usedColors.has(hex)) {
				usedColors.add(hex);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
				const accessibility = getAccessibilityInfo(rgb);

				colors.push({ hex, rgb, hsv: { h, s, v }, hsl, accessibility });
			}
		}

		return colors;
	}, [settings]);

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
		let colors: ColorInfo[] = [];

		switch (settings.generationAlgorithm) {
			case "random":
				colors = generateRandomColors();
				break;
			case "golden": {
				const baseHue = randomInRange(
					settings.hueRange.min,
					settings.hueRange.max,
				);
				colors = generateGoldenRatioColors(baseHue, settings.colorCount);
				break;
			}
			case "perceptual":
				colors = generatePerceptuallyUniformColors(settings.colorCount);
				break;
			case "harmony":
				const baseH = randomInRange(
					settings.hueRange.min,
					settings.hueRange.max,
				);
				const baseS = randomInRange(
					settings.saturationRange.min,
					settings.saturationRange.max,
				);
				const baseV = randomInRange(
					settings.valueRange.min,
					settings.valueRange.max,
				);
				colors = generateColorHarmony(
					{ h: baseH, s: baseS, v: baseV },
					"analogous",
				).colors.slice(0, settings.colorCount);
				break;
		}

		switch (settings.sortBy) {
			case "hue":
				colors = sortColorsByHue(colors);
				break;
			case "lightness":
				colors = sortColorsByLightness(colors);
				break;
			case "saturation":
				colors = sortColorsBySaturation(colors);
				break;
		}

		setGeneratedColors(colors);
		if (settings.autoSave && colors.length > 0) {
			await savePalette(`Auto-saved ${new Date().toLocaleTimeString()}`);
		}
		showNotification(`${colors.length}色のパレットを生成しました`);
	}, [settings, generateRandomColors, savePalette, showNotification]);

	const applyPreset = (preset: keyof typeof colorRangePresets) => {
		const range = colorRangePresets[preset];
		setSettings((prev) => ({
			...prev,
			hueRange: { min: range.hMin, max: range.hMax },
			saturationRange: { min: range.sMin, max: range.sMax },
			valueRange: { min: range.vMin, max: range.vMax },
		}));
		showNotification(`${preset}プリセットを適用しました`);
	};

	const exportAsCSS = useCallback(() => {
		const cssVars = generatedColors
			.map((color, index) => ` --color-${index + 1}: ${color.hex};`)
			.join("\n");
		return `:root {\n${cssVars}\n}`;
	}, [generatedColors]);

	const exportAsTailwind = useCallback(() => {
		const colors = generatedColors.reduce<Record<string, string>>(
			(acc, color, index) => {
				acc[`color-${index + 1}`] = color.hex;
				return acc;
			},
			{},
		);
		return `module.exports = { theme: { extend: { colors: ${JSON.stringify(colors, null, 2)} } } }`;
	}, [generatedColors]);

	const exportAsJSON = useCallback(() => {
		return JSON.stringify(
			{
				palette: {
					algorithm: settings.generationAlgorithm,
					colors: generatedColors,
				},
			},
			null,
			2,
		);
	}, [generatedColors, settings]);

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
											.value as keyof typeof generationAlgorithms,
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
						<div
							style={{ display: "flex", flexDirection: "column", gap: "8px" }}
						>
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
								<div
									style={{ display: "flex", gap: "4px", alignItems: "center" }}
								>
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
										{settings.saturationRange.min} -{" "}
										{settings.saturationRange.max}
									</span>
								</div>
								<div
									style={{ display: "flex", gap: "4px", alignItems: "center" }}
								>
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
										onClick={() =>
											applyPreset(preset as keyof typeof colorRangePresets)
										}
									>
										{preset}
									</button>
								))}
							</div>
						</div>
					</fieldset>

					<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
						<legend>Saved Palettes</legend>
						<div
							style={{
								maxHeight: "160px",
								overflowY: "auto",
								fontSize: "12px",
							}}
						>
							{savedPalettes.length === 0
								? "No saved palettes."
								: savedPalettes.map((palette) => (
										<div
											key={palette.id}
											style={{
												display: "flex",
												justifyContent: "space-between",
												gap: "8px",
												marginBottom: "4px",
												borderBottom: "1px solid #eee",
												paddingBottom: "4px",
											}}
										>
											<span
												style={{
													minWidth: 0,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{palette.name} ({palette.colors.length}c)
											</span>
											<div
												style={{ display: "flex", gap: "4px", flexShrink: 0 }}
											>
												<button
													type="button"
													style={{
														padding: "4px 8px",
														cursor: "pointer",
														fontSize: "12px",
													}}
													onClick={() => setGeneratedColors(palette.colors)}
												>
													Load
												</button>
												<button
													type="button"
													style={{
														padding: "4px 8px",
														cursor: "pointer",
														fontSize: "12px",
													}}
													onClick={() =>
														setSavedPalettes((prev) =>
															prev.filter((saved) => saved.id !== palette.id),
														)
													}
												>
													Del
												</button>
											</div>
										</div>
									))}
						</div>
					</fieldset>
				</div>

				<div
					style={{
						flex: "1 1 360px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "8px",
						}}
					>
						<button
							type="button"
							onClick={generateColors}
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
							onClick={() => savePalette()}
							style={{
								padding: "4px 8px",
								cursor: "pointer",
								fontSize: "13px",
							}}
						>
							Save Palette
						</button>
					</div>

					<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
						<legend>Generated Palette</legend>
						{generatedColors.length === 0 ? (
							<div
								style={{
									padding: "8px",
									textAlign: "center",
									color: "#999",
									fontSize: "12px",
								}}
							>
								Click "Generate Colors" to begin.
							</div>
						) : (
							<>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
										gap: "6px",
									}}
								>
									{generatedColors.map((color) => (
										<div
											key={color.hex}
											style={{
												display: "flex",
												flexDirection: "column",
												border: "1px solid #ccc",
											}}
										>
											<div
												style={{
													backgroundColor: color.hex,
													height: "80px",
													width: "100%",
												}}
											/>
											<div
												style={{
													padding: "4px",
													fontSize: "11px",
													textAlign: "center",
												}}
											>
												<div
													style={{
														fontFamily: "monospace",
														marginBottom: "2px",
													}}
												>
													{color.hex}
												</div>
												<button
													type="button"
													onClick={() => copyToClipboard(color.hex)}
													style={{
														width: "100%",
														padding: "4px 8px",
														cursor: "pointer",
														fontSize: "11px",
													}}
												>
													Copy
												</button>
											</div>
										</div>
									))}
								</div>
								{notification && (
									<div
										style={{
											marginTop: "8px",
											padding: "4px 8px",
											background: "#f5f5f5",
											border: "1px solid #eee",
											fontSize: "12px",
											textAlign: "center",
										}}
									>
										{notification}
									</div>
								)}
							</>
						)}
					</fieldset>

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
								onClick={() => {
									const txt =
										settings.exportFormat === "css"
											? exportAsCSS()
											: settings.exportFormat === "tailwind"
												? exportAsTailwind()
												: exportAsJSON();
									copyToClipboard(txt);
								}}
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
							value={
								settings.exportFormat === "css"
									? exportAsCSS()
									: settings.exportFormat === "tailwind"
										? exportAsTailwind()
										: exportAsJSON()
							}
							aria-label="エクスポート出力"
						/>
					</fieldset>
				</div>
			</div>
		</RawDOMContainer>
	);
}
