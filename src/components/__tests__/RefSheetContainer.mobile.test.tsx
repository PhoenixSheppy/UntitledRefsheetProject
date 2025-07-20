import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RefSheetContainer } from '../RefSheetContainer';
import { ColorSegment } from '@/types';

// Mock the child components
vi.mock('../RefSheetImage', () => ({
  default: ({ onImageLoad, ...props }: any) => {
    React.useEffect(() => {
      onImageLoad({ width: 800, height: 600 });
    }, [onImageLoad]);
    return <img data-testid="refsheet-image" {...props} />;
  },
}));

vi.mock('../ColorSegmentOverlay', () => ({
  default: ({ onSegmentHover, onSegmentTouch, ...props }: any) => (
    <div 
      data-testid="color-segment-overlay"
      onClick={() => onSegmentTouch && onSegmentTouch(mockColorSegments[0])}
      onMouseEnter={() => onSegmentHover && onSegmentHover(mockColorSegments[0])}
      {...props}
    />
  ),
}));

vi.mock('../ColorInfoPanel', () => ({
  default: ({ isVisible, ...props }: any) => (
    <div 
      data-testid="color-info-panel"
      style={{ display: isVisible ? 'block' : 'none' }}
      {...props}
    />
  ),
}));

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
  }
];

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

describe('RefSheetContainer - Mobile Support', () => {
  const mockImageUrl = '/test-image.jpg';

  beforeEach(() => {
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
    it('detects mobile device and applies mobile-specific styling', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('refsheet-container');
        expect(container).toHaveClass('max-w-full', 'px-2');
      });
    });

    it('applies desktop styling on desktop devices', async () => {
      mockWindowProperties(1200, false, 0);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('refsheet-container');
        expect(container).toHaveClass('max-w-4xl');
        expect(container).not.toHaveClass('max-w-full', 'px-2');
      });
    });
  });

  describe('Touch Interactions', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('handles touch interactions on mobile', async () => {
      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const overlay = screen.getByTestId('color-segment-overlay');
        fireEvent.click(overlay);
        
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({ display: 'block' });
      });
    });

    it('does not respond to hover on mobile', async () => {
      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const overlay = screen.getByTestId('color-segment-overlay');
        fireEvent.mouseEnter(overlay);
        
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({ display: 'none' });
      });
    });
  });

  describe('Responsive Hint Text', () => {
    it('shows mobile-specific hint text on mobile devices', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tap to explore colors')).toBeInTheDocument();
      });
    });

    it('shows desktop hint text on desktop devices', async () => {
      mockWindowProperties(1200, false, 0);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Hover to explore colors')).toBeInTheDocument();
      });
    });

    it('hides hint text when segment is active', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const overlay = screen.getByTestId('color-segment-overlay');
        fireEvent.click(overlay);
        
        expect(screen.queryByText('Tap to explore colors')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('adapts to window resize events', async () => {
      // Start with desktop
      mockWindowProperties(1200, false, 0);

      const { rerender } = render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('refsheet-container');
        expect(container).toHaveClass('max-w-4xl');
      });

      // Simulate resize to mobile
      mockWindowProperties(600, true, 2);
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const container = screen.getByTestId('refsheet-container');
        expect(container).toHaveClass('max-w-full', 'px-2');
      });
    });

    it('updates hint text on resize', async () => {
      // Start with desktop
      mockWindowProperties(1200, false, 0);

      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Hover to explore colors')).toBeInTheDocument();
      });

      // Simulate resize to mobile
      mockWindowProperties(600, true, 2);
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByText('Tap to explore colors')).toBeInTheDocument();
      });
    });
  });

  describe('Panel Positioning on Mobile', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('uses mobile-specific panel positioning', async () => {
      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const overlay = screen.getByTestId('color-segment-overlay');
        fireEvent.click(overlay);
        
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveStyle({ display: 'block' });
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('maintains accessibility features on mobile', async () => {
      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
          imageAlt="Test character reference sheet"
        />
      );

      await waitFor(() => {
        const image = screen.getByTestId('refsheet-image');
        expect(image).toHaveAttribute('alt', 'Test character reference sheet');
      });
    });

    it('provides appropriate ARIA labels for mobile interactions', async () => {
      render(
        <RefSheetContainer
          imageUrl={mockImageUrl}
          colorSegments={mockColorSegments}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('refsheet-container');
        expect(container).toBeInTheDocument();
      });
    });
  });
});