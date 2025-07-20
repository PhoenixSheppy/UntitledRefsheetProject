import { describe, it, expect } from 'vitest'
import type {
  ColorInfo,
  RGB,
  HSL,
  ColorSegment,
  ImageDimensions,
  PanelPosition,
  RefSheetConfig,
  SegmentBounds,
  Dimensions,
  ScaledSegment
} from '../index'

describe('Type Definitions', () => {
  describe('RGB Interface', () => {
    it('should accept valid RGB values', () => {
      const validRGB: RGB = { r: 255, g: 128, b: 0 }
      expect(validRGB.r).toBe(255)
      expect(validRGB.g).toBe(128)
      expect(validRGB.b).toBe(0)
    })

    it('should accept boundary RGB values', () => {
      const minRGB: RGB = { r: 0, g: 0, b: 0 }
      const maxRGB: RGB = { r: 255, g: 255, b: 255 }
      
      expect(minRGB.r).toBe(0)
      expect(maxRGB.r).toBe(255)
    })
  })

  describe('HSL Interface', () => {
    it('should accept valid HSL values', () => {
      const validHSL: HSL = { h: 180, s: 50, l: 75 }
      expect(validHSL.h).toBe(180)
      expect(validHSL.s).toBe(50)
      expect(validHSL.l).toBe(75)
    })

    it('should accept boundary HSL values', () => {
      const minHSL: HSL = { h: 0, s: 0, l: 0 }
      const maxHSL: HSL = { h: 360, s: 100, l: 100 }
      
      expect(minHSL.h).toBe(0)
      expect(maxHSL.h).toBe(360)
      expect(maxHSL.s).toBe(100)
      expect(maxHSL.l).toBe(100)
    })
  })

  describe('ColorInfo Interface', () => {
    it('should accept complete color information', () => {
      const colorInfo: ColorInfo = {
        hex: '#FF8000',
        rgb: { r: 255, g: 128, b: 0 },
        hsl: { h: 30, s: 100, l: 50 },
        name: 'Orange'
      }

      expect(colorInfo.hex).toBe('#FF8000')
      expect(colorInfo.rgb.r).toBe(255)
      expect(colorInfo.hsl.h).toBe(30)
      expect(colorInfo.name).toBe('Orange')
    })

    it('should accept color information without optional name', () => {
      const colorInfo: ColorInfo = {
        hex: '#FF0000',
        rgb: { r: 255, g: 0, b: 0 },
        hsl: { h: 0, s: 100, l: 50 }
      }

      expect(colorInfo.hex).toBe('#FF0000')
      expect(colorInfo.name).toBeUndefined()
    })
  })

  describe('ColorSegment Interface', () => {
    it('should accept valid color segment with rectangle shape', () => {
      const segment: ColorSegment = {
        id: 'segment-1',
        name: 'Main Fur Color',
        coordinates: { x: 25, y: 30 },
        dimensions: { width: 10, height: 15 },
        shape: 'rectangle',
        colorInfo: {
          hex: '#8B4513',
          rgb: { r: 139, g: 69, b: 19 },
          hsl: { h: 25, s: 76, l: 31 }
        }
      }

      expect(segment.id).toBe('segment-1')
      expect(segment.shape).toBe('rectangle')
      expect(segment.coordinates.x).toBe(25)
      expect(segment.dimensions.width).toBe(10)
    })

    it('should accept valid color segment with circle shape', () => {
      const segment: ColorSegment = {
        id: 'eye-color',
        name: 'Eye Color',
        coordinates: { x: 45, y: 20 },
        dimensions: { width: 5, height: 5 },
        shape: 'circle',
        colorInfo: {
          hex: '#0000FF',
          rgb: { r: 0, g: 0, b: 255 },
          hsl: { h: 240, s: 100, l: 50 }
        }
      }

      expect(segment.shape).toBe('circle')
      expect(segment.name).toBe('Eye Color')
    })
  })

  describe('ImageDimensions Interface', () => {
    it('should accept valid image dimensions', () => {
      const dimensions: ImageDimensions = { width: 1920, height: 1080 }
      expect(dimensions.width).toBe(1920)
      expect(dimensions.height).toBe(1080)
    })
  })

  describe('PanelPosition Interface', () => {
    it('should accept valid panel position', () => {
      const position: PanelPosition = {
        x: 100,
        y: 200,
        side: 'right'
      }

      expect(position.x).toBe(100)
      expect(position.y).toBe(200)
      expect(position.side).toBe('right')
    })

    it('should accept all valid side values', () => {
      const sides: PanelPosition['side'][] = ['left', 'right', 'top', 'bottom']
      
      sides.forEach(side => {
        const position: PanelPosition = { x: 0, y: 0, side }
        expect(position.side).toBe(side)
      })
    })
  })

  describe('RefSheetConfig Interface', () => {
    it('should accept complete configuration', () => {
      const config: RefSheetConfig = {
        image: {
          src: '/images/character-ref.png',
          alt: 'Character Reference Sheet',
          originalDimensions: { width: 1200, height: 800 }
        },
        colorSegments: [
          {
            id: 'fur-1',
            name: 'Primary Fur',
            coordinates: { x: 30, y: 40 },
            dimensions: { width: 8, height: 12 },
            shape: 'rectangle',
            colorInfo: {
              hex: '#8B4513',
              rgb: { r: 139, g: 69, b: 19 },
              hsl: { h: 25, s: 76, l: 31 }
            }
          }
        ],
        layout: {
          preferredPanelSide: 'right',
          showSegmentHints: true
        }
      }

      expect(config.image.src).toBe('/images/character-ref.png')
      expect(config.colorSegments).toHaveLength(1)
      expect(config.layout.preferredPanelSide).toBe('right')
      expect(config.layout.showSegmentHints).toBe(true)
    })

    it('should accept auto panel side preference', () => {
      const config: RefSheetConfig = {
        image: {
          src: '/test.png',
          alt: 'Test',
          originalDimensions: { width: 100, height: 100 }
        },
        colorSegments: [],
        layout: {
          preferredPanelSide: 'auto',
          showSegmentHints: false
        }
      }

      expect(config.layout.preferredPanelSide).toBe('auto')
    })
  })

  describe('SegmentBounds Interface', () => {
    it('should accept valid segment bounds', () => {
      const bounds: SegmentBounds = {
        x: 10,
        y: 20,
        width: 50,
        height: 30
      }

      expect(bounds.x).toBe(10)
      expect(bounds.y).toBe(20)
      expect(bounds.width).toBe(50)
      expect(bounds.height).toBe(30)
    })
  })

  describe('Dimensions Interface', () => {
    it('should accept valid dimensions', () => {
      const dims: Dimensions = { width: 300, height: 200 }
      expect(dims.width).toBe(300)
      expect(dims.height).toBe(200)
    })
  })

  describe('ScaledSegment Interface', () => {
    it('should extend ColorSegment with scaled properties', () => {
      const scaledSegment: ScaledSegment = {
        id: 'scaled-1',
        name: 'Scaled Segment',
        coordinates: { x: 25, y: 30 },
        dimensions: { width: 10, height: 15 },
        shape: 'rectangle',
        colorInfo: {
          hex: '#FF0000',
          rgb: { r: 255, g: 0, b: 0 },
          hsl: { h: 0, s: 100, l: 50 }
        },
        scaledCoordinates: { x: 250, y: 300 },
        scaledDimensions: { width: 100, height: 150 }
      }

      // Original properties
      expect(scaledSegment.id).toBe('scaled-1')
      expect(scaledSegment.coordinates.x).toBe(25)
      
      // Scaled properties
      expect(scaledSegment.scaledCoordinates.x).toBe(250)
      expect(scaledSegment.scaledDimensions.width).toBe(100)
    })
  })
})