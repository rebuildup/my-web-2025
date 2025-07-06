import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface PerformanceMetric {
  id: string;
  timestamp: string;
  page: string;
  user_agent?: string;
  metrics: {
    // Core Web Vitals
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    
    // Additional metrics
    dom_content_loaded?: number;
    load_event?: number;
    navigation_type?: string;
    connection_type?: string;
    memory_used?: number;
    
    // Custom metrics
    component_render_time?: number;
    api_response_time?: number;
    bundle_size?: number;
  };
  device_info?: {
    viewport_width?: number;
    viewport_height?: number;
    device_pixel_ratio?: number;
    connection?: string;
  };
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  summary: {
    total_metrics: number;
    avg_lcp: number;
    avg_fid: number;
    avg_cls: number;
    avg_ttfb: number;
    core_web_vitals_score: number;
    last_updated: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const metricData: Omit<PerformanceMetric, 'id' | 'timestamp'> = await request.json();
    
    // Validate required fields
    if (!metricData.page || !metricData.metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: page, metrics' },
        { status: 400 }
      );
    }

    // Create performance directory if it doesn't exist
    const performanceDir = path.join(process.cwd(), 'public', 'data', 'performance');
    if (!fs.existsSync(performanceDir)) {
      fs.mkdirSync(performanceDir, { recursive: true });
    }

    const performanceFile = path.join(performanceDir, 'metrics.json');
    
    // Load existing data
    let performanceData: PerformanceData = {
      metrics: [],
      summary: {
        total_metrics: 0,
        avg_lcp: 0,
        avg_fid: 0,
        avg_cls: 0,
        avg_ttfb: 0,
        core_web_vitals_score: 0,
        last_updated: new Date().toISOString()
      }
    };

    if (fs.existsSync(performanceFile)) {
      const data = fs.readFileSync(performanceFile, 'utf-8');
      performanceData = JSON.parse(data);
    }

    // Create new metric
    const newMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || undefined,
      ...metricData,
    };

    // Add metric to data
    performanceData.metrics.push(newMetric);

    // Calculate summary statistics
    const metrics = performanceData.metrics;
    const validLcp = metrics.filter(m => m.metrics.lcp).map(m => m.metrics.lcp!);
    const validFid = metrics.filter(m => m.metrics.fid).map(m => m.metrics.fid!);
    const validCls = metrics.filter(m => m.metrics.cls).map(m => m.metrics.cls!);
    const validTtfb = metrics.filter(m => m.metrics.ttfb).map(m => m.metrics.ttfb!);

    const avgLcp = validLcp.length > 0 ? validLcp.reduce((a, b) => a + b, 0) / validLcp.length : 0;
    const avgFid = validFid.length > 0 ? validFid.reduce((a, b) => a + b, 0) / validFid.length : 0;
    const avgCls = validCls.length > 0 ? validCls.reduce((a, b) => a + b, 0) / validCls.length : 0;
    const avgTtfb = validTtfb.length > 0 ? validTtfb.reduce((a, b) => a + b, 0) / validTtfb.length : 0;

    // Calculate Core Web Vitals score (simplified)
    const lcpScore = avgLcp <= 2500 ? 100 : avgLcp <= 4000 ? 50 : 0;
    const fidScore = avgFid <= 100 ? 100 : avgFid <= 300 ? 50 : 0;
    const clsScore = avgCls <= 0.1 ? 100 : avgCls <= 0.25 ? 50 : 0;
    const coreWebVitalsScore = Math.round((lcpScore + fidScore + clsScore) / 3);

    performanceData.summary = {
      total_metrics: metrics.length,
      avg_lcp: Math.round(avgLcp),
      avg_fid: Math.round(avgFid),
      avg_cls: Math.round(avgCls * 1000) / 1000, // Round to 3 decimal places
      avg_ttfb: Math.round(avgTtfb),
      core_web_vitals_score: coreWebVitalsScore,
      last_updated: new Date().toISOString()
    };

    // Keep only last 5,000 metrics to prevent file from getting too large
    if (performanceData.metrics.length > 5000) {
      performanceData.metrics = performanceData.metrics.slice(-5000);
    }

    // Save updated data
    fs.writeFileSync(performanceFile, JSON.stringify(performanceData, null, 2));

    return NextResponse.json({ 
      success: true, 
      metric_id: newMetric.id,
      summary: performanceData.summary,
      message: 'Performance metric recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to record performance metric' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d
    const page = searchParams.get('page'); // Filter by page
    const detailed = searchParams.get('detailed') === 'true';
    
    const performanceFile = path.join(process.cwd(), 'public', 'data', 'performance', 'metrics.json');
    
    if (!fs.existsSync(performanceFile)) {
      return NextResponse.json({
        metrics: [],
        summary: {
          total_metrics: 0,
          avg_lcp: 0,
          avg_fid: 0,
          avg_cls: 0,
          avg_ttfb: 0,
          core_web_vitals_score: 0,
          last_updated: new Date().toISOString()
        },
        analysis: {}
      });
    }

    const data = fs.readFileSync(performanceFile, 'utf-8');
    const performanceData: PerformanceData = JSON.parse(data);

    // Filter metrics by timeframe
    const now = new Date();
    const timeframeDays: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30
    };
    
    const daysBack = timeframeDays[timeframe] || 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    let filteredMetrics = performanceData.metrics.filter(metric => 
      new Date(metric.timestamp) >= startDate
    );

    // Filter by page if specified
    if (page) {
      filteredMetrics = filteredMetrics.filter(metric => metric.page === page);
    }

    // Generate analysis
    const analysis = generatePerformanceAnalysis(filteredMetrics);

    const response: any = {
      summary: performanceData.summary,
      timeframe: timeframe,
      total_filtered_metrics: filteredMetrics.length,
      analysis: analysis
    };

    // Include detailed metrics if requested
    if (detailed) {
      response.metrics = filteredMetrics;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

function generatePerformanceAnalysis(metrics: PerformanceMetric[]) {
  if (metrics.length === 0) {
    return {
      core_web_vitals: {},
      page_performance: {},
      device_analysis: {},
      recommendations: []
    };
  }

  // Core Web Vitals analysis
  const lcpValues = metrics.filter(m => m.metrics.lcp).map(m => m.metrics.lcp!);
  const fidValues = metrics.filter(m => m.metrics.fid).map(m => m.metrics.fid!);
  const clsValues = metrics.filter(m => m.metrics.cls).map(m => m.metrics.cls!);
  const fcpValues = metrics.filter(m => m.metrics.fcp).map(m => m.metrics.fcp!);
  const ttfbValues = metrics.filter(m => m.metrics.ttfb).map(m => m.metrics.ttfb!);

  const coreWebVitals = {
    lcp: {
      avg: lcpValues.length > 0 ? Math.round(lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length) : 0,
      p75: lcpValues.length > 0 ? percentile(lcpValues, 75) : 0,
      p95: lcpValues.length > 0 ? percentile(lcpValues, 95) : 0,
      good: lcpValues.filter(v => v <= 2500).length,
      needs_improvement: lcpValues.filter(v => v > 2500 && v <= 4000).length,
      poor: lcpValues.filter(v => v > 4000).length
    },
    fid: {
      avg: fidValues.length > 0 ? Math.round(fidValues.reduce((a, b) => a + b, 0) / fidValues.length) : 0,
      p75: fidValues.length > 0 ? percentile(fidValues, 75) : 0,
      p95: fidValues.length > 0 ? percentile(fidValues, 95) : 0,
      good: fidValues.filter(v => v <= 100).length,
      needs_improvement: fidValues.filter(v => v > 100 && v <= 300).length,
      poor: fidValues.filter(v => v > 300).length
    },
    cls: {
      avg: clsValues.length > 0 ? Math.round((clsValues.reduce((a, b) => a + b, 0) / clsValues.length) * 1000) / 1000 : 0,
      p75: clsValues.length > 0 ? Math.round(percentile(clsValues, 75) * 1000) / 1000 : 0,
      p95: clsValues.length > 0 ? Math.round(percentile(clsValues, 95) * 1000) / 1000 : 0,
      good: clsValues.filter(v => v <= 0.1).length,
      needs_improvement: clsValues.filter(v => v > 0.1 && v <= 0.25).length,
      poor: clsValues.filter(v => v > 0.25).length
    }
  };

  // Page performance breakdown
  const pagePerformance: Record<string, any> = {};
  const pages = [...new Set(metrics.map(m => m.page))];
  
  pages.forEach(page => {
    const pageMetrics = metrics.filter(m => m.page === page);
    const pageLcp = pageMetrics.filter(m => m.metrics.lcp).map(m => m.metrics.lcp!);
    const pageFcp = pageMetrics.filter(m => m.metrics.fcp).map(m => m.metrics.fcp!);
    
    pagePerformance[page] = {
      total_visits: pageMetrics.length,
      avg_lcp: pageLcp.length > 0 ? Math.round(pageLcp.reduce((a, b) => a + b, 0) / pageLcp.length) : 0,
      avg_fcp: pageFcp.length > 0 ? Math.round(pageFcp.reduce((a, b) => a + b, 0) / pageFcp.length) : 0
    };
  });

  // Device analysis
  const deviceWidths = metrics.filter(m => m.device_info?.viewport_width).map(m => m.device_info!.viewport_width!);
  const deviceAnalysis = {
    mobile: deviceWidths.filter(w => w < 768).length,
    tablet: deviceWidths.filter(w => w >= 768 && w < 1024).length,
    desktop: deviceWidths.filter(w => w >= 1024).length,
    avg_viewport_width: deviceWidths.length > 0 ? Math.round(deviceWidths.reduce((a, b) => a + b, 0) / deviceWidths.length) : 0
  };

  // Generate recommendations
  const recommendations = [];
  
  if (coreWebVitals.lcp.avg > 2500) {
    recommendations.push({
      metric: 'LCP',
      severity: coreWebVitals.lcp.avg > 4000 ? 'high' : 'medium',
      issue: 'Largest Contentful Paint is slower than recommended',
      suggestion: 'Optimize images, improve server response times, and consider lazy loading'
    });
  }
  
  if (coreWebVitals.fid.avg > 100) {
    recommendations.push({
      metric: 'FID',
      severity: coreWebVitals.fid.avg > 300 ? 'high' : 'medium',
      issue: 'First Input Delay is affecting user interaction',
      suggestion: 'Reduce JavaScript execution time and optimize third-party scripts'
    });
  }
  
  if (coreWebVitals.cls.avg > 0.1) {
    recommendations.push({
      metric: 'CLS',
      severity: coreWebVitals.cls.avg > 0.25 ? 'high' : 'medium',
      issue: 'Cumulative Layout Shift is causing visual instability',
      suggestion: 'Set explicit dimensions for images and ads, preload fonts'
    });
  }

  return {
    core_web_vitals: coreWebVitals,
    page_performance: pagePerformance,
    device_analysis: deviceAnalysis,
    recommendations: recommendations
  };
}

function percentile(values: number[], p: number): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}