"use client";

import { useEffect, useRef } from "react";
import type { AnimationSettings, FrameData } from "../types";

interface AnimationPlayerProps {
	frames: FrameData[];
	currentFrame: number;
	onFrameSelect: (frameIndex: number) => void;
	settings: AnimationSettings;
}

export default function AnimationPlayer({
	frames,
	currentFrame,
	onFrameSelect,
	settings,
}: AnimationPlayerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!canvasRef.current || frames.length === 0) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const frame = frames[currentFrame];
		const img = new Image();

		img.onload = () => {
			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Calculate scaling to fit canvas while maintaining aspect ratio
			const containerWidth = containerRef.current?.clientWidth || 800;
			const containerHeight = Math.min(600, containerWidth * 0.75);

			canvas.width = containerWidth;
			canvas.height = containerHeight;

			const scaleX = containerWidth / img.width;
			const scaleY = containerHeight / img.height;
			const scale = Math.min(scaleX, scaleY);

			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;

			const x = (containerWidth - scaledWidth) / 2;
			const y = (containerHeight - scaledHeight) / 2;

			// Apply quality settings
			if (settings.quality === "low") {
				ctx.imageSmoothingEnabled = false;
			} else if (settings.quality === "high") {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";
			} else {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "medium";
			}

			// Draw image
			ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
		};

		img.src = frame.dataUrl;
	}, [frames, currentFrame, settings.quality]);

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (frames.length <= 1) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const clickRatio = x / rect.width;

		// Navigate to frame based on click position
		const targetFrame = Math.floor(clickRatio * frames.length);
		const clampedFrame = Math.max(0, Math.min(frames.length - 1, targetFrame));
		onFrameSelect(clampedFrame);
	};

	if (frames.length === 0) {
		return (
			<div className="flex items-center justify-center h-96 text-main">
				フレームが読み込まれていません
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Canvas Container */}
			<div
				ref={containerRef}
				className="relative bg-base border border-main/20 rounded overflow-hidden"
			>
				<canvas
					ref={canvasRef}
					onClick={handleCanvasClick}
					className="w-full cursor-pointer"
					style={{ display: "block" }}
				/>

				{/* Frame Counter Overlay */}
				<div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
					{currentFrame + 1} / {frames.length}
				</div>

				{/* Frame Info Overlay */}
				<div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
					{frames[currentFrame].name}
				</div>

				{/* Dimensions Overlay */}
				<div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
					{frames[currentFrame].width} × {frames[currentFrame].height}px
				</div>
			</div>

			{/* Frame Scrubber */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm text-main">
					<span>フレーム選択</span>
					<span>
						{currentFrame + 1} / {frames.length}
					</span>
				</div>

				<div className="relative">
					<input
						type="range"
						min="0"
						max={frames.length - 1}
						value={currentFrame}
						onChange={(e) => onFrameSelect(parseInt(e.target.value, 10))}
						className="w-full h-2 bg-main/20 rounded-lg appearance-none cursor-pointer"
						style={{
							background: `linear-gradient(to right, #0000ff 0%, #0000ff ${(currentFrame / (frames.length - 1)) * 100}%, #e5e5e5 ${(currentFrame / (frames.length - 1)) * 100}%, #e5e5e5 100%)`,
						}}
					/>

					{/* Frame Markers */}
					<div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
						{frames.map((frame, index) => (
							<div
								key={`marker-${frame.dataUrl}`}
								className="absolute top-0 w-0.5 h-2 bg-main/30"
								style={{ left: `${(index / (frames.length - 1)) * 100}%` }}
							/>
						))}
					</div>
				</div>

				{/* Quick Navigation */}
				<div className="flex justify-between text-xs text-main">
					<button
						type="button"
						onClick={() => onFrameSelect(0)}
						className="hover:text-main transition-colors"
					>
						最初
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor(frames.length / 4))}
						className="hover:text-main transition-colors"
					>
						25%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor(frames.length / 2))}
						className="hover:text-main transition-colors"
					>
						50%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(Math.floor((frames.length * 3) / 4))}
						className="hover:text-main transition-colors"
					>
						75%
					</button>
					<button
						type="button"
						onClick={() => onFrameSelect(frames.length - 1)}
						className="hover:text-main transition-colors"
					>
						最後
					</button>
				</div>
			</div>
		</div>
	);
}
