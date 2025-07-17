import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ColorPalette from './ColorPalette';

// Mock clipboard API
vi.mock('navigator.clipboard', () => ({
  writeText: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Palette: () => <div data-testid="palette-icon" />,
  Check: () => <div data-testid="check-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Save: () => <div data-testid="save-icon" />,
}));

describe('ColorPalette', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });

  it('should render the color palette component', () => {
    render(<ColorPalette />);

    expect(screen.getByText('Color Palette Generator')).toBeInTheDocument();
    expect(screen.getByLabelText('Base Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Harmony Type')).toBeInTheDocument();
    expect(screen.getByText('Generated Palette')).toBeInTheDocument();
  });

  it('should update base color when input changes', () => {
    render(<ColorPalette />);

    const colorInput = screen.getByLabelText('Base Color');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    const textInput = screen.getByDisplayValue('#ff0000');
    expect(textInput).toBeInTheDocument();
  });

  it('should generate a random color when random button is clicked', () => {
    // Mock Math.random to return predictable values
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.5);

    render(<ColorPalette />);

    const initialColor = screen.getByLabelText('Base Color').getAttribute('value');
    const randomButton = screen.getByText('Random');
    fireEvent.click(randomButton);

    const newColor = screen.getByLabelText('Base Color').getAttribute('value');
    expect(newColor).not.toBe(initialColor);

    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('should change harmony type when dropdown changes', () => {
    render(<ColorPalette />);

    const harmonySelect = screen.getByLabelText('Harmony Type');
    fireEvent.change(harmonySelect, { target: { value: 'triadic' } });

    expect(harmonySelect).toHaveValue('triadic');
  });

  it('should change color format when format buttons are clicked', () => {
    render(<ColorPalette />);

    // Initially in HEX format
    expect(screen.getByText('HEX')).toHaveClass('bg-primary');

    // Click RGB button
    const rgbButton = screen.getByText('RGB');
    fireEvent.click(rgbButton);
    expect(rgbButton).toHaveClass('bg-primary');

    // Click HSL button
    const hslButton = screen.getByText('HSL');
    fireEvent.click(hslButton);
    expect(hslButton).toHaveClass('bg-primary');
  });

  it('should copy color to clipboard when copy button is clicked', async () => {
    render(<ColorPalette />);

    // Find a copy button
    const copyButtons = screen.getAllByTitle('Copy color');
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });

    // Message should disappear after timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
    });
  });

  it('should save palette when save button is clicked', () => {
    render(<ColorPalette />);

    // Enter palette name
    const nameInput = screen.getByPlaceholderText('My awesome palette');
    fireEvent.change(nameInput, { target: { value: 'Test Palette' } });

    // Click save button
    const saveButton = screen.getByText('Save Palette');
    fireEvent.click(saveButton);

    // Check localStorage was called
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'savedPalettes',
      expect.stringContaining('Test Palette')
    );
  });

  it('should export palette in different formats', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('mock-url');
    const mockRevokeObjectURL = vi.fn();

    // Mock document.createElement and element.click
    const mockAnchorElement = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation(tag => {
      if (tag === 'a') return mockAnchorElement;
      return originalCreateElement(tag);
    });

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<ColorPalette />);

    // Test JSON export
    const jsonExportButton = screen.getByText('JSON');
    fireEvent.click(jsonExportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toMatch(/color-palette-.+\.json/);
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Reset mocks
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    mockAnchorElement.click.mockClear();

    // Test CSS export
    const cssExportButton = screen.getByText('CSS Variables');
    fireEvent.click(cssExportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toMatch(/color-palette-.+\.css/);
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Restore original methods
    document.createElement = originalCreateElement;
  });

  it('should show error when trying to save palette without a name', () => {
    render(<ColorPalette />);

    // Click save button without entering a name
    const saveButton = screen.getByText('Save Palette');
    fireEvent.click(saveButton);

    // Error message should appear
    expect(screen.getByText('Please enter a palette name')).toBeInTheDocument();
  });

  it('should load saved palettes from localStorage on mount', () => {
    // Setup mock localStorage with saved palettes
    const mockPalettes = [
      {
        id: '123',
        name: 'Saved Palette',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
        createdAt: new Date().toISOString(),
      },
    ];

    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(mockPalettes)
    );

    render(<ColorPalette />);

    // Check if saved palette is displayed
    expect(screen.getByText('Saved Palettes')).toBeInTheDocument();
    expect(screen.getByText('Saved Palette')).toBeInTheDocument();
  });
});
