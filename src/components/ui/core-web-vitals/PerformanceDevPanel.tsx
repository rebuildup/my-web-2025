"use client";

/**
 * Development-only floating performance panel that toggles the Core Web Vitals display.
 */
import type React from "react";
import { useState } from "react";
import { CoreWebVitalsDisplay } from "../CoreWebVitalsMonitor";
import { PerformanceBudgetIndicator } from "./PerformanceBudgetIndicator";

export const PerformanceDevPanel: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-4 z-50">
			<button
				type="button"
				onClick={() => setIsVisible(!isVisible)}
				className="p-2"
				title="Performance Monitor"
			>
				⚡
			</button>

			{isVisible && (
				<div className="absolute bottom-12 left-0 w-96 max-h-96 overflow-y-auto">
					<CoreWebVitalsDisplay showDetails={true} />
					<div className="mt-2">
						<PerformanceBudgetIndicator />
					</div>
				</div>
			)}
		</div>
	);
};
