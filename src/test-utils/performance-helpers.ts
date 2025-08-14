/**
 * パフォーマンステスト用ヘルパー関数
 * 要件5.3: レンダリング速度、メモリ使用量、バンドルサイズが検証されること
 */

import { RenderResult } from "@testing-library/react";
import { ReactElement } from "react";

// パフォーマンス測定結果の型定義
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: {
    before: MemoryInfo;
    after: MemoryInfo;
    delta: MemoryInfo;
  };
  componentCount: number;
  domNodeCount: number;
  reRenderCount: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface BundleAnalysis {
  estimatedSize: number;
  componentComplexity: number;
  dependencyCount: number;
  recommendations: string[];
}

/**
 * メモリ使用量の取得
 */
const getMemoryUsage = (): MemoryInfo => {
  if ("memory" in performance) {
    const memory = (performance as { memory: MemoryInfo }).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  // フォールバック値
  return {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  };
};

/**
 * メモリ使用量の差分計算
 */
const calculateMemoryDelta = (
  before: MemoryInfo,
  after: MemoryInfo,
): MemoryInfo => {
  return {
    usedJSHeapSize: after.usedJSHeapSize - before.usedJSHeapSize,
    totalJSHeapSize: after.totalJSHeapSize - before.totalJSHeapSize,
    jsHeapSizeLimit: after.jsHeapSizeLimit - before.jsHeapSizeLimit,
  };
};

/**
 * レンダリングパフォーマンスの測定
 */
export const measureRenderPerformance = async (
  renderFn: () => RenderResult | Promise<RenderResult>,
): Promise<PerformanceMetrics> => {
  // ガベージコレクションを実行（可能な場合）
  if (global.gc) {
    global.gc();
  }

  const memoryBefore = getMemoryUsage();
  const startTime = performance.now();

  // レンダリング実行
  const result = await renderFn();

  const endTime = performance.now();
  const memoryAfter = getMemoryUsage();

  // DOM要素数をカウント
  const domNodeCount = result.container.querySelectorAll("*").length;

  // React要素数を推定（data-reactroot属性を持つ要素から推定）
  const componentCount =
    result.container.querySelectorAll('[data-testid], [class*="component"]')
      .length || 1;

  return {
    renderTime: endTime - startTime,
    memoryUsage: {
      before: memoryBefore,
      after: memoryAfter,
      delta: calculateMemoryDelta(memoryBefore, memoryAfter),
    },
    componentCount,
    domNodeCount,
    reRenderCount: 1, // 初期レンダリングのみ
  };
};

/**
 * 再レンダリングパフォーマンスの測定
 */
export const measureReRenderPerformance = async (
  component: RenderResult,
  updateFn: () => void | Promise<void>,
  iterations: number = 1,
): Promise<PerformanceMetrics> => {
  if (global.gc) {
    global.gc();
  }

  const memoryBefore = getMemoryUsage();
  const startTime = performance.now();

  // 複数回の再レンダリングを実行
  for (let i = 0; i < iterations; i++) {
    await updateFn();
    // 各更新後に少し待機
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const endTime = performance.now();
  const memoryAfter = getMemoryUsage();

  const domNodeCount = component.container.querySelectorAll("*").length;
  const componentCount =
    component.container.querySelectorAll('[data-testid], [class*="component"]')
      .length || 1;

  return {
    renderTime: (endTime - startTime) / iterations, // 平均時間
    memoryUsage: {
      before: memoryBefore,
      after: memoryAfter,
      delta: calculateMemoryDelta(memoryBefore, memoryAfter),
    },
    componentCount,
    domNodeCount,
    reRenderCount: iterations,
  };
};

/**
 * メモリリークの検出
 */
export const detectMemoryLeaks = async (
  renderFn: () => RenderResult,
  iterations: number = 10,
): Promise<{
  hasLeak: boolean;
  memoryGrowth: number;
  iterations: number;
  measurements: MemoryInfo[];
}> => {
  const measurements: MemoryInfo[] = [];

  for (let i = 0; i < iterations; i++) {
    // ガベージコレクション
    if (global.gc) {
      global.gc();
    }

    // レンダリング
    const result = renderFn();

    // メモリ測定
    measurements.push(getMemoryUsage());

    // クリーンアップ
    result.unmount();

    // 少し待機
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // メモリ増加傾向を分析
  const firstMeasurement = measurements[0].usedJSHeapSize;
  const lastMeasurement = measurements[measurements.length - 1].usedJSHeapSize;
  const memoryGrowth = lastMeasurement - firstMeasurement;

  // 10%以上のメモリ増加をリークと判定
  const hasLeak = memoryGrowth > firstMeasurement * 0.1;

  return {
    hasLeak,
    memoryGrowth,
    iterations,
    measurements,
  };
};

/**
 * バンドルサイズの推定
 */
export const estimateBundleSize = (component: ReactElement): BundleAnalysis => {
  const recommendations: string[] = [];
  let estimatedSize = 0;
  let componentComplexity = 0;
  let dependencyCount = 0;

  // コンポーネントの複雑さを分析
  const analyzeComponent = (element: unknown): void => {
    if (!element || typeof element !== "object") return;

    const elementObj = element as {
      props?: { children?: unknown } & Record<string, unknown>;
    };
    componentComplexity++;

    // プロパティの数で複雑さを判定
    if (elementObj.props) {
      const propCount = Object.keys(elementObj.props).length;
      componentComplexity += propCount * 0.1;

      if (propCount > 10) {
        recommendations.push("Consider reducing the number of props");
      }
    }

    // 子要素を再帰的に分析
    if (elementObj.props && elementObj.props.children) {
      const children = Array.isArray(elementObj.props.children)
        ? elementObj.props.children
        : [elementObj.props.children];

      children.forEach((child: unknown) => {
        if (child && typeof child === "object") {
          analyzeComponent(child);
        }
      });
    }
  };

  analyzeComponent(component);

  // 推定サイズ計算（簡易版）
  estimatedSize = componentComplexity * 100; // 1コンポーネントあたり約100バイトと仮定

  // 依存関係の推定
  dependencyCount = Math.ceil(componentComplexity / 5); // 5コンポーネントごとに1つの依存関係と仮定

  // 推奨事項の生成
  if (componentComplexity > 50) {
    recommendations.push(
      "Component is highly complex. Consider breaking it down into smaller components.",
    );
  }

  if (estimatedSize > 10000) {
    recommendations.push(
      "Estimated bundle size is large. Consider code splitting or lazy loading.",
    );
  }

  if (dependencyCount > 10) {
    recommendations.push(
      "High number of estimated dependencies. Review and optimize imports.",
    );
  }

  return {
    estimatedSize,
    componentComplexity,
    dependencyCount,
    recommendations,
  };
};

/**
 * Core Web Vitalsの測定（モック版）
 */
export const measureCoreWebVitals = async (
  component: RenderResult,
): Promise<{
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}> => {
  const startTime = performance.now();

  // LCP（最大コンテンツの描画）をシミュレート
  const images = component.container.querySelectorAll("img");
  const textElements = component.container.querySelectorAll("h1, h2, h3, p");
  const largestElement = Math.max(images.length, textElements.length);
  const lcp = startTime + largestElement * 10; // 要素数に基づく推定

  // FID（初回入力遅延）をシミュレート
  const interactiveElements =
    component.container.querySelectorAll("button, input, a");
  const fid = interactiveElements.length * 2; // インタラクティブ要素数に基づく推定

  // CLS（累積レイアウトシフト）をシミュレート
  const dynamicElements = component.container.querySelectorAll(
    '[style*="position"], [class*="animate"]',
  );
  const cls = dynamicElements.length * 0.01; // 動的要素数に基づく推定

  // FCP（初回コンテンツの描画）をシミュレート
  const contentElements = component.container.querySelectorAll("*");
  const fcp = startTime + contentElements.length * 0.5;

  // TTFB（最初のバイトまでの時間）をシミュレート
  const ttfb = 50; // 固定値（テスト環境では意味がないため）

  return {
    lcp: lcp - startTime,
    fid,
    cls,
    fcp: fcp - startTime,
    ttfb,
  };
};

/**
 * パフォーマンス監査の実行
 */
export const auditPerformance = async (
  component: RenderResult,
  options: {
    measureRender?: boolean;
    measureMemory?: boolean;
    measureWebVitals?: boolean;
    memoryLeakIterations?: number;
  } = {},
): Promise<{
  score: number;
  isPerformant: boolean;
  metrics: {
    render?: PerformanceMetrics;
    memoryLeak?: Awaited<ReturnType<typeof detectMemoryLeaks>>;
    coreWebVitals?: {
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
      ttfb: number;
    };
  };
  recommendations: string[];
}> => {
  const {
    measureRender = true,
    measureMemory = true,
    measureWebVitals = true,
    memoryLeakIterations = 5,
  } = options;

  const metrics: {
    render?: PerformanceMetrics;
    memoryLeak?: Awaited<ReturnType<typeof detectMemoryLeaks>>;
    coreWebVitals?: {
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
      ttfb: number;
    };
  } = {};
  const recommendations: string[] = [];
  let score = 0;
  let maxScore = 0;

  // レンダリングパフォーマンスの測定
  if (measureRender) {
    metrics.render = await measureRenderPerformance(() => component);

    if (metrics.render.renderTime < 16) {
      // 60fps基準
      score += 30;
    } else if (metrics.render.renderTime < 33) {
      // 30fps基準
      score += 20;
    } else {
      recommendations.push(
        `Render time ${metrics.render.renderTime.toFixed(2)}ms is slow. Consider optimization.`,
      );
    }
    maxScore += 30;

    if (metrics.render.domNodeCount > 1000) {
      recommendations.push(
        "High DOM node count. Consider virtualization or component splitting.",
      );
    }
  }

  // メモリリークの検出
  if (measureMemory) {
    metrics.memoryLeak = await detectMemoryLeaks(
      () => component,
      memoryLeakIterations,
    );

    if (!metrics.memoryLeak.hasLeak) {
      score += 25;
    } else {
      recommendations.push(
        `Potential memory leak detected. Memory grew by ${metrics.memoryLeak.memoryGrowth} bytes.`,
      );
    }
    maxScore += 25;
  }

  // Core Web Vitalsの測定
  if (measureWebVitals) {
    const coreWebVitals = await measureCoreWebVitals(component);
    metrics.coreWebVitals = coreWebVitals;

    let webVitalsScore = 0;

    // LCP評価
    if (coreWebVitals.lcp < 2500) {
      webVitalsScore += 11;
    } else if (coreWebVitals.lcp < 4000) {
      webVitalsScore += 6;
    } else {
      recommendations.push(`LCP ${coreWebVitals.lcp.toFixed(2)}ms is slow.`);
    }

    // FID評価
    if (coreWebVitals.fid < 100) {
      webVitalsScore += 11;
    } else if (coreWebVitals.fid < 300) {
      webVitalsScore += 6;
    } else {
      recommendations.push(`FID ${coreWebVitals.fid.toFixed(2)}ms is slow.`);
    }

    // CLS評価
    if (coreWebVitals.cls < 0.1) {
      webVitalsScore += 11;
    } else if (coreWebVitals.cls < 0.25) {
      webVitalsScore += 6;
    } else {
      recommendations.push(`CLS ${coreWebVitals.cls.toFixed(3)} is high.`);
    }

    // FCP評価
    if (coreWebVitals.fcp < 1800) {
      webVitalsScore += 12;
    } else if (coreWebVitals.fcp < 3000) {
      webVitalsScore += 6;
    } else {
      recommendations.push(`FCP ${coreWebVitals.fcp.toFixed(2)}ms is slow.`);
    }

    score += webVitalsScore;
    maxScore += 45;
  }

  const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    score: finalScore,
    isPerformant: finalScore >= 75, // 75%以上で合格
    metrics,
    recommendations,
  };
};
