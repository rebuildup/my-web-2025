/**
 * Experiment Sharing Component
 * Provides functionality to share playground experiments
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import { Check, Copy, Link, Share2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { playgroundManager } from "@/lib/playground/playground-manager";
import type {
	DeviceCapabilities,
	ExperimentShareData,
	PerformanceSettings,
} from "@/types/playground";

interface ExperimentSharingProps {
	experimentId: string;
	performanceSettings: PerformanceSettings;
	deviceCapabilities: DeviceCapabilities;
	isOpen: boolean;
	onClose: () => void;
}

export function ExperimentSharing({
	experimentId,
	performanceSettings,
	deviceCapabilities,
	isOpen,
	onClose,
}: ExperimentSharingProps) {
	const [shareData, setShareData] = useState<ExperimentShareData | null>(null);
	const [shareURL, setShareURL] = useState<string>("");
	const [copied, setCopied] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateShareData = useCallback(async () => {
		setIsGenerating(true);
		try {
			const data = playgroundManager.createShareData(
				experimentId,
				performanceSettings,
				deviceCapabilities,
			);
			const url = playgroundManager.generateShareURL(data);

			setShareData(data);
			setShareURL(url);
		} catch (error) {
			console.error("Failed to generate share data:", error);
		} finally {
			setIsGenerating(false);
		}
	}, [experimentId, performanceSettings, deviceCapabilities]);

	const copyToClipboard = useCallback(async () => {
		if (!shareURL) return;

		try {
			await navigator.clipboard.writeText(shareURL);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = shareURL;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, [shareURL]);

	const shareViaWebAPI = useCallback(async () => {
		if (!shareData || !shareURL) return;

		const experiment = playgroundManager.getExperiment(experimentId);
		if (!experiment) return;

		try {
			if (navigator.share) {
				await navigator.share({
					title: `${experiment.title} - WebGL Playground`,
					text: `Check out this interactive experiment: ${experiment.description}`,
					url: shareURL,
				});
			} else {
				// Fallback to copying URL
				await copyToClipboard();
			}
		} catch (error) {
			console.error("Failed to share:", error);
		}
	}, [shareData, shareURL, experimentId, copyToClipboard]);

	// Generate share data when component opens
	useState(() => {
		if (isOpen && !shareData) {
			generateShareData();
		}
	});

	if (!isOpen) return null;

	const experiment = playgroundManager.getExperiment(experimentId);
	if (!experiment) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-base border border-main max-w-md w-full mx-4 rounded-lg">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-main">
					<h3 className="zen-kaku-gothic-new text-lg text-main flex items-center">
						<Share2 className="w-5 h-5 mr-2" />
						Share Experiment
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-main hover:text-accent transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* Experiment Info */}
					<div className="bg-base border border-main p-3 rounded">
						<h4 className="font-medium text-main">{experiment.title}</h4>
						<p className="text-sm text-main mt-1">{experiment.description}</p>
						<div className="flex flex-wrap gap-1 mt-2">
							<span className="text-xs border border-main px-2 py-1 rounded">
								{experiment.category}
							</span>
							<span className="text-xs border border-main px-2 py-1 rounded">
								{experiment.difficulty}
							</span>
							<span className="text-xs border border-main px-2 py-1 rounded">
								{performanceSettings.qualityLevel} quality
							</span>
						</div>
					</div>

					{/* Share URL */}
					{isGenerating ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
							<span className="ml-2 text-sm text-main">
								Generating share link...
							</span>
						</div>
					) : shareURL ? (
						<div className="space-y-3">
							<label className="noto-sans-jp-light text-sm text-main">
								Share Link
							</label>
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={shareURL}
									readOnly
									className="flex-1 border border-main bg-base text-main p-2 text-sm rounded"
								/>
								<button
									type="button"
									onClick={copyToClipboard}
									className="flex items-center space-x-1 px-3 py-2 border border-main hover:border-accent hover:text-accent transition-colors rounded"
								>
									{copied ? (
										<Check className="w-4 h-4 text-green-500" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									<span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
								</button>
							</div>
						</div>
					) : null}

					{/* Share Settings Summary */}
					{shareData && (
						<div className="bg-base border border-main p-3 rounded">
							<h5 className="font-medium text-main mb-2">Shared Settings</h5>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<span className="text-main opacity-70">Quality:</span>
									<span className="ml-1 text-accent">
										{shareData.settings.qualityLevel}
									</span>
								</div>
								<div>
									<span className="text-main opacity-70">Target FPS:</span>
									<span className="ml-1 text-accent">
										{shareData.settings.targetFPS}
									</span>
								</div>
								<div>
									<span className="text-main opacity-70">Optimizations:</span>
									<span className="ml-1 text-accent">
										{shareData.settings.enableOptimizations ? "On" : "Off"}
									</span>
								</div>
								<div>
									<span className="text-main opacity-70">Device:</span>
									<span className="ml-1 text-accent">
										{shareData.deviceInfo.performanceLevel}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Share Actions */}
					<div className="flex items-center space-x-3">
						<button
							type="button"
							onClick={shareViaWebAPI}
							disabled={!shareURL}
							className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-main hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
						>
							<Share2 className="w-4 h-4" />
							<span className="text-sm">Share</span>
						</button>

						<button
							type="button"
							onClick={copyToClipboard}
							disabled={!shareURL}
							className="flex items-center space-x-2 px-4 py-2 border border-main hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
						>
							<Link className="w-4 h-4" />
							<span className="text-sm">Copy Link</span>
						</button>
					</div>

					{/* Social Share Buttons */}
					{shareURL && (
						<div className="space-y-2">
							<label className="noto-sans-jp-light text-sm text-main">
								Share on Social Media
							</label>
							<div className="grid grid-cols-3 gap-2">
								<a
									href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
										`Check out this interactive ${experiment.title} experiment!`,
									)}&url=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded text-sm"
								>
									Twitter
								</a>
								<a
									href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors rounded text-sm"
								>
									Facebook
								</a>
								<a
									href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded text-sm"
								>
									LinkedIn
								</a>
							</div>
						</div>
					)}

					{/* Privacy Notice */}
					<div className="text-xs text-main opacity-70 bg-base border border-main p-2 rounded">
						<p>
							共有リンクには実験設定とデバイス情報（性能レベル、WebGL対応状況）が含まれます。
							個人を特定できる情報は含まれません。
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

interface ShareButtonProps {
	experimentId: string;
	performanceSettings: PerformanceSettings;
	deviceCapabilities: DeviceCapabilities;
	className?: string;
}

export function ShareButton({
	experimentId,
	performanceSettings,
	deviceCapabilities,
	className = "",
}: ShareButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={`flex items-center space-x-2 px-3 py-2 border border-main hover:border-accent hover:text-accent transition-colors ${className}`}
			>
				<Share2 className="w-4 h-4" />
				<span className="text-sm">Share</span>
			</button>

			<ExperimentSharing
				experimentId={experimentId}
				performanceSettings={performanceSettings}
				deviceCapabilities={deviceCapabilities}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}
