/**
 * Pipeline Monitoring System
 * Provides comprehensive monitoring and alerting for the data processing pipeline
 */

import type {
	PerformanceMetrics,
	PipelineResult,
} from "../portfolio/enhanced-data-pipeline";

// Alert levels
export enum AlertLevel {
	INFO = "info",
	WARNING = "warning",
	ERROR = "error",
	CRITICAL = "critical",
}

// Alert interface
export interface Alert {
	id: string;
	level: AlertLevel;
	message: string;
	timestamp: number;
	source: string;
	metadata?: Record<string, unknown>;
}

// Monitoring configuration
export interface MonitoringConfig {
	enableAlerts: boolean;
	enableMetricsCollection: boolean;
	enablePerformanceTracking: boolean;
	alertThresholds: {
		errorRate: number;
		processingTime: number;
		memoryUsage: number;
		warningRate: number;
	};
	retentionPeriod: number; // in milliseconds
}

// Metrics aggregation
export interface AggregatedMetrics {
	totalProcessingTime: number;
	averageProcessingTime: number;
	totalItemsProcessed: number;
	totalErrors: number;
	totalWarnings: number;
	errorRate: number;
	warningRate: number;
	averageMemoryUsage: number;
	peakMemoryUsage: number;
	cacheHitRate: number;
	lastUpdated: number;
}

/**
 * Pipeline Monitor
 * Monitors pipeline performance and generates alerts
 */
export class PipelineMonitor {
	private config: MonitoringConfig;
	private alerts: Alert[] = [];
	private metricsHistory: PerformanceMetrics[] = [];
	private aggregatedMetrics: AggregatedMetrics;

	constructor(config: Partial<MonitoringConfig> = {}) {
		this.config = {
			enableAlerts: true,
			enableMetricsCollection: true,
			enablePerformanceTracking: true,
			alertThresholds: {
				errorRate: 0.05, // 5%
				processingTime: 30000, // 30 seconds
				memoryUsage: 500 * 1024 * 1024, // 500MB
				warningRate: 0.1, // 10%
			},
			retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
			...config,
		};

		this.aggregatedMetrics = {
			totalProcessingTime: 0,
			averageProcessingTime: 0,
			totalItemsProcessed: 0,
			totalErrors: 0,
			totalWarnings: 0,
			errorRate: 0,
			warningRate: 0,
			averageMemoryUsage: 0,
			peakMemoryUsage: 0,
			cacheHitRate: 0,
			lastUpdated: Date.now(),
		};
	}

	/**
	 * Record pipeline execution metrics
	 */
	recordPipelineExecution<T>(result: PipelineResult<T>): void {
		if (!this.config.enableMetricsCollection) return;

		// Store metrics
		this.metricsHistory.push(result.metrics);
		this.cleanupOldMetrics();

		// Update aggregated metrics
		this.updateAggregatedMetrics(result);

		// Check for alerts
		if (this.config.enableAlerts) {
			this.checkAlerts(result);
		}

		// Log execution summary
		this.logExecutionSummary(result);
	}

	/**
	 * Get current aggregated metrics
	 */
	getAggregatedMetrics(): AggregatedMetrics {
		return { ...this.aggregatedMetrics };
	}

	/**
	 * Get recent alerts
	 */
	getRecentAlerts(level?: AlertLevel, limit: number = 50): Alert[] {
		let filteredAlerts = this.alerts;

		if (level) {
			filteredAlerts = this.alerts.filter((alert) => alert.level === level);
		}

		return filteredAlerts
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	}

	/**
	 * Get performance trends
	 */
	getPerformanceTrends(timeRange: number = 60 * 60 * 1000): {
		processingTimes: number[];
		errorRates: number[];
		memoryUsage: number[];
		timestamps: number[];
	} {
		const cutoff = Date.now() - timeRange;
		const recentMetrics = this.metricsHistory.filter(
			(m) => m.startTime >= cutoff,
		);

		return {
			processingTimes: recentMetrics.map((m) => m.duration || 0),
			errorRates: recentMetrics.map((m) =>
				m.itemsProcessed > 0 ? m.errorsCount / m.itemsProcessed : 0,
			),
			memoryUsage: recentMetrics.map((m) => m.memoryUsage?.heapUsed || 0),
			timestamps: recentMetrics.map((m) => m.startTime),
		};
	}

	/**
	 * Clear all alerts
	 */
	clearAlerts(): void {
		this.alerts = [];
	}

	/**
	 * Clear metrics history
	 */
	clearMetrics(): void {
		this.metricsHistory = [];
		this.resetAggregatedMetrics();
	}

	/**
	 * Update aggregated metrics
	 */
	private updateAggregatedMetrics<T>(result: PipelineResult<T>): void {
		const metrics = result.metrics;

		this.aggregatedMetrics.totalProcessingTime += metrics.duration || 0;
		this.aggregatedMetrics.totalItemsProcessed += metrics.itemsProcessed;
		this.aggregatedMetrics.totalErrors += metrics.errorsCount;
		this.aggregatedMetrics.totalWarnings += metrics.warningsCount;

		// Calculate averages
		const executionCount = this.metricsHistory.length;
		this.aggregatedMetrics.averageProcessingTime =
			this.aggregatedMetrics.totalProcessingTime / executionCount;

		this.aggregatedMetrics.errorRate =
			this.aggregatedMetrics.totalItemsProcessed > 0
				? this.aggregatedMetrics.totalErrors /
					this.aggregatedMetrics.totalItemsProcessed
				: 0;

		this.aggregatedMetrics.warningRate =
			this.aggregatedMetrics.totalItemsProcessed > 0
				? this.aggregatedMetrics.totalWarnings /
					this.aggregatedMetrics.totalItemsProcessed
				: 0;

		// Memory usage
		if (metrics.memoryUsage) {
			const recentMemoryUsages = this.metricsHistory
				.filter((m) => m.memoryUsage)
				.map((m) => m.memoryUsage?.heapUsed)
				.filter((usage): usage is number => typeof usage === "number");

			if (recentMemoryUsages.length > 0) {
				this.aggregatedMetrics.averageMemoryUsage =
					recentMemoryUsages.reduce((sum, usage) => sum + usage, 0) /
					recentMemoryUsages.length;

				this.aggregatedMetrics.peakMemoryUsage = Math.max(
					this.aggregatedMetrics.peakMemoryUsage,
					metrics.memoryUsage.heapUsed,
				);
			}
		}

		// Cache hit rate
		const totalCacheOperations = metrics.cacheHits + metrics.cacheMisses;
		this.aggregatedMetrics.cacheHitRate =
			totalCacheOperations > 0 ? metrics.cacheHits / totalCacheOperations : 0;

		this.aggregatedMetrics.lastUpdated = Date.now();
	}

	/**
	 * Check for alert conditions
	 */
	private checkAlerts<T>(result: PipelineResult<T>): void {
		const metrics = result.metrics;
		const thresholds = this.config.alertThresholds;

		// Error rate alert
		const errorRate =
			metrics.itemsProcessed > 0
				? metrics.errorsCount / metrics.itemsProcessed
				: 0;

		if (errorRate > thresholds.errorRate) {
			this.createAlert(
				AlertLevel.ERROR,
				`High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
				"pipeline-error-rate",
				{ errorRate, threshold: thresholds.errorRate, metrics },
			);
		}

		// Processing time alert
		if (metrics.duration && metrics.duration > thresholds.processingTime) {
			this.createAlert(
				AlertLevel.WARNING,
				`Long processing time: ${metrics.duration}ms`,
				"pipeline-processing-time",
				{ duration: metrics.duration, threshold: thresholds.processingTime },
			);
		}

		// Memory usage alert
		if (
			metrics.memoryUsage &&
			metrics.memoryUsage.heapUsed > thresholds.memoryUsage
		) {
			this.createAlert(
				AlertLevel.WARNING,
				`High memory usage: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
				"pipeline-memory-usage",
				{ memoryUsage: metrics.memoryUsage, threshold: thresholds.memoryUsage },
			);
		}

		// Warning rate alert
		const warningRate =
			metrics.itemsProcessed > 0
				? metrics.warningsCount / metrics.itemsProcessed
				: 0;

		if (warningRate > thresholds.warningRate) {
			this.createAlert(
				AlertLevel.WARNING,
				`High warning rate detected: ${(warningRate * 100).toFixed(2)}%`,
				"pipeline-warning-rate",
				{ warningRate, threshold: thresholds.warningRate },
			);
		}

		// Pipeline failure alert
		if (!result.success) {
			this.createAlert(
				AlertLevel.CRITICAL,
				"Pipeline execution failed",
				"pipeline-failure",
				{ errors: result.errors, metrics },
			);
		}
	}

	/**
	 * Create an alert
	 */
	private createAlert(
		level: AlertLevel,
		message: string,
		source: string,
		metadata?: Record<string, unknown>,
	): void {
		const alert: Alert = {
			id: `${source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			level,
			message,
			timestamp: Date.now(),
			source,
			metadata,
		};

		this.alerts.push(alert);

		// Log alert
		const logLevel =
			level === AlertLevel.CRITICAL || level === AlertLevel.ERROR
				? "error"
				: "warn";
		console[logLevel](
			`[PipelineMonitor] ${level.toUpperCase()}: ${message}`,
			metadata,
		);

		// Keep only recent alerts
		this.cleanupOldAlerts();
	}

	/**
	 * Log execution summary
	 */
	private logExecutionSummary<T>(result: PipelineResult<T>): void {
		const metrics = result.metrics;
		const summary = {
			success: result.success,
			duration: metrics.duration,
			itemsProcessed: metrics.itemsProcessed,
			errors: metrics.errorsCount,
			warnings: metrics.warningsCount,
			memoryUsage: metrics.memoryUsage?.heapUsed
				? `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`
				: "N/A",
			cacheHitRate:
				metrics.cacheHits + metrics.cacheMisses > 0
					? `${Math.round(
							(metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) *
								100,
						)}%`
					: "N/A",
		};

		console.log("[PipelineMonitor] Execution Summary:", summary);
	}

	/**
	 * Clean up old metrics
	 */
	private cleanupOldMetrics(): void {
		const cutoff = Date.now() - this.config.retentionPeriod;
		this.metricsHistory = this.metricsHistory.filter(
			(m) => m.startTime >= cutoff,
		);
	}

	/**
	 * Clean up old alerts
	 */
	private cleanupOldAlerts(): void {
		const cutoff = Date.now() - this.config.retentionPeriod;
		this.alerts = this.alerts.filter((alert) => alert.timestamp >= cutoff);
	}

	/**
	 * Reset aggregated metrics
	 */
	private resetAggregatedMetrics(): void {
		this.aggregatedMetrics = {
			totalProcessingTime: 0,
			averageProcessingTime: 0,
			totalItemsProcessed: 0,
			totalErrors: 0,
			totalWarnings: 0,
			errorRate: 0,
			warningRate: 0,
			averageMemoryUsage: 0,
			peakMemoryUsage: 0,
			cacheHitRate: 0,
			lastUpdated: Date.now(),
		};
	}
}

/**
 * Global pipeline monitor instance
 */
export const pipelineMonitor = new PipelineMonitor();

/**
 * Create a monitoring-enabled pipeline wrapper
 */
export function withMonitoring<
	T extends (...args: unknown[]) => Promise<PipelineResult<unknown>>,
>(pipelineFunction: T, monitor: PipelineMonitor = pipelineMonitor): T {
	return (async (...args: unknown[]) => {
		const result = await pipelineFunction(...args);
		monitor.recordPipelineExecution(result);
		return result;
	}) as T;
}
