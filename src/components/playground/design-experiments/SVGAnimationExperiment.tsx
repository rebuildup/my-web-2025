/**
 * SVG Animation Experiment
 * Vector graphics with smooth animations
 */

"use client";

import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { performanceMonitor } from "@/lib/playground/performance-monitor";
import type { ExperimentProps } from "@/types/playground";

interface SVGAnimationConfig {
	type: "morph" | "path" | "rotate" | "scale" | "color";
	duration: number;
	easing: string;
	loop: boolean;
}

const animationTypes = [
	{ value: "morph", label: "Shape Morphing" },
	{ value: "path", label: "Path Drawing" },
	{ value: "rotate", label: "Rotation" },
	{ value: "scale", label: "Scale" },
	{ value: "color", label: "Color Transition" },
];

const easingTypes = [
	{ value: "linear", label: "Linear" },
	{ value: "ease", label: "Ease" },
	{ value: "ease-in", label: "Ease In" },
	{ value: "ease-out", label: "Ease Out" },
	{ value: "ease-in-out", label: "Ease In Out" },
];

export const SVGAnimationExperiment: React.FC<ExperimentProps> = ({
	isActive,
	onPerformanceUpdate,
}) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [animationConfig, setAnimationConfig] = useState<SVGAnimationConfig>({
		type: "morph",
		duration: 2000,
		easing: "ease-in-out",
		loop: true,
	});
	const [currentShape, setCurrentShape] = useState(0);
	const [pathProgress, setPathProgress] = useState(0);
	const [colors, setColors] = useState(["#ff6b6b", "#4ecdc4", "#45b7d1"]);

	// Shape paths for morphing
	const shapePaths = [
		"M50,10 L90,90 L10,90 Z", // Triangle
		"M10,50 Q50,10 90,50 Q50,90 10,50", // Circle-like
		"M10,10 L90,10 L90,90 L10,90 Z", // Square
		"M50,10 L70,30 L90,50 L70,70 L50,90 L30,70 L10,50 L30,30 Z", // Octagon
		"M50,10 L60,40 L90,40 L70,60 L80,90 L50,75 L20,90 L30,60 L10,40 L40,40 Z", // Star
	];

	// Complex path for drawing animation
	const complexPath = "M10,50 Q30,10 50,50 T90,50 Q70,90 50,50 T10,50";

	// Toggle animation
	const toggleAnimation = useCallback(() => {
		setIsAnimating(!isAnimating);
	}, [isAnimating]);

	// Reset animation
	const resetAnimation = useCallback(() => {
		setIsAnimating(false);
		setCurrentShape(0);
		setPathProgress(0);
	}, []);

	// Path drawing animation
	useEffect(() => {
		if (!isAnimating || animationConfig.type !== "path") return;

		const interval = setInterval(() => {
			setPathProgress((prev) => {
				const next = prev + 2;
				return next > 100 ? (animationConfig.loop ? 0 : 100) : next;
			});
		}, animationConfig.duration / 50);

		return () => clearInterval(interval);
	}, [
		isAnimating,
		animationConfig.type,
		animationConfig.duration,
		animationConfig.loop,
	]);

	// Shape morphing animation
	useEffect(() => {
		if (!isAnimating || animationConfig.type !== "morph") return;

		const interval = setInterval(() => {
			setCurrentShape((prev) => (prev + 1) % shapePaths.length);
		}, animationConfig.duration);

		return () => clearInterval(interval);
	}, [isAnimating, animationConfig.type, animationConfig.duration]);

	// Get SVG animation styles
	const getSVGStyles = (): React.CSSProperties => {
		if (!isAnimating) return {};

		const baseTransition = `all ${animationConfig.duration}ms ${animationConfig.easing}`;

		switch (animationConfig.type) {
			case "rotate":
				return {
					animation: `svgRotate ${animationConfig.duration}ms ${animationConfig.easing} ${
						animationConfig.loop ? "infinite" : "1"
					}`,
				};

			case "scale":
				return {
					animation: `svgScale ${animationConfig.duration}ms ${animationConfig.easing} ${
						animationConfig.loop ? "infinite alternate" : "1"
					}`,
				};

			case "color":
				return {
					animation: `svgColor ${animationConfig.duration}ms ${animationConfig.easing} ${
						animationConfig.loop ? "infinite alternate" : "1"
					}`,
				};

			default:
				return { transition: baseTransition };
		}
	};

	// Get current path for morphing
	const getCurrentPath = () => {
		if (animationConfig.type === "morph") {
			return shapePaths[currentShape];
		}
		return shapePaths[0]; // Default to triangle
	};

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
			{/* SVG Display */}
			<div className="bg-base border border-main p-4 space-y-4">
				<div className="aspect-square bg-base border border-main flex items-center justify-center">
					<svg
						width="300"
						height="300"
						viewBox="0 0 100 100"
						className="w-full h-full max-w-sm"
						style={getSVGStyles()}
					>
						{/* Background grid */}
						<defs>
							<pattern
								id="grid"
								width="10"
								height="10"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 10 0 L 0 0 0 10"
									fill="none"
									stroke="#e0e0e0"
									strokeWidth="0.5"
								/>
							</pattern>
						</defs>
						<rect width="100" height="100" fill="url(#grid)" />

						{/* Main shape based on animation type */}
						{animationConfig.type === "morph" && (
							<path
								d={getCurrentPath()}
								fill={colors[0]}
								stroke={colors[1]}
								strokeWidth="2"
								style={{
									transition: `d ${animationConfig.duration}ms ${animationConfig.easing}`,
								}}
							/>
						)}

						{animationConfig.type === "path" && (
							<>
								{/* Full path (invisible) */}
								<path
									d={complexPath}
									fill="none"
									stroke="#e0e0e0"
									strokeWidth="1"
									strokeDasharray="2,2"
								/>
								{/* Animated path */}
								<path
									d={complexPath}
									fill="none"
									stroke={colors[0]}
									strokeWidth="3"
									strokeDasharray="100"
									strokeDashoffset={100 - pathProgress}
									strokeLinecap="round"
								/>
								{/* Moving dot */}
								<circle
									r="2"
									fill={colors[1]}
									style={{
										offsetPath: `path('${complexPath}')`,
										offsetDistance: `${pathProgress}%`,
									}}
								/>
							</>
						)}

						{(animationConfig.type === "rotate" ||
							animationConfig.type === "scale" ||
							animationConfig.type === "color") && (
							<g transform="translate(50,50)">
								{/* Central shape */}
								<path
									d="M-20,-20 L20,-20 L20,20 L-20,20 Z"
									fill={colors[0]}
									stroke={colors[1]}
									strokeWidth="2"
								/>
								{/* Orbiting elements */}
								<g className="orbit-group">
									<circle cx="30" cy="0" r="4" fill={colors[2]} />
									<circle cx="-30" cy="0" r="4" fill={colors[2]} />
									<circle cx="0" cy="30" r="4" fill={colors[2]} />
									<circle cx="0" cy="-30" r="4" fill={colors[2]} />
								</g>
							</g>
						)}

						{/* Decorative elements */}
						<g opacity="0.3">
							<circle cx="15" cy="15" r="2" fill={colors[0]} />
							<circle cx="85" cy="15" r="2" fill={colors[1]} />
							<circle cx="15" cy="85" r="2" fill={colors[2]} />
							<circle cx="85" cy="85" r="2" fill={colors[0]} />
						</g>
					</svg>
				</div>

				<div className="flex items-center justify-center gap-4">
					<button
						type="button"
						onClick={toggleAnimation}
						className="flex items-center border border-main px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
					>
						{isAnimating ? (
							<Pause className="w-4 h-4 mr-2" />
						) : (
							<Play className="w-4 h-4 mr-2" />
						)}
						<span className="noto-sans-jp-light text-sm">
							{isAnimating ? "Stop Animation" : "Start Animation"}
						</span>
					</button>

					<button
						type="button"
						onClick={resetAnimation}
						className="flex items-center border border-main px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						<span className="noto-sans-jp-light text-sm">Reset</span>
					</button>
				</div>
			</div>

			{/* Animation Controls */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main flex items-center">
					<Zap className="w-5 h-5 mr-2" />
					SVG Animation Controls
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Animation Type */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Animation Type
						</label>
						<select
							value={animationConfig.type}
							onChange={(e) =>
								setAnimationConfig((prev) => ({
									...prev,
									type: e.target.value as SVGAnimationConfig["type"],
								}))
							}
							className="w-full border border-main bg-base text-main p-2 text-sm"
						>
							{animationTypes.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					</div>

					{/* Duration */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Duration: {animationConfig.duration}ms
						</label>
						<input
							type="range"
							min="500"
							max="5000"
							step="100"
							value={animationConfig.duration}
							onChange={(e) =>
								setAnimationConfig((prev) => ({
									...prev,
									duration: Number(e.target.value),
								}))
							}
							className="w-full"
						/>
					</div>

					{/* Easing */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Easing
						</label>
						<select
							value={animationConfig.easing}
							onChange={(e) =>
								setAnimationConfig((prev) => ({
									...prev,
									easing: e.target.value,
								}))
							}
							className="w-full border border-main bg-base text-main p-2 text-sm"
						>
							{easingTypes.map((easing) => (
								<option key={easing.value} value={easing.value}>
									{easing.label}
								</option>
							))}
						</select>
					</div>

					{/* Loop */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Loop Animation
						</label>
						<div className="flex items-center">
							<input
								type="checkbox"
								checked={animationConfig.loop}
								onChange={(e) =>
									setAnimationConfig((prev) => ({
										...prev,
										loop: e.target.checked,
									}))
								}
								className="w-4 h-4 mr-2"
							/>
							<span className="noto-sans-jp-light text-sm text-main">
								{animationConfig.loop ? "Enabled" : "Disabled"}
							</span>
						</div>
					</div>
				</div>

				{/* Color Controls */}
				<div className="space-y-2">
					<label className="noto-sans-jp-light text-sm text-main">
						Color Palette
					</label>
					<div className="flex gap-4">
						{colors.map((color, index) => (
							<div key={index} className="flex items-center space-x-2">
								<input
									type="color"
									value={color}
									onChange={(e) =>
										setColors((prev) => {
											const newColors = [...prev];
											newColors[index] = e.target.value;
											return newColors;
										})
									}
									className="w-12 h-8 border border-main"
								/>
								<span className="noto-sans-jp-light text-sm text-main">
									Color {index + 1}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Animation Information */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main">
					SVG Animation Features
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h4 className="noto-sans-jp-light text-sm font-bold text-main">
							Current Animation:
						</h4>
						<div className="noto-sans-jp-light text-xs text-main space-y-1">
							<div>
								Type:{" "}
								{
									animationTypes.find((t) => t.value === animationConfig.type)
										?.label
								}
							</div>
							<div>Duration: {animationConfig.duration}ms</div>
							<div>Easing: {animationConfig.easing}</div>
							<div>Loop: {animationConfig.loop ? "Yes" : "No"}</div>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="noto-sans-jp-light text-sm font-bold text-main">
							SVG Benefits:
						</h4>
						<div className="noto-sans-jp-light text-xs text-main space-y-1">
							<div>• Scalable vector graphics</div>
							<div>• Smooth animations</div>
							<div>• Small file sizes</div>
							<div>• CSS and JS controllable</div>
							<div>• Accessibility friendly</div>
						</div>
					</div>
				</div>
			</div>

			{/* CSS Keyframes */}
			<style jsx>{`
        @keyframes svgRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes svgScale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes svgColor {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        .orbit-group {
          animation: svgRotate 4s linear infinite;
        }
      `}</style>
		</div>
	);
};
