import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ColorSegmentOverlay } from '../ColorSegmentOverlay';
import { ColorSegment, ImageDimensions } from '@/types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock data for testing
const mockColorSegments: ColorSegment[] = [
  {
    id: 'segment-1',
    name: 'Main Fur Color',
    coordinates: { x: 25, y: 30 }, // 25% from left, 30% from top
    dimensions: { width: 10, height: 15 }, // 10% width, 15% height
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
    coordinates: { x: 45, y: 20 }, // 45% from left, 20% from top
    dimensions: { width: 8, height: 8 }, // 8% width, 8% height
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

describe('ColorSegmentOverlay', () => {
  const mockOnSegmentHover = vi.fn();

  beforeEach(() => {
    mockOnSegmentHover.mockClear();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      expect(screen.getByTestId('color-segment-overlay')).toBeInTheDocument();
    });

    it('renders all provided segments', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      expect(screen.getByTestId('color-segment-segment-1')).toBeInTheDocument();
      expect(screen.getByTestId('color-segment-segment-2')).toBeInTheDocument();
    });

    it('applies correct accessibility attributes', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      expect(segment1).toHaveAttribute('role', 'button');
      expect(segment1).toHaveAttribute('tabIndex', '0');
      expect(segment1).toHaveAttribute('aria-label', 'Color segment: Main Fur Color');

      expect(segment2).toHaveAttribute('role', 'button');
      expect(segment2).toHaveAttribute('tabIndex', '0');
      expect(segment2).toHaveAttribute('aria-label', 'Color segment: Eye Color');
    });
  });

  describe('Coordinate Scaling', () => {
    it('correctly scales segment coordinates based on display dimensions', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      // Segment 1: 25% of 400px = 100px, 30% of 300px = 90px
      // Dimensions: 10% of 400px = 40px, 15% of 300px = 45px
      expect(segment1).toHaveStyle({
        left: '100px',
        top: '90px',
        width: '40px',
        height: '45px'
      });

      // Segment 2: 45% of 400px = 180px, 20% of 300px = 60px
      // Dimensions: 8% of 400px = 32px, 8% of 300px = 24px
      expect(segment2).toHaveStyle({
        left: '180px',
        top: '60px',
        width: '32px',
        height: '24px'
      });
    });

    it('handles different display dimensions correctly', () => {
      const largerDisplayDimensions: ImageDimensions = {
        width: 800,
        height: 600
      };

      render(
        <ColorSegmentOverlay
          segments={[mockColorSegments[0]]}
          imageDimensions={mockImageDimensions}
          displayDimensions={largerDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');

      // Segment 1 with larger display: 25% of 800px = 200px, 30% of 600px = 180px
      // Dimensions: 10% of 800px = 80px, 15% of 600px = 90px
      expect(segment).toHaveStyle({
        left: '200px',
        top: '180px',
        width: '80px',
        height: '90px'
      });
    });
  });

  describe('Shape Support', () => {
    it('applies rectangle border radius for rectangle segments', () => {
      render(
        <ColorSegmentOverlay
          segments={[mockColorSegments[0]]} // rectangle segment
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      expect(segment).toHaveStyle({ borderRadius: '4px' });
    });

    it('applies circular border radius for circle segments', () => {
      render(
        <ColorSegmentOverlay
          segments={[mockColorSegments[1]]} // circle segment
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-2');
      expect(segment).toHaveStyle({ borderRadius: '50%' });
    });
  });

  describe('Hover Interactions', () => {
    it('calls onSegmentHover with segment when mouse enters', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      fireEvent.mouseEnter(segment1);

      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[0]);
    });

    it('calls onSegmentHover with null when mouse leaves', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      fireEvent.mouseLeave(segment1);

      expect(mockOnSegmentHover).toHaveBeenCalledWith(null);
    });

    it('handles multiple segment interactions correctly', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      // Hover over first segment
      fireEvent.mouseEnter(segment1);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[0]);

      // Leave first segment
      fireEvent.mouseLeave(segment1);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(null);

      // Hover over second segment
      fireEvent.mouseEnter(segment2);
      expect(mockOnSegmentHover).toHaveBeenCalledWith(mockColorSegments[1]);
    });
  });

  describe('Visual Hover Indicators', () => {
    it('applies active styles when segment is active', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={mockColorSegments[0]}
        />
      );

      const activeSegment = screen.getByTestId('color-segment-segment-1');
      const inactiveSegment = screen.getByTestId('color-segment-segment-2');

      // Active segment should have blue background and border
      expect(activeSegment).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        border: '2px solid rgb(59, 130, 246)',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)'
      });

      // Inactive segment should have subtle background
      expect(inactiveSegment).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        border: '2px solid transparent'
      });
    });

    it('applies smooth transitions to all segments', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      expect(segment1).toHaveStyle({ transition: 'all 0.2s ease-in-out' });
      expect(segment2).toHaveStyle({ transition: 'all 0.2s ease-in-out' });
    });

    it('applies cursor pointer to all segments', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment1 = screen.getByTestId('color-segment-segment-1');
      const segment2 = screen.getByTestId('color-segment-segment-2');

      expect(segment1).toHaveStyle({ cursor: 'pointer' });
      expect(segment2).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Container Positioning', () => {
    it('sets container dimensions to match display dimensions', () => {
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const container = screen.getByTestId('color-segment-overlay');
      expect(container).toHaveStyle({
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '400px',
        height: '300px',
        pointerEvents: 'none'
      });
    });

    it('applies custom className to container', () => {
      const customClass = 'custom-overlay-class';
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
          className={customClass}
        />
      );

      const container = screen.getByTestId('color-segment-overlay');
      expect(container).toHaveClass(customClass);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty segments array', () => {
      render(
        <ColorSegmentOverlay
          segments={[]}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const container = screen.getByTestId('color-segment-overlay');
      expect(container).toBeInTheDocument();
      expect(container.children).toHaveLength(0);
    });

    it('handles zero display dimensions gracefully', () => {
      const zeroDimensions: ImageDimensions = { width: 0, height: 0 };
      
      render(
        <ColorSegmentOverlay
          segments={mockColorSegments}
          imageDimensions={mockImageDimensions}
          displayDimensions={zeroDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const container = screen.getByTestId('color-segment-overlay');
      expect(container).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });

    it('handles segments with zero dimensions', () => {
      const segmentWithZeroDimensions: ColorSegment = {
        ...mockColorSegments[0],
        dimensions: { width: 0, height: 0 }
      };

      render(
        <ColorSegmentOverlay
          segments={[segmentWithZeroDimensions]}
          imageDimensions={mockImageDimensions}
          displayDimensions={mockDisplayDimensions}
          onSegmentHover={mockOnSegmentHover}
          activeSegment={null}
        />
      );

      const segment = screen.getByTestId('color-segment-segment-1');
      expect(segment).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });
  });
});