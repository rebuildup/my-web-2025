/**
 * Typography Animation Experiment
 * Text animations and gradient effects
 */

"use client";

import { Pause, Play, RotateCcw, Type } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { performanceMonitor } from "@/lib/playground/performance-monitor";
import type { ExperimentProps } from "@/types/playground";

interface AnimationConfig {
	type: "fade" | "slide" | "scale" | "rotate" | "gradient" | "typewriter";
	duration: number;
	delay: number;
	easing: string;
}

const animatedTexts = [
	"Creative Design",
	"Interactive Experience",
	"Visual Expression",
	"Digital Art",
	"Motion Graphics",
	"Typography",
	"Animation",
	"Web Design",
];

const animationTypes = [
	{ value: "fade", label: "Fade In/Out" },
	{ value: "slide", label: "Slide" },
	{ value: "scale", label: "Scale" },
	{ value: "rotate", label: "Rotate" },
	{ value: "gradient", label: "Gradient" },
	{ value: "typewriter", label: "Typewriter" },
];

const easingTypes = [
	{ value: "ease", label: "Ease" },
	{ value: "ease-in", label: "Ease In" },
	{ value: "ease-out", label: "Ease Out" },
	{ value: "ease-in-out", label: "Ease In Out" },
	{ value: "linear", label: "Linear" },
	{ value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "Bounce" },
];

export const TypographyAnimationExperiment: React.FC<ExperimentProps> = ({
	isActive,
	onPerformanceUpdate,
}) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentTextIndex, setCurrentTextIndex] = useState(0);
	const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
		type: "gradient",
		duration: 2000,
		delay: 500,
		easing: "ease-in-out",
	});
	const [customText, setCustomText] = useState("Your Custom Text");
	const [useCustomText, setUseCustomText] = useState(false);
	const [typewriterText, setTypewriterText] = useState("");
	const [gradientColors, setGradientColors] = useState(["#ff0000", "#0000ff"]);

	// Typewriter effect
	const typewriterEffect = useCallback((text: string) => {
		setTypewriterText("");
		let index = 0;
		const interval = setInterval(() => {
			if (index <= text.length) {
				setTypewriterText(text.slice(0, index));
				index++;
			} else {
				clearInterval(interval);
				setTimeout(() => {
					setTypewriterText("");
				}, 1000);
			}
		}, 100);
		return interval;
	}, []);

	// Text rotation effect
	useEffect(() => {
		if (!isAnimating) return;

		let interval: NodeJS.Timeout;
		let typewriterInterval: NodeJS.Timeout;

		if (animationConfig.type === "typewriter") {
			const cycleTypewriter = () => {
				const currentText = useCustomText
					? customText
					: animatedTexts[currentTextIndex];
				typewriterInterval = typewriterEffect(currentText);

				setTimeout(() => {
					setCurrentTextIndex((prev) =>
						useCustomText ? prev : (prev + 1) % animatedTexts.length,
					);
				}, animationConfig.duration + animationConfig.delay);
			};

			cycleTypewriter();
			if (!useCustomText) {
				interval = setInterval(
					cycleTypewriter,
					animationConfig.duration + animationConfig.delay + 1000,
				);
			}
		} else {
			interval = setInterval(() => {
				setCurrentTextIndex((prev) =>
					useCustomText ? prev : (prev + 1) % animatedTexts.length,
				);
			}, animationConfig.duration + animationConfig.delay);
		}

		return () => {
			if (interval) clearInterval(interval);
			if (typewriterInterval) clearInterval(typewriterInterval);
		};
	}, [
		isAnimating,
		animationConfig,
		useCustomText,
		customText,
		currentTextIndex,
		typewriterEffect,
	]);

	// Toggle animation
	const toggleAnimation = useCallback(() => {
		setIsAnimating(!isAnimating);
	}, [isAnimating]);

	// Reset animation
	const resetAnimation = useCallback(() => {
		setIsAnimating(false);
		setCurrentTextIndex(0);
		setTypewriterText("");
	}, []);

	// Get current text
	const getCurrentText = () => {
		if (animationConfig.type === "typewriter") {
			return typewriterText;
		}
		return useCustomText ? customText : animatedTexts[currentTextIndex];
	};

	// Get animation styles
	const getAnimationStyles = (): React.CSSProperties => {
		const baseStyles: React.CSSProperties = {
			transition: `all ${animationConfig.duration}ms ${animationConfig.easing}`,
		};

		if (!isAnimating) return baseStyles;

		switch (animationConfig.type) {
			case "fade":
				return {
					...baseStyles,
					opacity: Math.sin(Date.now() / 1000) * 0.5 + 0.5,
				};

			case "slide":
				return {
					...baseStyles,
					transform: `translateX(${Math.sin(Date.now() / 1000) * 20}px)`,
				};

			case "scale":
				return {
					...baseStyles,
					transform: `scale(${1 + Math.sin(Date.now() / 1000) * 0.1})`,
				};

			case "rotate":
				return {
					...baseStyles,
					transform: `rotate(${Math.sin(Date.now() / 1000) * 5}deg)`,
				};

			case "gradient":
				return {
					...baseStyles,
					background: `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text",
					backgroundSize: "200% 200%",
					animation: `gradientShift ${animationConfig.duration}ms ${animationConfig.easing} infinite`,
				};

			default:
				return baseStyles;
		}
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
			{/* Animation Display */}
			<div className="bg-base border border-main p-4 space-y-4">
				<div className="aspect-video bg-base border border-main flex items-center justify-center relative overflow-hidden">
					<div
						className="neue-haas-grotesk-display text-4xl text-main text-center px-4"
						style={getAnimationStyles()}
					>
						{getCurrentText()}
					</div>

					{/* Background particles for gradient animation */}
					{isAnimating && animationConfig.type === "gradient" && (
						<div className="absolute inset-0 pointer-events-none">
							{Array.from({ length: 15 }).map((_, i) => (
								<div
									key={i}
									className="absolute w-2 h-2 rounded-full animate-pulse"
									style={{
										backgroundColor:
											i % 2 === 0 ? gradientColors[0] : gradientColors[1],
										left: `${Math.random() * 100}%`,
										top: `${Math.random() * 100}%`,
										animationDelay: `${Math.random() * 2}s`,
										opacity: 0.6,
									}}
								/>
							))}
						</div>
					)}
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
					<Type className="w-5 h-5 mr-2" />
					Animation Controls
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
									type: e.target.value as AnimationConfig["type"],
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

					{/* Delay */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Delay: {animationConfig.delay}ms
						</label>
						<input
							type="range"
							min="0"
							max="2000"
							step="100"
							value={animationConfig.delay}
							onChange={(e) =>
								setAnimationConfig((prev) => ({
									...prev,
									delay: Number(e.target.value),
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
				</div>

				{/* Custom Text */}
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="useCustomText"
							checked={useCustomText}
							onChange={(e) => setUseCustomText(e.target.checked)}
							className="w-4 h-4"
						/>
						<label
							htmlFor="useCustomText"
							className="noto-sans-jp-light text-sm text-main"
						>
							Use Custom Text
						</label>
					</div>
					{useCustomText && (
						<input
							type="text"
							value={customText}
							onChange={(e) => setCustomText(e.target.value)}
							placeholder="Enter your custom text"
							className="w-full border border-main bg-base text-main p-2 text-sm"
						/>
					)}
				</div>

				{/* Gradient Colors (for gradient animation) */}
				{animationConfig.type === "gradient" && (
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Gradient Colors
						</label>
						<div className="flex gap-4">
							<div className="flex items-center space-x-2">
								<input
									type="color"
									value={gradientColors[0]}
									onChange={(e) =>
										setGradientColors((prev) => [e.target.value, prev[1]])
									}
									className="w-12 h-8 border border-main"
								/>
								<span className="noto-sans-jp-light text-sm text-main">
									Start
								</span>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="color"
									value={gradientColors[1]}
									onChange={(e) =>
										setGradientColors((prev) => [prev[0], e.target.value])
									}
									className="w-12 h-8 border border-main"
								/>
								<span className="noto-sans-jp-light text-sm text-main">
									End
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* CSS Keyframes for gradient animation */}
			<style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
		</div>
	);
};
