/**
 * Custom Shader Experiment
 * Interactive GLSL shader programming with live editing
 * Task 1.2: WebGLプレイグラウンド - Custom Shaders
 */

"use client";

import { performanceOptimizer } from "@/lib/playground/performance-optimizer";
import { shaderOptimizer } from "@/lib/playground/shader-optimizer";
import { webglMemoryManager } from "@/lib/playground/webgl-memory-manager";
import { ExperimentProps } from "@/types/playground";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ShaderControls {
  shaderType: "fragment" | "vertex";
  presetShader: "rainbow" | "noise" | "waves" | "mandelbrot" | "custom";
  time: number;
  resolution: [number, number];
  mouse: [number, number];
  customCode: string;
}

const PRESET_SHADERS = {
  rainbow: `
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(color, 1.0);
}`,
  noise: `
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 pos = uv * 8.0 + time * 0.5;
  
  float n = noise(pos);
  vec3 color = vec3(n);
  
  gl_FragColor = vec4(color, 1.0);
}`,
  waves: `
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 center = vec2(0.5, 0.5);
  
  float dist = distance(uv, center);
  float wave = sin(dist * 20.0 - time * 3.0) * 0.5 + 0.5;
  
  vec3 color = vec3(wave * 0.2, wave * 0.8, wave);
  gl_FragColor = vec4(color, 1.0);
}`,
  mandelbrot: `
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

vec2 complexMul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
  uv *= 2.0;
  uv += vec2(-0.5, 0.0);
  
  vec2 z = vec2(0.0);
  vec2 c = uv + mouse * 0.5;
  
  int iterations = 0;
  for(int i = 0; i < 100; i++) {
    if(length(z) > 2.0) break;
    z = complexMul(z, z) + c;
    iterations++;
  }
  
  float color = float(iterations) / 100.0;
  vec3 rgb = vec3(color * 2.0, color * 0.5, 1.0 - color);
  
  gl_FragColor = vec4(rgb, 1.0);
}`,
};

export function ShaderExperiment({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError,
}: ExperimentProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [controls, setControls] = useState<ShaderControls>({
    shaderType: "fragment",
    presetShader: "rainbow",
    time: 0,
    resolution: [800, 600],
    mouse: [0, 0],
    customCode: PRESET_SHADERS.rainbow,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  // Performance monitoring
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,
  });

  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!mountRef.current || !deviceCapabilities?.webglSupport) {
      setError("WebGL is not supported on this device");
      return false;
    }

    try {
      // Initialize performance optimizer
      performanceOptimizer.initialize({
        targetFPS: performanceSettings.targetFPS,
        adaptiveQuality: true,
        enableProfiling: true,
      });

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera (orthographic for fullscreen quad)
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;

      // Get optimal WebGL settings
      const webglSettings =
        performanceOptimizer.getOptimalWebGLSettings(deviceCapabilities);

      // Renderer with optimized settings
      const renderer = new THREE.WebGLRenderer({
        antialias: webglSettings.antialias,
        alpha: webglSettings.alpha,
        powerPreference: webglSettings.powerPreference,
        premultipliedAlpha: webglSettings.premultipliedAlpha,
        preserveDrawingBuffer: webglSettings.preserveDrawingBuffer,
        stencil: webglSettings.stencil,
        depth: webglSettings.depth,
      });

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      renderer.setSize(width, height);
      renderer.setPixelRatio(webglSettings.pixelRatio);

      // Optimize WebGL context
      performanceOptimizer.optimizeWebGLContext(renderer.getContext());
      performanceOptimizer.monitorWebGLPerformance(renderer.getContext());

      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Update resolution
      setControls((prev) => ({
        ...prev,
        resolution: [width, height],
      }));

      // Create shader material
      createShaderMaterial();

      // Mouse tracking
      const handleMouseMove = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (rect) {
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          mouseRef.current.set(x, y);
          setControls((prev) => ({
            ...prev,
            mouse: [x, y],
          }));
        }
      };

      mountRef.current.addEventListener("mousemove", handleMouseMove);

      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to initialize shader experiment: ${errorMessage}`);
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [deviceCapabilities, performanceSettings, onError, createShaderMaterial]);

  // Create shader material
  const createShaderMaterial = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    }

    try {
      // Create optimized geometry using memory manager
      const geometry = webglMemoryManager.createOptimizedGeometry(
        new Float32Array([
          -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
        ]),
        undefined,
        "fullscreen-quad",
      );

      // Vertex shader (simple passthrough)
      const vertexShader = `
        attribute vec3 position;
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `;

      // Get fragment shader code
      const fragmentShader =
        controls.presetShader === "custom"
          ? controls.customCode
          : PRESET_SHADERS[controls.presetShader];

      // Create optimized shader material
      const uniforms = {
        time: { value: 0 },
        resolution: {
          value: new THREE.Vector2(
            controls.resolution[0],
            controls.resolution[1],
          ),
        },
        mouse: { value: new THREE.Vector2(0, 0) },
      };

      const material = shaderOptimizer.createOptimizedMaterial(
        vertexShader,
        fragmentShader,
        uniforms,
        deviceCapabilities,
        {
          precision: "mediump",
          enableOptimizations: true,
          stripComments: true,
          minifyCode: performanceSettings.qualityLevel === "low",
          cacheShaders: true,
        },
      );

      materialRef.current = material;

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      sceneRef.current.add(mesh);

      setShaderError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Shader compilation error";
      setShaderError(errorMessage);
      console.error("Shader error:", err);
    }
  }, [
    controls.presetShader,
    controls.customCode,
    controls.resolution,
    deviceCapabilities,
    performanceSettings.qualityLevel,
  ]);

  // Compile custom shader
  const compileCustomShader = useCallback(() => {
    if (controls.presetShader === "custom") {
      createShaderMaterial();
    }
  }, [controls.presetShader, createShaderMaterial]);

  // Animation loop
  const animate = useCallback(() => {
    if (
      !isActive ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    ) {
      return;
    }

    const currentTime = performance.now();
    const elapsedTime = clockRef.current.getElapsedTime();

    // Update shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = elapsedTime;
      materialRef.current.uniforms.mouse.value.copy(mouseRef.current);
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // Performance monitoring
    performanceRef.current.frameCount++;
    if (currentTime - performanceRef.current.lastTime >= 1000) {
      performanceRef.current.fps = Math.round(
        (performanceRef.current.frameCount * 1000) /
          (currentTime - performanceRef.current.lastTime),
      );

      onPerformanceUpdate?.({
        fps: performanceRef.current.fps,
        frameTime:
          (currentTime - performanceRef.current.lastTime) /
          performanceRef.current.frameCount,
        memoryUsage: (() => {
          const perfMemory = (
            performance as { memory?: { usedJSHeapSize: number } }
          ).memory;
          return perfMemory?.usedJSHeapSize
            ? Math.round(perfMemory.usedJSHeapSize / 1024 / 1024)
            : 0;
        })(),
      });

      performanceRef.current.frameCount = 0;
      performanceRef.current.lastTime = currentTime;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, onPerformanceUpdate]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    rendererRef.current.setSize(width, height);

    setControls((prev) => ({
      ...prev,
      resolution: [width, height],
    }));

    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(width, height);
    }
  }, []);

  // Initialize scene when component becomes active
  useEffect(() => {
    if (isActive && !isInitialized) {
      const success = initializeScene();
      if (success) {
        animate();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, isInitialized, initializeScene, animate]);

  // Update shader when preset changes
  useEffect(() => {
    if (isInitialized) {
      if (controls.presetShader !== "custom") {
        const shaderCode =
          PRESET_SHADERS[controls.presetShader as keyof typeof PRESET_SHADERS];
        if (shaderCode) {
          setControls((prev) => ({
            ...prev,
            customCode: shaderCode,
          }));
        }
      }
      createShaderMaterial();
    }
  }, [controls.presetShader, isInitialized, createShaderMaterial]);

  // Handle resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Cleanup on unmount
  useEffect(() => {
    const mount = mountRef.current;
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mount && rendererRef.current.domElement) {
          mount.removeChild(rendererRef.current.domElement);
        }
      }

      if (meshRef.current) {
        meshRef.current.geometry.dispose();
      }

      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="aspect-video bg-background border border-red-500 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-red-500 text-lg">⚠️ WebGL Error</div>
          <p className="text-sm text-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="aspect-video bg-background border border-foreground overflow-hidden cursor-crosshair"
        style={{ minHeight: "400px" }}
      />

      {/* Shader Error */}
      {shaderError && (
        <div className="bg-red-900 border border-red-500 p-3 rounded">
          <div className="text-red-300 text-sm font-mono">
            Shader Error: {shaderError}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="noto-sans-jp-light text-sm text-accent">
          マウスを動かしてシェーダーとインタラクションしてください
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Preset Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Preset Shader
            </label>
            <select
              value={controls.presetShader}
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  presetShader: e.target
                    .value as ShaderControls["presetShader"],
                }))
              }
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              <option value="rainbow">Rainbow</option>
              <option value="noise">Noise</option>
              <option value="waves">Waves</option>
              <option value="mandelbrot">Mandelbrot</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowCode(!showCode)}
              className="border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              <span className="noto-sans-jp-light text-sm">
                {showCode ? "Hide Code" : "Show Code"}
              </span>
            </button>
          </div>
        </div>

        {/* Code Editor */}
        {showCode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="noto-sans-jp-light text-sm text-foreground">
                Fragment Shader Code
              </label>
              {controls.presetShader === "custom" && (
                <button
                  onClick={compileCustomShader}
                  className="border border-accent text-accent px-3 py-1 text-sm hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Compile
                </button>
              )}
            </div>
            <textarea
              value={controls.customCode}
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  customCode: e.target.value,
                }))
              }
              className="w-full h-64 border border-foreground bg-background text-foreground p-3 text-sm font-mono resize-none"
              placeholder="Enter your GLSL fragment shader code here..."
              disabled={controls.presetShader !== "custom"}
            />
            <div className="text-xs text-foreground opacity-70">
              Available uniforms: time (float), resolution (vec2), mouse (vec2)
            </div>
          </div>
        )}

        {/* Shader Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-base border border-foreground p-3">
            <div className="text-accent font-medium">Time</div>
            <div className="text-foreground">
              {clockRef.current?.getElapsedTime().toFixed(2)}s
            </div>
          </div>
          <div className="bg-base border border-foreground p-3">
            <div className="text-accent font-medium">Resolution</div>
            <div className="text-foreground">
              {controls.resolution[0]} × {controls.resolution[1]}
            </div>
          </div>
          <div className="bg-base border border-foreground p-3">
            <div className="text-accent font-medium">Mouse</div>
            <div className="text-foreground">
              {controls.mouse[0].toFixed(2)}, {controls.mouse[1].toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
