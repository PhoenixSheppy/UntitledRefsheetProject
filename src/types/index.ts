// Core type definitions for the Interactive Character Reference Sheet

/**
 * Color information containing hex, RGB, and HSL values
 */
export interface ColorInfo {
  hex: string; // e.g., "#FF5733"
  rgb: RGB;
  hsl: HSL;
  name?: string; // Optional color name
}

/**
 * RGB color values (0-255 range)
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSL color values
 */
export interface HSL {
  h: number; // 0-360 (hue)
  s: number; // 0-100 (saturation %)
  l: number; // 0-100 (lightness %)
}

/**
 * Interactive color segment with coordinates, dimensions, and color information
 */
export interface ColorSegment {
  id: string;
  name: string; // e.g., "Main Fur Color", "Eye Color"
  coordinates: {
    x: number; // X position as percentage of image width (0-100)
    y: number; // Y position as percentage of image height (0-100)
  };
  dimensions: {
    width: number; // Width as percentage of image width (0-100)
    height: number; // Height as percentage of image height (0-100)
  };
  shape: 'rectangle' | 'circle'; // Shape of the interactive area
  colorInfo: ColorInfo;
}

/**
 * Image dimensions in pixels
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Position and side information for color info panel
 */
export interface PanelPosition {
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Complete configuration for the reference sheet application
 */
export interface RefSheetConfig {
  image: {
    src: string;
    alt: string;
    originalDimensions: ImageDimensions;
  };
  colorSegments: ColorSegment[];
  layout: {
    preferredPanelSide: 'left' | 'right' | 'auto';
    showSegmentHints: boolean;
  };
}

/**
 * Bounding box coordinates and dimensions
 */
export interface SegmentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Generic dimensions interface
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Color segment with scaled coordinates for display
 */
export interface ScaledSegment extends ColorSegment {
  scaledCoordinates: {
    x: number;
    y: number;
  };
  scaledDimensions: {
    width: number;
    height: number;
  };
}

// Re-export validation functions
export * from './validation'