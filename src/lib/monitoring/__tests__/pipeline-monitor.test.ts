/**
 * Tests for pipeline monitoring system
 */

import {
  AlertLevel,
  PipelineMonitor,
  pipelineMonitor,
  withMonitoring,
} from "../pipeline-monitor";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Store original console
const originalConsole = global.console;

// Mock Date.now for consistent timestamps
const mockDateNow = jest.fn();
Date.now = mockDateNow;

// Mock performance metrics and pipeline result types
interface MockPerformanceMetrics {
  startTime: number;
  duration?: number;
  itemsProcessed: number;
  errorsCount: number;
  warningsCount: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
  };
  cacheHits: number;
  cacheMisses: number;
}

interface MockPipelineResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  metrics: MockPerformanceMetrics;
}

describe("Pipeline Monitor", () => {
  let monitor: PipelineMonitor;
  const baseTimestamp = 1640995200000; // 2022-01-01T00:00:00.000Z

  const createMockResult = (
    overrides: Partial<MockPipelineResult<unknown>> = {},
  ): MockPipelineResult<string> => ({
    success: true,
    data: "test data",
    errors: [],
    warnings: [],
    metrics: {
      startTime: baseTimestamp,
      duration: 1000,
      itemsProcessed: 100,
      errorsCount: 0,
      warningsCount: 0,
      memoryUsage: {
        heapUsed: 100 * 1024 * 1024, // 100MB
        heapTotal: 200 * 1024 * 1024, // 200MB
      },
      cacheHits: 80,
      cacheMisses: 20,
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(baseTimestamp);

    // Mock console methods
    global.console = {
      ...originalConsole,
      ...mockConsole,
    };

    monitor = new PipelineMonitor({
      enableAlerts: true,
      enableMetricsCollection: true,
      enablePerformanceTracking: true,
      alertThresholds: {
        errorRate: 0.05,
        processingTime: 30000,
        memoryUsage: 500 * 1024 * 1024,
        warningRate: 0.1,
      },
      retentionPeriod: 24 * 60 * 60 * 1000,
    });
  });

  describe("AlertLevel enum", () => {
    it("should have correct string values", () => {
      expect(AlertLevel.INFO).toBe("info");
      expect(AlertLevel.WARNING).toBe("warning");
      expect(AlertLevel.ERROR).toBe("error");
      expect(AlertLevel.CRITICAL).toBe("critical");
    });
  });

  describe("PipelineMonitor constructor", () => {
    it("should create monitor with default configuration", () => {
      const defaultMonitor = new PipelineMonitor();
      expect(defaultMonitor).toBeDefined();
    });

    it("should merge provided configuration with defaults", () => {
      const customMonitor = new PipelineMonitor({
        enableAlerts: false,
        alertThresholds: {
          errorRate: 0.1,
          processingTime: 60000,
          memoryUsage: 1024 * 1024 * 1024,
          warningRate: 0.2,
        },
      });
      expect(customMonitor).toBeDefined();
    });

    it("should initialize aggregated metrics", () => {
      const metrics = monitor.getAggregatedMetrics();
      expect(metrics).toEqual({
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
        lastUpdated: baseTimestamp,
      });
    });
  });

  describe("recordPipelineExecution", () => {
    it("should record successful pipeline execution", () => {
      const result = createMockResult();

      monitor.recordPipelineExecution(result);

      const metrics = monitor.getAggregatedMetrics();
      expect(metrics.totalProcessingTime).toBe(1000);
      expect(metrics.totalItemsProcessed).toBe(100);
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.totalWarnings).toBe(0);
      expect(metrics.averageProcessingTime).toBe(1000);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.warningRate).toBe(0);
      expect(metrics.cacheHitRate).toBe(0.8);
    });

    it("should log execution summary", () => {
      const result = createMockResult();

      monitor.recordPipelineExecution(result);

      expect(mockConsole.log).toHaveBeenCalledWith(
        "[PipelineMonitor] Execution Summary:",
        expect.objectContaining({
          success: true,
          duration: 1000,
          itemsProcessed: 100,
          errors: 0,
          warnings: 0,
          memoryUsage: "100MB",
          cacheHitRate: "80%",
        }),
      );
    });
  });

  describe("alert generation", () => {
    it("should generate error rate alert", () => {
      const result = createMockResult({
        metrics: {
          startTime: baseTimestamp,
          duration: 1000,
          itemsProcessed: 100,
          errorsCount: 10, // 10% error rate, above 5% threshold
          warningsCount: 0,
          cacheHits: 80,
          cacheMisses: 20,
        },
      });

      monitor.recordPipelineExecution(result);

      const alerts = monitor.getRecentAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].level).toBe(AlertLevel.ERROR);
      expect(alerts[0].message).toContain("High error rate detected: 10.00%");
      expect(alerts[0].source).toBe("pipeline-error-rate");
    });
  });

  describe("global pipeline monitor instance", () => {
    it("should provide global monitor instance", () => {
      expect(pipelineMonitor).toBeDefined();
      expect(pipelineMonitor).toBeInstanceOf(PipelineMonitor);
    });
  });

  describe("withMonitoring wrapper", () => {
    it("should wrap pipeline function with monitoring", async () => {
      const mockPipelineFunction = jest
        .fn()
        .mockResolvedValue(createMockResult());
      const monitoredFunction = withMonitoring(mockPipelineFunction);

      const result = await monitoredFunction("test", "args");

      expect(mockPipelineFunction).toHaveBeenCalledWith("test", "args");
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
