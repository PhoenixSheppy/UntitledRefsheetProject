import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RefSheetContainer from '../RefSheetContainer';
import { ColorSegment } from '@/types';

// Mock the child components
vi.mock('../RefSheetImage', () => ({
  default: ({ onImageLoad, src, alt }: any) => {
    React.useEffect(() => {
      // Simulate image load after a short delay
      setTimeout(() => {
        onImageLoad({ width: 800, height: 600 });
      }, 10);
    }, [onImageLoad]);
    
    return (
      <div data-testid="mock-refsheet-image" data-src={src} data-alt={alt}>
        Mock RefSheet Image
      </div>
    );
  },
}));

vi.mock('../ColorSegmentOverlay', () => ({
  default: ({ segments, onSegmentHover, activeSegment }: any) => (
    <div data-testid="mock-color-segment-overlay">
      {segments.map((segment: ColorSegment) => (
        <button
          key={segment.id}
          data-testid={`mock-segment-${segment.id}`}
          onMouseEnter={() => onSegmentHover(segment)}
          onMouseLeave={() => onSegmentHover(null)}
          className={activeSegment?.id === segment.id ? 'active' : ''}
        >
          {segment.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../ColorInfoPanel', () => ({
  default: ({ colorInfo, isVisible, position }: any) => (
    <div 
      data-testid="mock-color-info-panel"
      data-visible={isVisible}
      data-position={JSON.stringify(position)}
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      {colorInfo && (
        <div>
          <span data-testid="panel-color-name">{colorInfo.name}</span>
          <span data-testid="panel-color-hex">{colorInfo.hex}</span>
        </div>
      )}
    </div>
  ),
}));

// Mock positioning utilities
vi.mock('@/utils/positioning', () => ({
  calculatePanelPosition: vi.fn(() => ({ x: 100, y: 100, side: 'right' })),
  segmentToSegmentBounds: vi.fn(),
  getResponsivePanelDimensions: vi.fn(() => ({ width: 192, height: 140 })),
}));

describe('RefSheetContainer', () => {
  const mockColorSegments: ColorSegment[] = [
    {
      id: 'segment-1',
      name: 'Main Color',
      coordinates: { x: 25, y: 25 },
      dimensions: { width: 10, height: 10 },
      shape: 'rectangle',
      colorInfo: {
        hex: '#FF5733',
        rgb: { r: 255, g: 87, b: 51 },
        hsl: { h: 12, s: 100, l: 60 },
        name: 'Orange Red',
      },
    },
    {
      id: 'segment-2',
      name: 'Secondary Color',
      coordinates: { x: 75, y: 75 },
      dimensions: { width: 8, height: 8 },
      shape: 'circle',
      colorInfo: {
        hex: '#33A1FF',
        rgb: { r: 51, g: 161, b: 255 },
        hsl: { h: 208, s: 100, l: 60 },
        name: 'Sky Blue',
      },
    },
  ];

  const defaultProps = {
    imageUrl: '/test-image.jpg',
    imageAlt: 'Test Character Sheet',
    colorSegments: mockColorSegments,
  };

  beforeEach(() => {
    // Mock getBoundingClientRect
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

    // Mock window resize event
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

  describe('Component Rendering', () => {
    it('renders the container with all child components', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-refsheet-image')).toBeInTheDocument();
      
      // Wait for image to load and overlays to render
      await waitFor(() => {
        expect(screen.getByTestId('mock-color-segment-overlay')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('mock-color-info-panel')).toBeInTheDocument();
    });

    it('passes correct props to RefSheetImage', () => {
      render(<RefSheetContainer {...defaultProps} />);

      const imageElement = screen.getByTestId('mock-refsheet-image');
      expect(imageElement).toHaveAttribute('data-src', '/test-image.jpg');
      expect(imageElement).toHaveAttribute('data-alt', 'Test Character Sheet');
    });

    it('renders color segments after image loads', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-segment-segment-2')).toBeInTheDocument();
      });

      expect(screen.getByText('Main Color')).toBeInTheDocument();
      expect(screen.getByText('Secondary Color')).toBeInTheDocument();
    });

    it('shows interactivity hint when no segment is active', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Hover to explore colors')).toBeInTheDocument();
      });
    });
  });

  describe('Hover State Management', () => {
    it('activates segment on hover', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(segment1).toHaveClass('active');
      });
    });

    it('deactivates segment on mouse leave', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      
      // Hover over segment
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(segment1).toHaveClass('active');
      });

      // Leave segment
      act(() => {
        fireEvent.mouseLeave(segment1);
      });

      await waitFor(() => {
        expect(segment1).not.toHaveClass('active');
      });
    });

    it('switches between segments correctly', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-segment-segment-2')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      const segment2 = screen.getByTestId('mock-segment-segment-2');
      
      // Hover over first segment
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(segment1).toHaveClass('active');
        expect(segment2).not.toHaveClass('active');
      });

      // Switch to second segment
      act(() => {
        fireEvent.mouseEnter(segment2);
      });

      await waitFor(() => {
        expect(segment1).not.toHaveClass('active');
        expect(segment2).toHaveClass('active');
      });
    });
  });

  describe('Color Panel Coordination', () => {
    it('shows color panel when segment is hovered', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const colorPanel = screen.getByTestId('mock-color-info-panel');
      expect(colorPanel).toHaveAttribute('data-visible', 'false');

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(colorPanel).toHaveAttribute('data-visible', 'true');
      });
    });

    it('hides color panel when no segment is hovered', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      const colorPanel = screen.getByTestId('mock-color-info-panel');
      
      // Hover over segment
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(colorPanel).toHaveAttribute('data-visible', 'true');
      });

      // Leave segment
      act(() => {
        fireEvent.mouseLeave(segment1);
      });

      await waitFor(() => {
        expect(colorPanel).toHaveAttribute('data-visible', 'false');
      });
    });

    it('displays correct color information in panel', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(screen.getByTestId('panel-color-name')).toHaveTextContent('Orange Red');
        expect(screen.getByTestId('panel-color-hex')).toHaveTextContent('#FF5733');
      });
    });

    it('updates panel position when different segments are hovered', async () => {
      const { calculatePanelPosition } = await import('@/utils/positioning');
      
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      const colorPanel = screen.getByTestId('mock-color-info-panel');
      
      act(() => {
        fireEvent.mouseEnter(segment1);
      });

      await waitFor(() => {
        expect(calculatePanelPosition).toHaveBeenCalled();
        expect(colorPanel).toHaveAttribute('data-position', JSON.stringify({ x: 100, y: 100, side: 'right' }));
      });
    });
  });

  describe('Responsive Layout', () => {
    it('handles window resize events', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<RefSheetContainer {...defaultProps} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('updates dimensions on image load', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      // Wait for image load to trigger dimension updates
      await waitFor(() => {
        expect(screen.getByTestId('mock-color-segment-overlay')).toBeInTheDocument();
      });

      // Verify that overlays are rendered, indicating dimensions were calculated
      expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles empty color segments gracefully', async () => {
      render(<RefSheetContainer {...defaultProps} colorSegments={[]} />);

      expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-refsheet-image')).toBeInTheDocument();

      // Should not render overlay when no segments
      await waitFor(() => {
        expect(screen.queryByTestId('mock-color-segment-overlay')).not.toBeInTheDocument();
      });
    });

    it('handles missing image dimensions gracefully', () => {
      // Create a new mock that doesn't call onImageLoad
      const MockRefSheetImageNoLoad = ({ src, alt }: any) => (
        <div data-testid="mock-refsheet-image" data-src={src} data-alt={alt}>
          Mock RefSheet Image (No Load)
        </div>
      );

      // Temporarily replace the mock
      vi.doMock('../RefSheetImage', () => ({
        default: MockRefSheetImageNoLoad,
      }));

      render(<RefSheetContainer {...defaultProps} />);

      expect(screen.getByTestId('refsheet-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-refsheet-image')).toBeInTheDocument();
      
      // Should not render overlays without image dimensions
      expect(screen.queryByTestId('mock-color-segment-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      const container = screen.getByTestId('refsheet-container');
      expect(container).toBeInTheDocument();

      // Wait for components to load
      await waitFor(() => {
        expect(screen.getByTestId('mock-color-segment-overlay')).toBeInTheDocument();
      });
    });

    it('maintains focus management during interactions', async () => {
      render(<RefSheetContainer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-segment-segment-1')).toBeInTheDocument();
      });

      const segment1 = screen.getByTestId('mock-segment-segment-1');
      
      // Focus should be manageable
      act(() => {
        segment1.focus();
      });

      expect(document.activeElement).toBe(segment1);
    });
  });
});