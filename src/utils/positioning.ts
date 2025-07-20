import { PanelPosition, SegmentBounds, Dimensions } from '@/types';

/**
 * Panel dimensions - these should match the actual rendered panel size
 */
const PANEL_DIMENSIONS = {
  width: 192, // min-w-48 = 12rem = 192px
  height: 140, // Approximate height based on content
};

/**
 * Minimum distance from container edges
 */
const EDGE_PADDING = 16;

/**
 * Distance between segment and panel
 */
const SEGMENT_PANEL_GAP = 12;

/**
 * Calculate the optimal position for the color info panel
 * to avoid overlapping with the image and fit within the container
 */
export function calculatePanelPosition(
  segmentBounds: SegmentBounds,
  containerDimensions: Dimensions,
  preferredSide: 'left' | 'right' | 'auto' = 'auto'
): PanelPosition {
  const panelWidth = PANEL_DIMENSIONS.width;
  const panelHeight = PANEL_DIMENSIONS.height;
  
  // Calculate segment center
  const segmentCenterX = segmentBounds.x + segmentBounds.width / 2;
  const segmentCenterY = segmentBounds.y + segmentBounds.height / 2;
  
  // Calculate available space on each side
  const spaceLeft = segmentBounds.x;
  const spaceRight = containerDimensions.width - (segmentBounds.x + segmentBounds.width);
  const spaceTop = segmentBounds.y;
  const spaceBottom = containerDimensions.height - (segmentBounds.y + segmentBounds.height);
  
  // Determine the best side based on available space and preference
  let bestSide: 'left' | 'right' | 'top' | 'bottom';
  
  if (preferredSide === 'left' && spaceLeft >= panelWidth + SEGMENT_PANEL_GAP + EDGE_PADDING) {
    bestSide = 'left';
  } else if (preferredSide === 'right' && spaceRight >= panelWidth + SEGMENT_PANEL_GAP + EDGE_PADDING) {
    bestSide = 'right';
  } else {
    // Auto-determine best side based on available space
    const horizontalSpaces = [
      { side: 'right' as const, space: spaceRight },
      { side: 'left' as const, space: spaceLeft },
    ].sort((a, b) => b.space - a.space);
    
    const verticalSpaces = [
      { side: 'bottom' as const, space: spaceBottom },
      { side: 'top' as const, space: spaceTop },
    ].sort((a, b) => b.space - a.space);
    
    // Prefer horizontal positioning if there's enough space
    if (horizontalSpaces[0].space >= panelWidth + SEGMENT_PANEL_GAP + EDGE_PADDING) {
      bestSide = horizontalSpaces[0].side;
    } else if (verticalSpaces[0].space >= panelHeight + SEGMENT_PANEL_GAP + EDGE_PADDING) {
      bestSide = verticalSpaces[0].side;
    } else {
      // Fallback to the side with the most space, even if it might overflow
      const allSpaces = [...horizontalSpaces, ...verticalSpaces].sort((a, b) => b.space - a.space);
      bestSide = allSpaces[0].side;
    }
  }
  
  // Calculate position based on chosen side
  let x: number, y: number;
  
  switch (bestSide) {
    case 'left':
      x = Math.max(EDGE_PADDING, segmentBounds.x - panelWidth - SEGMENT_PANEL_GAP);
      y = Math.max(
        EDGE_PADDING,
        Math.min(
          segmentCenterY - panelHeight / 2,
          containerDimensions.height - panelHeight - EDGE_PADDING
        )
      );
      break;
      
    case 'right':
      x = Math.min(
        containerDimensions.width - panelWidth - EDGE_PADDING,
        segmentBounds.x + segmentBounds.width + SEGMENT_PANEL_GAP
      );
      y = Math.max(
        EDGE_PADDING,
        Math.min(
          segmentCenterY - panelHeight / 2,
          containerDimensions.height - panelHeight - EDGE_PADDING
        )
      );
      break;
      
    case 'top':
      x = Math.max(
        EDGE_PADDING,
        Math.min(
          segmentCenterX - panelWidth / 2,
          containerDimensions.width - panelWidth - EDGE_PADDING
        )
      );
      y = Math.max(EDGE_PADDING, segmentBounds.y - panelHeight - SEGMENT_PANEL_GAP);
      break;
      
    case 'bottom':
      x = Math.max(
        EDGE_PADDING,
        Math.min(
          segmentCenterX - panelWidth / 2,
          containerDimensions.width - panelWidth - EDGE_PADDING
        )
      );
      y = Math.min(
        containerDimensions.height - panelHeight - EDGE_PADDING,
        segmentBounds.y + segmentBounds.height + SEGMENT_PANEL_GAP
      );
      break;
  }
  
  return {
    x,
    y,
    side: bestSide,
  };
}

/**
 * Convert a segment's coordinates and dimensions to a SegmentBounds object
 */
export function segmentToSegmentBounds(
  coordinates: { x: number; y: number },
  dimensions: { width: number; height: number }
): SegmentBounds {
  return {
    x: coordinates.x,
    y: coordinates.y,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Check if a position is within the container bounds
 */
export function isPositionWithinBounds(
  position: { x: number; y: number },
  dimensions: { width: number; height: number },
  containerDimensions: Dimensions
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + dimensions.width <= containerDimensions.width &&
    position.y + dimensions.height <= containerDimensions.height
  );
}

/**
 * Calculate responsive panel dimensions based on screen size
 */
export function getResponsivePanelDimensions(containerWidth: number): Dimensions {
  // On mobile screens, make the panel slightly smaller
  if (containerWidth < 640) { // sm breakpoint
    return {
      width: Math.min(160, containerWidth - 32), // Ensure it fits with padding
      height: 120,
    };
  }
  
  return PANEL_DIMENSIONS;
}