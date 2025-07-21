'use client';

import React, { useState } from 'react';
import { ColorExtractor } from '@/components/ColorExtractor';
import { PageHeader, Card } from '@/components/Layout';
import { sampleRefSheetConfig } from '@/config/sampleRefSheet';

export default function DevToolsPage() {
  const [selectedImage, setSelectedImage] = useState(sampleRefSheetConfig.image.src);
  const [imageWidth, setImageWidth] = useState(sampleRefSheetConfig.image.width);
  const [imageHeight, setImageHeight] = useState(sampleRefSheetConfig.image.height);

  const handleColorsExtracted = (colorSegments: any[]) => {
    console.log('Extracted color segments:', colorSegments);
    // You could also show a success message or update the UI
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        title="Development Tools"
        description="Tools for developers to work with character reference sheets and color extraction."
      />

      {/* Image Configuration */}
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-800">
          Image Configuration
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              placeholder="Enter image URL or path"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Width
              </label>
              <input
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseInt(e.target.value) || 800)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Height
              </label>
              <input
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseInt(e.target.value) || 600)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Preview:</h4>
            <div className="max-w-md mx-auto">
              <img
                src={selectedImage}
                alt="Reference sheet preview"
                className="w-full h-auto border border-neutral-300 rounded"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Color Extraction Tool */}
      <ColorExtractor
        imageUrl={selectedImage}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        onColorsExtracted={handleColorsExtracted}
      />

      {/* Quick Links */}
      <Card className="bg-neutral-50">
        <div className="space-y-3">
          <h4 className="font-medium text-neutral-800">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className="inline-flex items-center px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
            >
              ← Back to Reference Sheet
            </a>
            <button
              onClick={() => {
                setSelectedImage(sampleRefSheetConfig.image.src);
                setImageWidth(sampleRefSheetConfig.image.width);
                setImageHeight(sampleRefSheetConfig.image.height);
              }}
              className="inline-flex items-center px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded-full hover:bg-neutral-300 transition-colors"
            >
              Reset to Default Image
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}