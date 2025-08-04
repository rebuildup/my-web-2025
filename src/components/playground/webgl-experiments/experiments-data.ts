/**
 * WebGL Experiments Data
 * Defines available WebGL experiments with metadata and components
 * Task 1.2: WebGLプレイグラウンド(/portfolio/playground/WebGL)の実装
 */

import { WebGLExperiment } from "@/types/playground";
import { BasicGeometryExperiment } from "./BasicGeometryExperiment";
import { ParticleSystemExperiment } from "./ParticleSystemExperiment";
import { PhysicsSimulationExperiment } from "./PhysicsSimulationExperiment";
import { ShaderExperiment } from "./ShaderExperiment";

export const webglExperiments: WebGLExperiment[] = [
  {
    id: "basic-geometry",
    title: "Basic 3D Geometry",
    description: "基本的な3Dジオメトリとライティングの実験",
    technology: ["Three.js", "WebGL", "GLSL"],
    interactive: true,
    component: BasicGeometryExperiment,
    category: "3d",
    webglType: "3d",
    difficulty: "beginner",
    performanceLevel: "medium",
    requiresWebGL2: false,
    memoryUsage: "low",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "particle-system",
    title: "Particle System",
    description: "GPU加速パーティクルシステムとインタラクション",
    technology: ["Three.js", "WebGL", "GPU Particles"],
    interactive: true,
    component: ParticleSystemExperiment,
    category: "particle",
    webglType: "particle",
    difficulty: "intermediate",
    performanceLevel: "high",
    requiresWebGL2: false,
    memoryUsage: "medium",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "custom-shader",
    title: "Custom Shaders",
    description: "カスタムシェーダーとGLSLプログラミング",
    technology: ["GLSL", "WebGL", "Fragment Shader", "Vertex Shader"],
    interactive: true,
    component: ShaderExperiment,
    category: "shader",
    webglType: "shader",
    difficulty: "advanced",
    performanceLevel: "medium",
    requiresWebGL2: false,
    memoryUsage: "low",
    shaderCode: `
// Fragment Shader Example
precision mediump float;
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(color, 1.0);
}
    `,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  {
    id: "physics-simulation",
    title: "Physics Simulation",
    description: "物理シミュレーションと衝突検出",
    technology: ["Three.js", "Physics", "Collision Detection"],
    interactive: true,
    component: PhysicsSimulationExperiment,
    category: "effect",
    webglType: "effect",
    difficulty: "advanced",
    performanceLevel: "high",
    requiresWebGL2: false,
    memoryUsage: "high",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
];

export default webglExperiments;
