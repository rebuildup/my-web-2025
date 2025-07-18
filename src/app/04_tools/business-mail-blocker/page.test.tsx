import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BusinessMailBlockerPage from './page';

// Mock the BusinessMailBlocker component
vi.mock('../components/BusinessMailBlocker', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="business-mail-blocker-component">Business Mail Blocker Component</div>
  ),
}));

// Mock the ToolUsageTracker component
vi.mock('../components/ToolUsageTracker', () => ({
  __esModule: true,
  default: ({ toolId }: { toolId: string }) => (
    <div data-testid="tool-usage-tracker">Tool Usage Tracker: {toolId}</div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
}));

describe('BusinessMailBlockerPage', () => {
  it('should render without crashing', () => {
    const { container } = render(<BusinessMailBlockerPage />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });
});
