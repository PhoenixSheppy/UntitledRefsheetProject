import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ColorSegmentOverlay } from '../ColorSegmentOverlay';
import { ColorSegment, ImageDimensions } from '@/types';

// Mock data for testing
const mockColorSegments: ColorSegment[] = [
  {
    id: 'segment-1',
    name: 'Main Fur Color',
    coordinates: { x: 25, y: 30 },
    dimensions: { width: 10, height: 15 },
    shape: 'rectangle',
    colorInfo: {
      hex: '#FF5733',
      rgb: { r: 255, g: 87, b: 51 },
      hsl: { h: 12, s: 100, l: 60 },
      name: 'Orange Red'
    }
  },
  {
    id: 'segment-2',
    name: 'Eye Color',
    coordinates: { x: 45, y: 20 },
    dimensions: { width: 8, height: 8 },
    shape: 'circle',
    colorInfo: {
      hex: '#4A90E2',
      rgb: { r: 74, g: 144, b: 226 },
      hsl: { h: 212, s: 73, l: 59 },
      name: 'Blue'
    }
  }
];

const mockImageDimensions: ImageDimensions = {
  width: 800,
  height: 600
};

const mockDisplayDimensions: ImageDimensions = {
  width: 400,
  height: 300
};

// Mock window properties for mobile detection
const mockWindowProperties = (width: number, hasTouchScreen: boolean, maxTouchPoints: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: hasTouchScreen ? {} : undefined,
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: maxTouchPoints,
  });
};

describe('ColorSegmentOverlay - Mobile and Touch Support', () => {
  const mockOnSegmentHover = vi.fn();
  const mockOnSegmentTouch = vi.fn();

  beforeEach(() => {
    mockOnSegmentHover.mockClear();
    mockOnSegmentTouch.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset window properties
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe('Mobile Detection', () => {
    it('detects mobile device correctly', async () => {
      // Mock mobile environment
      mockWindowProperties(600, true, 2);

      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // On mobile, hover should not trigger
      fireEvent.mouseEnter(segment);
      expect(mockOnSegmentHover).not.toHaveBeenCalled();
    });

    it('detects desktop device correctly', async () => {
      // Mock desktop environment
      mockWindowProperties(1200, false, 0);

      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // On desktop, hover should trigger
      fireEvent.mouseEnter(segment);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[0]);
    });
  });

  describe('Touch Interactions', () => {
    beforeEach(() => {
      // Mock mobile environment for touch tests
      mockWindowProperties(600, true, 2);
    });

    it('handles touch start events', async () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // Touch should trigger the touch handler
      fireEvent.touchStart(segment);
      expect(mockOnSegmentTouch).toHaveBeenCalledWith(mockColorSegments[0]);
    });

    it('handles click events on mobile', async () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // Click should trigger the touch handler on mobile
      fireEvent.click(segment);
      expect(mockOnSegmentTouch).toHaveBeenCalledWith(mockColorSegments[0]);
    });

    it('toggles segment on repeated touch', async () => {
      const { rerender } = render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // First touch should activate
      fireEvent.touchStart(segment);
      expect(mockOnSegmentTouch).toHaveBeenCalledWith(mockColorSegments[0]);

      // Re-render with active segment
      rerender(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={mockColorSegments[0]}
        />
      );

      const activeSegment = screen.getByTestId('color-segment-segment-1');
      
      // Second touch should deactivate
      fireEvent.touchStart(activeSegment);
      expect(mockOnSegmentTouch).toHaveBeenCalledWith(null);
    });

    it('prevents default on touch events', async () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');
      
      fireEvent(segment, touchEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to hover handler when no touch handler provided', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // Touch should fall back to hover handler
      fireEvent.touchStart(segment);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[0]);
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to window resize events', async () => {
      // Start with desktop
      mockWindowProperties(1200, false, 0);

      const { rerender } = render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // Should work as desktop initially
      fireEvent.mouseEnter(segment);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[0]);
      
      mockOnSegmentHover.mockClear();

      // Simulate resize to mobile
      mockWindowProperties(600, true, 2);
      fireEvent(window, new Event('resize'));

      // Wait for resize handler to process
      await waitFor(() => {
        fireEvent.mouseEnter(segment);
        expect(mockOnSegmentHover).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('maintains accessibility attributes on mobile', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      expect(segment).toHaveAttribute('role', 'button');
      expect(segment).toHaveAttribute('tabIndex', '0');
      expect(segment).toHaveAttribute('aria-label', 'Color segment: Main Fur Color');
    });

    it('supports keyboard navigation on mobile', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          onSegmentTouch={mockOnSegmentTouch}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      
      // Should be focusable
      segment.focus();
      expect(document.activeElement).toBe(segment);
    });
  });
});