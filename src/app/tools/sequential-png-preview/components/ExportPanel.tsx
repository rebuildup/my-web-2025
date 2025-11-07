"use client";

import { Download, FileImage, Film, Image, X } from "lucide-react";
import { useState } from "react";
import type { AnimationSettings, ExportSettings, FrameData } from "../types";

interface ExportPanelProps {
	frames: FrameData[];
	settings: AnimationSettings;
	onClose: () => void;
}

export default function ExportPanel({
	frames,
	settings,
	onClose,
}: ExportPanelProps) {
	const [exportSettings, setExportSettings] = useState<ExportSettings>({
		format: "gif",
		quality: 80,
		width: frames[0]?.width || 800,
		height: frames[0]?.height || 600,
		frameRate: settings.frameRate,
	});
	const [isExporting, setIsExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);

	const handleExport = async () => {
		setIsExporting(true);
		setExportProgress(0);

		try {
			if (exportSettings.format === "frames") {
				await exportFrames();
			} else if (exportSettings.format === "gif") {
				await exportGif();
			} else if (exportSettings.format === "mp4") {
				await exportMp4();
			}
		} catch (error) {
			console.error("Export failed:", error);
			alert("エクスポートに失敗しました。");
		} finally {
			setIsExporting(false);
			setExportProgress(0);
		}
	};

	const exportFrames = async () => {
		for (let i = 0; i < frames.length; i++) {
			const frame = frames[i];
			const link = document.createElement("a");
			link.href = frame.dataUrl;
			link.download = `frame_${String(i + 1).padStart(3, "0")}_${frame.name}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			setExportProgress(((i + 1) / frames.length) * 100);

			// Small delay to prevent browser blocking
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	};

	const exportGif = async () => {
		// This is a placeholder implementation
		// In a real application, you would use a library like gif.js
		alert(
			"GIF export is not yet implemented. This would require a GIF encoding library.",
		);
	};

	const exportMp4 = async () => {
		// This is a placeholder implementation
		// In a real application, you would use a library like ffmpeg.wasm
		alert(
			"MP4 export is not yet implemented. This would require video encoding capabilities.",
		);
	};

	const estimatedFileSize = () => {
		const avgFrameSize =
			frames.reduce((total, frame) => total + frame.size, 0) / frames.length;
		const qualityMultiplier = exportSettings.quality / 100;

		if (exportSettings.format === "frames") {
			return avgFrameSize * frames.length;
		} else if (exportSettings.format === "gif") {
			return avgFrameSize * frames.length * qualityMultiplier * 0.3; // GIF compression estimate
		} else {
			return avgFrameSize * frames.length * qualityMultiplier * 0.1; // MP4 compression estimate
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-main">エクスポート設定</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-main hover:text-main transition-colors"
					aria-label="閉じる"
				>
					<X size={20} />
				</button>
			</div>

			<div className="space-y-6">
				{/* Format Selection */}
				<div>
					<label className="block text-sm font-medium mb-3">
						エクスポート形式
					</label>
					<div className="grid grid-3 gap-3">
						<button
							type="button"
							onClick={() =>
								setExportSettings((prev) => ({ ...prev, format: "frames" }))
							}
							className={`p-4 rounded-lg text-left transition-colors ${
								exportSettings.format === "frames"
									? "bg-main/20"
									: "bg-main/10 hover:bg-main/15"
							}`}
						>
							<div className="flex items-center gap-2 mb-2">
								<FileImage size={20} />
								<span className="font-medium">個別フレーム</span>
							</div>
							<p className="text-sm text-main">
								各フレームをPNGファイルとして出力
							</p>
						</button>

						<button
							type="button"
							onClick={() =>
								setExportSettings((prev) => ({ ...prev, format: "gif" }))
							}
							className={`p-4 rounded-lg text-left transition-colors ${
								exportSettings.format === "gif"
									? "bg-main/20"
									: "bg-main/10 hover:bg-main/15"
							}`}
						>
							<div className="flex items-center gap-2 mb-2">
								<Image size={20} aria-label="GIF icon" />
								<span className="font-medium">アニメーションGIF</span>
							</div>
							<p className="text-sm text-main">アニメーションGIFとして出力</p>
						</button>

						<button
							type="button"
							onClick={() =>
								setExportSettings((prev) => ({ ...prev, format: "mp4" }))
							}
							className={`p-4 rounded-lg text-left transition-colors ${
								exportSettings.format === "mp4"
									? "bg-main/20"
									: "bg-main/10 hover:bg-main/15"
							}`}
						>
							<div className="flex items-center gap-2 mb-2">
								<Film size={20} />
								<span className="font-medium">MP4動画</span>
							</div>
							<p className="text-sm text-main">MP4動画として出力</p>
						</button>
					</div>
				</div>

				{/* Quality Settings */}
				{exportSettings.format !== "frames" && (
					<div>
						<label className="block text-sm font-medium mb-2">
							品質: {exportSettings.quality}%
						</label>
						<input
							type="range"
							min="10"
							max="100"
							step="10"
							value={exportSettings.quality}
							onChange={(e) =>
								setExportSettings((prev) => ({
									...prev,
									quality: parseInt(e.target.value, 10),
								}))
							}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-main mt-1">
							<span>低品質</span>
							<span>高品質</span>
						</div>
					</div>
				)}

				{/* Dimension Settings */}
				{exportSettings.format !== "frames" && (
					<div className="grid grid-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">幅 (px)</label>
							<input
								type="number"
								min="100"
								max="4000"
								value={exportSettings.width}
								onChange={(e) =>
									setExportSettings((prev) => ({
										...prev,
										width: parseInt(e.target.value, 10) || 800,
									}))
								}
								className="w-full p-2 rounded-lg bg-main/10"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">
								高さ (px)
							</label>
							<input
								type="number"
								min="100"
								max="4000"
								value={exportSettings.height}
								onChange={(e) =>
									setExportSettings((prev) => ({
										...prev,
										height: parseInt(e.target.value, 10) || 600,
									}))
								}
								className="w-full p-2 rounded-lg bg-main/10"
							/>
						</div>
					</div>
				)}

				{/* Frame Rate Settings */}
				{exportSettings.format !== "frames" && (
					<div>
						<label className="block text-sm font-medium mb-2">
							フレームレート: {exportSettings.frameRate}fps
						</label>
						<input
							type="range"
							min="1"
							max="60"
							value={exportSettings.frameRate}
							onChange={(e) =>
								setExportSettings((prev) => ({
									...prev,
									frameRate: parseInt(e.target.value, 10),
								}))
							}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-main mt-1">
							<span>1fps</span>
							<span>60fps</span>
						</div>
					</div>
				)}

				{/* Export Info */}
				<div className="p-4 rounded-lg bg-main/5">
					<h4 className="font-medium mb-2 text-main">エクスポート情報</h4>
					<div className="space-y-1 text-sm">
						<div className="flex justify-between">
							<span className="text-main/70">フレーム数:</span>
							<span>{frames.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-main/70">推定ファイルサイズ:</span>
							<span>{formatFileSize(estimatedFileSize())}</span>
						</div>
						{exportSettings.format !== "frames" && (
							<>
								<div className="flex justify-between">
									<span className="text-main/70">出力解像度:</span>
									<span>
										{exportSettings.width} × {exportSettings.height}px
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-main/70">フレームレート:</span>
									<span>{exportSettings.frameRate}fps</span>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Export Progress */}
				{isExporting && (
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>エクスポート中...</span>
							<span>{Math.round(exportProgress)}%</span>
						</div>
						<div className="w-full bg-main/20 rounded-full h-2">
							<div
								className="bg-main h-2 rounded-full transition-all duration-300"
								style={{ width: `${exportProgress}%` }}
							/>
						</div>
					</div>
				)}

				{/* Export Button */}
				<button
					type="button"
					onClick={handleExport}
					disabled={isExporting || frames.length === 0}
					className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<Download size={20} />
					{isExporting ? "エクスポート中..." : "エクスポート開始"}
				</button>
			</div>
		</div>
	);
}
