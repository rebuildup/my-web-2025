import type {
	ColorPaletteSettings,
	GenerationAlgorithm,
} from "./color-palette-types";

export const colorRangePresets = {
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

export const generationAlgorithms = {
	random: "Random HSV",
	golden: "Golden Ratio",
	perceptual: "Perceptually Uniform",
	harmony: "Color Harmony",
} as const satisfies Record<GenerationAlgorithm, string>;

export const defaultSettings: ColorPaletteSettings = {
	colorCount: 5,
	hueRange: { min: 0, max: 360 },
	saturationRange: { min: 50, max: 100 },
	valueRange: { min: 50, max: 90 },
	exportFormat: "css",
	generationAlgorithm: "random",
	sortBy: "none",
	autoSave: false,
};

export type ColorRangePresetName = keyof typeof colorRangePresets;
