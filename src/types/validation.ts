import type { ColorInfo, RGB, HSL, ColorSegment, RefSheetConfig } from './index'

/**
 * Validates RGB color values are within valid range (0-255)
 */
export function isValidRGB(rgb: RGB): boolean {
  return (
    Number.isInteger(rgb.r) && rgb.r >= 0 && rgb.r <= 255 &&
    Number.isInteger(rgb.g) && rgb.g >= 0 && rgb.g <= 255 &&
    Number.isInteger(rgb.b) && rgb.b >= 0 && rgb.b <= 255
  )
}

/**
 * Validates HSL color values are within valid ranges
 * H: 0-360, S: 0-100, L: 0-100
 */
export function isValidHSL(hsl: HSL): boolean {
  return (
    typeof hsl.h === 'number' && hsl.h >= 0 && hsl.h <= 360 &&
    typeof hsl.s === 'number' && hsl.s >= 0 && hsl.s <= 100 &&
    typeof hsl.l === 'number' && hsl.l >= 0 && hsl.l <= 100
  )
}

/**
 * Validates hex color format (#RRGGBB or #RGB)
 */
export function isValidHex(hex: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(hex)
}

/**
 * Validates complete color information structure
 */
export function isValidColorInfo(colorInfo: ColorInfo): boolean {
  return (
    isValidHex(colorInfo.hex) &&
    isValidRGB(colorInfo.rgb) &&
    isValidHSL(colorInfo.hsl) &&
    (colorInfo.name === undefined || typeof colorInfo.name === 'string')
  )
}

/**
 * Validates color segment coordinates and dimensions are within valid percentage ranges (0-100)
 */
export function isValidColorSegment(segment: ColorSegment): boolean {
  const isValidPercentage = (value: number) => 
    typeof value === 'number' && value >= 0 && value <= 100

  return (
    typeof segment.id === 'string' && segment.id.length > 0 &&
    typeof segment.name === 'string' && segment.name.length > 0 &&
    isValidPercentage(segment.coordinates.x) &&
    isValidPercentage(segment.coordinates.y) &&
    isValidPercentage(segment.dimensions.width) &&
    isValidPercentage(segment.dimensions.height) &&
    (segment.shape === 'rectangle' || segment.shape === 'circle') &&
    isValidColorInfo(segment.colorInfo)
  )
}

/**
 * Validates that color segments don't exceed image boundaries
 */
export function validateSegmentBounds(segment: ColorSegment): boolean {
  const rightEdge = segment.coordinates.x + segment.dimensions.width
  const bottomEdge = segment.coordinates.y + segment.dimensions.height
  
  return rightEdge <= 100 && bottomEdge <= 100
}

/**
 * Validates complete RefSheet configuration
 */
export function isValidRefSheetConfig(config: RefSheetConfig): boolean {
  return (
    // Image validation
    typeof config.image.src === 'string' && config.image.src.length > 0 &&
    typeof config.image.alt === 'string' && config.image.alt.length > 0 &&
    typeof config.image.originalDimensions.width === 'number' && config.image.originalDimensions.width > 0 &&
    typeof config.image.originalDimensions.height === 'number' && config.image.originalDimensions.height > 0 &&
    
    // Color segments validation
    Array.isArray(config.colorSegments) &&
    config.colorSegments.every(segment => 
      isValidColorSegment(segment) && validateSegmentBounds(segment)
    ) &&
    
    // Layout validation
    (config.layout.preferredPanelSide === 'left' || 
     config.layout.preferredPanelSide === 'right' || 
     config.layout.preferredPanelSide === 'auto') &&
    typeof config.layout.showSegmentHints === 'boolean'
  )
}

/**
 * Validates that segment IDs are unique within a configuration
 */
export function validateUniqueSegmentIds(segments: ColorSegment[]): boolean {
  const ids = segments.map(segment => segment.id)
  const uniqueIds = new Set(ids)
  return ids.length === uniqueIds.size
}