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
		<div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
			<div className="  max-w-md w-full mx-4 rounded-lg">
				{/* Header */}
				<div className="flex items-center justify-between p-4  ">
					<h3 className="zen-kaku-gothic-new text-lg flex items-center">
						<Share2 className="w-5 h-5 mr-2" />
						Share Experiment
					</h3>
					<button type="button" onClick={onClose} className="">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* Experiment Info */}
					<div className="  p-3 rounded">
						<h4 className="font-medium ">{experiment.title}</h4>
						<p className="text-sm mt-1">{experiment.description}</p>
						<div className="flex flex-wrap gap-1 mt-2">
							<span className="text-xs  px-2 py-1 rounded">
								{experiment.category}
							</span>
							<span className="text-xs  px-2 py-1 rounded">
								{experiment.difficulty}
							</span>
							<span className="text-xs  px-2 py-1 rounded">
								{performanceSettings.qualityLevel} quality
							</span>
						</div>
					</div>

					{/* Share URL */}
					{isGenerating ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin w-6 h-6   border-t-transparent rounded-full"></div>
							<span className="ml-2 text-sm ">Generating share link...</span>
						</div>
					) : shareURL ? (
						<div className="space-y-3">
							<label className="noto-sans-jp-light text-sm ">Share Link</label>
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={shareURL}
									readOnly
									className="flex-1 p-2 text-sm"
								/>
								<button
									type="button"
									onClick={copyToClipboard}
									className="flex items-center space-x-1 px-3 py-2"
								>
									{copied ? (
										<Check className="w-4 h-4 " />
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
						<div className="  p-3 rounded">
							<h5 className="font-medium mb-2">Shared Settings</h5>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<span className=" ">Quality:</span>
									<span className="ml-1 ">
										{shareData.settings.qualityLevel}
									</span>
								</div>
								<div>
									<span className=" ">Target FPS:</span>
									<span className="ml-1 ">{shareData.settings.targetFPS}</span>
								</div>
								<div>
									<span className=" ">Optimizations:</span>
									<span className="ml-1 ">
										{shareData.settings.enableOptimizations ? "On" : "Off"}
									</span>
								</div>
								<div>
									<span className=" ">Device:</span>
									<span className="ml-1 ">
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
							className="flex-1 flex items-center justify-center space-x-2 px-4 py-2"
						>
							<Share2 className="w-4 h-4" />
							<span className="text-sm">Share</span>
						</button>

						<button
							type="button"
							onClick={copyToClipboard}
							disabled={!shareURL}
							className="flex items-center space-x-2 px-4 py-2"
						>
							<Link className="w-4 h-4" />
							<span className="text-sm">Copy Link</span>
						</button>
					</div>

					{/* Social Share Buttons */}
					{shareURL && (
						<div className="space-y-2">
							<label className="noto-sans-jp-light text-sm ">
								Share on Social Media
							</label>
							<div className="grid grid-cols-3 gap-2">
								<a
									href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
										`Check out this interactive ${experiment.title} experiment!`,
									)}&url=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2    transition-colors rounded text-sm"
								>
									Twitter
								</a>
								<a
									href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2    transition-colors rounded text-sm"
								>
									Facebook
								</a>
								<a
									href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center px-3 py-2    transition-colors rounded text-sm"
								>
									LinkedIn
								</a>
							</div>
						</div>
					)}

					{/* Privacy Notice */}
					<div className="text-xs   p-2 rounded">
						<p>
							共有リンクには実験設定とデバイス情報（性能レベル、WebGL対応状況）が含まれます.
							個人を特定できる情報は含まれません.
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
				className={`flex items-center space-x-2 px-3 py-2 ${className}`}
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
