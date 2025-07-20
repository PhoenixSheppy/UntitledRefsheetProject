import { describe, it, expect } from 'vitest'
import {
  isValidRGB,
  isValidHSL,
  isValidHex,
  isValidColorInfo,
  isValidColorSegment,
  validateSegmentBounds,
  isValidRefSheetConfig,
  validateUniqueSegmentIds
} from '../validation'
import type { RGB, HSL, ColorInfo, ColorSegment, RefSheetConfig } from '../index'

describe('Validation Functions', () => {
  describe('isValidRGB', () => {
    it('should validate correct RGB values', () => {
      expect(isValidRGB({ r: 0, g: 0, b: 0 })).toBe(true)
      expect(isValidRGB({ r: 255, g: 255, b: 255 })).toBe(true)
      expect(isValidRGB({ r: 128, g: 64, b: 192 })).toBe(true)
    })

    it('should reject invalid RGB values', () => {
      expect(isValidRGB({ r: -1, g: 0, b: 0 })).toBe(false)
      expect(isValidRGB({ r: 256, g: 0, b: 0 })).toBe(false)
      expect(isValidRGB({ r: 128.5, g: 0, b: 0 })).toBe(false)
      expect(isValidRGB({ r: NaN, g: 0, b: 0 })).toBe(false)
    })
  })

  describe('isValidHSL', () => {
    it('should validate correct HSL values', () => {
      expect(isValidHSL({ h: 0, s: 0, l: 0 })).toBe(true)
      expect(isValidHSL({ h: 360, s: 100, l: 100 })).toBe(true)
      expect(isValidHSL({ h: 180, s: 50, l: 75 })).toBe(true)
    })

    it('should reject invalid HSL values', () => {
      expect(isValidHSL({ h: -1, s: 0, l: 0 })).toBe(false)
      expect(isValidHSL({ h: 361, s: 0, l: 0 })).toBe(false)
      expect(isValidHSL({ h: 0, s: -1, l: 0 })).toBe(false)
      expect(isValidHSL({ h: 0, s: 101, l: 0 })).toBe(false)
      expect(isValidHSL({ h: 0, s: 0, l: -1 })).toBe(false)
      expect(isValidHSL({ h: 0, s: 0, l: 101 })).toBe(false)
    })
  })

  describe('isValidHex', () => {
    it('should validate correct hex color formats', () => {
      expect(isValidHex('#000000')).toBe(true)
      expect(isValidHex('#FFFFFF')).toBe(true)
      expect(isValidHex('#ff5733')).toBe(true)
      expect(isValidHex('#F5A')).toBe(true)
      expect(isValidHex('#abc')).toBe(true)
    })

    it('should reject invalid hex color formats', () => {
      expect(isValidHex('000000')).toBe(false) // Missing #
      expect(isValidHex('#GGGGGG')).toBe(false) // Invalid characters
      expect(isValidHex('#12345')).toBe(false) // Wrong length
      expect(isValidHex('#1234567')).toBe(false) // Too long
      expect(isValidHex('')).toBe(false) // Empty string
      expect(isValidHex('#')).toBe(false) // Just #
    })
  })

  describe('isValidColorInfo', () => {
    const validColorInfo: ColorInfo = {
      hex: '#FF5733',
      rgb: { r: 255, g: 87, b: 51 },
      hsl: { h: 12, s: 100, l: 60 }
    }

    it('should validate correct color info', () => {
      expect(isValidColorInfo(validColorInfo)).toBe(true)
      
      const withName: ColorInfo = { ...validColorInfo, name: 'Orange Red' }
      expect(isValidColorInfo(withName)).toBe(true)
    })

    it('should reject invalid color info', () => {
      expect(isValidColorInfo({
        ...validColorInfo,
        hex: 'invalid'
      })).toBe(false)

      expect(isValidColorInfo({
        ...validColorInfo,
        rgb: { r: 300, g: 0, b: 0 }
      })).toBe(false)

      expect(isValidColorInfo({
        ...validColorInfo,
        hsl: { h: 400, s: 0, l: 0 }
      })).toBe(false)
    })
  })

  describe('isValidColorSegment', () => {
    const validSegment: ColorSegment = {
      id: 'test-segment',
      name: 'Test Color',
      coordinates: { x: 25, y: 30 },
      dimensions: { width: 10, height: 15 },
      shape: 'rectangle',
      colorInfo: {
        hex: '#FF5733',
        rgb: { r: 255, g: 87, b: 51 },
        hsl: { h: 12, s: 100, l: 60 }
      }
    }

    it('should validate correct color segments', () => {
      expect(isValidColorSegment(validSegment)).toBe(true)
      
      const circleSegment: ColorSegment = { ...validSegment, shape: 'circle' }
      expect(isValidColorSegment(circleSegment)).toBe(true)
    })

    it('should reject invalid color segments', () => {
      // Empty ID
      expect(isValidColorSegment({ ...validSegment, id: '' })).toBe(false)
      
      // Empty name
      expect(isValidColorSegment({ ...validSegment, name: '' })).toBe(false)
      
      // Invalid coordinates
      expect(isValidColorSegment({
        ...validSegment,
        coordinates: { x: -1, y: 30 }
      })).toBe(false)
      
      expect(isValidColorSegment({
        ...validSegment,
        coordinates: { x: 101, y: 30 }
      })).toBe(false)
      
      // Invalid dimensions
      expect(isValidColorSegment({
        ...validSegment,
        dimensions: { width: -1, height: 15 }
      })).toBe(false)
      
      // Invalid shape
      expect(isValidColorSegment({
        ...validSegment,
        shape: 'triangle' as any
      })).toBe(false)
    })
  })

  describe('validateSegmentBounds', () => {
    it('should validate segments within bounds', () => {
      const validSegment: ColorSegment = {
        id: 'test',
        name: 'Test',
        coordinates: { x: 10, y: 20 },
        dimensions: { width: 30, height: 40 },
        shape: 'rectangle',
        colorInfo: {
          hex: '#000000',
          rgb: { r: 0, g: 0, b: 0 },
          hsl: { h: 0, s: 0, l: 0 }
        }
      }
      
      expect(validateSegmentBounds(validSegment)).toBe(true)
    })

    it('should reject segments exceeding bounds', () => {
      const exceedsRight: ColorSegment = {
        id: 'test',
        name: 'Test',
        coordinates: { x: 90, y: 20 },
        dimensions: { width: 20, height: 10 }, // 90 + 20 = 110 > 100
        shape: 'rectangle',
        colorInfo: {
          hex: '#000000',
          rgb: { r: 0, g: 0, b: 0 },
          hsl: { h: 0, s: 0, l: 0 }
        }
      }
      
      expect(validateSegmentBounds(exceedsRight)).toBe(false)

      const exceedsBottom: ColorSegment = {
        id: 'test',
        name: 'Test',
        coordinates: { x: 10, y: 90 },
        dimensions: { width: 10, height: 20 }, // 90 + 20 = 110 > 100
        shape: 'rectangle',
        colorInfo: {
          hex: '#000000',
          rgb: { r: 0, g: 0, b: 0 },
          hsl: { h: 0, s: 0, l: 0 }
        }
      }
      
      expect(validateSegmentBounds(exceedsBottom)).toBe(false)
    })
  })

  describe('isValidRefSheetConfig', () => {
    const validConfig: RefSheetConfig = {
      image: {
        src: '/test-image.png',
        alt: 'Test Character',
        originalDimensions: { width: 1200, height: 800 }
      },
      colorSegments: [
        {
          id: 'segment-1',
          name: 'Test Color',
          coordinates: { x: 25, y: 30 },
          dimensions: { width: 10, height: 15 },
          shape: 'rectangle',
          colorInfo: {
            hex: '#FF5733',
            rgb: { r: 255, g: 87, b: 51 },
            hsl: { h: 12, s: 100, l: 60 }
          }
        }
      ],
      layout: {
        preferredPanelSide: 'right',
        showSegmentHints: true
      }
    }

    it('should validate correct configuration', () => {
      expect(isValidRefSheetConfig(validConfig)).toBe(true)
    })

    it('should reject invalid configurations', () => {
      // Empty image src
      expect(isValidRefSheetConfig({
        ...validConfig,
        image: { ...validConfig.image, src: '' }
      })).toBe(false)

      // Invalid dimensions
      expect(isValidRefSheetConfig({
        ...validConfig,
        image: { ...validConfig.image, originalDimensions: { width: 0, height: 800 } }
      })).toBe(false)

      // Invalid panel side
      expect(isValidRefSheetConfig({
        ...validConfig,
        layout: { ...validConfig.layout, preferredPanelSide: 'invalid' as any }
      })).toBe(false)
    })
  })

  describe('validateUniqueSegmentIds', () => {
    it('should validate unique segment IDs', () => {
      const segments: ColorSegment[] = [
        {
          id: 'segment-1',
          name: 'Color 1',
          coordinates: { x: 10, y: 10 },
          dimensions: { width: 5, height: 5 },
          shape: 'rectangle',
          colorInfo: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
        },
        {
          id: 'segment-2',
          name: 'Color 2',
          coordinates: { x: 20, y: 20 },
          dimensions: { width: 5, height: 5 },
          shape: 'circle',
          colorInfo: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }
        }
      ]

      expect(validateUniqueSegmentIds(segments)).toBe(true)
    })

    it('should reject duplicate segment IDs', () => {
      const segments: ColorSegment[] = [
        {
          id: 'duplicate-id',
          name: 'Color 1',
          coordinates: { x: 10, y: 10 },
          dimensions: { width: 5, height: 5 },
          shape: 'rectangle',
          colorInfo: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
        },
        {
          id: 'duplicate-id',
          name: 'Color 2',
          coordinates: { x: 20, y: 20 },
          dimensions: { width: 5, height: 5 },
          shape: 'circle',
          colorInfo: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }
        }
      ]

      expect(validateUniqueSegmentIds(segments)).toBe(false)
    })

    it('should handle empty array', () => {
      expect(validateUniqueSegmentIds([])).toBe(true)
    })
  })
})