import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface PerformanceMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceAnalytics {
  metrics: PerformanceMetric[];
  summary: {
    totalSamples: number;
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    avgFCP: number;
    avgTTFB: number;
    avgINP: number;
    goodSamples: number;
    poorSamples: number;
    score: number;
  };
}

const ANALYTICS_DIR = join(process.cwd(), 'public', 'data', 'analytics');
const PERFORMANCE_FILE = join(ANALYTICS_DIR, 'performance.json');

/**
 * Ensure analytics directory exists
 */
function ensureAnalyticsDir(): void {
  if (!existsSync(ANALYTICS_DIR)) {
    mkdirSync(ANALYTICS_DIR, { recursive: true });
  }
}

/**
 * Load existing performance data
 */
function loadPerformanceData(): PerformanceMetric[] {
  ensureAnalyticsDir();
  
  if (!existsSync(PERFORMANCE_FILE)) {
    return [];
  }
  
  try {
    const data = readFileSync(PERFORMANCE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to load performance data:', error);
    return [];
  }
}

/**
 * Save performance data
 */
function savePerformanceData(metrics: PerformanceMetric[]): void {
  ensureAnalyticsDir();
  
  try {
    writeFileSync(PERFORMANCE_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Failed to save performance data:', error);
  }
}

/**
 * Calculate performance summary
 */
function calculateSummary(metrics: PerformanceMetric[]): PerformanceAnalytics['summary'] {
  if (metrics.length === 0) {
    return {
      totalSamples: 0,
      avgLCP: 0,
      avgFID: 0,
      avgCLS: 0,
      avgFCP: 0,
      avgTTFB: 0,
      avgINP: 0,
      goodSamples: 0,
      poorSamples: 0,
      score: 100,
    };
  }

  const byMetric = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = [];
    acc[metric.name].push(metric);
    return acc;
  }, {} as Record<string, PerformanceMetric[]>);

  const avgLCP = byMetric.LCP ? byMetric.LCP.reduce((sum, m) => sum + m.value, 0) / byMetric.LCP.length : 0;
  const avgFID = byMetric.FID ? byMetric.FID.reduce((sum, m) => sum + m.value, 0) / byMetric.FID.length : 0;
  const avgCLS = byMetric.CLS ? byMetric.CLS.reduce((sum, m) => sum + m.value, 0) / byMetric.CLS.length : 0;
  const avgFCP = byMetric.FCP ? byMetric.FCP.reduce((sum, m) => sum + m.value, 0) / byMetric.FCP.length : 0;
  const avgTTFB = byMetric.TTFB ? byMetric.TTFB.reduce((sum, m) => sum + m.value, 0) / byMetric.TTFB.length : 0;
  const avgINP = byMetric.INP ? byMetric.INP.reduce((sum, m) => sum + m.value, 0) / byMetric.INP.length : 0;

  const goodSamples = metrics.filter(m => m.rating === 'good').length;
  const poorSamples = metrics.filter(m => m.rating === 'poor').length;
  const score = Math.round((goodSamples / metrics.length) * 100);

  return {
    totalSamples: metrics.length,
    avgLCP,
    avgFID,
    avgCLS,
    avgFCP,
    avgTTFB,
    avgINP,
    goodSamples,
    poorSamples,
    score,
  };
}

/**
 * POST /api/analytics/performance
 * Record a performance metric
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.value !== 'number' || !body.rating || !body.timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'];
    if (!validMetrics.includes(body.name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric name' },
        { status: 400 }
      );
    }

    // Validate rating
    const validRatings = ['good', 'needs-improvement', 'poor'];
    if (!validRatings.includes(body.rating)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating' },
        { status: 400 }
      );
    }

    const metric: PerformanceMetric = {
      name: body.name,
      value: body.value,
      rating: body.rating,
      timestamp: body.timestamp,
      url: body.url || '/',
      userAgent: body.userAgent || 'Unknown',
    };

    // Load existing data
    const existingMetrics = loadPerformanceData();
    
    // Add new metric
    existingMetrics.push(metric);
    
    // Keep only last 1000 metrics to prevent excessive storage
    if (existingMetrics.length > 1000) {
      existingMetrics.splice(0, existingMetrics.length - 1000);
    }
    
    // Save updated data
    savePerformanceData(existingMetrics);

    return NextResponse.json({
      success: true,
      message: 'Performance metric recorded',
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/performance
 * Get performance analytics summary
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const format = searchParams.get('format') || 'json';

    // Load performance data
    const allMetrics = loadPerformanceData();
    
    // Filter by date range
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const metrics = allMetrics.filter(metric => metric.timestamp >= cutoffTime);

    const analytics: PerformanceAnalytics = {
      metrics,
      summary: calculateSummary(metrics),
    };

    // Return in requested format
    if (format === 'csv') {
      const csvHeaders = 'Timestamp,Name,Value,Rating,URL,UserAgent\n';
      const csvRows = metrics.map(m => 
        `${new Date(m.timestamp).toISOString()},${m.name},${m.value},${m.rating},"${m.url}","${m.userAgent}"`
      ).join('\n');
      
      return new NextResponse(csvHeaders + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="performance-${days}days.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}