import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ColorInfoPanel } from '../ColorInfoPanel';
import { ColorInfo, PanelPosition } from '@/types';

const mockColorInfo: ColorInfo = {
  hex: '#FF5733',
  rgb: { r: 255, g: 87, b: 51 },
  hsl: { h: 12, s: 100, l: 60 },
  name: 'Orange Red'
};

const mockPosition: PanelPosition = {
  x: 100,
  y: 150,
  side: 'right'
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

describe('ColorInfoPanel - Mobile Support', () => {
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

  describe('Mobile Detection and Styling', () => {
    it('applies mobile-specific styling on mobile devices', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveClass('p-3', 'min-w-40', 'text-sm');
      });
    });

    it('applies desktop styling on desktop devices', async () => {
      mockWindowProperties(1200, false, 0);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveClass('p-4', 'min-w-48');
        expect(panel).not.toHaveClass('text-sm');
      });
    });
  });

  describe('Responsive Text Sizing', () => {
    it('uses smaller text sizes on mobile', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const hexValue = screen.getByTestId('hex-value');
        const rgbValue = screen.getByTestId('rgb-value');
        const hslValue = screen.getByTestId('hsl-value');

        expect(hexValue).toHaveClass('text-xs');
        expect(rgbValue).toHaveClass('text-xs');
        expect(hslValue).toHaveClass('text-xs');
      });
    });

    it('uses standard text sizes on desktop', async () => {
      mockWindowProperties(1200, false, 0);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const hexValue = screen.getByTestId('hex-value');
        const rgbValue = screen.getByTestId('rgb-value');
        const hslValue = screen.getByTestId('hsl-value');

        expect(hexValue).toHaveClass('text-sm');
        expect(rgbValue).toHaveClass('text-sm');
        expect(hslValue).toHaveClass('text-sm');
      });
    });
  });

  describe('Mobile Layout Spacing', () => {
    it('uses tighter spacing on mobile', async () => {
      mockWindowProperties(600, true, 2);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const colorValues = screen.getByTestId('color-info-panel').querySelector('div:last-child');
        expect(colorValues).toHaveClass('space-y-1.5');
      });
    });

    it('uses standard spacing on desktop', async () => {
      mockWindowProperties(1200, false, 0);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const colorValues = screen.getByTestId('color-info-panel').querySelector('div:last-child');
        expect(colorValues).toHaveClass('space-y-2');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to window resize events', async () => {
      // Start with desktop
      mockWindowProperties(1200, false, 0);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveClass('p-4', 'min-w-48');
      });

      // Simulate resize to mobile
      mockWindowProperties(600, true, 2);
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveClass('p-3', 'min-w-40', 'text-sm');
      });
    });

    it('updates text sizes on resize', async () => {
      // Start with desktop
      mockWindowProperties(1200, false, 0);

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const hexValue = screen.getByTestId('hex-value');
        expect(hexValue).toHaveClass('text-sm');
      });

      // Simulate resize to mobile
      mockWindowProperties(600, true, 2);
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const hexValue = screen.getByTestId('hex-value');
        expect(hexValue).toHaveClass('text-xs');
      });
    });
  });

  describe('Touch-Friendly Interactions', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('maintains accessibility on mobile', async () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveAttribute('role', 'tooltip');
        expect(panel).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('provides readable color information on small screens', async () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const hexValue = screen.getByTestId('hex-value');
        const rgbValue = screen.getByTestId('rgb-value');
        const hslValue = screen.getByTestId('hsl-value');

        expect(hexValue).toHaveTextContent('#FF5733');
        expect(rgbValue).toHaveTextContent('255, 87, 51');
        expect(hslValue).toHaveTextContent('12°, 100%, 60%');
      });
    });

    it('maintains color swatch visibility on mobile', async () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const colorSwatch = screen.getByTestId('color-swatch');
        expect(colorSwatch).toBeInTheDocument();
        expect(colorSwatch).toHaveStyle({ backgroundColor: '#FF5733' });
      });
    });
  });

  describe('Panel Positioning on Mobile', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('positions panel correctly on mobile', async () => {
      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({
          left: '100px',
          top: '150px',
          opacity: '1',
          transform: 'scale(1)'
        });
      });
    });

    it('handles different panel positions on mobile', async () => {
      const bottomPosition: PanelPosition = {
        x: 50,
        y: 200,
        side: 'bottom'
      };

      render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={bottomPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({
          left: '50px',
          top: '200px'
        });
      });
    });
  });

  describe('Mobile Performance', () => {
    beforeEach(() => {
      mockWindowProperties(600, true, 2);
    });

    it('handles rapid show/hide transitions on mobile', async () => {
      const { rerender } = render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={false}
        />
      );

      // Show panel
      rerender(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={true}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({ opacity: '1' });
      });

      // Hide panel
      rerender(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={mockPosition}
          isVisible={false}
        />
      );

      await waitFor(() => {
        const panel = screen.getByTestId('color-info-panel');
        expect(panel).toHaveStyle({ opacity: '0' });
      });
    });
  });
});