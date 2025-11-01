/**
 * Canvas Drawing Experiment
 * Interactive canvas drawing and painting
 */

"use client";

import type { ExperimentProps } from "@/types/playground";

export function CanvasDrawingExperiment({}: ExperimentProps) {
	return (
		<div className="aspect-video bg-base border border-main flex items-center justify-center">
			<div className="text-center space-y-2">
				<div className="text-lg text-accent">Canvas Drawing Experiment</div>
				<p className="text-sm text-main">Coming soon...</p>
			</div>
		</div>
	);
}
