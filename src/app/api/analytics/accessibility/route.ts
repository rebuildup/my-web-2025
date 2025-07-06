import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  tags: string[];
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  score: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

export interface AccessibilityAnalytics {
  reports: AccessibilityReport[];
  summary: {
    totalReports: number;
    avgScore: number;
    totalViolations: number;
    criticalViolations: number;
    seriousViolations: number;
    moderateViolations: number;
    minorViolations: number;
    mostCommonViolations: Array<{
      id: string;
      count: number;
      impact: string;
    }>;
    scoreDistribution: {
      excellent: number; // 90-100
      good: number;      // 70-89
      fair: number;      // 50-69
      poor: number;      // 0-49
    };
  };
}

const ANALYTICS_DIR = join(process.cwd(), 'public', 'data', 'analytics');
const ACCESSIBILITY_FILE = join(ANALYTICS_DIR, 'accessibility.json');

/**
 * Ensure analytics directory exists
 */
function ensureAnalyticsDir(): void {
  if (!existsSync(ANALYTICS_DIR)) {
    mkdirSync(ANALYTICS_DIR, { recursive: true });
  }
}

/**
 * Load existing accessibility data
 */
function loadAccessibilityData(): AccessibilityReport[] {
  ensureAnalyticsDir();
  
  if (!existsSync(ACCESSIBILITY_FILE)) {
    return [];
  }
  
  try {
    const data = readFileSync(ACCESSIBILITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to load accessibility data:', error);
    return [];
  }
}

/**
 * Save accessibility data
 */
function saveAccessibilityData(reports: AccessibilityReport[]): void {
  ensureAnalyticsDir();
  
  try {
    writeFileSync(ACCESSIBILITY_FILE, JSON.stringify(reports, null, 2));
  } catch (error) {
    console.error('Failed to save accessibility data:', error);
  }
}

/**
 * Calculate accessibility summary
 */
function calculateSummary(reports: AccessibilityReport[]): AccessibilityAnalytics['summary'] {
  if (reports.length === 0) {
    return {
      totalReports: 0,
      avgScore: 100,
      totalViolations: 0,
      criticalViolations: 0,
      seriousViolations: 0,
      moderateViolations: 0,
      minorViolations: 0,
      mostCommonViolations: [],
      scoreDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
    };
  }

  // Calculate average score
  const avgScore = reports.reduce((sum, report) => sum + report.score, 0) / reports.length;
  
  // Count violations by impact
  const allViolations = reports.flatMap(report => report.violations);
  const violationCounts = allViolations.reduce((counts, violation) => {
    counts[violation.impact] = (counts[violation.impact] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Find most common violations
  const violationFrequency = allViolations.reduce((freq, violation) => {
    if (!freq[violation.id]) {
      freq[violation.id] = {
        id: violation.id,
        count: 0,
        impact: violation.impact,
      };
    }
    freq[violation.id].count++;
    return freq;
  }, {} as Record<string, { id: string; count: number; impact: string }>);

  const mostCommonViolations = Object.values(violationFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate score distribution
  const scoreDistribution = reports.reduce(
    (dist, report) => {
      if (report.score >= 90) dist.excellent++;
      else if (report.score >= 70) dist.good++;
      else if (report.score >= 50) dist.fair++;
      else dist.poor++;
      return dist;
    },
    { excellent: 0, good: 0, fair: 0, poor: 0 }
  );

  return {
    totalReports: reports.length,
    avgScore: Math.round(avgScore * 100) / 100,
    totalViolations: allViolations.length,
    criticalViolations: violationCounts.critical || 0,
    seriousViolations: violationCounts.serious || 0,
    moderateViolations: violationCounts.moderate || 0,
    minorViolations: violationCounts.minor || 0,
    mostCommonViolations,
    scoreDistribution,
  };
}

/**
 * POST /api/analytics/accessibility
 * Record an accessibility report
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!Array.isArray(body.violations) || typeof body.score !== 'number' || !body.timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate score range
    if (body.score < 0 || body.score > 100) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate violations structure
    for (const violation of body.violations) {
      if (!violation.id || !violation.impact || !violation.description) {
        return NextResponse.json(
          { success: false, error: 'Invalid violation structure' },
          { status: 400 }
        );
      }

      const validImpacts = ['minor', 'moderate', 'serious', 'critical'];
      if (!validImpacts.includes(violation.impact)) {
        return NextResponse.json(
          { success: false, error: 'Invalid violation impact' },
          { status: 400 }
        );
      }
    }

    const report: AccessibilityReport = {
      violations: body.violations,
      passes: body.passes || 0,
      incomplete: body.incomplete || 0,
      score: body.score,
      timestamp: body.timestamp,
      url: body.url || '/',
      userAgent: body.userAgent || 'Unknown',
    };

    // Load existing data
    const existingReports = loadAccessibilityData();
    
    // Add new report
    existingReports.push(report);
    
    // Keep only last 500 reports to prevent excessive storage
    if (existingReports.length > 500) {
      existingReports.splice(0, existingReports.length - 500);
    }
    
    // Save updated data
    saveAccessibilityData(existingReports);

    return NextResponse.json({
      success: true,
      message: 'Accessibility report recorded',
    });
  } catch (error) {
    console.error('Accessibility analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/accessibility
 * Get accessibility analytics summary
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const format = searchParams.get('format') || 'json';
    const url = searchParams.get('url');

    // Load accessibility data
    let allReports = loadAccessibilityData();
    
    // Filter by date range
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    allReports = allReports.filter(report => report.timestamp >= cutoffTime);

    // Filter by URL if specified
    if (url) {
      allReports = allReports.filter(report => report.url === url);
    }

    const analytics: AccessibilityAnalytics = {
      reports: allReports,
      summary: calculateSummary(allReports),
    };

    // Return in requested format
    if (format === 'csv') {
      const csvHeaders = 'Timestamp,URL,Score,Violations,Critical,Serious,Moderate,Minor,UserAgent\n';
      const csvRows = allReports.map(report => {
        const violationsByImpact = report.violations.reduce((counts, v) => {
          counts[v.impact] = (counts[v.impact] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);

        return [
          new Date(report.timestamp).toISOString(),
          `"${report.url || ''}"`,
          report.score,
          report.violations.length,
          violationsByImpact.critical || 0,
          violationsByImpact.serious || 0,
          violationsByImpact.moderate || 0,
          violationsByImpact.minor || 0,
          `"${report.userAgent || ''}"`,
        ].join(',');
      }).join('\n');
      
      return new NextResponse(csvHeaders + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="accessibility-${days}days.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Accessibility analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}