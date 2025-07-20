import type { RefSheetConfig } from '../types'
import { createRefSheetConfig, createColorSegment } from '../utils/config'

/**
 * Sample configuration for a character reference sheet
 * This demonstrates how to set up color segments for an interactive reference sheet
 */

// Create individual color segments
const furColorSegment = createColorSegment(
  'main-fur',
  'Main Fur Color',
  25, 30, // x: 25%, y: 30%
  12, 8,  // width: 12%, height: 8%
  'rectangle',
  '#8B4513', // Saddle Brown
  { r: 139, g: 69, b: 19 },
  { h: 25, s: 76, l: 31 }
)

const eyeColorSegment = createColorSegment(
  'eye-color',
  'Eye Color',
  45, 20, // x: 45%, y: 20%
  6, 4,   // width: 6%, height: 4%
  'circle',
  '#4169E1', // Royal Blue
  { r: 65, g: 105, b: 225 },
  { h: 225, s: 73, l: 57 }
)

const noseColorSegment = createColorSegment(
  'nose-color',
  'Nose Color',
  48, 35, // x: 48%, y: 35%
  4, 3,   // width: 4%, height: 3%
  'circle',
  '#FF69B4', // Hot Pink
  { r: 255, g: 105, b: 180 },
  { h: 330, s: 100, l: 71 }
)

const pawPadSegment = createColorSegment(
  'paw-pad',
  'Paw Pad Color',
  15, 75, // x: 15%, y: 75%
  8, 6,   // width: 8%, height: 6%
  'rectangle',
  '#2F4F4F', // Dark Slate Gray
  { r: 47, g: 79, b: 79 },
  { h: 180, s: 25, l: 25 }
)

const accentColorSegment = createColorSegment(
  'accent-color',
  'Accent Markings',
  60, 45, // x: 60%, y: 45%
  10, 15, // width: 10%, height: 15%
  'rectangle',
  '#FFD700', // Gold
  { r: 255, g: 215, b: 0 },
  { h: 51, s: 100, l: 50 }
)

// Create the complete configuration
export const sampleRefSheetConfig: RefSheetConfig = createRefSheetConfig(
  '/images/character-refsheet.jpg',
  'Character reference sheet showing color details',
  1200, // Original image width
  800,  // Original image height
  [
    furColorSegment,
    eyeColorSegment,
    noseColorSegment,
    pawPadSegment,
    accentColorSegment
  ],
  {
    preferredPanelSide: 'right',
    showSegmentHints: true
  }
)

/**
 * Alternative configuration with fewer segments for simpler setup
 */
export const minimalRefSheetConfig: RefSheetConfig = createRefSheetConfig(
  '/images/simple-character.jpg',
  'Simple character reference sheet',
  800,
  600,
  [
    createColorSegment(
      'primary-color',
      'Primary Color',
      40, 40, 20, 20,
      'rectangle',
      '#FF6B6B',
      { r: 255, g: 107, b: 107 },
      { h: 0, s: 100, l: 71 }
    )
  ],
  {
    preferredPanelSide: 'auto',
    showSegmentHints: false
  }
)

/**
 * Configuration for development/testing with placeholder data
 */
export const devRefSheetConfig: RefSheetConfig = createRefSheetConfig(
  '/images/dev-placeholder.jpg',
  'Development placeholder reference sheet',
  400,
  300,
  [], // No segments for basic testing
  {
    preferredPanelSide: 'left',
    showSegmentHints: true
  }
)