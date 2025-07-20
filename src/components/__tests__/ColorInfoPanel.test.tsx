import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColorInfoPanel } from '../ColorInfoPanel';
import { ColorInfo, PanelPosition } from '@/types';

// Mock color info for testing
const mockColorInfo: ColorInfo = {
  hex: '#FF5733',
  rgb: { r: 255, g: 87, b: 51 },
  hsl: { h: 12, s: 100, l: 60 },
  name: 'Test Color',
};

const mockPosition: PanelPosition = {
  x: 100,
  y: 200,
  side: 'right',
};

describe('ColorInfoPanel', () => {
  it('renders nothing when colorInfo is null', () => {
    const { container } = render(
      <ColorInfoPanel
        colorInfo={null}
        position={mockPosition}
        isVisible={true}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders color information when colorInfo is provided', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={true}
      />
    );

    // Check if the panel is rendered
    expect(screen.getByTestId('color-info-panel')).toBeInTheDocument();
    
    // Check color swatch
    expect(screen.getByTestId('color-swatch')).toBeInTheDocument();
    
    // Check color values
    expect(screen.getByTestId('hex-value')).toHaveTextContent('#FF5733');
    expect(screen.getByTestId('rgb-value')).toHaveTextContent('255, 87, 51');
    expect(screen.getByTestId('hsl-value')).toHaveTextContent('12°, 100%, 60%');
    
    // Check color name
    expect(screen.getByText('Test Color')).toBeInTheDocument();
  });

  it('renders without color name when name is not provided', () => {
    const colorInfoWithoutName = { ...mockColorInfo, name: undefined };
    
    render(
      <ColorInfoPanel
        colorInfo={colorInfoWithoutName}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.queryByText('Test Color')).not.toBeInTheDocument();
    expect(screen.getByTestId('hex-value')).toHaveTextContent('#FF5733');
  });

  it('applies correct positioning styles', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    const styles = window.getComputedStyle(panel);
    
    expect(panel).toHaveStyle({
      position: 'absolute',
      left: '100px',
      top: '200px',
    });
  });

  it('applies visible styles when isVisible is true', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    expect(panel).toHaveStyle({
      opacity: '1',
      transform: 'scale(1)',
      pointerEvents: 'auto',
    });
  });

  it('applies hidden styles when isVisible is false', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={false}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    expect(panel).toHaveStyle({
      opacity: '0',
      transform: 'scale(0.95)',
      pointerEvents: 'none',
    });
  });

  it('rounds HSL values correctly', () => {
    const colorInfoWithDecimals: ColorInfo = {
      hex: '#FF5733',
      rgb: { r: 255, g: 87, b: 51 },
      hsl: { h: 12.456, s: 99.789, l: 60.123 },
    };

    render(
      <ColorInfoPanel
        colorInfo={colorInfoWithDecimals}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.getByTestId('hsl-value')).toHaveTextContent('12°, 100%, 60%');
  });

  it('applies custom className', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={true}
        className="custom-class"
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    expect(panel).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
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
    
    const colorSwatch = screen.getByTestId('color-swatch');
    expect(colorSwatch).toHaveAttribute('aria-label', 'Color swatch for #FF5733');
  });

  it('sets correct background color for color swatch', () => {
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={mockPosition}
        isVisible={true}
      />
    );

    const colorSwatch = screen.getByTestId('color-swatch');
    expect(colorSwatch).toHaveStyle({ backgroundColor: '#FF5733' });
  });

  it('handles different position sides', () => {
    const positions: PanelPosition[] = [
      { x: 50, y: 100, side: 'left' },
      { x: 150, y: 200, side: 'right' },
      { x: 75, y: 50, side: 'top' },
      { x: 125, y: 250, side: 'bottom' },
    ];

    positions.forEach((position) => {
      const { rerender } = render(
        <ColorInfoPanel
          colorInfo={mockColorInfo}
          position={position}
          isVisible={true}
        />
      );

      const panel = screen.getByTestId('color-info-panel');
      expect(panel).toHaveStyle({
        left: `${position.x}px`,
        top: `${position.y}px`,
      });

      rerender(<div />); // Clean up for next iteration
    });
  });
});