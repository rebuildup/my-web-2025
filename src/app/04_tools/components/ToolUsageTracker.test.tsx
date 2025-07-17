import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolUsageTracker from './ToolUsageTracker';
import { trackStat } from '@/lib/stats';

// Mock dependencies
vi.mock('@/lib/stats', () => ({
  trackStat: vi.fn().mockResolvedValue(1),
}));

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ToolUsageTracker', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should track tool usage when mounted', () => {
    render(<ToolUsageTracker toolId="text-counter" />);

    expect(trackStat).toHaveBeenCalledWith('view', 'text-counter');
  });

  it('should log success message when tracking succeeds', async () => {
    render(<ToolUsageTracker toolId="text-counter" />);

    // Wait for useEffect to complete
    await vi.waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Tracked usage for tool: text-counter');
    });
  });

  it('should log error when tracking fails', async () => {
    // Mock trackStat to reject
    (trackStat as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Tracking failed'));

    render(<ToolUsageTracker toolId="text-counter" />);

    // Wait for useEffect to complete
    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to track tool usage:', expect.any(Error));
    });
  });

  it('should not render anything visible', () => {
    const { container } = render(<ToolUsageTracker toolId="text-counter" />);

    expect(container.firstChild).toBeNull();
  });
});
