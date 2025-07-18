import React from 'react';
import { render } from '@testing-library/react';
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
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
}));

describe('QRCodePage', () => {
  it('should render without crashing', () => {
    const { container } = render(<QRCodePage />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });
});
