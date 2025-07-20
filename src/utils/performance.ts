/**
 * Performance utilities for optimizing interactions and rendering
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for hover events and resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * Ensures function is called at most once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function requestAnimationFramePolyfill(callback: () => void): number {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16); // ~60fps fallback
}

/**
 * Cancel animation frame wrapper
 */
export function cancelAnimationFramePolyfill(id: number): void {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Intersection Observer hook for lazy loading and visibility detection
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });
}

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Mark the start of a performance measurement
   */
  mark: (name: string): void => {
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },

  /**
   * Measure the time between two marks
   */
  measure: (name: string, startMark: string, endMark?: string): number => {
    if (typeof window !== 'undefined' && window.performance) {
      if (window.performance.measure && window.performance.getEntriesByName) {
        window.performance.measure(name, startMark, endMark);
        const entries = window.performance.getEntriesByName(name);
        return entries.length > 0 ? entries[entries.length - 1].duration : 0;
      }
    }
    return 0;
  },

  /**
   * Get navigation timing information
   */
  getNavigationTiming: (): PerformanceNavigationTiming | null => {
    if (typeof window !== 'undefined' && window.performance && window.performance.getEntriesByType) {
      const entries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entries.length > 0 ? entries[0] : null;
    }
    return null;
  }
};