/**
 * Particle System Experiment
 * GPU-accelerated particle system with interactive controls
 * Task 1.2: WebGLプレイグラウンド - Particle System
 */

"use client";

import { performanceOptimizer } from "@/lib/playground/performance-optimizer";
import { webglMemoryManager } from "@/lib/playground/webgl-memory-manager";
import { ExperimentProps } from "@/types/playground";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ParticleControls {
  particleCount: number;
  speed: number;
  size: number;
  colorMode: "rainbow" | "blue" | "fire" | "green";
  attractorStrength: number;
  noiseStrength: number;
}

export function ParticleSystemExperiment({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError,
}: ExperimentProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [controls, setControls] = useState<ParticleControls>({
    particleCount:
      deviceCapabilities?.performanceLevel === "high"
        ? 10000
        : deviceCapabilities?.performanceLevel === "medium"
          ? 5000
          : 2000,
    speed: 1.0,
    size: 2.0,
    colorMode: "rainbow",
    attractorStrength: 0.5,
    noiseStrength: 0.3,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Performance monitoring
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,
  });

  // Particle system data
  const particleDataRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
    colors: Float32Array;
    sizes: Float32Array;
  } | null>(null);

  // Create particle system
  const createParticleSystem = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing particles
    if (particlesRef.current) {
      sceneRef.current.remove(particlesRef.current);
      particlesRef.current.geometry.dispose();
      if (Array.isArray(particlesRef.current.material)) {
        particlesRef.current.material.forEach((mat) => mat.dispose());
      } else {
        particlesRef.current.material.dispose();
      }
    }

    const particleCount = controls.particleCount;

    // Initialize particle data
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random positions in sphere
      const radius = Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // Colors based on mode
      const color = getParticleColor(i, particleCount, controls.colorMode);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Sizes
      sizes[i] = Math.random() * controls.size + 0.5;
    }

    particleDataRef.current = { positions, velocities, colors, sizes };

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Create material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: createParticleTexture() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
          gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
          if (gl_FragColor.a < 0.1) discard;
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    // Create particles
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    sceneRef.current.add(particles);
  }, [controls]);

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

      // Set memory limit based on device capabilities
      const memoryLimit =
        deviceCapabilities.performanceLevel === "high"
          ? 256
          : deviceCapabilities.performanceLevel === "medium"
            ? 128
            : 64;
      webglMemoryManager.setMemoryLimit(memoryLimit);

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      );
      camera.position.z = 50;
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

      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
      renderer.setPixelRatio(webglSettings.pixelRatio);

      // Optimize WebGL context
      performanceOptimizer.optimizeWebGLContext(renderer.getContext());

      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Create particle system
      createParticleSystem();

      // Mouse tracking
      const handleMouseMove = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (rect) {
          mouseRef.current.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }
      };

      mountRef.current.addEventListener("mousemove", handleMouseMove);

      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to initialize particle system: ${errorMessage}`);
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [deviceCapabilities, performanceSettings, onError, createParticleSystem]);

  // Get particle color based on mode
  const getParticleColor = (index: number, total: number, mode: string) => {
    const color = new THREE.Color();

    switch (mode) {
      case "rainbow":
        color.setHSL((index / total) * 360, 1, 0.5);
        break;
      case "blue":
        color.setHSL(240, 1, 0.3 + Math.random() * 0.4);
        break;
      case "fire":
        color.setHSL(Math.random() * 60, 1, 0.5);
        break;
      case "green":
        color.setHSL(120 + Math.random() * 60, 1, 0.3 + Math.random() * 0.4);
        break;
      default:
        color.setRGB(1, 1, 1);
    }

    return color;
  };

  // Create particle texture
  const createParticleTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (!context) return new THREE.Texture();

    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Update particles
  const updateParticles = useCallback(
    (deltaTime: number) => {
      if (!particleDataRef.current || !particlesRef.current) return;

      const { positions, velocities } = particleDataRef.current;
      const particleCount = positions.length / 3;

      // Mouse attractor position
      const mousePos = new THREE.Vector3(
        mouseRef.current.x * 50,
        mouseRef.current.y * 50,
        0,
      );

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Current position
        const pos = new THREE.Vector3(
          positions[i3],
          positions[i3 + 1],
          positions[i3 + 2],
        );

        // Attractor force (mouse)
        const attractorForce = mousePos.clone().sub(pos);
        const distance = attractorForce.length();
        if (distance > 0) {
          attractorForce.normalize();
          attractorForce.multiplyScalar(
            (controls.attractorStrength * deltaTime) / (distance * 0.1 + 1),
          );

          velocities[i3] += attractorForce.x;
          velocities[i3 + 1] += attractorForce.y;
          velocities[i3 + 2] += attractorForce.z;
        }

        // Noise force
        const time = clockRef.current.getElapsedTime();
        const noiseX =
          Math.sin(time + i * 0.01) * controls.noiseStrength * deltaTime;
        const noiseY =
          Math.cos(time + i * 0.02) * controls.noiseStrength * deltaTime;
        const noiseZ =
          Math.sin(time + i * 0.015) * controls.noiseStrength * deltaTime;

        velocities[i3] += noiseX;
        velocities[i3 + 1] += noiseY;
        velocities[i3 + 2] += noiseZ;

        // Apply velocity damping
        velocities[i3] *= 0.98;
        velocities[i3 + 1] *= 0.98;
        velocities[i3 + 2] *= 0.98;

        // Update positions
        positions[i3] += velocities[i3] * controls.speed;
        positions[i3 + 1] += velocities[i3 + 1] * controls.speed;
        positions[i3 + 2] += velocities[i3 + 2] * controls.speed;

        // Boundary check
        const maxDistance = 100;
        if (pos.length() > maxDistance) {
          pos.normalize().multiplyScalar(maxDistance);
          positions[i3] = pos.x;
          positions[i3 + 1] = pos.y;
          positions[i3 + 2] = pos.z;
        }
      }

      // Update geometry
      const positionAttribute =
        particlesRef.current.geometry.getAttribute("position");
      positionAttribute.needsUpdate = true;
    },
    [controls],
  );

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
    const deltaTime = clockRef.current.getDelta();

    // Update particles
    updateParticles(deltaTime);

    // Update shader uniforms
    if (
      particlesRef.current &&
      particlesRef.current.material instanceof THREE.ShaderMaterial
    ) {
      particlesRef.current.material.uniforms.time.value =
        clockRef.current.getElapsedTime();
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
        frameTime: deltaTime * 1000,
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
  }, [isActive, updateParticles, onPerformanceUpdate]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
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

  // Update particle system when controls change
  useEffect(() => {
    if (isInitialized) {
      createParticleSystem();
    }
  }, [
    controls.particleCount,
    controls.colorMode,
    controls.size,
    isInitialized,
    createParticleSystem,
  ]);

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

      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        if (Array.isArray(particlesRef.current.material)) {
          particlesRef.current.material.forEach((mat) => mat.dispose());
        } else {
          particlesRef.current.material.dispose();
        }
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

      {/* Instructions */}
      <div className="text-center">
        <p className="noto-sans-jp-light text-sm text-accent">
          マウスを動かしてパーティクルを引き寄せてください
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Particle Count */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Particle Count: {controls.particleCount}
          </label>
          <input
            type="range"
            min="1000"
            max={
              deviceCapabilities?.performanceLevel === "high"
                ? "20000"
                : "10000"
            }
            step="1000"
            value={controls.particleCount}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                particleCount: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Speed: {controls.speed.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={controls.speed}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                speed: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Size: {controls.size.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={controls.size}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                size: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Color Mode */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Color Mode
          </label>
          <select
            value={controls.colorMode}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                colorMode: e.target.value as ParticleControls["colorMode"],
              }))
            }
            className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
          >
            <option value="rainbow">Rainbow</option>
            <option value="blue">Blue</option>
            <option value="fire">Fire</option>
            <option value="green">Green</option>
          </select>
        </div>

        {/* Attractor Strength */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Attractor: {controls.attractorStrength.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={controls.attractorStrength}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                attractorStrength: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Noise Strength */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Noise: {controls.noiseStrength.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.noiseStrength}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                noiseStrength: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
