'use client';

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { ColorSegment, ImageDimensions, ScaledSegment } from '@/types';
import { debounce, announceToScreenReader, KeyboardNavigation } from '@/utils';

export interface ColorSegmentOverlayProps {
  segments: ColorSegment[];
  imageDimensions: ImageDimensions;
  displayDimensions: ImageDimensions;
  onSegmentHover: (segment: ColorSegment | null) => void;
  onSegmentTouch?: (segment: ColorSegment | null) => void;
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
 * Individual segment overlay component that handles hover and touch interactions
 */
interface SegmentOverlayItemProps {
  segment: ScaledSegment;
  originalSegment: ColorSegment;
  isActive: boolean;
  onHover: (segment: ColorSegment | null) => void;
  onTouch: (segment: ColorSegment | null) => void;
  isMobile: boolean;
  onKeyboardActivate?: (segment: ColorSegment) => void;
}

const SegmentOverlayItem: React.FC<SegmentOverlayItemProps> = ({
  segment,
  originalSegment,
  isActive,
  onHover,
  onTouch,
  isMobile,
  onKeyboardActivate,
}) => {
  // Debounced hover handlers for smooth interactions
  const debouncedHoverEnter = useMemo(
    () => debounce(() => {
      if (!isMobile) {
        onHover(originalSegment);
      }
    }, 50),
    [originalSegment, onHover, isMobile]
  );

  const debouncedHoverLeave = useMemo(
    () => debounce(() => {
      if (!isMobile) {
        onHover(null);
      }
    }, 100),
    [onHover, isMobile]
  );

  const handleMouseEnter = useCallback(() => {
    debouncedHoverEnter();
  }, [debouncedHoverEnter]);

  const handleMouseLeave = useCallback(() => {
    debouncedHoverLeave();
  }, [debouncedHoverLeave]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onTouch(isActive ? null : originalSegment);
  }, [originalSegment, onTouch, isActive]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      onTouch(isActive ? null : originalSegment);
    }
  }, [originalSegment, onTouch, isActive, isMobile]);

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isMobile) {
          onTouch(isActive ? null : originalSegment);
        } else {
          onHover(isActive ? null : originalSegment);
        }
        if (onKeyboardActivate) {
          onKeyboardActivate(originalSegment);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onHover(null);
        break;
    }
  }, [originalSegment, onHover, onTouch, isActive, isMobile, onKeyboardActivate]);

  const handleFocus = useCallback(() => {
    if (!isMobile) {
      onHover(originalSegment);
    }
    // Announce to screen readers
    announceToScreenReader(
      `Color segment ${originalSegment.name} focused. Press Enter or Space to view color details.`,
      'polite'
    );
  }, [originalSegment, onHover, isMobile]);

  const handleBlur = useCallback(() => {
    if (!isMobile) {
      onHover(null);
    }
  }, [onHover, isMobile]);

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
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="button"
      tabIndex={0}
      aria-label={`Color segment: ${segment.name}. ${originalSegment.colorInfo.hex}`}
      aria-describedby={isActive ? `color-info-${segment.id}` : undefined}
      data-testid={`color-segment-${segment.id}`}
    />
  );
};

/**
 * Hook to detect if the device supports touch
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      setIsMobile(hasTouchScreen && isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/**
 * ColorSegmentOverlay component that renders interactive areas over the reference sheet image
 * Handles hover detection, coordinate scaling, touch interactions, and visual feedback
 */
export const ColorSegmentOverlay: React.FC<ColorSegmentOverlayProps> = ({
  segments,
  imageDimensions,
  displayDimensions,
  onSegmentHover,
  onSegmentTouch,
  activeSegment,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedSegmentIndex, setFocusedSegmentIndex] = useState<number>(-1);

  // Scale all segments based on display dimensions
  const scaledSegments = useMemo(() => {
    return segments.map(segment => scaleSegmentCoordinates(segment, displayDimensions));
  }, [segments, displayDimensions]);

  // Handle touch interactions
  const handleTouch = useCallback((segment: ColorSegment | null) => {
    if (onSegmentTouch) {
      onSegmentTouch(segment);
    } else {
      // Fallback to hover handler if no touch handler provided
      onSegmentHover(segment);
    }
  }, [onSegmentTouch, onSegmentHover]);

  // Handle keyboard navigation between segments
  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const segmentElements = Array.from(
      containerRef.current.querySelectorAll('[data-testid^="color-segment-"]')
    ) as HTMLElement[];

    if (segmentElements.length === 0) return;

    const currentIndex = focusedSegmentIndex >= 0 ? focusedSegmentIndex : 0;
    
    const newIndex = KeyboardNavigation.handleArrowNavigation(
      e as any,
      segmentElements,
      currentIndex,
      {
        orientation: 'both',
        wrap: true,
        columns: Math.ceil(Math.sqrt(segmentElements.length)) // Approximate grid layout
      }
    );

    if (newIndex !== currentIndex) {
      setFocusedSegmentIndex(newIndex);
      segmentElements[newIndex]?.focus();
    }
  }, [focusedSegmentIndex]);

  // Handle keyboard activation of segments
  const handleKeyboardActivate = useCallback((segment: ColorSegment) => {
    announceToScreenReader(
      `Color ${segment.name}: ${segment.colorInfo.hex}, RGB ${segment.colorInfo.rgb.r}, ${segment.colorInfo.rgb.g}, ${segment.colorInfo.rgb.b}`,
      'assertive'
    );
  }, []);

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
      ref={containerRef}
      className={`${className}`}
      style={containerStyles}
      data-testid="color-segment-overlay"
      onKeyDown={handleContainerKeyDown}
      role="group"
      aria-label="Interactive color segments"
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
            onTouch={handleTouch}
            onKeyboardActivate={handleKeyboardActivate}
            isMobile={isMobile}
          />
        </div>
      ))}
    </div>
  );
};

export default ColorSegmentOverlay;