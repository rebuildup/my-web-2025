"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useOfflinePerformance from "@/hooks/useOfflinePerformance";
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
import AccessibleButton from "../../components/AccessibleButton";
import OfflineSettingsManager from "../../components/OfflineSettingsManager";
import ToolWrapper from "../../components/ToolWrapper";

// Palette management interfaces
interface SavedPalette {
	id: string;
	name: string;
	colors: ColorInfo[];
	createdAt: string;
	tags: string[];
}

// Predefined color ranges with enhanced options
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

// Generation algorithms
const generationAlgorithms = {
	random: "Random HSV",
	golden: "Golden Ratio",
	perceptual: "Perceptually Uniform",
	harmony: "Color Harmony",
};

// Settings interface for offline persistence
interface ColorPaletteSettings extends Record<string, unknown> {
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

export default function ColorPaletteGenerator() {
	// Default settings
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

	// State management
	const [settings, setSettings] =
		useState<ColorPaletteSettings>(defaultSettings);
	const [generatedColors, setGeneratedColors] = useState<ColorInfo[]>([]);
	const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
	const [currentHarmony, setCurrentHarmony] = useState<ColorHarmony | null>(
		null,
	);
	const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
	const [importedPalette, setImportedPalette] = useState<string>("");
	const [paletteSearch, setPaletteSearch] = useState<string>("");
	const [showPaletteManager, setShowPaletteManager] = useState(false);
	const [notification, setNotification] = useState<string>("");
	const paletteIdRef = useRef(1);

	// Refs for file operations
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Destructure settings
	const {
		colorCount,
		hueRange,
		saturationRange,
		valueRange,
		exportFormat,
		showAccessibility,
		generationAlgorithm,
		harmonyType,
		sortBy,
		enableColorBlindCheck,
		autoSave,
	} = settings;

	// Performance optimization hook
	const { measureTime } = useOfflinePerformance({
		toolName: "color-palette",
		enablePerformanceMonitoring: true,
		enableOfflineNotifications: true,
	});

	// Enhanced keyboard shortcuts
	const keyboardShortcuts = [
		{ key: "G", description: "新しいパレット生成" },
		{ key: "S", description: "パレット保存" },
		{ key: "E", description: "エクスポート" },
		{ key: "R", description: "リセット" },
		{ key: "A", description: "アクセシビリティ表示切替" },
		{ key: "H", description: "ハーモニー生成" },
		{ key: "M", description: "パレット管理" },
		{ key: "I", description: "パレットインポート" },
	];

	// Show notification
	const showNotification = useCallback((message: string) => {
		setNotification(message);
		setTimeout(() => setNotification(""), 3000);
	}, []);

	// Generate random colors (original algorithm)
	const generateRandomColors = useCallback((): ColorInfo[] => {
		const colors: ColorInfo[] = [];
		const usedColors = new Set<string>();

		while (colors.length < colorCount) {
			const h = randomInRange(hueRange.min, hueRange.max);
			const s = randomInRange(saturationRange.min, saturationRange.max);
			const v = randomInRange(valueRange.min, valueRange.max);

			const rgb = hsvToRgb(h, s, v);
			const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

			if (!usedColors.has(hex)) {
				usedColors.add(hex);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
				const accessibility = getAccessibilityInfo(rgb);

				colors.push({
					hex,
					rgb,
					hsv: { h, s, v },
					hsl,
					accessibility,
				});
			}
		}

		return colors;
	}, [colorCount, hueRange, saturationRange, valueRange]);

	// Enhanced palette saving with metadata
	const savePalette = useCallback(
		async (customName?: string) => {
			if (generatedColors.length === 0) return;

			const name = customName || `Palette ${savedPalettes.length + 1}`;
			const newPalette: SavedPalette = {
				id: `palette-${paletteIdRef.current++}`,
				name,
				colors: generatedColors,
				createdAt: new Date().toISOString(),
				tags: [generationAlgorithm, harmonyType],
			};

			setSavedPalettes((prev) => [newPalette, ...prev]);
			showNotification(`パレット "${name}" を保存しました`);
		},
		[
			generatedColors,
			savedPalettes.length,
			generationAlgorithm,
			harmonyType,
			showNotification,
		],
	);

	// Generate colors with advanced algorithms
	const generateColors = useCallback(async () => {
		const timedGeneration = measureTime((): ColorInfo[] => {
			let colors: ColorInfo[] = [];

			switch (generationAlgorithm) {
				case "random":
					colors = generateRandomColors();
					break;
				case "golden": {
					const baseHue = randomInRange(hueRange.min, hueRange.max);
					colors = generateGoldenRatioColors(baseHue, colorCount);
					break;
				}
				case "perceptual":
					colors = generatePerceptuallyUniformColors(colorCount);
					break;
				case "harmony":
					if (selectedColor) {
						const harmony = generateColorHarmony(
							selectedColor.hsv,
							harmonyType,
						);
						colors = harmony.colors.slice(0, colorCount);
						setCurrentHarmony(harmony);
					} else {
						const baseH = randomInRange(hueRange.min, hueRange.max);
						const baseS = randomInRange(
							saturationRange.min,
							saturationRange.max,
						);
						const baseV = randomInRange(valueRange.min, valueRange.max);
						const harmony = generateColorHarmony(
							{ h: baseH, s: baseS, v: baseV },
							harmonyType,
						);
						colors = harmony.colors.slice(0, colorCount);
						setCurrentHarmony(harmony);
					}
					break;
			}

			// Apply sorting
			switch (sortBy) {
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

			return colors;
		});

		setGeneratedColors(timedGeneration.result as ColorInfo[]);

		if (autoSave && (timedGeneration.result as ColorInfo[]).length > 0) {
			await savePalette(`Auto-saved ${new Date().toLocaleTimeString()}`);
		}

		showNotification(
			`${(timedGeneration.result as ColorInfo[]).length}色のパレットを生成しました`,
		);
	}, [
		colorCount,
		hueRange,
		saturationRange,
		valueRange,
		generationAlgorithm,
		harmonyType,
		sortBy,
		selectedColor,
		autoSave,
		measureTime,
		showNotification,
		generateRandomColors,
		savePalette,
	]);

	// Apply preset color range
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

	// Load saved palette
	const loadPalette = (palette: SavedPalette) => {
		setGeneratedColors(palette.colors);
		showNotification(`パレット "${palette.name}" を読み込みました`);
	};

	// Delete saved palette
	const deletePalette = (id: string) => {
		setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
		showNotification("パレットを削除しました");
	};

	// Enhanced export functions
	const exportAsCSS = useCallback(() => {
		const cssVars = generatedColors
			.map((color, index) => `  --color-${index + 1}: ${color.hex};`)
			.join("\n");
		return `:root {\n${cssVars}\n}`;
	}, [generatedColors]);

	const exportAsTailwind = useCallback(() => {
		const colors = generatedColors.reduce(
			(acc, color, index) => {
				acc[`color-${index + 1}`] = color.hex;
				return acc;
			},
			{} as Record<string, string>,
		);

		return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 8)}
    }
  }
}`;
	}, [generatedColors]);

	const exportAsJSON = useCallback(() => {
		return JSON.stringify(
			{
				palette: {
					name: `Generated Palette ${new Date().toISOString()}`,
					algorithm: generationAlgorithm,
					harmony: currentHarmony?.type,
					colors: generatedColors,
					metadata: {
						createdAt: new Date().toISOString(),
						settings: {
							colorCount,
							hueRange,
							saturationRange,
							valueRange,
						},
					},
				},
			},
			null,
			2,
		);
	}, [
		generatedColors,
		generationAlgorithm,
		currentHarmony,
		colorCount,
		hueRange,
		saturationRange,
		valueRange,
	]);

	// Copy to clipboard
	const copyToClipboard = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
				showNotification("クリップボードにコピーしました");
			} catch (err) {
				console.error("Failed to copy to clipboard:", err);
				showNotification("コピーに失敗しました");
			}
		},
		[showNotification],
	);

	// Copy individual color
	const copyColor = async (color: ColorInfo, format: "hex" | "rgb" | "hsl") => {
		let text = "";
		switch (format) {
			case "hex":
				text = color.hex;
				break;
			case "rgb":
				text = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
				break;
			case "hsl":
				text = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
				break;
		}
		await copyToClipboard(text);
	};

	// Helper function to parse JSON palette data
	const parseJsonPalette = useCallback((data: string): ColorInfo[] | null => {
		const parsed = JSON.parse(data);

		// Check for palette object format
		if (parsed.palette) {
			if (parsed.palette.colors) {
				return parsed.palette.colors;
			}
		}

		// Check for array format
		if (Array.isArray(parsed)) {
			if (parsed.length > 0) {
				const colors: ColorInfo[] = [];
				for (const item of parsed) {
					if (typeof item === "string") {
						if (item.startsWith("#")) {
							const rgb = hexToRgb(item);
							if (rgb) {
								const hsv = { h: 0, s: 0, v: 0 };
								const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
								colors.push({
									hex: item,
									rgb,
									hsv,
									hsl,
									accessibility: getAccessibilityInfo(rgb),
								});
							}
						}
					}
				}
				if (colors.length > 0) {
					return colors;
				}
			}
		}

		return null;
	}, []);

	// Helper function to parse hex colors from string
	const parseHexColors = useCallback((data: string): ColorInfo[] | null => {
		const hexColors = data.match(/#[0-9a-fA-F]{6}/g);
		if (!hexColors) {
			return null;
		}
		if (hexColors.length === 0) {
			return null;
		}

		const colors: ColorInfo[] = [];
		for (const hex of hexColors) {
			const rgb = hexToRgb(hex);
			if (rgb) {
				const hsv = { h: 0, s: 0, v: 0 };
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
				colors.push({
					hex,
					rgb,
					hsv,
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
		}

		if (colors.length > 0) {
			return colors;
		}
		return null;
	}, []);

	// Import palette from various formats
	const importPalette = useCallback(
		(data: string) => {
			try {
				const colors = parseJsonPalette(data);
				if (colors) {
					setGeneratedColors(colors);
					showNotification("JSONパレットをインポートしました");
					return;
				}
				showNotification("インポート形式が認識できません");
			} catch {
				const colors = parseHexColors(data);
				if (colors) {
					setGeneratedColors(colors);
					showNotification(`${colors.length}色をインポートしました`);
				} else {
					showNotification("有効な色が見つかりません");
				}
			}
		},
		[showNotification, parseJsonPalette, parseHexColors],
	);

	// Handle file import
	const handleFileImport = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const content = e.target?.result as string;
					importPalette(content);
				};
				reader.readAsText(file);
			}
		},
		[importPalette],
	);

	// Filter saved palettes
	const filteredPalettes = savedPalettes.filter(
		(palette) =>
			palette.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
			palette.tags.some((tag) =>
				tag.toLowerCase().includes(paletteSearch.toLowerCase()),
			),
	);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleToolShortcut = (event: CustomEvent) => {
			switch (event.detail.key.toLowerCase()) {
				case "g":
					generateColors();
					break;
				case "s":
					savePalette();
					break;
				case "e": {
					const exportText =
						exportFormat === "css"
							? exportAsCSS()
							: exportFormat === "tailwind"
								? exportAsTailwind()
								: exportAsJSON();
					copyToClipboard(exportText);
					break;
				}
				case "r":
					setGeneratedColors([]);
					setCurrentHarmony(null);
					setSelectedColor(null);
					break;
				case "a":
					setSettings((prev) => ({
						...prev,
						showAccessibility: !prev.showAccessibility,
					}));
					break;
				case "h":
					if (generatedColors.length > 0) {
						setSelectedColor(generatedColors[0]);
						setSettings((prev) => ({
							...prev,
							generationAlgorithm: "harmony",
						}));
						generateColors();
					}
					break;
				case "m":
					setShowPaletteManager(!showPaletteManager);
					break;
				case "i":
					fileInputRef.current?.click();
					break;
			}
		};

		document.addEventListener(
			"toolShortcut",
			handleToolShortcut as EventListener,
		);
		return () =>
			document.removeEventListener(
				"toolShortcut",
				handleToolShortcut as EventListener,
			);
	}, [
		generateColors,
		savePalette,
		exportFormat,
		exportAsCSS,
		exportAsTailwind,
		exportAsJSON,
		copyToClipboard,
		generatedColors,
		showPaletteManager,
	]);

	// Load saved palettes from localStorage
	useEffect(() => {
		const saved = localStorage.getItem("color-palettes-v2");
		if (saved) {
			try {
				setSavedPalettes(JSON.parse(saved));
			} catch (err) {
				console.error("Failed to load saved palettes:", err);
			}
		}
	}, []);

	// Save palettes to localStorage
	useEffect(() => {
		localStorage.setItem("color-palettes-v2", JSON.stringify(savedPalettes));
	}, [savedPalettes]);

	// Design system classes
	const CardStyle =
		"rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-4";
	const Section_title = "neue-haas-grotesk-display text-xl text-main mb-4";
	const Input_style =
		"rounded-lg bg-main/10 p-2 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base";
	const Button_style =
		"bg-accent text-main px-4 py-2 border border-accent hover:bg-base hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base";

	return (
		<ToolWrapper
			toolName="Color Palette Generator"
			description="高度なアルゴリズムとカラーハーモニー理論を使用したカラーパレット生成ツール。アクセシビリティチェック、パレット管理、多形式エクスポートに対応。"
			category="design"
			keyboardShortcuts={keyboardShortcuts}
			showPerformanceInfo={true}
			enableOptimizations={true}
		>
			<OfflineSettingsManager
				toolName="color-palette"
				defaultSettings={defaultSettings}
				settings={settings}
				onSettingsChange={setSettings}
				showControls={true}
			>
				{() => (
					<div className="space-y-8">
						{/* Notification */}
						{notification && (
							<div
								className="bg-accent text-main p-3 border border-accent"
								role="alert"
							>
								{notification}
							</div>
						)}

						{/* Hidden file input for import */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".json,.css,.gpl,.ase"
							onChange={handleFileImport}
							className="hidden"
						/>

						{/* Generation Algorithm Selection */}
						<section className={CardStyle}>
							<h3 className={Section_title}>Generation Algorithm</h3>
							<div className="grid-system grid-1 sm:grid-2 gap-4">
								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Algorithm
									</label>
									<select
										value={generationAlgorithm}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												generationAlgorithm: e.target
													.value as keyof typeof generationAlgorithms,
											}))
										}
										className={Input_style}
										aria-label="Select generation algorithm"
									>
										{Object.entries(generationAlgorithms).map(
											([key, label]) => (
												<option key={key} value={key}>
													{label}
												</option>
											),
										)}
									</select>
								</div>

								{generationAlgorithm === "harmony" && (
									<div className="space-y-2">
										<label className="neue-haas-grotesk-display text-sm text-main">
											Harmony Type
										</label>
										<select
											value={harmonyType}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													harmonyType: e.target.value as ColorHarmony["type"],
												}))
											}
											className={Input_style}
											aria-label="Select harmony type"
										>
											<option value="monochromatic">Monochromatic</option>
											<option value="analogous">Analogous</option>
											<option value="complementary">Complementary</option>
											<option value="triadic">Triadic</option>
											<option value="tetradic">Tetradic</option>
											<option value="split-complementary">
												Split Complementary
											</option>
										</select>
									</div>
								)}
							</div>

							{currentHarmony && (
								<div className="rounded-lg bg-main/10 p-3">
									<h4 className="neue-haas-grotesk-display text-sm text-main mb-2">
										Current Harmony: {currentHarmony.type}
									</h4>
									<p className="text-xs text-main">
										{currentHarmony.description}
									</p>
								</div>
							)}
						</section>

						{/* Color Range Settings */}
						<section className={CardStyle}>
							<h3 className={Section_title}>Color Range Settings</h3>

							{/* Preset Buttons */}
							<div className="space-y-4">
								<h4 className="neue-haas-grotesk-display text-lg text-main">
									Presets
								</h4>
								<div className="grid-system grid-2 xs:grid-3 sm:grid-5 gap-2">
									{Object.keys(colorRangePresets).map((preset) => (
										<button
											type="button"
											key={preset}
											onClick={() =>
												applyPreset(preset as keyof typeof colorRangePresets)
											}
											className="rounded-lg bg-main/10 px-3 py-2 text-sm hover:bg-main/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base capitalize"
										>
											{preset}
										</button>
									))}
								</div>
							</div>

							{/* Manual Range Controls */}
							<div className="grid-system grid-1 sm:grid-3 gap-6">
								{/* Hue Range */}
								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Hue Range (色相): {hueRange.min}° - {hueRange.max}°
									</label>
									<div className="space-y-2">
										<input
											type="range"
											min="0"
											max="360"
											value={hueRange.min}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													hueRange: {
														...prev.hueRange,
														min: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Minimum hue value"
											data-testid="hue-min"
										/>
										<input
											type="range"
											min="0"
											max="360"
											value={hueRange.max}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													hueRange: {
														...prev.hueRange,
														max: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Maximum hue value"
											data-testid="hue-max"
										/>
									</div>
								</div>

								{/* Saturation Range */}
								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Saturation Range (彩度): {saturationRange.min}% -{" "}
										{saturationRange.max}%
									</label>
									<div className="space-y-2">
										<input
											type="range"
											min="0"
											max="100"
											value={saturationRange.min}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													saturationRange: {
														...prev.saturationRange,
														min: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Minimum saturation value"
											data-testid="saturation-min"
										/>
										<input
											type="range"
											min="0"
											max="100"
											value={saturationRange.max}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													saturationRange: {
														...prev.saturationRange,
														max: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Maximum saturation value"
											data-testid="saturation-max"
										/>
									</div>
								</div>

								{/* Value Range */}
								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Value Range (明度): {valueRange.min}% - {valueRange.max}%
									</label>
									<div className="space-y-2">
										<input
											type="range"
											min="0"
											max="100"
											value={valueRange.min}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													valueRange: {
														...prev.valueRange,
														min: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Minimum value/brightness"
										/>
										<input
											type="range"
											min="0"
											max="100"
											value={valueRange.max}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													valueRange: {
														...prev.valueRange,
														max: parseInt(e.target.value, 10),
													},
												}))
											}
											className="w-full"
											aria-label="Maximum value/brightness"
										/>
									</div>
								</div>
							</div>

							{/* Additional Settings */}
							<div className="grid-system grid-1 sm:grid-3 gap-4">
								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Number of Colors: {colorCount}
									</label>
									<input
										type="range"
										min="1"
										max="20"
										value={colorCount}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												colorCount: parseInt(e.target.value, 10),
											}))
										}
										className="w-full"
										aria-label="Number of colors to generate"
									/>
								</div>

								<div className="space-y-2">
									<label className="neue-haas-grotesk-display text-sm text-main">
										Sort By
									</label>
									<select
										value={sortBy}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												sortBy: e.target.value as typeof sortBy,
											}))
										}
										className={Input_style}
										aria-label="Sort colors by"
									>
										<option value="none">None</option>
										<option value="hue">Hue</option>
										<option value="lightness">Lightness</option>
										<option value="saturation">Saturation</option>
									</select>
								</div>

								<div className="space-y-2">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											checked={autoSave}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													autoSave: e.target.checked,
												}))
											}
											className="focus:ring-2 focus:ring-accent"
										/>
										<span className="neue-haas-grotesk-display text-sm text-main">
											Auto Save
										</span>
									</label>
								</div>
							</div>
						</section>

						{/* Generation Controls */}
						<section className={CardStyle}>
							<div className="flex flex-wrap gap-4">
								<AccessibleButton
									onClick={generateColors}
									variant="primary"
									shortcut="G"
									announceOnClick="新しいカラーパレットを生成しました"
									aria-label="Generate new color palette"
									data-testid="generate-colors"
								>
									Generate Colors
								</AccessibleButton>
								<AccessibleButton
									onClick={() => savePalette()}
									disabled={generatedColors.length === 0}
									variant="secondary"
									shortcut="S"
									announceOnClick="パレットを保存しました"
									aria-label="Save current palette"
								>
									Save Palette
								</AccessibleButton>
								<AccessibleButton
									onClick={() =>
										setSettings((prev) => ({
											...prev,
											showAccessibility: !prev.showAccessibility,
										}))
									}
									variant="ghost"
									shortcut="A"
									announceOnClick={
										showAccessibility
											? "アクセシビリティ情報を非表示にしました"
											: "アクセシビリティ情報を表示しました"
									}
									aria-label="Toggle accessibility information"
								>
									Accessibility
								</AccessibleButton>
								<AccessibleButton
									onClick={() => setShowPaletteManager(!showPaletteManager)}
									variant="ghost"
									shortcut="M"
									announceOnClick="パレット管理を開きました"
									aria-label="Open palette manager"
								>
									Manage
								</AccessibleButton>
								<AccessibleButton
									onClick={() => fileInputRef.current?.click()}
									variant="ghost"
									shortcut="I"
									announceOnClick="パレットインポートを開始します"
									aria-label="Import palette"
								>
									Import
								</AccessibleButton>
							</div>
						</section>

						{/* Generated Colors Display */}
						{generatedColors.length > 0 && (
							<section className={CardStyle}>
								<h3 className={Section_title}>Generated Palette</h3>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-5 gap-4">
									{generatedColors.map((color, index) => (
										<div
											key={index}
											className={`space-y-2 ${
												selectedColor === color ? "ring-2 ring-accent" : ""
											}`}
											role="button"
											tabIndex={0}
											aria-label={`Color ${index + 1}: ${color.hex}`}
											data-testid="color-item"
											onClick={() => setSelectedColor(color)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setSelectedColor(color);
												}
											}}
										>
											<div
												className="w-full h-20 rounded-lg cursor-pointer ring-2 ring-main/20 hover:ring-main/40 transition-all"
												style={{ backgroundColor: color.hex }}
												onClick={() => copyColor(color, "hex")}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														copyColor(color, "hex");
													}
												}}
												title={`Click to copy ${color.hex}`}
											/>
											<div className="text-xs space-y-1">
												<button
													type="button"
													onClick={() => copyColor(color, "hex")}
													className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
													title="Click to copy HEX value"
													data-testid="copy-hex"
												>
													HEX: {color.hex}
												</button>
												<button
													type="button"
													onClick={() => copyColor(color, "rgb")}
													className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
													title="Click to copy RGB value"
												>
													RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
												</button>
												<button
													type="button"
													onClick={() => copyColor(color, "hsl")}
													className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
													title="Click to copy HSL value"
												>
													HSL: {color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%
												</button>

												{/* Enhanced Accessibility Information */}
												{showAccessibility && color.accessibility && (
													<div className="pt-2 border-t border-main/20">
														<div className="text-xs space-y-1">
															<div className="flex justify-between">
																<span>vs White:</span>
																<span
																	className={
																		color.accessibility.readableOnWhite
																			? "text-green-600"
																			: "text-red-600"
																	}
																>
																	{color.accessibility.contrastWithWhite.toFixed(
																		2,
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span>vs Black:</span>
																<span
																	className={
																		color.accessibility.readableOnBlack
																			? "text-green-600"
																			: "text-red-600"
																	}
																>
																	{color.accessibility.contrastWithBlack.toFixed(
																		2,
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span>WCAG AA:</span>
																<span
																	className={
																		color.accessibility.wcagAA
																			? "text-green-600"
																			: "text-red-600"
																	}
																>
																	{color.accessibility.wcagAA ? "✓" : "✗"}
																</span>
															</div>
															<div className="flex justify-between">
																<span>WCAG AAA:</span>
																<span
																	className={
																		color.accessibility.wcagAAA
																			? "text-green-600"
																			: "text-red-600"
																	}
																>
																	{color.accessibility.wcagAAA ? "✓" : "✗"}
																</span>
															</div>
															{enableColorBlindCheck && (
																<div className="flex justify-between">
																	<span>Color Blind Safe:</span>
																	<span
																		className={
																			color.accessibility.colorBlindSafe
																				? "text-green-600"
																				: "text-yellow-600"
																		}
																	>
																		{color.accessibility.colorBlindSafe
																			? "✓"
																			: "?"}
																	</span>
																</div>
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Export Section */}
						{generatedColors.length > 0 && (
							<section className={CardStyle}>
								<h3 className={Section_title}>Export Palette</h3>
								<div className="space-y-4">
									<div className="flex flex-wrap gap-4">
										<select
											value={exportFormat}
											onChange={(e) =>
												setSettings((prev) => ({
													...prev,
													exportFormat: e.target.value as typeof exportFormat,
												}))
											}
											className={Input_style}
											aria-label="Select export format"
										>
											<option value="css">CSS Variables</option>
											<option value="tailwind">Tailwind Config</option>
											<option value="json">JSON</option>
										</select>
										<button
											type="button"
											onClick={() => {
												const exportText =
													exportFormat === "css"
														? exportAsCSS()
														: exportFormat === "tailwind"
															? exportAsTailwind()
															: exportAsJSON();
												copyToClipboard(exportText);
											}}
											className={Button_style}
											aria-label="Copy export code to clipboard"
											data-testid="export-copy"
										>
											Copy (E)
										</button>
									</div>

									<div className="rounded-lg bg-main/10 p-4 overflow-x-auto">
										<pre className="text-xs whitespace-pre-wrap">
											{exportFormat === "css"
												? exportAsCSS()
												: exportFormat === "tailwind"
													? exportAsTailwind()
													: exportAsJSON()}
										</pre>
									</div>
								</div>
							</section>
						)}

						{/* Import Section */}
						<section className={CardStyle}>
							<h3 className={Section_title}>Import Palette</h3>
							<div className="space-y-4">
								<textarea
									value={importedPalette}
									onChange={(e) => setImportedPalette(e.target.value)}
									placeholder="Paste JSON palette data, hex colors, or other supported formats..."
									className={`${Input_style} w-full h-24 resize-none`}
									aria-label="Import palette data"
								/>
								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => {
											if (importedPalette.trim()) {
												importPalette(importedPalette);
												setImportedPalette("");
											}
										}}
										disabled={!importedPalette.trim()}
										className={Button_style}
									>
										Import from Text
									</button>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className={Button_style}
									>
										Import from File
									</button>
								</div>
							</div>
						</section>

						{/* Palette Manager */}
						{showPaletteManager && (
							<section className={CardStyle}>
								<h3 className={Section_title}>
									Saved Palettes ({savedPalettes.length})
								</h3>

								{savedPalettes.length > 0 && (
									<div className="space-y-4">
										<input
											type="text"
											value={paletteSearch}
											onChange={(e) => setPaletteSearch(e.target.value)}
											placeholder="Search palettes..."
											className={Input_style}
											aria-label="Search saved palettes"
										/>

										<div className="space-y-4 max-h-96 overflow-y-auto">
											{filteredPalettes.map((palette) => (
												<div
													key={palette.id}
													className="rounded-lg bg-main/10 p-3"
												>
													<div className="flex justify-between items-start mb-2">
														<div>
															<span className="text-sm font-medium">
																{palette.name}
															</span>
															<div className="text-xs text-main opacity-70">
																{new Date(
																	palette.createdAt,
																).toLocaleDateString()}{" "}
																• {palette.colors.length} colors
															</div>
															{palette.tags.length > 0 && (
																<div className="flex gap-1 mt-1">
																	{palette.tags.map((tag, index) => (
																		<span
																			key={index}
																			className="text-xs rounded-lg bg-main/10 px-2 py-1"
																		>
																			{tag}
																		</span>
																	))}
																</div>
															)}
														</div>
														<div className="space-x-2">
															<button
																type="button"
																onClick={() => loadPalette(palette)}
																className="text-xs bg-accent text-main px-2 py-1 hover:bg-base hover:text-accent border border-accent transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
															>
																Load
															</button>
															<button
																type="button"
																onClick={() => deletePalette(palette.id)}
																className="text-xs rounded-lg bg-main/10 px-2 py-1 hover:bg-main/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
															>
																Delete
															</button>
														</div>
													</div>
													<div className="flex gap-1">
														{palette.colors.map((color, colorIndex) => (
															<div
																key={colorIndex}
																className="w-8 h-8 rounded cursor-pointer ring-2 ring-main/20 hover:ring-main/40 transition-all"
																style={{ backgroundColor: color.hex }}
																onClick={() => copyColor(color, "hex")}
																title={color.hex}
															/>
														))}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{savedPalettes.length === 0 && (
									<p className="text-sm text-main opacity-70">
										No saved palettes yet. Generate and save some palettes to
										see them here.
									</p>
								)}
							</section>
						)}
					</div>
				)}
			</OfflineSettingsManager>
		</ToolWrapper>
	);
}
