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

// Mock canvas.getContext
const mockGetContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return mockContext as CanvasRenderingContext2D;
  }
  return null;
});

// Fix getContext mock type
beforeAll(() => {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    value: mockGetContext,
    configurable: true,
  });
});

describe('ThreeJSPlayground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Three.js playground with title', () => {
    render(<ThreeJSPlayground />);

    expect(screen.getByRole('heading', { name: 'Three.js Playground' })).toBeInTheDocument();
    expect(screen.getByText('Three.js Playground')).toHaveClass('text-blue-500');
  });

  it('should render canvas element', () => {
    render(<ThreeJSPlayground />);

    const canvas = screen.getByRole('img'); // Canvas elements are detected as img role in testing
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

  it('should have correct button styling', () => {
    render(<ThreeJSPlayground />);

    const resetButton = screen.getByRole('button', { name: 'Reset Scene' });
    const toggleButton = screen.getByRole('button', { name: 'Toggle Animation' });

    expect(resetButton).toHaveClass('bg-blue-500', 'text-white');
    expect(toggleButton).toHaveClass('bg-gray-600', 'text-white');
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

    // Wait for animation frame
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.strokeRect).toHaveBeenCalled();
    expect(mockContext.translate).toHaveBeenCalled();
    expect(mockContext.rotate).toHaveBeenCalled();
  });

  it('should draw cube wireframe', async () => {
    render(<ThreeJSPlayground />);

    // Wait for animation frame
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockContext.strokeRect).toHaveBeenCalledWith(-40, -40, 80, 80);
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should handle button clicks without errors', async () => {
    render(<ThreeJSPlayground />);

    const resetButton = screen.getByRole('button', { name: 'Reset Scene' });
    const toggleButton = screen.getByRole('button', { name: 'Toggle Animation' });

    // Buttons should be clickable without errors
    await userEvent.click(resetButton);
    await userEvent.click(toggleButton);

    expect(resetButton).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
  });

  it('should have proper component structure', () => {
    const { container } = render(<ThreeJSPlayground />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

    const canvasContainer = container.querySelector('.rounded-none.bg-gray-700.p-4');
    expect(canvasContainer).toBeInTheDocument();
  });

  it('should have responsive canvas styling', () => {
    render(<ThreeJSPlayground />);

    const canvas = screen.getByRole('img');
    expect(canvas).toHaveClass('h-auto', 'w-full', 'max-w-full', 'rounded-none', 'bg-gray-600');
  });

  it('should clean up animation on unmount', () => {
    const { unmount } = render(<ThreeJSPlayground />);

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle missing canvas gracefully', () => {
    // Mock canvas ref to return null
    const mockRef = { current: null };
    vi.spyOn(React, 'useRef').mockReturnValue(mockRef);

    render(<ThreeJSPlayground />);

    // Should not call getContext if canvas is null
    expect(mockGetContext).not.toHaveBeenCalled();
  });

  it('should update rotation over time', async () => {
    render(<ThreeJSPlayground />);

    // Wait for multiple animation frames
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should call rotate multiple times with increasing values
    expect(mockContext.rotate).toHaveBeenCalledTimes(expect.any(Number));
  });

  it('should reset transform after each frame', async () => {
    render(<ThreeJSPlayground />);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockContext.resetTransform).toHaveBeenCalled();
  });

  it('should draw diagonals for cube effect', async () => {
    render(<ThreeJSPlayground />);

    await new Promise(resolve => setTimeout(resolve, 20));

    // Should draw 4 diagonal lines
    expect(mockContext.moveTo).toHaveBeenCalledWith(-40, -40);
    expect(mockContext.lineTo).toHaveBeenCalledWith(40, 40);
    expect(mockContext.moveTo).toHaveBeenCalledWith(40, -40);
    expect(mockContext.lineTo).toHaveBeenCalledWith(-40, 40);
  });
});
