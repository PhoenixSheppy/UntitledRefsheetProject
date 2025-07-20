'use client';

import React, { useMemo, useCallback } from 'react';
import { ColorSegment, ImageDimensions, ScaledSegment } from '@/types';

export interface ColorSegmentOverlayProps {
  segments: ColorSegment[];
  imageDimensions: ImageDimensions;
  displayDimensions: ImageDimensions;
  onSegmentHover: (segment: ColorSegment | null) => void;
  activeSegment: ColorSegment | null;
  className?: string;
}

/**
 * Scales segment coordinates from percentage-based to pixel-based coordinates
 * based on the actual display dimensions of the image
 */
const scaleSegmentCoordinates = (
  segment: ColorSegment,
  displayDimensions: ImageDimensions
): ScaledSegment => {
  return {
    ...segment,
    scaledCoordinates: {
      x: (segment.coordinates.x / 100) * displayDimensions.width,
      y: (segment.coordinates.y / 100) * displayDimensions.height,
    },
    scaledDimensions: {
      width: (segment.dimensions.width / 100) * displayDimensions.width,
      height: (segment.dimensions.height / 100) * displayDimensions.height,
    },
  };
};

/**
 * Individual segment overlay component that handles hover interactions
 */
interface SegmentOverlayItemProps {
  segment: ScaledSegment;
  originalSegment: ColorSegment;
  isActive: boolean;
  onHover: (segment: ColorSegment | null) => void;
}

const SegmentOverlayItem: React.FC<SegmentOverlayItemProps> = ({
  segment,
  originalSegment,
  isActive,
  onHover,
}) => {
  const handleMouseEnter = useCallback(() => {
    onHover(originalSegment);
  }, [originalSegment, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const baseStyles = {
    position: 'absolute' as const,
    left: segment.scaledCoordinates.x,
    top: segment.scaledCoordinates.y,
    width: segment.scaledDimensions.width,
    height: segment.scaledDimensions.height,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const shapeStyles = segment.shape === 'circle' 
    ? { borderRadius: '50%' }
    : { borderRadius: '4px' };

  const hoverStyles = isActive
    ? {
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
        border: '2px solid rgb(59, 130, 246)', // blue-500
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      }
    : {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        border: '2px solid transparent',
      };

  return (
    <div
      style={{
        ...baseStyles,
        ...shapeStyles,
        ...hoverStyles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Color segment: ${segment.name}`}
      data-testid={`color-segment-${segment.id}`}
    />
  );
};

/**
 * ColorSegmentOverlay component that renders interactive areas over the reference sheet image
 * Handles hover detection, coordinate scaling, and visual feedback
 */
export const ColorSegmentOverlay: React.FC<ColorSegmentOverlayProps> = ({
  segments,
  imageDimensions,
  displayDimensions,
  onSegmentHover,
  activeSegment,
  className = '',
}) => {
  // Scale all segments based on display dimensions
  const scaledSegments = useMemo(() => {
    return segments.map(segment => scaleSegmentCoordinates(segment, displayDimensions));
  }, [segments, displayDimensions]);

  // Container styles to match the image dimensions exactly
  const containerStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: displayDimensions.width,
    height: displayDimensions.height,
    pointerEvents: 'none' as const,
  };

  return (
    <div 
      className={`${className}`}
      style={containerStyles}
      data-testid="color-segment-overlay"
    >
      {scaledSegments.map((segment, index) => (
        <div
          key={segment.id}
          style={{ pointerEvents: 'auto' }}
        >
          <SegmentOverlayItem
            segment={segment}
            originalSegment={segments[index]}
            isActive={activeSegment?.id === segment.id}
            onHover={onSegmentHover}
          />
        </div>
      ))}
    </div>
  );
};

export default ColorSegmentOverlay;