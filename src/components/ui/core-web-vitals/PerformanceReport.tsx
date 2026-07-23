"use client";

/**
 * Performance report subcomponent shown beneath the detailed Core Web Vitals panel.
 */
import type React from "react";
import { useEffect, useState } from "react";
import type { PerformanceRegressionDetector } from "@/lib/utils/performance-regression";

interface PerformanceReportProps {
	detector: PerformanceRegressionDetector;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
	detector,
}) => {
	const [status, setStatus] = useState(detector.getPerformanceStatus());

	useEffect(() => {
		const interval = setInterval(() => {
			setStatus(detector.getPerformanceStatus());
		}, 5000);

		return () => clearInterval(interval);
	}, [detector]);

	const score =
		status.regressions.length === 0
			? 100
			: Math.max(0, 100 - status.regressions.length * 20);

	return (
		<div className=" pt-4">
			<div className="flex items-center justify-between mb-3">
				<h4 className="text-md font-medium ">Performance Score</h4>
				<div
					className={`text-2xl font-bold ${
						score >= 90 ? "" : score >= 70 ? "" : ""
					}`}
				>
					{score}/100
				</div>
			</div>

			{status.regressions.length > 0 && (
				<div className="   rounded-lg p-3">
					<h5 className="text-sm font-medium  mb-2">
						Performance Issues ({status.regressions.length})
					</h5>
					<ul className="text-sm  space-y-1">
						{status.regressions.map((regression) => {
							const regressionKey = `${regression.metric}-${regression.regression.toFixed(1)}`;
							return (
								<li key={regressionKey} className="flex items-start">
									<span className="mr-2">•</span>
									<span>
										{regression.metric}: {regression.regression.toFixed(1)}%
										regression
									</span>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
};
