import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BusinessMailBlocker from './BusinessMailBlocker';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Briefcase: () => <div data-testid="briefcase-icon">Briefcase</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('BusinessMailBlocker', () => {
  it('should render without crashing', () => {
    const { container } = render(<BusinessMailBlocker />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });
});
