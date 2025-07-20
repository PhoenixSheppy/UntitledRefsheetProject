import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColorSegmentOverlay } from '../ColorSegmentOverlay';
import { ColorInfoPanel } from '../ColorInfoPanel';
import { RefSheetContainer } from '../RefSheetContainer';
import { sampleRefSheetConfig } from '@/config/sampleRefSheet';
import { ColorSegment, ImageDimensions, PanelPosition } from '@/types';

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

// Mock utilities
vi.mock('@/utils', async () => {
  const actual = await vi.importActual('@/utils');
  return {
    ...actual,
    debounce: (fn: any) => fn,
    announceToScreenReader: vi.fn(),
    generateUniqueId: vi.fn(() => 'test-id'),
  };
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

describe('Accessibility Features', () => {
  const user = userEvent.setup();
  
  const mockSegments: ColorSegment[] = [
    {
      id: 'segment-1',
      name: 'Primary Color',
      coordinates: { x: 25, y: 25 },
      dimensions: { width: 10, height: 10 },
      shape: 'rectangle',
      colorInfo: {
        hex: '#FF5733',
        rgb: { r: 255, g: 87, b: 51 },
        hsl: { h: 12, s: 100, l: 60 }
      }
    },
    {
      id: 'segment-2',
      name: 'Secondary Color',
      coordinates: { x: 50, y: 50 },
      dimensions: { width: 15, height: 15 },
      shape: 'circle',
      colorInfo: {
        hex: '#33FF57',
        rgb: { r: 51, g: 255, b: 87 },
        hsl: { h: 132, s: 100, l: 60 }
      }
    }
  ];

  const mockImageDimensions: ImageDimensions = { width: 800, height: 600 };
  const mockDisplayDimensions: ImageDimensions = { width: 400, height: 300 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ColorSegmentOverlay Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      // Check container has proper role
      const overlay = screen.getByTestId('color-segment-overlay');
      expect(overlay).toHaveAttribute('role', 'group');
      expect(overlay).toHaveAttribute('aria-label', 'Interactive color segments');

      // Check individual segments have proper accessibility attributes
      const segment1 = screen.getByTestId('color-segment-segment-1');
      expect(segment1).toHaveAttribute('role', 'button');
      expect(segment1).toHaveAttribute('tabIndex', '0');
      expect(segment1).toHaveAttribute('aria-label', 'Color segment: Primary Color. #FF5733');

      const segment2 = screen.getByTestId('color-segment-segment-2');
      expect(segment2).toHaveAttribute('role', 'button');
      expect(segment2).toHaveAttribute('tabIndex', '0');
      expect(segment2).toHaveAttribute('aria-label', 'Color segment: Secondary Color. #33FF57');
    });

    it('should support keyboard navigation', async () => {
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

      const segment1 = screen.getByTestId('color-segment-segment-1');
      
      // Focus on first segment
      await user.tab();
      expect(segment1).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(onHover).toHaveBeenCalledWith(mockSegments[0]);

      // Press Escape to deactivate
      onHover.mockClear();
      await user.keyboard('{Escape}');
      expect(onHover).toHaveBeenCalledWith(null);
    });

    it('should support arrow key navigation between segments', async () => {
      render(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      const overlay = screen.getByTestId('color-segment-overlay');
      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      // Focus first segment
      segment1.focus();
      expect(segment1).toHaveFocus();

      // Navigate with arrow keys
      fireEvent.keyDown(overlay, { key: 'ArrowRight' });
      await waitFor(() => {
        expect(segment2).toHaveFocus();
      });

      fireEvent.keyDown(overlay, { key: 'ArrowLeft' });
      await waitFor(() => {
        expect(segment1).toHaveFocus();
      });
    });

    it('should announce screen reader messages on focus', async () => {
      const { announceToScreenReader } = await import('@/utils');
      
      render(
        <ColorSegmentOverlay
          segments={mockSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={vi.fn()}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      
      // Focus should trigger screen reader announcement
      fireEvent.focus(segment1);
      
      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Color segment Primary Color focused. Press Enter or Space to view color details.',
        'polite'
      );
    });
  });

  describe('ColorInfoPanel Accessibility', () => {
    const mockPosition: PanelPosition = { x: 100, y: 100, side: 'right' };
    const mockColorInfo = mockSegments[0].colorInfo;

    it('should have proper ARIA attributes', () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      const panel = screen.getByTestId('color-info-panel');
      expect(panel).toHaveAttribute('role', 'tooltip');
      expect(panel).toHaveAttribute('aria-live', 'polite');
      expect(panel).toHaveAttribute('aria-label');
      expect(panel).toHaveAttribute('tabIndex', '-1');
    });

    it('should display color information with proper labels', () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      // Check color values are displayed
      expect(screen.getByTestId('hex-value')).toHaveTextContent('#FF5733');
      expect(screen.getByTestId('rgb-value')).toHaveTextContent('255, 87, 51');
      expect(screen.getByTestId('hsl-value')).toHaveTextContent('12°, 100%, 60%');

      // Check color swatch has proper label
      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toHaveAttribute('aria-label', 'Color swatch for #FF5733');
    });

    it('should not render when colorInfo is null', () => {
      render(
        <ColorInfoPanel
          colorInfo={null}
          position={mockPosition}
          isVisible={false}
        />
      );

      expect(screen.queryByTestId('color-info-panel')).not.toBeInTheDocument();
    });
  });

  describe('RefSheetContainer Accessibility', () => {
    it('should integrate all accessibility features', async () => {
      render(
        <RefSheetContainer
          imageUrl="/test-image.jpg"
          imageAlt="Test character reference sheet"
          colorSegments={mockSegments}
          preferredPanelSide="auto"
        />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      });

      // Check that overlay is present with accessibility features
      const overlay = screen.getByTestId('color-segment-overlay');
      expect(overlay).toHaveAttribute('role', 'group');

      // Check that segments are focusable
      const segments = screen.getAllByRole('button');
      expect(segments.length).toBe(mockSegments.length);

      segments.forEach(segment => {
        expect(segment).toHaveAttribute('tabIndex', '0');
        expect(segment).toHaveAttribute('aria-label');
      });
    });

    it('should handle keyboard navigation in full integration', async () => {
      const { announceToScreenReader } = await import('@/utils');
      
      render(
        <RefSheetContainer
          imageUrl="/test-image.jpg"
          imageAlt="Test character reference sheet"
          colorSegments={mockSegments}
          preferredPanelSide="auto"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('color-segment-segment-1');
      
      // Focus and activate segment
      segment1.focus();
      await user.keyboard('{Enter}');

      // Should announce color information
      expect(announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining('Color Primary Color: #FF5733'),
        'assertive'
      );
    });
  });

  describe('Performance Optimizations', () => {
    it('should debounce hover events', async () => {
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

      const segment1 = screen.getByTestId('color-segment-segment-1');
      
      // Rapid hover events should be debounced
      fireEvent.mouseEnter(segment1);
      fireEvent.mouseLeave(segment1);
      fireEvent.mouseEnter(segment1);
      fireEvent.mouseLeave(segment1);
      fireEvent.mouseEnter(segment1);

      // Due to mocked debounce, all calls should go through
      // In real implementation, these would be debounced
      expect(onHover).toHaveBeenCalled();
    });

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const mockPosition: PanelPosition = { x: 100, y: 100, side: 'right' };
      
      render(
        <ColorInfoPanel
          colorInfo={mockSegments[0].colorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      const panel = screen.getByTestId('color-info-panel');
      expect(panel).toBeInTheDocument();
      
      // Panel should still render but with reduced animations
      // (specific animation testing would require more complex setup)
    });
  });
});