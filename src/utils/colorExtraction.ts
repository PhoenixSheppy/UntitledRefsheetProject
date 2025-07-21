/**
 * Color extraction utilities for automatically generating color palettes from images
 */

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  frequency: number; // How often this color appears
  name?: string; // Optional descriptive name
}

export interface ColorExtractionOptions {
  maxColors?: number;
  quality?: number; // 1-10, higher = better quality but slower
  ignoreWhite?: boolean;
  ignoreBlack?: boolean;
  minColorDifference?: number; // Minimum difference between colors (0-100)
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculate color difference using Delta E (simplified)
 */
function colorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const rMean = (rgb1.r + rgb2.r) / 2;
  const deltaR = rgb1.r - rgb2.r;
  const deltaG = rgb1.g - rgb2.g;
  const deltaB = rgb1.b - rgb2.b;
  
  const weightR = 2 + rMean / 256;
  const weightG = 4;
  const weightB = 2 + (255 - rMean) / 256;
  
  return Math.sqrt(weightR * deltaR * deltaR + weightG * deltaG * deltaG + weightB * deltaB * deltaB);
}

/**
 * Extract dominant colors from an image
 */
export async function extractColorsFromImage(
  imageUrl: string,
  options: ColorExtractionOptions = {}
): Promise<ExtractedColor[]> {
  const {
    maxColors = 8,
    quality = 5,
    ignoreWhite = true,
    ignoreBlack = true,
    minColorDifference = 30
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas and get image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample pixels based on quality setting
        const pixelStep = Math.max(1, Math.floor(10 / quality));
        const colorMap = new Map<string, number>();

        for (let i = 0; i < data.length; i += 4 * pixelStep) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip white/black if requested
          if (ignoreWhite && r > 240 && g > 240 && b > 240) continue;
          if (ignoreBlack && r < 15 && g < 15 && b < 15) continue;

          const hex = rgbToHex(r, g, b);
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        // Convert to array and sort by frequency
        let colors = Array.from(colorMap.entries()).map(([hex, count]) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          return {
            hex,
            rgb: { r, g, b },
            hsl: rgbToHsl(r, g, b),
            frequency: count
          };
        }).sort((a, b) => b.frequency - a.frequency);

        // Remove similar colors
        const filteredColors: ExtractedColor[] = [];
        
        for (const color of colors) {
          const isSimilar = filteredColors.some(existing => 
            colorDistance(color.rgb, existing.rgb) < minColorDifference
          );
          
          if (!isSimilar) {
            filteredColors.push(color);
          }
          
          if (filteredColors.length >= maxColors) break;
        }

        resolve(filteredColors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}

/**
 * Generate descriptive names for colors based on their HSL values
 */
export function generateColorName(hsl: { h: number; s: number; l: number }): string {
  const { h, s, l } = hsl;
  
  // Base color names by hue
  let baseName = '';
  if (h >= 0 && h < 15) baseName = 'Red';
  else if (h >= 15 && h < 45) baseName = 'Orange';
  else if (h >= 45 && h < 75) baseName = 'Yellow';
  else if (h >= 75 && h < 150) baseName = 'Green';
  else if (h >= 150 && h < 210) baseName = 'Cyan';
  else if (h >= 210 && h < 270) baseName = 'Blue';
  else if (h >= 270 && h < 330) baseName = 'Purple';
  else baseName = 'Red';
  
  // Modify based on saturation and lightness
  if (s < 20) {
    if (l < 30) return 'Dark Gray';
    if (l > 70) return 'Light Gray';
    return 'Gray';
  }
  
  if (l < 20) return `Dark ${baseName}`;
  if (l > 80) return `Light ${baseName}`;
  if (s < 40) return `Muted ${baseName}`;
  
  return baseName;
}

/**
 * Auto-generate color segments from extracted colors
 * This creates a grid-like layout of color segments
 */
export function generateColorSegments(
  extractedColors: ExtractedColor[],
  imageWidth: number,
  imageHeight: number
) {
  const segments = [];
  const cols = Math.ceil(Math.sqrt(extractedColors.length));
  const rows = Math.ceil(extractedColors.length / cols);
  
  const segmentWidth = 80 / cols; // Use 80% of image width
  const segmentHeight = 60 / rows; // Use 60% of image height
  const startX = 10; // Start 10% from left
  const startY = 20; // Start 20% from top
  
  extractedColors.forEach((color, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = startX + (col * segmentWidth);
    const y = startY + (row * segmentHeight);
    
    segments.push({
      id: `color-${index + 1}`,
      name: color.name || generateColorName(color.hsl),
      x,
      y,
      width: segmentWidth * 0.8, // Leave some spacing
      height: segmentHeight * 0.8,
      shape: 'rectangle' as const,
      colorInfo: {
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      }
    });
  });
  
  return segments;
}