'use client';

import React, { useMemo } from 'react';
import { ColorInfo, PanelPosition } from '@/types';

export interface ColorInfoPanelProps {
  colorInfo: ColorInfo | null;
  position: PanelPosition;
  isVisible: boolean;
  className?: string;
}

/**
 * ColorInfoPanel component that displays detailed color information
 * with smart positioning to avoid overlapping the image
 */
export const ColorInfoPanel: React.FC<ColorInfoPanelProps> = ({
  colorInfo,
  position,
  isVisible,
  className = '',
}) => {
  // Detect mobile device
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

  // Calculate panel styles based on position and visibility
  const panelStyles = useMemo(() => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 50,
      transition: 'all 0.3s ease-in-out',
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' as const : 'none' as const,
    };

    // Position the panel based on the calculated position
    const positionStyles = {
      left: position.x,
      top: position.y,
    };

    return { ...baseStyles, ...positionStyles };
  }, [position, isVisible]);

  // Don't render if no color info is provided
  if (!colorInfo) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg ${
        isMobile 
          ? 'p-3 min-w-40 text-sm' 
          : 'p-4 min-w-48'
      } ${className}`}
      style={panelStyles}
      data-testid="color-info-panel"
      role="tooltip"
      aria-live="polite"
    >
      {/* Color swatch preview */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: colorInfo.hex }}
          data-testid="color-swatch"
          aria-label={`Color swatch for ${colorInfo.hex}`}
        />
        {colorInfo.name && (
          <h3 className="font-semibold text-gray-900 text-sm">
            {colorInfo.name}
          </h3>
        )}
      </div>

      {/* Color values */}
      <div className={isMobile ? 'space-y-1.5' : 'space-y-2'}>
        {/* Hex value */}
        <div className="flex justify-between items-center">
          <span className={`font-medium text-gray-600 uppercase tracking-wide ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            HEX
          </span>
          <code 
            className={`font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
            data-testid="hex-value"
          >
            {colorInfo.hex}
          </code>
        </div>

        {/* RGB values */}
        <div className="flex justify-between items-center">
          <span className={`font-medium text-gray-600 uppercase tracking-wide ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            RGB
          </span>
          <code 
            className={`font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
            data-testid="rgb-value"
          >
            {colorInfo.rgb.r}, {colorInfo.rgb.g}, {colorInfo.rgb.b}
          </code>
        </div>

        {/* HSL values */}
        <div className="flex justify-between items-center">
          <span className={`font-medium text-gray-600 uppercase tracking-wide ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            HSL
          </span>
          <code 
            className={`font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
            data-testid="hsl-value"
          >
            {Math.round(colorInfo.hsl.h)}°, {Math.round(colorInfo.hsl.s)}%, {Math.round(colorInfo.hsl.l)}%
          </code>
        </div>
      </div>
    </div>
  );
};

export default ColorInfoPanel;