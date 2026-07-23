import type { ColorInfo } from "@/lib/utils/color";

export type GenerationAlgorithm =
	| "random"
	| "golden"
	| "perceptual"
	| "harmony";
export type SortBy = "none" | "hue" | "lightness" | "saturation";
export type ExportFormat = "css" | "tailwind" | "json";

export interface SavedPalette {
	id: string;
	name: string;
	colors: ColorInfo[];
	createdAt: string;
	tags: string[];
}

export interface ColorPaletteSettings {
	colorCount: number;
	hueRange: { min: number; max: number };
	saturationRange: { min: number; max: number };
	valueRange: { min: number; max: number };
	exportFormat: ExportFormat;
	generationAlgorithm: GenerationAlgorithm;
	sortBy: SortBy;
	autoSave: boolean;
}
