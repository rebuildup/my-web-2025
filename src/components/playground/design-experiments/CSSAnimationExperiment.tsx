/**
 * CSS Animation Experiment
 * Interactive CSS animations and transitions
 */

"use client";

import { ExperimentProps } from "@/types/playground";

export function CSSAnimationExperiment({}: ExperimentProps) {
  return (
    <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="text-lg text-accent">CSS Animation Experiment</div>
        <p className="text-sm text-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
