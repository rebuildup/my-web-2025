/**
 * Experiment Loader Component
 * Handles dynamic loading of playground experiments with loading states
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { playgroundManager } from "@/lib/playground/playground-manager";
import type {
	DeviceCapabilities,
	ExperimentItem,
	ExperimentProps,
	PerformanceMetrics,
	PerformanceSettings,
	PlaygroundError,
} from "@/types/playground";
import { PlaygroundErrorHandler } from "./PlaygroundErrorHandler";

interface ExperimentLoaderProps {
	experimentId: string;
	deviceCapabilities: DeviceCapabilities;
	performanceSettings: PerformanceSettings;
	onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
	onError?: (error: PlaygroundError) => void;
	className?: string;
}

export function ExperimentLoader({
	experimentId,
	deviceCapabilities,
	performanceSettings,
	onPerformanceUpdate,
	onError,
	className = "",
}: ExperimentLoaderProps) {
	const [experiment, setExperiment] = useState<ExperimentItem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<PlaygroundError | null>(null);
	const [ExperimentComponent, setExperimentComponent] =
		useState<React.ComponentType<ExperimentProps> | null>(null);

	const loadExperiment = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Get experiment from manager
			const exp = playgroundManager.getExperiment(experimentId);
			if (!exp) {
				const notFoundError: PlaygroundError = {
					type: "runtime",
					message: `Experiment "${experimentId}" not found`,
					details: `The experiment with ID "${experimentId}" could not be found in the playground manager.`,
					recoverable: true,
				};
				setError(notFoundError);
				if (onError) {
					onError(notFoundError);
				}
				playgroundManager.addError(notFoundError);
				setIsLoading(false);
				return;
			}

			// Check compatibility
			const compatibility = playgroundManager.isExperimentCompatible(
				experimentId,
				deviceCapabilities,
			);

			if (!compatibility.compatible) {
				const compatibilityError: PlaygroundError = {
					type: "compatibility",
					message: `This experiment is not compatible with your device: ${compatibility.reason}`,
					details: `Experiment: ${exp.title}\nReason: ${compatibility.reason}`,
					recoverable: false,
				};
				setError(compatibilityError);
				if (onError) {
					onError(compatibilityError);
				}
				setIsLoading(false);
				return;
			}

			// Set experiment data
			setExperiment(exp);
			setExperimentComponent(() => exp.component);

			// Add to playground manager error log if needed
			playgroundManager.clearErrors();
			setIsLoading(false);
		} catch (err) {
			let errorMessage = "Failed to load experiment";
			let errorDetails: string | undefined = undefined;
			if (err instanceof Error) {
				errorMessage = err.message;
				errorDetails = err.stack;
			}
			const loadError: PlaygroundError = {
				type: "runtime",
				message: errorMessage,
				details: errorDetails,
				recoverable: true,
			};
			setError(loadError);
			if (onError) {
				onError(loadError);
			}
			playgroundManager.addError(loadError);
			setIsLoading(false);
		}
	}, [experimentId, deviceCapabilities, onError]);

	const handleRetry = useCallback(() => {
		loadExperiment();
	}, [loadExperiment]);

	const handleExperimentError = useCallback(
		(experimentError: Error) => {
			const runtimeError: PlaygroundError = {
				type: "runtime",
				message: `Experiment runtime error: ${experimentError.message}`,
				details: experimentError.stack,
				recoverable: true,
			};
			setError(runtimeError);
			onError?.(runtimeError);
			playgroundManager.addError(runtimeError);
		},
		[onError],
	);

	// Load experiment on mount or when experimentId changes
	useEffect(() => {
		loadExperiment();
	}, [loadExperiment]);

	// Loading state
	if (isLoading) {
		return (
			<div className={`flex items-center justify-center py-12 ${className}`}>
				<div className="text-center space-y-4">
					<Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
					<div className="space-y-2">
						<p className="noto-sans-jp-light text-sm text-main">
							実験を読み込み中...
						</p>
						<p className="text-xs text-main opacity-70">{experimentId}</p>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={className}>
				<PlaygroundErrorHandler
					error={error}
					onRetry={error.recoverable ? handleRetry : undefined}
					onDismiss={() => setError(null)}
				/>
			</div>
		);
	}

	// Experiment not found
	if (!experiment || !ExperimentComponent) {
		return (
			<div className={`flex items-center justify-center py-12 ${className}`}>
				<div className="text-center space-y-4">
					<AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto" />
					<div className="space-y-2">
						<p className="noto-sans-jp-light text-sm text-main">
							実験が見つかりません
						</p>
						<p className="text-xs text-main opacity-70">ID: {experimentId}</p>
					</div>
					<button
						type="button"
						onClick={handleRetry}
						className="px-4 py-2 border border-main hover:border-accent hover:text-accent transition-colors text-sm"
					>
						再試行
					</button>
				</div>
			</div>
		);
	}

	// Render experiment
	return (
		<div className={className}>
			<ExperimentComponent
				isActive={true}
				deviceCapabilities={deviceCapabilities}
				performanceSettings={performanceSettings}
				onPerformanceUpdate={onPerformanceUpdate}
				onError={handleExperimentError}
			/>
		</div>
	);
}

interface ExperimentPreloaderProps {
	experimentIds: string[];
	onPreloadComplete?: (loadedCount: number, totalCount: number) => void;
}

export function ExperimentPreloader({
	experimentIds,
	onPreloadComplete,
}: ExperimentPreloaderProps) {
	const [loadedCount, setLoadedCount] = useState(0);
	const [isPreloading, setIsPreloading] = useState(false);

	const preloadExperiments = useCallback(async () => {
		setIsPreloading(true);
		setLoadedCount(0);

		let loaded = 0;
		for (const experimentId of experimentIds) {
			try {
				// Simulate preloading by checking if experiment exists
				const experiment = playgroundManager.getExperiment(experimentId);
				if (experiment) {
					loaded++;
					setLoadedCount(loaded);
				}

				// Small delay to show progress
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.warn(`Failed to preload experiment ${experimentId}:`, error);
			}
		}

		setIsPreloading(false);
		onPreloadComplete?.(loaded, experimentIds.length);
	}, [experimentIds, onPreloadComplete]);

	useEffect(() => {
		if (experimentIds.length > 0) {
			preloadExperiments();
		}
	}, [preloadExperiments, experimentIds.length]);

	if (!isPreloading && loadedCount === 0) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 bg-base border border-main p-3 rounded-lg shadow-lg z-50">
			<div className="flex items-center space-x-3">
				{isPreloading && (
					<Loader2 className="w-4 h-4 animate-spin text-accent" />
				)}
				<div className="text-sm">
					<div className="text-main">
						{isPreloading ? "Preloading experiments..." : "Preload complete"}
					</div>
					<div className="text-xs text-main opacity-70">
						{loadedCount} / {experimentIds.length}
					</div>
				</div>
			</div>
			{isPreloading && (
				<div className="mt-2 w-32 h-1 bg-base border border-main rounded-full overflow-hidden">
					<div
						className="h-full bg-accent transition-all duration-300"
						style={{
							width: `${(loadedCount / experimentIds.length) * 100}%`,
						}}
					/>
				</div>
			)}
		</div>
	);
}
