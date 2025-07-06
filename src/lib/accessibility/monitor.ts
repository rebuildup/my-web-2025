/**
 * Accessibility monitoring and enhancement system
 * Implements WCAG 2.1 AA compliance checking and automatic fixes
 */

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  element: Element;
  helpUrl: string;
  tags: string[];
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  score: number; // 0-100
  timestamp: number;
}

export interface AccessibilityConfig {
  enableAutoFix: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusManagement: boolean;
  enableAriaLiveRegions: boolean;
  reportViolations: boolean;
}

/**
 * Default accessibility configuration
 */
export const DEFAULT_A11Y_CONFIG: AccessibilityConfig = {
  enableAutoFix: true,
  enableKeyboardNavigation: true,
  enableFocusManagement: true,
  enableAriaLiveRegions: true,
  reportViolations: true,
};

/**
 * Initialize accessibility monitoring and enhancements
 */
export function initializeAccessibility(config: Partial<AccessibilityConfig> = {}): void {
  if (typeof window === 'undefined') return;

  const finalConfig = { ...DEFAULT_A11Y_CONFIG, ...config };

  if (finalConfig.enableKeyboardNavigation) {
    initializeKeyboardNavigation();
  }

  if (finalConfig.enableFocusManagement) {
    initializeFocusManagement();
  }

  if (finalConfig.enableAriaLiveRegions) {
    initializeAriaLiveRegions();
  }

  if (finalConfig.enableAutoFix) {
    initializeAutoFixes();
  }

  if (finalConfig.reportViolations) {
    scheduleAccessibilityCheck();
  }
}

/**
 * Enhanced keyboard navigation support
 */
function initializeKeyboardNavigation(): void {
  // Skip links for keyboard users
  createSkipLinks();

  // Escape key handling for modals and dropdowns
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeActiveModals();
      closeFocusTraps();
    }
  });

  // Tab trapping for modals
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
      if (activeModal) {
        trapFocus(event, activeModal);
      }
    }
  });

  // Arrow key navigation for menus and lists
  document.addEventListener('keydown', event => {
    const focusedElement = document.activeElement;
    if (!focusedElement) return;

    const role = focusedElement.getAttribute('role');
    if (role === 'menuitem' || role === 'option' || role === 'tab') {
      handleArrowKeyNavigation(event, focusedElement);
    }
  });
}

/**
 * Create skip links for keyboard navigation
 */
function createSkipLinks(): void {
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
  
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Ensure main content has proper ID
  let mainContent = document.getElementById('main');
  if (!mainContent) {
    mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main';
    }
  }
}

/**
 * Focus management for dynamic content
 */
function initializeFocusManagement(): void {
  // Track focus for restoration
  let lastFocusedElement: Element | null = null;

  // Observer for dynamic content changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Auto-focus new content when appropriate
          if (element.hasAttribute('data-auto-focus')) {
            const focusTarget = element.querySelector('[autofocus]') || element;
            if (focusTarget instanceof HTMLElement) {
              focusTarget.focus();
            }
          }

          // Announce new content to screen readers
          if (element.hasAttribute('data-announce')) {
            announceToScreenReader(element.textContent || '');
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Focus restoration on route changes
  window.addEventListener('beforeunload', () => {
    lastFocusedElement = document.activeElement;
  });

  window.addEventListener('load', () => {
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  });
}

/**
 * Initialize ARIA live regions for dynamic announcements
 */
function initializeAriaLiveRegions(): void {
  // Create polite live region
  const politeRegion = document.createElement('div');
  politeRegion.id = 'aria-live-polite';
  politeRegion.setAttribute('aria-live', 'polite');
  politeRegion.setAttribute('aria-atomic', 'true');
  politeRegion.className = 'sr-only';
  document.body.appendChild(politeRegion);

  // Create assertive live region
  const assertiveRegion = document.createElement('div');
  assertiveRegion.id = 'aria-live-assertive';
  assertiveRegion.setAttribute('aria-live', 'assertive');
  assertiveRegion.setAttribute('aria-atomic', 'true');
  assertiveRegion.className = 'sr-only';
  document.body.appendChild(assertiveRegion);
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
  const region = document.getElementById(regionId);
  
  if (region) {
    region.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
}

/**
 * Initialize automatic accessibility fixes
 */
function initializeAutoFixes(): void {
  // Add missing alt attributes to images
  document.querySelectorAll('img:not([alt])').forEach(img => {
    img.setAttribute('alt', '');
  });

  // Add proper roles to elements
  document.querySelectorAll('button:not([role])').forEach(button => {
    button.setAttribute('role', 'button');
  });

  // Add proper labels to form elements
  document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
    const label = input.parentElement?.querySelector('label');
    if (label && !label.getAttribute('for')) {
      const id = input.id || `input-${Math.random().toString(36).substring(2, 11)}`;
      input.id = id;
      label.setAttribute('for', id);
    }
  });

  // Enhance color contrast
  enhanceColorContrast();
}

/**
 * Enhanced color contrast checking and improvement
 */
function enhanceColorContrast(): void {
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const textColor = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrastRatio = calculateContrastRatio(textColor, backgroundColor);
      
      // WCAG AA standard requires 4.5:1 for normal text, 3:1 for large text
      const fontSize = parseFloat(styles.fontSize);
      const requiredRatio = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold') ? 3 : 4.5;
      
      if (contrastRatio < requiredRatio) {
        // Add warning class for developer notification
        element.classList.add('contrast-warning');
        
        // Auto-fix if possible
        if (element.hasAttribute('data-auto-contrast')) {
          improveContrast(element as HTMLElement, textColor, backgroundColor);
        }
      }
    }
  });
}

/**
 * Calculate color contrast ratio
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse color string to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Create a temporary element to parse color
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  
  const computedColor = window.getComputedStyle(div).color;
  document.body.removeChild(div);
  
  const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  
  return null;
}

/**
 * Get relative luminance for contrast calculation
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const sRGB = [r, g, b].map(value => {
    value = value / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Improve contrast for an element
 */
function improveContrast(element: HTMLElement, textColor: string, backgroundColor: string): void {
  // Simple contrast improvement by darkening/lightening colors
  const rgb = parseColor(textColor);
  if (rgb) {
    const luminance = getRelativeLuminance(rgb);
    if (luminance > 0.5) {
      // Darken the text
      element.style.color = `rgb(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)})`;
    } else {
      // Lighten the text
      element.style.color = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`;
    }
  }
}

/**
 * Handle arrow key navigation for menus and lists
 */
function handleArrowKeyNavigation(event: KeyboardEvent, element: Element): void {
  const role = element.getAttribute('role');
  const parent = element.closest('[role="menu"], [role="listbox"], [role="tablist"]');
  
  if (!parent) return;
  
  const items = Array.from(parent.querySelectorAll(`[role="${role}"]`));
  const currentIndex = items.indexOf(element);
  
  let nextIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      nextIndex = (currentIndex + 1) % items.length;
      event.preventDefault();
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      event.preventDefault();
      break;
    case 'Home':
      nextIndex = 0;
      event.preventDefault();
      break;
    case 'End':
      nextIndex = items.length - 1;
      event.preventDefault();
      break;
  }
  
  if (nextIndex !== currentIndex && items[nextIndex] instanceof HTMLElement) {
    items[nextIndex].focus();
  }
}

/**
 * Trap focus within a modal or dialog
 */
function trapFocus(event: KeyboardEvent, container: Element): void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  if (event.shiftKey && document.activeElement === firstElement) {
    lastElement.focus();
    event.preventDefault();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    firstElement.focus();
    event.preventDefault();
  }
}

/**
 * Close active modals
 */
function closeActiveModals(): void {
  document.querySelectorAll('[role="dialog"][aria-hidden="false"]').forEach(modal => {
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus to trigger element
    const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
    if (trigger instanceof HTMLElement) {
      trigger.focus();
    }
  });
}

/**
 * Close focus traps
 */
function closeFocusTraps(): void {
  document.querySelectorAll('.dropdown-open, .menu-open').forEach(element => {
    element.classList.remove('dropdown-open', 'menu-open');
  });
}

/**
 * Schedule accessibility check
 */
function scheduleAccessibilityCheck(): void {
  // Check accessibility every 30 seconds
  setInterval(performAccessibilityCheck, 30000);
  
  // Initial check after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', performAccessibilityCheck);
  } else {
    performAccessibilityCheck();
  }
}

/**
 * Perform accessibility check
 */
async function performAccessibilityCheck(): Promise<AccessibilityReport> {
  const violations: AccessibilityViolation[] = [];
  let passes = 0;
  
  // Check for common accessibility issues
  
  // Missing alt text on images
  document.querySelectorAll('img:not([alt])').forEach(img => {
    violations.push({
      id: 'missing-alt-text',
      impact: 'serious',
      description: 'Image missing alternative text',
      element: img,
      helpUrl: 'https://webaim.org/standards/wcag/checklist#sc1.1.1',
      tags: ['wcag2a', 'wcag111'],
    });
  });
  
  // Missing form labels
  document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
    const hasLabel = input.labels && input.labels.length > 0;
    if (!hasLabel) {
      violations.push({
        id: 'missing-form-label',
        impact: 'critical',
        description: 'Form element missing label',
        element: input,
        helpUrl: 'https://webaim.org/standards/wcag/checklist#sc3.3.2',
        tags: ['wcag2a', 'wcag332'],
      });
    }
  });
  
  // Missing headings hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1), 10);
    if (level - lastLevel > 1) {
      violations.push({
        id: 'heading-hierarchy',
        impact: 'moderate',
        description: 'Heading levels should not skip',
        element: heading,
        helpUrl: 'https://webaim.org/standards/wcag/checklist#sc1.3.1',
        tags: ['wcag2a', 'wcag131'],
      });
    }
    lastLevel = level;
  });
  
  // Calculate score
  const totalChecks = violations.length + passes;
  const score = totalChecks > 0 ? Math.round((passes / totalChecks) * 100) : 100;
  
  const report: AccessibilityReport = {
    violations,
    passes,
    incomplete: 0,
    score,
    timestamp: Date.now(),
  };
  
  // Send report to analytics
  if (violations.length > 0) {
    console.warn('Accessibility violations found:', violations);
    
    // Send to analytics
    fetch('/api/analytics/accessibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(error => {
      console.warn('Failed to send accessibility report:', error);
    });
  }
  
  return report;
}

/**
 * Get accessibility report
 */
export function getAccessibilityReport(): Promise<AccessibilityReport> {
  return performAccessibilityCheck();
}