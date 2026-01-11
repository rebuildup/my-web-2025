# Portfolio System TypeScript Types Documentation

## 概要

このドキュメントは、ポートフォリオシステムで使用されるTypeScript型定義の包括的なガイドです.
各型の目的、使用方法、実装例について詳述します.

## 目次

1. [コア型定義](#コア型定義)
2. [ポートフォリオ固有型](#ポートフォリオ固有型)
3. [プレイグラウンド型](#プレイグラウンド型)
4. [パフォーマンス監視型](#パフォーマンス監視型)
5. [ユーティリティ型](#ユーティリティ型)
6. [型安全性のベストプラクティス](#型安全性のベストプラクティス)

## コア型定義

### PortfolioContentItem

ポートフォリオアイテムの基本型定義です.

```typescript
/**
 * ポートフォリオアイテムの完全な型定義
 *
 * @interface PortfolioContentItem
 * @extends ContentItem
 */
interface PortfolioContentItem extends ContentItem {
  // ギャラリー表示プロパティ
  thumbnail: string;
  aspectRatio?: number;
  gridSize?: GridSize;

  // プロジェクト固有プロパティ
  technologies: string[];
  projectType?: ProjectType;

  // SEOメタデータ
  seo: PortfolioSEOData;

  // 検索・関連アイテム
  searchIndex?: SearchIndex;
  relatedItems?: string[];
}
```

**使用例:**

```typescript
const portfolioItem: PortfolioContentItem = {
  id: "web-app-project",
  title: "Modern Web Application",
  description: "A full-stack web application built with React and Node.js",
  thumbnail: "/images/web-app-thumb.jpg",
  aspectRatio: 16 / 9,
  gridSize: "2x1",
  technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  projectType: "web",
  seo: {
    title: "Modern Web Application - Portfolio",
    description:
      "Full-stack web application showcasing modern development practices",
    keywords: ["react", "typescript", "web development"],
    ogImage: "/images/web-app-og.jpg",
    twitterImage: "/images/web-app-twitter.jpg",
    canonical: "https://yoursite.com/portfolio/web-app-project",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
    },
  },
  relatedItems: ["mobile-app-project", "api-project"],
};
```

### PortfolioSEOData

SEO最適化のためのメタデータ型です.

```typescript
/**
 * ポートフォリオアイテムのSEOメタデータ
 *
 * @interface PortfolioSEOData
 */
interface PortfolioSEOData {
  /** ページタイトル（検索エンジン用） */
  title: string;

  /** メタディスクリプション */
  description: string;

  /** SEOキーワード配列 */
  keywords: string[];

  /** Open Graph画像URL */
  ogImage: string;

  /** Twitter Card画像URL */
  twitterImage: string;

  /** 正規URL */
  canonical: string;

  /** 構造化データ（JSON-LD） */
  structuredData: Record<string, any>;
}
```

**実装例:**

```typescript
const generateSEOData = (item: PortfolioContentItem): PortfolioSEOData => {
  return {
    title: `${item.title} - Portfolio | Your Name`,
    description: item.description.substring(0, 160),
    keywords: [...item.technologies, item.category, "portfolio"],
    ogImage: item.thumbnail.replace("/thumb/", "/og/"),
    twitterImage: item.thumbnail.replace("/thumb/", "/twitter/"),
    canonical: `https://yoursite.com/portfolio/${item.id}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      description: item.description,
      creator: {
        "@type": "Person",
        name: "Your Name",
      },
      dateCreated: item.createdAt,
      keywords: item.technologies.join(", "),
    },
  };
};
```

## ポートフォリオ固有型

### GalleryType

ギャラリーの種類を定義する型です.

```typescript
/**
 * ギャラリーページの種類
 */
type GalleryType = "all" | "develop" | "video" | "video&design";

/**
 * ギャラリー設定インターface
 */
interface GalleryConfig {
  type: GalleryType;
  itemsPerPage: number;
  layout: "grid" | "masonry" | "list";
  sortOptions: SortOption[];
  filterOptions: FilterOption[];
}
```

**使用例:**

```typescript
const galleryConfigs: Record<GalleryType, GalleryConfig> = {
  all: {
    type: "all",
    itemsPerPage: 12,
    layout: "grid",
    sortOptions: ["date", "title", "category"],
    filterOptions: ["category", "technology", "year"],
  },
  develop: {
    type: "develop",
    itemsPerPage: 8,
    layout: "grid",
    sortOptions: ["date", "title", "technology"],
    filterOptions: ["technology", "projectType", "year"],
  },
  video: {
    type: "video",
    itemsPerPage: 6,
    layout: "masonry",
    sortOptions: ["date", "title", "client"],
    filterOptions: ["videoType", "client", "year"],
  },
  "video&design": {
    type: "video&design",
    itemsPerPage: 9,
    layout: "masonry",
    sortOptions: ["date", "title"],
    filterOptions: ["category", "year"],
  },
};
```

### FilterOptions

フィルタリング機能の型定義です.

```typescript
/**
 * 基本フィルターオプション
 */
interface FilterOptions {
  category?: string;
  tags?: string[];
  year?: number;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
}

/**
 * 開発プロジェクト用フィルター
 */
interface DevelopFilterOptions extends FilterOptions {
  technologies?: string[];
  projectType?: ProjectType;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/**
 * 映像プロジェクト用フィルター
 */
interface VideoFilterOptions extends FilterOptions {
  videoType?: VideoType;
  client?: string;
  duration?: {
    min?: number;
    max?: number;
  };
}

/**
 * ソートフィールド
 */
type SortField = "createdAt" | "updatedAt" | "title" | "priority" | "views";

/**
 * プロジェクトタイプ
 */
type ProjectType = "web" | "game" | "tool" | "plugin" | "library";

/**
 * 映像タイプ
 */
type VideoType = "mv" | "lyric" | "animation" | "promotion" | "tutorial";
```

**実装例:**

```typescript
const usePortfolioFilter = (initialFilter: FilterOptions) => {
  const [filter, setFilter] = useState<FilterOptions>(initialFilter);

  const updateFilter = useCallback((updates: Partial<FilterOptions>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  return { filter, updateFilter, resetFilter };
};

// 使用例
const DevelopGallery: React.FC = () => {
  const { filter, updateFilter } = usePortfolioFilter({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleTechnologyFilter = (technology: string) => {
    updateFilter({
      technologies: filter.technologies?.includes(technology)
        ? filter.technologies.filter(t => t !== technology)
        : [...(filter.technologies || []), technology]
    });
  };

  return (
    <div>
      {/* フィルターUI */}
      <FilterBar onTechnologySelect={handleTechnologyFilter} />
      {/* ギャラリーコンテンツ */}
    </div>
  );
};
```

## プレイグラウンド型

### ExperimentItem

プレイグラウンド実験の基本型です.

```typescript
/**
 * プレイグラウンド実験の基本インターface
 */
interface ExperimentItem {
  /** 実験の一意識別子 */
  id: string;

  /** 実験のタイトル */
  title: string;

  /** 実験の説明 */
  description: string;

  /** 使用技術の配列 */
  technology: string[];

  /** インタラクティブ要素の有無 */
  interactive: boolean;

  /** 実験コンポーネント */
  component: React.ComponentType<ExperimentComponentProps>;

  /** 実験カテゴリ */
  category: string;

  /** 難易度レベル */
  difficulty: "beginner" | "intermediate" | "advanced";

  /** 作成日時 */
  createdAt: string;

  /** 更新日時 */
  updatedAt: string;
}

/**
 * デザイン実験固有の型
 */
interface DesignExperiment extends ExperimentItem {
  /** デザイン実験のカテゴリ */
  category: "css" | "svg" | "canvas" | "animation";

  /** パフォーマンス要件レベル */
  performanceLevel: "low" | "medium" | "high";

  /** アニメーション設定 */
  animationConfig?: {
    duration: number;
    easing: string;
    loop: boolean;
  };
}

/**
 * WebGL実験固有の型
 */
interface WebGLExperiment extends ExperimentItem {
  /** WebGL実験のタイプ */
  webglType: "3d" | "shader" | "particle" | "effect";

  /** パフォーマンス要件レベル */
  performanceLevel: "low" | "medium" | "high";

  /** シェーダーコード（オプション） */
  shaderCode?: {
    vertex: string;
    fragment: string;
  };

  /** WebGL要件 */
  requirements?: {
    webgl2?: boolean;
    extensions?: string[];
    minTextureSize?: number;
  };
}
```

**実装例:**

```typescript
const rotatingCubeExperiment: WebGLExperiment = {
  id: "rotating-cube-shader",
  title: "Rotating Cube with Custom Shader",
  description: "A 3D cube with custom vertex and fragment shaders",
  technology: ["WebGL", "Three.js", "GLSL"],
  interactive: true,
  component: RotatingCubeComponent,
  category: "shader",
  difficulty: "intermediate",
  webglType: "shader",
  performanceLevel: "medium",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  shaderCode: {
    vertex: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float time;
      varying vec3 vPosition;
      void main() {
        vec3 color = 0.5 + 0.5 * cos(time + vPosition.xyx + vec3(0, 2, 4));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },
  requirements: {
    webgl2: false,
    extensions: [],
    minTextureSize: 512,
  },
};
```

### ExperimentComponentProps

実験コンポーネントのプロパティ型です.

```typescript
/**
 * 実験コンポーネントの共通プロパティ
 */
interface ExperimentComponentProps {
  /** 実験がアクティブかどうか */
  isActive: boolean;

  /** デバイス性能情報 */
  deviceCapabilities: DeviceCapabilities;

  /** パフォーマンス設定 */
  performanceSettings: PerformanceSettings;

  /** パフォーマンス更新コールバック */
  onPerformanceUpdate: (metrics: PerformanceMetrics) => void;

  /** エラーハンドリングコールバック */
  onError: (error: Error) => void;
}

/**
 * WebGL実験コンポーネントの追加プロパティ
 */
interface WebGLExperimentProps extends ExperimentComponentProps {
  /** Three.jsシーン（オプション） */
  scene?: THREE.Scene;

  /** WebGLレンダラー（オプション） */
  renderer?: THREE.WebGLRenderer;

  /** カメラ（オプション） */
  camera?: THREE.Camera;
}
```

## パフォーマンス監視型

### DeviceCapabilities

デバイス性能検出の型定義です.

```typescript
/**
 * デバイス性能情報
 */
interface DeviceCapabilities {
  /** WebGLサポート状況 */
  webglSupport: boolean;

  /** WebGL2サポート状況 */
  webgl2Support: boolean;

  /** 推定パフォーマンスレベル */
  performanceLevel: "low" | "medium" | "high";

  /** タッチサポート */
  touchSupport: boolean;

  /** 最大テクスチャサイズ */
  maxTextureSize: number;

  /** デバイスピクセル比 */
  devicePixelRatio: number;

  /** CPU並列処理数 */
  hardwareConcurrency: number;

  /** 推定メモリ制限（MB） */
  memoryLimit?: number;

  /** GPU情報 */
  gpu?: {
    vendor: string;
    renderer: string;
  };
}

/**
 * パフォーマンス設定
 */
interface PerformanceSettings {
  /** 目標FPS */
  targetFPS: number;

  /** 品質レベル */
  qualityLevel: "low" | "medium" | "high";

  /** 自動最適化の有効/無効 */
  enableOptimizations: boolean;

  /** カスタム設定 */
  customSettings?: {
    pixelRatio?: number;
    shadowsEnabled?: boolean;
    antialiasing?: boolean;
    particleCount?: number;
  };
}

/**
 * パフォーマンス指標
 */
interface PerformanceMetrics {
  /** 現在のFPS */
  fps: number;

  /** フレーム時間（ミリ秒） */
  frameTime: number;

  /** メモリ使用量（MB） */
  memoryUsage: number;

  /** WebGL固有の指標 */
  webgl?: {
    drawCalls: number;
    triangles: number;
    textureMemory: number;
    geometryMemory: number;
  };
}
```

**実装例:**

```typescript
class DeviceCapabilitiesDetector {
  static async detect(): Promise<DeviceCapabilities> {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const gl2 = canvas.getContext("webgl2");

    const capabilities: DeviceCapabilities = {
      webglSupport: !!gl,
      webgl2Support: !!gl2,
      performanceLevel: this.detectPerformanceLevel(gl),
      touchSupport: "ontouchstart" in window,
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
    };

    if (gl) {
      capabilities.gpu = {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
      };
    }

    return capabilities;
  }

  private static detectPerformanceLevel(
    gl: WebGLRenderingContext | null,
  ): "low" | "medium" | "high" {
    if (!gl) return "low";

    const renderer = gl.getParameter(gl.RENDERER).toLowerCase();

    // GPU性能の簡易判定
    if (renderer.includes("intel") && !renderer.includes("iris")) return "low";
    if (renderer.includes("mali") || renderer.includes("adreno"))
      return "medium";
    if (renderer.includes("geforce") || renderer.includes("radeon"))
      return "high";

    return "medium";
  }

  static getRecommendedSettings(
    capabilities: DeviceCapabilities,
  ): PerformanceSettings {
    return {
      targetFPS: capabilities.performanceLevel === "high" ? 60 : 30,
      qualityLevel: capabilities.performanceLevel,
      enableOptimizations: capabilities.performanceLevel !== "high",
      customSettings: {
        pixelRatio:
          capabilities.performanceLevel === "high"
            ? Math.min(capabilities.devicePixelRatio, 2)
            : 1,
        shadowsEnabled: capabilities.performanceLevel !== "low",
        antialiasing: capabilities.performanceLevel === "high",
        particleCount:
          capabilities.performanceLevel === "high"
            ? 10000
            : capabilities.performanceLevel === "medium"
              ? 5000
              : 1000,
      },
    };
  }
}
```

## ユーティリティ型

### 型ガード関数

型安全性を確保するための型ガード関数です.

```typescript
/**
 * PortfolioContentItemの型ガード
 */
function isPortfolioContentItem(item: any): item is PortfolioContentItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.thumbnail === "string" &&
    Array.isArray(item.technologies) &&
    typeof item.seo === "object"
  );
}

/**
 * WebGLExperimentの型ガード
 */
function isWebGLExperiment(
  experiment: ExperimentItem,
): experiment is WebGLExperiment {
  return "webglType" in experiment && "performanceLevel" in experiment;
}

/**
 * DesignExperimentの型ガード
 */
function isDesignExperiment(
  experiment: ExperimentItem,
): experiment is DesignExperiment {
  return (
    "category" in experiment &&
    ["css", "svg", "canvas", "animation"].includes(experiment.category)
  );
}

/**
 * DeviceCapabilitiesの検証
 */
function validateDeviceCapabilities(
  capabilities: any,
): capabilities is DeviceCapabilities {
  return (
    typeof capabilities === "object" &&
    capabilities !== null &&
    typeof capabilities.webglSupport === "boolean" &&
    typeof capabilities.performanceLevel === "string" &&
    ["low", "medium", "high"].includes(capabilities.performanceLevel)
  );
}
```

### 条件付き型

TypeScriptの条件付き型を活用した高度な型定義です.

```typescript
/**
 * ギャラリータイプに基づく条件付きフィルター型
 */
type GalleryFilterOptions<T extends GalleryType> = T extends "develop"
  ? DevelopFilterOptions
  : T extends "video"
    ? VideoFilterOptions
    : T extends "video&design"
      ? VideoDesignFilterOptions
      : FilterOptions;

/**
 * 実験タイプに基づく条件付きプロパティ型
 */
type ExperimentProps<T extends ExperimentItem> = T extends WebGLExperiment
  ? WebGLExperimentProps
  : T extends DesignExperiment
    ? DesignExperimentProps
    : ExperimentComponentProps;

/**
 * パフォーマンスレベルに基づく設定型
 */
type QualitySettings<T extends "low" | "medium" | "high"> = {
  pixelRatio: T extends "high" ? number : 1;
  shadowsEnabled: T extends "low" ? false : boolean;
  particleCount: T extends "high" ? 10000 : T extends "medium" ? 5000 : 1000;
};
```

### マップ型とテンプレートリテラル型

```typescript
/**
 * ギャラリー設定のマップ型
 */
type GalleryConfigMap = {
  [K in GalleryType]: GalleryConfig & {
    type: K;
    specificOptions: K extends "develop"
      ? DevelopSpecificOptions
      : K extends "video"
        ? VideoSpecificOptions
        : K extends "video&design"
          ? VideoDesignSpecificOptions
          : never;
  };
};

/**
 * APIエンドポイントのテンプレートリテラル型
 */
type APIEndpoint =
  | `/api/portfolio/${string}`
  | `/api/gallery/${GalleryType}`
  | `/api/experiments/${string}`
  | `/api/performance/${string}`;

/**
 * イベント名のテンプレートリテラル型
 */
type AnalyticsEvent =
  | `portfolio_${string}_view`
  | `gallery_${GalleryType}_filter`
  | `experiment_${string}_start`
  | `performance_${string}_alert`;
```

## 型安全性のベストプラクティス

### 1. 厳密な型チェック

```typescript
// tsconfig.json での厳密設定
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. 型アサーションの適切な使用

```typescript
// 悪い例
const portfolioItem = data as PortfolioContentItem;

// 良い例
const portfolioItem = isPortfolioContentItem(data) ? data : null;

// さらに良い例（Zodなどのスキーマ検証ライブラリを使用）
import { z } from "zod";

const PortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  technologies: z.array(z.string()),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImage: z.string(),
    twitterImage: z.string(),
    canonical: z.string(),
    structuredData: z.record(z.any()),
  }),
});

type PortfolioContentItem = z.infer<typeof PortfolioItemSchema>;

const parsePortfolioItem = (data: unknown): PortfolioContentItem => {
  return PortfolioItemSchema.parse(data);
};
```

### 3. ジェネリック型の活用

```typescript
/**
 * 汎用的なAPIレスポンス型
 */
interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * ページネーション付きレスポンス型
 */
interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * フィルター付きデータフェッチ関数
 */
async function fetchPortfolioItems<T extends FilterOptions>(
  filter: T,
): Promise<PaginatedResponse<PortfolioContentItem>> {
  const response = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filter),
  });

  return response.json();
}
```

### 4. 型の合成とユニオン型

```typescript
/**
 * 基本的なユニオン型
 */
type Status = "loading" | "success" | "error";

/**
 * 判別可能なユニオン型
 */
type APIState =
  | { status: "loading" }
  | { status: "success"; data: PortfolioContentItem[] }
  | { status: "error"; error: string };

/**
 * 型の合成
 */
type PortfolioItemWithAnalytics = PortfolioContentItem & {
  analytics: {
    views: number;
    likes: number;
    shares: number;
  };
};

/**
 * 部分的な型
 */
type PortfolioItemUpdate = Partial<
  Pick<PortfolioContentItem, "title" | "description" | "technologies">
>;
```

### 5. 型レベルでの制約

```typescript
/**
 * 文字列リテラル型による制約
 */
type AllowedImageFormat = "jpg" | "png" | "webp" | "avif";

interface ImageConfig {
  format: AllowedImageFormat;
  quality: number;
  width: number;
  height: number;
}

/**
 * テンプレートリテラル型による制約
 */
type ImagePath = `/${string}.${AllowedImageFormat}`;

/**
 * 数値範囲の制約（ブランド型）
 */
type Quality = number & { __brand: "Quality" };

function createQuality(value: number): Quality {
  if (value < 0 || value > 100) {
    throw new Error("Quality must be between 0 and 100");
  }
  return value as Quality;
}
```

## まとめ

このドキュメントでは、ポートフォリオシステムで使用される包括的なTypeScript型定義について説明しました.

### 重要なポイント

1. **型安全性**: 厳密な型定義により実行時エラーを防止
2. **保守性**: 明確な型定義により保守性を向上
3. **開発効率**: IDEの支援により開発効率を向上
4. **ドキュメント**: 型定義自体がドキュメントとして機能

### 推奨事項

- 新しい機能を追加する際は、適切な型定義を作成
- 型ガード関数を使用して実行時の型安全性を確保
- ジェネリック型を活用して再利用可能な型を作成
- 条件付き型やマップ型を使用して高度な型制約を実装

これらの型定義を適切に使用することで、堅牢で保守性の高いポートフォリオシステムを構築できます.
