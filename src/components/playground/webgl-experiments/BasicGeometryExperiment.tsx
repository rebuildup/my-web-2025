/**
 * Basic 3D Geometry Experiment
 * Three.js basic geometry with interactive controls
 * Task 1.2: WebGLプレイグラウンド - Basic 3D Geometry
 */

"use client";

import { ExperimentProps } from "@/types/playground";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface GeometryControls {
  rotationSpeed: number;
  wireframe: boolean;
  geometryType: "box" | "sphere" | "torus" | "cone";
  lightIntensity: number;
  materialType: "basic" | "lambert" | "phong" | "standard";
}

export function BasicGeometryExperiment({
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
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const [controls, setControls] = useState<GeometryControls>({
    rotationSpeed: 1.0,
    wireframe: false,
    geometryType: "box",
    lightIntensity: 1.0,
    materialType: "standard",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Performance monitoring
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,
  });

  // Create geometry based on current settings
  const createGeometry = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((mat) => mat.dispose());
      } else {
        meshRef.current.material.dispose();
      }
    }

    // Create geometry
    let geometry: THREE.BufferGeometry;
    switch (controls.geometryType) {
      case "sphere":
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(1, 2, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    // Create material
    let material: THREE.Material;
    const materialOptions = {
      wireframe: controls.wireframe,
      color: 0x00ff88,
    };

    switch (controls.materialType) {
      case "basic":
        material = new THREE.MeshBasicMaterial(materialOptions);
        break;
      case "lambert":
        material = new THREE.MeshLambertMaterial(materialOptions);
        break;
      case "phong":
        material = new THREE.MeshPhongMaterial({
          ...materialOptions,
          shininess: 100,
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial({
          ...materialOptions,
          metalness: 0.3,
          roughness: 0.4,
        });
    }

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = performanceSettings.qualityLevel !== "low";
    mesh.receiveShadow = performanceSettings.qualityLevel !== "low";
    meshRef.current = mesh;
    sceneRef.current.add(mesh);
  }, [controls, performanceSettings.qualityLevel]);

  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!mountRef.current || !deviceCapabilities?.webglSupport) {
      setError("WebGL is not supported on this device");
      return false;
    }

    try {
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x181818);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: performanceSettings.qualityLevel !== "low",
        alpha: true,
        powerPreference:
          deviceCapabilities.performanceLevel === "high"
            ? "high-performance"
            : "default",
      });

      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
      renderer.setPixelRatio(
        Math.min(
          deviceCapabilities.devicePixelRatio,
          performanceSettings.qualityLevel === "high" ? 2 : 1,
        ),
      );

      // Enable shadows for better quality
      if (performanceSettings.qualityLevel !== "low") {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        controls.lightIntensity,
      );
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = performanceSettings.qualityLevel !== "low";
      if (directionalLight.castShadow) {
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
      }
      scene.add(directionalLight);

      // Create initial geometry
      createGeometry();

      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to initialize WebGL: ${errorMessage}`);
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [
    deviceCapabilities,
    performanceSettings,
    controls.lightIntensity,
    onError,
    createGeometry,
  ]);

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

    // Rotate mesh
    if (meshRef.current) {
      meshRef.current.rotation.x += deltaTime * controls.rotationSpeed;
      meshRef.current.rotation.y += deltaTime * controls.rotationSpeed * 0.7;
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
  }, [isActive, controls.rotationSpeed, onPerformanceUpdate]);

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

  // Update geometry when controls change
  useEffect(() => {
    if (isInitialized) {
      createGeometry();
    }
  }, [controls, isInitialized, createGeometry]);

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
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat) => mat.dispose());
        } else {
          meshRef.current.material.dispose();
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
        className="aspect-video bg-background border border-foreground overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Geometry Type */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Geometry Type
          </label>
          <select
            value={controls.geometryType}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                geometryType: e.target
                  .value as GeometryControls["geometryType"],
              }))
            }
            className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
          >
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="torus">Torus</option>
            <option value="cone">Cone</option>
          </select>
        </div>

        {/* Material Type */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Material Type
          </label>
          <select
            value={controls.materialType}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                materialType: e.target
                  .value as GeometryControls["materialType"],
              }))
            }
            className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
          >
            <option value="basic">Basic</option>
            <option value="lambert">Lambert</option>
            <option value="phong">Phong</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        {/* Rotation Speed */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Rotation Speed: {controls.rotationSpeed.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={controls.rotationSpeed}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                rotationSpeed: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Light Intensity */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Light Intensity: {controls.lightIntensity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={controls.lightIntensity}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                lightIntensity: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Wireframe Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="wireframe"
          checked={controls.wireframe}
          onChange={(e) =>
            setControls((prev) => ({
              ...prev,
              wireframe: e.target.checked,
            }))
          }
          className="w-4 h-4"
        />
        <label
          htmlFor="wireframe"
          className="noto-sans-jp-light text-sm text-foreground"
        >
          Wireframe Mode
        </label>
      </div>
    </div>
  );
}
