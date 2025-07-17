import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QRCodePage from './page';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const DynamicComponent = () => (
      <div data-testid="qr-code-generator">QR Code Generator Component</div>
    );
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
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

describe('QRCodePage', () => {
  it('should render the QR code page with title and description', () => {
    render(<QRCodePage />);

    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    expect(screen.getByText('QRコードジェネレーター')).toBeInTheDocument();
  });

  it('should render the QR code generator component', () => {
    render(<QRCodePage />);

    expect(screen.getByTestId('qr-code-generator')).toBeInTheDocument();
  });

  it('should render the tool usage tracker with correct tool ID', () => {
    render(<QRCodePage />);

    expect(screen.getByTestId('tool-usage-tracker')).toBeInTheDocument();
    expect(screen.getByText('Tool Usage Tracker: qr-code')).toBeInTheDocument();
  });

  it('should render the back link', () => {
    render(<QRCodePage />);

    const backLink = screen.getByText('Back to Tools');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/04_tools');
  });

  it('should render the about section', () => {
    render(<QRCodePage />);

    expect(screen.getByText('About this tool')).toBeInTheDocument();
    expect(
      screen.getByText(/This QR code generator allows you to create customizable QR codes/)
    ).toBeInTheDocument();
    expect(screen.getByText(/All processing is done in your browser/)).toBeInTheDocument();
  });
});
