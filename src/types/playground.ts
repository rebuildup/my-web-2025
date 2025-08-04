/**
 * Playground-specific types for design and WebGL experiments
 * Based on portfolio-complete-implementation design specifications
 */

// Base experiment interface
export interface ExperimentItem {
  id: string;
  title: string;
  description: string;
  technology: string[];
  interactive: boolean;
  component: React.ComponentType<ExperimentProps>;
  category: ExperimentCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
}

// Design experiment specific interface
export interface DesignExperiment extends ExperimentItem {
  category: "css" | "svg" | "canvas" | "animation";
  animationType?: "hover" | "click" | "continuous" | "scroll";
  colorScheme?: string[];
  performanceLevel: "low" | "medium" | "high";
}

// WebGL experiment specific interface
export interface WebGLExperiment extends ExperimentItem {
  category: "3d" | "shader" | "particle" | "effect";
  webglType: "3d" | "shader" | "particle" | "effect";
  performanceLevel: "low" | "medium" | "high";
  shaderCode?: string;
  requiresWebGL2?: boolean;
  memoryUsage?: "low" | "medium" | "high";
}

// Device capabilities for optimization
export interface DeviceCapabilities {
  webglSupport: boolean;
  webgl2Support: boolean;
  performanceLevel: "low" | "medium" | "high";
  touchSupport: boolean;
  maxTextureSize: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  memoryLimit?: number;
}

// Performance settings for experiments
export interface PerformanceSettings {
  targetFPS: number;
  qualityLevel: "low" | "medium" | "high";
  enableOptimizations: boolean;
  maxParticles?: number;
  textureQuality?: "low" | "medium" | "high";
  shadowQuality?: "off" | "low" | "medium" | "high";
}

// Performance monitoring data
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  gpuUsage?: number;
  drawCalls?: number;
  triangles?: number;
}

// Experiment props interface
export interface ExperimentProps {
  isActive: boolean;
  deviceCapabilities: DeviceCapabilities;
  performanceSettings: PerformanceSettings;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  onError?: (error: Error) => void;
}

// Filter options for experiments
export interface ExperimentFilter {
  category?: ExperimentCategory;
  difficulty?: "beginner" | "intermediate" | "advanced";
  technology?: string;
  performanceLevel?: "low" | "medium" | "high";
  interactive?: boolean;
}

// Experiment categories
export type ExperimentCategory =
  | "css"
  | "svg"
  | "canvas"
  | "animation"
  | "3d"
  | "shader"
  | "particle"
  | "effect";

// Playground page props
export interface PlaygroundPageProps {
  experiments: ExperimentItem[];
  deviceCapabilities: DeviceCapabilities;
  initialFilter?: ExperimentFilter;
}

// Error handling
export interface PlaygroundError {
  type: "webgl" | "performance" | "compatibility" | "runtime";
  message: string;
  details?: string;
  recoverable: boolean;
}

// Experiment metadata for management
export interface ExperimentMetadata {
  id: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  technology: string[];
  performanceLevel: "low" | "medium" | "high";
  interactive: boolean;
  requiresWebGL?: boolean;
  requiresWebGL2?: boolean;
  estimatedMemoryUsage: number; // in MB
  targetFPS: number;
  createdAt: string;
  updatedAt: string;
}

// Playground state management
export interface PlaygroundState {
  activeExperiment: string | null;
  isRunning: boolean;
  performanceMetrics: PerformanceMetrics;
  deviceCapabilities: DeviceCapabilities;
  performanceSettings: PerformanceSettings;
  errors: PlaygroundError[];
  filter: ExperimentFilter;
}

// Playground actions
export type PlaygroundAction =
  | { type: "SET_ACTIVE_EXPERIMENT"; payload: string | null }
  | { type: "START_EXPERIMENT" }
  | { type: "STOP_EXPERIMENT" }
  | { type: "UPDATE_PERFORMANCE"; payload: PerformanceMetrics }
  | { type: "UPDATE_SETTINGS"; payload: Partial<PerformanceSettings> }
  | { type: "ADD_ERROR"; payload: PlaygroundError }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_FILTER"; payload: ExperimentFilter };

// Experiment sharing data
export interface ExperimentShareData {
  experimentId: string;
  settings: PerformanceSettings;
  timestamp: string;
  deviceInfo: Partial<DeviceCapabilities>;
}
