import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TextCounter from './TextCounter';

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('TextCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the text counter component', () => {
    render(<TextCounter />);

    expect(screen.getByText('Text Counter & Analyzer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste or type your text here/)).toBeInTheDocument();
  });

  it('should display basic statistics', () => {
    render(<TextCounter />);

    expect(screen.getByText('Basic Statistics')).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Words')).toBeInTheDocument();
    expect(screen.getByText('Sentences')).toBeInTheDocument();
    expect(screen.getByText('Paragraphs')).toBeInTheDocument();
  });

  it('should update character count when text is entered', async () => {
    const user = userEvent.setup();
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText(/Paste or type your text here/);
    await user.type(textarea, 'Hello world');

    expect(screen.getByText('11')).toBeInTheDocument(); // Characters
    expect(screen.getByText('2')).toBeInTheDocument(); // Words
  });

  it('should handle clear button', async () => {
    const user = userEvent.setup();
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText(/Paste or type your text here/);
    const clearButton = screen.getByText('Clear');

    await user.type(textarea, 'Test text');
    await user.click(clearButton);

    expect(textarea).toHaveValue('');
  });

  it('should handle copy text button', async () => {
    const user = userEvent.setup();
    render(<TextCounter />);

    const textarea = screen.getByPlaceholderText(/Paste or type your text here/);
    const copyButton = screen.getByText('Copy Text');

    await user.type(textarea, 'Test text');
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('Test text');
  });

  it('should display export options', () => {
    render(<TextCounter />);

    expect(screen.getByText('Export Analysis')).toBeInTheDocument();
    expect(screen.getByText('TXT Report')).toBeInTheDocument();
    expect(screen.getByText('JSON Data')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should display analysis sections', () => {
    render(<TextCounter />);

    expect(screen.getByText('SEO Analysis')).toBeInTheDocument();
    expect(screen.getByText('Keyword Density')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
  });
});
