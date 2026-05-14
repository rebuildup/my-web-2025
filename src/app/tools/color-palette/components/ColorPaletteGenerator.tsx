"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ColorHarmony,
	type ColorInfo,
	generateColorHarmony,
	generateGoldenRatioColors,
	generatePerceptuallyUniformColors,
	getAccessibilityInfo,
	hexToRgb,
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
};

const generationAlgorithms = {
	random: "Random HSV",
	golden: "Golden Ratio",
	perceptual: "Perceptually Uniform",
	harmony: "Color Harmony",
};

interface ColorPaletteSettings {
	colorCount: number;
	hueRange: { min: number; max: number };
	saturationRange: { min: number; max: number };
	valueRange: { min: number; max: number };
	exportFormat: "css" | "tailwind" | "json";
	showAccessibility: boolean;
	generationAlgorithm: keyof typeof generationAlgorithms;
	harmonyType: ColorHarmony["type"];
	sortBy: "none" | "hue" | "lightness" | "saturation";
	enableColorBlindCheck: boolean;
	autoSave: boolean;
}

const defaultSettings: ColorPaletteSettings = {
	colorCount: 5,
	hueRange: { min: 0, max: 360 },
	saturationRange: { min: 50, max: 100 },
	valueRange: { min: 50, max: 90 },
	exportFormat: "css",
	showAccessibility: false,
	generationAlgorithm: "random",
	harmonyType: "analogous",
	sortBy: "none",
	enableColorBlindCheck: true,
	autoSave: false,
};

export default function ColorPaletteGenerator() {
	const [settings, setSettings] = useState<ColorPaletteSettings>(defaultSettings);
	const [generatedColors, setGeneratedColors] = useState<ColorInfo[]>([]);
	const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
	const [currentHarmony, setCurrentHarmony] = useState<ColorHarmony | null>(null);
	const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
	const [importedPalette, setImportedPalette] = useState<string>("");
	const [paletteSearch, setPaletteSearch] = useState<string>("");
	const [notification, setNotification] = useState<string>("");
	
	const paletteIdRef = useRef(1);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const showNotification = useCallback((message: string) => {
		setNotification(message);
		setTimeout(() => setNotification(""), 3000);
	}, []);

	const generateRandomColors = useCallback((): ColorInfo[] => {
		const colors: ColorInfo[] = [];
		const usedColors = new Set<string>();

		while (colors.length < settings.colorCount) {
			const h = randomInRange(settings.hueRange.min, settings.hueRange.max);
			const s = randomInRange(settings.saturationRange.min, settings.saturationRange.max);
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

	const savePalette = useCallback(async (customName?: string) => {
		if (generatedColors.length === 0) return;
		const name = customName || `Palette ${savedPalettes.length + 1}`;
		const newPalette: SavedPalette = {
			id: `palette-${paletteIdRef.current++}`,
			name,
			colors: generatedColors,
			createdAt: new Date().toISOString(),
			tags: [settings.generationAlgorithm, settings.harmonyType],
		};
		setSavedPalettes((prev) => [newPalette, ...prev]);
		showNotification(`パレット "${name}" を保存しました`);
	}, [generatedColors, savedPalettes.length, settings.generationAlgorithm, settings.harmonyType, showNotification]);

	const generateColors = useCallback(async () => {
		let colors: ColorInfo[] = [];
		switch (settings.generationAlgorithm) {
			case "random":
				colors = generateRandomColors();
				break;
			case "golden": {
				const baseHue = randomInRange(settings.hueRange.min, settings.hueRange.max);
				colors = generateGoldenRatioColors(baseHue, settings.colorCount);
				break;
			}
			case "perceptual":
				colors = generatePerceptuallyUniformColors(settings.colorCount);
				break;
			case "harmony":
				if (selectedColor) {
					const harmony = generateColorHarmony(selectedColor.hsv, settings.harmonyType);
					colors = harmony.colors.slice(0, settings.colorCount);
					setCurrentHarmony(harmony);
				} else {
					const baseH = randomInRange(settings.hueRange.min, settings.hueRange.max);
					const baseS = randomInRange(settings.saturationRange.min, settings.saturationRange.max);
					const baseV = randomInRange(settings.valueRange.min, settings.valueRange.max);
					const harmony = generateColorHarmony({ h: baseH, s: baseS, v: baseV }, settings.harmonyType);
					colors = harmony.colors.slice(0, settings.colorCount);
					setCurrentHarmony(harmony);
				}
				break;
		}

		switch (settings.sortBy) {
			case "hue": colors = sortColorsByHue(colors); break;
			case "lightness": colors = sortColorsByLightness(colors); break;
			case "saturation": colors = sortColorsBySaturation(colors); break;
		}

		setGeneratedColors(colors);
		if (settings.autoSave && colors.length > 0) {
			await savePalette(`Auto-saved ${new Date().toLocaleTimeString()}`);
		}
		showNotification(`${colors.length}色のパレットを生成しました`);
	}, [settings, selectedColor, generateRandomColors, savePalette, showNotification]);

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
		const cssVars = generatedColors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join("\n");
		return `:root {\n${cssVars}\n}`;
	}, [generatedColors]);

	const exportAsTailwind = useCallback(() => {
		const colors = generatedColors.reduce((acc, color, index) => {
			acc[`color-${index + 1}`] = color.hex;
			return acc;
		}, {} as Record<string, string>);
		return `module.exports = { theme: { extend: { colors: ${JSON.stringify(colors, null, 2)} } } }`;
	}, [generatedColors]);

	const exportAsJSON = useCallback(() => {
		return JSON.stringify({ palette: { algorithm: settings.generationAlgorithm, colors: generatedColors } }, null, 2);
	}, [generatedColors, settings]);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			showNotification("コピーしました");
		} catch (err) {
			showNotification("コピー失敗");
		}
	};

	useEffect(() => {
		const saved = localStorage.getItem("color-palettes-v2");
		if (saved) {
			try { setSavedPalettes(JSON.parse(saved)); } catch (err) {}
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
				{ label: "Color Palette Generator" }
			]}
		>
			<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
				
				{/* Left Column: Settings */}
				<div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "15px" }}>
					
					{notification && <div style={{ padding: "10px", background: "#f0f0f0", border: "1px solid #333", fontSize: "0.9rem" }}>{notification}</div>}
					
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Algorithm & Limits</legend>
						<div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
							<label style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px" }}>
								Algorithm:
								<select style={{ all: "revert" }} value={settings.generationAlgorithm} onChange={(e) => setSettings({ ...settings, generationAlgorithm: e.target.value as any })}>
									{Object.entries(generationAlgorithms).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
								</select>
							</label>
							<label style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px" }}>
								Count:
								<input type="number" min="1" max="20" style={{ all: "revert" }} value={settings.colorCount} onChange={(e) => setSettings({ ...settings, colorCount: Number(e.target.value) })} />
							</label>
							<label style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px" }}>
								Sort By:
								<select style={{ all: "revert" }} value={settings.sortBy} onChange={(e) => setSettings({ ...settings, sortBy: e.target.value as any })}>
									<option value="none">None</option>
									<option value="hue">Hue</option>
									<option value="lightness">Lightness</option>
									<option value="saturation">Saturation</option>
								</select>
							</label>
						</div>
					</fieldset>

					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Color Range</legend>
						<div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
							<label>Hue: {settings.hueRange.min} - {settings.hueRange.max}
								<input type="range" min="0" max="360" value={settings.hueRange.max} onChange={(e) => setSettings({ ...settings, hueRange: { ...settings.hueRange, max: Number(e.target.value) } })} style={{ all: "revert", width: "100%" }} />
							</label>
							<label>Sat: {settings.saturationRange.min} - {settings.saturationRange.max}
								<input type="range" min="0" max="100" value={settings.saturationRange.max} onChange={(e) => setSettings({ ...settings, saturationRange: { ...settings.saturationRange, max: Number(e.target.value) } })} style={{ all: "revert", width: "100%" }} />
							</label>
							<div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
								{Object.keys(colorRangePresets).map((preset) => (
									<button key={preset} onClick={() => applyPreset(preset as keyof typeof colorRangePresets)} style={{ all: "revert", padding: "2px 6px", fontSize: "12px" }}>{preset}</button>
								))}
							</div>
						</div>
					</fieldset>

					<button onClick={generateColors} style={{ all: "revert", padding: "10px", fontSize: "1.1rem", fontWeight: "bold" }}>Generate Colors</button>
					<button onClick={() => savePalette()} style={{ all: "revert", padding: "5px" }}>Save Palette</button>
					
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Saved Palettes</legend>
						<div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.9rem" }}>
							{savedPalettes.length === 0 ? "No saved palettes." : savedPalettes.map(p => (
								<div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
									<span>{p.name} ({p.colors.length}c)</span>
									<div style={{ display: "flex", gap: "5px" }}>
										<button style={{ all: "revert", fontSize: "12px" }} onClick={() => setGeneratedColors(p.colors)}>Load</button>
										<button style={{ all: "revert", fontSize: "12px" }} onClick={() => setSavedPalettes(savedPalettes.filter(s => s.id !== p.id))}>Del</button>
									</div>
								</div>
							))}
						</div>
					</fieldset>
				</div>

				{/* Right Column: Visuals & Export */}
				<div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "20px" }}>
					
					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Generated Palette</legend>
						{generatedColors.length === 0 ? (
							<div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Click "Generate Colors" to begin.</div>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
								{generatedColors.map((color, i) => (
									<div key={i} style={{ display: "flex", flexDirection: "column", border: "1px solid #ccc" }}>
										<div style={{ backgroundColor: color.hex, height: "100px", width: "100%" }} />
										<div style={{ padding: "5px", fontSize: "0.85rem", textAlign: "center" }}>
											<strong style={{ display: "block" }}>{color.hex}</strong>
											<button onClick={() => copyToClipboard(color.hex)} style={{ all: "revert", fontSize: "11px", marginTop: "5px" }}>Copy HEX</button>
										</div>
									</div>
								))}
							</div>
						)}
					</fieldset>

					<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
						<legend>Export Palette</legend>
						<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
							<select style={{ all: "revert" }} value={settings.exportFormat} onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value as any })}>
								<option value="css">CSS Variables</option>
								<option value="tailwind">Tailwind Config</option>
								<option value="json">JSON</option>
							</select>
							<button style={{ all: "revert", padding: "2px 10px" }} onClick={() => {
								const txt = settings.exportFormat === "css" ? exportAsCSS() : settings.exportFormat === "tailwind" ? exportAsTailwind() : exportAsJSON();
								copyToClipboard(txt);
							}}>Copy Output</button>
						</div>
						<textarea 
							readOnly 
							style={{ all: "revert", width: "100%", height: "150px", fontFamily: "monospace", fontSize: "0.85rem", padding: "10px", boxSizing: "border-box" }}
							value={settings.exportFormat === "css" ? exportAsCSS() : settings.exportFormat === "tailwind" ? exportAsTailwind() : exportAsJSON()}
						/>
					</fieldset>

				</div>
			</div>
		</RawDOMContainer>
	);
}
