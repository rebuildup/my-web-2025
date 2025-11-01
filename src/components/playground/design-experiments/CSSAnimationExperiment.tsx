/**
 * CSS Animation Experiment
 * Interactive CSS animations and transitions
 */

"use client";

import type { ExperimentProps } from "@/types/playground";

export function CSSAnimationExperiment({}: ExperimentProps) {
	return (
		<div className="aspect-video bg-base border border-main flex items-center justify-center">
			<div className="text-center space-y-2">
				<div className="text-lg text-accent">CSS Animation Experiment</div>
				<p className="text-sm text-main">Coming soon...</p>
			</div>
		</div>
	);
}
