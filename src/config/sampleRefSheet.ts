import { RefSheetConfig } from '@/types';
import { createRefSheetConfig, createColorSegment } from '@/utils/config';

/**
 * Sample character reference sheet configuration for testing
 * This demonstrates how to set up interactive color segments
 */
export const sampleRefSheetConfig: RefSheetConfig = createRefSheetConfig(
  // Using the actual Phoenix character reference sheet
  '/images/PhoenixShepRef.png',
  'Phoenix character reference sheet for interactive color exploration',
  800, // Original image width - adjust based on your actual image dimensions
  600, // Original image height - adjust based on your actual image dimensions
  [
    // Sample color segments - these would be positioned over actual character features
    createColorSegment(
      'main-fur',
      'Main Fur Color',
      20, // x position (20% from left)
      30, // y position (30% from top)
      15, // width (15% of image width)
      20, // height (20% of image height)
      'rectangle',
      '#8B4513', // Saddle brown
      { r: 139, g: 69, b: 19 },
      { h: 25, s: 76, l: 31 }
    ),
    
    createColorSegment(
      'eye-color',
      'Eye Color',
      35, // x position
      25, // y position
      8,  // width
      8,  // height
      'circle',
      '#4169E1', // Royal blue
      { r: 65, g: 105, b: 225 },
      { h: 225, s: 73, l: 57 }
    ),
    
    createColorSegment(
      'accent-color',
      'Accent Color',
      60, // x position
      40, // y position
      12, // width
      15, // height
      'rectangle',
      '#FF6347', // Tomato red
      { r: 255, g: 99, b: 71 },
      { h: 9, s: 100, l: 64 }
    ),
    
    createColorSegment(
      'secondary-fur',
      'Secondary Fur',
      25, // x position
      55, // y position
      18, // width
      25, // height
      'rectangle',
      '#DEB887', // Burlywood
      { r: 222, g: 184, b: 135 },
      { h: 34, s: 57, l: 70 }
    ),
    
    createColorSegment(
      'nose-color',
      'Nose Color',
      42, // x position
      35, // y position
      6,  // width
      5,  // height
      'circle',
      '#FFB6C1', // Light pink
      { r: 255, g: 182, b: 193 },
      { h: 351, s: 100, l: 86 }
    )
  ],
  {
    preferredPanelSide: 'auto',
    showSegmentHints: true
  }
);

/**
 * Alternative configuration with a different color palette
 * This can be used for testing different scenarios
 */
export const alternativeRefSheetConfig: RefSheetConfig = createRefSheetConfig(
  'https://via.placeholder.com/600x800/e8e8e8/555555?text=Alt+Character+Design',
  'Alternative character design with different color scheme',
  600,
  800,
  [
    createColorSegment(
      'primary-color',
      'Primary Color',
      30,
      20,
      20,
      25,
      'rectangle',
      '#2E8B57', // Sea green
      { r: 46, g: 139, b: 87 },
      { h: 146, s: 50, l: 36 }
    ),
    
    createColorSegment(
      'highlight-color',
      'Highlight Color',
      55,
      30,
      10,
      12,
      'circle',
      '#FFD700', // Gold
      { r: 255, g: 215, b: 0 },
      { h: 51, s: 100, l: 50 }
    ),
    
    createColorSegment(
      'shadow-color',
      'Shadow Color',
      20,
      60,
      25,
      20,
      'rectangle',
      '#483D8B', // Dark slate blue
      { r: 72, g: 61, b: 139 },
      { h: 248, s: 39, l: 39 }
    )
  ],
  {
    preferredPanelSide: 'right',
    showSegmentHints: false
  }
);