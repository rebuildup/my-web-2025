/**
 * Loading Components for Playground
 * Reusable loading indicators for experiments
 */

export const ExperimentLoading = () => (
  <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
      <p className="text-sm text-foreground">Loading experiment...</p>
    </div>
  </div>
);

export const WebGLLoading = () => (
  <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-accent/20 rounded mx-auto mb-2"></div>
      </div>
      <p className="text-sm text-foreground">Initializing WebGL...</p>
      <p className="text-xs text-foreground/70">Loading shaders and textures</p>
    </div>
  </div>
);
