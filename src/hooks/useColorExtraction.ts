import { useState, useEffect, useCallback } from 'react';
import { extractColorsFromImage, generateColorSegments, ColorExtractionOptions, ExtractedColor } from '@/utils/colorExtraction';
import { ColorSegment } from '@/types';

export interface UseColorExtractionResult {
  extractedColors: ExtractedColor[];
  colorSegments: ColorSegment[];
  isLoading: boolean;
  error: string | null;
  extractColors: (imageUrl: string, options?: ColorExtractionOptions) => Promise<void>;
}

/**
 * Hook for extracting colors from images and generating color segments
 */
export function useColorExtraction(
  imageWidth: number = 800,
  imageHeight: number = 600
): UseColorExtractionResult {
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [colorSegments, setColorSegments] = useState<ColorSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractColors = useCallback(async (
    imageUrl: string,
    options: ColorExtractionOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const colors = await extractColorsFromImage(imageUrl, options);
      setExtractedColors(colors);
      
      // Generate color segments from extracted colors
      const segments = generateColorSegments(colors, imageWidth, imageHeight);
      setColorSegments(segments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract colors';
      setError(errorMessage);
      console.error('Color extraction error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [imageWidth, imageHeight]);

  return {
    extractedColors,
    colorSegments,
    isLoading,
    error,
    extractColors
  };
}