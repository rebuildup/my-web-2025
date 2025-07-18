import React from 'react';
import { render } from '@testing-library/react';
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
  Download: () => <div data-testid="download-icon">Download</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  QrCode: () => <div data-testid="qrcode-icon">QrCode</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

describe('QRCodeGenerator', () => {
  // Mock canvas and anchor elements
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

    // Reset mock properties
    mockCanvas.width = 0;
    mockCanvas.height = 0;
    mockAnchor.href = '';
    mockAnchor.download = '';
    mockAnchor.click.mockReset();

    // Simple mock for document.createElement
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn(tag => {
      if (tag === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tag === 'a') {
        return mockAnchor as unknown as HTMLAnchorElement;
      }
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

  it('should render without crashing', () => {
    const { container } = render(<QRCodeGenerator />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });
});
