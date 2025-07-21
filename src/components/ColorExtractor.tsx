'use client';

import React, { useState } from 'react';
import { useColorExtraction } from '@/hooks/useColorExtraction';
import { Card } from './Layout';
import { LoadingSpinner } from './LoadingSpinner';

interface ColorExtractorProps {
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  onColorsExtracted?: (colorSegments: any[]) => void;
  className?: string;
}

export const ColorExtractor: React.FC<ColorExtractorProps> = ({
  imageUrl,
  imageWidth = 800,
  imageHeight = 600,
  onColorsExtracted,
  className = ''
}) => {
  const { extractedColors, colorSegments, isLoading, error, extractColors } = useColorExtraction(imageWidth, imageHeight);
  const [extractionOptions, setExtractionOptions] = useState({
    maxColors: 8,
    quality: 5,
    ignoreWhite: true,
    ignoreBlack: true,
    minColorDifference: 30
  });

  const handleExtractColors = async () => {
    await extractColors(imageUrl, extractionOptions);
    if (onColorsExtracted && colorSegments.length > 0) {
      onColorsExtracted(colorSegments);
    }
  };

  const copyConfigToClipboard = () => {
    const configCode = `// Auto-generated color segments
const colorSegments = [
${colorSegments.map(segment => `  createColorSegment(
    '${segment.id}',
    '${segment.name}',
    ${segment.x.toFixed(1)}, // x position
    ${segment.y.toFixed(1)}, // y position
    ${segment.width.toFixed(1)}, // width
    ${segment.height.toFixed(1)}, // height
    '${segment.shape}',
    '${segment.colorInfo.hex}',
    { r: ${segment.colorInfo.rgb.r}, g: ${segment.colorInfo.rgb.g}, b: ${segment.colorInfo.rgb.b} },
    { h: ${segment.colorInfo.hsl.h}, s: ${segment.colorInfo.hsl.s}, l: ${segment.colorInfo.hsl.l} }
  )`).join(',\n')}
];`;

    navigator.clipboard.writeText(configCode).then(() => {
      alert('Color configuration copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-800">
          Automatic Color Extraction
        </h3>
        <p className="text-sm text-neutral-600">
          Extract colors automatically from your reference image to generate an accurate color palette.
        </p>

        {/* Extraction Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Max Colors
            </label>
            <input
              type="number"
              min="3"
              max="15"
              value={extractionOptions.maxColors}
              onChange={(e) => setExtractionOptions(prev => ({
                ...prev,
                maxColors: parseInt(e.target.value) || 8
              }))}
              className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Quality (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={extractionOptions.quality}
              onChange={(e) => setExtractionOptions(prev => ({
                ...prev,
                quality: parseInt(e.target.value) || 5
              }))}
              className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Color Difference
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={extractionOptions.minColorDifference}
              onChange={(e) => setExtractionOptions(prev => ({
                ...prev,
                minColorDifference: parseInt(e.target.value) || 30
              }))}
              className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={extractionOptions.ignoreWhite}
              onChange={(e) => setExtractionOptions(prev => ({
                ...prev,
                ignoreWhite: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm text-neutral-700">Ignore white</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={extractionOptions.ignoreBlack}
              onChange={(e) => setExtractionOptions(prev => ({
                ...prev,
                ignoreBlack: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm text-neutral-700">Ignore black</span>
          </label>
        </div>

        <button
          onClick={handleExtractColors}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Extracting Colors...</span>
            </>
          ) : (
            <span>Extract Colors from Image</span>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </Card>

      {/* Extracted Colors Preview */}
      {extractedColors.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-neutral-800">
              Extracted Colors ({extractedColors.length})
            </h4>
            <button
              onClick={copyConfigToClipboard}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Copy Config Code
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {extractedColors.map((color, index) => (
              <div
                key={index}
                className="space-y-2 p-3 bg-neutral-50 rounded border"
              >
                <div
                  className="w-full h-12 rounded border border-neutral-300"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="space-y-1">
                  <div className="text-xs font-medium text-neutral-800">
                    {colorSegments[index]?.name || `Color ${index + 1}`}
                  </div>
                  <div className="text-xs font-mono text-neutral-600">
                    {color.hex}
                  </div>
                  <div className="text-xs text-neutral-500">
                    RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h4 className="font-medium text-blue-800">How to use:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Adjust the extraction settings above to fine-tune the results</li>
            <li>Click "Extract Colors from Image" to analyze your reference image</li>
            <li>Review the extracted colors and click "Copy Config Code"</li>
            <li>Replace the colorSegments array in your config file with the generated code</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};