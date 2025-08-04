/**
 * Dynamic Loader for Playground Components
 * Code splitting and lazy loading for playground experiments
 * Task 3.2: コード分割・バンドル最適化
 */

import {
  ExperimentLoading,
  WebGLLoading,
} from "@/components/playground/common/LoadingComponents";
import { ExperimentProps } from "@/types/playground";
import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Design experiment dynamic imports
export const DynamicCSSAnimationExperiment = dynamic(
  () =>
    import(
      "@/components/playground/design-experiments/CSSAnimationExperiment"
    ).then((mod) => ({ default: mod.CSSAnimationExperiment })),
  {
    loading: ExperimentLoading,
    ssr: false, // Design experiments don't need SSR
  },
) as ComponentType<ExperimentProps>;

export const DynamicSVGInteractionExperiment = dynamic(
  () =>
    import(
      "@/components/playground/design-experiments/SVGInteractionExperiment"
    ).then((mod) => ({ default: mod.SVGInteractionExperiment })),
  {
    loading: ExperimentLoading,
    ssr: false,
  },
);

export const DynamicCanvasDrawingExperiment = dynamic(
  () =>
    import(
      "@/components/playground/design-experiments/CanvasDrawingExperiment"
    ).then((mod) => ({ default: mod.CanvasDrawingExperiment })),
  {
    loading: ExperimentLoading,
    ssr: false,
  },
);

export const DynamicGenerativeArtExperiment = dynamic(
  () =>
    import(
      "@/components/playground/design-experiments/GenerativeArtExperiment"
    ).then((mod) => ({ default: mod.GenerativeArtExperiment })),
  {
    loading: ExperimentLoading,
    ssr: false,
  },
);

// WebGL experiment dynamic imports with heavier loading indicators
export const DynamicShaderExperiment = dynamic(
  () =>
    import("@/components/playground/webgl-experiments/ShaderExperiment").then(
      (mod) => ({ default: mod.ShaderExperiment }),
    ),
  {
    loading: WebGLLoading,
    ssr: false, // WebGL experiments never need SSR
  },
);

export const DynamicParticleSystemExperiment = dynamic(
  () =>
    import(
      "@/components/playground/webgl-experiments/ParticleSystemExperiment"
    ).then((mod) => ({ default: mod.ParticleSystemExperiment })),
  {
    loading: WebGLLoading,
    ssr: false,
  },
);

export const DynamicPhysicsSimulationExperiment = dynamic(
  () =>
    import(
      "@/components/playground/webgl-experiments/PhysicsSimulationExperiment"
    ).then((mod) => ({ default: mod.PhysicsSimulationExperiment })),
  {
    loading: WebGLLoading,
    ssr: false,
  },
);

// Three.js library dynamic import
export const loadThreeJS = async () => {
  const THREE = await import("three");
  return THREE;
};

// WebGL utility libraries dynamic imports
export const loadWebGLUtils = async () => {
  const [THREE, stats] = await Promise.all([
    import("three"),
    import("three/examples/jsm/libs/stats.module.js"),
  ]);

  return {
    THREE,
    Stats: stats.default,
  };
};

// Advanced WebGL libraries (loaded only when needed)
export const loadAdvancedWebGL = async () => {
  const [
    { OrbitControls },
    { EffectComposer },
    { RenderPass },
    { UnrealBloomPass },
    { ShaderPass },
  ] = await Promise.all([
    import("three/examples/jsm/controls/OrbitControls.js"),
    import("three/examples/jsm/postprocessing/EffectComposer.js"),
    import("three/examples/jsm/postprocessing/RenderPass.js"),
    import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
    import("three/examples/jsm/postprocessing/ShaderPass.js"),
  ]);

  return {
    OrbitControls,
    EffectComposer,
    RenderPass,
    UnrealBloomPass,
    ShaderPass,
  };
};

// Physics libraries (loaded only for physics experiments)
export const loadPhysicsLibraries = async () => {
  // Physics libraries are optional dependencies
  // Uncomment when cannon-es and ammo.js are installed
  /*
  try {
    const [cannon, ammo] = await Promise.all([
      import("cannon-es").catch(() => null), // Optional dependency
      import("ammo.js").catch(() => null), // Optional dependency
    ]);

    return {
      CANNON: cannon?.default || null,
      Ammo: ammo?.default || null,
    };
  } catch (error) {
    console.warn("Physics libraries not available:", error);
  }
  */

  return {
    CANNON: null,
    Ammo: null,
  };
};

// Experiment component registry
type ExperimentComponent = ComponentType<ExperimentProps>;

interface ExperimentRegistry {
  [key: string]: {
    component: ExperimentComponent;
    category: "design" | "webgl";
    dependencies: string[];
    bundleSize: number; // Estimated size in KB
  };
}

export const experimentRegistry: ExperimentRegistry = {
  "css-animation": {
    component: DynamicCSSAnimationExperiment,
    category: "design",
    dependencies: [],
    bundleSize: 15,
  },
  "svg-interaction": {
    component: DynamicSVGInteractionExperiment,
    category: "design",
    dependencies: [],
    bundleSize: 20,
  },
  "canvas-drawing": {
    component: DynamicCanvasDrawingExperiment,
    category: "design",
    dependencies: [],
    bundleSize: 25,
  },
  "generative-art": {
    component: DynamicGenerativeArtExperiment,
    category: "design",
    dependencies: [],
    bundleSize: 30,
  },
  "shader-experiment": {
    component: DynamicShaderExperiment,
    category: "webgl",
    dependencies: ["three"],
    bundleSize: 120,
  },
  "particle-system": {
    component: DynamicParticleSystemExperiment,
    category: "webgl",
    dependencies: ["three"],
    bundleSize: 100,
  },
  "physics-simulation": {
    component: DynamicPhysicsSimulationExperiment,
    category: "webgl",
    dependencies: ["three", "cannon"],
    bundleSize: 200,
  },
};

/**
 * Get experiment component with lazy loading
 */
export function getExperimentComponent(
  experimentId: string,
): ExperimentComponent | null {
  const experiment = experimentRegistry[experimentId];
  return experiment?.component || null;
}

/**
 * Preload experiment dependencies
 */
export async function preloadExperimentDependencies(
  experimentId: string,
): Promise<void> {
  const experiment = experimentRegistry[experimentId];
  if (!experiment) return;

  const loadPromises: Promise<unknown>[] = [];

  // Load dependencies based on experiment requirements
  if (experiment.dependencies.includes("three")) {
    loadPromises.push(loadThreeJS());
  }

  if (experiment.dependencies.includes("cannon")) {
    loadPromises.push(loadPhysicsLibraries());
  }

  if (experiment.category === "webgl") {
    loadPromises.push(loadWebGLUtils());
  }

  await Promise.all(loadPromises);
}

/**
 * Get bundle size information
 */
export function getBundleSizeInfo(): {
  totalExperiments: number;
  totalBundleSize: number;
  designBundleSize: number;
  webglBundleSize: number;
  averageBundleSize: number;
} {
  const experiments = Object.values(experimentRegistry);
  const totalBundleSize = experiments.reduce(
    (sum, exp) => sum + exp.bundleSize,
    0,
  );
  const designExperiments = experiments.filter(
    (exp) => exp.category === "design",
  );
  const webglExperiments = experiments.filter(
    (exp) => exp.category === "webgl",
  );

  return {
    totalExperiments: experiments.length,
    totalBundleSize,
    designBundleSize: designExperiments.reduce(
      (sum, exp) => sum + exp.bundleSize,
      0,
    ),
    webglBundleSize: webglExperiments.reduce(
      (sum, exp) => sum + exp.bundleSize,
      0,
    ),
    averageBundleSize: totalBundleSize / experiments.length,
  };
}

/**
 * Preload critical experiments (shown first)
 */
export async function preloadCriticalExperiments(): Promise<void> {
  const criticalExperiments = ["css-animation", "shader-experiment"];

  const preloadPromises = criticalExperiments.map(async (experimentId) => {
    try {
      await preloadExperimentDependencies(experimentId);
    } catch (error) {
      console.warn(`Failed to preload experiment ${experimentId}:`, error);
    }
  });

  await Promise.all(preloadPromises);
}

/**
 * Load experiment with error handling
 */
export async function loadExperimentSafely(experimentId: string): Promise<{
  component: ExperimentComponent | null;
  error: string | null;
}> {
  try {
    // Preload dependencies first
    await preloadExperimentDependencies(experimentId);

    // Get the component
    const component = getExperimentComponent(experimentId);

    if (!component) {
      return {
        component: null,
        error: `Experiment "${experimentId}" not found`,
      };
    }

    return {
      component,
      error: null,
    };
  } catch (error) {
    return {
      component: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get experiments by category with lazy loading
 */
export function getExperimentsByCategory(category: "design" | "webgl"): {
  [key: string]: ExperimentComponent;
} {
  const result: { [key: string]: ExperimentComponent } = {};

  Object.entries(experimentRegistry).forEach(([id, experiment]) => {
    if (experiment.category === category) {
      result[id] = experiment.component;
    }
  });

  return result;
}

/**
 * Check if experiment requires WebGL
 */
export function experimentRequiresWebGL(experimentId: string): boolean {
  const experiment = experimentRegistry[experimentId];
  return experiment?.category === "webgl" || false;
}

/**
 * Get estimated load time for experiment
 */
export function getEstimatedLoadTime(
  experimentId: string,
  connectionSpeed: "slow" | "fast" = "fast",
): number {
  const experiment = experimentRegistry[experimentId];
  if (!experiment) return 0;

  // Estimate load time based on bundle size and connection speed
  const speedMultiplier = connectionSpeed === "slow" ? 3 : 1;
  const baseLoadTime = experiment.bundleSize * 0.01; // 10ms per KB base

  return Math.round(baseLoadTime * speedMultiplier * 100) / 100; // Round to 2 decimal places
}

/**
 * Cleanup experiment resources
 */
export function cleanupExperimentResources(experimentId: string): void {
  // This would be called when switching experiments to free up memory
  const experiment = experimentRegistry[experimentId];
  if (!experiment) return;

  // For WebGL experiments, we might want to dispose of Three.js resources
  if (experiment.category === "webgl") {
    // Trigger cleanup in WebGL memory manager
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("webgl-cleanup", { detail: { experimentId } }),
      );
    }
  }
}
