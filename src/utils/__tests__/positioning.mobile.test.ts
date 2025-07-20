import { describe, it, expect } from 'vitest';
import { 
  calculatePanelPosition, 
  getResponsivePanelDimensions 
} from '../positioning';
import { SegmentBounds, Dimensions } from '@/types';

describe('Positioning Utils - Mobile Support', () => {
  const mockSegmentBounds: SegmentBounds = {
    x: 100,
    y: 150,
    width: 50,
    height: 40
  };

  const mockContainerDimensions: Dimensions = {
    width: 400,
    height: 600
  };

  const mockMobileContainerDimensions: Dimensions = {
    width: 320,
    height: 568
  };

  describe('calculatePanelPosition with mobile support', () => {
    it('prefers vertical positioning on mobile devices', () => {
      const position = calculatePanelPosition(
        mockSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true // isMobile = true
      );

      // On mobile, should prefer bottom or top positioning
      expect(['top', 'bottom']).toContain(position.side);
    });

    it('uses mobile panel dimensions for positioning calculations', () => {
      const position = calculatePanelPosition(
        mockSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true // isMobile = true
      );

      // Position should account for smaller mobile panel dimensions
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThanOrEqual(mockMobileContainerDimensions.width);
      expect(position.y).toBeLessThanOrEqual(mockMobileContainerDimensions.height);
    });

    it('falls back to bottom positioning on mobile when no space is available', () => {
      // Create a scenario where there's truly no adequate space for the panel anywhere
      const tightSegmentBounds: SegmentBounds = {
        x: 80, // Center of mobile screen
        y: 100, // Position to limit top space
        width: 160, // Very wide to eliminate horizontal space
        height: 40
      };

      const tinyMobileContainer: Dimensions = {
        width: 320,
        height: 250 // Small height to limit all vertical space
      };

      const position = calculatePanelPosition(
        tightSegmentBounds,
        tinyMobileContainer,
        'auto',
        true // isMobile = true
      );

      // Should fallback to bottom for better thumb accessibility when no adequate space
      // In this scenario: spaceTop = 100, spaceBottom = 110, both < required 148
      // spaceLeft = 80, spaceRight = 80, both < required 188
      expect(position.side).toBe('bottom');
    });

    it('respects preferred side on mobile when space allows', () => {
      const topSegmentBounds: SegmentBounds = {
        x: 100,
        y: 50, // Near top, plenty of space below
        width: 50,
        height: 40
      };

      const position = calculatePanelPosition(
        topSegmentBounds,
        mockMobileContainerDimensions,
        'right',
        true // isMobile = true
      );

      // Should still try to respect preference if space allows
      expect(position).toBeDefined();
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
    });

    it('maintains desktop behavior when isMobile is false', () => {
      const position = calculatePanelPosition(
        mockSegmentBounds,
        mockContainerDimensions,
        'auto',
        false // isMobile = false
      );

      // On desktop, should prefer horizontal positioning
      expect(['left', 'right']).toContain(position.side);
    });
  });

  describe('getResponsivePanelDimensions', () => {
    it('returns smaller dimensions for mobile screens', () => {
      const mobileDimensions = getResponsivePanelDimensions(320);
      
      expect(mobileDimensions.width).toBeLessThan(192); // Less than desktop width
      expect(mobileDimensions.height).toBeLessThan(140); // Less than desktop height
      expect(mobileDimensions.width).toBe(160); // Expected mobile width
      expect(mobileDimensions.height).toBe(120); // Expected mobile height
    });

    it('returns standard dimensions for desktop screens', () => {
      const desktopDimensions = getResponsivePanelDimensions(1024);
      
      expect(desktopDimensions.width).toBe(192); // Standard desktop width
      expect(desktopDimensions.height).toBe(140); // Standard desktop height
    });

    it('handles edge case of very small screens', () => {
      const verySmallDimensions = getResponsivePanelDimensions(280);
      
      // Should ensure panel fits with padding
      expect(verySmallDimensions.width).toBeLessThanOrEqual(280 - 32); // Container width minus padding
      expect(verySmallDimensions.width).toBeGreaterThan(0);
    });

    it('handles tablet-sized screens appropriately', () => {
      const tabletDimensions = getResponsivePanelDimensions(768);
      
      // Tablet should use desktop dimensions
      expect(tabletDimensions.width).toBe(192);
      expect(tabletDimensions.height).toBe(140);
    });
  });

  describe('Mobile positioning edge cases', () => {
    it('handles segments near screen edges on mobile', () => {
      const edgeSegmentBounds: SegmentBounds = {
        x: 10, // Very close to left edge
        y: 10, // Very close to top edge
        width: 30,
        height: 30
      };

      const position = calculatePanelPosition(
        edgeSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true
      );

      // Should position panel within screen bounds
      expect(position.x).toBeGreaterThanOrEqual(16); // EDGE_PADDING
      expect(position.y).toBeGreaterThanOrEqual(16); // EDGE_PADDING
    });

    it('handles segments near bottom of mobile screen', () => {
      const bottomSegmentBounds: SegmentBounds = {
        x: 160,
        y: 520, // Near bottom of mobile screen
        width: 40,
        height: 30
      };

      const position = calculatePanelPosition(
        bottomSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true
      );

      // Should position panel to fit within screen
      const mobilePanelHeight = getResponsivePanelDimensions(mockMobileContainerDimensions.width).height;
      expect(position.y + mobilePanelHeight).toBeLessThanOrEqual(mockMobileContainerDimensions.height);
    });

    it('handles very wide segments on mobile', () => {
      const wideSegmentBounds: SegmentBounds = {
        x: 50,
        y: 200,
        width: 220, // Very wide segment
        height: 40
      };

      const position = calculatePanelPosition(
        wideSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true
      );

      // Should still find a valid position
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.side).toBeDefined();
    });
  });

  describe('Mobile accessibility considerations', () => {
    it('positions panels for optimal thumb reach on mobile', () => {
      const centerSegmentBounds: SegmentBounds = {
        x: 160,
        y: 300,
        width: 50,
        height: 40
      };

      const position = calculatePanelPosition(
        centerSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true
      );

      // On mobile, bottom positioning is preferred for thumb accessibility
      if (position.side === 'bottom') {
        expect(position.y).toBeGreaterThan(centerSegmentBounds.y + centerSegmentBounds.height);
      }
    });

    it('ensures minimum touch target spacing on mobile', () => {
      const position = calculatePanelPosition(
        mockSegmentBounds,
        mockMobileContainerDimensions,
        'auto',
        true
      );

      // Panel should have adequate spacing from segment (SEGMENT_PANEL_GAP = 12)
      const minGap = 12;
      
      switch (position.side) {
        case 'right':
          expect(position.x).toBeGreaterThanOrEqual(mockSegmentBounds.x + mockSegmentBounds.width + minGap);
          break;
        case 'left':
          expect(position.x + getResponsivePanelDimensions(mockMobileContainerDimensions.width).width)
            .toBeLessThanOrEqual(mockSegmentBounds.x - minGap);
          break;
        case 'bottom':
          expect(position.y).toBeGreaterThanOrEqual(mockSegmentBounds.y + mockSegmentBounds.height + minGap);
          break;
        case 'top':
          expect(position.y + getResponsivePanelDimensions(mockMobileContainerDimensions.width).height)
            .toBeLessThanOrEqual(mockSegmentBounds.y - minGap);
          break;
      }
    });
  });
});