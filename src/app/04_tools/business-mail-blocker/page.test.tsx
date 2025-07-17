import React from 'react';
import { render, screen } from '@testing-library/react';
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
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

describe('BusinessMailBlockerPage', () => {
  it('should render the business mail blocker page with title and description', () => {
    render(<BusinessMailBlockerPage />);

    expect(screen.getByText('Business Mail Blocker')).toBeInTheDocument();
    expect(screen.getByText('ビジネスメールブロッカー')).toBeInTheDocument();
  });

  it('should render the business mail blocker component', () => {
    render(<BusinessMailBlockerPage />);

    expect(screen.getByTestId('business-mail-blocker-component')).toBeInTheDocument();
  });

  it('should render the tool usage tracker with correct tool ID', () => {
    render(<BusinessMailBlockerPage />);

    expect(screen.getByTestId('tool-usage-tracker')).toBeInTheDocument();
    expect(screen.getByText('Tool Usage Tracker: business-mail-blocker')).toBeInTheDocument();
  });

  it('should render the back link', () => {
    render(<BusinessMailBlockerPage />);

    const backLink = screen.getByText('Back to Tools');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/04_tools');
  });

  it('should render the about section', () => {
    render(<BusinessMailBlockerPage />);

    expect(screen.getByText('About this tool')).toBeInTheDocument();
    expect(
      screen.getByText(/This tool helps you identify and filter business email addresses/)
    ).toBeInTheDocument();
    expect(screen.getByText(/All processing is done in your browser/)).toBeInTheDocument();
  });
});
