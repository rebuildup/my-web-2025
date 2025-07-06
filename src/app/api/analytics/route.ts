import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'tool_usage' | 'download' | 'like' | 'share' | 'search' | 'contact_form';
  page?: string;
  tool?: string;
  user_agent?: string;
  timestamp: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  summary: {
    total_events: number;
    unique_sessions: number;
    page_views: number;
    tool_usage: number;
    downloads: number;
    last_updated: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = await request.json();
    
    // Validate event type
    const validTypes = ['page_view', 'tool_usage', 'download', 'like', 'share', 'search', 'contact_form'];
    if (!validTypes.includes(event.type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Create analytics directory if it doesn't exist
    const analyticsDir = path.join(process.cwd(), 'public', 'data', 'analytics');
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }

    const analyticsFile = path.join(analyticsDir, 'events.json');
    
    // Load existing data
    let analyticsData: AnalyticsData = {
      events: [],
      summary: {
        total_events: 0,
        unique_sessions: 0,
        page_views: 0,
        tool_usage: 0,
        downloads: 0,
        last_updated: new Date().toISOString()
      }
    };

    if (fs.existsSync(analyticsFile)) {
      const data = fs.readFileSync(analyticsFile, 'utf-8');
      analyticsData = JSON.parse(data);
    }

    // Create new event
    const newEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      ...event,
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || undefined,
    };

    // Add event to data
    analyticsData.events.push(newEvent);

    // Update summary
    const events = analyticsData.events;
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    
    analyticsData.summary = {
      total_events: events.length,
      unique_sessions: uniqueSessions,
      page_views: events.filter(e => e.type === 'page_view').length,
      tool_usage: events.filter(e => e.type === 'tool_usage').length,
      downloads: events.filter(e => e.type === 'download').length,
      last_updated: new Date().toISOString()
    };

    // Keep only last 10,000 events to prevent file from getting too large
    if (analyticsData.events.length > 10000) {
      analyticsData.events = analyticsData.events.slice(-10000);
    }

    // Save updated data
    fs.writeFileSync(analyticsFile, JSON.stringify(analyticsData, null, 2));

    return NextResponse.json({ 
      success: true, 
      event_id: newEvent.id,
      message: 'Event recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d, 90d
    const type = searchParams.get('type'); // Filter by event type
    
    const analyticsFile = path.join(process.cwd(), 'public', 'data', 'analytics', 'events.json');
    
    if (!fs.existsSync(analyticsFile)) {
      return NextResponse.json({
        events: [],
        summary: {
          total_events: 0,
          unique_sessions: 0,
          page_views: 0,
          tool_usage: 0,
          downloads: 0,
          last_updated: new Date().toISOString()
        },
        timeframe_data: {}
      });
    }

    const data = fs.readFileSync(analyticsFile, 'utf-8');
    const analyticsData: AnalyticsData = JSON.parse(data);

    // Filter events by timeframe
    const now = new Date();
    const timeframeDays: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const daysBack = timeframeDays[timeframe] || 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    let filteredEvents = analyticsData.events.filter(event => 
      new Date(event.timestamp) >= startDate
    );

    // Filter by type if specified
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    // Generate timeframe analytics
    const timeframeData = generateTimeframeData(filteredEvents, daysBack);

    return NextResponse.json({
      events: filteredEvents,
      summary: analyticsData.summary,
      timeframe_data: timeframeData,
      timeframe: timeframe,
      total_filtered_events: filteredEvents.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function generateTimeframeData(events: AnalyticsEvent[], days: number) {
  const data: Record<string, any> = {
    daily_breakdown: [],
    top_pages: {},
    top_tools: {},
    event_types: {},
    hourly_pattern: new Array(24).fill(0),
    user_agents: {}
  };

  // Daily breakdown
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(event => 
      event.timestamp.startsWith(dateStr)
    );
    
    data.daily_breakdown.unshift({
      date: dateStr,
      total_events: dayEvents.length,
      page_views: dayEvents.filter(e => e.type === 'page_view').length,
      tool_usage: dayEvents.filter(e => e.type === 'tool_usage').length,
      downloads: dayEvents.filter(e => e.type === 'download').length
    });
  }

  // Top pages
  events.filter(e => e.page).forEach(event => {
    data.top_pages[event.page!] = (data.top_pages[event.page!] || 0) + 1;
  });

  // Top tools
  events.filter(e => e.tool).forEach(event => {
    data.top_tools[event.tool!] = (data.top_tools[event.tool!] || 0) + 1;
  });

  // Event types
  events.forEach(event => {
    data.event_types[event.type] = (data.event_types[event.type] || 0) + 1;
  });

  // Hourly pattern
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    data.hourly_pattern[hour]++;
  });

  // User agents (basic browser detection)
  events.filter(e => e.user_agent).forEach(event => {
    const ua = event.user_agent!;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    data.user_agents[browser] = (data.user_agents[browser] || 0) + 1;
  });

  return data;
}