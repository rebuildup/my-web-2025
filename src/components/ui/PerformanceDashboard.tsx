"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useBundleOptimization } from "@/lib/utils/bundle-optimization";
import { usePerformanceRegression } from "@/lib/utils/performance-regression";
import {
	CoreWebVitalsDisplay,
	PerformanceBudgetIndicator,
} from "./CoreWebVitalsMonitor";

interface PerformanceDashboardProps {
	className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
	className = "",
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"vitals" | "bundle" | "regression"
	>("vitals");

	const { getBundleInfo } = useBundleOptimization();
	const { getStatus } = usePerformanceRegression();

	const [bundleInfo, setBundleInfo] = useState(getBundleInfo());
	const [regressionStatus, setRegressionStatus] = useState(getStatus());

	useEffect(() => {
		const interval = setInterval(() => {
			setBundleInfo(getBundleInfo());
			setRegressionStatus(getStatus());
		}, 5000);

		return () => clearInterval(interval);
	}, [getBundleInfo, getStatus]);

	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	const formatSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};
	const bundleRecommendations = Array.from(new Set(bundleInfo.recommendations));

	return (
		<div className={`fixed bottom-4 right-4 z-50 ${className}`}>
			<button
				type="button"
				onClick={() => setIsVisible(!isVisible)}
				className="p-3"
				title="Performance Dashboard"
			>
				📊
			</button>

			{isVisible && (
				<div className="absolute bottom-16 right-0 w-96 max-h-96  rounded-lg   overflow-hidden">
					{/* Tab Navigation */}
					<div className="flex ">
						<button
							type="button"
							onClick={() => setActiveTab("vitals")}
							className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "vitals" ? " " : " "}`}
						>
							Core Web Vitals
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("bundle")}
							className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "bundle" ? " " : " "}`}
						>
							Bundle Info
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("regression")}
							className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "regression" ? " " : " "}`}
						>
							Regressions
						</button>
					</div>

					{/* Tab Content */}
					<div className="p-4 max-h-80 overflow-y-auto">
						{activeTab === "vitals" && (
							<div>
								<CoreWebVitalsDisplay showDetails={true} />
								<div className="mt-4">
									<PerformanceBudgetIndicator />
								</div>
							</div>
						)}

						{activeTab === "bundle" && (
							<div>
								<h3 className="text-lg font-semibold mb-3">Bundle Analysis</h3>

								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm font-medium">Total Size:</span>
										<span className="text-sm font-bold">
											{formatSize(bundleInfo.totalSize)}
										</span>
									</div>

									<div className="w-full  rounded-full h-2">
										<div
											className={`h-2 rounded-full ${
												bundleInfo.totalSize > 2 * 1024 * 1024
													? ""
													: bundleInfo.totalSize > 1 * 1024 * 1024
														? ""
														: ""
											}`}
											style={{
												width: `${Math.min((bundleInfo.totalSize / (3 * 1024 * 1024)) * 100, 100)}%`,
											}}
										/>
									</div>
								</div>

								<div className="mb-4">
									<h4 className="text-sm font-medium mb-2">Chunk Sizes:</h4>
									<div className="space-y-1 max-h-32 overflow-y-auto">
										{Object.entries(bundleInfo.chunkSizes)
											.sort(([, a], [, b]) => b - a)
											.slice(0, 10)
											.map(([name, size]) => (
												<div
													key={name}
													className="flex justify-between text-xs"
												>
													<span className="truncate mr-2" title={name}>
														{name}
													</span>
													<span className="font-mono">{formatSize(size)}</span>
												</div>
											))}
									</div>
								</div>

								{bundleRecommendations.length > 0 && (
									<div>
										<h4 className="text-sm font-medium mb-2">
											Recommendations:
										</h4>
										<ul className="text-xs space-y-1">
											{bundleRecommendations.slice(0, 3).map((rec) => (
												<li key={rec} className="flex items-start">
													<span className="mr-2">•</span>
													<span>{rec}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}

						{activeTab === "regression" && (
							<div>
								<h3 className="text-lg font-semibold mb-3">
									Performance Regressions
								</h3>

								{regressionStatus.regressions.length === 0 ? (
									<div className="text-center py-8">
										<div className=" text-2xl mb-2">✓</div>
										<p className="text-sm ">No regressions detected</p>
									</div>
								) : (
									<div className="space-y-3">
										{regressionStatus.regressions.map((regression) => {
											const regressionKey = `${regression.metric}-${regression.severity}-${Math.round(regression.regression)}`;
											const regressionRecommendations = Array.from(
												new Set(regression.recommendations),
											).slice(0, 2);
											return (
												<div
													key={regressionKey}
													className={`p-3 rounded-lg  ${
														regression.severity === "critical"
															? " "
															: regression.severity === "high"
																? " "
																: regression.severity === "medium"
																	? " "
																	: " "
													}`}
												>
													<div className="flex justify-between items-center mb-2">
														<span className="font-medium text-sm">
															{regression.metric.toUpperCase()}
														</span>
														<span
															className={`text-xs px-2 py-1 rounded ${
																regression.severity === "critical"
																	? " "
																	: regression.severity === "high"
																		? " "
																		: regression.severity === "medium"
																			? " "
																			: " "
															}`}
														>
															{regression.severity}
														</span>
													</div>

													<div className="text-xs  mb-2">
														Current: {Math.round(regression.current)} |
														Baseline: {Math.round(regression.baseline)} |
														Regression: +{regression.regression.toFixed(1)}%
													</div>

													{regressionRecommendations.length > 0 && (
														<div className="text-xs">
															<strong>Recommendations:</strong>
															<ul className="mt-1 space-y-1">
																{regressionRecommendations.map((rec) => (
																	<li
																		key={`${regression.metric}-${rec}`}
																		className="flex items-start"
																	>
																		<span className="mr-1">•</span>
																		<span>{rec}</span>
																	</li>
																))}
															</ul>
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}

								{regressionStatus.baseline && (
									<div className="mt-4 pt-4 ">
										<h4 className="text-sm font-medium mb-2">Baseline Info:</h4>
										<p className="text-xs ">
											Last updated:{" "}
											{new Date(
												regressionStatus.baseline.timestamp,
											).toLocaleString()}
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PerformanceDashboard;
