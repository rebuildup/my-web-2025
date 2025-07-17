import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QRCodeGenerator from './QRCodeGenerator';

// Mock qr-code-styling
vi.mock('qr-code-styling', () => {
  return {
    default: class QRCodeStyling {
      append = vi.fn().mockResolvedValue(undefined);
      getRawData = vi.fn().mockResolvedValue(new Blob(['mock-blob']));
    },
  };
});

// Mock clipboard API
vi.mock('navigator.clipboard', () => ({
  writeText: vi.fn(),
  write: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  QrCode: () => <div data-testid="qrcode-icon" />,
  Check: () => <div data-testid="check-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
}));

describe('QRCodeGenerator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        write: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement for canvas and a elements
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
      }),
      width: 0,
      height: 0,
      toBlob: vi.fn(callback => callback(new Blob(['mock-blob']))),
    };

    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn(tag => {
      if (tag === 'canvas') return mockCanvas;
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    });

    // Mock XMLSerializer
    global.XMLSerializer = vi.fn().mockImplementation(() => ({
      serializeToString: vi.fn().mockReturnValue('<svg></svg>'),
    }));

    // Mock Image
    global.Image = vi.fn().mockImplementation(() => ({
      onload: null,
      src: '',
    }));

    // Mock ClipboardItem
    const mockClipboardItem = vi
      .fn()
      .mockImplementation(obj => obj) as unknown as typeof ClipboardItem & {
      supports: () => boolean;
    };
    mockClipboardItem.supports = vi.fn().mockReturnValue(true);
    global.ClipboardItem = mockClipboardItem;
  });

  it('should render the QR code generator component', () => {
    render(<QRCodeGenerator />);

    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter text or URL')).toBeInTheDocument();
    expect(screen.getByText('Generated QR Code')).toBeInTheDocument();
  });

  it('should update text when input changes', () => {
    render(<QRCodeGenerator />);

    const textarea = screen.getByPlaceholderText('Enter text or URL to encode in the QR code');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    expect(textarea).toHaveValue('https://example.com');
  });

  it('should update size when slider changes', () => {
    render(<QRCodeGenerator />);

    const sizeSlider = screen.getByLabelText(/QR Code Size:/);
    fireEvent.change(sizeSlider, { target: { value: '300' } });

    expect(screen.getByText('QR Code Size: 300px')).toBeInTheDocument();
  });

  it('should update error correction level when dropdown changes', () => {
    render(<QRCodeGenerator />);

    const errorCorrectionSelect = screen.getByLabelText('Error Correction Level');
    fireEvent.change(errorCorrectionSelect, { target: { value: 'H' } });

    expect(errorCorrectionSelect).toHaveValue('H');
  });

  it('should show advanced options when button is clicked', () => {
    render(<QRCodeGenerator />);

    const advancedButton = screen.getByText('Show Advanced Options');
    fireEvent.click(advancedButton);

    expect(screen.getByText('Foreground Color')).toBeInTheDocument();
    expect(screen.getByText('Background Color')).toBeInTheDocument();
    expect(screen.getByText('Include Margin')).toBeInTheDocument();
    expect(screen.getByText('Add Logo (optional)')).toBeInTheDocument();
  });

  it('should update foreground color when color input changes', async () => {
    render(<QRCodeGenerator />);

    // Show advanced options
    const advancedButton = screen.getByText('Show Advanced Options');
    fireEvent.click(advancedButton);

    // Find foreground color input
    const colorInputs = screen.getAllByDisplayValue('#000000');
    fireEvent.change(colorInputs[1], { target: { value: '#ff0000' } });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('#ff0000')).toHaveLength(2);
    });
  });

  it('should update background color when color input changes', async () => {
    render(<QRCodeGenerator />);

    // Show advanced options
    const advancedButton = screen.getByText('Show Advanced Options');
    fireEvent.click(advancedButton);

    // Find background color input
    const colorInputs = screen.getAllByDisplayValue('#FFFFFF');
    fireEvent.change(colorInputs[1], { target: { value: '#f0f0f0' } });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('#f0f0f0')).toHaveLength(2);
    });
  });

  it('should toggle margin when checkbox is clicked', () => {
    render(<QRCodeGenerator />);

    // Show advanced options
    const advancedButton = screen.getByText('Show Advanced Options');
    fireEvent.click(advancedButton);

    // Find margin checkbox
    const marginCheckbox = screen.getByLabelText('Include Margin');
    expect(marginCheckbox).toBeChecked();

    // Toggle margin
    fireEvent.click(marginCheckbox);
    expect(marginCheckbox).not.toBeChecked();
  });

  it('should generate QR code when button is clicked', async () => {
    render(<QRCodeGenerator />);

    // Enter text
    const textarea = screen.getByPlaceholderText('Enter text or URL to encode in the QR code');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    // Click generate button
    const generateButton = screen.getByText('Generate QR Code');
    fireEvent.click(generateButton);

    // Wait for QR code to be generated
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('should download QR code when download button is clicked', async () => {
    render(<QRCodeGenerator />);

    // Enter text
    const textarea = screen.getByPlaceholderText('Enter text or URL to encode in the QR code');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    // Wait for QR code to be generated
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    // Click download button
    const downloadButton = screen.getByText('Download PNG');
    fireEvent.click(downloadButton);

    // Check if anchor was created and clicked
    expect(document.createElement).toHaveBeenCalledWith('a');
    const mockAnchor = document.createElement('a');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('should copy QR code text when copy text button is clicked', async () => {
    render(<QRCodeGenerator />);

    // Enter text
    const textarea = screen.getByPlaceholderText('Enter text or URL to encode in the QR code');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    // Click copy text button
    const copyTextButton = screen.getByText('Copy Text');
    fireEvent.click(copyTextButton);

    // Check if clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText('Text copied to clipboard!')).toBeInTheDocument();
    });

    // Message should disappear after timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Text copied to clipboard!')).not.toBeInTheDocument();
    });
  });

  it('should show error message when trying to generate QR code without text', async () => {
    render(<QRCodeGenerator />);

    // Click generate button without entering text
    const generateButton = screen.getByText('Generate QR Code');
    fireEvent.click(generateButton);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText('Please enter text for the QR code')).toBeInTheDocument();
    });

    // Message should disappear after timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Please enter text for the QR code')).not.toBeInTheDocument();
    });
  });
});
