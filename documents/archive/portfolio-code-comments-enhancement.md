# Portfolio System Code Comments Enhancement

## 概要

このドキュメントは、ポートフォリオシステムのコードコメントと型定義の充実について説明します。
保守性向上とチーム開発効率化のためのコメント規約とベストプラクティスを定義します。

## 目次

1. [コメント規約](#コメント規約)
2. [JSDoc標準](#jsdoc標準)
3. [TypeScript型コメント](#typescript型コメント)
4. [コンポーネントドキュメント](#コンポーネントドキュメント)
5. [API仕様コメント](#api仕様コメント)
6. [実装例](#実装例)

## コメント規約

### 基本原則

1. **目的の明確化**: なぜそのコードが必要なのかを説明
2. **複雑性の解説**: 複雑なロジックの動作原理を説明
3. **制約・前提条件**: 重要な制約や前提条件を明記
4. **TODO・FIXME**: 将来の改善点や既知の問題を記録

### コメントレベル

#### レベル1: ファイルヘッダー

````typescript
/**
 * Portfolio Gallery Component
 *
 * Responsive gallery component for displaying portfolio items with filtering,
 * sorting, and pagination capabilities. Supports multiple layout modes and
 * device-specific optimizations.
 *
 * @fileoverview Main gallery component for portfolio system
 * @version 2.0.0
 * @author Portfolio Team
 * @since 2025-01-01
 *
 * Key Features:
 * - Responsive grid layout with masonry support
 * - Advanced filtering by category, technology, date
 * - Performance-optimized image loading
 * - Accessibility compliance (WCAG 2.1 AA)
 * - SEO-friendly structure
 *
 * Dependencies:
 * - Next.js Image component for optimized loading
 * - Tailwind CSS for responsive styling
 * - React Query for data fetching and caching
 *
 * Usage:
 * ```tsx
 * <PortfolioGallery
 *   type="all"
 *   itemsPerPage={12}
 *   enableFiltering={true}
 * />
 * ```
 */
````

#### レベル2: クラス・関数コメント

````typescript
/**
 * Portfolio data manager for handling CRUD operations
 *
 * Provides centralized data management for portfolio items with caching,
 * validation, and real-time updates. Implements observer pattern for
 * component synchronization.
 *
 * @class PortfolioDataManager
 *
 * @example
 * ```typescript
 * const manager = new PortfolioDataManager();
 * const items = await manager.getItems({ category: 'web' });
 * ```
 */
class PortfolioDataManager {
  /**
   * Retrieves portfolio items with filtering and pagination
   *
   * @param options - Filter and pagination options
   * @param options.category - Filter by category (optional)
   * @param options.tags - Filter by tags array (optional)
   * @param options.page - Page number for pagination (default: 1)
   * @param options.limit - Items per page (default: 10)
   * @returns Promise resolving to paginated portfolio items
   *
   * @throws {ValidationError} When filter options are invalid
   * @throws {NetworkError} When API request fails
   *
   * @example
   * ```typescript
   * const items = await manager.getItems({
   *   category: 'web',
   *   tags: ['react', 'typescript'],
   *   page: 1,
   *   limit: 12
   * });
   * ```
   */
  async getItems(
    options: FilterOptions,
  ): Promise<PaginatedResponse<PortfolioItem>> {
    // Implementation...
  }
}
````

#### レベル3: 複雑なロジックコメント

```typescript
/**
 * WebGL performance optimization algorithm
 *
 * Dynamically adjusts rendering quality based on device capabilities
 * and real-time performance metrics. Uses exponential moving average
 * to smooth FPS fluctuations and prevent quality oscillation.
 */
const optimizeWebGLPerformance = (currentFPS: number, targetFPS: number) => {
  // Calculate performance ratio with smoothing
  // Using exponential moving average (α = 0.1) to reduce noise
  const alpha = 0.1;
  const performanceRatio =
    alpha * (currentFPS / targetFPS) + (1 - alpha) * previousRatio;

  // Apply hysteresis to prevent rapid quality changes
  // Quality only changes when performance deviates by >20%
  if (performanceRatio < 0.8) {
    // Performance below threshold - reduce quality
    return adjustQualityDown();
  } else if (performanceRatio > 1.2 && currentQuality < "high") {
    // Performance above threshold - increase quality
    return adjustQualityUp();
  }

  // Maintain current quality level
  return currentQuality;
};
```

## JSDoc標準

### 基本タグ

```typescript
/**
 * Function description
 *
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {ErrorType} Error condition description
 * @example Example usage
 * @since Version when added
 * @deprecated Deprecation notice
 * @see Related functions or documentation
 * @todo Future improvements
 */
```

### 高度なタグ

````typescript
/**
 * Advanced portfolio search with full-text indexing
 *
 * @async
 * @function searchPortfolioItems
 * @memberof PortfolioSearchEngine
 *
 * @param {string} query - Search query string
 * @param {SearchOptions} [options={}] - Search configuration options
 * @param {string[]} [options.categories] - Limit search to specific categories
 * @param {boolean} [options.fuzzy=true] - Enable fuzzy matching
 * @param {number} [options.maxResults=50] - Maximum number of results
 *
 * @returns {Promise<SearchResult[]>} Array of search results with relevance scores
 *
 * @throws {InvalidQueryError} When query is empty or invalid
 * @throws {SearchIndexError} When search index is corrupted
 *
 * @example
 * ```typescript
 * const results = await searchPortfolioItems('react typescript', {
 *   categories: ['web', 'mobile'],
 *   fuzzy: true,
 *   maxResults: 20
 * });
 * ```
 *
 * @since 2.0.0
 * @see {@link buildSearchIndex} for index construction
 * @see {@link SearchResult} for result structure
 */
````

## TypeScript型コメント

### インターフェース定義

```typescript
/**
 * Portfolio item data structure
 *
 * Represents a single portfolio item with all associated metadata,
 * display properties, and SEO information.
 *
 * @interface PortfolioItem
 * @extends ContentItem
 */
interface PortfolioItem extends ContentItem {
  /**
   * Unique identifier for the portfolio item
   *
   * Format: kebab-case string (e.g., 'web-app-project')
   * Used for URL generation and internal references
   */
  id: string;

  /**
   * Display title for the portfolio item
   *
   * Should be concise but descriptive (max 100 characters)
   * Used in gallery views, page titles, and navigation
   */
  title: string;

  /**
   * Detailed description of the portfolio item
   *
   * Supports markdown formatting for rich text display
   * Used for SEO meta descriptions and item details
   */
  description: string;

  /**
   * Thumbnail image URL for gallery display
   *
   * Should be optimized for web delivery (WebP preferred)
   * Recommended dimensions: 400x300px (4:3 aspect ratio)
   *
   * @example '/images/portfolio/web-app-thumb.webp'
   */
  thumbnail: string;

  /**
   * Array of technologies used in the project
   *
   * Use standardized technology names for consistency
   * Enables filtering and skill-based recommendations
   *
   * @example ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
   */
  technologies: string[];

  /**
   * Project category classification
   *
   * Must match one of the predefined gallery categories
   * Used for navigation and filtering
   */
  category: "web" | "mobile" | "game" | "tool" | "design";

  /**
   * SEO metadata for search engine optimization
   *
   * Contains all necessary information for optimal search visibility
   * and social media sharing
   */
  seo: PortfolioSEOData;

  /**
   * Optional array of related portfolio item IDs
   *
   * Used for generating "Related Projects" recommendations
   * Should contain 3-5 most relevant items
   *
   * @example ['mobile-app-project', 'api-service-project']
   */
  relatedItems?: string[];
}
```

### 型エイリアス

````typescript
/**
 * Gallery layout configuration type
 *
 * Defines the visual layout mode for portfolio galleries.
 * Each mode optimizes for different content types and screen sizes.
 *
 * @typedef {string} GalleryLayout
 *
 * Layout Options:
 * - 'grid': Fixed grid layout with consistent item sizes
 * - 'masonry': Pinterest-style masonry layout for varied content
 * - 'list': Linear list layout for detailed item information
 *
 * @example
 * ```typescript
 * const layout: GalleryLayout = 'masonry';
 * ```
 */
type GalleryLayout = "grid" | "masonry" | "list";

/**
 * Performance quality level enumeration
 *
 * Defines rendering quality levels for WebGL experiments and animations.
 * Automatically selected based on device capabilities and user preferences.
 *
 * @typedef {string} QualityLevel
 *
 * Quality Levels:
 * - 'low': Minimal effects, 30fps target, mobile-optimized
 * - 'medium': Balanced quality, 60fps target, standard features
 * - 'high': Maximum quality, 60+fps target, all features enabled
 */
type QualityLevel = "low" | "medium" | "high";
````

### ジェネリック型

````typescript
/**
 * Generic API response wrapper
 *
 * Provides consistent structure for all API responses with type safety
 * and standardized error handling.
 *
 * @template T - The type of data contained in the response
 *
 * @interface APIResponse
 *
 * @example
 * ```typescript
 * const response: APIResponse<PortfolioItem[]> = await fetchPortfolioItems();
 * if (response.success) {
 *   console.log(response.data); // Type-safe access to PortfolioItem[]
 * }
 * ```
 */
interface APIResponse<T> {
  /**
   * Response data of generic type T
   *
   * Only present when success is true
   * Type is guaranteed to match the expected structure
   */
  data: T;

  /**
   * Indicates whether the request was successful
   *
   * When false, check the errors array for details
   */
  success: boolean;

  /**
   * Human-readable success or error message
   *
   * Can be displayed to users for feedback
   */
  message: string;

  /**
   * Array of detailed error information
   *
   * Only present when success is false
   * Each error includes field-specific validation details
   */
  errors?: ValidationError[];
}
````

## コンポーネントドキュメント

### React コンポーネント

````typescript
/**
 * Portfolio Gallery Component
 *
 * Responsive gallery component for displaying portfolio items with advanced
 * filtering, sorting, and pagination capabilities. Optimized for performance
 * with virtual scrolling and lazy loading.
 *
 * @component
 * @example
 * ```tsx
 * <PortfolioGallery
 *   type="web"
 *   itemsPerPage={12}
 *   enableFiltering={true}
 *   onItemSelect={(item) => router.push(`/portfolio/${item.id}`)}
 * />
 * ```
 */
interface PortfolioGalleryProps {
  /**
   * Gallery type determining which items to display
   *
   * Filters the portfolio items by category and applies
   * type-specific layout optimizations
   *
   * @default 'all'
   */
  type?: GalleryType;

  /**
   * Number of items to display per page
   *
   * Affects pagination and initial load performance
   * Recommended: 12 for grid, 8 for masonry, 20 for list
   *
   * @default 12
   */
  itemsPerPage?: number;

  /**
   * Enable advanced filtering UI
   *
   * Shows filter controls for category, technology, and date
   * Disable for simple gallery displays
   *
   * @default true
   */
  enableFiltering?: boolean;

  /**
   * Callback fired when a portfolio item is selected
   *
   * Typically used for navigation or modal display
   * Receives the complete portfolio item data
   *
   * @param item - The selected portfolio item
   */
  onItemSelect?: (item: PortfolioItem) => void;

  /**
   * Custom CSS class name for styling
   *
   * Applied to the root gallery container
   * Use for theme customization or layout adjustments
   */
  className?: string;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  type = "all",
  itemsPerPage = 12,
  enableFiltering = true,
  onItemSelect,
  className,
}) => {
  // Component implementation with detailed inline comments

  /**
   * Memoized filter function to prevent unnecessary re-renders
   *
   * Filters portfolio items based on current filter state
   * Uses useMemo for performance optimization with large datasets
   */
  const filteredItems = useMemo(() => {
    return portfolioItems.filter((item) => {
      // Category filter
      if (filter.category && item.category !== filter.category) {
        return false;
      }

      // Technology filter (intersection check)
      if (filter.technologies?.length > 0) {
        const hasMatchingTech = filter.technologies.some((tech) =>
          item.technologies.includes(tech),
        );
        if (!hasMatchingTech) return false;
      }

      // Date range filter
      if (filter.dateRange) {
        const itemDate = new Date(item.createdAt);
        if (
          itemDate < filter.dateRange.start ||
          itemDate > filter.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  }, [portfolioItems, filter]);

  // Rest of component implementation...
};
````

### Hook ドキュメント

````typescript
/**
 * Portfolio data fetching and management hook
 *
 * Provides centralized data access with caching, error handling,
 * and real-time updates. Integrates with React Query for optimal
 * performance and user experience.
 *
 * @hook
 *
 * @param options - Configuration options for data fetching
 * @param options.type - Portfolio type to fetch
 * @param options.autoRefresh - Enable automatic data refresh
 * @param options.cacheTime - Cache duration in milliseconds
 *
 * @returns Portfolio data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   loading,
 *   error,
 *   refetch,
 *   updateItem
 * } = usePortfolioData({
 *   type: 'web',
 *   autoRefresh: true
 * });
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     {items.map(item => (
 *       <PortfolioCard key={item.id} item={item} />
 *     ))}
 *   </div>
 * );
 * ```
 */
const usePortfolioData = (options: UsePortfolioDataOptions) => {
  // Hook implementation with detailed comments

  /**
   * React Query configuration for portfolio data fetching
   *
   * Optimized for portfolio use case with appropriate caching
   * and background refresh strategies
   */
  const queryConfig = useMemo(
    () => ({
      queryKey: ["portfolio", options.type, options.filters],
      queryFn: () => fetchPortfolioItems(options),
      staleTime: options.cacheTime || 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: options.autoRefresh,
      retry: (failureCount, error) => {
        // Custom retry logic for different error types
        if (error.status === 404) return false; // Don't retry 404s
        return failureCount < 3; // Retry up to 3 times
      },
    }),
    [options],
  );

  // Rest of hook implementation...
};
````

## API仕様コメント

### API Route ドキュメント

````typescript
/**
 * Portfolio Items API Endpoint
 *
 * Provides CRUD operations for portfolio items with filtering,
 * pagination, and search capabilities.
 *
 * @route GET /api/portfolio
 * @route POST /api/portfolio
 * @route PUT /api/portfolio/[id]
 * @route DELETE /api/portfolio/[id]
 *
 * @version 2.0.0
 * @since 2025-01-01
 */

/**
 * GET /api/portfolio
 *
 * Retrieves portfolio items with optional filtering and pagination
 *
 * @method GET
 * @endpoint /api/portfolio
 *
 * @queryparam {string} [category] - Filter by category
 * @queryparam {string} [tags] - Comma-separated list of tags
 * @queryparam {number} [page=1] - Page number for pagination
 * @queryparam {number} [limit=10] - Items per page
 * @queryparam {string} [sort=createdAt] - Sort field
 * @queryparam {string} [order=desc] - Sort order (asc|desc)
 * @queryparam {string} [search] - Full-text search query
 *
 * @response {200} Success - Returns paginated portfolio items
 * @response {400} Bad Request - Invalid query parameters
 * @response {500} Internal Server Error - Server error
 *
 * @example
 * ```
 * GET /api/portfolio?category=web&page=1&limit=12&sort=createdAt&order=desc
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "web-app-project",
 *       "title": "Modern Web Application",
 *       "description": "Full-stack web application...",
 *       "thumbnail": "/images/web-app-thumb.webp",
 *       "technologies": ["React", "TypeScript", "Node.js"],
 *       "category": "web",
 *       "createdAt": "2025-01-01T00:00:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 12,
 *     "total": 45,
 *     "totalPages": 4
 *   }
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
          errors: [
            { field: "page", message: "Page must be >= 1" },
            { field: "limit", message: "Limit must be between 1 and 100" },
          ],
        },
        { status: 400 },
      );
    }

    // Build filter options
    const filterOptions: FilterOptions = {
      category,
      tags,
      page,
      limit,
      sort: sort as SortField,
      order: order as "asc" | "desc",
      search,
    };

    // Fetch portfolio items with filtering
    const result = await portfolioDataManager.getItems(filterOptions);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Portfolio API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch portfolio items",
        errors: [{ field: "general", message: error.message }],
      },
      { status: 500 },
    );
  }
}
````

## 実装例

### 完全にドキュメント化されたコンポーネント

````typescript
/**
 * WebGL Playground Component
 *
 * Interactive WebGL experiment playground with device-adaptive performance
 * optimization and real-time monitoring. Supports multiple experiment types
 * including 3D graphics, shaders, and particle systems.
 *
 * @component WebGLPlayground
 * @version 2.0.0
 * @since 2025-01-01
 *
 * Features:
 * - Device capability detection and optimization
 * - Real-time performance monitoring and adjustment
 * - Touch gesture support for mobile devices
 * - Accessibility compliance with keyboard navigation
 * - Error boundary with graceful fallbacks
 *
 * Performance Considerations:
 * - Automatically adjusts quality based on device performance
 * - Implements resource cleanup to prevent memory leaks
 * - Uses requestAnimationFrame for smooth animations
 * - Monitors FPS and adjusts rendering complexity
 *
 * @example
 * ```tsx
 * <WebGLPlayground
 *   experiments={webglExperiments}
 *   initialQuality="medium"
 *   enablePerformanceMonitoring={true}
 *   onExperimentChange={(experiment) => {
 *     analytics.track('experiment_selected', { id: experiment.id });
 *   }}
 * />
 * ```
 */
interface WebGLPlaygroundProps {
  /**
   * Array of WebGL experiments to display
   *
   * Each experiment should implement the WebGLExperiment interface
   * and provide its own component for rendering
   *
   * @see WebGLExperiment
   */
  experiments: WebGLExperiment[];

  /**
   * Initial quality level for rendering
   *
   * Will be automatically adjusted based on device performance
   * if enablePerformanceMonitoring is true
   *
   * @default 'medium'
   */
  initialQuality?: QualityLevel;

  /**
   * Enable automatic performance monitoring and adjustment
   *
   * When enabled, monitors FPS and automatically adjusts quality
   * to maintain target performance levels
   *
   * @default true
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Callback fired when active experiment changes
   *
   * Useful for analytics tracking and state management
   *
   * @param experiment - The newly selected experiment
   */
  onExperimentChange?: (experiment: WebGLExperiment) => void;

  /**
   * Callback fired when performance metrics are updated
   *
   * Provides real-time performance data for monitoring
   *
   * @param metrics - Current performance metrics
   */
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}

const WebGLPlayground: React.FC<WebGLPlaygroundProps> = ({
  experiments,
  initialQuality = 'medium',
  enablePerformanceMonitoring = true,
  onExperimentChange,
  onPerformanceUpdate
}) => {
  // State management with detailed comments

  /**
   * Current device capabilities detected on component mount
   *
   * Used to determine optimal settings and filter compatible experiments
   * Null during initial loading phase
   */
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);

  /**
   * Current performance settings applied to experiments
   *
   * Automatically updated based on real-time performance metrics
   * when enablePerformanceMonitoring is true
   */
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    targetFPS: 60,
    qualityLevel: initialQuality,
    enableOptimizations: true
  });

  /**
   * Real-time performance metrics from active experiment
   *
   * Updated every frame during experiment execution
   * Used for automatic quality adjustment
   */
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0
  });

  /**
   * Currently active experiment ID
   *
   * Null when no experiment is selected
   * Used to control experiment rendering and resource management
   */
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);

  /**
   * Device capability detection effect
   *
   * Runs once on component mount to detect WebGL support,
   * performance level, and other device-specific capabilities
   */
  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        const capabilities = await deviceCapabilitiesDetector.getCapabilities();
        setDeviceCapabilities(capabilities);

        // Apply recommended settings based on device capabilities
        const recommendedSettings = deviceCapabilitiesDetector.getRecommendedSettings(capabilities);
        setPerformanceSettings(recommendedSettings);

        console.log('Device capabilities detected:', capabilities);
      } catch (error) {
        console.error('Failed to detect device capabilities:', error);

        // Fallback to safe defaults
        setDeviceCapabilities({
          webglSupport: false,
          webgl2Support: false,
          performanceLevel: 'low',
          touchSupport: false,
          maxTextureSize: 1024,
          devicePixelRatio: 1,
          hardwareConcurrency: 2
        });
      }
    };

    detectCapabilities();
  }, []);

  /**
   * Performance monitoring and automatic quality adjustment
   *
   * Monitors FPS and automatically reduces quality when performance
   * drops below acceptable levels. Uses exponential moving average
   * to smooth out temporary performance spikes.
   */
  const handlePerformanceUpdate = useCallback((metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);

    // Forward metrics to parent component
    onPerformanceUpdate?.(metrics);

    // Automatic quality adjustment
    if (enablePerformanceMonitoring && performanceSettings.enableOptimizations) {
      const targetFPS = performanceSettings.targetFPS;
      const currentFPS = metrics.fps;

      // Apply hysteresis to prevent oscillation
      // Only adjust quality when performance deviates significantly
      if (currentFPS < targetFPS * 0.7 && performanceSettings.qualityLevel !== 'low') {
        console.log(`Performance below threshold (${currentFPS}fps), reducing quality`);

        setPerformanceSettings(prev => ({
          ...prev,
          qualityLevel: prev.qualityLevel === 'high' ? 'medium' : 'low'
        }));
      } else if (currentFPS > targetFPS * 1.2 && performanceSettings.qualityLevel !== 'high') {
        console.log(`Performance above threshold (${currentFPS}fps), increasing quality`);

        setPerformanceSettings(prev => ({
          ...prev,
          qualityLevel: prev.qualityLevel === 'low' ? 'medium' : 'high'
        }));
      }
    }
  }, [enablePerformanceMonitoring, performanceSettings, onPerformanceUpdate]);

  /**
   * Experiment selection handler
   *
   * Updates active experiment and triggers analytics tracking
   * Ensures proper cleanup of previous experiment resources
   */
  const handleExperimentSelect = useCallback((experimentId: string) => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      console.error(`Experiment not found: ${experimentId}`);
      return;
    }

    console.log(`Selecting experiment: ${experiment.title}`);

    setActiveExperiment(experimentId);
    onExperimentChange?.(experiment);

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'experiment_selected', {
        experiment_id: experimentId,
        experiment_title: experiment.title,
        experiment_type: experiment.webglType
      });
    }
  }, [experiments, onExperimentChange]);

  // Loading state during capability detection
  if (!deviceCapabilities) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-foreground">デバイス性能を検出中...</p>
        </div>
      </div>
    );
  }

  // WebGL not supported fallback
  if (!deviceCapabilities.webglSupport) {
    return (
      <div className="bg-base border border-foreground p-8 text-center">
        <h3 className="text-xl font-bold text-primary mb-4">WebGL Not Supported</h3>
        <p className="text-foreground mb-4">
          お使いのブラウザまたはデバイスはWebGLをサポートしていません。
        </p>
        <p className="text-sm text-foreground opacity-70">
          最新のブラウザでアクセスするか、WebGL対応デバイスをご利用ください。
        </p>
      </div>
    );
  }

  // Main component render
  return (
    <div className="webgl-playground">
      {/* Component JSX with detailed comments */}

      {/* Performance monitoring display */}
      <div className="performance-monitor mb-6">
        <h3 className="text-lg font-bold mb-2">Performance Monitor</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{performanceMetrics.fps}</div>
            <div className="text-foreground">FPS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {performanceMetrics.frameTime.toFixed(1)}
            </div>
            <div className="text-foreground">Frame Time (ms)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {performanceMetrics.memoryUsage.toFixed(0)}
            </div>
            <div className="text-foreground">Memory (MB)</div>
          </div>
        </div>
      </div>

      {/* Experiment grid */}
      <div className="experiment-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {experiments.map(experiment => (
          <ExperimentCard
            key={experiment.id}
            experiment={experiment}
            isActive={activeExperiment === experiment.id}
            deviceCapabilities={deviceCapabilities}
            onClick={() => handleExperimentSelect(experiment.id)}
          />
        ))}
      </div>

      {/* Active experiment display */}
      {activeExperiment && (
        <div className="active-experiment bg-base border border-foreground p-6">
          <ExperimentRenderer
            experimentId={activeExperiment}
            deviceCapabilities={deviceCapabilities}
            performanceSettings={performanceSettings}
            onPerformanceUpdate={handlePerformanceUpdate}
            onError={(error) => {
              console.error('Experiment error:', error);
              // Handle experiment errors gracefully
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WebGLPlayground;
````

## まとめ

このドキュメントで定義したコメント規約とベストプラクティスを適用することで、以下の効果が期待できます：

### 開発効率の向上

- コードの理解時間短縮
- 新規メンバーのオンボーディング加速
- デバッグ・トラブルシューティングの効率化

### 保守性の向上

- 変更影響範囲の明確化
- リファクタリング時の安全性向上
- 技術的負債の蓄積防止

### 品質の向上

- 設計意図の明確化
- エラーハンドリングの標準化
- パフォーマンス考慮事項の共有

### チーム協業の促進

- コードレビューの質向上
- 知識共有の促進
- 一貫した開発スタイルの確立

これらの規約を継続的に適用し、定期的に見直すことで、高品質で保守性の高いポートフォリオシステムを維持できます。
