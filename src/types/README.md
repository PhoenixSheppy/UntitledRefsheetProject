# TypeScript Type Definitions

This directory contains all TypeScript interfaces and type definitions for the Interactive Character Reference Sheet application.

## Core Interfaces

### Color Types

#### `RGB`
Represents RGB color values with red, green, and blue components (0-255 range).

```typescript
interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}
```

#### `HSL`
Represents HSL color values with hue (0-360°), saturation (0-100%), and lightness (0-100%).

```typescript
interface HSL {
  h: number; // 0-360 (hue)
  s: number; // 0-100 (saturation %)
  l: number; // 0-100 (lightness %)
}
```

#### `ColorInfo`
Complete color information containing hex, RGB, and HSL representations.

```typescript
interface ColorInfo {
  hex: string; // e.g., "#FF5733"
  rgb: RGB;
  hsl: HSL;
  name?: string; // Optional color name
}
```

### Segment Types

#### `ColorSegment`
Defines an interactive color segment on the reference sheet with coordinates, dimensions, and associated color information.

```typescript
interface ColorSegment {
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
```

#### `ScaledSegment`
Extends `ColorSegment` with scaled coordinates for display purposes.

```typescript
interface ScaledSegment extends ColorSegment {
  scaledCoordinates: {
    x: number;
    y: number;
  };
  scaledDimensions: {
    width: number;
    height: number;
  };
}
```

### Configuration Types

#### `RefSheetConfig`
Complete configuration for the reference sheet application.

```typescript
interface RefSheetConfig {
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
```

### Utility Types

#### `ImageDimensions`
Image dimensions in pixels.

```typescript
interface ImageDimensions {
  width: number;
  height: number;
}
```

#### `PanelPosition`
Position and side information for color info panel.

```typescript
interface PanelPosition {
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}
```

#### `SegmentBounds`
Bounding box coordinates and dimensions.

```typescript
interface SegmentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

#### `Dimensions`
Generic dimensions interface.

```typescript
interface Dimensions {
  width: number;
  height: number;
}
```

## Validation Functions

The types module also provides validation functions to ensure data integrity:

### Color Validation
- `isValidRGB(rgb: RGB): boolean` - Validates RGB values are within 0-255 range
- `isValidHSL(hsl: HSL): boolean` - Validates HSL values are within valid ranges
- `isValidHex(hex: string): boolean` - Validates hex color format (#RRGGBB or #RGB)
- `isValidColorInfo(colorInfo: ColorInfo): boolean` - Validates complete color information

### Segment Validation
- `isValidColorSegment(segment: ColorSegment): boolean` - Validates color segment structure
- `validateSegmentBounds(segment: ColorSegment): boolean` - Ensures segments don't exceed image boundaries
- `validateUniqueSegmentIds(segments: ColorSegment[]): boolean` - Validates unique segment IDs

### Configuration Validation
- `isValidRefSheetConfig(config: RefSheetConfig): boolean` - Validates complete configuration

## Usage Examples

### Creating a Color Segment

```typescript
import { ColorSegment, isValidColorSegment } from '@/types'

const furColorSegment: ColorSegment = {
  id: 'main-fur',
  name: 'Main Fur Color',
  coordinates: { x: 30, y: 40 },
  dimensions: { width: 15, height: 20 },
  shape: 'rectangle',
  colorInfo: {
    hex: '#8B4513',
    rgb: { r: 139, g: 69, b: 19 },
    hsl: { h: 25, s: 76, l: 31 },
    name: 'Saddle Brown'
  }
}

if (isValidColorSegment(furColorSegment)) {
  console.log('Valid color segment!')
}
```

### Creating a Configuration

```typescript
import { RefSheetConfig, isValidRefSheetConfig } from '@/types'

const config: RefSheetConfig = {
  image: {
    src: '/images/character-ref.png',
    alt: 'My Character Reference Sheet',
    originalDimensions: { width: 1200, height: 800 }
  },
  colorSegments: [furColorSegment],
  layout: {
    preferredPanelSide: 'right',
    showSegmentHints: true
  }
}

if (isValidRefSheetConfig(config)) {
  console.log('Valid configuration!')
}
```

## Testing

All type definitions include comprehensive unit tests located in the `__tests__` directory. Run tests with:

```bash
npm run test:run
```

The tests cover:
- Type structure validation
- Boundary value testing
- Data integrity validation
- Edge case handling