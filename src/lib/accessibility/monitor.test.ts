import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeAccessibility,
  announceToScreenReader,
  getAccessibilityReport,
  DEFAULT_A11Y_CONFIG,
} from './monitor';

// Mock DOM methods
const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockGetElementById = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockCreateElement = vi.fn();
const mockInsertBefore = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock document
  Object.defineProperty(global, 'document', {
    value: {
      querySelector: mockQuerySelector,
      querySelectorAll: mockQuerySelectorAll,
      getElementById: mockGetElementById,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      createElement: mockCreateElement,
      body: {
        insertBefore: mockInsertBefore,
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
      readyState: 'complete',
      activeElement: null,
    },
    writable: true,
  });

  // Mock window
  Object.defineProperty(global, 'window', {
    value: {
      ...global.window,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getComputedStyle: vi.fn().mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        fontSize: '16px',
        fontWeight: 'normal',
      }),
    },
    writable: true,
  });

  // Mock MutationObserver
  global.MutationObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock Node constants
  global.Node = {
    ELEMENT_NODE: 1,
  } as any;

  // Mock fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response);

  // Mock console methods
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Accessibility Monitor', () => {
  describe('DEFAULT_A11Y_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_A11Y_CONFIG).toEqual({
        enableAutoFix: true,
        enableKeyboardNavigation: true,
        enableFocusManagement: true,
        enableAriaLiveRegions: true,
        reportViolations: true,
      });
    });
  });

  describe('initializeAccessibility', () => {
    it('should initialize with default config', () => {
      mockQuerySelectorAll.mockReturnValue([]);
      mockCreateElement.mockReturnValue({
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
        id: '',
      });

      initializeAccessibility();

      expect(mockAddEventListener).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalled();
    });

    it('should merge custom config with defaults', () => {
      const customConfig = { enableAutoFix: false };
      mockQuerySelectorAll.mockReturnValue([]);
      mockCreateElement.mockReturnValue({
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
        id: '',
      });

      initializeAccessibility(customConfig);

      // Should still initialize other features
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should return early for server-side environment', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      initializeAccessibility();

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('should create skip links', () => {
      const mockSkipLink = {
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
        href: '',
      };
      mockCreateElement.mockReturnValue(mockSkipLink);
      mockQuerySelectorAll.mockReturnValue([]);
      mockQuerySelector.mockReturnValue(null);

      initializeAccessibility();

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockSkipLink.textContent).toBe('');
      expect(mockInsertBefore).toHaveBeenCalled();
    });

    it('should create ARIA live regions', () => {
      const mockDiv = {
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
        id: '',
      };
      mockCreateElement.mockReturnValue(mockDiv);
      mockQuerySelectorAll.mockReturnValue([]);

      initializeAccessibility();

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      const mockRegion = {
        textContent: '',
      };
      mockGetElementById.mockReturnValue(mockRegion);
    });

    it('should announce message with polite priority by default', () => {
      const message = 'Test announcement';

      announceToScreenReader(message);

      expect(mockGetElementById).toHaveBeenCalledWith('aria-live-polite');
    });

    it('should announce message with assertive priority', () => {
      const message = 'Urgent announcement';

      announceToScreenReader(message, 'assertive');

      expect(mockGetElementById).toHaveBeenCalledWith('aria-live-assertive');
    });

    it('should handle missing live region gracefully', () => {
      mockGetElementById.mockReturnValue(null);
      const message = 'Test announcement';

      expect(() => announceToScreenReader(message)).not.toThrow();
    });

    it('should clear message after timeout', () => {
      vi.useFakeTimers();
      const mockRegion = { textContent: '' };
      mockGetElementById.mockReturnValue(mockRegion);

      announceToScreenReader('Test message');

      expect(mockRegion.textContent).toBe('Test message');

      vi.advanceTimersByTime(1000);

      expect(mockRegion.textContent).toBe('');

      vi.useRealTimers();
    });
  });

  describe('getAccessibilityReport', () => {
    it('should return accessibility report', async () => {
      // Mock elements for testing
      const mockImg = { getAttribute: vi.fn().mockReturnValue(null) };
      const mockInput = { 
        getAttribute: vi.fn().mockReturnValue(null),
        labels: [],
      };
      const mockHeading = { tagName: 'H3' };

      mockQuerySelectorAll
        .mockReturnValueOnce([mockImg]) // img:not([alt])
        .mockReturnValueOnce([mockInput]) // input:not([aria-label]):not([aria-labelledby])
        .mockReturnValueOnce([mockHeading]); // h1, h2, h3, h4, h5, h6

      const report = await getAccessibilityReport();

      expect(report).toEqual({
        violations: expect.arrayContaining([
          expect.objectContaining({
            id: 'missing-alt-text',
            impact: 'serious',
            element: mockImg,
          }),
          expect.objectContaining({
            id: 'missing-form-label',
            impact: 'critical',
            element: mockInput,
          }),
          expect.objectContaining({
            id: 'heading-hierarchy',
            impact: 'moderate',
            element: mockHeading,
          }),
        ]),
        passes: 0,
        incomplete: 0,
        score: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });

    it('should handle elements with proper accessibility attributes', async () => {
      const mockImg = { getAttribute: vi.fn().mockReturnValue('Test alt') };
      const mockInput = {
        getAttribute: vi.fn().mockReturnValue('Test label'),
        labels: [{}],
      };
      const mockHeading = { tagName: 'H1' };

      mockQuerySelectorAll
        .mockReturnValueOnce([]) // No images missing alt
        .mockReturnValueOnce([]) // No inputs missing labels
        .mockReturnValueOnce([mockHeading]); // Proper heading hierarchy

      const report = await getAccessibilityReport();

      expect(report.violations).toHaveLength(0);
      expect(report.score).toBe(100);
    });

    it('should send report to analytics when violations found', async () => {
      const mockImg = { getAttribute: vi.fn().mockReturnValue(null) };
      mockQuerySelectorAll
        .mockReturnValueOnce([mockImg])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      await getAccessibilityReport();

      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('missing-alt-text'),
      });
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockImg = { getAttribute: vi.fn().mockReturnValue(null) };
      mockQuerySelectorAll
        .mockReturnValueOnce([mockImg])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      await getAccessibilityReport();

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to send accessibility report:',
        expect.any(Error)
      );
    });

    it('should calculate score correctly', async () => {
      mockQuerySelectorAll
        .mockReturnValueOnce([]) // No violations
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      const report = await getAccessibilityReport();

      expect(report.score).toBe(100);
    });

    it('should detect heading hierarchy violations', async () => {
      const mockH1 = { tagName: 'H1' };
      const mockH3 = { tagName: 'H3' }; // Skips H2
      
      mockQuerySelectorAll
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([mockH1, mockH3]);

      const report = await getAccessibilityReport();

      const headingViolation = report.violations.find(v => v.id === 'heading-hierarchy');
      expect(headingViolation).toBeDefined();
      expect(headingViolation?.element).toBe(mockH3);
    });
  });

  describe('Color contrast calculation', () => {
    it('should detect low contrast elements', () => {
      const mockElement = {
        classList: { add: vi.fn() },
        hasAttribute: vi.fn().mockReturnValue(false),
        style: {},
      };

      // Mock getComputedStyle to return low contrast colors
      (global.window as any).getComputedStyle = vi.fn().mockReturnValue({
        color: 'rgb(200, 200, 200)', // Light gray text
        backgroundColor: 'rgb(255, 255, 255)', // White background
        fontSize: '16px',
        fontWeight: 'normal',
      });

      mockQuerySelectorAll.mockReturnValue([mockElement]);

      initializeAccessibility();

      // Should add contrast warning class
      expect(mockElement.classList.add).toHaveBeenCalledWith('contrast-warning');
    });

    it('should skip transparent backgrounds', () => {
      const mockElement = {
        classList: { add: vi.fn() },
        hasAttribute: vi.fn().mockReturnValue(false),
        style: {},
      };

      (global.window as any).getComputedStyle = vi.fn().mockReturnValue({
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent
        fontSize: '16px',
        fontWeight: 'normal',
      });

      mockQuerySelectorAll.mockReturnValue([mockElement]);

      initializeAccessibility();

      expect(mockElement.classList.add).not.toHaveBeenCalled();
    });
  });
});