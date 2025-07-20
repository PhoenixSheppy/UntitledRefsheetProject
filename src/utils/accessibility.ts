/**
 * Accessibility utilities for screen readers, keyboard navigation, and ARIA support
 */

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window === 'undefined') return;

  // Create or get existing announcement element
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }

  // Update the aria-live priority if needed
  if (announcer.getAttribute('aria-live') !== priority) {
    announcer.setAttribute('aria-live', priority);
  }

  // Clear and set new message
  announcer.textContent = '';
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function generateUniqueId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Check if an element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableSelectors.some(selector => element.matches(selector)) ||
           element.tabIndex >= 0;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = KeyboardNavigation.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Handle arrow key navigation for grid/list items
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      wrap?: boolean;
      columns?: number;
    } = {}
  ): number => {
    const { orientation = 'both', wrap = true, columns = 1 } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : currentIndex);
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : currentIndex);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          if (columns > 1) {
            newIndex = currentIndex - columns;
            if (newIndex < 0 && wrap) {
              newIndex = elements.length + newIndex;
            } else if (newIndex < 0) {
              newIndex = currentIndex;
            }
          } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : currentIndex);
          }
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          if (columns > 1) {
            newIndex = currentIndex + columns;
            if (newIndex >= elements.length && wrap) {
              newIndex = newIndex - elements.length;
            } else if (newIndex >= elements.length) {
              newIndex = currentIndex;
            }
          } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : currentIndex);
          }
        }
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = elements.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      elements[newIndex]?.focus();
    }

    return newIndex;
  }
};

/**
 * Color contrast utilities for accessibility
 */
export const ColorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getRelativeLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number => {
    const l1 = ColorContrast.getRelativeLuminance(color1.r, color1.g, color1.b);
    const l2 = ColorContrast.getRelativeLuminance(color2.r, color2.g, color2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  meetsContrastRequirement: (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = ColorContrast.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  }
};

/**
 * Reduced motion utilities
 */
export const ReducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get appropriate animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number): number => {
    return ReducedMotion.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Create a media query listener for reduced motion preference changes
   */
  createReducedMotionListener: (callback: (prefersReduced: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handler);
  }
};