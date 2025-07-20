import type { RefSheetConfig, ColorSegment } from '../types'
import { 
  isValidRefSheetConfig, 
  isValidColorSegment, 
  validateSegmentBounds, 
  validateUniqueSegmentIds 
} from '../types/validation'

/**
 * Configuration validation error with detailed message
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ConfigValidationError'
  }
}

/**
 * Result of configuration validation
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Loads and validates RefSheet configuration
 */
export function loadRefSheetConfig(config: unknown): RefSheetConfig {
  if (!config || typeof config !== 'object') {
    throw new ConfigValidationError('Configuration must be a valid object')
  }

  const validationResult = validateRefSheetConfig(config as RefSheetConfig)
  
  if (!validationResult.isValid) {
    const errorMessage = `Configuration validation failed:\n${validationResult.errors.join('\n')}`
    throw new ConfigValidationError(errorMessage)
  }

  if (validationResult.warnings.length > 0) {
    console.warn('Configuration warnings:', validationResult.warnings)
  }

  return config as RefSheetConfig
}

/**
 * Comprehensive validation of RefSheet configuration with detailed error messages
 */
export function validateRefSheetConfig(config: RefSheetConfig): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic structure validation
  if (!config) {
    errors.push('Configuration is required')
    return { isValid: false, errors, warnings }
  }

  // Image validation
  if (!config.image) {
    errors.push('Image configuration is required')
  } else {
    if (!config.image.src || typeof config.image.src !== 'string') {
      errors.push('Image source (src) must be a non-empty string')
    }
    
    if (!config.image.alt || typeof config.image.alt !== 'string') {
      errors.push('Image alt text must be a non-empty string')
    }
    
    if (!config.image.originalDimensions) {
      errors.push('Image originalDimensions are required')
    } else {
      if (!config.image.originalDimensions.width || config.image.originalDimensions.width <= 0) {
        errors.push('Image width must be a positive number')
      }
      if (!config.image.originalDimensions.height || config.image.originalDimensions.height <= 0) {
        errors.push('Image height must be a positive number')
      }
    }
  }

  // Color segments validation
  if (!Array.isArray(config.colorSegments)) {
    errors.push('colorSegments must be an array')
  } else {
    if (config.colorSegments.length === 0) {
      warnings.push('No color segments defined - the reference sheet will not be interactive')
    }

    // Validate each segment
    config.colorSegments.forEach((segment, index) => {
      const segmentErrors = validateColorSegmentDetailed(segment, index)
      errors.push(...segmentErrors)
    })

    // Check for unique IDs
    if (!validateUniqueSegmentIds(config.colorSegments)) {
      errors.push('All color segment IDs must be unique')
    }

    // Check for overlapping segments (warning only)
    const overlaps = findOverlappingSegments(config.colorSegments)
    if (overlaps.length > 0) {
      warnings.push(`Overlapping segments detected: ${overlaps.join(', ')}`)
    }
  }

  // Layout validation
  if (!config.layout) {
    errors.push('Layout configuration is required')
  } else {
    const validPanelSides = ['left', 'right', 'auto']
    if (!validPanelSides.includes(config.layout.preferredPanelSide)) {
      errors.push(`preferredPanelSide must be one of: ${validPanelSides.join(', ')}`)
    }
    
    if (typeof config.layout.showSegmentHints !== 'boolean') {
      errors.push('showSegmentHints must be a boolean value')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Detailed validation of a single color segment
 */
function validateColorSegmentDetailed(segment: ColorSegment, index: number): string[] {
  const errors: string[] = []
  const prefix = `Segment ${index + 1}`

  if (!segment.id || typeof segment.id !== 'string') {
    errors.push(`${prefix}: ID must be a non-empty string`)
  }

  if (!segment.name || typeof segment.name !== 'string') {
    errors.push(`${prefix}: Name must be a non-empty string`)
  }

  // Coordinates validation
  if (!segment.coordinates) {
    errors.push(`${prefix}: Coordinates are required`)
  } else {
    if (typeof segment.coordinates.x !== 'number' || segment.coordinates.x < 0 || segment.coordinates.x > 100) {
      errors.push(`${prefix}: X coordinate must be a number between 0 and 100`)
    }
    if (typeof segment.coordinates.y !== 'number' || segment.coordinates.y < 0 || segment.coordinates.y > 100) {
      errors.push(`${prefix}: Y coordinate must be a number between 0 and 100`)
    }
  }

  // Dimensions validation
  if (!segment.dimensions) {
    errors.push(`${prefix}: Dimensions are required`)
  } else {
    if (typeof segment.dimensions.width !== 'number' || segment.dimensions.width <= 0 || segment.dimensions.width > 100) {
      errors.push(`${prefix}: Width must be a positive number between 0 and 100`)
    }
    if (typeof segment.dimensions.height !== 'number' || segment.dimensions.height <= 0 || segment.dimensions.height > 100) {
      errors.push(`${prefix}: Height must be a positive number between 0 and 100`)
    }
  }

  // Shape validation
  if (!segment.shape || !['rectangle', 'circle'].includes(segment.shape)) {
    errors.push(`${prefix}: Shape must be either 'rectangle' or 'circle'`)
  }

  // Bounds validation
  if (segment.coordinates && segment.dimensions) {
    if (!validateSegmentBounds(segment)) {
      errors.push(`${prefix}: Segment extends beyond image boundaries (x: ${segment.coordinates.x}%, y: ${segment.coordinates.y}%, width: ${segment.dimensions.width}%, height: ${segment.dimensions.height}%)`)
    }
  }

  // Color info validation
  if (!segment.colorInfo) {
    errors.push(`${prefix}: Color information is required`)
  } else {
    const colorErrors = validateColorInfoDetailed(segment.colorInfo, prefix)
    errors.push(...colorErrors)
  }

  return errors
}

/**
 * Detailed validation of color information
 */
function validateColorInfoDetailed(colorInfo: any, prefix: string): string[] {
  const errors: string[] = []

  if (!colorInfo.hex || typeof colorInfo.hex !== 'string') {
    errors.push(`${prefix}: Hex color must be a non-empty string`)
  } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorInfo.hex)) {
    errors.push(`${prefix}: Hex color must be in format #RRGGBB or #RGB (got: ${colorInfo.hex})`)
  }

  if (!colorInfo.rgb) {
    errors.push(`${prefix}: RGB color values are required`)
  } else {
    if (typeof colorInfo.rgb.r !== 'number' || colorInfo.rgb.r < 0 || colorInfo.rgb.r > 255) {
      errors.push(`${prefix}: RGB red value must be between 0 and 255`)
    }
    if (typeof colorInfo.rgb.g !== 'number' || colorInfo.rgb.g < 0 || colorInfo.rgb.g > 255) {
      errors.push(`${prefix}: RGB green value must be between 0 and 255`)
    }
    if (typeof colorInfo.rgb.b !== 'number' || colorInfo.rgb.b < 0 || colorInfo.rgb.b > 255) {
      errors.push(`${prefix}: RGB blue value must be between 0 and 255`)
    }
  }

  if (!colorInfo.hsl) {
    errors.push(`${prefix}: HSL color values are required`)
  } else {
    if (typeof colorInfo.hsl.h !== 'number' || colorInfo.hsl.h < 0 || colorInfo.hsl.h > 360) {
      errors.push(`${prefix}: HSL hue must be between 0 and 360`)
    }
    if (typeof colorInfo.hsl.s !== 'number' || colorInfo.hsl.s < 0 || colorInfo.hsl.s > 100) {
      errors.push(`${prefix}: HSL saturation must be between 0 and 100`)
    }
    if (typeof colorInfo.hsl.l !== 'number' || colorInfo.hsl.l < 0 || colorInfo.hsl.l > 100) {
      errors.push(`${prefix}: HSL lightness must be between 0 and 100`)
    }
  }

  return errors
}

/**
 * Find overlapping segments (for warnings)
 */
function findOverlappingSegments(segments: ColorSegment[]): string[] {
  const overlaps: string[] = []

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      if (segmentsOverlap(segments[i], segments[j])) {
        overlaps.push(`"${segments[i].name}" and "${segments[j].name}"`)
      }
    }
  }

  return overlaps
}

/**
 * Check if two segments overlap
 */
function segmentsOverlap(segment1: ColorSegment, segment2: ColorSegment): boolean {
  const s1 = segment1.coordinates
  const s1d = segment1.dimensions
  const s2 = segment2.coordinates
  const s2d = segment2.dimensions

  // Check if rectangles overlap
  return !(
    s1.x + s1d.width < s2.x ||
    s2.x + s2d.width < s1.x ||
    s1.y + s1d.height < s2.y ||
    s2.y + s2d.height < s1.y
  )
}

/**
 * Helper function to create a color segment during development
 */
export function createColorSegment(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: 'rectangle' | 'circle',
  hex: string,
  rgb: { r: number; g: number; b: number },
  hsl: { h: number; s: number; l: number }
): ColorSegment {
  const segment: ColorSegment = {
    id,
    name,
    coordinates: { x, y },
    dimensions: { width, height },
    shape,
    colorInfo: {
      hex,
      rgb,
      hsl
    }
  }

  // Validate the created segment
  if (!isValidColorSegment(segment)) {
    throw new ConfigValidationError(`Invalid color segment created: ${name}`)
  }

  if (!validateSegmentBounds(segment)) {
    throw new ConfigValidationError(`Color segment "${name}" extends beyond image boundaries`)
  }

  return segment
}

/**
 * Helper function to create a basic RefSheet configuration during development
 */
export function createRefSheetConfig(
  imageSrc: string,
  imageAlt: string,
  imageWidth: number,
  imageHeight: number,
  colorSegments: ColorSegment[] = [],
  options: {
    preferredPanelSide?: 'left' | 'right' | 'auto'
    showSegmentHints?: boolean
  } = {}
): RefSheetConfig {
  const config: RefSheetConfig = {
    image: {
      src: imageSrc,
      alt: imageAlt,
      originalDimensions: {
        width: imageWidth,
        height: imageHeight
      }
    },
    colorSegments,
    layout: {
      preferredPanelSide: options.preferredPanelSide || 'auto',
      showSegmentHints: options.showSegmentHints ?? true
    }
  }

  // Validate the created configuration
  const validation = validateRefSheetConfig(config)
  if (!validation.isValid) {
    throw new ConfigValidationError(`Invalid configuration created:\n${validation.errors.join('\n')}`)
  }

  return config
}

/**
 * Helper to validate configuration from JSON
 */
export function validateConfigFromJSON(jsonString: string): ValidationResult {
  try {
    const config = JSON.parse(jsonString)
    return validateRefSheetConfig(config)
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    }
  }
}