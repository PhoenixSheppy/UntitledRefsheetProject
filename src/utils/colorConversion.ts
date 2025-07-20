import { RGB, HSL } from '../types';

/**
 * Validates if a hex color string is in the correct format
 * @param hex - The hex color string to validate
 * @returns true if valid, false otherwise
 */
export function isValidHex(hex: string): boolean {
  if (typeof hex !== 'string') return false;
  
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Check if it's 3 or 6 characters and contains only valid hex characters
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * Validates RGB values are within the correct range (0-255)
 * @param rgb - The RGB object to validate
 * @returns true if valid, false otherwise
 */
export function isValidRgb(rgb: RGB): boolean {
  if (!rgb || typeof rgb !== 'object') return false;
  
  const { r, g, b } = rgb;
  
  return (
    typeof r === 'number' && !isNaN(r) && r >= 0 && r <= 255 &&
    typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 255 &&
    typeof b === 'number' && !isNaN(b) && b >= 0 && b <= 255
  );
}

/**
 * Validates HSL values are within the correct ranges
 * @param hsl - The HSL object to validate
 * @returns true if valid, false otherwise
 */
export function isValidHsl(hsl: HSL): boolean {
  if (!hsl || typeof hsl !== 'object') return false;
  
  const { h, s, l } = hsl;
  
  return (
    typeof h === 'number' && !isNaN(h) && h >= 0 && h <= 360 &&
    typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 100 &&
    typeof l === 'number' && !isNaN(l) && l >= 0 && l <= 100
  );
}

/**
 * Normalizes a hex color string by ensuring it has a # prefix and is 6 characters
 * @param hex - The hex color string to normalize
 * @returns Normalized hex string
 */
export function normalizeHex(hex: string): string {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Convert 3-character hex to 6-character
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  return `#${cleanHex.toUpperCase()}`;
}

/**
 * Converts a hex color string to RGB values
 * @param hex - The hex color string (with or without #)
 * @returns RGB object with r, g, b values (0-255)
 * @throws Error if hex string is invalid
 */
export function hexToRgb(hex: string): RGB {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  const normalizedHex = normalizeHex(hex);
  const cleanHex = normalizedHex.slice(1); // Remove #
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Converts RGB values to a hex color string
 * @param rgb - The RGB object with r, g, b values (0-255)
 * @returns Hex color string with # prefix
 * @throws Error if RGB values are invalid
 */
export function rgbToHex(rgb: RGB): string {
  if (!isValidRgb(rgb)) {
    throw new Error(`Invalid RGB values: ${JSON.stringify(rgb)}`);
  }
  
  const { r, g, b } = rgb;
  
  // Round values and ensure they're integers
  const rInt = Math.round(r);
  const gInt = Math.round(g);
  const bInt = Math.round(b);
  
  // Convert to hex and pad with zeros if necessary
  const rHex = rInt.toString(16).padStart(2, '0');
  const gHex = gInt.toString(16).padStart(2, '0');
  const bHex = bInt.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

/**
 * Converts RGB values to HSL values
 * @param rgb - The RGB object with r, g, b values (0-255)
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 * @throws Error if RGB values are invalid
 */
export function rgbToHsl(rgb: RGB): HSL {
  if (!isValidRgb(rgb)) {
    throw new Error(`Invalid RGB values: ${JSON.stringify(rgb)}`);
  }
  
  const { r, g, b } = rgb;
  
  // Convert RGB to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  // Calculate lightness
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (diff !== 0) {
    // Calculate saturation
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    // Calculate hue
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / diff + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / diff + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts HSL values to RGB values
 * @param hsl - The HSL object with h (0-360), s (0-100), l (0-100)
 * @returns RGB object with r, g, b values (0-255)
 * @throws Error if HSL values are invalid
 */
export function hslToRgb(hsl: HSL): RGB {
  if (!isValidHsl(hsl)) {
    throw new Error(`Invalid HSL values: ${JSON.stringify(hsl)}`);
  }
  
  const { h, s, l } = hsl;
  
  // Convert to 0-1 range
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  let r: number, g: number, b: number;
  
  if (sNorm === 0) {
    // Achromatic (gray)
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    
    r = hue2rgb(p, q, hNorm + 1/3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Formats a color value for display
 * @param value - The color value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string
 */
export function formatColorValue(value: number, decimals: number = 0): string {
  return value.toFixed(decimals);
}

/**
 * Formats RGB values as a CSS rgb() string
 * @param rgb - The RGB object
 * @returns CSS rgb() string
 */
export function formatRgbString(rgb: RGB): string {
  if (!isValidRgb(rgb)) {
    throw new Error(`Invalid RGB values: ${JSON.stringify(rgb)}`);
  }
  
  const { r, g, b } = rgb;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Formats HSL values as a CSS hsl() string
 * @param hsl - The HSL object
 * @returns CSS hsl() string
 */
export function formatHslString(hsl: HSL): string {
  if (!isValidHsl(hsl)) {
    throw new Error(`Invalid HSL values: ${JSON.stringify(hsl)}`);
  }
  
  const { h, s, l } = hsl;
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}