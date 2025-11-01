/**
 * Color Palette Generator Experiment
 * Interactive color palette generation with HSL color space
 */

"use client";

import { Copy, Download, Palette, RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { performanceMonitor } from "@/lib/playground/performance-monitor";
import type { ExperimentProps } from "@/types/playground";

interface ColorPalette {
	colors: string[];
	name: string;
	harmony:
		| "monochromatic"
		| "analogous"
		| "complementary"
		| "triadic"
		| "random";
}

export const ColorPaletteExperiment: React.FC<ExperimentProps> = ({
	isActive,
	onPerformanceUpdate,
	onError,
}) => {
	const [palette, setPalette] = useState<ColorPalette>({
		colors: [],
		name: "Generated Palette",
		harmony: "random",
	});
	const [selectedHarmony, setSelectedHarmony] =
		useState<ColorPalette["harmony"]>("random");
	const [baseHue, setBaseHue] = useState(180);
	const [saturation, setSaturation] = useState(70);
	const [lightness, setLightness] = useState(50);
	const [isAnimating, setIsAnimating] = useState(false);
	const [copiedColor, setCopiedColor] = useState<string | null>(null);

	// Generate color based on harmony rules
	const generateHarmoniousColors = useCallback(
		(
			harmony: ColorPalette["harmony"],
			baseH: number,
			baseS: number,
			baseL: number,
		): string[] => {
			const colors: string[] = [];

			// Ensure valid input values
			const validH = Number.isNaN(baseH)
				? 180
				: Math.max(0, Math.min(360, baseH));
			const validS = Number.isNaN(baseS)
				? 70
				: Math.max(0, Math.min(100, baseS));
			const validL = Number.isNaN(baseL)
				? 50
				: Math.max(10, Math.min(90, baseL));

			switch (harmony) {
				case "monochromatic":
					// Same hue, different saturation and lightness
					for (let i = 0; i < 5; i++) {
						const s = Math.max(20, Math.min(100, validS + (i - 2) * 15));
						const l = Math.max(20, Math.min(80, validL + (i - 2) * 10));
						colors.push(
							`hsl(${Math.round(validH)}, ${Math.round(s)}%, ${Math.round(l)}%)`,
						);
					}
					break;

				case "analogous":
					// Adjacent hues on color wheel
					for (let i = 0; i < 5; i++) {
						const h = (validH + (i - 2) * 30 + 360) % 360;
						const s = Math.max(
							40,
							Math.min(90, validS + (Math.random() - 0.5) * 20),
						);
						const l = Math.max(
							30,
							Math.min(70, validL + (Math.random() - 0.5) * 20),
						);
						colors.push(
							`hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`,
						);
					}
					break;

				case "complementary": {
					// Base color and its complement
					const complement = (validH + 180) % 360;
					colors.push(
						`hsl(${Math.round(validH)}, ${Math.round(validS)}%, ${Math.round(validL)}%)`,
					);
					colors.push(
						`hsl(${Math.round(complement)}, ${Math.round(validS)}%, ${Math.round(validL)}%)`,
					);
					// Add variations
					colors.push(
						`hsl(${Math.round(validH)}, ${Math.round(Math.max(20, validS - 30))}%, ${Math.round(Math.min(80, validL + 20))}%)`,
					);
					colors.push(
						`hsl(${Math.round(complement)}, ${Math.round(Math.max(20, validS - 30))}%, ${Math.round(Math.min(80, validL + 20))}%)`,
					);
					colors.push(
						`hsl(${Math.round((validH + 90) % 360)}, ${Math.round(validS * 0.5)}%, ${Math.round(validL)}%)`,
					);
					break;
				}

				case "triadic":
					// Three colors equally spaced on color wheel
					for (let i = 0; i < 3; i++) {
						const h = (validH + i * 120) % 360;
						colors.push(
							`hsl(${Math.round(h)}, ${Math.round(validS)}%, ${Math.round(validL)}%)`,
						);
					}
					// Add lighter and darker variations
					colors.push(
						`hsl(${Math.round(validH)}, ${Math.round(Math.max(20, validS - 20))}%, ${Math.round(Math.min(80, validL + 25))}%)`,
					);
					colors.push(
						`hsl(${Math.round((validH + 120) % 360)}, ${Math.round(Math.max(20, validS - 20))}%, ${Math.round(Math.max(20, validL - 25))}%)`,
					);
					break;

				default: // random
					for (let i = 0; i < 5; i++) {
						const h = Math.floor(Math.random() * 360);
						const s = Math.floor(Math.random() * 50) + 50; // 50-100%
						const l = Math.floor(Math.random() * 40) + 30; // 30-70%
						colors.push(`hsl(${h}, ${s}%, ${l}%)`);
					}
					break;
			}

			return colors;
		},
		[],
	);

	// Generate new palette
	const generatePalette = useCallback(() => {
		try {
			const colors = generateHarmoniousColors(
				selectedHarmony,
				baseHue,
				saturation,
				lightness,
			);
			setPalette({
				colors,
				name: `${selectedHarmony.charAt(0).toUpperCase() + selectedHarmony.slice(1)} Palette`,
				harmony: selectedHarmony,
			});

			// Trigger animation
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 600);
		} catch (error) {
			onError?.(error as Error);
		}
	}, [
		selectedHarmony,
		baseHue,
		saturation,
		lightness,
		generateHarmoniousColors,
		onError,
	]);

	// Copy color to clipboard
	const copyColor = useCallback(async (color: string) => {
		try {
			await navigator.clipboard.writeText(color);
			setCopiedColor(color);
			setTimeout(() => setCopiedColor(null), 2000);
		} catch (error) {
			console.error("Failed to copy color:", error);
		}
	}, []);

	// Download palette as JSON
	const downloadPalette = useCallback(() => {
		try {
			const paletteData = {
				...palette,
				timestamp: new Date().toISOString(),
				harmony: selectedHarmony,
				baseColor: { hue: baseHue, saturation, lightness },
			};

			const blob = new Blob([JSON.stringify(paletteData, null, 2)], {
				type: "application/json",
			});

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			onError?.(error as Error);
		}
	}, [palette, selectedHarmony, baseHue, saturation, lightness, onError]);

	// Initialize palette
	useEffect(() => {
		generatePalette();
	}, [generatePalette]);

	// Performance monitoring
	useEffect(() => {
		if (!isActive) return;

		const handlePerformanceUpdate = (metrics: {
			fps: number;
			frameTime: number;
			memoryUsage: number;
		}) => {
			onPerformanceUpdate?.(metrics);
		};

		performanceMonitor.startMonitoring(handlePerformanceUpdate);

		return () => {
			performanceMonitor.stopMonitoring(handlePerformanceUpdate);
		};
	}, [isActive, onPerformanceUpdate]);

	return (
		<div className="space-y-6">
			{/* Controls */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main flex items-center">
					<Palette className="w-5 h-5 mr-2" />
					Color Harmony Controls
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Harmony Type */}
					<div className="space-y-2">
						<label
							htmlFor="harmony-select"
							className="noto-sans-jp-light text-sm text-main"
						>
							Color Harmony
						</label>
						<select
							id="harmony-select"
							value={selectedHarmony}
							onChange={(e) =>
								setSelectedHarmony(e.target.value as ColorPalette["harmony"])
							}
							className="w-full border border-main bg-base text-main p-2 text-sm"
						>
							<option value="random">Random</option>
							<option value="monochromatic">Monochromatic</option>
							<option value="analogous">Analogous</option>
							<option value="complementary">Complementary</option>
							<option value="triadic">Triadic</option>
						</select>
					</div>

					{/* Base Hue */}
					<div className="space-y-2">
						<label
							htmlFor="hue-slider"
							className="noto-sans-jp-light text-sm text-main"
						>
							Base Hue: {baseHue}°
						</label>
						<input
							id="hue-slider"
							type="range"
							min="0"
							max="360"
							value={baseHue}
							onChange={(e) => setBaseHue(Number(e.target.value))}
							className="w-full"
							style={{
								background: `linear-gradient(to right, 
                  hsl(0, 70%, 50%), hsl(60, 70%, 50%), hsl(120, 70%, 50%), 
                  hsl(180, 70%, 50%), hsl(240, 70%, 50%), hsl(300, 70%, 50%), hsl(360, 70%, 50%))`,
							}}
						/>
					</div>

					{/* Saturation */}
					<div className="space-y-2">
						<label
							htmlFor="saturation-slider"
							className="noto-sans-jp-light text-sm text-main"
						>
							Saturation: {saturation}%
						</label>
						<input
							id="saturation-slider"
							type="range"
							min="0"
							max="100"
							value={saturation}
							onChange={(e) => setSaturation(Number(e.target.value))}
							className="w-full"
						/>
					</div>

					{/* Lightness */}
					<div className="space-y-2">
						<label
							htmlFor="lightness-slider"
							className="noto-sans-jp-light text-sm text-main"
						>
							Lightness: {lightness}%
						</label>
						<input
							id="lightness-slider"
							type="range"
							min="10"
							max="90"
							value={lightness}
							onChange={(e) => setLightness(Number(e.target.value))}
							className="w-full"
						/>
					</div>
				</div>

				<div className="flex flex-wrap gap-4">
					<button
						type="button"
						onClick={generatePalette}
						tabIndex={0}
						className="flex items-center border border-main px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						<span className="noto-sans-jp-light text-sm">Generate New</span>
					</button>

					<button
						type="button"
						onClick={downloadPalette}
						tabIndex={0}
						className="flex items-center border border-main px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
					>
						<Download className="w-4 h-4 mr-2" />
						<span className="noto-sans-jp-light text-sm">Download JSON</span>
					</button>
				</div>
			</div>

			{/* Color Palette Display */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main">
					{palette.name}
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
					{palette.colors.map((color, index) => (
						<div
							key={`${color}-${index}`}
							className={`group relative aspect-square border border-main cursor-pointer transition-all duration-300 ${
								isAnimating ? "animate-pulse scale-105" : "hover:scale-105"
							}`}
							style={{ backgroundColor: color }}
							onClick={() => copyColor(color)}
							title={`Click to copy: ${color}`}
						>
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
								<Copy className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>

							<div className="absolute bottom-0 left-0 right-0 bg-base bg-opacity-90 p-2 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
								<span className="noto-sans-jp-light text-xs text-main">
									{color}
								</span>
								{copiedColor === color && (
									<div className="text-xs text-accent mt-1">Copied!</div>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="text-center">
					<p className="noto-sans-jp-light text-sm text-main">
						カラーをクリックしてクリップボードにコピー
					</p>
				</div>
			</div>

			{/* Color Theory Information */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main">
					Color Theory:{" "}
					{selectedHarmony.charAt(0).toUpperCase() + selectedHarmony.slice(1)}
				</h3>

				<div className="noto-sans-jp-light text-sm text-main space-y-2">
					{selectedHarmony === "monochromatic" && (
						<p>
							単色調和：同じ色相で彩度と明度を変化させた配色。統一感があり、落ち着いた印象を与えます。
						</p>
					)}
					{selectedHarmony === "analogous" && (
						<p>
							類似色調和：色相環で隣接する色を使った配色。自然で調和の取れた印象を与えます。
						</p>
					)}
					{selectedHarmony === "complementary" && (
						<p>
							補色調和：色相環で正反対の位置にある色を使った配色。コントラストが強く、活動的な印象を与えます。
						</p>
					)}
					{selectedHarmony === "triadic" && (
						<p>
							三色調和：色相環を三等分した位置の色を使った配色。バランスが良く、活気のある印象を与えます。
						</p>
					)}
					{selectedHarmony === "random" && (
						<p>
							ランダム配色：規則性のない色の組み合わせ。予想外の美しい配色が生まれることがあります。
						</p>
					)}
				</div>
			</div>
		</div>
	);
};
