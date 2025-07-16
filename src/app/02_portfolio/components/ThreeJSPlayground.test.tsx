import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThreeJSPlayground from './ThreeJSPlayground';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn(cb => {
  setTimeout(cb, 16);
  return 1;
});
global.cancelAnimationFrame = vi.fn();

// Mock HTMLCanvasElement and 2D context
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  resetTransform: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 2,
} as Partial<CanvasRenderingContext2D>;

const mockGetContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return mockContext as CanvasRenderingContext2D;
  }
  return null;
});

beforeAll(() => {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    value: mockGetContext,
    configurable: true,
  });
});

describe('ThreeJSPlayground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(React, 'useRef').mockReturnValue({ current: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Three.js playground with title', () => {
    render(<ThreeJSPlayground />);
    expect(screen.getByRole('heading', { name: 'Three.js Playground' })).toBeInTheDocument();
  });

  it('should render canvas element', () => {
    render(<ThreeJSPlayground />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '600');
    expect(canvas).toHaveAttribute('height', '400');
  });

  it('should render description text', () => {
    render(<ThreeJSPlayground />);
    expect(
      screen.getByText('Interactive 3D graphics and animations powered by Three.js')
    ).toBeInTheDocument();
  });

  it('should render control buttons', () => {
    render(<ThreeJSPlayground />);
    expect(screen.getByRole('button', { name: 'Reset Scene' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle Animation' })).toBeInTheDocument();
  });

  it('should initialize canvas context on mount', () => {
    render(<ThreeJSPlayground />);
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('should start animation on mount', () => {
    render(<ThreeJSPlayground />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should call drawing methods during animation', async () => {
    render(<ThreeJSPlayground />);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('should handle button clicks without errors', async () => {
    render(<ThreeJSPlayground />);
    const resetButton = screen.getByRole('button', { name: 'Reset Scene' });
    await userEvent.click(resetButton);
    // Add assertions here if reset has an effect
  });

  it('should clean up animation on unmount', () => {
    const { unmount } = render(<ThreeJSPlayground />);
    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it.skip('should handle missing canvas gracefully', () => {
    vi.spyOn(React, 'useRef').mockReturnValue({ current: null });
    render(<ThreeJSPlayground />);
    expect(mockGetContext).not.toHaveBeenCalled();
  });
});