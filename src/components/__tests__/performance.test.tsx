import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefSheetContainer } from '../RefSheetContainer';
import { ColorSegmentOverlay } from '../ColorSegmentOverlay';
import { RefSheetImage } from '../RefSheetImage';
import { ColorSegment, ImageDimensions } from '@/types';
import { debounce, throttle, performance as perfUtils } from '@/utils';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, onLoad, ...props }: any) => {
    React.useEffect(() => {
      if (onLoad) {
        const mockEvent = {
          currentTarget: {
            naturalWidth: 800,
            naturalHeight: 600
          }
        };
        onLoad(mockEvent);
      }
    }, [onLoad]);
    
    return React.createElement('img', {
      src,
      alt,
      ...props,
      'data-testid': 'refsheet-image'
    });
  }
}));

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 16.5 }]),
  getEntriesByType: vi.fn(() => []),
  now: vi.fn(() => Date.now()),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Optimizations', () => {
  const mockSegments: ColorSegment[] = Array.from({ length: 10 }, (_, i) => ({
    id: `segment-${i}`,
    name: `Color ${i + 1}`,
    coordinates: { x: (i % 5) * 20, y: Math.floor(i / 5) * 20 },
    dimensions: { width: 10, height: 10 },
    shape: 'rectangle' as const,
    colorInfo: {
      hex: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      rgb: { r: 255, g: 87, b: 51 },
      hsl: { h: 12, s: 100, l: 60 }
    }
  }));

  const mockImageDimensions: ImageDimensions = { width: 800, height: 600 };
  const mockDisplayDimensions: ImageDimensions = { width: 400, height: 300 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Debounce Functionality', () => {
    it('should debounce rapid function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call function rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only be called once after delay
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle immediate execution option', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Subsequent calls should be debounced
      debouncedFn();
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Throttle Functionality', () => {
    it('should throttle rapid function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call function rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should be called immediately once
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Call again
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Performance', () => {
    it('should handle large numbers of color segments efficiently', () => {
      const startTime = performance.now();
      
      render(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should be fast (less than 100ms for 10 segments)
      expect(renderTime).toBeLessThan(100);

      // All segments should be rendered
      mockSegments.forEach(segment => {
        expect(screen.getByTestId(`color-segment-${segment.id}`)).toBeInTheDocument();
      });
    });

    it('should optimize hover event handling', async () => {
      const onHover = vi.fn();
      
      render(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={onHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-0');
      
      // Rapid hover events
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        fireEvent.mouseEnter(segment);
        fireEvent.mouseLeave(segment);
      }
      const endTime = performance.now();

      // Event handling should be efficient
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should optimize resize event handling', async () => {
      const { rerender } = render(
        <RefSheetContainer
          imageUrl="/test-image.jpg"
          imageAlt="Test image"
          colorSegments={mockSegments}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      });

      // Simulate rapid resize events
      const startTime = performance.now();
      for (let i = 0; i < 50; i++) {
        fireEvent(window, new Event('resize'));
      }
      const endTime = performance.now();

      // Resize handling should be efficient due to throttling
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Image Loading Performance', () => {
    it('should optimize image loading with Next.js Image component', () => {
      render(
        <RefSheetImage
          src="/test-image.jpg"
          alt="Test image"
          onImageLoad={vi.fn()}
        />
      );

      const image = screen.getByTestId('refsheet-image');
      
      // Should have optimization attributes
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('should handle image loading states efficiently', async () => {
      const onImageLoad = vi.fn();
      
      render(
        <RefSheetImage
          src="/test-image.jpg"
          alt="Test image"
          onImageLoad={onImageLoad}
        />
      );

      // Should call onImageLoad when image loads
      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith({
          width: 800,
          height: 600
        });
      });
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <RefSheetContainer
          imageUrl="/test-image.jpg"
          imageAlt="Test image"
          colorSegments={mockSegments}
        />
      );

      // Should add resize listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      // Should remove resize listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should handle component updates efficiently', () => {
      const { rerender } = render(
        <ColorSegmentOverlay
          segments={mockSegments.slice(0, 5)}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      // Initial render should show 5 segments
      expect(screen.getAllByRole('button')).toHaveLength(5);

      // Update with more segments
      rerender(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      // Should now show all 10 segments
      expect(screen.getAllByRole('button')).toHaveLength(10);
    });
  });

  describe('Performance Monitoring', () => {
    it('should support performance marking and measuring', () => {
      perfUtils.mark('test-start');
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      perfUtils.mark('test-end');
      const duration = perfUtils.measure('test-duration', 'test-start', 'test-end');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-end');
      expect(mockPerformance.measure).toHaveBeenCalledWith('test-duration', 'test-start', 'test-end');
      expect(typeof duration).toBe('number');
    });

    it('should handle performance API unavailability gracefully', () => {
      // Temporarily remove performance API
      const originalPerformance = window.performance;
      delete (window as any).performance;
      
      // Should not throw errors
      expect(() => {
        perfUtils.mark('test');
        perfUtils.measure('test', 'start', 'end');
      }).not.toThrow();

      // Restore performance API
      window.performance = originalPerformance;
    });
  });
});