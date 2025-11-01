/**
 * Interactive Shapes Experiment
 * Mouse and touch responsive interactive elements
 */

"use client";

import { MousePointer, RotateCcw, Shapes } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { performanceMonitor } from "@/lib/playground/performance-monitor";
import type { ExperimentProps } from "@/types/playground";

interface Shape {
	id: number;
	x: number;
	y: number;
	size: number;
	color: string;
	type: "circle" | "square" | "triangle" | "hexagon";
	rotation: number;
	scale: number;
	isHovered: boolean;
	isPressed: boolean;
	velocity: { x: number; y: number };
}

interface InteractionConfig {
	shapeCount: number;
	interactionRadius: number;
	animationSpeed: number;
	responseType: "hover" | "click" | "drag" | "magnetic";
	colorMode: "static" | "dynamic" | "rainbow";
	physics: boolean;
}

const colors = [
	"#ff6b6b",
	"#4ecdc4",
	"#45b7d1",
	"#96ceb4",
	"#ffeaa7",
	"#dda0dd",
	"#98d8c8",
	"#f7dc6f",
	"#bb8fce",
	"#85c1e9",
];

const shapeTypes: Shape["type"][] = ["circle", "square", "triangle", "hexagon"];

export const InteractiveShapesExperiment: React.FC<ExperimentProps> = ({
	isActive,
	onPerformanceUpdate,
}) => {
	const [shapes, setShapes] = useState<Shape[]>([]);
	const [config, setConfig] = useState<InteractionConfig>({
		shapeCount: 12,
		interactionRadius: 100,
		animationSpeed: 1,
		responseType: "hover",
		colorMode: "dynamic",
		physics: true,
	});
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [draggedShape, setDraggedShape] = useState<number | null>(null);

	// Generate random shapes
	const generateShapes = useCallback((count: number) => {
		const newShapes: Shape[] = [];
		for (let i = 0; i < count; i++) {
			newShapes.push({
				id: i,
				x: Math.random() * 600 + 50,
				y: Math.random() * 400 + 50,
				size: Math.random() * 30 + 20,
				color: colors[i % colors.length],
				type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
				rotation: Math.random() * 360,
				scale: 1,
				isHovered: false,
				isPressed: false,
				velocity: { x: 0, y: 0 },
			});
		}
		return newShapes;
	}, []);

	// Calculate distance between two points
	const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
		return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	};

	// Update shape interactions
	const updateShapeInteractions = useCallback(() => {
		setShapes((prevShapes) => {
			return prevShapes.map((shape) => {
				const distance = getDistance(
					shape.x,
					shape.y,
					mousePosition.x,
					mousePosition.y,
				);
				const isInRange = distance < config.interactionRadius;

				const newShape = { ...shape };

				// Reset states
				newShape.isHovered = false;
				newShape.isPressed = false;

				if (isInRange) {
					switch (config.responseType) {
						case "hover":
							newShape.isHovered = true;
							newShape.scale = 1.2;
							newShape.rotation += config.animationSpeed * 2;
							break;

						case "click":
							if (isMouseDown) {
								newShape.isPressed = true;
								newShape.scale = 0.8;
								newShape.rotation += config.animationSpeed * 5;
							} else {
								newShape.scale = 1.1;
							}
							break;

						case "magnetic": {
							// Attract to mouse
							const force =
								((config.interactionRadius - distance) /
									config.interactionRadius) *
								0.5;
							const angle = Math.atan2(
								mousePosition.y - shape.y,
								mousePosition.x - shape.x,
							);
							newShape.velocity.x +=
								Math.cos(angle) * force * config.animationSpeed;
							newShape.velocity.y +=
								Math.sin(angle) * force * config.animationSpeed;
							newShape.scale = 1 + force * 0.5;
							break;
						}

						case "drag":
							if (draggedShape === shape.id) {
								newShape.x = mousePosition.x;
								newShape.y = mousePosition.y;
								newShape.scale = 1.3;
								newShape.rotation += config.animationSpeed * 3;
							} else if (isInRange && !draggedShape) {
								newShape.scale = 1.1;
							}
							break;
					}

					// Dynamic color change
					if (config.colorMode === "dynamic") {
						const colorIndex = Math.floor(
							(distance / config.interactionRadius) * colors.length,
						);
						newShape.color = colors[Math.min(colorIndex, colors.length - 1)];
					} else if (config.colorMode === "rainbow") {
						const hue = (Date.now() / 10 + shape.id * 30) % 360;
						newShape.color = `hsl(${hue}, 70%, 60%)`;
					}
				} else {
					// Return to normal state
					newShape.scale = Math.max(0.95, newShape.scale - 0.05);
					if (config.responseType !== "magnetic") {
						newShape.rotation += config.animationSpeed * 0.5;
					}
				}

				// Apply physics
				if (config.physics) {
					newShape.x += newShape.velocity.x;
					newShape.y += newShape.velocity.y;
					newShape.velocity.x *= 0.95; // Friction
					newShape.velocity.y *= 0.95;

					// Boundary collision
					if (newShape.x < newShape.size || newShape.x > 700 - newShape.size) {
						newShape.velocity.x *= -0.8;
						newShape.x = Math.max(
							newShape.size,
							Math.min(700 - newShape.size, newShape.x),
						);
					}
					if (newShape.y < newShape.size || newShape.y > 500 - newShape.size) {
						newShape.velocity.y *= -0.8;
						newShape.y = Math.max(
							newShape.size,
							Math.min(500 - newShape.size, newShape.y),
						);
					}
				}

				return newShape;
			});
		});
	}, [mousePosition, config, isMouseDown, draggedShape, getDistance]);

	// Handle mouse events
	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			const rect = event.currentTarget.getBoundingClientRect();
			setMousePosition({
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			});
		},
		[],
	);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setIsMouseDown(true);

			if (config.responseType === "drag") {
				const rect = event.currentTarget.getBoundingClientRect();
				const mouseX = event.clientX - rect.left;
				const mouseY = event.clientY - rect.top;

				// Find shape under mouse
				const clickedShape = shapes.find((shape) => {
					const distance = getDistance(shape.x, shape.y, mouseX, mouseY);
					return distance < shape.size;
				});

				if (clickedShape) {
					setDraggedShape(clickedShape.id);
				}
			}
		},
		[config.responseType, shapes, getDistance],
	);

	const handleMouseUp = useCallback(() => {
		setIsMouseDown(false);
		setDraggedShape(null);
	}, []);

	// Handle touch events
	const handleTouchMove = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			event.preventDefault();
			const rect = event.currentTarget.getBoundingClientRect();
			const touch = event.touches[0];
			setMousePosition({
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top,
			});
		},
		[],
	);

	// Reset shapes
	const resetShapes = useCallback(() => {
		setShapes(generateShapes(config.shapeCount));
		setDraggedShape(null);
		setIsMouseDown(false);
	}, [generateShapes, config.shapeCount]);

	// Render shape based on type
	const renderShape = (shape: Shape) => {
		const style: React.CSSProperties = {
			position: "absolute",
			left: shape.x - shape.size,
			top: shape.y - shape.size,
			width: shape.size * 2,
			height: shape.size * 2,
			backgroundColor: shape.color,
			transform: `scale(${shape.scale}) rotate(${shape.rotation}deg)`,
			transition:
				config.responseType === "drag" && draggedShape === shape.id
					? "none"
					: "all 0.3s ease",
			cursor: config.responseType === "drag" ? "grab" : "pointer",
			borderRadius: shape.type === "circle" ? "50%" : "0",
			opacity: shape.isPressed ? 0.7 : 1,
			boxShadow: shape.isHovered ? "0 0 20px rgba(255,255,255,0.5)" : "none",
		};

		// Special shapes
		if (shape.type === "triangle") {
			style.backgroundColor = "transparent";
			style.borderLeft = `${shape.size}px solid transparent`;
			style.borderRight = `${shape.size}px solid transparent`;
			style.borderBottom = `${shape.size * 1.5}px solid ${shape.color}`;
			style.width = 0;
			style.height = 0;
		} else if (shape.type === "hexagon") {
			style.clipPath =
				"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
		}

		return <div key={shape.id} style={style} className="shape-element" />;
	};

	// Initialize shapes
	useEffect(() => {
		setShapes(generateShapes(config.shapeCount));
	}, [generateShapes, config.shapeCount]);

	// Update interactions
	useEffect(() => {
		const interval = setInterval(updateShapeInteractions, 16); // ~60fps
		return () => clearInterval(interval);
	}, [updateShapeInteractions]);

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
			{/* Interactive Area */}
			<div className="bg-base border border-main p-4 space-y-4">
				<div
					className="relative bg-base border border-main overflow-hidden cursor-crosshair"
					style={{ width: "100%", height: "500px" }}
					onMouseMove={handleMouseMove}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					onTouchMove={handleTouchMove}
					onTouchStart={(e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						const touch = e.touches[0];
						setMousePosition({
							x: touch.clientX - rect.left,
							y: touch.clientY - rect.top,
						});
						setIsMouseDown(true);
					}}
					onTouchEnd={() => {
						setIsMouseDown(false);
						setDraggedShape(null);
					}}
				>
					{shapes.map(renderShape)}

					{/* Mouse cursor indicator */}
					<div
						className="absolute pointer-events-none border-2 border-accent rounded-full opacity-30"
						style={{
							left: mousePosition.x - config.interactionRadius,
							top: mousePosition.y - config.interactionRadius,
							width: config.interactionRadius * 2,
							height: config.interactionRadius * 2,
							transition: "all 0.1s ease",
						}}
					/>

					{/* Mouse position dot */}
					<div
						className="absolute w-2 h-2 bg-accent rounded-full pointer-events-none"
						style={{
							left: mousePosition.x - 4,
							top: mousePosition.y - 4,
						}}
					/>
				</div>

				<div className="flex items-center justify-center">
					<button
						type="button"
						onClick={resetShapes}
						className="flex items-center border border-main px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						<span className="noto-sans-jp-light text-sm">Reset Shapes</span>
					</button>
				</div>
			</div>

			{/* Controls */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main flex items-center">
					<Shapes className="w-5 h-5 mr-2" />
					Interaction Controls
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Shape Count */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Shape Count: {config.shapeCount}
						</label>
						<input
							type="range"
							min="5"
							max="30"
							value={config.shapeCount}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									shapeCount: Number(e.target.value),
								}))
							}
							className="w-full"
						/>
					</div>

					{/* Interaction Radius */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Interaction Radius: {config.interactionRadius}px
						</label>
						<input
							type="range"
							min="50"
							max="200"
							value={config.interactionRadius}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									interactionRadius: Number(e.target.value),
								}))
							}
							className="w-full"
						/>
					</div>

					{/* Animation Speed */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Animation Speed: {config.animationSpeed.toFixed(1)}
						</label>
						<input
							type="range"
							min="0.1"
							max="3"
							step="0.1"
							value={config.animationSpeed}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									animationSpeed: Number(e.target.value),
								}))
							}
							className="w-full"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Response Type */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Response Type
						</label>
						<select
							value={config.responseType}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									responseType: e.target
										.value as InteractionConfig["responseType"],
								}))
							}
							className="w-full border border-main bg-base text-main p-2 text-sm"
						>
							<option value="hover">Hover</option>
							<option value="click">Click</option>
							<option value="drag">Drag</option>
							<option value="magnetic">Magnetic</option>
						</select>
					</div>

					{/* Color Mode */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Color Mode
						</label>
						<select
							value={config.colorMode}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									colorMode: e.target.value as InteractionConfig["colorMode"],
								}))
							}
							className="w-full border border-main bg-base text-main p-2 text-sm"
						>
							<option value="static">Static</option>
							<option value="dynamic">Dynamic</option>
							<option value="rainbow">Rainbow</option>
						</select>
					</div>

					{/* Physics */}
					<div className="space-y-2">
						<label className="noto-sans-jp-light text-sm text-main">
							Physics
						</label>
						<div className="flex items-center">
							<input
								type="checkbox"
								checked={config.physics}
								onChange={(e) =>
									setConfig((prev) => ({ ...prev, physics: e.target.checked }))
								}
								className="w-4 h-4 mr-2"
							/>
							<span className="noto-sans-jp-light text-sm text-main">
								{config.physics ? "Enabled" : "Disabled"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Instructions */}
			<div className="bg-base border border-main p-4 space-y-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main flex items-center">
					<MousePointer className="w-5 h-5 mr-2" />
					Interaction Guide
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h4 className="noto-sans-jp-light text-sm font-bold text-main">
							Mouse Controls:
						</h4>
						<div className="noto-sans-jp-light text-xs text-main space-y-1">
							<div>• Move: マウスを動かして図形とインタラクション</div>
							<div>• Click: クリックして図形を押す（Clickモード）</div>
							<div>• Drag: 図形をドラッグして移動（Dragモード）</div>
						</div>
					</div>

					<div className="space-y-2">
						<h4 className="noto-sans-jp-light text-sm font-bold text-main">
							Touch Controls:
						</h4>
						<div className="noto-sans-jp-light text-xs text-main space-y-1">
							<div>• Touch: タッチして図形とインタラクション</div>
							<div>• Drag: 指で図形をドラッグして移動</div>
							<div>• Multi-touch: 複数の指で同時操作可能</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
