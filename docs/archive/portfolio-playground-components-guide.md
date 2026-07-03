# Portfolio Playground Components Guide

## 概要

このドキュメントは、ポートフォリオプレイグラウンドシステムのコンポーネント構成、実装詳細、使用方法について詳述します.

## 目次

1. [プレイグラウンドシステム概要](#プレイグラウンドシステム概要)
2. [デザインプレイグラウンド](#デザインプレイグラウンド)
3. [WebGLプレイグラウンド](#webglプレイグラウンド)
4. [共通コンポーネント](#共通コンポーネント)
5. [パフォーマンス監視](#パフォーマンス監視)
6. [デバイス対応](#デバイス対応)
7. [エラーハンドリング](#エラーハンドリング)
8. [開発ガイド](#開発ガイド)

## プレイグラウンドシステム概要

### アーキテクチャ

```
Playground System
├── Design Playground (/portfolio/playground/design)
│   ├── CSS Experiments
│   ├── SVG Animations
│   ├── Canvas Graphics
│   └── Interactive Animations
├── WebGL Playground (/portfolio/playground/WebGL)
│   ├── 3D Graphics
│   ├── Shader Experiments
│   ├── Particle Systems
│   └── Interactive 3D Scenes
├── Common Components
│   ├── ResponsiveExperimentGrid
│   ├── ResponsiveFilterBar
│   ├── PerformanceMonitor
│   └── DeviceCapabilitiesDetector
└── Supporting Systems
    ├── Device Detection
    ├── Performance Optimization
    ├── Error Handling
    └── Touch Gesture Support
```

### 主要機能

- **インタラクティブ実験**: マウス、タッチ、キーボード操作対応
- **レスポンシブデザイン**: モバイル・デスクトップ最適化
- **パフォーマンス監視**: リアルタイムFPS・メモリ監視
- **デバイス適応**: 性能に応じた品質調整
- **アクセシビリティ**: WCAG 2.1 AA準拠

## デザインプレイグラウンド

### コンポーネント構成

#### DesignPlaygroundPage (`/src/app/portfolio/playground/design/page.tsx`)

**主要機能:**

- インタラクティブなデザイン実験作品の表示
- CSS、SVG、Canvas を使った視覚的表現
- リアルタイム更新機能
- 実験カテゴリ別フィルター

**Props Interface:**

```typescript
interface DesignPlaygroundProps {
  experiments: DesignExperiment[];
  interactionMode: "mouse" | "touch" | "keyboard";
  deviceCapabilities: DeviceCapabilities;
}

interface DesignExperiment {
  id: string;
  title: string;
  description: string;
  technology: string[];
  interactive: boolean;
  component: React.ComponentType;
  category: "css" | "svg" | "canvas" | "animation";
  difficulty: "beginner" | "intermediate" | "advanced";
  performanceLevel: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}
```

**状態管理:**

```typescript
// デバイス性能検出
const [deviceCapabilities, setDeviceCapabilities] =
  useState<DeviceCapabilities | null>(null);

// パフォーマンス設定
const [performanceSettings, setPerformanceSettings] =
  useState<PerformanceSettings>({
    targetFPS: 60,
    qualityLevel: "medium",
    enableOptimizations: true,
  });

// パフォーマンス指標
const [performanceMetrics, setPerformanceMetrics] =
  useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
  });

// アクティブな実験
const [activeExperiment, setActiveExperiment] = useState<string | null>(null);

// フィルター状態
const [filter, setFilter] = useState<ExperimentFilter>({
  category: undefined,
  difficulty: undefined,
  technology: undefined,
});
```

**主要メソッド:**

1. **デバイス性能初期化**

```typescript
const initializeCapabilities = async () => {
  try {
    const capabilities = await deviceCapabilitiesDetector.getCapabilities();
    setDeviceCapabilities(capabilities);

    const recommendedSettings =
      deviceCapabilitiesDetector.getRecommendedSettings(capabilities);
    setPerformanceSettings(recommendedSettings);

    await preloadCriticalExperiments();
  } catch (error) {
    console.error("Failed to detect device capabilities:", error);
    // フォールバック処理
  }
};
```

2. **パフォーマンス監視**

```typescript
const handlePerformanceUpdate = useCallback(
  (metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);

    // 自動品質調整
    if (
      performanceSettings.enableOptimizations &&
      metrics.fps < performanceSettings.targetFPS * 0.7
    ) {
      setPerformanceSettings((prev) => ({
        ...prev,
        qualityLevel: prev.qualityLevel === "high" ? "medium" : "low",
      }));
    }
  },
  [performanceSettings],
);
```

3. **実験フィルタリング**

```typescript
const filteredExperiments = useMemo(() => {
  return designExperiments.filter((experiment) => {
    if (filter.category && experiment.category !== filter.category)
      return false;
    if (filter.difficulty && experiment.difficulty !== filter.difficulty)
      return false;
    if (
      filter.technology &&
      !experiment.technology.some((tech) =>
        tech.toLowerCase().includes(filter.technology!.toLowerCase()),
      )
    )
      return false;
    return true;
  });
}, [filter]);
```

### 実験コンポーネントの実装

#### 基本構造

```typescript
interface ExperimentComponentProps {
  isActive: boolean;
  deviceCapabilities: DeviceCapabilities;
  performanceSettings: PerformanceSettings;
  onPerformanceUpdate: (metrics: PerformanceMetrics) => void;
  onError: (error: Error) => void;
}

const ExperimentComponent: React.FC<ExperimentComponentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError,
}) => {
  // 実験固有の実装
};
```

#### CSS実験の例

```typescript
const CSSAnimationExperiment: React.FC<ExperimentComponentProps> = ({
  isActive,
  performanceSettings,
  onPerformanceUpdate
}) => {
  const [animationState, setAnimationState] = useState('idle');

  useEffect(() => {
    if (!isActive) return;

    const performanceMonitor = new PerformanceMonitor();
    performanceMonitor.start();

    const interval = setInterval(() => {
      const metrics = performanceMonitor.getMetrics();
      onPerformanceUpdate(metrics);
    }, 1000);

    return () => {
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, [isActive, onPerformanceUpdate]);

  return (
    <div className="experiment-container">
      <div
        className={`animated-element ${animationState}`}
        style={{
          animationDuration: performanceSettings.qualityLevel === 'high' ? '1s' : '2s'
        }}
      >
        {/* アニメーション要素 */}
      </div>
    </div>
  );
};
```

## WebGLプレイグラウンド

### コンポーネント構成

#### WebGLPlaygroundPage (`/src/app/portfolio/playground/WebGL/page.tsx`)

**主要機能:**

- 3DグラフィックスやシェーダーのWebGL実験表示
- Three.js・WebGPU実装とインタラクティブ体験
- デバイス性能に応じた品質調整システム
- フレームレート監視（60fps目標）

**WebGL固有の状態管理:**

```typescript
// WebGL コンテキスト
const [webglContext, setWebglContext] = useState<WebGLRenderingContext | null>(
  null,
);

// Three.js シーン
const [scene, setScene] = useState<THREE.Scene | null>(null);
const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
const [camera, setCamera] = useState<THREE.Camera | null>(null);

// WebGL性能指標
const [webglMetrics, setWebglMetrics] = useState({
  drawCalls: 0,
  triangles: 0,
  textureMemory: 0,
  geometryMemory: 0,
});
```

**WebGL初期化:**

```typescript
const initializeWebGL = useCallback(async () => {
  try {
    // WebGL対応チェック
    if (!deviceCapabilities?.webglSupport) {
      throw new Error("WebGL not supported");
    }

    // Three.js セットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: performanceSettings.qualityLevel !== "low",
      powerPreference: "high-performance",
    });

    // パフォーマンス設定適用
    renderer.setPixelRatio(
      performanceSettings.qualityLevel === "high"
        ? Math.min(window.devicePixelRatio, 2)
        : 1,
    );

    setScene(scene);
    setRenderer(renderer);
    setCamera(camera);
  } catch (error) {
    onError(error as Error);
  }
}, [deviceCapabilities, performanceSettings, onError]);
```

### WebGL実験コンポーネントの実装

#### 基本WebGL実験構造

```typescript
interface WebGLExperimentProps extends ExperimentComponentProps {
  scene?: THREE.Scene;
  renderer?: THREE.WebGLRenderer;
  camera?: THREE.Camera;
}

const WebGLExperiment: React.FC<WebGLExperimentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  scene,
  renderer,
  camera,
  onPerformanceUpdate,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !scene || !renderer || !camera) return;

    const animate = () => {
      const startTime = performance.now();

      // レンダリング
      renderer.render(scene, camera);

      // パフォーマンス計測
      const endTime = performance.now();
      const frameTime = endTime - startTime;
      const fps = Math.round(1000 / frameTime);

      onPerformanceUpdate({
        fps,
        frameTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, scene, renderer, camera, onPerformanceUpdate]);

  return <canvas ref={canvasRef} className="webgl-canvas" />;
};
```

#### シェーダー実験の例

```typescript
const ShaderExperiment: React.FC<WebGLExperimentProps> = (props) => {
  const [shaderMaterial, setShaderMaterial] = useState<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    if (!props.scene) return;

    // カスタムシェーダー
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
      varying vec2 vUv;

      void main() {
        vec2 st = gl_FragCoord.xy / resolution.xy;
        vec3 color = vec3(sin(time + st.x), cos(time + st.y), sin(time * 2.0));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      }
    });

    setShaderMaterial(material);

    // ジオメトリとメッシュ作成
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    props.scene.add(mesh);

    return () => {
      props.scene?.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [props.scene]);

  // アニメーションループでuniform更新
  useEffect(() => {
    if (!shaderMaterial) return;

    const updateUniforms = () => {
      shaderMaterial.uniforms.time.value = performance.now() * 0.001;
    };

    const interval = setInterval(updateUniforms, 16); // 60fps
    return () => clearInterval(interval);
  }, [shaderMaterial]);

  return <WebGLExperiment {...props} />;
};
```

## 共通コンポーネント

### ResponsiveExperimentGrid

**機能:**

- 実験一覧のレスポンシブグリッド表示
- タッチ・マウス操作対応
- アクセシビリティ対応

```typescript
interface ResponsiveExperimentGridProps {
  experiments: (DesignExperiment | WebGLExperiment)[];
  activeExperiment: string | null;
  onExperimentSelect: (id: string) => void;
}

const ResponsiveExperimentGrid: React.FC<ResponsiveExperimentGridProps> = ({
  experiments,
  activeExperiment,
  onExperimentSelect
}) => {
  const responsive = useResponsive();

  return (
    <div className={`
      grid gap-4
      ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}
    `}>
      {experiments.map(experiment => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          isActive={activeExperiment === experiment.id}
          onClick={() => onExperimentSelect(experiment.id)}
        />
      ))}
    </div>
  );
};
```

### ResponsiveFilterBar

**機能:**

- 実験フィルタリング機能
- カテゴリ・技術・難易度別絞り込み
- モバイル対応UI

```typescript
interface ResponsiveFilterBarProps {
  filter: ExperimentFilter;
  onFilterChange: (filter: ExperimentFilter) => void;
  availableCategories: string[];
  availableTechnologies: string[];
}

const ResponsiveFilterBar: React.FC<ResponsiveFilterBarProps> = ({
  filter,
  onFilterChange,
  availableCategories,
  availableTechnologies
}) => {
  return (
    <div className="filter-bar space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterSelect
          label="Category"
          value={filter.category}
          options={availableCategories}
          onChange={(category) => onFilterChange({ ...filter, category })}
        />
        <FilterSelect
          label="Technology"
          value={filter.technology}
          options={availableTechnologies}
          onChange={(technology) => onFilterChange({ ...filter, technology })}
        />
        <FilterSelect
          label="Difficulty"
          value={filter.difficulty}
          options={['beginner', 'intermediate', 'advanced']}
          onChange={(difficulty) => onFilterChange({ ...filter, difficulty })}
        />
      </div>
    </div>
  );
};
```

## パフォーマンス監視

### PerformanceMonitor クラス

```typescript
class PerformanceMonitor {
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;

  start(): void {
    this.startTime = performance.now();
    this.frameCount = 0;
  }

  recordFrame(): void {
    this.frameCount++;
    this.lastFrameTime = performance.now();
  }

  getMetrics(): PerformanceMetrics {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const fps = Math.round((this.frameCount * 1000) / elapsed);
    const frameTime = currentTime - this.lastFrameTime;

    return {
      fps,
      frameTime,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }
}
```

### パフォーマンス最適化戦略

1. **品質レベル調整**

```typescript
const adjustQualityLevel = (
  currentFPS: number,
  targetFPS: number,
): QualityLevel => {
  if (currentFPS < targetFPS * 0.5) return "low";
  if (currentFPS < targetFPS * 0.8) return "medium";
  return "high";
};
```

2. **リソース管理**

```typescript
const cleanupResources = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (object.material instanceof THREE.Material) {
        object.material.dispose();
      }
    }
  });
};
```

## デバイス対応

### DeviceCapabilitiesDetector

```typescript
class DeviceCapabilitiesDetector {
  async getCapabilities(): Promise<DeviceCapabilities> {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const gl2 = canvas.getContext("webgl2");

    return {
      webglSupport: !!gl,
      webgl2Support: !!gl2,
      performanceLevel: this.detectPerformanceLevel(),
      touchSupport: "ontouchstart" in window,
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      memoryLimit: this.estimateMemoryLimit(),
    };
  }

  private detectPerformanceLevel(): "low" | "medium" | "high" {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) return "low";

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);

    // GPU性能判定ロジック
    if (renderer.includes("Intel") && !renderer.includes("Iris")) return "low";
    if (renderer.includes("Mali") || renderer.includes("Adreno"))
      return "medium";
    if (renderer.includes("GeForce") || renderer.includes("Radeon"))
      return "high";

    return "medium";
  }

  getRecommendedSettings(
    capabilities: DeviceCapabilities,
  ): PerformanceSettings {
    return {
      targetFPS: capabilities.performanceLevel === "high" ? 60 : 30,
      qualityLevel: capabilities.performanceLevel,
      enableOptimizations: capabilities.performanceLevel !== "high",
    };
  }
}
```

## エラーハンドリング

### WebGLエラー処理

```typescript
const handleWebGLError = (error: Error, context: string) => {
  console.error(`WebGL Error in ${context}:`, error);

  // エラー種別による処理分岐
  if (error.message.includes("context lost")) {
    // WebGLコンテキスト喪失
    return handleContextLoss();
  }

  if (error.message.includes("out of memory")) {
    // メモリ不足
    return handleOutOfMemory();
  }

  // 一般的なエラー
  return showErrorFallback(error);
};

const handleContextLoss = () => {
  // コンテキスト復旧処理
  return {
    type: "context_loss",
    message: "WebGL context was lost. Attempting to restore...",
    recovery: () => reinitializeWebGL(),
  };
};
```

### エラーバウンダリ

```typescript
class PlaygroundErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Playground Error:', error, errorInfo);

    // エラー報告
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>実験の読み込みに失敗しました</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            再試行
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 開発ガイド

### 新しい実験の追加

1. **実験データの定義**

```typescript
// src/components/playground/design-experiments/experiments-data.ts
export const newExperiment: DesignExperiment = {
  id: "new-experiment",
  title: "New Experiment",
  description: "Description of the experiment",
  technology: ["CSS", "JavaScript"],
  interactive: true,
  category: "animation",
  difficulty: "intermediate",
  performanceLevel: "medium",
  component: NewExperimentComponent,
  createdAt: "2025-01-01",
  updatedAt: "2025-01-01",
};
```

2. **コンポーネントの実装**

```typescript
// src/components/playground/design-experiments/NewExperimentComponent.tsx
const NewExperimentComponent: React.FC<ExperimentComponentProps> = ({
  isActive,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError
}) => {
  // 実験の実装
  return (
    <div className="experiment-container">
      {/* 実験内容 */}
    </div>
  );
};
```

3. **実験データへの追加**

```typescript
// experiments-data.ts に追加
export const designExperiments = [
  // 既存の実験...
  newExperiment,
];
```

### WebGL実験の追加

1. **WebGL実験の基本構造**

```typescript
const NewWebGLExperiment: React.FC<WebGLExperimentProps> = ({
  isActive,
  scene,
  renderer,
  camera,
  deviceCapabilities,
  performanceSettings,
  onPerformanceUpdate,
  onError,
}) => {
  useEffect(() => {
    if (!isActive || !scene) return;

    // Three.js オブジェクトの作成
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    // アニメーションループ
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      if (renderer && camera) {
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      scene.remove(cube);
      geometry.dispose();
      material.dispose();
    };
  }, [isActive, scene, renderer, camera]);

  return null; // Three.js が直接レンダリング
};
```

### テストの追加

1. **コンポーネントテスト**

```typescript
// __tests__/NewExperiment.test.tsx
describe('NewExperiment', () => {
  it('should render correctly', () => {
    const props = {
      isActive: true,
      deviceCapabilities: mockDeviceCapabilities,
      performanceSettings: mockPerformanceSettings,
      onPerformanceUpdate: jest.fn(),
      onError: jest.fn()
    };

    render(<NewExperimentComponent {...props} />);

    expect(screen.getByTestId('experiment-container')).toBeInTheDocument();
  });

  it('should handle performance updates', () => {
    const onPerformanceUpdate = jest.fn();
    // テスト実装
  });
});
```

2. **E2Eテスト**

```typescript
// e2e/playground.spec.ts
test("should load new experiment", async ({ page }) => {
  await page.goto("/portfolio/playground/design");

  await page.click('[data-testid="experiment-new-experiment"]');

  await expect(page.locator(".experiment-container")).toBeVisible();
});
```

### パフォーマンス最適化のベストプラクティス

1. **メモリ管理**
   - Three.js リソースの適切な dispose
   - イベントリスナーのクリーンアップ
   - アニメーションフレームのキャンセル

2. **レンダリング最適化**
   - 不要な再レンダリングの防止
   - useMemo/useCallback の適切な使用
   - 条件付きレンダリング

3. **WebGL最適化**
   - テクスチャサイズの動的調整
   - LOD（Level of Detail）の実装
   - フラストラムカリング

### デバッグとトラブルシューティング

1. **パフォーマンス問題**
   - Chrome DevTools Performance タブ
   - Three.js Stats.js の使用
   - メモリリークの検出

2. **WebGLエラー**
   - WebGL Inspector の使用
   - シェーダーコンパイルエラーの確認
   - コンテキスト喪失の処理

3. **モバイル対応**
   - デバイス固有の制限事項
   - タッチイベントの処理
   - パフォーマンス制約

## まとめ

このガイドでは、ポートフォリオプレイグラウンドシステムの全体的な構成と実装詳細を説明しました.新しい実験の追加、パフォーマンス最適化、エラーハンドリングなど、開発・保守に必要な情報を網羅しています.

システムの拡張や改善を行う際は、このドキュメントを参考に、一貫性のある実装を心がけてください.
