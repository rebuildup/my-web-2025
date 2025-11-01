/**
 * Custom hook for offline functionality and performance optimization in tools
 * Implements task 8.7.2 requirements for offline functionality and performance
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
	computationOptimization,
	dataPersistence,
	offlineUtils,
	performanceMonitoring,
} from "@/lib/utils/performance";

interface OfflinePerformanceState {
	isOnline: boolean;
	isProcessing: boolean;
	processingProgress: number;
	storageUsage: {
		used: number;
		available: number;
		percentage: number;
	};
	performanceMetrics: {
		memoryUsage: { used: number; total: number; percentage: number } | null;
		lastProcessingTime: number;
	};
	error: string | null;
}

interface UseOfflinePerformanceOptions {
	toolName: string;
	enablePerformanceMonitoring?: boolean;
	enableOfflineNotifications?: boolean;
	autoSaveSettings?: boolean;
	processingChunkSize?: number;
}

export function useOfflinePerformance(options: UseOfflinePerformanceOptions) {
	const {
		toolName,
		enablePerformanceMonitoring = true,
		enableOfflineNotifications = true,
		autoSaveSettings = true,
		processingChunkSize = 100,
	} = options;

	const [state, setState] = useState<OfflinePerformanceState>({
		isOnline: true,
		isProcessing: false,
		processingProgress: 0,
		storageUsage: { used: 0, available: 0, percentage: 0 },
		performanceMetrics: {
			memoryUsage: null,
			lastProcessingTime: 0,
		},
		error: null,
	});

	const processingRef = useRef<AbortController | null>(null);

	// Initialize offline status and monitoring
	useEffect(() => {
		setState((prev) => ({
			...prev,
			isOnline: offlineUtils.isOnline(),
			storageUsage: dataPersistence.getStorageInfo(),
		}));

		// Listen for connection changes
		const cleanup = offlineUtils.onConnectionChange((isOnline) => {
			setState((prev) => ({ ...prev, isOnline }));

			if (enableOfflineNotifications) {
				if (!isOnline) {
					offlineUtils.showOfflineNotification(
						`${toolName}はオフラインモードで動作中です`,
					);
				} else {
					offlineUtils.hideOfflineNotification();
				}
			}
		});

		return cleanup;
	}, [toolName, enableOfflineNotifications]);

	// Performance monitoring
	useEffect(() => {
		if (!enablePerformanceMonitoring) return;

		const interval = setInterval(() => {
			const memoryUsage = performanceMonitoring.getMemoryUsage();
			const storageUsage = dataPersistence.getStorageInfo();

			setState((prev) => ({
				...prev,
				performanceMetrics: {
					...prev.performanceMetrics,
					memoryUsage,
				},
				storageUsage,
			}));
		}, 5000); // Update every 5 seconds

		return () => clearInterval(interval);
	}, [enablePerformanceMonitoring]);

	// Save settings to localStorage
	const saveSettings = useCallback(
		(settings: Record<string, unknown>) => {
			const key = `tool-${toolName}-settings`;
			const success = dataPersistence.setItem(key, settings);

			if (!success) {
				setState((prev) => ({
					...prev,
					error: "設定の保存に失敗しました",
				}));
			}

			return success;
		},
		[toolName],
	);

	// Load settings from localStorage
	const loadSettings = useCallback(
		<T = Record<string, unknown>>(defaultSettings: T): T => {
			const key = `tool-${toolName}-settings`;
			const saved = dataPersistence.getItem<T>(key, defaultSettings);
			return saved || defaultSettings;
		},
		[toolName],
	);

	// Process data in chunks to prevent UI blocking
	const processInChunks = useCallback(
		async <T, R>(
			items: T[],
			processor: (item: T, index: number) => R,
			options?: {
				chunkSize?: number;
				onProgress?: (progress: number) => void;
				signal?: AbortSignal;
			},
		): Promise<R[]> => {
			const {
				chunkSize = processingChunkSize,
				onProgress,
				signal,
			} = options || {};

			// Create abort controller if not provided
			if (!processingRef.current) {
				processingRef.current = new AbortController();
			}

			const abortSignal = signal || processingRef.current.signal;

			setState((prev) => ({
				...prev,
				isProcessing: true,
				processingProgress: 0,
				error: null,
			}));

			try {
				const startTime = performance.now();

				const results = await computationOptimization.processInChunks(
					items,
					processor,
					chunkSize,
					(progress) => {
						if (abortSignal.aborted) {
							throw new Error("Processing aborted");
						}

						setState((prev) => ({ ...prev, processingProgress: progress }));
						onProgress?.(progress);
					},
				);

				const endTime = performance.now();
				const processingTime = endTime - startTime;

				setState((prev) => ({
					...prev,
					isProcessing: false,
					processingProgress: 100,
					performanceMetrics: {
						...prev.performanceMetrics,
						lastProcessingTime: processingTime,
					},
				}));

				return results;
			} catch (error) {
				setState((prev) => ({
					...prev,
					isProcessing: false,
					processingProgress: 0,
					error:
						error instanceof Error
							? error.message
							: "処理中にエラーが発生しました",
				}));
				throw error;
			}
		},
		[processingChunkSize],
	);

	// Cancel current processing
	const cancelProcessing = useCallback(() => {
		if (processingRef.current) {
			processingRef.current.abort();
			processingRef.current = null;
		}

		setState((prev) => ({
			...prev,
			isProcessing: false,
			processingProgress: 0,
		}));
	}, []);

	// Process files locally (for file-based tools)
	const processFileLocally = useCallback(
		async (
			file: File,
			processor: (file: File) => Promise<unknown>,
		): Promise<unknown> => {
			if (!state.isOnline) {
				// Ensure file processing works offline
				try {
					return await processor(file);
				} catch (error) {
					setState((prev) => ({
						...prev,
						error: "オフラインでのファイル処理に失敗しました",
					}));
					throw error;
				}
			}

			return processor(file);
		},
		[state.isOnline],
	);

	// Clear tool data
	const clearData = useCallback(() => {
		dataPersistence.clearToolData(toolName);
		setState((prev) => ({
			...prev,
			storageUsage: dataPersistence.getStorageInfo(),
		}));
	}, [toolName]);

	// Clear error state
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Optimize heavy computation with Web Workers (if available)
	const optimizeComputation = useCallback(
		async <T, R>(data: T, workerScript?: string): Promise<R> => {
			if (workerScript && typeof Worker !== "undefined") {
				try {
					return await computationOptimization.useWebWorker<T, R>(
						workerScript,
						data,
					);
				} catch (error) {
					console.warn("Web Worker failed, falling back to main thread", error);
					// Fallback to main thread processing would be implemented by the caller
					throw error;
				}
			}

			throw new Error("Web Worker not available or script not provided");
		},
		[],
	);

	// Auto-save settings when they change
	useEffect(() => {
		if (autoSaveSettings) {
			// This would be called by the tool component when settings change
			// The actual implementation depends on the specific tool
		}
	}, [autoSaveSettings]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (processingRef.current) {
				processingRef.current.abort();
			}

			if (enableOfflineNotifications) {
				offlineUtils.hideOfflineNotification();
			}
		};
	}, [enableOfflineNotifications]);

	return {
		// State
		...state,

		// Settings management
		saveSettings,
		loadSettings,

		// Processing utilities
		processInChunks,
		cancelProcessing,
		processFileLocally,
		optimizeComputation,

		// Data management
		clearData,
		clearError,

		// Performance utilities
		measureTime: (fn: () => unknown) => {
			const result = performanceMonitoring.measureTime(fn);
			return {
				result: result.result,
				time: result.duration,
			};
		},
	};
}

export default useOfflinePerformance;
