/**
 * Physics Simulation Experiment
 * Simple physics simulation with collision detection
 * Task 1.2: WebGLプレイグラウンド - Physics Simulation
 */

"use client";

import { ExperimentProps } from "@/types/playground";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PhysicsControls {
  gravity: number;
  bounceStrength: number;
  friction: number;
  objectCount: number;
  objectSize: number;
  resetSimulation: boolean;
}

interface PhysicsObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  mass: number;
  radius: number;
}

export function PhysicsSimulationExperiment({
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
  const animationRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  const physicsObjectsRef = useRef<PhysicsObject[]>([]);
  const boundariesRef = useRef<THREE.Mesh[]>([]);

  const [controls, setControls] = useState<PhysicsControls>({
    gravity: 9.8,
    bounceStrength: 0.8,
    friction: 0.99,
    objectCount:
      deviceCapabilities?.performanceLevel === "high"
        ? 50
        : deviceCapabilities?.performanceLevel === "medium"
          ? 30
          : 20,
    objectSize: 1.0,
    resetSimulation: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 10, 30);
      camera.lookAt(0, 0, 0);
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

      // Enable shadows
      if (performanceSettings.qualityLevel !== "low") {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = performanceSettings.qualityLevel !== "low";
      if (directionalLight.castShadow) {
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
      }
      scene.add(directionalLight);

      // Create boundaries and physics objects will be created after initialization

      // Mouse interaction
      const handleMouseMove = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (rect) {
          mouseRef.current.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }
      };

      const handleClick = () => {
        if (!cameraRef.current || !sceneRef.current) return;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        // Add impulse to clicked objects
        const intersects = raycasterRef.current.intersectObjects(
          physicsObjectsRef.current.map((obj) => obj.mesh),
        );

        if (intersects.length > 0) {
          const clickedObject = physicsObjectsRef.current.find(
            (obj) => obj.mesh === intersects[0].object,
          );

          if (clickedObject) {
            // Apply impulse in random direction
            const impulse = new THREE.Vector3(
              (Math.random() - 0.5) * 20,
              Math.random() * 15 + 5,
              (Math.random() - 0.5) * 20,
            );
            clickedObject.velocity.add(impulse);
          }
        }
      };

      mountRef.current.addEventListener("mousemove", handleMouseMove);
      mountRef.current.addEventListener("click", handleClick);

      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to initialize physics simulation: ${errorMessage}`);
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [deviceCapabilities, performanceSettings, onError]);

  // Create boundaries (walls and floor)
  const createBoundaries = useCallback(() => {
    if (!sceneRef.current) return;

    // Clear existing boundaries
    boundariesRef.current.forEach((boundary) => {
      sceneRef.current!.remove(boundary);
      boundary.geometry.dispose();
      if (Array.isArray(boundary.material)) {
        boundary.material.forEach((mat) => mat.dispose());
      } else {
        boundary.material.dispose();
      }
    });
    boundariesRef.current = [];

    const boundaryMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.7,
    });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floor = new THREE.Mesh(floorGeometry, boundaryMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -15;
    floor.receiveShadow = performanceSettings.qualityLevel !== "low";
    sceneRef.current.add(floor);
    boundariesRef.current.push(floor);

    // Walls
    const wallGeometry = new THREE.PlaneGeometry(40, 30);

    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
    backWall.position.z = -20;
    sceneRef.current.add(backWall);
    boundariesRef.current.push(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -20;
    sceneRef.current.add(leftWall);
    boundariesRef.current.push(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, boundaryMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 20;
    sceneRef.current.add(rightWall);
    boundariesRef.current.push(rightWall);
  }, [performanceSettings.qualityLevel]);

  // Create physics objects
  const createPhysicsObjects = useCallback(() => {
    if (!sceneRef.current) return;

    // Clear existing objects
    physicsObjectsRef.current.forEach((obj) => {
      sceneRef.current!.remove(obj.mesh);
      obj.mesh.geometry.dispose();
      if (Array.isArray(obj.mesh.material)) {
        obj.mesh.material.forEach((mat) => mat.dispose());
      } else {
        obj.mesh.material.dispose();
      }
    });
    physicsObjectsRef.current = [];

    // Create new objects
    for (let i = 0; i < controls.objectCount; i++) {
      const radius = controls.objectSize * (0.5 + Math.random() * 0.5);
      const geometry = new THREE.SphereGeometry(radius, 16, 16);

      const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 20 + 10,
        (Math.random() - 0.5) * 30,
      );

      mesh.castShadow = performanceSettings.qualityLevel !== "low";
      mesh.receiveShadow = performanceSettings.qualityLevel !== "low";

      sceneRef.current.add(mesh);

      const physicsObject: PhysicsObject = {
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10,
        ),
        mass: radius * radius * radius, // Volume-based mass
        radius,
      };

      physicsObjectsRef.current.push(physicsObject);
    }
  }, [
    controls.objectCount,
    controls.objectSize,
    performanceSettings.qualityLevel,
  ]);

  // Physics update
  const updatePhysics = useCallback(
    (deltaTime: number) => {
      const objects = physicsObjectsRef.current;
      const dt = Math.min(deltaTime, 1 / 30); // Cap delta time for stability

      objects.forEach((obj, index) => {
        // Apply gravity
        obj.velocity.y -= controls.gravity * dt;

        // Apply friction
        obj.velocity.multiplyScalar(controls.friction);

        // Update position
        obj.mesh.position.add(obj.velocity.clone().multiplyScalar(dt));

        // Boundary collisions
        const pos = obj.mesh.position;
        const radius = obj.radius;

        // Floor collision
        if (pos.y - radius < -15) {
          pos.y = -15 + radius;
          obj.velocity.y = Math.abs(obj.velocity.y) * controls.bounceStrength;
        }

        // Wall collisions
        if (pos.x - radius < -20) {
          pos.x = -20 + radius;
          obj.velocity.x = Math.abs(obj.velocity.x) * controls.bounceStrength;
        }
        if (pos.x + radius > 20) {
          pos.x = 20 - radius;
          obj.velocity.x = -Math.abs(obj.velocity.x) * controls.bounceStrength;
        }
        if (pos.z - radius < -20) {
          pos.z = -20 + radius;
          obj.velocity.z = Math.abs(obj.velocity.z) * controls.bounceStrength;
        }
        if (pos.z + radius > 20) {
          pos.z = 20 - radius;
          obj.velocity.z = -Math.abs(obj.velocity.z) * controls.bounceStrength;
        }

        // Object-to-object collisions
        for (let i = index + 1; i < objects.length; i++) {
          const other = objects[i];
          const distance = obj.mesh.position.distanceTo(other.mesh.position);
          const minDistance = obj.radius + other.radius;

          if (distance < minDistance) {
            // Collision detected
            const normal = obj.mesh.position
              .clone()
              .sub(other.mesh.position)
              .normalize();

            // Separate objects
            const overlap = minDistance - distance;
            const separation = normal.clone().multiplyScalar(overlap * 0.5);
            obj.mesh.position.add(separation);
            other.mesh.position.sub(separation);

            // Calculate collision response
            const relativeVelocity = obj.velocity.clone().sub(other.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            if (velocityAlongNormal > 0) continue; // Objects separating

            const restitution = controls.bounceStrength;
            const impulse =
              (-(1 + restitution) * velocityAlongNormal) /
              (1 / obj.mass + 1 / other.mass);

            const impulseVector = normal.clone().multiplyScalar(impulse);
            obj.velocity.add(
              impulseVector.clone().multiplyScalar(1 / obj.mass),
            );
            other.velocity.sub(
              impulseVector.clone().multiplyScalar(1 / other.mass),
            );
          }
        }
      });
    },
    [controls.gravity, controls.bounceStrength, controls.friction],
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

    // Update physics
    updatePhysics(deltaTime);

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
  }, [isActive, updatePhysics, onPerformanceUpdate]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    createPhysicsObjects();
    setControls((prev) => ({ ...prev, resetSimulation: false }));
  }, [createPhysicsObjects]);

  // Initialize scene when component becomes active
  useEffect(() => {
    if (isActive && !isInitialized) {
      const success = initializeScene();
      if (success) {
        // Create boundaries and physics objects after scene initialization
        createBoundaries();
        createPhysicsObjects();
        animate();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    isActive,
    isInitialized,
    initializeScene,
    animate,
    createBoundaries,
    createPhysicsObjects,
  ]);

  // Update objects when controls change
  useEffect(() => {
    if (
      isInitialized &&
      (controls.resetSimulation ||
        controls.objectCount !== physicsObjectsRef.current.length)
    ) {
      createPhysicsObjects();
      if (controls.resetSimulation) {
        setControls((prev) => ({ ...prev, resetSimulation: false }));
      }
    }
  }, [
    controls.objectCount,
    controls.resetSimulation,
    isInitialized,
    createPhysicsObjects,
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

      physicsObjectsRef.current.forEach((obj) => {
        obj.mesh.geometry.dispose();
        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach((mat) => mat.dispose());
        } else {
          obj.mesh.material.dispose();
        }
      });

      boundariesRef.current.forEach((boundary) => {
        boundary.geometry.dispose();
        if (Array.isArray(boundary.material)) {
          boundary.material.forEach((mat) => mat.dispose());
        } else {
          boundary.material.dispose();
        }
      });
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
        className="aspect-video bg-background border border-foreground overflow-hidden cursor-pointer"
        style={{ minHeight: "400px" }}
      />

      {/* Instructions */}
      <div className="text-center">
        <p className="noto-sans-jp-light text-sm text-accent">
          オブジェクトをクリックして衝撃を与えてください
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gravity */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Gravity: {controls.gravity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={controls.gravity}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                gravity: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Bounce Strength */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Bounce: {controls.bounceStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={controls.bounceStrength}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                bounceStrength: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Friction */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Friction: {(1 - controls.friction).toFixed(3)}
          </label>
          <input
            type="range"
            min="0.95"
            max="1"
            step="0.005"
            value={controls.friction}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                friction: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Object Count */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Objects: {controls.objectCount}
          </label>
          <input
            type="range"
            min="5"
            max={deviceCapabilities?.performanceLevel === "high" ? "100" : "50"}
            step="5"
            value={controls.objectCount}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                objectCount: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Object Size */}
        <div className="space-y-2">
          <label className="noto-sans-jp-light text-sm text-foreground">
            Size: {controls.objectSize.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={controls.objectSize}
            onChange={(e) =>
              setControls((prev) => ({
                ...prev,
                objectSize: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={resetSimulation}
            className="w-full border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="noto-sans-jp-light text-sm">Reset Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
