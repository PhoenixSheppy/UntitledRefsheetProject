# Configuration System

The configuration system provides utilities for creating, validating, and loading RefSheet configurations with comprehensive error handling and helpful validation messages.

## Key Features

- **Configuration Loading**: Load and validate RefSheet configurations with detailed error reporting
- **Validation**: Comprehensive validation with helpful error messages for debugging
- **Helper Functions**: Utilities for creating color segments and configurations during development
- **Type Safety**: Full TypeScript support with proper type checking
- **Error Handling**: Custom error types with detailed validation feedback

## Usage

### Basic Configuration Creation

```typescript
import { createRefSheetConfig, createColorSegment } from '../utils/config'

// Create a color segment
const furSegment = createColorSegment(
  'main-fur',           // Unique ID
  'Main Fur Color',     // Display name
  25, 30,              // x: 25%, y: 30% coordinates
  12, 8,               // width: 12%, height: 8% dimensions
  'rectangle',         // Shape: 'rectangle' or 'circle'
  '#8B4513',           // Hex color
  { r: 139, g: 69, b: 19 },    // RGB values
  { h: 25, s: 76, l: 31 }      // HSL values
)

// Create complete configuration
const config = createRefSheetConfig(
  '/images/character.jpg',     // Image source
  'Character reference sheet', // Alt text
  1200, 800,                  // Original image dimensions
  [furSegment],               // Color segments array
  {
    preferredPanelSide: 'right',  // Panel positioning preference
    showSegmentHints: true        // Show visual hints for segments
  }
)
```

### Configuration Validation

```typescript
import { validateRefSheetConfig, loadRefSheetConfig } from '../utils/config'

// Validate configuration with detailed feedback
const validation = validateRefSheetConfig(config)
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors)
}
if (validation.warnings.length > 0) {
  console.warn('Configuration warnings:', validation.warnings)
}

// Load and validate configuration (throws on error)
try {
  const validConfig = loadRefSheetConfig(rawConfig)
  // Use validConfig...
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error('Configuration validation failed:', error.message)
  }
}
```

### JSON Configuration Validation

```typescript
import { validateConfigFromJSON } from '../utils/config'

const jsonString = '{"image": {...}, "colorSegments": [...], "layout": {...}}'
const result = validateConfigFromJSON(jsonString)

if (result.isValid) {
  console.log('Configuration is valid!')
} else {
  console.error('Validation errors:', result.errors)
}
```

## Configuration Structure

### RefSheetConfig

```typescript
interface RefSheetConfig {
  image: {
    src: string                    // Image file path/URL
    alt: string                    // Alt text for accessibility
    originalDimensions: {          // Original image dimensions
      width: number                // Width in pixels
      height: number               // Height in pixels
    }
  }
  colorSegments: ColorSegment[]    // Array of interactive color areas
  layout: {
    preferredPanelSide: 'left' | 'right' | 'auto'  // Panel positioning
    showSegmentHints: boolean      // Show visual segment indicators
  }
}
```

### ColorSegment

```typescript
interface ColorSegment {
  id: string                       // Unique identifier
  name: string                     // Display name for the color
  coordinates: {
    x: number                      // X position (0-100% of image width)
    y: number                      // Y position (0-100% of image height)
  }
  dimensions: {
    width: number                  // Width (0-100% of image width)
    height: number                 // Height (0-100% of image height)
  }
  shape: 'rectangle' | 'circle'    // Interactive area shape
  colorInfo: {
    hex: string                    // Hex color code (e.g., "#FF5733")
    rgb: { r: number, g: number, b: number }  // RGB values (0-255)
    hsl: { h: number, s: number, l: number }  // HSL values (h: 0-360, s/l: 0-100)
    name?: string                  // Optional color name
  }
}
```

## Validation Rules

### Image Validation
- Source must be a non-empty string
- Alt text must be a non-empty string
- Dimensions must be positive numbers

### Color Segment Validation
- ID must be unique and non-empty
- Name must be non-empty string
- Coordinates must be 0-100 (percentage of image)
- Dimensions must be positive and 0-100 (percentage of image)
- Segments must not extend beyond image boundaries
- Shape must be 'rectangle' or 'circle'
- Color values must be in valid ranges:
  - Hex: #RRGGBB or #RGB format
  - RGB: 0-255 for each component
  - HSL: H(0-360), S(0-100), L(0-100)

### Layout Validation
- preferredPanelSide must be 'left', 'right', or 'auto'
- showSegmentHints must be boolean

## Error Handling

The system provides detailed error messages for common issues:

```typescript
// Example validation errors:
"Segment 1: X coordinate must be a number between 0 and 100"
"Segment 2: Segment extends beyond image boundaries (x: 90%, y: 90%, width: 20%, height: 20%)"
"Segment 3: Hex color must be in format #RRGGBB or #RGB (got: invalid-hex)"
"All color segment IDs must be unique"
```

## Development Helpers

### Quick Segment Creation
```typescript
// Helper for rapid development
const segment = createColorSegment(
  'quick-test', 'Test Color',
  50, 50, 10, 10, 'rectangle',
  '#FF0000',
  { r: 255, g: 0, b: 0 },
  { h: 0, s: 100, l: 50 }
)
```

### Configuration Templates
See `src/config/sample-refsheet-config.ts` for complete examples including:
- `sampleRefSheetConfig` - Full featured example
- `minimalRefSheetConfig` - Simple setup
- `devRefSheetConfig` - Development/testing template

## Best Practices

1. **Use Descriptive IDs**: Make segment IDs meaningful (`main-fur`, `eye-color`)
2. **Validate Early**: Always validate configurations during development
3. **Handle Errors Gracefully**: Use try-catch blocks when loading configurations
4. **Test Boundaries**: Ensure segments don't extend beyond image edges
5. **Consider Overlaps**: The system warns about overlapping segments
6. **Use Helper Functions**: Leverage `createColorSegment` and `createRefSheetConfig` for type safety