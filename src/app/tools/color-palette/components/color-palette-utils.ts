import {
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
	type ColorInfo,
} from "@/lib/utils/color";
import type {
	ColorPaletteSettings,
	ExportFormat,
	GenerationAlgorithm,
} from "./color-palette-types";

function generateRandomColors(settings: ColorPaletteSettings): ColorInfo[] {
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
}

export function generatePaletteColors(
	settings: ColorPaletteSettings,
): ColorInfo[] {
	let colors: ColorInfo[] = [];

	switch (settings.generationAlgorithm) {
		case "random":
			colors = generateRandomColors(settings);
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
		case "harmony": {
			const baseH = randomInRange(settings.hueRange.min, settings.hueRange.max);
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

	return colors;
}

function exportAsCSS(generatedColors: ColorInfo[]): string {
	const cssVars = generatedColors
		.map((color, index) => ` --color-${index + 1}: ${color.hex};`)
		.join("\n");
	return `:root {\n${cssVars}\n}`;
}

function exportAsTailwind(generatedColors: ColorInfo[]): string {
	const colors = generatedColors.reduce<Record<string, string>>(
		(acc, color, index) => {
			acc[`color-${index + 1}`] = color.hex;
			return acc;
		},
		{},
	);
	return `module.exports = { theme: { extend: { colors: ${JSON.stringify(colors, null, 2)} } } }`;
}

function exportAsJSON(
	generationAlgorithm: GenerationAlgorithm,
	generatedColors: ColorInfo[],
): string {
	return JSON.stringify(
		{
			palette: {
				algorithm: generationAlgorithm,
				colors: generatedColors,
			},
		},
		null,
		2,
	);
}

export function exportPalette(
	exportFormat: ExportFormat,
	generationAlgorithm: GenerationAlgorithm,
	generatedColors: ColorInfo[],
): string {
	switch (exportFormat) {
		case "css":
			return exportAsCSS(generatedColors);
		case "tailwind":
			return exportAsTailwind(generatedColors);
		case "json":
			return exportAsJSON(generationAlgorithm, generatedColors);
	}
}
