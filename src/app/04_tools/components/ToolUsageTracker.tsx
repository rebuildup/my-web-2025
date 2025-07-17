'use client';

import { useEffect } from 'react';
import { trackStat } from '@/lib/stats';

interface ToolUsageTrackerProps {
  toolId: string;
}

/**
 * Component that tracks tool usage statistics
 * This is a hidden component that should be included in tool pages
 */
export default function ToolUsageTracker({ toolId }: ToolUsageTrackerProps) {
  useEffect(() => {
    // Track tool view when component mounts
    const trackToolUsage = async () => {
      try {
        await trackStat('view', toolId);
        console.log(`Tracked usage for tool: ${toolId}`);
      } catch (error) {
        console.error('Failed to track tool usage:', error);
      }
    };

    trackToolUsage();
  }, [toolId]);

  // This component doesn't render anything
  return null;
}
