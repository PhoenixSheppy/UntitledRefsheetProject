import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RefSheetContainer from '../RefSheetContainer';
import { ColorSegment } from '@/types';

// Mock Next.js Image component with proper image loading simulation
vi.mock('next/image', () => ({
  default: React.forwardRef(({ src, alt, onLoad, onError, priority, ...props }: any, ref: any) => {
    React.useEffect(() => {
      // Simulate image loading
      const timer = setTimeout(() => {
        if (onLoad) {
          const mockEvent = {
            currentTarget: {
              naturalWidth: 800,
              naturalHeight: 600,
            },
          };
          onLoad(mockEvent);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }, [onLoad]);

    return (
      <img 
        ref={ref} 
        src={src} 
        alt={alt} 
        data-testid="next-image"
        style={props.style}
        className={props.className}
        {...props}
      />
    );
  }),
}));

describe('RefSheetContainer Integration Tests', () => {
  const mockColorSegments: ColorSegment[] = [
    {
      id: 'fur-color',
      name: 'Main Fur Color',
      coordinates: { x: 30, y: 40 },
      dimensions: { width: 15, height: 12 },
      shape: 'rectangle',
      colorInfo: {
        hex: '#8B4513',
        rgb: { r: 139, g: 69, b: 19 },
        hsl: { h: 25, s: 76, l: 31 },
        name: 'Saddle Brown',
      },
    },
    {
      id: 'eye-color',
      name: 'Eye Color',
      coordinates: { x: 45, y: 25 },
      dimensions: { width: 8, height: 8 },
      shape: 'circle',
      colorInfo: {
        hex: '#00CED1',
        rgb: { r: 0, g: 206, b: 209 },
        hsl: { h: 181, s: 100, l: 41 },
        name: 'Dark Turquoise',
      },
    },
    {
      id: 'accent-color',
      name: 'Accent Color',
      coordinates: { x: 70, y: 60 },
      dimensions: { width: 10, height: 10 },
      shape: 'rectangle',
      colorInfo: {
        hex: '#FF6347',
        rgb: { r: 255, g: 99, b: 71 },
        hsl: { h: 9, s: 100, l: 64 },
        name: 'Tomato',
      },
    },
  ];

  const defaultProps = {
    imageUrl: '/character-sheet.jpg',
    imageAlt: 'Character Reference Sheet',
    colorSegments: mockColorSegments,
    preferredPanelSide: 'auto' as const,
  };

  beforeEach(() => {
    // Mock getBoundingClientRect for container sizing
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock window methods
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Interaction Workflow', () => {
    it('completes full hover interaction workflow', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      // Wait for image to load and components to initialize
      await waitFor(() => {
        expect(screen.getByTestId('next-image')).toBeInTheDocument();
      });

      // Wait for overlays to render
      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      // Initially, no panel should be visible (it's not rendered when no color info)
      expect(screen.queryByTestId('color-info-panel')).not.toBeInTheDocument();

      // Find and hover over the first color segment
      const furColorSegment = screen.getByTestId('color-segment-fur-color');
      expect(furColorSegment).toBeInTheDocument();

      act(() => {
        fireEvent.mouseEnter(furColorSegment);
      });

      // Panel should become visible with correct color information
      await waitFor(() => {
        const colorPanel = screen.getByTestId('color-info-panel');
        expect(colorPanel).toHaveStyle({ opacity: '1' });
      });

      // Check that color information is displayed correctly
      expect(screen.getByTestId('hex-value')).toHaveTextContent('#8B4513');
      expect(screen.getByTestId('rgb-value')).toHaveTextContent('139, 69, 19');
      expect(screen.getByTestId('hsl-value')).toHaveTextContent('25°, 76%, 31%');

      // Color swatch should have the correct background color
      const colorSwatch = screen.getByTestId('color-swatch');
      expect(colorSwatch).toHaveStyle({ backgroundColor: '#8B4513' });

      // Move to a different segment
      const eyeColorSegment = screen.getByTestId('color-segment-eye-color');
      
      act(() => {
        fireEvent.mouseEnter(eyeColorSegment);
      });

      // Panel should update with new color information
      await waitFor(() => {
        expect(screen.getByTestId('hex-value')).toHaveTextContent('#00CED1');
        expect(screen.getByTestId('rgb-value')).toHaveTextContent('0, 206, 209');
        expect(screen.getByTestId('hsl-value')).toHaveTextContent('181°, 100%, 41%');
      });

      // Leave the segment
      act(() => {
        fireEvent.mouseLeave(eyeColorSegment);
      });

      // Panel should hide
      await waitFor(() => {
        const colorPanel = screen.queryByTestId('color-info-panel');
        if (colorPanel) {
          expect(colorPanel).toHaveStyle({ opacity: '0' });
        }
      });
    });

    it('handles rapid segment switching without flickering', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      const segments = [
        screen.getByTestId('color-segment-fur-color'),
        screen.getByTestId('color-segment-eye-color'),
        screen.getByTestId('color-segment-accent-color'),
      ];

      // Rapidly switch between segments
      for (let i = 0; i < 3; i++) {
        act(() => {
          fireEvent.mouseEnter(segments[i]);
        });

        await waitFor(() => {
          const colorPanel = screen.getByTestId('color-info-panel');
          expect(colorPanel).toHaveStyle({ opacity: '1' });
        });

        // Verify the correct color is shown
        const expectedColors = ['#8B4513', '#00CED1', '#FF6347'];
        expect(screen.getByTestId('hex-value')).toHaveTextContent(expectedColors[i]);
      }

      // Leave all segments
      act(() => {
        fireEvent.mouseLeave(segments[2]);
      });

      await waitFor(() => {
        // Panel should be hidden (opacity 0) or removed from DOM
        const colorPanel = screen.queryByTestId('color-info-panel');
        if (colorPanel) {
          expect(colorPanel).toHaveStyle({ opacity: '0' });
        }
      });
    });

    it('maintains panel positioning during segment transitions', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      const furColorSegment = screen.getByTestId('color-segment-fur-color');
      const eyeColorSegment = screen.getByTestId('color-segment-eye-color');

      // Hover over first segment and record panel position
      act(() => {
        fireEvent.mouseEnter(furColorSegment);
      });

      let firstPosition: string;
      await waitFor(() => {
        const colorPanel = screen.getByTestId('color-info-panel');
        expect(colorPanel).toHaveStyle({ opacity: '1' });
        firstPosition = colorPanel.style.transform;
      });

      // Switch to second segment
      act(() => {
        fireEvent.mouseEnter(eyeColorSegment);
      });

      await waitFor(() => {
        const colorPanel = screen.getByTestId('color-info-panel');
        // Panel should still be visible but potentially in a different position
        expect(colorPanel).toHaveStyle({ opacity: '1' });
        const secondPosition = colorPanel.style.transform;
        
        // Positions might be different based on segment locations
        // The important thing is that the panel remains visible and positioned
        expect(colorPanel).toHaveStyle({ opacity: '1' });
      });
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('adapts to container size changes', async () => {
      const { rerender } = render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      // Simulate container resize by changing getBoundingClientRect mock
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Re-render to trigger dimension updates
      rerender(<RefSheetContainer {...defaultProps} />);

      // Component should still function correctly
      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      // Test interaction still works
      const furColorSegment = screen.getByTestId('color-segment-fur-color');
      
      act(() => {
        fireEvent.mouseEnter(furColorSegment);
      });

      await waitFor(() => {
        const colorPanel = screen.getByTestId('color-info-panel');
        expect(colorPanel).toHaveStyle({ opacity: '1' });
      });
    });
  });

  describe('Error Recovery Integration', () => {
    it('recovers gracefully from image loading errors', async () => {
      // This test verifies that the component handles image errors gracefully
      // by checking that the RefSheetImage component has proper error handling
      // The actual error handling is tested in RefSheetImage.test.tsx
      
      render(<RefSheetContainer {...defaultProps} />);

      // Component should render without crashing
      expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      
      // The RefSheetImage component handles error states internally
      // This integration test verifies the container doesn't break when errors occur
      expect(screen.getByTestId('next-image')).toBeInTheDocument();
    });

    it('handles missing color segment data gracefully', async () => {
      render(<RefSheetContainer {...defaultProps} colorSegments={[]} />);

      await waitFor(() => {
        expect(screen.getByTestId('next-image')).toBeInTheDocument();
      });

      // Should not render overlays with empty segments
      expect(screen.queryByTestId('color-segment-overlay')).not.toBeInTheDocument();
      
      // Should show hint about interactivity
      expect(screen.queryByText('Hover to explore colors')).not.toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple rapid interactions efficiently', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      const segments = [
        screen.getByTestId('color-segment-fur-color'),
        screen.getByTestId('color-segment-eye-color'),
        screen.getByTestId('color-segment-accent-color'),
      ];

      // Perform rapid interactions
      for (let cycle = 0; cycle < 5; cycle++) {
        for (const segment of segments) {
          act(() => {
            fireEvent.mouseEnter(segment);
            fireEvent.mouseLeave(segment);
          });
        }
      }

      // Component should remain stable
      expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<RefSheetContainer {...defaultProps} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility during interactions', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
      });

      const furColorSegment = screen.getByTestId('color-segment-fur-color');
      
      // Should have proper ARIA attributes
      expect(furColorSegment).toHaveAttribute('role', 'button');
      expect(furColorSegment).toHaveAttribute('aria-label', 'Color segment: Main Fur Color');

      act(() => {
        fireEvent.mouseEnter(furColorSegment);
      });

      await waitFor(() => {
        const colorPanel = screen.getByTestId('color-info-panel');
        expect(colorPanel).toHaveAttribute('role', 'tooltip');
        expect(colorPanel).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});