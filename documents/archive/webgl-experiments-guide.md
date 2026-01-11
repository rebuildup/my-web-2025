# WebGL実験の追加・更新ガイド

## 概要

このドキュメントは、WebGLプレイグラウンドに新しい実験を追加したり、既存の実験を更新したりする際の詳細なガイドです.

## 目次

1. [WebGL実験システム概要](#webgl実験システム概要)
2. [新しいWebGL実験の作成](#新しいwebgl実験の作成)
3. [シェーダー実験の実装](#シェーダー実験の実装)
4. [3D実験の実装](#3d実験の実装)
5. [パーティクルシステム実験](#パーティクルシステム実験)
6. [パフォーマンス最適化](#パフォーマンス最適化)
7. [デバイス対応](#デバイス対応)
8. [テストとデバッグ](#テストとデバッグ)
9. [トラブルシューティング](#トラブルシューティング)

## WebGL実験システム概要

### アーキテクチャ

```
WebGL Experiments System
├── Core Components
│   ├── WebGLPlaygroundPage (メインページ)
│   ├── WebGLExperimentComponent (基底クラス)
│   └── WebGLErrorBoundary (エラーハンドリング)
├── Experiment Types
│   ├── Shader Experiments (シェーダー実験)
│   ├── 3D Scene Experiments (3Dシーン実験)
│   ├── Particle System Experiments (パーティクル実験)
│   └── Interactive Experiments (インタラクティブ実験)
├── Supporting Systems
│   ├── Three.js Integration (Three.js統合)
│   ├── Performance Monitoring (パフォーマンス監視)
│   ├── Device Capabilities Detection (デバイス検出)
│   └── Resource Management (リソース管理)
└── Utilities
    ├── Shader Compiler (シェーダーコンパイラ)
    ├── Texture Loader (テクスチャローダー)
    ├── Geometry Generator (ジオメトリ生成)
    └── Animation Controller (アニメーション制御)
```

### 実験の種類

1. **Shader Experiments**: カスタムシェーダーを使用した視覚効果
2. **3D Scene Experiments**: 3Dオブジェクトとシーンの実験
3. **Particle System Experiments**: パーティクルシステムの実験
4. **Interactive Experiments**: ユーザーインタラクションを含む実験

## 新しいWebGL実験の作成

### ステップ1: 実験データの定義

```typescript
// src/components/playground/webgl-experiments/experiments-data.ts

export interface WebGLExperiment {
  id: string;
  title: string;
  description: string;
  technology: string[];
  webglType: "3d" | "shader" | "particle" | "effect";
  performanceLevel: "low" | "medium" | "high";
  component: React.ComponentType<WebGLExperimentProps>;
  shaderCode?: {
    vertex: string;
    fragment: string;
  };
  interactive: boolean;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
  requirements?: {
    webgl2?: boolean;
    extensions?: string[];
    minTextureSize?: number;
  };
}

// 新しい実験の定義例
export const newWebGLExperiment: WebGLExperiment = {
  id: "rotating-cube-shader",
  title: "Rotating Cube with Custom Shader",
  description: "A rotating cube with custom vertex and fragment shaders",
  technology: ["WebGL", "Three.js", "GLSL"],
  webglType: "shader",
  performanceLevel: "medium",
  component: RotatingCubeShaderExperiment,
  shaderCode: {
    vertex: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float time;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vec3 color = 0.5 + 0.5 * cos(time + vPosition.xyx + vec3(0, 2, 4));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },
  interactive: true,
  category: "shader",
  difficulty: "intermediate",
  createdAt: "2025-01-01",
  updatedAt: "2025-01-01",
  requirements: {
    webgl2: false,
    extensions: [],
    minTextureSize: 512,
  },
};
```

### ステップ2: 実験コンポーネントの実装

```typescript
// src/components/playground/webgl-experiments/RotatingCubeShaderExperiment.tsx

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLExperimentProps } from '@/types/playground';

const RotatingCubeShaderExperiment: React.FC<WebGLExperimentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const cubeRef = useRef<THREE.Mesh>();
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // パフォーマンス監視
  const [performanceMonitor] = useState(() => new PerformanceMonitor());

  // WebGLセットアップ
  useEffect(() => {
    if (!isActive || !mountRef.current || !deviceCapabilities?.webglSupport) {
      return;
    }

    try {
      // Three.js基本セットアップ
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: performanceSettings.qualityLevel !== 'low',
        powerPreference: 'high-performance',
        alpha: true
      });

      // パフォーマンス設定適用
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(
        performanceSettings.qualityLevel === 'high'
          ? Math.min(window.devicePixelRatio, 2)
          : 1
      );

      mountRef.current.appendChild(renderer.domElement);

      // カスタムシェーダーマテリアル
      const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec2 resolution;
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            vec3 color = 0.5 + 0.5 * cos(time + vPosition.xyx + vec3(0, 2, 4));
            float fresnel = dot(vNormal, vec3(0, 0, 1));
            color *= fresnel;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
          )}
        }
      });

      // キューブジオメトリ
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const cube = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(cube);

      // カメラ位置
      camera.position.z = 3;

      // 参照を保存
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      cubeRef.current = cube;

      // パフォーマンス監視開始
      performanceMonitor.start();

    } catch (error) {
      onError(error as Error);
    }
  }, [isActive, deviceCapabilities, performanceSettings, onError, performanceMonitor]);

  // アニメーションループ
  useEffect(() => {
    if (!isActive || !sceneRef.current || !rendererRef.current || !cameraRef.current) {
      return;
    }

    const animate = () => {
      const frameStartTime = performance.now();

      // キューブの回転
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;

        // シェーダーのtime uniformを更新
        const material = cubeRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.time.value = (Date.now() - startTimeRef.current) * 0.001;
        }
      }

      // レンダリング
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);

      // パフォーマンス計測
      const frameEndTime = performance.now();
      const frameTime = frameEndTime - frameStartTime;

      performanceMonitor.recordFrame();
      const metrics = performanceMonitor.getMetrics();

      onPerformanceUpdate({
        ...metrics,
        frameTime
      });

      // 品質調整
      if (performanceSettings.enableOptimizations && metrics.fps < 30) {
        // 品質を下げる
        if (rendererRef.current) {
          rendererRef.current.setPixelRatio(0.5);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, performanceSettings, onPerformanceUpdate, performanceMonitor]);

  // リサイズハンドリング
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);

      // シェーダーのresolution uniformを更新
      if (cubeRef.current) {
        const material = cubeRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.resolution.value.set(width, height);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }

      if (cubeRef.current) {
        cubeRef.current.geometry.dispose();
        (cubeRef.current.material as THREE.Material).dispose();
      }

      performanceMonitor.stop();
    };
  }, [performanceMonitor]);

  return (
    <div className="webgl-experiment-container">
      <div
        ref={mountRef}
        className="webgl-canvas-container"
        style={{ width: '100%', height: '400px' }}
      />

      {/* 実験固有のコントロール */}
      <div className="experiment-controls mt-4">
        <div className="text-sm text-foreground">
          <p>• マウスで視点を変更できます</p>
          <p>• カスタムシェーダーによる色彩変化</p>
          <p>• リアルタイムパフォーマンス監視</p>
        </div>
      </div>
    </div>
  );
};

export default RotatingCubeShaderExperiment;
```

### ステップ3: 実験データへの追加

```typescript
// src/components/playground/webgl-experiments/experiments-data.ts

import RotatingCubeShaderExperiment from "./RotatingCubeShaderExperiment";

export const webglExperiments: WebGLExperiment[] = [
  // 既存の実験...

  // 新しい実験を追加
  {
    id: "rotating-cube-shader",
    title: "Rotating Cube with Custom Shader",
    description:
      "A rotating cube with custom vertex and fragment shaders demonstrating GLSL programming",
    technology: ["WebGL", "Three.js", "GLSL"],
    webglType: "shader",
    performanceLevel: "medium",
    component: RotatingCubeShaderExperiment,
    interactive: true,
    category: "shader",
    difficulty: "intermediate",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
];
```

## シェーダー実験の実装

### 基本的なシェーダー実験テンプレート

```typescript
const ShaderExperimentTemplate: React.FC<WebGLExperimentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shaderUniforms, setShaderUniforms] = useState({
    time: 0,
    resolution: [1, 1],
    mouse: [0, 0],
  });

  // シェーダーコード
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    varying vec2 vUv;
    
    void main() {
      vec2 st = gl_FragCoord.xy / resolution.xy;
      vec3 color = vec3(0.0);
      
      // ここにシェーダーロジックを実装
      color = vec3(st.x, st.y, abs(sin(time)));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // マウス追跡
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1.0 - (event.clientY - rect.top) / rect.height;

      setShaderUniforms((prev) => ({
        ...prev,
        mouse: [x, y],
      }));
    };

    if (mountRef.current) {
      mountRef.current.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (mountRef.current) {
        mountRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // 実装の詳細...
};
```

### 高度なシェーダー技術

#### 1. ノイズ関数の実装

```glsl
// Perlin noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
```

#### 2. フラクタルパターン

```glsl
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;

    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}
```

#### 3. レイマーチング

```glsl
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 p) {
    return sdSphere(p, 1.0);
}

vec3 rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;

    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);

        if (d < 0.001) {
            return p;
        }

        t += d;

        if (t > 100.0) break;
    }

    return vec3(0.0);
}
```

## 3D実験の実装

### 基本的な3Dシーン実験

```typescript
const Scene3DExperiment: React.FC<WebGLExperimentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>(); // OrbitControls

  // 3Dオブジェクトの配列
  const [objects, setObjects] = useState<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!isActive || !mountRef.current) return;

    // シーンセットアップ
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // カメラセットアップ
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // レンダラーセットアップ
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // ライティング
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 3Dオブジェクトの作成
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.ConeGeometry(0.7, 1.5, 32),
      new THREE.TorusGeometry(0.7, 0.3, 16, 100)
    ];

    const materials = [
      new THREE.MeshLambertMaterial({ color: 0xff6b6b }),
      new THREE.MeshLambertMaterial({ color: 0x4ecdc4 }),
      new THREE.MeshLambertMaterial({ color: 0x45b7d1 }),
      new THREE.MeshLambertMaterial({ color: 0xf9ca24 })
    ];

    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(geometries[i], materials[i]);
      mesh.position.x = (i - 1.5) * 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshes.push(mesh);
    }

    setObjects(meshes);

    // OrbitControls (オプション)
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controlsRef.current = controls;

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    return () => {
      // クリーンアップ
      geometries.forEach(geo => geo.dispose());
      materials.forEach(mat => mat.dispose());
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isActive]);

  // アニメーションループ
  useEffect(() => {
    if (!isActive || !sceneRef.current || !rendererRef.current || !cameraRef.current) {
      return;
    }

    let animationId: number;

    const animate = () => {
      // オブジェクトのアニメーション
      objects.forEach((obj, index) => {
        obj.rotation.x += 0.01 * (index + 1);
        obj.rotation.y += 0.01 * (index + 1);
      });

      // コントロールの更新
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // レンダリング
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, objects]);

  return (
    <div className="scene-3d-experiment">
      <div
        ref={mountRef}
        className="scene-container"
        style={{ width: '100%', height: '500px' }}
      />

      <div className="experiment-info mt-4">
        <p className="text-sm text-foreground">
          3Dオブジェクトのアニメーション実験
        </p>
      </div>
    </div>
  );
};
```

## パーティクルシステム実験

### GPU加速パーティクルシステム

```typescript
const GPUParticleExperiment: React.FC<WebGLExperimentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [particleCount, setParticleCount] = useState(10000);

  useEffect(() => {
    if (!isActive || !mountRef.current) return;

    // パーティクル数をデバイス性能に応じて調整
    const adjustedParticleCount =
      performanceSettings.qualityLevel === 'high' ? 50000 :
      performanceSettings.qualityLevel === 'medium' ? 25000 : 10000;

    setParticleCount(adjustedParticleCount);

    // Three.js セットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // パーティクルジオメトリ
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(adjustedParticleCount * 3);
    const velocities = new Float32Array(adjustedParticleCount * 3);
    const colors = new Float32Array(adjustedParticleCount * 3);

    // パーティクルの初期化
    for (let i = 0; i < adjustedParticleCount; i++) {
      const i3 = i * 3;

      // 位置
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // 速度
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // 色
      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // パーティクルマテリアル
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // アニメーションループ
    const animate = () => {
      const positions = geometry.attributes.position.array as Float32Array;
      const velocities = geometry.attributes.velocity.array as Float32Array;

      // パーティクルの更新
      for (let i = 0; i < adjustedParticleCount; i++) {
        const i3 = i * 3;

        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // 境界チェック
        if (Math.abs(positions[i3]) > 5) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 5) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 5) velocities[i3 + 2] *= -1;
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isActive, performanceSettings]);

  return (
    <div className="gpu-particle-experiment">
      <div
        ref={mountRef}
        className="particle-container"
        style={{ width: '100%', height: '400px' }}
      />

      <div className="particle-info mt-4">
        <p className="text-sm text-foreground">
          パーティクル数: {particleCount.toLocaleString()}
        </p>
        <p className="text-sm text-foreground">
          GPU加速による高速パーティクルシステム
        </p>
      </div>
    </div>
  );
};
```

## パフォーマンス最適化

### パフォーマンス監視クラス

```typescript
class WebGLPerformanceMonitor {
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private drawCalls: number = 0;
  private triangles: number = 0;

  start(): void {
    this.startTime = performance.now();
    this.frameCount = 0;
  }

  recordFrame(renderer: THREE.WebGLRenderer): void {
    this.frameCount++;
    this.lastFrameTime = performance.now();

    // WebGL統計情報の取得
    const info = renderer.info;
    this.drawCalls = info.render.calls;
    this.triangles = info.render.triangles;
  }

  getMetrics(): WebGLPerformanceMetrics {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const fps = Math.round((this.frameCount * 1000) / elapsed);
    const frameTime = currentTime - this.lastFrameTime;

    return {
      fps,
      frameTime,
      memoryUsage: this.getMemoryUsage(),
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      textureMemory: this.getTextureMemory(),
      geometryMemory: this.getGeometryMemory(),
    };
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  private getTextureMemory(): number {
    // テクスチャメモリ使用量の推定
    return 0; // 実装が必要
  }

  private getGeometryMemory(): number {
    // ジオメトリメモリ使用量の推定
    return 0; // 実装が必要
  }
}
```

### 品質調整システム

```typescript
class QualityAdjuster {
  private currentQuality: QualityLevel = "medium";
  private performanceHistory: number[] = [];

  adjustQuality(currentFPS: number, targetFPS: number): QualityLevel {
    this.performanceHistory.push(currentFPS);

    // 過去10フレームの平均FPS
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    const averageFPS =
      this.performanceHistory.reduce((a, b) => a + b, 0) /
      this.performanceHistory.length;

    if (averageFPS < targetFPS * 0.5) {
      this.currentQuality = "low";
    } else if (averageFPS < targetFPS * 0.8) {
      this.currentQuality = "medium";
    } else if (averageFPS > targetFPS * 1.2) {
      this.currentQuality = "high";
    }

    return this.currentQuality;
  }

  applyQualitySettings(
    renderer: THREE.WebGLRenderer,
    quality: QualityLevel,
  ): void {
    switch (quality) {
      case "low":
        renderer.setPixelRatio(0.5);
        renderer.shadowMap.enabled = false;
        break;
      case "medium":
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case "high":
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
    }
  }
}
```

## デバイス対応

### WebGL機能検出

```typescript
class WebGLCapabilityDetector {
  static detectCapabilities(): WebGLCapabilities {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const gl2 = canvas.getContext("webgl2");

    if (!gl) {
      return {
        supported: false,
        version: 0,
        extensions: [],
        maxTextureSize: 0,
        maxVertexTextures: 0,
        maxFragmentTextures: 0,
        maxRenderBufferSize: 0,
      };
    }

    const extensions = gl.getSupportedExtensions() || [];

    return {
      supported: true,
      version: gl2 ? 2 : 1,
      extensions,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
    };
  }

  static isExtensionSupported(extension: string): boolean {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) return false;

    return gl.getExtension(extension) !== null;
  }

  static getRecommendedSettings(
    capabilities: WebGLCapabilities,
  ): PerformanceSettings {
    if (!capabilities.supported) {
      return {
        targetFPS: 30,
        qualityLevel: "low",
        enableOptimizations: true,
      };
    }

    // GPU性能の推定
    const renderer = capabilities.renderer?.toLowerCase() || "";
    let performanceLevel: "low" | "medium" | "high" = "medium";

    if (renderer.includes("intel") && !renderer.includes("iris")) {
      performanceLevel = "low";
    } else if (renderer.includes("geforce") || renderer.includes("radeon")) {
      performanceLevel = "high";
    }

    return {
      targetFPS: performanceLevel === "high" ? 60 : 30,
      qualityLevel: performanceLevel,
      enableOptimizations: performanceLevel !== "high",
    };
  }
}
```

## テストとデバッグ

### WebGL実験のテスト

```typescript
// __tests__/WebGLExperiment.test.tsx

import { render, screen } from '@testing-library/react';
import { WebGLExperimentProps } from '@/types/playground';
import RotatingCubeShaderExperiment from '../RotatingCubeShaderExperiment';

// WebGLのモック
const mockWebGLContext = {
  getParameter: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn(),
  useProgram: jest.fn(),
  // その他必要なメソッド...
};

// HTMLCanvasElementのモック
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockWebGLContext),
});

describe('RotatingCubeShaderExperiment', () => {
  const defaultProps: WebGLExperimentProps = {
    isActive: true,
    deviceCapabilities: {
      webglSupport: true,
      webgl2Support: false,
      performanceLevel: 'medium',
      touchSupport: false,
      maxTextureSize: 2048,
      devicePixelRatio: 1,
      hardwareConcurrency: 4
    },
    performanceSettings: {
      targetFPS: 60,
      qualityLevel: 'medium',
      enableOptimizations: true
    },
    onPerformanceUpdate: jest.fn(),
    onError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<RotatingCubeShaderExperiment {...defaultProps} />);

    expect(screen.getByClassName('webgl-experiment-container')).toBeInTheDocument();
  });

  it('should handle WebGL not supported', () => {
    const props = {
      ...defaultProps,
      deviceCapabilities: {
        ...defaultProps.deviceCapabilities,
        webglSupport: false
      }
    };

    render(<RotatingCubeShaderExperiment {...props} />);

    // エラーハンドリングの確認
    expect(props.onError).not.toHaveBeenCalled();
  });

  it('should call performance update callback', async () => {
    const onPerformanceUpdate = jest.fn();
    const props = {
      ...defaultProps,
      onPerformanceUpdate
    };

    render(<RotatingCubeShaderExperiment {...props} />);

    // パフォーマンス更新の確認（非同期）
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onPerformanceUpdate).toHaveBeenCalled();
  });
});
```

### E2Eテスト

```typescript
// e2e/webgl-playground.spec.ts

import { test, expect } from "@playwright/test";

test.describe("WebGL Playground", () => {
  test("should load WebGL experiments", async ({ page }) => {
    await page.goto("/portfolio/playground/WebGL");

    // ページの読み込み確認
    await expect(page.locator("h1")).toContainText("WebGL Playground");

    // 実験一覧の確認
    await expect(page.locator('[data-testid="experiment-grid"]')).toBeVisible();

    // 実験の選択
    await page.click('[data-testid="experiment-rotating-cube-shader"]');

    // WebGLキャンバスの確認
    await expect(page.locator("canvas")).toBeVisible();

    // パフォーマンス監視の確認
    await expect(
      page.locator('[data-testid="performance-monitor"]'),
    ).toBeVisible();
  });

  test("should handle WebGL not supported", async ({ page, context }) => {
    // WebGLを無効化
    await context.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        value: () => null,
      });
    });

    await page.goto("/portfolio/playground/WebGL");

    // エラーメッセージの確認
    await expect(
      page.locator('[data-testid="webgl-not-supported"]'),
    ).toBeVisible();
  });

  test("should adjust quality based on performance", async ({ page }) => {
    await page.goto("/portfolio/playground/WebGL");

    // 実験を選択
    await page.click('[data-testid="experiment-particle-system"]');

    // パフォーマンス設定を低品質に変更
    await page.selectOption('[data-testid="quality-select"]', "low");

    // 設定の反映確認
    await expect(page.locator('[data-testid="current-quality"]')).toContainText(
      "Low",
    );
  });
});
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. WebGLコンテキスト喪失

```typescript
const handleContextLoss = (event: Event) => {
  event.preventDefault();
  console.warn("WebGL context lost");

  // リソースのクリーンアップ
  cleanupWebGLResources();

  // ユーザーに通知
  showNotification("WebGL context was lost. Reloading...", "warning");
};

const handleContextRestore = () => {
  console.log("WebGL context restored");

  // WebGLの再初期化
  reinitializeWebGL();

  showNotification("WebGL context restored", "success");
};

// イベントリスナーの設定
canvas.addEventListener("webglcontextlost", handleContextLoss);
canvas.addEventListener("webglcontextrestored", handleContextRestore);
```

#### 2. シェーダーコンパイルエラー

```typescript
const compileShader = (
  gl: WebGLRenderingContext,
  source: string,
  type: number,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    console.error("Shader compilation error:", error);
    console.error("Shader source:", source);

    gl.deleteShader(shader);
    return null;
  }

  return shader;
};
```

#### 3. メモリリーク

```typescript
const cleanupWebGLResources = () => {
  // ジオメトリの解放
  geometries.forEach((geometry) => {
    geometry.dispose();
  });

  // マテリアルの解放
  materials.forEach((material) => {
    material.dispose();
  });

  // テクスチャの解放
  textures.forEach((texture) => {
    texture.dispose();
  });

  // レンダラーの解放
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }

  // 配列のクリア
  geometries.length = 0;
  materials.length = 0;
  textures.length = 0;
};
```

#### 4. パフォーマンス問題

```typescript
const optimizeForLowPerformance = () => {
  // 解像度を下げる
  renderer.setPixelRatio(0.5);

  // シャドウを無効化
  renderer.shadowMap.enabled = false;

  // アンチエイリアシングを無効化
  renderer.antialias = false;

  // パーティクル数を減らす
  particleCount = Math.floor(particleCount * 0.5);

  // フレームレートを制限
  targetFPS = 30;
};
```

### デバッグツール

#### WebGL Inspector の使用

```typescript
const enableWebGLDebugging = () => {
  if (process.env.NODE_ENV === "development") {
    // WebGL Inspector の有効化
    const script = document.createElement("script");
    script.src = "https://benvanik.github.io/WebGL-Inspector/core/embed.js";
    document.head.appendChild(script);
  }
};
```

#### パフォーマンス監視

```typescript
const enablePerformanceMonitoring = () => {
  const stats = new Stats();
  stats.showPanel(0); // FPS
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.begin();

    // レンダリング処理

    stats.end();
    requestAnimationFrame(animate);
  };

  animate();
};
```

## まとめ

このガイドでは、WebGL実験の作成から最適化、デバッグまでの全工程を詳細に説明しました.新しい実験を追加する際は、以下の点に注意してください：

1. **デバイス対応**: 様々なデバイスでの動作を考慮
2. **パフォーマンス**: 適切な最適化とモニタリング
3. **エラーハンドリング**: 堅牢なエラー処理の実装
4. **テスト**: 十分なテストカバレッジの確保
5. **ドキュメント**: 実装の詳細な記録

これらのガイドラインに従うことで、高品質で保守性の高いWebGL実験を作成できます.
