import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextCounterPage from './page';

// Mock the TextCounter component
vi.mock('../components/TextCounter', () => ({
  __esModule: true,
  default: () => <div data-testid="text-counter-component">Text Counter Component</div>,
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

describe('TextCounterPage', () => {
  it('should render the text counter page with title and description', () => {
    render(<TextCounterPage />);

    expect(screen.getByText('Text Counter')).toBeInTheDocument();
    expect(screen.getByText('テキストカウンター')).toBeInTheDocument();
  });

  it('should render the text counter component', () => {
    render(<TextCounterPage />);

    expect(screen.getByTestId('text-counter-component')).toBeInTheDocument();
  });

  it('should render the tool usage tracker with correct tool ID', () => {
    render(<TextCounterPage />);

    expect(screen.getByTestId('tool-usage-tracker')).toBeInTheDocument();
    expect(screen.getByText('Tool Usage Tracker: text-counter')).toBeInTheDocument();
  });

  it('should render the back link', () => {
    render(<TextCounterPage />);

    const backLink = screen.getByText('Back to Tools');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/04_tools');
  });

  it('should render the about section', () => {
    render(<TextCounterPage />);

    expect(screen.getByText('About this tool')).toBeInTheDocument();
    expect(
      screen.getByText(/This text counter tool helps you analyze your text/)
    ).toBeInTheDocument();
    expect(screen.getByText(/All processing is done in your browser/)).toBeInTheDocument();
  });
});
