import { describe, it, expect } from 'vitest';
import {
  calculatePanelPosition,
  segmentToSegmentBounds,
  isPositionWithinBounds,
  getResponsivePanelDimensions,
} from '../positioning';
import { SegmentBounds, Dimensions } from '@/types';

describe('positioning utilities', () => {
  const containerDimensions: Dimensions = { width: 800, height: 600 };
  
  describe('calculatePanelPosition', () => {
    it('positions panel to the right when there is sufficient space', () => {
      const segmentBounds: SegmentBounds = {
        x: 100,
        y: 200,
        width: 50,
        height: 30,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      expect(position.side).toBe('right');
      expect(position.x).toBeGreaterThan(segmentBounds.x + segmentBounds.width);
      expect(position.y).toBeGreaterThanOrEqual(16); // EDGE_PADDING
    });

    it('positions panel to the left when right side has insufficient space', () => {
      const segmentBounds: SegmentBounds = {
        x: 600, // Close to right edge
        y: 200,
        width: 50,
        height: 30,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      expect(position.side).toBe('left');
      expect(position.x).toBeLessThan(segmentBounds.x);
      expect(position.x).toBeGreaterThanOrEqual(16); // EDGE_PADDING
    });

    it('respects preferred side when space is available', () => {
      const segmentBounds: SegmentBounds = {
        x: 300,
        y: 200,
        width: 50,
        height: 30,
      };

      const leftPosition = calculatePanelPosition(segmentBounds, containerDimensions, 'left');
      const rightPosition = calculatePanelPosition(segmentBounds, containerDimensions, 'right');
      
      expect(leftPosition.side).toBe('left');
      expect(rightPosition.side).toBe('right');
    });

    it('chooses the side with most available space', () => {
      const segmentBounds: SegmentBounds = {
        x: 250, // Position where both left and right have insufficient space for panel
        y: 100,
        width: 300, // Wide segment that takes up most of the width
        height: 30,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      // With segment at x=250, width=300, it ends at x=550
      // Right space: 800 - 550 = 250px
      // Left space: 250px
      // Right space is sorted first in the algorithm, so it should choose right
      expect(position.side).toBe('right');
    });

    it('centers panel vertically when positioned horizontally', () => {
      const segmentBounds: SegmentBounds = {
        x: 100,
        y: 200,
        width: 50,
        height: 30,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      const segmentCenterY = segmentBounds.y + segmentBounds.height / 2;
      const expectedY = segmentCenterY - 140 / 2; // 140 is panel height
      
      expect(position.y).toBeCloseTo(expectedY, 0);
    });

    it('keeps panel within container bounds', () => {
      const segmentBounds: SegmentBounds = {
        x: 10, // Very close to left edge
        y: 10, // Very close to top edge
        width: 20,
        height: 20,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      expect(position.x).toBeGreaterThanOrEqual(16); // EDGE_PADDING
      expect(position.y).toBeGreaterThanOrEqual(16); // EDGE_PADDING
      expect(position.x + 192).toBeLessThanOrEqual(containerDimensions.width - 16); // Panel width + EDGE_PADDING
    });

    it('handles segments near bottom edge', () => {
      const segmentBounds: SegmentBounds = {
        x: 300,
        y: 550, // Near bottom
        width: 50,
        height: 30,
      };

      const position = calculatePanelPosition(segmentBounds, containerDimensions);
      
      expect(position.y + 140).toBeLessThanOrEqual(containerDimensions.height - 16); // Panel height + EDGE_PADDING
    });
  });

  describe('segmentToSegmentBounds', () => {
    it('converts coordinates and dimensions to SegmentBounds', () => {
      const coordinates = { x: 100, y: 200 };
      const dimensions = { width: 50, height: 30 };

      const bounds = segmentToSegmentBounds(coordinates, dimensions);

      expect(bounds).toEqual({
        x: 100,
        y: 200,
        width: 50,
        height: 30,
      });
    });
  });

  describe('isPositionWithinBounds', () => {
    it('returns true when position is within bounds', () => {
      const position = { x: 100, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const containerDimensions = { width: 800, height: 600 };

      const result = isPositionWithinBounds(position, dimensions, containerDimensions);

      expect(result).toBe(true);
    });

    it('returns false when position exceeds right boundary', () => {
      const position = { x: 700, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const containerDimensions = { width: 800, height: 600 };

      const result = isPositionWithinBounds(position, dimensions, containerDimensions);

      expect(result).toBe(false);
    });

    it('returns false when position exceeds bottom boundary', () => {
      const position = { x: 100, y: 500 };
      const dimensions = { width: 200, height: 150 };
      const containerDimensions = { width: 800, height: 600 };

      const result = isPositionWithinBounds(position, dimensions, containerDimensions);

      expect(result).toBe(false);
    });

    it('returns false when position is negative', () => {
      const position = { x: -10, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const containerDimensions = { width: 800, height: 600 };

      const result = isPositionWithinBounds(position, dimensions, containerDimensions);

      expect(result).toBe(false);
    });
  });

  describe('getResponsivePanelDimensions', () => {
    it('returns smaller dimensions for mobile screens', () => {
      const mobileDimensions = getResponsivePanelDimensions(320);

      expect(mobileDimensions.width).toBeLessThan(192);
      expect(mobileDimensions.height).toBeLessThan(140);
    });

    it('returns default dimensions for desktop screens', () => {
      const desktopDimensions = getResponsivePanelDimensions(1024);

      expect(desktopDimensions.width).toBe(192);
      expect(desktopDimensions.height).toBe(140);
    });

    it('ensures mobile panel fits within container with padding', () => {
      const containerWidth = 300;
      const mobileDimensions = getResponsivePanelDimensions(containerWidth);

      expect(mobileDimensions.width).toBeLessThanOrEqual(containerWidth - 32); // 32px total padding
    });

    it('handles very small screens', () => {
      const verySmallDimensions = getResponsivePanelDimensions(200);

      expect(verySmallDimensions.width).toBeLessThanOrEqual(168); // 200 - 32
      expect(verySmallDimensions.width).toBeGreaterThan(0);
    });
  });
});