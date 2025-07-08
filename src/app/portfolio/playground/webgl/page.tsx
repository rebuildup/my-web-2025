'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Palette, Zap, Box, Maximize2 } from 'lucide-react';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

interface SceneSettings {
  animationSpeed: number;
  wireframe: boolean;
  backgroundColor: string;
  objectType: 'cube' | 'sphere' | 'torus' | 'plane';
  materialType: 'basic' | 'standard' | 'phong' | 'lambert';
  lightingEnabled: boolean;
  autoRotate: boolean;
  particleSystem: boolean;
}

export default function WebGLPlaygroundPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(60);

  const [settings, setSettings] = useState<SceneSettings>({
    animationSpeed: 1,
    wireframe: false,
    backgroundColor: '#1a1a1a',
    objectType: 'cube',
    materialType: 'standard',
    lightingEnabled: true,
    autoRotate: true,
    particleSystem: false,
  });

  const [stats, setStats] = useState({
    triangles: 0,
    vertices: 0,
    drawCalls: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    initializeThreeJS();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const setupLighting = useCallback(() => {
    if (!sceneRef.current) return;

    // Clear existing lights
    const lights = sceneRef.current.children.filter(child => child instanceof THREE.Light);
    lights.forEach(light => sceneRef.current!.remove(light));

    if (settings.lightingEnabled) {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      sceneRef.current.add(ambientLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      sceneRef.current.add(directionalLight);

      // Point light
      const pointLight = new THREE.PointLight(0x0066ff, 0.5, 100);
      pointLight.position.set(-10, -10, -10);
      sceneRef.current.add(pointLight);

      // Hemisphere light
      const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
      sceneRef.current.add(hemisphereLight);
    }
  }, [settings.lightingEnabled]);

  const createObject = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.dispose();
      }
    }

    // Create geometry based on type
    let geometry: THREE.BufferGeometry;

    switch (settings.objectType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(3, 3, 32, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    // Create material based on type
    let material: THREE.Material;
    const materialOptions = {
      color: 0x0066ff,
      wireframe: settings.wireframe,
    };

    switch (settings.materialType) {
      case 'basic':
        material = new THREE.MeshBasicMaterial(materialOptions);
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          ...materialOptions,
          metalness: 0.7,
          roughness: 0.2,
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          ...materialOptions,
          shininess: 100,
        });
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial(materialOptions);
        break;
      default:
        material = new THREE.MeshStandardMaterial(materialOptions);
    }

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshRef.current = mesh;
    sceneRef.current.add(mesh);

    // Update stats
    updateStats(geometry);
  }, [settings.objectType, settings.materialType, settings.wireframe]);

  const createParticleSystem = () => {
    if (!sceneRef.current) return;

    // Remove existing particle system
    if (particleSystemRef.current) {
      sceneRef.current.remove(particleSystemRef.current);
      if (particleSystemRef.current.geometry) particleSystemRef.current.geometry.dispose();
      if (particleSystemRef.current.material instanceof THREE.Material) {
        particleSystemRef.current.material.dispose();
      }
    }

    if (!settings.particleSystem) return;

    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
      colors[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    particleSystemRef.current = particles;
    sceneRef.current.add(particles);
  };

  const updateScene = () => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(settings.backgroundColor);
    }

    setupLighting();
    createObject();
    createParticleSystem();
  };

  const updateStats = (geometry: THREE.BufferGeometry) => {
    if (!rendererRef.current) return;

    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.getIndex();

    const vertices = positionAttribute ? positionAttribute.count : 0;
    const triangles = indexAttribute ? indexAttribute.count / 3 : vertices / 3;

    setStats(prev => ({
      ...prev,
      triangles: Math.floor(triangles),
      vertices,
      memoryUsage:
        rendererRef.current!.info.memory.geometries + rendererRef.current!.info.memory.textures,
    }));
  };

  const animate = useCallback(() => {
    if (!isPlaying) return;

    const frameStart = performance.now();

    // Update objects
    if (meshRef.current && settings.autoRotate) {
      meshRef.current.rotation.x += 0.01 * settings.animationSpeed;
      meshRef.current.rotation.y += 0.01 * settings.animationSpeed;
    }

    if (particleSystemRef.current) {
      particleSystemRef.current.rotation.y += 0.005 * settings.animationSpeed;
    }

    // Render
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Update draw calls
      setStats(prev => ({
        ...prev,
        drawCalls: rendererRef.current!.info.render.calls,
      }));
    }

    const frameEnd = performance.now();
    const frameFps = 1000 / (frameEnd - frameStart);
    setFps(Math.round(frameFps));

    animationIdRef.current = requestAnimationFrame(animate);
  }, [isPlaying, settings.autoRotate, settings.animationSpeed]);

  const initializeThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.backgroundColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    setupLighting();

    // Create initial object
    createObject();

    // Start animation loop
    animate();
  }, [settings.backgroundColor, setupLighting, createObject, animate]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      animate();
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };

  const resetScene = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.rotation.set(0, 0, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    if (meshRef.current) {
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.dispose();
      }
    }

    if (particleSystemRef.current) {
      if (particleSystemRef.current.geometry) particleSystemRef.current.geometry.dispose();
      if (particleSystemRef.current.material instanceof THREE.Material) {
        particleSystemRef.current.material.dispose();
      }
    }
  };

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer padding={false} className="flex items-center justify-between">
          <a
            href="/portfolio/playground"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
          >
            ← Playground
          </a>
          <div className="text-foreground/60 text-sm">WebGL Playground</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
        <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-4xl">
          WebGL Playground
        </h1>
        <p className="noto-sans-jp text-foreground/80">
          Interactive 3D graphics experiments powered by Three.js
        </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
          <GridContent cols={{ xs: 1, md: 1, xl: 4, '2xl': 4 }} className="gap-8">
            {/* Controls */}
            <div className="space-y-6">
              {/* Animation Controls */}
              <div className="border-foreground/20 bg-gray/50 border p-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Animation
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={toggleAnimation}
                    className={`flex w-full items-center justify-center gap-2 py-3 text-white transition-colors ${
                      isPlaying
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>

                  <button
                    onClick={resetScene}
                    className="border-foreground/20 text-foreground hover:bg-foreground/5 flex w-full items-center justify-center gap-2 border py-3 transition-colors"
                  >
                    <RotateCcw size={20} />
                    Reset Scene
                  </button>

                  <div>
                    <label className="text-foreground/70 mb-2 block text-sm">
                      Speed: {settings.animationSpeed}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={settings.animationSpeed}
                      onChange={e =>
                        setSettings({ ...settings, animationSpeed: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">Auto Rotate</span>
                    <button
                      onClick={() => setSettings({ ...settings, autoRotate: !settings.autoRotate })}
                      className={`px-3 py-1 text-xs transition-colors ${
                        settings.autoRotate
                          ? 'bg-primary text-white'
                          : 'border-foreground/20 text-foreground border'
                      }`}
                    >
                      {settings.autoRotate ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Object Settings */}
              <div className="border-foreground/20 bg-gray/50 border p-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Box size={20} />
                  Object
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-foreground/70 mb-1 block text-sm">Type</label>
                    <select
                      value={settings.objectType}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          objectType: e.target.value as SceneSettings['objectType'],
                        })
                      }
                      className="border-foreground/20 bg-gray text-foreground focus:ring-primary w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                      <option value="cube">Cube</option>
                      <option value="sphere">Sphere</option>
                      <option value="torus">Torus</option>
                      <option value="plane">Plane</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-foreground/70 mb-1 block text-sm">Material</label>
                    <select
                      value={settings.materialType}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          materialType: e.target.value as SceneSettings['materialType'],
                        })
                      }
                      className="border-foreground/20 bg-gray text-foreground focus:ring-primary w-full border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="phong">Phong</option>
                      <option value="lambert">Lambert</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">Wireframe</span>
                    <button
                      onClick={() => setSettings({ ...settings, wireframe: !settings.wireframe })}
                      className={`px-3 py-1 text-xs transition-colors ${
                        settings.wireframe
                          ? 'bg-primary text-white'
                          : 'border-foreground/20 text-foreground border'
                      }`}
                    >
                      {settings.wireframe ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lighting */}
              <div className="border-foreground/20 bg-gray/50 border p-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Zap size={20} />
                  Lighting
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">Enabled</span>
                    <button
                      onClick={() =>
                        setSettings({ ...settings, lightingEnabled: !settings.lightingEnabled })
                      }
                      className={`px-3 py-1 text-xs transition-colors ${
                        settings.lightingEnabled
                          ? 'bg-primary text-white'
                          : 'border-foreground/20 text-foreground border'
                      }`}
                    >
                      {settings.lightingEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div>
                    <label className="text-foreground/70 mb-2 block text-sm">Background</label>
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={e => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="border-foreground/20 h-10 w-full border"
                    />
                  </div>
                </div>
              </div>

              {/* Effects */}
              <div className="border-foreground/20 bg-gray/50 border p-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Palette size={20} />
                  Effects
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">Particle System</span>
                    <button
                      onClick={() =>
                        setSettings({ ...settings, particleSystem: !settings.particleSystem })
                      }
                      className={`px-3 py-1 text-xs transition-colors ${
                        settings.particleSystem
                          ? 'bg-primary text-white'
                          : 'border-foreground/20 text-foreground border'
                      }`}
                    >
                      {settings.particleSystem ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="border-foreground/20 bg-gray/50 border p-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Performance
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">FPS</span>
                    <span className="neue-haas-grotesk-display text-foreground font-bold">
                      {fps}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Triangles</span>
                    <span className="neue-haas-grotesk-display text-foreground font-bold">
                      {stats.triangles.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Vertices</span>
                    <span className="neue-haas-grotesk-display text-foreground font-bold">
                      {stats.vertices.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Draw Calls</span>
                    <span className="neue-haas-grotesk-display text-foreground font-bold">
                      {stats.drawCalls}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="lg:col-span-3">
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="neue-haas-grotesk-display text-foreground text-xl">3D Scene</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 text-sm ${
                        isPlaying ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {isPlaying ? 'RENDERING' : 'PAUSED'}
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="text-foreground/60 hover:text-foreground p-2"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>

                <div
                  ref={mountRef}
                  className="border-foreground/20 relative overflow-hidden border"
                  style={{ width: '800px', height: '600px', maxWidth: '100%' }}
                >
                  {/* Canvas will be mounted here */}
                </div>

                <div className="text-foreground/70 mt-4 text-sm">
                  <p>
                    Use mouse to interact with the 3D scene. Experiment with different objects,
                    materials, and lighting settings.
                  </p>
                </div>
              </div>
            </div>
          </GridContent>
        </GridContainer>
      </main>
    </GridLayout>
  );
}
