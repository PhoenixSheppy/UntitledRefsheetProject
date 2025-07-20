import { describe, it, expect } from 'vitest';
import {
  isValidHex,
  isValidRgb,
  isValidHsl,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  formatColorValue,
  formatRgbString,
  formatHslString
} from '../colorConversion';
import { RGB, HSL } from '../../types';

describe('Color Validation Functions', () => {
  describe('isValidHex', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHex('#FF5733')).toBe(true);
      expect(isValidHex('#fff')).toBe(true);
      expect(isValidHex('FF5733')).toBe(true);
      expect(isValidHex('fff')).toBe(true);
      expect(isValidHex('#000000')).toBe(true);
      expect(isValidHex('#FFFFFF')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHex('#GG5733')).toBe(false);
      expect(isValidHex('#FF57')).toBe(false);
      expect(isValidHex('#FF573')).toBe(false);
      expect(isValidHex('##FF5733')).toBe(false);
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('#')).toBe(false);
      expect(isValidHex(123 as any)).toBe(false);
      expect(isValidHex(null as any)).toBe(false);
    });
  });

  describe('isValidRgb', () => {
    it('should validate correct RGB values', () => {
      expect(isValidRgb({ r: 255, g: 87, b: 51 })).toBe(true);
      expect(isValidRgb({ r: 0, g: 0, b: 0 })).toBe(true);
      expect(isValidRgb({ r: 255, g: 255, b: 255 })).toBe(true);
      expect(isValidRgb({ r: 128, g: 128, b: 128 })).toBe(true);
    });

    it('should reject invalid RGB values', () => {
      expect(isValidRgb({ r: -1, g: 87, b: 51 })).toBe(false);
      expect(isValidRgb({ r: 256, g: 87, b: 51 })).toBe(false);
      expect(isValidRgb({ r: 255, g: -1, b: 51 })).toBe(false);
      expect(isValidRgb({ r: 255, g: 256, b: 51 })).toBe(false);
      expect(isValidRgb({ r: 255, g: 87, b: -1 })).toBe(false);
      expect(isValidRgb({ r: 255, g: 87, b: 256 })).toBe(false);
      expect(isValidRgb(null as any)).toBe(false);
      expect(isValidRgb({} as any)).toBe(false);
      expect(isValidRgb({ r: 'red', g: 87, b: 51 } as any)).toBe(false);
    });
  });

  describe('isValidHsl', () => {
    it('should validate correct HSL values', () => {
      expect(isValidHsl({ h: 12, s: 100, l: 60 })).toBe(true);
      expect(isValidHsl({ h: 0, s: 0, l: 0 })).toBe(true);
      expect(isValidHsl({ h: 360, s: 100, l: 100 })).toBe(true);
      expect(isValidHsl({ h: 180, s: 50, l: 50 })).toBe(true);
    });

    it('should reject invalid HSL values', () => {
      expect(isValidHsl({ h: -1, s: 100, l: 60 })).toBe(false);
      expect(isValidHsl({ h: 361, s: 100, l: 60 })).toBe(false);
      expect(isValidHsl({ h: 12, s: -1, l: 60 })).toBe(false);
      expect(isValidHsl({ h: 12, s: 101, l: 60 })).toBe(false);
      expect(isValidHsl({ h: 12, s: 100, l: -1 })).toBe(false);
      expect(isValidHsl({ h: 12, s: 100, l: 101 })).toBe(false);
      expect(isValidHsl(null as any)).toBe(false);
      expect(isValidHsl({} as any)).toBe(false);
      expect(isValidHsl({ h: 'red', s: 100, l: 60 } as any)).toBe(false);
    });
  });
});

describe('Color Formatting Functions', () => {
  describe('normalizeHex', () => {
    it('should normalize hex colors correctly', () => {
      expect(normalizeHex('#FF5733')).toBe('#FF5733');
      expect(normalizeHex('FF5733')).toBe('#FF5733');
      expect(normalizeHex('#fff')).toBe('#FFFFFF');
      expect(normalizeHex('fff')).toBe('#FFFFFF');
      expect(normalizeHex('#abc')).toBe('#AABBCC');
    });

    it('should throw error for invalid hex colors', () => {
      expect(() => normalizeHex('#GG5733')).toThrow('Invalid hex color');
      expect(() => normalizeHex('#FF57')).toThrow('Invalid hex color');
      expect(() => normalizeHex('')).toThrow('Invalid hex color');
    });
  });
});

describe('Color Conversion Functions', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
      expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
      expect(hexToRgb('FF5733')).toEqual({ r: 255, g: 87, b: 51 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('should throw error for invalid hex colors', () => {
      expect(() => hexToRgb('#GG5733')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#FF57')).toThrow('Invalid hex color');
      expect(() => hexToRgb('')).toThrow('Invalid hex color');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex correctly', () => {
      expect(rgbToHex({ r: 255, g: 87, b: 51 })).toBe('#FF5733');
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF');
      expect(rgbToHex({ r: 170, g: 187, b: 204 })).toBe('#AABBCC');
    });

    it('should handle decimal RGB values by rounding', () => {
      expect(rgbToHex({ r: 254.7, g: 87.3, b: 51.9 })).toBe('#FF5734');
      expect(rgbToHex({ r: 254.2, g: 87.8, b: 51.1 })).toBe('#FE5833');
    });

    it('should throw error for invalid RGB values', () => {
      expect(() => rgbToHex({ r: -1, g: 87, b: 51 })).toThrow('Invalid RGB values');
      expect(() => rgbToHex({ r: 256, g: 87, b: 51 })).toThrow('Invalid RGB values');
      expect(() => rgbToHex(null as any)).toThrow('Invalid RGB values');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL correctly', () => {
      // Red color
      expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
      
      // Green color
      expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
      
      // Blue color
      expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
      
      // White
      expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
      
      // Black
      expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
      
      // Gray
      expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
      
      // Orange-red (#FF5733)
      const result = rgbToHsl({ r: 255, g: 87, b: 51 });
      expect(result.h).toBeCloseTo(11, 0); // Approximately 11 degrees
      expect(result.s).toBe(100);
      expect(result.l).toBe(60);
    });

    it('should throw error for invalid RGB values', () => {
      expect(() => rgbToHsl({ r: -1, g: 87, b: 51 })).toThrow('Invalid RGB values');
      expect(() => rgbToHsl({ r: 256, g: 87, b: 51 })).toThrow('Invalid RGB values');
      expect(() => rgbToHsl(null as any)).toThrow('Invalid RGB values');
    });
  });

  describe('hslToRgb', () => {
    it('should convert HSL to RGB correctly', () => {
      // Red color
      expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
      
      // Green color
      expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
      
      // Blue color
      expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
      
      // White
      expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 });
      
      // Black
      expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
      
      // Gray
      expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('should throw error for invalid HSL values', () => {
      expect(() => hslToRgb({ h: -1, s: 100, l: 60 })).toThrow('Invalid HSL values');
      expect(() => hslToRgb({ h: 361, s: 100, l: 60 })).toThrow('Invalid HSL values');
      expect(() => hslToRgb(null as any)).toThrow('Invalid HSL values');
    });
  });
});

describe('Bidirectional Conversion Tests', () => {
  it('should maintain consistency in hex -> RGB -> hex conversions', () => {
    const testColors = ['#FF5733', '#000000', '#FFFFFF', '#808080', '#AABBCC'];
    
    testColors.forEach(hex => {
      const rgb = hexToRgb(hex);
      const backToHex = rgbToHex(rgb);
      expect(backToHex).toBe(hex);
    });
  });

  it('should maintain consistency in RGB -> HSL -> RGB conversions', () => {
    const testRgbColors: RGB[] = [
      { r: 255, g: 87, b: 51 },
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 128, g: 128, b: 128 },
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 }
    ];
    
    testRgbColors.forEach(rgb => {
      const hsl = rgbToHsl(rgb);
      const backToRgb = hslToRgb(hsl);
      
      // Allow for small rounding differences
      expect(Math.abs(backToRgb.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(backToRgb.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(backToRgb.b - rgb.b)).toBeLessThanOrEqual(1);
    });
  });

  it('should maintain consistency in hex -> RGB -> HSL -> RGB -> hex conversions', () => {
    const testColors = ['#FF5733', '#808080', '#AABBCC'];
    
    testColors.forEach(originalHex => {
      const rgb1 = hexToRgb(originalHex);
      const hsl = rgbToHsl(rgb1);
      const rgb2 = hslToRgb(hsl);
      const finalHex = rgbToHex(rgb2);
      
      // The final hex should be very close to the original
      // (allowing for small rounding differences)
      const originalRgb = hexToRgb(originalHex);
      const finalRgb = hexToRgb(finalHex);
      
      expect(Math.abs(finalRgb.r - originalRgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(finalRgb.g - originalRgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(finalRgb.b - originalRgb.b)).toBeLessThanOrEqual(1);
    });
  });
});

describe('Color Formatting Functions', () => {
  describe('formatColorValue', () => {
    it('should format color values correctly', () => {
      expect(formatColorValue(255)).toBe('255');
      expect(formatColorValue(255.7)).toBe('256');
      expect(formatColorValue(255.123, 2)).toBe('255.12');
      expect(formatColorValue(0)).toBe('0');
      expect(formatColorValue(128.5, 1)).toBe('128.5');
    });
  });

  describe('formatRgbString', () => {
    it('should format RGB as CSS string correctly', () => {
      expect(formatRgbString({ r: 255, g: 87, b: 51 })).toBe('rgb(255, 87, 51)');
      expect(formatRgbString({ r: 0, g: 0, b: 0 })).toBe('rgb(0, 0, 0)');
      expect(formatRgbString({ r: 255, g: 255, b: 255 })).toBe('rgb(255, 255, 255)');
    });

    it('should handle decimal values by rounding', () => {
      expect(formatRgbString({ r: 254.7, g: 87.3, b: 51.9 })).toBe('rgb(255, 87, 52)');
    });

    it('should throw error for invalid RGB values', () => {
      expect(() => formatRgbString({ r: -1, g: 87, b: 51 })).toThrow('Invalid RGB values');
      expect(() => formatRgbString(null as any)).toThrow('Invalid RGB values');
    });
  });

  describe('formatHslString', () => {
    it('should format HSL as CSS string correctly', () => {
      expect(formatHslString({ h: 12, s: 100, l: 60 })).toBe('hsl(12, 100%, 60%)');
      expect(formatHslString({ h: 0, s: 0, l: 0 })).toBe('hsl(0, 0%, 0%)');
      expect(formatHslString({ h: 360, s: 100, l: 100 })).toBe('hsl(360, 100%, 100%)');
    });

    it('should handle decimal values by rounding', () => {
      expect(formatHslString({ h: 12.7, s: 99.3, l: 60.9 })).toBe('hsl(13, 99%, 61%)');
    });

    it('should throw error for invalid HSL values', () => {
      expect(() => formatHslString({ h: -1, s: 100, l: 60 })).toThrow('Invalid HSL values');
      expect(() => formatHslString(null as any)).toThrow('Invalid HSL values');
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle edge case color values correctly', () => {
    // Test pure colors
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    
    // Test grayscale
    expect(rgbToHsl({ r: 64, g: 64, b: 64 })).toEqual({ h: 0, s: 0, l: 25 });
    expect(rgbToHsl({ r: 192, g: 192, b: 192 })).toEqual({ h: 0, s: 0, l: 75 });
  });

  it('should handle boundary values correctly', () => {
    // RGB boundaries
    expect(isValidRgb({ r: 0, g: 0, b: 0 })).toBe(true);
    expect(isValidRgb({ r: 255, g: 255, b: 255 })).toBe(true);
    
    // HSL boundaries
    expect(isValidHsl({ h: 0, s: 0, l: 0 })).toBe(true);
    expect(isValidHsl({ h: 360, s: 100, l: 100 })).toBe(true);
    
    // Hex boundaries
    expect(isValidHex('#000')).toBe(true);
    expect(isValidHex('#FFF')).toBe(true);
    expect(isValidHex('#000000')).toBe(true);
    expect(isValidHex('#FFFFFF')).toBe(true);
  });
});