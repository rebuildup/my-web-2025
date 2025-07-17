import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextCounter from './TextCounter';

// Mock clipboard API
vi.mock('navigator.clipboard', () => ({
  writeText: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Type: () => <div data-testid="type-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));

describe('TextCounter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });

  it('should render the text counter component', () => {
    render(<TextCounter />);

    expect(screen.getByText('Text Counter & Analyzer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste or type your text here...')).toBeInTheDocument();
    expect(screen.getByText('Basic Statistics')).toBeInTheDocument();
  });

  it('should update character count when text is entered', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    expect(screen.getByText('13')).toBeInTheDocument(); // 13 characters
  });

  it('should update word count when text is entered', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world! This is a test.' } });

    expect(screen.getByText('5')).toBeInTheDocument(); // 5 words
  });

  it('should update sentence count when text is entered', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world! This is a test.' } });

    expect(screen.getByText('2')).toBeInTheDocument(); // 2 sentences
  });

  it('should clear text when clear button is clicked', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
    expect(screen.getByText('0')).toBeInTheDocument(); // 0 characters
  });

  it('should copy text to clipboard when copy button is clicked', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    const copyButton = screen.getByText('Copy Text');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, world!');
  });

  it('should export analysis when export button is clicked', () => {
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

    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    const exportButton = screen.getByText('TXT Report');
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toBe('text-analysis.txt');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Restore original methods
    document.createElement = originalCreateElement;
  });

  it('should toggle SEO analysis when show/hide button is clicked', () => {
    render(<TextCounter />);

    // Initially, SEO analysis should be hidden
    expect(screen.queryByText('Readability Score:')).not.toBeInTheDocument();

    // Click show button
    const showButton = screen.getByText('Show');
    fireEvent.click(showButton);

    // SEO analysis should now be visible
    expect(screen.getByText('Readability Score:')).toBeInTheDocument();

    // Click hide button
    const hideButton = screen.getByText('Hide');
    fireEvent.click(hideButton);

    // SEO analysis should be hidden again
    expect(screen.queryByText('Readability Score:')).not.toBeInTheDocument();
  });

  it('should correctly count Japanese characters', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    // Mix of hiragana, katakana, and kanji
    fireEvent.change(textarea, { target: { value: 'こんにちは、世界！ニュース' } });

    // Japanese text section should be visible
    expect(screen.getByText('Japanese Text Analysis')).toBeInTheDocument();

    // Check character counts
    expect(screen.getByText('11')).toBeInTheDocument(); // Total Japanese characters

    // Individual character type counts
    const hiraganaCount = screen.getAllByText('5')[0]; // こんにちは has 5 hiragana
    expect(hiraganaCount).toBeInTheDocument();

    const kanjiCount = screen.getAllByText('1')[0]; // 世界 has 2 kanji
    expect(kanjiCount).toBeInTheDocument();

    const katakanaCount = screen.getAllByText('4')[0]; // ニュース has 4 katakana
    expect(katakanaCount).toBeInTheDocument();
  });

  it('should correctly count lines', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

    // Find the lines count
    const linesCount = screen.getByText('3'); // 3 lines
    expect(linesCount).toBeInTheDocument();
  });

  it('should show social media limits', () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    // Social media platforms should be visible
    expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('should show copy success message when copying to clipboard', async () => {
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    // Find a copy button (for character count)
    const copyButtons = screen.getAllByTitle('Copy to clipboard');
    fireEvent.click(copyButtons[0]);

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

  it('should export analysis in different formats', () => {
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

    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText('Paste or type your text here...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

    // Test JSON export
    const jsonExportButton = screen.getByText('JSON Data');
    fireEvent.click(jsonExportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toBe('text-analysis.json');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Reset mocks
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    mockAnchorElement.click.mockClear();

    // Test CSV export
    const csvExportButton = screen.getByText('CSV Data');
    fireEvent.click(csvExportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAnchorElement.download).toBe('text-analysis.csv');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Restore original methods
    document.createElement = originalCreateElement;
  });
});
