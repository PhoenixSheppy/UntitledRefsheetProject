import { describe, it, expect, vi } from 'vitest'
import {
  loadRefSheetConfig,
  validateRefSheetConfig,
  createColorSegment,
  createRefSheetConfig,
  validateConfigFromJSON,
  ConfigValidationError
} from '../config'
import type { RefSheetConfig, ColorSegment } from '../../types'

describe('Configuration System', () => {
  const validColorSegment: ColorSegment = {
    id: 'test-segment',
    name: 'Test Color',
    coordinates: { x: 10, y: 20 },
    dimensions: { width: 15, height: 10 },
    shape: 'rectangle',
    colorInfo: {
      hex: '#FF5733',
      rgb: { r: 255, g: 87, b: 51 },
      hsl: { h: 12, s: 100, l: 60 }
    }
  }

  const validConfig: RefSheetConfig = {
    image: {
      src: '/test-image.jpg',
      alt: 'Test character reference sheet',
      originalDimensions: { width: 800, height: 600 }
    },
    colorSegments: [validColorSegment],
    layout: {
      preferredPanelSide: 'auto',
      showSegmentHints: true
    }
  }

  describe('loadRefSheetConfig', () => {
    it('should load valid configuration successfully', () => {
      const result = loadRefSheetConfig(validConfig)
      expect(result).toEqual(validConfig)
    })

    it('should throw ConfigValidationError for null config', () => {
      expect(() => loadRefSheetConfig(null)).toThrow(ConfigValidationError)
      expect(() => loadRefSheetConfig(null)).toThrow('Configuration must be a valid object')
    })

    it('should throw ConfigValidationError for invalid config', () => {
      const invalidConfig = { ...validConfig, image: null }
      expect(() => loadRefSheetConfig(invalidConfig)).toThrow(ConfigValidationError)
    })

    it('should log warnings for valid config with warnings', () => {
      const configWithWarnings = {
        ...validConfig,
        colorSegments: [] // This should generate a warning
      }
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = loadRefSheetConfig(configWithWarnings)
      
      expect(result).toEqual(configWithWarnings)
      expect(consoleSpy).toHaveBeenCalledWith('Configuration warnings:', expect.arrayContaining([
        expect.stringContaining('No color segments defined')
      ]))
      
      consoleSpy.mockRestore()
    })
  })

  describe('validateRefSheetConfig', () => {
    it('should validate correct configuration', () => {
      const result = validateRefSheetConfig(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return error for missing image configuration', () => {
      const invalidConfig = { ...validConfig, image: undefined as any }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Image configuration is required')
    })

    it('should validate image source', () => {
      const invalidConfig = { ...validConfig, image: { ...validConfig.image, src: '' } }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Image source (src) must be a non-empty string')
    })

    it('should validate image alt text', () => {
      const invalidConfig = { ...validConfig, image: { ...validConfig.image, alt: '' } }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Image alt text must be a non-empty string')
    })

    it('should validate image dimensions', () => {
      const invalidConfig = {
        ...validConfig,
        image: {
          ...validConfig.image,
          originalDimensions: { width: 0, height: -10 }
        }
      }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Image width must be a positive number')
      expect(result.errors).toContain('Image height must be a positive number')
    })

    it('should validate color segments array', () => {
      const invalidConfig = { ...validConfig, colorSegments: 'not-an-array' as any }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('colorSegments must be an array')
    })

    it('should warn about empty color segments', () => {
      const configWithoutSegments = { ...validConfig, colorSegments: [] }
      const result = validateRefSheetConfig(configWithoutSegments)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('No color segments defined - the reference sheet will not be interactive')
    })

    it('should validate unique segment IDs', () => {
      const duplicateSegment = { ...validColorSegment, name: 'Duplicate' }
      const invalidConfig = {
        ...validConfig,
        colorSegments: [validColorSegment, duplicateSegment]
      }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('All color segment IDs must be unique')
    })

    it('should validate layout configuration', () => {
      const invalidConfig = {
        ...validConfig,
        layout: {
          preferredPanelSide: 'invalid' as any,
          showSegmentHints: 'not-boolean' as any
        }
      }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('preferredPanelSide must be one of: left, right, auto')
      expect(result.errors).toContain('showSegmentHints must be a boolean value')
    })

    it('should detect overlapping segments', () => {
      const overlappingSegment: ColorSegment = {
        ...validColorSegment,
        id: 'overlapping-segment',
        name: 'Overlapping Color',
        coordinates: { x: 15, y: 25 }, // Overlaps with validColorSegment
        dimensions: { width: 10, height: 10 }
      }
      
      const configWithOverlaps = {
        ...validConfig,
        colorSegments: [validColorSegment, overlappingSegment]
      }
      const result = validateRefSheetConfig(configWithOverlaps)
      
      expect(result.isValid).toBe(true) // Overlaps are warnings, not errors
      expect(result.warnings).toContain('Overlapping segments detected: "Test Color" and "Overlapping Color"')
    })
  })

  describe('Color Segment Validation', () => {
    it('should validate segment coordinates', () => {
      const invalidSegment = {
        ...validColorSegment,
        coordinates: { x: -5, y: 105 }
      }
      const invalidConfig = { ...validConfig, colorSegments: [invalidSegment] }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Segment 1: X coordinate must be a number between 0 and 100')
      expect(result.errors).toContain('Segment 1: Y coordinate must be a number between 0 and 100')
    })

    it('should validate segment dimensions', () => {
      const invalidSegment = {
        ...validColorSegment,
        dimensions: { width: 0, height: 150 }
      }
      const invalidConfig = { ...validConfig, colorSegments: [invalidSegment] }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Segment 1: Width must be a positive number between 0 and 100')
      expect(result.errors).toContain('Segment 1: Height must be a positive number between 0 and 100')
    })

    it('should validate segment bounds', () => {
      const outOfBoundsSegment = {
        ...validColorSegment,
        coordinates: { x: 90, y: 90 },
        dimensions: { width: 20, height: 20 } // Extends beyond 100%
      }
      const invalidConfig = { ...validConfig, colorSegments: [outOfBoundsSegment] }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Segment 1: Segment extends beyond image boundaries (x: 90%, y: 90%, width: 20%, height: 20%)')
    })

    it('should validate segment shape', () => {
      const invalidSegment = {
        ...validColorSegment,
        shape: 'triangle' as any
      }
      const invalidConfig = { ...validConfig, colorSegments: [invalidSegment] }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Segment 1: Shape must be either \'rectangle\' or \'circle\'')
    })

    it('should validate color information', () => {
      const invalidSegment = {
        ...validColorSegment,
        colorInfo: {
          hex: 'invalid-hex',
          rgb: { r: 300, g: -10, b: 'not-a-number' as any },
          hsl: { h: 400, s: 150, l: -20 }
        }
      }
      const invalidConfig = { ...validConfig, colorSegments: [invalidSegment] }
      const result = validateRefSheetConfig(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Segment 1: Hex color must be in format #RRGGBB or #RGB (got: invalid-hex)')
      expect(result.errors).toContain('Segment 1: RGB red value must be between 0 and 255')
      expect(result.errors).toContain('Segment 1: RGB green value must be between 0 and 255')
      expect(result.errors).toContain('Segment 1: HSL hue must be between 0 and 360')
      expect(result.errors).toContain('Segment 1: HSL saturation must be between 0 and 100')
      expect(result.errors).toContain('Segment 1: HSL lightness must be between 0 and 100')
    })
  })

  describe('createColorSegment', () => {
    it('should create valid color segment', () => {
      const segment = createColorSegment(
        'test-segment',
        'Test Color',
        10, 20, 15, 10,
        'rectangle',
        '#FF5733',
        { r: 255, g: 87, b: 51 },
        { h: 12, s: 100, l: 60 }
      )
      
      expect(segment).toEqual(validColorSegment)
    })

    it('should throw error for invalid segment', () => {
      expect(() => createColorSegment(
        '',
        'Test Color',
        10, 20, 15, 10,
        'rectangle',
        '#FF5733',
        { r: 255, g: 87, b: 51 },
        { h: 12, s: 100, l: 60 }
      )).toThrow(ConfigValidationError)
    })

    it('should throw error for out-of-bounds segment', () => {
      expect(() => createColorSegment(
        'test-id',
        'Test Color',
        90, 90, 20, 20, // Extends beyond boundaries
        'rectangle',
        '#FF5733',
        { r: 255, g: 87, b: 51 },
        { h: 12, s: 100, l: 60 }
      )).toThrow(ConfigValidationError)
      expect(() => createColorSegment(
        'test-id',
        'Test Color',
        90, 90, 20, 20,
        'rectangle',
        '#FF5733',
        { r: 255, g: 87, b: 51 },
        { h: 12, s: 100, l: 60 }
      )).toThrow('extends beyond image boundaries')
    })
  })

  describe('createRefSheetConfig', () => {
    it('should create valid configuration', () => {
      const config = createRefSheetConfig(
        '/test-image.jpg',
        'Test character reference sheet',
        800,
        600,
        [validColorSegment]
      )
      
      expect(config).toEqual(validConfig)
    })

    it('should create configuration with default options', () => {
      const config = createRefSheetConfig(
        '/test-image.jpg',
        'Test character reference sheet',
        800,
        600
      )
      
      expect(config.layout.preferredPanelSide).toBe('auto')
      expect(config.layout.showSegmentHints).toBe(true)
      expect(config.colorSegments).toEqual([])
    })

    it('should create configuration with custom options', () => {
      const config = createRefSheetConfig(
        '/test-image.jpg',
        'Test character reference sheet',
        800,
        600,
        [],
        {
          preferredPanelSide: 'left',
          showSegmentHints: false
        }
      )
      
      expect(config.layout.preferredPanelSide).toBe('left')
      expect(config.layout.showSegmentHints).toBe(false)
    })

    it('should throw error for invalid configuration', () => {
      expect(() => createRefSheetConfig(
        '', // Invalid empty src
        'Test character reference sheet',
        800,
        600
      )).toThrow(ConfigValidationError)
    })
  })

  describe('validateConfigFromJSON', () => {
    it('should validate valid JSON configuration', () => {
      const jsonString = JSON.stringify(validConfig)
      const result = validateConfigFromJSON(jsonString)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle invalid JSON', () => {
      const invalidJson = '{ invalid json }'
      const result = validateConfigFromJSON(invalidJson)
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Invalid JSON:')
    })

    it('should validate JSON with invalid configuration', () => {
      const invalidConfig = { ...validConfig, image: null }
      const jsonString = JSON.stringify(invalidConfig)
      const result = validateConfigFromJSON(jsonString)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Image configuration is required')
    })
  })

  describe('ConfigValidationError', () => {
    it('should create error with message', () => {
      const error = new ConfigValidationError('Test error message')
      expect(error.message).toBe('Test error message')
      expect(error.name).toBe('ConfigValidationError')
      expect(error.field).toBeUndefined()
    })

    it('should create error with field', () => {
      const error = new ConfigValidationError('Test error message', 'testField')
      expect(error.message).toBe('Test error message')
      expect(error.field).toBe('testField')
    })
  })
})