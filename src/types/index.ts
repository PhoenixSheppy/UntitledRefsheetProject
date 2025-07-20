// Core type definitions for the Interactive Character Reference Sheet

export interface ColorInfo {
  hex: string; // e.g., "#FF5733"
  rgb: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  };
  hsl: {
    h: number; // 0-360 (hue)
    s: number; // 0-100 (saturation %)
    l: number; // 0-100 (lightness %)
  };
  name?: string; // Optional color name
}

export interface ColorSegment {
  id: string;
  name: string; // e.g., "Main Fur Color", "Eye Color"
  coordinates: {
    x: number; // X position as percentage of image width
    y: number; // Y position as percentage of image height
  };
  dimensions: {
    width: number; // Width as percentage of image width
    height: number; // Height as percentage of image height
  };
  shape: 'rectangle' | 'circle'; // Shape of the interactive area
  colorInfo: ColorInfo;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface PanelPosition {
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

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

export interface SegmentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

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

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}