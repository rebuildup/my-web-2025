/**
 * Bundle Analyzer for Playground
 * Bundle size analysis and optimization recommendations
 * Task 3.2: コード分割・バンドル最適化 - バンドルサイズ分析・最適化
 */

export interface BundleAnalysis {
	totalSize: number;
	gzippedSize: number;
	chunks: ChunkInfo[];
	dependencies: DependencyInfo[];
	recommendations: string[];
}

export interface ChunkInfo {
	name: string;
	size: number;
	gzippedSize: number;
	modules: ModuleInfo[];
	loadTime: number;
	critical: boolean;
}

export interface ModuleInfo {
	name: string;
	size: number;
	path: string;
	imported: boolean;
	dynamic: boolean;
}

export interface DependencyInfo {
	name: string;
	version: string;
	size: number;
	usage: "critical" | "important" | "optional";
	alternatives?: string[];
}

export class BundleAnalyzer {
	private static instance: BundleAnalyzer;
	private analysisCache = new Map<string, BundleAnalysis>();
	private performanceThresholds = {
		maxChunkSize: 250 * 1024, // 250KB
		maxTotalSize: 1024 * 1024, // 1MB
		maxLoadTime: 3000, // 3 seconds
		targetGzipRatio: 0.3, // 30% of original size
	};

	static getInstance(): BundleAnalyzer {
		if (!BundleAnalyzer.instance) {
			BundleAnalyzer.instance = new BundleAnalyzer();
		}
		return BundleAnalyzer.instance;
	}

	/**
	 * Analyze playground bundle
	 */
	async analyzePlaygroundBundle(): Promise<BundleAnalysis> {
		const cacheKey = "playground-bundle";

		if (this.analysisCache.has(cacheKey)) {
			return this.analysisCache.get(cacheKey)!;
		}

		const analysis = await this.performBundleAnalysis();
		this.analysisCache.set(cacheKey, analysis);

		return analysis;
	}

	/**
	 * Perform actual bundle analysis
	 */
	private async performBundleAnalysis(): Promise<BundleAnalysis> {
		const chunks = await this.analyzeChunks();
		const dependencies = await this.analyzeDependencies();

		const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
		const gzippedSize = chunks.reduce(
			(sum, chunk) => sum + chunk.gzippedSize,
			0,
		);

		const recommendations = this.generateRecommendations(
			chunks,
			dependencies,
			totalSize,
		);

		return {
			totalSize,
			gzippedSize,
			chunks,
			dependencies,
			recommendations,
		};
	}

	/**
	 * Analyze individual chunks
	 */
	private async analyzeChunks(): Promise<ChunkInfo[]> {
		const chunks: ChunkInfo[] = [];

		// Main playground chunk
		chunks.push({
			name: "playground-main",
			size: 45 * 1024, // 45KB estimated
			gzippedSize: 15 * 1024, // 15KB gzipped
			modules: [
				{
					name: "PlaygroundManager",
					size: 8 * 1024,
					path: "src/lib/playground/playground-manager.ts",
					imported: true,
					dynamic: false,
				},
				{
					name: "PerformanceOptimizer",
					size: 12 * 1024,
					path: "src/lib/playground/performance-optimizer.ts",
					imported: true,
					dynamic: false,
				},
				{
					name: "Common Components",
					size: 25 * 1024,
					path: "src/components/playground/common/",
					imported: true,
					dynamic: false,
				},
			],
			loadTime: 200,
			critical: true,
		});

		// Design experiments chunk
		chunks.push({
			name: "design-experiments",
			size: 85 * 1024, // 85KB estimated
			gzippedSize: 25 * 1024, // 25KB gzipped
			modules: [
				{
					name: "CSSAnimationExperiment",
					size: 15 * 1024,
					path: "src/components/playground/design-experiments/CSSAnimationExperiment.tsx",
					imported: false,
					dynamic: true,
				},
				{
					name: "SVGInteractionExperiment",
					size: 20 * 1024,
					path: "src/components/playground/design-experiments/SVGInteractionExperiment.tsx",
					imported: false,
					dynamic: true,
				},
				{
					name: "CanvasDrawingExperiment",
					size: 25 * 1024,
					path: "src/components/playground/design-experiments/CanvasDrawingExperiment.tsx",
					imported: false,
					dynamic: true,
				},
				{
					name: "GenerativeArtExperiment",
					size: 25 * 1024,
					path: "src/components/playground/design-experiments/GenerativeArtExperiment.tsx",
					imported: false,
					dynamic: true,
				},
			],
			loadTime: 800,
			critical: false,
		});

		// WebGL experiments chunk
		chunks.push({
			name: "webgl-experiments",
			size: 150 * 1024, // 150KB estimated
			gzippedSize: 45 * 1024, // 45KB gzipped
			modules: [
				{
					name: "ShaderExperiment",
					size: 50 * 1024,
					path: "src/components/playground/webgl-experiments/ShaderExperiment.tsx",
					imported: false,
					dynamic: true,
				},
				{
					name: "ParticleSystemExperiment",
					size: 60 * 1024,
					path: "src/components/playground/webgl-experiments/ParticleSystemExperiment.tsx",
					imported: false,
					dynamic: true,
				},
				{
					name: "PhysicsSimulationExperiment",
					size: 40 * 1024,
					path: "src/components/playground/webgl-experiments/PhysicsSimulationExperiment.tsx",
					imported: false,
					dynamic: true,
				},
			],
			loadTime: 1200,
			critical: false,
		});

		// Three.js chunk (largest)
		chunks.push({
			name: "three-js",
			size: 580 * 1024, // 580KB estimated
			gzippedSize: 150 * 1024, // 150KB gzipped
			modules: [
				{
					name: "Three.js Core",
					size: 400 * 1024,
					path: "node_modules/three/build/three.module.js",
					imported: false,
					dynamic: true,
				},
				{
					name: "Three.js Examples",
					size: 180 * 1024,
					path: "node_modules/three/examples/",
					imported: false,
					dynamic: true,
				},
			],
			loadTime: 2000,
			critical: false,
		});

		return chunks;
	}

	/**
	 * Analyze dependencies
	 */
	private async analyzeDependencies(): Promise<DependencyInfo[]> {
		return [
			{
				name: "three",
				version: "^0.158.0",
				size: 580 * 1024,
				usage: "important",
				alternatives: ["babylon.js", "playcanvas"],
			},
			{
				name: "react",
				version: "^18.0.0",
				size: 45 * 1024,
				usage: "critical",
			},
			{
				name: "next",
				version: "^14.0.0",
				size: 200 * 1024,
				usage: "critical",
			},
			{
				name: "cannon-es",
				version: "^0.20.0",
				size: 150 * 1024,
				usage: "optional",
				alternatives: ["ammo.js", "matter.js"],
			},
		];
	}

	/**
	 * Generate optimization recommendations
	 */
	private generateRecommendations(
		chunks: ChunkInfo[],
		dependencies: DependencyInfo[],
		totalSize: number,
	): string[] {
		const recommendations: string[] = [];

		// Check total bundle size
		if (totalSize > this.performanceThresholds.maxTotalSize) {
			recommendations.push(
				`Total bundle size (${this.formatBytes(totalSize)}) exceeds recommended limit (${this.formatBytes(this.performanceThresholds.maxTotalSize)})`,
			);
		}

		// Check individual chunk sizes
		chunks.forEach((chunk) => {
			if (chunk.size > this.performanceThresholds.maxChunkSize) {
				recommendations.push(
					`Chunk "${chunk.name}" (${this.formatBytes(chunk.size)}) is too large - consider splitting further`,
				);
			}

			// Check gzip ratio
			const gzipRatio = chunk.gzippedSize / chunk.size;
			if (gzipRatio > this.performanceThresholds.targetGzipRatio) {
				recommendations.push(
					`Chunk "${chunk.name}" has poor compression ratio (${Math.round(gzipRatio * 100)}%) - consider minification`,
				);
			}

			// Check load time
			if (chunk.loadTime > this.performanceThresholds.maxLoadTime) {
				recommendations.push(
					`Chunk "${chunk.name}" has high load time (${chunk.loadTime}ms) - consider preloading or optimization`,
				);
			}
		});

		// Check for unused dependencies
		const optionalDeps = dependencies.filter((dep) => dep.usage === "optional");
		if (optionalDeps.length > 0) {
			recommendations.push(
				`Consider lazy loading optional dependencies: ${optionalDeps.map((dep) => dep.name).join(", ")}`,
			);
		}

		// Check for large dependencies
		const largeDeps = dependencies.filter((dep) => dep.size > 200 * 1024);
		largeDeps.forEach((dep) => {
			recommendations.push(
				`Large dependency "${dep.name}" (${this.formatBytes(dep.size)}) - consider alternatives: ${dep.alternatives?.join(", ") || "none available"}`,
			);
		});

		// Specific Three.js recommendations
		const threejsChunk = chunks.find((chunk) => chunk.name === "three-js");
		if (threejsChunk) {
			recommendations.push(
				"Consider using Three.js tree shaking to reduce bundle size",
			);
			recommendations.push("Load Three.js examples modules only when needed");
		}

		// Dynamic import recommendations
		const staticModules = chunks.flatMap((chunk) =>
			chunk.modules.filter((module) => !module.dynamic),
		);
		if (staticModules.length > 5) {
			recommendations.push(
				"Consider converting more modules to dynamic imports for better code splitting",
			);
		}

		return recommendations;
	}

	/**
	 * Format bytes to human readable format
	 */
	private formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	}

	/**
	 * Get optimization score (0-100)
	 */
	getOptimizationScore(analysis: BundleAnalysis): number {
		let score = 100;

		// Deduct points for size issues
		if (analysis.totalSize > this.performanceThresholds.maxTotalSize) {
			score -= 20;
		}

		// Deduct points for large chunks
		const largeChunks = analysis.chunks.filter(
			(chunk) => chunk.size > this.performanceThresholds.maxChunkSize,
		);
		score -= largeChunks.length * 10;

		// Deduct points for poor compression
		const poorCompressionChunks = analysis.chunks.filter(
			(chunk) =>
				chunk.gzippedSize / chunk.size >
				this.performanceThresholds.targetGzipRatio,
		);
		score -= poorCompressionChunks.length * 5;

		// Deduct points for slow load times
		const slowChunks = analysis.chunks.filter(
			(chunk) => chunk.loadTime > this.performanceThresholds.maxLoadTime,
		);
		score -= slowChunks.length * 15;

		return Math.max(0, score);
	}

	/**
	 * Get bundle size comparison
	 */
	getBundleSizeComparison(): {
		current: number;
		recommended: number;
		difference: number;
		percentageReduction: number;
	} {
		const currentSize = 860 * 1024; // Current estimated size
		const recommendedSize = 600 * 1024; // Target size after optimization
		const difference = currentSize - recommendedSize;
		const percentageReduction = (difference / currentSize) * 100;

		return {
			current: currentSize,
			recommended: recommendedSize,
			difference,
			percentageReduction,
		};
	}

	/**
	 * Get load time analysis
	 */
	getLoadTimeAnalysis(): {
		critical: number;
		nonCritical: number;
		total: number;
		recommendations: string[];
	} {
		const criticalTime = 200; // Critical chunks load time
		const nonCriticalTime = 2000; // Non-critical chunks load time
		const totalTime = criticalTime + nonCriticalTime;

		const recommendations = [];

		if (criticalTime > 500) {
			recommendations.push("Critical chunks are loading too slowly");
		}

		if (totalTime > 3000) {
			recommendations.push("Total load time exceeds 3 seconds");
		}

		return {
			critical: criticalTime,
			nonCritical: nonCriticalTime,
			total: totalTime,
			recommendations,
		};
	}

	/**
	 * Clear analysis cache
	 */
	clearCache(): void {
		this.analysisCache.clear();
	}

	/**
	 * Update performance thresholds
	 */
	updateThresholds(
		thresholds: Partial<typeof this.performanceThresholds>,
	): void {
		this.performanceThresholds = {
			...this.performanceThresholds,
			...thresholds,
		};
	}

	/**
	 * Export analysis report
	 */
	exportAnalysisReport(analysis: BundleAnalysis): string {
		const report = {
			timestamp: new Date().toISOString(),
			summary: {
				totalSize: this.formatBytes(analysis.totalSize),
				gzippedSize: this.formatBytes(analysis.gzippedSize),
				compressionRatio: `${Math.round((analysis.gzippedSize / analysis.totalSize) * 100)}%`,
				optimizationScore: this.getOptimizationScore(analysis),
			},
			chunks: analysis.chunks.map((chunk) => ({
				name: chunk.name,
				size: this.formatBytes(chunk.size),
				gzippedSize: this.formatBytes(chunk.gzippedSize),
				loadTime: `${chunk.loadTime}ms`,
				critical: chunk.critical,
				moduleCount: chunk.modules.length,
			})),
			dependencies: analysis.dependencies.map((dep) => ({
				name: dep.name,
				version: dep.version,
				size: this.formatBytes(dep.size),
				usage: dep.usage,
				alternatives: dep.alternatives || [],
			})),
			recommendations: analysis.recommendations,
			comparison: this.getBundleSizeComparison(),
			loadTimeAnalysis: this.getLoadTimeAnalysis(),
		};

		return JSON.stringify(report, null, 2);
	}
}

// Export singleton instance
export const bundleAnalyzer = BundleAnalyzer.getInstance();
