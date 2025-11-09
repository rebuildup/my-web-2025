"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

// Import types from utility modules
import type { CoreWebVitalsMetrics } from "@/lib/utils/core-web-vitals";

// Local interface for performance alerts
export interface PerformanceAlert {
	id: string;
	message: string;
	severity: "low" | "medium" | "high";
	timestamp: number;
}

interface PerformanceReport {
	performance: {
		summary: {
			totalAlerts: number;
			errorCount: number;
			warningCount: number;
			infoCount: number;
		};
		alerts: PerformanceAlert[];
		recommendations: string[];
	};
	budget: Record<
		string,
		{
			exceeded: boolean;
			usage: number;
			budget: number;
			percentage: number;
		}
	>;
	timestamp: number;
}

interface PerformanceContextType {
	isOnline: boolean;
	performanceScore: number;
	memoryUsage: number;
	serviceWorkerStatus: "loading" | "ready" | "error";
	alerts: PerformanceAlert[];
	coreWebVitals: CoreWebVitalsMetrics;
	clearCache: () => Promise<void>;
	generateReport: () => PerformanceReport | null;
	runPerformanceTest: () => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
	const context = useContext(PerformanceContext);
	if (!context) {
		throw new Error("usePerformance must be used within a PerformanceProvider");
	}
	return context;
};

interface PerformanceProviderProps {
	children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
	children,
}) => {
	const [isOnline, setIsOnline] = useState(true);
	const [performanceScore] = useState(100);
	const [memoryUsage, setMemoryUsage] = useState(0);
	const [serviceWorkerStatus] = useState<"loading" | "ready" | "error">(
		"ready",
	);
	const [alerts] = useState<PerformanceAlert[]>([]);
	const [coreWebVitals] = useState<CoreWebVitalsMetrics>({
		lcp: null,
		fid: null,
		cls: null,
		inp: null,
		ttfb: null,
		fcp: null,
	});

	useEffect(() => {
		// Ensure we're on the client side
		if (typeof window === "undefined") return;

		// Basic initialization
		setIsOnline(navigator.onLine);

		// Basic online/offline monitoring
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Basic memory monitoring
		const memoryInterval = setInterval(() => {
			if (typeof window !== "undefined" && "memory" in performance) {
				const memory = (
					performance as Performance & {
						memory: {
							usedJSHeapSize: number;
							jsHeapSizeLimit: number;
						};
					}
				).memory;
				const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
				setMemoryUsage(usage);
			}
		}, 10000);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			clearInterval(memoryInterval);
		};
	}, []);

	const clearCache = async () => {
		if (typeof window !== "undefined" && "caches" in window) {
			const cacheNames = await caches.keys();
			await Promise.all((cacheNames || []).map((name) => caches.delete(name)));
			window.location.reload();
		}
	};

	const generateReport = () => {
		return {
			performance: {
				summary: {
					totalAlerts: alerts.length,
					errorCount: alerts.filter((a) => a.severity === "high").length,
					warningCount: alerts.filter((a) => a.severity === "medium").length,
					infoCount: alerts.filter((a) => a.severity === "low").length,
				},
				alerts,
				recommendations: [],
			},
			budget: {},
			timestamp: Date.now(),
		};
	};

	const runPerformanceTest = async () => {
		if (process.env.NODE_ENV === "development") {
			console.log("Performance test - simplified mode");
		}
	};

	const value: PerformanceContextType = {
		isOnline,
		performanceScore,
		memoryUsage,
		serviceWorkerStatus,
		alerts,
		coreWebVitals,
		clearCache,
		generateReport,
		runPerformanceTest,
	};

	return (
		<PerformanceContext.Provider value={value}>
			{children}

			{/* Performance indicators (development only) */}
			{process.env.NODE_ENV === "development" && <PerformanceIndicators />}

			{/* Offline indicator */}
			{!isOnline && (
				<div
					id="offline-indicator"
					className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50"
				>
					オフラインモード - 一部の機能が制限されています
				</div>
			)}
		</PerformanceContext.Provider>
	);
};

// Performance indicators for development
const PerformanceIndicators: React.FC = () => {
	const {
		performanceScore,
		memoryUsage,
		serviceWorkerStatus,
		alerts,
		coreWebVitals,
		runPerformanceTest,
	} = usePerformance();
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<button
				type="button"
				onClick={() => setIsVisible(!isVisible)}
				className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
				title="Performance Monitor"
			>
				📊
			</button>

			{isVisible && (
				<div className="absolute bottom-12 right-0 bg-white text-black p-4 rounded-lg shadow-xl min-w-64 max-w-80">
					<h3 className="font-bold mb-2">Performance Monitor</h3>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Score:</span>
							<span
								className={
									performanceScore >= 80
										? "text-green-600"
										: performanceScore >= 60
											? "text-yellow-600"
											: "text-red-600"
								}
							>
								{performanceScore}/100
							</span>
						</div>

						<div className="flex justify-between">
							<span>Memory:</span>
							<span
								className={
									memoryUsage < 70
										? "text-green-600"
										: memoryUsage < 85
											? "text-yellow-600"
											: "text-red-600"
								}
							>
								{memoryUsage.toFixed(1)}%
							</span>
						</div>

						<div className="flex justify-between">
							<span>Service Worker:</span>
							<span
								className={
									serviceWorkerStatus === "ready"
										? "text-green-600"
										: serviceWorkerStatus === "loading"
											? "text-yellow-600"
											: "text-red-600"
								}
							>
								{serviceWorkerStatus}
							</span>
						</div>

						{/* Core Web Vitals */}
						<div className="pt-2 border-t">
							<div className="text-xs font-semibold mb-1">Core Web Vitals</div>
							<div className="space-y-1 text-xs">
								<div className="flex justify-between">
									<span>LCP:</span>
									<span
										className={
											coreWebVitals.lcp && coreWebVitals.lcp <= 2500
												? "text-green-600"
												: "text-red-600"
										}
									>
										{coreWebVitals.lcp
											? `${Math.round(coreWebVitals.lcp)}ms`
											: "N/A"}
									</span>
								</div>
								<div className="flex justify-between">
									<span>FID:</span>
									<span
										className={
											coreWebVitals.fid && coreWebVitals.fid <= 100
												? "text-green-600"
												: "text-red-600"
										}
									>
										{coreWebVitals.fid
											? `${Math.round(coreWebVitals.fid)}ms`
											: "N/A"}
									</span>
								</div>
								<div className="flex justify-between">
									<span>CLS:</span>
									<span
										className={
											coreWebVitals.cls && coreWebVitals.cls <= 0.1
												? "text-green-600"
												: "text-red-600"
										}
									>
										{coreWebVitals.cls ? coreWebVitals.cls.toFixed(3) : "N/A"}
									</span>
								</div>
							</div>
						</div>

						{/* Performance Test Button */}
						<div className="pt-2 border-t">
							<button
								type="button"
								onClick={runPerformanceTest}
								className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
							>
								Run Performance Test
							</button>
						</div>

						{alerts.length > 0 && (
							<div className="mt-2 pt-2 border-t">
								<div className="text-xs text-red-600">
									{alerts.length} alert{alerts.length !== 1 ? "s" : ""}
								</div>
								<div className="max-h-20 overflow-y-auto">
									{alerts.slice(-3).map((alert) => (
										<div
											key={alert.id}
											className="text-xs text-gray-600 truncate"
										>
											{alert.message}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
