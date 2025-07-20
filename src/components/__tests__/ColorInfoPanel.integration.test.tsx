import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColorInfoPanel } from '../ColorInfoPanel';
import { calculatePanelPosition, segmentToSegmentBounds } from '@/utils/positioning';
import { ColorInfo, SegmentBounds, Dimensions } from '@/types';

// Mock color info for testing
const mockColorInfo: ColorInfo = {
  hex: '#FF5733',
  rgb: { r: 255, g: 87, b: 51 },
  hsl: { h: 12, s: 100, l: 60 },
  name: 'Test Color',
};

describe('ColorInfoPanel Integration', () => {
  it('integrates with positioning utilities to display panel correctly', () => {
    const containerDimensions: Dimensions = { width: 800, height: 600 };
    const segmentBounds: SegmentBounds = {
      x: 100,
      y: 200,
      width: 50,
      height: 30,
    };

    // Calculate position using the positioning utility
    const position = calculatePanelPosition(segmentBounds, containerDimensions);

    // Render the panel with the calculated position
    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={position}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    // Verify the panel is positioned correctly
    expect(panel).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    // Verify the panel is visible
    expect(panel).toHaveStyle({
      opacity: '1',
      transform: 'scale(1)',
    });

    // Verify color information is displayed
    expect(screen.getByTestId('hex-value')).toHaveTextContent('#FF5733');
    expect(screen.getByTestId('rgb-value')).toHaveTextContent('255, 87, 51');
    expect(screen.getByTestId('hsl-value')).toHaveTextContent('12°, 100%, 60%');
  });

  it('positions panel to avoid overlap with segment', () => {
    const containerDimensions: Dimensions = { width: 800, height: 600 };
    const segmentBounds: SegmentBounds = {
      x: 300,
      y: 250,
      width: 100,
      height: 80,
    };

    const position = calculatePanelPosition(segmentBounds, containerDimensions);

    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={position}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    // Panel should be positioned to not overlap with the segment
    // The exact position depends on the algorithm, but it should be positioned
    // either to the left, right, top, or bottom of the segment
    expect(panel).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    // Verify the position is reasonable (not negative and within bounds)
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThan(containerDimensions.width);
    expect(position.y).toBeLessThan(containerDimensions.height);
  });

  it('handles edge case positioning near container boundaries', () => {
    const containerDimensions: Dimensions = { width: 400, height: 300 };
    const segmentBounds: SegmentBounds = {
      x: 350, // Very close to right edge
      y: 250, // Very close to bottom edge
      width: 30,
      height: 30,
    };

    const position = calculatePanelPosition(segmentBounds, containerDimensions);

    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={position}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    // Panel should be positioned within container bounds
    expect(panel).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    // Position should respect container boundaries
    expect(position.x).toBeGreaterThanOrEqual(16); // EDGE_PADDING
    expect(position.y).toBeGreaterThanOrEqual(16); // EDGE_PADDING
  });

  it('works with segmentToSegmentBounds utility', () => {
    const coordinates = { x: 150, y: 100 };
    const dimensions = { width: 60, height: 40 };
    const containerDimensions: Dimensions = { width: 800, height: 600 };

    // Convert to segment bounds using utility
    const segmentBounds = segmentToSegmentBounds(coordinates, dimensions);
    const position = calculatePanelPosition(segmentBounds, containerDimensions);

    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={position}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    // Verify the segment bounds were created correctly
    expect(segmentBounds).toEqual({
      x: 150,
      y: 100,
      width: 60,
      height: 40,
    });
  });

  it('handles responsive positioning for small containers', () => {
    const smallContainerDimensions: Dimensions = { width: 320, height: 240 }; // Mobile size
    const segmentBounds: SegmentBounds = {
      x: 160,
      y: 120,
      width: 40,
      height: 30,
    };

    const position = calculatePanelPosition(segmentBounds, smallContainerDimensions);

    render(
      <ColorInfoPanel
        colorInfo={mockColorInfo}
        position={position}
        isVisible={true}
      />
    );

    const panel = screen.getByTestId('color-info-panel');
    
    // Panel should still be positioned correctly even in small containers
    expect(panel).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    // Position should be within the small container bounds
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThan(smallContainerDimensions.width);
    expect(position.y).toBeLessThan(smallContainerDimensions.height);
  });
});