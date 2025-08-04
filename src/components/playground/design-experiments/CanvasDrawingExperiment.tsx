/**
 * Canvas Drawing Experiment
 * Interactive canvas drawing and painting
 */

"use client";

import { ExperimentProps } from "@/types/playground";

export function CanvasDrawingExperiment({}: ExperimentProps) {
  return (
    <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="text-lg text-accent">Canvas Drawing Experiment</div>
        <p className="text-sm text-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
