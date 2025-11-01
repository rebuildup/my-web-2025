/**
 * Advanced Color Utility Functions
 * Comprehensive color manipulation, generation, and accessibility checking
 */

export interface HSVColor {
	h: number; // 0-360
	s: number; // 0-100
	v: number; // 0-100
}

export interface RGBColor {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
}

export interface HSLColor {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
}

export interface LABColor {
	l: number; // 0-100
	a: number; // -128 to 127
	b: number; // -128 to 127
}

export interface ColorInfo {
	hex: string;
	rgb: RGBColor;
	hsv: HSVColor;
	hsl: HSLColor;
	lab?: LABColor;
	name?: string;
	accessibility?: AccessibilityInfo;
}

export interface AccessibilityInfo {
	contrastWithWhite: number;
	contrastWithBlack: number;
	wcagAA: boolean;
	wcagAAA: boolean;
	colorBlindSafe: boolean;
	readableOnWhite: boolean;
	readableOnBlack: boolean;
}

export interface ColorHarmony {
	type:
		| "monochromatic"
		| "analogous"
		| "complementary"
		| "triadic"
		| "tetradic"
		| "split-complementary";
	colors: ColorInfo[];
	description: string;
}

// Color conversion functions
export function hsvToRgb(h: number, s: number, v: number): RGBColor {
	// Normalize hue to 0-360 range
	h = ((h % 360) + 360) % 360;

	const c = (v / 100) * (s / 100);
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = v / 100 - c;

	let r = 0,
		g = 0,
		b = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
	};
}

export function rgbToHsv(r: number, g: number, b: number): HSVColor {
	// Handle NaN values
	if (Number.isNaN(r)) r = 0;
	if (Number.isNaN(g)) g = 0;
	if (Number.isNaN(b)) b = 0;

	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;

	let h = 0;
	const s = max === 0 ? 0 : (diff / max) * 100;
	const v = max * 100;

	if (diff !== 0) {
		switch (max) {
			case r:
				h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
				break;
			case g:
				h = ((b - r) / diff + 2) * 60;
				break;
			case b:
				h = ((r - g) / diff + 4) * 60;
				break;
		}
	}

	return {
		h: Number.isNaN(h) ? 0 : Math.round(h),
		s: Number.isNaN(s) ? 0 : Math.round(s),
		v: Number.isNaN(v) ? 0 : Math.round(v),
	};
}

export function rgbToHsl(r: number, g: number, b: number): HSLColor {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0,
		s = 0;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

export function hslToRgb(h: number, s: number, l: number): RGBColor {
	h /= 360;
	s /= 100;
	l /= 100;

	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

export function rgbToLab(r: number, g: number, b: number): LABColor {
	// Convert RGB to XYZ
	let x = r / 255;
	let y = g / 255;
	let z = b / 255;

	x = x > 0.04045 ? ((x + 0.055) / 1.055) ** 2.4 : x / 12.92;
	y = y > 0.04045 ? ((y + 0.055) / 1.055) ** 2.4 : y / 12.92;
	z = z > 0.04045 ? ((z + 0.055) / 1.055) ** 2.4 : z / 12.92;

	const xTemp = x * 0.4124 + y * 0.3576 + z * 0.1805;
	const yTemp = x * 0.2126 + y * 0.7152 + z * 0.0722;
	const zTemp = x * 0.0193 + y * 0.1192 + z * 0.9505;

	x = xTemp;
	y = yTemp;
	z = zTemp;

	// Convert XYZ to LAB
	x = x / 0.95047;
	y = y / 1.0;
	z = z / 1.08883;

	x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;

	return {
		l: 116 * y - 16,
		a: 500 * (x - y),
		b: 200 * (y - z),
	};
}

export function rgbToHex(r: number, g: number, b: number): string {
	return (
		"#" +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? `0${hex}` : hex;
			})
			.join("")
	);
}

export function hexToRgb(hex: string): RGBColor | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

// Accessibility functions
export function getLuminance(rgb: RGBColor): number {
	const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
	const lum1 = getLuminance(color1);
	const lum2 = getLuminance(color2);
	const brightest = Math.max(lum1, lum2);
	const darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

export function getAccessibilityInfo(rgb: RGBColor): AccessibilityInfo {
	const white = { r: 255, g: 255, b: 255 };
	const black = { r: 0, g: 0, b: 0 };

	const contrastWithWhite = getContrastRatio(rgb, white);
	const contrastWithBlack = getContrastRatio(rgb, black);

	const wcagAA = contrastWithWhite >= 4.5 || contrastWithBlack >= 4.5;
	const wcagAAA = contrastWithWhite >= 7 || contrastWithBlack >= 7;

	return {
		contrastWithWhite,
		contrastWithBlack,
		wcagAA,
		wcagAAA,
		colorBlindSafe: isColorBlindSafe(rgb),
		readableOnWhite: contrastWithWhite >= 4.5,
		readableOnBlack: contrastWithBlack >= 4.5,
	};
}

export function isColorBlindSafe(rgb: RGBColor): boolean {
	// Simplified color blind safety check
	// This checks if the color has sufficient difference in brightness and saturation
	const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
	// High saturation colors are generally more distinguishable for color blind users
	return hsv.s >= 50 && hsv.v > 30;
}

// Color harmony generation
export function generateColorHarmony(
	baseColor: HSVColor,
	type: ColorHarmony["type"],
): ColorHarmony {
	const colors: ColorInfo[] = [];
	const baseRgb = hsvToRgb(baseColor.h, baseColor.s, baseColor.v);
	const baseHex = rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b);
	const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

	// Add base color
	colors.push({
		hex: baseHex,
		rgb: baseRgb,
		hsv: baseColor,
		hsl: baseHsl,
		accessibility: getAccessibilityInfo(baseRgb),
	});

	switch (type) {
		case "monochromatic":
			// Generate variations in saturation and value
			for (let i = 1; i <= 4; i++) {
				const newS = Math.max(10, Math.min(100, baseColor.s + i * 15 - 30));
				const newV = Math.max(20, Math.min(90, baseColor.v + i * 10 - 20));
				const rgb = hsvToRgb(baseColor.h, newS, newV);
				const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				colors.push({
					hex,
					rgb,
					hsv: { h: baseColor.h, s: newS, v: newV },
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
			break;

		case "analogous":
			// Generate colors 30° apart
			for (let i = 1; i <= 4; i++) {
				const newH = (baseColor.h + i * 30) % 360;
				const rgb = hsvToRgb(newH, baseColor.s, baseColor.v);
				const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				colors.push({
					hex,
					rgb,
					hsv: { h: newH, s: baseColor.s, v: baseColor.v },
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
			break;

		case "complementary": {
			// Generate complementary color (180° opposite)
			const compH = (baseColor.h + 180) % 360;
			const compRgb = hsvToRgb(compH, baseColor.s, baseColor.v);
			const compHex = rgbToHex(compRgb.r, compRgb.g, compRgb.b);
			const compHsl = rgbToHsl(compRgb.r, compRgb.g, compRgb.b);

			colors.push({
				hex: compHex,
				rgb: compRgb,
				hsv: { h: compH, s: baseColor.s, v: baseColor.v },
				hsl: compHsl,
				accessibility: getAccessibilityInfo(compRgb),
			});
			break;
		}

		case "triadic":
			// Generate colors 120° apart
			for (let i = 1; i <= 2; i++) {
				const newH = (baseColor.h + i * 120) % 360;
				const rgb = hsvToRgb(newH, baseColor.s, baseColor.v);
				const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				colors.push({
					hex,
					rgb,
					hsv: { h: newH, s: baseColor.s, v: baseColor.v },
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
			break;

		case "tetradic":
			// Generate colors 90° apart
			for (let i = 1; i <= 3; i++) {
				const newH = (baseColor.h + i * 90) % 360;
				const rgb = hsvToRgb(newH, baseColor.s, baseColor.v);
				const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				colors.push({
					hex,
					rgb,
					hsv: { h: newH, s: baseColor.s, v: baseColor.v },
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
			break;

		case "split-complementary":
			// Generate colors at 150° and 210° from base
			for (const offset of [150, 210]) {
				const newH = (baseColor.h + offset) % 360;
				const rgb = hsvToRgb(newH, baseColor.s, baseColor.v);
				const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
				const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

				colors.push({
					hex,
					rgb,
					hsv: { h: newH, s: baseColor.s, v: baseColor.v },
					hsl,
					accessibility: getAccessibilityInfo(rgb),
				});
			}
			break;
	}

	const descriptions = {
		monochromatic: "Same hue with varying saturation and brightness",
		analogous: "Adjacent colors on the color wheel",
		complementary: "Opposite colors on the color wheel",
		triadic: "Three colors equally spaced on the color wheel",
		tetradic: "Four colors forming a rectangle on the color wheel",
		"split-complementary":
			"Base color plus two colors adjacent to its complement",
	};

	return {
		type,
		colors,
		description: descriptions[type],
	};
}

// Advanced color generation algorithms
export function generateGoldenRatioColors(
	baseHue: number,
	count: number,
): ColorInfo[] {
	const colors: ColorInfo[] = [];
	const goldenRatio = 0.618033988749895;

	for (let i = 0; i < count; i++) {
		const h = (baseHue + i * goldenRatio * 360) % 360;
		const s = 60 + ((i * 10) % 40); // Vary saturation
		const v = 70 + ((i * 5) % 20); // Vary value

		const rgb = hsvToRgb(h, s, v);
		const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

		colors.push({
			hex,
			rgb,
			hsv: { h, s, v },
			hsl,
			accessibility: getAccessibilityInfo(rgb),
		});
	}

	return colors;
}

export function generatePerceptuallyUniformColors(count: number): ColorInfo[] {
	const colors: ColorInfo[] = [];

	for (let i = 0; i < count; i++) {
		// Use LAB color space for perceptually uniform distribution
		const l = 50 + (i * 40) / count; // Lightness from 50 to 90
		const a = Math.sin((i * 2 * Math.PI) / count) * 50; // Green-Red axis
		const b = Math.cos((i * 2 * Math.PI) / count) * 50; // Blue-Yellow axis

		// Convert LAB to RGB (simplified conversion)
		const rgb = labToRgb({ l, a, b });
		const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
		const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

		colors.push({
			hex,
			rgb,
			hsv,
			hsl,
			lab: { l, a, b },
			accessibility: getAccessibilityInfo(rgb),
		});
	}

	return colors;
}

function labToRgb(lab: LABColor): RGBColor {
	// Simplified LAB to RGB conversion
	let y = (lab.l + 16) / 116;
	let x = lab.a / 500 + y;
	let z = y - lab.b / 200;

	x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
	y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
	z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

	let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	let b = x * 0.0557 + y * -0.204 + z * 1.057;

	r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
	g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
	b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b;

	return {
		r: Math.max(0, Math.min(255, Math.round(r * 255))),
		g: Math.max(0, Math.min(255, Math.round(g * 255))),
		b: Math.max(0, Math.min(255, Math.round(b * 255))),
	};
}

// Utility functions
export function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function clampColor(
	value: number,
	min: number = 0,
	max: number = 255,
): number {
	return Math.max(min, Math.min(max, Math.round(value)));
}

export function deltaE(lab1: LABColor, lab2: LABColor): number {
	// Calculate Delta E (color difference) in LAB space
	const deltaL = lab1.l - lab2.l;
	const deltaA = lab1.a - lab2.a;
	const deltaB = lab1.b - lab2.b;

	return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

export function sortColorsByHue(colors: ColorInfo[]): ColorInfo[] {
	return [...colors].sort((a, b) => a.hsv.h - b.hsv.h);
}

export function sortColorsByLightness(colors: ColorInfo[]): ColorInfo[] {
	return [...colors].sort((a, b) => a.hsl.l - b.hsl.l);
}

export function sortColorsBySaturation(colors: ColorInfo[]): ColorInfo[] {
	return [...colors].sort((a, b) => a.hsv.s - b.hsv.s);
}
