# Design Document

## Overview

The Interactive Character Reference Sheet is a Next.js application that displays a character reference sheet image with interactive color segments. Visitors can hover over predefined areas to see detailed color information including hex, RGB, and HSL values. The system uses a combination of HTML5 Canvas for color extraction, React components for interactivity, and Tailwind CSS for styling.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  React Components │────│  Canvas Utils   │
│   (Pages/API)   │    │   (UI Layer)     │    │ (Color Extract) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Tailwind CSS   │    │   TypeScript    │
│  (Ref Sheet)    │    │   (Styling)      │    │   (Type Safety) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture

```
RefSheetPage
├── RefSheetContainer
│   ├── RefSheetImage
│   ├── ColorSegmentOverlay[]
│   └── ColorInfoPanel
└── ResponsiveLayout
```

## Components and Interfaces

### Core Components

#### 1. RefSheetContainer
**Purpose:** Main container that manages the reference sheet display and coordinates interactions between child components.

**Props:**
```typescript
interface RefSheetContainerProps {
  imageUrl: string;
  colorSegments: ColorSegment[];
  className?: string;
}
```

**Responsibilities:**
- Manage hover state for color segments
- Coordinate positioning between image and color panel
- Handle responsive layout adjustments

#### 2. RefSheetImage
**Purpose:** Displays the character reference sheet image with proper scaling and positioning.

**Props:**
```typescript
interface RefSheetImageProps {
  src: string;
  alt: string;
  onImageLoad: (dimensions: ImageDimensions) => void;
  className?: string;
}
```

**Responsibilities:**
- Load and display the reference sheet image
- Maintain aspect ratio across different screen sizes
- Provide image dimensions to parent components
- Handle image loading states and errors

#### 3. ColorSegmentOverlay
**Purpose:** Renders interactive hover areas over the reference sheet image.

**Props:**
```typescript
interface ColorSegmentOverlayProps {
  segments: ColorSegment[];
  imageDimensions: ImageDimensions;
  onSegmentHover: (segment: ColorSegment | null) => void;
  activeSegment: ColorSegment | null;
}
```

**Responsibilities:**
- Render invisible/subtle overlay areas for each color segment
- Handle mouse/touch interactions
- Provide visual feedback on hover
- Scale segment positions based on image dimensions

#### 4. ColorInfoPanel
**Purpose:** Displays detailed color information when a segment is hovered.

**Props:**
```typescript
interface ColorInfoPanelProps {
  colorInfo: ColorInfo | null;
  position: PanelPosition;
  isVisible: boolean;
}
```

**Responsibilities:**
- Display hex, RGB, and HSL color values
- Show color swatch preview
- Position itself to avoid overlapping the image
- Handle smooth show/hide animations

### Utility Functions

#### Color Extraction Utilities
```typescript
// Extract color from image at specific coordinates
function extractColorFromImage(
  imageElement: HTMLImageElement,
  x: number,
  y: number
): ColorInfo;

// Convert between color formats
function hexToRgb(hex: string): RGB;
function rgbToHsl(rgb: RGB): HSL;
function rgbToHex(rgb: RGB): string;
```

#### Positioning Utilities
```typescript
// Calculate optimal panel position
function calculatePanelPosition(
  segmentBounds: SegmentBounds,
  panelDimensions: Dimensions,
  containerDimensions: Dimensions
): PanelPosition;

// Scale segment coordinates based on image display size
function scaleSegmentCoordinates(
  segment: ColorSegment,
  originalDimensions: ImageDimensions,
  displayDimensions: ImageDimensions
): ScaledSegment;
```

## Data Models

### ColorSegment
```typescript
interface ColorSegment {
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
```

### ColorInfo
```typescript
interface ColorInfo {
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
```

### Configuration Structure
```typescript
interface RefSheetConfig {
  image: {
    src: string;
    alt: string;
    originalDimensions: {
      width: number;
      height: number;
    };
  };
  colorSegments: ColorSegment[];
  layout: {
    preferredPanelSide: 'left' | 'right' | 'auto';
    showSegmentHints: boolean;
  };
}
```

## Error Handling

### Image Loading Errors
- Display fallback message if reference sheet fails to load
- Provide retry mechanism for network issues
- Graceful degradation if image dimensions cannot be determined

### Color Extraction Errors
- Fallback to predefined color values if canvas extraction fails
- Validate color segment coordinates are within image bounds
- Handle cases where color extraction returns invalid values

### Responsive Layout Errors
- Ensure color panel positioning works on all screen sizes
- Handle edge cases where panel cannot fit in available space
- Provide mobile-specific interaction patterns as fallback

## Testing Strategy

### Unit Tests
- Color conversion utility functions (hex ↔ RGB ↔ HSL)
- Coordinate scaling and positioning calculations
- Color segment validation logic
- Panel positioning algorithms

### Component Tests
- RefSheetImage loading and error states
- ColorSegmentOverlay hover interactions
- ColorInfoPanel display and positioning
- Responsive behavior across different screen sizes

### Integration Tests
- End-to-end hover interactions from segment to color panel display
- Image loading and color segment coordination
- Mobile touch interactions
- Performance testing with large reference sheet images

### Visual Regression Tests
- Color panel positioning consistency
- Hover state visual feedback
- Responsive layout behavior
- Color accuracy in different browsers

## Performance Considerations

### Image Optimization
- Use Next.js Image component for automatic optimization
- Implement lazy loading for reference sheet image
- Provide multiple image sizes for different screen densities

### Interaction Performance
- Debounce hover events to prevent excessive re-renders
- Use CSS transforms for smooth hover animations
- Implement efficient color extraction caching

### Bundle Size Optimization
- Tree-shake unused Tailwind CSS classes
- Optimize color conversion utilities
- Use dynamic imports for non-critical functionality

## Accessibility

### Keyboard Navigation
- Provide keyboard navigation for color segments
- Implement focus indicators for interactive areas
- Support screen reader announcements for color information

### Visual Accessibility
- Ensure sufficient contrast for color panel text
- Provide alternative text descriptions for color segments
- Support high contrast mode and reduced motion preferences

### Mobile Accessibility
- Implement touch-friendly interaction areas
- Provide haptic feedback where supported
- Ensure color panel is readable on small screens