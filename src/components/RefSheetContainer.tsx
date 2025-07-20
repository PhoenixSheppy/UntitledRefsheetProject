'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ColorSegment, ImageDimensions, PanelPosition, SegmentBounds } from '@/types';
import { calculatePanelPosition, segmentToSegmentBounds, getResponsivePanelDimensions } from '@/utils/positioning';
import RefSheetImage from './RefSheetImage';
import ColorSegmentOverlay from './ColorSegmentOverlay';
import ColorInfoPanel from './ColorInfoPanel';

export interface RefSheetContainerProps {
  imageUrl: string;
  imageAlt?: string;
  colorSegments: ColorSegment[];
  preferredPanelSide?: 'left' | 'right' | 'auto';
  className?: string;
}

/**
 * RefSheetContainer component that orchestrates the interaction between
 * the reference sheet image, color segment overlays, and color info panel
 */
export const RefSheetContainer: React.FC<RefSheetContainerProps> = ({
  imageUrl,
  imageAlt = 'Character Reference Sheet',
  colorSegments,
  preferredPanelSide = 'auto',
  className = '',
}) => {
  // State management
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState<ImageDimensions | null>(null);
  const [activeSegment, setActiveSegment] = useState<ColorSegment | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({ x: 0, y: 0, side: 'right' });
  const [containerDimensions, setContainerDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle image load and get original dimensions
  const handleImageLoad = useCallback((dimensions: ImageDimensions) => {
    setImageDimensions(dimensions);
  }, []);

  // Update display dimensions when image container size changes
  const updateDisplayDimensions = useCallback(() => {
    if (imageContainerRef.current && imageDimensions) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      // Calculate actual display dimensions maintaining aspect ratio
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let displayWidth: number;
      let displayHeight: number;
      
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container - fit to width
        displayWidth = containerWidth;
        displayHeight = containerWidth / imageAspectRatio;
      } else {
        // Image is taller than container - fit to height
        displayHeight = containerHeight;
        displayWidth = containerHeight * imageAspectRatio;
      }
      
      setDisplayDimensions({ width: displayWidth, height: displayHeight });
    }
  }, [imageDimensions]);

  // Update container dimensions for panel positioning
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateDisplayDimensions();
      updateContainerDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDisplayDimensions, updateContainerDimensions]);

  // Update dimensions when image loads or container changes
  useEffect(() => {
    if (imageDimensions) {
      updateDisplayDimensions();
      updateContainerDimensions();
    }
  }, [imageDimensions, updateDisplayDimensions, updateContainerDimensions]);

  // Handle segment hover
  const handleSegmentHover = useCallback((segment: ColorSegment | null) => {
    setActiveSegment(segment);
    
    if (segment && displayDimensions) {
      // Calculate segment bounds in display coordinates
      const segmentBounds: SegmentBounds = {
        x: (segment.coordinates.x / 100) * displayDimensions.width,
        y: (segment.coordinates.y / 100) * displayDimensions.height,
        width: (segment.dimensions.width / 100) * displayDimensions.width,
        height: (segment.dimensions.height / 100) * displayDimensions.height,
      };
      
      // Calculate panel position
      const position = calculatePanelPosition(
        segmentBounds,
        containerDimensions,
        preferredPanelSide
      );
      
      setPanelPosition(position);
    }
  }, [displayDimensions, containerDimensions, preferredPanelSide]);

  // Responsive panel dimensions
  const responsivePanelDimensions = useMemo(() => {
    return getResponsivePanelDimensions(containerDimensions.width);
  }, [containerDimensions.width]);

  // Check if we have all required data for rendering overlays
  const canRenderOverlays = imageDimensions && displayDimensions && colorSegments.length > 0;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto ${className}`}
      data-testid="refsheet-container"
    >
      {/* Image container with relative positioning for overlays */}
      <div 
        ref={imageContainerRef}
        className="relative inline-block w-full"
      >
        {/* Reference sheet image */}
        <RefSheetImage
          src={imageUrl}
          alt={imageAlt}
          onImageLoad={handleImageLoad}
          className="w-full h-auto"
        />
        
        {/* Color segment overlays */}
        {canRenderOverlays && (
          <ColorSegmentOverlay
            segments={colorSegments}
            imageDimensions={imageDimensions}
            displayDimensions={displayDimensions}
            onSegmentHover={handleSegmentHover}
            activeSegment={activeSegment}
            className="absolute inset-0"
          />
        )}
      </div>
      
      {/* Color info panel */}
      <ColorInfoPanel
        colorInfo={activeSegment?.colorInfo || null}
        position={panelPosition}
        isVisible={!!activeSegment}
        className="z-50"
      />
      
      {/* Subtle hint for interactivity */}
      {canRenderOverlays && !activeSegment && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-full opacity-60 transition-opacity duration-300 hover:opacity-80">
          Hover to explore colors
        </div>
      )}
    </div>
  );
};

export default RefSheetContainer;